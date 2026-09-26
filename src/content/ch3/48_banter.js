/* Chapter 3 companion banter (talk to your companion anywhere in co.*).
 * Five per companion, keyed to the story's progress. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const B = (comp, n, cond) => C.banter.push({ comp, map: 'co.*', if: cond, scene: 'co.b_' + comp + n });
  const early = '!co_chronicle_read', mid = 'co_chronicle_read&!co_upper_open', dungeon = 'co_upper_open&!co_kiln_done', after = 'co_kiln_done&!ch3_done', done = 'ch3_done';
  for (const c of ['nao', 'mio', 'ren', 'suzu']) { B(c, 1, early); B(c, 2, mid); B(c, 3, dungeon); B(c, 4, after); B(c, 5, done); }
})(RB.content);

RB.script.add(`
@scene co.b_nao1
comp: …… {笑|わら}う なよ 。 {俺|おれ} 、 {書|か}き{直|なお}した {宛名|あてな} の {札|ふだ} を 、 {全部|ぜんぶ} {取|と}って ある ん だ 。 {雨|あめ} で {滲|にじ}んだ やつ 、 {破|やぶ}れた やつ 。 || …Don't laugh. I keep every address tag I've ever rewritten. The rain-smudged ones, the torn ones.
comp: {字|じ} って の は 、 {誰|だれ} か が {誰|だれ} か に {届|とど}けたい と {思|おも}った {跡|あと} だ 。 {捨|す}てられ ない 。 || Handwriting is the trace of somebody wanting to reach somebody. I can't throw that out.
comp[smirk]: この {里|さと} は 、 {白|しろ}い {札|ふだ} が {詰|つ}まった {引|ひ}き{出|だ}し みたい だ 。 {気|き} に {入|い}らない 。 || This village is like a drawer full of blank tags. I don't like it.

@scene co.b_nao2
comp: {手紙|てがみ} を {届|とど}ける {前|まえ} に 、 {封筒|ふうとう} を {見|み}て {思|おも}う こと が ある 。 これ は {相手|あいて} を {傷|きず}つける な 、 って 。 || Sometimes before a delivery I look at the envelope and think: this is going to hurt them.
comp: {一日|いちにち} {待|ま}つ 。 {一週間|いっしゅうかん} {待|ま}つ 。 {気|き} が つく と 、 {届|とど}けない こと に {決|き}めて いる 。 || I wait a day. A week. Before I know it, I've decided not to deliver it.
pc: その {手紙|てがみ} 、 まだ {持|も}って いる の ？ || Do you still have that letter?
comp[closed]: …… {鞄|かばん} の {一番|いちばん} {底|そこ} だ 。 {今|いま} は その {話|はなし} は なし 。 {出口|でぐち} の {確認|かくにん} が {先|さき} だ 。 || …At the very bottom of my bag. Not now. Exits first.

@scene co.b_nao3
comp: {窯|かま} の {中|なか} で {一番|いちばん} {嫌|いや} な の は 、 {出口|でぐち} が {入|い}り{口|ぐち} と {同|おな}じ だって こと だ 。 || The worst thing about a kiln is that the exit is the entrance.
comp[smirk]: {戻|もど}る {時|とき} は {走|はし}る ぞ 。 {文句|もんく} は {聞|き}かない 。 …… {走|はし}る な 、 って {言|い}われた こと も あった けど な 。 {昔|むかし} 。 || We run on the way back. No complaints. …Someone once told me not to run. Long time ago.
comp: {上|うえ} で {何|なに} か が {熱|ねつ} を {溜|た}めてる 。 {水|みず} か {氷|こおり} 。 {札|ふだ} を {二枚|にまい} {持|も}ってる の は 、 {心強|こころづよ}い な 。 || Something up there is building heat. Water or ice. Good to have two cards to play.

@scene co.b_nao4
comp: {鐘|かね} の {話|はなし} 、 {聞|き}いた か 。 {皆|みな} 、 {鐘|かね} が {鳴|な}ったら {水路|すいろ} へ {走|はし}った って 。 {頭|あたま} が {忘|わす}れて も 、 {足|あし} が {道|みち} を {覚|おぼ}えてた 。 || Heard about the bell? Everyone ran to the channel when it rang. Their heads forgot; their feet remembered the way.
comp: {配達|はいたつ} も そう だ 。 {宛名|あてな} が {消|き}えて も 、 {足|あし} が {家|いえ} を {覚|おぼ}えてる こと が ある 。 || Deliveries are like that. Even when the address fades, your feet sometimes remember the house.
comp: …… {今夜|こんや} の {集|あつ}まり 、 {重|おも}い {荷物|にもつ} に なる な 。 {一緒|いっしょ} に {運|はこ}ぼう 。 || …Tonight's gathering is going to be a heavy parcel. Let's carry it together.

@scene co.b_nao5
comp: {雪鈴|ゆきすず} へ の {道|みち} が {開|あ}いた 。 {冬|ふゆ} の あいだ {郵便|ゆうびん} が {止|と}まる {村|むら} だ 。 {急|いそ}ごう 。 || The road to Snowbell's open. The post stops there all winter. Let's hurry.
comp[smirk]: {干|ほ}し{柿|がき} 、 {鞄|かばん} に {入|い}れた 。 {手紙|てがみ} と {一緒|いっしょ} に 。 {甘|あま}い {匂|にお}い の {手紙|てがみ} が {届|とど}いたら 、 {俺|おれ} の せい だ 。 || I put dried persimmons in my bag. With the letters. If anyone gets a sweet-smelling letter, that's on me.

@scene co.b_mio1
comp: {広場|ひろば} の {椅子|いす} 、 {列|れつ} が {少|すこ}し {曲|ま}がって いた ので 、 {直|なお}して しまいました 。 …… {頼|たの}まれて も いない のに 。 || The chairs in the square were a little out of line, so I straightened them. …Nobody even asked me to.
comp[smile]: {考|かんが}え{事|ごと} を する と 、 {手|て} が {勝手|かって} に {並|なら}べる んです 。 {瓶|びん} でも 、 {椅子|いす} でも 、 {人|ひと} の {話|はなし} でも 。 || When I'm thinking, my hands line things up on their own. Bottles, chairs, what people tell me.
comp[think]: この {里|さと} の {話|はなし} は 、 {並|なら}べて も {一|ひと}つ {足|た}りない んです 。 {真|ま}ん{中|なか} の {一|ひと}つ が 。 || The things people here say never line up. One piece is missing — the middle one.

@scene co.b_mio2
comp: フサ さん の {喉|のど} の {薬|くすり} 、 ヘイタ さん の {腰|こし} の {湿布|しっぷ} 、 コタロウ くん の {膝|ひざ} の {擦|す}り{傷|きず} 。 …… {全部|ぜんぶ} 「 はい 」 と {言|い}って しまいました 。 || Fusa's throat syrup, Heita's back poultice, Kotarō's scraped knee… I said yes to all of them.
pc: {断|ことわ}って も よかった ん だ よ 。 || You could have said no.
comp[surprise]: …… {断|ことわ}る 。 {断|ことわ}って も 、 いい ん です か 。 || …Say no. Is that… allowed?
comp[smile]: {冗談|じょうだん} です 。 …… {半分|はんぶん} は 。 {今夜|こんや} 、 {少|すこ}し {考|かんが}えて みます 。 || That was a joke. …Half of one. I'll think about it tonight.

@scene co.b_mio3
comp[worry]: $name さん 、 {水|みず} を 。 {今|いま} です 。 {喉|のど} が {渇|かわ}いて から で は {遅|おそ}い んです 。 || $name, water. Now. Once you're thirsty it's already too late.
comp: {潮硝子|しおがらす} で 、 {薬|くすり} を {買|か}い に {来|き}た {商人|しょうにん} に 「 お{嬢|じょう}ちゃん 、 {分|わ}かる かな 」 って {言|い}われた こと が ある んです 。 || Back in Saltglass, a merchant who came to buy medicine asked me, "Do you understand this, little miss?"
comp[angry]: {分量|ぶんりょう} を {三回|さんかい} {間違|まちが}えて いた の は 、 {向|む}こう です 。 {全部|ぜんぶ} {直|なお}して あげました 。 {大|おお}きな {声|こえ} で 。 || He was the one who'd got the dosage wrong three times. I corrected every one. Loudly.
comp[smile]: …… さ 、 {飲|の}んで ください 。 {笑|わら}って ない で 。 || …Now, drink. Stop laughing.

@scene co.b_mio4
comp: {苦|にが}い {薬|くすり} ほど 、 {効|き}く 、 と {言|い}う {人|ひと} が います 。 {私|わたし} は {嫌|きら}い な {言葉|ことば} です 。 {苦|にが}く なくて {効|き}く なら 、 その {方|ほう} が いい 。 || Some say the more bitter the medicine, the better it works. I hate that saying. If it can work without being bitter, so much the better.
comp[sad]: でも 、 {今夜|こんや} {皆|みな} さん に {渡|わた}す の は 、 {苦|にが}く ない と {効|き}かない {薬|くすり} です 。 …… {初|はじ}めて です 。 {甘|あま}く できない の は 。 || But what everyone receives tonight only works if it's bitter. …It's the first time I can't sweeten something.

@scene co.b_mio5
comp[smile]: {火傷|やけど} の {薬|くすり} 、 {十四軒|じゅうよんけん} {分|ぶん} 。 ラベル も {全部|ぜんぶ} {書|か}きました 。 {日付|ひづけ} と 、 {使|つか}い{方|かた} と 、 {私|わたし} の {名前|なまえ} 。 || Burn salve for fourteen households. Every jar labelled: date, directions, and my name.
comp: {名前|なまえ} を {書|か}く の は 、 {責任|せきにん} を {取|と}る と いう こと です 。 …… この {里|さと} で 、 {改|あらた}めて そう {思|おも}いました 。 || Writing your name on something means taking responsibility for it. …This village reminded me of that.

@scene co.b_ren1
comp: {正直|しょうじき} に {申|もう}し{上|あ}げます 。 {段々畑|だんだんばたけ} で 、 {同|おな}じ {柿|かき} の {木|き} の {前|まえ} を {三回|さんかい} {通|とお}りました 。 || I'll be honest. On the terraces, I passed the same persimmon tree three times.
comp[think]: {道|みち} が {折|お}り{返|かえ}す {度|たび} に 、 {上|うえ} と {下|した} が {入|い}れ{替|か}わる 。 {設計|せっけい} した {人|ひと} は 、 {灯守|ひもり} を {憎|にく}んで いた に {違|ちが}い ありません 。 || Every time the path doubles back, up and down swap places. Whoever designed it must have hated lantern keepers.
comp[smirk]: …… {道|みち}しるべ が {直|なお}れば 、 {私|わたし} でも {大丈夫|だいじょうぶ} です 。 たぶん 。 {四割|よんわり} くらい は 。 || …If the signposts are fixed, even I'll be fine. Probably. Forty per cent or so.

@scene co.b_ren2
comp: {師匠|ししょう} は よく {言|い}って いました 。 「 {口|くち} に {出|だ}さない {名|な} は 、 {薄|うす}く なる 」 。 || My master used to say: "A name no one says aloud grows thin."
comp[sad]: {教|おし}え は 、 {声|こえ} の {調子|ちょうし} まで {覚|おぼ}えて います 。 なのに 、 {顔|かお} が {出|で}て こない 。 {笑|わら}って いた か どう か も 。 || I remember his teachings down to the tone of his voice. And yet his face won't come. Whether he was smiling or not.
comp: この {里|さと} の {人|ひと} たち を {見|み}て いる と 、 {他人事|ひとごと} と は {思|おも}えません 。 || Watching the people here, I can't feel it's none of my business.

@scene co.b_ren3
comp[smirk]: {窯|かま} の {中|なか} は 、 {灯守|ひもり} の {制服|せいふく} に は {厳|きび}しい です ね 。 …… {外套|がいとう} が 、 {焼|や}き{芋|いも} の {気分|きぶん} です 。 || A kiln is hard on a lantern keeper's uniform. …My coat feels like a baked sweet potato.
comp: ここ の {灯|ひ} も 、 {名|な} を {失|うしな}って います 。 {窯|かま} の {名|な} が {戻|もど}れば 、 {道|みち} の {灯|ひ} も {戻|もど}る 。 {灯|ひ} は {互|たが}い を {呼|よ}び{合|あ}う もの です から 。 || The lanterns here have lost their names too. If the kiln gets its name back, so will the road's lanterns. Lanterns call to one another.

@scene co.b_ren4
comp[think]: トキワ さん は 、 {記録|きろく} を {書|か}き{換|か}えた 。 {私|わたし} は 、 {灯|ひ} の {名|な} を {書|か}き{直|なお}す 。 {同|おな}じ {筆|ふで} の {仕事|しごと} です 。 || Tokiwa rewrote a record. I rewrite lantern names. It's the same brushwork.
comp: {違|ちが}い は …… {元|もと} に {戻|もど}す か 、 {消|け}す か 、 でしょう か 。 いえ 。 {誰|だれ} の ため に {書|か}く か 、 かも しれません 。 || The difference is… whether you restore or erase? No. Perhaps it's who you're writing for.
comp[smile]: {今夜|こんや} 、 トキワ さん は {皆|みな} の ため に {書|か}く 。 それ を {見届|みとど}けましょう 。 || Tonight Tokiwa will write for everyone. Let's be there to see it.

@scene co.b_ren5
comp: {雪鈴|ゆきすず} に は 、 {古|ふる}い {天文台|てんもんだい} が ある そう です 。 {星|ほし} の {方角|ほうがく} なら 、 {私|わたし} は {迷|まよ}いません 。 {地面|じめん} の {方角|ほうがく} は …… {聞|き}かない で ください 。 || They say Snowbell has an old observatory. With the stars I never lose my way. With the ground… please don't ask.
comp: {灰実|はいみ} の {灯|ひ} の {名|な} 、 {帰|かえ}り に {確|たし}かめたら 、 {芯|しん} まで {新|あたら}しく なって いました 。 {良|よ}い {灯|ひ} です 。 || On our way back I checked Haimi's lantern. It's new right down to the wick now. A good lantern.

@scene co.b_suzu1
comp[laugh]: この {里|さと} の {舞台|ぶたい} 、 {見|み}た ？ {板|いた} が {新|あたら}しい の よ 。 {良|よ}い {音|おと} が しそう 。 {踏|ふ}んで みたい わ 。 || Have you seen the stage here? New boards. It'll sound lovely. I'd like to stamp on it.
pc: {踏|ふ}んで くれば いい のに 。 || So go and stamp on it.
comp[closed]: …… {今|いま} は いい 。 {客席|きゃくせき} で {見|み}る {方|ほう} が {好|す}き な の 。 {嘘|うそ} よ 。 …… {嘘|うそ} じゃ ない かも 。 || …Not now. I prefer watching from the audience. That's a lie. …Maybe not a lie.

@scene co.b_suzu2
comp: {私|わたし} の {帳簿|ちょうぼ} 、 {気|き} に なる ？ {潮硝子|しおがらす} の {宿|やど} に {二泊|にはく} {分|ぶん} 、 ナオ に {鉛筆|えんぴつ} {一本|いっぽん} 、 ミオ に {頭痛|ずつう} {薬|ぐすり} {一包|ひとつつみ} 。 || Curious about my account book? Two nights at an inn in Saltglass, one pencil to Nao, a packet of headache powder to Mio.
comp[smile]: {借|か}り を {書|か}いて おく と 、 {自分|じぶん} が {誰|だれ} に {世話|せわ} に なった か {忘|わす}れない の 。 {旅芸人|たびげいにん} は 、 {忘|わす}れられる {側|がわ} だ から 。 せめて {自分|じぶん} は {忘|わす}れない よう に 。 || If I write down my debts, I never forget who looked after me. Travelling players are the ones who get forgotten. So I, at least, try not to forget.

@scene co.b_suzu3
comp[laugh]: {熱|あつ}い ！ {化粧|けしょう} が {流|なが}れる ！ …… して ない けど 。 {気分|きぶん} の {問題|もんだい} よ 。 || Hot! My make-up's running! …I'm not wearing any. It's the principle.
comp[closed]: …… あの {夜|よる} 、 {下|した} から {見|み}てた の 。 {上|うえ} が {赤|あか}く {光|ひか}って 、 {鐘|かね} が {鳴|な}り{止|や}まなくて 。 {誰|だれ} か が 、 {火|ひ} の {方|ほう} へ {上|のぼ}って いく の が {見|み}えた 。 || …That night I watched from below. The hill glowing red, the bell that wouldn't stop. And someone climbing up towards the fire.
comp: {今|いま} {思|おも}えば 、 あれ が トモエ さん だった の ね 。 || Now I think about it, that must have been Tomoe.

@scene co.b_suzu4
!if co_suzu_done -> paid
comp: …… {手|て} が {震|ふる}えてる の 。 {初日|しょにち} の {幕|まく} が {上|あ}がる {前|まえ} より 、 ずっと 。 || …My hands are shaking. Much worse than before any opening night.
comp[smile]: でも 、 {逃|に}げない わ 。 {観客|かんきゃく} が いる もの 。 || But I won't run. I've got an audience.
!end
:paid
comp[smile]: 「 {一部|いちぶ} {返済|へんさい} 」 。 …… {変|へん} な の 。 {全部|ぜんぶ} {返|かえ}した とき より 、 {軽|かる}い {気|き} が する 。 || "Paid in part." …Funny. It feels lighter than paying in full ever did.
comp: {残|のこ}り {十九回|じゅうきゅうかい} 。 {毎年|まいとし} {秋|あき} に 、 {灰実|はいみ} に {来|く}る {理由|りゆう} が できた わ 。 || Nineteen to go. Now I've a reason to come to Cinder Orchard every autumn.

@scene co.b_suzu5
comp: ね 、 $name 。 {帳簿|ちょうぼ} の {新|あたら}しい {頁|ページ} に 、 あなた の {名前|なまえ} を {書|か}いた の 。 {何|なに} を {借|か}りた か は …… {内緒|ないしょ} 。 || Hey, $name. I've written your name on a new page in my book. What I owe you is… a secret.
comp[laugh]: {返|かえ}す {時|とき} に {教|おし}える わ 。 {返|かえ}せる か どう か は 、 {分|わ}から ない けど ね 。 || I'll tell you when I pay it back. Whether I ever can is another matter.
`, 'ch3/banter');
