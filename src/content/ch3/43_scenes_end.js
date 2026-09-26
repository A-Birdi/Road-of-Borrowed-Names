/* Chapter 3 ending: the village assembly at dusk, the firebreaks cut, the
 * festival night, and the reflection on the lookout. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene co.assembly
!fade out
!warp co.eve 23 18 up
!music sorrow
!fade in
narr: {夕暮|ゆうぐ}れ の {広場|ひろば} に 、 {里|さと} の {人|ひと} が {集|あつ}まった 。 {飾|かざ}り {付|つ}け の {途中|とちゅう} の {舞台|ぶたい} に 、 トキワ が {立|た}って いる 。 || At dusk the village gathers in the square. Tokiwa stands on the half-decorated stage.
co_tokiwa: {皆|みな} さん 。 {祭|まつ}り の {前|まえ} に 、 {聞|き}いて いただきたい こと が あります 。 || Everyone. Before the festival, there is something I must ask you to hear.
co_tokiwa: {二十年前|にじゅうねんまえ} の {十月|じゅうがつ} {十四日|じゅうよっか} 。 {今夜|こんや} と {同|おな}じ {日|ひ} の {夜|よる} 。 この {里|さと} で は 、 {火事|かじ} が ありました 。 || Twenty years ago, on the fourteenth of the tenth month — this very night — there was a fire in this village.
narr: {広場|ひろば} が ざわめいた 。 {誰|だれ} か が {笑|わら}い かけて 、 {途中|とちゅう} で やめた 。 || A murmur runs through the square. Someone starts to laugh and stops halfway.
co_sayo[surprise]: …… {火事|かじ} ？ でも 、 {年代記|ねんだいき} に は …… || …A fire? But the chronicle…
co_tokiwa: {年代記|ねんだいき} を {書|か}き{直|なお}した の は 、 {私|わたし} です 。 || I am the one who rewrote the chronicle.
co_tokiwa: あの {夜|よる} 、 {窯|かま} の {火|ひ} を {見|み}て いた {見習|みなら}い は 、 {私|わたし} でした 。 {火|ひ} が {白|しろ}く なった ので 、 {上|うえ} の {窓|まど} を {開|あ}けました 。 {風|かぜ} の {強|つよ}い {夜|よる} は {開|あ}ける な と 、 トモエ さん に {言|い}われて いた のに 。 || That night, the apprentice watching the kiln fire was me. The flame turned white, so I opened the upper vent — though Tomoe had told me never to open it on a windy night.
co_tokiwa: {火|ひ} の {粉|こ} が {上|うえ} の {段|だん} へ {飛|と}びました 。 トモエ さん は {私|わたし} に {子|こ}ども たち を {連|つ}れて {逃|に}げろ と {言|い}い 、 {自分|じぶん} は {水門|すいもん} へ {上|のぼ}って {行|い}きました 。 || Sparks flew onto the upper terraces. Tomoe told me to take the children and run, and climbed to the water gate herself.
co_tokiwa: {五人|ごにん} が {亡|な}くなり 、 {工房|こうぼう} {通|どお}り の {五軒|ごけん} が {焼|や}けました 。 {冬|ふゆ} に 、 {白|しろ}い {服|ふく} の {旅人|たびびと} が {来|き}て 、 {悲|かな}しみ を {預|あず}かる と {言|い}いました 。 {私|わたし} は {頼|たの}みました 。 {頼|たの}んだ {人|ひと} は 、 {他|ほか} に も いました 。 || Five people died, and the five houses of the workshop row burned. That winter a traveller in white came and offered to keep our grief. I asked. I was not the only one.
co_tokiwa[sad]: {悲|かな}しみ だけ を {預|あず}けた つもり でした 。 でも {静寂|しじま} は 、 {火事|かじ} ごと {持|も}って {行|い}った 。 {記録|きろく} も 、 {火除|ひよ}け{道|みち} の {草刈|くさか}り も 。 || I thought we were handing over only the grief. But the Hush took the whole fire — the record, and the cutting of the firebreaks with it.
co_tamotsu: …… {雨|あめ} は {四十日|よんじゅうにち} {降|ふ}って ない 。 {水路|すいろ} は {三分|さんぶ} の {一|いち} 。 {火除|ひよ}け{道|みち} は {草|くさ} だらけ だ 。 {今|いま} {火|ひ} が {出|で}たら 、 {下|した} の {里|さと} まで {来|く}る 。 || …No rain for forty days. The channel's at a third. The firebreaks are weeds. If fire broke out now, it would reach the lower village.
co_tokiwa: {今夜|こんや} 、 {決|き}めて ください 。 この {火事|かじ} を 、 {年代記|ねんだいき} に {書|か}き{戻|もど}す か どう か 。 || Tonight I ask you to decide: do we write this fire back into the chronicle, or not?
co_tokiwa: {書|か}き{戻|もど}せば 、 {皆|みな} {思|おも}い{出|だ}します 。 {亡|な}くした {人|ひと} の こと も 、 {痛|いた}み も 。 {書|か}かなければ 、 {明日|あした} の {祭|まつ}り は 、 {例年|れいねん} どおり {楽|たの}しい まま です 。 || Write it back, and everyone will remember — the people we lost, and the pain. Leave it out, and tomorrow's festival will be as happy as every year.
co_fusa[worry]: …… {楽|たの}しい まま で 、 いい じゃ ない 。 {今|いま} {誰|だれ} も {泣|な}いて ない の よ 。 {今|いま} から {泣|な}かせる の ？ || …Why not leave it happy? Nobody is crying now. You'd make them cry?
co_nobu: {泣|な}く の が {嫌|いや} で {草|くさ} を {刈|か}らず 、 それ で {燃|も}える の か 。 {俺|おれ} は {御免|ごめん} だ 。 || So we won't cut the grass because we'd rather not cry, and then we burn? Not me.
co_ume: …… わたし は {頼|たの}まなかった よ 。 {預|あず}けなかった 。 それ でも {取|と}られた 。 {煙|けむり} の におい だけ {残|のこ}して ね 。 || …I never asked. Never handed anything over. They took it anyway — and left me the smell of smoke.
co_goro: わし の {腕|うで} は 、 {鐘|かね} の {打|う}ち{方|かた} を {覚|おぼ}えて おった 。 {頭|あたま} が {忘|わす}れて も な 。 || My arms remembered how to ring that bell, even when my head forgot.
?(co_bell_rung) co_goro: {鐘|かね} が {鳴|な}った {日|ひ} 、 みんな {桶|おけ} を {持|も}って {水路|すいろ} へ {走|はし}った だろう 。 {体|からだ} は {忘|わす}れて なかった ん だ 。 || The day the bell rang, you all ran to the channel with buckets, didn't you? Your bodies hadn't forgotten.
narr: {皆|みな} の {目|め} が 、 {旅|たび} の {者|もの} に {向|む}いた 。 || Everyone's eyes turn to the travellers.
co_tokiwa: {旅|たび} の お{方|かた} 。 {頁|ページ} を {見|み}つけた の は 、 あなた です 。 {最初|さいしょ} の {一行|いちぎょう} を 、 {一緒|いっしょ} に {考|かんが}えて いただけません か 。 || Traveller. You found the page. Would you help us decide the first line?
!challenge co.c_assembly
!choice
* {亡|な}くなった {人|ひと} の {名前|なまえ} から 、 {読|よ}み{上|あ}げて ください 。 || Read the names of the dead first. -> names
* {火除|ひよ}け{道|みち} の {話|はなし} から に しましょう 。 {生|い}きて いる {人|ひと} の ため に 。 || Start with the firebreaks — for the living. -> living
* ウメ さん に {話|はな}して もらいましょう 。 {覚|おぼ}えて いた {人|ひと} です から 。 || Let Grandma Ume speak. She's the one who kept remembering. -> ume
:names
!set co_asm_names
co_tokiwa: …… はい 。 トモエ 。 ミツ 。 ハチロウ 。 ヨシノ 。 ケイスケ 。 || …Yes. Tomoe. Mitsu. Hachirō. Yoshino. Keisuke.
narr: {名前|なまえ} が {一|ひと}つ {読|よ}まれる たび に 、 {広場|ひろば} の どこか で 、 {誰|だれ} か が {息|いき} を {呑|の}んだ 。 || Each time a name is read, somewhere in the square, someone catches their breath.
co_goro[sad]: …… ミツ 。 わし の …… || …Mitsu. My…
!goto decide
:living
!set co_asm_living
co_tamotsu: {明日|あした} の {朝|あさ} 、 {草刈|くさか}り だ 。 {祭|まつ}り の {前|まえ} に 、 {三本|さんぼん} {全部|ぜんぶ} 。 {文句|もんく} の ある {奴|やつ} は 、 {鎌|かま} を {持|も}って から {言|い}え 。 || Tomorrow morning, we cut the grass — all three firebreaks, before the festival. Anyone who objects can say so holding a sickle.
co_heita: …… {鎌|かま} なら 、 {俺|おれ} 、 {持|も}って ます 。 {一応|いちおう} 。 || …I've got a sickle. Technically.
!goto decide
:ume
!set co_asm_ume
co_ume: …… わたし は ね 、 {毎年|まいとし} この {季節|きせつ} に なる と 、 {梁|はり} の におい で {眠|ねむ}れなかった 。 {理由|りゆう} も {分|わ}からず に ね 。 || …Every year around this time, the smell of my roof beams kept me awake. I never knew why.
co_ume: {理由|りゆう} が {分|わ}かって {泣|な}く ほう が 、 {分|わ}からず に {眠|ねむ}れない より 、 ずっと いい よ 。 || Crying because you know why is far better than lying awake without knowing.
!goto decide
:decide
narr: {長|なが}い {沈黙|ちんもく} の {後|あと} 、 {一人|ひとり} 、 また {一人|ひとり} と {手|て} が {挙|あ}がった 。 || After a long silence, one hand goes up, then another.
co_fusa[sad]: …… {妹|いもうと} の {名前|なまえ} 、 ヨシノ って いう の 。 {今|いま} 、 {思|おも}い{出|だ}した 。 {書|か}いて 。 {書|か}いて ちょうだい 。 || …My sister's name was Yoshino. I just remembered. Write it. Please, write it.
narr: {最後|さいご} に は 、 {広場|ひろば} {中|じゅう} の {手|て} が {挙|あ}がって いた 。 || In the end, every hand in the square is raised.
co_tokiwa: …… ありがとう ございます 。 || …Thank you.
narr: トキワ は {年代記|ねんだいき} を {開|ひら}き 、 {震|ふる}える {筆|ふで} で 、 {二十年前|にじゅうねんまえ} の {頁|ページ} に {一行|いちぎょう} を {書|か}き{足|た}した 。 || Tokiwa opens the chronicle and, with a trembling brush, adds a line to the page from twenty years ago.
narr: {墨|すみ} は {消|き}えなかった 。 {紙|かみ} の {奥|おく} へ 、 {深|ふか}く {沈|しず}んで いった 。 || The ink does not fade. It sinks deep into the paper.
!shake
!sfx reveal
narr: その {瞬間|しゅんかん} 、 {里|さと} {中|じゅう} の {人|ひと} が 、 {同|おな}じ {夜|よる} を {思|おも}い{出|だ}した 。 || In that moment, the whole village remembers the same night.
narr: {泣|な}き{声|ごえ} が 、 {広場|ひろば} の あちこち で {上|あ}がった 。 それ は {長|なが}く {続|つづ}いた が 、 {誰|だれ} も {止|と}め なかった 。 || Weeping rises all over the square. It goes on a long time, and nobody tries to stop it.
?(comp=nao) comp: …… {宛先|あてさき} が {戻|もど}った な 。 {重|おも}い {荷物|にもつ} だ けど 、 {届|とど}いた 。 || …The address came back. Heavy parcel. But it arrived.
?(comp=mio) comp[sad]: {皆|みな} さん 、 {泣|な}いて います 。 …… {薬|くすり} で {止|と}めて は いけない {涙|なみだ} です ね 。 || Everyone's crying. …These are tears no medicine should stop.
?(comp=ren) comp: {名|な} が {灯|とも}りました 。 …… {師匠|ししょう} は 、 {言|い}わない {名|な} は {薄|うす}く なる 、 と {言|い}って いました 。 {今夜|こんや} 、 {五|いつ}つ の {名|な} が {濃|こ}く なった 。 || The names are lit. …My master used to say that a name nobody speaks grows thin. Tonight, five names grew dark again.
?(comp=suzu) comp: …… {拍手|はくしゅ} は 、 しない で おく わ 。 これ は {舞台|ぶたい} じゃ ない から 。 || …I won't applaud. This isn't a stage.
!set co_restored
!note co_fire co_hush_fire co_firebreak
!quest co_main 9
!autosave
!call co.festival_begin

@scene co.festival_begin
!fade out
!card {翌朝|よくあさ} || The next morning
narr: {夜明|よあ}け と {同時|どうじ} に 、 {里|さと} {中|じゅう} の {人|ひと} が {鎌|かま} を {持|も}って {段々畑|だんだんばたけ} を {上|のぼ}った 。 {先頭|せんとう} は ヘイタ だった 。 || At dawn, the whole village climbed the terraces with sickles. Heita led the way.
narr: タモツ が {上|うえ} の {水門|すいもん} を {開|あ}ける と 、 {水|みず} が {段|だん} から {段|だん} へ {落|お}ちて いった 。 {二十年前|にじゅうねんまえ} の あの {夜|よる} と 、 {同|おな}じ よう に 。 || Tamotsu opened the top water gate, and water fell from terrace to terrace, just as it had twenty years before.
narr: {昼過|ひるす}ぎ に は 、 {三本|さんぼん} の {火除|ひよ}け{道|みち} が 、 {黄色|きいろ}い {刈|か}り{株|かぶ} の {帯|おび} に なって いた 。 || By early afternoon, the three firebreaks were bands of yellow stubble across the hill.
narr: ゴロウ の {櫓|やぐら} に は 、 {新|あたら}しい {綱|つな} が {下|さ}がった 。 {誰|だれ} も {何|なに} も {言|い}わなかった が 、 {皆|みな} が それ を {見上|みあ}げた 。 || A new rope hung from Gorō's lookout. Nobody said anything, but everyone looked up at it.
!set co_firebreak_cut co_hiro_seat_named
!card {秋祭|あきまつ}り || The autumn festival
!warp co.festival 23 17 down
!music cinder
!fade in
narr: {日|ひ} が {暮|く}れる と 、 {三十|さんじゅう} の ガラス の {灯籠|とうろう} に {火|ひ} が {入|はい}った 。 || When the sun goes down, fire is set in thirty glass lanterns.
narr: ヒロ の {席|せき} に は 、 {名前|なまえ} の {札|ふだ} と 、 {橙色|だいだいいろ} の {火屋|ほや} が {一|ひと}つ {置|お}いて ある 。 || On Hiro's seat: a name slip, and a single orange lantern globe.
?(comp=nao) comp: {普通|ふつう} に {楽|たの}しそう だ な 。 {皆|みな} で {泣|な}いた {次|つぎ} の {日|ひ} な のに 。 || It looks like ordinary fun. The day after everyone cried together.
?(comp=nao) comp: …… いや 、 だから か 。 || …No. Maybe that's why.
?(comp=mio) comp[smile]: {皆|みな} さん 、 ちゃんと {食|た}べて います ね 。 よかった 。 {泣|な}いた {後|あと} は 、 {甘|あま}い もの が {一番|いちばん} の {薬|くすり} です から 。 || Everyone's eating properly. Good. After crying, something sweet is the best medicine.
?(comp=ren) comp: {灯籠|とうろう} の {名|な} を 、 {全部|ぜんぶ} {読|よ}んで きます 。 …… {戻|もど}って こなかったら 、 {迷子|まいご} です 。 {探|さが}して ください 。 || I'm going to read the name on every lantern. …If I don't come back, I'm lost. Please come and find me.
?(comp=suzu) comp[smile]: {隣|となり} の {席|せき} 、 {予約|よやく} が {入|はい}ってる の 。 …… {後|あと} で ね 。 {先|さき} に {一周|いっしゅう} して きて 。 || I've a reserved seat — next door to Hiro's. …Later. Go and walk round first.
?(comp!=suzu) narr: {舞台|ぶたい} の {袖|そで} で 、 スズ が リボン を {結|むす}び{直|なお}して いる 。 {色褪|いろあ}せた リボン を 。 || At the side of the stage, Suzu is retying her ribbon. The faded one.
!journal {祭|まつ}り を {見|み}て {回|まわ}ろう 。 {気|き} が {済|す}んだら 、 {火|ひ} の {見|み} {櫓|やぐら} に {登|のぼ}ろう 。 || Walk among the lanterns. When you're ready, climb the fire lookout at the corner of the square.

@scene co.fest_stay
narr: {今夜|こんや} は {祭|まつ}り だ 。 {道|みち} は {明日|あした} で いい 。 || Tonight is the festival. The road can wait until tomorrow.
?(comp=nao) comp: {逃|に}げ{道|みち} を {確|たし}かめる の は 、 {明日|あした} に しよう 。 {今夜|こんや} くらい は 。 || I'll check the exits tomorrow. Just for tonight.

@scene co.fest_lookout
narr: {火|ひ} の {見|み} {櫓|やぐら} 。 {新|あたら}しい {綱|つな} が 、 {風|かぜ} に {少|すこ}し {揺|ゆ}れて いる 。 || The fire lookout. The new rope sways a little in the breeze.
!choice
* {櫓|やぐら} に {登|のぼ}る || Climb the lookout -> up
* まだ {祭|まつ}り を {見|み}て {回|まわ}る || Keep walking the festival -> end
:up
!fade out
!warp co.lookout 7 6 up
!fade in
!call co.reflection

@scene co.fest_seat
narr: {席|せき} に {立|た}て{掛|か}けた {札|ふだ} に 、 {丁寧|ていねい} な {字|じ} で 「 トモエ 」 。 {隣|となり} に 、 {火屋|ほや} が {一|ひと}つ 、 {灯|とも}って いる 。 || A slip propped on the seat reads, in careful letters, "Tomoe". Beside it, one lantern globe is lit.
?(co_hiro_globe) narr: {底|そこ} に {同|おな}じ {名前|なまえ} が {刻|きざ}まれた 、 {窯|かま} の {奥|おく} から {来|き}た {火屋|ほや} だ 。 || It's the globe from the back of the kiln, with the same name scratched into its base.

@scene co.reflection
!music quiet_road
narr: {櫓|やぐら} の {上|うえ} から は 、 {里|さと} {全体|ぜんたい} が {見|み}えた 。 {灯籠|とうろう} の {灯|ひ} が 、 {段々畑|だんだんばたけ} の {下|した} で {揺|ゆ}れて いる 。 || From the top of the lookout you can see the whole village. The lantern lights sway below the terraces.
narr: {刈|か}った ばかり の {火除|ひよ}け{道|みち} が 、 {月|つき} の {光|ひかり} で {白|しろ}く {浮|う}かんで いる 。 || The freshly cut firebreaks lie pale in the moonlight.
?(comp=nao) comp: …… いい {眺|なが}め だ 。 {出口|でぐち} も {全部|ぜんぶ} {見|み}える 。 {水路|すいろ} 、 {街道|かいどう} 、 {北|きた} の {道|みち} 。 || …Good view. You can see every exit. The channel, the road, the north path.
?(comp=nao) comp: スズ が {二十年|にじゅうねん} {抱|かか}えてた {借|か}り 、 {聞|き}いた か 。 …… {俺|おれ} の {鞄|かばん} に も 、 {一通|いっつう} ある 。 {届|とど}けない って {決|き}めた {手紙|てがみ} が 。 || You heard about the debt Suzu carried for twenty years? …There's one in my bag too. A letter I decided not to deliver.
?(comp=nao) comp: {相手|あいて} を {守|まも}る つもり だった 。 {今夜|こんや} {見|み}て て 、 {分|わ}から なく なった 。 {守|まも}ってた の は 、 {誰|だれ} だった ん だろう な 。 || I thought I was protecting her. Watching tonight, I'm not so sure. Who was I really protecting?
?(comp=nao) comp[smirk]: …… {灯落|ひおち} まで 、 {考|かんが}える {時間|じかん} は ある 。 {急|いそ}ぐ {配達|はいたつ} じゃ ない 。 たぶん 。 || …There's time to think before Lanternfall. It's not an urgent delivery. Probably.
?(comp=mio) comp: {今日|きょう} 、 {火傷|やけど} の {薬|くすり} を {十四軒|じゅうよんけん} {分|ぶん} {作|つく}りました 。 {皆|みな} さん に {頼|たの}まれて 、 {全部|ぜんぶ} 「 はい 」 って {言|い}って 。 || Today I made burn salve for fourteen households. Everyone asked, and I said yes to all of them.
?(comp=mio) comp[think]: …… {今|いま} に なって 、 {疲|つか}れて いる こと に {気|き}づきました 。 {変|へん} です よ ね 。 {頼|たの}まれる の は 、 {嬉|うれ}しい はず なのに 。 || …Only now do I notice I'm tired. Strange, isn't it. Being asked is supposed to make me happy.
?(comp=mio) comp[smile]: {今夜|こんや} は 、 {誰|だれ} の {頼|たの}み も {聞|き}きません 。 …… $name さん の {頼|たの}み も です よ 。 {冗談|じょうだん} です 。 {半分|はんぶん} は 。 || Tonight I'm not taking anyone's requests. …Not even yours. That's a joke. Half a joke.
?(comp=ren) comp: トキワ さん は 、 {自分|じぶん} から {預|あず}けた 、 と {言|い}いました ね 。 {痛|いた}み を 。 || Tokiwa said he handed it over himself. The pain.
?(comp=ren) comp[think]: {私|わたし} は 、 {師匠|ししょう} の {教|おし}え を {全部|ぜんぶ} {覚|おぼ}えて いる のに 、 {顔|かお} だけ {思|おも}い{出|だ}せない 。 …… まさか {私|わたし} も 、 {誰|だれ} か に {頼|たの}んだ の でしょう か 。 || I remember every one of my master's teachings, but not his face. …Could I have asked someone too?
?(comp=ren) comp: …… {分|わ}かりません 。 でも 、 {分|わ}からない まま に は しない 。 {今夜|こんや} 、 そう {決|き}めました 。 || …I don't know. But I won't leave it unknown. I decided that tonight.
?(comp=ren) comp[smirk]: ところで 、 {下|お}りる {時|とき} は {先|さき} に {行|い}って ください 。 {梯子|はしご} で も {迷|まよ}う {自信|じしん} が あります 。 || By the way, please go first on the way down. I'm confident I can get lost even on a ladder.
?(comp=suzu) comp: …… ここ から だと 、 ヒロ の {席|せき} が よく {見|み}える わ 。 {火屋|ほや} が {一|ひと}つ 、 {灯|とも}ってる 。 || …You can see Hiro's seat from here. One globe, lit.
?(comp=suzu) comp: {帳簿|ちょうぼ} 、 {見|み}る ？ 「 {一部|いちぶ} {返済|へんさい} 」 。 …… {線|せん} を {引|ひ}かない {借|か}り も ある の ね 。 {初|はじ}めて {知|し}った 。 || Want to see my book? "Paid in part." …Some debts you don't cross out. I didn't know that.
?(comp=suzu) comp[laugh]: ちなみに 、 {次|つぎ} の {頁|ページ} に は あなた の {名前|なまえ} も ある の よ 。 「 $name ── {観客|かんきゃく} {一名|いちめい} 。 {最後|さいご} まで {席|せき} を {立|た}たず 」 。 || By the way, your name's on the next page. "$name — audience of one. Stayed in their seat to the end."
?(comp=suzu) comp[smile]: …… ありがとう 。 これ は {冗談|じょうだん} じゃ ない わ 。 || …Thank you. That one isn't a joke.
?(comp!=suzu) narr: {下|した} の {舞台|ぶたい} で 、 スズ が {踊|おど}って いる 。 {二十年前|にじゅうねんまえ} に {踊|おど}る はず だった {演目|えんもく} だ と 、 {後|あと} で {聞|き}いた 。 || Down on the stage, Suzu is dancing. Later you'll hear it was the piece she was meant to dance twenty years ago.
pc: {白|しろ}い {服|ふく} の {旅人|たびびと} …… {静寂|しじま} の {書庫|しょこ} の {番人|ばんにん} かも しれない 。 || A traveller in white… it might be the keeper of the Still Archive.
?(comp=nao) comp: {悲|かな}しみ を {預|あず}かる 、 か 。 {頼|たの}まれて も いない {荷物|にもつ} まで {運|はこ}んで いった ん だ 。 {配達人|はいたつにん} と して は 、 {許|ゆる}せない な 。 || Keeping people's grief. And carrying off parcels nobody asked it to take. As a courier, I can't forgive that.
?(comp=mio) comp: {最初|さいしょ} は 、 {優|やさ}しさ だった の かも しれません 。 …… {優|やさ}しさ も 、 {量|りょう} を {間違|まちが}えれば {毒|どく} です 。 || Maybe it began as kindness. …But even kindness is poison in the wrong dose.
?(comp=ren) comp: {北|きた} の {山|やま} の {上|うえ} です ね 。 {記録|きろく} に よれば 。 …… {道|みち} は 、 {私|わたし} が {案内|あんない} しない ほう が いい でしょう 。 || Up in the northern mountains, according to the records. …It's probably best if I don't lead.
?(comp=suzu) comp: {預|あず}かる って 、 {返|かえ}す {約束|やくそく} の {言葉|ことば} の はず な のに ね 。 {返|かえ}して もらい に {行|い}こう 。 {全部|ぜんぶ} 。 || "Keeping" something is supposed to mean you'll give it back. Let's go and get it all back.
narr: {北|きた} の {峰|みね} に は 、 もう {雪|ゆき} が {光|ひか}って いた 。 || Snow was already gleaming on the northern peaks.
!set ch3_done
!quest co_main done
!travel cinder
!autosave
!fade out
!card {翌朝|よくあさ} || The next morning
!warp co.village 24 20 down
!music cinder
!fade in
narr: {北|きた} へ の {道|みち} の {茨|いばら} も 、 {刈|か}り{払|はら}われて いた 。 {雪鈴|ゆきすず} へ の {坂|さか} が 、 {朝日|あさひ} に {白|しろ}く {続|つづ}いて いる 。 || The brambles on the road north have been cut away as well. The slope to Snowbell runs white in the morning sun.
!journal {灰実|はいみ}の{里|さと} は {火事|かじ} を {思|おも}い{出|だ}し 、 {火除|ひよ}け{道|みち} を {刈|か}った 。 {北|きた} の {道|みち} から {雪鈴|ゆきすず} へ 。 || Cinder Orchard remembered its fire and cut its firebreaks. The road north, from the hill road outside the village, leads to Snowbell.

@scene co.lookout_bell
narr: {櫓|やぐら} の {鐘|かね} 。 {新|あたら}しい {綱|つな} の {先|さき} に 、 ゴロウ が {結|むす}んだ {赤|あか}い {布|ぬの} が {付|つ}いて いる 。 || The lookout bell. On the end of the new rope, Gorō has tied a strip of red cloth.
!if !ch3_done -> end
!choice
* {一度|いちど} だけ {鳴|な}らす || Ring it once -> ring
* {鳴|な}らさない || Leave it -> end
:ring
!sfx bell
narr: {澄|す}んだ {音|おと} が 、 {段々畑|だんだんばたけ} に {広|ひろ}がって いった 。 {下|した} で 、 {誰|だれ} か が {手|て} を {振|ふ}った 。 || A clear note spreads out over the terraces. Down below, someone waves.

@scene co.lookout_down
!choice
* {櫓|やぐら} を {下|お}りる || Climb down -> down
* もう {少|すこ}し ここ に いる || Stay a little longer -> end
:down
!fade out
!warp co.village 12 14 down
!fade in

@scene co.lookout_base
!if ch3_done -> climb
!if co_clue_bell -> plain
!set co_clue_bell
narr: {火|ひ} の {見|み} {櫓|やぐら} 。 {上|うえ} に {鐘|かね} が {下|さ}がって いる が 、 {綱|つな} が ない 。 {鐘|かね} だけ が 、 {毎朝|まいあさ} {磨|みが}かれた よう に {光|ひか}って いる 。 || The fire lookout. There's a bell up top, but no rope. Only the bell gleams, as if polished every morning.
?(comp=nao) comp: {火|ひ} の {見|み} {櫓|やぐら} に {綱|つな} が ない 。 {鳴|な}らさない {鐘|かね} を 、 {毎朝|まいあさ} {磨|みが}く 。 {変|へん} な {村|むら} だ 。 || A fire lookout with no rope. A bell nobody rings, polished every morning. Odd place.
?(comp=mio) comp: {火|ひ} の {見|み} {櫓|やぐら} …… {火事|かじ} の ない {里|さと} に 、 なぜ ？ || A fire lookout… in a village that's never had a fire?
?(comp=ren) comp: {火|ひ} の {見|み} {櫓|やぐら} は 、 {火|ひ} を {知|し}って いる {里|さと} に しか {建|た}ちません 。 || Fire lookouts are only built by villages that know fire.
?(comp=suzu) comp[closed]: …… {鳴|な}った の よ 。 {昔|むかし} は あった か な|むかし} 。 {一晩中|ひとばんじゅう} 。 || …It rang, once. Long ago. All night.
!var co_clues + 1
!call co.clue_check
!end
:plain
narr: {綱|つな} の ない {鐘|かね} が 、 {櫓|やぐら} の {上|うえ} で {光|ひか}って いる 。 || The ropeless bell gleams at the top of the lookout.
?(co_bell_done|co_restored) narr: {今|いま} は {綱|つな} が {下|さ}がって いる 。 {先|さき} に {赤|あか}い {布|ぬの} 。 || A rope hangs from it now, with a red cloth tied to the end.
!end
:climb
narr: {火|ひ} の {見|み} {櫓|やぐら} 。 {梯子|はしご} の {下|した} に 、 ゴロウ の {字|じ} で 「 {登|のぼ}って よし 」 と {書|か}いた {札|ふだ} 。 || The fire lookout. At the foot of the ladder, a sign in Gorō's hand: "You may climb."
!choice
* {上|のぼ}る || Climb up -> up
* やめて おく || Not now -> end
:up
!fade out
!warp co.lookout 7 6 up
!fade in
`, 'ch3/end');
