/* Ashihara Shinden: the scenes (expansion P15f; plan 07_REGIONS.md R7; tasks and quarrels in 10_learning.js). The
 * village's story is one journal entry, as_main, in four parts: 0 name the three ways; 1 write the first notices; 2
 * settle the first two quarrels; 3 the first festival; done. Each part changes the map (01_region.js). What the people
 * say follows the profile's level where a task needs it (low: Foundations and Elementary; high: Intermediate up).
 * Mitsue she/her, Yoshizō he/him, Taki she/her, Shō they/them, Natsu she/her, Kotoe she/her, Mohei he/him. Suzu's lines
 * have Kansai versions (src/content/dialect/kansai_99_settle.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const W = C.asWays;
  const LOW = 'prof<=E', HIGH = 'prof>=I';
  let out = `
@scene as.first
!set as_arrived
narr: {葦|あし} の {原|はら} の {手前|てまえ} に 、 {新|あたら}しい {家|いえ} が {五軒|ごけん} 、 {新|あたら}しい {田|た}んぼ が {二|ふた}つ 。 {道|みち} は ある が 、 {道|みち} に {名前|なまえ} は ない 。 || Before the reed plain: five new houses and two new paddies. There are roads, but the roads have no names.
!walkto as_mitsue 3 10 left
as_mitsue: あら 、 お{客|きゃく}さん ！ {葦原|あしはら}{新田|しんでん} へ ようこそ 。 …… と {言|い}って も 、 まだ {名前|なまえ} しか ない {村|むら} です けど ね 。 || Oh, a visitor! Welcome to Ashihara Shinden. …Though so far, the name is all the village has.
as_mitsue: {嵐|あらし} で {葦|あし}ノ{瀬|せ} の {下|しも} の {田|た}んぼ が {流|なが}されて 、 {十二|じゅうに} の {家族|かぞく} で ここ へ {来|き}ました 。 {土|つち} は いい 。 {水|みず} も ある 。 {足|た}りない の は 、 {村|むら} らしさ です 。 || The storm washed away Reedwake's lower fields, and twelve families came out here. The soil is good. There's water. What's missing is a village, really.
as_mitsue: {手伝|てつだ}って くれません か 。 まず は 、 {三|みっ}つ の {道|みち} に {名前|なまえ} を つけて ほしい ん です 。 {名前|なまえ} の ない {道|みち} は 、 {誰|だれ} の {道|みち} でも ない から 。 || Would you help? First, the three roads need names. A road with no name is nobody's road.
?(comp=nao) comp: {名前|なまえ} の ない {道|みち} じゃ 、 {手紙|てがみ} も {届|とど}かない もん な 。 {任|まか}せて くれ 。 || A road with no name, and no letter can find it. Leave it to us.
?(comp=mio) comp: {名前|なまえ} を つける の は 、 {大事|だいじ} な こと よ 。 {呼|よ}べば 、 {答|こた}えて くれる もの 。 || Naming is important. Call something, and it answers.
?(comp=ren) comp: {灯|ひ} の {道|みち} に {灯籠|とうろう} が {一|ひと}つ {増|ふ}えて いた の は 、 この {村|むら} の ため でした か 。 || So that's why a new lantern appeared on the Lantern Road: for this village.
?(comp=suzu) comp: {名前|なまえ} だけ の {村|むら} ？ {幕|まく} が {開|あ}く {前|まえ} の {舞台|ぶたい} みたい ね 。 わくわく する わ 。 || A village with only a name? Like a stage before the curtain goes up. How exciting.
?(!comp) narr: {名前|なまえ} の ない {道|みち} 。 それ なら 、 {呼|よ}び{名|な} を {探|さが}せば いい 。 || Roads with no names. Then find what to call them.
!quest as_main 0
as_mitsue: {道|みち} の {端|はし} に 、 {空|から} の {道標|みちしるべ} を {立|た}てて あります 。 {住|す}んで いる {人|ひと} の {話|はなし} を {聞|き}いて 、 {名前|なまえ} を {決|き}めて ください 。 || I've put up blank signposts at the end of each road. Listen to what the people who live there say, and choose the names.
`;

  // ---- the three ways --------------------------------------------------------------------------------------------------------
  for (const k of ['main', 'canal', 'hill']) {
    const w = W[k], names = Object.keys(w.names);
    out += `
@scene as.way_${k}
!if as_nm_${k} -> named
narr: {名前|なまえ} の ない {道標|みちしるべ} 。 ${k === 'main' ? '{葦|あし}ノ{瀬|せ} から {来|く}る {道|みち} の {入|い}り{口|ぐち} に {立|た}って いる 。 || A blank signpost, at the start of the road in from Reedwake.' : k === 'canal' ? '{水路|すいろ} の {脇|わき} の {小道|こみち} の {入|い}り{口|ぐち} に {立|た}って いる 。 || A blank signpost, at the start of the lane beside the channel.' : '{坂|さか} の {登|のぼ}り{口|ぐち} に {立|た}って いる 。 || A blank signpost, at the foot of the slope.'}
?(${LOW}) narr: {村|むら} の {人|ひと} は 、 この {道|みち} の こと を こう {言|い}う 。 「 ${w.low} 」 || The villagers say this of it: "${w.en}"
?(${HIGH}) narr: {村|むら} の {人|ひと} は 、 この {道|みち} の こと を こう {言|い}う 。 「 ${w.high} 」 || The villagers say this of it: "${w.en}"
!challenge as.name_${k}
!if var._res=0 -> later
${names.map((n) => `?(var._forge=${n}) !var as_way_${k} = ${n}`).join('\n')}
!if var.as_way_${k}=0 -> fallback
!goto set
:fallback
!var as_way_${k} = ${names[0]}
:set
!set as_nm_${k}
${names.map((n) => `?(var.as_way_${k}=${n}) narr: {道標|みちしるべ} に 、 {墨|すみ} で 「 ${w.names[n][0]} 」 と {書|か}いた 。 {名前|なまえ} が 、 {道|みち} に {馴染|なじ}んで いく よう な {気|き} が する 。 || You write "${w.names[n][1]}" on the signpost in ink. It feels as if the name settles into the road.`).join('\n')}
!if as_nm_main&as_nm_canal&as_nm_hill -> all
!end
:all
!call as.streets_done
!end
:later
narr: {名前|なまえ} は 、 また {後|あと} で {考|かんが}えよう 。 || You can think of a name later.
!end
:named
${names.map((n) => `?(var.as_way_${k}=${n}) narr: {道標|みちしるべ} 「 ${w.names[n][0]} 」 。 || The signpost: "${w.names[n][1]}".`).join('\n')}
?(as_streets) narr: {下|した} に 、 {子供|こども} の {字|じ} で 、 {同|おな}じ {名前|なまえ} が {小|ちい}さく {書|か}き{足|た}して ある 。 || Below it, the same name has been added in small letters, in a child's hand.
`;
  }
  out += `
@scene as.streets_done
!set as_streets
!quest as_main 1
narr: {三|みっ}つ の {道|みち} に 、 {名前|なまえ} が ついた 。 || All three roads have names.
as_mitsue: {名前|なまえ} が ついた とたん に 、 {手紙|てがみ} が {一通|いっつう} {届|とど}きました よ 。 {住所|じゅうしょ} が {書|か}ける よう に なった から です 。 || The moment the names were up, a letter arrived. Now people can write an address.
as_mitsue: {潮|しお}{硝子|がらす} の {先生|せんせい} から です 。 この {村|むら} で 、 {子供|こども} たち に {読|よ}み{書|か}き を {教|おし}えたい って 。 || It's from a teacher in Saltglass. She wants to teach the children here to read and write.
!set as_kotoe
as_mitsue: {次|つぎ} は 、 {掲示板|けいじばん} に {最初|さいしょ} の {知|し}らせ を {書|か}いて くれません か 。 {村|むら} の {決|き}まり は 、 {書|か}いて {貼|は}って {初|はじ}めて {決|き}まり に なる ん です 。 || Next, would you write the first notices for the board? A village's rules only become rules once they're written up and posted.
?(comp=nao) comp: {住所|じゅうしょ} が できた なら 、 {俺|おれ} が {配達|はいたつ} に {来|く}る {日|ひ} も {来|く}る な 。 || If there are addresses now, one day I'll be delivering here.
?(comp=mio) comp: {子供|こども} たち が {字|じ} を {習|なら}う {村|むら} 。 いい {村|むら} に なる わ 。 || A village where the children learn their letters. It'll be a good village.
?(comp=ren) comp: {名前|なまえ} を {呼|よ}べば 、 {答|こた}える 。 {灯守|ひもり} の {教|おし}え の {通|とお}り です 。 || Call a name and it answers. Just as the keepers taught.
?(comp=suzu) comp: {第|だい}{一幕|いちまく} 、 {無事|ぶじ} {終演|しゅうえん} 。 {次|つぎ} は {台本|だいほん} 、 つまり {知|し}らせ ね 。 || Act one, done. Next, the script: the notices.
`;

  // ---- the notice board ------------------------------------------------------------------------------------------------------------
  out += `
@scene as.board
!if quest.as_main=0 -> early
!if as_nt_water&as_nt_market -> read
# (with the washing's notice up and the market's put off, the board is not empty: straight on to the market; RBN-QA-175)
?(!as_nt_water) narr: {掲示板|けいじばん} 。 まだ {何|なに} も {貼|は}って ない 。 || The notice board. Nothing on it yet.
!if as_nt_water -> market
narr: {井戸|いど} の {周|まわ}り が 、 {石鹸|せっけん} の {泡|あわ} で {白|しろ}い 。 {誰|だれ} か が 、 {飲|の}み{水|みず} の {井戸|いど} で {洗濯|せんたく} を して いる 。 || The ground round the well is white with soap suds. Someone has been washing clothes at the drinking well.
!challenge as.notice_water
!if var._res=0 -> later
?(var._forge=stream) !var as_wash = stream
?(var._forge=reeds) !var as_wash = reeds
!if var.as_wash=0 -> wfall
!goto wset
:wfall
!var as_wash = stream
:wset
!set as_nt_water
?(var.as_wash=stream) narr: {知|し}らせ を {貼|は}った 。 {次|つぎ} の {日|ひ} から 、 {洗濯|せんたく} は {鍛冶場|かじば} の {下|した} の {小川|おがわ} で する こと に なった 。 || You post the notice. From the next day, the washing is done at the stream below the forge.
?(var.as_wash=reeds) narr: {知|し}らせ を {貼|は}った 。 {次|つぎ} の {日|ひ} から 、 {洗濯|せんたく} は {葦|あし} の {岸|きし} で する こと に なった 。 || You post the notice. From the next day, the washing is done on the reed bank.
:market
narr: {村|むら} に は 、 {店|みせ} が {一軒|いっけん} も ない 。 {塩|しお} も {針|はり} も 、 {葦|あし}ノ{瀬|せ} まで {買|か}い に {行|い}く しか ない 。 || There isn't a single shop in the village. Salt, needles, anything: you have to walk to Reedwake.
!challenge as.notice_market
!if var._res=0 -> later
?(var._forge=board) !var as_market = board
?(var._forge=bridge) !var as_market = bridge
!if var.as_market=0 -> mfall
!goto mset
:mfall
!var as_market = board
:mset
!set as_nt_market
narr: {知|し}らせ を {貼|は}った 。 {次|つぎ} の {市|いち} の {日|ひ} 、 {灯|ひ} の {道|みち} を {登|のぼ}って {行商人|ぎょうしょうにん} が {来|き}た 。 || You post the notice. On the next market day a pedlar comes up the Lantern Road.
?(var.as_market=board) narr: {掲示板|けいじばん} の {前|まえ} に 、 {屋台|やたい} が {一|ひと}つ {立|た}った 。 || A stall goes up in front of the notice board.
?(var.as_market=bridge) narr: {橋|はし} の たもと に 、 {屋台|やたい} が {一|ひと}つ {立|た}った 。 || A stall goes up at the foot of the bridge.
!quest as_main 2
as_mitsue: {知|し}らせ {一|ひと}つ で 、 {人|ひと} の {動|うご}き が {変|か}わる ん です ね 。 …… {次|つぎ} は 、 ちょっと {厄介|やっかい} です よ 。 {喧嘩|けんか} が {二|ふた}つ ある ん です 。 || One notice, and everyone does things differently. …The next part is trickier. There are two quarrels.
as_mitsue: {水路|すいろ} の {水|みず} で 、 ヨシゾウ さん と タキ さん が 。 {鍛冶場|かじば} の {音|おと} で 、 ショウ さん と ナツ さん が 。 {間|あいだ} に {入|はい}って くれません か 。 || Yoshizō and Taki, over the channel's water. Shō and Natsu, over the forge's noise. Would you step in between them?
!end
:later
narr: {知|し}らせ は 、 また {後|あと} で {書|か}こう 。 || You can write the notice later.
!end
:early
narr: {掲示板|けいじばん} 。 ミツエ の {字|じ} で 「 {道|みち} の {名前|なまえ} 、 {募集|ぼしゅう} {中|ちゅう} 」 と だけ {書|か}いて ある 。 || The notice board. In Mitsue's hand, only: "Names for the roads wanted."
!end
:read
?(var.as_wash=stream) narr: 「 {井戸|いど} の {水|みず} は {飲|の}み{水|みず} です 。 {洗濯|せんたく} は {小川|おがわ} で 」 || "The well is for drinking water. Washing at the stream."
?(var.as_wash=reeds) narr: 「 {井戸|いど} の {水|みず} は {飲|の}み{水|みず} です 。 {洗濯|せんたく} は {葦|あし} の {岸|きし} で 」 || "The well is for drinking water. Washing on the reed bank."
?(var.as_market=board) narr: 「 {五日|いつか} ごと に 、 {掲示板|けいじばん} の {前|まえ} で {市|いち} 」 || "Every fifth day, a market in front of the notice board."
?(var.as_market=bridge) narr: 「 {五日|いつか} ごと に 、 {橋|はし} の たもと で {市|いち} 」 || "Every fifth day, a market at the foot of the bridge."
?(as_dp_water) narr: 「 {水路|すいろ} の {水|みず} の {順番|じゅんばん} は 、 {橋|はし} の {横|よこ} の {札|ふだ} を {見|み}る こと 」 || "For the channel's turns, see the board by the bridge."
?(as_fest_done) narr: {隅|すみ} に 、 {祭|まつ}り の {夜|よる} の {絵|え} が {一枚|いちまい} 。 {子供|こども} が {描|か}いた らしい 。 || In the corner, a picture of the festival night. A child drew it, by the look of it.

@scene as.well
narr: {新|あたら}しい {井戸|いど} 。 {水|みず} は {冷|つめ}たくて 、 {甘|あま}い 。 || The new well. The water is cold and sweet.
?(!as_nt_water) narr: {周|まわ}り が 、 {石鹸|せっけん} の {泡|あわ} で {白|しろ}い 。 || The ground round it is white with soap suds.
?(as_nt_water) narr: {周|まわ}り は 、 きれい に {掃|は}いて ある 。 || The ground round it has been swept clean.

@scene as.mailbox
narr: {新|あたら}しい {郵便|ゆうびん}{箱|ばこ} 。 {宛先|あてさき} に 、 {村|むら} の {道|みち} の {名前|なまえ} が {書|か}ける よう に なった 。 || A new post box. Now a letter can be addressed to a road in this village.
?(comp=nao) comp: {箱|はこ} が ある なら 、 {配達|はいたつ} の {道|みち} も ある って こと だ 。 || A box means a delivery round.

@scene as.rota
?(var.as_rota=time) narr: 「 {朝|あさ} は タキ の {田|た} 、 {昼|ひる} から は ヨシゾウ の {田|た} 」 。 {二人|ふたり} の {字|じ} で {書|か}いて ある 。 || "Mornings: Taki's paddy. From noon: Yoshizō's." Written in both their hands.
?(var.as_rota=days) narr: 「 {一日|いちにち} おき に {交代|こうたい} 。 {今日|きょう} は 、 {札|ふだ} の {表|おもて} の {人|ひと} 」 。 {札|ふだ} は {毎朝|まいあさ} {裏返|うらがえ}される らしい 。 || "Turn and turn about, a day each. Today: whoever is on the front of the tag." The tag gets turned over every morning, it seems.

@scene as.forge_hours
narr: {鍛冶場|かじば} の {戸|と} に 、 {札|ふだ} が {掛|か}かって いる 。 「 {打|う}つ の は {朝|あさ} だけ 。 {昼|ひる} から は {田|た}んぼ に います 」 || A tag hangs on the forge door: "Hammering mornings only. Afternoons, in the paddies."
`;

  // ---- the quarrels -----------------------------------------------------------------------------------------------------------------
  out += `
@scene as.water_talk
!if as_dp_water -> done
!walkto as_yoshizo pc max=8000
!if var._walked=0 -> apart
!walkto as_taki pc max=8000
!if var._walked=0 -> talk
narr: {水門|すいもん} の こと で 、 ヨシゾウ と タキ が {言|い}い{合|あ}って いる 。 || Yoshizō and Taki are arguing over the sluice.
!goto talk
:apart
!walkto as_taki pc max=8000
:talk
as_yoshizo: {俺|おれ} が {掘|ほ}った {水路|すいろ} だ ！ || I dug that channel!
as_taki: {掘|ほ}った {人|ひと} の もの なら 、 {雨|あめ} も あんた の もの なの ？ || If it's whoever dug it, does the rain belong to you too?
narr: {二人|ふたり} と も 、 {本当|ほんとう} に {困|こま}って いる よう だ 。 || They both look genuinely worried.
!encounter as.water
!if var._res=0 -> unsettled
!set as_dp_water
?(as_rota_time) !var as_rota = time
?(as_rota_days) !var as_rota = days
narr: {橋|はし} の {横|よこ} に 、 {水|みず} の {順番|じゅんばん} を {書|か}いた {札|ふだ} が {立|た}った 。 || A board giving the water's turns goes up beside the bridge.
!call as.quarrels_done
!end
:unsettled
narr: {話|はなし} は 、 また {今度|こんど} 。 {二人|ふたり} と も 、 {頭|あたま} を {冷|ひ}やす {時間|じかん} が {要|い}る 。 || Another time. They both need to cool down.
!end
:done
?(var.as_rota=time) as_yoshizo: {朝|あさ} は タキ 、 {昼|ひる} から は {俺|おれ} 。 {書|か}いて ある と 、 {喧嘩|けんか} に も ならない 。 || Mornings for Taki, afternoons for me. When it's written down, there's nothing to fight about.
?(var.as_rota=days) as_yoshizo: {一日|いちにち} おき だ 。 {札|ふだ} を {裏返|うらがえ}す の は 、 {俺|おれ} の {仕事|しごと} に なった 。 || A day each. Turning the tag over is my job now.

@scene as.noise_talk
!if as_dp_noise -> done
!walkto as_natsu pc max=8000
!if var._walked=0 -> apart
!walkto as_sho pc max=8000
!if var._walked=0 -> talk
narr: {赤|あか}ちゃん を {抱|だ}いた ナツ が 、 ショウ と {向|む}かい{合|あ}って いる 。 || Natsu stands facing Shō, the baby in her arms.
!goto talk
:apart
!walkto as_sho pc max=8000
:talk
as_natsu: お{願|ねが}い です から 、 {少|すこ}し だけ {静|しず}か に して ください 。 || Please, just a little quiet. I'm begging you.
as_sho: {鎌|かま} が なければ 、 {稲|いね} は {刈|か}れない 。 || No sickles, no harvest.
narr: どちら も 、 {間違|まちが}って は いない 。 || Neither of them is wrong.
!encounter as.noise
!if var._res=0 -> unsettled
!set as_dp_noise
?(as_forge_hours) !var as_forge = hours
?(as_forge_moved) !var as_forge = moved
?(var.as_forge=hours) narr: {鍛冶場|かじば} の {戸|と} に 、 {打|う}つ {時間|じかん} を {書|か}いた {札|ふだ} が {掛|か}かった 。 || A tag with the working hours goes up on the forge door.
?(var.as_forge=moved) narr: {田|た}んぼ の {向|む}こう 、 ヨシゾウ の {家|いえ} の {隣|となり} に 、 {金床|かなとこ} と {炉|ろ} が {運|はこ}ばれた 。 || Out beyond the paddies, next to Yoshizō's house, an anvil and a forge fire are set up.
!call as.quarrels_done
!end
:unsettled
narr: {話|はなし} は 、 また {今度|こんど} 。 || Another time.
!end
:done
?(var.as_forge=hours) as_sho: {朝|あさ} は {鉄|てつ} 、 {昼|ひる} は {稲|いね} 。 …… {悪|わる}く ない 。 || Iron in the mornings, rice in the afternoons. …Not bad.
?(var.as_forge=moved) as_sho: ここ なら 、 {好|す}きな だけ {打|う}てる 。 ヨシゾウ は {耳|みみ} が {遠|とお}い し 。 || Out here I can hammer as much as I like. And Yoshizō's a bit deaf anyway.

@scene as.quarrels_done
!if !as_dp_water|!as_dp_noise -> one
!fade out 600
!set as_hall
!quest as_main 3
narr: {二|ふた}つ の {喧嘩|けんか} が {片付|かたづ}いた {日|ひ} 、 {村|むら} の {人|ひと} たち が {材木|ざいもく} を {担|かつ}いで {集|あつ}まった 。 || The day the second quarrel is settled, the villagers gather, carrying timber.
as_mitsue: {話|はな}し{合|あ}う {屋根|やね} が {要|い}る って 、 {皆|みんな} が {言|い}う ん です 。 {寄合所|よりあいじょ} です よ 。 …… それ と 、 もう {一|ひと}つ 。 {祭|まつ}り を しません か 。 {村|むら} の 、 {最初|さいしょ} の {祭|まつ}り を 。 || Everyone says we need a roof to talk under. A meeting house. …And one more thing. Shall we have a festival? The village's very first.
!fade in 600
!end
:one
narr: {喧嘩|けんか} は 、 あと {一|ひと}つ 。 || One quarrel to go.
`;

  // ---- the first festival -----------------------------------------------------------------------------------------------------------
  out += `
@scene as.fest_prep
!if as_fp_lan&as_fp_food&as_fp_order -> ready
as_mitsue: {祭|まつ}り の {支度|したく} 、 {一緒|いっしょ} に {考|かんが}えて ください 。 {提灯|ちょうちん} の {場所|ばしょ} 、 {食|た}べ{物|もの} の {量|りょう} 、 {夜|よる} の {順番|じゅんばん} 。 || Help me plan the festival: where the lanterns go, how much food, and the order of the evening.
!if as_fp_lan -> food
!challenge as.fest_lanterns
!if var._res=0 -> later
?(var._forge=street) !var as_lan = street
?(var._forge=canal) !var as_lan = canal
?(var._forge=hill) !var as_lan = hill
!if var.as_lan=0 -> lfall
!goto lset
:lfall
!var as_lan = street
:lset
!set as_fp_lan
?(var.as_lan=street) as_mitsue: {道|みち} に {沿|そ}って ずっと 。 {村|むら} の {端|はし} から {端|はし} まで {明|あか}るく なります ね 。 || All along the road. The village will be lit from end to end.
?(var.as_lan=canal) as_mitsue: {水路|すいろ} に {沿|そ}って 。 {水|みず} に {映|うつ}って 、 {倍|ばい} に {見|み}えます よ 。 || Along the channel. Reflected in the water, there'll look to be twice as many.
?(var.as_lan=hill) as_mitsue: {坂|さか} の {上|うえ} まで 。 {松|まつ} の {下|した} から 、 {村|むら} {中|じゅう} の {灯|ひ} が {見|み}えます よ 。 || Right up the slope. From under the pine you'll see the whole village lit.
:food
!if as_fp_food -> order
!challenge as.fest_food
!if var._res=0 -> later
!set as_fp_food
as_mitsue: {足|た}りなく なる より 、 {余|あま}る ほう が いい です から ね 。 || Better too much than too little.
:order
!if as_fp_order -> ready
!challenge as.fest_order
!if var._res=0 -> later
!set as_fp_order
:ready
as_mitsue: {支度|したく} は できました 。 {日|ひ} が {暮|く}れたら 、 {始|はじ}めましょう 。 || Everything's ready. We'll begin when the sun goes down.
!choice
* {祭|まつ}り を {始|はじ}める || Begin the festival -> go
* {後|あと} で || Later -> later
:go
!call as.festival
!end
:later
as_mitsue: いつ でも {声|こえ} を かけて ください 。 || Just say when.

@scene as.festival
!set as_fest_night
!music as_festival
!fade out
!fade in
!sequence as.festival begin
!shot night
narr: {日|ひ} が {暮|く}れた 。 {葦原|あしはら}{新田|しんでん} の {最初|さいしょ} の {祭|まつ}り が {始|はじ}まる 。 || The sun has gone down. Ashihara Shinden's first festival begins.
?(var.as_lan=street) narr: {提灯|ちょうちん} が 、 {道|みち} に {沿|そ}って {村|むら} の {端|はし} から {端|はし} まで {灯|とも}って いる 。 || Lanterns burn along the road, from one end of the village to the other.
?(var.as_lan=canal) narr: {提灯|ちょうちん} が 、 {水路|すいろ} に {沿|そ}って {並|なら}び 、 {水|みず} に {映|うつ}って {揺|ゆ}れて いる 。 || Lanterns line the channel, their reflections wavering in the water.
?(var.as_lan=hill) narr: {提灯|ちょうちん} が 、 {坂|さか} を {一本松|いっぽんまつ} まで {登|のぼ}って いく 。 || Lanterns climb the slope all the way to the lone pine.
as_mitsue: {皆|みな}さん 。 {去年|きょねん} の {今頃|いまごろ} 、 ここ は {葦|あし} の {原|はら} でした 。 {今|いま} は 、 {名前|なまえ} の ある {道|みち} と {決|き}まり が あって 、 {仲直|なかなお}り した {隣同士|となりどうし} が います 。 || Everyone. This time last year, this was reed plain. Now there are roads with names, rules, and neighbours who've made up.
as_mitsue: {葦原|あしはら}{新田|しんでん} 。 …… {今日|きょう} から 、 {本当|ほんとう} の {村|むら} です 。 || Ashihara Shinden. …From today, a real village.
?(as_kotoe) !shot night pupils
?(as_kotoe) narr: コトエ の {生徒|せいと} たち が 、 {覚|おぼ}えた ばかり の {字|じ} で {書|か}いた {紙|かみ} を {持|も}って 、 {歌|うた} を {歌|うた}う 。 {紙|かみ} に は 、 {村|むら} の {道|みち} の {名前|なまえ} 。 || Kotoe's pupils sing, holding up paper with the letters they've only just learned: the names of the village's roads.
?(as_kotoe) as_kotoe: {自分|じぶん} の {住|す}んで いる {道|みち} の {名前|なまえ} が 、 {最初|さいしょ} に {覚|おぼ}えた {字|じ} です 。 {一生|いっしょう} {忘|わす}れません よ 。 || The name of the road they live on was the first thing they learned to write. They'll never forget it.
as_mohei: さあ さあ 、 {今夜|こんや} は {全部|ぜんぶ} {只|ただ} だ ！ {持|も}って {行|い}きな ！ || Come on, come on, tonight everything's free! Take what you like!
!shot fire
narr: それから 、 {皆|みんな} で {踊|おど}った 。 ヨシゾウ と タキ が {並|なら}んで 、 ショウ が {鍋|なべ} を {叩|たた}いて {拍子|ひょうし} を {取|と}る 。 ナツ の {赤|あか}ちゃん は 、 {騒|さわ}ぎ の {真|ま}ん{中|なか} で ぐっすり {眠|ねむ}って いる 。 || Then everyone dances. Yoshizō and Taki side by side; Shō beating time on a cooking pot; Natsu's baby fast asleep in the middle of it all.
?(comp=nao) comp: {俺|おれ} 、 この {村|むら} の {最初|さいしょ} の {手紙|てがみ} も 、 {最後|さいご} の {手紙|てがみ} も 、 {届|とど}けたい な 。 || I'd like to deliver this village's first letter. And its last one too, someday.
?(comp=mio) comp: {皆|みんな} 、 いい {顔|かお} を して いる わ 。 {薬|くすり} より {効|き}く {顔|かお} 。 || Everyone looks so well. Better than any medicine.
?(comp=ren) comp: {灯|ひ} が {一|ひと}つ {増|ふ}える の を 、 {初|はじ}めて {自分|じぶん} の {目|め} で {見|み}た {気|き} が します 。 || I think it's the first time I've seen, with my own eyes, a light being added to the world.
?(comp=suzu) comp: {客|きゃく} も {役者|やくしゃ} も {同|おな}じ {人|ひと} 。 こういう {舞台|ぶたい} が 、 {一番|いちばん} {好|す}き かも しれない わ 。 || The audience and the cast are the same people. I think I might like this kind of stage best of all.
?(!comp) narr: {誰|だれ} か が {手|て} を {引|ひ}いて 、 {踊|おど}り の {輪|わ} に {入|い}れて くれた 。 || Someone takes your hand and pulls you into the circle of dancers.
!shot fire settle
narr: {最後|さいご} に 、 {皆|みんな} で {焚|た}き{火|び} を {囲|かこ}んだ 。 || Last of all, everyone gathers round the fire.
!shot fire gift
as_mitsue: これ を 。 {村|むら} の {皆|みんな} から です 。 {田植|たう}え の {時|とき} に かぶる {笠|かさ} です けど 、 {旅|たび} に も いい でしょう 。 || This is for you, from all of us. It's the hat we wear for planting, but it'll do for travelling too.
!sequence as.festival end
!give as_kasa
!set as_fest_done
!quest as_main done
!unset as_fest_night
!music ashihara
!autosave progress
`;

  // ---- the people, as the village grows -----------------------------------------------------------------------------------------------
  out += `
@scene as.mitsue
!if quest.as_main=done -> after
!if quest.as_main=3 -> fest
!if quest.as_main=2 -> quarrels
!if quest.as_main=1 -> notices
as_mitsue: {道|みち} の {端|はし} の {空|から} の {道標|みちしるべ} に 、 {名前|なまえ} を {書|か}いて ください 。 {入|い}り{口|ぐち} の {道|みち} 、 {水路|すいろ} の {脇|わき} の {小道|こみち} 、 それ と {坂|さか} 。 || Write names on the blank signposts at the end of each road: the road in, the lane by the channel, and the slope.
!end
:notices
as_mitsue: {掲示板|けいじばん} に 、 {最初|さいしょ} の {知|し}らせ を お{願|ねが}いします 。 {井戸|いど} の こと と 、 {市|いち} の こと 。 || The first notices for the board, please: about the well, and about a market.
!end
:quarrels
?(!as_dp_water) as_mitsue: ヨシゾウ さん と タキ さん は 、 {水路|すいろ} の {所|ところ} です 。 || Yoshizō and Taki are at the channel.
?(!as_dp_noise) as_mitsue: ショウ さん と ナツ さん は 、 {鍛冶場|かじば} の {前|まえ} です 。 || Shō and Natsu are outside the forge.
!end
:fest
!call as.fest_prep
!end
:after
?(slot.as_mitsue=1) as_mitsue: {毎朝|まいあさ} 、 {掲示板|けいじばん} を {見|み}る の が {楽|たの}しみ に なりました 。 {誰|だれ} か が {何|なに} か を {貼|は}って いる ん です 。 || I look forward to the notice board every morning now. Someone's always posted something.
?(slot.as_mitsue=2) as_mitsue: {来年|らいねん} は 、 {家|いえ} が もう {五軒|ごけん} {増|ふ}える {予定|よてい} です 。 {道|みち} も 、 もう {一本|いっぽん} {要|い}ります ね 。 || Five more houses are planned for next year. We'll need another road, too.

@scene as.yoshizo
!if quest.as_main=2&!as_dp_water -> quarrel
!if as_dp_water -> after
as_yoshizo: この {水路|すいろ} は 、 {俺|おれ} が {一人|ひとり} で {掘|ほ}った ん だ 。 {春|はる} {中|じゅう} かかった 。 || I dug this channel by myself. Took me all spring.
!end
:quarrel
!call as.water_talk
!end
:after
?(var.as_way_canal=yoshizo) as_yoshizo: …… ヨシゾウ{通|どお}り 、 か 。 {照|て}れくさい が 、 {悪|わる}く ない 。 || …Yoshizō Lane, eh. Embarrassing. Not bad, though.
!call as.water_talk

@scene as.taki
!if quest.as_main=2&!as_dp_water -> quarrel
!if as_dp_water -> after
?(!as_nt_water) as_taki: {井戸|いど} で {洗濯|せんたく} する の 、 {本当|ほんとう} は よく ない の よ ね 。 でも {皆|みんな} そう する から 。 || Washing at the well isn't really right, is it? But everyone does it.
?(as_nt_water) as_taki: {知|し}らせ が {貼|は}って ある と 、 {不思議|ふしぎ} と {皆|みんな} {守|まも}る の よ ね 。 || Funny how once it's posted on a board, everyone sticks to it.
!end
:quarrel
!call as.water_talk
!end
:after
as_taki: うち の {苗|なえ} 、 {見|み}て 。 {青々|あおあお} と して いる でしょう 。 || Look at my seedlings. Green as anything.

@scene as.sho
!if quest.as_main=2&!as_dp_noise -> quarrel
!if as_dp_noise -> after
as_sho: {鎌|かま} は 、 {村|むら} {全部|ぜんぶ} の {分|ぶん} が {要|い}る 。 || Sickles for the whole village.
!end
:quarrel
!call as.noise_talk
!end
:after
!call as.noise_talk

@scene as.natsu
!if quest.as_main=2&!as_dp_noise -> quarrel
!if as_dp_noise -> after
as_natsu: …… {少|すこ}し だけ 、 {眠|ねむ}りたい です 。 || …I'd just like to sleep a little.
!end
:quarrel
!call as.noise_talk
!end
:after
as_natsu: {昼|ひる} から は 、 {村|むら} {中|じゅう} が {静|しず}か なん です 。 この {子|こ} も 、 よく {眠|ねむ}る よう に なりました 。 || The whole village is quiet in the afternoons now. She's sleeping much better.

@scene as.kotoe
?(slot.as_kotoe=1) as_kotoe: {子供|こども} たち 、 {最初|さいしょ} に {自分|じぶん} の {道|みち} の {名前|なまえ} を {書|か}きたがる ん です よ 。 {住所|じゅうしょ} が ある って 、 {嬉|うれ}しい こと なん です ね 。 || The children always want to write the name of their own road first. Having an address is a happy thing, isn't it.
?(slot.as_kotoe=2) as_kotoe: ここ から は 、 {村|むら} が {全部|ぜんぶ} {見|み}えます 。 {授業|じゅぎょう} の {準備|じゅんび} に 、 ちょうど いい {所|ところ} です 。 || You can see the whole village from up here. Just the place to prepare lessons.

@scene as.mohei
as_mohei: いらっしゃい ！ {塩|しお} に {針|はり} に {糸|いと} 、 {新|あたら}しい {村|むら} に {要|い}る もの は 、 {何|なん} でも ある よ 。 …… お{代|だい} ？ {今日|きょう} は {試|ため}し だ 、 {持|も}って {行|い}きな 。 || Welcome! Salt, needles, thread, everything a new village needs. …Payment? Today's a trial, take it.
?(as_fest_done) as_mohei: {祭|まつ}り の {夜|よる} は 、 {儲|もう}け より {楽|たの}しかった ね 。 {商人|しょうにん} が {言|い}う こと じゃ ない けど 。 || The festival night was more fun than any profit. Not that a trader should say so.
`;
  // the people who talk about the quarrel they had, once it's over, keep their place in the village's talk
  RB.script.add(out);
})(RB.content);
