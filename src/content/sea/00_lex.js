/* The sea's lexicon (expansion P11): the boat and its parts, sailing, the weather, the ports' and the voyage's words.
 * Format: w|r|pos|lv|meaning|note (docs/CONTENT.md). Fictional names are marked as such. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.lex.add(RB.lex.parseTable(`
# ---- the boat ---------------------------------------------------------------------------------------------------
帆|ほ|n|E|a sail
帆柱|ほばしら|n|I|a mast
舵|かじ|n|E|a rudder, a tiller (the helm)
綱|つな|n|E|a rope, a line
錨|いかり|n|I|an anchor
甲板|かんぱん|n|I|a deck (of a ship)
船室|せんしつ|n|I|a cabin (on a ship)
寝台|しんだい|n|I|a bunk, a berth
舳先|へさき|n|A|the bow (of a boat)
乗組員|のりくみいん|n|I|a crew member; the crew
桟橋|さんばし|n|E|a pier, a jetty
楔|くさび|n|A|a wedge
木槌|きづち|n|I|a wooden mallet
隙間|すきま|n|E|a gap, a crack
蓋|ふた|n|E|a lid, a cover; (on a boat) a hatch
# ---- what you do to it -----------------------------------------------------------------------------------------
縫う|ぬう|v5u|E|to sew, to stitch
縫い合わせる|ぬいあわせる|v1|I|to sew together
結ぶ|むすぶ|v5b|E|to tie, to knot
結び直す|むすびなおす|v5s|I|to tie again, to retie
締める|しめる|v1|E|to tighten, to fasten
締め直す|しめなおす|v5s|I|to tighten again
塞ぐ|ふさぐ|v5g|I|to stop up, to plug, to block
打ち込む|うちこむ|v5m|I|to drive in, to knock in
擦り切れる|すりきれる|v1|I|to wear through, to fray
裂ける|さける|v1|I|to tear, to split
裂け目|さけめ|n|I|a tear, a rip
汲み出す|くみだす|v5s|I|to bail out (water)
煽る|あおる|v5r|A|(of wind) to gust against, to catch
# ---- the sea and the weather -----------------------------------------------------------------------------------
沖|おき|n|E|the open sea, offshore
漁船|ぎょせん|n|I|a fishing boat
漁師|りょうし|n|E|a fisher, a fisherman
灯台|とうだい|n|E|a lighthouse
岬|みさき|n|E|a cape, a headland, a point
黒岩|くろいわ|name|E|Kuroiwa, Black Rock (a rock with a light; fictional)
霧|きり|n|E|fog, mist
風上|かざかみ|n|I|upwind, windward
海図|かいず|n|I|a sea chart
航海|こうかい|vs|I|a voyage; to sail (a voyage)
日誌|にっし|n|I|a log, a journal
川口|かわぐち|n|I|a river mouth
入港|にゅうこう|vs|A|entering port
出港|しゅっこう|vs|A|leaving port, setting sail
潮見|しおみ|n|I|watching the tide (the tide-keeper's work)
夕刻|ゆうこく|n|A|evening (written)
群閃光|ぐんせんこう|n|A|group flashing (a light's pattern)
閃光|せんこう|n|A|a flash (of light)
表|ひょう|n|I|a table, a list
毎|まい|pref|I|every, each (毎十秒: every ten seconds)
十秒|じゅうびょう|n|E|ten seconds
三秒|さんびょう|n|E|three seconds
鴎|かもめ|n|I|a gull, a seagull
海豹|あざらし|n|I|a seal (the animal)
三頭|さんとう|n|I|three (large animals)
日向ぼっこ|ひなたぼっこ|n|E|basking in the sun
木箱|きばこ|n|E|a wooden box, a crate
割れ物|われもの|n|E|fragile things, breakables
天地無用|てんちむよう|exp|A|this side up (do not turn over)|Real: a common shipping mark, often misread as "either way up is fine".
差出人|さしだしにん|n|I|the sender
上下|じょうげ|n|I|up and down; top and bottom
桶|おけ|n|I|a bucket, a tub
ぷるぷる|ぷるぷる|adv|E|wobbling, quivering (jelly-like)
ぷかぷか|ぷかぷか|adv|E|bobbing, floating
手早い|てばやい|adj-i|I|quick, deft (with the hands)
記念品|きねんひん|n|I|a keepsake, a souvenir
将棋盤|しょうぎばん|n|I|a shogi board
鉤|かぎ|n|I|a hook
鎮める|しずめる|v1|I|to calm, to settle
ぐらぐら|ぐらぐら|adv|E|wobbling, loose
ぐらつく|ぐらつく|v5k|I|to wobble, to be loose
海岸|かいがん|n|E|the coast, the shore
幾つ|いくつ|n|E|how many; (幾つも) many, one after another
勧む|すすむ|exp|A|(written, old style) to recommend (modern 勧める)
# ---- A Licence for the Open Sea (P11b): the deal, the yard, the trials, the examination -------------------------------
外海|そとうみ|n|I|the open sea
免状|めんじょう|n|I|an official licence, a certificate
沿岸|えんがん|n|I|the coast; coastal
郵便船|ゆうびんせん|n|I|a post boat
郵便物|ゆうびんぶつ|n|I|post, mail (the items)
小回り|こまわり|n|I|turning in a small space (小回りが利く: handy, nimble)
水先|みずさき|n|A|pilotage; the pilot who guides ships in
水先船|みずさきぶね|n|A|a pilot boat
造船所|ぞうせんじょ|n|I|a boatyard, a shipyard
船大工|ふなだいく|n|I|a shipwright
竜骨|りゅうこつ|n|A|a keel
名物|めいぶつ|n|I|a speciality, what a place is known for
材木|ざいもく|n|I|timber
杉板|すぎいた|n|I|cedar planks
送り状|おくりじょう|n|I|a delivery note
三番倉|さんばんぐら|n|E|warehouse number three
参番蔵|さんばんぐら|n|A|warehouse number three (with 参, the formal 三 used on documents)
入船|いりふね|n|A|a ship coming in
遅延|ちえん|vs|A|a delay
寸法|すんぽう|n|I|measurements, dimensions
帆布|はんぷ|n|I|sailcloth, canvas
一幅|ひとはば|n|A|one width of cloth
三幅|みはば|n|A|three widths of cloth (cloth is counted ひとはば, ふたはば, みはば)
塗料|とりょう|n|I|paint
一画|いっかく|n|A|one stroke (of a character)
めぐみ|めぐみ|n|I|a blessing (and a boat's name)
若|わか|n|A|young (in compounds: 若潮, 若者)
若潮|わかしお|n|A|the rising morning tide (and a boat's name)
そ|そ|exp|F|the kana そ
ぬぐみ|ぬぐみ|exp|E|(not a word: めぐみ painted with ぬ for め)
さとせ|さとせ|exp|E|(not a word: ちとせ with さ for ち)
きくら|きくら|exp|E|(not a word: さくら with き for さ)
れかしお|れかしお|exp|I|(not a word: わかしお painted with れ for わ)
ブイ||n|I|a buoy
風向き|かざむき|n|I|the wind's direction (where it comes from)
干満|かんまん|n|A|ebb and flow (of the tide)
差|さ|n|I|a difference in size or amount
大|だい|n|A|large, great (in notes and compounds)
二代目|にだいめ|n|I|the second to bear a name, a successor
襲名|しゅうめい|vs|A|taking on a predecessor's name (as actors do)
上出来|じょうでき|adj-na|I|well done, a fine result
意地|いじ|n|I|temper, spite (意地が悪い: mean)
試験|しけん|n|E|an examination
試験官|しけんかん|n|I|an official examiner
面接|めんせつ|vs|I|an interview
合格|ごうかく|vs|E|passing an examination
別人|べつじん|n|I|a different person
所有者|しょゆうしゃ|n|I|an owner
母港|ぼこう|n|I|a home port
用途|ようと|n|A|a use, a purpose
本船|ほんせん|n|A|this vessel (in documents)
速度|そくど|n|I|speed
視界|しかい|n|A|visibility, the field of view
不良|ふりょう|n|A|poor, bad (of a condition)
対応|たいおう|vs|I|a response; dealing with
信号|しんごう|n|E|a sign or signal (a light, a flag)
損傷|そんしょう|vs|A|damage
生じる|しょうじる|v1|A|to arise, to occur
漣|さざなみ|n|A|ripples (and Sazanami, a fishing hamlet up the coast: fictional)
`));
