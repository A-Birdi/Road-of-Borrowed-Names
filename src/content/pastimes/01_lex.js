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
// karuta: the proverbs' words (src/content/pastimes/40_karuta.js)
RB.lex.add(RB.lex.parseTable(`
かるた||n|I|karuta, Japanese playing cards (from the Portuguese carta)
いろはかるた||n|A|iroha karuta: a card game of proverbs, one for each kana of the iroha poem
江戸|えど|name|I|Edo (the old name of Tokyo)
京|きょう|name|A|the capital (Kyoto, in old usage)
論|ろん|n|A|argument, theory
憎まれっ子|にくまれっこ|n|A|a child nobody likes; a disliked person
骨折り損|ほねおりぞん|n|A|wasted effort (literally "a loss of broken bones")
くたびれ儲け|くたびれもうけ|n|A|a profit of nothing but tiredness
長談義|ながだんぎ|n|A|a long-winded talk
冷や水|ひやみず|n|A|cold water
塵|ちり|n|A|dust
律儀者|りちぎもの|n|A|an honest, dutiful person
子沢山|こだくさん|n|A|having many children
盗人|ぬすびと|n|A|thief (an older word)
瑠璃|るり|n|A|lapis lazuli
玻璃|はり|n|A|crystal, glass (an old word)
葦|よし|n|A|reed (another reading of あし)
髄|ずい|n|A|pith, the hollow core of a stem
月夜|つきよ|n|I|a moonlit night
釜|かま|n|I|an iron pot, a kettle
泣きっ面|なきっつら|n|A|a crying face
苦|く|n|A|hardship, suffering
道理|どうり|n|I|reason, what is right
喉元|のどもと|n|A|the throat
鬼|おに|n|I|ogre, demon (oni)
金棒|かなぼう|n|A|an iron club
安物買い|やすものがい|n|A|buying cheap things
銭失い|ぜにうしない|n|A|losing money
得手|えて|n|A|one's strong point, what one does well
帆|ほ|n|I|sail
揚げる|あげる|v1|I|to raise, to hoist (a sail, a flag)
尻|しり|n|I|bottom, behind
極楽|ごくらく|n|I|paradise
地獄|じごく|n|I|hell
大敵|たいてき|n|A|a great enemy
こぶ||n|I|a lump, a bump
仏|ほとけ|n|I|a Buddha; one at peace
門前|もんぜん|n|A|in front of the gate (of a temple)
小僧|こぞう|n|A|a boy apprentice (at a temple or a shop)
経|きょう|n|A|sutra, a Buddhist scripture
事|こと|n|E|thing, matter
急く|せく|v5k|A|to hurry, to be impatient
仕損じる|しそんじる|v1|A|to make a mess of, to fail at
`), 'pastimes');
// the festival's games (src/content/pastimes/50_festival.js)
RB.lex.add(RB.lex.parseTable(`
花火|はなび|n|E|fireworks
浴衣|ゆかた|n|I|yukata, a light summer kimono
金魚|きんぎょ|n|E|goldfish
ヨーヨー釣り|ヨーヨーつり|n|A|water-balloon fishing (a festival stall game)
ヨーヨー||n|I|a water balloon on a rubber band (a festival toy); a yo-yo
計る|はかる|v5r|I|to measure, to time
ヒント||n|I|a hint
扇ぐ|あおぐ|v5g|I|to fan (oneself, a fire)
三匹|さんびき|n|E|three (small animals, fish)
だるま||n|I|a daruma doll (red, round, rights itself when knocked over)
みに||exp|E|(go) to see (見に: the purpose of going)
`), 'pastimes');
