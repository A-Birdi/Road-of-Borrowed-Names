/* Chapter 5 main quest: the Records Hall, Akari's key, the basement stacks
 * and the first hush conduit, Councillor Yae and the old minutes, Tokuji and
 * Tōya's bell, the crossing to the tower, and the town after the bell. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
# ---- the Registrar ------------------------------------------------------------------------------------------------------------
@scene lf.tadashi
!if lf_mio_done -> mio
!if quest.lf_main>=4 -> late
!if quest.lf_main>=2 -> ledger
!if item.lf_request_slip -> desk
lf_tadashi: {記録館|きろくかん} へ ようこそ 。{登記官|とうきかん} の タダシ で ございます 。|| Welcome to the Public Records Hall. I am Tadashi, the Registrar.
pc: {湖|みずうみ} の {鐘楼|しょうろう} に ついて 、{調|しら}べたい の です が 。|| I'd like to look into the bell tower in the lake.
lf_tadashi: かしこまりました 。{閲覧|えつらん} を ご{希望|きぼう} の {方|かた} は 、こちら の {申請書|しんせいしょ} に ご{記入|きにゅう} ください 。|| Certainly. Those wishing to consult the records are kindly asked to complete this request form.
narr: {彼|かれ} は {一枚|いちまい} の {紙|かみ} を {台|だい} に {置|お}いた 。{見事|みごと} な {字|じ} だ 。{定規|じょうぎ} で {引|ひ}いた よう に 、{少|すこ}し の {揺|ゆ}れ も ない 。|| He lays a sheet on the counter. Superb handwriting, as if ruled with a straightedge — not a single wobble.
!quest lf_main 1
!lesson kana
!challenge lf.ch_form
lf_tadashi[smile]: {確|たし}か に {承|うけたまわ}りました 。|| Duly received.
!give lf_request_slip
lf_tadashi: {洪水|こうずい} の {年|とし} の {台帳|だいちょう} は 、{左|ひだり} の {机|つくえ} に ございます 。ごゆっくり どうぞ 。|| The ledger for the flood year is on the desk to your left. Take all the time you need.
?(comp=nao) comp[smirk]: {字|じ} が きれい すぎる {人|ひと} は 、{信用|しんよう} できない ん だよ な 。|| I never trust anyone whose handwriting is too neat.
?(comp=mio) comp: ……{判子|はんこ} 、{二回|にかい} {押|お}した ね 。{表|おもて} と {裏|うら} に 。|| …He stamped it twice. Front and back.
?(comp=ren) comp: {記録|きろく} の {扱|あつか}い は 、{灯守|ひもり} より ずっと {丁寧|ていねい} です 。…… {丁寧|ていねい} すぎる くらい に 。|| He handles records far more carefully than any lantern keeper. …Almost too carefully.
?(comp=suzu) comp: {今|いま} の {芝居|しばい} 、{台本|だいほん} どおり すぎて {拍手|はくしゅ} しにくい わ 。|| That was so perfectly by the script I don't know whether to clap.
!end
:desk
lf_tadashi: {台帳|だいちょう} は {左|ひだり} の {机|つくえ} で ございます 。|| The ledger is on the desk to your left.
!end
:ledger
pc: {洪水|こうずい} の {年|とし} の {台帳|だいちょう} に 、「{特記|とっき}{事項|じこう} なし」 と ありました 。|| The flood-year ledger says "nothing of note".
lf_tadashi: さようで ございます か 。{記録|きろく} が そう {申|もう}して おります なら 、そう なの でしょう 。|| Is that so. If the record says so, then so it must be.
pc: でも 、{下町|したまち} が {沈|しず}んだ {日|ひ} です よ 。|| But that's the day the lower quarter drowned.
lf_tadashi: もちろん です 。|| Of course.
narr: {彼|かれ} は {微笑|ほほえ}んだ まま 、{目|め} だけ が {少|すこ}し {泳|およ}いだ 。|| He keeps smiling. Only his eyes waver a little.
?(!lf_akari_key) lf_tadashi: {写|うつ}し{直|なお}し は 、{事務所|じむしょ} の アカリ が {担当|たんとう} して おります 。|| The recopying was handled by Akari, in the clerks' office.
!end
:late
lf_tadashi: {何|なに} か ご{用|よう} で ございます か 。{何|なん} で も {承|うけたまわ}ります 。|| May I help you with anything? I shall accommodate any request.
narr: {判子|はんこ} を {持|も}つ {手|て} に 、{少|すこ}し {汗|あせ} が {光|ひか}って いる 。|| The hand holding his stamp glistens faintly with sweat.
!end
:mio
lf_tadashi[think]: {先日|せんじつ} の 、あの …… お{断|ことわ}り の {件|けん} 。|| About the other day — that… refusal.
lf_tadashi: あれ {以来|いらい} 、{判子|はんこ} を {押|お}す {前|まえ} に 、{一度|いちど} {読|よ}む よう に して おります 。{不思議|ふしぎ} な こと に 、{時間|じかん} が かかります 。|| Since then, I have made a point of reading each paper once before stamping it. Curiously, it takes time.

@scene lf.tadashi_after
!if seen.lf.tadashi_after -> again
lf_tadashi: …… {鐘|かね} の {音|おと} を {聞|き}いた とき 、{最初|さいしょ} に {出|で}た {言葉|ことば} は 「{困|こま}ります」 で ございました 。|| …When I heard the bell, the first words out of my mouth were "This is most inconvenient."
lf_tadashi: {三十年|さんじゅうねん} {言|い}って いなかった {言葉|ことば} です 。|| Words I had not said in thirty years.
lf_tadashi: {地下|ちか} の {元|もと} の {台帳|だいちょう} を 、{上|うえ} へ {戻|もど}します 。{写|うつ}し は 、{全部|ぜんぶ} {破棄|はき} いたします 。{承認|しょうにん} は …… {私|わたし} が いたします 。|| I am bringing the original ledgers up from the basement. The copies will all be destroyed. The approval… I shall give myself.
?(comp=nao) comp: {破|やぶ}る の 、{手伝|てつだ}おう か ? {得意|とくい} だよ 。|| Want a hand tearing them up? I'm good at it.
?(comp=mio) comp[smile]: {元|もと} の {字|じ} の ほう が 、{読|よ}みにくくて も 、ずっと いい です よ 。|| The original writing's much better, even if it's harder to read.
?(comp=ren) comp: {元|もと} に {戻|もど}す こと を 、{記録|きろく} の {世界|せかい} で は 「{復元|ふくげん}」 と {言|い}う そう です 。{灯守|ひもり} で は 「{灯|ひ} を {入|い}れ{直|なお}す」 と {言|い}います 。|| In the world of records they call putting things back "restoration". Lantern keepers call it "relighting".
?(comp=suzu) comp: {写|うつ}し の {紙代|かみだい} 、ちゃんと {帳簿|ちょうぼ} に {付|つ}けて おいて ね 。|| Do put the paper for those copies down in the accounts.
!end
:again
lf_tadashi: {差出人|さしだしにん} の ない {指示|しじ} は 、もう {届|とど}きません 。{管|くだ} から {来|き}て いた の でしょう 。|| The instructions with no sender have stopped arriving. They must have been coming through those pipes.
lf_tadashi[smile]: {今|いま} は 、{反対|はんたい} の {書類|しょるい} で {机|つくえ} が {埋|う}まって おります 。{大変|たいへん} {結構|けっこう} な こと です 。|| My desk is buried in objections now. Most gratifying.

@scene lf.tadashi_post
lf_tadashi: いらっしゃいませ 。{閲覧|えつらん} で ございます か 。{申請書|しんせいしょ} に 、「{不許可|ふきょか}」 の {欄|らん} を {足|た}しました 。|| Welcome. Here to consult the records? I have added a "not approved" box to the request form.
?(end_archive_library) lf_tadashi: {山|やま} の {書庫|しょこ} と は 、{毎日|まいにち} {写|うつ}し を やり{取|と}り して おります 。{上|のぼ}る {写|うつ}し に も 、{下|くだ}る {写|うつ}し に も 、{署名|しょめい} が ございます 。|| We exchange copies with the Archive every day. Those going up and those coming down are all signed now.
?(end_archive_closed) lf_tadashi: {山|やま} の {書庫|しょこ} は {閉|と}じられました 。{町|まち} の {記録|きろく} は 、{町|まち} で {守|まも}ります 。{異議|いぎ} も 、{誤|あやま}り も 、そのまま に 。|| The Archive has been closed. The town's records will be kept by the town — objections, mistakes and all.
?(end_kasane_trial) lf_tadashi: カサネ {様|さま} の {件|けん} の {議事録|ぎじろく} は 、{三冊|さんさつ} に なりました 。{誰|だれ} も {賛成|さんせい} しなかった {頁|ページ} ばかり です 。|| The minutes on Kasane's case run to three volumes. Page after page where nobody agreed.

# ---- the recopied ledger ------------------------------------------------------------------------------------------------------
@scene lf.records_ledger
!if !item.lf_request_slip -> nopermit
narr: {三十年前|さんじゅうねんまえ} の {台帳|だいちょう} 。{六月|ろくがつ} の {頁|ページ} を {開|ひら}く 。|| The ledger from thirty years ago. You open it to June.
narr: 「{六月|ろくがつ} {十二日|じゅうににち} 。{大雨|おおあめ} 。{特記|とっき}{事項|じこう} なし 。」|| "June 12th. Heavy rain. Nothing of note."
narr: {次|つぎ} の {頁|ページ} も 、その {次|つぎ} も 。{毎日|まいにち} 「{特記|とっき}{事項|じこう} なし」 。|| The next page, and the next. Every day: "Nothing of note."
pc: {洪水|こうずい} が あった {日|ひ} なのに …… 。|| On the very day of the flood…
?(comp=nao) comp[angry]: {下町|したまち} が {丸|まる}ごと {沈|しず}んだ {日|ひ} じゃん 。{何|なに} が 「なし」 だよ 。|| That's the day the whole lower quarter went under. "Nothing"?
?(comp=mio) comp[worry]: {紙|かみ} の {端|はし} が 、まだ {新|あたら}しい 。{最近|さいきん} {書|か}き{直|なお}した みたい 。|| The paper edges are still new. As if it was rewritten recently.
?(comp=ren) comp[think]: {文体|ぶんたい} は {古|ふる}い の に 、{墨|すみ} だけ が {新|あたら}しい 。{妙|みょう} です ね 。|| The style's old, but the ink is new. Strange.
?(comp=suzu) comp[smirk]: {台本|だいほん} を {書|か}き{換|か}えた {跡|あと} って 、{意外|いがい} と わかる もの よ 。|| You can always tell when someone's rewritten a script.
narr: {頁|ページ} の {下|した} に 、{小|ちい}さな {字|じ} で 「{写|うつ}し ： {記録係|きろくがかり} アカリ （ {先月|せんげつ} ）」 。|| At the foot of the page, small: "Copied by: records clerk Akari (last month)."
!set lf_ledger_seen
!if quest.lf_main>=2 -> end
!quest lf_main 2
!end
:nopermit
narr: {台帳|だいちょう} の {上|うえ} に 、{札|ふだ} が {置|お}いて ある 。「{閲覧|えつらん} に は {許可|きょか}{証|しょう} が {必要|ひつよう} です 。」|| A card sits on the ledger: "A reading permit is required."

# ---- Akari ----------------------------------------------------------------------------------------------------------------------
@scene lf.akari
akari: いらっしゃいませ 。{事務所|じむしょ} の アカリ です 。{何|なに} か お{手伝|てつだ}い できる こと は ありますか 。|| Welcome. I'm Akari, of the clerks' office. Is there anything I can help you with?
akari[tired]: {今日|きょう} も {残業|ざんぎょう} を {頼|たの}まれて しまって 。…… もちろん 、{喜|よろこ}んで 。|| I've been asked to stay late again today. …Gladly, of course.
!call lf.akari_letters

@scene lf.akari_letters
!if quest.lf_akari -> end
narr: {机|つくえ} の {端|はし} に 、{雪|ゆき} の {色|いろ} を した {襟巻|えりまき} が {畳|たた}んで ある 。{雪鈴|ゆきすず} の {織|お}り{方|かた} だ 。|| Folded at the edge of her desk is a scarf the colour of snow, woven the Snowbell way.
?(ch4_done) narr: アカリ 。{雪鈴|ゆきすず} の {天文台|てんもんだい} で {聞|き}いた {名前|なまえ} だ 。ホシノ の {娘|むすめ} 。|| Akari. The name you heard at the Snowbell observatory. Hoshino's daughter.
?(ch4_done) pc: お{父|とう}さん は 、{天文台|てんもんだい} の {灯|あか}り を {点|つ}けて 、あなた を {待|ま}って います よ 。|| Your father keeps the observatory lamp lit, waiting for you.
?(ch4_done) akari[surprise]: …… {父|ちち} を ご{存知|ぞんじ} なんです か 。|| …You know my father?
?(!ch4_done) akari: {雪鈴|ゆきすず} の {出|で} なんです 。{父|ちち} が {山|やま} で {星|ほし} を {見|み}て います 。|| I'm from Snowbell. My father watches the stars up on the mountain.
akari[sad]: {手紙|てがみ} を {書|か}いて も 、ぜんぶ 「{宛先|あてさき}{不明|ふめい}」 で {戻|もど}って くる んです 。|| Every letter I write comes back "address unknown".
akari: 「{休|やす}み を ください 」 と {言|い}おう と して も 、{残業|ざんぎょう} を {頼|たの}まれる と 、「かしこまりました」 と {言|い}って しまう 。|| I try to say "please give me some leave", but whenever I'm asked to stay late, out comes "certainly".
akari[smile]: …… ごめんなさい 。お{客|きゃく}さま に こんな {話|はなし} 。|| …I'm sorry. Telling a visitor all this.
?(comp=nao) comp: {宛先|あてさき}{不明|ふめい} 、か 。{宛先|あてさき} は ある のに 、{字|じ} が {通|とお}らない んだ 。{配達人|はいたつにん} と して は 、{腹|はら} が {立|た}つ 。|| "Address unknown." The address exists; the writing just won't go through. That makes a courier angry.
?(comp=mio) comp: {休|やす}み も {薬|くすり} の うち です よ 。…… {私|わたし} が {言|い}える こと じゃ ない けど 。|| Rest is a kind of medicine too. …Not that I'm one to talk.
?(comp=ren) comp: {灯|あか}り を {点|つ}けて {待|ま}つ {人|ひと} と 、{帰|かえ}れない {人|ひと} 。{同|おな}じ {道|みち} の {両端|りょうはし} です ね 。|| Someone keeping a lamp lit, and someone who can't come home. Two ends of the same road.
?(comp=suzu) comp: {帰|かえ}る {場所|ばしょ} が ある の は 、{幸|しあわ}せ な こと よ 。…… {帰|かえ}れれば 、だけど 。|| Having somewhere to go home to is a blessing. …If you can get there.
!quest lf_akari start

@scene lf.akari_hint
!if !quest.lf_akari -> letters
:hint
pc: {洪水|こうずい} の {年|とし} の {台帳|だいちょう} を {写|うつ}した の は 、あなた です か 。|| Was it you who copied the ledger for the flood year?
akari[worry]: …… はい 。{先月|せんげつ} 、{写|うつ}し{直|なお}す よう に {言|い}われて 。|| …Yes. I was told to recopy it last month.
akari: {元|もと} の {台帳|だいちょう} に は 、ちゃんと …… {色々|いろいろ} {書|か}いて ありました 。|| The original had… all sorts of things written in it.
pc: {元|もと} の {台帳|だいちょう} は 、どこ に ?|| Where's the original?
akari[closed]: …… {地下|ちか} の {書庫|しょこ} は 、ちょっと …… 。|| …The basement stacks are, well…
akari: {古|ふる}い {物|もの} ばかり です し 、{暗|くら}い です し 。{行|い}かない ほう が いい かも しれません ね 。|| It's all old things down there, and it's dark. It might be better not to go, perhaps.
narr: そう {言|い}いながら 、アカリ は {真鍮|しんちゅう} の {鍵|かぎ} を 、{机|つくえ} の {上|うえ} で すっと こちら へ {滑|すべ}らせた 。|| As she says it, Akari slides a brass key across the desk towards you.
!challenge lf.ch_akari
?(comp=nao) comp[smirk]: 「{行|い}かない ほう が いい」 って {言|い}いながら 、{鍵|かぎ} を {渡|わた}す 。わかりやすい じゃん 。|| "Better not go," while handing over the key. Pretty clear, really.
?(comp=mio) comp[smile]: {言葉|ことば} と {手|て} が 、{違|ちが}う こと を {言|い}ってる ね 。{手|て} の ほう を {信|しん}じよう 。|| Her words and her hands are saying different things. Let's trust the hands.
?(comp=ren) comp: {言葉|ことば} で {止|と}めて 、{鍵|かぎ} で {送|おく}り{出|だ}す 。{見事|みごと} な {婉曲|えんきょく} {表現|ひょうげん} です 。|| Stopping us with words, sending us off with a key. A masterly euphemism.
?(comp=suzu) comp[laugh]: {名演技|めいえんぎ} ！ {台詞|せりふ} は 「だめ」 、{小道具|こどうぐ} は 「どうぞ」 。|| Bravo! The line says "don't", the prop says "go ahead".
akari[smile]: …… {何|なん} の こと でしょう 。{私|わたし} は 、なにも {申|もう}して おりません よ 。|| …Whatever do you mean? I haven't said a thing.
!give lf_stacks_key
!set lf_akari_key
!quest lf_main 3
!autosave
!end
:letters
!call lf.akari_letters
!goto hint

@scene lf.akari_again
akari[smile]: {地下|ちか} ? さあ 。{私|わたし} は {何|なに} も {存|ぞん}じません 。|| The basement? I'm sure I know nothing about it.
akari: …… {階段|かいだん} は 、{窓口|まどぐち} の {奥|おく} の {右|みぎ} です けど 。|| …The stairs are at the back of the counter, on the right. Not that I'd know.

@scene lf.akari_after
!if !quest.lf_akari -> start
!quest lf_akari 1
!call lf.akari_letter
!end
:start
!call lf.akari_letters
!quest lf_akari 1
!call lf.akari_letter

@scene lf.akari_letter
akari[laugh]: {聞|き}いて ください ！ {今朝|けさ} 、{残業|ざんぎょう} を {断|ことわ}りました ！ 「お{断|ことわ}り します」 って ！|| Listen! This morning I turned down overtime! I said "I refuse"!
akari: それ で 、{休|やす}み も もらいました 。{雪鈴|ゆきすず} へ 、{帰|かえ}ります 。|| And I got leave. I'm going home to Snowbell.
akari[shy]: {先|さき} に {手紙|てがみ} を {出|だ}したい んです 。{父|ちち} を {驚|おどろ}かせたく ない ので 。…… {宛先|あてさき} 、{一緒|いっしょ} に {見|み}て いただけます か 。{何度|なんど} も {戻|もど}って きた ので 、{自信|じしん} が なくて 。|| I want to send a letter first, so I don't startle my father. …Would you check the address with me? It came back so many times I've lost my nerve.
!quest lf_akari 2
!challenge lf.ch_akari_addr
akari[smile]: …… {雪鈴|ゆきすず} {天文台|てんもんだい} 、ホシノ {様|さま} 。{今度|こんど} は 、ちゃんと {字|じ} が {紙|かみ} に {残|のこ}って います 。|| …Snowbell Observatory, Mr Hoshino. This time the writing is staying on the paper.
?(comp=nao) comp: {貸|か}して 。{上|のぼ}り の {配達|はいたつ} なら 、{一番|いちばん} {速|はや}い {便|びん} に {乗|の}せる 。…… {宛名|あてな} 、いい {字|じ} だ 。|| Give it here. For a delivery up the mountain, I'll get it on the fastest run. …Nice handwriting on the address.
?(comp!=nao) akari: {渡|わた}し{場|ば} の ウミ さん に {頼|たの}みます 。{舟|ふね} と {馬|うま} を {乗|の}り{継|つ}いで 、{三日|みっか} で {着|つ}く そう です 。|| I'll ask Umi at the ferry office. By boat and then horse, it should get there in three days.
akari: {手紙|てがみ} が {着|つ}いた {頃|ころ} に 、{私|わたし} も {着|つ}きます 。{父|ちち} は きっと 、{灯|あか}り を {点|つ}けた まま {寝|ね}て います 。|| I'll arrive around when the letter does. Father's probably sleeping with the lamp still lit.
akari[laugh]: …… {叱|しか}って やらなきゃ 。{油|あぶら} が もったいない って 。|| …I'll have to scold him. What a waste of oil.
!quest lf_akari done
!set lf_akari_letter lf_akari_leave
!journal アカリ は {雪鈴|ゆきすず} へ {帰|かえ}った 。{手紙|てがみ} が {先|さき} に {着|つ}く はず だ 。|| Akari has gone home to Snowbell. Her letter should arrive just ahead of her.
!autosave

@scene lf.akari_done
akari: {荷造|にづく}り を して います 。…… {父|ちち} に 、{何|なに} か {伝言|でんごん} は あります か 。|| I'm packing. …Any message for my father?

# ---- the basement stacks ----------------------------------------------------------------------------------------------------------
@scene lf.stacks_door
!if item.lf_stacks_key -> open
narr: {地下|ちか} へ {下|お}りる {階段|かいだん} 。{扉|とびら} に {鍵|かぎ} が かかって いる 。「{関係者|かんけいしゃ} {以外|いがい} {立入|たちいり} {禁止|きんし}」 。|| Stairs down to the basement. The door is locked. "Authorised staff only."
!end
:open
narr: {真鍮|しんちゅう} の {鍵|かぎ} が 、かちり と {回|まわ}った 。|| The brass key turns with a click.
!sfx door
!set lf_stacks_open

@scene lf.stacks_enter
narr: {紙|かみ} と {黴|かび} の {匂|にお}い 。{棚|たな} が 、{暗|くら}がり の {奥|おく} まで {並|なら}んで いる 。|| The smell of paper and mould. Shelves stretch away into the dark.
narr: どこ か で 、{判子|はんこ} を {押|お}す {音|おと} が する 。{誰|だれ} も いない はず なのに 。|| Somewhere, the thump of a stamp. There shouldn't be anyone down here.
?(comp=nao) comp: {出口|でぐち} は {階段|かいだん} {一|ひと}つ だけ 。…… {早|はや}め に {済|す}ませよう 。|| Only one way out: the stairs. …Let's be quick about it.
?(comp=mio) comp[worry]: {空気|くうき} が {悪|わる}い 。{長|なが}く いる と 、{頭|あたま} が {痛|いた}く なる かも 。|| The air's bad. Stay too long and you'll get a headache.
?(comp=ren) comp: {灯|あか}り を {高|たか}く {掲|かか}げます 。{棚|たな} の {番号|ばんごう} を {読|よ}んで ください 。{私|わたし} が {読|よ}む と 、なぜか {逆|ぎゃく} に {進|すす}む ので 。|| I'll hold the lamp up high. You read the shelf numbers. When I read them, we somehow end up going backwards.
?(comp=suzu) comp: {舞台|ぶたい} {裏|うら} みたい 。{古|ふる}い {小道具|こどうぐ} と 、{忘|わす}れられた {台本|だいほん} 。|| Like backstage. Old props and forgotten scripts.

@scene lf.minutes_chest
narr: {箱|はこ} の {中|なか} に 、{紐|ひも} で {綴|と}じた {古|ふる}い {帳面|ちょうめん} が ある 。|| In the chest is an old notebook, bound with string.
narr: 「{高瀬|たかせ} {村|むら} と の {水門|すいもん} {協議|きょうぎ} {議事録|ぎじろく}」 。{三十年前|さんじゅうねんまえ} の {日付|ひづけ} だ 。|| "Minutes of the sluice gate talks with Takase village." Dated thirty years ago.
narr: {開|ひら}く と 、{余白|よはく} まで {書|か}き{込|こ}み で いっぱい だ 。「{反対|はんたい}」 「{異議|いぎ} あり」 「{納得|なっとく} できない」 。|| Open it, and even the margins are crammed. "Opposed." "Objection." "Not satisfied."
narr: この {町|まち} で 、{久|ひさ}しぶり に {見|み}る {言葉|ことば} ばかり だ 。|| Words you haven't seen anywhere else in this town.
?(comp=nao) comp[smile]: {汚|きたな}い {字|じ} だ な 。{最高|さいこう} 。{怒|おこ}ってる {字|じ} だ 。|| Messy handwriting. Brilliant. That's angry writing.
?(comp=mio) comp: {墨|すみ} が にじんでる 。{急|いそ}いで {書|か}いた ん だね 。{言|い}いたい こと が 、たくさん あった ん だ 。|| The ink's smudged. Written in a hurry. They had so much they wanted to say.
?(comp=ren) comp: {写|うつ}し{直|なお}されて いない 、{最後|さいご} の {原本|げんぽん} です ね 。{大事|だいじ} に {持|も}って いきましょう 。|| The last original that hasn't been recopied. Let's carry it carefully.
?(comp=suzu) comp[laugh]: いい {野次|やじ} ！ {三十年前|さんじゅうねんまえ} の {客席|きゃくせき} は 、{元気|げんき} だった の ね 。|| Great heckles! The audience thirty years ago had some life in them.
!give lf_minutes
!call lf.stacks_check

@scene lf.conduit
!if lf_conduit_seen -> again
narr: {壁|かべ} に {沿|そ}って 、{太|ふと}い {管|くだ} が {天井|てんじょう} へ {伸|の}びて いる 。|| A thick pipe runs up the wall and through the ceiling.
narr: {耳|みみ} を {当|あ}てる と 、{小|ちい}さな {声|こえ} が {流|なが}れて いく 。「いや 」 「ちがう 」 「{待|ま}って 」 …… 。|| Put your ear to it, and small voices stream past. "No." "That's wrong." "Wait…"
narr: {管|くだ} の {継|つ}ぎ{目|め} に 、{真鍮|しんちゅう} の {札|ふだ} が {付|つ}いて いる 。|| At a joint in the pipe hangs a brass tag.
!challenge lf.ch_conduit
narr: 「{上|のぼ}り 。{静寂|しじま} の {書庫|しょこ} {行|ゆ}き 。」|| "Uphill. Bound for the Still Archive."
?(comp=nao) comp[angry]: …… {配達路|はいたつろ} だ 。{町|まち} の 「いや」 を 、{誰|だれ} か が {毎日|まいにち} {山|やま} へ {運|はこ}んでる 。|| …It's a delivery route. Someone's shipping this town's "no"s up the mountain every day.
?(comp=mio) comp[worry]: {声|こえ} を {吸|す}い{上|あ}げる {管|くだ} …… 。{病気|びょうき} の {原因|げんいん} が 、{町|まち} の {下|した} に ずっと あった ん だ 。|| A pipe that sucks up voices… The cause of the sickness has been under the town all along.
?(comp=ren) comp[worry]: {灯|あか}り の {名前|なまえ} が {上|うえ} へ {消|き}えて いった の も 、この {管|くだ} の せい でしょう か 。{書庫|しょこ} は 、{守|まも}る ため に {建|た}てられた はず なのに 。|| Is this pipe why the lantern names vanished upwards too? The Archive was built to protect them.
?(comp=suzu) comp[think]: {舞台|ぶたい} {裏|うら} の {仕掛|しか}け を {見|み}ちゃった 。…… {悪趣味|あくしゅみ} な {演出家|えんしゅつか} が いる わ ね 。|| We've found the stage machinery. …There's a director up there with very poor taste.
!note lf_conduits
!set lf_conduit_seen
!call lf.stacks_check
!end
:again
narr: {管|くだ} の {中|なか} を 、{言|い}えなかった {言葉|ことば} が {上|のぼ}って いく 。|| Words that nobody could say climb up through the pipe.

@scene lf.stacks_check
!if !item.lf_minutes -> end
!if !lf_conduit_seen -> end
!if quest.lf_main>=4 -> end
!quest lf_main 4
?(comp=nao) comp: {議事録|ぎじろく} と 、{管|くだ} 。{役所|やくしょ} の {誰|だれ} か に {見|み}せよう 。{正直|しょうじき} そう な {人|ひと} に 。|| The minutes, and the pipe. Let's show someone official. Someone who seems honest.
?(comp=mio) comp: {議会|ぎかい} の {人|ひと} に {見|み}せよう 。{昔|むかし} の こと を {覚|おぼ}えて いる {人|ひと} が いる かも 。|| Let's show the council. Someone there might remember those days.
?(comp=ren) comp: {議事録|ぎじろく} は {議会|ぎかい} の もの です 。{持|も}ち{主|ぬし} に {返|かえ}しましょう 。|| Minutes belong to the council. Let's return them to their owners.
?(comp=suzu) comp: {次|つぎ} の {幕|まく} は {議会堂|ぎかいどう} ね 。{古|ふる}い {台本|だいほん} を {読|よ}んで もらいましょう 。|| Next act: the Council Chamber. Let's have someone read the old script aloud.
!autosave

@scene lf.stacks_ledger
narr: {埃|ほこり} を かぶった {元|もと} の {台帳|だいちょう} 。{六月|ろくがつ} {十二日|じゅうににち} の {頁|ページ} 。|| The original ledger, thick with dust. June 12th.
narr: 「{大雨|おおあめ} 。{夜半|やはん} 、{上|うえ} の {水門|すいもん} {開|ひら}く 。{下町|したまち} {水没|すいぼつ} 。{警鐘|けいしょう} {鳴|な}る 。{死者|ししゃ} {十二名|じゅうにめい} 。」|| "Heavy rain. Around midnight, the upper gate opened. Lower Town submerged. Warning bell rang. Twelve dead."
narr: {写|うつ}し に は 、どれ も {書|か}かれて いなかった 。|| None of it made it into the copy.

@scene lf.stacks_desk
narr: {机|つくえ} の {上|うえ} に 、{封筒|ふうとう} の ない {手紙|てがみ} が {何通|なんつう} も ある 。{差出人|さしだしにん} は {書|か}いて いない 。|| On the desk lie several letters without envelopes. No sender on any of them.
narr: 「{記録|きろく} を 、{穏|おだ}やか に {整|ととの}える こと 。{争|あらそ}い の {言葉|ことば} は 、{写|うつ}さない こと 。」|| "Tidy the records into calm. Do not copy words of conflict."
narr: {字|じ} は とても {丁寧|ていねい} だ 。{定規|じょうぎ} で {引|ひ}いた よう に {揺|ゆ}れ が ない 。…… {記録館|きろくかん} の {誰|だれ} の {字|じ} でも ない 。|| Very careful handwriting, as if ruled with a straightedge. …It belongs to no one at the Records Hall.
?(comp=ren) comp[think]: {紙|かみ} が 、{山|やま} の {上|うえ} の {匂|にお}い が します 。{冷|つめ}たい 、{乾|かわ}いた {匂|にお}い 。|| The paper smells of the mountain. Cold and dry.

# ---- Councillor Yae ------------------------------------------------------------------------------------------------------------------
@scene lf.yae
lf_yae: {議員|ぎいん} の ヤエ です よ 。{今日|きょう} も {議会|ぎかい} は {全員|ぜんいん} {賛成|さんせい} 。{早|はや}く {終|お}わって 、{結構|けっこう} な こと です 。|| I'm Councillor Yae. The council was unanimous again today. Finished early. Very nice.
lf_yae[think]: …… {昔|むかし} は 、{夜中|よなか} まで {終|お}わらなかった もの です けど ね 。{何|なに} を あんな に {言|い}い{合|あ}って いた の やら 。|| …In the old days we'd go on past midnight. Heaven knows what we found to argue about.
pc: {鐘楼|しょうろう} の こと を {聞|き}きたい の です が 。|| I'd like to ask about the bell tower.
lf_yae: もちろん 、{何|なん} でも どうぞ 。…… {鐘楼|しょうろう} 。{鐘楼|しょうろう} ね 。{特|とく}に {問題|もんだい} は ありません よ 。|| Of course, ask anything. …The bell tower. Yes. No particular problem.
narr: ヤエ は {微笑|ほほえ}んだ まま 、{少|すこ}し だけ {眉|まゆ} を {寄|よ}せた 。{何|なに} か を {思|おも}い{出|だ}そう と して 、{途中|とちゅう} で {止|と}まった {顔|かお} だ 。|| Yae keeps smiling, but her brow creases slightly: the face of someone who started to remember something and stopped halfway.
?(comp=mio) comp[worry]: …… {思|おも}い{出|だ}せない の が 、{苦|くる}しそう 。|| …Not being able to remember seems to hurt her.
?(comp=suzu) comp: {台詞|せりふ} を {忘|わす}れた {役者|やくしゃ} の {顔|かお} ね 。{誰|だれ} か が {台本|だいほん} を {見|み}せて あげない と 。|| That's the face of an actor who's forgotten her line. Someone needs to show her the script.

@scene lf.yae_minutes
lf_yae: それ は …… {議事録|ぎじろく} ? {見|み}せて ください 。|| Are those… minutes? Let me see.
narr: ヤエ は {眼鏡|めがね} を かけて 、ゆっくり と {読|よ}み{始|はじ}めた 。|| Yae puts on her spectacles and begins, slowly, to read.
lf_yae: 「{高瀬|たかせ} より {返答|へんとう} 。{必要|ひつよう} なら {開|あ}ける 。」|| "Reply from Takase: we'll open it if it's needed."
lf_yae: 「{本|ほん}{議会|ぎかい} は 、これ を {開|あ}けない {約束|やくそく} と {受|う}け{取|と}る 。」|| "This council takes this as a promise not to open it."
lf_yae: 「{使|つか}い の トウヤ 、{異議|いぎ} を {唱|とな}える 。{高瀬|たかせ} は {開|あ}ける {気|き} で いる 、と 。」|| "The messenger Tōya objects: Takase means to open it, he says."
lf_yae: 「{書記|しょき} カサネ 、{反論|はんろん} 。{文面|ぶんめん} は 『{必要|ひつよう} なら』 で あり 、{約束|やくそく} と {読|よ}む べき で ある 。」|| "The clerk, Kasane, disagrees: the text says 'if it's needed', and should be read as a promise."
lf_yae: 「{異議|いぎ} は 、{記録|きろく} に {残|のこ}す 。」|| "The objection is noted in the record."
narr: ヤエ の {指|ゆび} が 、{頁|ページ} の {上|うえ} で {止|と}まった 。|| Yae's finger stops on the page.
lf_yae[sad]: …… カサネ 。そう 、カサネ だった 。{几帳面|きちょうめん} な {子|こ} で ね 。{誰|だれ} より も {字|じ} が きれい で 。|| …Kasane. Yes, it was Kasane. Such a meticulous young thing. Better handwriting than anyone.
lf_yae: {弟|おとうと} の トウヤ が 、{高瀬|たかせ} から あの {返事|へんじ} を {持|も}って {帰|かえ}った の よ 。{雨|あめ} の {中|なか} を {走|はし}って 。|| It was Tōya, the younger brother, who carried that reply back from Takase. Ran all the way in the rain.
lf_yae: {向|む}こう の {声|こえ} の {調子|ちょうし} を 、あの {子|こ} は {聞|き}いて いた 。だから {反対|はんたい} した 。|| He had heard how they said it over there. That's why he objected.
lf_yae: カサネ は 、{紙|かみ} に {書|か}かれた {字|じ} を {信|しん}じた 。…… {二人|ふたり} は 、{議会|ぎかい} の {廊下|ろうか} で {大|おお}げんか を した 。|| Kasane trusted the words on the paper. …The two of them had a dreadful quarrel in the council corridor.
lf_yae: その {夜|よる} 、トウヤ は {鐘|かね} を {鳴|な}らし に {塔|とう} へ {走|はし}った 。{鐘|かね} は {鳴|な}った 。{下町|したまち} の {人|ひと} は みんな 、{高|たか}い {所|ところ} へ {逃|に}げた 。{私|わたし} も ね 。|| That night Tōya ran to the tower to ring the bell. The bell rang. Everyone in the lower quarter fled to high ground. Me included.
lf_yae[closed]: トウヤ だけ が 、{戻|もど}らなかった 。|| Only Tōya didn't come back.
lf_yae: カサネ は その あと 、{山|やま} の {上|うえ} の {書庫|しょこ} へ {上|のぼ}って 、{二度|にど} と {町|まち} へ は {下|お}りて こなかった 。|| Afterwards, Kasane went up to the Archive on the mountain, and never came down to the town again.
!challenge lf.ch_minutes
?(comp=nao) comp[closed]: …… {最後|さいご} に {話|はな}した の が 、けんか か 。{届|とど}かない まま の {言葉|ことば} って 、{一番|いちばん} {重|おも}い んだ よ 。|| …So the last thing they had was a fight. Words that never get delivered are the heaviest kind.
?(comp=mio) comp[sad]: {正|ただ}しく {読|よ}もう と した だけ なのに 。…… {正|ただ}しい こと と 、{助|たす}かる こと は 、{違|ちが}う ん だね 。|| Kasane was only trying to read it correctly. …Being correct and saving people aren't the same thing, are they.
?(comp=ren) comp[think]: 「{必要|ひつよう} なら」 。{誰|だれ} に とって の {必要|ひつよう} か を 、{誰|だれ} も {書|か}かなかった 。{灯守|ひもり} の {約束|やくそく} も 、{気|き} を つけない と {同|おな}じ {穴|あな} に {落|お}ちます 。|| "If it's needed." Nobody wrote down needed by whom. A lantern keeper's promise can fall into the same hole if we aren't careful.
?(comp=suzu) comp[sad]: …… {台本|だいほん} を {信|しん}じた {人|ひと} と 、{客席|きゃくせき} の {空気|くうき} を {読|よ}んだ {人|ひと} 。どっち も 、{本気|ほんき} だった の ね 。|| …One who trusted the script, and one who read the room. Both of them meant it with everything they had.
lf_yae: {鐘|かね} の こと を {知|し}りたい なら 、{水門|すいもん} の トクジ に {聞|き}きなさい 。あの {夜|よる} 、{水門|すいもん} の {番|ばん} を して いた の は あの {人|ひと} です 。|| If you want to know about the bell, ask Tokuji at the sluice. He was keeping the gate that night.
lf_yae[smile]: …… {変|へん} です ね 。{読|よ}んで いたら 、{胸|むね} が ざわざわ する 。{昔|むかし} の {議会|ぎかい} の {夜|よる} みたい 。|| …How odd. Reading this, my chest is all astir. Like a council night in the old days.
!note lf_flood lf_promise lf_toya
!set lf_yae_told
!quest lf_main 5
!autosave

@scene lf.yae_again
lf_yae: {水門|すいもん} の トクジ の ところ へ {行|い}きなさい 。{町|まち} の {南|みなみ} 、{湖|みずうみ} の {岸|きし} です 。|| Go and see Tokuji at the sluice. South of town, on the lake shore.
lf_yae[think]: …… あの {人|ひと} は 、{三十年|さんじゅうねん} ずっと {湖|みずうみ} を {見|み}て いる 。{何|なに} を {待|ま}って いる の か 、{誰|だれ} も {聞|き}かなかった 。|| …For thirty years he's been looking out at the lake. Nobody ever asked what he was waiting for.

# ---- Tokuji and Tōya's bell ------------------------------------------------------------------------------------------------------------
@scene lf.tokuji_early
lf_tokuji: …… おう 。|| …Yeah.
pc: {鐘楼|しょうろう} へ {行|い}きたい の です が 。|| I want to get to the bell tower.
lf_tokuji: …… おう 。|| …Yeah.
narr: トクジ は {答|こた}えた が 、{少|すこ}し も {動|うご}かない 。{湖|みずうみ} の {塔|とう} を {見|み}つめた まま だ 。|| Tokuji answers, but doesn't move an inch. He just keeps staring at the tower in the lake.
?(comp=nao) comp: 「おう」 って {言|い}って 、{動|うご}かない 。{一番|いちばん} {手強|てごわ}い {断|ことわ}り{方|かた} だ よ 、それ 。|| Says "yeah" and doesn't budge. That's the toughest refusal there is.
?(comp=mio) comp: …… {無理|むり} に {頼|たの}む の は やめよう 。{何|なに} か 、{持|も}って {来|く}る もの が ある の かも 。|| …Let's not push him. Maybe there's something we need to bring him first.
?(comp=ren) comp: {湖|みずうみ} を {見|み}て いる {目|め} が 、{灯|あか}り を {待|ま}つ {人|ひと} の {目|め} です 。|| Those eyes on the lake are the eyes of someone waiting for a light.
?(comp=suzu) comp: {返事|へんじ} は 「はい」 、{体|からだ} は 「いいえ」 。{正直|しょうじき} な {人|ひと} ね 。|| His answer says yes, his body says no. An honest man.

@scene lf.tokuji_story
lf_tokuji: …… {議事録|ぎじろく} か 。{懐|なつ}かしい {字|じ} だ 。|| …The minutes, eh. There's handwriting I haven't seen in a long while.
lf_tokuji: あの {夜|よる} 、{俺|おれ} は {水門|すいもん} の {番|ばん} だった 。|| That night, I was keeping the gate.
lf_tokuji: トウヤ が {走|はし}って きた 。「トクジ さん 、{下|した} の {水門|すいもん} を {開|あ}けて 。{高瀬|たかせ} が {上|うえ} を {開|あ}ける ！」|| Tōya came running. "Tokuji, open the lower gate! Takase's opening the upper one!"
lf_tokuji: {議会|ぎかい} は 「{開|あ}けない {約束|やくそく} だ」 と {決|き}めて いた 。{俺|おれ} は …… {迷|まよ}った 。|| The council had decided it was a promise not to open. And I… I hesitated.
lf_tokuji[closed]: {迷|まよ}って いる {間|あいだ} に 、{水|みず} が {来|き}た 。|| While I was hesitating, the water came.
lf_tokuji: トウヤ は {塔|とう} へ {走|はし}った 。{鐘|かね} を {鳴|な}らし に 。…… これ を {落|お}として いった 。|| Tōya ran for the tower, to ring the bell. …He dropped this on the way.
narr: トクジ は {懐|ふところ} から 、{小|ちい}さな {真鍮|しんちゅう} の {鈴|すず} を {出|だ}した 。{使|つか}い が {腰|こし} に {下|さ}げる {鈴|すず} だ 。|| From inside his coat, Tokuji takes a small brass bell: the kind a messenger wears at the belt.
lf_tokuji: {三十年|さんじゅうねん} 、{一度|いちど} も {鳴|な}らせなかった 。…… お{前|まえ} が {振|ふ}れ 。|| Thirty years, and I never once could ring it. …You shake it.
narr: {小|ちい}さな {鈴|すず} を {振|ふ}る 。…… ちりん 。{澄|す}んだ {音|おと} が 、{静|しず}か な {湖|みずうみ} の {上|うえ} を {渡|わた}って いく 。|| You shake the little bell. …Ting. A clear note carries out over the silent lake.
!sfx bell
!give lf_toya_bell
!word suzu
narr: {鈴|すず} ： {小|ちい}さな {鐘|かね} 。{静|しず}けさ を {破|やぶ}る 、はっきり した {音|おと} 。{戦|たたか}い の {中|なか} で 、しじま に {答|こた}える {言葉|ことば} と して {織|お}れる 。|| 鈴 (すず): a small bell — a clear sound that breaks a hush. You can now weave すず in encounters to answer a Hush.
lf_tokuji: …… {鳴|な}った な 。|| …It rang.
lf_tokuji: あの {塔|とう} に は 、{町|まち} の {連中|れんちゅう} が {言|い}えなく なった {言葉|ことば} が {溜|た}まってる 。{夜|よる} に なる と 、{管|くだ} を {光|ひかり} が {上|のぼ}って いく の が {見|み}える 。|| All the words the townsfolk stopped being able to say have piled up in that tower. At night you can see lights climbing the pipes.
lf_tokuji[angry]: {大|おお}きい ほう の {鐘|かね} を {鳴|な}らせ 。{俺|おれ} の {舟|ふね} を {使|つか}え 。|| Ring the big one. Take my boat.
narr: {言|い}って から 、トクジ は {自分|じぶん} で {驚|おどろ}いた {顔|かお} を した 。「{使|つか}え」 。{命令|めいれい} は 、「いいえ」 の {親戚|しんせき} だ 。|| Having said it, Tokuji looks surprised at himself. "Take it" — an order, a close relative of "no".
?(comp=nao) comp[smile]: …… {預|あず}かり{物|もの} だ 。ちゃんと {届|とど}ける よ 、{塔|とう} まで 。|| …Something entrusted to us. We'll get it delivered, all the way to the tower.
?(comp=mio) comp[smile]: いい {音|おと} 。{小|ちい}さい けど 、{遠|とお}く まで {届|とど}く {音|おと} 。|| What a lovely sound. Small, but it carries a long way.
?(comp=ren) comp: {鈴|すず} は 、{使|つか}い が {来|き}た こと を {知|し}らせる ため の もの です 。{三十年|さんじゅうねん} {遅|おく}れ の 、{到着|とうちゃく} の {合図|あいず} です ね 。|| A messenger's bell is for announcing that the messenger has arrived. This is his arrival, thirty years late.
?(comp=suzu) comp[sad]: {小|ちい}さな {鈴|すず} の {音|おと} で 、{大人|おとな} が {泣|な}き そう に なる の 、{見|み}た こと ある わ 。…… {舞台|ぶたい} の {外|そと} で も 。|| I've seen grown people nearly cry at a little bell's sound. …Offstage, too.
lf_tokuji: {舟|ふね} は {桟橋|さんばし} の {先|さき} だ 。{塔|とう} の {上|うえ} の {窓|まど} から {入|はい}れる 。{中|なか} の {水門|すいもん} の {札|ふだ} は 、よく {読|よ}め 。{読|よ}み{間違|まちが}える と 、{水|みず} が {戻|もど}る 。|| The boat's at the end of the pier. You can get in by the window near the top of the tower. Read the gate plates inside carefully. Misread them and the water comes back.
!set lf_tokuji_told lf_tokuji_boat
!quest lf_main 6
!autosave

@scene lf.tokuji_again
lf_tokuji: {舟|ふね} は {桟橋|さんばし} の {先|さき} だ 。{札|ふだ} は 、よく {読|よ}め 。|| The boat's at the end of the pier. Read the plates carefully.
lf_tokuji: 「ない と」 と 「たら」 を {読|よ}み{飛|と}ばす な 。{水|みず} は 、{言葉|ことば} の {通|とお}り に しか {動|うご}かない 。|| Don't skip over "unless" and "once". Water only does exactly what the words say.

@scene lf.tokuji_after
lf_tokuji: …… うるさく なった な 、{町|まち} が 。|| …Town's got noisy.
lf_tokuji[smile]: {悪|わる}く ない 。|| Not bad.
lf_tokuji: {水門|すいもん} の {番|ばん} は 、{明日|あした} から {若|わか}い {者|もの} に {教|おし}える 。{迷|まよ}ったら {鐘|かね} を {鳴|な}らせ 、{間違|まちが}って も いい から 、と な 。|| Tomorrow I start teaching a youngster to keep the gate. "When in doubt, ring the bell. It's all right to be wrong," I'll tell them.

@scene lf.tokuji_post
lf_tokuji: …… よう 。|| …Hey.
?(end_kasane_trial) lf_tokuji: カサネ が {来|き}た 。ここ に {立|た}って 、{湖|みずうみ} を {見|み}た 。{二人|ふたり} とも 、{何|なに} も {言|い}わなかった 。…… それ で {良|よ}かった 。|| Kasane came. Stood right here and looked at the lake. Neither of us said anything. …That was right.
?(end_kasane_keeper) lf_tokuji: {山|やま} の {上|うえ} に 、{日誌|にっし} の {写|うつ}し を {送|おく}った 。「{鐘|かね} 、{鳴|な}る」 の {頁|ページ} だけ な 。{返事|へんじ} は {来|こ}ない 。{来|こ}なくて いい 。|| Sent a copy of my log up the mountain. Just the "bell rang" page. No reply. Don't need one.
?(end_mem_return) lf_tokuji: {町|まち} の {連中|れんちゅう} も 、{忘|わす}れて いた こと を {思|おも}い{出|だ}した 。{泣|な}いてる {奴|やつ} も いる 。{泣|な}ける の は 、いい こと だ 。|| The townsfolk remembered what they'd forgotten. Some of them are crying. Being able to cry is a good thing.
?(end_mem_choose) lf_tokuji: {忘|わす}れた まま で いる か 、{取|と}り に {行|い}く か 。{町|まち} の {連中|れんちゅう} は 、{自分|じぶん} で {決|き}めてる 。{議会|ぎかい} で {揉|も}めながら な 。|| Stay forgetting, or go and fetch it back. Everyone's deciding for themselves. Squabbling about it in council, too.

@scene lf.boat_to_tower
!if !lf_tokuji_boat -> tied
narr: トクジ の {舟|ふね} 。{古|ふる}い が 、よく {手入|てい}れ されて いる 。|| Tokuji's boat. Old, but well cared for.
!choice
* {鐘楼|しょうろう} へ {漕|こ}ぎ{出|だ}す || Row out to the bell tower -> go
* まだ {行|い}かない || Not yet -> end
:go
!fade out
narr: {静|しず}か な {湖|みずうみ} を {漕|こ}いで いく 。{櫂|かい} の {音|おと} さえ 、{水|みず} に {吸|す}い{込|こ}まれて いく 。|| You row out across the still lake. Even the sound of the oars is swallowed by the water.
!warp lf.tower_top 7 9 up
!fade in
!end
:tied
narr: {古|ふる}い {舟|ふね} が 、しっかり と {杭|くい} に {結|むす}ばれて いる 。{持|も}ち{主|ぬし} に {断|ことわ}り なく は {使|つか}えない 。|| An old boat, tied firmly to its post. You can't take it without the owner's say-so.

# ---- after the bell --------------------------------------------------------------------------------------------------------------------
@scene lf.after_town
!set lf_after_town
narr: {町|まち} に {入|はい}る と 、{声|こえ} が {一斉|いっせい} に {飛|と}び{込|こ}んで きた 。|| As you come into town, voices come flying at you from every side.
lf_masaru: {無理|むり} です ！ {三百個|さんびゃっこ} なんて {焼|や}けません ！|| I can't! I can't bake three hundred!
lf_kinu: {垣根|かきね} は {柿|かき} の {木|き} の {手前|てまえ} です よ ！|| The fence goes on THIS side of the persimmon!
lf_kohei: いいや 、{向|む}こう だ ！|| No, the far side!
lf_setsu: {本日|ほんじつ} は {満室|まんしつ} で ございます ！ ……{言|い}えた ！|| We're full tonight! …I said it!
narr: {誰|だれ} も が 、{少|すこ}し {驚|おどろ}いた {顔|かお} で 、{自分|じぶん} の {声|こえ} を {聞|き}いて いる 。|| Everyone looks slightly startled, listening to their own voices.
?(comp=nao) comp[laugh]: …… うるさい 。すごく うるさい 。{最高|さいこう} じゃん 。|| …Noisy. Really noisy. It's great.
?(comp=mio) comp[laugh]: みんな 、{顔色|かおいろ} が いい 。{怒|おこ}ってる のに 、{元気|げんき} そう 。|| Everyone's colour looks better. They're angry, and they look so well.
?(comp=ren) comp[smile]: {灯|あか}り の {笠|かさ} に 、{通|とお}り の {名前|なまえ} が {戻|もど}って います 。…… {同|おな}じ {通|とお}り に {二|ふた}つ {名前|なまえ} が ある の は 、{見|み}なかった こと に します 。|| The street names are back on the lamp shades. …I'll pretend I didn't see the one street with two names.
?(comp=suzu) comp[laugh]: {野次|やじ} が {飛|と}んでる ！ {大入|おおい}り {満員|まんいん} ね ！|| People are heckling! A full house!
narr: {議会堂|ぎかいどう} の ほう から 、{鈴|すず} の {音|おと} が {聞|き}こえる 。ヤエ が 、{集会|しゅうかい} を {呼|よ}びかけて いる 。|| From the Council Chamber comes the sound of a handbell. Yae is calling a meeting.
!journal {町|まち} に {声|こえ} が {戻|もど}った 。ヤエ が {議会|ぎかい} を {開|ひら}く 。|| Voices have come back to the town. Yae is convening the council.

@scene lf.yae_after
!if ch5_done -> later
lf_yae: {静粛|せいしゅく} に ！ …… と {言|い}って も 、{誰|だれ} も {静|しず}か に しない 。ああ 、{懐|なつ}かしい 。|| Order! …Not that anyone's quieting down. Oh, how I've missed this.
lf_masaru: {議長|ぎちょう} ！ {記録館|きろくかん} の {注文|ちゅうもん} 、{全部|ぜんぶ} {断|ことわ}って いい です か ！|| Madam Chair! May I turn down every order from the Records Hall?!
lf_tadashi: …… どうぞ 。{私|わたし} も 、{半分|はんぶん} は {要|い}らない と {思|おも}って おりました 。|| …Please do. I too thought half of them unnecessary.
lf_kinu: {議長|ぎちょう} 、{垣根|かきね} の {件|けん} です が ！|| Madam Chair, regarding the fence!
lf_yae: それ は {来週|らいしゅう} ！ …… {次|つぎ} 。{山|やま} の {上|うえ} の {書庫|しょこ} の こと 。|| Next week! …Next item. The Archive up the mountain.
lf_tadashi: {記録館|きろくかん} に は 、{差出人|さしだしにん} の ない {指示|しじ} が {届|とど}いて おりました 。「{記録|きろく} を {穏|おだ}やか に {整|ととの}える こと」 。{私|わたし} は 、「かしこまりました」 と しか {申|もう}せません でした 。|| The Records Hall had been receiving instructions with no sender. "Tidy the records into calm." I could say nothing but "certainly".
lf_tadashi: {今|いま} なら {申|もう}せます 。{承知|しょうち} いたしかねます 。|| Now I can say it. I am unable to comply.
lf_yae: {書庫|しょこ} へ 、{誰|だれ} か が {行|い}かなければ ならない 。…… カサネ に {会|あ}い に 。|| Someone must go up to the Archive. …To see Kasane.
lf_hayato: {反対|はんたい} です ！ {危|あぶ}ない です ！|| I object! It's dangerous!
lf_masaru: {賛成|さんせい} ！ {行|い}って {文句|もんく} を {言|い}って こい ！|| In favour! Go up there and give them a piece of your mind!
lf_yae[laugh]: {賛成|さんせい} {一|ひと}つ 、{反対|はんたい} {一|ひと}つ 。…… よろしい 。{議会|ぎかい} が {戻|もど}って きた 。|| One for, one against. …Good. The council is back.
lf_yae: $name さん 。{山道|やまみち} の {灯籠|とうろう} に 、{名前|なまえ} が {戻|もど}って いる はず です 。{書庫|しょこ} へ の {道|みち} は {開|ひら}いた 。|| $name. The lantern on the mountain road should have its name back. The way to the Archive is open.
lf_yae: {行|い}く か どう か は 、あなた が {決|き}めなさい 。ここ に は もう 、「かしこまりました」 と {言|い}う {者|もの} は いません から ね 。|| Whether to go is for you to decide. There's no one left here who'll just say "certainly".
lf_yae[sad]: …… もし カサネ に {会|あ}ったら 、{伝|つた}えて ちょうだい 。{議事録|ぎじろく} に は 、あなた の {反論|はんろん} も 、トウヤ の {異議|いぎ} も 、ちゃんと {残|のこ}って いた と 。|| …If you meet Kasane, tell them this. The minutes kept both — their counter-argument, and Tōya's objection. Both, properly recorded.
?(comp=nao) comp: …… {伝言|でんごん} 、{預|あず}かった 。{今度|こんど} は 、ちゃんと {届|とど}ける 。|| …Message received. This time, it gets delivered.
?(comp=nao) comp[smirk]: {山|やま} の {上|うえ} まで 、{一緒|いっしょ} に {行|い}く よ 。{出口|でぐち} が ある か どう か は 、{行|い}って から {確|たし}かめる 。|| I'll come up the mountain with you. Whether there's a way out, we'll check when we get there.
?(comp=mio) comp: {町|まち} を {静|しず}か に する {薬|くすり} は 、{私|わたし} は {作|つく}らない 。…… カサネ さん に も 、そう {言|い}おう と {思|おも}う 。|| I won't make medicine that quiets a town. …I think I'll tell Kasane the same thing.
?(comp=mio) comp[smile]: {行|い}こう 。{一緒|いっしょ} に 。{薬箱|くすりばこ} 、{重|おも}く して いく から 。|| Let's go. Together. I'll pack the medicine chest extra heavy.
?(comp=ren) comp[think]: {書庫|しょこ} に は 、ウシオ {師匠|ししょう} の {残|のこ}り も ある はず です 。{顔|かお} も 、{最後|さいご} の …… {口|くち}げんか も 。|| The rest of Master Ushio should be in the Archive. His face, and our last… quarrel.
?(comp=ren) comp: {道|みち} に {迷|まよ}ったら 、{私|わたし} の {逆|ぎゃく} を {行|い}って ください 。それ で {着|つ}きます 。|| If we get lost, go the opposite way from me. That'll get us there.
?(comp=suzu) comp: {最終|さいしゅう} {幕|まく} の {舞台|ぶたい} は 、{山|やま} の {上|うえ} ね 。{客|きゃく} は {一人|ひとり} 、{演出家|えんしゅつか} も {一人|ひとり} 。|| So the final act is up the mountain. An audience of one, and one director.
?(comp=suzu) comp[smile]: {貸|か}し{借|か}り は 、きっちり {返|かえ}して もらいましょう 。{町|まち} {一|ひと}つ {分|ぶん} の 「いいえ」 、{利子|りし} を つけて ね 。|| Let's make sure the debts get settled properly. One whole town's worth of "no"s — with interest.
!quest lf_main done
!set ch5_done
!travel lanternfall
!journal {書庫|しょこ} へ の {道|みち} が {開|ひら}いた 。{灯落|ひおち} の {上|うえ} の {分|わ}かれ{道|みち} から {山|やま} へ {登|のぼ}れる 。|| The road to the Still Archive is open: take the north fork on the Lantern Road above Lanternfall.
!toast {静寂|しじま} の {書庫|しょこ} へ の {道|みち} が {開|ひら}いた || The road to the Still Archive is open (north fork, above town).
!autosave
!end
:later
lf_yae: {議会|ぎかい} は まだ {続|つづ}いて います よ 。{三日目|みっかめ} です 。{誰|だれ} も {賛成|さんせい} しない 。{素晴|すば}らしい 。|| The council is still in session. Day three. Nobody agrees on anything. Marvellous.
lf_yae: {山|やま} へ {行|い}く {前|まえ} に 、{町|まち} で {休|やす}んで いきなさい 。{宿|やど} も 、もう {満室|まんしつ} と {言|い}える よう に なった から 、{早|はや}め に ね 。|| Rest in town before you go up the mountain. The inn can say "full" now, so book early.

@scene lf.yae_post
lf_yae: あら 、いらっしゃい 。{今日|きょう} の {議会|ぎかい} も 、{全員|ぜんいん} {反対|はんたい} で {終|お}わりました よ 。{何|なに} に {反対|はんたい} した か は 、{忘|わす}れた けど 。|| Oh, welcome. Today's council ended with everyone against. What we were against, I've forgotten.
?(end_kasane_trial) lf_yae: カサネ は 、この {部屋|へや} で {三日|みっか} 、{町|まち} の {人|ひと} の {話|はなし} を {聞|き}いた 。{誰|だれ} も {賛成|さんせい} しなかった 。…… {三十年|さんじゅうねん} で {一番|いちばん} いい {議会|ぎかい} でした よ 。|| Kasane sat in this room for three days and listened to the town. Nobody agreed. …The best council in thirty years.
?(end_kasane_keeper) lf_yae: カサネ に は 、{毎週|まいしゅう} {手紙|てがみ} を {書|か}いて います 。{毎回|まいかい} 、{向|む}こう の {意見|いけん} に {反対|はんたい} して ね 。{返事|へんじ} は 、{字|じ} が だんだん {揺|ゆ}れて きました 。|| I write to Kasane every week, and disagree with them every time. Their replies — the handwriting's started to wobble.
`, 'ch5/main');
