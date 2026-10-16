/* The Cloudroad, Chapter 10: the call and the first station (expansion P12; docs/future/work/P12_CLOUDROAD.md). Back
 * on the mainland after Kotonoha, a relay runner meets the party (at Saltglass's harbour, where Tetsu's ferry comes in,
 * or at Lanternfall, whichever comes first) with a message passed mouth to mouth down the coast, half lost; Yae tells it
 * properly; the waystone at the Lantern Road's top corner; Oiwake, the relay office and its ledger, Kanbe's first
 * message. Companion lines for all four; Suzu's have Kansai versions (kansai_98_cr.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const person = (mapId, id) => ((C.maps[mapId] || {}).npcs || []).find((n) => n.id === id);
  // the runner, where the party comes back to the mainland: Saltglass's harbour (the ferry) and Lanternfall's street
  const sg = C.maps['sg.harbor'], lf = C.maps['lf.town'];
  if (sg) {
    sg.npcs.push({ id: 'cr_jinpachi', x: 33, y: 26, dir: 'down', if: 'ed>=2&ko_done&!cr_called', talk: 'cr.call' });
    sg.onEnter = (sg.onEnter || []).concat([{ scene: 'cr.call', if: 'ed>=2&ko_done&!cr_called' }]);
  }
  if (lf) {
    lf.npcs.push({ id: 'cr_jinpachi', x: 6, y: 18, dir: 'left', if: 'ed>=2&ko_done&!cr_called', talk: 'cr.call' });
    lf.onEnter = (lf.onEnter || []).concat([{ scene: 'cr.call', if: 'ed>=2&ko_done&!cr_called' }]);
  }
  // Yae, in the council chamber: the Cloudroad told first-hand, once
  const yae = person('lf.council', 'lf_yae');
  if (yae) yae.talk.unshift({ if: 'ed>=2&ko_done&!cr_yae_told', scene: 'cr.yae' }, { if: 'ed>=2&cr_yae_told&!cr_done', scene: 'cr.yae_again' });
})(RB.content);

RB.script.add(`
@scene cr.call
# Staged: a young runner in a headband, satchel bouncing, calls out and trots over, out of breath; he recites a
# message carried from Lanternfall down the coast road, passed on from station to station by word of mouth, and half of
# it has gone on the way. Your companion answers it in their own way.
!set cr_called
!chapter cr
!emote cr_jinpachi !
!faceplayer cr_jinpachi
cr_jinpachi: おーい ！ $name さん です よね ！ {灯落|ひおち} の {議会|ぎかい} から 、 {伝言|でんごん} です ！ || Hey! You're $name, right? A message from Lanternfall's council!
cr_jinpachi: おいら 、 {継|つ}ぎ{飛脚|びきゃく} の ジンパチ です 。 {伝言|でんごん} は 、 {宿場|しゅくば} から {宿場|しゅくば} へ 、 {口|くち} で {伝|つた}えて {来|き}ました 。 || I'm Jinpachi, a relay runner. The message came station to station, by word of mouth.
cr_jinpachi: ええと …… 「{北|きた} の {古|ふる}い {街道|かいどう} で 、 {灯|ひ} が …… {消|き}えた ？ {名前|なまえ} が …… {雲|くも} の …… 」 。 …… あれ ？ || Um… "On the old highway north, the lights… went out? The names… the clouds…" …Huh?
cr_jinpachi[sad]: すみません 。 {途中|とちゅう} の {宿場|しゅくば} で {三回|さんかい} {聞|き}き{直|なお}した ん です けど 、 {聞|き}く たび に {話|はなし} が {違|ちが}って いて …… 。 || Sorry. I asked again three times at stations on the way, and every time it was different…
cr_jinpachi: でも 、 「{直接|ちょくせつ} {来|き}て ください 」 って ところ は {確|たし}か です ！ タミ さん が {言|い}って いました 。 || But the part about "please come in person", that's certain! Tami said it.
?(comp=nao) comp: {口伝|くちづた}え か 。 {三人|さんにん} {通|とお}れば 、 {別|べつ} の {話|はなし} に なる 。 …… {次|つぎ} は {紙|かみ} に {書|か}いて {持|も}って {来|こ}い 。 || By word of mouth. Pass it through three people and it's a different story. …Next time, bring it on paper.
?(comp=mio) comp: {大事|だいじ} な ところ が 、 {抜|ぬ}けて しまった みたい だ ね 。 タミ さん に {直接|ちょくせつ} {聞|き}こう 。 || The important part seems to have dropped out. Let's ask Tami herself.
?(comp=ren) comp[think]: {灯|ひ} と 、 {名前|なまえ} …… 。 {聞|き}き{捨|す}て に は できません 。 || Lights, and names… I can't leave that alone.
?(comp=suzu) comp[laugh]: {伝言|でんごん}ゲーム の {最後|さいご} の {人|ひと} って {感|かん}じ ね 。 {元|もと} の {台本|だいほん} を {見|み}に {行|い}きましょ 。 || Like the last person in a game of telephone. Let's go and read the original script.
cr_jinpachi: おいら は {先|さき} に {戻|もど}ります ！ {灯|ひ} の {道|みち} の {上|うえ} の {端|はし} 、 {追分|おいわけ} の {宿|しゅく} に いますんで ！ || I'll head back ahead of you! I'll be at Oiwake Station, at the top end of the Lantern Road!
!quest cr_main 0
!journal {灯落|ひおち} の {議会|ぎかい} から の {伝言|でんごん} が 、 {途中|とちゅう} で {崩|くず}れて いた 。 {議会|ぎかい}{堂|どう} で 、 タミ に {直接|ちょくせつ} {聞|き}こう 。 || The message from Lanternfall's council came garbled on the way. Ask Tami herself, at the council chamber.

@scene cr.yae
# Yae, first-hand: the Cloudroad, the relay and its lamps, the last courier who never arrived; the leaves from the
# north. Her ask, on behalf of the council.
!faceplayer
!set cr_called
!set cr_yae_told
lf_yae: $name さん 。 {来|き}て くれました ね 。 {伝言|でんごん} は 、 {届|とど}きました か 。 || $name. You came. Did the message reach you?
!choice
* {半分|はんぶん} ぐらい 。 || About half of it. -> half
* {途中|とちゅう} で {崩|くず}れて いた 。 || It came garbled. -> half
:half
lf_yae[sad]: …… やはり 。 {口|くち} で {伝|つた}える {間|あいだ} に 、 {崩|くず}れて しまう 。 それ が 、 {今|いま} の {雲路|くもじ} です 。 || …As I feared. It falls apart in the passing on. That is the Cloudroad now.
lf_yae: {灯|ひ} の {道|みち} の {上|うえ} の {端|はし} から 、 {古|ふる}い {街道|かいどう} が {北|きた} の {山|やま} を {越|こ}えて います 。 {宿場|しゅくば} が {七|なな}つ 、 {雲|くも} の {上|うえ} まで {続|つづ}く {道|みち} 。 {雲路|くもじ} と {呼|よ}ばれて います 。 || From the top end of the Lantern Road, an old highway crosses the northern mountains. Seven post stations, a road that climbs above the clouds. It's called the Cloudroad.
lf_yae: {昔|むかし} は 、 {継|つ}ぎ{飛脚|びきゃく} が {宿|しゅく} から {宿|しゅく} へ {手紙|てがみ} を {運|はこ}び 、 {宿場|しゅくば} の {灯|ひ} の {名前|なまえ} も {守|まも}って いました 。 でも 、 {最後|さいご} の {飛脚|ひきゃく} は 、 {着|つ}かなかった 。 || Long ago, relay couriers carried letters from station to station, and kept the names on the stations' lamps as well. But the last courier never arrived.
lf_yae: {今|いま} 、 {宿場|しゅくば} の {灯|ひ} が {一|ひと}つ ずつ {消|き}えて います 。 {宿|しゅく} と {宿|しゅく} の {間|あいだ} の {伝言|でんごん} も 、 {途中|とちゅう} で {崩|くず}れる 。 {宿|しゅく} ごと に 、 {話|はなし} が {違|ちが}う の です 。 || Now the stations' lamps are going out one by one. The messages between them fall apart on the way. Every station tells it differently.
!gesture lf_yae lookroad up
lf_yae: …… それ に 、 {言|こと}の{葉|は}{島|じま} の 、 {紙|かみ} の よう な {葉|は} 。 {北|きた} の {山|やま} から {来|き}た と 、 あなた は {言|い}いました ね 。 {雲路|くもじ} の {方|ほう} です 。 || …And the paper-like leaves on Kotonoha. You said they came from the northern mountains. That's the Cloudroad's way.
lf_yae: {灯落|ひおち} の {議会|ぎかい} と して 、 お{願|ねが}い します 。 {雲路|くもじ} を {登|のぼ}って 、 {何|なに} が {起|お}きて いる の か 、 {見|み}て きて ください 。 || On behalf of Lanternfall's council, I ask you: climb the Cloudroad, and see what is happening up there.
?(comp=nao) comp: {継|つ}ぎ{飛脚|びきゃく} の {道|みち} か 。 …… {名前|なまえ} だけ は 、 {昔|むかし} から {知|し}って いる 。 || The relay road. …I've known the name a long time.
?(comp=mio) comp: {雲|くも} の {上|うえ} まで …… 。 {高|たか}い {所|ところ} は 、 {息|いき} が {苦|くる}しく なる と {聞|き}きます 。 {薬|くすり} を {用意|ようい} して おきます 。 || Up above the clouds… They say breathing gets hard up high. I'll get some remedies ready.
?(comp=ren) comp: {灯|ひ} が {消|き}えて いく {道|みち} なら 、 {灯守|ひもり} の {出番|でばん} です 。 …… {道|みち} を {間違|まちが}えない よう 、 {前|まえ} を {歩|ある}いて ください ね 。 || A road where the lamps are going out: that's a keeper's business. …Do walk in front, so I don't take a wrong turn.
?(comp=suzu) comp: {旅芸人|たびげいにん} も 、 {昔|むかし} は {山|やま} の {街道|かいどう} を {越|こ}えた もの よ 。 {宿屋|やどや} の {話|はなし} なら 、 {任|まか}せて 。 || Travelling players used to cross the mountain highways too. If it's inns you want to know about, leave it to me.
!quest cr_main 1
!journal {灯|ひ} の {道|みち} の {上|うえ} の {端|はし} から 、 {雲路|くもじ} が {北東|ほくとう} へ {登|のぼ}って いる 。 {追分宿|おいわけじゅく} へ {行|い}こう 。 || From the top end of the Lantern Road, the Cloudroad climbs north-east. Go up to Oiwake Station.

@scene cr.yae_again
!faceplayer
lf_yae: {雲路|くもじ} は 、 {灯|ひ} の {道|みち} の {上|うえ} の {端|はし} から です 。 {古|ふる}い {道標|みちしるべ} が {目印|めじるし} です よ 。 || The Cloudroad starts at the top end of the Lantern Road. Look for the old waystone.

@scene cr.lf_waystone
!if ed>=2&ko_done -> open
narr: {古|ふる}い {道標|みちしるべ} 。 「…… {路|みち}」 と だけ {読|よ}める 。 その {先|さき} は 、 {草|くさ} に {埋|う}もれて いる 。 || An old waystone. Only "…road" can be read. Beyond it, grass has grown over everything.
!end
:open
!gesture pc read 33,2
narr: {古|ふる}い {道標|みちしるべ} 。 {苔|こけ} を {払|はら}う と 、 「{右|みぎ} {雲路|くもじ} 、 {左|ひだり} {灯落|ひおち}」 。 {草|くさ} の {中|なか} に 、 {石畳|いしだたみ} が {北東|ほくとう} へ {続|つづ}いて いる 。 || An old waystone. Brush off the moss: "Right, the Cloudroad; left, Lanternfall." Paving stones lead away north-east through the grass.

@scene cr.arrive1
# Staged: up the paved slope out of the trees, a post station's row of inns; at the far end a tall stone lamp, dark;
# the chapter's card; your companion's first look at the highway climbing on into the mountains.
!set cr_st1
!var cr_st = 1
!var cr_phase = 1
!chapter cr
!gesture pc lookroad right
narr: {石畳|いしだたみ} の {坂|さか} を {登|のぼ}る と 、 {宿場|しゅくば} の {家並|やなみ} が {見|み}えて きた 。 || Up the paved slope, a post station's row of houses comes into view.
!card {第十章|だいじゅっしょう} 　{雲路|くもじ} || Chapter 10 — The Cloudroad
narr: {道|みち} の {北側|きたがわ} に {宿屋|やどや} が {並|なら}ぶ 。 {宿場|しゅくば} の {東|ひがし} の {端|はし} に 、 {背|せ} の {高|たか}い {石|いし} の {灯|ひ} 。 {消|き}えて いる 。 || Inns line the north side of the road. At the station's east end, a tall stone lamp. It's dark.
?(comp=nao) comp: {追分|おいわけ} …… {道|みち} が {分|わ}かれる {所|ところ} 、 か 。 {飛脚|ひきゃく} の {問屋場|といやば} も ある 。 {懐|なつ}かしい {匂|にお}い だ 。 || Oiwake… where the road divides. And a relay office. That smell takes me back.
?(comp=mio) comp: {空気|くうき} が {冷|つめ}たく なった ね 。 …… {上|うえ} は 、 もっと {寒|さむ}い の かな 。 || The air's gone cold. …Will it be colder still further up?
?(comp=ren) !gesture comp lookroad right
?(comp=ren) comp[think]: あの {灯|ひ} 。 {灯籠|とうろう} より {大|おお}きい 。 {宿場|しゅくば} の {灯|ひ} です ね 。 {一晩中|ひとばんじゅう} {点|つ}けて おく {灯|ひ} 。 || That lamp. Bigger than a lantern. A station's lamp: the kind that burns all night.
?(comp=suzu) comp[smile]: {宿場|しゅくば} の {朝|あさ} の {匂|にお}い 。 お{味噌汁|みそしる} と 、 {馬|うま} と 、 {草鞋|わらじ} 。 {懐|なつ}かしい わ 。 || The smell of a post station in the morning. Miso soup, horses and straw sandals. It takes me back.
?(cr_yae_told) !quest cr_main 2
!journal {追分宿|おいわけじゅく} に {着|つ}いた 。 {飛脚|ひきゃく} の {問屋場|といやば} で {話|はなし} を {聞|き}こう 。 || You've reached Oiwake Station. Ask at the relay office.

@scene cr.kanbe_first
# Kanbe, the relay master: the relay, the lamps and their names, the courier who never arrived; the ledger of the
# stations' names; the travel papers; the first message, for Ine at Suginoki.
!faceplayer
!set cr_kanbe_met
!set cr_called
cr_kanbe: {飛脚|ひきゃく} の {問屋場|といやば} だ 。 {手紙|てがみ} か 、 {荷物|にもつ} か 。 …… どちら でも ない {顔|かお} だ な 。 || This is the relay office. A letter, or a parcel? …Neither, by the look of you.
?(cr_yae_told) cr_kanbe: {灯落|ひおち} の タミ さん から 、 {話|はなし} は {聞|き}いて いる 。 {本当|ほんとう} に {来|き}た の か 。 || I've had word from Tami in Lanternfall. So you really came.
cr_kanbe: いい か 。 {昔|むかし} 、 この {街道|かいどう} は {継|つ}ぎ{飛脚|びきゃく} で {動|うご}いて いた 。 {一人|ひとり} が {次|つぎ} の {宿|しゅく} まで {走|はし}って 、 {次|つぎ} の {者|もの} に {渡|わた}す 。 {手紙|てがみ} も 、 {伝言|でんごん} も 。 || Listen. This highway used to run on the relay. One runner to the next station, then he hands it on. Letters, and messages too.
cr_kanbe: {宿場|しゅくば} の {常夜灯|じょうやとう} に は 、 {宿|しゅく} の {名前|なまえ} が {彫|ほ}って ある 。 {飛脚|ひきゃく} は {通|とお}る たび に 、 その {名前|なまえ} を {呼|よ}んだ 。 だから 、 {灯|ひ} は {消|き}えなかった 。 || Each station's everlasting lamp has the station's name carved on it. The couriers called the name every time they passed. That's why the lamps never went out.
cr_kanbe: {五十年|ごじゅうねん} {前|まえ} 、 {最後|さいご} の {飛脚|ひきゃく} が {着|つ}かなかった 。 それ から 、 {継|つ}ぎ{飛脚|びきゃく} は {途切|とぎ}れた 。 {今|いま} は 、 {名前|なまえ} を {呼|よ}ぶ {者|もの} も いない 。 || Fifty years ago the last courier never arrived. After that the relay broke off. Now nobody calls the names.
?(comp=nao) comp: …… {五十年|ごじゅうねん} か 。 {待|ま}って いた {方|ほう} は 、 {長|なが}かった だろう な 。 || …Fifty years. It must have been long, for whoever was waiting.
cr_kanbe: {手|て} を {貸|か}して くれる なら 、 これ を {持|も}って いけ 。 {継|つ}ぎ{飛脚|びきゃく} の {帳面|ちょうめん} だ 。 {宿|しゅく} の {名前|なまえ} が {全部|ぜんぶ} {書|か}いて ある 。 || If you'll lend a hand, take this. The relay's ledger. Every station's name is in it.
!give cr_ledger
cr_kanbe: {灯|ひ} に {名前|なまえ} を {戻|もど}して 、 {宿|しゅく} から {宿|しゅく} へ {伝言|でんごん} を {運|はこ}んで くれ 。 {聞|き}いた まま 、 {正直|しょうじき} に な 。 {見|み}た こと は {見|み}た と 、 {聞|き}いた こと は {聞|き}いた と 。 || Give the lamps their names back, and carry messages from station to station. As you heard them, honestly. What you saw, say you saw; what you heard, say you heard.
cr_kanbe: それ と 、 {通行手形|つうこうてがた} だ 。 {上|うえ} に は {関所|せきしょ} が ある 。 これ が ない と {通|とお}れない 。 || And travel papers. There's a checkpoint up there. You can't pass without these.
!give cr_papers
cr_kanbe: {最初|さいしょ} の {伝言|でんごん} は 、 {杉|すぎ}ノ{木|き} の イネ に だ 。 「{明日|あした} の {朝|あさ} 、 {塩|しお} を {二俵|にひょう} {送|おく}る 。」 …… {頼|たの}んだ ぞ 。 || The first message is for Ine at Suginoki. "Two bales of salt go up tomorrow morning." …I'm counting on you.
!set cr_given1
?(comp=nao) comp: {聞|き}いた まま 、 か 。 …… {飛脚|ひきゃく} の {一番|いちばん} {大事|だいじ} な {心得|こころえ} だ 。 {任|まか}せて くれ 。 || As heard. …The first rule a courier learns. Leave it to us.
?(comp=mio) comp: {見|み}た こと と 、 {聞|き}いた こと 。 {薬|くすり} の ラベル と {同|おな}じ です ね 。 {書|か}いて いない こと は 、 {書|か}かない 。 || What you saw and what you heard. Like a medicine label: you don't write what you don't know.
?(comp=ren) comp: {名前|なまえ} を {呼|よ}べば 、 {灯|ひ} が {戻|もど}る 。 …… {灯守|ひもり} の {道|みち} と 、 {同|おな}じ {理|ことわり} です 。 || Call the name and the light comes back. …The same rule as on the keepers' road.
?(comp=suzu) comp: {台詞|せりふ} は {台本|だいほん} どおり に 。 {役者|やくしゃ} の {基本|きほん} よ 。 || Lines as written in the script. An actor's first rule.
!quest cr_main 2
!journal カンベエ から {継|つ}ぎ{飛脚|びきゃく} の {帳面|ちょうめん} と {通行手形|つうこうてがた} を {受|う}け{取|と}った 。 {常夜灯|じょうやとう} に {名前|なまえ} を {戻|もど}し 、 イネ へ の {伝言|でんごん} を {杉|すぎ}ノ{木|き} へ {運|はこ}ぼう 。 || Kanbe gave you the relay's ledger and travel papers. Give the station lamp its name back, and take the message for Ine up to Suginoki.

@scene cr.kanbe_idle
!faceplayer
!if cr_st2 -> later
cr_kanbe: {常夜灯|じょうやとう} の {名前|なまえ} は 、 {帳面|ちょうめん} の {一番|いちばん} {初|はじ}め だ 。 イネ へ の {伝言|でんごん} は 、 {聞|き}いた まま に な 。 || The lamp's name is the first in the ledger. And the message for Ine: as you heard it.
!end
:later
cr_kanbe: {上|うえ} の {宿|しゅく} から 、 {伝言|でんごん} が {戻|もど}って くる よう に なった 。 {崩|くず}れて いない {伝言|でんごん} が な 。 …… {悪|わる}く ない 。 || Messages have started coming back down from the stations above. Messages that haven't fallen apart. …Not bad.

@scene cr.kanbe_after
!faceplayer
cr_kanbe: {継|つ}ぎ{飛脚|びきゃく} が 、 また {走|はし}って いる 。 {帳面|ちょうめん} が {足|た}りなく なって きた わい 。 || The relay's running again. I'm running out of ledger.
?(cr_family_relay) cr_kanbe: ゲンタ の {銭|ぜに} で 、 {若|わか}い {衆|しゅう} の {草鞋|わらじ} と {笠|かさ} を {揃|そろ}えた 。 {背中|せなか} に は 、 ゲンタ の {印|しるし} だ 。 || With Genta's coins I've kitted the young ones out with sandals and hats. On their backs, Genta's mark.

@scene cr.post_ledger
narr: {問屋場|といやば} の {帳面|ちょうめん} 。 {五十年|ごじゅうねん} {前|まえ} の ページ で 、 {字|じ} が {止|と}まって いる 。 {最後|さいご} の {行|ぎょう} に は 、 「ゲンタ 、 {峠|とうげ} {越|ご}え 。 {未着|みちゃく}」 。 || The relay office's ledger. The writing stops on a page fifty years old. The last line: "Genta, over the pass. Not arrived."

@scene cr.post_shelf
narr: {宛先|あてさき} ごと に {仕分|しわ}けた {棚|たな} 。 {一番|いちばん} {上|うえ} の {段|だん} に 、 {埃|ほこり} を かぶった {手紙|てがみ} の {束|たば} 。 「{受取人|うけとりにん} {不明|ふめい}」 。 || Pigeonholes sorted by destination. On the top shelf, a dusty bundle of letters: "Addressee unknown."
?(comp=nao) comp: …… どこ の {問屋場|といやば} に も 、 こういう {棚|たな} が ある 。 {届|とど}かなかった {手紙|てがみ} の {棚|たな} だ 。 || …Every relay office has a shelf like this. The shelf of letters that never got there.

@scene cr.tome
!faceplayer
!if cr_st2 -> later
cr_tome: いらっしゃい 。 {雲路|くもじ} を {登|のぼ}る の ？ {宿場|しゅくば} の {掲示板|けいじばん} に 、 {道|みち} の {様子|ようす} が {書|か}いて ある わ 。 {全部|ぜんぶ} {本当|ほんとう} か は 、 {知|し}らない けど 。 || Welcome. Climbing the Cloudroad? The notice board has how the road is. Whether it's all true, I couldn't say.
cr_tome: {旅人|たびびと} は みんな 、 {違|ちが}う {話|はなし} を {持|も}って {来|く}る の よ 。 {半分|はんぶん} {信|しん}じて おく の が 、 ちょうど いい わ 。 || Every traveller brings a different story. Believing half of each is about right.
!call cr.seals_start
!end
:later
cr_tome: {上|うえ} から {来|き}た {飛脚|ひきゃく} が 、 {道|みち} の {話|はなし} を {正|ただ}しく {持|も}って {来|く}る よう に なった の 。 {誰|だれ} か さん の おかげ ね 。 || The runners coming down have started bringing the road's news right. Thanks to someone, I think.
!call cr.seals_start

@scene cr.tome_after
!faceplayer
cr_tome: {雲路|くもじ} の {灯|ひ} が 、 {全部|ぜんぶ} {点|つ}いた ん です って ね 。 {今夜|こんや} は 、 {満室|まんしつ} よ 。 || They say every lamp on the Cloudroad is lit. We're full tonight.

@scene cr.jinpachi
!faceplayer
!if cr_st3 -> later
cr_jinpachi: {聞|き}いた こと を {聞|き}いた まま {言|い}う の って 、 {難|むずか}しい ん です よ 。 {走|はし}ってる と 、 {頭|あたま} の {中|なか} で {話|はなし} が {勝手|かって} に {育|そだ}つ ん です 。 || Saying what you heard just as you heard it, that's hard. When I'm running, the story grows by itself in my head.
!end
:later
cr_jinpachi: {上|うえ} の {宿|しゅく} から {帰|かえ}って {来|く}る {伝言|でんごん} 、 {最近|さいきん} は {崩|くず}れて ない ん です ！ おいら も 、 {見習|みなら}います ！ || The messages coming back from the stations above don't fall apart any more! I'm going to learn from that!

@scene cr.oiwake_sign
narr: {追分|おいわけ} の {道標|みちしるべ} 。 「{右|みぎ} {雲路|くもじ} ・ {左|ひだり} {灯|ひ} の {道|みち}」 。 {昔|むかし} の {街道|かいどう} で は 、 {道|みち} が {分|わ}かれる {所|ところ} を {追分|おいわけ} と {呼|よ}んだ 。 || Oiwake's signpost: "Right, the Cloudroad; left, the Lantern Road." On the old highways, a place where the road divided was called an oiwake.

@scene cr.oiwake_stone
narr: {宿場|しゅくば} の {外|はず}れ の {石|いし} 。 「{宿|しゅく} は {七|なな}つ 、 {峠|とうげ} は {一|ひと}つ 。」 || A stone at the edge of the station: "Seven stations, one pass."
`);
