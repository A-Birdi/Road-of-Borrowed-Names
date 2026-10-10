/* The Cloudroad, Chapter 10: Kirishita and the Mist Barrier (expansion P12; plan R2, 10_STORY §8 "staying behind";
 * 14_COMPANIONS Nao's crossroads and night apart; sealed S14). Sakichi, who keeps the last lit station below the
 * checkpoint, hears the last relay message; in Nao's journey he is the old courier who taught Nao the road west, and he
 * asks Nao to keep his post. At the Barrier the papers' names have gone blank; Sumi checks the station seals; Ujie hears
 * the party out in formal speech and keeps to the barrier's old, gentle custom: one stays as surety while the other
 * fetches a guarantee from the station above. The companion volunteers (each in their own way); the player goes on
 * alone (`!hook comp_away`, src/engine/58s_surety.js) above the cloud to Kumoi, where Shizu writes the guarantee and
 * remembers the night the last courier never came down. Back at the Barrier, the reunion; in Nao's journey, Nao's
 * answer to Sakichi, said to his face, and the night apart: Nao runs the last leg of the restored relay alone with a
 * reply written by hand, and you find them later on the station's porch, kajika frogs in the stream below. Companion
 * lines for all four; Suzu's have Kansai versions (kansai_98_cr.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const M = (id) => C.maps[id];
  const npc = (mapId, id) => ((M(mapId) || {}).npcs || []).find((n) => n.id === id);
  // Sakichi: the overstated snow forecast put right; the porch at night in Nao's journey
  npc('cr.kirishita', 'cr_sakichi').talk.unshift({ if: 'cr_r5_snow&!cr_r5_fixed&relay_cr_r5_done', scene: 'cr.r5_snow' });
  // the one who stays: waiting in the Barrier office while you are away (each speaks in their own scene)
  const office = M('cr.barrier_office');
  office.npcs.push(
    { id: 'nao', x: 2, y: 4, dir: 'right', if: 'away=nao&cr_fetching', talk: 'cr.wait_nao' },
    { id: 'mio', x: 2, y: 4, dir: 'right', if: 'away=mio&cr_fetching', talk: 'cr.wait_mio' },
    { id: 'ren', x: 2, y: 4, dir: 'right', if: 'away=ren&cr_fetching', talk: 'cr.wait_ren' },
    { id: 'suzu', x: 2, y: 4, dir: 'right', if: 'away=suzu&cr_fetching', talk: 'cr.wait_suzu' });
  // Ujie: the guarantee brought back
  npc('cr.barrier_office', 'cr_ujie').talk.unshift({ if: 'cr_fetching&item.cr_proof', scene: 'cr.barrier_back' });
  // Nao's night apart: Nao on the porch at Kirishita, after running the last leg of the relay
  M('cr.kirishita').npcs.push({ id: 'nao', x: 9, y: 12, dir: 'down', if: 'away=nao&cr_nao_night', talk: 'cr.porch_nao' });
  M('cr.kirishita').onEnter.push({ scene: 'cr.nao_evening', if: 'away=nao&cr_nao_night&!cr_nao_evening' });
})(RB.content);

RB.script.add(`
@scene cr.relay5
!faceplayer
cr_sakichi: {馬返|うまがえ}し から か 。 ゲンジ の {伝言|でんごん} だ な 。 …… {聞|き}こう 。 || From Umagaeshi. Genji's message, I'll wager. …Let's hear it.
!hook relay cr.r5
!if var._relay=cancel -> later
!if cr_r5_snow -> snow
cr_sakichi: {雪|ゆき} に なる だろう 、 か 。 ゲンジ の {勘|かん} は よく {当|あ}たる 。 {夜|よる} の {便|びん} は 、 {早|はや}め に {出|だ}そう 。 || Likely snow. Genji's instinct is usually right. I'll send the night post off early.
!goto next
:snow
cr_sakichi: {明日|あした} から {雪|ゆき} か 。 なら 、 {今夜|こんや} の {便|びん} は {止|と}めよう 。 {雪|ゆき} の {峠|とうげ} に {若|わか}い {者|もの} は {出|だ}さん 。 || Snow from tomorrow. Then I'll hold tonight's post. I won't send a youngster onto a snowy pass.
narr: サキチ は 、 {夜|よる} の {飛脚|ひきゃく} を {止|と}めた 。 || Sakichi holds back the night's runner.
:next
cr_sakichi: {継|つ}ぎ{飛脚|びきゃく} の {伝言|でんごん} が 、 {崩|くず}れず に ここ まで {来|き}た の は 、 {五十年|ごじゅうねん} ぶり だ 。 …… {礼|れい} を {言|い}う 。 || The first relay message to reach me whole in fifty years. …Thank you.
!set cr_relayed5
!quest cr_main 3
!journal {伝言|でんごん} は 、 {霧下|きりした} まで {崩|くず}れず に {届|とど}いた 。 {霧|きり} の {関|せき} へ {行|い}こう 。 || The message reached Kirishita whole. On to the Mist Barrier.
!end
:later
cr_sakichi: {急|いそ}ぐ な 。 {伝言|でんごん} は {逃|に}げん 。 || No hurry. A message doesn't run off.

@scene cr.r5_snow
# The night post held for a forecast passed on as certain; put right by saying it was Genji's reading.
!faceplayer
cr_sakichi: {今夜|こんや} は {雪|ゆき} が {降|ふ}らなかった な 。 {便|びん} を {止|と}めた ぶん 、 {上|うえ} の {宿|しゅく} で {一日|いちにち} {待|ま}つ {者|もの} が {出|で}る 。 || No snow tonight, then. Because I held the post, someone up the road waits a day longer.
!choice
* ゲンジ さん の 「だろう 」 を 、 {言|い}い{落|お}としました 。 || I left out Genji's "likely". -> sorry
* {確|たし}か な {話|はなし} で は ありません でした 。 すみません 。 || It wasn't certain. I'm sorry. -> sorry
:sorry
cr_sakichi: …… そう か 。 「だろう 」 {一|ひと}つ で 、 {人|ひと} が {一日|いちにち} {待|ま}つ 。 {伝言|でんごん} と は 、 そういう もの だ 。 {明日|あした} の {朝|あさ} 、 {出|だ}す 。 {気|き} に する な 。 || …I see. One "likely" left out, and someone waits a day. That's what messages are. I'll send it in the morning. Don't fret.
!set cr_r5_fixed

@scene cr.sakichi_first
# Sakichi, keeper of the last lit station below the Barrier. In Nao's journey, the old courier who taught Nao the road
# west (sealed S14): he knows Nao by their walk; his letters waited at station after station; he asks Nao to keep this
# post, a place where letters reach Nao and people can find them. Nao says nothing yet.
!faceplayer
!set cr_sakichi_met
cr_sakichi: {霧|きり} を {抜|ぬ}けて {来|き}た か 。 {霧下|きりした} へ ようこそ 。 {灯|ひ} の {番|ばん} を して いる 、 サキチ だ 。 || Through the fog, eh. Welcome to Kirishita. I'm Sakichi; I keep the lamp.
cr_sakichi: {昔|むかし} は {飛脚|ひきゃく} だった 。 {今|いま} は 、 {誰|だれ} も {来|こ}ない {宿|しゅく} の {灯|ひ} を {守|まも}って いる 。 {呼|よ}ぶ {者|もの} が いなく なって も 、 {名前|なまえ} は {忘|わす}れちゃ いかん から な 。 || I was a courier once. Now I keep a lamp at a station nobody comes to. Even with nobody left to call its name, a name mustn't be forgotten.
?(comp=nao) !call cr.sakichi_nao
?(!comp=nao) cr_sakichi: {上|うえ} の {関所|せきしょ} は 、 {手形|てがた} に うるさい ぞ 。 {近頃|ちかごろ} は 、 {手形|てがた} の {字|じ} が {消|き}える って {話|はなし} だ 。 {気|き} を つけな 。 || The checkpoint above is strict about papers. These days they say the writing on papers fades away. Mind how you go.
cr_sakichi: …… {五十年|ごじゅうねん} {前|まえ} の {晩|ばん} の こと か ？ わし は ここ で 、 ゲンタ さん を {待|ま}って いた 。 {峠|とうげ} の {向|む}こう から {来|く}る {便|びん} を 、 {受|う}け{取|と}る {番|ばん} だった 。 {雪|ゆき} が {酷|ひど}くて な 。 {朝|あさ} まで {待|ま}った が 、 {来|こ}なかった 。 || …About that night fifty years ago? I was here, waiting for Genta. It was my turn to take the post coming over the pass. The snow was terrible. I waited till morning. He never came.
!set cr_sakichi_waited

@scene cr.sakichi_nao
!gesture cr_sakichi observe comp
cr_sakichi[surprise]: …… その {歩|ある}き{方|かた} 。 {左|ひだり} の {肩|かた} が {少|すこ}し {上|あ}がる 。 …… ナオ か 。 || …That walk. The left shoulder rides a little high. …Nao?
comp[closed]: …… {久|ひさ}しぶり です 、 サキチ さん 。 || …It's been a long time, Sakichi.
cr_sakichi: {手紙|てがみ} は 、 {届|とど}いて いた か 。 {宿|しゅく} から {宿|しゅく} へ 、 {何十通|なんじゅっつう} も {出|だ}した 。 || Did my letters reach you? I sent dozens, station to station.
comp: …… {届|とど}いて は いた 。 {八百橋|やおばし} で 、 {束|たば} で 。 {言|こと}の{葉|は}{島|じま} で も 、 {一通|いっつう} 。 …… {開|あ}けた の は 、 {最近|さいきん} だ 。 || …They reached me. A bundle, in Manybridge. One on Kotonoha too. …I only opened them lately.
cr_sakichi: そう か 。 {開|あ}けて くれた なら 、 それ で いい 。 || I see. If you opened them, that's enough.
cr_sakichi: ナオ 。 {書|か}いた とおり だ 。 わし も もう {年|とし} だ 。 この {宿|しゅく} を 、 お{前|まえ} に {継|つ}いで ほしい 。 {手紙|てがみ} が お{前|まえ} に {届|とど}く {場所|ばしょ} だ 。 {人|ひと} が お{前|まえ} を {探|さが}せる {場所|ばしょ} だ 。 || Nao. It's as I wrote. I'm old now. I want you to take over this station. A place where letters reach you. A place where people can find you.
narr: ナオ は 、 {何|なに} も {答|こた}えなかった 。 {灯|ひ} の {方|ほう} を 、 {長|なが}い {間|あいだ} {見|み}て いた 。 || Nao doesn't answer. They look at the lamp for a long time.
!set cr_nao_asked

@scene cr.sakichi_idle
!faceplayer
!if cr_passed -> after
cr_sakichi: {関所|せきしょ} は {霧|きり} の {中|なか} だ 。 {道|みち} は {一本|いっぽん} 、 {迷|まよ}う こと は ない 。 || The checkpoint's up in the mist. One road; you can't go wrong.
!end
:after
cr_sakichi: {峠|とうげ} の {飛脚|ひきゃく}{小屋|ごや} は 、 {五十年|ごじゅうねん} {誰|だれ} も {近|ちか}づかない 。 …… {気|き} を つけて な 。 || Nobody's been near the courier's hut at the pass in fifty years. …Take care.

@scene cr.sakichi_after
!faceplayer
?(comp=nao) cr_sakichi: {手紙|てがみ} は {今|いま} 、 {一週間|いっしゅうかん} で ナオ に {届|とど}く 。 …… {長生|ながい}き は する もん だ 。 || Letters reach Nao within the week now. …It pays to live a long time.
?(!comp=nao) cr_sakichi: {継|つ}ぎ{飛脚|びきゃく} が 、 {峠|とうげ} の {向|む}こう まで {走|はし}る よう に なった 。 わし の {灯|ひ} も 、 {一人|ひとり} で {守|まも}らなくて よく なった 。 || The relay runs over the pass again. I don't have to keep my lamp alone any more.

@scene cr.sakichi_shelf
narr: {郵便|ゆうびん} の {棚|たな} 。 {一段|いちだん} だけ 、 {名前|なまえ} の {札|ふだ} が {付|つ}いて いる 。 「ナオ {宛|あ}て 」 。 {中|なか} は {空|から} だ 。 || The post shelf. One pigeonhole has a name card: "For Nao." It is empty.
?(comp=nao) comp: …… {空|から} に なった か 。 {全部|ぜんぶ} 、 {俺|おれ} の {所|ところ} に {来|き}た から な 。 || …Empty now. They all came to me.

@scene cr.barrier_first
# The fence in the mist across the whole saddle; the roofed gate shut; a guard; the office where papers are shown.
!set cr_barrier_seen
!gesture pc lookroad right
narr: {霧|きり} の {中|なか} に 、 {灰色|はいいろ} の {柵|さく} が {尾根|おね} を {横切|よこぎ}って いる 。 {屋根|やね} の ある {門|もん} は 、 {閉|し}まって いる 。 {霧|きり} の {関|せき} だ 。 || In the mist, a grey fence runs right across the ridge. The roofed gate is shut. The Mist Barrier.
?(comp=nao) comp: {関所|せきしょ} か 。 …… {手形|てがた} を {見|み}せる {時|とき} は 、 {余計|よけい} な こと を {言|い}う な よ 。 || A checkpoint. …When we show the papers, don't say more than you need.
?(comp=mio) comp: {柵|さく} が どこ まで も {続|つづ}いて います 。 {通|とお}る {所|ところ} は 、 あの {門|もん} だけ です ね 。 || The fence goes on and on. The gate is the only way through.
?(comp=ren) comp: {門|もん} の {灯|ひ} は {点|つ}いて います 。 ここ は 、 {誰|だれ} か が {守|まも}って いる {関|せき} です 。 || The gate's lamp is lit. Someone keeps this barrier.
?(comp=suzu) comp: {関所|せきしょ} の {芝居|しばい} なら 、 {何度|なんど} も {見|み}た わ 。 {本物|ほんもの} は 、 もっと {静|しず}か ね 。 || I've seen plenty of checkpoint plays. The real one's quieter.
!quest cr_main 4
!journal {霧|きり} の {関|せき} に {着|つ}いた 。 {番所|ばんしょ} で {手形|てがた} を {見|み}せよう 。 || You've reached the Mist Barrier. Show your papers at the office.

@scene cr.barrier_stop
!faceplayer cr_gonza
cr_gonza: {待|ま}たれよ 。 {手形|てがた} の {改|あらた}め は 、 {番所|ばんしょ} で 。 || Halt. Papers are checked in the office.
!move pc left 1

@scene cr.barrier_board
narr: {関所|せきしょ} の {高札|こうさつ} 。 「{手形|てがた} {無|な}き {者|もの} 、 {通|とお}る べからず 。 {但|ただ}し 、 {身元|みもと} を {証|あか}す {者|もの} {在|あ}れば 、 {此|こ}の {限|かぎ}り に {在|あ}らず 。」 || The barrier's notice board: "None may pass without papers. Except where another vouches for them." (Classical: 但し, "however"; 此の限りに在らず, "this does not apply".)

@scene cr.barrier_bench
narr: {番所|ばんしょ} の {前|まえ} の {長椅子|ながいす} 。 {待|ま}つ {人|ひと} の ため の {場所|ばしょ} だ 。 || A bench in front of the office: a place for those who wait.

@scene cr.gonza
!faceplayer
!if cr_passed -> after
cr_gonza: {手形|てがた} は {番所|ばんしょ} で ウジエ {様|さま} に 。 {門|もん} は 、 それ から だ 。 || Papers to Lady Ujie in the office. The gate comes after.
!end
:after
cr_gonza: {通|とお}られよ 。 {峠|とうげ} は {雪|ゆき} だ 。 {気|き} を つけて 。 || Pass. There's snow on the pass. Take care.

@scene cr.gonza_after
!faceplayer
cr_gonza: {近頃|ちかごろ} は {旅人|たびびと} が {多|おお}くて 、 {番所|ばんしょ} の お{茶|ちゃ} が {足|た}りん 。 || So many travellers these days, the office keeps running out of tea.

@scene cr.ujie
# The keeper of the Barrier. The papers checked (Sumi first, at her table), then the formal interview; the ruling and
# the old custom of surety. The companion volunteers; you go on alone to Kumoi for a guarantee.
!faceplayer
!if cr_passed -> passed
!if cr_fetching -> fetching
!if !cr_seals_checked -> sumi
cr_ujie: {霧|きり} の {関|せき} の {関守|せきもり} 、 ウジエ で ございます 。 {手形|てがた} を {拝見|はいけん} いたしました 。 お{名前|なまえ} が 、 {消|き}えて おります ね 。 || I am Ujie, keeper of the Mist Barrier. I have seen your papers. Your names have faded from them.
cr_ujie: {今月|こんげつ} 、 {三人目|さんにんめ} で ございます 。 {紙|かみ} の {名|な} が 、 {朝|あさ} に なる と {白|しろ}く なって いる 。 {理由|りゆう} は 、 {分|わ}かりません 。 || You are the third this month. A name on paper turns white by morning. Why, we do not know.
cr_ujie: いくつか 、 お{尋|たず}ね いたします 。 {関所|せきしょ} の {決|き}まり で ございます ので 。 || I must ask you a few questions. It is the barrier's rule.
!challenge cr.interview
cr_ujie: …… {筋|すじ} の {通|とお}った お{話|はなし} です 。 {偽|いつわ}り は ない と {存|ぞん}じます 。 || …An account that holds together. I believe there is no falsehood in it.
cr_ujie: ですが 、 {手形|てがた} に {名|な} が ない 。 {私|わたくし} の {一存|いちぞん} で は 、 お{通|とお}し できません 。 || But there are no names on the papers. I cannot let you through on my word alone.
cr_ujie: この {関|せき} に は 、 {古|ふる}い {決|き}まり が ございます 。 {身元|みもと} を {証|あか}す {物|もの} の ない お{二人|ふたり} は 、 {一人|ひとり} が ここ に {残|のこ}り 、 {一人|ひとり} が {上|うえ} の {雲居|くもい} の {宿|しゅく} から {請状|うけじょう} を いただいて {来|く}る 。 || This barrier has an old custom. When two travellers have nothing to prove who they are, one stays here, and the other goes up to Kumoi Station for a letter of guarantee.
cr_ujie: {残|のこ}る {方|かた} は 、 {番所|ばんしょ} で お{預|あず}かり いたします 。 {縄|なわ} も {牢|ろう} も ございません 。 お{茶|ちゃ} と {座布団|ざぶとん} だけ で ございます 。 || The one who stays is our guest in the office. No ropes and no cell: only tea and a cushion.
?(comp=nao) comp: …… {俺|おれ} が {残|のこ}る 。 {考|かんが}える こと も ある 。 {上|うえ} の {道|みち} は 、 お{前|まえ} の {足|あし} なら {大丈夫|だいじょうぶ} だ 。 || …I'll stay. I've got some thinking to do. Your legs can manage the road up.
?(comp=mio) comp: わたし が {残|のこ}ります 。 {少|すこ}し 、 {頭|あたま} が {痛|いた}くて 。 {休|やす}んで いれば {治|なお}ります から 。 …… {本当|ほんとう} です よ 。 || I'll stay. My head aches a little. It'll pass if I rest. …Really, it will.
?(comp=ren) comp: {私|わたし} が {残|のこ}ります 。 …… {上|うえ} の {道|みち} で {私|わたし} が {迷|まよ}う より 、 ここ で {待|ま}つ {方|ほう} が 、 みんな の ため です 。 || I'll stay. …Better I wait here than get lost on the road up. For everyone's sake.
?(comp=suzu) comp: わたし が {残|のこ}る わ 。 {番所|ばんしょ} の {皆|みな}さん に 、 {一席|いっせき} {聞|き}かせて あげる 。 {帰|かえ}って {来|く}る まで 、 {退屈|たいくつ} させない から 。 || I'll stay. I'll give the office a performance. They won't be bored till you're back.
!choice
* {頼|たの}む 。 すぐ {戻|もど}る 。 || Thank you. I'll be back soon. -> go
* {一緒|いっしょ} に {行|い}けない の か 。 || We can't go together? -> ask
:ask
cr_ujie: {申|もう}し{訳|わけ} ございません 。 {決|き}まり で ございます 。 …… {雲居|くもい} は 、 {霧|きり} の {上|うえ} 。 {道|みち} は {一本|いっぽん} で ございます 。 || I am sorry. It is the rule. …Kumoi is above the mist. There is one road.
:go
?(comp=nao) comp: {行|い}って {来|こ}い 。 …… {戻|もど}って {来|く}る {奴|やつ} を {待|ま}つ の は 、 {悪|わる}く ない 。 || Go on. …Waiting for someone who'll come back isn't so bad.
?(comp=mio) comp[smile]: {行|い}って らっしゃい 。 {寒|さむ}い から 、 これ を 。 …… {生姜|しょうが} の {飴|あめ} です 。 || Off you go. It's cold, so take this. …A ginger sweet.
?(comp=ren) comp: {道|みち} は {一本|いっぽん} です 。 …… それ でも 、 {灯|ひ} の ある {方|ほう} へ {行|い}って ください ね 。 || There's one road. …Even so, keep to the lit side.
?(comp=suzu) comp: {一人|ひとり} {芝居|しばい} の {稽古|けいこ} だ と {思|おも}って 。 {幕|まく} が {下|お}りる {前|まえ} に {戻|もど}って {来|き}て よ 。 || Think of it as rehearsing a one-person show. Be back before the curtain comes down.
!set cr_apart
!set cr_fetching
!hook comp_away surety
!quest cr_main 5
!journal {仲間|なかま} が {関所|せきしょ} に {残|のこ}った 。 {一人|ひとり} で {雲居宿|くもいじゅく} へ {行|い}き 、 シズ と いう {名主|なぬし} から {請状|うけじょう} を もらって {来|こ}よう 。 || Your companion has stayed at the Barrier. Go on alone to Kumoi Station and bring back a letter of guarantee from the headwoman, Shizu.
!end
:sumi
cr_ujie: {手形|てがた} は 、 {先|さき} に スミ に お{見|み}せ ください 。 || Please show your papers to Sumi first.
!end
:fetching
cr_ujie: {雲居|くもい} の シズ {様|さま} に 、 よろしく お{伝|つた}え ください 。 || Please give my regards to Lady Shizu of Kumoi.
!end
:passed
cr_ujie: お{気|き}を つけて 。 {峠|とうげ} の {向|む}こう まで 、 {無事|ぶじ} の お{通|とお}り を 。 || Take care. A safe journey, over the pass and beyond.

@scene cr.ujie_after
!faceplayer
cr_ujie: {手形|てがた} の {名|な} は 、 もう {消|き}えなく なりました 。 …… {関所|せきしょ} を {茶屋|ちゃや} に して は どうか と 、 {笑|わら}う {者|もの} も おります 。 || Names on papers no longer fade. …Some laugh that we should turn the barrier into a teahouse.

@scene cr.sumi
# Sumi checks the station seals on your papers; one of the seals on a page that came with them is forged.
!faceplayer
!if cr_seals_checked -> done
cr_sumi: {手形|てがた} を {改|あらた}めます 。 …… あら 、 {名前|なまえ} が {白|しろ}い 。 また です ね 。 || Let me check your papers. …Oh, the names are white. Another one.
cr_sumi: {名前|なまえ} は {後|あと} で {書|か}き{直|なお}して いただきます 。 {先|さき} に 、 {印|いん} を {見|み}ましょう 。 {宿場|しゅくば} の {印|いん} が {押|お}して あります が …… {一|ひと}つ 、 {変|へん} な の が {混|ま}じって いる 。 {分|わ}かります か 。 || You'll write your names in again later. First, the seals. The stations' seals are stamped here… but one doesn't belong. Can you tell which?
!challenge cr.papers_seal
cr_sumi[smile]: そう 、 それ が {偽物|にせもの} 。 {前|まえ} の {持|も}ち{主|ぬし} が 、 {関所|せきしょ} を {抜|ぬ}けよう と して {押|お}した の でしょう 。 {目|め} が いい わ ね 。 || Yes, that's the forgery. The papers' last owner must have stamped it to slip through. You've a good eye.
cr_sumi: では 、 {名前|なまえ} と 、 {行|い}き{先|さき} と 、 {目的|もくてき} を 。 || Now: your names, where you're going, and why.
!challenge cr.papers_fill
!set cr_seals_checked
cr_sumi: これ で {手形|てがた} は {整|ととの}いました 。 …… でも 、 {名前|なまえ} が {消|き}えた {紙|かみ} です 。 ウジエ {様|さま} が どう {判断|はんだん} される か 。 {奥|おく} へ どうぞ 。 || The papers are in order now. …But they are papers whose names faded once. What Lady Ujie will decide, I can't say. Please go through.
!end
:done
cr_sumi: {手形|てがた} は {整|ととの}って います 。 あと は ウジエ {様|さま} に 。 || The papers are in order. The rest is for Lady Ujie.

@scene cr.sumi_after
!faceplayer
cr_sumi: {偽|にせ} の {印|いん} は 、 {近頃|ちかごろ} {見|み}なく なりました 。 {誰|だれ} か が {関所|せきしょ} の {話|はなし} を 、 {本当|ほんとう} の まま {伝|つた}えて くれた よう で 。 || We see no forged seals lately. It seems someone passed on the truth about the barrier.

@scene cr.ujie_desk
narr: {関守|せきもり} の {机|つくえ} 。 {古|ふる}い {通行|つうこう} の {記録|きろく} が {開|ひら}いて ある 。 {五十年|ごじゅうねん} {前|まえ} の {冬|ふゆ} の ページ に は 、 {何|なに} も {書|か}いて いない 。 {関|せき} を {通|とお}った {飛脚|ひきゃく} は 、 いなかった 。 || The keeper's desk. An old register of crossings lies open. On the page for the winter fifty years ago, nothing is written. No courier passed the barrier.
!set cr_clue_register

@scene cr.sumi_table
narr: {改|あらた}め の {台|だい} 。 {印|いん} を {比|くら}べる ため の 、 {本物|ほんもの} の {印|いん} の {写|うつ}し が {並|なら}んで いる 。 || The inspection table. Copies of the true seals are laid out for comparison.

@scene cr.wait_nao
!faceplayer
nao: {早|はや}かった な 。 …… いや 、 まだ {行|い}って ない の か 。 {雲居|くもい} は {上|うえ} だ 。 {灯|ひ} の ある {方|ほう} へ {行|い}け 。 || That was quick. …Oh, you haven't gone yet. Kumoi's up the road. Head for the light.
@scene cr.wait_mio
!faceplayer
mio: お{茶|ちゃ} を いただいて います 。 {頭|あたま} も {少|すこ}し {楽|らく} に なりました 。 {急|いそ}がなくて いい です よ 。 || I'm being given tea. My head's a little better. No need to rush.
@scene cr.wait_ren
!faceplayer
ren: {番所|ばんしょ} の {灯|ひ} の {名前|なまえ} を 、 {教|おし}えて もらいました 。 …… {迷|まよ}わず に 、 {戻|もど}って {来|き}て ください ね 。 || They told me the name of the office's lamp. …Come back without getting lost.
@scene cr.wait_suzu
!faceplayer
suzu: {番所|ばんしょ} の {皆|みな}さん 、 {笑|わら}い {上戸|じょうご} よ 。 {心配|しんぱい} しない で 。 …… {早|はや}く {戻|もど}って {来|き}て ね 。 || The office folk laugh at anything. Don't worry about me. …Do hurry back, though.

@scene cr.above_first
# Above the cloud, alone: the road climbs out of the mist into sun; the cloud sea below; snow on the peaks; no one to
# say anything to. The stretch is tuned for one (no follower, no techniques, battles fought alone).
!set cr_above_seen
!var cr_phase = 6
narr: {霧|きり} を {抜|ぬ}ける と 、 {急|きゅう} に {空|そら} が {開|ひら}けた 。 {足|あし} の {下|した} に 、 {雲|くも} の {海|うみ} が {広|ひろ}がって いる 。 || Out of the mist, the sky opens all at once. A sea of cloud spreads out below your feet.
narr: {話|はな}しかける {相手|あいて} が 、 {隣|となり} に いない 。 {道|みち} は {一本|いっぽん} 、 {雲居|くもい} へ {続|つづ}いて いる 。 || There is no one beside you to talk to. One road leads on to Kumoi.

@scene cr.above_stone
narr: 「{是|これ} より {雲居|くもい} 。 {雲|くも} の {上|うえ} の {宿|しゅく} 。」 {苔|こけ} の ない {石|いし} 。 ここ まで は 、 {苔|こけ} も {登|のぼ}って {来|こ}られない らしい 。 || "Kumoi from here. The station above the clouds." No moss on the stone: even moss can't climb this high, it seems.

@scene cr.arrive7
# Kumoi: the station above the cloud; snow in the air; its lamp dark; the headwoman's house.
!set cr_st7
!var cr_st = 7
!var cr_phase = 6
narr: {雲居宿|くもいじゅく} 。 {雲|くも} の {上|うえ} の {小|ちい}さな {宿場|しゅくば} 。 {雪|ゆき} が {舞|ま}って いる 。 || Kumoi Station: a small post station above the clouds. Snow is drifting down.
narr: {宿場|しゅくば} の {常夜灯|じょうやとう} は 、 {消|き}えて いる 。 {名主|なぬし} の {家|いえ} は 、 {一番|いちばん} {奥|おく} だ 。 || The station's lamp is dark. The headwoman's house is at the far end.

@scene cr.shizu
# Shizu, the headwoman: a guarantee asked of someone who has never met you; what she needs is the truth. She was a
# child the night the last courier never came down from the pass; her father kept the station's register.
!faceplayer
!if cr_passed -> after
!if item.cr_proof -> given
cr_shizu: {名主|なぬし} の シズ です 。 …… {関所|せきしょ} から 、 お{一人|ひとり} で ？ では 、 {請状|うけじょう} です ね 。 || I'm Shizu, the headwoman. …From the Barrier, on your own? Then it's a guarantee you want.
!challenge cr.guarantee
cr_shizu: …… {分|わ}かりました 。 {全部|ぜんぶ} {話|はな}して くれた から 、 わたし も {書|か}けます 。 || …I understand. You told me all of it, so I can write it.
!give cr_proof
cr_shizu: {関所|せきしょ} で {待|ま}って いる {方|かた} が いる なら 、 {早|はや}く {戻|もど}って あげて 。 {待|ま}つ {方|ほう} は 、 {長|なが}い もの です から 。 || If someone is waiting for you at the Barrier, go back to them soon. Waiting is the longer part.
cr_shizu: …… わたし も 、 {待|ま}った こと が ある の 。 {五十年|ごじゅうねん} {前|まえ} 、 {子供|こども} の {時|とき} 。 {父|ちち} が この {宿|しゅく} の {帳面|ちょうめん} を {付|つ}けて いて 、 {峠|とうげ} から {下|お}りて {来|く}る ゲンタ さん を 、 {一晩中|ひとばんじゅう} {待|ま}った 。 {雪|ゆき} の {夜|よる} だった 。 {来|こ}なかった わ 。 || …I've waited too. Fifty years ago, as a child. My father kept this station's register, and we waited all night for Genta to come down from the pass. A snowy night. He never came.
!set cr_shizu_waited
!journal シズ から {請状|うけじょう} を もらった 。 {関所|せきしょ} へ {戻|もど}ろう 。 || Shizu gave you a letter of guarantee. Go back to the Barrier.
!end
:given
cr_shizu: {請状|うけじょう} は {持|も}った ね 。 {関所|せきしょ} へ 、 {早|はや}く 。 || You have the guarantee. Back to the Barrier, quickly.
!end
:after
cr_shizu: {峠|とうげ} を {越|こ}える の ね 。 {飛脚|ひきゃく}{小屋|ごや} の {前|まえ} を {通|とお}る なら …… いえ 、 {何|なん} でも ない わ 。 || Crossing the pass, then. If you go by the courier's hut… No, never mind.

@scene cr.shizu_after
!faceplayer
cr_shizu: {父|ちち} の {帳面|ちょうめん} の {最後|さいご} の {行|ぎょう} に 、 やっと {続|つづ}き が {書|か}けた わ 。 「ゲンタ 、 {峠|とうげ} に て {手紙|てがみ} を {守|まも}る 。 {五十年|ごじゅうねん} {後|ご} 、 {届|とど}く 。」 || I could finally write the rest of my father's last line in the register: "Genta, at the pass, kept the letter safe. Fifty years later, it arrived."

@scene cr.koma
!faceplayer
cr_koma: {雲|くも} の {下|した} から {来|き}た の ？ {下|した} は 、 {雨|あめ} ？ ここ は 、 いつも {晴|は}れ だ よ 。 {雲|くも} より {上|うえ} だ から ね 。 || You came from under the clouds? Is it raining down there? It's always sunny up here. We're above the clouds.

@scene cr.koma_after
!faceplayer
cr_koma: {飛脚|ひきゃく} の お{兄|にい}さん が 、 {毎日|まいにち} {来|く}る よう に なった ！ {手紙|てがみ} も 、 {毎日|まいにち} ！ || A relay runner comes every day now! And letters, every day!

@scene cr.kumoi_stone
narr: {雲居|くもい} の {石|いし} 。 「{峠|とうげ} {越|ご}え の {飛脚|ひきゃく} 、 {此処|ここ} に て {息|いき} を {継|つ}ぐ 。」 || Kumoi's stone: "Couriers crossing the pass catch their breath here."

@scene cr.kumoi_east
?(cr_fetching) narr: {峠|とうげ} へ の {道|みち} は 、 {先|さき} へ {続|つづ}いて いる 。 でも 、 {関所|せきしょ} で {待|ま}って いる {人|ひと} が いる 。 {先|さき} に {戻|もど}ろう 。 || The road to the pass goes on ahead. But someone is waiting at the Barrier. Go back first.
?(!cr_fetching) narr: {峠|とうげ} へ の {道|みち} 。 {関所|せきしょ} を {抜|ぬ}けて から だ 。 || The road to the pass. Not until you're through the Barrier.
!move pc left 1

@scene cr.barrier_back
# The guarantee brought back; Ujie reads it and opens the gate for both; the reunion, each in their own way. In
# Nao's journey Nao has decided, and asks for tonight: to say it to Sakichi's face.
!faceplayer
!take cr_proof
cr_ujie: …… {雲居|くもい} の シズ {様|さま} の {字|じ} と {印|いん} 。 {確|たし}か に 。 {関|せき} を お{通|とお}し いたします 。 お{二人|ふたり} とも 。 || …Lady Shizu of Kumoi's hand and seal. Certainly. You may pass the barrier. Both of you.
!unset cr_fetching
!unset cr_apart
!set cr_passed
!hook comp_back
?(comp=nao) comp: …… {戻|もど}った か 。 {待|ま}つ の は 、 {思|おも}った より {長|なが}かった 。 || …You're back. Waiting was longer than I thought.
?(comp=mio) comp[smile]: おかえり なさい 。 {頭|あたま} も {治|なお}りました 。 {生姜|しょうが} の {飴|あめ} 、 {役|やく} に {立|た}ちました か ？ || Welcome back. My head's better. Did the ginger sweet help?
?(comp=ren) comp[happy]: …… {迷|まよ}わず に {戻|もど}って {来|き}ました ね 。 {番所|ばんしょ} の {灯|ひ} を 、 {毎晩|まいばん} {呼|よ}んで いました 。 {目印|めじるし} に なる よう に 。 || …You came back without getting lost. I called the office's lamp every night, so it would be something to steer by.
?(comp=suzu) comp[laugh]: {遅|おそ}い ！ …… {冗談|じょうだん} よ 。 {番所|ばんしょ} の {人|ひと} たち 、 わたし の {芸|げい} で {三回|さんかい} {泣|な}いた わ 。 {笑|わら}い {泣|な}き で ね 。 || Late! …I'm joking. The office folk cried three times at my act. From laughing.
!hook co_bond cr:surety
!quest cr_main 6
!journal {関所|せきしょ} を {二人|ふたり} で {越|こ}えた 。 {雲居宿|くもいじゅく} から {雲路峠|くもじとうげ} へ {登|のぼ}ろう 。 || Through the Barrier together. Climb from Kumoi Station to the High Pass.
?(comp=nao) !call cr.nao_decides

@scene cr.nao_decides
# Nao's answer, to be said to Sakichi's face: "I need to run this one myself." Nao takes the last leg of the restored
# relay down to Kirishita alone, with a reply written by hand, and asks you to come down later.
comp: …… {決|き}めた 。 {答|こた}え は 、 サキチ さん に {直接|ちょくせつ} {言|い}う 。 {手紙|てがみ} じゃ なく て な 。 || …I've decided. I'll give Sakichi my answer in person. Not by letter.
comp: {手紙|てがみ} は {書|か}いた 。 {待|ま}って いる {間|あいだ} に 、 {手|て} で 。 …… これ は 、 {俺|おれ} が {一人|ひとり} で {走|はし}る 。 {継|つ}ぎ{飛脚|びきゃく} の {最後|さいご} の {区間|くかん} だ 。 || I wrote him a letter, by hand, while I waited. …This one I need to run myself. The relay's last leg.
comp: {先|さき} に {下|お}りる 。 {後|あと} から {来|こ}い 。 {霧下|きりした} の {宿|やど} で 、 {会|あ}おう 。 || I'll go down first. Come after. We'll meet at the inn at Kirishita.
!set cr_nao_night
!hook comp_away night
!journal ナオ は 、 {手書|てが}き の {手紙|てがみ} を {持|も}って 、 {一人|ひとり} で {霧下|きりした} へ {走|はし}って {行|い}った 。 {後|あと} で {霧下|きりした} の {宿|やど} へ {行|い}こう 。 || Nao ran down to Kirishita alone, with a letter written by hand. Go down to the inn at Kirishita later.

@scene cr.nao_evening
# Kirishita that evening: Sue says Nao ran in at dusk and gave Sakichi a letter, by hand; Sakichi at the hearth
# reading it. Then the porch.
!set cr_nao_evening
!ambience dusk
cr_sue: {夕方|ゆうがた} 、 ナオ さん が {走|はし}って {来|き}た の よ 。 サキチ さん に 、 {手紙|てがみ} を {手|て} で {渡|わた}して 。 …… サキチ さん 、 {囲炉裏|いろり} の {前|まえ} で 、 まだ {読|よ}んで いる わ 。 {何度|なんど} も 。 || Nao came running in at dusk. Handed Sakichi a letter, by hand. …Sakichi's still reading it by the hearth. Over and over.
cr_sue: ナオ さん なら 、 {縁側|えんがわ} よ 。 || Nao's on the porch.

@scene cr.porch_nao
# Nao's night apart (14_COMPANIONS §4–5): the station's porch at night, the stream below, kajika frogs, wind in the
# cedars, a horse bell far down the road. Still, slow; the reply delivered, the answer said aloud: Nao will finish the
# road with you. The post, the letters, the forwarding address: later (S14).
!ambience night
!sfx crickets
narr: {縁側|えんがわ} に 、 ナオ が {座|すわ}って いる 。 {下|した} の {沢|さわ} で 、 カジカ が {鳴|な}いて いる 。 || Nao is sitting on the porch. Down in the stream, kajika frogs are singing.
nao[closed]: …… {走|はし}った よ 。 {最後|さいご} の {区間|くかん} 。 {手紙|てがみ} は 、 {手|て} で {渡|わた}した 。 || …I ran it. The last leg. I handed him the letter myself.
nao: {答|こた}え も 、 {言|い}った 。 この {宿|しゅく} は {継|つ}げない 。 {今|いま} は 、 お{前|まえ} と {道|みち} の {最後|さいご} まで {行|い}く 。 …… {顔|かお} を {見|み}て {言|い}えた 。 {手紙|てがみ} で {逃|に}げなかった 。 || I told him my answer too. I can't take this station. For now, I'm going to the end of the road with you. …I said it looking at him. I didn't hide in a letter.
!sfx wind
nao: サキチ さん は 、 {笑|わら}った よ 。 「{知|し}って いた 」 って 。 「{手紙|てがみ} を {開|あ}けた と {聞|き}いた {時|とき} から な 」 。 || Sakichi laughed. "I knew," he said. "From the moment I heard you'd opened the letters."
!choice
* {待|ま}たせて いた {人|ひと} が いた ん だ ね 。 || There was someone you'd kept waiting. -> waited
* {顔|かお} を {見|み}て {言|い}えて 、 よかった 。 || I'm glad you could say it to his face. -> face
:waited
nao: …… ああ 。 {人|ひと} を {一生|いっしょう} {待|ま}たせる の が 、 {一番|いちばん} {怖|こわ}い と {言|い}って おき ながら な 。 {俺|おれ} が 、 それ を して いた 。 || …Yeah. For all I said the worst thing would be keeping someone waiting forever. I was the one doing it.
!goto end2
:face
nao[smile]: …… ああ 。 {飛脚|ひきゃく} が {手紙|てがみ} に {隠|かく}れて ちゃ 、 {話|はなし} に ならない 。 || …Yeah. A courier hiding behind a letter makes no sense.
:end2
narr: {遠|とお}く の {下|した} の {道|みち} で 、 {馬|うま} の {鈴|すず} が {一度|いちど} {鳴|な}った 。 カジカ の {声|こえ} が 、 また {始|はじ}まる 。 || Far down the road, a horse bell rings once. The frogs start up again.
nao: …… {明日|あした} 、 {峠|とうげ} に {行|い}こう 。 {寝|ね}よう 。 || …Tomorrow, the pass. Let's sleep.
!unset cr_nao_night
!set cr_nao_back
!set cr_nao_crossroads
!hook comp_back
!hook co_bond cr:night
!hook co_remember together cr_porch
`);
