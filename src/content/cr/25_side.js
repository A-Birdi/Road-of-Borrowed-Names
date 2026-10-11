/* The Cloudroad, Chapter 10: the side stories (expansion P12e; R2's five side quests, E17 lasting outcomes, E3's
 * smuggler's favour). The quests, their items and the map wiring are here; the scenes are in 26_scenes_side.js, the
 * tasks in 35_side_learning.js.
 *   cr_seals    The Seven Seals: Tome's seal book, filled one station at a time by whoever keeps each station's
 *               seal (a real post-station and travel-stamp custom); each seal's picture says something about its
 *               place. Filled, it comes back to Tome, and the records keep a stand for it.
 *   cr_guest    The Inn That Lost Its Guest Book: at Nakayama the Matsuba says Tatsu booked with them, the Take says
 *               he slept there, and the Matsuba's guest book is gone. Kōsuke the merchant took it down the road by
 *               mistake and left it at Sakashita's inn; brought back, Tatsu's booking says when he had to arrive by
 *               (〜までに), and what that settles.
 *   cr_map      The Mapmaker's Wrong Map: Rin copied the ledge from an old sketch-map; asked to tell her, for three
 *               places, what you saw yourself and what you were told, so she can draw the two in different colours.
 *               Finished, it is also a Cartographer commission for the Atlas's board afterwards ("The wrong map").
 *   cr_pilgrim  The Pilgrim's Errand: Oshika, too old to climb above the cloud, asks you to take a rubbing of the
 *               carved seal on the stone at the pass in her pilgrim's book (rubbings of carved stones are a real
 *               custom); Kotonoha's story in her version (F-75's fourth telling) is in the wanderer's lines.
 *   cr_family   The Last Courier's Family: Sono, Genta's granddaughter, keeps the Courier's Inn at Sakashita and the
 *               family's version (he fell); after the letter is delivered, Heisuke comes to her inn to bow his head,
 *               and the old coins in the purse go where you help them decide, for good (E17, each end shown before
 *               it is chosen): to Sono's inn, to the relay, or to a stone for Genta at the couriers' hut.
 *   Ginji's favour (no quest of its own): at Kumoi the smuggler asks you to carry headache powder down to Chika's
 *               dispensary at Umagaeshi, past the Barrier that taxes it. You can say no.
 * Twelve-chapter journeys only (the Cloudroad is). Nothing here gates the main story. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const Q = (id, title, stages) => (C.quests[id] = { chapter: 'cr', title, stages, reward: { flags: [id + '_done'] } });
  Q('cr_seals', T('{七|なな}つ の {印|いん}', 'The Seven Seals'), [
    T('{追分|おいわけ} の トメ から 、 {印帳|いんちょう} を もらった 。 {宿場|しゅくば} ごと に 、 {宿|しゅく} の {印|いん} を {押|お}して もらおう 。', 'Tome at Oiwake gave you a seal book. Have each station\'s seal pressed in it.'),
    T('{七|なな}つ の {印|いん} が {揃|そろ}った 。 {追分|おいわけ} の トメ に {見|み}せよう 。', 'All seven seals. Show Tome at Oiwake.'),
  ]);
  Q('cr_guest', T('{宿帳|やどちょう} を なくした {宿|やど}', 'The Inn That Lost Its Guest Book'), [
    T('{松葉屋|まつばや} の {宿帳|やどちょう} が ない 。 {商人|しょうにん} の コウスケ が 、 {間違|まちが}えて {持|も}って {坂|さか} を {下|お}りた らしい 。', 'The Matsuba\'s guest book is missing. Kōsuke the merchant seems to have taken it down the road by mistake.'),
    T('{松葉屋|まつばや} の {宿帳|やどちょう} を {見|み}つけた 。 {中山|なかやま} の オタキ に {返|かえ}そう 。', 'You found the Matsuba\'s guest book. Take it back to Otaki at Nakayama.'),
  ]);
  Q('cr_map', T('{地図|ちず} {作|づく}り の {間違|まちが}った {地図|ちず}', 'The Mapmaker\'s Wrong Map'), [
    T('リン の {地図|ちず} の {崖道|がけみち} は 、 {古|ふる}い {絵図|えず} の {写|うつ}し だ 。 {上|うえ} へ {行|い}く {途中|とちゅう} 、 {自分|じぶん} で {見|み}た こと と {聞|き}いた こと を {覚|おぼ}えて おこう 。', 'Rin copied the ledge from an old sketch-map. On the way up, remember what you saw yourself and what you were told.'),
    T('{霧下|きりした} まで {来|き}た 。 {中山|なかやま} の リン に 、 {見|み}た こと と {聞|き}いた こと を {分|わ}けて {伝|つた}えよう 。', 'You\'ve come as far as Kirishita. Tell Rin at Nakayama what you saw and what you heard, kept apart.'),
  ]);
  Q('cr_pilgrim', T('{巡礼|じゅんれい} の {頼|たの}み', 'The Pilgrim\'s Errand'), [
    T('オシカ の {納経帳|のうきょうちょう} を {預|あず}かった 。 {峠|とうげ} の {石|いし} の {印|いん} を {写|うつ}して {来|こ}よう 。', 'You are carrying Oshika\'s pilgrim book. Take a rubbing of the seal carved on the stone at the pass.'),
    T('{峠|とうげ} の {石|いし} の {印|いん} を {写|うつ}した 。 {杉|すぎ}ノ{木|き} の オシカ に {返|かえ}そう 。', 'You took the rubbing at the pass. Give the book back to Oshika at Suginoki.'),
  ]);
  Q('cr_family', T('{最後|さいご} の {飛脚|ひきゃく} の {家族|かぞく}', 'The Last Courier\'s Family'), [
    T('{飛脚宿|ひきゃくやど} の ソノ は 、 ゲンタ の {孫|まご} だ 。 {宿場|しゅくば} で は 、 ゲンタ が {金|かね} を {持|も}って {逃|に}げた と {言|い}われて いる 。', 'Sono at the Courier\'s Inn is Genta\'s granddaughter. At the station they say Genta ran off with the money.'),
    T('ヘイスケ が 、 ソノ の {宿|やど} で {待|ま}って いる 。 {財布|さいふ} の {古|ふる}い {金|かね} を どう する か 、 {一緒|いっしょ} に {決|き}めよう 。', 'Heisuke is waiting at Sono\'s inn. Decide with them what becomes of the old coins in the purse.'),
  ]);

  const it = (id, d) => (C.items[id] = d);
  it('cr_sealbook', { name: T('{印帳|いんちょう}', 'The seal book'), key: true, desc: 'A little folding book of plain pages from Tome at Oiwake: one page for each station\'s seal, from the bottom of the Cloudroad to the top.' });
  it('cr_guestbook', { name: T('{松葉屋|まつばや} の {宿帳|やどちょう}', 'The Matsuba\'s guest book'), key: true, desc: 'A guest book with a pine-needle crest on its cover: the Matsuba\'s, at Nakayama. Kōsuke the merchant carried it off by mistake.' });
  it('cr_pilgrimbook', { name: T('{納経帳|のうきょうちょう}', 'Oshika\'s pilgrim book'), key: true, desc: 'An old pilgrim\'s book, soft with use: a seal or a rubbing on every page, from temples and shrines all over the country. One page is left for the stone at the Cloudroad Pass.' });
  it('cr_parcel', { name: T('{薬|くすり} の {包|つつ}み', 'A parcel of medicine'), key: true, desc: 'Headache powder from beyond the pass, wrapped in oiled paper, from Ginji for Chika\'s dispensary at Umagaeshi.' });

  // Oshika, after the shrine path (she/her): at Suginoki under the great cedar. Ginji (he/him) waits at Kumoi.
  const M = (id) => C.maps[id];
  M('cr.suginoki').npcs.push({ id: 'cr_oshika', x: 17, y: 16, dir: 'left', if: 'cr_oshika_met', talk: [{ if: 'quest.cr_pilgrim=done', scene: 'cr.oshika_after' }, { if: 'cr_pilgrim_rubbed', scene: 'cr.pilgrim_done' }, { if: 'item.cr_pilgrimbook', scene: 'cr.pilgrim_wait' }, { scene: 'cr.oshika' }] });
  M('cr.kumoi').npcs.push({ id: 'cr_ginji', x: 26, y: 16, dir: 'left', if: 'cr_ginji_met&!cr_ginji_gone', talk: [{ if: 'cr_ginji_asked', scene: 'cr.ginji_idle' }, { scene: 'cr.ginji' }] });
  // Heisuke at Sono's inn once the letter is delivered, until the coins are decided
  M('cr.saka_inn').npcs.push({ id: 'cr_heisuke', x: 7, y: 4, dir: 'left', if: 'cr_delivered&!quest.cr_family=done', talk: 'cr.family' });

  // talk entries, placed after the main story's own (which are first in each list) and before the after-chapter lines
  const npc = (mapId, id) => ((M(mapId) || {}).npcs || []).find((n) => n.id === id);
  const insert = (mapId, id, entry) => {
    const p = npc(mapId, id);
    if (!p) return;
    if (!Array.isArray(p.talk)) p.talk = [{ scene: p.talk }];
    const i = p.talk.findIndex((t) => t.if === 'cr_done');
    p.talk.splice(i < 0 ? p.talk.length - 1 : i, 0, entry);
  };
  // The Seven Seals: who keeps each station's seal (Tome's own is pressed when she gives the book)
  const SEALS = [[2, 'cr.suginoki', 'cr_ine'], [3, 'cr.sakashita', 'cr_heisuke'], [4, 'cr.nakayama', 'cr_otaki'], [5, 'cr.umagaeshi', 'cr_genji'], [6, 'cr.kirishita', 'cr_sue'], [7, 'cr.kumoi', 'cr_shizu']];
  for (const [n, map, who] of SEALS) {
    const entry = { if: 'item.cr_sealbook&!cr_seal' + n + (n === 7 ? '&!cr_fetching' : ''), scene: 'cr.seal' + n };
    // before the after-chapter lines, so the book can be filled after the chapter too
    const p = npc(map, who);
    if (p && Array.isArray(p.talk)) p.talk.unshift(entry);
  }
  insert('cr.oiwake', 'cr_tome', { if: 'cr_seal1&cr_seal2&cr_seal3&cr_seal4&cr_seal5&cr_seal6&cr_seal7&!quest.cr_seals=done', scene: 'cr.seals_done' });
  // The Inn That Lost Its Guest Book
  insert('cr.nakayama', 'cr_otaki', { if: 'item.cr_guestbook', scene: 'cr.guest_settle' });
  insert('cr.nakayama', 'cr_otaki', { if: 'cr_st4&!cr_guest_started', scene: 'cr.guest_start' });
  // The Mapmaker's Wrong Map
  insert('cr.nakayama', 'cr_rin', { if: 'cr_map_started&cr_st6&!quest.cr_map=done', scene: 'cr.map_report' });
  insert('cr.nakayama', 'cr_rin', { if: 'cr_map_started&!quest.cr_map=done', scene: 'cr.map_wait' });
  // The Last Courier's Family: Sono, before and after the chapter's end
  insert('cr.saka_inn', 'cr_sono', { if: 'cr_delivered&!quest.cr_family=done', scene: 'cr.family_sono' });
  // Ginji's parcel at Chika's
  insert('cr.umagaeshi', 'cr_chika', { if: 'item.cr_parcel', scene: 'cr.parcel' });

  // a stone for Genta at the couriers' hut, if that is where the coins went
  M('cr.hut').props.push({ p: 'stone_marker', x: 22, y: 15, if: 'cr_family_stone', scene: 'cr.genta_stone' });

  // Rin's commission on the Atlas's board afterwards is in src/atlas/80_commissions.js (THEMED 'wrongmap', `if`)
})(RB.content);
