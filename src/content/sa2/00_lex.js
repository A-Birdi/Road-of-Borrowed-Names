/* The last chapter in a twelve-chapter journey (expansion P14): the words its new lines use, and the look-alike
 * misreadings of the companions' names in the name-calling step (not words). Format: w|r|pos|lv|meaning|note. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.lex.add(RB.lex.parseTable(`
転送先|てんそうさき|n|A|a forwarding address
半歩|はんぽ|n|I|half a step
キス|キス|vs|I|a kiss
宛先|あてさき|n|I|the address (where a letter is going)
欄|らん|n|I|a space or box on a form (for writing in)
# ---- look-alike misreadings in the name-calling step (not words) ---------------------------------------------------
メオ|メオ|exp|F|(not a word: ナオ misread, メ for ナ)
ナホ|ナホ|exp|F|(not a word: ナオ misread, ホ for オ)
ナヲ|ナヲ|exp|I|(not a word: ナオ written with ヲ)
ノオ|ノオ|exp|I|(not a word: ナオ misread, ノ for ナ)
シオ|シオ|exp|F|(not a word as a name here: ミオ misread, シ for ミ)
ミヲ|ミヲ|exp|F|(not a word: ミオ written with ヲ)
ミォ|ミォ|exp|I|(not a word: ミオ with a small ォ)
ニオ|ニオ|exp|I|(not a word: ミオ misread, ニ for ミ)
レソ|レソ|exp|F|(not a word: レン misread, ソ for ン)
しン|しン|exp|F|(not a word: レン misread, hiragana し for レ)
ソン|ソン|exp|I|(not a word: レン misread, ソ for レ)
レシ|レシ|exp|I|(not a word: レン misread, シ for ン)
ヌズ|ヌズ|exp|F|(not a word: スズ misread, ヌ for ス)
スヅ|スヅ|exp|F|(not a word: スズ written with ヅ)
ヌス|ヌス|exp|I|(not a word: スズ misread)
ズス|ズス|exp|I|(not a word: スズ with its sounds swapped)
`));
