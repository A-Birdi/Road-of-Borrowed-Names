/* Suzu's Kansai-ben: Ashihara Shinden, the new settlement (expansion P15f). Format and rules: src/lang/85_dialect.js,
 * docs/dialect/suzu_kansai.md. "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ settle/as.first [as.first]
= {名前|なまえ} だけ の {村|むら} ？ {幕|まく} が {開|あ}く {前|まえ} の {舞台|ぶたい} みたい ね 。 わくわく する わ 。 || A village with only a name? Like a stage before the curtain goes up. How exciting.
> {名前|なまえ} だけ の {村|むら} ？ {幕|まく} が {開|あ}く {前|まえ} の {舞台|ぶたい} みたい や な 。 わくわく する わ 。 || A village with only a name? Like a stage before the curtain goes up. How exciting.
@ settle/as.streets_done [as.streets_done]
= {第|だい}{一幕|いちまく} 、 {無事|ぶじ} {終演|しゅうえん} 。 {次|つぎ} は {台本|だいほん} 、 つまり {知|し}らせ ね 。 || Act one, done. Next, the script: the notices.
> {第|だい}{一幕|いちまく} 、 {無事|ぶじ} {終演|しゅうえん} や 。 {次|つぎ} は {台本|だいほん} 、 つまり {知|し}らせ や な 。 || Act one, done. Next, the script: the notices.
@ settle/as.festival [as.festival]
= {客|きゃく} も {役者|やくしゃ} も {同|おな}じ {人|ひと} 。 こういう {舞台|ぶたい} が 、 {一番|いちばん} {好|す}き かも しれない わ 。 || The audience and the cast are the same people. I think I might like this kind of stage best of all.
> {客|きゃく} も {役者|やくしゃ} も {同|おな}じ {人|ひと} や 。 こういう {舞台|ぶたい} が 、 {一番|いちばん} {好|す}き かも しれへん わ 。 || The audience and the cast are the same people. I think I might like this kind of stage best of all.
`, 'settle');
