/* Companion reactions to the field puzzles (addendum §9): for each puzzle, a
 * first reaction for all four companions and one for each materially
 * different route (facts.method, as recorded by RB.fieldweave), plus a
 * plain fallback. Brief; about what the route actually did; never about the
 * route not taken. Chosen once per resolution by RB.company.react. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const L = (jp, en) => [{ jp, en }];
  const R = (pz, comp, method, expr, jp, en) => ({ id: pz + '.' + comp + '.' + (method || 'any'), comp, event: 'puzzle:' + pz, facts: method ? { method } : undefined, priority: method ? 1 : 0, expr, lines: L(jp, en) });
  RB.company.addReactions([
    // ---- F1: A Dry Place for Names ----------------------------------------------------------------
    R('f1', 'nao', 'screened', 'smirk', '{風|かぜ} を {止|と}めて から {留|と}める 。 {順番|じゅんばん} どおり だ な 。 {道|みち} も ふさいで ない 。', 'Stop the wind, then fasten it. Right order. And nothing\'s blocking the path.'),
    R('f1', 'nao', 'warded', 'neutral', '{守|まも}り で {押|お}さえて 、 その {間|あいだ} に {留|と}める か 。 …… {私|わたし} なら {衝|つい}{立|たて} を {閉|し}めた けど 、 {速|はや}かった な 。', 'Hold it with a ward and fasten it meanwhile. …I\'d have shut the screen, but that was quick.'),
    R('f1', 'nao', null, 'neutral', '{止|と}まった な 。 これ で {名前|なまえ} が {読|よ}める 。', 'It\'s stopped. Now the names can be read.'),
    R('f1', 'mio', 'screened', 'smile', '{紙|かみ} は {濡|ぬ}れて ない し 、 {端|はし} も {出|で}て ない 。 {袖|そで} を {引|ひ}っかける ところ が ない ね 。', 'The paper\'s dry, and no edge is sticking out. Nothing for a sleeve to catch on.'),
    R('f1', 'mio', 'warded', 'smile', '{守|まも}り は {少|すこ}し の {間|あいだ} だけ 。 でも {留|と}め{具|ぐ} は ずっと {残|のこ}る 。 それ で {十分|じゅうぶん} だ よ 。', 'The ward only lasted a moment. But the clamp stays. That\'s enough.'),
    R('f1', 'mio', null, 'smile', 'これ で {誰|だれ} でも {読|よ}める ね 。', 'Now anyone can read it.'),
    R('f1', 'ren', 'screened', 'smile', '{元|もと} の {札|ふだ} が 、 {元|もと} の {字|じ} の まま {読|よ}める 。 {書|か}き{直|なお}す より 、 ずっと いい です 。', 'The original slips, readable in the original hand. Far better than rewriting them.'),
    R('f1', 'ren', 'warded', 'think', '{言葉|ことば} で {支|ささ}えて 、 {手|て} で {留|と}める 。 {先生|せんせい} も 、 たしか そう {教|おし}えて いました 。', 'Hold it with a word, fasten it by hand. My teacher taught that too, I believe.'),
    R('f1', 'ren', null, 'smile', '{名前|なまえ} が {読|よ}める よう に なりました ね 。', 'The names can be read again.'),
    R('f1', 'suzu', 'screened', 'laugh', '{幕|まく} を {閉|し}めたら 、 {看板|かんばん} が やっと {台詞|せりふ} を {最後|さいご} まで {言|い}えた わ ね 。', 'Close the curtain, and the board finally gets to say its lines to the end.'),
    R('f1', 'suzu', 'warded', 'smile', '{袖|そで} で {誰|だれ} か が {幕|まく} を {押|お}さえてる {間|あいだ} に 、 {釘|くぎ} を {打|う}つ 。 {舞台|ぶたい} {裏|うら} は いつも そう よ 。', 'Someone holds the curtain in the wings while someone else knocks the nail in. That\'s backstage for you.'),
    R('f1', 'suzu', null, 'smile', 'はい 、 {静|しず}か に なった 。 {名札|なふだ} の {皆|みな}さん 、 お{待|ま}たせ 。', 'There, quiet at last. Sorry to keep you waiting, names.'),

    // ---- F2: The Signal Float (filled / cranked / vane) -----------------------------------------
    R('f2', 'nao', 'filled', 'neutral', '{空気|くうき} を {抜|ぬ}いて 、 {紐|ひも} を {止|と}めて 、 {水|みず} を {入|い}れる 。 {図|ず} の {順番|じゅんばん} どおり だ 。', 'Let the air out, hold the line, pour the water. Just the order on the diagram.'),
    R('f2', 'nao', 'cranked', 'smirk', '{手|て} で {回|まわ}した か 。 {水|みず} を {使|つか}わず に {済|す}む なら 、 それ が {一番|いちばん} {速|はや}い 。', 'Wound it by hand, huh. If you can skip the water, that\'s the quickest.'),
    R('f2', 'nao', 'vane', 'smirk', '{風車|かざぐるま} に {回|まわ}させた の か 。 {港|みなと} の {風|かぜ} に {仕事|しごと} を させる 。 {悪|わる}く ない 。', 'Got the vane to do it? Putting the harbour wind to work. Not bad.'),
    R('f2', 'nao', null, 'neutral', '{上|あ}がった な 。 {札|ふだ} が {読|よ}める 。', 'It\'s up. The label reads.'),
    R('f2', 'mio', 'filled', 'smile', '{水|みず} が {入|はい}る {前|まえ} に 、 {空気|くうき} の {出口|でぐち} を {作|つく}る 。 {薬|くすり} の {瓶|びん} も {同|おな}じ だ よ 。', 'Give the air a way out before the water goes in. Medicine bottles are the same.'),
    R('f2', 'mio', 'cranked', 'smile', '{水|みず} を {足|た}さず に {済|す}んだ ね 。 {水槽|すいそう} の {水|みず} を {替|か}える {人|ひと} も 、 {助|たす}かる 。', 'No water added. That saves whoever changes the tank\'s water, too.'),
    R('f2', 'mio', 'vane', 'laugh', '{風|かぜ} で {回|まわ}る ところ 、 {見|み}て いて {楽|たの}しかった 。 {子|こ}ども たち も 、 きっと {喜|よろこ}ぶ ね 。', 'It was fun watching the wind turn it. The children will love that.'),
    R('f2', 'mio', null, 'smile', '{窓|まど} まで {上|あ}がった ね 。', 'It\'s up at the window.'),
    R('f2', 'ren', 'filled', 'smile', '{浮|う}き は {水|みず} と {一緒|いっしょ} に {上|あ}がる 。 {札|ふだ} に {書|か}いて ある とおり の {上|あ}がり{方|かた} でした 。', 'A float rises with the water. It rose exactly the way its label says.'),
    R('f2', 'ren', 'cranked', 'think', '{取|と}っ{手|て} で {上|あ}げて も 、 {札|ふだ} は {同|おな}じ {窓|まど} に {来|く}る 。 {道|みち} は {違|ちが}って も 、 {着|つ}く {所|ところ} は {同|おな}じ です 。', 'Raised by the crank, the label still comes to the same window. A different road, the same arrival.'),
    R('f2', 'ren', 'vane', 'shy', '{風車|かざぐるま} が {滑車|かっしゃ} の {軸|じく} に {付|つ}いて いる 。 {図|ず} に も {描|か}いて ありました 。 …… {私|わたし} は {見落|みお}として いました が 。', 'The vane sits on the pulley\'s axle. It was on the diagram. …I\'d missed it, I admit.'),
    R('f2', 'ren', null, 'smile', '{札|ふだ} が {読|よ}める よう に なりました 。', 'The label can be read now.'),
    R('f2', 'suzu', 'filled', 'laugh', '{幕|まく} が {上|あ}がる みたい に 、 {浮|う}き が {上|あ}がった ！ {水|みず} の {演出|えんしゅつ} 、 {好|す}き よ 。', 'Up came the float like a curtain rising! I love a water effect.'),
    R('f2', 'suzu', 'cranked', 'smirk', '{幕|まく} の {綱|つな} を {引|ひ}く {係|かかり} ね 。 {止|と}め{爪|づめ} が なかったら 、 {芝居|しばい} の {途中|とちゅう} で {幕|まく} が {落|お}ちる わ 。', 'The one on the curtain rope! Without the catch, the curtain would drop mid-play.'),
    R('f2', 'suzu', 'vane', 'laugh', '{風|かぜ} に {出演料|しゅつえんりょう} を {払|はら}わなくちゃ 。 {見事|みごと} な {脇役|わきやく} だった わ 。', 'We should pay the wind a fee. What a supporting performance.'),
    R('f2', 'suzu', null, 'smile', '{浮|う}き さん 、 {窓|まど} で {出番|でばん} 。', 'The float takes its bow at the window.'),

    // ---- F3: The Maker's Mark (ordinary / woven / mixed) --------------------------------------------
    R('f3', 'nao', 'ordinary', 'neutral', '{台|だい} を {据|す}えて 、 {灯|あか}り を {横|よこ} に 。 {親方|おやかた} の {紙|かみ} の とおり だ 。 {手堅|てがた}い 。', 'Steady the stand, light from the side. Just what the master\'s note says. Solid.'),
    R('f3', 'nao', 'woven', 'smirk', '{石|いし} で {据|す}えて 、 {光|ひかり} を {横|よこ} から 。 {言葉|ことば} に {道具|どうぐ} の {代|か}わり を させた わけ だ 。', 'Steadied with stone, lit from the side. Words doing the tools\' job.'),
    R('f3', 'nao', 'mixed', 'neutral', '{半分|はんぶん} {手|て} で 、 {半分|はんぶん} {言葉|ことば} で 。 {読|よ}めりゃ@読む=(as long as it can be read) 、 どっち でも いい 。', 'Half by hand, half by word. Either way, as long as it reads.'),
    R('f3', 'nao', null, 'neutral', '{葉|は} の {印|しるし} か 。 {読|よ}めた な 。', 'A leaf mark. You read it.'),
    R('f3', 'mio', 'ordinary', 'smile', '{台|だい} と {灯|あか}り だけ で 、 {火屋|ほや} {自体|じたい} に は {何|なに} も して ない ね 。 {作|つく}り{掛|か}け の {火屋|ほや} も {無事|ぶじ} だ 。', 'Only the stand and the lamp — nothing done to the globe itself. And the half-made ones are fine too.'),
    R('f3', 'mio', 'woven', 'smile', '{言葉|ことば} で {支|ささ}えて 、 {言葉|ことば} で {照|て}らして 。 {熱|ねつ} を {使|つか}わず に {済|す}んで 、 よかった 。', 'Held by a word, lit by a word. I\'m glad it needed no heat.'),
    R('f3', 'mio', 'mixed', 'think', '{片方|かたほう} は {手|て} 、 {片方|かたほう} は {言葉|ことば} 。 {二|ふた}つ {揃|そろ}わない と {見|み}えない もの って 、 ある よ ね 。', 'One by hand, one by word. Some things only show when both are in place.'),
    R('f3', 'mio', null, 'smile', 'ヒロ さん の {印|しるし} だった ね 。', 'It was Hiro\'s mark.'),
    R('f3', 'ren', 'ordinary', 'smile', '{印|しるし} は {削|けず}らず 、 {上書|うわが}き も せず 。 {作|つく}られた まま {読|よ}めた 。 {記録|きろく} と して {正|ただ}しい です 。', 'Not scraped, not written over: read just as it was made. That\'s correct, as records go.'),
    R('f3', 'ren', 'woven', 'shy', '{光|ひかり} を {横|よこ} から 。 {灯|ひ} を {扱|あつか}う {者|もの} と して 、 {少|すこ}し {悔|くや}しい くらい {上手|じょうず} です 。', 'Light from the side. As someone who tends lamps, I\'m almost annoyed how well that worked.'),
    R('f3', 'ren', 'mixed', 'think', '{手|て} と {言葉|ことば} 。 どちら か {一方|いっぽう} で は {足|た}りなかった 。 {先生|せんせい} なら 、 {満足|まんぞく} した でしょう 。', 'Hand and word; either alone wasn\'t enough. My teacher would have been pleased.'),
    R('f3', 'ren', null, 'smile', '{作|つく}り{手|て} の {名前|なまえ} が {戻|もど}りました ね 。', 'The maker\'s name is back.'),
    R('f3', 'suzu', 'ordinary', 'laugh', '{照明|しょうめい} は {横|よこ} から 。 {舞台|ぶたい} と {同|おな}じ ね 。 {真上|まうえ} から だと 、 {顔|かお} が {全部|ぜんぶ} {平|たい}ら に なる の 。', 'Light from the side — same as the stage. From straight above, every face goes flat.'),
    R('f3', 'suzu', 'woven', 'smile', '{石|いし} の {大道具|おおどうぐ} に 、 {言葉|ことば} の {照明|しょうめい} 。 {裏方|うらかた} {二人|ふたり} {分|ぶん} の {仕事|しごと} よ 。', 'Stone for the scenery, a word for the lighting. That\'s two stagehands\' work.'),
    R('f3', 'suzu', 'mixed', 'smile', '{半分|はんぶん} {本物|ほんもの} の {道具|どうぐ} 、 {半分|はんぶん} {言葉|ことば} 。 {旅|たび} の {一座|いちざ} は 、 いつも そう よ 。', 'Half real props, half words. Touring companies always work like that.'),
    R('f3', 'suzu', null, 'smile', '{葉|は}っぱ の {署名|しょめい} 、 {素敵|すてき} ね 。', 'A leaf for a signature. Lovely.'),

    // ---- F4: The Frosted Compartments (flame / cloth) ---------------------------------------------
    R('f4', 'nao', 'flame', 'neutral', '{矢印|やじるし} の とおり に {温|あたた}めた な 。 {扉|とびら} は {一枚|いちまい} も {焦|こ}げて ない 。', 'Warmed it where the arrow said. Not a single door scorched.'),
    R('f4', 'nao', 'cloth', 'smirk', '{布|ぬの} {一枚|いちまい} で {片付|かたづ}いた 。 {置|お}いて ある {道具|どうぐ} は 、 {使|つか}え って こと だ 。', 'One cloth and it\'s done. Tools left out are there to be used.'),
    R('f4', 'nao', null, 'neutral', '③ だった な 。', 'Box three, then.'),
    R('f4', 'mio', 'flame', 'smile', '{真鍮|しんちゅう} の {所|ところ} だけ を {温|あたた}めた ね 。 {木|き} は {燃|も}え やすい から 、 よかった 。', 'You only warmed the brass part. Good — wood catches easily.'),
    R('f4', 'mio', 'cloth', 'smile', '{温|あたた}かい {布|ぬの} 、 {誰|だれ} か が {用意|ようい} して おいて くれた ん だ ね 。 {優|やさ}しい {小屋|こや} だ 。', 'Someone left a warm cloth ready. It\'s a kind little shelter.'),
    R('f4', 'mio', null, 'smile', '{見|み}つかって よかった ね 。', 'I\'m glad you found it.'),
    R('f4', 'ren', 'flame', 'shy', '{炎|ほのお} で {霜|しも} を {溶|と}かす と は 。 {灯|ひ} の {係|かかり} と して 、 {少|すこ}し {誇|ほこ}らしい です 。 …… {私|わたし} が やった わけ で は ありません が 。', 'Melting frost with a flame. As a lamp-keeper, I feel a little proud. …Not that I did it.'),
    R('f4', 'ren', 'cloth', 'smile', '{丸|まる} と {丸|まる} 。 {判|はん} が {答|こた}え を {持|も}って いました ね 。 {布|ぬの} {一枚|いちまい} で 、 それ が {見|み}えた 。', 'Circle and circle: the stamps held the answer. And one cloth was all it took to see them.'),
    R('f4', 'ren', null, 'smile', '{判|はん} が {一致|いっち} しました ね 。', 'The stamps matched.'),
    R('f4', 'suzu', 'flame', 'smile', '{雪|ゆき} の {舞台|ぶたい} に 、 {一瞬|いっしゅん} だけ {火|ひ} の {照明|しょうめい} 。 {粋|いき} ね 。', 'A moment of firelight on a snowy stage. Stylish.'),
    R('f4', 'suzu', 'cloth', 'laugh', '{幕|まく} を {拭|ふ}いたら 、 {配役|はいやく} が {出|で}て きた わ 。 ③ {番|ばん} 、 {主役|しゅやく} おめでとう 。', 'Wipe the curtain and there\'s the cast list. Box three, congratulations on the lead.'),
    R('f4', 'suzu', null, 'smile', '{雪|ゆき} の {形|かたち} の {留|と}め{具|ぐ} 、 {可愛|かわい}い 。', 'A snowflake toggle. Cute.'),

    // ---- F5: A Room That Answers Twice (struck / rung) ----------------------------------------------
    R('f5', 'nao', 'struck', 'neutral', '{鐘|かね} の {通|とお}り{道|みち} を {組|く}み{替|か}えて 、 {読|よ}んで いる {人|ひと} の {邪魔|じゃま} を しない 。 {配達|はいたつ} も 、 {結局|けっきょく} は {道|みち} {選|えら}び だ 。', 'Re-route the chime so it doesn\'t bother the reader. Delivery\'s the same: it all comes down to choosing the road.'),
    R('f5', 'nao', 'rung', 'smirk', '{自分|じぶん} で {音|おと} を {管|くだ} に {通|とお}した か 。 {届|とど}け{先|さき} を {間違|まちが}えない {音|おと} だ 。', 'Sent the sound down the tube yourself, huh. A sound that doesn\'t mistake its address.'),
    R('f5', 'nao', null, 'neutral', '{花|はな} の {方|ほう} だけ {鳴|な}った な 。', 'Only the flower rang.'),
    R('f5', 'mio', 'struck', 'smile', '{花|はな} は {鳴|な}って 、 フミ さん は {読|よ}み{続|つづ}けて いる 。 それ が {一番|いちばん} {嬉|うれ}しい 。', 'The flower rang, and Fumi\'s still reading. That\'s what makes me happiest.'),
    R('f5', 'mio', 'rung', 'smile', '{言葉|ことば} で も {鐘|かね} の {代|か}わり に なる ん だ ね 。 {読書|どくしょ} の {邪魔|じゃま} を せず に 。', 'A word can stand in for the chime — without disturbing anyone\'s reading.'),
    R('f5', 'mio', null, 'smile', '{静|しず}か な まま だ ね 。', 'It stayed quiet over there.'),
    R('f5', 'ren', 'struck', 'shy', '{音|おと} に も {道|みち} が ある 。 {図|ず} の とおり に {送|おく}れば 、 {迷|まよ}わない 。 …… {私|わたし} と {違|ちが}って 。', 'Sound has roads too. Send it the way the diagram shows and it doesn\'t get lost. …Unlike me.'),
    R('f5', 'ren', 'rung', 'smile', '{管|くだ} は {言葉|ことば} も {運|はこ}ぶ 。 {灯|ひ} の {名前|なまえ} と {同|おな}じ です ね 。 {道|みち} が あれば 、 {届|とど}く 。', 'The tubes carry words too. Like lantern names: if there\'s a road, they arrive.'),
    R('f5', 'ren', null, 'smile', '{正|ただ}しい {道|みち} で {届|とど}きました 。', 'It arrived by the right road.'),
    R('f5', 'suzu', 'struck', 'laugh', '{舞台|ぶたい} {裏|うら} の {呼|よ}び{鈴|りん} と {同|おな}じ 。 {客席|きゃくせき} に {聞|き}こえたら {大失敗|だいしっぱい} 。 {今回|こんかい} は {大成功|だいせいこう} よ 。', 'Like the backstage call bell: if the audience hears it, disaster. This time, a triumph.'),
    R('f5', 'suzu', 'rung', 'smirk', '{音|おと} の {出番|でばん} なら {私|わたし} の {出番|でばん} …… と {言|い}いたい けど 、 {今日|きょう} の {主役|しゅやく} は あなた 。', 'If it\'s a cue for sound, it\'s my cue… I\'d like to say. But today the lead is you.'),
    R('f5', 'suzu', null, 'smile', '{花|はな} の {独唱|どくしょう} 、 {聞|き}こえた ？', 'Did you hear the flower\'s solo?'),

    // ---- F6: The Unbound Index (lit / rubbed) ---------------------------------------------------------
    R('f6', 'nao', 'rubbed', 'neutral', '{炭|すみ} で こすり{出|だ}す か 。 {古|ふる}い {宛名|あてな} を {読|よ}む とき 、 {私|わたし} も そう する 。', 'Rubbing it up with charcoal. I do that too, reading old addresses.'),
    R('f6', 'nao', 'lit', 'think', '{横|よこ} から {光|ひかり} を {当|あ}てる と 、 {押|お}し{跡|あと} が {読|よ}める の か 。 {覚|おぼ}えて おこう 。', 'Light from the side, and a pressed mark reads. I\'ll remember that.'),
    R('f6', 'nao', null, 'neutral', '{索引|さくいん} 、 {片付|かたづ}いた な 。', 'The index is sorted.'),
    R('f6', 'mio', 'rubbed', 'smile', '{札|ふだ} は {汚|よご}さず に 、 {薄紙|うすがみ} の {方|ほう} に {写|うつ}した ね 。 {丁寧|ていねい} だ よ 。', 'You took the marks onto the thin paper and left the slips clean. That\'s careful.'),
    R('f6', 'mio', 'lit', 'smile', '{紙|かみ} に {何|なに} も {足|た}さず に 、 {見|み}える よう に した 。 それ が {一番|いちばん} {優|やさ}しい 。', 'You made them visible without adding anything to the paper. That\'s the gentlest way.'),
    R('f6', 'mio', null, 'smile', 'オヨネ さん 、 {助|たす}かる ね 。', 'That\'ll help Oyone.'),
    R('f6', 'ren', 'rubbed', 'think', '{切|き}り{込|こ}み 、 それ から {押|お}し{印|いん} 。 {決|き}まり を {順番|じゅんばん} に {当|あ}てはめれば 、 {答|こた}え は {一|ひと}つ です 。', 'The notch, then the stamp. Apply the rule in order and there\'s only one answer.'),
    R('f6', 'ren', 'lit', 'smile', '{光|ひかり} で {押|お}し{印|いん} を {浮|う}かせる 。 {灯|ひ} の {仕事|しごと} に は 、 こういう {使|つか}い{方|かた} も ある ん です ね 。', 'Raising a stamp with light. So a lamp-keeper\'s work has uses like this too.'),
    R('f6', 'ren', null, 'smile', '{上|のぼ}り と {下|くだ}り 。 {道|みち} の {記録|きろく} が {揃|そろ}いました 。', 'Going up and coming down. The road\'s records are in order.'),
    R('f6', 'suzu', 'rubbed', 'smile', '{手袋|てぶくろ} は 「 {預|あず}かり{物|もの} 」 。 {持|も}ち{主|ぬし} が {来|く}る まで 、 {帳面|ちょうめん} に {載|の}って いる 。 {好|す}き よ 、 こういう の 。', 'The glove goes under Held for collection — on the books until its owner comes. I like that sort of thing.'),
    R('f6', 'suzu', 'lit', 'laugh', '{光|ひかり} を {当|あ}てたら 、 {札|ふだ} が {自己紹介|じこしょうかい} を {始|はじ}めた わ ね 。 {上|のぼ}り 、 {下|くだ}り 、 {預|あず}かり 。', 'Shine a light and the slips introduce themselves: going up, coming down, held.'),
    R('f6', 'suzu', null, 'smile', '{帳尻|ちょうじり} が {合|あ}った わ 。', 'The books balance.'),
  ]);
})();
