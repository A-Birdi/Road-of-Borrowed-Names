/* Suzu's Kansai-ben: the old guardians (expansion P15e): Suzu's line as each guardian wakes. Format and rules:
 * src/lang/85_dialect.js, docs/dialect/suzu_kansai.md. "=" the standard line as authored (the key: its Japanese);
 * ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ guardians/gd.rw [gd.rw]
= {座長|ざちょう} の {声|こえ} ね 。 {昔|むかし} の 。 {稽古場|けいこば} を {思|おも}い{出|だ}す わ 。 || That's a company manager's voice. An old one. Takes me back to rehearsals.
> {座長|ざちょう} の {声|こえ} や な 。 {昔|むかし} の 。 {稽古場|けいこば} を {思|おも}い{出|だ}す わ 。 || That's a company manager's voice. An old one. Takes me back to rehearsals.
@ guardians/gd.sg [gd.sg]
= お{役所|やくしょ} の {芝居|しばい} は 、 {台詞|せりふ} が {長|なが}い の よ ね 。 || Office plays always have the longest speeches.
> お{役所|やくしょ} の {芝居|しばい} は 、 {台詞|せりふ} が {長|なが}い で 。 || Office plays always have the longest speeches.
@ guardians/gd.co [gd.co]
= {見|み}て 、 {炎|ほのお} が {人|ひと} の {形|かたち} に なって いく 。 {大道具|おおどうぐ} さん も びっくり ね 。 || Look, the flames are taking a person's shape. The stagehands would be amazed.
> {見|み}て 、 {炎|ほのお} が {人|ひと} の {形|かたち} に なって いく 。 {大道具|おおどうぐ} さん も びっくり や 。 || Look, the flames are taking a person's shape. The stagehands would be amazed.
@ guardians/gd.sb [gd.sb]
= {星|ほし} の {登場|とうじょう} 。 {照明|しょうめい} さん 、 {腕|うで} が いい わ ね 。 || A star's entrance. Whoever's on lights knows their job.
> {星|ほし} の {登場|とうじょう} や 。 {照明|しょうめい} さん 、 {腕|うで} が ええ な 。 || A star's entrance. Whoever's on lights knows their job.
@ guardians/gd.lf [gd.lf]
= {鐘|かね} の {音|おと} に {文句|もんく} ？ {私|わたし} は この {音|おと} 、 {好|す}き よ 。 || A complaint about the bell's note? I like this note.
> {鐘|かね} の {音|おと} に {文句|もんく} ？ うち は この {音|おと} 、 {好|す}き や で 。 || A complaint about the bell's note? I like this note.
@ guardians/gd.mb [gd.mb]
= {初演|しょえん} の {演出家|えんしゅつか} が 、 {再演|さいえん} に {文句|もんく} を {言|い}い に {来|き}た みたい ね 。 || Like the original director turning up to complain about the revival.
> {初演|しょえん} の {演出家|えんしゅつか} が 、 {再演|さいえん} に {文句|もんく} を {言|い}い に {来|き}た みたい や な 。 || Like the original director turning up to complain about the revival.
@ guardians/gd.cr [gd.cr]
= {雲|くも} の {中|なか} から {登場|とうじょう} なんて 、 {大物|おおもの} の {出|で}{方|かた} ね 。 || Entering out of a cloud. That's how the big names make an entrance.
> {雲|くも} の {中|なか} から {登場|とうじょう} なんて 、 {大物|おおもの} の {出|で}{方|かた} や な 。 || Entering out of a cloud. That's how the big names make an entrance.
@ guardians/gd.yn [gd.yn]
= {親子|おやこ} の {再会|さいかい} の {場面|ばめん} ね 。 {泣|な}かせる わ 。 || A parent-and-child reunion scene. A real tear-jerker.
> {親子|おやこ} の {再会|さいかい} の {場面|ばめん} や な 。 {泣|な}かせる わ 。 || A parent-and-child reunion scene. A real tear-jerker.
@ guardians/gd.ko [gd.ko]
= {楽屋|がくや} の {手紙|てがみ} {入|い}れ を {思|おも}い{出|だ}す わ 。 {届|とど}かなかった {手紙|てがみ} も 、 {入|はい}って いた 。 || It reminds me of the letter rack backstage. There were letters in it that never got delivered.
> {楽屋|がくや} の {手紙|てがみ} {入|い}れ を {思|おも}い{出|だ}す わ 。 {届|とど}かなかった {手紙|てがみ} も 、 {入|はい}って いた な 。 || It reminds me of the letter rack backstage. There were letters in it that never got delivered.
`, 'guardians');
