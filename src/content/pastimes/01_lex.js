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
