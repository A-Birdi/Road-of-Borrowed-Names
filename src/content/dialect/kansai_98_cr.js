/* Suzu's Kansai-ben: the Cloudroad, Chapter 10 of a twelve-chapter journey (expansion P12). The call, the stations,
 * the Barrier and the pass. Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ cr/call [cr.call]
= {伝言|でんごん}ゲーム の {最後|さいご} の {人|ひと} って {感|かん}じ ね 。 {元|もと} の {台本|だいほん} を {見|み}に {行|い}きましょ 。 || Like the last person in a game of telephone. Let's go and read the original script.
> {伝言|でんごん}ゲーム の {最後|さいご} の {人|ひと} って {感|かん}じ や な 。 {元|もと} の {台本|だいほん} を {見|み}に {行|い}こ 。 || Like the last person in a game of telephone. Let's go and read the original script.
@ cr/call [cr.yae]
= {旅芸人|たびげいにん} も 、 {昔|むかし} は {山|やま} の {街道|かいどう} を {越|こ}えた もの よ 。 {宿屋|やどや} の {話|はなし} なら 、 {任|まか}せて 。 || Travelling players used to cross the mountain highways too. If it's inns you want to know about, leave it to me.
> {旅芸人|たびげいにん} も 、 {昔|むかし} は {山|やま} の {街道|かいどう} を {越|こ}えた もん や 。 {宿屋|やどや} の {話|はなし} なら 、 {任|まか}せとき 。 || Travelling players used to cross the mountain highways too. If it's inns you want to know about, leave it to me.
@ cr/call [cr.arrive1]
= {宿場|しゅくば} の {朝|あさ} の {匂|にお}い 。 お{味噌汁|みそしる} と 、 {馬|うま} と 、 {草鞋|わらじ} 。 {懐|なつ}かしい わ 。 || The smell of a post station in the morning. Miso soup, horses and straw sandals. It takes me back.
> {宿場|しゅくば} の {朝|あさ} の {匂|にお}い 。 お{味噌汁|みそしる} と 、 {馬|うま} と 、 {草鞋|わらじ} 。 {懐|なつ}かしい わ あ 。 || The smell of a post station in the morning. Miso soup, horses and straw sandals. It takes me back.
@ cr/call [cr.kanbe_first]
= {台詞|せりふ} は {台本|だいほん} どおり に 。 {役者|やくしゃ} の {基本|きほん} よ 。 || Lines as written in the script. An actor's first rule.
> {台詞|せりふ} は {台本|だいほん} どおり に 。 {役者|やくしゃ} の {基本|きほん} や で 。 || Lines as written in the script. An actor's first rule.
@ cr/stations [cr.wait_fog]
= {幕間|まくあい} ね 。 {休|やす}む の も {芸|げい} の うち よ 。 || An interval. Resting is part of the craft.
> {幕間|まくあい} や な 。 {休|やす}む の も {芸|げい} の うち や で 。 || An interval. Resting is part of the craft.
@ cr/stations [cr.arrive2]
= しめ{縄|なわ} が {巻|ま}いて ある わ 。 {神様|かみさま} の {木|き} ね 。 {挨拶|あいさつ} して {行|い}きましょ 。 || There's a sacred rope round it. A god's tree. Let's pay our respects.
> しめ{縄|なわ} が {巻|ま}いて ある わ 。 {神様|かみさま} の {木|き} や な 。 {挨拶|あいさつ} して {行|い}こ 。 || There's a sacred rope round it. A god's tree. Let's pay our respects.
@ cr/stations [cr.cedar]
= 「{伝|つた}えられて いる 」 。 …… {正直|しょうじき} な {札|ふだ} ね 。 {誰|だれ} も {数|かぞ}えて ない って こと よ 。 || "Said to be." …An honest plaque. It means nobody's counted.
> 「{伝|つた}えられて いる 」 。 …… {正直|しょうじき} な {札|ふだ} や な 。 {誰|だれ} も {数|かぞ}えて へん って こと や 。 || "Said to be." …An honest plaque. It means nobody's counted.
@ cr/stations [cr.arrive3]
= {雨|あめ} の {日|ひ} の {宿場|しゅくば} は 、 {満員|まんいん} に なる わ よ 。 {早|はや}い {者|もの} {勝|が}ち 。 || A post station fills up on a rainy day. First come, first served.
> {雨|あめ} の {日|ひ} の {宿場|しゅくば} は 、 {満員|まんいん} に なる で 。 {早|はや}い {者|もの} {勝|が}ち や 。 || A post station fills up on a rainy day. First come, first served.
@ cr/stations [cr.arrive4]
= {呼|よ}び{込|こ}み の {声|こえ} 、 いい {勝負|しょうぶ} ね 。 {芝居|しばい} の {口上|こうじょう} より {元気|げんき} だ わ 。 || The calling-in's neck and neck. Livelier than a theatre's opening announcement.
> {呼|よ}び{込|こ}み の {声|こえ} 、 ええ {勝負|しょうぶ} や な 。 {芝居|しばい} の {口上|こうじょう} より {元気|げんき} や わ 。 || The calling-in's neck and neck. Livelier than a theatre's opening announcement.
@ cr/stations [cr.horse]
= {後|うし}ろ {向|む}き の {退場|たいじょう} 、 お{見事|みごと} ！ || A graceful exit, backwards!
> {後|うし}ろ {向|む}き の {退場|たいじょう} 、 お{見事|みごと} や ！ || A graceful exit, backwards!
@ cr/stations [cr.arrive5]
= {霧|きり} の {演出|えんしゅつ} ね 。 …… {本物|ほんもの} は 、 {寒|さむ}い わ 。 || A fog effect. …The real thing is cold.
> {霧|きり} の {演出|えんしゅつ} や な 。 …… {本物|ほんもの} は 、 {寒|さむ}い わ 。 || A fog effect. …The real thing is cold.
@ cr/stations [cr.arrive6]
= {最後|さいご} の {宿|しゅく} …… 。 {幕|まく} の {前|まえ} の {一休|ひとやす}み ね 。 || The last station… A breather before the curtain.
> {最後|さいご} の {宿|しゅく} …… 。 {幕|まく} の {前|まえ} の {一休|ひとやす}み や な 。 || The last station… A breather before the curtain.
`);
