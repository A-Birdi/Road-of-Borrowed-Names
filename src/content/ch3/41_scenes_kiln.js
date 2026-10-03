/* Chapter 3 dungeon: the upper terraces (いし, つち), the old workshop row,
 * the ice house (こおり), the great kiln's chambers and control wall, the
 * Kiln Warden, and the page the kiln kept. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene co.upper_enter
!set co_upper_seen
narr: {柵|さく} の {向|む}こう は 、 {灰|はい} の {色|いろ} の {土地|とち} だった 。 {若|わか}い {柿|かき} の {木|き} が 、 {定規|じょうぎ} で {引|ひ}いた よう に {並|なら}んで いる 。 || Beyond the fence the ground is the colour of ash. Young persimmon trees stand in rows, straight as if ruled.
narr: {古|ふる}い {木|き} は {一本|いっぽん} も ない 。 {黒|くろ}い {切|き}り{株|かぶ} だけ が {残|のこ}って いる 。 || Not one old tree. Only black stumps.
?(comp=nao) comp: {全部|ぜんぶ} {同|おな}じ {年|とし} の {木|き} だ 。 {一度|いちど} に {植|う}えた ん だ な 。 {二百本|にひゃっぽん} 、 か 。 || All the same age. Planted in one go. Two hundred, was it.
?(comp=mio) comp[worry]: {切|き}り{株|かぶ} が {黒|くろ}い 。 {腐|くさ}った {黒|くろ} じゃ なくて 、 {焦|こ}げた {黒|くろ} です 。 || The stumps are black. Not the black of rot — the black of burning.
?(comp=ren) comp: {道|みち} は {一本|いっぽん} 、 {上|うえ} へ 。 …… {私|わたし} でも {分|わ}かります 。 {今日|きょう} は {運|うん} が いい 。 || One path, going up. …Even I can follow that. Lucky day.
?(comp=suzu) comp[closed]: …… ここ まで は 、 {来|こ}なかった 。 あの {夜|よる} は 。 || …I never came this far up. Not that night.
!journal {上|うえ} の {段|だん} を {越|こ}えて 、 {古|ふる}い {工房|こうぼう} {通|どお}り へ 。 {灰|はい} の {蛾|が} に {気|き} を つけろ 。 || Cross the upper terraces to the old workshop row. Watch out for the ash moths.

@scene co.upper_stone
narr: {段|だん} の {角|かど} に 、 {古|ふる}い {石|いし} が {立|た}って いる 。 {字|じ} が {刻|きざ}まれて いる 。 || An old stone stands at the corner of the terrace, carved with words.
narr: 「 {火|ひ} は {来|く}る 。 {火|ひ} は {去|さ}る 。 {石|いし} は {黙|だま}って {残|のこ}る 。 」 || "Fire comes. Fire goes. Stone remains, and says nothing."
?(comp=nao) comp: {石|いし} は {喋|しゃべ}らない けど 、 {嘘|うそ} も つかない 。 {配達|はいたつ} {先|さき} と して は {最高|さいこう} だ 。 || Stone doesn't talk, but it doesn't lie either. Ideal recipient.
?(comp=mio) comp: {火|ひ} が {来|く}る 、 と {書|か}いて ある 。 {来|こ}ない 、 じゃ なくて 。 {昔|むかし} の {人|ひと} は 、 {分|わ}かって いた んです ね 。 || It says fire comes. Not that it doesn't. The founders knew.
?(comp=ren) comp: {石|いし} に {刻|きざ}んだ {字|じ} は 、 {静寂|しじま} でも {消|け}しにくい 。 だから {残|のこ}った の でしょう 。 || Words cut in stone are hard even for the Hush to lift. That's why these survived.
?(comp=suzu) comp: {石|いし} は {黙|だま}って {残|のこ}る 、 か 。 …… {私|わたし} と {逆|ぎゃく} ね 。 よく {喋|しゃべ}って 、 {残|のこ}らない 。 || Stone stays silent and remains. …The opposite of me. I talk a lot and never stay.

@scene co.upper_wall
!if co_w_ishi -> end
narr: {段|だん} の {壁|かべ} の {通|とお}り{道|みち} が 、 {崩|くず}れかけて いる 。 {石|いし} を {一|ひと}つ {動|うご}かす と 、 {上|うえ} から また {一|ひと}つ {落|お}ちて くる 。 || The passage through the terrace wall is crumbling. Move one stone and another slides down from above.
?(comp=nao) comp: {登|のぼ}る と {崩|くず}れる 。 {崩|くず}れる と {登|のぼ}れない 。 {石|いし} に {文句|もんく} を {言|い}って も {仕方|しかた} ない し な 。 || Climb it, it collapses. Collapses, you can't climb it. No use complaining to rocks.
?(comp=mio) comp[think]: {石|いし} が {石|いし} で ある こと を {忘|わす}れて いる みたい 。 {思|おも}い{出|だ}させて あげられ ない かな 。 || It's as if the stones have forgotten they're stones. Could we remind them?
?(comp=ren) comp: {字|じ} で {支|ささ}えられる かも しれません 。 {石|いし} に 、 {石|いし} の {名|な} を 。 || We might be able to hold it with writing. Give the stones their own name.
?(comp=suzu) comp: {舞台|ぶたい} の {大道具|おおどうぐ} と {同|おな}じ よ 。 {名前|なまえ} を {呼|よ}んで あげる と 、 {立|た}つ の 。 …… たぶん 。 || Same as stage sets. Call them by name and they stand up. …Probably.
!challenge co.c_ishi
!if var._res=0 -> later
!word ishi
!sfx reveal
narr: {石|いし} が {互|たが}い に {噛|か}み{合|あ}って 、 {静|しず}か に {止|と}まった 。 {荒|あら}い {石段|いしだん} が できた 。 || The stones lock into each other and go still, forming a rough stair.
?(comp=nao) comp: いし 、 か 。 {風|かぜ} で {飛|と}ばされ そう に なったら 、 それ で {踏|ふ}ん{張|ば}れ 。 {上|うえ} の {蛾|が} 、 {羽|はね} で {風|かぜ} を {起|お}こす から な 。 || Ishi, huh. If a gust tries to knock you over, dig in with that. The moths up there beat up a wind.
?(comp=mio) comp: {石|いし} は {風|かぜ} に も {水|みず} に も {動|うご}かない 。 {覚|おぼ}えて おきます ね 。 || Stone doesn't move for wind or water. I'll remember that.
?(comp=ren) comp: {石|いし} は {風|かぜ} に {動|うご}かない 。 {蛾|が} が {風|かぜ} を {起|お}こしたら 、 {石|いし} を 。 {灯|ひ} の {台座|だいざ} も 、 {石|いし} で {作|つく}ります から ね 。 || Stone doesn't move in wind. When the moths raise a gust — stone. Lantern bases are made of stone for a reason.
?(comp=suzu) comp: {重|おも}し に なる {言葉|ことば} 、 {一|ひと}つ {増|ふ}えた わ ね 。 {風|かぜ} が {来|き}たら 、 {石|いし} 。 || One more word with weight to it. When the wind comes: stone.
!set co_w_ishi
!end
:later
narr: {今|いま} は やめて おこう 。 {石|いし} は {逃|に}げない 。 || Not now. The stones aren't going anywhere.

@scene co.ashband
!if co_w_tsuchi -> seen
narr: {崩|くず}れた {壁|かべ} の {断面|だんめん} に 、 {土|つち} の {層|そう} が {見|み}える 。 {真|ま}ん{中|なか} {辺|あた}り に 、 {黒|くろ}い {線|せん} が {一本|いっぽん} 、 {横|よこ} に {走|はし}って いる 。 || In the broken face of the wall, you can see layers of soil. About halfway down, a single black line runs straight across.
?(comp=nao) comp: …… {灰|はい} だ 。 {焚|た}き{火|び} の {跡|あと} を {埋|う}めた の と 、 {同|おな}じ {色|いろ} を してる 。 || …Ash. Same colour as a campfire that's been buried.
?(comp=mio) comp[think]: {灰|はい} の {層|そう} です 。 {上|うえ} に {積|つ}もった {土|つち} の {厚|あつ}さ から する と …… {二十年|にじゅうねん} {前後|ぜんご} 。 || A layer of ash. From the depth of soil on top… about twenty years.
?(comp=ren) comp: {記録|きろく} は {書|か}き{換|か}えられて も 、 {土|つち} は {書|か}き{換|か}えられ ない 。 …… {灯守|ひもり} の {教本|きょうほん} に 、 {載|の}せたい くらい です 。 || You can rewrite a record, but not the soil. …I'd like to put that in the lantern keepers' handbook.
?(comp=suzu) comp[closed]: …… {土|つち} は 、 {覚|おぼ}えてた の ね 。 || …The soil remembered.
!challenge co.c_tsuchi
!if var._res=0 -> later
!word tsuchi
!sfx reveal
narr: {崩|くず}れて いた {土|つち} が {固|かた}まり 、 {上|うえ} の {段|だん} へ の {踏|ふ}み{段|だん} に なった 。 || The loose soil firms up into a step to the next terrace.
?(comp=nao) comp: つち 。 {水|みず} が {来|き}たら 、 それ で {土手|どて} を {作|つく}る 。 {単純|たんじゅん} で いい 。 || Tsuchi. Water comes, you build a bank. Simple. I like it.
?(comp=mio) comp: {土|つち} は {水|みず} を {止|と}める 。 {薬|くすり} を {煎|せん}じる {時|とき} も 、 {土|つち} の {鍋|なべ} が {一番|いちばん} です 。 || Earth holds back water. When I brew medicine, clay pots are best too.
?(comp=ren) comp: {土|つち} の {字|じ} 。 {十|じゅう} の {下|した} に {一|いち} 。 …… {字源|じげん} の {話|はなし} は 、 やめて おきます 。 {嘘|うそ} に なる と いけない ので 。 || The character for earth. A cross over a line… No, I'll leave the etymology alone. I don't want to make things up.
?(comp=suzu) comp: {足元|あしもと} を {固|かた}める {言葉|ことば} ね 。 {今|いま} の {私|わたし} に {一番|いちばん} {必要|ひつよう} かも 。 || A word for firm footing. Maybe the one I need most right now.
!set co_w_tsuchi co_evidence_soil
!end
:later
narr: {土|つち} の {線|せん} は 、 {逃|に}げ も {隠|かく}れ も しない 。 また {来|こ}よう 。 || The line in the soil isn't going to run or hide. You can come back.
!end
:seen
narr: {灰|はい} の {黒|くろ}い {線|せん} 。 {二十年|にじゅうねん} {分|ぶん} の {土|つち} の {下|した} に 、 ずっと {眠|ねむ}って いた 。 || The black line of ash, asleep under twenty years of soil.

@scene co.upper_lantern
!if co_kiln_done -> lit
narr: {道|みち} の {端|はし} の {灯籠|とうろう} 。 {灯|ひ} は {消|き}えて 、 {笠|かさ} の {字|じ} も {白|しろ}く {抜|ぬ}けて いる 。 || A lantern at the path's edge. Its light is out, and the writing on its shade has faded to blank.
?(comp=ren) comp[think]: {窯|かま} へ {続|つづ}く {道|みち} の {灯|ひ} です 。 {行|い}き{先|さき} ごと {忘|わす}れさせられて いる 。 …… {帰|かえ}り に 、 {書|か}き{直|なお}しましょう 。 {窯|かま} が {名前|なまえ} を {取|と}り{戻|もど}したら 。 || The lantern for the kiln road. It's been made to forget where it leads. …Let's rewrite it on the way back, once the kiln has its name again.
?(comp!=ren) narr: {窯|かま} へ {続|つづ}く {道|みち} の {灯|ひ} なのだろう 。 {行|い}き{先|さき} を {忘|わす}れた {灯|ひ} は 、 {灯|とも}らない 。 || It must be the lantern for the kiln road. A lantern that has forgotten where it leads won't light.
!end
:lit
narr: {笠|かさ} に {字|じ} が {戻|もど}り 、 {灯|ひ} が ともって いる 。 「 {大窯|おおがま} 」 。 || The writing has come back to the shade, and the lantern is lit: 大窯, "the great kiln".
`, 'ch3/upper');

RB.script.add(`
@scene co.oldworks_enter
!set co_oldworks_seen
narr: {焼|や}けた {工房|こうぼう} が 、 {骨|ほね} だけ に なって {並|なら}んで いる 。 {屋根|やね} は なく 、 {壁|かべ} の {柱|はしら} だけ が {空|そら} を {指|さ}して いる 。 || A row of burned workshops stands reduced to bones. No roofs; only wall posts pointing at the sky.
narr: {通|とお}り の {奥|おく} に 、 {大|おお}きな {窯|かま} の {建物|たてもの} 。 {入|い}り{口|ぐち} が 、 {緑|みどり} がかった ガラス で {塞|ふさ}がれて いる 。 || At the end of the row, the great kiln's building. Its doorway is stopped with greenish glass.
?(comp=nao) comp: {逃|に}げ{道|みち} は 、 {来|き}た {道|みち} だけ か 。 …… いや 、 {左|ひだり} の {下|した} に {木戸|きど} が ある 。 {内側|うちがわ} から {閂|かんぬき} だ 。 || Only way out is the way we came? …No — there's a gate down on the left. Barred from this side.
?(comp=mio) comp[sad]: ここ は {工房|こうぼう} で あって 、 {家|いえ} でも あった んです ね 。 {鍋|なべ} が ある 。 {子|こ}ども の {下駄|げた} も 。 || These were workshops — and homes too. There's a cooking pot. A child's clogs.
?(comp=ren) comp: {工房|こうぼう} {通|どお}り 。 {年代記|ねんだいき} に は {一度|いちど} も {出|で}て こなかった {名|な} です 。 || The workshop row. A name that never once appeared in the chronicle.
?(comp=suzu) comp[closed]: {下|した} から {見|み}た 。 この {通|とお}り が 、 {全部|ぜんぶ} {赤|あか}かった 。 || I saw it from below. This whole row, red.

@scene co.works_sign
narr: {焼|や}け{残|のこ}った {看板|かんばん} 。 {煤|すす} の {下|した} に 、 {字|じ} が {読|よ}める 。 「 トモエ ガラス 」 。 || A signboard that survived the fire. Under the soot, the letters are readable: "Tomoe Glass".
?(comp=nao) comp: トモエ 。 …… {誰|だれ} か の {名前|なまえ} が 、 やっと {出|で}て きた な 。 || Tomoe. …Finally, someone's name.
?(comp=mio) comp: {字|じ} が {丁寧|ていねい} です 。 {看板|かんばん} を {大事|だいじ} に して いた {人|ひと} だ 。 || Careful lettering. Someone who took pride in her sign.
?(comp=ren) comp: {看板|かんばん} の {字|じ} は 、 {灯|ひ} の {名|な} と {同|おな}じ で 、 {店|みせ} の {約束|やくそく} です 。 ここ に {来|く}れば 、 トモエ が いる 、 と いう 。 || A shop sign is like a lantern name: a promise. Come here, and you'll find Tomoe.
?(comp=suzu) comp[sad]: …… トモエ さん 。 {名前|なまえ} 、 {初|はじ}めて {知|し}った 。 {二十年|にじゅうねん} も {経|た}って 。 || …Tomoe. I never knew her name. Twenty years, and I never knew.
!set co_saw_tomoe

@scene co.works_sign2
narr: {看板|かんばん} の {板|いた} だけ が 、 {真|ま}っ{白|しろ} だ 。 {焦|こ}げ{跡|あと} {一|ひと}つ ない 。 {字|じ} だけ が 、 {静|しず}か に {持|も}ち{去|さ}られて いる 。 || This signboard is perfectly white. Not a scorch mark on it. Only the letters have been quietly taken away.

@scene co.works_globes
narr: {溶|と}けて {歪|ゆが}んだ ガラス の {火屋|ほや} が 、 {十|とお} ほど {重|かさ}なって {固|かた}まって いる 。 || Around ten lantern globes, melted and warped, have fused into one lump.
?(comp=mio) comp: {祭|まつ}り の {灯籠|とうろう} の {火屋|ほや} です ね 。 {三十個|さんじゅっこ} {焼|や}いて いた 、 と イサオ さん が 。 || The festival lantern globes. Isao said they were firing thirty.

@scene co.works_lantern
!if co_kiln_done -> lit
narr: {工房|こうぼう} {通|どお}り の {灯籠|とうろう} 。 {油|あぶら} は {残|のこ}って いる のに 、 {芯|しん} に {火|ひ} が {付|つ}かない 。 || The workshop row's lantern. There's still oil in it, but the wick won't take a flame.
?(comp=ren) comp: {名|な} の ない {灯籠|とうろう} は 、 {灯|とも}りません 。 ここ の {名|な} が {戻|もど}る まで 、 {待|ま}って いて ください 。 || A lantern without a name won't light. Wait a little longer, until this place has its name back.
!end
:lit
narr: {工房|こうぼう} {通|どお}り の {灯籠|とうろう} に 、 {火|ひ} が {入|はい}って いる 。 {笠|かさ} に 、 {字|じ} が {戻|もど}って いる 。 「 {工房|こうぼう} {通|どお}り 」 。 || The workshop row's lantern has a flame in it now. Its shade has its writing back: 工房通り, "Workshop Row".

@scene co.kiln_seal
!if co_seal_broken -> end
narr: {大窯|おおがま} の {入|い}り{口|ぐち} は 、 {溶|と}けた ガラス で {封|ふう}じられて いる 。 {手|て} を {近|ちか}づける と 、 まだ {温|あたた}かい 。 || The great kiln's doorway is sealed with melted glass. Hold your hand near it: it's still warm.
!if word.koori -> crack
?(comp=nao) comp: {叩|たた}いて も {割|わ}れない な 。 {熱|あつ}い ガラス を {急|きゅう}に {冷|ひ}やす と {割|わ}れる 、 って ヒロ が {言|い}ってた ろ 。 {水|みず} じゃ {湯気|ゆげ} に なる だけ だ 。 もっと {冷|つめ}たい もの が {要|い}る 。 || Hitting it won't break it. Hiro said hot glass cracks if you cool it too fast. Water'll just turn to steam. We need something colder.
?(comp=mio) comp[think]: {冷|ひ}やせば {割|わ}れる かも 。 でも {水|みず} だと すぐ {湯気|ゆげ} に なって しまう 。 もっと {冷|つめ}たい もの …… {氷|こおり} とか 。 || If we chill it, it might crack. But water would just boil off. Something colder… like ice.
?(comp=ren) comp: {封|ふう} は {熱|ねつ} で {保|たも}たれて います 。 {熱|ねつ} を {奪|うば}えば …… {水|みず} より {冷|つめ}たい {字|じ} が あれば 。 || The seal holds because it's hot. Take the heat away… if only we had a word colder than water.
?(comp=suzu) comp: {熱|あつ}い {舞台|ぶたい} に は 、 {冷|つめ}たい {客|きゃく} が {一番|いちばん} {効|き}く の よ 。 …… {冗談|じょうだん} じゃ なくて 、 {氷|こおり} が {要|い}る わ 。 || Nothing kills a hot show like a cold audience. …Not a joke: we need ice.
narr: {通|とお}り の {東|ひがし} に 、 {石|いし} で {囲|かこ}った {小屋|こや} が ある 。 {冷|つめ}たい {空気|くうき} が {漏|も}れて きて いる 。 || East along the row there's a stone-walled hut. Cold air is seeping from it.
!end
:crack
narr: {封|ふう} は まだ {温|あたた}かい 。 {急|きゅう}に {冷|ひ}やせば …… || The seal is still warm. Cool it suddenly, and…
!challenge co.c_seal
!if var._res=0 -> end
!sfx reveal
!shake
narr: {冷気|れいき} が {走|はし}る と 、 {封|ふう} に {細|ほそ}い {罅|ひび} が {入|はい}り 、 {次|つぎ} の {瞬間|しゅんかん} 、 {音|おと} を {立|た}てて {崩|くず}れ{落|お}ちた 。 || The cold runs across it; a fine crack appears, and in the next moment the seal gives way and falls with a crash.
?(comp=nao) comp: {開|あ}いた 。 …… {中|なか} から {熱気|ねっき} が {来|く}る ぞ 。 {二十年|にじゅうねん} {閉|と}じてた {窯|かま} の {熱|ねつ} じゃ ない 。 || It's open. …Heat's coming out. That's not the heat of a kiln shut for twenty years.
?(comp=mio) comp[worry]: {熱|あつ}い …… {中|なか} で は 、 こまめ に {水|みず} を {飲|の}んで ください ね 。 {約束|やくそく} です よ 。 || It's hot… Drink water often in there. Promise me.
?(comp=ren) comp: {窯|かま} が {息|いき} を して います 。 {気|き} を つけて 。 || The kiln is breathing. Careful.
?(comp=suzu) comp: {幕|まく} が {開|あ}いた わ 。 {第二幕|だいにまく} 、 {窯|かま} の {中|なか} 。 || Curtain up. Act two: inside the kiln.
!set co_seal_broken

@scene co.shortcut_open
!if co_shortcut -> end
narr: {木戸|きど} に {重|おも}い {閂|かんぬき} が {掛|か}かって いる 。 {持|も}ち{上|あ}げる と 、 {段々畑|だんだんばたけ} へ {下|くだ}る {細|ほそ}い {道|みち} が {見|み}えた 。 || A heavy bar lies across the gate. When you lift it, a narrow path shows, running straight down to the terraces.
!sfx door
!set co_shortcut
?(comp=nao) comp: {近道|ちかみち} {完成|かんせい} 。 {帰|かえ}り は {楽|らく} だ 。 {配達人|はいたつにん} の {宝|たから} だ よ 、 こういう の は 。 || Shortcut made. Easy trip home. That's a courier's treasure, that is.
?(comp=mio) comp[smile]: {帰|かえ}り {道|みち} が {近|ちか}く なりました ね 。 よかった 。 || The way home just got shorter. Good.
?(comp=ren) comp: {帰|かえ}り {道|みち} が {一本|いっぽん} に なりました 。 …… {迷|まよ}い {様|よう} が ありません 。 {素晴|すば}らしい 。 || One straight road home. …Impossible to get lost. Wonderful.
?(comp=suzu) comp: {楽屋|がくや} {口|ぐち} ね 。 {終|お}わったら 、 ここ から {帰|かえ}れる 。 || The stage door. When it's over, we can slip out this way.
!toast {近道|ちかみち} が {開|ひら}いた || A shortcut to the terraces is open
`, 'ch3/oldworks');

RB.script.add(`
@scene co.ice_enter
narr: {石|いし} の {壁|かべ} の {内側|うちがわ} は 、 {息|いき} が {白|しろ}く なる ほど {冷|つめ}たかった 。 {外|そと} の {暑|あつ}さ が 、 {嘘|うそ} の よう だ 。 || Inside the stone walls it's cold enough to see your breath. The heat outside might never have existed.
narr: {藁|わら} の {山|やま} の {間|あいだ} に 、 {青白|あおじろ}い {塊|かたまり} が いくつ も {眠|ねむ}って いる 。 || Between heaps of straw, bluish-white blocks lie sleeping.
?(comp=nao) comp: {氷室|ひむろ} だ 。 {夏|なつ} に {氷|こおり} を {売|う}る {家|いえ} が 、 {昔|むかし} は {山|やま} に こういう の を {持|も}ってた 。 || An ice house. Families who sold ice in summer used to keep these in the hills.
?(comp=mio) comp[smile]: …… {涼|すず}しい 。 ちょっと だけ 、 ここ で {休|やす}んで も いい です か 。 {三十|さんじゅう} {数|かぞ}える あいだ だけ 。 || …It's cool. Could we rest here, just a little? Just while I count to thirty.
?(comp=ren) comp: {静|しず}か な {場所|ばしょ} です 。 {静寂|しじま} の {静|しず}けさ と は {違|ちが}う 。 {音|おと} が {休|やす}んで いる だけ の 、 {静|しず}けさ 。 || A quiet place. Not the Hush's kind of quiet. The kind where sound is just resting.
?(comp=suzu) comp[smile]: {楽屋|がくや} みたい 。 {本番|ほんばん} {前|まえ} の 、 {一番|いちばん} {静|しず}か な {時間|じかん} 。 || Like a dressing room. The quietest moment before curtain.

@scene co.ice_marker
narr: {奥|おく} の {石|いし} に 、 {二文字|にもじ} だけ {彫|ほ}って ある 。 「 {氷室|ひむろ} 」 。 {下|した} に {小|ちい}さく 、 「 {祭|まつ}り {用|よう} 」 。 || Two characters are carved on the back stone: 氷室, "ice house". Below, smaller: "for the festival".

@scene co.ice_block
!if co_w_koori -> seen
narr: {藁|わら} を {除|の}ける と 、 {透|す}き{通|とお}った {氷|こおり} が {現|あらわ}れた 。 {中|なか} に 、 {柿|かき} の {葉|は} が {一枚|いちまい} 、 {閉|と}じ{込|こ}められて いる 。 || Under the straw lies clear ice. Inside it, a single persimmon leaf is sealed.
?(comp=nao) comp: {二十年前|にじゅうねんまえ} の {秋|あき} の {葉|は} 、 か 。 {届|とど}け{損|そこ}ねた {荷物|にもつ} みたい だ 。 || A leaf from twenty autumns ago. Like a parcel that never got delivered.
?(comp=mio) comp: {冬|ふゆ} に {切|き}り{出|だ}して 、 {祭|まつ}り の かき{氷|ごおり} に {使|つか}う はず だった の かも 。 || Maybe it was cut in winter, meant for shaved ice at the festival.
?(comp=ren) comp: {誰|だれ} も {取|と}り に {来|こ}なかった {氷|こおり} 。 …… {待|ま}ち{続|つづ}ける もの は 、 {冷|つめ}たく なる の でしょう か 。 {温|あたた}かい まま では 、 いられない の でしょう か 。 || Ice no one ever came to collect. …Do things that keep waiting always go cold? Can't they stay warm?
?(comp=suzu) comp[closed]: {溶|と}ける に {溶|と}けられない 、 か 。 …… {分|わ}かる わ 。 || Can't melt, even if it wanted to. …I know the feeling.
!challenge co.c_koori
!if var._res=0 -> later
!word koori
!sfx reveal
narr: {手|て} の {中|なか} で 、 {冷|つめ}たさ が {字|じ} に なった 。 {窯|かま} の {熱|ねつ} に 、 もう {一|ひと}つ の {答|こた}え が できた 。 || In your hand, the cold becomes a word. Now there are two ways to answer the kiln's heat.
?(comp=nao) comp: みず と こおり 。 {火|ひ} に {出|だ}す {札|ふだ} が {二枚|にまい} に なった 。 {悪|わる}く ない 。 || Water and ice. Two cards to play against fire. Not bad.
?(comp=mio) comp: {熱|ねつ} を {冷|さ}ます の は 、 {水|みず} でも {氷|こおり} でも いい 。 {患者|かんじゃ} に よって {使|つか}い{分|わ}けます 。 {敵|てき} も {同|おな}じ です ね 。 || Water or ice — either cools a fever. You choose by the patient. Same with enemies, I suppose.
?(comp=ren) comp: {水|みず} と {氷|こおり} 。 {同|おな}じ もの の {違|ちが}う {名|な} 。 どちら で {呼|よ}んで も 、 {熱|ねつ} は {応|こた}える でしょう 。 || Water and ice. Different names for the same thing. Call it either way and heat will answer.
?(comp=suzu) comp: {氷|こおり} って 、 {冷|つめ}たい {顔|かお} して 、 {実|じつ} は {熱|ねつ} を {引|ひ}き{受|う}けて くれる の よ ね 。 …… {誰|だれ} か に {似|に}てる 。 || Ice looks cold, but really it takes the heat on itself. …Reminds me of someone.
!set co_w_koori
!end
:later
narr: {氷|こおり} は まだ しばらく {溶|と}けない 。 また {来|こ}よう 。 || The ice won't melt for a while yet. You can come back.
!end
:seen
narr: {柿|かき} の {葉|は} を {閉|と}じ{込|こ}めた {氷|こおり} 。 {藁|わら} を {元|もと} どおり に かけて おいた 。 || The ice with the persimmon leaf inside. You put the straw back over it.
`, 'ch3/ice');

RB.script.add(`
@scene co.kiln_enter
!set co_kiln_seen
narr: {窯|かま} の {中|なか} は 、 {二十年|にじゅうねん} {火|ひ} を {入|い}れて いない と は {思|おも}えない ほど {熱|あつ}かった 。 || Inside, the kiln is far too hot for something that hasn't been fired in twenty years.
narr: {斜面|しゃめん} に {沿|そ}って 、 {部屋|へや} が {三|みっ}つ {上|うえ} へ {続|つづ}いて いる 。 {壁|かべ} の {文字|もじ} の {札|ふだ} が 、 あちこち に {落|お}ちて いる 。 || Three chambers climb the slope one above the other. Carved tiles from the walls lie scattered on the floor.
?(comp=nao) comp: {出口|でぐち} は {入|い}り{口|ぐち} だけ 。 {最高|さいこう} だ な 。 …… {冗談|じょうだん} だ よ 。 {行|い}こう 。 || The only exit is the entrance. Lovely. …Joking. Let's go.
?(comp=mio) comp[worry]: {水|みず} 、 {飲|の}んで ください 。 {今|いま} です 。 {喉|のど} が {渇|かわ}く {前|まえ} に 。 || Drink some water. Now. Before you're thirsty.
?(comp=ren) comp[smirk]: {窯|かま} の {中|なか} でも 、 {私|わたし} は {構|かま}いません 。 …… {今|いま} の は {聞|き}かなかった こと に して ください 。 || Even inside a kiln, I kilnt complain. …Please pretend you didn't hear that.
?(comp=suzu) comp: {客席|きゃくせき} が {暑|あつ}すぎる {芝居|しばい} は 、 {大体|だいたい} {短|みじか}い の 。 …… {短|みじか}く {終|お}わらせよう 。 || Plays with overheated audiences are usually short ones. …Let's keep this short.
!checkpoint co.kiln 14 22 up
!autosave
!toast {窯|かま} の {入|い}り{口|ぐち} で {記録|きろく} した || Progress saved at the kiln entrance

@scene co.tablet1
!set co_tab1
!var co_tablets + 1
narr: {割|わ}れた {札|ふだ} を {拾|ひろ}った 。 {窯焚|かまだ}き の {手順|てじゅん} が {刻|きざ}まれて いる 。 {最初|さいしょ} の {一枚|いちまい} の よう だ 。 || You pick up a cracked tile carved with a step of the firing. It looks like the first of them.
!call co.tablet_count

@scene co.tablet2
!set co_tab2
!var co_tablets + 1
narr: ガラス の {床|ゆか} の {隅|すみ} に 、 {札|ふだ} が {埋|う}もれて いた 。 {火|ひ} の {色|いろ} に ついて {書|か}いて ある 。 || A tile lies half buried at the edge of the glass floor. It says something about the colour of the flame.
!call co.tablet_count

@scene co.tablet3
!set co_tab3
!var co_tablets + 1
narr: {一番|いちばん} {上|うえ} の {部屋|へや} で 、 {最後|さいご} の {札|ふだ} を {拾|ひろ}った 。 {余白|よはく} に 、 {違|ちが}う {字|じ} で {何|なに} か {書|か}き{足|た}して ある 。 || In the top chamber you find the last tile. Something has been added in the margin, in a different hand.
!call co.tablet_count

@scene co.tablet_count
!if var.co_tablets>=3 -> all
!toast {窯|かま} の {札|ふだ} を {拾|ひろ}った || Kiln tile recovered
!end
:all
!toast {札|ふだ} が {揃|そろ}った 。 {上|うえ} の {部屋|へや} の {壁|かべ} へ || All the tiles found — take them to the wall in the top chamber
?(comp=nao) comp: {全部|ぜんぶ} {揃|そろ}った 。 {上|うえ} の {壁|かべ} に {穴|あな} が {三|みっ}つ あった な 。 || That's all of them. There were three gaps in the wall up top.
?(comp=mio) comp: {三枚|さんまい} {揃|そろ}いました 。 {壁|かべ} に {戻|もど}しましょう 。 {順番|じゅんばん} を {間違|まちが}え ない よう に 。 || All three. Let's put them back in the wall — in the right order.
?(comp=ren) comp: {手順|てじゅん} の {札|ふだ} は 、 {順番|じゅんばん} こそ が {意味|いみ} です 。 {灯|ひ} の {名|な} の {字|じ} と {同|おな}じ で 。 || With instruction tiles, the order is the meaning. Like the characters in a lantern name.
?(comp=suzu) comp: {台本|だいほん} の {頁|ページ} が {揃|そろ}った わ 。 {順番|じゅんばん} を {間違|まちが}えたら 、 {喜劇|きげき} に なっちゃう 。 || All the script pages. Get them in the wrong order and it turns into a comedy.

@scene co.kiln_wall
!if co_kiln_open -> end
narr: {一番|いちばん} {上|うえ} の {部屋|へや} の {壁|かべ} に 、 {窯焚|かまだ}き の {手順|てじゅん} の {札|ふだ} を {嵌|は}める {穴|あな} が ある 。 {横|よこ} に {窓|まど} が {二|ふた}つ 。 {上|うえ} と {下|した} 。 || In the wall of the top chamber are slots for the firing-instruction tiles. Beside them, two vents: upper and lower.
!if var.co_tablets<3 -> missing
narr: {覗|のぞ}き{窓|まど} の {奥|おく} で 、 {火|ひ} が {揺|ゆ}れて いる 。 {窯|かま} は 、 あの {夜|よる} の {窯焚|かまだ}き の {途中|とちゅう} の まま {止|と}まって いる 。 || Through the peephole a flame is wavering. The kiln has stopped mid-firing, still on that night.
?(comp=ren) comp: {手順|てじゅん} を {正|ただ}しく {読|よ}めば 、 {窯|かま} は {落|お}ち{着|つ}く かも しれません 。 {火|ひ} も また 、 {名|な} を {待|ま}って いる 。 || If we read the steps correctly, the kiln may settle. Fire is waiting for its name too.
!lesson kana
!challenge co.c_kiln
!if var._res=0 -> later
!sfx reveal
narr: {札|ふだ} が {全部|ぜんぶ} {収|おさ}まり 、 {上|うえ} の {窓|まど} が {開|ひら}いた 。 {窯|かま} {全体|ぜんたい} が 、 {長|なが}い {息|いき} を {吐|は}いた よう に {鳴|な}った 。 || Every tile slides home and the upper vent opens. The whole kiln sighs, like a long breath let out.
narr: {焚口|たきぐち} を {塞|ふさ}いで いた ガラス が 、 {音|おと} も なく {透|す}き{通|とお}って いく 。 || The glass stopping the firebox mouth turns clear without a sound.
?(comp=nao) comp: {今夜|こんや} は {風|かぜ} が ない 。 だから {開|あ}けて いい 。 …… あの {夜|よる} は 、 {違|ちが}った わけ だ 。 || No wind tonight, so opening it is fine. …That night, it wasn't.
?(comp=mio) comp[sad]: 「 {風|かぜ} の {強|つよ}い {夜|よる} は {開|ひら}く べからず 」 。 トモエ さん の {字|じ} でした ね 。 || "On windy nights, do not open." That was Tomoe's hand.
?(comp=ren) comp: {余白|よはく} の {一行|いちぎょう} が 、 {本文|ほんぶん} より {大事|だいじ} な こと が ある 。 {灯守|ひもり} の {帳面|ちょうめん} も 、 そう です 。 || Sometimes one line in the margin matters more than the main text. It's the same in a lantern keeper's notebook.
?(comp=suzu) comp[closed]: {書|か}き{足|た}しって 、 {大抵|たいてい} {誰|だれ} か が {一度|いちど} {失敗|しっぱい} した {後|あと} に {書|か}く もの よ ね 。 || Notes in the margin usually get written after someone's made the mistake once.
!set co_kiln_open
!autosave
!end
:missing
narr: {札|ふだ} が {足|た}りない 。 {嵌|は}める {穴|あな} が 、 まだ {空|あ}いて いる 。 {窯|かま} の {部屋|へや} の どこか に {落|お}ちて いる はず だ 。 || Tiles are missing: some of the slots are still empty. They must be lying somewhere in the chambers.
!end
:later
narr: {札|ふだ} を {手|て} に した まま 、 {少|すこ}し {考|かんが}える こと に した 。 || You decide to think a little longer, tiles in hand.
narr: {札|ふだ} の {字|じ} そのもの に 、 {順番|じゅんばん} を {表|あらわ}す {言葉|ことば} が ある 。 {壁|かべ} の {札|ふだ} は 、 {戻|もど}って くる まで {動|うご}かない 。 || The tiles' own words carry their order. The wall will wait until you come back.

@scene co.kiln_wall_done
narr: {上|うえ} の {窓|まど} が {開|ひら}いて いる 。 {窯|かま} の {中|なか} の {空気|くうき} は 、 {静|しず}か に {上|うえ} へ {流|なが}れて いる 。 {風|かぜ} の ない {夜|よる} の よう に 。 || The upper vent stands open. The air in the kiln flows quietly upward, as on a windless night.

@scene co.firebox
!if !co_kiln_open -> sealed
!if co_warden_down -> after
narr: {焚口|たきぐち} の {奥|おく} に 、 {窯|かま} の {心臓|しんぞう} が {見|み}える 。 {何|なに} か が 、 そこ で {待|ま}って いる 。 || Through the firebox mouth, the heart of the kiln. Something is waiting there.
!choice
* {奥|おく} へ {進|すす}む || Go in -> in
* まだ {準備|じゅんび} を する || Not yet -> end
:in
!checkpoint co.kiln 20 5 up
!fade out
!warp co.kiln_core 7 9 up
!fade in
!end
:after
!choice
* {奥|おく} へ {戻|もど}る || Go back into the heart -> in2
* やめて おく || Stay here -> end
:in2
!warp co.kiln_core 7 9 up
!end
:sealed
narr: {焚口|たきぐち} は 、 {分厚|ぶあつ}い ガラス で {塞|ふさ}がれて いる 。 {壁|かべ} の {手順|てじゅん} の {札|ふだ} と {窓|まど} が 、 {関係|かんけい} して いる らしい 。 || The firebox mouth is stopped with thick glass. It seems to be tied to the instruction tiles and vents on the wall.
`, 'ch3/kiln');

RB.script.add(`
@scene co.warden_fight
!music -
narr: {窯|かま} の {奥|おく} は 、 {橙色|だいだいいろ} に {明|あか}るかった 。 {焼|や}けた {土|つち} と ガラス で できた {体|からだ} が 、 ゆっくり {立|た}ち{上|あ}がる 。 || The heart of the kiln glows orange. A body of fired clay and glass slowly rises to its feet.
co_warden: …… {誰|だれ} も {入|い}れる な 。 {窯|かま} を {守|まも}れ 。 {火|ひ} を {外|そと} へ {出|だ}す な 。 || …Let no one in. Guard the kiln. Do not let the fire out.
?(comp=nao) comp: {窯|かま} の {番人|ばんにん} か 。 {命令|めいれい} だけ {覚|おぼ}えて 、 {理由|りゆう} を {忘|わす}れた {顔|かお} だ 。 || The kiln's warden. Remembers the orders, forgot the reasons. You can see it.
?(comp=mio) comp[worry]: {苦|くる}しそう …… {熱|ねつ} を {冷|さ}まして あげれば 、 {話|はなし} が できる かも しれない 。 {水|みず} でも 、 {氷|こおり} でも 。 || It looks like it's suffering… If we bring its fever down, maybe it'll talk. Water or ice, either.
?(comp=ren) comp: {静寂|しじま} が {窯|かま} の {最後|さいご} の {言|い}い{付|つ}け に 、 {形|かたち} を {与|あた}えた の でしょう 。 {熱|ねつ} は {水|みず} か {氷|こおり} で 。 {嘘|うそ} は 、 {見抜|みぬ}いて 。 || The Hush gave shape to the kiln's last order, I think. Heat — answer it with water or ice. Lies — see through them.
?(comp=suzu) comp: {舞台|ぶたい} の {真|ま}ん{中|なか} に {出|で}て きた わ ね 。 …… さあ 、 {主役|しゅやく} の {登場|とうじょう} よ 。 {熱|あつ}く なったら 、 {冷|ひ}やして あげて 。 || Stepped right out to centre stage. …Here comes the lead. When it heats up, cool it down.
!battle co.warden noflee
!set co_warden_down
!music kiln
narr: {番人|ばんにん} の {体|からだ} から {熱|ねつ} が {抜|ぬ}け 、 {土|つち} と ガラス が {静|しず}か に {崩|くず}れた 。 その {跡|あと} に 、 {割|わ}れて いない {火屋|ほや} が {一|ひと}つ と 、 {焦|こ}げた {紙|かみ} が {一枚|いちまい} {残|のこ}って いた 。 || The heat leaves the warden's body, and the clay and glass settle quietly apart. Where it stood lie one unbroken lantern globe and a single scorched sheet of paper.
?(comp=nao) comp: {水門|すいもん} は {開|あ}いた か 、 って {聞|き}いた な 。 …… {開|あ}いた ん だろう な 。 {下|した} の {里|さと} は {残|のこ}ってる 。 || It asked if the water gate opened. …It must have. The village below is still standing.
?(comp=mio) comp[sad]: {最後|さいご} まで 、 {誰|だれ} か の {心配|しんぱい} を して いました ね 。 || Right to the end, it was worried about someone else.
?(comp=ren) comp: {答|こた}え を {聞|き}けず に 、 {二十年|にじゅうねん} 。 …… {灯|ひ} も 、 {人|ひと} も 、 {答|こた}え を {待|ま}つ の は {辛|つら}い 。 || Twenty years without an answer. …For lanterns and people alike, waiting for an answer is hard.
?(comp=suzu) comp[sad]: …… {開|あ}いた わ よ 。 あなた の おかげ で 、 {下|した} は {助|たす}かった 。 || …It opened. Thanks to you, the village below was saved.
!autosave

@scene co.core_lantern
!if item.co_globe -> taken
!if co_hiro_globe -> taken
narr: {三十個|さんじゅっこ} の {火屋|ほや} の うち 、 {一|ひと}つ だけ {割|わ}れず に {残|のこ}った もの 。 {底|そこ} に 、 {小|ちい}さく 「 トモエ 」 と {刻|きざ}まれて いる 。 || The one lantern globe of the thirty that didn't break. Scratched small on its base: トモエ.
!give co_globe
?(comp=nao) comp: {届|とど}け{先|さき} は 、 {決|き}まってる な 。 || We know exactly where this gets delivered.
?(comp=mio) comp: {割|わ}らない よう に 、 {布|ぬの} で {包|つつ}みましょう 。 …… ええ 、 {私|わたし} が {持|も}ちます 。 {慣|な}れて います から 。 || Let's wrap it in cloth so it doesn't break. …Yes, I'll carry it. I'm used to fragile things.
?(comp=ren) comp: {作|つく}った {人|ひと} の {名|な} が 、 {作|つく}った もの に {残|のこ}って いる 。 {灯|ひ} と {同|おな}じ です 。 || The maker's name, left on the thing she made. Just like a lantern.
?(comp=suzu) comp[sad]: …… ヒロ に 、 {渡|わた}そう 。 {私|わたし} の {口|くち} から じゃ なくて 、 これ が {先|さき} に {話|はな}して くれる かも 。 || …Let's give it to Hiro. Maybe this can speak before I do.
!end
:taken
narr: {火屋|ほや} が {置|お}いて あった {場所|ばしょ} に 、 {丸|まる}い {跡|あと} が {残|のこ}って いる 。 || A round mark remains where the globe stood.

@scene co.core_page
!if co_logpage_taken -> end
!speakerless co_tomoe
narr: {焦|こ}げた {紙|かみ} を {拾|ひろ}い{上|あ}げる 。 {窯焚|かまだ}き {日誌|にっし} の 、 {最後|さいご} の {頁|ページ} だ 。 || You pick up the scorched paper. It's the last page of the kiln's firing log.
narr: {指|ゆび} が {触|ふ}れた {瞬間|しゅんかん} 、 {窯|かま} の {中|なか} が 、 {一瞬|いっしゅん} だけ {二十年前|にじゅうねんまえ} の {夜|よる} に {戻|もど}った 。 || The instant your fingers touch it, for one moment, the kiln is back on that night twenty years ago.
!music co_fire
co_tomoe: トキワ 、 {火|ひ} が {白|しろ}く なった ね 。 …… {上|うえ} の {窓|まど} ？ {開|あ}けた の ？ この {風|かぜ} で ？ || Tokiwa, it's gone white. …The upper vent? You opened it? In this wind?
narr: {若|わか}い {声|こえ} が {何|なに} か {言|い}い かけて 、 {風|かぜ} の {音|おと} に かき{消|け}された 。 || A young voice starts to answer and is swallowed by the wind.
co_tomoe: いい 、 {今|いま} は いい 。 …… ヒロ 、 おいで 。 {頭|あたま} に これ を {巻|ま}いて おき な 。 {火|ひ} の {粉|こ} が {熱|あつ}い から ね 。 || Never mind — not now. …Hiro, come here. Tie this round your head. The sparks are hot.
co_tomoe: トキワ 、 {子|こ}ども たち を {連|つ}れて {水路|すいろ} へ 。 {振|ふ}り{返|かえ}らない で 。 || Tokiwa — take the children down to the channel. Don't look back.
co_tomoe: わたし は {水門|すいもん} を {開|あ}け に {行|い}く 。 {水|みず} が {段|だん} に {回|まわ}れば 、 {下|した} の {里|さと} は {助|たす}かる 。 || I'm going up to open the water gate. If the water reaches the terraces, the village below will be saved.
narr: {声|こえ} は そこ で {途切|とぎ}れた 。 {窯|かま} の {熱|ねつ} が 、 すっと {引|ひ}いて いく 。 || The voice stops there. The heat drains out of the kiln.
narr: {頁|ページ} の {最後|さいご} に 、 {走|はし}り{書|が}き が {残|のこ}って いる 。 「 {十四日|じゅうよっか} {夜|よる} 。 {上|うえ} の {窓|まど} 、 {開|あ}く 。 {風|かぜ} {強|つよ}し 。 {火|ひ} の {粉|こ} 、 {上|うえ} の {段|だん} へ 。 {水門|すいもん} へ {行|い}く 。 ── トモエ 」 || At the bottom of the page, a hurried note: "14th, night. Upper vent open. Strong wind. Sparks onto the upper terraces. Going to the water gate. — Tomoe"
!give co_logpage
!set co_logpage_taken co_kiln_done
!quest co_main 7
?(comp=nao) comp: …… {配達|はいたつ} {物|ぶつ} が {一|ひと}つ {増|ふ}えた 。 {一番|いちばん} {重|おも}い やつ だ 。 {丁寧|ていねい} に {届|とど}けよう 。 || …One more delivery. The heaviest kind. We'll deliver it carefully.
?(comp=mio) comp[sad]: {最後|さいご} まで 、 {子|こ}ども の {頭|あたま} の {心配|しんぱい} を して いた 。 …… {火|ひ} の {粉|こ} が {熱|あつ}い から 、 って 。 || To the very end she was worrying about a child's head. …Because the sparks are hot.
?(comp=ren) comp: {窯|かま} は 、 {自分|じぶん} の {記録|きろく} を {守|まも}って いた んです ね 。 {年代記|ねんだいき} が {忘|わす}れて も 。 || The kiln kept its own record. Even when the chronicle forgot.
?(comp=suzu) comp[closed]: …… {頭|あたま} に {巻|ま}いて おき な 、 か 。 {帰|かえ}ろう 、 $name 。 {言|い}わなきゃ いけない こと が ある 。 || …Tie this round your head, hm. Let's go back, $name. There's something I have to say.
!autosave
!choice
* {里|さと} へ {戻|もど}る （ {近道|ちかみち} を {通|とお}る ） || Head straight back to the village (by the shortcut) -> home
* もう {少|すこ}し {窯|かま} に いる || Stay in the kiln a little longer -> end
:home
!set co_shortcut
!fade out
!warp co.village 24 3 down
!fade in
!call co.kiln_return
`, 'ch3/core');
