/* The Cloudroad, Chapter 10: station by station (expansion P12; docs/future/work/P12_CLOUDROAD.md). At each station:
 * the arrival (the weather's phase moves on), the everlasting lamp relit by its name from the relay's ledger (Ren calls
 * it, in Ren's journey), the message carried up from the station below and repeated there with the certainty you have
 * (the relay sheet), the next message handed on, and, leaving by the east end, the reports weighed and a road chosen
 * (the plan sheet). The lamp, board, departure and palanquin scenes are built from one table below; the rest is
 * written out. Companion lines for all four; Suzu's have Kansai versions (kansai_98_cr.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const npc = (mapId, id) => ((C.maps[mapId] || {}).npcs || []).find((n) => n.id === id);
  // the message each station hands on, and who hears it at the next: talk options first, while they wait
  const RELAY = [
    { n: 1, map: 'cr.suginoki', who: 'cr_ine' }, { n: 2, map: 'cr.sakashita', who: 'cr_heisuke' }, { n: 3, map: 'cr.nakayama', who: 'cr_otaki' },
    { n: 4, map: 'cr.umagaeshi', who: 'cr_genji' }, { n: 5, map: 'cr.kirishita', who: 'cr_sakichi' },
  ];
  for (const r of RELAY) {
    const p = npc(r.map, r.who);
    if (p) p.talk.unshift({ if: 'cr_given' + r.n + '&!relay_cr_r' + r.n + '_done', scene: 'cr.relay' + r.n });
  }
  // the overstated messages' side consequences, put right by talking to whoever acted on them
  npc('cr.sakashita', 'cr_heisuke').talk.unshift({ if: 'cr_r2_crew&!cr_r2_fixed&relay_cr_r2_done', scene: 'cr.r2_crew' });
  npc('cr.nakayama', 'cr_otaki').talk.unshift({ if: 'cr_r3_rescue&!cr_r3_fixed&relay_cr_r3_done', scene: 'cr.r3_rescue' });
  npc('cr.umagaeshi', 'cr_genji').talk.unshift({ if: 'cr_r4_ledge&!cr_r4_fixed&relay_cr_r4_done', scene: 'cr.r4_ledge' });
})(RB.content);

// ---- the lamps, boards, departures and the palanquin, from one table ------------------------------------------------
(function () {
  'use strict';
  const ST = [
    { n: 1, jp: '{追分|おいわけ}', en: 'Oiwake', ord: '{一番目|いちばんめ}', give: 'カンベエ', giveEn: 'Kanbe', light: '{分|わ}かれ{道|みち} の {道標|みちしるべ} が 、 {灯|ひ} に {照|て}らされた 。 || The signpost at the fork stands lit.' },
    { n: 2, jp: '{杉|すぎ}ノ{木|き}', en: 'Suginoki', ord: '{二番目|にばんめ}', give: 'イネ', giveEn: 'Ine', light: '{大杉|おおすぎ} の {幹|みき} に 、 {灯|ひ} が {映|うつ}った 。 || Light falls on the great cedar\'s trunk.' },
    { n: 3, jp: '{坂下|さかした}', en: 'Sakashita', ord: '{三番目|さんばんめ}', give: 'ヘイスケ', giveEn: 'Heisuke', light: '{雨|あめ} の {中|なか} で も 、 {灯|ひ} は {消|き}えない 。 || Even in the rain, the light holds.' },
    { n: 4, jp: '{中山|なかやま}', en: 'Nakayama', ord: '{四番目|よんばんめ}', give: 'オタキ', giveEn: 'Otaki', light: '{向|む}かい{合|あ}う {二軒|にけん} の {宿屋|やどや} を 、 {同|おな}じ {灯|ひ} が {照|て}らす 。 || The same light falls on both inns facing each other.' },
    { n: 5, jp: '{馬返|うまがえ}し', en: 'Umagaeshi', ord: '{五番目|ごばんめ}', give: 'ゲンジ', giveEn: 'Genji', light: '{霧|きり} の {中|なか} に 、 {灯|ひ} が {丸|まる}く {滲|にじ}んだ 。 || The light blurs round in the fog.' },
    { n: 6, jp: '{霧下|きりした}', en: 'Kirishita', ord: '{六番目|ろくばんめ}', give: 'サキチ', giveEn: 'Sakichi', light: '' },
    { n: 7, jp: '{雲居|くもい}', en: 'Kumoi', ord: '{七番目|ななばんめ}', give: 'シズ', giveEn: 'Shizu', light: '{雲|くも} の {上|うえ} で 、 {灯|ひ} が {一|ひと}つ ともった 。 || A single light catches, above the clouds.' },
  ];
  let src = '';
  for (const s of ST) {
    const [lightJp, lightEn] = s.light ? s.light.split(' || ') : ['', ''];
    src += `
@scene cr.lamp${s.n}
narr: ${s.jp} の {常夜灯|じょうやとう} 。 {台|だい} に {彫|ほ}った {名前|なまえ} が 、 {消|き}えかけて いる 。 || ${s.en}'s everlasting lamp. The name carved on its base has nearly worn away.
!if !item.cr_ledger -> later
narr: {帳面|ちょうめん} に は 、 {下|した} から {順|じゅん} に {宿|しゅく} の {名前|なまえ} が {書|か}いて ある 。 ここ は ${s.ord} の {宿|しゅく} だ 。 || The ledger lists the stations in order from the bottom of the road. This is station ${s.n}.
!challenge cr.name${s.n}
!set cr_lamp${s.n}
!sfx bell
?(comp=ren) comp: 「${s.jp}」 。 …… {灯|ひ} よ 、 {名|な} を {思|おも}い{出|だ}して ください 。 || "${s.en}." …Light, remember your name.
?(comp=ren) narr: レン が {名前|なまえ} を {呼|よ}ぶ と 、 {紙|かみ} の {窓|まど} に {灯|ひ} が ともった 。 || As Ren calls the name, light comes up in the paper windows.
?(!comp=ren) narr: {名前|なまえ} を {呼|よ}ぶ と 、 {紙|かみ} の {窓|まど} に {灯|ひ} が ともった 。 || As you call its name, light comes up in the paper windows.
${lightJp ? `narr: ${lightJp} || ${lightEn}` : ''}
!end
:later
narr: {名前|なまえ} が {分|わ}かれば …… 。 {追分|おいわけ} の {問屋場|といやば} で 、 {継|つ}ぎ{飛脚|びきゃく} の {帳面|ちょうめん} を {見|み}せて もらおう 。 || If you knew its name… Ask to see the relay's ledger at Oiwake's relay office.
`;
    if (s.n <= 5) src += `
@scene cr.depart${s.n}
!if !cr_lamp${s.n} -> lamp
!if !cr_given${s.n} -> msg
narr: {次|つぎ} の {宿|しゅく} へ は 、 {本道|ほんどう} と {旧道|きゅうどう} が ある 。 {出|で}かける {前|まえ} に 、 {聞|き}いた {話|はなし} を {比|くら}べよう 。 || To the next station there's a main road and an old road. Before setting off, weigh what you've heard.
!hook tellings cr.plan${s.n}
!if var._tell=cancel -> later
!set cr_plan${s.n}
${s.n === 5 ? '!if var.tell_cr.plan5=wait -> wait' : ''}
!if var._tell=best -> best
!if var._tell=no -> gamble
narr: {遠回|とおまわ}り に なる が 、 {確|たし}か な {道|みち} だ 。 || The long way round, but a sure one.
!goto go
:best
narr: {確|たし}か な {話|はなし} だけ で {決|き}めた 。 {迷|まよ}い は ない 。 || You chose on what could be vouched for. No doubts.
!goto go
:gamble
narr: {確|たし}か な こと を {言|い}える {人|ひと} は いなかった 。 {行|い}って みる しか ない 。 || Nobody could say for sure. You'll have to go and see.
:go
!if var.tell_cr.plan${s.n}=old -> old
!warp cr.leg${s.n} 1 11 right
!end
:old
!warp cr.leg${s.n} 1 3 right
!end
${s.n === 5 ? `:wait
!call cr.wait_fog
!end` : ''}
:lamp
narr: {出|で}かける {前|まえ} に 、 {宿場|しゅくば} の {常夜灯|じょうやとう} に {名前|なまえ} を {戻|もど}そう 。 || Before you go, give the station's lamp its name back.
!move pc left 1
!end
:msg
narr: ${s.give} さん が 、 {何|なに} か {頼|たの}みたそう に して いた 。 {出|で}かける {前|まえ} に {話|はなし} を {聞|き}こう 。 || ${s.giveEn} looked as if there was something to ask you. Have a word before you go.
!move pc left 1
!end
:later
!move pc left 1
`;
  }
  // the palanquin: from any lit station to any other (a shortcut once a station is reached and lit)
  src += `
@scene cr.ride
narr: {駕籠|かご} の {担|かつ}ぎ{手|て} が 、 {宿|しゅく} から {宿|しゅく} へ {運|はこ}んで くれる と いう 。 {灯|ひ} の {点|つ}いた {宿|しゅく} なら 、 どこ へ でも 。 || The palanquin bearers will carry you between stations: any station whose lamp is lit.
!choice
${ST.map((s) => `* [cr_lamp${s.n}${s.n === 7 ? '&cr_passed' : ''}] ${s.jp} へ || To ${s.en} -> to${s.n}`).join('\n')}
* やめて おく || Not now -> end
${ST.map((s) => `:to${s.n}
!fade out
!warp cr.${['', 'oiwake', 'suginoki', 'sakashita', 'nakayama', 'umagaeshi', 'kirishita', 'kumoi'][s.n]} 17 13 down
!fade in
!end`).join('\n')}
`;
  RB.script.add(src);
})();

RB.script.add(`
@scene cr.lamp_lit
narr: {常夜灯|じょうやとう} が 、 {静|しず}か に {燃|も}えて いる 。 {台|だい} の {名前|なまえ} が 、 {読|よ}める よう に なった 。 || The everlasting lamp burns quietly. The name on its base can be read again.

@scene cr.wait_fog
# Umagaeshi, the night waited out at the inn: the fog thick at dusk; Genji's reading of the wind; the morning clear.
!fade out
narr: {宿|やど} で 、 {一晩|ひとばん} {待|ま}つ こと に した 。 {窓|まど} の {外|そと} は 、 {真|ま}っ{白|しろ} だ 。 || You decide to wait the night at the inn. Outside the window, everything is white.
?(comp=nao) comp: {急|いそ}ぎ の {便|びん} じゃ ない 。 {霧|きり} の {中|なか} を {走|はし}る {飛脚|ひきゃく} は 、 {長生|ながい}き しない 。 || It's not urgent post. Couriers who run in fog don't live long.
?(comp=mio) comp: {待|ま}つ の も 、 {大事|だいじ} な {判断|はんだん} です 。 …… {温|あたた}かい お{茶|ちゃ} を {入|い}れましょう 。 || Waiting is a decision too. …I'll make some hot tea.
?(comp=ren) comp: {暗|くら}い {道|みち} より 、 {明|あか}るい {朝|あさ} を {待|ま}ちましょう 。 {灯守|ひもり} の {教|おし}え です 。 || Better to wait for a bright morning than walk a dark road. A keepers' teaching.
?(comp=suzu) comp: {幕間|まくあい} ね 。 {休|やす}む の も {芸|げい} の うち よ 。 || An interval. Resting is part of the craft.
!var cr_phase = 5
!set cr_fog_waited
!fade in
narr: {朝|あさ} 、 {霧|きり} は {晴|は}れて いた 。 ゲンジ さん の {見立|みた}て どおり だ 。 || In the morning the fog had lifted, just as Genji reckoned.
!warp cr.leg5 1 11 right
`);

RB.script.add(`
@scene cr.arrive2
# Suginoki: the station under the great cedar; the clouds come down a little; the cedar's sacred rope.
!set cr_st2
!var cr_st = 2
!var cr_phase = 2
!gesture pc lookroad up
narr: {杉並木|すぎなみき} を {抜|ぬ}ける と 、 {大|おお}きな {杉|すぎ} の {下|した} に {宿場|しゅくば} が あった 。 {杉|すぎ}ノ{木宿|きじゅく} だ 。 || Out of the cedar avenue, a post station under a great cedar: Suginoki.
narr: {空|そら} が {低|ひく}く なって きた 。 {雲|くも} が 、 {山|やま} の {上|うえ} まで {下|お}りて いる 。 || The sky has come down lower. The clouds reach down to the mountaintops.
?(comp=nao) comp: {飛脚|ひきゃく} は 、 {大|おお}きな {木|き} を {目印|めじるし} に する 。 {迷|まよ}わない ため だ 。 || Couriers use big trees as landmarks. So they don't get lost.
?(comp=mio) comp: {杉|すぎ} の {葉|は} の {匂|にお}い 。 …… {頭|あたま} が すっきり します 。 || The smell of cedar. …It clears the head.
?(comp=ren) comp[smile]: {大|おお}きな {杉|すぎ} です ね 。 …… これ なら 、 {私|わたし} でも {迷|まよ}いません 。 || What a great cedar. …Even I couldn't lose my way with that.
?(comp=suzu) comp: しめ{縄|なわ} が {巻|ま}いて ある わ 。 {神様|かみさま} の {木|き} ね 。 {挨拶|あいさつ} して {行|い}きましょ 。 || There's a sacred rope round it. A god's tree. Let's pay our respects.

@scene cr.relay1
# Ine hears Kanbe's message (the relay sheet), and hands on the next, for Heisuke at Sakashita.
!faceplayer
cr_ine: あら 、 {追分|おいわけ} から ？ カンベエ さん の {伝言|でんごん} ね 。 {聞|き}かせて 。 || Oh, from Oiwake? Kanbe's message, then. Let's hear it.
!hook relay cr.r1
!if var._relay=cancel -> later
!if var._relay=over -> over
!if var._relay=under -> under
cr_ine[smile]: {塩|しお} が {二俵|にひょう} 、 {明日|あした} の {朝|あさ} ね 。 カンベエ さん の {声|こえ} が {聞|き}こえる みたい 。 ちゃんと {届|とど}いた わ 。 || Two bales of salt, tomorrow morning. I can almost hear Kanbe saying it. It arrived whole.
!goto next
:over
cr_ine[surprise]: あら 、 あなた が {送|おく}って くれる の ？ …… ああ 、 カンベエ さん から ね 。 {言|い}い{方|かた} で 、 {話|はなし} が {変|か}わる もの ね 。 || Oh, you're sending it? …Ah, it's from Kanbe. How you say it changes the story, doesn't it.
!goto next
:under
cr_ine: {塩|しお} が {来|く}る …… らしい ？ カンベエ さん は 、 いつも はっきり {言|い}う {人|ひと} よ 。 {二俵|にひょう} 、 {明日|あした} の {朝|あさ} ね 。 {分|わ}かった わ 。 || Salt is coming… apparently? Kanbe always says things straight. Two bales, tomorrow morning. Got it.
:next
cr_ine: じゃあ 、 {次|つぎ} は わたし から 。 {坂下|さかした} の ヘイスケ さん に 。 「{杉|すぎ}ノ{木|き} の {茶屋|ちゃや} は 、 {来月|らいげつ} から また {開|あ}けます 。」 お{願|ねが}い ね 。 || Then the next one's from me. For Heisuke at Sakashita: "Suginoki's teahouse opens again next month." Please.
!set cr_given2
!call cr.goto
!journal イネ に {伝言|でんごん} を {伝|つた}えた 。 {次|つぎ} は {坂下|さかした} の ヘイスケ へ 。 {常夜灯|じょうやとう} に {名前|なまえ} を {戻|もど}して 、 {道|みち} の {話|はなし} を {比|くら}べて から {出|で}かけよう 。 || You passed the message to Ine. The next is for Heisuke at Sakashita. Relight the lamp, weigh what you hear about the road, then set off.
!end
:later
cr_ine: {急|いそ}がない わ よ 。 || No hurry.

@scene cr.ine
!faceplayer
!if cr_st3 -> later
cr_ine: {杉|すぎ} の {木|き} の {下|した} の {茶屋|ちゃや} よ 。 {今|いま} は {閉|し}めて いる けど 、 お{茶|ちゃ} ぐらい なら {出|だ}せる わ 。 || The teahouse under the cedar. It's closed for now, but I can manage a cup of tea.
cr_ine: {上|うえ} の {道|みち} の {話|はなし} なら 、 サダ さん に {聞|き}く と いい わ 。 {毎日|まいにち} {歩|ある}いて いる から 。 コウスケ さん の {話|はなし} は …… {話半分|はなしはんぶん} で ね 。 || If you want to know about the road above, ask Sada. He walks it every day. As for Kōsuke's stories… take them with a pinch of salt.
!end
:later
cr_ine: {伝言|でんごん} が {崩|くず}れず に {届|とど}く って 、 いい わ ね 。 {来月|らいげつ} は 、 {茶屋|ちゃや} を {開|あ}けられ そう よ 。 || It's good when a message arrives whole. I think I'll manage to open the teahouse next month.

@scene cr.ine_after
!faceplayer
cr_ine: {茶屋|ちゃや} 、 {開|あ}けた の 。 {大杉|おおすぎ} の {下|した} で 、 お{団子|だんご} いかが ？ || I've opened the teahouse. Dumplings, under the great cedar?

@scene cr.sada
!faceplayer
cr_sada: {石畳|いしだたみ} なら 、 {今朝|けさ} {下|お}りて {来|き}た 。 {道|みち} は {通|とお}れる 。 {横|よこ} の {石|いし} は {昔|むかし} の だ 。 …… {俺|おれ} が {言|い}える の は 、 それ だけ だ 。 || The stone steps? Came down them this morning. The road's clear. The stones beside it are old. …That's all I can tell you.

@scene cr.kosuke
!faceplayer
cr_kosuke: {石畳|いしだたみ} で {崖崩|がけくず}れ が あった らしい よ ！ {下|した} の {宿|しゅく} で {聞|き}いた ん だ 。 …… {誰|だれ} から って ？ さあ 、 {誰|だれ} だった かな 。 || Seems there was a landslide on the stone steps! I heard it at the station below. …From whom? Hmm, now who was it.

@scene cr.cedar
narr: {大杉|おおすぎ} 。 {幹|みき} に しめ{縄|なわ} が {巻|ま}いて ある 。 {根|ね} の {近|ちか}く に {小|ちい}さな {札|ふだ} 。 「{樹齢|じゅれい} {千年|せんねん} と {伝|つた}えられて いる 。」 || The great cedar, a sacred rope round its trunk. A small plaque by the roots: "Said to be a thousand years old."
?(comp=suzu) comp: 「{伝|つた}えられて いる 」 。 …… {正直|しょうじき} な {札|ふだ} ね 。 {誰|だれ} も {数|かぞ}えて ない って こと よ 。 || "Said to be." …An honest plaque. It means nobody's counted.

@scene cr.leg1_stone
narr: {杉並木|すぎなみき} の {一里塚|いちりづか} 。 {江戸時代|えどじだい} の {街道|かいどう} に は 、 {一里|いちり} ごと に こう いう {塚|つか} が あった 。 || A milestone mound on the cedar avenue. On the highways of the Edo period, a mound like this stood every ri (about four kilometres).

@scene cr.leg1_shrine
narr: {道|みち} の {上|うえ} の {小|ちい}さな {祠|ほこら} 。 {旅|たび} の {無事|ぶじ} を {祈|いの}る 。 || A small shrine above the road, for a safe journey.

@scene cr.leg2_stone
narr: {石畳|いしだたみ} の {横|よこ} の {苔|こけ} むした {岩|いわ} 。 {何十年|なんじゅうねん} も {前|まえ} に 、 {上|うえ} から {落|お}ちて きた もの らしい 。 || A mossy boulder beside the stone steps. It seems to have come down from above decades ago.
`);

RB.script.add(`
@scene cr.arrive3
# Sakashita: the station at the foot of the long slope; the rain begins as you arrive (phase 3), and the stream below
# runs high. (The main road's bridge on the next leg is washed out from now until it is mended.)
!set cr_st3
!var cr_st = 3
!var cr_phase = 3
!set cr_bridge_washed
narr: {石畳|いしだたみ} を {登|のぼ}り{切|き}る と 、 {長|なが}い {坂|さか} の {下|した} に {宿場|しゅくば} が あった 。 {坂下宿|さかしたじゅく} だ 。 || At the top of the stone steps, a post station at the foot of a long slope: Sakashita.
!sfx water
narr: {着|つ}いた {途端|とたん} 、 {雨|あめ} が {降|ふ}り{出|だ}した 。 {宿場|しゅくば} の {下|した} の {沢|さわ} が 、 {音|おと} を {立|た}てて {流|なが}れて いる 。 || The moment you arrive, it starts to rain. The stream below the station runs loud.
?(comp=nao) comp: {山|やま} の {雨|あめ} は {早|はや}い 。 …… {今夜|こんや} は 、 {沢|さわ} を {渡|わた}らない {方|ほう} が いい 。 || Rain comes fast in the mountains. …Better not cross the stream tonight.
?(comp=mio) comp: {濡|ぬ}れた ままで は {風邪|かぜ} を ひきます 。 {早|はや}く {宿|やど} に {入|はい}りましょう 。 || You'll catch cold if you stay wet. Let's get inside.
?(comp=ren) comp: {雨|あめ} の {日|ひ} の {灯|ひ} は 、 {特|とく}に {大事|だいじ} です 。 {道|みち} が {見|み}えません から 。 || On a rainy day a lamp matters most. You can't see the road.
?(comp=suzu) comp: {雨|あめ} の {日|ひ} の {宿場|しゅくば} は 、 {満員|まんいん} に なる わ よ 。 {早|はや}い {者|もの} {勝|が}ち 。 || A post station fills up on a rainy day. First come, first served.

@scene cr.relay2
!faceplayer
cr_heisuke: {杉|すぎ}ノ{木|き} から の {伝言|でんごん} か 。 {雨|あめ} の {中|なか} 、 {御苦労|ごくろう} だった 。 {言|い}って みなさい 。 || A message from Suginoki? Thank you for coming through the rain. Go on, then.
!hook relay cr.r2
!if var._relay=cancel -> later
!if cr_r2_crew -> crew
!if var._relay=over -> over
cr_heisuke: {茶屋|ちゃや} が また {開|あ}く か 。 それ は {良|よ}い 。 …… {崖崩|がけくず}れ は 、 {噂|うわさ} か 。 {見|み}た {者|もの} が いない なら 、 {人|ひと} は {出|だ}さん 。 {分|わ}かった 。 || The teahouse is opening again. Good. …The landslide's a rumour, then. If nobody saw it, I won't send anyone out. Understood.
!goto next
:crew
!set cr_r2_crew
cr_heisuke[surprise]: {崖崩|がけくず}れ ！ それ は いかん 。 すぐ に {若|わか}い {者|もの} を {石畳|いしだたみ} へ {出|だ}そう 。 {道|みち} を {片付|かたづ}けさせる 。 || A landslide! That won't do. I'll send the young men to the stone steps straight away, to clear the road.
narr: ヘイスケ は 、 {雨|あめ} の {中|なか} 、 {人|ひと} を {送|おく}り{出|だ}した 。 || Heisuke sends men out into the rain.
!goto next
:over
cr_heisuke: …… ふむ 。 {分|わ}かった 。 {伝|つた}えて おこう 。 || …Hm. Very well. I'll pass it on.
:next
cr_heisuke: {次|つぎ} は {中山|なかやま} の オタキ に 、 わし から {頼|たの}む 。 「{雨|あめ} が やんだら 、 {大工|だいく} を {寄越|よこ}して ほしい 。 {橋|はし} を {直|なお}す 。」 || Next, from me, to Otaki at Nakayama: "Once the rain stops, send us carpenters. We'll fix the bridge."
!set cr_given3
!journal ヘイスケ に {伝言|でんごん} を {伝|つた}えた 。 {次|つぎ} は {中山|なかやま} の オタキ へ 。 || You passed the message to Heisuke. The next is for Otaki at Nakayama.
!end
:later
cr_heisuke: {雨宿|あまやど}り して から で いい 。 || Get out of the rain first.

@scene cr.r2_crew
# The work crew comes back from the stone steps: nothing there but old stones. Put right by saying what you knew.
!faceplayer
cr_heisuke: {石畳|いしだたみ} へ {出|だ}した {者|もの} たち が {戻|もど}って {来|き}た 。 {崖崩|がけくず}れ など 、 どこ に も なかった と いう 。 || The men I sent to the stone steps are back. They say there was no landslide anywhere.
!choice
* {噂|うわさ} を {聞|き}いた だけ でした 。 すみません 。 || I'd only heard a rumour. I'm sorry. -> sorry
* {確|たし}か な {話|はなし} で は ありません でした 。 || It wasn't anything certain. -> sorry
:sorry
cr_heisuke: …… そう か 。 {噂|うわさ} は {噂|うわさ} と して {聞|き}けば 、 {誰|だれ} も {雨|あめ} に {濡|ぬ}れず に {済|す}んだ 。 まあ 、 {道|みち} の {掃除|そうじ} に は なった 。 {気|き} に するな 。 || …I see. Heard as a rumour, nobody would have got wet. Well, the road got a sweeping. Don't let it trouble you.
!set cr_r2_fixed
?(comp=nao) comp: {聞|き}いた と {言|い}えば 、 {聞|き}いた {話|はなし} に なる 。 {言|い}わなければ 、 {見|み}た {話|はなし} に なる 。 …… {覚|おぼ}えて おけ 。 || Say you heard it, and it's a thing you heard. Don't, and it becomes a thing you saw. …Remember that.

@scene cr.heisuke
!faceplayer
!if cr_st4 -> later
cr_heisuke: {坂下|さかした} の {年寄|としよ}り だ 。 …… {昔|むかし} の {飛脚|ひきゃく} の {話|はなし} か ？ ゲンタ と いう {男|おとこ} が 、 {郵便|ゆうびん} の {金|かね} を {持|も}って {逃|に}げた 。 {親父|おやじ} が そう {言|い}って いた 。 || I'm Sakashita's elder. …The old courier? A man called Genta ran off with the post money. My father said so.
cr_heisuke: {親父|おやじ} の {兄|あに} が 、 {峠|とうげ} の {向|む}こう から {手紙|てがみ} を {寄越|よこ}す はず だった 。 {来|こ}なかった 。 ゲンタ が {持|も}って {逃|に}げた から だ と 、 {親父|おやじ} は {死|し}ぬ まで {言|い}って いた 。 || My father's elder brother was supposed to send a letter from over the pass. It never came. Because Genta ran off with it, my father said, to his dying day.
?(comp=nao) !gesture comp observe cr_heisuke
?(comp=nao) comp: …… {来|こ}なかった {手紙|てがみ} か 。 || …A letter that never came.
!set cr_genta_heard
!end
:later
cr_heisuke: {雨|あめ} が {上|あ}がったら 、 {橋|はし} を {直|なお}さねば な 。 || When the rain's over, we must fix that bridge.

@scene cr.heisuke_after
!faceplayer
cr_heisuke: {伯父|おじ} の {手紙|てがみ} は 、 {仏壇|ぶつだん} に {置|お}いた 。 {親父|おやじ} に も 、 {読|よ}ませて やりたかった 。 || I put my uncle's letter on the family altar. I wish my father could have read it.

@scene cr.yahei
!faceplayer
cr_yahei: {沢|さわ} の {橋|はし} なら 、 {流|なが}された よ 。 {今朝|けさ} この {目|め} で {見|み}た 。 {上|うえ} の {浅瀬|あさせ} なら 、 {石|いし} を {踏|ふ}んで {渡|わた}れる 。 || The bridge over the stream? Washed away. I saw it with my own eyes this morning. Up at the shallows you can step across on the stones.
cr_yahei: そう いや 、 {飛脚|ひきゃく} が {一人|ひとり} 、 まだ {着|つ}かない ん だ 。 {沢|さわ} に {落|お}ちた の かも しれない …… 。 いや 、 {分|わ}からん 。 || Come to think of it, one of the couriers still hasn't come in. Maybe he fell in the stream… No, I don't know.

@scene cr.leg3_stone
narr: {沢|さわ} の {近|ちか}く の {石|いし} 。 「{水|みず} {出|で}れば 、 {上|うえ} の {浅瀬|あさせ} を {渡|わた}る べし 。」 || A stone near the stream: "When the water is high, cross at the shallows above."

@scene cr.matazo
# The stranded courier (a road event): sheltering by the ford with a hurt foot and a dry satchel. Help him, and he is
# a witness for the relay: you have seen him safe.
!faceplayer
!set cr_matazo_met
cr_matazo: いてて …… 。 {雨|あめ} で {足|あし} を {滑|すべ}らせちまった 。 {箱|はこ} は {濡|ぬ}らして ない ぞ 。 {飛脚|ひきゃく} の {意地|いじ} だ 。 || Ow… Slipped in the rain. The letter box isn't wet, mind. A courier's pride.
!choice
* {肩|かた} を {貸|か}す 。 || Lend him a shoulder. -> help
* {中山|なかやま} に {知|し}らせる 。 || Tell them at Nakayama. -> tell
:help
narr: マタゾウ に {肩|かた} を {貸|か}して 、 {浅瀬|あさせ} の {岩|いわ} の {陰|かげ} まで {連|つ}れて {行|い}った 。 {雨|あめ} が {当|あ}たらない 。 || You lend Matazō a shoulder and help him to the shelter of a rock by the ford, out of the rain.
cr_matazo: {助|たす}かった 。 {雨|あめ} が やんだら 、 {自分|じぶん} で {行|い}ける 。 {中山|なかやま} に 、 {無事|ぶじ} だ と {伝|つた}えて くれ 。 || That's a help. Once the rain stops I can make it myself. Tell Nakayama I'm safe.
!goto done
:tell
cr_matazo: {頼|たの}む 。 {無事|ぶじ} だ 、 と な 。 {大袈裟|おおげさ} に {言|い}う な よ 。 || Please. Tell them I'm safe. And don't make a fuss of it.
:done
!set cr_matazo_done
?(comp=nao) comp: {箱|はこ} を {守|まも}って {転|ころ}んだ か 。 …… {分|わ}かる よ 。 || Fell guarding the box, did you. …I know how that is.
`);

RB.script.add(`
@scene cr.arrive4
# Nakayama: halfway up the mountain; the rain stops (phase 2); two inns face each other across the street, each with
# its door open and a grudge.
!set cr_st4
!var cr_st = 4
!var cr_phase = 2
narr: {雨|あめ} が {上|あ}がった 。 {山|やま} の {中|なか}ほど に 、 {中山宿|なかやまじゅく} が ある 。 || The rain has stopped. Halfway up the mountain lies Nakayama Station.
narr: {二軒|にけん} の {宿屋|やどや} が 、 {並|なら}んで {客|きゃく} を {呼|よ}んで いる 。 {片方|かたほう} が {呼|よ}ぶ と 、 もう {片方|かたほう} が {大|おお}きな {声|こえ} で {呼|よ}ぶ 。 || Two inns side by side are calling for guests. When one calls, the other calls louder.
?(comp=nao) comp: {客|きゃく} の {取|と}り{合|あ}い か 。 {宿場|しゅくば} じゃ よく ある 。 || Fighting over guests. Common enough at a post station.
?(comp=mio) comp: {二軒|にけん} とも 、 {良|よ}い {宿|やど} に {見|み}えます けど …… 。 || Both of them look like good inns…
?(comp=ren) comp: {灯|ひ} が {一|ひと}つ で 、 {宿|やど} が {二|ふた}つ 。 …… {喧嘩|けんか} の {種|たね} は 、 {他|ほか} に あり そう です ね 。 || One lamp, two inns. …The quarrel must have some other cause.
?(comp=suzu) comp[laugh]: {呼|よ}び{込|こ}み の {声|こえ} 、 いい {勝負|しょうぶ} ね 。 {芝居|しばい} の {口上|こうじょう} より {元気|げんき} だ わ 。 || The calling-in's neck and neck. Livelier than a theatre's opening announcement.

@scene cr.relay3
!faceplayer
cr_otaki: {坂下|さかした} から ？ ヘイスケ さん の {伝言|でんごん} ね 。 どうぞ 。 || From Sakashita? Heisuke's message, then. Go ahead.
!hook relay cr.r3
!if var._relay=cancel -> later
!if cr_r3_rescue -> rescue
!if var._relay=over -> over
cr_otaki: {雨|あめ} が やんだら {大工|だいく} を 、 ね 。 {雨|あめ} は もう {上|あ}がった から 、 {明日|あした} {送|おく}る わ 。 || Carpenters once the rain stops. It's stopped already, so I'll send them tomorrow.
?(cr_matazo_met) cr_otaki[smile]: マタゾウ さん 、 {無事|ぶじ} なの ね 。 よかった 。 {浅瀬|あさせ} なら 、 {後|あと} で {迎|むか}え を {出|だ}す わ 。 || Matazō is safe. Thank goodness. I'll send someone to the shallows for him later.
!goto next
:rescue
!set cr_r3_rescue
cr_otaki[surprise]: {飛脚|ひきゃく} が {沢|さわ} に ！ {大変|たいへん} 、 {沢|さわ} を {下|くだ}って {探|さが}さなきゃ 。 {若|わか}い {衆|しゅう} 、 {行|い}って ！ || A courier in the stream! Oh no, we must search downstream. You lot, go!
narr: {宿|やど} の {若|わか}い {衆|しゅう} が 、 {沢|さわ} を {下|くだ}って {行|い}った 。 || The inn's young men set off down the stream.
!goto next
:over
cr_otaki: …… {分|わ}かった わ 。 {伝|つた}えて おく 。 || …All right. I'll pass it on.
:next
cr_otaki: {次|つぎ} は わたし から 。 {馬返|うまがえ}し の ゲンジ さん に 。 「{馬|うま} の {鞍|くら} 、 {直|なお}りました よ 。 {取|と}り に {来|き}て ください 。」 || Next, from me, to Genji at Umagaeshi: "Your saddle's mended. Please come and fetch it."
!set cr_given4
!journal オタキ に {伝言|でんごん} を {伝|つた}えた 。 {次|つぎ} は {馬返|うまがえ}し の ゲンジ へ 。 || You passed the message to Otaki. The next is for Genji at Umagaeshi.
!end
:later
cr_otaki: {後|あと} で {聞|き}く わ 。 {先|さき} に {上|あ}がって 。 || I'll hear it later. Come in first.

@scene cr.r3_rescue
# The rescue party sent down the stream is called back: the courier was safe at the ford all along.
!faceplayer
!if !cr_matazo_met -> find
cr_otaki: …… {浅瀬|あさせ} に いた の ？ {無事|ぶじ} で ？ じゃあ 、 {沢|さわ} を {下|くだ}った {子|こ} たち を {呼|よ}び{戻|もど}さなきゃ 。 || …He was at the shallows? Safe? Then I must call back the lads who went down the stream.
narr: オタキ は {笑|わら}って 、 {呼|よ}び{戻|もど}し の {者|もの} を {走|はし}らせた 。 {誰|だれ} も {怪我|けが} は なかった 。 || Otaki laughs and sends a runner to call them back. Nobody came to harm.
cr_otaki: {落|お}ちた かも 、 と {落|お}ちた 、 は {違|ちが}う の ね 。 {覚|おぼ}えて おく わ 。 || "Might have fallen" and "fell" aren't the same thing. I'll remember that.
!set cr_r3_fixed
!end
:find
cr_otaki: {沢|さわ} を {下|くだ}った {子|こ} たち 、 まだ {見|み}つけられない の 。 …… {飛脚|ひきゃく} は 、 {本当|ほんとう} に {落|お}ちた の ？ || The lads who went down the stream still haven't found him. …Did the courier really fall?
narr: {旧道|きゅうどう} の {浅瀬|あさせ} の {方|ほう} を 、 {探|さが}して みよう か 。 || Perhaps look along the old road, by the shallows.

@scene cr.otaki
!faceplayer
cr_otaki: {松葉屋|まつばや} へ ようこそ 。 {向|む}かい の {竹屋|たけや} より 、 {布団|ふとん} が {一枚|いちまい} {厚|あつ}い の よ 。 || Welcome to the Matsuba. Our futons are one layer thicker than the Take\'s across the way.
?(!quest.cr_guest=done) cr_otaki: …… あの タツ さん 、 うち の お{客|きゃく} な の に 、 {竹屋|たけや} で {寝|ね}た の よ 。 {宿代|やどだい} は どっち が もらう の ？ || …That Tatsu booked with us, and slept at the Take. Which of us gets paid?

@scene cr.otaki_after
!faceplayer
cr_otaki: {竹屋|たけや} と は 、 {今|いま} は {客|きゃく} を {分|わ}け{合|あ}って いる の 。 {雲路|くもじ} の {客|きゃく} が {増|ふ}えた から 、 {喧嘩|けんか} して いる {暇|ひま} は ない わ 。 || We share guests with the Take now. With so many more travellers on the Cloudroad, there's no time to quarrel.

@scene cr.seibe
!faceplayer
cr_seibe: {竹屋|たけや} で ござる 。 {向|む}かい の {松葉屋|まつばや} より 、 {風呂|ふろ} が {熱|あつ}い 。 || This is the Take. Our bath is hotter than the Matsuba's across the way.
?(!quest.cr_guest=done) cr_seibe: タツ どの は 、 うち で {寝|ね}た 。 うち の {客|きゃく} だ 。 {帳面|ちょうめん} より 、 {布団|ふとん} が {証拠|しょうこ} だ 。 || Master Tatsu slept here. He's our guest. A futon is better proof than a ledger.

@scene cr.seibe_after
!faceplayer
cr_seibe: {松葉屋|まつばや} と {相談|そうだん} して 、 {風呂|ふろ} と {布団|ふとん} を {交換|こうかん} する こと に した 。 {客|きゃく} は {両方|りょうほう} {使|つか}える 。 || We talked it over with the Matsuba and decided to trade baths and futons. Guests can use both.

@scene cr.tatsu
!faceplayer
cr_tatsu: {崖道|がけみち} なら 、 おととい {通|とお}った 。 {大|おお}きな {石|いし} が {道|みち} を ふさいで いて 、 よじ{登|のぼ}って {越|こ}えた 。 {馬|うま} は {無理|むり} だ 。 || The ledge? I came along it the day before yesterday. A big rock blocks the way; I had to climb over it. No horse could do it.
?(!quest.cr_guest=done) cr_tatsu: …… {宿|やど} の こと は 、 すまない 。 {松葉屋|まつばや} に {泊|と}まる はず が 、 {夜|よる} {遅|おそ}く {着|つ}いて 、 {開|あ}いて いた {竹屋|たけや} に {入|はい}った ん だ 。 || …About the inns, I'm sorry. I meant to stay at the Matsuba, but I got in late and went into the Take, which was still open.

@scene cr.rin
!faceplayer
cr_rin: {地図|ちず} {作|づく}り の リン です 。 {雲路|くもじ} の {新|あたら}しい {地図|ちず} を {作|つく}って います 。 {崖道|がけみち} が {一番|いちばん} {近|ちか}い はず です 。 …… その {辺|あた}り は 、 {古|ふる}い {絵図|えず} を {写|うつ}した ん です けど 。 || I'm Rin, a mapmaker. I'm making a new map of the Cloudroad. The ledge should be the shortest way. …I copied that part from an old sketch-map, though.

@scene cr.rin_after
!faceplayer
cr_rin: {地図|ちず} を {直|なお}しました 。 {自分|じぶん} で {歩|ある}いた {所|ところ} と 、 {人|ひと} に {聞|き}いた {所|ところ} を 、 {線|せん} の {色|いろ} で {分|わ}けた ん です 。 || I've corrected the map. The parts I walked myself and the parts I was told about are in different coloured lines now.

@scene cr.rin_map
narr: リン の {地図|ちず} 。 {崖道|がけみち} の {線|せん} だけ 、 {筆|ふで} の {勢|いきお}い が {違|ちが}う 。 {他|ほか} の {線|せん} より 、 {細|ほそ}くて {迷|まよ}い が ない 。 || Rin's map. The line for the ledge is drawn with a different hand: thinner than the others, and too sure.

@scene cr.leg4_stone
narr: 「{崖道|がけみち} 、 {馬|うま} {通|とお}る べからず 。」 {古|ふる}い {石|いし} の {字|じ} 。 || Old letters on a stone: "Ledge: no horses."

@scene cr.horse
# A pack horse stuck on the ledge (a road event): it won't go on past the rock, won't turn on the narrow path. Talk it
# round, take its load, and walk it back.
!set cr_horse_seen
narr: {荷|に} を {背負|せお}った {馬|うま} が 、 {崖道|がけみち} の {途中|とちゅう} で {立|た}ち{往生|おうじょう} して いる 。 {先|さき} は {石|いし} で ふさがり 、 {狭|せま}くて {向|む}き を {変|か}えられない 。 || A pack horse with its load stands stuck partway along the ledge: rock ahead, and too narrow to turn.
!choice
* {荷|に} を {下|お}ろして 、 {後|うし}ろ へ {歩|ある}かせる 。 || Take off its load and walk it backwards. -> back
* {声|こえ} を かけて {落|お}ち{着|つ}かせる 。 || Talk to it, calm it down. -> calm
:calm
narr: {声|こえ} を かける と 、 {馬|うま} は {耳|みみ} を こちら に {向|む}けた 。 {少|すこ}し {落|お}ち{着|つ}いた 。 でも 、 {荷|に} が {重|おも}くて {動|うご}けない 。 || At your voice the horse turns an ear your way and settles a little. But the load is too heavy for it to move.
:back
narr: {荷|に} を {下|お}ろして 、 {手綱|たづな} を {引|ひ}き 、 {一歩|いっぽ} ずつ {後|うし}ろ へ 。 {広|ひろ}い {所|ところ} まで {出|で}る と 、 {馬|うま} は {大|おお}きく {息|いき} を {吐|は}いた 。 || You take off the load, hold the reins and back it up a step at a time. Out where it's wider, the horse lets out a big breath.
!set cr_horse_safe
?(comp=mio) comp[smile]: {怖|こわ}かった でしょう ね 。 …… もう {大丈夫|だいじょうぶ} よ 。 || That must have been frightening. …You're all right now.
?(comp=ren) comp: {道|みち} に {迷|まよ}った {者|もの} の {気持|きも}ち は 、 よく {分|わ}かります 。 || I know exactly how it feels to be lost on a road.
?(comp=nao) comp: {馬|うま} を {連|つ}れて {行|い}こう 。 {馬返|うまがえ}し の {馬|うま} だろう 。 || Let's take it along. It'll be an Umagaeshi horse.
?(comp=suzu) comp[laugh]: {後|うし}ろ {向|む}き の {退場|たいじょう} 、 お{見事|みごと} ！ || A graceful exit, backwards!
`);

RB.script.add(`
@scene cr.arrive5
# Umagaeshi: where the horses turn back; the fog comes down the slope as you arrive (phase 4).
!set cr_st5
!var cr_st = 5
!var cr_phase = 4
narr: {馬返|うまがえ}し の {宿|しゅく} 。 ここ から {先|さき} は {道|みち} が {険|けわ}しく 、 {馬|うま} は {登|のぼ}れない 。 || Umagaeshi Station. Beyond here the road is too steep for horses.
narr: {上|うえ} の {坂|さか} から 、 {霧|きり} が {流|なが}れて {来|き}た 。 {宿場|しゅくば} の {端|はし} が 、 もう {見|み}えない 。 || Fog flows down from the slope above. The far end of the station is already gone.
?(comp=nao) comp: {霧|きり} か 。 …… {急|いそ}ぐ {時|とき} ほど 、 {足|あし} を {止|と}める もん だ 。 || Fog. …The more you're in a hurry, the more you should stop.
?(comp=mio) !gesture comp guard
?(comp=mio) comp[worry]: {少|すこ}し 、 {息|いき} が {苦|くる}しい です 。 {高|たか}い {所|ところ} に {来|き}た から でしょう 。 {無理|むり} は しない で ください ね 。 || I'm a little short of breath. It must be the height. Don't push yourself.
?(comp=ren) comp: {霧|きり} の {中|なか} の {灯|ひ} は 、 {遠|とお}く から {見|み}えます 。 {早|はや}く {点|つ}けましょう 。 || A light in fog can be seen from a long way off. Let's light it soon.
?(comp=suzu) comp: {霧|きり} の {演出|えんしゅつ} ね 。 …… {本物|ほんもの} は 、 {寒|さむ}い わ 。 || A fog effect. …The real thing is cold.

@scene cr.relay4
!faceplayer
cr_genji: {中山|なかやま} から か 。 オタキ さん の {伝言|でんごん} だろう 。 {聞|き}こう 。 || From Nakayama? Otaki's message, I'll wager. Let's hear it.
!hook relay cr.r4
!if var._relay=cancel -> later
!if cr_r4_ledge -> ledge
!if var._relay=over -> over
cr_genji: {鞍|くら} が {直|なお}った か 。 {霧|きり} が {晴|は}れたら {取|と}り に {行|い}く 。 …… {崖道|がけみち} は {石|いし} か 。 {地図|ちず} が {何|なん} と {言|い}おう と 、 {馬|うま} は {通|とお}さん 。 || The saddle's mended. I'll fetch it once the fog clears. …A rock on the ledge, eh. Whatever the map says, no horse of mine goes that way.
!goto next
:ledge
!set cr_r4_ledge
cr_genji: {崖道|がけみち} が {近道|ちかみち} ？ {四十年|よんじゅうねん} {知|し}らなかった わい 。 …… よし 、 {試|ため}して みる か 。 {霧|きり} が {晴|は}れたら 、 {荷|に} を {積|つ}んで {崖道|がけみち} から {中山|なかやま} へ {行|い}って みよう 。 || The ledge is the short way? Forty years and I never knew. …Right, let's try it. Once the fog clears I'll load up and take the ledge down to Nakayama.
!goto next
:over
cr_genji: …… ふむ 。 {覚|おぼ}えて おく 。 || …Hm. I'll bear it in mind.
:next
cr_genji: {霧下|きりした} の サキチ に 、 わし から {一言|ひとこと} 。 「{峠|とうげ} は {明日|あした} から {雪|ゆき} に なる だろう 。」 {山|やま} の {雲|くも} が そう {言|い}って いる 。 || One word from me for Sakichi at Kirishita: "The pass will likely have snow from tomorrow." The clouds on the peaks say so.
!set cr_given5
!journal ゲンジ に {伝言|でんごん} を {伝|つた}えた 。 {次|つぎ} は {霧下|きりした} の サキチ へ 。 {霧|きり} の {中|なか} 、 {道|みち} を どう する か {決|き}めよう 。 || You passed the message to Genji. The next is for Sakichi at Kirishita. Decide what to do about the road in this fog.
!end
:later
cr_genji: {霧|きり} は {逃|に}げん 。 {後|あと} で いい 。 || The fog isn't going anywhere. Later's fine.

@scene cr.r4_ledge
# Genji went for the ledge on the map's word and turned back at the rock. Put right by saying what Tatsu saw.
!faceplayer
cr_genji: {崖道|がけみち} へ {行|い}って みた が 、 {大|おお}きな {石|いし} で {通|とお}れん かった 。 {馬|うま} を {後|うし}ろ へ {歩|ある}かせて 、 {戻|もど}って {来|き}た わい 。 || I tried the ledge, but a big rock blocked it. I had to back the horse out and come home.
!choice
* {地図|ちず} の {話|はなし} と 、 タツ さん の {話|はなし} を 、 {分|わ}けて {言|い}う べき でした 。 || I should have kept what the map says apart from what Tatsu saw. -> sorry
* すみません 。 {地図|ちず} の {話|はなし} だけ を {伝|つた}えて しまった 。 || Sorry. I passed on only the map's side. -> sorry
:sorry
cr_genji: なあに 、 {馬|うま} も わし も {無事|ぶじ} だ 。 {地図|ちず} と いう の は 、 {描|か}いた {者|もの} が {歩|ある}いた {所|ところ} しか {信用|しんよう} できん 。 わし も {勉強|べんきょう} に なった 。 || Ah, the horse and I are fine. A map's only to be trusted where its maker walked. I learned something too.
!set cr_r4_fixed

@scene cr.genji
!faceplayer
!if cr_fog_waited -> clear
cr_genji: {風|かぜ} が {西|にし} に {変|か}わった 。 {朝|あさ} まで に は {霧|きり} は {晴|は}れる だろう 。 …… {確|たし}か か 、 と {聞|き}かれたら 、 {確|たし}か じゃ ない 。 {四十年|よんじゅうねん} の {勘|かん} だ 。 || The wind's gone round to the west. The fog should lift by morning. …If you ask whether I'm sure, I'm not. Forty years' instinct, that's all.
cr_genji: {霧|きり} の {日|ひ} は 、 {旧道|きゅうどう} の {崖|がけ} の {縁|ふち} が {見|み}えん 。 わし は {通|とお}らん 。 これ は {勘|かん} じゃ ない 。 {見|み}て {来|き}た こと だ 。 || In fog you can't see the edge of the drop on the old road. I won't take it. That's not instinct. That's what I've seen.
!end
:clear
cr_genji: な 、 {晴|は}れた だろう 。 …… {当|あ}たる こと も ある 。 {外|はず}れる こと も ある 。 だから {勘|かん} は 、 {勘|かん} と {言|い}って {渡|わた}す の さ 。 || See, it lifted. …Sometimes I'm right. Sometimes I'm wrong. That's why you pass instinct on as instinct.

@scene cr.genji_after
!faceplayer
cr_genji: {雲路|くもじ} に {荷|に} が {増|ふ}えて 、 {馬|うま} が {足|た}りん 。 クリ も {大忙|おおいそが}し だ 。 || With all the goods on the Cloudroad now, we're short of horses. Kuri's run off her hooves.

@scene cr.chika
!faceplayer
!set cr_chika_asked
cr_chika: {高|たか}い {所|ところ} に {来|く}る と 、 {頭|あたま} が {痛|いた}く なる {人|ひと} が いる の よ 。 {薬箱|くすりばこ} は ここ 。 …… ラベル が {古|ふる}くて 、 {字|じ} が {読|よ}めない の が {困|こま}る けど 。 || Some people get headaches when they come up this high. The medicine chest is here. …Only the labels are old, and I can't read them, which is a nuisance.
?(comp=mio) comp: {見|み}せて ください 。 …… これ は {頭痛|ずつう} の {薬|くすり} 、 これ は {胃|い} の {薬|くすり} 。 {書|か}き{直|なお}しましょう 。 {分|わ}からない {物|もの} は 、 {分|わ}からない と {書|か}きます 。 || Let me see. …This is for headaches, this for the stomach. Let's write them out again. The ones I can't tell, I'll label "unknown".
?(comp=mio) !set cr_mio_labels

@scene cr.chika_after
!faceplayer
cr_chika: {薬箱|くすりばこ} の ラベル 、 {全部|ぜんぶ} {読|よ}める よう に なった わ 。 「{不明|ふめい}」 の {瓶|びん} も {一|ひと}つ ある けど 、 それ も {正直|しょうじき} で いい わ ね 。 || I can read every label on the medicine chest now. There's one jar marked "unknown", but that's honest, and I like it.

@scene cr.uma_stone
narr: 「{馬返|うまがえ}し 。 {是|これ} より {先|さき} 、 {馬|うま} {登|のぼ}る べからず 。」 {街道|かいどう} に は 、 {馬|うま} が {引|ひ}き{返|かえ}す {所|ところ} が あった 。 {本当|ほんとう} の {地名|ちめい} に も 、 よく {残|のこ}って いる 。 || "Umagaeshi. Horses may climb no further." Old highways had places where horses turned back; the name survives in many real place names.

@scene cr.leg5_stone
narr: {霧|きり} の {坂|さか} の {道標|みちしるべ} 。 「{霧|きり} の {日|ひ} は 、 {本道|ほんどう} を {行|い}く べし 。」 || A waystone on the fog slope: "On foggy days, keep to the main road."

@scene cr.ox
# In the fog the main road is blocked by something huge and slow: a cloud given the shape of an ox (one of the
# Cloudroad's creatures, P12e: the fight is a creature's). Waiting out the fog avoids it.
!set cr_ox_seen
narr: {霧|きり} の {中|なか} に 、 {大|おお}きな {影|かげ} 。 {牛|うし} の {形|かたち} を した {雲|くも} が 、 {道|みち} の {真|ま}ん{中|なか} に {座|すわ}って いる 。 || A huge shape in the fog: a cloud the shape of an ox, sitting in the middle of the road.
?(comp=nao) comp: {噂|うわさ} の {牛|うし} か 。 {本当|ほんとう} に いた な 。 || The ox from the rumour. So it was real.
!battle cr.ox
!set cr_ox_done
`);

RB.script.add(`
@scene cr.arrive6
# Kirishita: the last lit station below the Barrier: its lamp burns (Sakichi keeps it); the mist above; snow in the air
# (phase 5 → clearing below, the pass to come).
!set cr_st6
!var cr_st = 6
!var cr_phase = 5
!set cr_lamp6
narr: {霧下宿|きりしたじゅく} 。 {宿場|しゅくば} の {灯|ひ} が 、 {点|つ}いて いる 。 {雲路|くもじ} で {初|はじ}めて 、 {誰|だれ} か が {守|まも}って いる {灯|ひ} だ 。 || Kirishita Station. Its lamp is lit: the first on the Cloudroad that someone has been keeping.
narr: {上|うえ} の {尾根|おね} は 、 {白|しろ}い {霧|きり} に {隠|かく}れて いる 。 あの {中|なか} に 、 {関所|せきしょ} が ある と いう 。 || The ridge above is hidden in white mist. The checkpoint is up there, they say.
?(comp=nao) !gesture comp lookroad up
?(comp=nao) comp: …… {灯|ひ} が {点|つ}いて いる 。 {誰|だれ} が {守|まも}って いる か 、 {分|わ}かる {気|き} が する 。 || …The lamp is lit. I think I know who's keeping it.
?(comp=mio) comp: {灯|ひ} が {点|つ}いて いる と 、 ほっと します ね 。 || It's a relief to see a lamp lit.
?(comp=ren) comp[surprise]: {守|まも}られて いる {灯|ひ} です 。 {毎晩|まいばん} 、 {誰|だれ} か が {名前|なまえ} を {呼|よ}んで いる 。 || A tended lamp. Someone has been calling its name every night.
?(comp=suzu) comp: {最後|さいご} の {宿|しゅく} …… 。 {幕|まく} の {前|まえ} の {一休|ひとやす}み ね 。 || The last station… A breather before the curtain.
!quest cr_main 3
!journal {霧下宿|きりしたじゅく} は 、 {関所|せきしょ} の {下|した} の {最後|さいご} の {宿|しゅく} 。 {灯|ひ} を {守|まも}って いる {人|ひと} が いる 。 || Kirishita is the last station below the checkpoint. Someone here keeps its lamp lit.

@scene cr.sue
!faceplayer
cr_sue: まあ 、 {霧|きり} の {中|なか} を よく {来|き}た わ ね 。 {上|あ}がって {温|あたた}まって 。 サキチ さん は 、 {毎晩|まいばん} {灯|ひ} の {番|ばん} を して いる の よ 。 || My, you came through the fog. Come in and warm up. Sakichi keeps watch over the lamp every night.

@scene cr.sue_after
!faceplayer
cr_sue: {継|つ}ぎ{飛脚|びきゃく} が {毎日|まいにち} {来|く}る よう に なって 、 {宿|やど} が {賑|にぎ}やか よ 。 || With relay runners coming through every day now, the inn's lively.

@scene cr.porch
narr: {宿|やど} の {縁側|えんがわ} 。 {下|した} の {沢|さわ} の {音|おと} が {聞|き}こえる 。 || The inn's porch. You can hear the stream below.

@scene cr.sakichi_box
narr: {古|ふる}い {郵便箱|ゆうびんばこ} 。 {蓋|ふた} に 、 {継|つ}ぎ{飛脚|びきゃく} の {印|しるし} が {彫|ほ}って ある 。 || An old letter box, the relay's emblem carved on its lid.
?(comp=nao) comp: …… この {印|しるし} 。 {八百橋|やおばし} の {手紙|てがみ} の {束|たば} と 、 {同|おな}じ だ 。 || …This emblem. The same as on the bundle of letters in Manybridge.

@scene cr.board1
narr: {追分|おいわけ} の {掲示板|けいじばん} 。 「{本道|ほんどう} は {杉並木|すぎなみき} 。 {旧道|きゅうどう} は {遠回|とおまわ}り 。」 {東|ひがし} の {端|はし} から {出|で}る {前|まえ} に 、 {道|みち} の {話|はなし} を {比|くら}べよう 。 || Oiwake's notice board: "The main road: the cedar avenue. The old road: the long way round." Before you leave by the east end, weigh what you've heard of the road.
@scene cr.board2
narr: {杉|すぎ}ノ{木|き} の {掲示板|けいじばん} 。 「{石畳|いしだたみ} 、 {落石|らくせき} {注意|ちゅうい} 。」 {紙|かみ} は {黄色|きいろ}く なって いる 。 || Suginoki's notice board: "Stone steps: beware of falling rocks." The paper has gone yellow.
@scene cr.board3
narr: {坂下|さかした} の {掲示板|けいじばん} 。 「{昨日|きのう} 。 {本道|ほんどう} 、 {異常|いじょう} なし 。」 {雨|あめ} が {降|ふ}る {前|まえ} に {書|か}かれた もの だ 。 || Sakashita's notice board: "Yesterday. Main road: all clear." Written before the rain.
@scene cr.board4
narr: {中山|なかやま} の {掲示板|けいじばん} 。 {松葉屋|まつばや} と {竹屋|たけや} の {貼|は}り{紙|がみ} が 、 {交互|こうご} に {重|かさ}ねて {貼|は}って ある 。 || Nakayama's notice board: posters for the Matsuba and the Take, pasted over each other by turns.
@scene cr.board5
narr: {馬返|うまがえ}し の {掲示板|けいじばん} 。 「{霧|きり} の {日|ひ} 、 {旧道|きゅうどう} {通行|つうこう} {禁止|きんし} 。」 || Umagaeshi's notice board: "On foggy days, the old road is closed."
@scene cr.board6
narr: {霧下|きりした} の {掲示板|けいじばん} 。 「{霧|きり} の {関|せき} 。 {通行手形|つうこうてがた} の {無|な}い {者|もの} 、 {通|とお}る べからず 。」 || Kirishita's notice board: "The Mist Barrier. None may pass without travel papers."
@scene cr.board7
narr: {雲居|くもい} の {掲示板|けいじばん} 。 「{峠|とうげ} {越|ご}え の {者|もの} 、 {雪|ゆき} に {注意|ちゅうい} 。 {避難|ひなん}{小屋|ごや} は {吊|つ}り{橋|ばし} の {先|さき} 。」 || Kumoi's notice board: "Those crossing the pass: beware of snow. The shelter is past the rope bridge."
`);
