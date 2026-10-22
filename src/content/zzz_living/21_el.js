/* East Landing's Living World (C-87; docs/future/work/LW1_AUTHORING.md, LW1_ROLLOUT.md; plan 06_WORLD.md W1-W3, W6).
 * One map, the landing; its routines run once it is rebuilt and the bell rings again (`el_done`).
 *   Routines (W2): Genroku at the jetty's head as before, sweeping the jetty itself in the mornings ("the sweeping's
 *     mine"), or mending the old boat drawn up on the slope (pinned while the coast's post is still for him); and,
 *     once the city boats put in (below), Gonsuke the Manybridge boatman at his boat or resting on the bench.
 *   Asking after people (W3): Gonsuke knows the landing and his partner Matsuzō on Saltglass's quay; Genroku won't
 *     gossip.
 *   Change beats (W1): registered, the landing's own changes while you are away (the channel dug, the jetty
 *     planked: el.progress); new, the city boats after Playhouse Row's festival (`mb2_done`: Gonsuke's boat, his cargo,
 *     Genroku's word on it) and Genroku's winter at the Seto house once Snowbell's story is over (`ch4_done`, the post
 *     having reached him: a post box by the path, his word on it).
 *   No road events: East Landing has no road map of its own (it is reached round Saltglass's east beach, or by sea;
 *     the coast road's events are Saltglass's, the sea's are its own situations).
 *   Return keys (W6): the heron on the old post (待つ), the carved stone at the cliff's foot (ごとに), the broken mould
 *     by the old footings (全体). */
