/* Returns (expansion P15g): lexicon for the places you go back to after the story. Format: w|r|pos|lv|meaning|note
 * (docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.lex.add(RB.lex.parseTable(`
# ---- people (example names on a leaf-letter) ------------------------------------------------------------------------------
花子|はなこ|name|E|Hanako (a woman's name; the stock example name in Japanese, like "Jane")
はなこ|はなこ|name|F|Hanako (written in kana)
太郎|たろう|name|E|Tarō (a man's name; the stock example name in Japanese, like "John")
# ---- the towns ------------------------------------------------------------------------------------------------------------
米屋|こめや|n|E|a rice shop; a rice-seller
読者|どくしゃ|n|I|a reader (of a book, a newspaper)
廃止|はいし|n|A|abolition; doing away with (a rule, a custom)
輸入|ゆにゅう|n|I|importing; imports
健全|けんぜん|adj-na|A|healthy, sound (of a body, a mind, a town)
# ---- the companions' beats ------------------------------------------------------------------------------------------------
即席|そくせき|n|I|improvised, made on the spot (a stage, a meal)
二人分|ふたりぶん|n|I|enough for two, two people's share
用法|ようほう|n|A|directions for use (on a medicine)
`));
