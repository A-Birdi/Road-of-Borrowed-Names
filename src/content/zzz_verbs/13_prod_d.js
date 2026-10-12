/* The coast's post: a courier round by sea (expansion P05; plan 06_WORLD.md W11, "the sea mailbag"; the register in
 * docs/future/work/LW1_ROLLOUT.md, LW-07). A production instance of the `courier` template (src/engine/55b_verbs.js)
 * for twelve-chapter journeys, once the licence is done (sea_licence_done: the boat is yours and has made the crossing
 * to Kotonoha) and East Landing takes boats again (el_done).
 *
 * The fiction is the licence's own (src/content/sea/05_licence.js): Harbourmaster Ōmi's boat "carries the coast's
 * post", and the maiden voyage took her mailbag to Uki's stall and to Genroku. After the licence, her post shelf in the
 * harbour office (sg.office) holds a round of four letters and parcels for the boat's ports: Saltglass, Sazanami, East
 * Landing, Manybridge's ferry pier and Kotonoha's jetty. A round is three voyages, one on each tide of a day (phases,
 * never a clock); each letter carries the post office's tag saying where its addressee will be, and the table reads
 * the same:
 *   Tsugumi, Nui's apprentice   at the yard (Manybridge) until the ferry's sail is finished, Saltglass on the evening flood
 *   Ayame, of Kotonoha          at Kotonoha's jetty, then Sazanami's market from the midday tide (Uki's letter)
 *   Oshio, the clam-digger      Saltglass at the floods, East Landing's beach at the ebb (her sister's letter)
 *   Hatsue, at the tea stall    East Landing on every tide (a curtain Nui sewed for the stall)
 * Four deliveries in three voyages: one stop has to reach two people. Three rounds work:
 *   Manybridge > East Landing > Sazanami · Kotonoha > East Landing > Saltglass · East Landing > Sazanami > Saltglass.
 *
 * The four are placed on the ports' own maps, one place each: before the round Tsugumi sews at the Manybridge yard and
 * Ayame waits by Kotonoha's jetty; once it is delivered Tsugumi is at Saltglass harbour by Tetsu's ferry and Ayame at
 * Sazanami's market. Oshio sells clams on Saltglass's quay and Hatsue keeps her tea stall at East Landing throughout.
 * Each has a talk scene with a line for each state (the round not yet delivered, delivered). The scenes carry the sea's
 * prefix (Chapter 9's content, so Kotonoha may be named). No rewards. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const ch = (id, d) => (C.chars[id] = d);
  const addTo = (map, key, items) => {
    const m = C.maps[map];
    if (!m) throw new Error('verbs: no map ' + map);
    m[key] = m[key] || [];
    for (const it of items) m[key].push(it);
    if (RB.maps && RB.maps.forget) RB.maps.forget(map);
  };

  // ---- the round --------------------------------------------------------------------------------------------------------
  const ID = 'sea_vb_post', GATE = 'ed>=2&sea_licence_done&el_done';
  const BEFORE = GATE + '&!puzzle.' + ID + '=done', AFTER = GATE + '&puzzle.' + ID + '=done';
  RB.verbs.define('courier', {
    id: ID, if: GATE, map: 'sg.office', x: 6, y: 2, prop: 'sb_mailshelf',
    title: T('The coast\'s post', '{沿岸|えんがん} の {郵便|ゆうびん}'),
    legs: [
      T('The morning flood tide', '{朝|あさ} の {満|み}ち{潮|しお}'),
      T('The midday ebb', '{昼|ひる} の {引|ひ}き{潮|しお}'),
      T('The evening flood tide', '{夕方|ゆうがた} の {満|み}ち{潮|しお}'),
    ],
    stops: {
      saltglass: T('Saltglass harbour', '{潮硝子|しおがらす} の {港|みなと}'),
      sazanami: T('Sazanami\'s jetty', '{漣|さざなみ} の {桟橋|さんばし}'),
      eastlanding: T('East Landing', '{東|ひがし} の {渡|わた}し{場|ば}'),
      manybridge: T('Manybridge\'s ferry pier', '{八百橋|やおばし} の {渡|わた}し{場|ば}'),
      kotonoha: T('Kotonoha\'s jetty', '{言|こと}の{葉|は}{島|じま} の {桟橋|さんばし}'),
    },
    recipients: {
      tsugumi: { name: T('Tsugumi, Nui\'s apprentice', 'ヌイ の {弟子|でし} の ツグミ'), at: ['manybridge', 'manybridge', 'saltglass'] },
      ayame: { name: T('Ayame, of Kotonoha', '{言|こと}の{葉|は}{島|じま} の アヤメ'), at: ['kotonoha', 'sazanami', 'sazanami'] },
      oshio: { name: T('Oshio, the clam-digger', '{貝|かい} を {掘|ほ}る オシオ'), at: ['saltglass', 'eastlanding', 'saltglass'] },
      hatsue: { name: T('Hatsue, at the tea stall', '{茶店|ちゃみせ} の ハツエ'), at: ['eastlanding', 'eastlanding', 'eastlanding'] },
    },
    parcels: [
      { id: 'mother', to: 'tsugumi', jp: '{母|はは} から の {手紙|てがみ} 。 {札|ふだ} ： 「{帆|ほ} が {仕上|しあ}がる まで {造船所|ぞうせんじょ} 」', en: 'a letter from her mother. The tag: "At the yard until the sail is finished."' },
      { id: 'uki', to: 'ayame', jp: 'ウキ から の {手紙|てがみ} 。 {札|ふだ} ： 「{昼|ひる} の {潮|しお} から {漣|さざなみ} の {市|いち} 」', en: 'a letter from Uki. The tag: "From the midday tide, Sazanami\'s market."' },
      { id: 'sister', to: 'oshio', jp: '{姉|あね} から の {手紙|てがみ} 。 {札|ふだ} ： 「{引|ひ}き{潮|しお} の {間|あいだ} は {東|ひがし} の {渡|わた}し{場|ば} 」', en: 'a letter from her sister. The tag: "At East Landing while the tide is out."' },
      { id: 'noren', to: 'hatsue', jp: 'ヌイ が {縫|ぬ}った {暖簾|のれん} 。 {札|ふだ} ： 「{東|ひがし} の {渡|わた}し{場|ば} の {茶店|ちゃみせ} 」', en: 'a shop curtain Nui sewed. The tag: "The tea stall at East Landing."' },
    ],
  });

  // ---- the people ---------------------------------------------------------------------------------------------------
  ch('sea_vb_tsugumi', {
    name: T('Tsugumi', 'ツグミ'), voice: { pitch: 1.1 },
    look: { skin: 2, hair: 'braid', hairColor: 1, cloth: ['#c8b890', '#a8986e', '#6a8a5a'], shape: 'apron', acc: ['scarf'], scarfCol: '#6a8a5a' },
    portrait: { eyes: 'round', style: 'braid', collar: 'apron', acc: ['scarf'], bg: '#2a3428' },
  });
  ch('sea_vb_ayame', {
    name: T('Ayame', 'アヤメ'), voice: { pitch: 1.02 },
    look: { skin: 3, hair: 'long', hairColor: 0, cloth: ['#5a4a7a', '#463a62', '#e8e0cc'], shape: 'robe', acc: ['basket'] },
    portrait: { eyes: 'soft', style: 'long', bg: '#2c2638' },
  });
  ch('sea_vb_oshio', {
    name: T('Oshio', 'オシオ'), voice: { pitch: 0.9 },
    look: { skin: 4, hair: 'wrap', wrapCol: '#4a6a7a', hairColor: 1, cloth: ['#4a6a7a', '#38525e', '#d8ccb0'], shape: 'tunic', acc: ['basket'], age: 'old' },
    portrait: { eyes: 'narrow', style: 'wrap', wrapCol: '#4a6a7a', age: 'old', bg: '#22303a' },
  });
  ch('sea_vb_hatsue', {
    name: T('Hatsue', 'ハツエ'), voice: { pitch: 1.0 },
    look: { skin: 1, hair: 'bun', hairColor: 2, cloth: ['#8a5a4a', '#6e463a', '#ece2cc'], shape: 'apron', acc: [] },
    portrait: { eyes: 'soft', style: 'bun', collar: 'apron', bg: '#36261e' },
  });
  const P = (id, x, y, dir, cond) => ({ id: id + (cond === AFTER ? '_after' : ''), char: id, x, y, dir, if: cond, talk: 'sea.vb_' + id.slice(7) });
  // Tsugumi: at the loom in the Manybridge yard; then by Tetsu's ferry at Saltglass, rigging the finished sail
  addTo('mb.yard', 'npcs', [P('sea_vb_tsugumi', 9, 4, 'right', BEFORE)]);
  addTo('sg.harbor', 'npcs', [P('sea_vb_tsugumi', 33, 28, 'down', AFTER), P('sea_vb_oshio', 34, 19, 'down', GATE)]);
  addTo('sg.harbor', 'props', [{ p: 'ko_basket', x: 35, y: 19, if: GATE }]);
  // Ayame: by Kotonoha's jetty; then at Sazanami's market, by Uki's stall, with her seaweed
  addTo('ko.shore', 'npcs', [P('sea_vb_ayame', 15, 20, 'right', BEFORE)]);
  addTo('sz.hamlet', 'npcs', [P('sea_vb_ayame', 31, 14, 'up', AFTER)]);
  addTo('sz.hamlet', 'props', [{ p: 'ko_basket', x: 32, y: 14, if: AFTER }]);
  // Hatsue: her tea stall by the bench at East Landing
  addTo('el.landing', 'npcs', [P('sea_vb_hatsue', 27, 10, 'left', GATE)]);
  addTo('el.landing', 'props', [{ p: 'teaset', x: 26, y: 10, if: GATE }]);

  // ---- words ------------------------------------------------------------------------------------------------------------
  RB.lex.add(RB.lex.parseTable(`
ツグミ||name|F|Tsugumi (a sail-maker's apprentice at the Manybridge yard)
アヤメ||name|F|Ayame (a woman of Kotonoha)
オシオ||name|F|Oshio (a clam-digger of Saltglass)
ハツエ||name|F|Hatsue (keeps a tea stall at East Landing)
茶店|ちゃみせ|n|I|a tea stall, a little teahouse by a road or landing
`), 'verbs');

  // ---- what the people say -------------------------------------------------------------------------------------------
  const D = 'puzzle.' + ID + '=done';
  RB.script.add(`
@scene sea.vb_tsugumi
# Nui's apprentice (sea_vb_post): at the yard until the ferry's sail is finished; after the round, rigging it at Saltglass.
!faceplayer
?(!${D}) sea_vb_tsugumi: テツ さん の {渡|わた}し{船|ぶね} の {帆|ほ} を {縫|ぬ}って いる の 。 {仕上|しあ}がる まで は 、 ここ を {離|はな}れられない 。 || I'm sewing the sail for Tetsu's ferry. I can't leave the yard until it's finished.
?(!${D}) sea_vb_tsugumi: {仕上|しあ}がったら 、 {夕方|ゆうがた} の {満|み}ち{潮|しお} で {潮硝子|しおがらす} へ {持|も}って いく つもり 。 || Once it's done, I mean to take it down to Saltglass on the evening flood.
?(${D}) sea_vb_tsugumi: {母|はは} の {手紙|てがみ} 、 ちゃんと {届|とど}いた よ 。 ありがとう 。 || My mother's letter reached me. Thank you.
?(${D}) sea_vb_tsugumi: {帆|ほ} は {仕上|しあ}がった 。 これ から テツ さん の {船|ふね} に {張|は}る ところ 。 || The sail's finished. I'm about to rig it on Tetsu's boat.

@scene sea.vb_ayame
# A woman of Kotonoha (sea_vb_post): she crosses to Sazanami's market from the midday tide.
!faceplayer
?(!${D}) sea_vb_ayame: ウキ さん の {市|いち} に 、 {島|しま} で {干|ほ}した {海藻|かいそう} を {売|う}り に {行|い}く の 。 {昼|ひる} の {潮|しお} で {漣|さざなみ} へ {渡|わた}る わ 。 || I'm taking seaweed we dried on the island to sell at Uki's market. I cross to Sazanami on the midday tide.
?(${D}) sea_vb_ayame: ウキ さん の {手紙|てがみ} 、 {受|う}け{取|と}った わ 。 {海藻|かいそう} 、 よく {売|う}れて いる の よ 。 || I got Uki's letter. The seaweed is selling well.

@scene sea.vb_oshio
# A clam-digger of Saltglass (sea_vb_post): East Landing's beach at the ebb, the quay at the floods.
!faceplayer
?(!${D}) sea_vb_oshio: {潮|しお} が {引|ひ}いたら 、 {東|ひがし} の {渡|わた}し{場|ば} の {浜|はま} で {貝|かい} を {掘|ほ}る 。 {満|み}ちたら 、 ここ で {売|う}る 。 {毎日|まいにち} その {繰|く}り{返|かえ}し さ 。 || When the tide goes out, I dig clams on the beach at East Landing. When it comes in, I sell them here. Every day, round and round.
?(${D}) sea_vb_oshio: {漣|さざなみ} の {姉|あね} から だ 。 {孫|まご} が {生|う}まれた って 。 …… {今度|こんど} の {引|ひ}き{潮|しお} は 、 {休|やす}んで {会|あ}い に {行|い}こう か ね 。 || From my sister in Sazanami. She has a new grandchild. …Maybe I'll skip the next low tide and go and see them.

@scene sea.vb_hatsue
# The tea stall at East Landing (sea_vb_post): open on every tide since the landing took boats again.
!faceplayer
?(!${D}) sea_vb_hatsue: {渡|わた}し{場|ば} が また {開|あ}いて から 、 {潮|しお} が {満|み}ちて も {引|ひ}いて も 、 {舟|ふね} が {来|く}る 。 だから {店|みせ} は {閉|し}めない の 。 || Since the landing opened again, boats come in on every tide, in or out. So I never shut the stall.
?(${D}) sea_vb_hatsue: ヌイ さん の {暖簾|のれん} が {届|とど}いた ！ {次|つぎ} の {舟|ふね} が {着|つ}く {前|まえ} に 、 {掛|か}けて おく わ 。 || Nui's curtain has come! I'll hang it before the next boat comes in.
`, 'zzz_verbs/13_prod_d.js');
})(RB.content);
