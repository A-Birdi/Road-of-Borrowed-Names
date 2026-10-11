/* The Cloudroad, Chapter 10: the side stories' scenes (expansion P12e; the quests and their wiring are in 25_side.js,
 * the tasks in 35_side_learning.js). Companion lines for all four; Suzu's have Kansai versions (kansai_98_cr.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  // Rin's errand moves on once you reach Kirishita
  C.maps['cr.kirishita'].onEnter.push({ scene: 'cr.map_kirishita', if: 'cr_map_started&!cr_map_ready' });
})(RB.content);

// ---- The Seven Seals: the seal at each station, from one table ---------------------------------------------------
(function () {
  'use strict';
  const S = [
    { n: 2, who: 'cr_ine', say: '{杉|すぎ}ノ{木|き} の {印|いん} は 、 {大杉|おおすぎ} よ 。 {千年|せんねん} {前|まえ} から 、 {同|おな}じ {形|かたち} 。 || Suginoki\'s seal is the great cedar. The same shape for a thousand years.', pic: '{大|おお}きな {杉|すぎ} の {木|き} と 、 「{杉|すぎ}ノ{木|き}」 の {字|じ} 。 || A great cedar, and the characters 杉ノ木.' },
    { n: 3, who: 'cr_heisuke', say: '{坂下|さかした} の {印|いん} だ 。 {坂|さか} の {下|した} に 、 {宿|しゅく} が {一|ひと}つ 。 {見|み}た まま だ 。 || Sakashita\'s seal. A station at the foot of a slope. Just as it looks.', pic: '{長|なが}い {坂|さか} と 、 その {下|した} の {小|ちい}さな {家|いえ} 。 「{坂下|さかした}」 の {字|じ} 。 || A long slope and a little house at its foot. The characters 坂下.' },
    { n: 4, who: 'cr_otaki', say: '{中山|なかやま} の {印|いん} は 、 {山|やま} の {真|ま}ん{中|なか} に {線|せん} が {一本|いっぽん} 。 …… {竹屋|たけや} は 、 {宿|やど} が {二|ふた}つ {向|む}かい{合|あ}う {絵|え} に したい らしい けど 。 || Nakayama\'s seal: a line across the middle of a mountain. …The Take would like two inns facing each other on it, apparently.', pic: '{山|やま} の {形|かたち} の {真|ま}ん{中|なか} を 、 {一本|いっぽん} の {線|せん} が {横切|よこぎ}って いる 。 「{中山|なかやま}」 の {字|じ} 。 || A mountain with a line across its middle. The characters 中山.' },
    { n: 5, who: 'cr_genji', say: '{馬返|うまがえ}し の {印|いん} は 、 {振|ふ}り{返|かえ}る {馬|うま} だ 。 ここ から {先|さき} は 、 {馬|うま} は {行|い}かん から な 。 || Umagaeshi\'s seal is a horse looking back. Horses go no further than here.', pic: '{後|うし}ろ を {振|ふ}り{返|かえ}る {馬|うま} 。 「{馬返|うまがえ}し」 の {字|じ} 。 || A horse looking back over its shoulder. The characters 馬返し.' },
    { n: 6, who: 'cr_sue', say: '{霧下|きりした} の {印|いん} は 、 {霧|きり} の {下|した} の {灯|ひ} よ 。 サキチ さん が {毎晩|まいばん} {点|つ}けて いる 、 あの {灯|ひ} 。 || Kirishita\'s seal is a lamp under the mist. The one Sakichi lights every night.', pic: '{霧|きり} の {線|せん} の {下|した} に 、 {小|ちい}さな {灯|ひ} が {一|ひと}つ 。 「{霧下|きりした}」 の {字|じ} 。 || One small lamp under lines of mist. The characters 霧下.' },
    { n: 7, who: 'cr_shizu', say: '{雲居|くもい} の {印|いん} です 。 {雲|くも} の {上|うえ} に 、 {宿|しゅく} が {座|すわ}って いる 。 {父|ちち} が {彫|ほ}った もの です 。 || Kumoi\'s seal. A station sitting on the clouds. My father carved it.', pic: '{雲|くも} の {上|うえ} に 、 {屋根|やね} が {一|ひと}つ 。 「{雲居|くもい}」 の {字|じ} 。 || One roof on top of the clouds. The characters 雲居.' },
  ];
  const all = 'cr_seal1&cr_seal2&cr_seal3&cr_seal4&cr_seal5&cr_seal6&cr_seal7';
  let src = '';
  for (const s of S) {
    src += `
@scene cr.seal${s.n}
!faceplayer
${s.who}: ${s.say}
narr: {印帳|いんちょう} に 、 {印|いん} が {押|お}された 。 ${s.pic}
!set cr_seal${s.n}
!toast {印|いん} を {押|お}して もらった || A seal for your book
!if ${all} -> all
!end
:all
!quest cr_seals 1
!journal {七|なな}つ の {印|いん} が {揃|そろ}った 。 {追分|おいわけ} の トメ に {見|み}せよう 。 || All seven seals. Show Tome at Oiwake.
`;
  }
  RB.script.add(src);
})();

RB.script.add(`
@scene cr.seals_start
# Tome's seal book: Oiwake's own seal pressed as she gives it.
!if cr_seals_given -> end
cr_tome: そう だ 、 これ を {持|も}って {行|い}きなさい 。 {印帳|いんちょう} よ 。 {昔|むかし} の {旅人|たびびと} は 、 {宿場|しゅくば} ごと に {印|いん} を {押|お}して もらった の 。 || Oh, and take this with you. A seal book. Travellers in the old days had a seal pressed at every station.
cr_tome: {追分|おいわけ} の {印|いん} は 、 {道|みち} が {二|ふた}つ に {分|わ}かれる {絵|え} 。 {最初|さいしょ} の ページ に 、 {押|お}して おく わ ね 。 {七|なな}つ {揃|そろ}ったら 、 {見|み}せて ちょうだい 。 || Oiwake's seal is a road dividing in two. I'll press it on the first page. Show me when you have all seven.
!give cr_sealbook
!set cr_seals_given
!set cr_seal1
!quest cr_seals 0
?(comp=nao) comp: {印帳|いんちょう} か 。 {郵便|ゆうびん} の {消印|けしいん} と {同|おな}じ だ な 。 {通|とお}った {証拠|しょうこ} 。 || A seal book. Like a postmark. Proof you passed through.
?(comp=mio) comp[smile]: {七|なな}つ も ！ {集|あつ}める の 、 {楽|たの}しみ です ね 。 || Seven of them! I'm looking forward to collecting them.
?(comp=ren) comp: {灯|ひ} の {名前|なまえ} と 、 {宿|しゅく} の {印|いん} 。 {両方|りょうほう} {揃|そろ}えましょう 。 || The lamps' names and the stations' seals. Let's gather both.
?(comp=suzu) comp: {巡業|じゅんぎょう} の {判子|はんこ} {集|あつ}め なら 、 {任|まか}せて 。 {一座|いちざ} で {一番|いちばん} {早|はや}かった の よ 。 || Collecting stamps on tour? Leave it to me. I was the fastest in the company.
:end

@scene cr.seals_done
!faceplayer
cr_tome: まあ 、 {七|なな}つ {全部|ぜんぶ} ！ {大杉|おおすぎ} 、 {坂|さか} 、 {山|やま} 、 {馬|うま} 、 {霧|きり} 、 {雲|くも} 。 …… {雲居|くもい} の {印|いん} は 、 わたし も {見|み}た こと が なかった わ 。 || My, all seven! The cedar, the slope, the mountain, the horse, the mist, the clouds. …I'd never seen Kumoi's seal myself.
cr_tome: その {印帳|いんちょう} は 、 あなた の もの よ 。 {雲路|くもじ} を {全部|ぜんぶ} {歩|ある}いた {証拠|しょうこ} 。 {大事|だいじ} に して ね 。 || The seal book is yours. Proof you walked the whole Cloudroad. Look after it.
!quest cr_seals done
?(comp=nao) comp: …… {大事|だいじ} に しよう 。 {宛先|あてさき} の ない {手紙|てがみ} より 、 ずっと いい 。 || …We'll look after it. Far better than a letter with no address.
?(comp=mio) comp[smile]: ページ ごと に 、 {思|おも}い{出|で} が あります ね 。 || A memory on every page.
?(comp=ren) comp: {七|なな}つ の {印|いん} と 、 {七|なな}つ の {灯|ひ} 。 {両方|りょうほう} {揃|そろ}いました 。 || Seven seals and seven lamps. Both complete.
?(comp=suzu) comp: {判子|はんこ} {帳|ちょう} が {埋|う}まる の って 、 {満員|まんいん} {御礼|おんれい} みたい で {気持|きも}ち いい わ 。 || Filling a stamp book feels like a sold-out house.

@scene cr.guest_start
!faceplayer
!set cr_guest_started
cr_otaki: ちょっと {聞|き}いて よ 。 うち の {宿帳|やどちょう} が ない の 。 タツ さん が うち に {予約|よやく} して いた こと 、 あれ が なきゃ {見|み}せられない わ 。 || Listen to this. Our guest book's gone. Without it I can't show that Tatsu booked with us.
cr_otaki: {何日|なんにち} か {前|まえ} に {泊|と}まった {商人|しょうにん} の コウスケ さん が 、 {慌|あわ}てて {出|で}て {行|い}った の 。 {自分|じぶん} の {帳面|ちょうめん} と {間違|まちが}えた ん じゃ ない かしら 。 {坂|さか} の {下|した} へ {下|お}りて {行|い}った わ 。 || Kōsuke the merchant stayed a few days ago and left in a rush. I wonder if he took it for his own notebook. He went off down the hill.
?(cr_guestbook_seen) narr: {坂下|さかした} の {飛脚宿|ひきゃくやど} の {机|つくえ} に 、 {松葉|まつば} の {紋|もん} の {帳面|ちょうめん} が あった 。 || On the table at Sakashita's Courier's Inn there was a book with a pine-needle crest.
?(comp=nao) comp: {帳面|ちょうめん} の {取|と}り{違|ちが}え は 、 {郵便|ゆうびん} でも よく ある 。 {下|した} の {宿|しゅく} を {当|あ}たろう 。 || Mixing up ledgers happens in the post too. Let's try the stations below.
?(comp=mio) comp: {帳面|ちょうめん} が ない と 、 {言|い}った {言|い}わない の {喧嘩|けんか} に なります ね 。 {探|さが}しましょう 。 || Without the book it's just one word against the other. Let's look for it.
?(comp=ren) comp: {記録|きろく} が {消|き}える と 、 {話|はなし} だけ が {残|のこ}ります 。 {取|と}り{戻|もど}しましょう 。 || When the record goes, only the stories are left. Let's get it back.
?(comp=suzu) comp: {帳簿|ちょうぼ} が ない の は 、 {宿屋|やどや} に は {一大事|いちだいじ} よ 。 わたし なら {寝|ね}られない わ 。 || A missing ledger is a disaster for an inn. I wouldn't sleep a wink.
!quest cr_guest 0

@scene cr.guestbook
!if cr_guest_found -> own
!if cr_guest_started -> found
!set cr_guestbook_seen
narr: {宿帳|やどちょう} が {二冊|にさつ} 。 {一冊|いっさつ} は {飛脚宿|ひきゃくやど} の もの 。 もう {一冊|いっさつ} の {表紙|ひょうし} に は 、 {松葉|まつば} の {紋|もん} が ある 。 || Two guest books. One is the Courier's Inn's. The other has a pine-needle crest on its cover.
cr_sono: それ ね 。 {商人|しょうにん} の お{客|きゃく} さん が {置|お}いて {行|い}った の 。 {誰|だれ} の かしら 。 || That one? A merchant left it. I wonder whose it is.
!end
:found
cr_sono: {松葉|まつば} の {紋|もん} …… {中山|なかやま} の {松葉屋|まつばや} さん の ね 。 コウスケ さん が {置|お}いて {行|い}った の よ 。 {持|も}って {行|い}って あげて 。 || A pine-needle crest… the Matsuba's, at Nakayama. Kōsuke left it here. Take it back to them.
!give cr_guestbook
!set cr_guest_found
!quest cr_guest 1
!end
:own
narr: {飛脚宿|ひきゃくやど} の {宿帳|やどちょう} 。 {旅人|たびびと} の {名前|なまえ} が 、 {少|すこ}し ずつ {増|ふ}えて いる 。 || The Courier's Inn's guest book. A few more travellers' names every day.

@scene cr.guest_settle
!faceplayer
cr_otaki: {宿帳|やどちょう} ！ よかった 。 …… ほら 、 ここ 。 タツ さん の {予約|よやく} よ 。 || The guest book! Thank goodness. …Look, here. Tatsu's booking.
narr: {宿帳|やどちょう} ： 「タツ {様|さま} 。 {一泊|いっぱく} 。 {暮|く}れ{六|む}つ まで に お{着|つ}き の こと 。 {過|す}ぎれば 、 {取|と}り{消|け}し 。」 || The guest book: "Master Tatsu. One night. To arrive by dusk. If later, cancelled."
!challenge cr.guest_book
cr_otaki: …… {暮|く}れ{六|む}つ を {過|す}ぎたら 、 {取|と}り{消|け}し 。 {自分|じぶん} で {書|か}いた {決|き}まり だった わ 。 タツ さん は {夜|よる} {遅|おそ}く {着|つ}いて 、 うち は もう {戸|と} を {閉|し}めて いた 。 || …If later than dusk, cancelled. My own rule. Tatsu arrived late at night, and we'd already shut the door.
cr_seibe: {竹屋|たけや} は {夜|よる} も {開|あ}けて いる 。 だから うち に {来|き}た 。 {予約|よやく} は {松葉屋|まつばや} 、 {布団|ふとん} は {竹屋|たけや} 。 {両方|りょうほう} {本当|ほんとう} だった わけ だ 。 || The Take stays open at night, so he came to us. The booking was the Matsuba's, the futon the Take's. Both were true.
cr_tatsu: …… {遅|おく}れた {俺|おれ} が {悪|わる}い 。 {次|つぎ} は {松葉屋|まつばや} に {泊|と}まる よ 。 {暮|く}れ{六|む}つ まで に な 。 || …It's my fault for being late. Next time I'll stay at the Matsuba. Before dusk.
cr_otaki: {夜|よる} {遅|おそ}い {人|ひと} は {竹屋|たけや} 、 {早|はや}い {人|ひと} は うち 。 {宿帳|やどちょう} を {見|み}せ{合|あ}えば 、 {喧嘩|けんか} に ならない わ ね 。 || Late arrivals to the Take, early ones to us. If we show each other our books, there'll be no quarrel.
!take cr_guestbook
!quest cr_guest done
?(comp=nao) comp: {書|か}いて ある こと を {読|よ}めば 、 {喧嘩|けんか} は {半分|はんぶん} {終|お}わる 。 || Read what's written, and half the quarrel's over.
?(comp=mio) comp[smile]: {両方|りょうほう} {正|ただ}しかった なんて 、 いちばん いい {終|お}わり{方|かた} です 。 || Both being right is the best possible ending.
?(comp=ren) comp: {記録|きろく} が {戻|もど}って 、 {話|はなし} が {一|ひと}つ に なりました 。 || The record's back, and there's only one story now.
?(comp=suzu) comp: {帳簿|ちょうぼ} は {嘘|うそ} を つかない 。 {人|ひと} が {読|よ}み{間違|まちが}える だけ よ 。 || A ledger never lies. People just misread it.

@scene cr.map_start
!if cr_map_started -> end
cr_rin: …… あの 、 {上|うえ} へ {行|い}く なら 、 {頼|たの}み が あります 。 {崖道|がけみち} 、 {沢|さわ} の {浅瀬|あさせ} 、 {霧|きり} の {坂|さか} の {旧道|きゅうどう} 。 {自分|じぶん} で {見|み}た こと と 、 {人|ひと} に {聞|き}いた こと を 、 {分|わ}けて {教|おし}えて ください 。 || …Um, if you're going up, I have a favour to ask. The ledge, the ford on the stream, the old road on the fog slope. Tell me what you saw yourself and what you were told, and keep them apart.
cr_rin: {地図|ちず} は 、 {描|か}いた {人|ひと} が {歩|ある}いた {所|ところ} しか {信用|しんよう} できない って 、 {言|い}われました 。 …… {悔|くや}しい けど 、 {本当|ほんとう} です 。 || Someone told me you can only trust a map where its maker has walked. …It's galling, but it's true.
!set cr_map_started
!quest cr_map 0
?(comp=nao) comp: {見|み}た こと と {聞|き}いた こと か 。 …… この {道|みち} は 、 その {練習|れんしゅう} ばかり だ な 。 || What you saw and what you heard. …This whole road is practice at that.
?(comp=mio) comp: {分|わ}かりました 。 {聞|き}いた こと は 、 {聞|き}いた と {言|い}います 。 || Understood. What we heard, we'll say we heard.
?(comp=ren) comp: {灯|ひ} の {名前|なまえ} と {同|おな}じ です 。 {本当|ほんとう} の こと を 、 {正|ただ}しい {場所|ばしょ} に 。 || Like the lamps' names. The truth, in the right place.
?(comp=suzu) comp: {聞|き}いた {話|はなし} を {見|み}て きた よう に {言|い}う の は 、 {役者|やくしゃ} の {悪|わる}い {癖|くせ} よ 。 {気|き} を つける わ 。 || Telling what you heard as if you'd seen it is an actor's bad habit. I'll be careful.
:end

@scene cr.map_wait
!faceplayer
cr_rin: {霧下|きりした} まで {行|い}ったら 、 {教|おし}えて ください 。 {急|いそ}ぎません 。 || Tell me once you've been as far as Kirishita. There's no hurry.

@scene cr.map_kirishita
!set cr_map_ready
!quest cr_map 1
!journal {霧下|きりした} まで {来|き}た 。 {中山|なかやま} の リン に 、 {見|み}た こと と {聞|き}いた こと を {分|わ}けて {伝|つた}えよう 。 || You've come as far as Kirishita. Tell Rin at Nakayama what you saw and what you heard, kept apart.

@scene cr.map_report
!faceplayer
cr_rin: {霧下|きりした} まで {行|い}った ん です ね 。 {教|おし}えて ください 。 {見|み}た {所|ところ} は {黒|くろ} 、 {聞|き}いた {所|ところ} は {赤|あか} で {描|か}きます 。 || You've been as far as Kirishita. Tell me. Places you saw I'll draw in black; places you heard about, in red.
!challenge cr.map_check
cr_rin: …… {崖道|がけみち} は {赤|あか} 。 {浅瀬|あさせ} は {黒|くろ} 。 {霧|きり} の {坂|さか} は {赤|あか} 。 {赤|あか} が {多|おお}い {地図|ちず} です ね 。 でも 、 {正直|しょうじき} な {地図|ちず} です 。 || …The ledge in red. The ford in black. The fog slope in red. A map with a lot of red. But an honest one.
cr_rin: いつか {赤|あか} を {全部|ぜんぶ} {黒|くろ} に して みせます 。 {自分|じぶん} の {足|あし} で 。 || One day I'll make all the red black. On my own feet.
!quest cr_map done
?(comp=nao) comp: {赤|あか} い {線|せん} が ある {地図|ちず} の {方|ほう} が 、 {信用|しんよう} できる 。 || A map with red lines on it is the one you can trust.
?(comp=mio) comp[smile]: {分|わ}からない {所|ところ} を 、 {分|わ}からない と {描|か}く 。 ラベル と {同|おな}じ です ね 。 || Drawing what you don't know as not known. Same as a label.
?(comp=ren) comp: {師匠|ししょう} の {地図|ちず} に も 、 {赤|あか} が {要|い}った かも しれません 。 || My master's map might have needed red too.
?(comp=suzu) comp: {黒|くろ} と {赤|あか} 。 {台本|だいほん} の {書|か}き{込|こ}み みたい ね 。 {正直|しょうじき} な {台本|だいほん} よ 。 || Black and red. Like the marks on a script. An honest script.

@scene cr.oshika
!faceplayer
cr_oshika: {先|さき} ほど は どうも 。 …… わし は {巡礼|じゅんれい} で な 。 {国中|くにじゅう} の お{社|やしろ} と お{寺|てら} を {回|まわ}って {来|き}た 。 || Thank you for earlier. …I'm a pilgrim. I've been round the shrines and temples of the whole country.
cr_oshika: {最後|さいご} の {一|ひと}つ が 、 {雲路峠|くもじとうげ} の {石|いし} じゃ 。 じゃが 、 この {足|あし} で は 、 {雲|くも} の {上|うえ} まで は {登|のぼ}れん 。 || The last is the stone on the Cloudroad Pass. But with these legs I can't climb above the cloud.
cr_oshika: {石|いし} に {彫|ほ}った {印|いん} に {紙|かみ} を {当|あ}てて 、 {墨|すみ} で {写|うつ}して くれん か 。 {納経帳|のうきょうちょう} の {最後|さいご} の ページ に 。 || Would you lay paper over the seal carved on the stone and take a rubbing in ink? On the last page of my pilgrim book.
!give cr_pilgrimbook
!quest cr_pilgrim 0
?(comp=nao) comp: …… {南|みなみ} の {島|しま} の {話|はなし} 。 {願|ねが}い じゃ ない 。 {出|だ}せなかった {手紙|てがみ} だ 。 {海|うみ} は {叶|かな}えない 。 {返|かえ}す だけ だ 。 || …That island in the south. Not wishes: letters that never got sent. The sea doesn't grant them. It only gives them back.
?(comp=mio) comp: {南|みなみ} の {島|しま} の {話|はなし} 、 {少|すこ}し {違|ちが}います 。 でも 、 {行|い}けば {分|わ}かります 。 {葉|は} は 、 {本当|ほんとう} に {帰|かえ}る ん です 。 || The story of the island in the south is a little different. But you'll see when you go. The leaves really do go home.
?(comp=ren) comp: {南|みなみ} の {島|しま} に は 、 {古|ふる}い {灯籠|とうろう} が あります 。 オシカ さん が {行|い}ったら 、 {名前|なまえ} を {読|よ}んで あげて ください 。 || There are old lanterns on the island in the south. If you go, Oshika, read their names for them.
?(comp=suzu) comp: {南|みなみ} の {島|しま} の {話|はなし} 、 {巡礼|じゅんれい} {版|ばん} ね 。 {一番|いちばん} {夢|ゆめ} が ある {版|ばん} だ わ 。 || The pilgrim's version of the island story. The dreamiest version yet.

@scene cr.pilgrim_wait
!faceplayer
cr_oshika: {峠|とうげ} の {石|いし} は 、 {雲|くも} の {上|うえ} じゃ 。 {急|いそ}がん で よい 。 || The stone on the pass is above the cloud. No need to hurry.

@scene cr.pilgrim_rub
narr: オシカ の {納経帳|のうきょうちょう} の {最後|さいご} の ページ を 、 {石|いし} の {印|いん} に {当|あ}てて 、 {墨|すみ} で そっと {擦|こす}る 。 {雲|くも} の {上|うえ} の {山|やま} と 、 「{雲路|くもじ}」 の {字|じ} が {浮|う}かび{上|あ}がった 。 || You lay the last page of Oshika's book over the stone's carved seal and rub gently with ink. A mountain over the clouds comes up, and the characters 雲路.
narr: {彫|ほ}った {石|いし} の {上|うえ} に {紙|かみ} を {当|あ}てて {写|うつ}す の を 、 {拓本|たくほん} と {言|い}う 。 {本当|ほんとう} に ある やり{方|かた} だ 。 || Taking a copy of a carved stone with paper and ink is called a rubbing (takuhon). It's a real practice.
!set cr_pilgrim_rubbed
!quest cr_pilgrim 1

@scene cr.pilgrim_done
!faceplayer
!take cr_pilgrimbook
cr_oshika: …… {雲|くも} の {上|うえ} の {山|やま} 。 {雲路|くもじ} 。 これ で {全部|ぜんぶ} じゃ 。 {六十年|ろくじゅうねん} かかった わい 。 || …The mountain over the clouds. 雲路. That's all of them. Sixty years it took me.
cr_oshika: {礼|れい} に 、 {一|ひと}つ {教|おし}えよう 。 {巡礼|じゅんれい} は 、 {着|つ}く こと より 、 {歩|ある}いた {道|みち} を {覚|おぼ}えて おく こと が {大事|だいじ} じゃ 。 || In thanks, let me tell you one thing. On a pilgrimage, remembering the road you walked matters more than arriving.
!quest cr_pilgrim done
?(comp=nao) comp: {覚|おぼ}えて おく 。 …… {道|みち} の {方|ほう} を な 。 || I'll remember. …The road, that is.
?(comp=mio) comp[smile]: {六十年|ろくじゅうねん} 。 …… {最後|さいご} の ページ に {間|ま}に{合|あ}って 、 よかった 。 || Sixty years. …I'm glad we made it for the last page.
?(comp=ren) comp: {歩|ある}いた {道|みち} を {覚|おぼ}えて おく 。 {灯守|ひもり} の {心得|こころえ} と {同|おな}じ です 。 || Remember the road you walked. The same as a keeper's rule.
?(comp=suzu) comp: {千秋楽|せんしゅうらく} ね 。 {六十年|ろくじゅうねん} の {巡業|じゅんぎょう} 、 お{疲|つか}れ さま でした 。 || Closing night. Sixty years on tour: well done.

@scene cr.oshika_after
!faceplayer
cr_oshika: {春|はる} に なったら 、 {南|みなみ} の {島|しま} へ {行|い}って みる つもり じゃ 。 {納経帳|のうきょうちょう} は {終|お}わった が 、 {足|あし} は まだ {動|うご}く から の 。 || Come spring, I mean to try the island in the south. The book's finished, but my legs still move.

@scene cr.ginji
!faceplayer
!set cr_ginji_asked
cr_ginji: {来|き}た か 。 {借|か}り を {返|かえ}して もらおう 。 …… {大|たい}した こと じゃ ない 。 {包|つつ}み を {一|ひと}つ 、 {馬返|うまがえ}し の チカ の {薬屋|くすりや} へ {届|とど}けて ほしい 。 {中|なか} は {頭痛|ずつう} の {薬|くすり} だ 。 || There you are. Time to repay me. …It's nothing much. Take a parcel to Chika's dispensary at Umagaeshi. Headache powder.
cr_ginji: {俺|おれ} に は {手形|てがた} が ない 。 {名前|なまえ} を {書|か}いて くれる {名主|なぬし} が 、 どこ に も いない ん で な 。 だから {関所|せきしょ} は {通|とお}れん 。 {岩|いわ} を {回|まわ}る 。 || I have no papers. There's no headman anywhere who'll write my name. So I can't go through the Barrier. I go round by the rocks.
cr_ginji: あんた に は {手形|てがた} が ある 。 {堂々|どうどう} と {運|はこ}べる 。 …… {頼|たの}める か 。 || You've got papers. You can carry it openly. …Can I ask you?
?(comp=nao) comp: {手形|てがた} の ない {人|ひと} の {荷|に} を 、 {手形|てがた} の ある {人|ひと} が {運|はこ}ぶ 。 …… {継|つ}ぎ{飛脚|びきゃく} と 、 {同|おな}じ だ な 。 || Someone without papers, and someone with papers carrying their load. …Same as the relay.
?(comp=mio) comp: {頭痛|ずつう} の {薬|くすり} なら 、 {高|たか}い {所|ところ} で は {大事|だいじ} です 。 {中身|なかみ} は 、 {私|わたし} が {確|たし}かめます 。 || Headache powder matters up high. I'll check what's in it.
?(comp=ren) comp: {名前|なまえ} を {書|か}いて もらえない {人|ひと} …… 。 {関所|せきしょ} の {灯|ひ} は 、 {誰|だれ} の ため に ある ん でしょう 。 || Someone no one will write a name for… Who are the Barrier's lamps for, I wonder.
?(comp=suzu) comp: {訳|わけ} あり の {人|ひと} の {荷物|にもつ} は 、 {大抵|たいてい} {訳|わけ} が {一番|いちばん} {重|おも}い の よ 。 || With people who have their reasons, the reasons are usually the heaviest part of the luggage.
!choice
* {引|ひ}き{受|う}ける || Take it on -> yes
* {断|ことわ}る || Say no -> no
:yes
!give cr_parcel
cr_ginji: チカ は {俺|おれ} を {知|し}って いる 。 「{手形|てがた} の ない {男|おとこ} から 」 と {言|い}えば 、 {分|わ}かる 。 || Chika knows me. Say it's from the man without papers; she'll understand.
!end
:no
cr_ginji: そう か 。 {無理|むり} は {言|い}わん 。 {俺|おれ} が {遠回|とおまわ}り する だけ だ 。 || Fair enough. I won't push. I'll just go the long way round.
!set cr_ginji_gone

@scene cr.ginji_idle
!faceplayer
?(item.cr_parcel) cr_ginji: チカ の {薬屋|くすりや} は 、 {馬返|うまがえ}し だ 。 || Chika's dispensary is at Umagaeshi.
?(!item.cr_parcel) cr_ginji: {借|か}り は {返|かえ}して もらった 。 これ で {貸|か}し{借|か}り なし だ 。 || That's the favour repaid. We're square.

@scene cr.parcel
!faceplayer
!take cr_parcel
cr_chika: {手形|てがた} の ない {男|おとこ} から ？ …… ギンジ さん ね 。 {一度|いちど} も {約束|やくそく} を {破|やぶ}った こと の ない {人|ひと} よ 。 || From the man without papers? …Ginji. He's never once broken a promise.
cr_chika: {頭痛|ずつう} の {薬|くすり} 、 ちょうど {切|き}れて いた の 。 {雲|くも} の {上|うえ} へ {行|い}く {人|ひと} が 、 これ で {助|たす}かる わ 。 || I'd just run out of headache powder. This will help everyone going up above the cloud.
?(comp=mio) comp: ラベル を {書|か}きましょう 。 「{頭痛|ずつう} の {薬|くすり} 。 {六時間|ろくじかん} ごと に {一包|いっぽう} 。 {峠|とうげ} の {向|む}こう の もの 。」 …… {分|わ}かる こと だけ を 、 {分|わ}かる よう に 。 || Let's write a label. "Headache powder. One packet every six hours. From beyond the pass." …Only what we know, so it's clear.
?(!comp=mio) cr_chika: {六時間|ろくじかん} ごと に {一包|いっぽう} 。 ラベル に そう {書|か}いて おく わ 。 || One packet every six hours. I'll write that on the label.
!set cr_parcel_done
!set cr_ginji_gone

@scene cr.family_sono
!faceplayer
cr_sono: ヘイスケ さん が {来|き}て 、 {頭|あたま} を {下|さ}げて くれました 。 …… {奥|おく} で {待|ま}って います 。 {話|はな}して あげて ください 。 || Heisuke came and bowed his head to me. …He's waiting inside. Please go and talk to him.

@scene cr.family
# The Last Courier's Family (E17): what becomes of the old coins, lasting, each end shown before it is chosen.
!faceplayer
cr_heisuke: …… ソノ に は 、 {頭|あたま} を {下|さ}げた 。 {五十年|ごじゅうねん} 、 {坂下|さかした} は ゲンタ を {悪|わる}く {言|い}って きた 。 {俺|おれ} の {親父|おやじ} が {始|はじ}めた {話|はなし} だ 。 || …I've bowed my head to Sono. For fifty years Sakashita spoke ill of Genta. A story my father started.
cr_sono: …… {祖母|そぼ} に も 、 {聞|き}かせたかった です 。 || …I wish my grandmother could have heard this.
cr_heisuke: {財布|さいふ} の {中|なか} は 、 {古|ふる}い {銭|ぜに} だ 。 {今|いま} は {使|つか}えない が 、 {銅|どう} の {重|おも}み は ある 。 {二人|ふたり} で は {決|き}められん 。 あんた が {決|き}めて くれ 。 || The purse holds old coins. No good for spending now, but there's copper in them. The two of us can't decide. You decide.
:menu
!choice
* ソノ の {宿|やど} に {使|つか}う || Use them for Sono's inn -> inn
* {継|つ}ぎ{飛脚|びきゃく} に {使|つか}う || Use them for the relay -> relay
* ゲンタ の {石|いし} を {峠|とうげ} に {立|た}てる || Raise a stone for Genta on the pass -> stone
* {今|いま} は {決|き}めない || Not now -> later
:inn
narr: （ソノ は {古|ふる}い {銭|ぜに} で 、 {宿|やど} の {暖簾|のれん} を {新|あたら}しく する 。 {名前|なまえ} は 「{飛脚宿|ひきゃくやど} ゲンタ」 。 {坂下|さかした} を {通|とお}る {人|ひと} は みんな 、 その {名前|なまえ} を {読|よ}む 。） || (Sono has the inn's curtain made new with the coins. Its name: "The Courier's Inn, Genta". Everyone who passes through Sakashita will read it.)
!choice
* そう する || Do that -> inn_go
* {考|かんが}え{直|なお}す || Think again -> menu
:relay
narr: （{古|ふる}い {銭|ぜに} は 、 {追分|おいわけ} の カンベエ の {問屋場|といやば} へ 。 {新|あたら}しい {継|つ}ぎ{飛脚|びきゃく} たち の {草鞋|わらじ} と {笠|かさ} に なる 。 {走|はし}る {人|ひと} は 、 ゲンタ の {印|しるし} を {背負|せお}う 。） || (The old coins go to Kanbe's relay office at Oiwake, for the new runners' sandals and hats. The runners will carry Genta's mark on their backs.)
!choice
* そう する || Do that -> relay_go
* {考|かんが}え{直|なお}す || Think again -> menu
:stone
narr: （{古|ふる}い {銭|ぜに} で 、 {峠|とうげ} の {飛脚|ひきゃく}{小屋|ごや} の {横|よこ} に ゲンタ の {石|いし} を {立|た}てる 。 {峠|とうげ} を {越|こ}える {人|ひと} は 、 そこ で {一息|ひといき} {入|い}れる 。） || (With the old coins, a stone for Genta is raised beside the couriers' hut on the pass. Everyone who crosses will stop there for a breath.)
!choice
* そう する || Do that -> stone_go
* {考|かんが}え{直|なお}す || Think again -> menu
:inn_go
!set cr_family_inn
cr_sono: {祖父|そふ} の {名前|なまえ} を 、 {毎日|まいにち} {見|み}られる ん です ね 。 …… ありがとう 。 || I'll see Grandfather's name every day. …Thank you.
!goto close
:relay_go
!set cr_family_relay
cr_heisuke: {走|はし}る {若|わか}い {衆|しゅう} に 、 ゲンタ の {話|はなし} を {正|ただ}しく {聞|き}かせる 。 それ が 、 {俺|おれ} の {仕事|しごと} だ 。 || I'll tell the young runners Genta's story the right way. That's my job now.
!goto close
:stone_go
!set cr_family_stone
cr_sono: {春|はる} に なったら 、 {峠|とうげ} まで {会|あ}い に {行|い}きます 。 {新|あたら}しい {草鞋|わらじ} を {持|も}って 。 || Come spring, I'll go up to the pass to see him. With a new pair of sandals.
:close
!quest cr_family done
?(comp=nao) comp: {届|とど}いた {便|びん} が 、 また {次|つぎ} へ {行|い}く 。 …… それ で いい 。 || The post that arrived goes on to the next. …That's how it should be.
?(comp=mio) comp: {重|おも}い こと を {決|き}めました ね 。 {一人|ひとり} で {背負|せお}わない で ください 。 || That was a heavy thing to decide. Don't carry it alone.
?(comp=ren) comp: ゲンタ さん の {名前|なまえ} が 、 {消|き}えない {所|ところ} に {残|のこ}りました 。 || Genta's name has been left somewhere it won't fade.
?(comp=suzu) comp: {五十年|ごじゅうねん} {越|ご}し の {大団円|だいだんえん} 。 {客席|きゃくせき} から {見|み}て いたかった わ 。 || A grand finale fifty years in the making. I'd have liked to watch it from the audience.
!end
:later
cr_heisuke: {急|いそ}がん 。 {五十年|ごじゅうねん} {待|ま}った {金|かね} だ 。 || No hurry. That money's waited fifty years.

@scene cr.genta_stone
narr: {飛脚|ひきゃく}{小屋|ごや} の {横|よこ} の {新|あたら}しい {石|いし} 。 「{飛脚|ひきゃく} ゲンタ 、 {此処|ここ} に て {便|びん} を {守|まも}る 。」 {石|いし} の {前|まえ} に 、 {新|あたら}しい {草鞋|わらじ} が {一足|いっそく} {置|お}いて ある 。 || A new stone beside the couriers' hut: "Here the courier Genta kept the post safe." In front of it, a new pair of straw sandals.

@scene cr.sono
!faceplayer
!if cr_sono_met -> again
!set cr_sono_met
cr_sono: {飛脚宿|ひきゃくやど} へ ようこそ 。 {祖父|そふ} が {建|た}てた {宿|やど} です 。 || Welcome to the Courier's Inn. My grandfather built it.
cr_sono: {祖父|そふ} は 、 ゲンタ と いう {飛脚|ひきゃく} でした 。 …… {坂下|さかした} で は 、 {祖父|そふ} が {金|かね} を {持|も}って {逃|に}げた と {言|い}われて います 。 || My grandfather was a courier called Genta. …In Sakashita they say he ran off with the money.
cr_sono: {祖母|そぼ} は 、 {祖父|そふ} は {雪|ゆき} の {峠|とうげ} で {谷|たに} へ {落|お}ちた ん だ と {言|い}って いました 。 {逃|に}げる {人|ひと} じゃ ない 、 と 。 …… でも 、 {見|み}た {人|ひと} は {誰|だれ} も いない ん です 。 || My grandmother said he fell into the gorge on the pass in the snow. He wasn't the kind to run, she said. …But nobody saw.
?(comp=nao) comp: …… {見|み}た {人|ひと} が いない {話|はなし} が 、 {二|ふた}つ 。 どっち も 、 {本当|ほんとう} と は {限|かぎ}らない 。 || …Two stories, and nobody saw either. Neither is necessarily true.
?(comp=mio) comp: {待|ま}って いた {人|ひと} の {話|はなし} は 、 {優|やさ}しく なる もの です ね 。 || The stories of the ones left waiting turn kind, don't they.
?(comp=ren) comp: ゲンタ さん の {名前|なまえ} も 、 {灯|ひ} の {名前|なまえ} の よう に 、 {消|き}えかけて いる の かも しれません 。 || Perhaps Genta's name is fading too, like the lamps' names.
?(comp=suzu) comp: {同|おな}じ {人|ひと} の {話|はなし} が 、 {宿|やど} ごと に {違|ちが}う 。 {旅回|たびまわ}り の {一座|いちざ} の {噂|うわさ} と {同|おな}じ ね 。 || The same man's story, different at every inn. Just like the rumours about a touring company.
!quest cr_family 0
!end
:again
cr_sono: {峠|とうげ} の {向|む}こう の {話|はなし} を 、 {祖父|そふ} は よく {子供|こども} たち に {聞|き}かせて いた そう です 。 {湯|ゆ} の {湧|わ}く {谷|たに} が ある 、 って 。 || They say my grandfather used to tell the children about what lay beyond the pass. A valley where hot water springs from the ground.

@scene cr.sono_after
!faceplayer
?(cr_family_inn) cr_sono: {暖簾|のれん} を {新|あたら}しく しました 。 「{飛脚宿|ひきゃくやど} ゲンタ」 。 {祖父|そふ} の {名前|なまえ} です 。 || I've had the curtain made new: "The Courier's Inn, Genta". My grandfather's name.
?(cr_family_relay) cr_sono: {継|つ}ぎ{飛脚|びきゃく} の {人|ひと} たち が 、 うち に {泊|と}まって いく ん です 。 {背中|せなか} に 、 {祖父|そふ} の {印|しるし} を {付|つ}けて 。 || The relay runners stay here now. With my grandfather's mark on their backs.
?(cr_family_stone) cr_sono: {峠|とうげ} の {小屋|こや} に 、 {祖父|そふ} の {石|いし} を {立|た}てて もらいました 。 {春|はる} に なったら 、 {会|あ}い に {行|い}きます 。 || A stone for my grandfather stands by the hut on the pass now. Come spring, I'll go and see him.
?(!cr_family_inn&!cr_family_relay&!cr_family_stone) cr_sono: {祖父|そふ} の {話|はなし} 、 {今|いま} は {坂下|さかした} の みんな が {正|ただ}しく {話|はな}して くれます 。 || Everyone in Sakashita tells my grandfather's story right now.

@scene cr.saka_shelf
narr: {棚|たな} に 、 {古|ふる}い {笠|かさ} と 、 {継|つ}ぎ{飛脚|びきゃく} の {印|しるし} が {入|はい}った {法被|はっぴ} が {飾|かざ}って ある 。 || On the shelf: an old straw hat, and a happi coat with the relay's emblem on it.
?(cr_sono_met) cr_sono: {祖父|そふ} の もの です 。 {予備|よび} の {笠|かさ} と {法被|はっぴ} 。 {本物|ほんもの} は 、 {峠|とうげ} へ {持|も}って {行|い}きました 。 || They were my grandfather's. His spare hat and coat. The ones he wore went up the pass with him.
`);