var RB = (globalThis.RB = globalThis.RB || {});
(function (L) {
  'use strict';
  const C = RB.content;
  const J = (jp, en) => ({ jp, en });

  RB.lex.add(RB.lex.parseTable(`
鷺|さぎ|n|A|a heron
油紙|あぶらがみ|n|A|oiled paper (wrapping against water)
見張り台|みはりだい|n|I|a lookout (a place to keep watch from)
相棒|あいぼう|n|I|a partner, a mate (in work)
川船|かわぶね|n|A|a river boat
天井桟敷|てんじょうさじき|n|A|the gallery, the "gods" (the cheapest, highest seats in a theatre)
旨い|うまい|adj-i|I|tasty, good (of food; plain, rather rough)
睨む|にらむ|v5m|I|to glare at
藪|やぶ|n|I|a thicket, scrub
何十本|なんじゅっぽん|n|I|dozens (of lines, of long things)
`));

  // ---- the town ------------------------------------------------------------------------------------------------------
  L.town('eastlanding', { maps: ['el.landing'], care: ['mb2_done', 'ch4_done', 'ko_done', 'cr_done', 'yn_done'], after: 'el_done' });

  // ---- the city boats (a change beat, below): Gonsuke, his boat and his cargo -----------------------------------------
  const TRADE = 'el_done&mb2_done';
  C.chars.el_gonsuke = {
    // Gonsuke: a Manybridge boatman who brings the print-sellers' goods down the coast; easy-going, sunburnt
    name: { en: 'Gonsuke', jp: 'ゴンスケ' }, voice: { pitch: 0.84 },
    look: { skin: 4, hair: 'short', hairColor: 1, cloth: ['#5a6a7a', '#465462', '#d8c8a0'], shape: 'tunic', acc: ['headband'], bandCol: '#d8c8a0' },
    portrait: { eyes: 'sharp', style: 'short', acc: ['headband'], bandCol: '#d8c8a0', bg: '#26303a' },
  };
  const M = C.maps['el.landing'];
  M.props.push({ p: 'boat', x: 16, y: 16, if: TRADE, scene: 'mp.lw_el_boat' },
    { p: 'crate', x: 15, y: 11, if: TRADE, scene: 'mp.lw_el_boat' }, { p: 'barrel', x: 16, y: 11, if: TRADE });
  M.npcs.push({ id: 'el_gonsuke', x: 18, y: 16, dir: 'left', if: TRADE, perform: 'mend', talk: [
    { if: '!seen.mp.lw_el_gonsuke_first', scene: 'mp.lw_el_gonsuke_first' }, { scene: 'mp.lw_el_gonsuke_idle' }] });

  // ---- routines (W2) ---------------------------------------------------------------------------------------------------
  L.routine('eastlanding', 'el_genroku', { base: 'el.landing:el_genroku', pin: 'item.sea_mailbag&!sea_post_el', slots: [
    { map: 'el.landing', x: 18, y: 13, dir: 'down', perform: 'sweep', line: ['{朝|あさ} は {桟橋|さんばし} を {掃|は}く 。 {約束|やくそく} だ から な 。 {掃|は}く の は 、 わし だ 。', 'Mornings, I sweep the jetty. That was the bargain. The sweeping\'s mine.'] },
    { map: 'el.landing', x: 8, y: 12, dir: 'left', perform: 'mend', line: ['{古|ふる}い {舟|ふね} だ が 、 まだ {浮|う}く 。 {直|なお}して おけば 、 {誰|だれ} か が {使|つか}う 。', 'Old boat, but she still floats. Mend her, and somebody\'ll use her.'] },
  ] });
  L.routine('eastlanding', 'el_gonsuke', { base: 'el.landing:el_gonsuke', slots: [
    { map: 'el.landing', x: 26, y: 9, dir: 'left', line: ['この ベンチ で {一休|ひとやす}み 。 {爺|じい}さん が {掃|は}いた {後|あと} は 、 {砂|すな} {一粒|ひとつぶ} ない ん だ 。', 'A rest on this bench. Once the old man\'s swept, there\'s not a grain of sand.'] },
  ] });
  // Gonsuke's own place carries work too (the routine's slots are added to the manifest by L.routine)
  C.work.push({ map: 'el.landing', id: 'el_gonsuke', char: 'el_gonsuke', act: 'mend', why: 'the Manybridge boatman, seeing to his boat at the jetty' });

  // ---- who can be asked after whom (W3) --------------------------------------------------------------------------------
  L.asks('el_gonsuke');
  L.knows('el_gonsuke', { el_genroku: 'routine', sg_matsuzo: 'routine', cs_seto: 'loose', cs_hama: 'loose', daigo: 'loose', tetsu: 'loose' });
  L.asks('el_genroku');
  L.cold('el_genroku', ['{人|ひと} の {噂|うわさ} は せん@する 。 {掃|は}く の で {忙|いそが}しい 。', 'I don\'t gossip. I\'m busy sweeping.']);
  L.usual('el_genroku', ['ゲンロク さん なら 、 {東|ひがし} の {渡|わた}し{場|ば} から {動|うご}きません よ 。 {掃|は}いて いる か 、 {舟|ふね} を {直|なお}して いる か 。', 'Genroku never leaves East Landing. Sweeping, or mending a boat.']);
  L.usual('el_gonsuke', ['ゴンスケ さん は 、 {東|ひがし} の {渡|わた}し{場|ば} に {船|ふね} を {着|つ}けて います よ 。', 'Gonsuke? At East Landing, with the boat tied up.']);
  L.usual('cs_seto', ['セト さん は 、 {丘|おか} の {上|うえ} の {家|いえ} の {前|まえ} に いる でしょう 。', 'Seto will be outside the house on the hill.']);

  // ---- change beats (W1) ---------------------------------------------------------------------------------------------------
  // registered: the landing's own rebuilding, finished while you were away (el.progress)
  L.beat('eastlanding', { id: 'channel', when: 'el_channel', en: 'The channel dug out while you were away: deep water into the inlet (el.progress).', jp: '{水路|すいろ} が {掘|ほ}られて いる 。' });
  L.beat('eastlanding', { id: 'jetty', when: 'el_jetty', en: 'New planks on the jetty, laid while you were away (el.progress).', jp: '{桟橋|さんばし} に {新|あたら}しい {板|いた} 。' });
  // new: the city boats after the festival
  L.beat('eastlanding', { id: 'trade', when: TRADE, en: 'City boats put in at the landing: Gonsuke\'s boat from Manybridge, with the print-sellers\' goods.', jp: '{八百橋|やおばし} の {船|ふね} が {着|つ}く よう に なった 。' });
  L.talk('el.landing:el_genroku', [{ if: TRADE + '&!seen.mp.lw_el_genroku_trade', scene: 'mp.lw_el_genroku_trade' }]);
  // new: Genroku's winter at the Seto house, once Snowbell's winter is over (he said he would go: el.genroku_after)
  const WINTER = 'el_done&sea_post_el&ch4_done';
  L.beat('eastlanding', { id: 'winter', when: WINTER, en: 'Genroku back from his winter at the Seto house; a post box by the path, "East Landing" in Seto\'s hand.', jp: '{道|みち} の {横|よこ} に 、 {郵便|ゆうびん} {箱|ばこ} 。' });
  M.props.push({ p: 'mailbox', x: 16, y: 8, if: WINTER, scene: 'el.lw_postbox' });
  L.talk('el.landing:el_genroku', [{ if: WINTER + '&!seen.el.lw_el_genroku_winter', scene: 'el.lw_el_genroku_winter' }]);

  // ---- return keys (W6) --------------------------------------------------------------------------------------------------
  L.seal('el_heron', { map: 'el.landing', x: 24, y: 13, p: 'sg_bollard', needs: 'c_wait', opens: 'lw_el_heron',
    hint: ['{入|い}り{江|え} の {古|ふる}い {杭|くい} に 、 {鷺|さぎ} が {一羽|いちわ} {立|た}って いる 。 {近|ちか}づく と {睨|にら}む 。 {杭|くい} の {輪|わ} に 、 {何|なに} か {挟|はさ}まって いる 。', 'A heron stands on an old post in the inlet. Come closer, and it glares. Something is wedged in the post\'s ring.'],
    scene: 'el.lw_open_heron', openedLabel: ['{杭|くい} の {輪|わ} の {包|つつ}み', 'The packet in the post\'s ring'],
    after: { p: 'sg_bollard', scene: 'el.lw_heron_after' } });
  L.seal('el_lookout', { map: 'el.landing', x: 27, y: 3, p: 'stone_marker', needs: 'mod_goto', opens: 'lw_el_lookout',
    hint: ['{崖|がけ} の {下|した} の {石|いし} に 、 「{十歩|じっぽ} ごと に {折|お}り{返|かえ}す 」 と {彫|ほ}って ある 。 {藪|やぶ} の {中|なか} の {細|ほそ}い {道|みち} は 、 すぐ {分|わ}からなく なる 。', 'A stone at the foot of the cliff carries an instruction about ten paces (十歩ごとに…). The thin path into the scrub is lost almost at once.'],
    scene: 'cr.lw_open_el_lookout', openedLabel: ['{崖|がけ} の {上|うえ} の {見張|みは}り{台|だい}', 'The lookout on the headland'],
    after: { p: 'stone_marker', scene: 'el.lw_lookout_after' } });
  L.seal('el_mould', { map: 'el.landing', x: 23, y: 11, p: 'cs_footing', needs: 'mod_zentai', opens: 'lw_el_mould',
    hint: ['{砂|すな} から {古|ふる}い {石|いし} の {土台|どだい} が {覗|のぞ}いて いる 。 {周|まわ}り に 、 {割|わ}れた {型|かた} の {欠片|かけら} 。 {一|ひと}つ ずつ {見|み}て も 、 {何|なん} の {形|かたち} か {分|わ}からない 。', 'Old stone footings show through the sand, with pieces of a broken mould scattered round them. One by one, you can\'t tell what shape they made.'],
    scene: 'yn.lw_open_el_mould', openedLabel: ['{鐘|かね} の {型|かた}', 'The bell mould'],
    after: { p: 'cs_footing', scene: 'el.lw_mould_after' } });

  // ---- notes ---------------------------------------------------------------------------------------------------------------
  const note = (id, d) => (C.notes[id] = d);
  note('el_lw_timetable', { title: J('{最後|さいご} の {時刻表|じこくひょう}', 'The last timetable'), fiction: true,
    jp: '{東|ひがし} の {渡|わた}し{場|ば} の {最後|さいご} の {時刻表|じこくひょう} 。 {船|ふね} は {朝|あさ} と {夕|ゆう} 。 {船|ふね} の {前|まえ} に 、 {鐘|かね} を {三|みっ}つ {鳴|な}らした 。',
    en: 'East Landing\'s last timetable, from the day it closed thirty years ago: a boat each morning and evening, and three strokes of the bell before each.' });
  note('el_lw_lookout', { title: J('{崖|がけ} の {上|うえ} の {見張|みは}り{台|だい}', 'The lookout on the headland'), fiction: true,
    jp: '{渡|わた}し{場|ば} の {人|ひと} は 、 ここ から {沖|おき} の {船|ふね} を {見|み}て 、 {鐘|かね} を {鳴|な}らした 。 {船|ふね} を {見|み}つける ごと に 、 {石|いし} に {線|せん} を {一本|いっぽん} 。',
    en: 'From the stone lookout on the headland, the landing\'s keepers watched for boats and rang the bell when one was coming, and scratched a line on the stone for every boat they saw.' });
  note('el_lw_mould', { title: J('{鐘|かね} の {型|かた}', 'The bell mould'), fiction: true,
    jp: '{渡|わた}し{場|ば} の {鐘|かね} の {型|かた} は 、 {工房|こうぼう} が {港|みなと} へ {移|うつ}る {日|ひ} に {割|わ}られた 。 {渡|わた}し{場|ば} {一|ひと}つ に 、 {鐘|かね} {一|ひと}つ 。',
    en: 'The mould the landing\'s bell was cast in was broken the day the bell workshop moved to the stone quay: one landing, one bell. The bell Genroku kept is the only one there is.' });

  // ---- scenes --------------------------------------------------------------------------------------------------------------
  L.scenes(`
# ---- the city boats -----------------------------------------------------------------------------------------------------
@scene mp.lw_el_boat
narr: {八百橋|やおばし} の {船|ふね} 。 {荷|に} は 、 {刷|す}り{物|もの} の {束|たば} と {紙|かみ} の {箱|はこ} 。 || A Manybridge boat, loaded with bundles of prints and boxes of paper.

@scene mp.lw_el_gonsuke_first
!faceplayer
el_gonsuke: よう 。 {八百橋|やおばし} から {荷|に} を {積|つ}んで {来|き}た ん だ 。 {祭|まつ}り の {後|あと} は 、 {刷|す}り{物|もの} が よく {売|う}れる から な 。 || Hey. Brought a load down from Manybridge. Prints sell well after the festival.
el_gonsuke: {潮硝子|しおがらす} の {岸壁|がんぺき} は {混|こ}んでる 。 ここ なら {鐘|かね} も {鳴|な}る し 、 {静|しず}か だ 。 {爺|じい}さん に は {毎朝|まいあさ} {怒|おこ}られる けど な 。 || Saltglass's stone quay is crowded. Here there's the bell, and it's quiet. The old man tells me off every morning, mind.
el_gonsuke: マツゾウ は {港|みなと} で {店|みせ} を {出|だ}してる 。 {刷|す}り{物|もの} {売|う}り の {相棒|あいぼう} さ 。 || Matsuzō's set up shop at the harbour. My partner in the print trade.

@scene mp.lw_el_gonsuke_idle
!faceplayer
el_gonsuke: {潮|しお} が {変|か}わったら 、 {八百橋|やおばし} へ {戻|もど}る 。 また {来|く}る さ 。 あの {鐘|かね} が {聞|き}こえる うち は な 。 || When the tide turns I head back to Manybridge. I'll be back. As long as I can hear that bell.

@scene mp.lw_el_genroku_trade
!faceplayer
el_genroku: …… {町|まち} の {船|ふね} が {寄|よ}る よう に なった 。 {鐘|かね} を {聞|き}いて な 。 || …City boats have started putting in. They hear the bell.
el_genroku: {騒|さわ}がしい {連中|れんちゅう} だ 。 {桟橋|さんばし} を {汚|よご}したら 、 {掃|は}かせる ぞ 。 …… ふん 。 {渡|わた}し{場|ば} に は 、 {船|ふね} が {来|こ}ない と な 。 || A noisy lot. If they mess up my jetty, they'll sweep it. …Hmph. A landing needs boats.

# ---- Genroku's winter -----------------------------------------------------------------------------------------------------
@scene el.lw_postbox
narr: {新|あたら}しい {郵便|ゆうびん} {箱|ばこ} 。 {丁寧|ていねい} な {字|じ} で 「{東|ひがし} の {渡|わた}し{場|ば}」 と {書|か}いて ある 。 || A new post box, "East Landing" written on it in a careful hand.

@scene el.lw_el_genroku_winter
!faceplayer
el_genroku: {冬|ふゆ} は 、 セト の {家|いえ} で {過|す}ごした 。 {暖|あたた}かくて 、 {飯|めし} が {旨|うま}くて …… {落|お}ち{着|つ}かなかった わい 。 || I spent the winter at the Seto house. Warm, good food, and… I couldn't settle.
el_genroku: セト の {孫娘|まごむすめ} が 、 {郵便|ゆうびん} {箱|ばこ} を {作|つく}って くれた 。 {船|ふね} が {手紙|てがみ} を {持|も}って くる から 、 だ と さ 。 …… ふん 。 {悪|わる}く ない 。 || The Seto girl made me a post box. Because the boat brings letters now, she says. …Hmph. Not bad.

# ---- return keys (W6) ------------------------------------------------------------------------------------------------------
@scene el.lw_open_heron
# Opened with 待つ (the "wait" response learned in Manybridge): the heron is not a thing to chase.
narr: {鷺|さぎ} は {動|うご}かない 。 {近|ちか}づけば {睨|にら}む 。 {追|お}い{払|はら}おう と すれば 、 かえって {動|うご}かなく なる 。 || The heron won't move. Go closer and it glares; try to chase it off, and it only digs in.
narr: でも 、 {今|いま} は {待|ま}つ こと を {知|し}って いる 。 {何|なに} も しない で 、 ただ {待|ま}った 。 || But now you know how to wait. You do nothing at all, and simply wait.
narr: しばらく して 、 {鷺|さぎ} は {首|くび} を {縮|ちぢ}め 、 {入|い}り{江|え} の {向|む}こう へ {飛|と}んで いった 。 {杭|くい} の {鉄|てつ} の {輪|わ} に 、 {油紙|あぶらがみ} の {包|つつ}み が {挟|はさ}まって いた 。 || After a while the heron draws in its neck and flies off across the inlet. Wedged in the post's iron ring is a little packet in oiled paper.
narr: {中|なか} は {古|ふる}い {時刻表|じこくひょう} 。 「{東|ひがし} の {渡|わた}し{場|ば} 　 {朝|あさ} と {夕|ゆう} 。 {船|ふね} の {前|まえ} に {鐘|かね} {三|みっ}つ 」 。 || Inside, an old timetable: "East Landing. Morning and evening. Three strokes of the bell before each boat."
el_genroku: …… {最後|さいご} の {時刻表|じこくひょう} だ 。 {閉|と}じた {日|ひ} に 、 {誰|だれ} か が {杭|くい} に {挟|はさ}んだ の か 。 …… {掲示板|けいじばん} に {貼|は}って おけ 。 {昔|むかし} の {思|おも}い{出|で} に な 。 || …The last timetable. Someone tucked it in the post the day we closed, eh. …Pin it on the board. For the old days' sake.
!note el_lw_timetable

@scene el.lw_heron_after
narr: {古|ふる}い {杭|くい} 。 {夕方|ゆうがた} に なる と 、 {鷺|さぎ} が また {戻|もど}って くる 。 {今|いま} は {睨|にら}まない 。 || The old post. Come evening, the heron is back on it. It doesn't glare any more.

@scene cr.lw_open_el_lookout
# Opened with ごとに (learned on the Cloudroad): turn back every ten paces, and the switchbacks lead up the cliff.
narr: {石|いし} に は 「{十歩|じっぽ} ごと に {折|お}り{返|かえ}す 」 と {彫|ほ}って ある 。 || The stone says: 「十歩ごとに折り返す」.
narr: 「ごと に」 は 、 {雲路|くもじ} で {覚|おぼ}えた 。 {十歩|じっぽ} {歩|ある}く たび に 、 {向|む}き を {変|か}える 。 {藪|やぶ} の {中|なか} の {細|ほそ}い {道|みち} が 、 {崖|がけ} を {折|お}れ{曲|ま}がって {上|のぼ}って いく 。 || ごとに: every, each time. You learned it on the Cloudroad. Every ten paces, turn back the other way: the thin path through the scrub zigzags up the cliff.
narr: {上|うえ} に は 、 {石|いし} を {積|つ}んだ {見張|みは}り{台|だい} が あった 。 {西|にし} に {潮硝子|しおがらす} の {灯台|とうだい} 。 {沖|おき} の {船|ふね} が 、 {全部|ぜんぶ} {見|み}える 。 || At the top stands a lookout of piled stones. To the west, Saltglass's lighthouse. Every boat out at sea is in sight.
narr: {石|いし} に {線|せん} が {何十本|なんじゅっぽん} も {刻|きざ}んで ある 。 {船|ふね} を {見|み}つける ごと に 、 {一本|いっぽん} 。 || Dozens of lines are scratched into the stone. One for every boat spotted.
?(comp=nao) comp: {全部|ぜんぶ} の {船|ふね} が {見|み}える 。 {配達|はいたつ} の {順番|じゅんばん} を {決|き}める なら 、 ここ が {一番|いちばん} だ な 。 || Every boat in sight. If you were planning a delivery round, this would be the place.
?(comp=mio) comp[smile]: {風|かぜ} が {気持|きも}ち いい 。 {見張|みは}り の {人|ひと} も 、 きっと ここ が {好|す}き だった ん だ ね 。 || What a lovely wind. Whoever kept watch here must have loved it.
?(comp=ren) comp: {灯|ひ} の ない {頃|ころ} の 、 {目|め} の {灯台|とうだい} です ね 。 || A lighthouse made of eyes, from before there were lamps.
?(comp=suzu) comp[smile]: {天井桟敷|てんじょうさじき} ね 。 {一番|いちばん} {安|やす}くて 、 {一番|いちばん} よく {見|み}える {席|せき} よ 。 || The gods, way up top. The cheapest seats, and the best view.
!note el_lw_lookout

@scene el.lw_lookout_after
narr: {崖|がけ} の {下|した} の {石|いし} 。 {十歩|じっぽ} ごと に {折|お}り{返|かえ}せば 、 {見張|みは}り{台|だい} へ {登|のぼ}れる 。 || The stone at the foot of the cliff. Turn back every ten paces, and you can climb to the lookout.

@scene yn.lw_open_el_mould
# Opened with 全体 (learned in Steamhollow): the pieces read as one whole are a bell mould.
narr: {割|わ}れた {型|かた} の {欠片|かけら} は 、 {一|ひと}つ ずつ {見|み}て も {分|わ}からない 。 || One by one, the pieces of the broken mould make no sense.
narr: {今|いま} は 「{全体|ぜんたい}」 を {知|し}って いる 。 {欠片|かけら} を {並|なら}べて 、 {全体|ぜんたい} を {一|ひと}つ の もの と して {見|み}た 。 || Now you know 全体: the whole, taken as one. You lay the pieces together and look at them as a single thing.
narr: {鐘|かね} の {型|かた} だった 。 {肩|かた} の ところ に 、 {波|なみ} の {線|せん} が {一本|いっぽん} 。 ゲンロク の {鐘|かね} と {同|おな}じ {線|せん} だ 。 || It is a bell mould. Round its shoulder runs a single wavy line: the same line as on Genroku's bell.
el_genroku: …… {渡|わた}し{場|ば} の {鐘|かね} の {型|かた} だ 。 {工房|こうぼう} が {出|で}て いく {日|ひ} に 、 {親方|おやかた} が {割|わ}った 。 {渡|わた}し{場|ば} {一|ひと}つ に 、 {鐘|かね} {一|ひと}つ 、 と な 。 || …The mould for the landing's bell. The day the workshop left, the master broke it. One landing, one bell, he said.
el_genroku: だから 、 わし が {磨|みが}いて きた 。 …… それ で いい 。 || So I kept it polished. …That'll do.
!note el_lw_mould

@scene el.lw_mould_after
narr: {鐘|かね} の {型|かた} の {欠片|かけら} が 、 {元|もと} の {形|かたち} に {並|なら}べて ある 。 {肩|かた} に 、 {波|なみ} の {線|せん} 。 || The pieces of the bell mould, laid out in their shape. A wavy line round the shoulder.
`);

  // ---- Suzu's lines in Kansai-ben (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md) --------------------------------
  if (RB.dialect && RB.dialect.add) RB.dialect.add('kansai', `
@ zzz_living/21_el [cr.lw_open_el_lookout]
= {天井桟敷|てんじょうさじき} ね 。 {一番|いちばん} {安|やす}くて 、 {一番|いちばん} よく {見|み}える {席|せき} よ 。 || The gods, way up top. The cheapest seats, and the best view.
> {天井桟敷|てんじょうさじき} や な 。 {一番|いちばん} {安|やす}くて 、 {一番|いちばん} よく {見|み}える {席|せき} や で 。 || The gods, way up top. The cheapest seats, and the best view, y'know.
`, 'zzz_living/21_el.js');
})(RB.living);
