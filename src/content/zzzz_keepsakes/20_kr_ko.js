/* Roadside Keepsakes for the Keepers' Road (Chapter 7) and Kotonoha and the sea (Chapter 9) (KS-1, Robin
 * 2026-10-14: about two new keepsakes for each new chapter). Two for each chapter, of different kinds: a person's
 * thank-you after the story, and a found thing tied to a place the story went through.
 *   ks_kr_masu        Kumazō on the Cedar Steps (kr_done): a masu of cedar from the steps, his thanks for the road's
 *                     lights (the fallen cedar, kr.cedar, if you rolled it aside with him; else one he felled so the
 *                     Cedar Light reaches the path).
 *   ks_kr_hiuchi      the ruined third waystation on the Maple Ridge (kr_done): the lanterns you kept lit against the
 *                     Wick Moths (kr.moths) show a loose stone; behind it, the keepers' fire striker, left "for
 *                     whoever lights this lamp next".
 *   ks_ko_kusunomi    the great camphor at Kotonoha's crown (ko_done): among its roots, the first berries it has let
 *                     fall since it was tired.
 *   ks_ko_tairyobata  Isaku on Sazanami's jetty (ko_done): the nets come up with fish, not written leaves; the boats
 *                     flew their big-catch flags, and the children made a little one for whoever went to the island.
 * Retroactive: each is offered from the chapter's own done flag, which every finished journey has, so a save already
 * past these chapters can still have it. The people are the ones always there (Kumazō has no routine; Isaku keeps
 * the jetty); the places are props that were silent (the waystation's lit lanterns, the camphor). A person's offer is
 * a guarded first talk option (the pattern of src/content/zz_cases.js firstTalk, but added in place, so a list that
 * is shared stays shared): it runs once, and never in front of a story step (Isaku's licence step, his first word).
 * The keepsake is recorded by `!hook cs_keepsake` (src/content/cases/40_refine.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const KS = C.keepsakes;
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const OUT = '#2a2024';
  // a filled disc on the pixel grid (crisp: whole pixels only)
  const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); R(g, cx - w, cy + y, w * 2 + 1, 1, c); } };
  const shadow = (g, w) => R(g, 16 - (w >> 1), 28, w, 1, 'rgba(0,0,0,0.22)');
  const M = (id) => C.maps[id];
  // a guarded talk option at the head of a person's list (in place: a routine's slots share the list)
  const firstTalk = (map, id, opt) => {
    const m = M(map), n = m && (m.npcs || []).find((q) => q.id === id);
    if (!n) return false;
    if (typeof n.talk === 'string') n.talk = [{ scene: n.talk }];
    n.talk = n.talk || [];
    n.talk.unshift(opt);
    return true;
  };
  // give silent props a scene (only those with none); `pick` narrows to the instance (a lantern's lit one)
  const sceneFor = (map, pick, scene) => {
    const m = M(map);
    let k = 0;
    for (const pr of (m && m.props) || []) if (pick(pr) && !pr.scene) { pr.scene = scene; k++; }
    return k;
  };

  // the words these scenes add (only those the lexicon did not have)
  RB.lex.add(RB.lex.parseTable(`
枡|ます|n|A|a masu: a small square wooden box for measuring rice (or drinking sake from)
火打ち金|ひうちがね|n|A|a fire striker: a piece of steel struck against a flint to make sparks
樹皮|じゅひ|n|A|bark (of a tree)
蒔く|まく|v5k|I|to sow (seeds)
大漁旗|たいりょうばた|n|A|a big-catch flag, flown by fishing boats coming home with a big catch
檜舞台|ひのきぶたい|n|A|a stage of Japanese cypress; (figuratively) the big stage, where you show what you can do
`), 'zzzz_keepsakes');

  // ---- the Keepers' Road ---------------------------------------------------------------------------------------
  KS.ks_kr_masu = {
    id: 'ks_kr_masu', ed: 2, region: 'keepers_road', source: { kind: 'person', id: 'kr_kumazo' },
    name: { jp: '{杉|すぎ} の {枡|ます}', en: 'Cedar Masu' },
    desc: { en: 'A small square measure of cedar from the Cedar Steps, the kind used for rice. Kumazō the woodcutter made it once the road\'s lamps were lit again. It still smells of the hill.' },
    how: { en: 'Given by Kumazō on the Cedar Steps after the story, as his thanks for the lights on the road.' },
    hint: { broad: { en: 'On the Keepers\' Road, someone who works the hillside has made something to say thank you.' }, specific: { en: 'Once the story is over, talk to Kumazō the woodcutter on the Cedar Steps.' } },
    art(g) {
      shadow(g, 22);
      const W0 = '#ecca92', W1 = '#d8b27a', W2 = '#c29c64', W3 = '#a6804c', BR = '#5a3a22';
      R(g, 6, 5, 20, 23, OUT); // the box, seen from a little above
      // the open top: a rim of end grain round the inside, the far wall in light, the bottom in shade
      R(g, 7, 6, 18, 2, W0); R(g, 7, 8, 2, 6, W0); R(g, 23, 8, 2, 6, W1); R(g, 7, 14, 18, 1, W0);
      R(g, 9, 8, 14, 3, '#b48a58'); R(g, 9, 8, 14, 1, '#c89e6a'); R(g, 9, 11, 14, 3, '#7a5a38');
      R(g, 9, 8, 1, 6, '#6e5034'); R(g, 22, 8, 1, 6, '#94704a'); R(g, 7, 15, 18, 1, OUT);
      // the front: lit on the left, shaded on the right, a darker foot
      R(g, 7, 16, 18, 10, W1); R(g, 7, 16, 3, 10, W0); R(g, 22, 16, 3, 10, W2); R(g, 7, 26, 18, 1, W3);
      // the corner joints, where the boards are notched together
      for (let y = 17; y < 26; y += 3) { R(g, 7, y, 1, 1, W3); R(g, 24, y + 1, 1, 1, W3); }
      // the grain, and a knot
      R(g, 10, 17, 7, 1, W2); R(g, 18, 18, 3, 1, W2); R(g, 11, 24, 5, 1, W2); R(g, 17, 25, 4, 1, W2);
      R(g, 20, 21, 2, 1, W3); R(g, 20, 22, 1, 1, W3);
      // the maker's brand, burnt in: a ring with a dot (no letters)
      R(g, 13, 19, 5, 1, BR); R(g, 13, 23, 5, 1, BR); R(g, 12, 20, 1, 3, BR); R(g, 18, 20, 1, 3, BR); R(g, 15, 21, 1, 1, BR);
    },
  };
  KS.ks_kr_hiuchi = {
    id: 'ks_kr_hiuchi', ed: 2, region: 'keepers_road', source: { kind: 'place', id: 'kr.ridge' },
    name: { jp: '{灯守|ひもり} の {火打|ひう}ち{金|がね}', en: 'Keepers\' Fire Striker' },
    desc: { en: 'A steel fire striker and a flint, wrapped in oiled paper and hidden by the keepers in a lantern of the ruined third waystation, "for whoever lights this lamp next". Still dry after all these years.' },
    how: { en: 'Found behind a loose stone in a lantern of the ruined third waystation on the Maple Ridge, after the story.' },
    hint: { broad: { en: 'On the Keepers\' Road, a lamp you once kept burning has been keeping something in return.' }, specific: { en: 'Once the story is over, look closely at the lit lanterns of the ruined third waystation on the Maple Ridge.' } },
    art(g) {
      shadow(g, 24);
      // the oiled paper it was wrapped in, opened out flat and a little askew, with a crease and the oil's sheen
      const px0 = (y) => 3 + (((27 - y) / 8) | 0);
      for (let y = 6; y <= 27; y++) R(g, px0(y), y, 26, 1, OUT);
      for (let y = 7; y <= 26; y++) R(g, px0(y) + 1, y, 24, 1, y === 17 ? '#d2b060' : y === 26 ? '#b8923e' : '#e0c070');
      R(g, 7, 8, 3, 1, '#f2de9c'); R(g, 13, 25, 5, 1, '#f2de9c');
      // a corner of the paper folded back
      R(g, 26, 7, 4, 1, '#f6e6b0'); R(g, 27, 8, 3, 1, '#f6e6b0'); R(g, 28, 9, 2, 1, '#f6e6b0');
      R(g, 25, 7, 1, 1, '#b8923e'); R(g, 26, 8, 1, 1, '#b8923e'); R(g, 27, 9, 1, 1, '#b8923e'); R(g, 28, 10, 1, 1, '#b8923e');
      // the striker lying on it: a domed wooden grip over a steel bar whose ends curl up
      [[13, 7], [12, 9], [11, 11], [11, 11], [11, 11]].forEach(([x, w], i) => {
        const y = 8 + i;
        R(g, x - 1, y, w + 2, 1, OUT);
        if (i) R(g, x, y, w, 1, i === 1 ? '#a0683c' : '#7a4a2a');
      });
      R(g, 14, 11, 5, 1, '#5e3820'); R(g, 13, 12, 3, 1, '#5e3820');
      R(g, 7, 13, 19, 4, OUT); R(g, 6, 11, 2, 3, OUT); R(g, 25, 11, 2, 3, OUT);
      R(g, 8, 13, 17, 1, '#3a3f46'); R(g, 8, 14, 17, 1, '#5a616a'); R(g, 8, 15, 17, 1, '#c0c8d0');
      R(g, 7, 12, 1, 2, '#5a616a'); R(g, 25, 12, 1, 2, '#5a616a');
      // the flint, a pale chip with its facets
      R(g, 19, 19, 6, 1, OUT); R(g, 18, 20, 8, 5, OUT); R(g, 19, 25, 5, 1, OUT);
      R(g, 19, 20, 6, 5, '#dcd8ce'); R(g, 19, 20, 3, 2, '#f6f4ee'); R(g, 22, 22, 3, 2, '#a8a49a'); R(g, 21, 22, 1, 1, '#c4c0b6'); R(g, 20, 24, 2, 1, '#bcb8ae');
      // a spark, struck between the steel and the flint
      R(g, 14, 18, 1, 5, '#ffd060'); R(g, 12, 20, 5, 1, '#ffd060'); R(g, 14, 20, 1, 1, '#fff8d8'); R(g, 11, 23, 1, 1, '#ffb030'); R(g, 17, 18, 1, 1, '#ffb030');
      // two strokes of a brush, the tag's words, by the corner
      R(g, 6, 22, 1, 3, '#7a5a30'); R(g, 8, 22, 1, 2, '#7a5a30');
    },
  };

  // ---- Kotonoha and the sea ------------------------------------------------------------------------------------
  KS.ks_ko_kusunomi = {
    id: 'ks_ko_kusunomi', ed: 2, region: 'kotonoha', source: { kind: 'place', id: 'ko.crown' },
    name: { jp: '{大楠|おおくす} の {実|み}', en: 'Great Camphor Berry' },
    desc: { en: 'A glossy black berry the size of a bean, with a seed inside: one of the first the great camphor of Kotonoha let fall once it was breathing easily again.' },
    how: { en: 'Picked up among the roots of the great camphor at the island\'s crown, after the story.' },
    hint: { broad: { en: 'On Kotonoha, the island\'s oldest living thing has something new to give, now that it is well.' }, specific: { en: 'Once the story is over, look among the roots of the great camphor, at the top of the terraces.' } },
    art(g) {
      shadow(g, 20);
      const B = ['#1e1828', '#2e2640', '#463c5e', '#8a80a8', '#e0d8f4'];
      // a twig of the camphor, rising to the right
      const tw = (x) => 10 - Math.round((x - 3) * 4 / 25);
      for (let x = 3; x <= 28; x++) R(g, x, tw(x) - 1, 1, 3, OUT);
      for (let x = 4; x <= 27; x++) R(g, x, tw(x), 1, 1, '#6a4a32');
      R(g, 27, tw(27) - 2, 2, 2, OUT); R(g, 27, tw(27) - 1, 1, 1, '#7a8a3a'); // a bud at its tip
      // the berries hanging from it, each on its stalk from a little green cup; the big one in front
      for (const [cx, cy, r] of [[7, 19, 4], [25, 16, 4], [16, 19, 7]]) {
        const ty = tw(cx) + 1, top = cy - r - 2, q = r >> 1;
        R(g, cx - 1, ty, 3, top - ty + 1, OUT); R(g, cx, ty, 1, top - ty + 1, '#4e5a26');
        disc(g, cx, cy, r + 1, OUT); disc(g, cx, cy, r, B[1]); disc(g, cx - q, cy - q, q, B[2]);
        R(g, cx - q - 1, cy - q - 1, 2, 1, B[3]); R(g, cx - q - 1, cy - q - 1, 1, 1, B[4]); R(g, cx + q, cy + r - 1, q, 1, B[0]);
        R(g, cx - 2, top, 5, 2, OUT); R(g, cx - 1, top, 3, 1, '#8a9a4a'); R(g, cx - 1, top + 1, 3, 1, '#6a7a3a');
      }
    },
  };
  KS.ks_ko_tairyobata = {
    id: 'ks_ko_tairyobata', ed: 2, region: 'kotonoha', source: { kind: 'person', id: 'sz_isaku' },
    name: { jp: '{小|ちい}さな {大漁旗|たいりょうばた}', en: 'Little Big-Catch Flag' },
    desc: { en: 'A child-sized copy of the flags Sazanami\'s boats fly coming home from a big catch: a red sun, blue waves and a leaping sea bream. The hamlet\'s children made it "for the one who went to the island".' },
    how: { en: 'Given by Isaku on Sazanami\'s jetty, once the island\'s tree had gone quiet and the nets came up full of fish again.' },
    hint: { broad: { en: 'Up the coast, the nets are full again, and the fishers have something to celebrate.' }, specific: { en: 'Once Kotonoha\'s story is over, talk to Isaku on the jetty at Sazanami.' } },
    art(g) {
      R(g, 2, 28, 9, 1, 'rgba(0,0,0,0.22)');
      // the bamboo pole, its nodes, its tip
      R(g, 4, 3, 4, 25, OUT); R(g, 5, 4, 2, 23, '#c8b468'); R(g, 5, 4, 1, 23, '#e2ce86');
      for (const y of [10, 17, 24]) R(g, 5, y, 2, 1, '#8a7a3a');
      R(g, 4, 0, 4, 3, OUT); R(g, 5, 1, 2, 1, '#e2ce86');
      // the flag: a red band, the rising sun, waves along the foot
      R(g, 7, 4, 22, 16, OUT); R(g, 8, 5, 20, 14, '#f4efe2');
      R(g, 8, 5, 20, 2, '#c8382e');
      disc(g, 12, 11, 3, '#d8402e'); R(g, 11, 9, 1, 1, '#f08a6a');
      R(g, 8, 15, 20, 4, '#2e5a9a');
      for (let x = 8; x < 28; x += 4) { R(g, x, 15, 2, 1, '#f4efe2'); R(g, x + 2, 16, 1, 1, '#6a90c8'); }
      // the sea bream, leaping
      R(g, 17, 9, 7, 4, '#e0605a'); R(g, 16, 10, 1, 2, '#e0605a'); R(g, 18, 8, 4, 1, '#e0605a');
      R(g, 24, 9, 1, 1, '#e0605a'); R(g, 24, 12, 1, 1, '#e0605a'); R(g, 25, 8, 1, 2, '#e0605a'); R(g, 25, 12, 1, 2, '#e0605a');
      R(g, 18, 12, 5, 1, '#f4a898'); R(g, 18, 10, 1, 1, OUT);
      // tied to the pole; the free edge rippling in the wind
      for (const y of [6, 12, 17]) R(g, 7, y, 1, 1, '#c8b468');
      R(g, 29, 7, 1, 3, OUT); R(g, 28, 7, 1, 3, '#f4efe2'); R(g, 27, 13, 1, 2, OUT);
    },
  };

  // ---- where they are --------------------------------------------------------------------------------------------
  // Kumazō, always on the Cedar Steps (no routine moves him), once the road is lit
  firstTalk('kr.steps', 'kr_kumazo', { if: 'kr_done&!keepsake.ks_kr_masu', scene: 'kr.ks_kumazo_masu' });
  // the ruined third waystation's two lanterns, lit since the moths (their lit instance had no scene)
  sceneFor('kr.ridge', (p) => p.p === 'kr_toro' && p.y === 14 && (p.x === 27 || p.x === 31) && p.if === 'kr_moths_done', 'kr.ks_ruin_striker');
  // the great camphor at the crown (silent until now)
  sceneFor('ko.crown', (p) => p.p === 'ko_camphor' && p.x === 16 && p.y === 7, 'ko.ks_camphor_seed');
  // Isaku at Sazanami's jetty (no routine), once the island is settled; never before his own first word or the
  // licence's step at his nets
  firstTalk('sz.hamlet', 'sz_isaku', { if: 'ko_done&seen.sz.isaku_first&!quest.sea_licence=7&!keepsake.ks_ko_tairyobata', scene: 'sz.ks_isaku_flag' });

  RB.script.add(`
@scene kr.ks_kumazo_masu
# Kumazō, once the road is lit: a masu made from cedar off the steps (the one you rolled aside with him, if you did),
# his thanks for the lights. Staged: he leans on his broom, then holds the little box out to you.
!faceplayer
kr_kumazo: お 、 {来|き}た か 。 {待|ま}って いた ん だ 。 || Oh, there you are. I've been waiting for you.
?(kr_cedar_cleared) kr_kumazo: {夜|よる} の {風|かぜ} で {倒|たお}れた あの {杉|すぎ} 、 {覚|おぼ}えて いる か 。 {一緒|いっしょ} に {転|ころ}がした やつ だ 。 {板|いた} に して 、 {乾|かわ}かして おいた 。 || Remember the cedar the night wind brought down? The one we rolled aside together. I sawed it into boards and let them dry.
?(!kr_cedar_cleared) kr_kumazo: {杉|すぎ} の {灯|ひ} に {影|かげ} を {落|お}として いた {杉|すぎ} を {一本|いっぽん} {切|き}った 。 {灯|ひ} が {道|みち} まで {届|とど}く よう に な 。 {板|いた} に して 、 {乾|かわ}かして おいた 。 || I felled a cedar that was throwing its shadow over the Cedar Light, so the light reaches the path. Sawed it into boards and let them dry.
kr_kumazo: {株|かぶ} に は 、 {親父|おやじ} が やって いた よう に 、 {酒|さけ} を {少|すこ}し かけた 。 「ありがとう 」 の {代|か}わり だ 。 || I poured a little sake on the stump, the way my father used to. Instead of saying thank you.
!gesture kr_kumazo handover pc
!gesture pc receive kr_kumazo
kr_kumazo: その {板|いた} で 、 {枡|ます} を {作|つく}った 。 {道|みち} に {灯|ひ} を {戻|もど}して くれた {礼|れい} だ 。 {持|も}って いけ 。 || I made a masu from the boards. My thanks for bringing the lights back to the road. Take it.
kr_kumazo[happy]: {米|こめ} を {量|はか}って も いい し 、 {棚|たな} に {置|お}いて おく だけ でも いい 。 {杉|すぎ} の {匂|にお}い は 、 {長|なが}く {残|のこ}る ぞ 。 || Measure rice with it, or just keep it on a shelf. The smell of cedar lasts a long time.
?(comp=nao) comp: {木|き} の {匂|にお}い の する {礼|れい} か 。 …… {悪|わる}く ない {届|とど}け{物|もの} だ 。 || A thank-you that smells of wood. …Not a bad thing to have delivered.
?(comp=mio) comp[smile]: {杉|すぎ} の {香|かお}り 。 …… {気持|きも}ち が {落|お}ち{着|つ}く {匂|にお}い です ね 。 || The scent of cedar. …A calming smell, isn't it.
?(comp=ren) comp[smile]: {灯|ひ} の {道|みち} の {杉|すぎ} です ね 。 …… {灯|ひ} を {守|まも}って いた の は 、 {灯守|ひもり} だけ じゃ なかった ん です 。 || Cedar from the lamps' road. …It wasn't only the keepers who looked after the lights.
?(comp=suzu) comp[laugh]: {木|き} の {匂|にお}い 、 {檜|ひのき}{舞台|ぶたい} を {思|おも}い{出|だ}す わ 。 {杉|すぎ} も {負|ま}けて ない けど ね 。 || The smell of wood takes me back to the big cypress stage. Cedar holds its own, though.
!hook cs_keepsake ks_kr_masu
narr: {杉|すぎ} の {枡|ます} を もらった 。 || You receive a cedar masu.

@scene kr.ks_ruin_striker
# The ruined third waystation's lanterns, kept lit since the night of the Wick Moths (kr.moths). Once the road is
# lit, one stone under the fire box shows a different colour in the lamp's own light; behind it, the keepers' fire
# striker in oiled paper, left for whoever lights the lamp next. Otherwise, the lamp burning.
!if kr_done&!keepsake.ks_kr_hiuchi -> find
narr: {三|さん} の {宿|やど} の {灯籠|とうろう} 。 {蛾|が} の {夜|よる} から 、 {灯|ひ} は {消|き}えて いない 。 || The third waystation's lantern. It has not gone out since the night of the moths.
!end
:find
!gesture pc bend
narr: {三|さん} の {宿|やど} の {灯籠|とうろう} 。 その {明|あ}かり で 、 {火袋|ひぶくろ} の {下|した} の {石|いし} が {一|ひと}つ だけ 、 {色|いろ} が {違|ちが}う の に {気付|きづ}いた 。 || The third waystation's lantern. In its light you notice that one stone below the fire box is a different colour from the rest.
narr: {押|お}して みる と 、 {石|いし} は すぐ に {外|はず}れた 。 {奥|おく} に 、 {油紙|あぶらがみ} の {包|つつ}み が ある 。 || You press it, and it comes away at once. Behind it is a packet of oiled paper.
narr: {中|なか} は 、 {火打|ひう}ち{金|がね} と {火打|ひう}ち{石|いし} 。 {小|ちい}さな {札|ふだ} に 、 「{次|つぎ} に {灯|ひ} を {入|い}れる {人|ひと} へ 」 。 || Inside: a fire striker and a flint. On a small tag: "For whoever lights this lamp next."
?(comp=ren) comp[surprise]: …… {灯守|ひもり} は 、 どの {宿|やど} に も {火|ひ} の {道具|どうぐ} を {隠|かく}して おいた と {聞|き}きました 。 {次|つぎ} に {来|く}る {人|ひと} が {困|こま}らない よう に 。 || …I'd heard the keepers hid fire-making tools at every waystation. So whoever came next wouldn't be stuck.
?(comp=ren) comp[smile]: {蛾|が} の {夜|よる} 、 この {灯|ひ} を {入|い}れた の は あなた です 。 …… あなた が 、 その 「{次|つぎ} の {人|ひと} 」 だった ん です ね 。 || The night of the moths, you were the one who lit this lamp. …You were that "whoever came next".
?(comp=nao) comp: {宛名|あてな} は 「{次|つぎ} の {人|ひと} 」 か 。 {何十年|なんじゅうねん} も {待|ま}って 、 やっと {受取人|うけとりにん} が {来|き}た な 。 || Addressed to "whoever's next". Decades of waiting, and the recipient finally turns up.
?(comp=mio) comp[smile]: {何年|なんねん} {経|た}って も 、 {乾|かわ}いた まま 。 …… {大事|だいじ} な もの の {仕舞|しま}い{方|かた} を 、 {知|し}って いる {人|ひと} たち だった の ね 。 || Still dry after all these years. …They knew how to put away something that mattered.
?(comp=suzu) comp: {次|つぎ} の {役者|やくしゃ} の ため に 、 {楽屋|がくや} に {置|お}いて いく {小道具|こどうぐ} ね 。 …… {受|う}け{取|と}ったら 、 {次|つぎ} は あなた の {番|ばん} よ 。 || A prop left in the dressing room for the next actor. …Once you've picked it up, you're on.
!hook cs_keepsake ks_kr_hiuchi
!gesture pc check
narr: {灯守|ひもり} の {火打|ひう}ち{金|がね} を {見|み}つけた 。 || You find the keepers' fire striker.

@scene ko.ks_camphor_seed
# The great camphor at the crown. Once the tree has settled (ko.end), the first berries it has let fall since it was
# tired lie among its roots; you keep one. Otherwise, the tree itself.
!if ko_done&!keepsake.ks_ko_kusunomi -> find
narr: {大楠|おおくす} 。 {幹|みき} に しめ{縄|なわ} が {巻|ま}いて あり 、 {樹皮|じゅひ} の {割|わ}れ{目|め} に 、 {字|じ} の ある {葉|は} が {挟|はさ}まって いる 。 || The great camphor. A sacred rope circles its trunk, and written leaves are caught in the cracks of its bark.
!end
:find
!gesture pc kneel
narr: {大楠|おおくす} の {根|ね} の {間|あいだ} に 、 {黒|くろ}い {小|ちい}さな {実|み} が いくつ か {落|お}ちて いる 。 {豆|まめ} ぐらい の {大|おお}きさ で 、 つやつや と {光|ひか}って いる 。 || Between the great camphor's roots lie a few small black berries, each about the size of a bean, glossy and shining.
narr: {木|き} が {疲|つか}れて いた {頃|ころ} に は 、 {見|み}かけなかった もの だ 。 {一|ひと}つ {拾|ひろ}って 、 {手|て} の {中|なか} で {転|ころ}がした 。 || You never saw any while the tree was tired. You pick one up and roll it in your hand.
?(comp=nao) comp: {実|み} は 、 {鳥|とり} が {遠|とお}く へ {運|はこ}ぶ ん だろう な 。 …… {木|き} に も 、 {配達|はいたつ} が ある わけ だ 。 || Birds carry the berries a long way, I suppose. …So trees have their deliveries too.
?(comp=mio) comp[smile]: {楠|くす} は 、 {葉|は} も {木|き} も {薬|くすり} に なる ん です よ 。 …… {実|み} を {付|つ}ける の は 、 {元気|げんき} に なった {証拠|しょうこ} です 。 || Camphor's leaves and wood both make medicine, you know. …Bearing fruit means it's well again.
?(comp=ren) comp: {灯守|ひもり} の {道|みち} の {灯|ひ} と {同|おな}じ です ね 。 {一度|いちど} {弱|よわ}って も 、 また {次|つぎ} へ {続|つづ}いて いく 。 || Like the lamps on the keepers' road. Even after it weakened, it goes on to the next.
?(comp=suzu) comp[smile]: {話|はなし} の {種|たね} が 、 {本物|ほんもの} の {種|たね} に なった わ ね 。 {千秋楽|せんしゅうらく} の {後|あと} に は 、 {次|つぎ} の {芝居|しばい} の {種|たね} が {蒔|ま}かれる もの よ 。 || The seed of a story turned into a real seed. After closing night, the seeds of the next play get sown.
!hook cs_keepsake ks_ko_kusunomi
!gesture pc check
narr: {大楠|おおくす} の {実|み} を {見|み}つけた 。 || You find a berry of the great camphor.

@scene sz.ks_isaku_flag
# Isaku on the jetty, once Kotonoha's tree is quiet: the nets bring up fish, not written leaves; yesterday's big catch
# and the boats' flags; the children's little copy, for whoever went to the island. Staged: he holds it out on its
# stick.
!faceplayer
sz_isaku: よう 。 {西|にし} の {島|しま} の {話|はなし} 、 {聞|き}いた ぞ 。 {大|おお}きな {木|き} が {静|しず}か に なった って な 。 || Hey. I heard about the island out west. The big tree's gone quiet, they say.
sz_isaku: {冬|ふゆ} の {嵐|あらし} の {後|あと} は 、 {網|あみ} に {字|じ} の {書|か}いて ある {葉|は} ばかり {絡|から}んで いた 。 {今|いま} は 、 {魚|さかな} しか {入|はい}らない 。 || After the winter storms, the nets were all tangled with written leaves. Now there's nothing in them but fish.
sz_isaku: {昨日|きのう} は {久|ひさ}しぶり の {大漁|たいりょう} で な 。 {船|ふね} が みんな 、 {大漁旗|たいりょうばた} を {揚|あ}げて {帰|かえ}って きた 。 || Yesterday was the first big catch in ages. Every boat came home flying its big-catch flag.
!gesture sz_isaku handover pc
!gesture pc receive sz_isaku
sz_isaku: {子|こ}ども たち が {真似|まね} して 、 {小|ちい}さい {旗|はた} を {作|つく}った 。 {一枚|いちまい} は 「{島|しま} へ {行|い}った {人|ひと} に 」 だ と さ 。 {持|も}って いけ よ 。 || The kids made little ones, copying them. One of them's "for the one who went to the island", they say. Take it.
?(comp=nao) comp: {宛名|あてな} は 「{島|しま} へ {行|い}った {人|ひと} 」 か 。 …… {確|たし}か に 、 {受|う}け{取|と}った 。 || Addressed to "the one who went to the island". …Received, all right.
?(comp=mio) comp[smile]: {網|あみ} に {魚|さかな} が {戻|もど}った ん です ね 。 {島|しま} の {木|き} が {元気|げんき} に なったら 、 {海|うみ} も {元気|げんき} に なった みたい 。 || The fish are back in the nets. When the island's tree got well, the sea seems to have got well too.
?(comp=ren) comp: {旗|はた} は 、 {海|うみ} の {上|うえ} の {灯|ひ} の よう な もの です ね 。 {遠|とお}く から でも 、 {帰|かえ}って くる {船|ふね} が {分|わ}かる 。 || A flag is a kind of lamp at sea. Even from far off, you can see the boats coming home.
?(comp=suzu) comp[laugh]: {大漁|たいりょう} の {旗|はた} は 、 {芝居|しばい} の {大入|おおい}り {袋|ぶくろ} みたい な もの ね 。 {客|きゃく} が {満員|まんいん} の {日|ひ} に だけ {出|で}る の よ 。 || A big-catch flag is like the full-house envelopes at the theatre. They only come out on the days the house is packed.
!hook cs_keepsake ks_ko_tairyobata
narr: {小|ちい}さな {大漁旗|たいりょうばた} を もらった 。 || You receive a little big-catch flag.
`, 'zzzz_keepsakes/20_kr_ko');

  // ---- Suzu's lines in Kansai-ben (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md) -----------------------------
  if (RB.dialect && RB.dialect.add) RB.dialect.add('kansai', `
@ zzzz_keepsakes/20_kr_ko [kr.ks_kumazo_masu]
= {木|き} の {匂|にお}い 、 {檜|ひのき}{舞台|ぶたい} を {思|おも}い{出|だ}す わ 。 {杉|すぎ} も {負|ま}けて ない けど ね 。 || The smell of wood takes me back to the big cypress stage. Cedar holds its own, though.
> {木|き} の {匂|にお}い 、 {檜|ひのき}{舞台|ぶたい} を {思|おも}い{出|だ}す わ 。 {杉|すぎ} も {負|ま}けて へん けど な 。 || The smell of wood takes me back to the big cypress stage. Cedar holds its own, mind.
@ zzzz_keepsakes/20_kr_ko [kr.ks_ruin_striker]
= {次|つぎ} の {役者|やくしゃ} の ため に 、 {楽屋|がくや} に {置|お}いて いく {小道具|こどうぐ} ね 。 …… {受|う}け{取|と}ったら 、 {次|つぎ} は あなた の {番|ばん} よ 。 || A prop left in the dressing room for the next actor. …Once you've picked it up, you're on.
> {次|つぎ} の {役者|やくしゃ} の ため に 、 {楽屋|がくや} に {置|お}いて いく {小道具|こどうぐ} や な 。 …… {受|う}け{取|と}ったら 、 {次|つぎ} は あんた の {番|ばん} や で 。 || A prop left in the dressing room for the next actor. …Once you've picked it up, you're on.
@ zzzz_keepsakes/20_kr_ko [ko.ks_camphor_seed]
= {話|はなし} の {種|たね} が 、 {本物|ほんもの} の {種|たね} に なった わ ね 。 {千秋楽|せんしゅうらく} の {後|あと} に は 、 {次|つぎ} の {芝居|しばい} の {種|たね} が {蒔|ま}かれる もの よ 。 || The seed of a story turned into a real seed. After closing night, the seeds of the next play get sown.
> {話|はなし} の {種|たね} が 、 {本物|ほんもの} の {種|たね} に なった な 。 {千秋楽|せんしゅうらく} の {後|あと} に は 、 {次|つぎ} の {芝居|しばい} の {種|たね} が {蒔|ま}かれる もん や 。 || The seed of a story turned into a real seed. After closing night, the seeds of the next play get sown.
@ zzzz_keepsakes/20_kr_ko [sz.ks_isaku_flag]
= {大漁|たいりょう} の {旗|はた} は 、 {芝居|しばい} の {大入|おおい}り {袋|ぶくろ} みたい な もの ね 。 {客|きゃく} が {満員|まんいん} の {日|ひ} に だけ {出|で}る の よ 。 || A big-catch flag is like the full-house envelopes at the theatre. They only come out on the days the house is packed.
> {大漁|たいりょう} の {旗|はた} は 、 {芝居|しばい} の {大入|おおい}り {袋|ぶくろ} みたい な もん や な 。 {客|きゃく} が {満員|まんいん} の {日|ひ} に だけ {出|で}る ねん 。 || A big-catch flag is like the full-house envelopes at the theatre. They only come out on the days the house is packed.
`, 'zzzz_keepsakes/20_kr_ko.js');
})(RB.content);
