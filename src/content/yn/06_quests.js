/* Steamhollow, Chapter 11: the main quest and its items (expansion P13; docs/future/work/P13_STEAMHOLLOW.md). The side
 * quests' entries are added with their stories (25_side.js). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (jp, en) => ({ jp, en });
  C.quests.yn_main = {
    main: true, chapter: 'yn',
    title: T('{湯|ゆ}ノ{谷|たに}', 'Steamhollow'),
    stages: [
      T('{峠|とうげ} の {向|む}こう の {湯|ゆ} の {谷|たに} から 、 {継|つ}ぎ{飛脚|びきゃく} が {手紙|てがみ} を {運|はこ}んで {来|き}た 。 {雲路峠|くもじとうげ} から {北東|ほくとう} へ {下|くだ}ろう 。', 'The relay has brought a letter from the valley of hot springs beyond the pass. Go down to the north-east from the Cloudroad Pass.'),
      T('{湯|ゆ}ノ{谷|たに} に {着|つ}いた 。 {手紙|てがみ} を {書|か}いた {湯守|ゆもり} の {頭|かしら} 、 ロクベエ を {探|さが}そう 。', 'Steamhollow. Find Rokubei, the head bath-keeper who wrote the letter.'),
      T('{宿|やど} は どこ も {満員|まんいん} だ 。 {上|かみ}の{湯|ゆ} の {帳場|ちょうば} を {手伝|てつだ}って 、 {新|あたら}しく {来|き}た {人|ひと} たち の {部屋|へや} を {決|き}めよう 。', 'Every inn is full. Help at the Upper House\'s front desk and find rooms for the newcomers.'),
      T('{上|かみ}の{湯|ゆ} と {下|しも}の{湯|ゆ} が 、 {一|ひと}つ の {湯|ゆ} を {巡|めぐ}って {揉|も}めて いる 。 {下|しも}の{湯|ゆ} の {話|はなし} も {聞|き}こう 。', 'The Upper House and the Lower House are quarrelling over the one spring they share. Hear the Lower House\'s side too.'),
      T('{橋|はし} の {上|うえ} で {口論|こうろん} が {始|はじ}まり 、 {地面|じめん} が {揺|ゆ}れた 。 {湯守|ゆもり} の {寄合所|よりあいじょ} で 、 ロクベエ に {会|あ}おう 。', 'A quarrel broke out on the bridge and the ground shook. See Rokubei at the bath-keepers\' hall.'),
      T('{湯|ゆ} が {熱|あつ}すぎたり {冷|つめ}たすぎたり する 。 {湯元|ゆもと} の {下|した} 、 {湯気|ゆげ} の {抜|ぬ}け{穴|あな} へ {降|お}りよう 。', 'The water runs too hot, then too cold. Go down into the Steam Vents under the spring house.'),
      T('{釜|かま}の{主|ぬし} は {落|お}ち{着|つ}いた 。 {寄合所|よりあいじょ} で 、 {二|ふた}つ の {宿|やど} と {湯守|ゆもり} と {湯|ゆ} に 、 {話|はな}し{合|あ}って もらおう 。', 'The Kettle Below has settled. At the guild hall, bring the two houses, the guild and the spring to talk it out.'),
      T('{谷|たに} {全体|ぜんたい} で {決|き}めた 。 {北|きた} の {道|みち} が {開|ひら}いて いる 。', 'The valley has decided, as a whole. The north road is open.'),
    ],
    reward: { flags: ['yn_main_done'] },
  };

  const it = (id, d) => (C.items[id] = d);
  it('yn_letter', { name: T('{湯守|ゆもり} の {手紙|てがみ}', 'The bath-keepers\' letter'), key: true, desc: 'Rokubei\'s letter, carried up the restored relay: "To the travellers who gave the Cloudroad its voice back. The valley is full and quarrelling, and the spring runs hot and cold. Please come down."' });
  it('yn_towel', { name: T('{手拭|てぬぐ}い', 'A hand towel'), key: true, desc: 'A long cotton towel (手拭い) printed with the Upper House\'s crest. For washing, for your head in the bath, never in the water.' });
  it('yn_yukata', { name: T('{浴衣|ゆかた}', 'A yukata'), key: true, desc: 'A light cotton robe lent by the inn, indigo with white steam curls. Left side over right, always (right over left is for the dead).' });
  it('yn_ledger', { name: T('{湯分|ゆわ}け の {帳面|ちょうめん}', 'The guild\'s water ledger'), key: true, desc: 'The bath-keepers\' record of the spring\'s flow and how it is divided between the two houses: by the hour, by an old water clock.' });
  it('yn_agreement', { name: T('{湯|ゆ} の {取|と}り{決|き}め', 'The spring agreement'), key: true, desc: 'The agreement the two houses, the guild and the town signed together, in words you helped choose. A copy for you, folded small.' });
  it('yn_eggs', { name: T('{温泉卵|おんせんたまご}', 'Spring eggs'), desc: 'Eggs slow-cooked in the spring: the white barely set, the yolk soft. Eaten with a little broth, or given away.' });
})(RB.content);
