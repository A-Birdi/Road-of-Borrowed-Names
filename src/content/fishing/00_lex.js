/* Lexicon for A Quiet Cast (fishing): the nine fish names, the waterside
 * words of the eighteen situations, the remarks and the stations. Format:
 * w|r|pos|lv|meaning|note (docs/CONTENT.md). Fish names are given with a
 * common English name; their natural-history captions are pending a source
 * check (docs/practice/fishing.md). */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  RB.lex.add(RB.lex.parseTable(`
# the nine fish (katakana is the usual way to write living species)
オイカワ||n|I|oikawa (a river fish; pale chub)
カワムツ||n|I|kawamutsu (a river fish; dark chub)
ウグイ||n|I|ugui (a river fish; Japanese dace)
ギンブナ||n|I|ginbuna (a still-water fish; silver crucian carp)
コイ||n|E|koi (common carp)
モツゴ||n|I|motsugo (a small still-water fish; stone moroko)
マハゼ||n|I|mahaze (a harbour fish; yellowfin goby)
ボラ||n|I|bora (a harbour fish; flathead grey mullet)
マアジ||n|I|maaji (a sea fish; Japanese jack mackerel)
# by the water
川岸|かわぎし|n|E|riverbank
波止場|はとば|n|I|quay, wharf
岸壁|がんぺき|n|A|quay wall
下流|かりゅう|n|I|downstream, lower reaches
木陰|こかげ|n|I|the shade of a tree
きわ||n|I|edge, brink (際)
波紋|はもん|n|I|ripple
たるみ||n|I|slack (in a line or rope)
たるむ||v5m|I|to slacken, to sag
緩い|ゆるい|adj-i|I|loose; gentle (of a current or slope)
緩める|ゆるめる|v1|I|to loosen, to slacken (a line)
引っかかる|ひっかかる|v5r|I|to get caught (on something), to snag
食いつく|くいつく|v5k|I|to bite (of a fish taking bait); to bite into
巻きつく|まきつく|v5k|I|to wind round, to coil round
巻く|まく|v5k|E|to wind, to roll (糸を巻く: to wind a line in)
あばれる||v1|I|to thrash about
増す|ます|v5s|I|to increase, to grow
すばやい||adj-i|I|quick, nimble
二回|にかい|n|E|twice, two times
一回|いっかい|n|E|once, one time
筋|すじ|n|A|line, streak; a lane (of current)
観察|かんさつ|vs|I|observation, observing
制限|せいげん|vs|I|limit, restriction
辺|へん|n|I|area, vicinity (この辺: around here)
見開き|みひらき|n|I|two-page spread (of a book)
帳面|ちょうめん|n|I|notebook, ledger
結び目|むすびめ|n|I|knot
遠く|とおく|n|E|far away, a long way off
一気|いっき|n|I|at one go (一気に: all at once)
新顔|しんがお|n|I|newcomer, a new face
届け先|とどけさき|n|I|delivery address, destination
清書|せいしょ|vs|A|fair copy
区切り|くぎり|n|I|a break, a stopping point
表記|ひょうき|vs|A|way of writing, notation
# the stage (Suzu)
舞台|ぶたい|n|E|stage
芝居|しばい|n|I|play, performance
楽屋|がくや|n|A|dressing room (backstage)
主役|しゅやく|n|I|leading role, the star
登場|とうじょう|vs|I|entrance (on stage), appearance
新人|しんじん|n|I|newcomer
初舞台|はつぶたい|n|A|debut, first stage appearance
幕|まく|n|I|curtain; act (of a play)
演出|えんしゅつ|vs|A|direction, staging (of a play)
終演|しゅうえん|vs|A|end of a performance
三幕|さんまく|n|A|three acts (of a play)
大団円|だいだんえん|n|A|grand finale, happy ending
出演者|しゅつえんしゃ|n|A|performer, member of the cast
集合|しゅうごう|vs|I|gathering, assembly
しー||int|E|shh (asking for quiet)
# the interface
ペース||n|E|pace
回数|かいすう|n|I|number of times
額|がく|n|I|picture frame
`), 'fishing');
})();
