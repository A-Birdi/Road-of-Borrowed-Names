/* Lexicon for field discovery: the Mill Road repair, the field puzzles F1-F6,
 * field weaving and the Roadside Keepsakes. Format: w|r|pos|lv|meaning|note
 * (see docs/CONTENT.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
# the Mill Road
茎|くき|n|I|stalk, stem
根元|ねもと|n|I|root, base (of a plant or post)
# field weaving (what a response does where nothing answers to it)
重み|おもみ|n|I|weight, heaviness
焦がす|こがす|v5s|I|to scorch, to burn (the surface of)
# F1: the slip screen by the river warehouse
衝立|ついたて|n|I|standing screen, partition
倉|くら|n|I|storehouse, warehouse
茶葉|ちゃば|n|I|tea leaves
平ら|たいら|adj-na|I|flat, level
留め具|とめぐ|n|A|clamp, fastener
ねじ留め|ねじどめ|n|A|screw clamp; fastening with a screw
ねじ||n|I|screw
締める|しめる|v1|I|to tighten, to fasten
自体|じたい|n|I|itself (the thing itself)
放す|はなす|v5s|E|to let go (of), to release
枠|わく|n|I|frame
玉|たま|n|E|ball, bead (玉になる: to bead up)
濡らす|ぬらす|v5s|I|to wet
伝う|つたう|v5u|I|to run along, to go along (e.g. water down a surface)
絡む|からむ|v5m|I|to wind round, to get tangled
引っかける|ひっかける|v1|I|to catch (on something), to snag
ばたばた||adv|I|flapping, clattering
`), 'discovery');
})();
