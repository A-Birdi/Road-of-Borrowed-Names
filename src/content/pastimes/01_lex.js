/* Words of the pastimes (expansion P06, C12): shogi's pieces, its handicaps and its few terms of art, each with the
 * sense a player meets at the board. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.lex.add(RB.lex.parseTable(`
香車|きょうしゃ|n|A|lance (a shogi piece)
桂馬|けいま|n|A|knight (a shogi piece)
銀|ぎん|n|E|silver; a silver general (a shogi piece)
角|かく|n|A|bishop (a shogi piece)
玉|ぎょく|n|A|king (a shogi piece)
飛車|ひしゃ|n|A|rook (a shogi piece)
斜め|ななめ|n|I|diagonal, slanting
龍|りゅう|n|A|dragon; a promoted rook in shogi
成銀|なりぎん|n|A|a promoted silver (in shogi)
成桂|なりけい|n|A|a promoted knight (in shogi)
成香|なりきょう|n|A|a promoted lance (in shogi)
成る|なる|v5r|A|to promote (a shogi piece)|The same word as なる (to become), written with this kanji for promotion.
不成|ならず|n|A|not promoting (leaving a shogi piece as it is)
一手詰め|いってづめ|n|A|mate in one (a shogi puzzle)
詰将棋|つめしょうぎ|n|A|a shogi mating puzzle
詰み|つみ|n|I|checkmate
詰む|つむ|v5m|A|to be checkmated (in shogi)
詰|つめ|n|A|mate (in shogi); short for 詰将棋, a mating puzzle
王手|おうて|n|A|check (in shogi: the king is attacked)
千日手|せんにちて|n|A|a draw by repetition (in shogi)
本将棋|ほんしょうぎ|n|A|shogi proper, the full game
五五将棋|ごごしょうぎ|n|A|mini-shogi, on a five-by-five board
平手|ひらて|n|A|an even game (in shogi: no handicap)
香落ち|きょうおち|n|A|a lance handicap (the stronger player plays without a lance)
角落ち|かくおち|n|A|a bishop handicap
飛車落ち|ひしゃおち|n|A|a rook handicap
二枚落ち|にまいおち|n|A|a two-piece handicap (no rook, no bishop)
`), 'pastimes');
RB.lex.add(RB.lex.parseTable(`
圭|けい|n|A|a jade tablet; in shogi, the face of a promoted knight (as a piece it is read なりけい)
杏|あんず|n|A|apricot; in shogi, the face of a promoted lance (as a piece it is read なりきょう)
`), 'pastimes');
RB.lex.add(RB.lex.parseTable(`
寂しがる|さびしがる|v5r|I|to feel lonely, to miss company
`), 'pastimes');
// hanafuda: the cards, the months' flowers and the sets
RB.lex.add(RB.lex.parseTable(`
花札|はなふだ|n|I|hanafuda, flower cards (a 48-card deck, four for each month)
札|ふだ|n|I|a card, a tag, a slip
こいこい||n|A|koi-koi (the hanafuda game; also the call to play on)
短冊|たんざく|n|I|a ribbon card (in hanafuda); a strip of paper for a poem
赤短|あかたん|n|A|the poem ribbons (in hanafuda: three red ribbons with poems)
青短|あおたん|n|A|the blue ribbons (in hanafuda)
タネ||n|A|animal cards (in hanafuda)
タン||n|A|ribbon cards (in hanafuda)
カス||n|A|plain cards (in hanafuda; literally "dregs")
五光|ごこう|n|A|five brights (a hanafuda set)
四光|しこう|n|A|four brights (a hanafuda set)
雨四光|あめしこう|n|A|rainy four brights (a hanafuda set with the rain card)
三光|さんこう|n|A|three brights (a hanafuda set)
猪鹿蝶|いのしかちょう|n|A|boar, deer and butterflies (a hanafuda set)
花見|はなみ|n|I|cherry-blossom viewing
月見|つきみ|n|I|moon viewing
一杯|いっぱい|n|E|a cupful, a drink; full
鶯|うぐいす|n|A|bush warbler (a songbird)
ほととぎす||n|A|lesser cuckoo (a bird of early summer)
八橋|やつはし|n|A|a plank bridge in a zigzag (the iris card's bridge)
猪|いのしし|n|I|wild boar
雁|かり|n|A|wild goose
盃|さかずき|n|A|sake cup
小野道風|おののみちかぜ|name|A|Ono no Michikaze (a calligrapher, the man with the umbrella on the willow card)
鳳凰|ほうおう|n|A|phoenix (the Chinese phoenix)
藤|ふじ|n|I|wisteria
菖蒲|あやめ|n|A|iris (the flower of May in hanafuda)
菖蒲|しょうぶ|n|A|sweet flag (the same kanji as あやめ, iris)
牡丹|ぼたん|n|A|peony
萩|はぎ|n|A|bush clover
芒|すすき|n|A|pampas grass (Japanese silver grass)
菊|きく|n|I|chrysanthemum
柳|やなぎ|n|I|willow
桐|きり|n|A|paulownia (a tree)
一月|いちがつ|n|F|January
二月|にがつ|n|F|February
三月|さんがつ|n|F|March
四月|しがつ|n|F|April
五月|ごがつ|n|F|May
六月|ろくがつ|n|F|June
七月|しちがつ|n|F|July
八月|はちがつ|n|F|August
九月|くがつ|n|F|September
十月|じゅうがつ|n|F|October
十一月|じゅういちがつ|n|F|November
十二月|じゅうにがつ|n|F|December
`), 'pastimes');
