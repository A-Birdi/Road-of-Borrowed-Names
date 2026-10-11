/* Suzu's Kansai-ben: the last chapter in a twelve-chapter journey (expansion P14): the hushed voice at the gate, her
 * arc's ending (the play's opening night) and the ending's romance moment. Format and rules: src/lang/85_dialect.js,
 * docs/dialect/suzu_kansai.md. "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ sa2/sa2.hushed [sa2.hushed]
= …… || …
> =
@ sa2/sa2.hushed [sa2.hushed]
= …… {出|で}た ！ {声|こえ} 、 {出|で}た ！ …… もう 、 {台詞|せりふ} が {飛|と}んだ {役者|やくしゃ} の {気分|きぶん} 。 {二度|にど} と ごめん よ 。 || …It's back! My voice, it's back! …That felt like an actor whose lines have gone. Never again, thank you.
> …… {出|で}た ！ {声|こえ} 、 {出|で}た ！ …… もう 、 {台詞|せりふ} が {飛|と}んだ {役者|やくしゃ} の {気分|きぶん} や 。 {二度|にど} と ごめん や で 。 || …It's back! My voice, it's back! …That felt like an actor whose lines have gone. Never again, thank you.
@ sa2/sa2.end_suzu [sa2.end_suzu]
= コウメ から {手紙|てがみ} 。 {初日|しょにち} は {八百橋|やおばし} の {芝居町|しばいまち} で やれ って 。 {一座|いちざ} が 、 {客席|きゃくせき} を {埋|う}めて くれる って 。 || A letter from Koume. She says to open in Manybridge's Playhouse Row. The troupe will fill the seats.
> コウメ から {手紙|てがみ} や 。 {初日|しょにち} は {八百橋|やおばし} の {芝居町|しばいまち} で やれ って 。 {一座|いちざ} が 、 {客席|きゃくせき} を {埋|う}めて くれる ん やて 。 || A letter from Koume. She says to open in Manybridge's Playhouse Row. The troupe will fill the seats.
@ sa2/sa2.end_suzu [sa2.end_suzu]
= {初日|しょにち} は 、 {八百橋|やおばし} の {芝居町|しばいまち} が いい な 。 あそこ の {客|きゃく} は 、 {笑|わら}い{方|かた} を {知|し}ってる 。 || Opening night: Manybridge's Playhouse Row, I think. The audience there knows how to laugh.
> {初日|しょにち} は 、 {八百橋|やおばし} の {芝居町|しばいまち} が ええ な 。 あそこ の {客|きゃく} は 、 {笑|わら}い{方|かた} を {知|し}ってる ねん 。 || Opening night: Manybridge's Playhouse Row, I think. The audience there knows how to laugh.
@ sa2/sa2.end_suzu [sa2.end_suzu]
= もちろん 、 {相方|あいかた} は あなた よ 。 {台詞|せりふ} は 、 まだ {一行|いちぎょう} も ない けど 。 || Your part's my partner, of course. Not that you've got a single line yet.
> もちろん 、 {相方|あいかた} は あんた や で 。 {台詞|せりふ} は 、 まだ {一行|いちぎょう} も あらへん けど 。 || Your part's my partner, of course. Not that you've got a single line yet.
@ sa2/sa2.romance [sa2.romance]
= …… うん 。 {台詞|せりふ} なし で いい 。 {一番|いちばん} {効|き}く {場面|ばめん} だ から 。 || …Mm. No lines needed. It's the scene that lands hardest.
> …… うん 。 {台詞|せりふ} なし で ええ 。 {一番|いちばん} {効|き}く {場面|ばめん} や から 。 || …Mm. No lines needed. It's the scene that lands hardest.
@ sa2/sa2.romance [sa2.romance]
= …… うん 。 {今|いま} の は 、 {台本|だいほん} に {書|か}かない 。 {二人|ふたり} だけ の {場面|ばめん} 。 || …Mm. That one's not going in the script. A scene just for the two of us.
> …… うん 。 {今|いま} の は 、 {台本|だいほん} に {書|か}かへん 。 {二人|ふたり} だけ の {場面|ばめん} や 。 || …Mm. That one's not going in the script. A scene just for the two of us.
@ sa2/sa2.romance [sa2.romance]
= {相方|あいかた} は {並|なら}んで {立|た}つ もの よ 。 {舞台|ぶたい} でも 、 {道|みち} でも 。 …… {最後|さいご} まで 、 {一緒|いっしょ} に ね 。 || Partners stand side by side. On stage, and on the road. …All the way, together.
> {相方|あいかた} は {並|なら}んで {立|た}つ もん や 。 {舞台|ぶたい} でも 、 {道|みち} でも 。 …… {最後|さいご} まで 、 {一緒|いっしょ} に な 。 || Partners stand side by side. On stage, and on the road. …All the way, together.
`, 'sa2');
