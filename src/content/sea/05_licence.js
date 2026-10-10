/* A Licence for the Open Sea (expansion P11b; plan 06_WORLD.md W7; docs/future/work/P11_SEA.md). Harbourmaster Ōmi's
 * long quest, from Chapter 2's end into the middle chapters: the boat that sailing (src/engine/72v_sail.js) is about.
 * Twelve-chapter journeys only. The scenes are in 22_scenes_licence.js, the tasks in 31_licence_learning.js.
 *
 *   0  the deal        Ōmi needs a little post boat for the coast: mend an old hull and earn a licence, and she is yours
 *                      to sail, carrying the coast's post. Fuku's Chidori-maru, if Fuku will (her choice: once her
 *                      husband's boat has its name back, gladly; until then she cannot hand over a boat whose name she
 *                      has lost, and the harbour's old pilot boat is there instead). var.sea_hull: chidori | pilot.
 *   1  the yards       the hull is towed to Manybridge, to Kajirō's yard by the ferry pier (the shut house there opens
 *                      in twelve-chapter journeys).
 *   2  two favours     Kajirō's planking went to the wrong warehouse (read the delivery note; Take the porter carts it
 *                      once he is shown where), and Nui the sail-maker cannot read his order (read her the
 *                      measurements). Flags sea_f_timber, sea_f_sail.
 *   3  the name        once both favours are done the player names the boat in kana (or keeps ちどり), and the stage
 *                      begins; Blockprint Row's printers paint the yards' names, so Sōbē checks the letters first (his
 *                      apprentice's practice board); then Sanpei and Miyo paint it at the yard. Flags sea_named,
 *                      sea_sign_ok.
 *   4  sea trials      at Saltglass once Playhouse Row's festival is over (Tetsu runs the ferry day and night until
 *                      then): Tetsu's sea words (帆 舵 錨 潮 風向き), Shiori's tide book, and a trial round the mark off
 *                      the point (var.sea_trial 1 out, 2 rounded). Flags sea_words, sea_tide, sea_trial_done.
 *   5  the licence     Ōmi's examination: the form, and an interview in an examiner's register; a wrong answer is
 *                      explained and asked again at once. The boat is yours (sea_boat).
 *   6  the maiden voyage  the coast's post (Ōmi's mailbag) to Uki's stall at Sazanami and to Genroku at East Landing
 *                      (src/content/sz/, src/content/el/); flags sea_post_sz, sea_post_el.
 *   7  the island     Isaku's nets at Sazanami: after the winter (Snowbell's story) they bring up written leaves
 *                      from out west (sea_ko_hint: Kotonoha joins the chart).
 *   8  the voyage west to the island; arriving there by boat finishes the quest (the island's first landing, if it
 *                      is the first, is its early visit).
 * Nothing here gates the main story; the quest can be finished after it. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C, K) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  const at = (o, a) => Object.assign(o, { at: a });

  C.quests.sea_licence = {
    chapter: 'sea', title: T('{外海|そとうみ} の {免状|めんじょう}', 'A Licence for the Open Sea'),
    stages: [
      at(T('フク さん に 、 {亡|な}くなった {旦那|だんな} さん の {船|ふね} の こと を {聞|き}いて みよう 。', 'Ask Fuku about her late husband\'s boat.'), { map: 'sg.harbor', npc: 'fuku' }),
      at(T('{船|ふね} は {八百橋|やおばし} の {造船所|ぞうせんじょ} へ {運|はこ}ばれた 。 {渡|わた}し{場|ば} の {横|よこ} の {船大工|ふなだいく} 、 カジロウ を {訪|たず}ねよう 。', 'The hull has been towed to Manybridge. Find Kajirō the shipwright, in the yard by the ferry pier.'), { map: 'mb.yard', npc: 'sea_kajiro' }),
      at(T('カジロウ と {帆|ほ}{縫|ぬ}い の ヌイ に 、 {一|ひと}つ ずつ {手|て} を {貸|か}そう 。 {行方|ゆくえ} {不明|ふめい} の {板|いた} と 、 {帆|ほ} の {寸法|すんぽう} 。', 'Do Kajirō and Nui the sail-maker a favour each: the planking that went astray, and the sail\'s measurements.'), { map: 'mb.yard' }),
      at(T('{船|ふね} の {名前|なまえ} は {決|き}まった 。 {字|じ} を {書|か}く の は 、 {版木|はんぎ}{通|どお}り の ソウベエ の {店|みせ} の {仕事|しごと} だ 。', 'The boat has her name. Painting the letters is the work of Sōbē\'s print shop on Blockprint Row.'), { map: 'mp.workshop', npc: 'mp_sobe' }),
      at(T('{試|ため}し{乗|の}り は 、 {潮硝子|しおがらす} で テツ と 。 {芝居|しばい} の {通|とお}り の {祭|まつ}り が {終|お}わる まで 、 テツ は {渡|わた}し{船|ぶね} で {忙|いそが}しい 。', 'Sea trials are at Saltglass, with Tetsu. Until Playhouse Row\'s festival is over, he is busy with the ferry.'), { map: 'sg.harbor', npc: 'tetsu' }),
      at(T('{港長|こうちょう} の オウミ の {試験|しけん} を {受|う}けよう 。 {書類|しょるい} と 、 {面接|めんせつ} 。', 'Take Harbourmaster Ōmi\'s examination: a form, and an interview.'), { map: 'sg.office', npc: 'omi' }),
      at(T('{初|はつ}{航海|こうかい} 。 {沿岸|えんがん} の {郵便|ゆうびん} を 、 {漣|さざなみ} の ウキ の {店|みせ} と 、 {東|ひがし} の {渡|わた}し{場|ば} の ゲンロク に {届|とど}けよう 。', 'The maiden voyage: carry the coast\'s post to Uki\'s stall at Sazanami and to Genroku at East Landing.'), [{ map: 'sz.hamlet', npc: 'sz_uki' }, { map: 'el.landing', npc: 'el_genroku' }]),
      at(T('{噂|うわさ} の {島|しま} 。 {漣|さざなみ} の イサク に 、 {海|うみ} が {何|なに} を {運|はこ}んで {来|く}る か {聞|き}こう 。', 'The island of the rumour. Ask Isaku at Sazanami what the sea brings in.'), { map: 'sz.hamlet', npc: 'sz_isaku' }),
      at(T('{字|じ} の {書|か}いた {葉|は} は 、 {西|にし} の {沖|おき} から {流|なが}れて {来|く}る 。 {海図|かいず} を {開|ひら}いて 、 {西|にし} の {島|しま} へ 。', 'The written leaves drift in from out west. Open the chart and sail for the island.'), { map: 'sz.hamlet', prop: 'boat', x: 22, y: 23 }),
    ],
    reward: { flags: ['sea_licence_done'] },
  };
  C.questOnly = C.questOnly || {};
  C.questOnly.sea_licence = 'ed>=2';

  const it = (id, d) => (C.items[id] = d);
  it('sea_timber_note', { name: T('{材木|ざいもく} の {送|おく}り{状|じょう}', 'The timber\'s delivery note'), key: true, desc: 'Kajirō\'s delivery note for the planking, with the warehouse it was left in worked out. Show it to Take the porter on the pier.' });
  it('sea_mailbag', { name: T('{郵便|ゆうびん}{袋|ぶくろ}', 'The coast\'s mailbag'), key: true, desc: 'Ōmi\'s canvas mailbag for the maiden voyage: a bundle for Sazanami, to go in the post box at Uki\'s stall, and one letter for East Landing.' });
  it('sea_licence_doc', { name: T('{外海|そとうみ} の {免状|めんじょう}', 'The licence for the open sea'), key: true, desc: 'Signed by Harbourmaster Ōmi of Saltglass: the boat, her master, and the coast\'s post she carries. Folded in oilcloth against the spray.' });

  // ---- the yard's people (twelve-chapter journeys) ---------------------------------------------------------------------
  // Kajirō: Manybridge's shipwright, old and sparing with words; he talks to hulls more than to people (he/him).
  C.chars.sea_kajiro = {
    name: { en: 'Kajirō', jp: 'カジロウ' }, voice: { pitch: 0.72 },
    look: { skin: 3, hair: 'shaved', hairColor: 6, cloth: ['#6a5a44', '#524634', '#d8c8a0'], shape: 'apron', acc: ['headband'], bandCol: '#d8c8a0', age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', acc: ['headband'], bandCol: '#d8c8a0', collar: 'apron', bg: '#2c261c' },
  };
  // Nui: the sail-maker in the yard's loft, quick with a needle, singing as she sews (she/her).
  C.chars.sea_nui = {
    name: { en: 'Nui', jp: 'ヌイ' }, voice: { pitch: 1.08 },
    look: { skin: 2, hair: 'ponytail', hairColor: 1, cloth: ['#c8b890', '#a8986e', '#4a6a8a'], shape: 'apron', acc: ['scarf'], scarfCol: '#4a6a8a' },
    portrait: { eyes: 'round', style: 'ponytail', collar: 'apron', bg: '#2a3240' },
  };

  // ---- the yard: the hull on the slip, the timber, Nui's sail loom ----------------------------------------------------
  C.maps['mb.yard'] = {
    name: T('{船大工|ふなだいく} の {造船所|ぞうせんじょ}', 'The Boatyard'), region: 'interior', place: 'manybridge', music: null, noTravel: true, travelKind: 'interior', edition: 2,
    terrain: K.build(14, 10, '#', (k) => { k.rect(1, 2, 12, 7, '+'); k.set(6, 9, '+'); }),
    props: [
      { p: 'exitmat', x: 6, y: 8 },
      { p: 'boat', x: 3, y: 4, scene: 'sea.yard_hull' },
      { p: 'sb_woodpile', x: 1, y: 7 }, { p: 'cs_workbench', x: 1, y: 2 }, { p: 'ladder', x: 5, y: 2 },
      { p: 'loom', x: 10, y: 4, scene: 'sea.yard_loom' }, { p: 'net', x: 8, y: 2 },
      { p: 'barrel', x: 12, y: 7 }, { p: 'crate', x: 11, y: 7 }, { p: 'lantern', x: 12, y: 2, o: { lit: true } },
    ],
    npcs: [
      { id: 'sea_kajiro', x: 5, y: 5, dir: 'left', talk: [
        { if: 'quest.sea_licence=1', scene: 'sea.kajiro_first' },
        { if: 'quest.sea_licence=2&!sea_f_timber&!item.sea_timber_note', scene: 'sea.kajiro_timber' },
        { if: 'quest.sea_licence=2&item.sea_timber_note', scene: 'sea.kajiro_take' },
        { if: 'quest.sea_licence=2&sea_f_timber&sea_f_sail', scene: 'sea.kajiro_name' },
        { if: 'quest.sea_licence=2', scene: 'sea.kajiro_nui' },
        { if: 'quest.sea_licence=3&sea_sign_ok', scene: 'sea.kajiro_paint' },
        { if: 'quest.sea_licence=3', scene: 'sea.kajiro_sobe' },
        { if: 'quest.sea_licence>=4', scene: 'sea.kajiro_after' },
        { scene: 'sea.kajiro_idle' }] },
      { id: 'sea_nui', x: 10, y: 6, dir: 'up', talk: [
        { if: 'quest.sea_licence=2&!sea_f_sail', scene: 'sea.nui_sail' },
        { if: 'sea_f_sail', scene: 'sea.nui_after' },
        { scene: 'sea.nui_idle' }] },
    ],
    exits: [{ x: 6, y: 9, to: 'mb.pier', tx: 33, ty: 8, dir: 'down' }],
    spawn: { default: [6, 8, 'up'] },
  };

  // ---- the wiring --------------------------------------------------------------------------------------------------
  const M = (id) => C.maps[id];
  const npc = (map, id) => ((M(map) && M(map).npcs) || []).find((n) => n.id === id);
  // the shut house by the ferry pier is the yard, in twelve-chapter journeys
  const yard = (M('mb.pier').structs || []).find((s) => s.x === 31 && s.y === 5);
  if (yard) Object.assign(yard, { to: 'mb.yard', spawn: [6, 8], unlock: 'ed>=2' });

  // Ōmi: the deal, and the examination (before her post-story lines: the quest can be taken up after the story)
  npc('sg.office', 'omi').talk.unshift(
    { if: 'ed>=2&quest.sea_licence=5', scene: 'sea.omi_licence' },
    { if: 'ed>=2&ch2_done&!quest.sea_licence&seen.sea.omi_deal', scene: 'sea.omi_deal_again' },
    { if: 'ed>=2&ch2_done&!quest.sea_licence', scene: 'sea.omi_deal' });
  // Fuku: her husband's boat (after the nameplate is given, if it is still to give); once the boat sails, she sees her
  const fuku = npc('sg.harbor', 'fuku');
  const plate = fuku.talk.findIndex((t) => t.if === 'item.sg_plate');
  fuku.talk.splice(plate + 1, 0,
    { if: 'ed>=2&quest.sea_licence=0', scene: 'sea.fuku_hull' },
    { if: 'ed>=2&sea_boat&var.sea_hull=chidori&!seen.sea.fuku_sails', scene: 'sea.fuku_sails' });
  // Tetsu: the sea words and the trial, once the festival's ferries are over (ahead of his ferry, which his scenes
  // still offer)
  const tetsu = npc('sg.harbor', 'tetsu');
  const fe = tetsu.talk.findIndex((t) => /^ko\.ferry|^mb\.ferry|^ko\.rumour/.test(t.scene));
  tetsu.talk.splice(fe < 0 ? 0 : fe, 0,
    { if: 'ed>=2&quest.sea_licence=4&mb2_done&!sea_words', scene: 'sea.tetsu_words' },
    { if: 'ed>=2&quest.sea_licence=4&mb2_done&sea_words&sea_tide&!sea_trial_done', scene: 'sea.tetsu_trial' });
  // Shiori: the tide book, once Tetsu has sent you to her
  npc('sg.tidehut', 'shiori').talk.unshift({ if: 'ed>=2&quest.sea_licence=4&sea_words&!sea_tide', scene: 'sea.shiori_tide' });
  // Take the porter: the planking, once he is shown where it is
  npc('mb.pier', 'mb_take').talk.unshift({ if: 'item.sea_timber_note', scene: 'sea.take_timber' });
  // Sōbē: the letters checked before the boat is painted
  const sobe = npc('mp.workshop', 'mp_sobe');
  if (sobe) sobe.talk.unshift({ if: 'ed>=2&quest.sea_licence=3&sea_named&!sea_sign_ok', scene: 'sea.sobe_sign' });

  // ---- the trial's mark off Saltglass point (the sea map) --------------------------------------------------------------
  const sea = M(C.seaMap || 'sea.coast');
  sea.props = (sea.props || []).concat([{ p: 'sea_buoy', x: 33, y: 13 }]);
  sea.triggers = (sea.triggers || []).concat([{ x: 31, y: 11, w: 5, h: 5, scene: 'sea.trial_mark', if: 'var.sea_trial=1' }]);
  // a trial ends back at Saltglass: what Tetsu makes of it
  C.ports.saltglass.arrive = 'sea.arrive_saltglass';
})(RB.content, RB.mapkit);
