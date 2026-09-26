/* Chapter 3 residents (part 1): the square and its props — Sayo, Kotarō,
 * Gorō, Tamotsu, Heita — plus the clue props and the bell side quest. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene co.sayo
!if quest.co_count=0 -> count
:main
!if co_kiln_done -> kiln
!if co_chronicle_read -> mid
!if seen.co.sayo_seats -> short
!call co.sayo_seats
!end
:short
co_sayo: {灯籠|とうろう} は {三十|さんじゅう} 、 {席|せき} は {五十二|ごじゅうに} ！ …… {五十二|ごじゅうに} ？ {家|いえ} は {四十七軒|よんじゅうななけん} なのに 。 {毎年|まいとし} {不思議|ふしぎ} なの よ ね 、 これ 。 || Thirty lanterns, fifty-two seats! …Fifty-two? There are only forty-seven households. It puzzles me every year.
!end
:mid
?(comp!=suzu) co_sayo: {旅芸人|たびげいにん} の {方|かた} から {手紙|てがみ} が {来|き}て 、 {舞台|ぶたい} に {一枠|ひとわく} {入|い}れた ん です 。 {外|そと} の {芸人|げいにん} さん なんて 、 {何年|なんねん} ぶり かしら 。 || A travelling performer wrote asking for a slot, so I gave her one. When did we last have an outside act?
?(comp=suzu) co_sayo: {芸人|げいにん} さん が いる なら 、 {舞台|ぶたい} に {出|で}て ほしい わ 。 …… {断|ことわ}られちゃった けど 。 「 {今年|ことし} は {客席|きゃくせき} で 」 って 。 || If there's a performer here, I'd love her on stage. …She turned me down, though. "This year I'll sit in the audience," she said.
co_sayo: {雨|あめ} が {降|ふ}らない の だけ が {心配|しんぱい} 。 {灯籠|とうろう} の {火|ひ} を {扱|あつか}う から 、 タモツ さん が うるさく って 。 || The only worry is the lack of rain. We handle so much lantern fire that Tamotsu fusses no end.
!end
:kiln
co_sayo[worry]: トキワ さん が 、 {夕方|ゆうがた} に {皆|みな} を {広場|ひろば} に {集|あつ}める って 。 {祭|まつ}り の {前|まえ} に ？ {何|なに} か あった の かしら …… || Tokiwa says he's calling everyone to the square at dusk. Before the festival? Has something happened…?
!end
:count
co_sayo[surprise]: {三十本|さんじゅっぽん} の とっくり ？ {頼|たの}んで ない わ よ ！ {私|わたし} が {頼|たの}んだ の は {小皿|こざら} 。 {甘|あま}い もの を {配|くば}る ため の 。 || Thirty sake flasks? I never ordered those! I ordered small plates — for handing out sweets.
co_sayo: {忙|いそが}しくて 、 コタロウ に {伝言|でんごん} を {頼|たの}んだ の 。 {紙|かみ} に は 「 {三十|さんじゅう} 」 と しか {書|か}かなかった かも …… あら 。 || I was busy, so I asked Kotarō to take the message. I might have written only "thirty" on the slip… oh dear.
co_sayo: コタロウ に {聞|き}いて みて 。 {何|なん} て {言|い}った の か 。 || Ask Kotarō what he actually said.
!quest co_count 1
!goto main

@scene co.sayo_seats
co_sayo: {今|いま} 、 {席|せき} を {並|なら}べて る ところ なん です 。 {家|いえ} ごと に {一|ひと}つ ずつ 。 {席|せき} {表|ひょう} の とおり に 。 || I'm laying out the seats right now. One per household, according to the seating chart.
co_sayo: ガラス {職人|しょくにん} の {卓|たく} の {端|はし} の {席|せき} は 、 {空|あ}けて おく の 。 ヒロ さん の {頼|たの}み で ね 。 {毎年|まいとし} 。 || The seat at the end of the glassmakers' table stays empty. Hiro asks for it every year.
pc: {誰|だれ} の {席|せき} なん です か 。 || Whose seat is it?
co_sayo[think]: さあ …… {聞|き}いた こと が ない わ 。 {聞|き}いちゃ いけない よう な {気|き} が して 。 {変|へん} よ ね 。 || Hmm… I've never asked. It always felt like something I shouldn't. Strange, isn't it.
?(comp=suzu) comp[closed]: …… || …

@scene co.sayo_after
co_sayo[smile]: {席|せき} は {五十二|ごじゅうに} の まま に した の 。 {空|あ}いて いた {五|いつ}つ に は 、 {今年|ことし} から {名前|なまえ} が ある 。 || I kept the seats at fifty-two. The five that were always empty have names now.
co_sayo: {泣|な}いた {次|つぎ} の {日|ひ} の {祭|まつ}り が 、 {今|いま} まで で {一番|いちばん} {賑|にぎ}やか だった の 。 {不思議|ふしぎ} ね 。 || The festival after all that crying was the liveliest we've ever had. Funny, isn't it.
?(co_count_done) co_sayo: それ と 、 ノブ さん の とっくり ！ {草刈|くさか}り {組|ぐみ} の {水筒|すいとう} に なった の よ 。 {無駄|むだ} に は しない って 、 {約束|やくそく} した でしょ ？ || And Nobu's flasks! They became water bottles for the grass-cutting crew. I promised not to waste them, didn't I?

@scene co.sayo_post
co_sayo[smile]: {今年|ことし} の {祭|まつ}り の {最初|さいしょ} の {行事|ぎょうじ} は 、 {火除|ひよ}け{道|みち} の {草刈|くさか}り に なった の 。 {皆|みな} で {刈|か}って 、 {皆|みな} で {食|た}べる 。 || The first event of this year's festival is cutting the firebreaks. Everyone cuts, then everyone eats.
?(end_archive_library) co_sayo: {山|やま} の {上|うえ} の {新|あたら}しい {書庫|しょこ} から 、 {祭|まつ}り の {記録|きろく} を {写|うつ}させて ほしい って {手紙|てがみ} が {来|き}た わ 。 {全部|ぜんぶ} 、 {火事|かじ} の {年|とし} も ね 。 || The new library up in the mountains wrote asking to copy our festival records. All of them — the fire year too.
?(end_archive_closed) co_sayo: {山|やま} の {書庫|しょこ} は {閉|と}じた そう ね 。 {記録|きろく} は {自分|じぶん} たち で {守|まも}る わ 。 {手間|てま} は かかる けど 。 || I hear the archive in the mountains is closed. We'll keep our own records. More work, but ours.

@scene co.kotaro
!if quest.co_count=1 -> count
!if co_bell_rung -> rung
!if co_chronicle_read -> mid
co_kotaro: ねえ ねえ 、 {旅|たび} の {人|ひと} ！ {祭|まつ}り {見|み}に {来|き}た の ？ {甘酒|あまざけ} は ね 、 {子|こ}ども は {一杯|いっぱい} まで なんだ よ 。 ずるい よ ね 。 || Hey, hey, travellers! You here for the festival? Kids only get one cup of amazake. Not fair, right?
co_kotaro: あと ね 、 あの {端|はし} の {椅子|いす} 、 {誰|だれ} も {座|すわ}っちゃ いけない んだ って 。 {座|すわ}ったら どう なる の かな 。 {呪|のろ}われる の かな 。 || And that chair on the end — nobody's allowed to sit in it. What happens if you do? Do you get cursed?
?(comp=nao) comp: {呪|のろ}われ は しない よ 。 {怒|おこ}られる だけ だ 。 たぶん 。 || You won't get cursed. Just told off. Probably.
?(comp=mio) comp[smile]: {誰|だれ} か の {大切|たいせつ} な {席|せき} なん だ と {思|おも}う よ 。 {座|すわ}らない で おこう ね 。 || I think it's someone's precious seat. Let's not sit there, all right?
?(comp=ren) comp: {呪|のろ}い は {信|しん}じて いません 。 {約束|やくそく} は {信|しん}じて います 。 あの {席|せき} は 、 {約束|やくそく} の {方|ほう} です 。 || I don't believe in curses. I believe in promises. That seat is the promise kind.
?(comp=suzu) comp[laugh]: {呪|のろ}われる わ よ 。 {一生|いっしょう} 、 {甘酒|あまざけ} が {一杯|いっぱい} まで に なる {呪|のろ}い 。 || Oh, you'd be cursed. Cursed to one cup of amazake for the rest of your life.
!end
:mid
co_kotaro: ゴロウ じいちゃん の {鐘|かね} 、 {鳴|な}った の {聞|き}いた こと ない んだ 。 {毎朝|まいあさ} ぴかぴか に して る のに 。 || I've never heard Grandpa Gorō's bell ring. He polishes it every morning, though.
!end
:rung
co_kotaro[worry]: …… {鐘|かね} 、 {鳴|な}らした の {僕|ぼく} だ よ 。 みんな {走|はし}って った 。 {怖|こわ}い {顔|かお} で 。 {僕|ぼく} 、 {悪|わる}い こと した ？ || …I'm the one who rang the bell. Everyone ran. With scary faces. Did I do something bad?
pc: {悪|わる}く ない よ 。 {鐘|かね} は 、 {鳴|な}らす ため に ある ん だ 。 || You didn't. A bell's there to be rung.
co_kotaro: …… うん 。 じいちゃん も そう {言|い}った 。 || …Okay. Grandpa said that too.
!end
:count
co_kotaro: サヨ さん の {伝言|でんごん} ？ うん 、 {僕|ぼく} が ノブ さん に {言|い}った よ 。 「 さんじゅう …… 」 {何|なん} だっけ 。 || Sayo's message? Yeah, I told Nobu. "Thirty…" thirty what, again?
co_kotaro: サヨ さん は 「 さんじゅう まい 」 って {言|い}った 気 が する 。 でも ノブ さん の とこ の とっくり 、 かっこいい じゃん 。 だから 「 さんじゅっぽん ！ 」 って 。 || I think Sayo said "thirty flat ones". But Nobu's sake flasks are cool, right? So I said "thirty long ones!"
?(comp=nao) comp[smirk]: {伝言|でんごん} の {途中|とちゅう} で {中身|なかみ} を {変|か}える な 。 {配達人|はいたつにん} の {一番|いちばん} {大事|だいじ} な {決|き}まり だ ぞ 。 || Never change the contents of a message on the way. Rule number one for couriers.
?(comp=mio) comp[smile]: {好|す}きな もの を {頼|たの}んじゃった の ね 。 {正直|しょうじき} で よろしい 。 {謝|あやま}りに {行|い}こう か 。 || You ordered what you liked. Very honest. Shall we go and apologise?
?(comp=ren) comp: {助数詞|じょすうし} 一つ で 、 {皿|さら} が {徳利|とっくり} に なる 。 {言葉|ことば} は {恐|おそ}ろしい 。 {美|うつく}しい 。 || One counter word, and plates become flasks. Language is terrifying. And beautiful.
?(comp=suzu) comp[laugh]: {台本|だいほん} を {書|か}き{換|か}える {役者|やくしゃ} ね 。 {気持|きも}ち は 分かる けど 、 {座長|ざちょう} に {怒|おこ}られる やつ よ 。 || An actor rewriting the script mid-show. I understand the urge, but the director will have your head.
co_kotaro[worry]: …… ノブ さん 、 {怒|おこ}って る ？ || …Is Nobu angry?
pc: {正|ただ}しい {注文書|ちゅうもんしょ} を {書|か}けば 、 {大丈夫|だいじょうぶ} だ よ 。 || If we write a proper order slip, it'll be fine.
!quest co_count 2

@scene co.kotaro_after
co_kotaro: {今年|ことし} の {祭|まつ}り で ね 、 ヒロ さん が {僕|ぼく} に ガラス の {吹|ふ}き{方|かた} {教|おし}えて くれる って ！ {火|ひ} の {扱|あつか}い の {決|き}まり を {覚|おぼ}えて から だ けど 。 || At the festival, Hiro said he'll teach me glassblowing! After I learn the fire rules, though.
co_kotaro: {決|き}まり {一|いち} 。 {風|かぜ} の {強|つよ}い {日|ひ} は 、 {窓|まど} を {開|あ}けない 。 もう {覚|おぼ}えた ！ || Rule one: on windy days, don't open the vents. I know it already!

@scene co.kotaro_post
co_kotaro: {僕|ぼく} ね 、 {櫓|やぐら} の {鐘|かね} の {当番|とうばん} に なった んだ 。 {夕方|ゆうがた} に {一回|いっかい} だけ 。 {一回|いっかい} だけ だ よ 。 {分|わ}かって る 。 || I'm on bell duty at the lookout now. Once, at dusk. Only once. I know.
?(end_mem_return) co_kotaro: {大人|おとな} は みんな 、 {急|きゅう}に {昔|むかし} の {話|はなし} を {始|はじ}めた んだ 。 {長|なが}い けど 、 {結構|けっこう} {面白|おもしろ}い 。 || All the grown-ups suddenly started telling old stories. They're long, but kind of fun.
?(end_mem_choose) co_kotaro: ウメ ばあちゃん は 、 {山|やま} に {行|い}って {何|なに} か {取|と}って きた んだ って 。 {何|なに} を ？ って {聞|き}いたら 、 「 {内緒|ないしょ} 」 だって 。 || Grandma Ume went up the mountain and fetched something back, she says. When I asked what, she said "secret".

@scene co.goro
!if co_restored -> restored
!if quest.co_bell=1 -> rope
!if co_chronicle_read&!co_hist_goro -> hist
!if quest.co_bell=active -> waiting
!if seen.co.goro_first -> idle
!call co.goro_first
!end
:idle
co_goro: {鐘|かね} は な 、 {磨|みが}いて おかん と {音|おと} が {曇|くも}る 。 {鳴|な}らさん {鐘|かね} でも な 。 || A bell has to be polished or its voice clouds over. Even a bell nobody rings.
!end
:waiting
co_goro: {綱|つな} なら 、 タモツ が {水門|すいもん} {用|よう} の を {持|も}って おる はず だ 。 {頼|たの}んで みて くれ 。 || Tamotsu ought to have spare rope for the water gates. Ask him for me.
!end
:hist
co_goro: わし の {若|わか}い {頃|ころ} の {話|はなし} ？ …… そう だ な 。 {変|へん} な こと を {一|ひと}つ {覚|おぼ}えて おる 。 || Tales from when I was young? …Well. There's one odd thing I remember.
co_goro: {朝|あさ} に なったら 、 {鐘|かね} の {綱|つな} が なくなって おった 。 {焼|や}け{落|お}ちた みたい に な 。 || By morning, the bell rope was gone. As if it had burned away.
co_goro: …… なぜ {焼|や}けた ん だ ？ ああ 、 そう だ 。 {夜|よる} 、 {櫓|やぐら} で {番|ばん} を して おった ん だ 。 || …Why would it burn? Ah — that's right. I was on watch up the lookout, that night.
co_goro: {下|した} で は 、 {提灯|ちょうちん} が {桶|おけ} を {提|さ}げて 、 {水路|すいろ} へ {走|はし}って いった 。 || Below, lanterns went running to the channel carrying buckets.
co_goro: {上|うえ} の {段|だん} に {赤|あか}い {光|ひかり} が {見|み}えた ん だ 。 だから {鳴|な}らした 。 {腕|うで} が {上|あ}がらん よう に なる まで 。 || I saw a red light on the upper terraces. So I rang. Until I couldn't lift my arms.
co_goro: …… わし は {何|なに} を {言|い}って おる ん だ 。 {順番|じゅんばん} も {分|わ}からん 。 {並|なら}べ{直|なお}して くれる か 。 || …What am I saying. I can't even get it in order. Would you straighten it out for me?
!activity co.a_hist_goro
!if var._res=0 -> later
co_goro: …… そう だ 。 そう いう {順番|じゅんばん} だった 。 {夜番|よばん} 、 {赤|あか}い {光|ひかり} 、 {鐘|かね} 、 {提灯|ちょうちん} 、 {朝|あさ} 。 || …Yes. That was the order. Night watch, red light, bell, lanterns, morning.
co_goro[sad]: {腕|うで} が {覚|おぼ}えて おる の に 、 {頭|あたま} が {知|し}らん と {言|い}う 。 {年|とし} を {取|と}る と は 、 こう いう こと か の う 。 || My arms remember, and my head says it doesn't know. Is this what getting old is?
?(comp=nao) comp: {年|とし} の せい じゃ ない よ 。 {誰|だれ} か が 、 {途中|とちゅう} で {抜|ぬ}き{取|と}った ん だ 。 || It's not your age. Somebody took it out along the way.
?(comp=mio) comp: {体|からだ} の {記憶|きおく} は 、 {頭|あたま} より {正直|しょうじき} な こと が あります 。 || The body's memory is sometimes more honest than the head's.
?(comp=ren) comp: {鐘|かね} を {鳴|な}らした {腕|うで} は 、 {嘘|うそ} を {覚|おぼ}えません 。 || Arms that rang a bell don't remember lies.
?(comp=suzu) comp[closed]: …… {聞|き}こえた わ 。 {下|した} まで 。 {一晩中|ひとばんじゅう} 。 || …I heard it. All the way down. All night.
!set co_hist_goro
!call co.hist_check
!end
:later
co_goro: …… まあ 、 {急|いそ}ぐ {話|はなし} でも ない 。 また {来|き}て くれ 。 || …Well, it's not urgent. Come back any time.
!end
:rope
!if !item.co_rope -> waiting
!call co.bell_ring
!end
:restored
co_goro: {綱|つな} が {下|さ}がった 。 {腕|うで} が {楽|らく} に なった よ 。 {不思議|ふしぎ} な もん だ 。 || The rope's up. My arms feel lighter. Funny thing.
?(quest.co_bell=active) co_goro: {綱|つな} は 、 {結局|けっきょく} タモツ が {持|も}って きた 。 だが {最初|さいしょ} に {頼|たの}まれて くれた の は あんた だ 。 ありがとう よ 。 || In the end Tamotsu brought the rope himself. But you were the first to take my asking seriously. Thank you.
?(quest.co_bell=active) !quest co_bell done
?(item.co_rope) !take co_rope

@scene co.goro_first
co_goro: おう 、 {旅|たび} の {人|ひと} か 。 {櫓|やぐら} の {番|ばん} を して おる 、 ゴロウ だ 。 …… {番|ばん} と {言|い}って も 、 {鐘|かね} を {磨|みが}く だけ だ が な 。 || Ah, travellers. I'm Gorō, keeper of the lookout. …Though "keeping" it means polishing the bell and nothing more.
co_goro: この {鐘|かね} に は 、 {綱|つな} が ない 。 {昔|むかし} から ない 。 …… いや 、 {昔|むかし} は あった か の う 。 {覚|おぼ}えて おらん 。 || This bell has no rope. Never has. …Or did it, once? I don't remember.
co_goro: {鳴|な}らさん {鐘|かね} なら 、 {綱|つな} も {要|い}らん と {皆|みな} {言|い}う 。 だが わし は 、 {綱|つな} の ない {鐘|かね} を {見|み}て おる と 、 {手|て} が むずむず する ん だ 。 || Folk say a bell nobody rings doesn't need a rope. But looking at a bell with no rope makes my hands itch.
co_goro: {旅|たび} の {人|ひと} 、 {一|ひと}つ {頼|たの}まれて くれん か 。 {丈夫|じょうぶ} な {綱|つな} を 、 {一本|いっぽん} {探|さが}して きて ほしい 。 || Traveller, would you do me a favour? Find me one good strong rope.
!choice
* {探|さが}して きます 。 || I'll find one. -> yes
* {今|いま} は ちょっと 。 || Not right now. -> no
:yes
co_goro: ありがたい 。 {水門|すいもん} の {綱|つな} なら 、 タモツ が {持|も}って おる はず だ 。 || Much obliged. Tamotsu keeps rope for the water gates.
!quest co_bell 0
!end
:no
co_goro: そう か 。 {気|き} が {向|む}いたら で いい 。 {鐘|かね} は {逃|に}げん 。 || No matter. Whenever you like. The bell won't run off.

@scene co.bell_ring
co_goro: おお 、 {綱|つな} か ！ …… {待|ま}って いた よう な {気|き} が する 。 {変|へん} だ な 。 || Oh — a rope! …It feels like I've been waiting for this. Odd.
!take co_rope
narr: ゴロウ は {梯子|はしご} を {登|のぼ}り 、 {慣|な}れた {手|て} つき で {綱|つな} を {結|むす}んだ 。 || Gorō climbs the ladder and ties the rope with practised hands.
co_goro: {手|て} が {結|むす}び{方|かた} を {知|し}って おる 。 {教|おそ}わった {覚|おぼ}え は ない のに 。 || My hands know the knot. I don't remember ever learning it.
co_kotaro: ねえ 、 {鳴|な}らして いい ？ {鳴|な}らして いい ？ || Can I ring it? Can I ring it?
co_goro: {一回|いっかい} だけ だ ぞ 。 || Just once, mind.
!sfx bell
narr: コタロウ が {綱|つな} を {引|ひ}いた 。 {一回|いっかい} 、 {二回|にかい} …… {調子|ちょうし} に {乗|の}って 、 {速|はや}く 、 {何度|なんど} も 。 || Kotarō pulls the rope. Once, twice… getting into it — faster, over and over.
!shake
narr: その {瞬間|しゅんかん} 、 {広場|ひろば} の {空気|くうき} が {変|か}わった 。 || In that instant, the air in the square changes.
narr: {梯子|はしご} の {上|うえ} の {人|ひと} が {飛|と}び{降|お}り 、 {誰|だれ} か が {桶|おけ} を {掴|つか}み 、 {皆|みな} が {一斉|いっせい} に {水路|すいろ} へ {走|はし}り{出|だ}した 。 {誰|だれ} も {何|なに} も {言|い}わず に 。 || People jump down off ladders; someone snatches up a bucket; everyone runs for the channel at once, without a word.
narr: {水路|すいろ} の {縁|ふち} で 、 {皆|みな} が {立|た}ち{止|ど}まった 。 {桶|おけ} を {持|も}った まま 、 {何|なに} を しに {来|き}た の か 、 {誰|だれ} も {分|わ}からない 。 || At the channel's edge, everyone stops. Buckets in hand, nobody knows what they came to do.
co_sayo[surprise]: …… {私|わたし} 、 {今|いま} 、 {何|なに} を …… ？ || …What was I… just doing?
co_tokiwa[angry]: {誰|だれ} が {鳴|な}らした の です か ！ {綱|つな} を {外|はず}して ください 。 {今|いま} すぐ に ！ || Who rang that?! Take that rope down. At once!
co_goro: {外|はず}さん よ 。 {鐘|かね} は {鳴|な}らす ため に ある 。 {高|たか}い ところ に {結|ゆ}わえて おく 。 {子|こ}ども の {手|て} の {届|とど}かん ところ に な 。 || I won't. A bell's for ringing. I'll tie it up high, out of children's reach.
narr: トキワ は {何|なに} か {言|い}い かけて 、 {黙|だま}って {記録堂|きろくどう} へ {戻|もど}って いった 。 {顔|かお} が {青|あお}かった 。 || Tokiwa starts to say something, then walks back to the Chronicle Hall without a word. His face is white.
?(comp=nao) comp: {見|み}た か 。 {全員|ぜんいん} 、 {迷|まよ}わず {水路|すいろ} に {走|はし}った 。 {逃|に}げ{道|みち} を {体|からだ} が {覚|おぼ}えて る 。 || Did you see? Every one of them ran straight for the channel. Their bodies know the escape route.
?(comp=mio) comp[worry]: {皆|みな} さん 、 {息|いき} が {上|あ}がって いる 。 {怖|こわ}かった ん です 。 {理由|りゆう} も {分|わ}からない まま …… || They're all out of breath. They were frightened — without knowing why…
?(comp=ren) comp: {鐘|かね} の {音|おと} は 、 {名|な} より {深|ふか}い ところ に {残|のこ}って いた 。 {静寂|しじま} も 、 そこ まで は {届|とど}かなかった 。 || The sound of the bell was kept somewhere deeper than names. Even the Hush couldn't reach that far.
?(comp=suzu) comp[closed]: …… {同|おな}じ {顔|かお} だった 。 あの {夜|よる} と 。 || …The same faces. Just like that night.
co_goro: ……ありがとう よ 、 {旅|たび} の {人|ひと} 。 {腕|うで} が 、 {少|すこ}し {軽|かる}く なった 。 || …Thank you, traveller. My arms feel a little lighter.
!set co_bell_done co_bell_rung
!quest co_bell done

@scene co.goro_after
co_goro: {夕方|ゆうがた} に {一回|いっかい} 、 {鐘|かね} を {鳴|な}らす こと に なった 。 {火|ひ} の {用心|ようじん} の {合図|あいず} だ 。 {鳴|な}らす の は わし で は のう て 、 コタロウ だ が な 。 || We ring the bell once at dusk now — the signal to mind your fires. It's Kotarō who rings it, not me.
co_goro[smile]: ミツ …… わし の {女房|にょうぼう} の {名前|なまえ} だ 。 {二十年|にじゅうねん} {言|い}って なかった 。 {今|いま} は {毎日|まいにち} {言|い}う 。 {鐘|かね} を {磨|みが}き ながら な 。 || Mitsu… my wife's name. I didn't say it for twenty years. Now I say it every day, polishing the bell.

@scene co.goro_post
co_goro: {鐘|かね} の {音|おと} が {遠|とお}く まで {届|とど}く よう に なった 。 {空気|くうき} が {澄|す}んだ ん だ ろう 。 || The bell carries further these days. The air's cleared, I suppose.
?(end_mem_return) co_goro: {山|やま} から {皆|みな} の {記憶|きおく} が {戻|もど}った {日|ひ} 、 わし は {一日中|いちにちじゅう} {鐘|かね} の {下|した} に {座|すわ}って おった 。 {鳴|な}らさず に な 。 || The day everyone's memories came back from the mountain, I sat under the bell all day. Didn't ring it once.
?(end_mem_choose) co_goro: {返|かえ}して もらう か どう か 、 {自分|じぶん} で {選|えら}べ と {言|い}われた 。 わし は もう {全部|ぜんぶ} {持|も}って おる 。 {行|い}く {必要|ひつよう} は なかった よ 。 || They said we could each choose whether to take ours back. I've already got all of mine. No need to go.
?(end_kasane_trial) co_goro: {書庫|しょこ} の {番人|ばんにん} が 、 {灯落|ひおち} で {皆|みな} の {前|まえ} に {立|た}った そう だ な 。 わし も {一言|ひとこと} {言|い}って やりたかった 。 …… {礼|れい} か {文句|もんく} か 、 {決|き}めかねて おる が 。 || I hear the archive's keeper stood before everyone down in Lanternfall. I'd have liked a word myself. …Whether thanks or a scolding, I can't decide.
?(end_kasane_keeper) co_goro: {書庫|しょこ} の {番人|ばんにん} は 、 {山|やま} に {残|のこ}った ん だ ろう 。 {見張|みは}られ ながら 。 {櫓|やぐら} の {番|ばん} と {同|おな}じ で 、 {寂|さび}しい {仕事|しごと} だ 。 || The archive's keeper stayed up the mountain, under watch. A lonely job, like minding a lookout.

@scene co.tamotsu
!if quest.co_bell=0 -> rope
!if co_records_done&!co_upper_open -> gate
!if co_chronicle_read -> mid
co_tamotsu: {水番|みずばん} の タモツ だ 。 …… {水路|すいろ} を {見|み}て みろ 。 {三分|さんぶ} の {一|いち} しか ない 。 {雨|あめ} が {四十日|よんじゅうにち} {降|ふ}って ない 。 || I'm Tamotsu, the channel keeper. …Look at the channel. A third full. No rain in forty days.
co_tamotsu: {変|へん} な {水路|すいろ} だ と {思|おも}わない か 。 {田畑|たはた} に {水|みず} を {引|ひ}く だけ なら 、 この {半分|はんぶん} の {幅|はば} で {足|た}りる 。 {誰|だれ} が 、 {何|なん} の ため に こんな {幅|はば} に した ん だ か 。 || Strange channel, don't you think? For watering fields, half this width would do. Who made it this wide, and why?
!end
:mid
co_tamotsu: {祭|まつ}り の {灯籠|とうろう} は {三十|さんじゅう} 。 {火|ひ} を {入|い}れる {夜|よる} は 、 {俺|おれ} が {水路|すいろ} の {横|よこ} で {見張|みは}る 。 {理由|りゆう} は {知|し}らん 。 {親父|おやじ} も そう して た 。 || Thirty lanterns at the festival. The night they're lit, I stand watch by the channel. Don't know why. My father did the same.
!end
:gate
co_tamotsu: {柵|さく} の {鍵|かぎ} を {持|も}って 、 {段々畑|だんだんばたけ} の {上|うえ} の {水門|すいもん} で {待|ま}って る 。 {来|き}い 。 || I've got the fence key. I'll be at the water gate, top of the terraces. Come on.
!end
:rope
co_tamotsu: {綱|つな} ？ {鐘|かね} に ？ …… ゴロウ の じいさん か 。 || A rope? For the bell? …Old Gorō, is it.
co_tamotsu: {水門|すいもん} {用|よう} の {予備|よび} が ある 。 {麻|あさ} だ 。 {丈夫|じょうぶ} だ ぞ 。 {持|も}って け 。 || I've a spare for the water gates. Hemp. It's strong. Take it.
!give co_rope
co_tamotsu: {俺|おれ} も 、 {綱|つな} の ない {鐘|かね} は {落|お}ち{着|つ}かん と {思|おも}って た 。 {誰|だれ} に も {言|い}わなかった が な 。 || I never liked the look of a bell with no rope either. Never told anyone.
!quest co_bell 1

@scene co.tamotsu_after
co_tamotsu: {火除|ひよ}け{道|みち} は {年|ねん} に {二度|にど} {刈|か}る こと に した 。 {秋|あき} と {春|はる} 。 {文句|もんく} を {言|い}う {奴|やつ} は 、 もう いない 。 || We cut the firebreaks twice a year now, autumn and spring. Nobody complains any more.
co_tamotsu: {水路|すいろ} が {広|ひろ}い {理由|りゆう} も {分|わ}かった 。 {逃|に}げ{道|みち} だった ん だ な 。 {先祖|せんぞ} は {賢|かしこ}い 。 || And now I know why the channel's so wide. It was an escape route. Our ancestors were no fools.

@scene co.tamotsu_post
co_tamotsu: {雨|あめ} が {戻|もど}った 。 {水路|すいろ} は {縁|ふち} まで {満|み}ちて る 。 …… それ でも {火除|ひよ}け{道|みち} は {刈|か}る 。 {決|き}まり だ から な 。 || The rain came back. The channel's full to the brim. …We still cut the firebreaks. It's the rule.
?(end_archive_closed) co_tamotsu: {山|やま} の {書庫|しょこ} が {閉|と}じた って ？ なら {記録|きろく} は {石|いし} に {刻|きざ}む 。 {水門|すいもん} の {横|よこ} に 、 {火事|かじ} の {年|とし} を {彫|ほ}った 。 || The mountain archive's closed? Then we carve our records in stone. I cut the year of the fire into the stone by the water gate.
?(end_archive_library) co_tamotsu: {書庫|しょこ} に {水路|すいろ} の {図|ず} を {送|おく}った 。 {他|ほか} の {里|さと} の {役|やく} に {立|た}つ なら な 。 || I sent the archive a plan of the channel. If it helps some other village.

@scene co.tamotsu_shed
narr: タモツ の {道具|どうぐ} {箱|ばこ} 。 {予備|よび} の {綱|つな} 、 {板|いた} 、 {泥|どろ} だらけ の {鋤|すき} 。 {勝手|かって} に {持|も}って いく の は やめて おこう 。 || Tamotsu's tool crate: spare rope, boards, a muddy spade. Better not take anything without asking.

@scene co.heita
!if co_chronicle_read -> mid
co_heita: …… ん ？ あ 、 {寝|ね}て ません よ 。 {目|め} を {閉|と}じて {考|かんが}えて た だけ っす 。 || …Hm? Oh, I wasn't asleep. Just thinking with my eyes shut.
co_heita: {祭|まつ}り の {敷物|しきもの} {用|よう} に 、 {草|くさ} を {刈|か}る {係|かかり} なん っす 。 でも {暑|あつ}い でしょ 。 {草|くさ} も {逃|に}げない し 。 || I'm on grass duty — for the festival mats. But it's hot, isn't it. And the grass isn't going anywhere.
co_heita: この {草|くさ} の {帯|おび} ？ {昔|むかし} から ずっと {草|くさ}ぼうぼう っす よ 。 {刈|か}る {理由|りゆう} も ない し 。 …… ない っす よ ね ？ || This strip of grass? It's always been overgrown. There's no reason to cut it. …There isn't, right?
?(comp=nao) comp: {理由|りゆう} が あったら 、 {刈|か}る の か ？ || If there were a reason, would you cut it?
?(comp=nao) co_heita: …… {理由|りゆう} 次第 っす ね 。 {俺|おれ} 、 {理由|りゆう} が ある と {働|はたら}く {男|おとこ} なん で 。 || …Depends on the reason. I'm a man who works when there's a reason.
?(comp=mio) comp[smile]: {日射病|にっしゃびょう} に なります よ 。 せめて {日陰|ひかげ} で {考|かんが}えて ください 。 || You'll get sunstroke. At least do your thinking in the shade.
?(comp=ren) comp: {草|くさ} の {帯|おび} に も 、 {名|な} が あった はず です 。 {道|みち} の {形|かたち} を して います から 。 || That strip must have had a name once. It's shaped like a road.
?(comp=suzu) comp[laugh]: {目|め} を {閉|と}じて {考|かんが}える の 、 {私|わたし} も {得意|とくい} よ 。 {客席|きゃくせき} で よく やる わ 。 || I'm good at thinking with my eyes shut too. I do it in audiences all the time.
!end
:mid
co_heita: {旅|たび} の {人|ひと} 、 {記録堂|きろくどう} で {何|なに} か {調|しら}べて る って ？ {真面目|まじめ} っす ねえ 。 …… {俺|おれ} も 、 {何|なに} か {思|おも}い{出|だ}せそう で {思|おも}い{出|だ}せない こと 、 ある ん っす よ 。 {親父|おやじ} の {顔|かお} と か 。 || Travellers researching in the Chronicle Hall? Serious types. …There's stuff I nearly remember too, you know. My dad's face, for one.

@scene co.heita_after
co_heita: {聞|き}きました ？ {草刈|くさか}り 、 {俺|おれ} が {先頭|せんとう} だった ん っす よ 。 {理由|りゆう} が あれば {働|はたら}く {男|おとこ} なん で 。 || Did you hear? I led the grass-cutting. I'm a man who works when there's a reason.
co_heita[sad]: {親父|おやじ} …… ハチロウ って いう ん っす 。 {工房|こうぼう} {通|どお}り の {灯|ひ} を {守|まも}って た らしい 。 {俺|おれ} 、 {似|に}て ない っす よ 。 {働|はたら}き{者|もの} だった みたい で 。 || My dad… his name was Hachirō. He tended the lanterns on the workshop row, I hear. I don't take after him. He was a hard worker, apparently.
?(comp=mio) comp[smile]: {今朝|けさ} の ヘイタ さん は 、 {誰|だれ} より {働|はたら}いて いました よ 。 || This morning you worked harder than anyone.

@scene co.heita_post
co_heita: {草刈|くさか}り {組|ぐみ} の {頭|かしら} に なっちゃい ました 。 {昼寝|ひるね} の {時間|じかん} が {減|へ}った っす 。 …… {後悔|こうかい} は して ない っす 。 たぶん 。 || I ended up head of the grass crew. Less time for naps. …No regrets. Probably.
?(end_mem_choose) co_heita: {山|やま} に {行|い}って 、 {親父|おやじ} の {顔|かお} を {取|と}り{戻|もど}して きました 。 …… {俺|おれ} に {似|に}て た っす 。 {寝顔|ねがお} が 。 || I went up the mountain and got my dad's face back. …He looked like me. When he slept.
?(end_mem_return) co_heita: {親父|おやじ} の {顔|かお} 、 {急|きゅう}に {思|おも}い{出|だ}した ん っす 。 {朝|あさ} {起|お}きたら 。 …… {寝顔|ねがお} が {俺|おれ} に そっくり で 、 {笑|わら}っちゃい ました 。 || I suddenly remembered my dad's face — just woke up and there it was. …He slept like me. I laughed.
`, 'ch3/people-square');

RB.script.add(`
@scene co.seat
!if co_hiro_seat_named -> named
narr: ガラス {職人|しょくにん} の {卓|たく} の {端|はし} に 、 {椅子|いす} が {一|ひと}つ 。 {座布団|ざぶとん} の {上|うえ} に 、 {小|ちい}さな ガラス の {杯|さかずき} が {伏|ふ}せて ある 。 || At the end of the glassmakers' table, a single chair. On its cushion, a small glass cup turned upside down.
narr: {他|ほか} の {席|せき} に は {名札|なふだ} が ある 。 この {席|せき} だけ 、 {名前|なまえ} が ない 。 || Every other seat has a name tag. Only this one has none.
?(comp=nao) comp: {宛名|あてな} の ない {席|せき} だ 。 …… {誰|だれ} か を {待|ま}って る {顔|かお} を して る 。 || A seat with no address. …It has the look of someone waiting.
?(comp=mio) comp[think]: {伏|ふ}せた {杯|さかずき} 。 {誰|だれ} か が {来|く}る まで 、 {埃|ほこり} が {入|はい}らない よう に 。 …… {優|やさ}しい {置|お}き{方|かた} です 。 || An overturned cup — to keep the dust out until someone comes. …That's a tender way to set a place.
?(comp=ren) comp: {空|あ}いた {席|せき} は 、 {名|な} の ない {灯|ひ} と {同|おな}じ です 。 {誰|だれ} か の {形|かたち} を して いる のに 、 {誰|だれ} の もの か {分|わ}からない 。 || An empty seat is like a nameless lantern: shaped like someone, but whose, no one can say.
?(comp=suzu) comp[closed]: …… || …
?(comp=suzu) comp[laugh]: {椅子|いす} って 、 {空|から} だと {目立|めだ}つ よ ね 。 {舞台|ぶたい} でも そう 。 …… {次|つぎ} 、 {行|い}こう 。 || Empty chairs do stand out. Same on stage. …Let's move on.
!if co_clue_seat -> end
!set co_clue_seat
!var co_clues + 1
!call co.clue_check
!end
:named
narr: {席|せき} に {名札|なふだ} が {立|た}って いる 。 「 トモエ 」 。 {伏|ふ}せて あった {杯|さかずき} は 、 {上|うえ} を {向|む}いて いる 。 || A name tag stands on the seat now: "Tomoe". The overturned cup has been turned right side up.

@scene co.buckets
narr: {記録堂|きろくどう} の {軒下|のきした} に 、 {古|ふる}い {革|かわ} の {桶|おけ} が {積|つ}んで ある 。 {里|さと} の {印|しるし} が {入|はい}って いる が 、 {埃|ほこり} を かぶって いる 。 || Under the Chronicle Hall's eaves, old leather buckets are stacked. They bear the village mark under a coat of dust.
?(comp=nao) comp: {火消|ひけ}し の {桶|おけ} だ 。 {使|つか}わない のに 、 {捨|す}て も しない 。 || Fire buckets. Nobody uses them, but nobody throws them out either.
?(comp=mio) comp: {革|かわ} の {桶|おけ} …… {水|みず} を {急|いそ}いで {運|はこ}ぶ ため の もの です 。 {井戸|いど} で {使|つか}う もの じゃ ない 。 || Leather buckets… for carrying water in a hurry. Not the kind you use at a well.
?(comp=ren) comp: {印|しるし} の {横|よこ} に 、 {字|じ} の {跡|あと} が あります 。 {消|け}された {字|じ} …… 「 {火|ひ} 」 で {始|はじ}まる {言葉|ことば} でした 。 || Beside the mark there's the ghost of some writing. Erased… a word that began with the character for fire.
?(comp=suzu) comp: {昔|むかし} は 、 {全部|ぜんぶ} {濡|ぬ}れて た わ 。 …… {雨|あめ} の {日|ひ} に {見|み}た の 。 たぶん 。 || They used to be wet, all of them. …I saw them on a rainy day. Probably.
?(co_restored) narr: {今|いま} は {桶|おけ} に {水|みず} が {張|は}って あり 、 {埃|ほこり} も {拭|ふ}われて いる 。 || Now the buckets are filled with water and wiped clean.
!if co_clue_buckets -> end
!set co_clue_buckets
!var co_clues + 1
!call co.clue_check

@scene co.channel_marker
narr: {水路|すいろ} の {脇|わき} の {石|いし} に 、 {字|じ} が {刻|きざ}まれて いる 。 「 {非常|ひじょう} の {時|とき} は 、 {水路|すいろ} に {沿|そ}って {下|くだ}る こと 」 。 || Words are carved on a stone beside the channel: "In an emergency, go down along the channel."
?(comp=nao) comp: {非常|ひじょう} {時|じ} の {逃|に}げ{道|みち} だ 。 {祭|まつ}り の {広場|ひろば} は 、 {逃|に}げて きた {人|ひと} が {集|あつ}まる {場所|ばしょ} な ん だ 。 …… {何|なに} から {逃|に}げる ん だ ろう な 。 || An escape route. The festival square is where people fleeing downhill would gather. …Fleeing what, I wonder.
?(comp=mio) comp: {水|みず} の そば は 、 {火|ひ} から {一番|いちばん} {遠|とお}い {場所|ばしょ} です 。 || Beside water is the farthest you can get from fire.
?(comp=ren) comp: {田|た} に {水|みず} を {引|ひ}く に は 、 {広|ひろ}すぎる {水路|すいろ} です 。 {人|ひと} が {通|とお}る ため の {幅|はば} です ね 。 || This channel is too wide for irrigation alone. It's wide enough for people.
?(comp=suzu) comp[closed]: …… ここ を 、 {子|こ}ども たち が {下|お}りて きた の 。 || …The children came down this way.
?(comp=suzu) pc: スズ ？ || Suzu?
?(comp=suzu) comp[laugh]: …… って 、 {芝居|しばい} なら {言|い}う ところ よ ね 。 ほら 、 {行|い}こう 。 || …Is what I'd say if this were a play. Come on, let's go.
!if co_clue_channel -> end
!set co_clue_channel
!var co_clues + 1
!call co.clue_check

@scene co.board
narr: {祭|まつ}り の {貼|は}り{紙|がみ} 。 「 {秋祭|あきまつ}り ・ {十五日|じゅうごにち} ・ {灯籠|とうろう} {三十|さんじゅう} ・ {舞台|ぶたい} ・ {甘酒|あまざけ} 」 。 || Festival notices. "Autumn festival — the 15th — thirty lanterns — stage — amazake."
narr: その {下|した} に 、 タモツ の {字|じ} 。 「 {雨|あめ} {四十日|よんじゅうにち} {降|ふ}らず 。 {水|みず} を {大切|たいせつ} に 」 。 || Beneath it, in Tamotsu's hand: "No rain in forty days. Use water carefully."
narr: {隅|すみ} に もう {一枚|いちまい} 。 「 {敷物|しきもの} {用|よう} の {草刈|くさか}り 、 {人手|ひとで} {募集|ぼしゅう} 。 ヘイタ （ {昼寝|ひるね} {中|ちゅう} ） 」 。 {括弧|かっこ} の {中|なか} だけ 、 {別|べつ} の {人|ひと} の {字|じ} だ 。 || One more in the corner: "Help wanted: grass-cutting for mats. Heita (napping)." Only the bit in brackets is in someone else's hand.
?(co_restored) narr: {一番|いちばん} {上|うえ} に 、 {新|あたら}しい {紙|かみ} 。 「 {火除|ひよ}け{道|みち} の {草刈|くさか}り 、 {秋|あき} と {春|はる} 。 {全員|ぜんいん} 」 。 || Pinned over everything, a new sheet: "Firebreak cutting — autumn and spring. Everyone."

@scene co.glass_table
narr: ガラス {職人|しょくにん} の {卓|たく} 。 {祭|まつ}り の {夜|よる} に は 、 ここ に {三十|さんじゅう} の {火屋|ほや} が {並|なら}ぶ そう だ 。 || The glassmakers' table. On festival night, they say, thirty lantern globes will stand here in a row.

@scene co.sayo_table
narr: サヨ の {席|せき} {表|ひょう} 。 {家|いえ} ごと に {名前|なまえ} が {並|なら}んで いる 。 {五十二|ごじゅうに} の {席|せき} の うち 、 {五|いつ}つ に は {名前|なまえ} が なく 、 {毎年|まいとし} {空|あ}いた まま だ 。 || Sayo's seating chart, household by household. Of the fifty-two seats, five have no names and stay empty every year.
narr: ガラス {職人|しょくにん} の {卓|たく} の {端|はし} に は 、 {小|ちい}さく 「 {空|あ}けて おく 」 。 || At the end of the glassmakers' table, in small letters: "Keep empty."
?(co_restored) narr: {空|あ}いて いた {五|いつ}つ の {席|せき} に 、 {新|あたら}しい {墨|すみ} で {名前|なまえ} が {入|はい}って いる 。 || The five empty seats now have names, in fresh ink.
`, 'ch3/props-square');
