/* Suzu's Kansai-ben: the Flood Cellars (expansion P07 pilot) and the Atlas's commission board.
 * Format and rules: src/lang/85_dialect.js, docs/dialect/suzu_kansai.md.
 * "=" the standard line as authored (the key: its Japanese); ">" the Kansai version. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.dialect.add('kansai', `
@ expeditions/20_scenes [xp.cellars_yasu]
= やった こと と 、 やって ない こと 。 {帳簿|ちょうぼ} と {同|おな}じ だ ね 。 {締|し}め は {私|わたし} たち か 。 || What's been done and what hasn't: just like a ledger. And we close the books, do we?
> やった こと と 、 やって へん こと 。 {帳簿|ちょうぼ} と {同|おんな}じ や な 。 {締|し}め は うちら か 。 || What's been done and what ain't: same as a ledger. And we close the books, do we?
@ expeditions/20_scenes [xp.cellars_first]
= {貼|は}り{紙|がみ} が {先|さき} だ よ 。 {前|まえ} の {人|ひと} の {仕事|しごと} を {二回|にかい} やる の は 、 {損|そん} だ から ね 。 || Notice first. Doing the last lot's work twice is a loss on the books.
> {貼|は}り{紙|がみ} が {先|さき} や で 。 {前|まえ} の {人|ひと} の {仕事|しごと} を {二回|にかい} やる の は 、 {損|そん} や から な 。 || Notice first. Doin' the last lot's work twice is a loss on the books.
@ expeditions/20_scenes [xp.cellars_board]
= 「{上|あ}げて あります」 。 {済|す}み の {判|はん} みたい な もの だ よ 。 {誰|だれ} か が やって 、 その まま に して ある 。 || "Has been put up." Like a "done" stamp: someone did it, and it's been left that way.
> 「{上|あ}げて あります」 。 {済|す}み の {判|はん} みたい な もん や で 。 {誰|だれ} か が やって 、 その まま に して ある ねん 。 || "Has been put up." Like a "done" stamp: somebody did it, and it's been left that way.
= {貸|か}し {借|か}り {無|な}し 。 {残|のこ}り は {下|した} の {水門|すいもん} {一|ひと}つ 。 || All square. One sluice below left on the books.
> {貸|か}し {借|か}り {無|な}し や 。 {残|のこ}り は {下|した} の {水門|すいもん} {一|ひと}つ だけ や な 。 || All square. Just the one sluice below left on the books.
@ expeditions/20_scenes [xp.cellars_grate]
= {向|む}こう {側|がわ} から なら 、 {開|あ}けられる かも 。 || Maybe from the other side.
> {向|む}こう {側|がわ} から やったら 、 {開|あ}けられる かも しれん な 。 || From the other side, maybe.
@ expeditions/20_scenes [xp.cellars_sluice]
= {水|みず} の {勘定|かんじょう} 、 {合|あ}った よ 。 || The water's accounts balance.
> {水|みず} の {勘定|かんじょう} 、 ぴったり {合|あ}った で 。 || The water's accounts balance to the drop.
@ expeditions/20_scenes [xp.cellars_ladder]
= {近道|ちかみち} 、 {開通|かいつう} 。 {幕間|まくあい} が {短|みじか}く なる の は 、 いい こと だ よ 。 || Shortcut open. Shorter intervals are always welcome.
> {近道|ちかみち} 、 {開通|かいつう} や 。 {幕間|まくあい} が {短|みじか}く なる の は 、 ええ こと や で 。 || Shortcut's open. Shorter intervals, that's always good.
@ expeditions/20_scenes [xp.cellars_outflow]
= {締|し}め 、 {完了|かんりょう} 。 {帳簿|ちょうぼ} が {合|あ}う と 、 {気持|きも}ち が いい ね 。 || Books closed. Nothing feels better than accounts that balance.
> {締|し}め 、 {完了|かんりょう} や 。 {帳簿|ちょうぼ} が {合|あ}う と 、 {気持|きも}ち ええ な 。 || Books closed. Nothin' beats accounts that balance.
@ atlas/80_commissions [atlas.board.go]
= {台本|だいほん} {付|つ}き の {舞台|ぶたい} だ ね 。 さあ 、 {開演|かいえん} ！ || A stage with a script this time. Curtain up!
> {台本|だいほん} {付|つ}き の {舞台|ぶたい} や な 。 さあ 、 {開演|かいえん} や ！ || A stage with a script this time. Curtain's up!
`, 'dialect/kansai_92_expeditions');
