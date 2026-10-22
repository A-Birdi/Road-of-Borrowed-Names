/* The Cloudroad, Chapter 10: quests and items (expansion P12; docs/future/work/P12_CLOUDROAD.md). The side quests'
 * entries are added with their stories (25_side.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  // Climbing station by station (stage 2), the next step is the furthest station's own work, in this order (first
  // match): Kanbe while you have no ledger; that station's person while the message brought up from below is still
  // undelivered; its lamp while it has no name; its person while they have no message for you; the way east (34,12)
  // until the road on is planned; then the next station. Each station's departure waits on its lamp, its message and
  // the plan (cr.depart<n>), so nothing below the furthest station can still be owed; riding the palanquin back down
  // does not move the step. A message passed on with more certainty than you had is put right in the talk of whoever
  // acted on it, which nothing waits on: not a step. (RBN-QA-099)
  const STN = [null,
    { map: 'cr.oiwake', lamp: [29, 10], who: { map: 'cr.oiwake_post', npc: 'cr_kanbe' } },
    { map: 'cr.suginoki', lamp: [30, 10], who: { map: 'cr.suginoki', npc: 'cr_ine' } },
    { map: 'cr.sakashita', lamp: [31, 10], who: { map: 'cr.sakashita', npc: 'cr_heisuke' } },
    { map: 'cr.nakayama', lamp: [32, 15], who: { map: 'cr.nakayama', npc: 'cr_otaki' } },
    { map: 'cr.umagaeshi', lamp: [30, 10], who: { map: 'cr.umagaeshi', npc: 'cr_genji' } },
  ];
  const climb = [{ if: '!item.cr_ledger', at: STN[1].who }];
  for (let n = 1; n <= 5; n++) {
    const s = STN[n], here = 'cr_st' + n + '&!cr_st' + (n + 1);
    if (n > 1) climb.push({ if: here + '&cr_given' + (n - 1) + '&!relay_cr_r' + (n - 1) + '_done', at: s.who });
    climb.push({ if: here + '&!cr_lamp' + n, at: { map: s.map, prop: 'cr_joyato', x: s.lamp[0], y: s.lamp[1] } });
    climb.push({ if: here + '&!cr_given' + n, at: s.who });
    climb.push({ if: here + '&!cr_plan' + n, at: { map: s.map, x: 34, y: 12 } });
    climb.push({ if: here, at: { map: n < 5 ? STN[n + 1].map : 'cr.kirishita' } });
  }
  C.quests.cr_main = {
    main: true, chapter: 'cr',
    title: T('{雲路|くもじ}', 'The Cloudroad'),
    stages: [
      T('{伝言|でんごん} が {途中|とちゅう} で {崩|くず}れて いた 。 {灯落|ひおち} の {議会|ぎかい}{堂|どう} で 、 タミ に {直接|ちょくせつ} {聞|き}こう 。', 'The message came garbled on the way. Ask Tami herself, at Lanternfall\'s council chamber.'),
      T('{灯|ひ} の {道|みち} の {上|うえ} の {端|はし} から 、 {古|ふる}い {街道|かいどう} が {北|きた} の {山|やま} へ {登|のぼ}って いる 。 {追分宿|おいわけじゅく} へ {行|い}こう 。', 'From the top end of the Lantern Road the old highway climbs into the northern mountains. Go up to Oiwake Station.'),
      Object.assign(T('{宿場|しゅくば} の {灯|ひ} に {名前|なまえ} を {戻|もど}し 、 {継|つ}ぎ{飛脚|びきゃく} の {伝言|でんごん} を {運|はこ}び ながら 、 {宿|しゅく} から {宿|しゅく} へ {登|のぼ}ろう 。', 'Give each station\'s lamp its name back and carry the relay\'s messages, climbing station by station.'),
        { atIf: climb }),
      T('{霧下宿|きりしたじゅく} は 、 {関所|せきしょ} の {下|した} の {最後|さいご} の {宿|しゅく} だ 。 {霧|きり} の {関|せき} へ {行|い}こう 。', 'Kirishita is the last station below the checkpoint. Go on to the Mist Barrier.'),
      T('{通行手形|つうこうてがた} の {名前|なまえ} が {消|き}えて いる 。 {関守|せきもり} に {話|はなし} を しよう 。', 'The names on your travel papers have gone blank. Speak to the keeper of the Barrier.'),
      T('{仲間|なかま} が {関所|せきしょ} に {残|のこ}って くれた 。 {一人|ひとり} で {雲居宿|くもいじゅく} へ {行|い}き 、 {証|あかし} を もらって {来|こ}よう 。', 'Your companion has stayed at the Barrier as surety. Go up alone to Kumoi Station and bring back proof.'),
      // (in Nao's journey the pass waits for the night at Kirishita: Nao on the porch)
      Object.assign(T('{関所|せきしょ} を {二人|ふたり} で {越|こ}えた 。 {雲路峠|くもじとうげ} を {登|のぼ}ろう 。', 'Through the Barrier together. Climb the High Pass.'),
        { atIf: [{ if: 'cr_nao_night', at: { map: 'cr.kirishita', npc: 'nao' } }] }),
      T('{峠|とうげ} の {上|うえ} の {飛脚|ひきゃく}{小屋|ごや} に 、 {誰|だれ} か が いる 。', 'Someone is at the courier\'s hut at the top of the pass.'),
      T('{最後|さいご} の {飛脚|ひきゃく} の {手紙|てがみ} を 、 {届|とど}ける べき {人|ひと} に {届|とど}けよう 。', 'Take the last courier\'s letter to the person it was meant for.'),
    ],
    reward: { flags: ['cr_main_done'] },
  };

  const it = (id, d) => (C.items[id] = d);
  it('cr_ledger', { name: T('{継|つ}ぎ{飛脚|びきゃく} の {帳面|ちょうめん}', 'The relay\'s ledger'), key: true, desc: 'Kanbe\'s copy of the relay\'s ledger: the seven stations of the Cloudroad in order, from the bottom of the road up, and the last runs of the old relay.' });
  it('cr_papers', { name: T('{通行手形|つうこうてがた}', 'Travel papers'), key: true, desc: 'Papers for the highway, issued at Oiwake: who you are, where you come from and where you are going. Up here the names on them have gone blank.' });
  it('cr_proof', { name: T('{請状|うけじょう}', 'A letter of guarantee'), key: true, desc: 'Shizu, the headwoman of Kumoi, vouches for you in her own hand, with Kumoi\'s seal: proof for the Barrier that you are who you say.' });
  it('cr_message', { name: T('{古|ふる}い {手紙|てがみ}', 'An old letter'), key: true, desc: 'From the last courier\'s letter box: a letter fifty years on the road, folded small, its address almost gone.' });
})(RB.content);
