/* Suzu's Kansai-ben: A Licence for the Open Sea (expansion P11b): Ōmi's deal, Fuku's boat, the yard, the trial and
 * the examination. Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ sea/licence [sea.omi_deal]
= {船|ふね} の {旅|たび} ね 。 {一座|いちざ} の {巡業|じゅんぎょう} みたい 。 {乗|の}った わ 。 || A journey by boat. Like a troupe on tour. Count me in.
> {船|ふね} の {旅|たび} か 。 {一座|いちざ} の {巡業|じゅんぎょう} みたい や な 。 {乗|の}った で 。 || A journey by boat. Like a troupe on tour. Count me in.
@ sea/licence [sea.fuku_hull]
= {二代目|にだいめ} を {襲名|しゅうめい} する よう な もの ね 。 {恥|は}ずかしく ない {舞台|ぶたい} に する わ 。 || Like taking on a stage name from the one before. We'll do her proud.
> {二代目|にだいめ} を {襲名|しゅうめい} する よう な もん や な 。 {恥|は}ずかしく ない {舞台|ぶたい} に する で 。 || Like taking on a stage name from the one before. We'll do her proud.
@ sea/licence [sea.kajiro_first]
= {小道具|こどうぐ} が {別|べつ} の {小屋|こや} に {届|とど}く の と {同|おな}じ ね 。 {探|さが}せば ある わ 。 || Like props delivered to the wrong theatre. Look, and they'll turn up.
> {小道具|こどうぐ} が {別|べつ} の {小屋|こや} に {届|とど}く の と {同|おな}じ や な 。 {探|さが}せば ある で 。 || Like props delivered to the wrong theatre. Look, and they'll turn up.
@ sea/licence [sea.kajiro_paint]
= {看板|かんばん} が {上|あ}がった わ ね 。 {初日|しょにち} は いつ ？ || The sign's up. When's opening night?
> {看板|かんばん} が {上|あ}がった な 。 {初日|しょにち} は いつ や ？ || The sign's up. When's opening night?
@ sea/licence [sea.nui_sail]
= {衣装|いしょう}{方|かた} に {欲|ほ}しい {腕|うで} ね 。 || I'd want hands like that in the wardrobe department.
> {衣装|いしょう}{方|かた} に {欲|ほ}しい {腕|うで} や な 。 || I'd want hands like that in the wardrobe department.
@ sea/licence [sea.arrive_saltglass]
= {初舞台|はつぶたい} に して は 、 {上出来|じょうでき} じゃない ？ || Not bad for a debut, was it?
> {初舞台|はつぶたい} に して は 、 {上出来|じょうでき} ちゃう ？ || Not bad for a debut, was it?
@ sea/licence [sea.omi_licence]
= （{役|やく} に {入|はい}った わ ね 。 こっち も {合|あ}わせ ない と 。） || (She's got into character. We'd better play along.)
> （{役|やく} に {入|はい}った な 。 こっち も {合|あ}わせな あかん 。） || (She's got into character. We'd better play along.)
= {地図|ちず} に ない {島|しま} 。 {芝居|しばい} の {筋|すじ} なら 、 {次|つぎ} の {幕|まく} は そこ ね 。 || An island that's on no map. If this were a play, that's where the next act would be.
> {地図|ちず} に ない {島|しま} か 。 {芝居|しばい} の {筋|すじ} やったら 、 {次|つぎ} の {幕|まく} は そこ や な 。 || An island that's on no map. If this were a play, that's where the next act would be.
@ sea/ports [sz.first]
= {舞台|ぶたい} は {小|ちい}さい けど 、 {役者|やくしゃ} は {揃|そろ}ってる わ ね 。 || A small stage, but the whole cast is here.
> {舞台|ぶたい} は {小|ちい}さい けど 、 {役者|やくしゃ} は {揃|そろ}ってる な 。 || A small stage, but the whole cast is here.
@ sea/ports [sz.isaku_leaves]
= {台本|だいほん} の {切|き}れ{端|はし} みたい ね 。 {続|つづ}き は 、 {西|にし} の {島|しま} に ある の かしら 。 || Like scraps of a script. Is the rest of it on the island out west?
> {台本|だいほん} の {切|き}れ{端|はし} みたい や な 。 {続|つづ}き は 、 {西|にし} の {島|しま} に ある ん やろ か 。 || Like scraps of a script. Is the rest of it on the island out west?
@ sea/ports [sz.school_ask]
= {教壇|きょうだん} も {舞台|ぶたい} の {一|ひと}つ よ 。 {声|こえ} を {張|は}って ね 。 || A teacher's platform is a kind of stage. Project your voice.
> {教壇|きょうだん} も {舞台|ぶたい} の {一|ひと}つ や で 。 {声|こえ} を {張|は}って な 。 || A teacher's platform is a kind of stage. Project your voice.
@ sea/ports [sz.school_lesson]
= {千秋楽|せんしゅうらく} の {花|はな} より 、 {嬉|うれ}しい {贈|おく}り{物|もの} ね 。 || Better than flowers on closing night.
> {千秋楽|せんしゅうらく} の {花|はな} より 、 {嬉|うれ}しい {贈|おく}り{物|もの} や な 。 || Better than flowers on closing night.
@ sea/ports [el.first]
= {幕|まく} が {下|お}りた {後|あと} の {舞台|ぶたい} を {掃|は}く {人|ひと} ね 。 {次|つぎ} の {幕|まく} を 、 {待|ま}ってる の かしら 。 || Someone sweeping the stage after the curtain's come down. Is he waiting for the next act?
> {幕|まく} が {下|お}りた {後|あと} の {舞台|ぶたい} を {掃|は}く {人|ひと} や な 。 {次|つぎ} の {幕|まく} を 、 {待|ま}ってる ん やろ か 。 || Someone sweeping the stage after the curtain's come down. Is he waiting for the next act?
@ sea/ports [el.genroku_first]
= {小屋|こや} を {建|た}て{直|なお}す {時|とき} は 、 {古|ふる}い {座長|ざちょう} の {話|はなし} から {聞|き}く もの よ 。 || When you rebuild a theatre, you start by listening to the old company head.
> {小屋|こや} を {建|た}て{直|なお}す {時|とき} は 、 {古|ふる}い {座長|ざちょう} の {話|はなし} から {聞|き}く もん や で 。 || When you rebuild a theatre, you start by listening to the old company head.
@ sea/ports [el.genroku_bell]
= {柝|き} の {音|おと} みたい 。 {幕|まく} が {開|あ}く {合図|あいず} ね 。 || Like the clappers before a show. That's the curtain going up.
> {柝|き} の {音|おと} みたい や 。 {幕|まく} が {開|あ}く {合図|あいず} や な 。 || Like the clappers before a show. That's the curtain going up.
`);
