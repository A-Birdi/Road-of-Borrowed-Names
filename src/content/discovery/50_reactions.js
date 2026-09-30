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
    R('f1', 'nao', 'warded', 'neutral', '{守|まも}り で {押|お}さえて 、 その {間|あいだ} に {留|と}める か 。 …… {私|わたし} なら {衝立|ついたて} を {閉|し}めた けど 、 {速|はや}かった な 。', 'Hold it with a ward and fasten it meanwhile. …I\'d have shut the screen, but that was quick.'),
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
  ]);
})();
