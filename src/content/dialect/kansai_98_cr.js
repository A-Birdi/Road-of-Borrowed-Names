/* Suzu's Kansai-ben: the Cloudroad, Chapter 10 of a twelve-chapter journey (expansion P12). The call, the stations,
 * the Barrier, the pass, the side stories and her reply to Koume. Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
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
@ cr/barrier [cr.barrier_first]
= {関所|せきしょ} の {芝居|しばい} なら 、 {何度|なんど} も {見|み}た わ 。 {本物|ほんもの} は 、 もっと {静|しず}か ね 。 || I've seen plenty of checkpoint plays. The real one's quieter.
> {関所|せきしょ} の {芝居|しばい} やったら 、 {何回|なんかい} も {見|み}た わ 。 {本物|ほんもの} は 、 もっと {静|しず}か や な 。 || I've seen plenty of checkpoint plays. The real one's quieter.
@ cr/barrier [cr.ujie]
= わたし が {残|のこ}る わ 。 {番所|ばんしょ} の {皆|みな}さん に 、 {一席|いっせき} {聞|き}かせて あげる 。 {帰|かえ}って {来|く}る まで 、 {退屈|たいくつ} させない から 。 || I'll stay. I'll give the office a performance. They won't be bored till you're back.
> うち が {残|のこ}る わ 。 {番所|ばんしょ} の {皆|みな}さん に 、 {一席|いっせき} {聞|き}かせて あげる 。 {帰|かえ}って {来|く}る まで 、 {退屈|たいくつ} させへん から 。 || I'll stay. I'll give the office a performance. They won't be bored till you're back.
@ cr/barrier [cr.ujie]
= {一人|ひとり} {芝居|しばい} の {稽古|けいこ} だ と {思|おも}って 。 {幕|まく} が {下|お}りる {前|まえ} に {戻|もど}って {来|き}て よ 。 || Think of it as rehearsing a one-person show. Be back before the curtain comes down.
> {一人|ひとり} {芝居|しばい} の {稽古|けいこ} や と {思|おも}って 。 {幕|まく} が {下|お}りる {前|まえ} に {戻|もど}って {来|き}て や 。 || Think of it as rehearsing a one-person show. Be back before the curtain comes down.
@ cr/barrier [cr.wait_suzu]
= {番所|ばんしょ} の {皆|みな}さん 、 {笑|わら}い {上戸|じょうご} よ 。 {心配|しんぱい} しない で 。 …… {早|はや}く {戻|もど}って {来|き}て ね 。 || The office folk laugh at anything. Don't worry about me. …Do hurry back, though.
> {番所|ばんしょ} の {皆|みな}さん 、 {笑|わら}い {上戸|じょうご} や で 。 {心配|しんぱい} せん で ええ よ 。 …… {早|はや}く {戻|もど}って {来|き}て な 。 || The office folk laugh at anything. No need to worry about me. …Do hurry back, though.
@ cr/barrier [cr.barrier_back]
= {遅|おそ}い ！ …… {冗談|じょうだん} よ 。 {番所|ばんしょ} の {人|ひと} たち 、 わたし の {芸|げい} で {三回|さんかい} {泣|な}いた わ 。 {笑|わら}い {泣|な}き で ね 。 || Late! …I'm joking. The office folk cried three times at my act. From laughing.
> {遅|おそ}い ！ …… {冗談|じょうだん} や 。 {番所|ばんしょ} の {人|ひと} たち 、 うち の {芸|げい} で {三回|さんかい} {泣|な}いた わ 。 {笑|わら}い {泣|な}き で な 。 || Late! …Only joking. The office folk cried three times at my act. From laughing.
@ cr/pass [cr.goto]
= {一座|いちざ} も 、 {町|まち} ごと に {出|だ}し{物|もの} を {変|か}える の よ 。 {同|おな}じ {芝居|しばい} じゃ 、 {飽|あ}きられちゃう もの 。 || A troupe changes its programme with every town, too. Do the same play and they get tired of you.
> {一座|いちざ} も 、 {町|まち} ごと に {出|だ}し{物|もの} を {変|か}える ん や で 。 {同|おな}じ {芝居|しばい} や と 、 {飽|あ}きられて まう もん 。 || A troupe changes its programme with every town, too. Do the same play and they get tired of you.
@ cr/pass [cr.pass1_enter]
= {花道|はなみち} に して は 、 {長|なが}すぎる わ 。 …… {冗談|じょうだん} よ 。 {行|い}きましょ 。 || Rather long for a walkway to the stage. …Joking. Let's go.
> {花道|はなみち} に して は 、 {長|なが}すぎる わ 。 …… {冗談|じょうだん} や 。 {行|い}こ 。 || Rather long for a walkway to the stage. …Joking. Let's go.
@ cr/pass [cr.pass1_slide]
= {大道具|おおどうぐ} が {倒|たお}れた みたい ね 。 {裏|うら} から {回|まわ}りましょ 。 || Like a piece of scenery that's fallen over. Let's go round the back.
> {大道具|おおどうぐ} が {倒|たお}れた みたい や な 。 {裏|うら} から {回|まわ}ろ 。 || Like a piece of scenery that's fallen over. Let's go round the back.
@ cr/pass [cr.pass1_clear]
= {幕|まく} が {開|あ}いた わ 。 || The curtain's up.
> {幕|まく} が {開|あ}いた で 。 || The curtain's up.
@ cr/pass [cr.pass2_enter]
= {揺|ゆ}れる {舞台|ぶたい} は {慣|な}れてる けど 、 {谷|たに} の {上|うえ} は {初|はじ}めて よ 。 || I'm used to a stage that wobbles, but not one over a gorge.
> {揺|ゆ}れる {舞台|ぶたい} は {慣|な}れてる けど 、 {谷|たに} の {上|うえ} は {初|はじ}めて や わ 。 || I'm used to a stage that wobbles, but not one over a gorge.
@ cr/pass [cr.bridge]
= {一人|ひとり} ずつ の {花道|はなみち} 。 {揺|ゆ}れる けど 、 {見得|みえ} を {切|き}る {暇|ひま} は なかった わ 。 || A walkway for one at a time. It sways, and there wasn't a moment to strike a pose.
> {一人|ひとり} ずつ の {花道|はなみち} 。 {揺|ゆ}れる けど 、 {見得|みえ} を {切|き}る {暇|ひま} は あらへんかった わ 。 || A walkway for one at a time. It sways, and there wasn't a moment to strike a pose.
@ cr/pass [cr.pass3_enter]
= {真|ま}っ{白|しろ} な {舞台|ぶたい} 。 {足跡|あしあと} が {台本|だいほん} ね 。 || A pure white stage. Our footprints are the script.
> {真|ま}っ{白|しろ} な {舞台|ぶたい} 。 {足跡|あしあと} が {台本|だいほん} や な 。 || A pure white stage. Our footprints are the script.
@ cr/pass [cr.drift]
= {雪|ゆき} の {大道具|おおどうぐ} 、 {片付|かたづ}け ます よ 。 …… {重|おも}い ！ || Clearing away the snow scenery. …Heavy!
> {雪|ゆき} の {大道具|おおどうぐ} 、 {片付|かたづ}け ます で 。 …… {重|おも}い わ ！ || Clearing away the snow scenery. …Heavy!
@ cr/pass [cr.hut_enter]
= {舞台|ぶたい} の {小道具|こどうぐ} が 、 {全部|ぜんぶ} {揃|そろ}ってる わ 。 {誰|だれ} か が 、 {台詞|せりふ} を {忘|わす}れた まま {立|た}って いる みたい 。 || All the props are in place. As if someone's standing there having forgotten his lines.
> {舞台|ぶたい} の {小道具|こどうぐ} が 、 {全部|ぜんぶ} {揃|そろ}ってる わ 。 {誰|だれ} か が 、 {台詞|せりふ} を {忘|わす}れた まま {立|た}ってる みたい や 。 || All the props are in place. As if someone's standing there having forgotten his lines.
@ cr/pass [cr.courier]
= {長|なが}い {一人|ひとり} {芝居|しばい} だった わ ね 。 …… {拍手|はくしゅ} 。 || A long one-man show. …Applause.
> {長|なが}い {一人|ひとり} {芝居|しばい} やった な 。 …… {拍手|はくしゅ} 。 || A long one-man show. …Applause.
@ cr/pass [cr.summit_first]
= {湯治場|とうじば} ね ！ {旅|たび} の {一座|いちざ} の {憧|あこが}れ よ 。 {次|つぎ} の {幕|まく} は 、 あそこ かしら 。 || A spa! Every touring company's dream. Is that where the next act is?
> {湯治場|とうじば} や ！ {旅|たび} の {一座|いちざ} の {憧|あこが}れ や で 。 {次|つぎ} の {幕|まく} は 、 あそこ やろ か 。 || A spa! Every touring company's dream. Is that where the next act is?
@ cr/pass [cr.deliver]
= {五十年|ごじゅうねん} がかり の {幕切|まくぎ}れ ね 。 …… {台本|だいほん} どおり じゃ なかった けど 、 いい {芝居|しばい} だった わ 。 || A final curtain fifty years in the making. …Not as the script had it, but a good play.
> {五十年|ごじゅうねん} がかり の {幕切|まくぎ}れ や な 。 …… {台本|だいほん} どおり や なかった けど 、 ええ {芝居|しばい} やった わ 。 || A final curtain fifty years in the making. …Not as the script had it, but a good play.
@ cr/side [cr.seals_start]
= {巡業|じゅんぎょう} の {判子|はんこ} {集|あつ}め なら 、 {任|まか}せて 。 {一座|いちざ} で {一番|いちばん} {早|はや}かった の よ 。 || Collecting stamps on tour? Leave it to me. I was the fastest in the company.
> {巡業|じゅんぎょう} の {判子|はんこ} {集|あつ}め やったら 、 {任|まか}せとき 。 {一座|いちざ} で {一番|いちばん} {早|はや}かった ん や で 。 || Collecting stamps on tour? Leave it to me. I was the fastest in the company.
@ cr/side [cr.seals_done]
= {判子|はんこ} {帳|ちょう} が {埋|う}まる の って 、 {満員|まんいん} {御礼|おんれい} みたい で {気持|きも}ち いい わ 。 || Filling a stamp book feels like a sold-out house.
> {判子|はんこ} {帳|ちょう} が {埋|う}まる の って 、 {満員|まんいん} {御礼|おんれい} みたい で {気持|きも}ち ええ わ 。 || Filling a stamp book feels like a sold-out house.
@ cr/side [cr.guest_start]
= {帳簿|ちょうぼ} が ない の は 、 {宿屋|やどや} に は {一大事|いちだいじ} よ 。 わたし なら {寝|ね}られない わ 。 || A missing ledger is a disaster for an inn. I wouldn't sleep a wink.
> {帳簿|ちょうぼ} が あらへん の は 、 {宿屋|やどや} に は {一大事|いちだいじ} や で 。 うち やったら {寝|ね}られへん わ 。 || A missing ledger is a disaster for an inn. I wouldn't sleep a wink.
@ cr/side [cr.guest_settle]
= {帳簿|ちょうぼ} は {嘘|うそ} を つかない 。 {人|ひと} が {読|よ}み{間違|まちが}える だけ よ 。 || A ledger never lies. People just misread it.
> {帳簿|ちょうぼ} は {嘘|うそ} を つかへん 。 {人|ひと} が {読|よ}み{間違|まちが}える だけ や 。 || A ledger never lies. People just misread it.
@ cr/side [cr.map_start]
= {聞|き}いた {話|はなし} を {見|み}て きた よう に {言|い}う の は 、 {役者|やくしゃ} の {悪|わる}い {癖|くせ} よ 。 {気|き} を つける わ 。 || Telling what you heard as if you'd seen it is an actor's bad habit. I'll be careful.
> {聞|き}いた {話|はなし} を {見|み}て きた よう に {言|い}う の は 、 {役者|やくしゃ} の {悪|わる}い {癖|くせ} や 。 {気|き} つける わ 。 || Telling what you heard as if you'd seen it is an actor's bad habit. I'll be careful.
@ cr/side [cr.map_report]
= {黒|くろ} と {赤|あか} 。 {台本|だいほん} の {書|か}き{込|こ}み みたい ね 。 {正直|しょうじき} な {台本|だいほん} よ 。 || Black and red. Like the marks on a script. An honest script.
> {黒|くろ} と {赤|あか} 。 {台本|だいほん} の {書|か}き{込|こ}み みたい や な 。 {正直|しょうじき} な {台本|だいほん} や 。 || Black and red. Like the marks on a script. An honest script.
@ cr/side [cr.oshika]
= {南|みなみ} の {島|しま} の {話|はなし} 、 {巡礼|じゅんれい} {版|ばん} ね 。 {一番|いちばん} {夢|ゆめ} が ある {版|ばん} だ わ 。 || The pilgrim's version of the island story. The dreamiest version yet.
> {南|みなみ} の {島|しま} の {話|はなし} 、 {巡礼|じゅんれい} {版|ばん} や な 。 {一番|いちばん} {夢|ゆめ} が ある {版|ばん} や わ 。 || The pilgrim's version of the island story. The dreamiest version yet.
@ cr/side [cr.pilgrim_done]
= {千秋楽|せんしゅうらく} ね 。 {六十年|ろくじゅうねん} の {巡業|じゅんぎょう} 、 お{疲|つか}れ さま でした 。 || Closing night. Sixty years on tour: well done.
> {千秋楽|せんしゅうらく} や な 。 {六十年|ろくじゅうねん} の {巡業|じゅんぎょう} 、 お{疲|つか}れ さん でした 。 || Closing night. Sixty years on tour: well done.
@ cr/side [cr.ginji]
= {訳|わけ} あり の {人|ひと} の {荷物|にもつ} は 、 {大抵|たいてい} {訳|わけ} が {一番|いちばん} {重|おも}い の よ 。 || With people who have their reasons, the reasons are usually the heaviest part of the luggage.
> {訳|わけ} あり の {人|ひと} の {荷物|にもつ} は 、 {大抵|たいてい} {訳|わけ} が {一番|いちばん} {重|おも}い ん や で 。 || With people who have their reasons, the reasons are usually the heaviest part of the luggage.
@ cr/side [cr.family]
= {五十年|ごじゅうねん} {越|ご}し の {大団円|だいだんえん} 。 {客席|きゃくせき} から {見|み}て いたかった わ 。 || A grand finale fifty years in the making. I'd have liked to watch it from the audience.
> {五十年|ごじゅうねん} {越|ご}し の {大団円|だいだんえん} 。 {客席|きゃくせき} から {見|み}たかった わ 。 || A grand finale fifty years in the making. I'd have liked to watch it from the audience.
@ cr/side [cr.sono]
= {同|おな}じ {人|ひと} の {話|はなし} が 、 {宿|やど} ごと に {違|ちが}う 。 {旅回|たびまわ}り の {一座|いちざ} の {噂|うわさ} と {同|おな}じ ね 。 || The same man's story, different at every inn. Just like the rumours about a touring company.
> {同|おな}じ {人|ひと} の {話|はなし} が 、 {宿|やど} ごと に {違|ちが}う 。 {旅回|たびまわ}り の {一座|いちざ} の {噂|うわさ} と {一緒|いっしょ} や な 。 || The same man's story, different at every inn. Just like the rumours about a touring company.
@ cr/comp [cr.suzu_reply]
= ジンパチ さん 。 これ 、 {下|した} まで {継|つ}いで くれる ？ {海|うみ} の {方|ほう} の 、 {旅|たび} の {一座|いちざ} の コウメ って {人|ひと} に 。 || Jinpachi. Could you pass this down the line? To someone called Koume, in a travelling company down by the sea.
> ジンパチ さん 。 これ 、 {下|した} まで {継|つ}いで くれへん ？ {海|うみ} の {方|ほう} の 、 {旅|たび} の {一座|いちざ} の コウメ って {人|ひと} に 。 || Jinpachi. Would you pass this down the line? To someone called Koume, in a travelling company down by the sea.
@ cr/comp [cr.suzu_reply]
= …… {返事|へんじ} 、 {遅|おそ}く なった けど 。 {遅|おそ}すぎる {手紙|てがみ} は ない って 、 {誰|だれ} か が {言|い}ってた もの ね 。 || …The reply's late. But someone said there's no such thing as a letter too late.
> …… {返事|へんじ} 、 {遅|おそ}く なった けど 。 {遅|おそ}すぎる {手紙|てがみ} は あらへん って 、 {誰|だれ} か が {言|い}うてた もん な 。 || …The reply's late. But someone said there's no such thing as a letter too late.
`);
