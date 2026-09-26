/* Unwritten Atlas — lexicon entries for words used in atlas text.
 * Format: w|r|pos|lv|meaning|note|alt (see docs/LANGUAGE.md). Fictional
 * terms say so. */
var RB = (globalThis.RB = globalThis.RB || {});

// Only words no earlier file defines are added, so atlas text never fights a
// chapter's entry (chapters load first; see src/manifest.json).
RB.lex.add(RB.lex.parseTable(`
# --- general vocabulary
あちこち||adv|E|here and there
迷子|まいご|n|E|lost child; someone who is lost
届け損ねる|とどけそこねる|v1|I|to fail to deliver|〜損ねる: to fail to (do)
配り損ねる|くばりそこねる|v1|I|to fail to hand out / deliver
方角|ほうがく|n|I|direction, bearing
筋書き|すじがき|n|I|plot, script (of a play)
最高|さいこう|adj-na|E|the best; wonderful
野営地|やえいち|n|A|campsite
包帯|ほうたい|n|I|bandage
開演|かいえん|vs|I|start of a performance; curtain up
一瞬|いっしゅん|n|I|an instant, a moment
線|せん|n|E|line
途切れる|とぎれる|v1|I|to break off, be interrupted
白紙|はくし|n|I|blank paper; a blank sheet
左右|さゆう|n|I|left and right
逆|ぎゃく|adj-na|I|reverse, opposite
這う|はう|v5u|I|to crawl, creep
畳む|たたむ|v5m|I|to fold (up)
わくわく||adv|E|excitedly (with a racing heart)|Onomatopoeic (mimetic) word.
専門|せんもん|n|I|speciality, field of expertise
架かる|かかる|v5r|I|to span, be built across (of a bridge)
ばらばら||adj-na|E|scattered, in pieces
石板|せきばん|n|A|stone tablet
外れる|はずれる|v1|I|to miss; to be wrong (a guess); to come off
怖がる|こわがる|v5r|I|to be afraid|怖がらせる: to frighten (someone).
出番|でばん|n|I|one's turn (on stage)
題|だい|n|I|title
ふさぐ||v5g|I|to block, stop up
焚き火|たきび|n|I|bonfire, campfire
そば||n|E|beside, near
段|だん|n|I|step (of stairs); level
待ち構える|まちかまえる|v1|A|to lie in wait; to be ready and waiting
染み|しみ|n|I|stain
点々|てんてん|adv|A|dotted here and there
水面|みなも|n|A|surface of the water|Literary reading; also すいめん.
姿|すがた|n|I|figure, form, appearance
稽古|けいこ|vs|I|practice, rehearsal
広がる|ひろがる|v5r|I|to spread, extend
クライマックス||n|I|climax
台詞|せりふ|n|I|lines (in a play)
退く|しりぞく|v5k|A|to retreat, step back
腰|こし|n|I|hips, lower back|腰を下ろす: to sit down.
熱心|ねっしん|adj-na|I|keen, dedicated
出費|しゅっぴ|n|A|expenses, outlay
焚き木|たきぎ|n|A|firewood
一曲|いっきょく|n|I|a song, a piece (of music)
なぞる||v5r|I|to trace (over)
溜まる|たまる|v5r|I|to pile up, accumulate
カーテンコール||n|I|curtain call
理屈|りくつ|n|I|logic, reasoning; argument
聞き飽きる|ききあきる|v1|A|to be tired of hearing
残り香|のこりが|n|A|lingering scent
台本|だいほん|n|I|script (of a play)
緑青|ろくしょう|n|A|verdigris
書き換える|かきかえる|v1|I|to rewrite
返しそびれる|かえしそびれる|v1|A|to miss the chance to give back|〜そびれる: to miss one's chance to (do).
衣装|いしょう|n|I|costume
完成|かんせい|vs|I|completion, being finished
永遠|えいえん|n|I|eternity; forever
未完成|みかんせい|n|A|unfinished
終幕|しゅうまく|n|A|final act; the end (of a play)
収まる|おさまる|v5r|I|to settle into place; to fit
折り畳む|おりたたむ|v5m|I|to fold up
座り込む|すわりこむ|v5m|I|to sit down (and stay put)
中止|ちゅうし|vs|I|cancellation, calling off
手帳|てちょう|n|E|notebook, pocketbook
帰す|かえす|v5s|I|to send (someone) home|Different kanji from 返す (to give back).
書き留める|かきとめる|v1|I|to write down, note
持ち主|もちぬし|n|I|owner
荷札|にふだ|n|A|luggage tag, cargo label
里|さと|n|I|village; one's home village
防火帯|ぼうかたい|n|A|firebreak
苗木|なえぎ|n|A|sapling
一年前|いちねんまえ|n|E|a year ago
組み合わさる|くみあわさる|v5r|A|to be combined
現れる|あらわれる|v1|I|to appear
完了|かんりょう|vs|I|completion|配達完了: delivered (done).
淹れる|いれる|v1|I|to make (tea, coffee)
本日|ほんじつ|n|I|today (formal)
おーい||int|E|hey! (calling to someone far away)
よー||prt|I|(drawn-out よ, when calling out)
だろ||aux|I|right? isn't it? (blunt, casual form of だろう)
目印|めじるし|n|I|landmark, mark
代わり|かわり|n|I|substitute; (〜の代わりに) instead of
しっぽ||n|E|tail
目当て|めあて|n|I|aim; (〜目当て) (being) after …
翌朝|よくあさ|n|I|the next morning
らら||int|F|la la (humming)
くちずさむ||v5m|I|to hum, sing to oneself
口ずさむ|くちずさむ|v5m|I|to hum, sing to oneself
火事|かじ|n|E|fire (a building or area on fire)
出来事|できごと|n|I|event, incident
歌詞|かし|n|I|lyrics
楽譜|がくふ|n|I|sheet music
部分|ぶぶん|n|I|part
存在|そんざい|vs|I|existence|存在する: to exist.
柳|やなぎ|n|I|willow
遅刻|ちこく|vs|E|being late
書き込む|かきこむ|v5m|I|to write in, fill in
刈る|かる|v5r|I|to cut, mow
すっぱい||adj-i|E|sour
酸っぱい|すっぱい|adj-i|E|sour
おばあちゃん||n|F|grandma
梅干し|うめぼし|n|E|umeboshi: salted, dried ume ("pickled plum")
しょっぱい||adj-i|E|salty
毎年|まいとし|n|E|every year|Also read まいねん.
減らす|へらす|v5s|I|to reduce
つつ||prt|I|while; (〜つつも) although|Written style; attaches to the verb stem.
レシピ||n|E|recipe
重し石|おもしいし|n|A|pickling weight (a stone)|Also written 重石 (おもし).
数|かず|n|E|number
すべて||n|I|all, everything
同時|どうじ|n|I|same time|〜と同時に: at the same time as.
梅|うめ|n|E|ume, Japanese apricot (often called "plum")
曜日|ようび|n|E|day of the week
小麦粉|こむぎこ|n|I|flour
縦|たて|n|I|vertical; lengthwise|首を縦に振る: to nod (yes).
余裕|よゆう|n|I|room, leeway; time or money to spare
にゃあ||int|F|miaow
望遠鏡|ぼうえんきょう|n|I|telescope
博士|はかせ|n|I|doctor (scholar); professor
曇る|くもる|v5r|E|to become cloudy
引っ越す|ひっこす|v5s|E|to move (house)
追伸|ついしん|n|I|postscript, P.S.
取っ手|とって|n|I|handle
ゆるい||adj-i|I|loose
本文|ほんぶん|n|I|main text, body (of a letter)
気づかう|きづかう|v5u|I|to be concerned for, look out for
表れる|あらわれる|v1|I|to show, be expressed (a feeling)
街道|かいどう|n|A|highway, main road (old)
工事|こうじ|n|I|construction work
当分|とうぶん|adv|I|for the time being
通行止め|つうこうどめ|n|I|closed to traffic
どころ||n|A|(〜どころではない) far from; this is no time for
ご利用|ごりよう|n|I|(polite) use|ご利用ください: please use (notices).
暮れる|くれる|v1|I|to get dark (as the day ends)
明かり|あかり|n|E|light, lamp
地元|じもと|n|I|local (area)
本道|ほんどう|n|A|main road
落石|らくせき|n|A|falling rocks
恐れ|おそれ|n|I|fear; (〜の恐れがある) there is a risk of
当面|とうめん|n|A|for the present
際|さい|n|A|occasion, when (formal)
最寄り|もより|n|I|nearest
長年|ながねん|n|I|many years
村人|むらびと|n|I|villager
許可|きょか|vs|I|permission
加える|くわえる|v1|I|to add|手を加える: to alter, tamper with.
禁ずる|きんずる|vs-i|A|to forbid (written style)
禁じる|きんじる|v1|A|to forbid
判断|はんだん|vs|I|judgement, decision
予定|よてい|n|E|plan, schedule
確実|かくじつ|adj-na|I|certain, sure
可能性|かのうせい|n|I|possibility
善処|ぜんしょ|vs|A|dealing with (a matter) appropriately|善処いたします is a formal phrase that commits to nothing specific.
前向き|まえむき|adj-na|I|positive, forward-looking
姿勢|しせい|n|I|attitude, stance; posture
具体的|ぐたいてき|adj-na|I|concrete, specific
要望|ようぼう|n|A|request, demand
どおり||suf|I|in accordance with (〜どおり)
応援|おうえん|vs|I|support, cheering on
件|けん|n|I|matter, case
検討|けんとう|vs|I|consideration, examination
場|ば|n|I|place, spot; occasion|その場で: on the spot.
結論|けつろん|n|I|conclusion
延ばす|のばす|v5s|I|to put off; to extend
承諾|しょうだく|vs|A|consent
提案|ていあん|vs|I|proposal
当時|とうじ|n|I|at that time
濁す|にごす|v5s|A|to make cloudy; (言葉を濁す) to be vague, evasive
以前|いぜん|n|I|before, formerly
省みる|かえりみる|v1|A|to reflect on (oneself)
明確|めいかく|adj-na|I|clear, precise
誓う|ちかう|v5u|I|to swear, vow
正当化|せいとうか|vs|A|justification
方法|ほうほう|n|I|method, way
純粋|じゅんすい|adj-na|I|pure, genuine
知りたがる|しりたがる|v5r|I|to want to know
しがみつく||v5k|I|to cling to
二重奏|にじゅうそう|n|A|duet
便り|たより|n|I|news, tidings
交わす|かわす|v5s|I|to exchange (words, letters)
潮見|しおみ|n|A|watching the tide
栞|しおり|n|I|bookmark
かけら||n|I|fragment, shard
たすき||n|I|sash (worn diagonally)
方位|ほうい|n|I|direction, compass point
ピン||n|E|pin
外套|がいとう|n|A|overcoat, cloak
怯える|おびえる|v1|I|to be frightened
舞い上がる|まいあがる|v5r|I|to fly up, soar
行|ぎょう|n|I|line (of text)
書き損なう|かきそこなう|v5u|A|to make a mistake in writing
塊|かたまり|n|I|lump, mass
折り鶴|おりづる|n|E|paper crane
広げる|ひろげる|v1|I|to spread, unfold
鶴|つる|n|I|crane (bird)
苔むす|こけむす|v5s|A|to be covered in moss
偽|にせ|n|I|fake, false
通行料|つうこうりょう|n|A|toll
順序|じゅんじょ|n|I|order, sequence
空ける|あける|v1|I|to make room, clear|道を空ける: to make way.
蟹|かに|n|E|crab
案内人|あんないにん|n|I|guide
本物|ほんもの|n|I|the real thing
次第|しだい|n|A|depending on (〜次第)
いずれ||adv|I|sooner or later; either
運|うん|n|I|luck, fate
ゴーン||int|E|bong (a bell)
去る|さる|v5r|I|to leave, go away
時点|じてん|n|A|point (in time)
廃墟|はいきょ|n|A|ruin(s)
回廊|かいろう|n|A|corridor, cloister
舞う|まう|v5u|I|to dance; to flutter
飛ばす|とばす|v5s|I|to send flying, blow away
予備|よび|n|I|spare, reserve
芯|しん|n|I|wick; core
巻き貝|まきがい|n|A|spiral shell
束|たば|n|I|bundle
方位磁石|ほういじしゃく|n|A|compass
急須|きゅうす|n|I|teapot (small, with a side handle)
硯|すずり|n|A|inkstone
消印|けしいん|n|A|postmark
栓|せん|n|I|stopper, cork
小瓶|こびん|n|I|small bottle, vial
芯切り|しんきり|n|A|wick trimmer(s)
代役|だいやく|n|A|understudy, stand-in
面|めん|n|I|mask
川下|かわしも|n|I|downstream
駆ける|かける|v1|I|to run, dash
段々畑|だんだんばたけ|n|A|terraced fields
すり抜ける|すりぬける|v1|I|to slip through
転がる|ころがる|v5r|I|to roll
ひらひら||adv|E|fluttering
無難|ぶなん|adj-na|A|safe, unobjectionable
絶える|たえる|v1|A|to die out, cease
並み|なみ|n|I|row, line (e.g. 家並み, a row of houses)
書棚|しょだな|n|A|bookshelf
遠回り|とおまわり|vs|I|detour; the long way round
順番|じゅんばん|n|E|order; turn
ぽっ||adv|I|with a soft pop (a light coming on)
見事|みごと|adj-na|I|splendid, well done
長持ち|ながもち|vs|I|lasting long
客席|きゃくせき|n|I|audience seats
幕間|まくあい|n|A|interval between acts
休憩|きゅうけい|vs|I|rest, break
薄れる|うすれる|v1|I|to fade
干物|ひもの|n|I|dried fish
一部|いちぶ|n|I|a part
塩分|えんぶん|n|I|salt content
火曜|かよう|n|E|Tuesday (short for 火曜日)
初日|しょにち|n|I|first day (of a show), opening night
帳簿|ちょうぼ|n|A|account book, ledger
ばっかり||prt|I|nothing but (casual form of ばかり)
寂しがり|さびしがり|n|I|someone who gets lonely easily
肝心|かんじん|adj-na|I|essential; the important part
贈り物|おくりもの|n|I|gift
小道具|こどうぐ|n|I|prop (on stage)
ゲット||vs|E|getting (slang, from English "get")
型|かた|n|I|type, model; form
仲良く|なかよく|adv|E|on good terms
磁石|じしゃく|n|I|magnet; compass
逆さま|さかさま|adj-na|I|upside down
方向|ほうこう|n|I|direction
正解|せいかい|n|I|correct answer; the right choice
緩む|ゆるむ|v5m|I|to loosen
乾杯|かんぱい|vs|E|a toast; cheers!
熱|ねつ|n|I|heat; fever
行方|ゆくえ|n|A|whereabouts
悪夢|あくむ|n|I|nightmare
旅費|りょひ|n|I|travel expenses
職業病|しょくぎょうびょう|n|A|occupational hazard (lit. occupational illness)
即興|そっきょう|n|A|improvisation
下書き|したがき|n|I|rough draft, sketch
# --- fictional / place terms used in atlas text
雪鈴|ゆきすず|name|E|Snowbell (a place in this story)
地図師|ちずし|n|A|map-maker, cartographer|Old-fashioned word.
関守|せきもり|n|A|keeper of a barrier (checkpoint) gate|Historical word.
半道|はんみち|n|A|a half-built road (in this story)|In this story, a road built only halfway; a fictional use.
まや||int|F|(nonsense: やま said backwards)|Not a word: an echo turning やま round.
`).filter((e) => !RB.lex.get(e.w, e.r || e.w)), 'atlas');
