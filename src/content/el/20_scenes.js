/* East Landing's scenes (expansion P11d; the map, Genroku, the quest and the wiring in 01_region.js, the tasks in
 * 30_learning.js). Genroku and his terms; the notice and who answers it (Daigo, Sōta and Hama, from Saltglass); the
 * channel dug and the jetty mended, each finished by the next visit; the bell he kept, hung again; the landing open
 * to boats. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene el.first
# Round the east beach: a silted inlet, a jetty with planks missing, a shack, and an old man sweeping the jetty's head.
!set el_seen
narr: {浜|はま} を {回|まわ}る と 、 {小|ちい}さな {入|い}り{江|え} に {出|で}た 。 {砂|すな} で {浅|あさ}く なった {水|みず} 、 {板|いた} の {抜|ぬ}けた {桟橋|さんばし} 。 {老人|ろうじん} が {一人|ひとり} 、 {桟橋|さんばし} の {根元|ねもと} を {掃|は}いて いる 。 || Round the beach you come out on a small inlet: water gone shallow with sand, a jetty with planks missing. An old man is sweeping at the foot of the jetty.
?(comp=nao) comp: {東|ひがし} の {渡|わた}し{場|ば} …… {宛先|あてさき} {不明|ふめい} で {戻|もど}って くる {手紙|てがみ} の 、 {宛名|あてな} の {場所|ばしょ} だ 。 || East Landing… The address on letters that come back "addressee unknown".
?(comp=mio) comp[think]: {誰|だれ} も {使|つか}わない {桟橋|さんばし} を 、 {掃除|そうじ} して いる ん です ね 。 || He's sweeping a jetty no one uses.
?(comp=ren) comp: {灯|ひ} の {消|き}えた {灯籠|とうろう} を 、 {毎日|まいにち} {磨|みが}く {人|ひと} を {知|し}って います 。 {同|おな}じ {顔|かお} です 。 || I've known people who polish a lantern that's gone out, every day. He has the same face.
?(comp=suzu) comp: {幕|まく} が {下|お}りた {後|あと} の {舞台|ぶたい} を {掃|は}く {人|ひと} ね 。 {次|つぎ} の {幕|まく} を 、 {待|ま}ってる の かしら 。 || Someone sweeping the stage after the curtain's come down. Is he waiting for the next act?

@scene el.genroku_first
# Genroku, before any terms: suspicious of anyone from the harbour; the landing's story; nobody touches it.
!faceplayer
el_genroku: …… {港|みなと} の {回|まわ}し{者|もの} か 。 わし を {追|お}い{出|だ}し に {来|き}た なら 、 {帰|かえ}れ 。 || …One of the harbour's lot? If you've come to clear me off, go back.
el_genroku: ここ は セト の {家|いえ} の {渡|わた}し{場|ば} だった 。 {三十年|さんじゅうねん} {前|まえ} 、 {砂|すな} が {溜|た}まって 、 {船|ふね} は {石|いし} の {岸壁|がんぺき} へ {行|い}って しまった 。 {鐘|かね} の {工房|こうぼう} も な 。 || This was the Seto family's landing. Thirty years ago the sand built up and the boats went off to the stone quay. The bell workshop too.
el_genroku: それ でも 、 ここ は {渡|わた}し{場|ば} だ 。 {勝手|かって} に {触|さわ}る な 。 || It's a landing all the same. Nobody touches it without my say.
?(comp=nao) comp: …… {渡|わた}し{場|ば} が {戻|もど}れば 、 {宛先|あてさき} {不明|ふめい} の {手紙|てがみ} も 、 {届|とど}く よう に なる 。 || …If the landing came back, those "addressee unknown" letters would arrive too.
?(comp=mio) comp: {壊|こわ}す つもり は ありません 。 {話|はなし} を {聞|き}かせて ください 。 || We don't mean to tear anything down. Tell us about it.
?(comp=ren) comp: {守|まも}って きた もの を 、 {守|まも}った まま {直|なお}す {方法|ほうほう} も ある はず です 。 || There must be a way to mend what you've kept, and keep it still.
?(comp=suzu) comp: {小屋|こや} を {建|た}て{直|なお}す {時|とき} は 、 {古|ふる}い {座長|ざちょう} の {話|はなし} から {聞|き}く もの よ 。 || When you rebuild a theatre, you start by listening to the old company head.
!quest el_rebuild 0
!journal {東|ひがし} の {渡|わた}し{場|ば} 。 {砂|すな} で {閉|と}じた セト {家|け} の {渡|わた}し{場|ば} に 、 ゲンロク が {一人|ひとり} {残|のこ}って いる 。 {建|た}て{直|なお}す なら 、 {彼|かれ} の {約束|やくそく} が {要|い}る 。 || East Landing, the Seto family's landing, closed by the sand. Genroku stays on alone. Rebuilding it needs his word.

@scene el.genroku_post
# The maiden voyage: the landing's one letter, from Seto (his grand-niece) up the hill in Saltglass.
!faceplayer
el_genroku: {郵便|ゆうびん} ？ ここ に ？ …… {三十年|さんじゅうねん} {来|こ}なかった ぞ 。 || Post? Here? …None's come in thirty years.
narr: {郵便|ゆうびん}{袋|ぶくろ} から 、 {東|ひがし} の {渡|わた}し{場|ば} {宛|あて} の {手紙|てがみ} を {一通|いっつう} {出|だ}して {渡|わた}した 。 {差出人|さしだしにん} は 、 {丘|おか} の {上|うえ} の セト 。 || You take the one letter for East Landing from the mailbag and hand it over. It's from Seto, up the hill.
el_genroku: …… セト の {家|いえ} の {孫娘|まごむすめ} か 。 「{冬|ふゆ} は {家|いえ} に {来|き}て 。 {一人|ひとり} は {寒|さむ}い でしょう 。」 …… ふん 。 || …The Seto house's granddaughter. "Come and stay with us for the winter. It's cold on your own." …Hmph.
el_genroku: {宛名|あてな} が 「{東|ひがし} の {渡|わた}し{場|ば}」 だ 。 {港|みなと} の {奴|やつ}ら は 、 もう ない と {言|い}う が 。 …… ちゃんと {届|とど}いた な 。 || Addressed to "East Landing". The harbour folk say there's no such place any more. …It got here all right.
!set sea_post_el
!call sea.post_check
?(!quest.el_rebuild) !call el.genroku_first

@scene el.genroku_terms
!faceplayer
el_genroku: {直|なお}す だ と ？ …… {条件|じょうけん} が ある 。 || Mend it, you say? …I've conditions.
!challenge el.terms
!if var._res=1 -> ok
el_genroku: …… {話|はなし} に ならん 。 {出直|でなお}して こい 。 || …That's no good. Come back and try again.
!end
:ok
el_genroku: …… {名前|なまえ} は そのまま 、 {鐘|かね} は また {鳴|な}る 、 {掃|は}く の は わし 。 それ なら 、 {文句|もんく} は ない 。 || …The name stays, the bell rings again, and the sweeping's mine. Then I've no complaint.
!gesture el_genroku nod
el_genroku: {人手|ひとで} が {要|い}る ぞ 。 {港|みなと} の {連中|れんちゅう} に 、 {掲示板|けいじばん} で {頼|たの}んで みろ 。 || You'll need hands. Ask the harbour lot, on the notice board.
!quest el_rebuild 1
!journal ゲンロク と {約束|やくそく} した 。 {名前|なまえ} は そのまま 、 {鐘|かね} を また {鳴|な}らし 、 {掃除|そうじ} は ゲンロク 。 {掲示板|けいじばん} に {手伝|てつだ}い の {貼|は}り{紙|がみ} を {出|だ}す 。 || Terms with Genroku: the name stays, the bell rings again, the sweeping is his. Next, a notice on the board asking for help.

@scene el.board
!if quest.el_rebuild=1 -> write
?(el_notice) narr: {掲示板|けいじばん} に 、 あなた の {貼|は}り{紙|がみ} 。 {誰|だれ} か が {横|よこ} に 「{行|い}く ！ ダイゴ」 と {書|か}き{足|た}して いる 。 || Your notice on the board. Someone has added beside it: "Coming! Daigo".
?(!el_notice&quest.el_rebuild>=2) narr: {掲示板|けいじばん} に 、 あなた の {貼|は}り{紙|がみ} 。 {誰|だれ} が {読|よ}んで くれる だろう 。 || Your notice on the board. Who will read it?
?(!quest.el_rebuild>=1) narr: {古|ふる}い {掲示板|けいじばん} 。 {色|いろ} の {抜|ぬ}けた {時刻表|じこくひょう} が 、 {一枚|いちまい} だけ {残|のこ}って いる 。 || An old notice board. A single faded timetable is all that's left on it.
!end
:write
narr: {古|ふる}い {時刻表|じこくひょう} の {横|よこ} に 、 {新|あたら}しい {紙|かみ} を {貼|は}る 。 {何|なん} と {書|か}こう 。 || Beside the faded timetable, you pin up a fresh sheet. What to write?
!challenge el.notice
!if var._res=1 -> ok
narr: …… これ で は 、 {誰|だれ} が いつ どこ へ {来|く}れば いい か {分|わ}からない 。 {書|か}き{直|なお}そう 。 || …From this, nobody could tell who should come, when, or where. Better write it again.
!end
:ok
narr: {貼|は}り{紙|がみ} を {貼|は}った 。 {潮硝子|しおがらす} から {浜|はま} を {回|まわ}って くる {人|ひと} が 、 {必|かなら}ず {見|み}る {場所|ばしょ} だ 。 || The notice is up, where anyone coming round the beach from Saltglass will see it.
!quest el_rebuild 2
!set el_pending
!unset el_away
!journal {貼|は}り{紙|がみ} を {出|だ}した 。 {人|ひと} が {来|く}る の は 、 {次|つぎ} に {来|き}た {時|とき} 。 || The notice is up. People will have come by the next visit.

@scene el.progress
# Back at the landing with a job waiting: it has been done meanwhile.
!if quest.el_rebuild=2&!el_notice -> people
!if quest.el_rebuild=3&!el_channel -> channel
!if quest.el_rebuild=4&!el_jetty -> jetty
!goto clear
:people
narr: {貼|は}り{紙|がみ} を {見|み}た {人|ひと} たち が 、 {来|き}て いる 。 {荷揚|にあ}げ の ダイゴ 、 {漁師|りょうし} の ソウタ 、 {岸壁|がんぺき} の {作業台|さぎょうだい} の ハマ 。 || People who read the notice have come: Daigo the porter, Sōta the fisher, Hama from the workbench on the stone quay.
!set el_notice
!goto clear
:channel
narr: {水路|すいろ} が {掘|ほ}られて いる 。 {入|い}り{江|え} の {奥|おく} まで 、 {深|ふか}い {水|みず} が {通|とお}って いる 。 || The channel has been dug. Deep water runs all the way into the inlet.
!set el_channel
!goto clear
:jetty
narr: {桟橋|さんばし} に 、 {新|あたら}しい {板|いた} が {張|は}られて いる 。 {白|しろ}い {木|き} が 、 {古|ふる}い {板|いた} の {間|あいだ} で {光|ひか}って いる 。 || The jetty has new planks. The pale new wood shines among the old.
!set el_jetty
:clear
!unset el_pending
!unset el_away

@scene el.wait
!faceplayer
narr: 「{今日|きょう} は {始|はじ}めた ばかり だ 。 {次|つぎ} に {来|く}る {頃|ころ} に は 、 {終|お}わって いる よ 。」 || "We've only just started today. It'll be done by the time you're next here."

@scene el.channel
# Daigo with a spade: where to dig, and in what order.
!faceplayer
daigo: おう ！ {貼|は}り{紙|がみ} 、 {見|み}た ぜ ！ {力|ちから} なら {任|まか}せろ 。 だが 、 どこ を どう {掘|ほ}る ？ || Ho! Saw your notice! Leave the muscle to me. But where do we dig, and how?
!challenge el.channel
!if var._res=1 -> ok
daigo: …… {闇雲|やみくも} に {掘|ほ}って も 、 {潮|しお} が {埋|う}める だけ だ 。 {考|かんが}え{直|なお}そう ぜ 。 || …Dig any old where and the tide just fills it in. Let's think again.
!end
:ok
daigo[happy]: よし 、 その {段取|だんど}り で {行|い}こう ！ {明日|あした} まで に は {掘|ほ}れる ！ || Right, we'll do it that way! It'll be dug by tomorrow!
!quest el_rebuild 3
!set el_pending
!unset el_away

@scene el.jetty
# Hama, who keeps the notched workbench on the stone quay: the planks, measured.
!faceplayer
cs_hama: {板|いた} の {数|かず} は 、 {測|はか}って から {切|き}る の 。 {作業台|さぎょうだい} の {刻|きざ}み{目|め} と {同|おな}じ よ 。 || Measure first, then cut the planks. Like the notches on the workbench.
!challenge el.jetty
!if var._res=1 -> ok
cs_hama: {足|た}りない か 、 {余|あま}る わ ね 。 もう {一度|いちど} {測|はか}りましょう 。 || We'd be short, or have some over. Let's measure again.
!end
:ok
cs_hama[smile]: {合|あ}ってる 。 {切|き}って {張|は}る の は 、 {任|まか}せて 。 || That's it. Leave the cutting and fitting to me.
!quest el_rebuild 4
!set el_pending
!unset el_away

@scene el.genroku_bell
!faceplayer
!if el_pending -> wait
el_genroku: …… {待|ま}って いろ 。 || …Wait there.
narr: ゲンロク が {小屋|こや} から 、 {布|ぬの} に {包|つつ}んだ もの を {持|も}って {来|く}る 。 {小|ちい}さな {鐘|かね} だ 。 {肩|かた} に 、 {波|なみ} の {線|せん} が {一本|いっぽん} 。 || Genroku comes out of the shack with something wrapped in cloth. A small bell, with a wavy line on its shoulder.
el_genroku: {渡|わた}し{場|ば} の {鐘|かね} だ 。 {閉|と}じた {日|ひ} に 、 わし が {外|はず}して {仕舞|しま}って おいた 。 {三十年|さんじゅうねん} 、 {磨|みが}いて きた 。 || The landing's bell. I took it down the day we closed, and put it away. Thirty years I've kept it polished.
!set el_bell
narr: {桟橋|さんばし} の {根元|ねもと} の {柱|はしら} に 、 {鐘|かね} を {吊|つ}るす 。 ゲンロク が {紐|ひも} を {引|ひ}く 。 {澄|す}んだ {音|おと} が 、 {入|い}り{江|え} に {響|ひび}いた 。 || You hang the bell on the post at the foot of the jetty. Genroku pulls the cord. A clear note rings out across the inlet.
?(comp=nao) comp: …… いい {音|おと} だ 。 {宛先|あてさき} が 、 {戻|もど}って きた な 。 || …A good sound. The address is back.
?(comp=mio) comp[smile]: {鐘|かね} の {音|おと} が 、 {港|みなと} まで {届|とど}いた かも しれません ね 。 || The bell might have carried all the way to the harbour.
?(comp=ren) comp: {名|な} を {守|まも}った {人|ひと} が 、 {音|おと} を {返|かえ}した の です ね 。 || The one who kept the name has given back the sound.
?(comp=suzu) comp[smile]: {柝|き} の {音|おと} みたい 。 {幕|まく} が {開|あ}く {合図|あいず} ね 。 || Like the clappers before a show. That's the curtain going up.
el_genroku: …… ふん 。 {掃|は}く の は 、 わし だ ぞ 。 {忘|わす}れる な 。 || …Hmph. The sweeping's mine, mind. Don't forget.
!set el_done
!quest el_rebuild done
narr: {東|ひがし} の {渡|わた}し{場|ば} に 、 {船|ふね} が また {着|つ}ける よう に なった 。 || East Landing can take boats again.
!journal {東|ひがし} の {渡|わた}し{場|ば} が {戻|もど}った 。 ゲンロク の {鐘|かね} が {鳴|な}り 、 {船|ふね} が {着|つ}ける 。 || East Landing is back. Genroku's bell rings, and boats can put in.
!autosave
!end
:wait
el_genroku: {板|いた} が {張|は}られる まで 、 {待|ま}て 。 {急|せ}く な 。 || Wait till the planks are in. Don't rush.

@scene el.bell
narr: {渡|わた}し{場|ば} の {鐘|かね} 。 {肩|かた} に {波|なみ} の {線|せん} 。 {紐|ひも} を {引|ひ}く と 、 {澄|す}んだ {音|おと} が {入|い}り{江|え} に {響|ひび}く 。 || The landing's bell, a wavy line on its shoulder. Pull the cord and a clear note rings across the inlet.

@scene el.genroku_after
el_genroku: {朝|あさ} に {掃|は}いて 、 {昼|ひる} に {鐘|かね} を {鳴|な}らす 。 …… {忙|いそが}しく なった わい 。 || Sweep in the morning, ring the bell at noon. …I've got busy.
?(sea_post_el) el_genroku: セト の {孫娘|まごむすめ} に 、 {返事|へんじ} を {書|か}いた 。 {冬|ふゆ} は {行|い}く と な 。 {郵便|ゆうびん} は 、 あんた の {船|ふね} で {頼|たの}む 。 || I wrote back to the Seto girl. Said I'd come for the winter. Your boat can take the letter.

@scene el.genroku_idle
el_genroku: …… {砂|すな} は {毎日|まいにち} {来|く}る 。 {掃|は}いて も {掃|は}いて も な 。 || …The sand comes every day. Sweep and sweep.

@scene el.daigo_idle
daigo: {荷|に} より {砂|すな} の {方|ほう} が {重|おも}い ！ {腰|こし} に {来|く}る ！ || Sand's heavier than cargo! It's in my back!

@scene el.sota_idle
sota: {網|あみ} を {引|ひ}く より 、 {楽|らく} かも 。 …… いや 、 {嘘|うそ} だ 。 || Easier than hauling nets, maybe. …No, that's a lie.

@scene el.hama_idle
cs_hama: {古|ふる}い {工房|こうぼう} が あった の は 、 ここ な の ね 。 {先生|せんせい} の {先生|せんせい} の {頃|ころ} よ 。 || So this is where the old workshop was. In my teacher's teacher's day.
`);
