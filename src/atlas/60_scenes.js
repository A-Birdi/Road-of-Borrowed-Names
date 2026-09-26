/* Unwritten Atlas — authored scenes. Hooks (50_run.js) do the bookkeeping;
 * what people say lives here where the validator and tests can read it. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene atlas.intro.first
tsuru: {書|か}かれて いない {道|みち} に は 、 {迷子|まいご} の {名前|なまえ} が まだ いる 。 {帰|かえ}り{道|みち} が {分|わ}からない の さ 。 || Out on the unwritten roads there are still lost names. They can't find their way home.
tsuru: {道|みち} は {歩|ある}く たび に {形|かたち} が {変|か}わる 。 {霧|きり} の {日|ひ} も あれば 、 {潮|しお} の {引|ひ}いた {日|ひ} も ある 。 {好|す}きな {道|みち} を {選|えら}び な 。 || They change every time you walk them. Some days there's fog, some days the tide's out. Pick whichever road you like.
?(comp=nao) comp[smirk]: {届|とど}け{損|そこ}ねた {名前|なまえ} か 。 {私|わたし} の {仕事|しごと} だ な 。 || Undelivered names. Sounds like my line of work.
?(comp=mio) comp: {迷|まよ}って いる なら 、 {迎|むか}え に {行|い}かない と ね 。 || If they're lost, someone should go and fetch them.
?(comp=ren) comp: {道|みち} を {照|て}らす の は {灯守|ひもり} の {仕事|しごと} です 。 {方角|ほうがく} は …… お{任|まか}せ します 。 || Lighting roads is a lantern keeper's job. The direction, I'll… leave to you.
?(comp=suzu) comp[laugh]: {毎回|まいかい} {筋書|すじが}き が {違|ちが}う {舞台|ぶたい} ？ {最高|さいこう} じゃない 。 || A stage where the script changes every night? That's the best kind.
tsuru: {無理|むり} は しない こと 。 {危|あぶ}なく なったら 、 {道|みち} の {方|ほう} が あんた たち を ここ へ {返|かえ}して くれる 。 || Don't overdo it. If it turns dangerous, the road itself will set you back down here.
tsuru: {途中|とちゅう} の {野営地|やえいち} から {引|ひ}き{返|かえ}す こと も できる 。 {拾|ひろ}った もの は 、 {持|も}って {帰|かえ}って いい よ 。 || You can turn back at a camp along the way. Whatever you find, you may bring home.
!note atlas_about atlas_unmoored
tsuru: さて 、 {今日|きょう} は どんな {道|みち} が {開|ひら}いて いる かね 。 || Now then. Let's see which roads are open today.

@scene atlas.intro.again
tsuru: また {行|い}く の かい 。 {道|みち} は 、 {前|まえ} と は {違|ちが}う {顔|かお} を して いる よ 。 || Off again? The roads will have a different face from last time.
?(comp=nao) comp: {地図|ちず} の ない {配達|はいたつ} は 、 {嫌|きら}い じゃ ない 。 || I don't mind a delivery with no map.
?(comp=mio) comp: {包帯|ほうたい} と お{茶|ちゃ} 、 {持|も}った 。 {行|い}こう 。 || Bandages and tea, packed. Let's go.
?(comp=ren) comp: {今日|きょう} こそ 、 {迷|まよ}わない よう に します 。 || Today, I will try not to get lost.
?(comp=suzu) comp: さあ 、 {開演|かいえん} ！ || Curtain up!

@scene atlas.intro.later
tsuru: そう かい 。 {道|みち} は 、 {逃|に}げない よ 。 || Suit yourselves. The roads aren't going anywhere.

@scene atlas.intro.go
narr: {灯籠|とうろう} の {紙|かみ} に 、 {一瞬|いっしゅん} 、 {知|し}らない {道|みち} の {名前|なまえ} が {浮|う}かんだ 。 || For a moment, the name of a road you don't know surfaces on a lantern shade.
?(var.atlas_mods>=1) narr: その {道|みち} は 、 いつも と {少|すこ}し {様子|ようす} が {違|ちが}う らしい 。 || That road, it seems, is not quite like the others.
?(comp=nao) comp: {行|い}く か 。 || Let's go.
?(comp=mio) comp: {行|い}こう か 。 || Shall we?
?(comp=ren) comp: {参|まい}りましょう 。 || Let us go.
?(comp=suzu) comp: さあ 、 {出発|しゅっぱつ} ！ || And we're off!

@scene atlas.room.threshold
!hook atlas_enter
narr: {道|みち} の {端|はし} が 、 {鉛筆|えんぴつ} の {線|せん} の よう に {途切|とぎ}れて いる 。 || The edge of the road breaks off like a pencil line.
?(var.atlas_seen=0) narr: {門|もん} の {石|いし} に {刻|きざ}まれた {言葉|ことば} が 、 {一|ひと}つ {抜|ぬ}けて いる 。 その {先|さき} は 、 まだ {白紙|はくし} だ 。 || One word is missing from the words cut into the gate stone. Beyond it, everything is still blank paper.
?(var.atlas_seen>=1) narr: {書|か}きかけ の {門|もん} 。 {石|いし} の {言葉|ことば} が 、 また {一|ひと}つ {足|た}りない 。 || The half-written gate again. Its stone is missing a word again.
?(var.atlas_mirror=1) narr: {何|なに}もかも が 、 {左右|さゆう} {逆|ぎゃく} に {描|か}かれて いる 。 || Everything here is drawn the wrong way round.
?(var.atlas_fog=1) narr: {霧|きり} が 、 {紙|かみ} の {上|うえ} を {這|は}って いる 。 || Mist is creeping over the paper.
?(var.atlas_esc=1) narr: {小|ちい}さな {灯|あか}り が 、 {足元|あしもと} で {揺|ゆ}れて いる 。 {消|け}さない よう に {歩|ある}こう 。 || A small lantern bobs at your feet. Walk so as not to put it out.
?(comp=nao) comp: {後|うし}ろ の {道|みち} 、 もう {畳|たた}まれてる 。 {戻|もど}れない な 。 || The road behind's folded up already. No going back that way.
?(comp=mio) comp: {紙|かみ} の {匂|にお}い が する 。 {新|あたら}しい {帳面|ちょうめん} みたい 。 || It smells of paper. Like a new notebook.
?(comp=ren) comp: {灯|ひ} の {道|みち} と {同|おな}じ です 。 {言葉|ことば} が {先|さき} 、 {道|みち} が {後|あと} 。 || It's how lantern roads were made. First the word, then the road.
?(comp=suzu) comp: {幕|まく} が {上|あ}がる {前|まえ} の {舞台|ぶたい} みたい 。 わくわく する ね 。 || Like a stage before the curtain goes up. Exciting, isn't it?

@scene atlas.room.lanterns
!hook atlas_enter
narr: {灯籠|とうろう} が {並|なら}んで いる 。 どれ も 、 {紙|かみ} が {白|しろ}い まま だ 。 || A row of lanterns, every shade still blank.
?(var.atlas_seen=0) narr: {灯籠|とうろう} に {言葉|ことば} を {戻|もど}せば 、 {灯|ひ} が つく はず だ 。 || Give each lantern back its word and it should light.
?(comp=ren) comp: {灯籠|とうろう} の {名前|なまえ} なら 、 {私|わたし} の {専門|せんもん} です 。 {書|か}く の は 、 あなた です が 。 || Lantern names are my speciality. Though you'll be the one writing them.

@scene atlas.room.crossing
!hook atlas_enter
narr: {川|かわ} に {橋|はし} が {架|か}かって いる 。 {真|ま}ん{中|なか} だけ 、 まだ {描|か}かれて いない 。 || A bridge crosses the river — except for the middle, which hasn't been drawn yet.
?(var.atlas_seen=0) narr: {手前|てまえ} の {立|た}て{札|ふだ} の {言葉|ことば} が 、 ばらばら に なって いる 。 || The words on the sign on this side have come apart.
?(comp=nao) comp: {橋|はし} が {途中|とちゅう} で {終|お}わってる 。 {葦|あし}ノ{瀬|せ} を {思|おも}い{出|だ}す な 。 || A bridge that stops halfway. Takes me back to Reedwake.

@scene atlas.room.fork
!hook atlas_enter
narr: {道|みち} が {二|ふた}つ に {分|わ}かれて いる 。 || The road divides in two.
?(var.atlas_seen=0) narr: {道標|みちしるべ} を {読|よ}めば 、 {行|い}き{先|さき} の {様子|ようす} が {少|すこ}し {分|わ}かる 。 {一度|いちど} {選|えら}んだら 、 もう {一方|いっぽう} へ は {戻|もど}れない 。 || The signpost tells you something of what lies each way. Once you choose, the other road folds away.

@scene atlas.room.doors
!hook atlas_enter
narr: {三|みっ}つ の {扉|とびら} が {並|なら}んで いる 。 {先|さき} へ {続|つづ}く の は 、 {一|ひと}つ だけ 。 || Three doors in a row. Only one of them goes on.
?(var.atlas_seen=0) narr: {入|い}り{口|ぐち} の {石板|せきばん} に 、 {手|て}がかり が {刻|きざ}まれて いる 。 || The tablet by the entrance has a clue carved into it.
?(comp=ren) comp: …… {私|わたし} は {黙|だま}って います 。 {扉|とびら} を {選|えら}ぶ と 、 {必|かなら}ず {外|はず}れる ので 。 || …I'll stay quiet. When I pick doors, I always pick wrong.
?(comp=nao) comp: {出口|でぐち} を {探|さが}す の は {得意|とくい} だ 。 でも 、 {今日|きょう} は {読|よ}んで から に しよう 。 || Finding exits is my speciality. But let's read first today.

@scene atlas.room.grove
!hook atlas_enter
narr: {木|き} の {間|あいだ} で 、 {名前|なまえ} の {紙|かみ} {切|き}れ が {揺|ゆ}れて いる 。 || Slips of paper with names on them drift between the trees.
?(var.atlas_seen=0) narr: {自分|じぶん} が {誰|だれ} だった の か 、 {思|おも}い{出|だ}せない らしい 。 {話|はなし} を {聞|き}いて みよう 。 || They can't remember who they were. Try listening to them.
?(comp=mio) comp: {怖|こわ}がらせない よう に 、 そっと ね 。 || Gently, so we don't frighten them.
?(comp=suzu) comp: {観客|かんきゃく} が {待|ま}ってる 。 {出番|でばん} だ よ 。 || The audience is waiting. You're on.

@scene atlas.room.stacks
!hook atlas_enter
narr: {題|だい} の ない {本|ほん} が 、 {棚|たな} に びっしり {並|なら}んで いる 。 || Shelves packed with books that have no titles.
?(var.atlas_branch=2) narr: {奥|おく} で 、 {何|なに}か が {道|みち} を ふさいで いる 。 || Something is blocking the way at the far end.
?(comp=mio) comp: {題|だい} の ない {本|ほん} …… ラベル の ない {瓶|びん} より は 、 {怖|こわ}くない かな 。 || Books without titles… less frightening than bottles without labels, I suppose.

@scene atlas.room.camp
!hook atlas_enter
narr: {焚|た}き{火|び} の {跡|あと} が ある 。 {誰|だれ}か が ここ で {休|やす}んだ らしい 。 || The remains of a campfire. Someone has rested here.
?(var.atlas_seen=0) narr: {火|ひ} の そば で {休|やす}めば 、 {引|ひ}き{返|かえ}す か {先|さき} へ {進|すす}む か 、 {決|き}められる 。 || Sit by the fire to rest — and to decide whether to go on or head home.

@scene atlas.room.court
!hook atlas_enter
narr: {石|いし} の {庭|にわ} に 、 {守|まも}られなかった {約束|やくそく} が {刻|きざ}まれて いる 。 || In a stone courtyard, promises that were never kept are carved into the stone.
?(var.atlas_seen=0) narr: {何|なに} を {約束|やくそく} した の か 、 {正|ただ}しく {読|よ}めれば 、 {道|みち} が {続|つづ}く 。 || Read correctly what was promised, and the road will go on.
?(comp=nao) comp: {約束|やくそく} の {中身|なかみ} を {読|よ}む の は 、 {宛名|あてな} を {読|よ}む より {難|むずか}しい 。 || Reading what a promise actually says is harder than reading an address.

@scene atlas.room.tide
!hook atlas_enter
narr: {潮|しお} の {匂|にお}い が する 。 {水|みず} の {間|あいだ} に 、 {石|いし} の {段|だん} が {続|つづ}いて いる 。 || It smells of the sea. Stone steps run between the pools.
?(var.atlas_branch=2) narr: {上|うえ} の {段|だん} で 、 {何|なに}か が {待|ま}ち{構|かま}えて いる 。 || Something is waiting on the top step.

@scene atlas.room.margin
!hook atlas_enter
narr: {地面|じめん} が {紙|かみ} の まま だ 。 {余白|よはく} に 、 {墨|すみ} の {染|し}み が {点々|てんてん} と {残|のこ}って いる 。 || The ground here is still paper. Ink stains dot the margins.
?(var.atlas_branch=2) narr: {奥|おく} の {方|ほう} で 、 {何|なに}か が {動|うご}いた 。 || Something moved at the far end.

@scene atlas.room.pool
!hook atlas_enter
narr: {静|しず}か な {池|いけ} が ある 。 {水面|みなも} に 、 {二人|ふたり} の {姿|すがた} が {少|すこ}し {遅|おく}れて {映|うつ}る 。 || A still pool. Your reflections appear in it a moment late.
?(comp=suzu) comp: {鏡|かがみ} の {前|まえ} で {稽古|けいこ} する と 、 よく こう なる の 。 …… ならない か 。 || When I rehearse in front of a mirror this always happens. …No, it doesn't.

@scene atlas.room.climax
!hook atlas_enter
narr: {広|ひろ}い {部屋|へや} の {床|ゆか} に 、 {白紙|はくし} の {地図|ちず} が {広|ひろ}がって いる 。 || A blank map is spread across the floor of a wide room.
narr: {奥|おく} に {誰|だれ}か が {立|た}って いる 。 この {道|みち} の {終|お}わり を {守|まも}る {者|もの} だ 。 || Someone stands at the far end: the keeper of this road's end.
?(comp=nao) comp[think]: {話|はな}せば {分|わ}かる {相手|あいて} か どう か 、 {見|み}て から だ 。 || Let's see whether it's the kind you can talk to.
?(comp=mio) comp[worry]: {傷|きず}つける ため に {来|き}た ん じゃ ない 。 {忘|わす}れない で ね 。 || We didn't come here to hurt it. Don't forget.
?(comp=ren) comp: {灯|ひ} は {私|わたし} が {掲|かか}げます 。 {言葉|ことば} は 、 あなた が 。 || I'll hold up the light. The words are yours.
?(comp=suzu) comp: クライマックス だ ね 。 {台詞|せりふ} 、 {忘|わす}れない で よ 。 || The climax. Don't forget your lines.

@scene atlas.room.extract
!hook atlas_enter
narr: {道|みち} の {先|さき} に 、 {灯|ひ} の ついた {灯籠|とうろう} が {立|た}って いる 。 || At the end of the road stands a lit lantern.
?(var.atlas_seen=0) narr: その {紙|かみ} に は 、 {見覚|みおぼ}え の ある {名前|なまえ} が {書|か}いて ある 。 || The name on its shade is one you know.

@scene atlas.obj
!hook atlas_obj

@scene atlas.name.talk
!hook atlas_name

@scene atlas.relic.find
!hook atlas_relic

@scene atlas.fork.sign
!hook atlas_fork_sign

@scene atlas.fork.ask
!hook atlas_fork

@scene atlas.doors.clue
!hook atlas_doors_clue

@scene atlas.doors.step
!hook atlas_door

@scene atlas.foe.won
!hook atlas_foe
!if var.atlas_guard>=1 -> guard
!end
:guard
narr: {道|みち} を ふさいで いた もの が {退|しりぞ}き 、 {白紙|はくし} の {幕|まく} が {上|あ}がった 。 || What was blocking the way withdraws, and the blank curtain lifts.

@scene atlas.camp
!hook atlas_camp rest
narr: {焚|た}き{火|び} に {火|ひ} を {入|い}れて 、 {二人|ふたり} で {腰|こし} を {下|お}ろした 。 || You get the fire going again, and the two of you sit down.
?(var.atlas_esc=1) narr: {小|ちい}さな {灯|あか}り も 、 {火|ひ} を {分|わ}けて もらって {明|あか}るく なった 。 || The little lantern takes a light from the fire and brightens.
?(comp=nao&var.atlas_camp_i=0) comp: {前|まえ} は 、 {宛先|あてさき} の ない {手紙|てがみ} が {一番|いちばん} {怖|こわ}かった 。 {今|いま} は 、 {宛先|あてさき} を {探|さが}す の が {楽|たの}しい 。 || I used to be most afraid of letters with no address. Now finding the address is the fun part.
?(comp=nao&var.atlas_camp_i=1) comp: この {鞄|かばん} 、 {重|おも}い だろ 。 {全部|ぜんぶ} 、 {書|か}き{直|なお}した {宛名|あてな} の {控|ひか}え だ 。 {捨|す}てられない ん だ よ 。 || This bag's heavy, right? It's all copies of addresses I've rewritten. Can't bring myself to throw them out.
?(comp=nao&var.atlas_camp_i=2) comp: {帰|かえ}ったら 、 ウミ に {手紙|てがみ} を {書|か}く 。 {今度|こんど} は 、 {自分|じぶん} の {手紙|てがみ} だ 。 || When we get back I'm writing to Umi. My own letter, this time.
?(comp=mio&var.atlas_camp_i=0) comp: {全部|ぜんぶ} の {名前|なまえ} を {助|たす}ける の は 、 {無理|むり} よ ね 。 …… {分|わ}かってる 。 {言|い}って みた だけ 。 || We can't save every name, can we. …I know. I just wanted to say it out loud.
?(comp=mio&var.atlas_camp_i=1) comp: {瓶|びん} の ラベル を {一|ひと}つ {増|ふ}やした の 。 「{断|ことわ}る {練習|れんしゅう} 」 って 。 {中身|なかみ} は {空|から} だ けど 。 || I made a new bottle label. "Practice saying no." The bottle's empty, though.
?(comp=mio&var.atlas_camp_i=2) comp: こういう {所|ところ} で {飲|の}む お{茶|ちゃ} が 、 {一番|いちばん} おいしい の 。 {不思議|ふしぎ} ね 。 || Tea tastes best in places like this. Funny, isn't it.
?(comp=ren&var.atlas_camp_i=0) comp: {師匠|ししょう} は 、 {道|みち} に {迷|まよ}う の も {仕事|しごと} の うち だ と {言|い}って いました 。 {私|わたし} は {仕事|しごと} {熱心|ねっしん} な {方|ほう} です 。 || My master said getting lost was part of the job. I am very dedicated to my job.
?(comp=ren&var.atlas_camp_i=1) comp: {火|ひ} を {見|み}て いる と 、 {誰|だれ} の {顔|かお} でも {思|おも}い{出|だ}せる {気|き} が します 。 …… {気|き} が する だけ です が 。 || Looking into a flame, I feel I could remember anyone's face. …Only feel, mind you.
?(comp=ren&var.atlas_camp_i=2) comp: この {靴|くつ} 、 {直|なお}そう と {思|おも}って から 、 もう {三年|さんねん} です 。 || I've been meaning to mend these boots for three years now.
?(comp=suzu&var.atlas_camp_i=0) comp: {今日|きょう} の {出費|しゅっぴ} 、 つけて おく ね 。 {焚|た}き{木|ぎ} {三本|さんぼん} 、 {笑|わら}い {二回|にかい} 。 || I'll note down today's expenses. Three sticks of firewood, two laughs.
?(comp=suzu&var.atlas_camp_i=1) comp: {嘘|うそ} の ない {旅|たび} って 、 {思|おも}った より {楽|らく} だ ね 。 {荷物|にもつ} が {軽|かる}い 。 || Travelling without lies is easier than I thought. Lighter luggage.
?(comp=suzu&var.atlas_camp_i=2) comp: ねえ 、 {火|ひ} の {前|まえ} で {一曲|いっきょく} どう ？ …… {冗談|じょうだん} 。 {半分|はんぶん} は ね 。 || Hey, how about a song by the fire? …Joking. Half joking.
!choice
* {先|さき} へ {進|すす}む || Go on -> go
* {今日|きょう} は ここ まで に する || Head home from here (keep what you found) -> home
:home
?(comp) comp: {引|ひ}き{返|かえ}す の も 、 {旅|たび} の うち だ よ 。 || Turning back is part of travelling too.
!hook atlas_extract early
!end
:go
narr: {焚|た}き{火|び} を {消|け}して 、 {立|た}ち{上|あ}がった 。 {道|みち} は 、 また {二|ふた}つ に {分|わ}かれて いる 。 || You put out the fire and stand. The road divides again.

@scene atlas.climax
!hook atlas_climax
!if var.atlas_won>=1 -> won
!end
:won
?(var.atlas_boss=1) narr: {地図師|ちずし} は 、 {残|のこ}った {一本|いっぽん} の {道|みち} を {指|ゆび} で なぞった 。 「…… {全部|ぜんぶ} 、 {誰|だれ}か の {道|みち} か 」 || The Cartographer traces the one remaining road with a finger. "…So all of them are someone's road."
?(var.atlas_boss=2) narr: {鐘|かね} は {最後|さいご} に {一度|いちど} だけ 、 {自分|じぶん} の {名前|なまえ} で {鳴|な}った 。 || The bell rings once more — in its own name this time.
?(var.atlas_boss=3) narr: {関守|せきもり} は {道|みち} の {脇|わき} に {座|すわ}り{込|こ}み 、 {続|つづ}き を {作|つく}る {人|ひと} を {待|ま}つ こと に した らしい 。 || The Gatekeeper sits down at the roadside; it seems it has decided to wait for whoever builds the rest.
narr: {白紙|はくし} の {幕|まく} が {上|あ}がり 、 {奥|おく} に {道|みち} が {続|つづ}いて いる 。 || The blank curtain lifts; beyond it, the road goes on.
?(comp=nao) comp: {終|お}わった な 。 {帰|かえ}ろう 。 {手紙|てがみ} が {溜|た}まってる 。 || Done. Let's go home. The post will be piling up.
?(comp=mio) comp[smile]: {怪我|けが} は ない ？ …… よかった 。 || Not hurt? …Good.
?(comp=ren) comp: {道|みち} が {一本|いっぽん} 、 {書|か}き{足|た}されました 。 {地図|ちず} に {残|のこ}して おきます 。 || One more road has been written in. I'll put it on the map.
?(comp=suzu) comp[laugh]: カーテンコール は 、 {帰|かえ}って から に しよう ！ || Save the curtain call for when we're home!

@scene atlas.climax.cartographer
narr: 「{来|き}た か 。 {道|みち} を {歩|ある}く {者|もの} よ 」 {地図師|ちずし} は {筆|ふで} を {止|と}めずに {言|い}った 。 || "So you've come, walker of roads." The Cartographer does not stop its brush.
narr: 「{行|い}き{先|さき} の {分|わ}からない {道|みち} は 、 {人|ひと} を {迷|まよ}わせる 。 だから {私|わたし} は 、 {一本|いっぽん} ずつ {消|け}して いる 」 || "Roads whose ends are unknown lead people astray. So I am erasing them, one at a time."
?(comp=nao) comp: {静寂|しじま} と {同|おな}じ {理屈|りくつ} だ 。 {聞|き}き{飽|あ}きた 。 || The Hush's logic again. I've heard enough of it.
?(comp=mio) comp: {迷|まよ}わせない ため に {消|け}す なんて 、 {薬|くすり} を {捨|す}てて {病気|びょうき} を {治|なお}す よう な もの よ 。 || Erasing roads so nobody gets lost is like curing an illness by throwing the medicine away.
?(comp=ren) comp[think]: {静寂|しじま} の {残|のこ}り{香|が} の よう な もの です ね 。 || Something like the Hush's lingering scent.
?(comp=suzu) comp: {台本|だいほん} から {台詞|せりふ} を {消|け}したら 、 {芝居|しばい} は {終|お}わり だ よ 。 || Cut every line from the script and there's no play left.

@scene atlas.climax.bell
narr: {緑青|ろくしょう} の {浮|う}いた {鐘|かね} が 、 {誰|だれ} も いない {部屋|へや} で {鳴|な}り{続|つづ}けて いる 。 || A bell green with verdigris keeps ringing in an empty room.
narr: 「わたし の {音|おと} を {聞|き}け 。 {帰|かえ}る {場所|ばしょ} を {教|おし}えて やろう 」 || "Listen to my voice. I will tell you where home is."
?(comp=nao) comp: {他人|たにん} の {名前|なまえ} で {鳴|な}る {鐘|かね} か 。 {宛名|あてな} を {書|か}き{換|か}えた {手紙|てがみ} みたい だ 。 || A bell that rings in someone else's name. Like a letter with the address written over.
?(comp=mio) comp: {返|かえ}しそびれた {物|もの} って 、 {重|おも}く なる の よ ね 。 || Things you never got round to returning just get heavier, don't they.
?(comp=ren) comp: {灯落|ひおち} の {鐘|かね} の {音|おと} で は ありません 。 {私|わたし} は {知|し}って います 。 || That is not the voice of Lanternfall's bell. I know it.
?(comp=suzu) comp: {借|か}り{物|もの} の {衣装|いしょう} で {主役|しゅやく} を {張|は}る と 、 {最後|さいご} に {困|こま}る の よ 。 || Play the lead in a borrowed costume and the last act gets awkward.

@scene atlas.climax.gate
narr: {半分|はんぶん} だけ {作|つく}られた {道|みち} の {端|はし} で 、 {石|いし} の {関守|せきもり} が {立|た}ち{上|あ}がった 。 || At the end of a road built only halfway, a stone gatekeeper rises.
narr: 「{通|とお}さない 。 この {道|みち} は 、 まだ {完成|かんせい} して いない 」 || "None may pass. This road is not finished."
?(comp=nao) comp: {完成|かんせい} して から {通|とお}す なら 、 {誰|だれ} も {永遠|えいえん} に {通|とお}れない ぞ 。 || If it only lets people through once it's finished, no one's ever getting through.
?(comp=mio) comp: {待|ま}ち{続|つづ}けて 、 {疲|つか}れて しまった の ね 。 || It's worn itself out, waiting.
?(comp=ren) comp: {灯|ひ} の {道|みち} も 、 {最初|さいしょ} は {全部|ぜんぶ} {作|つく}りかけ でした 。 || Every lantern road was half-built once.
?(comp=suzu) comp: {未完成|みかんせい} の {舞台|ぶたい} でも 、 {幕|まく} は {上|あ}げられる の に ね 。 || You can raise the curtain on an unfinished stage, you know.

@scene atlas.extract.room
narr: {灯籠|とうろう} の {紙|かみ} に 、 「{葦|あし}ノ{瀬|せ} 」 と {書|か}いて ある 。 || The lantern shade reads "Reedwake".
?(comp=nao) comp: {宛先|あてさき} は {読|よ}める 。 {帰|かえ}れる な 。 || The address is legible. We can get home.
?(comp=mio) comp: {帰|かえ}ったら 、 {温|あたた}かい もの を {飲|の}もう ね 。 || When we get back, let's have something warm.
?(comp=ren) comp: {私|わたし} が {書|か}いた {字|じ} です 。 …… たぶん 。 || That's my handwriting. …Probably.
?(comp=suzu) comp: {終幕|しゅうまく} 。 {拍手|はくしゅ} は 、 {家|いえ} で もらおう 。 || Final act. We'll take our applause at home.
!choice
* {帰|かえ}る || Go home -> home
* もう {少|すこ}し ここ に いる || Stay a little longer -> stay
:stay
!end
:home
!hook atlas_extract

@scene atlas.escort.home
narr: {小|ちい}さな {灯|あか}り は 、 {最後|さいご} まで {消|き}えなかった 。 || The little lantern never went out.
narr: {灯|あか}り は あなた の {腰|こし} に {収|おさ}まって 、 {動|うご}かなく なった 。 {一緒|いっしょ}に {帰|かえ}る つもり らしい 。 || It settles at your hip and stays there. It seems to mean to come home with you.

@scene atlas.home
?(var.atlas_kind=1) narr: {気|き}が つく と 、 {灯|あか}り{堂|どう} の {中|なか} に {立|た}って いた 。 {手|て} の {中|なか} の {物|もの} の {重|おも}さ だけ が 、 {旅|たび} が {本当|ほんとう} だった と {教|おし}えて くれる 。 || You find yourselves standing in the Lantern Hall. Only the weight of what you're holding says the journey was real.
?(var.atlas_kind=2) narr: {焚|た}き{火|び} の {煙|けむり} の {匂|にお}い を まとった まま 、 {灯|あか}り{堂|どう} に {戻|もど}った 。 || You come back into the Lantern Hall still smelling of campfire smoke.
?(var.atlas_kind=3) narr: {道|みち} が {折|お}り{畳|たた}まれ 、 {気|き}が つく と {灯|あか}り{堂|どう} の {床|ゆか} に {座|すわ}り{込|こ}んで いた 。 || The road folded up under you. You find yourself sitting on the floor of the Lantern Hall.
?(var.atlas_kind=3&comp=nao) comp: …… {配達|はいたつ} {失敗|しっぱい} だ 。 でも 、 {荷物|にもつ} は {無事|ぶじ} だ よ 。 {覚|おぼ}えた こと は 、 {全部|ぜんぶ} ここ に ある 。 || …Delivery failed. But the parcel's safe. Everything you learned is still here.
?(var.atlas_kind=3&comp=mio) comp: {大丈夫|だいじょうぶ} ？ …… {少|すこ}し {休|やす}もう 。 {道|みち} は また {開|ひら}く から 。 || Are you all right? …Let's rest a while. The road will open again.
?(var.atlas_kind=3&comp=ren) comp: {灯|ひ} は {消|き}えて いません 。 {私|わたし} たち も です 。 || The light didn't go out. Nor did we.
?(var.atlas_kind=3&comp=suzu) comp: {今日|きょう} の {公演|こうえん} は {中止|ちゅうし} ！ {明日|あした} また {幕|まく} を {上|あ}げよう 。 || Tonight's show is cancelled! We'll raise the curtain again tomorrow.
?(var.atlas_kind=3) narr: {落|お}ちて いく {途中|とちゅう} で 、 {誰|だれ}か の {名前|なまえ} が {耳|みみ} に {残|のこ}った 。 {手帳|てちょう} に {書|か}いて おこう 。 || On the way down, someone's name stayed in your ear. Better write it in the notebook.
?(var.atlas_names>=1) narr: {帰|かえ}した {名前|なまえ} は 、 {手帳|てちょう} に {書|か}き{留|と}めて ある 。 || The names you sent home are written in your notebook.
?(var.atlas_relics>=1) narr: {道|みち} で {拾|ひろ}った {物|もの} は 、 いつの{間|ま}に か {手|て} から {消|き}えて いた 。 {持|も}ち{主|ぬし} の {所|ところ} へ {帰|かえ}った の だろう 。 || The things you picked up on the road have gone from your hands. Home to their owners, presumably.
?(var.atlas_restore=1) narr: …… {後|あと} で {聞|き}いた {話|はなし} だ が 、 {葦|あし}ノ{瀬|せ} の {渡|わた}し{場|ば} に {新|あたら}しい {看板|かんばん} が {立|た}った そう だ 。 || …Later you hear that a new signboard has gone up at the Reedwake ferry landing, its letters freshly painted.
?(var.atlas_restore=2) narr: …… {潮|しお}{硝子|がらす} の {港|みなと} で は 、 {迷子|まいご} の {荷札|にふだ} が {持|も}ち{主|ぬし} の {元|もと} へ {戻|もど}った らしい 。 || …In Saltglass harbour, they say, a basket of lost cargo tags has found its owners.
?(var.atlas_restore=3) narr: …… {灰実|はいみ} の {里|さと} で は 、 {防火|ぼうか}{帯|たい} に {名前|なまえ} の ついた {苗木|なえぎ} が {植|う}えられた と いう 。 || …In Cinder Orchard, a row of saplings with name tags has been planted along the firebreak.
?(var.atlas_restore=4) narr: …… {雪鈴|ゆきすず} の {天文台|てんもんだい} へ の {道|みち} に 、 {道標|みちしるべ} が {戻|もど}った そう だ 。 || …The waymarkers are back on the path up to Snowbell's observatory, one every hundred steps.
?(var.atlas_restore=5) narr: …… {灯落|ひおち} の {掲示板|けいじばん} に 、 {反対|はんたい} {意見|いけん} を {書|か}く {欄|らん} が {増|ふ}えた らしい 。 || …Lanternfall's notice board has grown a new column: a space for writing that you disagree.
?(var.atlas_restore=6) narr: …… {灯|ひ} の {道|みち} に {灯籠|とうろう} が {一|ひと}つ {増|ふ}えた 。 {一年前|いちねんまえ} に は なかった {場所|ばしょ} の {名前|なまえ} が 、 {書|か}いて ある 。 || …A new lantern stands on the lantern road, bearing the name of a place that did not exist a year ago.
?(var.atlas_unlock=1) narr: {灯|あか}り{堂|どう} の {灯籠|とうろう} に 、 {新|あたら}しい {道|みち} の {名前|なまえ} が {浮|う}かんで いる 。 {道|みち} の {終|お}わり で {待|ま}つ {者|もの} も 、 {変|か}わる かも しれない 。 || A new road-name glows on the Lantern Hall's lanterns. Whoever waits at the end of the road may be different next time.
?(var.atlas_unlock=2) narr: {道|みち} の {上|うえ} の {者|もの} たち が 、 {組|く}み{合|あ}わさって {現|あらわ}れる よう に なった らしい 。 || The things on the roads have begun to turn up in new combinations.
?(var.atlas_unlock=3) narr: これ から は 、 {道|みち} の {条件|じょうけん} を {二|ふた}つ {重|かさ}ねて {歩|ある}く こと も できる 。 || From now on you can walk a road with two conditions at once.
?(var.atlas_kind=1&comp=nao) comp: {配達|はいたつ} {完了|かんりょう} 。 …… {悪|わる}くない {一日|いちにち} だった 。 || Delivered. …Not a bad day.
?(var.atlas_kind=1&comp=mio) comp[smile]: お{茶|ちゃ} 、 {淹|い}れる ね 。 {今日|きょう} は {砂糖|さとう} も {入|い}れよう 。 || I'll make tea. Sugar in it today.
?(var.atlas_kind=1&comp=ren) comp: {地図|ちず} に {道|みち} を {一本|いっぽん} {書|か}き{足|た}しました 。 {方角|ほうがく} は 、 {後|あと} で {確|たし}かめて ください 。 || I've added a road to the map. Please check the directions later.
?(var.atlas_kind=1&comp=suzu) comp[laugh]: {本日|ほんじつ} の {公演|こうえん} 、 これ に て {終幕|しゅうまく} ！ || And that concludes today's performance!
?(var.atlas_kind=2&comp) comp: {引|ひ}き{返|かえ}す {勇気|ゆうき} も 、 {大事|だいじ} だ よ 。 || It takes nerve to turn back, too.

@scene atlas.banter.nao1
comp: {地図|ちず} に ない {道|みち} を {歩|ある}く の は 、 {配達人|はいたつにん} の {夢|ゆめ} だ 。 …… {悪夢|あくむ} かも しれない けど 。 || Walking roads that aren't on any map is a courier's dream. …Or nightmare.

@scene atlas.banter.nao2
comp: この {紙|かみ} の {地面|じめん} 、 {踏|ふ}む と {少|すこ}し {音|おと} が する 。 {聞|き}こえる か ？ || This paper ground makes a little sound when you step on it. Hear it?

@scene atlas.banter.mio1
comp: {迷子|まいご} の {名前|なまえ} って 、 {怪我|けが} を して いる わけ じゃ ない のに 、 {放|ほう}って おけない の よ ね 。 || Lost names aren't hurt, and still I can't leave them be.

@scene atlas.banter.mio2
comp: {白|しろ}い {所|ところ} を {見|み}る と 、 ラベル を {書|か}きたく なる の 。 {職業病|しょくぎょうびょう} ね 。 || Whenever I see a blank space, I want to write a label on it. Occupational hazard.

@scene atlas.banter.ren1
comp: {地図|ちず} に {載|の}って いない なら 、 {私|わたし} が {迷|まよ}って も {仕方|しかた} ない です よ ね 。 …… {冗談|じょうだん} です 。 || If it isn't on the map, it's only natural that I get lost. …That was a joke.

@scene atlas.banter.ren2
comp: {灯|ひ} を {近|ちか}づける と 、 {紙|かみ} の {下|した} に {薄|うす}い {線|せん} が {見|み}えます 。 {誰|だれ}か が {下書|したが}き を した よう です 。 || Hold the lamp close and you can see faint lines under the paper. Someone sketched this first.

@scene atlas.banter.suzu1
comp: {台本|だいほん} の ない {舞台|ぶたい} は {久|ひさ}しぶり 。 {即興|そっきょう} は {得意|とくい} な の 。 || A stage with no script — it's been a while. I'm good at improvising.

@scene atlas.banter.suzu2
comp: {今日|きょう} の {旅費|りょひ} 、 {今|いま} の ところ ゼロ 。 {素晴|すば}らしい {帳簿|ちょうぼ} だ わ 。 || Travel costs so far today: zero. A beautiful ledger.
`, 'atlas/scenes');

for (const c of ['nao', 'mio', 'ren', 'suzu']) for (const i of [1, 2]) RB.content.banter.push({ comp: c, map: 'atlas.*', scene: 'atlas.banter.' + c + i });
