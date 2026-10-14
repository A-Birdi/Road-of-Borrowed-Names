/* Roadside Keepsakes of the Cloudroad (Chapter 10) and Steamhollow (Chapter 11) (KS-1, Robin 2026-10-14: about two
 * new keepsakes for each new chapter). Two for each, of different kinds; each one rests on something every finished
 * playthrough has lived through, and on nothing that can be missed, chosen or solved differently:
 *   ks_cr_brush     the Cloudroad: Sumi, the Mist Barrier's inspector of papers, gives you the brush you wrote your
 *                   names back onto your travel papers with (cr.sumi, cr/22_scenes_barrier.js). A person, after the
 *                   story (cr_done).
 *   ks_cr_bell      the Cloudroad: at the foot of the stone lantern beside the couriers' hut on the pass, where the
 *                   snow has drawn back after the story, a courier's bell (cr/11_pass.js). A thing found in a place.
 *   ks_yn_geta      Steamhollow: Kihachi the geta-maker heard your step on the red bridge the night the valley walked
 *                   out in yukata (yn.walk, yn/27_scenes_comp.js) and made you a pair. A person, after the story
 *                   (yn_done).
 *   ks_yn_yunohana  Steamhollow: a pinch of yu-no-hana from the vent beside the bath-keepers' board on the Steaming
 *                   Slope (the board and Yohei the gatherer: zzz_living/32_yn.js), once the steam runs gentle. A thing
 *                   found in a place.
 * Placement, retroactive (a save already past these chapters finds them): a guarded first talk option on someone who
 * always stands where the condition says (Sumi in the Barrier office and Kihachi at his stall have no Living World
 * routine, `after` or pin), and a scene for a prop that had none (the hut's west stone lantern; the descent's vent by
 * the board). The talk options need the chapter done, so they never stand in front of the chapter's own story; they run
 * once (the keepsake is then recorded). This file loads after every chapter and after zzz_living. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const KS = C.keepsakes;
  const M = (id) => C.maps[id];
  // a guarded talk option in front of a person's list (the pattern of src/content/zz_cases.js `firstTalk`)
  const firstTalk = (map, id, opt) => { const m = M(map); const n = m && (m.npcs || []).find((q) => q.id === id); if (!n) return false; n.talk = [opt].concat(typeof n.talk === 'string' ? [{ scene: n.talk }] : n.talk || []); return true; };
  // give an existing, silent prop a scene (only if it has none; the pattern of zz_cases.js `sceneFor`)
  const sceneFor = (map, p, x, y, scene) => { const m = M(map); const pr = m && (m.props || []).find((q) => q.p === p && q.x === x && q.y === y && !q.if); if (pr && !pr.scene) pr.scene = scene; return !!(pr && pr.scene === scene); };

  // ---- pixel art: 32×32, whole pixels only ------------------------------------------------------------------------
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const OUT = '#2a2024';
  const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); R(g, cx - w, cy + y, w * 2 + 1, 1, c); } };
  const shadow = (g, w) => R(g, 16 - (w >> 1), 28, w, 1, 'rgba(0,0,0,0.22)');

  const def = (id, d) => { KS[id] = Object.assign({ id, ed: 2 }, d); };

  // ---- the Cloudroad -----------------------------------------------------------------------------------------------
  def('ks_cr_brush', {
    name: { jp: '{関所|せきしょ} の {筆|ふで}', en: 'Barrier Brush' },
    desc: { en: 'A slim bamboo brush from the inspection table at the Mist Barrier: the one you wrote your names back onto your travel papers with, the day they had faded white. Names on paper no longer fade, and Sumi thought a brush that won a name back should go on travelling.' },
    how: { en: 'Given by Sumi, the inspector of papers, in the Mist Barrier\'s office, after the story.' },
    region: 'cloudroad', source: { kind: 'person', id: 'cr_sumi' },
    hint: {
      broad: { en: 'Long after the story, someone on the Cloudroad who is careful about names has kept something back for you.' },
      specific: { en: 'Once the story is over, talk to Sumi, the inspector of papers, in the Mist Barrier\'s office.' },
    },
    art(g) {
      shadow(g, 24);
      // the travel papers under it: two names in ink, one still faint, and a station's seal
      R(g, 15, 15, 14, 11, OUT); R(g, 16, 16, 12, 9, '#f2ead6'); R(g, 16, 16, 12, 1, '#fffaf0'); R(g, 27, 17, 1, 8, '#d8ccb4');
      R(g, 25, 18, 1, 5, '#3a3040'); R(g, 23, 18, 1, 4, '#3a3040'); R(g, 21, 19, 1, 3, '#b8b0a2');
      R(g, 17, 22, 3, 2, '#b83a2e'); R(g, 18, 22, 1, 1, '#e8806a');
      // the brush, lying corner to corner across the sheet: ink-dark bristles to a point, a brass ferrule, a bamboo
      // shaft with two nodes, a dark end cap and its hanging cord
      for (let i = 0; i <= 20; i++) R(g, 3 + i, 26 - i, 5, 1, OUT);
      R(g, 4, 27, 3, 1, OUT); R(g, 24, 5, 3, 1, OUT);
      for (let i = 0; i <= 20; i++) {
        const x = 4 + i, y = 26 - i;
        if (i === 0) { R(g, x + 1, y, 1, 1, '#1e1a20'); continue; }
        if (i <= 6) { R(g, x, y, 3, 1, '#2e2a30'); R(g, x, y, 1, 1, i > 2 ? '#5a5460' : '#2e2a30'); continue; }
        if (i <= 8) { R(g, x, y, 3, 1, '#b08a3a'); R(g, x, y, 1, 1, '#e0c070'); continue; }
        if (i === 20) { R(g, x, y, 3, 1, '#5a3a2a'); continue; }
        const node = i === 12 || i === 16;
        R(g, x, y, 3, 1, node ? '#8a6a3a' : '#c8a868'); if (!node) { R(g, x, y, 1, 1, '#ecd49c'); R(g, x + 2, y, 1, 1, '#9a7a44'); }
      }
      R(g, 27, 2, 1, 4, '#b83a2e'); R(g, 28, 1, 1, 2, '#b83a2e'); R(g, 26, 3, 1, 1, '#d8604a'); // the cord
    },
  });
  def('ks_cr_bell', {
    name: { jp: '{飛脚|ひきゃく} の {鈴|すず}', en: 'Courier\'s Bell' },
    desc: { en: 'A small brass courier\'s bell on a broken red cord, the relay\'s emblem cut into it, found in the thawing snow beside the couriers\' hut on the pass. Whose it was, nobody can say. It still rings clear. (Edo\'s town couriers really did tie a bell to the letter box, and were called "chirin-chirin" couriers for it.)' },
    how: { en: 'Found at the foot of the stone lantern beside the couriers\' hut, after the story.' },
    region: 'cloudroad', source: { kind: 'place', id: 'cr.hut' },
    hint: {
      broad: { en: 'Long after the story, the snow high on the Cloudroad gives something back.' },
      specific: { en: 'Once the story is over, look at the stone lantern beside the couriers\' hut door, up on the pass.' },
    },
    art(g) {
      shadow(g, 18);
      // the red cord: a loop through the bell's eye, one side broken and frayed
      R(g, 13, 3, 1, 5, '#b83a2e'); R(g, 14, 2, 4, 1, '#b83a2e'); R(g, 18, 3, 1, 2, '#b83a2e'); R(g, 14, 3, 1, 1, '#d8604a');
      R(g, 19, 5, 1, 1, '#d8604a'); R(g, 17, 5, 1, 1, '#d8604a'); // the frayed ends
      R(g, 14, 7, 5, 3, OUT); R(g, 15, 8, 3, 1, '#9a7428'); R(g, 16, 8, 1, 1, OUT); // the eye
      // the bell: a brass ball, lit from the upper left
      disc(g, 16, 18, 8, OUT); disc(g, 16, 18, 7, '#c8a040');
      for (let y = 19; y <= 24; y++) { const w = Math.floor(Math.sqrt(49 - (y - 18) * (y - 18))); R(g, 16 - w + 2, y, w * 2 - 1, 1, '#a8842e'); }
      R(g, 9, 17, 15, 1, '#8a6a24'); R(g, 10, 16, 13, 1, '#e0bc58'); // the seam round its middle
      R(g, 11, 13, 3, 1, '#f4dc88'); R(g, 12, 12, 2, 1, '#fff0b8'); R(g, 10, 14, 1, 2, '#e8c860');
      // the relay's emblem, cut in the upper half
      R(g, 15, 12, 3, 1, '#7a5a20'); R(g, 16, 13, 1, 2, '#7a5a20'); R(g, 14, 14, 1, 1, '#7a5a20'); R(g, 18, 14, 1, 1, '#7a5a20');
      // the mouth: a slit with a round hole at each end
      R(g, 12, 22, 9, 1, OUT); R(g, 10, 21, 3, 2, OUT); R(g, 20, 21, 3, 2, OUT); R(g, 11, 21, 1, 1, '#4a3a20'); R(g, 21, 21, 1, 1, '#4a3a20');
    },
  });

  // ---- Steamhollow -------------------------------------------------------------------------------------------------
  def('ks_yn_geta', {
    name: { jp: '{桐|きり} の {下駄|げた}', en: 'Paulownia Geta' },
    desc: { en: 'A pair of paulownia geta with indigo thongs, made by Kihachi to the sound of your step on the red bridge, the night the whole valley walked out in yukata. He would not take money for them: thanks, he said, for getting the valley\'s footsteps in step.' },
    how: { en: 'Given by Kihachi the geta-maker, at his stall in Steamhollow\'s upper town, after the story.' },
    region: 'steamhollow', source: { kind: 'person', id: 'yn_kihachi' },
    hint: {
      broad: { en: 'Long after the story, someone in Steamhollow who listens to footsteps has made you something.' },
      specific: { en: 'Once the story is over, talk to Kihachi the geta-maker at his stall in the upper town.' },
    },
    art(g) {
      shadow(g, 26);
      // two geta side by side, seen from above and a little in front: the paulownia sole with its grain, the front
      // edge's thickness, and the indigo thong in a V from the front hole
      const one = (x, y) => {
        const w = 9, h = 16, cx = x + 4;
        R(g, x - 1, y, w + 2, h + 2, OUT); R(g, x, y - 1, w, h + 4, OUT);
        R(g, x, y, w, h, '#e2c896'); R(g, x, y, w, 1, '#f2dcb0');
        R(g, x + 2, y + 2, 1, h - 3, '#cfb27c'); R(g, x + 6, y + 4, 1, h - 6, '#cfb27c'); R(g, x + 4, y + 10, 1, 4, '#d8bc88');
        R(g, x, y + h, w, 2, '#a8875a'); R(g, x + 1, y + h + 1, 2, 1, '#8a6a44'); R(g, x + 6, y + h + 1, 2, 1, '#8a6a44');
        for (let k = 0; k < 5; k++) { R(g, cx - k - 1, y + 3 + k, 2, 1, '#2e4a7a'); R(g, cx + k, y + 3 + k, 2, 1, '#2e4a7a'); }
        R(g, cx - 2, y + 4, 1, 1, '#6a8ac0'); R(g, cx + 2, y + 4, 1, 1, '#6a8ac0');
        R(g, cx, y + 2, 1, 2, '#1e3050'); R(g, x + 1, y + 8, 1, 1, '#1e3050'); R(g, x + w - 2, y + 8, 1, 1, '#1e3050');
      };
      one(4, 6); one(19, 8);
    },
  });
  def('ks_yn_yunohana', {
    name: { jp: '{湯|ゆ}の{花|はな}', en: 'Yu-no-hana' },
    desc: { en: 'A pinch of yu-no-hana, the white crust that forms round a spring\'s vents, folded in paper: gathered by the bath-keepers\' rule on the Steaming Slope once the steam ran gentle again. It smooths the skin and cures nothing, as Kikue\'s labels would say. (Real spring towns sell it as bath powder, so you can take a little of the spring home.)' },
    how: { en: 'Gathered at the steam vent beside the bath-keepers\' board on the Steaming Slope, after the story.' },
    region: 'steamhollow', source: { kind: 'place', id: 'yn.descent' },
    hint: {
      broad: { en: 'Long after the story, the steam on the way down into Steamhollow runs gentle.' },
      specific: { en: 'Once the story is over, look at the steam vent beside the bath-keepers\' board on the Steaming Slope.' },
    },
    art(g) {
      shadow(g, 26);
      // the paper it is folded in, opened flat, its corners turned under
      R(g, 3, 18, 26, 9, OUT); R(g, 4, 19, 24, 7, '#f4ecd8'); R(g, 4, 19, 24, 1, '#fffaf0'); R(g, 4, 25, 24, 1, '#ddd2b8');
      R(g, 4, 19, 2, 2, '#ddd2b8'); R(g, 26, 19, 2, 2, '#ddd2b8'); R(g, 4, 24, 2, 2, '#ddd2b8'); R(g, 26, 24, 2, 2, '#ddd2b8');
      // the crust heaped on it: white, pale yellow, a little sulphur, a few glints
      for (let y = 13; y <= 21; y++) { const w = Math.floor(Math.sqrt(64 - (21 - y) * (21 - y))); R(g, 16 - w - 1, y, w * 2 + 3, 1, OUT); }
      for (let y = 14; y <= 21; y++) { const w = Math.floor(Math.sqrt(49 - (21 - y) * (21 - y))); R(g, 16 - w, y, w * 2 + 1, 1, y < 17 ? '#fbf8ec' : '#efe8d0'); }
      [[12, 18], [15, 16], [19, 19], [21, 17], [10, 20], [17, 20], [14, 21]].forEach(([x, y]) => R(g, x, y, 2, 1, '#e8dc98'));
      [[13, 19], [18, 17], [20, 20], [16, 18]].forEach(([x, y]) => R(g, x, y, 1, 1, '#d4bc50'));
      [[14, 15], [18, 15], [11, 17]].forEach(([x, y]) => R(g, x, y, 1, 1, '#ffffff'));
      // the last of the steam over it
      [[13, 11], [12, 10], [12, 9], [13, 8], [13, 7], [12, 6]].forEach(([x, y], i) => R(g, x, y, 1, 1, 'rgba(240,240,236,' + (0.75 - i * 0.08) + ')'));
      [[19, 10], [20, 9], [20, 8], [19, 7], [19, 6], [20, 5], [20, 4]].forEach(([x, y], i) => R(g, x, y, 1, 1, 'rgba(240,240,236,' + (0.7 - i * 0.07) + ')'));
    },
  });

  // ---- where they are found (retroactive: conditions on the chapter's end only) ------------------------------------
  // Sumi stands at her table in the Barrier office in every state (no `if`, no routine); her own talk after the story
  // is cr.sumi_after
  firstTalk('cr.barrier_office', 'cr_sumi', { if: 'cr_done&!keepsake.ks_cr_brush', scene: 'cr.ks_sumi' });
  // the stone lantern west of the couriers' hut door (the hut has no interior; the path runs in front, y 12–13)
  sceneFor('cr.hut', 'kr_toro', 9, 11, 'cr.ks_bell');
  // Kihachi at his geta stall in the upper town in every state (no `if`, no routine)
  firstTalk('yn.upper', 'yn_kihachi', { if: 'yn_done&!keepsake.ks_yn_geta', scene: 'yn.ks_kihachi' });
  // the vent beside the bath-keepers' board on the Steaming Slope (the board: 7,7; Yohei gathers here: 9,6)
  sceneFor('yn.descent', 'yn_steam', 8, 6, 'yn.ks_yunohana');

  RB.lex.add(RB.lex.parseTable(`
`), 'keepsakes');

  RB.script.add(`
@scene cr.ks_sumi
# After the story: Sumi, the Barrier's inspector of papers, gives you the brush you wrote your names back onto your
# travel papers with (cr.sumi). Names no longer fade; she would rather the brush travelled.
!faceplayer
cr_sumi: あら 。 {名前|なまえ} が {白|しろ}く なった {手形|てがた} の 、 あの {日|ひ} の {方|かた} です ね 。 {覚|おぼ}えて います よ 。 || Oh. You're the one from that day, with the papers whose names had turned white. I remember.
cr_sumi: {近頃|ちかごろ} は 、 {名前|なまえ} を {書|か}き{直|なお}しに {来|く}る {人|ひと} が いません 。 {手形|てがた} の {名|な} は 、 もう {消|き}えなく なりました 。 || Nobody comes to write their names in again these days. The names on papers don't fade any more.
cr_sumi: {台|だい} に 、 {書|か}き{直|なお}す ため の {筆|ふで} が {残|のこ}って いて 。 …… これ は 、 あの {日|ひ} 、 あなた が {名前|なまえ} を {書|か}いた {筆|ふで} です 。 || The brushes for writing names in again are still on my table. …This is the one you wrote your name with that day.
!prop cr_sumi brush
!gesture cr_sumi handover pc
!gesture pc receive cr_sumi
cr_sumi: {消|き}えた {名前|なまえ} を {取|と}り{戻|もど}した {筆|ふで} です もの 。 {番所|ばんしょ} の {台|だい} で {眠|ねむ}らせて おく の は 、 もったいない わ 。 どうぞ 、 {旅|たび} に {連|つ}れて いって ください 。 || It's the brush that won back a name that had faded. It would be a waste to leave it asleep on the office table. Please, take it travelling with you.
?(comp=nao) comp: …… {名前|なまえ} を {書|か}く {筆|ふで} か 。 {郵便屋|ゆうびんや} に は 、 {一番|いちばん} {大事|だいじ} な {道具|どうぐ} だ 。 {宛名|あてな} が {読|よ}めなきゃ 、 {手紙|てがみ} は どこ に も {着|つ}かない 。 || …A brush for writing names. For a postman there's no tool more important. If nobody can read the address, a letter gets nowhere.
?(comp=mio) comp[smile]: {薬|くすり} の ラベル も 、 {筆|ふで} {一本|いっぽん} で {正|ただ}しく なります 。 {名前|なまえ} も 、 {同|おな}じ です ね 。 || One brush can put a medicine label right. Names too, it seems.
?(comp=ren) comp[think]: {灯守|ひもり} は 、 {名前|なまえ} を {声|こえ} で {呼|よ}びます 。 {筆|ふで} は 、 {名前|なまえ} を {紙|かみ} の {上|うえ} で {呼|よ}ぶ の です ね 。 || Lamp-keepers call names aloud. A brush calls them on paper.
?(comp=suzu) comp[smile]: {役者|やくしゃ} の {名前|なまえ} も 、 {看板|かんばん} に {筆|ふで} で {書|か}かれて 、 {初|はじ}めて {本物|ほんもの} に なる の よ 。 {大事|だいじ} に して ね 。 || An actor's name only becomes real once it's written up on the billboard with a brush. Take good care of it.
!hook cs_keepsake ks_cr_brush
!gesture pc check prop=brush
narr: {関所|せきしょ} の {筆|ふで} を もらった 。 || You receive the Barrier's brush.

@scene cr.ks_bell
# The stone lantern beside the couriers' hut. After the story the snow has drawn back from its foot, and a courier's
# bell lies there (a real custom: Edo's town couriers tied a bell to the letter box). Whose, nobody can say. Before the
# story's end, and once it is found, the lantern is only a lantern.
!if keepsake.ks_cr_bell -> after
!if !cr_done -> before
!gesture pc bend 9,11 hold
narr: {小屋|こや} の {前|まえ} の {石|いし} の {灯籠|とうろう} 。 {足元|あしもと} の {雪|ゆき} が 、 {少|すこ}し {解|と}けて いる 。 || The stone lantern in front of the hut. The snow at its foot has melted back a little.
narr: {雪|ゆき} の {下|した} から 、 {小|ちい}さな {真鍮|しんちゅう} の {鈴|すず} が {出|で}て きた 。 {切|き}れた {赤|あか}い {紐|ひも} が {付|つ}いて いて 、 {継|つ}ぎ{飛脚|びきゃく} の {印|しるし} が {彫|ほ}って ある 。 || Out from under the snow comes a small brass bell on a broken red cord, the relay's emblem cut into it.
narr: {飛脚|ひきゃく} は 、 {状箱|じょうばこ} に {鈴|すず} を {付|つ}けて {走|はし}った 。 {鈴|すず} の {音|おと} で 、 {次|つぎ} の {宿|しゅく} は {飛脚|ひきゃく} が {来|く}る と {分|わ}かる 。 （{本当|ほんとう} の {習|なら}わし ） || Couriers ran with a bell tied to the letter box; at its sound, the next station knew a courier was coming. (A real custom.)
!prop pc bell
narr: {誰|だれ} の {鈴|すず} だった の か は 、 {分|わ}からない 。 {振|ふ}って みる と 、 {澄|す}んだ {音|おと} が {一|ひと}つ 、 {雲|くも} の {海|うみ} の {上|うえ} を {渡|わた}って いった 。 || Whose bell it was, there's no telling. You give it a shake, and one clear note goes out over the sea of cloud.
!sfx bell
?(comp=nao) comp[closed]: {鈴|すず} は 、 「{来|き}た ぞ」 の {合図|あいず} だ 。 …… {遅|おく}れて も 、 {来|き}た ぞ 。 || A bell means "I'm here." …Late, but here.
?(comp=mio) comp: {澄|す}んだ {音|おと} です ね 。 {雲|くも} の {下|した} の {宿場|しゅくば} まで 、 {届|とど}く と いい です けど 。 || What a clear sound. I hope it carries down to the stations under the cloud.
?(comp=ren) comp[smile]: {灯|ひ} が {届|とど}かない {所|ところ} に も 、 {音|おと} は {届|とど}きます 。 {飛脚|ひきゃく} の {鈴|すず} は 、 {耳|みみ} で {見|み}る {灯|ひ} です ね 。 || Where a lamp can't reach, a sound still can. A courier's bell is a lamp you see with your ears.
?(comp=suzu) comp[smile]: {開幕|かいまく} の {合図|あいず} みたい ね 。 …… さあ 、 {次|つぎ} の {便|びん} の {出番|でばん} よ 。 || Like the signal for curtain-up. …Right: the next post is on.
!hook cs_keepsake ks_cr_bell
!gesture pc check prop=bell
narr: {飛脚|ひきゃく} の {鈴|すず} を {見|み}つけた 。 || You find a courier's bell.
!end
:before
narr: {小屋|こや} の {前|まえ} の {石|いし} の {灯籠|とうろう} 。 {足元|あしもと} まで 、 {雪|ゆき} に {埋|う}まって いる 。 || The stone lantern in front of the hut, buried in snow to its foot.
!end
:after
narr: {小屋|こや} の {前|まえ} の {石|いし} の {灯籠|とうろう} 。 {雪|ゆき} は 、 もう {足元|あしもと} に しか {残|のこ}って いない 。 || The stone lantern in front of the hut. The snow lingers only round its foot now.

@scene yn.ks_kihachi
# After the story: Kihachi heard your step on the red bridge the night the valley walked out in yukata (yn.walk) and
# made a pair of geta to it. With Nao, his old answer turned round (yn.kihachi: "someone looking for the exit").
!faceplayer
yn_kihachi: …… あの {晩|ばん} 、 {赤|あか}い {橋|はし} の {上|うえ} で 、 あんた の {足音|あしおと} を {聞|き}いた 。 || …That night, on the red bridge, I heard your step.
yn_kihachi: {急|いそ}いで いない 、 いい {音|おと} だった 。 {音|おと} を {聞|き}けば 、 {足|あし} の {大|おお}きさ も {分|わ}かる 。 …… それ で 、 {一足|いっそく} {作|つく}って おいた 。 || An unhurried sound. A good one. From the sound I can tell the size of the foot, too. …So I made you a pair.
!gesture yn_kihachi handover pc
!gesture pc receive yn_kihachi
yn_kihachi: {桐|きり} の {台|だい} に 、 {藍|あい} の {鼻緒|はなお} だ 。 {持|も}って いけ 。 {金|かね} は {要|い}らん 。 {谷|たに} の {足音|あしおと} を {揃|そろ}えて くれた {礼|れい} だ 。 || Paulownia, with indigo thongs. Take them. I don't want money. It's thanks for getting the valley's footsteps in step.
?(comp=nao&seen.yn.kihachi) comp[smirk]: {俺|おれ} の {足音|あしおと} は ？ まだ 、 {出口|でぐち} を {探|さが}して いる か 。 || And my footsteps? Still looking for the exit?
?(comp=nao&seen.yn.kihachi) yn_kihachi: いや 。 もう {探|さが}して いない 。 …… あんた の は 、 {今度|こんど} {来|き}た {時|とき} に {作|つく}る 。 || No. Not any more. …Yours I'll make next time you come.
?(comp=nao&!seen.yn.kihachi) comp[smirk]: {下駄|げた} じゃ {走|はし}れない な 。 …… {走|はし}らない {日|ひ} の ため の {物|もの} か 。 || Can't run in geta. …They're for the days you don't run, then.
?(comp=mio) comp[smile]: {鼻緒|はなお} が {柔|やわ}らかい です ね 。 これ なら 、 {指|ゆび} の {間|あいだ} が {痛|いた}く なりません 。 || The thongs are soft. With these, your toes won't get sore.
?(comp=ren) comp[think]: {音|おと} で {人|ひと} が {分|わ}かる なら 、 {私|わたし} が {迷子|まいご} に なって も 、 {見|み}つけて もらえます ね 。 || If you can tell people by their sound, then even if I get lost, someone could find me.
?(comp=suzu) comp[laugh]: カラン 、 コロン 。 {花道|はなみち} を {歩|ある}く {音|おと} ね 。 {拍手|はくしゅ} が {聞|き}こえて きそう 。 || Karan, koron. The sound of walking the hanamichi. I can almost hear the applause.
!hook cs_keepsake ks_yn_geta
narr: {桐|きり} の {下駄|げた} を もらった 。 || You receive a pair of paulownia geta.

@scene yn.ks_yunohana
# The vent beside the bath-keepers' board on the Steaming Slope. Once the valley has agreed, the steam here runs thin
# and even, and yu-no-hana crusts its rim (real spring towns gather it as bath powder): a pinch, by the board's rule.
!if keepsake.ks_yn_yunohana -> after
!if !yn_done -> before
!gesture pc observe 8,6
narr: {湯気|ゆげ} の {穴|あな} 。 {今|いま} は {湯気|ゆげ} が {薄|うす}く 、 {静|しず}か に {上|あ}がって いる 。 {縁|ふち} に 、 {白|しろ}い {湯|ゆ}の{花|はな} が {付|つ}いて いる 。 || A steam vent. The steam rises thin and quiet now. White yu-no-hana crusts its rim.
narr: {湯守|ゆもり} の {札|ふだ} に よれば 、 {湯気|ゆげ} が {薄|うす}い {時|とき} は 、 {取|と}って も いい 。 || By the bath-keepers' board, when the steam is thin you may gather it.
!choice
* {少|すこ}し だけ {取|と}る || Take just a pinch -> take
* そのまま に する || Leave it -> end
:take
!gesture pc bend 8,6 hold
narr: {指|ゆび} で {少|すこ}し だけ {取|と}って 、 {紙|かみ} に {包|つつ}んだ 。 {卵|たまご} の よう な 、 {谷|たに} の {匂|にお}い が する 。 || You take a little with your fingers and fold it into paper. It smells of the valley: of eggs.
?(comp=nao) comp: {旅|たび} の {途中|とちゅう} でも 、 {湯|ゆ} に {入|い}れれば {谷|たに} の {湯|ゆ} に なる って わけ か 。 …… {軽|かる}い {荷物|にもつ} だ 。 || So even out on the road, put it in the water and it's the valley's spring. …Light to carry.
?(comp=mio) comp[smile]: {肌|はだ} が {滑|なめ}らか に なる だけ で 、 {病気|びょうき} は {治|なお}りません よ 。 キクエ さん の {札|ふだ} の とおり 。 …… でも 、 いい {匂|にお}い 。 || It only smooths the skin; it won't cure anything. Just as Kikue's labels say. …It does smell nice, though.
?(comp=ren) comp[smile]: {湯気|ゆげ} が {静|しず}か です 。 {釜|かま}の{主|ぬし} が 、 よく {眠|ねむ}って いる の でしょう 。 || The steam is calm. The Kettle Below must be sleeping soundly.
?(comp=suzu) comp[laugh]: {白|しろ}い わ ね 。 {舞台|ぶたい} の {白粉|おしろい} みたい 。 …… {顔|かお} に は {塗|ぬ}らない けど 。 || So white. Like stage face powder. …Not that I'd put it on my face.
!hook cs_keepsake ks_yn_yunohana
!gesture pc check prop=paper
narr: {湯|ゆ}の{花|はな} を {見|み}つけた 。 || You find yu-no-hana.
!end
:before
narr: {湯気|ゆげ} の {穴|あな} 。 {今|いま} は {白|しろ}い {湯気|ゆげ} が {濃|こ}く 、 {強|つよ}く {噴|ふ}き{出|だ}して いる 。 {札|ふだ} の {言|い}う とおり 、 {近|ちか}づかない {方|ほう} が いい 。 || A steam vent, blowing thick and white just now. As the board says, best keep back.
!end
:after
narr: {湯気|ゆげ} の {穴|あな} 。 {縁|ふち} の {湯|ゆ}の{花|はな} は 、 {少|すこ}し ずつ また {育|そだ}って いる 。 || A steam vent. The yu-no-hana round its rim is slowly growing again.
`, 'zzzz_keepsakes/30_cr_yn');

  // Suzu's Kansai-ben for her lines above (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md)
  if (RB.dialect && RB.dialect.add) RB.dialect.add('kansai', `
@ zzzz_keepsakes/30_cr_yn [cr.ks_sumi]
= {役者|やくしゃ} の {名前|なまえ} も 、 {看板|かんばん} に {筆|ふで} で {書|か}かれて 、 {初|はじ}めて {本物|ほんもの} に なる の よ 。 {大事|だいじ} に して ね 。 || An actor's name only becomes real once it's written up on the billboard with a brush. Take good care of it.
> {役者|やくしゃ} の {名前|なまえ} も 、 {看板|かんばん} に {筆|ふで} で {書|か}かれて 、 {初|はじ}めて {本物|ほんもの} に なる ねん 。 {大事|だいじ} に して な 。 || An actor's name only becomes real once it's written up on the billboard with a brush, y'know. Look after it.
@ zzzz_keepsakes/30_cr_yn [cr.ks_bell]
= {開幕|かいまく} の {合図|あいず} みたい ね 。 …… さあ 、 {次|つぎ} の {便|びん} の {出番|でばん} よ 。 || Like the signal for curtain-up. …Right: the next post is on.
> {開幕|かいまく} の {合図|あいず} みたい や な 。 …… ほな 、 {次|つぎ} の {便|びん} の {出番|でばん} や で 。 || Like the signal for curtain-up. …Right then: the next post is on.
@ zzzz_keepsakes/30_cr_yn [yn.ks_kihachi]
= カラン 、 コロン 。 {花道|はなみち} を {歩|ある}く {音|おと} ね 。 {拍手|はくしゅ} が {聞|き}こえて きそう 。 || Karan, koron. The sound of walking the hanamichi. I can almost hear the applause.
> カラン 、 コロン 。 {花道|はなみち} を {歩|ある}く {音|おと} や な 。 {拍手|はくしゅ} が {聞|き}こえて きそう や わ 。 || Karan, koron. The sound of walkin' the hanamichi. I can almost hear the applause.
@ zzzz_keepsakes/30_cr_yn [yn.ks_yunohana]
= {白|しろ}い わ ね 。 {舞台|ぶたい} の {白粉|おしろい} みたい 。 …… {顔|かお} に は {塗|ぬ}らない けど 。 || So white. Like stage face powder. …Not that I'd put it on my face.
> {白|しろ}い なあ 。 {舞台|ぶたい} の {白粉|おしろい} みたい や 。 …… {顔|かお} に は {塗|ぬ}らへん けど 。 || So white. Like stage face powder. …Not that I'd put it on my face.
`, 'zzzz_keepsakes/30_cr_yn.js');
})(RB.content);
