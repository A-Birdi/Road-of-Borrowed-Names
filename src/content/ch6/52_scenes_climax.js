/* Chapter 6 climax: the Heart of the Hush, the battle, Kasane's account,
 * reading Tōya's note in context, and the three decisions (memories, the
 * Archive, Kasane), each with its own companion reactions. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene sa.heart_enter
# Staged: you look up over the paper floor and lean in towards the slow spiral at its centre; your companion's own
# answer (Nao points back to the one exit, Mio's hand to her aching ear, Ren holds the lamp up high, Suzu's
# showman's hands for the empty stage).
!gesture pc lookroad up
narr: {紙|かみ} の {床|ゆか} が 、 {何|なに} も ない {暗|くら}がり の {上|うえ} に {浮|う}かんで いる 。 || A floor of paper floats over empty darkness.
!gesture pc observe 12,4
narr: {真|ま}ん{中|なか} で 、 {白|しろ}い ページ が ゆっくり {渦|うず} を {巻|ま}いて いる 。 {音|おと} が 、 そこ へ {吸|す}い{込|こ}まれて いく 。 || At its centre, white pages turn in a slow spiral. Sound is being drawn into it.
?(comp=nao) !gesture comp point down
?(comp=nao) nao: {出口|でぐち} は 、 {後|うし}ろ の {一|ひと}つ だけ 。 …… {上等|じょうとう} だ 。 || One exit, behind us. …Fine by me.
?(comp=mio) !gesture comp cupear
?(comp=mio) mio: {耳|みみ} が {痛|いた}い 。 {音|おと} が ない の に 、 {痛|いた}い 。 || My ears hurt. There's no sound and they hurt.
?(comp=ren) !pose comp lampup
?(comp=ren) ren: {灯|ひ} を {高|たか}く します 。 {足元|あしもと} に {気|き} を つけて ください 。 {下|した} は 、 {何|なに} も ありません 。 || I'll hold the lamp high. Watch your step. There's nothing underneath.
?(comp=suzu) !gesture comp size
?(comp=suzu) suzu: {照明|しょうめい} なし 、 {音響|おんきょう} なし 、 {客席|きゃくせき} なし 。 …… {上等|じょうとう} だ よ 。 {一番|いちばん} {燃|も}える {舞台|ぶたい} だ 。 || No lights, no sound, no audience. …Perfect. The stage that brings out the best in you.

@scene sa.hush_core
narr: ページ の {渦|うず} 。 {一枚|いちまい} {一枚|いちまい} に 、 {誰|だれ}か の {名前|なまえ} が {書|か}いて あった {跡|あと} が ある 。 {今|いま} は 、 {白|しろ}い 。 || The spiral of pages. On each one, a trace where someone's name used to be. White now.

@scene sa.hush_core_after
narr: ページ は {床|ゆか} に {落|お}ちて 、 {静|しず}か に {積|つ}もって いる 。 {時々|ときどき} 、 {一枚|いちまい} が {風|かぜ} も ない のに めくれて 、 {下|した} の {町|まち} へ {飛|と}んで いく 。 || The pages have fallen and lie in quiet drifts. Now and then one turns over though there is no wind, and flies off towards the towns below.

@scene sa.heart_kasane
# Staged: Kasane's nod and an open hand: have you read enough? Their head goes down over deciding for everyone (or
# they look away, then down, over Tōya's four words); as the spiral quickens you look to it and Kasane turns to it
# and starts back; they look away at the Hush that no longer listens, and turn to you with an open hand: stand back;
# your companion's own answer (Nao's shake of the head, Mio's flat hand of refusal, Ren raises the lamp, Suzu's
# showman's hands). Again: Kasane looks you over, and points you down to rest.
!if seen.sa.heart_kasane -> again
!music sa_kasane
!gesture kasane nod pc
kasane: {来|き}ました ね 。 || You've come.
!gesture kasane palm pc
kasane: {十分|じゅうぶん} {読|よ}みました か 。 わたし が {間違|まちが}って いる と {言|い}う に は 。 || Have you read enough — to tell me I'm wrong?
!choice
* {間違|まちが}って いる 。 {誰|だれ} に も {頼|たの}まれず に 、 {皆|みな} の {代|か}わり に {決|き}めた 。 || You're wrong. No one asked you, and you decided for everyone. -> wrong
* トウヤ の {書|か}き{置|お}き を 、 {読|よ}んだ 。 || I read Tōya's note. -> toya
:wrong
!gesture kasane lowered
kasane[sad]: ええ 。 {決|き}めて しまいました 。 {皆|みな} の {代|か}わり に 。 || Yes. I decided. For everyone.
kasane: {待|ま}って いる {間|あいだ} に 、 また {誰|だれ}か が {溺|おぼ}れる と {思|おも}った から 。 || Because I thought that while I waited, someone else would drown.
!goto hush
:toya
!gesture kasane aside
kasane[closed]: …… {高瀬|たかせ} の {言葉|ことば} を 、 {写|うつ}した だけ の {紙|かみ} です 。 {何|なに} と でも {取|と}れる {四語|よんご} 。 || …A slip on which he copied Takase's words, that's all. Four words that could mean anything.
!gesture kasane lowered
kasane: {最後|さいご} に あの {子|こ} が わたし に {残|のこ}した の は 、 {人|ひと} を {殺|ころ}した {言葉|ことば} の {写|うつ}し でした 。 {三十年|さんじゅうねん} 、 {読|よ}んで も {読|よ}んで も 、 {答|こた}え は {出|で}ません でした 。 || The last thing he left me was a copy of the words that killed people. Thirty years of reading it, and no answer came.
:hush
!gesture pc lookroad 12,4
!look kasane 12,4
narr: ページ の {渦|うず} が 、 {急|きゅう} に {速|はや}く なった 。 || The spiral of pages suddenly quickens.
!gesture kasane recoil
kasane[surprise]: …… {待|ま}って 。 {止|と}まりなさい 。 || …Wait. Stop.
narr: {静寂|しじま} は 、 {止|と}まらない 。 || The Hush does not stop.
!gesture kasane aside
kasane[worry]: …… もう 、 わたし の {言|い}う こと も {聞|き}きません 。 いつ から だった の か 、 {覚|おぼ}えて いない 。 || …It doesn't listen to me any more, either. I can't remember when that started.
!look kasane pc
!gesture kasane palm pc
kasane: {下|さ}がって ください 。 {巻|ま}き{込|こ}まれる 。 || Stand back. You'll be caught in it.
?(comp=nao) !gesture comp shake
?(comp=nao) nao: {下|さ}がる の は {得意|とくい} だ けど 、 {今日|きょう} は やめとく 。 || Backing off is my speciality. Not today, though.
?(comp=mio) !gesture comp emphatic
?(comp=mio) mio: いいえ 。 {下|さ}がりません 。 || No. We are not stepping back.
?(comp=ren) !pose comp lampup
?(comp=ren) ren: {灯|ひ} を {掲|かか}げます 。 $name 、 {背中|せなか} は {任|まか}せて ください 。 || I'll raise the lamp. $name — leave your back to me.
?(comp=suzu) !gesture comp size
?(comp=suzu) suzu: さあ 、 {本番|ほんばん} だ 。 {台詞|せりふ} は {全部|ぜんぶ} {覚|おぼ}えて きた よ 。 || Showtime. I've learned every line.
!battle sa.hush noflee
!set sa_hush_down
!music finale
!refresh
!autosave
!call sa.after_battle
!end
:again
!gesture kasane observe pc
kasane[worry]: まだ …… {立|た}って いられます か 。 {静寂|しじま} は 、 {待|ま}って くれません 。 || Can you… still stand? The Hush won't wait for you.
!choice
* {行|い}こう 。 || Let's go. -> fight
* {少|すこ}し {待|ま}って 。 || Wait a moment. -> wait
:wait
!gesture kasane point down
kasane: {下|した} の {部屋|へや} で 、 {息|いき} を {整|ととの}えて ください 。 {近道|ちかみち} を {通|とお}れば 、 {小屋|こや} で {休|やす}む こと も できます 。 || Catch your breath in the rooms below. By the short way, you can even rest at the hut.
!end
:fight
!battle sa.hush noflee
!set sa_hush_down
!music finale
!refresh
!autosave
!call sa.after_battle

@scene sa.after_battle
# Staged: as the Hush comes undone you lean in to the settling pages, and listen down the mountain to the sound
# coming back; Kasane looks at the pages, then turns to you; your companion's own exchange with them (Nao's shrug
# and Kasane's head goes down; Mio points to the floor, "Sit down", and Kasane sits; Ren's open hand to them; Suzu's
# open hand); their head goes down as they agree to tell you about that night, and comes up with an open hand for
# the vague words; your open hand for Tami's message and their small start at "Both"; you point down to the room
# below; Kasane looks away and back to ask (avert, their courage); your companion's own answer (Nao looks between
# Kasane and you, Mio's nod, Ren's nod, Suzu checks her ledger). With the folio already in hand: their small start.
!gesture pc observe 12,4
narr: {静寂|しじま} が ほどけて いく 。 {白|しろ}い ページ が 、 {雪|ゆき} の よう に {床|ゆか} へ {降|お}りる 。 || The Hush comes undone. White pages settle to the floor like snow.
!gesture pc cupear down
narr: {遠|とお}く で 、 {何|なに}か が {鳴|な}った 。 {水|みず} の {音|おと} 。 {誰|だれ}か の {笑|わら}い{声|ごえ} 。 {下|した} の {町|まち} の {音|おと} が 、 {坂|さか} を {上|のぼ}って くる 。 || Far away, something sounds. Water. Someone laughing. The noise of the towns below is climbing the mountain.
!gesture kasane lookroad 12,4
kasane[tired]: …… {終|お}わりました か 。 || …Is it over?
!look kasane pc
kasane: {不思議|ふしぎ} です 。 {三十年|さんじゅうねん} 、 {待|ま}って いた {気|き} が します 。 {止|と}めて くれる {人|ひと} を 。 || Strange. I feel as though I've been waiting thirty years for someone to stop me.
?(comp=nao) !gesture comp shrug
?(comp=nao) nao: {待|ま}って た なら 、 {自分|じぶん} で {止|や}めれば よかった んだ 。 || If you were waiting, you could have just stopped.
?(comp=nao) !gesture kasane lowered
?(comp=nao) kasane[sad]: ええ 。 その {通|とお}り です 。 || Yes. Just so.
?(comp=mio) !gesture comp point down
?(comp=mio) mio: {座|すわ}って ください 。 {話|はなし} は それ から です 。 {断|ことわ}って も {無駄|むだ} です から ね 。 || Sit down. We'll talk after that. And there's no point refusing.
?(comp=mio) !pose kasane sit
?(comp=mio) kasane[surprise]: …… はい 。 || …Yes.
?(comp=ren) !gesture comp palm kasane
?(comp=ren) ren: {師匠|ししょう} なら 、 ここ で {何|なに} を {言|い}った と {思|おも}います か 。 || What do you think my teacher would have said, here?
?(comp=ren) kasane[smile]: 「 だから {言|い}った だろう 」 。 {何千回目|なんぜんかいめ} か の 。 || "I told you so." For the several-thousandth time.
?(comp=suzu) !gesture comp palm kasane
?(comp=suzu) suzu: {幕|まく} は {下|お}りた よ 。 でも {拍手|はくしゅ} は 、 まだ あげない 。 {話|はなし} を {聞|き}いて から 。 || The curtain's down. But no applause yet. Not until we've heard you out.
kasane: {何|なに} を {聞|き}きたい の です か 。 || What do you want to hear?
pc: あの {夜|よる} の こと 。 || About that night.
!gesture kasane lowered hold
kasane[closed]: …… いい でしょう 。 {誰|だれ}か に {話|はな}す の は 、 {初|はじ}めて です 。 || …Very well. I have never told anyone.
!activity sa.flood_history
kasane[sad]: あの {子|こ} と {何|なに} を {言|い}い{合|あ}った の か 、 {思|おも}い{出|だ}せない の です 。 {思|おも}い{出|だ}せる の は 、 {次|つぎ} の {朝|あさ} {机|つくえ} に あった 、 あの {四語|よんご} だけ 。 || I can't remember what the two of us said to each other. All I remember is the four words on my desk the next morning.
!gesture kasane palm pc
kasane: {高瀬|たかせ} の {返事|へんじ} と 、 {一字|いちじ} {一句|いっく} {同|おな}じ 。 {皮肉|ひにく} か 、 {恨|うら}み{言|ごと} か 。 {曖昧|あいまい} な {言葉|ことば} で 、 {最後|さいご} まで 。 || Word for word the same as Takase's reply. Sarcasm? A reproach? Vague to the very last.
kasane: だから わたし は …… {曖昧|あいまい} な {言葉|ことば} を 、 {世界|せかい} から {取|と}り{除|のぞ}こう と した 。 || So I tried… to remove vague words from the world.
?(seen.lf.yae_after) !gesture pc palm kasane
?(seen.lf.yae_after) pc: タミ さん から {伝言|でんごん} が ある 。 {議事録|ぎじろく} に は 、 あなた の {反論|はんろん} も 、 トウヤ の {異議|いぎ} も 、 {両方|りょうほう} ちゃんと {残|のこ}って いた って 。 || A message from Tami: the minutes kept both — your counter-argument and Tōya's objection. Both, properly recorded.
?(seen.lf.yae_after) !gesture kasane flinch pc
?(seen.lf.yae_after) kasane[surprise]: …… {両方|りょうほう} 。 || …Both.
!gesture pc point down
pc: あなた が {自分|じぶん} で {預|あず}けた {言葉|ことば} が 、 {下|した} の {部屋|へや} に ある 。 || The words you set down yourself are in the room below.
!if item.sa_letter_kasane -> have
kasane[surprise]: …… {知|し}って います 。 {置|お}いた の は 、 わたし です から 。 || …I know. I'm the one who put them there.
!gesture kasane avert pc
kasane[closed]: {持|も}って {来|き}て くださいます か 。 …… お{願|ねが}い します 。 {頼|たの}んで いる の です 。 わたし が 。 || Would you bring them to me? …Please. I am asking. Me.
?(comp=nao) !gesture comp lookbetween kasane and=pc
?(comp=nao) nao: …… {今|いま} の 、 {聞|き}いた か 。 {頼|たの}んだ ぞ 。 {三十年|さんじゅうねん} ぶり に 。 || …Did you hear that? Kasane asked. First time in thirty years.
?(comp=mio) !gesture comp nod pc
?(comp=mio) mio: {頼|たの}まれた なら 、 {行|い}きましょう 。 {断|ことわ}る {理由|りゆう} が ない 。 || If we've been asked, let's go. There's no reason to say no.
?(comp=ren) !gesture comp nod
?(comp=ren) ren: 「 {求|もと}め {有|あ}らば {必|かなら}ず {返|かえ}す べし 」 。 {定|さだ}め の とおり です ね 。 || "Whenever asked, it shall without fail be returned." Just as the charter says.
?(comp=suzu) !gesture comp check prop=accountbook
?(comp=suzu) suzu: {返却|へんきゃく} の {依頼|いらい} 、 {受付|うけつけ} {完了|かんりょう} 。 {特急|とっきゅう} で ね 。 || Return request received. Express service.
!set sa_need_letter
!journal カサネ に {頼|たの}まれた 。 {記憶|きおく} の {部屋|へや} の {最初|さいしょ} の {棚|たな} から 、 カサネ の {綴|つづ}り を {持|も}って {来|こ}よう 。 || Kasane asked: bring their folio up from the first shelf in the Room of Set-Down Memories.
!end
:have
!gesture kasane flinch pc
kasane[surprise]: …… それ は 。 || …That is—
!call sa.toya_read

@scene sa.after_return
!if item.sa_letter_kasane -> have
kasane: {最初|さいしょ} の {棚|たな} です 。 {下|した} の {部屋|へや} の 、 {奥|おく} の {左|ひだり} 。 {急|いそ}がなくて いい 。 {三十年|さんじゅうねん} {待|ま}った の です から 。 || The first shelf. In the room below, at the back on the left. There's no hurry. I've waited thirty years.
!end
:have
kasane: …… {持|も}って {来|き}て くれた の です ね 。 || …You brought it.
!call sa.toya_read

@scene sa.toya_read
!music sa_toya
# Illustrated (src/ui/43f_seq_ch6.js; docs/expressive/SHOTS.md §6): the papers read close on the floor of the Heart, held through the challenge; the bell's shot only when it is carried; the state lines run once after the end, as before.
!sequence ch6.toya begin
!shot folio
narr: $name は 、 {綴|つづ}り を カサネ に {渡|わた}した 。 {雨|あめ} の {音|おと} 。 {石|いし} の {廊下|ろうか} 。 {若|わか}い {二人|ふたり} の {声|こえ} 。 || You hand Kasane the folio. The sound of rain. A stone corridor. Two young voices.
!shot folio close
kasane[closed]: …… 「 {誰|だれ} も {開|あ}けない 」 。 わたし が 、 そう {言|い}った 。 || …"No one is opening it." I said that.
!shot floor
narr: $name は 、 {鍵|かぎ} の {控|ひか}え と {議会|ぎかい} の {貼|は}り{紙|がみ} を 、 {床|ゆか} に {並|なら}べた 。 || You lay the key slip and the council notice out on the floor beside it.
!challenge sa.toya
!shot turned
kasane[surprise]: …… {高瀬|たかせ} の {言葉|ことば} を {写|うつ}した ん じゃ なかった 。 わたし に {返事|へんじ} を した の です ね 。 {同|おな}じ {四語|よんご} で 。 || …He wasn't copying Takase's words. He was answering me. In the same four words.
kasane: 「 {誰|だれ} も {開|あ}けない 」 と {言|い}った わたし に 、 「 {必要|ひつよう}なら 、 {僕|ぼく} が {開|あ}ける 」 と 。 …… {曖昧|あいまい} な ところ なんて 、 {一|ひと}つ も ない 。 || To me, who said "no one is opening it", he said: "If it's needed, I'll open it." …There isn't one vague thing in it.
!shot turned front
kasane[sad]: {三十年|さんじゅうねん} 、 {裏|うら} ばかり {見|み}て いた 。 {表|おもて} に は 、 わたし の {字|じ} で 、 {鍵|かぎ} を {持|も}って いった の は トウヤ だ と {書|か}いて ある のに 。 || For thirty years I only looked at the back. The front says, in my own hand, that Tōya was the one who took the key.
kasane: {鐘|かね} を {鳴|な}らした の は 、 あの {子|こ} だった 。 {鍵|かぎ} の かかった {塔|とう} を 、 {自分|じぶん} で {開|あ}けて 。 {約束|やくそく} を {守|まも}った の です 。 {四語|よんご} {残|のこ}らず 。 || It was him who rang the bell. He opened the locked tower himself. He kept his promise. All four words of it.
!shot turned close
kasane[closed]: わたし は 、 {自分|じぶん} の {言葉|ことば} を {棚|たな} に {上|あ}げて 、 あの {子|こ} の {言葉|ことば} だけ を {責|せ}めて きた 。 || I put my own words up on a shelf, and blamed his.
?(comp=ren) ren: {棚|たな} に {上|あ}げる 。 …… {文字通|もじどお}り に 。 || Put up on a shelf. …Literally.
?(comp=ren) ren[shy]: {失礼|しつれい} しました 。 {今|いま} の は 、 {解説|かいせつ} の {要|い}らない ほう の {駄洒落|だじゃれ} です 。 || Forgive me. That one doesn't need explaining.
kasane: {言葉|ことば} を {一|ひと}つ の {意味|いみ} に {縛|しば}れば 、 {誰|だれ} も {読|よ}み{違|ちが}えない と {思|おも}った 。 でも {間違|まちが}えた の は 、 {言葉|ことば} じゃ ない 。 {前後|ぜんご} を {切|き}り{落|お}とした 、 わたし です 。 || I thought if I tied every word to a single meaning, no one could misread. But it wasn't the words that went wrong. It was me, cutting away everything around them.
kasane: そして {世界|せかい} じゅう の {言葉|ことば} に 、 {同|おな}じ こと を した 。 || And then I did the same to every word in the world.
?(item.lf_toya_bell) !shot bell
?(item.lf_toya_bell) narr: $name は 、 トクジ から {預|あず}かった {小|ちい}さな {鈴|すず} を {出|だ}した 。 || You take out the little bell Tokuji gave you.
?(item.lf_toya_bell) kasane[surprise]: {使|つか}い の {鈴|すず} 。 …… トウヤ の 。 || A messenger's bell. …Tōya's.
?(item.lf_toya_bell) !shot bell ring
?(item.lf_toya_bell) narr: カサネ は {鈴|すず} を {一度|いちど} だけ {振|ふ}った 。 ちりん 。 {三十年|さんじゅうねん} {遅|おく}れ の {音|おと} が 、 {芯|しん} の {中|なか} に {広|ひろ}がった 。 || Kasane rings it once. Ting. A sound thirty years late spreads through the Heart.
?(item.lf_toya_bell) !shot bell offer
?(item.lf_toya_bell) kasane: …… {持|も}って いて ください 。 あの {子|こ} は 、 {走|はし}る の が {仕事|しごと} でした から 。 {旅|たび} を {続|つづ}けさせて あげて 。 || …Please keep it. Running was his work. Let it go on travelling.
!shot decide
kasane[tired]: {許|ゆる}して ほしい と は 、 {言|い}いません 。 {言|い}える {立場|たちば} で は ない 。 || I won't ask you to forgive me. I'm in no position to.
!shot decide lift
kasane: でも 、 {決|き}めて ほしい 。 わたし が {預|あず}かって いる もの を 、 どう する か 。 わたし を 、 どう する か 。 || But I would like you to decide. What to do with what I've been keeping. What to do with me.
!shot decide aside
?(comp=nao) nao: また {人|ひと} に {決|き}めさせる の か 。 …… いや 、 {今度|こんど} は {頼|たの}んでる の か 。 {違|ちが}い は {大|おお}きい な 。 || Making someone else decide again? …No — this time you're asking. That's a big difference.
?(comp=mio) mio: {決|き}める の は 、 {一人|ひとり} じゃ ない 。 あなた も 、 {一緒|いっしょ} に {来|き}て ください 。 {断|ことわ}らせません 。 || Deciding isn't a one-person job. You're coming with us. I won't take no for an answer.
?(comp=ren) ren: 「 {名|な} は {灯|ひ} に 、 {灯|ひ} は {人|ひと} に 、 {人|ひと} は {名|な} に 。 だから 、 {名|な} を {一人|ひとり} で {守|まも}る {者|もの} は いない 」 。 {師匠|ししょう} の {教|おし}え です 。 あなた も 、 {一人|ひとり} で {守|まも}る {必要|ひつよう} は ない 。 || "A name to the lamp, the lamp to people, people to the name. And so no one keeps a name alone." My teacher's teaching. You don't have to keep them alone either.
?(comp=suzu) suzu: {貸|か}し {借|か}り を {整理|せいり} しよう 。 {帳簿|ちょうぼ} は {三冊|さんさつ} 。 {順番|じゅんばん} に 、 {片付|かたづ}けて いこう 。 || Let's settle the accounts. Three ledgers. One at a time.
kasane: {下|した} の {記憶|きおく} の {部屋|へや} で 、 {待|ま}って います 。 {預|あず}けられた もの から 、 {始|はじ}めましょう 。 || I'll wait in the Room of Set-Down Memories below. Let's begin with what was given into my keeping.
!sequence ch6.toya end
!take sa_letter_kasane
!set sa_toya_read
!note sa_toya
!quest sa_main 6
!journal トウヤ の {書|か}き{置|お}き を 、 {文脈|ぶんみゃく} の {中|なか} で {読|よ}んだ 。 カサネ は {記憶|きおく} の {部屋|へや} で {待|ま}って いる 。 || Read Tōya's note in context. Kasane is waiting in the Room of Set-Down Memories.
!autosave

@scene sa.choose_mem
# Staged: among the shelves Kasane opens a hand to the memories kept there, their head goes down over the requests
# they read and did not answer; they point east to the conduits that could carry everything back and open a hand the
# other way for keeping them here, then nod to you: the choice is yours; your companion's own answer (Nao looks
# between the two ways, Mio's guarded hand, Ren's two hands weighing names against memories, Suzu checks her
# ledger). Returned: Kasane looks down the mountain and their head goes down; your companion answers (Nao's nod, Mio
# checks her bottles, Ren's nod, Suzu counts the interest). Kept: Kasane's nod; your companion answers (Nao's hand
# to the strap, Mio's shake of the head, Ren breathes out or glances away, Suzu's open hand); Kasane points up to
# the study.
!gesture kasane palm left
kasane: ここ に ある の は 、 {自分|じぶん} から {頼|たの}んで {置|お}いて いった {人|ひと} たち の {記憶|きおく} です 。 {悲|かな}しみ の {重|おも}さ に 、 {耐|た}えられなかった {人|ひと} たち 。 || These are the memories of people who asked me to keep them. People who couldn't bear the weight of their grief.
!gesture kasane lowered
kasane[closed]: {返却|へんきゃく}{願|ねが}い も 、 {読|よ}んで は いました 。 {全部|ぜんぶ} 。 {後|あと} で {感謝|かんしゃ} される と 、 {自分|じぶん} に {言|い}い{聞|き}かせて 。 || I did read the return requests. Every one. I told myself they would thank me later.
kasane: {返|かえ}して と {頼|たの}んだ {人|ひと} の {分|ぶん} は 、 {今夜|こんや} {返|かえ}します 。 {何|なに} を {選|えら}んで も 。 {定|さだ}め に そう {書|か}いて ある から 。 || Those who asked for theirs back will have them tonight, whatever you choose. The charter says so.
!gesture kasane point right
kasane: {残|のこ}り を 、 どう する か です 。 {全部|ぜんぶ} {返|かえ}す こと も できます 。 {水路|すいろ} を {逆|ぎゃく} に {流|なが}せば 、 {今夜|こんや} の うち に {持|も}ち{主|ぬし} の {所|ところ} へ {届|とど}きます 。 || The question is the rest. I can return them all. Run the conduits backwards and they'd reach their owners tonight.
!gesture kasane palm left
kasane: あるいは 、 ここ に {置|お}いて おいて 、 {会|あ}い に {来|く}る か どう か を 、 {本人|ほんにん} に {選|えら}んで もらう こと も 。 || Or I can keep them here, and let each person choose whether to come and see theirs.
!look kasane pc
!gesture kasane nod pc
kasane: …… ウシオさん なら 、 {後|あと} の ほう を {選|えら}んだ でしょう 。 でも 、 {決|き}める の は あなた です 。 || …Ushio would have chosen the second. But the choice is yours.
?(comp=nao) !gesture comp lookbetween right and=left
?(comp=nao) nao: …… {届|とど}ける か 、 {預|あず}かる か 。 {配達人|はいたつにん} に {聞|き}く {質問|しつもん} じゃ ない な 。 {答|こた}え は {分|わ}かってる くせ に 、 {迷|まよ}う 。 || Deliver, or hold. Not a fair question for a courier. You'd think I'd know the answer, and I still waver.
?(comp=mio) !gesture comp guard
?(comp=mio) mio: どっち を {選|えら}んで も 、 {痛|いた}む {人|ひと} は いる 。 それ は {覚悟|かくご} して おこう 。 || Whichever we choose, someone will hurt. Let's be ready for that.
?(comp=ren) !gesture comp size
?(comp=ren) ren: {灯|ひ} の {名前|なまえ} なら 、 {迷|まよ}わず {返|かえ}します 。 {記憶|きおく} は …… {名前|なまえ} より {重|おも}い 。 || If these were lantern names, I'd return them without a second thought. Memories are… heavier than names.
?(comp=suzu) !gesture comp check prop=accountbook
?(comp=suzu) suzu: {預|あず}かり{証|しょう} は {全部|ぜんぶ} {残|のこ}ってる 。 {誰|だれ} に {何|なに} を {返|かえ}す か は 、 {帳簿|ちょうぼ} が {覚|おぼ}えてる 。 {問題|もんだい} は 、 {返|かえ}す か どう か 。 || The receipts are all still here. The ledger remembers who's owed what. The only question is whether to pay it out.
!choice
* {全部|ぜんぶ} {返|かえ}そう 。 {悲|かな}しみ も 、 その {人|ひと} の もの だ 。 || Return them all. Grief belongs to the person too. -> ret
* ここ に {置|お}いて 、 {本人|ほんにん} に {選|えら}んで もらおう 。 || Keep them here, and let each person choose. -> keep
:ret
!set end_mem_return
!gesture kasane lookroad down
kasane: …… {分|わ}かりました 。 {今夜|こんや} 、 {山|やま} の {下|した} で 、 たくさん の {人|ひと} が {泣|な}く でしょう 。 || …Very well. Tonight, down the mountain, a great many people will weep.
!gesture kasane lowered
kasane[sad]: {泣|な}ける こと を 、 {返|かえ}す の です ね 。 || We're giving them back the ability to cry.
?(comp=nao) !gesture comp nod
?(comp=nao) nao: {重|おも}い {荷物|にもつ} でも 、 {届|とど}ける の が {筋|すじ} だ 。 {中身|なかみ} を どう する か は 、 {受|う}け{取|と}った {側|がわ} が {決|き}める 。 || Even a heavy parcel gets delivered. What to do with what's inside is for the one who receives it.
?(comp=mio) !gesture comp check prop=bottle
?(comp=mio) mio: {明日|あした} から 、 {薬屋|くすりや} は {忙|いそが}しく なる な 。 …… {眠|ねむ}れない {人|ひと} の ため の {薬|くすり} 、 {多|おお}め に {作|つく}って おく 。 || The apothecaries will be busy from tomorrow. …I'll make extra of the remedy for people who can't sleep.
?(comp=ren) !gesture comp nod
?(comp=ren) ren: {持|も}ち{主|ぬし} の {所|ところ} へ 。 {灯|ひ} の {名前|なまえ} と {同|おな}じ です 。 {迷|まよ}い は ありません 。 …… {道|みち} に は {迷|まよ}います が 。 || Back to their owners. Same as lantern names. No wavering. …Roads, I get lost on. Not this.
?(comp=suzu) !gesture comp count
?(comp=suzu) suzu: {借|か}りた もの は {返|かえ}す 。 {利子|りし} は …… {預|あず}けて いた {年月|としつき} だ ね 。 {高|たか}く ついた けど 、 {払|はら}って もらおう 。 || What's borrowed gets returned. The interest… is the years it was kept. Steep, but it'll have to be paid.
!goto done
:keep
!set end_mem_choose
!gesture kasane nod pc
kasane: …… {分|わ}かりました 。 {扉|とびら} は {開|あ}けて おきます 。 {来|く}る {人|ひと} の ため に も 、 {来|こ}ない {人|ひと} の ため に も 。 || …Very well. I'll leave the door open — for those who come, and for those who don't.
kasane[smile]: ウシオさん の {札|ふだ} と {同|おな}じ です ね 。 「 {本人|ほんにん} が {選|えら}ぶ まで {預|あず}かる こと 」 。 || Just like Ushio's label. "To be held until the person themself chooses."
?(comp=nao) !gesture comp strap
?(comp=nao) nao: {開|ひら}ける か どう か は 、 {受|う}け{取|と}った {人|ひと} が {決|き}める 。 …… {前|まえ} に も 、 そう {決|き}めた こと が ある 。 {間違|まちが}って なかった と {思|おも}う 。 || Whether to open it is up to whoever receives it. …I decided that once before. I don't think I was wrong.
?(comp=mio) !gesture comp shake
?(comp=mio) mio: {無理|むり} に {飲|の}ませる {薬|くすり} は 、 {薬|くすり} じゃ ない 。 {選|えら}べる こと も 、 {治療|ちりょう} の うち 。 || Medicine forced down someone's throat isn't medicine. Being able to choose is part of the cure.
?(comp=ren&sa_ren_took) !gesture comp exhale
?(comp=ren&sa_ren_took) ren: {師匠|ししょう} の {字|じ} の とおり に 。 …… {今|いま} なら {分|わ}かります 。 {師匠|ししょう} が どんな {顔|かお} で 、 あの {札|ふだ} を {書|か}いた か 。 || As my teacher wrote it. …I know now what face my teacher wore, writing that label.
?(comp=ren&!sa_ren_took) !gesture comp aside
?(comp=ren&!sa_ren_took) ren: {師匠|ししょう} の {字|じ} の とおり に 。 …… {師匠|ししょう} が {聞|き}いたら 、 {得意|とくい}げ な {顔|かお} を する でしょう 。 {顔|かお} は {知|し}りません が 。 || As my teacher wrote it. …My teacher would look smug, hearing that. Not that I know what the face looks like.
?(comp=suzu) !gesture comp palm
?(comp=suzu) suzu: {幕|まく} は {上|あ}げた まま に して おこう 。 {出|で}る か どう か は 、 {役者|やくしゃ} が {決|き}める 。 || Leave the curtain up. Whether to walk on is up to each actor.
:done
!set sa_choice_mem sa_shortcut
!quest sa_main 7
!gesture kasane point up
kasane: {次|つぎ} は 、 この {書庫|しょこ} そのもの です 。 {閲覧室|えつらんしつ} で 、 {待|ま}って います 。 {書斎|しょさい} の {西|にし} の {扉|とびら} を {通|とお}れば 、 すぐ です 。 || Next, the Archive itself. I'll wait in the Reading Room. Through the west door of the study, it's no distance.
!fade out
!refresh
!fade in
!autosave

@scene sa.choose_archive
# Staged: in the Reading Room Kasane looks between the shelves and the doors, opens a hand to the shelves (a
# library) and points to the doors (closing them); the clerk tilts from its desk; your companion's own answer (Nao's
# shrug, Mio's guarded hand, Ren tends the lamp, Suzu's open hand). A library: Kasane's open hand to the door that
# will have a sign, not a lock; your companion answers (Nao's and Mio's nods, Ren's open hand to the shelves, Suzu's
# small celebration). Closed: their head goes down; your companion answers (Nao's and Mio's nods, Ren's head goes
# down, Suzu's curtain-call bow). Kasane points you down to the gate.
!gesture kasane lookbetween 21,2 and=13,19
kasane: {書庫|しょこ} を どう する か 。 {開|ひら}く か 、 {閉|と}じる か 。 || What to do with the Archive. Open it, or close it.
!gesture kasane palm 21,2
kasane: {開|ひら}く なら 、 {誰|だれ} でも {読|よ}める 、 {名前|なまえ} の {図書館|としょかん} に します 。 {写|うつ}し だけ を {置|お}き 、 {何|なに} も {取|と}らない 。 {定|さだ}め の 、 {最初|さいしょ} の {形|かたち} です 。 || If it's opened, it becomes a library of names anyone can read. Copies only; nothing taken. The charter as it was first meant.
!gesture kasane point 13,19
kasane: {閉|と}じる なら 、 {扉|とびら} に {封|ふう} を して 、 {名前|なまえ} は {呼|よ}ばれる {所|ところ} に だけ {住|す}む 。 {書庫|しょこ} は 、 {役目|やくめ} を {終|お}えます 。 || If it's closed, I seal the doors, and names live only where they are called. The Archive's work is over.
?(sa_clerk_named) !gesture sa_tsuzuri stiff
?(sa_clerk_named) sa_tsuzuri: ツヅリ は 、 どちら でも {働|はたら}きます 。 {閉|と}じた {扉|とびら} に も 、 {鍵|かぎ} の {番|ばん} は {要|い}ります から 。 || Tsuzuri will work either way. Even a closed door needs someone to mind the key.
?(!sa_clerk_named) !gesture sa_clerk stiff
?(!sa_clerk_named) sa_clerk: {当|とう}{書記|しょき} は 、 どちら でも {働|はたら}きます 。 {閉|と}じた {扉|とびら} に も 、 {鍵|かぎ} の {番|ばん} は {要|い}ります から 。 || This clerk will work either way. Even a closed door needs someone to mind the key.
?(comp=nao) !gesture comp shrug
?(comp=nao) nao: {名前|なまえ} の {郵便局|ゆうびんきょく} か 、 {閉|し}まった {郵便局|ゆうびんきょく} か 。 …… どっち も 、 {悪|わる}く は ない 。 || A post office for names, or a closed-down post office. …Neither's a bad answer.
?(comp=mio) !gesture comp guard
?(comp=mio) mio: {洪水|こうずい} や {火事|かじ} の {後|あと} に は 、 {記録|きろく} が {要|い}る 。 {本当|ほんとう} に 。 …… でも 、 ここ で {傷|きず}ついた {人|ひと} も いる 。 || After floods and fires, you really do need records. …But people were hurt here, too.
?(comp=ren) !gesture comp tendlamp
?(comp=ren) ren: {灯守|ひもり} と して は 、 {名前|なまえ} の {写|うつ}し が ある の は {心強|こころづよ}い 。 でも 、 {灯|ひ} に は {消|け}える {権利|けんり} も ある 。 || As a lantern keeper, I'd feel safer knowing copies of the names exist. But a lamp has the right to go out, too.
?(comp=suzu) !gesture comp palm
?(comp=suzu) suzu: {劇場|げきじょう} は 、 {客|きゃく} が {来|く}る から {劇場|げきじょう} な んだ よ 。 {誰|だれ} も {来|こ}ない なら 、 ただ の {倉庫|そうこ} 。 || A theatre is a theatre because people come. If no one does, it's just a warehouse.
!choice
* {開|ひら}こう 。 {誰|だれ} でも {読|よ}める 、 {名前|なまえ} の {図書館|としょかん} に 。 || Open it. A library of names anyone can read. -> lib
* {閉|と}じよう 。 {書庫|しょこ} の {役目|やくめ} は 、 もう {終|お}わった 。 || Close it. The Archive's work is done. -> close
:lib
!set end_archive_library
!look kasane pc
!gesture kasane palm 13,19
kasane[smile]: {図書館|としょかん} 。 …… {建|た}てた {人|ひと} たち が {聞|き}いたら 、 {喜|よろこ}ぶ でしょう 。 {扉|とびら} に は 、 {鍵|かぎ} で は なく 、 {札|ふだ} を {掛|か}けます 。 「 {何|なに} も {取|と}りません 」 と 。 || A library. …The people who built it would be glad to hear that. On the door I'll hang a sign, not a lock: "Nothing will be taken."
?(comp=nao) !gesture comp nod
?(comp=nao) nao: {閲覧|えつらん} {無料|むりょう} 、 {配達|はいたつ} {承|うけたまわ}り ます 。 …… {下|した} の {町|まち} から {登|のぼ}って くる の は {大変|たいへん} だ から な 。 {写|うつ}し を {届|とど}ける {仕事|しごと} 、 {増|ふ}え そう だ 。 || Free reading, deliveries available. …It's a long climb from the towns. I can see a lot of copy-delivery work coming my way.
?(comp=mio) !gesture comp nod
?(comp=mio) mio: {次|つぎ} の {洪水|こうずい} の {時|とき} に 、 {役|やく} に {立|た}つ 。 …… {役|やく} に {立|た}つ だけ で 、 {取|と}らない 。 それ なら 、 いい 。 || It'll help, when the next flood comes. …Helping, not taking. Then I'm for it.
?(comp=ren) !gesture comp palm 21,2
?(comp=ren) ren: {灯守|ひもり} の {見習|みなら}い を 、 ここ で {教|おし}えられます 。 {名前|なまえ} の {書|か}き{方|かた} の {手本|てほん} が 、 {山|やま} ほど ある 。 || We could train apprentice keepers here. There are mountains of examples of how to write a name.
?(comp=suzu) !gesture comp celebrate
?(comp=suzu) suzu: {開演|かいえん} だ ね 。 {客席|きゃくせき} は 、 {町|まち} {五|いつ}つ {分|ぶん} 。 {悪|わる}く ない {入|い}り だ よ 。 || Opening night. The house: five towns' worth. Not a bad turnout.
!goto done
:close
!set end_archive_closed
!look kasane pc
!gesture kasane lowered
kasane[closed]: …… はい 。 {名前|なまえ} は 、 {紙|かみ} の {上|うえ} で は なく 、 {呼|よ}ぶ {人|ひと} の {口|くち} の {中|なか} で {生|い}きる 。 {本当|ほんとう} は 、 ずっと そう でした ね 。 || …Yes. Names live not on paper, but in the mouths of the people who call them. It was always so, really.
?(comp=nao) !gesture comp nod
?(comp=nao) nao: {配達|はいたつ} の {終点|しゅうてん} が {一|ひと}つ {減|へ}る 。 {困|こま}らない 。 {人|ひと} の {所|ところ} に {届|とど}ける ほう が 、 {性|しょう} に {合|あ}う 。 || One less end of the line. Suits me. I'd rather deliver to people.
?(comp=mio) !gesture comp nod
?(comp=mio) mio: {閉|と}じる の も 、 {手当|てあ}て の {一|ひと}つ 。 {傷口|きずぐち} は 、 いつか {塞|ふさ}がない と 。 || Closing is a kind of care too. A wound has to close eventually.
?(comp=ren) !gesture comp lowered
?(comp=ren) ren: {消|き}えた {灯|ひ} に は 、 {番人|ばんにん} は {要|い}りません 。 …… {墓|はか} の {灯|ひ} は 、 {別|べつ} です が 。 || A lamp that's out doesn't need a keeper. …The lamp at a grave is another matter.
?(comp=suzu) !gesture comp bow
?(comp=suzu) suzu: {千秋楽|せんしゅうらく} だ 。 {幕|まく} を {下|お}ろす の も 、 {芝居|しばい} の うち 。 || Closing night. Bringing the curtain down is part of the play too.
:done
!set sa_choice_archive
!quest sa_main 8
!gesture kasane point down
kasane: {最後|さいご} は 、 わたし の こと です 。 {門|もん} で {待|ま}って います 。 || Last of all, me. I'll wait at the gate.
!fade out
!refresh
!fade in
!autosave

@scene sa.choose_kasane
# Staged: at the gate Kasane looks down the road to Lanternfall, then back to the Archive behind them; their head
# goes down and stays down as they own their fear of going down (their stronger reaction); if you saw the empty
# shelf, your open hand, and they look away and then at you for the promise that isn't vague; your companion's own
# answer (Nao looks between the road down and the Archive, Mio's flat hand of a prescription, Ren's open hand,
# Suzu's two hands for the ways to repay). Going down: Kasane's nod; your companion answers (Nao points down the
# road, Mio's nod, Ren's open hand, Suzu's open hand). Staying: their nod and a look back to the Archive; your
# companion answers (Nao points at them, Mio's nod, Ren tends the lamp, Suzu checks her ledger).
kasane: {最後|さいご} は 、 わたし です 。 || Last of all, me.
!gesture kasane lookroad down
kasane: {灯落|ひおち} へ {降|お}りて 、 {傷|きず}つけた {人|ひと} たち の {前|まえ} に {立|た}つ こと も できます 。 {何|なに} を {言|い}われて も 、 {聞|き}きます 。 || I can go down to Lanternfall and stand before the people I hurt. Whatever they say, I'll listen.
!look kasane 15,8
?(end_archive_library) kasane: あるいは 、 ここ に {残|のこ}って 、 {新|あたら}しい {図書館|としょかん} を {守|まも}る こと も 。 {見張|みは}られ ながら 。 || Or I can stay here and keep the new library — under watch.
?(end_archive_closed) kasane: あるいは 、 ここ に {残|のこ}って 、 {閉|と}じた {扉|とびら} の {番|ばん} を する こと も 。 {見張|みは}られ ながら 。 {誰|だれ}か が {来|き}たら 、 {話|はなし} を {聞|き}く ため に 。 || Or I can stay here and mind the closed doors — under watch. So that if anyone comes, there's someone to hear them.
!look kasane pc
!gesture kasane lowered hold
kasane[closed]: {正直|しょうじき} に {言|い}う と …… {下|した} へ {降|お}りる の は 、 {怖|こわ}い です 。 {三十年|さんじゅうねん} 、 {誰|だれ} の {怒|いか}り も {聞|き}いて いない から 。 || To be honest… I'm afraid to go down. I haven't heard anyone's anger in thirty years.
?(seen.sa.shelf_empty) !gesture pc palm kasane
?(seen.sa.shelf_empty) pc: {棚|たな} を {一|ひと}つ 、 {自分|じぶん} の ため に {空|あ}けて いた ね 。 || You'd kept a shelf empty for yourself.
?(seen.sa.shelf_empty) !gesture kasane avert pc
?(seen.sa.shelf_empty) kasane[sad]: …… {見|み}ました か 。 {最後|さいご} に 、 {自分|じぶん} の {名前|なまえ} も {預|あず}ける つもり でした 。 もう 、 しません 。 {約束|やくそく} します 。 {曖昧|あいまい} で は ない ほう の 。 || …You saw. I meant to set down my own name, at the end. I won't, now. I promise — the kind that isn't vague.
?(comp=nao) !gesture comp lookbetween down and=15,8
?(comp=nao) nao: {下|した} へ {行|い}く なら 、 {途中|とちゅう} で {逃|に}げ{出|だ}さない よう に {見|み}て て やる 。 {残|のこ}る なら 、 {毎週|まいしゅう} {手紙|てがみ} を {持|も}って {来|く}る 。 どっち に して も 、 {逃|に}げ{道|みち} は ない ぞ 。 || If you go down, I'll make sure you don't bolt halfway. If you stay, I'll bring letters every week. Either way, no escape routes.
?(comp=mio) !gesture comp emphatic
?(comp=mio) mio: {降|お}りて も {残|のこ}って も 、 ちゃんと {食|た}べて 、 ちゃんと {寝|ね}る こと 。 これ は {相談|そうだん} じゃ なくて 、 {処方|しょほう} です 。 || Down or up here, you eat properly and sleep properly. That's not a suggestion. It's a prescription.
?(comp=ren) !gesture comp palm kasane
?(comp=ren) ren: {師匠|ししょう} は 、 あなた を {責|せ}める ため に {来|き}た ん じゃ ない 。 {反対|はんたい} する ため に {来|き}た 。 {違|ちが}い は …… {六年|ろくねん} {分|ぶん} の {箱|はこ} が {教|おし}えて くれました 。 || My teacher didn't come here to blame you. My teacher came to disagree with you. The difference… six years of boxes taught me.
?(comp=suzu) !gesture comp size
?(comp=suzu) suzu: {帳簿|ちょうぼ} の {最後|さいご} の {頁|ページ} だ ね 。 {借|か}り は {返|かえ}す 。 どう {返|かえ}す か は 、 {選|えら}べる 。 …… {選|えら}べる の は 、 {贅沢|ぜいたく} な こと だ よ 。 || The last page of the ledger. The debt gets repaid. How it's repaid, you can choose. …Being able to choose is a luxury, you know.
!choice
* {灯落|ひおち} へ {降|お}りよう 。 {傷|きず}つけた {人|ひと} たち の {前|まえ} に {立|た}って 。 || Come down to Lanternfall. Stand before the people you hurt. -> trial
* ここ に {残|のこ}って 、 {守|まも}って 。 {見張|みは}り は {付|つ}ける 。 || Stay and keep it. Someone will be watching. -> keeper
:trial
!set end_kasane_trial
!gesture kasane nod pc
kasane: …… はい 。 {降|お}ります 。 {怒|おこ}られ に 。 {三十年|さんじゅうねん} {分|ぶん} 。 || …Yes. I'll go down. To be shouted at. Thirty years' worth.
kasane[smile]: {怖|こわ}い です が 、 {少|すこ}し だけ …… {待|ま}ち{遠|どお}しい 。 {誰|だれ}か が {反対|はんたい} して くれる の は 、 ウシオさん {以来|いらい} です から 。 || It frightens me, but I'm also… a little eager. It's been since Ushio that anyone disagreed with me to my face.
?(comp=nao) !gesture comp point down
?(comp=nao) nao: {灯落|ひおち} の {連中|れんちゅう} は 、 {今|いま} {言|い}いたい こと が {山|やま} ほど ある 。 {全部|ぜんぶ} {聞|き}け 。 それ が {配達|はいたつ} {料|りょう} だ 。 || The people of Lanternfall have a mountain of things to say right now. Hear all of it. That's the delivery fee.
?(comp=mio) !gesture comp nod kasane
?(comp=mio) mio: {一緒|いっしょ} に {降|お}ります 。 {庇|かば}う ため じゃ ない 。 {倒|たお}れない よう に 。 …… {倒|たお}れたら 、 {担|かつ}ぎます けど 。 || I'll come down with you. Not to shield you. To make sure you don't collapse. …If you do, I'll carry you.
?(comp=ren) !gesture comp palm kasane
?(comp=ren) ren: {灯落|ひおち} の {灯籠|とうろう} の {名前|なまえ} を 、 {一緒|いっしょ} に {書|か}き{直|なお}して ください 。 {一本|いっぽん} ずつ 。 {頭|あたま} を {下|さ}げる より 、 {町|まち} の {人|ひと} に は {見|み}える はず です 。 || Help rewrite the lantern names of Lanternfall with us. One post at a time. The townspeople will see that better than any bow.
?(comp=suzu) !gesture comp palm kasane
?(comp=suzu) suzu: {舞台|ぶたい} に {上|あ}がって 、 {客|きゃく} の {野次|やじ} を {全部|ぜんぶ} {浴|あ}びる 。 それ が {一番|いちばん} {正直|しょうじき} な {返済|へんさい} だ よ 。 {拍手|はくしゅ} は …… {期待|きたい} しない こと 。 || Go on stage and take every heckle from the house. That's the most honest repayment there is. Applause… don't count on it.
!goto done
:keeper
!set end_kasane_keeper
!gesture kasane nod pc
kasane: …… {分|わ}かりました 。 {残|のこ}ります 。 {見張|みは}られ ながら 。 || …I understand. I'll stay. Under watch.
!gesture kasane lookroad 15,8
kasane: {逃|に}げる ため では なく 、 ここ で しか できない {償|つぐな}い を する ため に 。 {返|かえ}す {仕事|しごと} は 、 {取|と}る {仕事|しごと} より 、 ずっと {長|なが}く かかります 。 || Not to hide — to make the amends only possible here. Returning things takes far longer than taking them.
?(comp=nao) !gesture comp point kasane
?(comp=nao) nao: {毎週|まいしゅう} {来|く}る から な 。 {文句|もんく} の {手紙|てがみ} を {山|やま} ほど {抱|かか}えて 。 {全部|ぜんぶ} に {返事|へんじ} を {書|か}け 。 {一通|いっつう} {残|のこ}らず 。 || I'll be here every week, arms full of complaint letters. You'll answer every one. Every single one.
?(comp=mio) !gesture comp nod kasane
?(comp=mio) mio: {月|つき} に {一度|いちど} 、 {診|み}に {来|き}ます 。 {断|ことわ}って も {来|き}ます 。 …… わたし 、 {今|いま} は {断|ことわ}れる けど 、 {断|ことわ}られても {引|ひ}かない の 。 || I'll come once a month to look you over. I'll come even if you refuse. …I can say no now — but I don't back down when I'm told no, either.
?(comp=ren) !gesture comp tendlamp
?(comp=ren) ren: {灯守|ひもり} が 、 {交代|こうたい} で {見張|みは}り に {来|き}ます 。 わたし も 。 {師匠|ししょう} の {墓|はか} の {灯|ひ} を 、 {消|け}さない よう に 。 || Lantern keepers will take turns keeping watch. Me among them. And we'll see that the lamp at my teacher's grave never goes out.
?(comp=suzu) !gesture comp check prop=accountbook
?(comp=suzu) suzu: {返済|へんさい} {計画|けいかく} を {立|た}てよう 。 {利子|りし} も {含|ふく}めて 。 {帳簿|ちょうぼ} は わたし が {付|つ}ける 。 {毎月|まいつき} {見|み}に {来|く}る から ね 。 {誤魔化|ごまか}したら 、 すぐ {分|わ}かる よ 。 || We'll draw up a repayment plan. Interest included. I'll keep the books, and I'll check them every month. Fiddle them and I'll know at once.
:done
!set sa_choice_kasane sa_descent
!quest sa_main 9
!journal {全部|ぜんぶ} {決|き}めた 。 {坂|さか} を {下|くだ}って 、 {家|いえ} へ {帰|かえ}ろう 。 || Everything's decided. Take the road down, and go home.
!autosave

@scene sa.kasane_bye
kasane[smile]: {行|い}ってらっしゃい 。 …… {変|へん} です ね 。 この {言葉|ことば} を {言|い}う の は 、 {三十年|さんじゅうねん} ぶり です 。 || Off you go, then. …How strange. It's thirty years since I last said that.
kasane: {次|つぎ} に {来|く}る {時|とき} は 、 {反対|はんたい} を {持|も}って {来|き}て ください 。 {箱|はこ} は 、 まだ {空|あ}いて います 。 || When you come next, bring an objection. There's still room in the boxes.
`, 'ch6/scenes-climax');
