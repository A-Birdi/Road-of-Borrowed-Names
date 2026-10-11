/* Suzu's Kansai-ben: the returns after the story (expansion P15g). Format and rules: src/lang/85_dialect.js,
 * docs/dialect/suzu_kansai.md. "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ returns/rt.grove_arch [rt.grove_arch]
= {森|もり} が 、 {育|そだ}った ん だ ね 。 || The grove has grown.
> {森|もり} が 、 {育|そだ}った ん や な 。 || The grove has grown.
@ returns/rt.grove_tree [rt.grove_tree]
= {出番|でばん} を {待|ま}って いる {役者|やくしゃ} の {楽屋|がくや} みたい ね 。 || Like a dressing room full of actors waiting for their cue.
> {出番|でばん} を {待|ま}ってる {役者|やくしゃ} の {楽屋|がくや} みたい や な 。 || Like a dressing room full of actors waiting for their cue.
@ returns/rt.fest_seat [rt.fest_seat]
= …… {毎年|まいとし} 、 {一番|いちばん} いい {席|せき} ね 。 || …The best seat in the house, every year.
> …… {毎年|まいとし} 、 {一番|いちばん} ええ {席|せき} や な 。 || …The best seat in the house, every year.
@ returns/rt.fest_suzu [rt.fest_suzu]
= {今夜|こんや} は 、 {客|きゃく} の {側|がわ} よ 。 {一年|いちねん} に {一度|いちど} くらい 、 いい でしょう ？ || Tonight I'm in the audience. Once a year, that's allowed, isn't it?
> {今夜|こんや} は 、 {客|きゃく} の {側|がわ} や で 。 {一年|いちねん} に {一度|いちど} くらい 、 ええ やろ ？ || Tonight I'm in the audience. Once a year, that's allowed, isn't it?
@ returns/rt.sb_board [rt.sb_board]
= {一人|ひとり} で {待|ま}つ {灯|ひ} じゃ なく なった ん だ ね 。 || It isn't a lamp that waits alone any more.
> {一人|ひとり} で {待|ま}つ {灯|ひ} や なく なった ん や な 。 || It isn't a lamp that waits alone any more.
`, 'returns');

RB.dialect.add('kansai', `
@ returns/rt.troupe [rt.troupe]
= …… {相方|あいかた} 、 {出番|でばん} よ 。 || …Partner, you're on.
> …… {相方|あいかた} 、 {出番|でばん} や で 。 || …Partner, you're on.
= はい 、 どうも どうも ！ わたし 、 {帳簿|ちょうぼ} は {完璧|かんぺき} です 。 {毎月|まいつき} 、 ぴったり ゼロ 。 …… {財布|さいふ} も ゼロ 。 || Hello, hello! My books are perfect. Every month, exactly zero. …So's my purse.
> はい 、 どうも どうも ！ うち 、 {帳簿|ちょうぼ} は {完璧|かんぺき} や で 。 {毎月|まいつき} 、 ぴったり ゼロ 。 …… {財布|さいふ} も ゼロ 。 || Hello, hello! My books are perfect. Every month, exactly zero. …So's my purse.
= この {前|まえ} 、 {湯|ゆ}ノ{谷|たに} で 、 {毎晩|まいばん} {温泉|おんせん} に {入|はい}りました 。 …… {服|ふく} を {着|き}た まま 。 || The other day in Steamhollow, I got into the hot spring every night. …With my clothes on.
> この {前|まえ} 、 {湯|ゆ}ノ{谷|たに} で 、 {毎晩|まいばん} {温泉|おんせん} に {入|はい}った ねん 。 …… {服|ふく} を {着|き}た まま 。 || The other day in Steamhollow, I got into the hot spring every night. …With my clothes on.
= {昨日|きのう} は ね 、 {雨|あめ} が {降|ふ}って きた から 、 {口|くち} を {開|あ}けて 、 {上|うえ} を {向|む}いて いました 。 {甘|あま}い の が {降|ふ}る と {思|おも}って 。 || Yesterday the rain came, so I stood with my mouth open, looking up. I thought something sweet would fall.
> {昨日|きのう} は な 、 {雨|あめ} が {降|ふ}って きた から 、 {口|くち} を {開|あ}けて 、 {上|うえ} を {向|む}いてた ねん 。 {甘|あま}い の が {降|ふ}る と {思|おも}って 。 || Yesterday the rain came, so I stood with my mouth open, looking up. I thought something sweet would fall.
= でしょう ？ {返|かえ}さない わ よ 。 || Isn't it? I'm not giving this one back.
> せやろ ？ {返|かえ}さへん で 。 || Isn't it? I'm not giving this one back.
= …… {次|つぎ} の {幕|まく} 、 {楽|たの}しみ ね 。 || …I'm looking forward to the next act.
> …… {次|つぎ} の {幕|まく} 、 {楽|たの}しみ や な 。 || …I'm looking forward to the next act.
`, 'returns_c');
