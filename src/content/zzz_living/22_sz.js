/* Sazanami's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md; plan 06_WORLD.md W1-W3, W6).
 * One map, the hamlet. Sazanami's content belongs to Chapter 9 (its id prefix is Kotonoha's: 00_expansion.js), and its
 * story ends there: Isaku's nets point to the island, and the island's story is told; its routines run once Kotonoha
 * is over (`ko_done`, which every journey reaches: `sea_ko_hint`, the hamlet's own last scene, belongs to the
 * optional licence).
 *   Routines (W2): Yone mends at the drying racks, on the jetty with the boats' nets, or fetches twine from the net
 *     shed; Uki keeps her stall, counts the catch as it lands on the jetty, or goes round the houses with the post (a
 *     note on her counter while she is away); Mina plays at the tide pools, watches Yone's knots at the racks, or
 *     hunts empty shells on the shingle. Each is pinned while her own side story needs her there.
 *   Asking after people (W3): Uki, who keeps the post box and knows everyone; Isaku, who knows his mother and brother
 *     in Saltglass too; Yone can't see that far, she says.
 *   Change beats (W1): registered, your own boat at the jetty (`sea_boat`; sea/01_region.js) and the fishing station
 *     on the rocks after the story (zz_coast.js); new, the winter's storms once Snowbell's story is over (`ch4_done`:
 *     driftwood and a broken crate on the shingle, Yone's word on the torn nets).
 *   No road events: Sazanami has no road map of its own (it is reached along Saltglass's coast road, whose events are
 *     Saltglass's, or by sea).
 *   Return keys (W6): the old net-master's box tied with three different knots (それぞれ), the worn charm in the shrine
 *     on the point (あらゆる), the gull rock offshore (your own boat). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content;
  const J = (jp, en) => ({ jp, en });

  RB.lex.add(RB.lex.parseTable(`
網針|あばり|n|A|a netting needle (a flat needle for knotting and mending nets by hand)
網元|あみもと|n|A|the master of a fishing crew, who owns the boats and nets
流木|りゅうぼく|n|I|driftwood
横波|よこなみ|n|I|a wave from the side (a beam sea)
精一杯|せいいっぱい|n|I|as much as one can manage, one's utmost
`));

  // ---- the town ------------------------------------------------------------------------------------------------------
  L.town('sazanami', { maps: ['sz.hamlet'], care: ['ko_done', 'cr_done', 'yn_done', 'postgame'], after: 'ko_done' });

  // ---- routines (W2) ---------------------------------------------------------------------------------------------------
  L.routine('sazanami', 'sz_yone', { base: 'sz.hamlet:sz_yone', pin: 'quest.sz_nets=0', slots: [
    { map: 'sz.hamlet', x: 20, y: 21, dir: 'down', perform: 'mend', line: ['{船|ふね} の {網|あみ} も 、 {見|み}て やらない と ね 。 {若|わか}い の は {結|むす}び が {甘|あま}い の さ 。', 'The boats\' nets need looking at too. The young ones tie their knots loose.'] },
    { map: 'sz.hamlet', x: 15, y: 8, dir: 'up', line: ['{小屋|こや} から {新|あたら}しい {糸|いと} を {出|だ}して くる の さ 。 {目|め} は {悪|わる}くて も 、 {棚|たな} の {場所|ばしょ} は {手|て} が {覚|おぼ}えて いる 。', 'Fetching new twine from the shed. My eyes may be poor, but my hands know where the shelves are.'] },
  ] });
  L.routine('sazanami', 'sz_uki', { base: 'sz.hamlet:sz_uki', pin: 'quest.sz_market=0|item.sea_mailbag&!sea_post_sz', slots: [
    { map: 'sz.hamlet', x: 21, y: 18, dir: 'down', perform: 'tally', line: ['{船|ふね} が {着|つ}いたら 、 すぐ {数|かぞ}える の ！ {台|だい} に {並|なら}べる {前|まえ} に ね 。', 'When a boat comes in, I count straight away! Before it goes out on the stall.'] },
    { map: 'sz.hamlet', x: 36, y: 8, dir: 'up', line: ['{郵便|ゆうびん} の {配達|はいたつ} ！ {手紙|てがみ} が {来|き}た {日|ひ} は 、 {市|いち} より {忙|いそが}しい の よ 。', 'Delivering the post! The days the letters come are busier than market days.'] },
  ] });
  L.away('sazanami', 'sz_uki', { map: 'sz.hamlet', x: 29, y: 12, p: 'fw_note', line: ['{札|ふだ} 。 「{配達|はいたつ} {中|ちゅう} 。 {桟橋|さんばし} か 、 {家|いえ} を {回|まわ}って います 。 ウキ」', 'A card: "Out on my rounds. At the jetty, or going round the houses. —Uki"'] });
  L.routine('sazanami', 'sz_mina', { base: 'sz.hamlet:sz_mina', pin: 'quest.sz_school=0', slots: [
    { map: 'sz.hamlet', x: 10, y: 14, dir: 'up', line: ['ヨネ ばあちゃん の {結|むす}び{方|かた} を 、 {見|み}て {覚|おぼ}えてる の 。 {速|はや}くて 、 ぜんぜん {見|み}えない けど 。', 'I\'m learning Granny Yone\'s knots by watching. She\'s so fast I can\'t see a thing, though.'] },
    { map: 'sz.hamlet', x: 27, y: 17, dir: 'down', line: ['{貝殻|かいがら} を {探|さが}してる の 。 {空|から}っぽ の だけ だ よ 。 {中|なか} に {誰|だれ} か いる の は 、 {取|と}らない ！', 'I\'m looking for shells. Only empty ones! If someone lives inside, I don\'t take it!'] },
  ] });

  // ---- who can be asked after whom (W3) --------------------------------------------------------------------------------
  L.asks('sz_uki');
  L.knows('sz_uki', { sz_yone: 'routine', sz_isaku: 'routine', sz_mina: 'routine', sz_riku: 'routine', kiyo: 'loose', sota: 'loose' });
  L.asks('sz_isaku');
  L.knows('sz_isaku', { kiyo: 'routine', sota: 'routine', sz_uki: 'routine', sz_yone: 'routine', sz_mina: 'loose', sz_riku: 'loose' });
  L.asks('sz_yone');
  L.cold('sz_yone', ['{誰|だれ} が どこ に いる か なんて 、 この {目|め} じゃ {見|み}えない よ 。 {網|あみ} の {目|め} で {精一杯|せいいっぱい} さ 。', 'Who\'s where? These eyes can\'t see that far. The meshes of a net are as much as I can manage.']);
  L.usual('sz_yone', ['ヨネ さん は 、 {網|あみ} の {干|ほ}し{場|ば} か 、 {桟橋|さんばし} か 、 {網|あみ} の {小屋|こや} です よ 。', 'Yone? At the drying racks, or the jetty, or the net shed.']);
  L.usual('sz_uki', ['ウキ さん は 、 {市|いち} の {台|だい} か {桟橋|さんばし} です 。 {郵便|ゆうびん} の {日|ひ} は 、 {家|いえ} を {回|まわ}って います 。', 'Uki? Her stall, or the jetty. On post days she goes round the houses.']);
  L.usual('sz_mina', ['ミナ なら 、 {潮|しお}だまり か 、 {網|あみ} の ところ か 、 {浜|はま} で {貝殻|かいがら} を {探|さが}して います 。', 'Mina? The tide pools, or by the nets, or on the shingle hunting shells.']);
  L.usual('sz_isaku', ['イサク さん なら 、 {漣|さざなみ} の {桟橋|さんばし} の そば で {網|あみ} を {見|み}て います よ 。', 'Isaku? By the jetty at Sazanami, seeing to the nets.']);
  L.usual('sz_riku', ['リク なら 、 {岬|みさき} の {潮|しお}だまり に います よ 。', 'Riku? At the tide pools on the point.']);

  // ---- change beats (W1) ---------------------------------------------------------------------------------------------------
  // registered: the story and the pastimes already do these
  L.beat('sazanami', { id: 'boat', when: 'ed>=2&sea_boat', en: 'Your own boat can tie up at the jetty (sea/01_region.js).', jp: '{桟橋|さんばし} に 、 {自分|じぶん} の {船|ふね} 。' });
  L.beat('sazanami', { id: 'rocks', when: 'ed>=2&postgame', en: 'A fishing station on the rocks, after the story (zz_coast.js).', jp: '{岩場|いわば} に {釣|つ}り {場|ば} 。' });
  // new: the winter's storms, once Snowbell's story is over (Isaku said the storms bring all sorts in from the west)
  L.beat('sazanami', { id: 'storm', when: 'ch4_done', en: 'The winter storms: driftwood and a broken crate on the shingle; Yone mending the torn nets.', jp: '{冬|ふゆ} の {嵐|あらし} の {後|あと} 。 {浜|はま} に {流木|りゅうぼく} 。' });
  C.maps['sz.hamlet'].props.push({ p: 'sb_woodpile', x: 30, y: 18, if: 'ch4_done', scene: 'sz.lw_drift' }, { p: 'crate', x: 33, y: 18, if: 'ch4_done', scene: 'sz.lw_drift' });
  L.talk('sz.hamlet:sz_yone', [{ if: 'ch4_done&!seen.sz.lw_storm_yone', scene: 'sz.lw_storm_yone' }]);

  // ---- return keys (W6) --------------------------------------------------------------------------------------------------
  L.seal('sz_chest', { map: 'sz.hamlet', x: 20, y: 14, p: 'chest', needs: 'mod_sorezore', opens: 'lw_sz_chest',
    hint: ['{網|あみ} の {干|ほ}し{場|ば} の {端|はし} に 、 {古|ふる}い {箱|はこ} 。 {縄|なわ} が {三本|さんぼん} 、 {三|みっ}つ とも {違|ちが}う {結|むす}び{方|かた} で {縛|しば}って ある 。 {同|おな}じ よう に {引|ひ}く と 、 どれ も {締|し}まって しまう 。', 'An old box at the end of the drying racks, tied with three ropes, each in a different knot. Pull them all the same way, and every one only tightens.'],
    scene: 'sz.lw_open_chest', openedLabel: ['{網元|あみもと} の {箱|はこ}', 'The net-master\'s box'],
    after: { p: 'chest', scene: 'sz.lw_chest_after' } });
  L.seal('sz_charm', { map: 'sz.hamlet', x: 1, y: 12, p: 'shrine', needs: 'mod_arayuru', opens: 'lw_sz_charm',
    hint: ['{岬|みさき} の {小|ちい}さな {祠|ほこら} に 、 {古|ふる}い {札|ふだ} 。 「□□□□ {波|なみ} から {舟|ふね} を {守|まも}って ください 」 。 {最初|さいしょ} の {言葉|ことば} が 、 {潮風|しおかぜ} で {消|き}えて いる 。', 'An old charm in the little shrine on the point: "From □□□□ waves, protect our boats." The first word has been worn away by the salt wind.'],
    scene: 'sz.lw_open_charm', openedLabel: ['{岬|みさき} の {祠|ほこら} の {札|ふだ}', 'The charm on the point'],
    after: { p: 'shrine', scene: 'sz.lw_charm_after' } });
  L.seal('sz_rock', { map: 'sz.hamlet', x: 1, y: 19, p: 'rock', needs: 'ed>=2&sea_boat', opens: 'lw_sz_rock',
    hint: ['{沖|おき} の {岩|いわ} に 、 カモメ が {並|なら}んで いる 。 {岩|いわ} の {上|うえ} に {何|なに} か {彫|ほ}って ある よう だ が 、 {泳|およ}いで {行|い}ける {所|ところ} で は ない 。', 'Gulls stand in a row on a rock out at sea. Something seems to be carved on top of it, but it\'s too far to swim.'],
    scene: 'sz.lw_open_rock', openedLabel: ['カモメ の {岩|いわ}', 'The gull rock'],
    after: { p: 'rock', scene: 'sz.lw_rock_after' } });

  // ---- notes ---------------------------------------------------------------------------------------------------------------
  const note = (id, d) => (C.notes[id] = d);
  note('sz_lw_abari', { title: J('{網針|あばり}', 'The netting needle'), fiction: false,
    jp: '{網針|あばり} は 、 {網|あみ} を {手|て} で {結|むす}ぶ ため の {平|ひら}たい {針|はり} 。 {糸|いと} を {巻|ま}いて 、 {目|め} を {一|ひと}つ ずつ {結|むす}んで いく 。',
    en: 'A netting needle (網針, abari) is a flat needle, often of wood or bamboo, used to knot and mend nets by hand: the twine is wound on it, and each mesh is tied in turn. Real; net-menders still use them.' });
  note('sz_lw_charm', { title: J('{岬|みさき} の {祠|ほこら} の {札|ふだ}', 'The charm on the point'), fiction: true,
    jp: '{漣|さざなみ} の {岬|みさき} の {札|ふだ} 。 「あらゆる {波|なみ} から {舟|ふね} を {守|まも}って ください 」 。 {漁師|りょうし} は {沖|おき} へ {出|で}る {前|まえ} に 、 {頭|あたま} を {下|さ}げる 。',
    en: 'The charm in the little shrine on Sazanami\'s point: "From every kind of wave, protect our boats." The fishers bow to it before they put out.' });
  note('sz_lw_rock', { title: J('カモメ の {岩|いわ}', 'The gull rock'), fiction: true,
    jp: '{漣|さざなみ} の {沖|おき} の {岩|いわ} に 、 {小|ちい}さな {舟|ふね} が {七|なな}つ と 「{漣|さざなみ}」 の {字|じ} 。 {村|むら} を {開|ひら}いた {家|いえ} の {印|しるし} らしい 。',
    en: 'On the gull rock off Sazanami: seven little boats, each with its own mark, and the character 漣. Perhaps the marks of the families who first settled the hamlet.' });

  // ---- scenes --------------------------------------------------------------------------------------------------------------
  L.scenes(`
# ---- the winter's storms ------------------------------------------------------------------------------------------------
@scene sz.lw_drift
narr: {冬|ふゆ} の {嵐|あらし} が {運|はこ}んで きた {流木|りゅうぼく} と 、 {壊|こわ}れた {木箱|きばこ} 。 {西|にし} から {流|なが}れて きた もの らしい 。 || Driftwood and a broken crate, brought in by the winter storms. They seem to have drifted in from the west.

@scene sz.lw_storm_yone
!faceplayer
sz_yone: {冬|ふゆ} の {嵐|あらし} で 、 {村|むら} じゅう の {網|あみ} が {破|やぶ}れた よ 。 {春|はる} から ずっと {繕|つくろ}って いる の さ 。 || The winter storms tore every net in the hamlet. I've been mending since spring.
sz_yone: {目|め} は {悪|わる}く なって も 、 {仕事|しごと} は {減|へ}らない ね 。 …… ありがたい こと さ 。 || My eyes get worse, but the work never gets less. …Something to be thankful for.

# ---- return keys (W6) ------------------------------------------------------------------------------------------------------
@scene sz.lw_open_chest
# Opened with それぞれ (learned in Manybridge): three different knots, each undone its own way.
narr: {三|みっ}つ の {結|むす}び{目|め} は 、 {三|みっ}つ とも {違|ちが}う 。 {同|おな}じ やり{方|かた} で は 、 ほどけない 。 || Three knots, all different. Done one way, they will never come undone.
narr: {今|いま} は 「それぞれ」 を {知|し}って いる 。 {一|ひと}つ {目|め} は {引|ひ}いて 、 {二|ふた}つ {目|め} は {押|お}して 、 {三|みっ}つ {目|め} は {回|まわ}して 。 それぞれ の やり{方|かた} で ほどく と 、 {蓋|ふた} が {開|あ}いた 。 || But now you know それぞれ: each its own. The first you pull, the second you push through, the third you turn. Each undone its own way, and the lid comes up.
narr: {中|なか} に は 、 {木|き} の {網針|あばり} が {並|なら}んで いた 。 {平|ひら}たくて 、 {手|て} の {脂|あぶら} で {光|ひか}って いる 。 || Inside lie wooden netting needles in a row, flat and shining from years of hands.
sz_yone[surprise]: おや 、 それ を {開|あ}けた の かい 。 {昔|むかし} の {網元|あみもと} の {箱|はこ} だ よ 。 「{結|むす}び{目|め} を それぞれ ほどける {者|もの} だけ が 、 {網|あみ} を {繕|つくろ}える 」 って ね 。 || My, you opened that? It's the old net-master's box. "Only one who can undo each knot its own way can mend a net," he used to say.
sz_yone[smile]: {網針|あばり} は {箱|はこ} に {戻|もど}して おき な 。 {次|つぎ} に {開|あ}ける {子|こ} の ため に ね 。 || Put the needles back in the box. For the next youngster who opens it.
?(comp=nao) comp: {結|むす}び{目|め} {一|ひと}つ ずつ に 、 {宛先|あてさき} が ある みたい だ な 。 || As if each knot had its own address.
?(comp=mio) comp[smile]: {薬|くすり} と {同|おな}じ です ね 。 {一人|ひとり} {一人|ひとり} 、 {効|き}く もの が {違|ちが}う 。 || Like medicine. What works is different for each person.
?(comp=ren) comp: {同|おな}じ {手|て} で {全部|ぜんぶ} を {解|と}こう と する から 、 {締|し}まる の です ね 。 || They tighten because you try to undo them all the same way.
?(comp=suzu) comp[smile]: {役者|やくしゃ} も {同|おな}じ よ 。 {一人|ひとり} {一人|ひとり} 、 {頼|たの}み{方|かた} が {違|ちが}う の 。 || Actors are the same. Each one needs asking a different way.
!note sz_lw_abari

@scene sz.lw_chest_after
narr: {網元|あみもと} の {古|ふる}い {箱|はこ} 。 {網針|あばり} が {並|なら}んで いる 。 {縄|なわ} は 、 また {三|みっ}つ の {結|むす}び{方|かた} で {縛|しば}って ある 。 || The net-master's old box, the netting needles in their row. The ropes are tied again, each in its own knot.

@scene sz.lw_open_charm
# Opened with あらゆる (learned on Kotonoha): the worn word is four letters, and every kind of wave fits.
narr: {札|ふだ} の {最初|さいしょ} の {言葉|ことば} は 、 {四|よっ}つ の {字|じ} が {消|き}えて いる 。 || The charm's first word is four letters, worn away.
narr: {今|いま} は 「あらゆる」 を {知|し}って いる 。 どんな {種類|しゅるい} の もの でも 、 {全部|ぜんぶ} 。 {四|よっ}つ の {字|じ} に 、 ぴったり {合|あ}う 。 || Now you know あらゆる: every kind there is. Four letters. It fits exactly.
narr: {札|ふだ} に 、 {字|じ} を {書|か}き{足|た}した 。 「あらゆる {波|なみ} から {舟|ふね} を {守|まも}って ください 」 。 || You write it back onto the charm: "From every kind of wave, protect our boats."
sz_isaku: …… {爺|じい}さん たち が {言|い}って いた {札|ふだ} だ 。 {大波|おおなみ} も 、 {横波|よこなみ} も 、 {嵐|あらし} の {波|なみ} も 。 あらゆる {波|なみ} 、 か 。 また {読|よ}める よう に なって 、 よかった 。 || …The charm the old men used to talk about. Big waves, side waves, storm waves. Every kind of wave, eh. Good that it can be read again.
?(comp=nao) comp: {宛先|あてさき} が {読|よ}めない {手紙|てがみ} は 、 {届|とど}かない 。 {祈|いの}り も {同|おな}じ かも な 。 || A letter whose address can't be read never arrives. Maybe a prayer's the same.
?(comp=mio) comp[smile]: これ で 、 {海|うみ} の {神様|かみさま} に も ちゃんと {届|とど}きます ね 。 || Now it'll reach the gods of the sea properly.
?(comp=ren) comp: {言葉|ことば} が {一|ひと}つ {欠|か}ける と 、 {全部|ぜんぶ} が {意味|いみ} を {失|うしな}う 。 {灯籠|とうろう} の {名|な} と {同|おな}じ です 。 || Lose one word and the whole thing loses its meaning. Like a lantern's name.
?(comp=suzu) comp[smile]: {台詞|せりふ} の {頭|あたま} が {抜|ぬ}けたら 、 {芝居|しばい} は {始|はじ}まらない もの ね 。 || Drop the first word of a line and the play can't begin.
!note sz_lw_charm

@scene sz.lw_charm_after
narr: {岬|みさき} の {祠|ほこら} の {札|ふだ} 。 「あらゆる {波|なみ} から {舟|ふね} を {守|まも}って ください 」 。 {最初|さいしょ} の {言葉|ことば} は 、 あなた の {字|じ} だ 。 || The charm in the shrine on the point: "From every kind of wave, protect our boats." The first word is in your hand.

@scene sz.lw_open_rock
# Opened with the boat: out to the gull rock.
narr: {自分|じぶん} の {船|ふね} で 、 {沖|おき} の {岩|いわ} へ {出|で}た 。 カモメ が {一斉|いっせい} に {飛|と}び{立|た}つ 。 || You take your own boat out to the rock. The gulls lift off all at once.
narr: {岩|いわ} の {上|うえ} に 、 {小|ちい}さな {舟|ふね} の {絵|え} が {七|なな}つ {彫|ほ}って ある 。 {一|ひと}つ ずつ {違|ちが}う {印|しるし} 。 その {下|した} に 、 「{漣|さざなみ}」 の {一字|いちじ} 。 || Carved on top of the rock: seven little boats, each with a different mark. Beneath them, a single character: 漣, Sazanami.
narr: {最初|さいしょ} に ここ へ {来|き}た {七|なな}つ の {家|いえ} の {印|しるし} だろう か 。 || The marks of the seven families who first came here, perhaps.
!note sz_lw_rock

@scene sz.lw_rock_after
narr: {沖|おき} の カモメ の {岩|いわ} 。 {七|なな}つ の {舟|ふね} の {印|しるし} が 、 {岩|いわ} の {上|うえ} に ある 。 || The gull rock out at sea. The marks of seven boats are carved on its top.
`);

  // ---- Suzu's lines in Kansai-ben (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md) --------------------------------
  if (RB.dialect && RB.dialect.add) RB.dialect.add('kansai', `
@ zzz_living/22_sz [sz.lw_open_chest]
= {役者|やくしゃ} も {同|おな}じ よ 。 {一人|ひとり} {一人|ひとり} 、 {頼|たの}み{方|かた} が {違|ちが}う の 。 || Actors are the same. Each one needs asking a different way.
> {役者|やくしゃ} も {同|おな}じ や で 。 {一人|ひとり} {一人|ひとり} 、 {頼|たの}み{方|かた} が {違|ちが}う ねん 。 || Actors are the same, y'know. Each one needs asking a different way.
@ zzz_living/22_sz [sz.lw_open_charm]
= {台詞|せりふ} の {頭|あたま} が {抜|ぬ}けたら 、 {芝居|しばい} は {始|はじ}まらない もの ね 。 || Drop the first word of a line and the play can't begin.
> {台詞|せりふ} の {頭|あたま} が {抜|ぬ}けたら 、 {芝居|しばい} は {始|はじ}まらへん もん な 。 || Drop the first word of a line and the play can't begin.
`, 'zzz_living/22_sz.js');
})(RB.living);
