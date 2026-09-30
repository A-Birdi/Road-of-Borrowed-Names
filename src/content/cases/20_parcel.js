/* Case A — A Parcel for a Place That Moved (addendum §15.2).
 * Reedwake: the parcel on the River Warehouse's shelf of unclaimed things.
 * Saltglass: the Harbour Office's record of the landings; the old footing on
 * the east beach; Seto's house up the hill (a look-alike crest); Hama's repair
 * bench by the ferry on the stone quay (the call bell, the notched bench).
 * Cinder Orchard: the post house's record of marks. Any order; wrong
 * deliveries are safe (the parcel stays sealed and you are told why it does
 * not fit); the right one is an ordinary conversation. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script.add(`
@scene cs.parcel_shelf
narr: {誰|だれ} も {取|と}りに {来|こ}ない {荷物|にもつ} の {棚|たな} 。 {紐|ひも} を かけた {小|ちい}さな {包|つつ}み が {一|ひと}つ 。 || A shelf of parcels nobody has come for. One small package, tied with string.
narr: {宛名|あてな} の {札|ふだ} ： 「 {潮|しお}{硝子|がらす} 、 {東|ひがし} の {渡|わた}し{場|ば} 。 {鈴|すず} の {工房|こうぼう} の {主|あるじ} {様|さま} 」 。 {人|ひと} の {名前|なまえ} は ない 。 || The address label: "Saltglass, the East Landing. To the keeper of the bell workshop." No one's name.
!hook case_clue parcel.address
narr: その {上|うえ} に {赤|あか}い {判|はん} 。 「 {宛先|あてさき} {不明|ふめい} ── {東|ひがし} の {渡|わた}し{場|ば} は ありません 。 {潮|しお}{硝子|がらす} {港|みなと} 」 。 || Over it, a red stamp: "Address unknown — there is no East Landing. Saltglass Harbour."
narr: {封|ふう} の {蝋|ろう} に 、 {小|ちい}さな {鈴|すず} の {印|しるし} 。 {鈴|すず} の {右|みぎ} の {肩|かた} に 、 {切|き}り{込|こ}み が {一|ひと}つ ある 。 || The wax seal carries a small bell. On the bell's right shoulder, a single notch.
!hook case_clue parcel.seal
narr: {棚|たな} の {端|はし} に {貼|は}り{紙|がみ} 。 「 {西|にし} へ {行|い}く {方|かた} 、 {一|ひと}つ {持|も}って いって ください 」 。 || A notice at the end of the shelf: "If you're heading west, please take one along."
?(comp=nao) comp[think]: {名前|なまえ} の ない {宛名|あてな} か 。 {仕事|しごと} と {場所|ばしょ} だけ 。 {配達人|はいたつにん} {泣|な}かせ だ な 。 || An address with no name. Just a job and a place. The kind that makes couriers weep.
?(comp=mio) comp: {誰|だれ} か が 、 これ を まだ {待|ま}って いる かも しれません ね 。 || Someone might still be waiting for this.
?(comp=ren) comp: {渡|わた}し{場|ば} は ない 、 と {判|はん} は {言|い}って います 。 でも {宛名|あてな} は 、 まだ {誰|だれ} か を {指|さ}して いる 。 || The stamp says there's no landing. But the address still points at someone.
?(comp=suzu) comp: {名前|なまえ} じゃ なくて 、 {役|やく} で {呼|よ}んでる の ね 。 {一座|いちざ} の {手紙|てがみ} と {同|おな}じ 。 || Addressed by the role, not the name. Like the troupe's letters.
!choice
* {持|も}って いく || Take it along -> take
* {置|お}いて おく || Leave it here -> end
:take
!give cs_parcel
!hook case_open parcel
?(comp=nao) comp[smirk]: {預|あず}かった なら 、 {届|とど}ける まで が {仕事|しごと} だ ぞ 。 || Once you've taken it, the job isn't done until it's delivered.
?(comp=mio) comp[smile]: {潮|しお}{硝子|がらす} に {着|つ}いたら 、 {聞|き}いて みましょう 。 || Let's ask around in Saltglass.
?(comp=ren) comp: {道|みち} が {変|か}わって も 、 {宛名|あてな} は {残|のこ}る 。 {灯|ひ} の {名|な} と {似|に}て います 。 || The road changes and the address stays. Like a lantern's name.
?(comp=suzu) comp[laugh]: {謎|なぞ} の {小包|こづつみ} ！ {幕|まく} が {開|あ}いた わ 。 || A mystery parcel! Curtain up.
!choice
* {記録|きろく} を {見|み}る || Look at the case record -> page
* {先|さき} へ {進|すす}む || Carry on -> end
:page
!hook case_page parcel

@scene cs.parcel_shelf_empty
narr: {誰|だれ} も {取|と}りに {来|こ}ない {荷物|にもつ} の {棚|たな} 。 {鈴|すず} の {封|ふう} の {包|つつ}み が あった ところ に 、 {埃|ほこり} の ない {四角|しかく} が {残|のこ}って いる 。 || The shelf of unclaimed parcels. Where the bell-sealed package lay, there's a clean square in the dust.
?(case.parcel=done) narr: あの {包|つつ}み は もう 、 {届|とど}く べき ところ に {届|とど}いた 。 || That one has reached the place it was meant for.

@scene cs.parcel_record
narr: {港|みなと} の {古|ふる}い {帳面|ちょうめん} の {山|やま} 。 {一番|いちばん} {上|うえ} の {一冊|いっさつ} の {背|せ} に 、 「 {渡|わた}し{場|ば} の {移|うつ}り{変|か}わり 」 。 || A pile of old harbour ledgers. On the spine of the top one: "The Landings, and How They Changed".
narr: 「 {東|ひがし} の {渡|わた}し{場|ば} 」 の {頁|ページ} が ある 。 || There's a page headed "East Landing".
narr: 「 {東|ひがし} の {渡|わた}し{場|ば} 、 {砂|すな} で {浅|あさ}く なり {閉|と}じる 。 {渡|わた}し{船|ぶね} は {石|いし} の {岸壁|がんぺき} へ {移|うつ}る 。 」 || "East Landing: silted up; closed. The ferry moves to the stone quay."
narr: 「 {工房|こうぼう} の {備品|びひん} ── {渡|わた}し の {呼|よ}び{鈴|りん} 、 {刻|きざ}み{目|め} の ある {作業台|さぎょうだい} ── は 、 {工房|こうぼう} と {共|とも}に {移|うつ}す 。 」 || "The workshop's fittings — the ferry's call bell, the notched workbench — go with the workshop."
!hook case_clue parcel.record
narr: {工房|こうぼう} が どこ へ {移|うつ}った か は 、 {書|か}いて いない 。 || Where the workshop went isn't written down.
!if !case.parcel -> end
!choice
* {記録|きろく} を {見|み}る || Look at the case record -> page
* {閉|と}じる || Close the ledger -> end
:page
!hook case_page parcel

@scene cs.parcel_oldsite
narr: {波打|なみう}ち{際|ぎわ} に 、 {低|ひく}い {石|いし} の {土台|どだい} 。 {小|ちい}さな {小屋|こや} が {建|た}って いた らしい 。 || At the water's edge, a low stone footing. A small hut must have stood here once.
narr: {残|のこ}った {柱|はしら} に 、 {鉄|てつ} の {金具|かなぐ} 。 {何|なに} か を {吊|つ}るして いた {跡|あと} だ 。 {薄|うす}れた {字|じ} で 「 {東|ひがし} {渡|わた}し 」 。 || On the one post still standing, an empty iron bracket: something used to hang from it. Faded letters: "East Landing".
!hook case_clue parcel.oldsite
!if !item.cs_parcel -> end
!choice
* ここ に {小包|こづつみ} を {置|お}いて いく || Leave the parcel here -> leave
* {持|も}った まま に する || Keep it -> end
:leave
narr: {宛名|あてな} は 「 {工房|こうぼう} の {主|あるじ} 」 。 でも ここ に は 、 {工房|こうぼう} も {人|ひと} も ない 。 {受|う}け{取|と}る {人|ひと} が いない 。 || The address says "the keeper of the workshop". But there's no workshop here, and no one to take it.
!hook case_rule parcel oldsite
?(comp=nao) comp: {誰|だれ} も いない {所|ところ} に {置|お}いたら 、 {届|とど}けた こと に は ならない よ 。 || Leaving it where nobody is doesn't count as delivering.
?(comp=mio) comp: {雨|あめ} が {降|ふ}ったら {濡|ぬ}れて しまいます 。 {持|も}って いきましょう 。 || If it rains, it'll get soaked. Let's keep it with us.
?(comp=ren) comp: {場所|ばしょ} は {残|のこ}って いて も 、 {主|あるじ} は ここ に いません 。 || The place is still here, but its keeper isn't.
?(comp=suzu) comp: {空|から} の {舞台|ぶたい} に 、 {花束|はなたば} は {置|お}けない わ 。 || You can't leave a bouquet on an empty stage.
narr: {小包|こづつみ} は {封|ふう} を した まま 、 {手|て} に {残|のこ}った 。 || The parcel stays in your hands, still sealed.

@scene cs.seto_door
narr: {丘|おか} の {上|うえ} の {小|ちい}さな {家|いえ} 。 {戸|と} の {札|ふだ} に {紋|もん} が {彫|ほ}って ある 。 {鈴|すず} と 、 その {下|した} に {波|なみ} の {線|せん} 。 || A small house on the hill. A crest is carved on the door plate: a bell, with a wavy line beneath it.
!hook case_clue parcel.crest

@scene cs.seto_idle
cs_seto: {丘|おか} の {上|うえ} は 、 {風|かぜ} が よく {通|とお}る の 。 {洗濯物|せんたくもの} が すぐ {乾|かわ}く わ 。 || The wind comes through nicely up here on the hill. The washing dries in no time.
cs_seto: うち の {祖父|そふ} は 、 {浜|はま} の ほう で {工房|こうぼう} を して いた …… と {思|おも}う の 。 わたし は {小|ちい}さくて 、 よく {覚|おぼ}えて いない けど 。 || My grandfather kept a workshop somewhere down by the shore… I think. I was little; I don't really remember.
!hook case_clue parcel.seto_memory

@scene cs.seto_parcel
pc: この {小包|こづつみ} 、 {心当|こころあ}たり は ありません か 。 || Does this parcel mean anything to you?
cs_seto[surprise]: あら 、 {封|ふう} の {印|しるし} が うち の {紋|もん} に {似|に}て いる わ ね 。 || Oh, the seal looks like our crest.
cs_seto[think]: でも ほら 、 うち の は {鈴|すず} の {下|した} に {波|なみ} が ある の 。 それ に 、 {切|き}り{込|こ}み なんて ない わ 。 || But look — ours has a wave under the bell. And no notch.
cs_seto: {宛名|あてな} も 「 {工房|こうぼう} の {主|あるじ} 」 でしょう 。 うち は もう {長|なが}い こと 、 {工房|こうぼう} なんて して いない の 。 {開|あ}けたら {悪|わる}い わ 。 || And the address asks for the keeper of the workshop. We haven't kept anything like a workshop for a long time. It wouldn't be right for me to open it.
!hook case_clue parcel.crest quiet
!hook case_clue parcel.seto_memory quiet
!hook case_rule parcel family
narr: {小包|こづつみ} は {封|ふう} を された まま 、 {手|て} に {戻|もど}って きた 。 || The parcel comes back to you, still sealed.

@scene cs.hama_idle
cs_hama: {縄|なわ} 、 {浮|う}き 、 {渡|わた}し{船|ぶね} の {道具|どうぐ} 。 {壊|こわ}れた もの が あったら 、 {持|も}って おいで 。 || Rope, floats, ferry gear. If something of yours breaks, bring it here.
cs_hama: この {台|だい} の {刻|きざ}み{目|め} ？ {縄|なわ} の {長|なが}さ を {測|はか}る ため の もの だ よ 。 わたし の {師匠|ししょう} より {古|ふる}い 。 || The notches on this bench? They're for measuring rope. Older than my teacher.
!hook case_clue parcel.bench

@scene cs.hama_parcel
pc: この {小包|こづつみ} 、 あなた {宛|あて} では ありません か 。 || Could this parcel be for you?
cs_hama: どれ どれ 。 「 {東|ひがし} の {渡|わた}し{場|ば} 。 {鈴|すず} の {工房|こうぼう} の {主|あるじ} {様|さま} 」 …… 。 || Let's see. "The East Landing. To the keeper of the bell workshop"…
cs_hama[surprise]: {東|ひがし} の {渡|わた}し{場|ば} は 、 この {工房|こうぼう} が {始|はじ}まった {場所|ばしょ} だ よ 。 {渡|わた}し が {岸壁|がんぺき} へ {移|うつ}った とき 、 {師匠|ししょう} が {工房|こうぼう} ごと ここ へ {越|こ}して きた 。 あの {呼|よ}び{鈴|りん} も 、 この {台|だい} も 。 || The East Landing is where this workshop started. When the ferry moved to the quay, my teacher brought the whole workshop here — that call bell, this bench, all of it.
cs_hama: {今|いま} の {主|あるじ} は 、 わたし 。 …… と いう こと は 、 わたし {宛|あて} だ ね 。 || And the keeper now is me. …Which means it's for me.
!take cs_parcel
!hook case_resolve parcel
!sfx discover
narr: {紐|ひも} を ほどく と 、 {油紙|あぶらがみ} に {包|つつ}まれた {小|ちい}さな {金具|かなぐ} が {出|で}て きた 。 || She unties the string. Inside, wrapped in oiled paper, is a small metal part.
cs_hama: {呼|よ}び{鈴|りん} の {中|なか} で {音|おと} を {出|だ}す {部品|ぶひん} だ 。 {鋳物師|いもじ} が {新|あたら}しい の を {送|おく}って くれた ん だ ね 。 {何年|なんねん} {前|まえ} の {注文|ちゅうもん} だろう 。 || The part inside the call bell that makes it ring. The caster sent a new one. Heaven knows how many years ago it was ordered.
cs_hama: よく ここ だ と {分|わ}かった ね 。 {何|なに} で {分|わ}かった の ？ || You worked out it was here. What told you?
!choice
* {話|はな}す || Tell her -> explain
* {届|とど}けた だけ です || I only came to deliver it -> quiet
:explain
!hook case_ack parcel
:quiet
cs_hama[smile]: {名前|なまえ} が {書|か}いて なくて も 、 {仕事|しごと} を {続|つづ}けて いる {人|ひと} が いれば 、 {宛名|あてな} は {生|い}きて いる もの だ ね 。 || Even with no name on it — as long as someone's still doing the job, the address stays alive.
cs_hama: {封|ふう} の {蝋|ろう} 、 {持|も}って いき な 。 {届|とど}けて くれた {記念|きねん} に 。 || Take the wax seal with you. Something to remember the delivery by.
narr: {鈴|すず} の {印|しるし} の {蝋|ろう} を もらった 。 || You receive the wax with the bell mark on it.
!quest cs_parcel done
!hook case_react parcel
!autosave

@scene cs.hama_after
cs_hama: {新|あたら}しい {部品|ぶひん} で 、 {呼|よ}び{鈴|りん} が よく {鳴|な}る よ 。 {渡|わた}し{船|ぶね} を {呼|よ}ぶ とき 、 {遠|とお}く まで {届|とど}く 。 || With the new part, the call bell rings well. When I call the ferry, it carries a long way.
cs_hama: {宛名|あてな} の {札|ふだ} は 、 {台|だい} の {上|うえ} に {貼|は}って おいた 。 {次|つぎ} の {主|あるじ} も {読|よ}める よう に 。 || I pinned the address label up over the bench, so the next keeper can read it too.

@scene cs.hama_bench
narr: {使|つか}い{込|こ}まれた {作業台|さぎょうだい} 。 {手前|てまえ} の {縁|ふち} に 、 {同|おな}じ {間|あいだ} を {空|あ}けて {刻|きざ}み{目|め} が {並|なら}んで いる 。 {縄|なわ} の {束|たば} と 、 ひび の {入|はい}った {浮|う}き 。 || A well-worn workbench. Notches run at even spacing along its front edge. Coils of rope, and a float with a crack in it.
!hook case_clue parcel.bench
?(case.parcel=done) narr: {台|だい} の {上|うえ} に 、 {古|ふる}い {宛名|あてな} の {札|ふだ} が {貼|は}って ある 。 「 {東|ひがし} の {渡|わた}し{場|ば} 。 {鈴|すず} の {工房|こうぼう} の {主|あるじ} {様|さま} 」 。 || Pinned above the bench is the old address label: "The East Landing. To the keeper of the bell workshop."

@scene cs.hama_bell
narr: {作業台|さぎょうだい} の {横|よこ} の {柱|はしら} に 、 {小|ちい}さな {鈴|すず} が {下|さ}がって いる 。 {渡|わた}し{船|ぶね} を {呼|よ}ぶ {呼|よ}び{鈴|りん} だ 。 || From a post beside the workbench hangs a small bell: the call bell for the ferry.
narr: {鈴|すず} の {肩|かた} に {刻印|こくいん} が ある 。 {小|ちい}さな {鈴|すず} の {形|かたち} で 、 {右|みぎ} の {肩|かた} に {切|き}り{込|こ}み が {一|ひと}つ 。 || There's a stamp on its shoulder: a small bell shape, with one notch in its right shoulder.
!hook case_clue parcel.bell
?(case.parcel=done) narr: {中|なか} の {部品|ぶひん} が {新|あたら}しく 、 {光|ひか}って いる 。 || The part inside is new and bright.

@scene cs.parcel_marks
narr: {郵便所|ゆうびんじょ} の {帳面|ちょうめん} 。 {表紙|ひょうし} に 「 {印|しるし} の {控|ひか}え 」 。 {差出人|さしだしにん} の {分|わ}からない {荷物|にもつ} を 、 {印|しるし} から {調|しら}べる ため の もの らしい 。 || A post-house ledger: "Record of Marks". It seems to be for tracing parcels by their seals when no sender is written.
narr: 「 {鈴|すず} 、 {右|みぎ} の {肩|かた} に {切|き}り{込|こ}み {一|ひと}つ ── {鋳物師|いもじ} トクゾウ の {刻印|こくいん} 。 {呼|よ}び{鈴|りん} など 。 」 || "A bell with one notch in its right shoulder — the stamp of the caster Tokuzō. On call bells and the like."
narr: 「 {似|に}た {印|しるし} に {注意|ちゅうい} ： {潮|しお}{硝子|がらす} の セト {家|け} の {紋|もん} は 、 {鈴|すず} の {下|した} に {波|なみ} 。 {切|き}り{込|こ}み なし 。 」 || "Beware a look-alike: the Seto family crest in Saltglass has a wave beneath the bell, and no notch."
!hook case_clue parcel.makernote
?(comp=nao) comp[smile]: {印|しるし} の {控|ひか}え か 。 {配達人|はいたつにん} に は {宝|たから} だ よ 。 || A record of marks. For a courier, that's treasure.
!if !case.parcel -> end
!choice
* {記録|きろく} を {見|み}る || Look at the case record -> page
* {閉|と}じる || Close the ledger -> end
:page
!hook case_page parcel

@scene cs.talk_parcel
!if case.parcel=done -> done
?(comp=nao) comp[think]: {宛名|あてな} が {人|ひと} じゃ なくて {仕事|しごと} を {指|さ}してる 。 {配達人|はいたつにん} なら 、 まず {仕事|しごと} の {行|ゆ}き{先|さき} を {追|お}う ね 。 || The address points at a job, not a person. A courier would follow where the job went.
?(comp=mio) comp: {待|ま}って いる {人|ひと} が いる なら 、 {早|はや}く {届|とど}けたい です ね 。 でも 、 {急|いそ}いで {間違|まちが}える の は もっと {嫌|いや} です 。 || If someone's waiting, I'd like to get it to them soon. But getting it wrong in a hurry would be worse.
?(comp=ren) comp: {名|な} を {持|も}たない {宛名|あてな} は 、 {灯|ひ} の {道|みち} に {似|に}て います 。 {場所|ばしょ} が {動|うご}いて も 、 {役目|やくめ} は {残|のこ}る 。 || An address without a name is like a lantern road. The place can move; the duty stays.
?(comp=suzu) comp: {役|やく} は {残|のこ}って 、 {役者|やくしゃ} は {替|か}わる 。 {舞台|ぶたい} と {同|おな}じ よ 。 || The role stays and the actor changes. Just like the stage.
!end
:done
?(comp=nao) comp[smile]: {名前|なまえ} の ない {宛名|あてな} でも 、 {届|とど}く ところ に は {届|とど}く 。 …… {気分|きぶん} が いい な 。 || Even with no name, it reached the right place. …That feels good.
?(comp=mio) comp[smile]: ハマ さん の {呼|よ}び{鈴|りん} 、 いい {音|おと} に なった でしょう ね 。 || Hama's call bell must sound lovely now.
?(comp=ren) comp: {工房|こうぼう} が {移|うつ}って も 、 {宛名|あてな} は {生|い}きて いた 。 {名|な} と {役目|やくめ} は 、 {引|ひ}っ{越|こ}せる の です ね 。 || The workshop moved and the address stayed alive. Names and duties can move house.
?(comp=suzu) comp[laugh]: {何年|なんねん} も {遅|おく}れた {配達|はいたつ} ！ でも 、 {間|ま}に {合|あ}う もの も ある の よ ね 。 || A delivery years late! Some things still arrive in time, though.
`, 'cases/20_parcel');
