/* A Quiet Cast — the coast (expansion P15g; F-82; plan 06_WORLD.md W7 "fishing from the boat: a new station for the
 * existing pastime", 07_REGIONS.md R6 "a quiet place to fish"). Twelve-chapter journeys only (`edition: 2`): a
 * six-chapter journey keeps its three stations and nine fish exactly. Two stations, three fish each (the coast's
 * book, its own spread), six situations each in the four profile adaptations (48 task variants), and the boat's
 * destination after the story, the One-Pine Islet, where the second station is.
 *
 *   fish.sazanami.rocks  sz.hamlet  stand (34,19) facing south; station (34,20)
 *        A stake in the water off the waterline, among the rocks east of the jetty (a water tile: nothing walkable
 *        changes).
 *   fish.boat            sea.islet  stand (9,12) facing west; station (8,12)
 *        The stake at the end of the islet's jetty that the boat's stern line is tied to: you step down into the boat
 *        and fish from it (a water tile).
 *
 * The situations use the stage's own actions (wait, left, right, slack, tub, lift, recover, patch, close, slow); the
 * stage gained a rock, weed and a neighbour on the left, and the two waterside dresses (src/ui/86_fishing_stage.js).
 * Captions: as for the first nine, no biological claim is made: each fish has its name and reading, a common English
 * name, and a survey line about where it was recorded (docs/practice/fishing.md lists what to verify). Provenance:
 * authored for this game in plain textbook Japanese; not reviewed by a native speaker. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (F, C, K) {
  'use strict';
  const T = (en, jp) => ({ en, jp });

  RB.lex.add(RB.lex.parseTable(`
# the coast's six fish (katakana, as the first nine)
メジナ||n|I|mejina (a rocky-shore fish; largescale blackfish)
カサゴ||n|I|kasago (a rocky-shore fish; marbled rockfish)
キュウセン||n|I|kyūsen (a sandy-bottom fish; a wrasse)
サバ||n|E|saba (a sea fish; chub mackerel)
イサキ||n|I|isaki (a sea fish; chicken grunt)
マダイ||n|I|madai (a sea fish; red sea bream)
# the rocks and the boat
海藻|かいそう|n|I|seaweed
擦れる|すれる|v1|I|to rub, to chafe
上下|じょうげ|vs|I|up and down; rising and falling
揺られる|ゆられる|v1|I|to be rocked, to be swayed (by waves)
泡|あわ|n|E|foam, bubbles
隙間|すきま|n|I|a gap, a crevice
砂地|すなじ|n|I|sandy ground; a sandy bottom
浮標|ふひょう|n|A|a buoy (a floating marker)
船べり|ふなべり|n|I|the side of a boat, the gunwale
小島|こじま|n|E|a small island, an islet
一本松|いっぽんまつ|n|I|a lone pine
外す|はずす|v5s|E|to take off, to free, to undo
擦り切れる|すりきれる|v1|A|to wear through (by rubbing)
彫る|ほる|v5r|I|to carve
削る|けずる|v5r|I|to shave, to wear away
小魚|こざかな|n|E|small fish
海鳥|うみどり|n|I|a seabird
岸寄り|きしより|n|A|close to the shore
傷つく|きずつく|v5k|I|to be hurt, to be damaged
艫綱|ともづな|n|A|a stern line (the rope that moors a boat by its stern)
`));

  // ---- the two stations (§5.2) ---------------------------------------------------------------------------------------
  F.addSite({
    id: 'fish.sazanami.rocks', map: 'sz.hamlet', region: 'sazanami', dress: 'rocks', edition: 2, book: 'coast',
    station: { x: 34, y: 20 }, stand: { x: 34, y: 19, dir: 'down' },
    name: { jp: '{漣|さざなみ} の {岩場|いわば}', en: 'The rocks at Sazanami' },
    where: { jp: '{桟橋|さんばし} の {東|ひがし} 、 {岩|いわ} の {間|あいだ} の {波打|なみう}ち{際|ぎわ}', en: 'East of the jetty, at the water\'s edge among the rocks' },
    view: { en: 'You face south over the bay. On the left a pine-topped headland closes it in; rocks stand in the water ahead and to the right.' },
    species: ['mejina', 'kasago', 'kyusen'],
    patches: [
      { id: 'foam', name: { jp: '{白|しろ}い {泡|あわ} の {所|ところ}', en: 'White water' }, desc: { en: 'Where the waves break white against the rocks.' }, fish: ['mejina', 'kyusen'], at: [0.6, 0.46] },
      { id: 'crevice', name: { jp: '{岩|いわ} の {隙間|すきま}', en: 'Gaps between the rocks' }, desc: { en: 'Down in the gaps between the rocks near your feet.' }, fish: ['kasago', 'mejina'], at: [0.78, 0.66] },
      { id: 'sand', name: { jp: '{岩|いわ} の {先|さき} の {砂地|すなじ}', en: 'Sand beyond the rocks' }, desc: { en: 'The pale sandy bottom out past the last rock.' }, fish: ['kyusen'], at: [0.42, 0.34] },
    ],
  });
  F.addSite({
    id: 'fish.boat', map: 'sea.islet', region: 'sea', dress: 'deck', edition: 2, book: 'coast',
    station: { x: 8, y: 12 }, stand: { x: 9, y: 12, dir: 'left' },
    name: { jp: '{一本松|いっぽんまつ} の {小島|こじま} の {沖|おき} 、 {船|ふね} の {上|うえ}', en: 'The boat, off the One-Pine Islet' },
    where: { jp: '{小島|こじま} の {桟橋|さんばし} の {先|さき} 、 {船|ふね} を {繋|つな}いだ {杭|くい}', en: 'At the end of the islet\'s jetty, where the boat is tied' },
    view: { en: 'You sit in the stern of the boat and face out to sea. The islet and its one pine are off to the right; open water lies ahead.' },
    species: ['saba', 'isaki', 'madai'],
    patches: [
      { id: 'birds', name: { jp: '{海鳥|うみどり} の {下|した}', en: 'Water under the seabirds' }, desc: { en: 'Where the seabirds wheel and dive.' }, fish: ['saba', 'isaki'], at: [0.6, 0.4] },
      { id: 'reef', name: { jp: '{沈|しず}んだ {岩|いわ} の {上|うえ}', en: 'Water over the sunken rock' }, desc: { en: 'Above a rock that lies under the surface.' }, fish: ['isaki', 'madai'], at: [0.78, 0.62] },
      { id: 'deep', name: { jp: '{深|ふか}い {所|ところ}', en: 'Deep water' }, desc: { en: 'Out where the water turns dark.' }, fish: ['madai'], at: [0.4, 0.32] },
    ],
  });

  // ---- the six fish (§5.3: outline, fins and markings differ by species, not only colour) ---------------------------
  const fish = (id, o) => F.addFish(Object.assign({ id, edition: 2, book: 'coast' }, o));
  fish('mejina', {
    jp: 'メジナ', reading: 'めじな', romaji: 'mejina', en: 'Mejina', common: 'largescale blackfish', site: 'fish.sazanami.rocks', ref: 'F10',
    hint: { en: 'Somewhere off the rocks at Sazanami, where the water is white.' },
    survey: { jp: 'メジナ 。 {岩場|いわば} の {泡|あわ} の {近|ちか}く で {見|み}た 。', en: 'Mejina. Seen near the foam off the rocks.' },
    stage: 26,
    art: {
      len: 74,
      profile: [[0, 0.06, 0.05], [0.08, 0.15, 0.13], [0.3, 0.2, 0.18], [0.6, 0.17, 0.15], [0.85, 0.08, 0.07], [1, 0.05, 0.05]],
      tail: { len: 0.2, spread: 0.18, fork: 0.25, shape: 'truncate' },
      dorsal: [{ at: 0.32, len: 0.5, h: 0.08, shape: 'long' }],
      anal: { at: 0.6, len: 0.22, h: 0.07, shape: 'long' },
      pelvic: { at: 0.32, len: 0.08, h: 0.05 }, pectoral: { at: 0.22, len: 0.12, h: 0.05 },
      eye: { at: 0.1, v: 0.38, r: 0.035 }, mouth: 'terminal', mouthLen: 0.03, gill: 0.22,
      col: { back: '#2e3a46', flank: '#4c5a66', belly: '#8a96a0', fin: '#3a4652' },
      mark: { scales: true, opercle: '#1e2830' },
    },
  });
  fish('kasago', {
    jp: 'カサゴ', reading: 'かさご', romaji: 'kasago', en: 'Kasago', common: 'marbled rockfish', site: 'fish.sazanami.rocks', ref: 'F11',
    hint: { en: 'Somewhere among the rocks at Sazanami, low down.' },
    survey: { jp: 'カサゴ 。 {岩|いわ} の {隙間|すきま} で {見|み}た 。', en: 'Kasago. Seen in a gap between the rocks.' },
    stage: 22,
    art: {
      len: 66,
      profile: [[0, 0.09, 0.07], [0.1, 0.17, 0.12], [0.28, 0.17, 0.12], [0.55, 0.12, 0.09], [0.82, 0.07, 0.06], [1, 0.05, 0.05]],
      tail: { len: 0.18, spread: 0.13, fork: 0, shape: 'round' },
      dorsal: [{ at: 0.24, len: 0.34, h: 0.14, shape: 'spiny' }, { at: 0.6, len: 0.18, h: 0.09 }],
      anal: { at: 0.62, len: 0.12, h: 0.09 },
      pelvic: { at: 0.28, len: 0.12, h: 0.07 }, pectoral: { at: 0.2, len: 0.2, h: 0.1 },
      eye: { at: 0.11, v: 0.78, r: 0.045 }, mouth: 'up', mouthLen: 0.08, gill: 0.26,
      col: { back: '#8a3a2a', flank: '#b8644a', belly: '#e6c4a8', fin: '#a84a34' },
      mark: { mottle: '#5a2418', spots: [{ t0: 0.15, t1: 0.95, v0: 0.05, v1: 0.7, p: 9, col: '#f0dcc4', seed: 11 }] },
    },
  });
  fish('kyusen', {
    jp: 'キュウセン', reading: 'きゅうせん', romaji: 'kyūsen', en: 'Kyūsen', common: 'multicolorfin rainbowfish (a wrasse)', site: 'fish.sazanami.rocks', ref: 'F12',
    hint: { en: 'Somewhere off the rocks at Sazanami, over the sand.' },
    survey: { jp: 'キュウセン 。 {岩|いわ} の {先|さき} の {砂地|すなじ} で {見|み}た 。', en: 'Kyūsen. Seen over the sand beyond the rocks.' },
    stage: 22,
    art: {
      len: 70,
      profile: [[0, 0.04, 0.035], [0.08, 0.08, 0.07], [0.3, 0.1, 0.09], [0.6, 0.09, 0.08], [0.85, 0.06, 0.055], [1, 0.045, 0.045]],
      tail: { len: 0.16, spread: 0.12, fork: 0, shape: 'truncate' },
      dorsal: [{ at: 0.2, len: 0.66, h: 0.05, shape: 'long' }],
      anal: { at: 0.55, len: 0.32, h: 0.045, shape: 'long' },
      pelvic: { at: 0.3, len: 0.06, h: 0.04 }, pectoral: { at: 0.2, len: 0.1, h: 0.05 },
      eye: { at: 0.08, v: 0.4, r: 0.028 }, mouth: 'terminal', mouthLen: 0.035, gill: 0.18,
      col: { back: '#5a8a5a', flank: '#c8b088', belly: '#f0e8d0', fin: '#d8a060' },
      mark: { stripes: [{ t0: 0.08, t1: 0.98, v: 0.3, hw: 0.04, col: '#3a5a8a', k: 0.75 }, { t0: 0.2, t1: 0.96, v: 0.52, hw: 0.03, col: '#c84a3a', k: 0.7 }] },
    },
  });
  fish('saba', {
    jp: 'サバ', reading: 'さば', romaji: 'saba', en: 'Saba', common: 'chub mackerel', site: 'fish.boat', ref: 'F13',
    hint: { en: 'Somewhere off the One-Pine Islet, where the birds are.' },
    survey: { jp: 'サバ 。 {船|ふね} から 、 {海鳥|うみどり} の {下|した} で {見|み}た 。', en: 'Saba. Seen from the boat, under the seabirds.' },
    stage: 28,
    art: {
      len: 82,
      profile: [[0, 0.035, 0.03], [0.1, 0.1, 0.08], [0.35, 0.12, 0.1], [0.65, 0.08, 0.07], [0.88, 0.03, 0.03], [1, 0.025, 0.025]],
      tail: { len: 0.24, spread: 0.2, fork: 0.85 },
      dorsal: [{ at: 0.3, len: 0.12, h: 0.09, shape: 'spiny' }, { at: 0.55, len: 0.08, h: 0.06 }],
      anal: { at: 0.6, len: 0.08, h: 0.05 },
      pelvic: { at: 0.3, len: 0.06, h: 0.04 }, pectoral: { at: 0.22, len: 0.1, h: 0.04 },
      eye: { at: 0.09, v: 0.4, r: 0.033 }, mouth: 'terminal', gill: 0.2,
      col: { back: '#2e6a6a', flank: '#b8c8c4', belly: '#eef2ee', fin: '#8aa0a0' },
      mark: { bars: { t0: 0.15, t1: 0.95, n: 14, w: 0.35, col: '#16343a', v0: 0.02, v1: 0.42, k: 0.85 } },
    },
  });
  fish('isaki', {
    jp: 'イサキ', reading: 'いさき', romaji: 'isaki', en: 'Isaki', common: 'chicken grunt', site: 'fish.boat', ref: 'F14',
    hint: { en: 'Somewhere off the One-Pine Islet, over the rock under the water.' },
    survey: { jp: 'イサキ 。 {船|ふね} から 、 {沈|しず}んだ {岩|いわ} の {上|うえ} で {見|み}た 。', en: 'Isaki. Seen from the boat, over the sunken rock.' },
    stage: 26,
    art: {
      len: 76,
      profile: [[0, 0.05, 0.04], [0.1, 0.12, 0.1], [0.32, 0.15, 0.13], [0.62, 0.12, 0.1], [0.86, 0.06, 0.05], [1, 0.04, 0.04]],
      tail: { len: 0.2, spread: 0.16, fork: 0.45 },
      dorsal: [{ at: 0.28, len: 0.24, h: 0.12, shape: 'spiny' }, { at: 0.53, len: 0.2, h: 0.07 }],
      anal: { at: 0.62, len: 0.12, h: 0.07 },
      pelvic: { at: 0.32, len: 0.08, h: 0.05 }, pectoral: { at: 0.22, len: 0.12, h: 0.05 },
      eye: { at: 0.1, v: 0.38, r: 0.035 }, mouth: 'terminal', mouthLen: 0.04, gill: 0.22,
      col: { back: '#6a6a4a', flank: '#a8a888', belly: '#e4e2d0', fin: '#8a8a6a' },
      mark: { stripes: [{ t0: 0.12, t1: 0.95, v: 0.18, hw: 0.035, col: '#4a4a30', k: 0.6 }, { t0: 0.12, t1: 0.95, v: 0.34, hw: 0.035, col: '#4a4a30', k: 0.6 }, { t0: 0.15, t1: 0.92, v: 0.5, hw: 0.03, col: '#5a5a3a', k: 0.5 }] },
    },
  });
  fish('madai', {
    jp: 'マダイ', reading: 'まだい', romaji: 'madai', en: 'Madai', common: 'red sea bream', site: 'fish.boat', ref: 'F15',
    hint: { en: 'Somewhere off the One-Pine Islet, in the deeper water.' },
    survey: { jp: 'マダイ 。 {船|ふね} から 、 {深|ふか}い {所|ところ} で {見|み}た 。', en: 'Madai. Seen from the boat, in the deep water.' },
    stage: 30,
    art: {
      len: 80,
      profile: [[0, 0.06, 0.05], [0.1, 0.2, 0.15], [0.3, 0.25, 0.2], [0.6, 0.18, 0.15], [0.85, 0.07, 0.06], [1, 0.045, 0.045]],
      tail: { len: 0.22, spread: 0.2, fork: 0.6 },
      dorsal: [{ at: 0.22, len: 0.5, h: 0.13, shape: 'spiny' }],
      anal: { at: 0.6, len: 0.16, h: 0.08 },
      pelvic: { at: 0.3, len: 0.1, h: 0.06 }, pectoral: { at: 0.22, len: 0.18, h: 0.05 },
      eye: { at: 0.12, v: 0.42, r: 0.035 }, mouth: 'terminal', mouthLen: 0.04, gill: 0.24,
      col: { back: '#c8505a', flank: '#e88a8a', belly: '#f6e2dc', fin: '#d86a6a' },
      mark: { spots: [{ t0: 0.15, t1: 0.9, v0: 0.05, v1: 0.5, p: 6, col: '#6ac0e0', seed: 13 }] },
    },
  });

  // ---- the twelve situations × four profiles (§6.2, §6.3) -----------------------------------------------------------
  const W = (o) => Object.assign({ kind: 'write', mode: 'reading', script: 'hira' }, o);
  const CH = (o) => Object.assign({ kind: 'choose' }, o);
  const no = (en) => ({ en });
  const RIGHT = ['みぎ', '{右|みぎ}', 'みぎへ', '{右|みぎ}へ', 'みぎに', '{右|みぎ}に', 'みぎがわ', '{右側|みぎがわ}', 'みぎがわへ', '{右側|みぎがわ}へ'];
  const LEFT = ['ひだり', '{左|ひだり}', 'ひだりへ', '{左|ひだり}へ', 'ひだりに', '{左|ひだり}に', 'ひだりがわ', '{左側|ひだりがわ}', 'ひだりがわへ', '{左側|ひだりがわ}へ'];
  const WAIT = ['まつ', '{待|ま}つ', 'まって', '{待|ま}って', 'まちます', '{待|ま}ちます', 'まだまつ', 'まだ{待|ま}つ'];
  const LIFT = ['あげる', '{上|あ}げる', 'あげます', '{上|あ}げます', 'そっとあげる', 'そっと{上|あ}げる'];
  const CLOSER = ['よせる', '{寄|よ}せる', 'よせます', '{寄|よ}せます', 'ゆっくりよせる', 'ゆっくり{寄|よ}せる'];
  const SLACK = ['ゆるめる', '{緩|ゆる}める', 'ゆるめます', '{緩|ゆる}めます'];
  const TUB = ['おけ', '{桶|おけ}', 'おけへ', '{桶|おけ}へ', 'おけに', '{桶|おけ}に'];
  const WIND = ['まく', '{巻|ま}く', 'まきます', '{巻|ま}きます'];
  const SLOW = ['ゆっくり', 'ゆっくりと'];
  const O = {
    wait: { forms: WAIT, en: 'まつ (wait) is good Japanese, but waiting is not what this moment needs.' },
    lift: { forms: LIFT, en: 'あげる (lift) is good Japanese, but lifting is not what this moment needs.' },
    right: { forms: RIGHT, en: 'みぎ (right) is good Japanese, but look again at which side is clear.' },
    left: { forms: LEFT, en: 'ひだり (left) is good Japanese, but look again at which side is clear.' },
    pull: { forms: ['ひく', '{引|ひ}く', 'ひっぱる', '{引|ひ}っ{張|ぱ}る'], en: 'ひく / ひっぱる (pull) is good Japanese, but this game does not support pulling hard here: the note asks for something gentler.' },
    closer: { forms: CLOSER, en: 'よせる (bring closer) is good Japanese, but that is not this moment\'s step.' },
  };
  const S = (o) => F.addSituation(o);

  // ===================================================================================================
  // The rocks at Sazanami (fish.sazanami.rocks)
  // ===================================================================================================
  S({ id: 'R01', site: 'fish.sazanami.rocks', intent: 'wait', title: { jp: '{波|なみ} に {揺|ゆ}られる {浮|う}き', en: 'A float riding the swell' },
    scene: { en: 'Each wave lifts the float and lets it down again. It has not stayed under.' },
    rule: { jp: '{浮|う}き が {波|なみ} で {上|あ}がったり {下|さ}がったり する だけ なら 、 まだ {合図|あいず} で は ない 。 {沈|しず}んだ まま に なる まで {待|ま}つ 。', en: 'If the float only rises and falls with the waves, that is not the signal. Wait until it stays under.' },
    misread: { en: 'Rising and falling with the swell is the sea, not a fish.' },
    stage: { drift: true },
    tasks: {
      F: W({ item: 'v:待つ', answer: 'まつ', accept: WAIT, reading: 'まつ', meaning: { en: 'wait' },
        teach: { title: 'まつ — to wait', jp: 'まつ', en: 'まつ (matsu) means “to wait”. The note says: the waves lift the float; wait until it stays under.' },
        prompt: { en: 'The float only rides up and down on the swell. Write “wait”.' },
        others: [O.lift, O.pull], explain: { jp: 'しずんだ まま に なる まで 、 まつ 。', en: 'The swell moves the float; wait for it to stay under.' } }),
      E: W({ item: 'v:待つ', answer: 'まつ', accept: WAIT, reading: 'まつ', meaning: { en: 'wait' },
        prompt: { en: 'The float rises and falls with each wave but does not stay under. What does the note tell you to do? Write one verb in Japanese.' },
        others: [O.lift, O.pull], explain: { jp: '{待|ま}つ ＝ to wait', en: 'The waves move the float: you wait until it stays under.' } }),
      I: CH({ item: 'g:v_tari', reading: 'まだ まつ', meaning: { en: 'keep waiting' },
        note: { jp: 'メモ ： 「{浮|う}き が {波|なみ} で {上|あ}がったり {下|さ}がったり する だけ なら 、 まだ {合図|あいず} で は ない 。」 ／ いま 、 {浮|う}き は {波|なみ} と {一緒|いっしょ} に {上下|じょうげ} して いる 。', en: 'Note: "If the float only rises and falls with the waves, that is not the signal yet." / Now the float is going up and down with the waves.' },
        prompt: { en: 'What do you do now?' },
        options: [
          { jp: 'まだ {待|ま}つ 。', ok: true },
          { jp: 'すぐ {竿|さお} を {上|あ}げる 。', ok: false, why: no('上がったり下がったり: up and down with the waves is the sea, not a bite.') },
          { jp: '{波|なみ} に {合|あ}わせて {糸|いと} を {引|ひ}く 。', ok: false, why: no('The note asks you to wait, not to move the line.') },
        ], explain: { jp: '〜 たり 〜 たり ＝ now … now …', en: 'Up, down, up again: that is the waves.' } }),
      A: CH({ item: 'g:adv_ni_suginai', reading: 'しずんだ まま に なる まで まつ', meaning: { en: 'the rising and falling is only the swell: wait until it stays under' },
        note: { jp: 'メモ ： 「{浮|う}き の {上下|じょうげ} は 、 {波|なみ} に {揺|ゆ}られて いる に すぎない 。 {魚|さかな} の {合図|あいず} は 、 {浮|う}き が {沈|しず}んだ まま {戻|もど}らない こと だ 。」', en: 'Note: "The float\'s rising and falling is merely the waves rocking it. The fish\'s signal is the float going under and not coming back."' },
        prompt: { en: 'The float is rising and falling. What follows from the note?' },
        options: [
          { jp: '{浮|う}き が {沈|しず}んだ まま {戻|もど}らなく なる まで 、 {待|ま}つ 。', ok: true },
          { jp: '{浮|う}き が {上下|じょうげ} したら 、 すぐ {上|あ}げる 。', ok: false, why: no('にすぎない: the rising and falling is MERELY the waves.') },
          { jp: '{波|なみ} が {高|たか}い ので 、 {今日|きょう} は やめる 。', ok: false, why: no('The note says nothing about stopping: it tells you what the real signal is.') },
        ], explain: { jp: '〜 に すぎない ＝ merely …', en: 'Only the swell; the real signal is still to come.' } }),
    } });

  S({ id: 'R02', site: 'fish.sazanami.rocks', intent: 'left', title: { jp: '{右|みぎ} の {岩|いわ}', en: 'A rock on the right' },
    scene: { en: 'A rock juts out of the water just to the right of your line. To the left, the water is open.' },
    rule: { jp: '{岩|いわ} に {糸|いと} が {擦|す}れる と 、 {切|き}れる 。 {岩|いわ} の ない ほう へ 。', en: 'If the line rubs on the rock, it breaks. Go to the side without the rock.' },
    misread: { en: 'Follow the open side, away from the rock.' },
    stage: { obstacle: 'rock', side: 'right' },
    tasks: {
      F: W({ item: 'v:左', answer: 'ひだり', accept: LEFT, reading: 'ひだり', meaning: { en: 'left' },
        teach: { title: 'ひだり — left', jp: 'ひだり', en: 'ひだり (hidari): left.' },
        prompt: { en: 'The rock is on the right; the left is open. Write “left”.' },
        others: [O.right, O.wait], explain: { jp: 'いわ の ない ひだり へ', en: 'To the open side, away from the rock.' } }),
      E: W({ item: 'v:左', answer: 'ひだり', accept: LEFT, reading: 'ひだり', meaning: { en: 'left' },
        prompt: { en: 'A rock juts out of the water to the right of your line. Which way do you guide it? Write the direction in Japanese.' },
        others: [O.right, O.wait, O.pull], explain: { jp: '{左|ひだり} ＝ left', en: 'The open water is on the left.' } }),
      I: CH({ item: 'g:cond_to', reading: 'ひだり へ', meaning: { en: 'to the left (away from the rock)' },
        note: { jp: 'メモ ： 「{岩|いわ} に {糸|いと} が {擦|す}れる と 、 {切|き}れる 。」 ／ {岩|いわ} は {右|みぎ} 、 {左|ひだり} は {開|ひら}けて いる 。', en: 'Note: "If the line rubs on the rock, it breaks." / The rock is on the right; on the left the water is open.' },
        prompt: { en: 'Which way do you guide the line?' },
        options: [
          { jp: '{左|ひだり} へ', ok: true },
          { jp: '{右|みぎ} へ', ok: false, why: no('と: rub on the rock and the line breaks — and the rock is on the right.') },
          { jp: '{岩|いわ} の {上|うえ} に {魚|さかな} を {上|あ}げる', ok: false, why: no('Nothing in the note brings the fish onto the rock.') },
        ], explain: { jp: '〜 と ＝ when / if … (always)', en: 'A sure result keeps you off the rock side.' } }),
      A: CH({ item: 'g:adv_kanenai', reading: 'ひらけた ひだり へ みちびく', meaning: { en: 'lead it to the open water on the left' },
        note: { jp: 'メモ ： 「{岩|いわ} の {近|ちか}く で は 、 {糸|いと} が {擦|す}れて {切|き}れ かねない 。 {開|ひら}けた {側|がわ} へ {導|みちび}く こと 。」', en: 'Note: "Near the rock the line could well chafe and break. Lead it to the open side."' },
        prompt: { en: 'What does the note ask?' },
        options: [
          { jp: '{開|ひら}けた {左|ひだり} へ {導|みちび}く 。', ok: true },
          { jp: '{岩|いわ} の {近|ちか}く で {待|ま}つ 。', ok: false, why: no('かねない: near the rock is exactly where the line could break.') },
          { jp: '{岩|いわ} に {糸|いと} を {掛|か}けて 、 {魚|さかな} を {止|と}める 。', ok: false, why: no('Rubbing on the rock is what the note warns against.') },
        ], explain: { jp: '〜 かねない ＝ could well …', en: 'A risk named, and the way round it.' } }),
    } });

  S({ id: 'R03', site: 'fish.sazanami.rocks', intent: 'slack', title: { jp: '{海藻|かいそう} に {引|ひ}っかかった {糸|いと}', en: 'Caught in the weed' },
    scene: { en: 'The line has caught in a clump of seaweed by the rocks. It is holding, not moving.' },
    rule: { jp: '{糸|いと} が {海藻|かいそう} に {引|ひ}っかかったら 、 {引|ひ}っ{張|ぱ}らない で 、 {糸|いと} を {緩|ゆる}める 。', en: 'If the line catches in the weed, don\'t pull: give it slack.' },
    misread: { en: 'A snag is not a bite: pulling only makes it worse.' },
    stage: { snag: 'weed' },
    tasks: {
      F: CH({ item: 'v:緩める', reading: 'ゆるめる', meaning: { en: 'slacken (the line)' },
        teach: { title: 'ゆるめる — to slacken', jp: 'いと を ゆるめる', en: 'ゆるめる (yurumeru): to loosen, to slacken. The note: caught in the weed? Don\'t pull — slacken.' },
        prompt: { en: 'The line is caught in the weed. Which does the note ask for?' },
        options: [
          { jp: 'ゆるめる', ok: true },
          { jp: 'ひっぱる', ok: false, why: no('The note says: don\'t pull (ひっぱらない で).') },
        ], explain: { jp: 'ひっぱらない で 、 ゆるめる', en: 'Give it slack instead of pulling.' } }),
      E: W({ item: 'v:緩める', answer: 'ゆるめる', accept: SLACK, reading: 'ゆるめる', meaning: { en: 'slacken' },
        prompt: { en: 'The line is caught in the seaweed. Write the verb the note asks for: to slacken the line.' },
        template: { before: '{糸|いと} を ', after: '' },
        others: [O.pull, O.lift], explain: { jp: '{緩|ゆる}める ＝ to slacken', en: 'Slack lets the weed let go.' } }),
      I: CH({ item: 'g:v_nai', reading: 'ひっぱらないで ゆるめる', meaning: { en: 'without pulling, slacken it and wait' },
        note: { jp: 'メモ ： 「{海藻|かいそう} に {引|ひ}っかかったら 、 {引|ひ}っ{張|ぱ}らない で 、 {糸|いと} を {緩|ゆる}める 。 {少|すこ}し {待|ま}つ と 、 {波|なみ} が {外|はず}して くれる 。」', en: 'Note: "If it catches in the weed, don\'t pull: slacken the line. Wait a little and the waves free it for you."' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: '{引|ひ}っ{張|ぱ}らない で 、 {糸|いと} を {緩|ゆる}めて {待|ま}つ 。', ok: true },
          { jp: '{強|つよ}く {引|ひ}っ{張|ぱ}って 、 {外|はず}す 。', ok: false, why: no('引っ張らないで: without pulling.') },
          { jp: '{糸|いと} を {切|き}る 。', ok: false, why: no('The note says the waves will free it: nothing is cut.') },
        ], explain: { jp: '〜 ない で ＝ without …', en: 'Not pulling, slackening, waiting: the waves do the rest.' } }),
      A: CH({ item: 'g:adv_dokoroka', reading: 'ゆるめて なみ に まかせる', meaning: { en: 'slacken it and leave it to the waves' },
        note: { jp: 'メモ ： 「{海藻|かいそう} に {掛|か}かった {糸|いと} を {引|ひ}っ{張|ぱ}る と 、 {外|はず}れる どころ か 、 もっと {絡|から}む 。 {緩|ゆる}めて 、 {波|なみ} に {任|まか}せる こと 。」', en: 'Note: "Pull a line caught in the weed and, far from coming free, it tangles more. Slacken it and leave it to the waves."' },
        prompt: { en: 'What does the note ask?' },
        options: [
          { jp: '{緩|ゆる}めて 、 {波|なみ} が {外|はず}す の を {待|ま}つ 。', ok: true },
          { jp: '{引|ひ}っ{張|ぱ}れば 、 {外|はず}れる 。', ok: false, why: no('どころか: far from coming free, it tangles more.') },
          { jp: '{竿|さお} を {置|お}いて 、 {帰|かえ}る 。', ok: false, why: no('The note gives a way: slacken and let the waves work.') },
        ], explain: { jp: '〜 どころ か ＝ far from …', en: 'Pulling gives the opposite of what you want.' } }),
    } });

  S({ id: 'R04', site: 'fish.sazanami.rocks', intent: 'tray', title: { jp: '{日|ひ} に {焼|や}けた {岩|いわ}', en: 'Sun-hot rock' },
    scene: { en: 'The rock beside you is hot from the sun. On your left there is a tub of seawater.' },
    rule: { jp: '{見|み}る {魚|さかな} は 、 {水|みず} の {入|はい}った {桶|おけ} へ 。 {熱|あつ}い {岩|いわ} の {上|うえ} に は {置|お}かない 。', en: 'A fish to be observed goes into the tub of water — never on the hot rock.' },
    misread: { en: 'The rock is close, but the tub is the place.' },
    stage: { tub: 'left', dry: 'right' },
    tasks: {
      F: W({ item: 'v:桶', answer: 'おけ', accept: TUB, reading: 'おけ', meaning: { en: 'the tub' },
        teach: { title: 'おけ — a tub', jp: 'おけ', en: 'おけ (oke): a wooden tub. The note: the fish goes into the tub of water, not on the hot rock.' },
        prompt: { en: 'Where does the fish go? Write “tub”.' },
        others: [O.lift], explain: { jp: 'みず の はいった おけ へ', en: 'Into the water, not onto the rock.' } }),
      E: W({ item: 'v:桶', answer: 'おけ', accept: TUB, reading: 'おけ', meaning: { en: 'the tub' },
        prompt: { en: 'The rock is hot; there is a tub of seawater on your left. Where does the note say the fish goes? Write one word in Japanese.' },
        others: [O.lift], explain: { jp: '{桶|おけ} ＝ a tub', en: 'The tub keeps the fish in water while you look.' } }),
      I: CH({ item: 'g:prt_ni', reading: 'おけ に いれる', meaning: { en: 'put it in the tub' },
        note: { jp: 'メモ ： 「{観察|かんさつ} する {魚|さかな} は 、 {水|みず} の {入|はい}った {桶|おけ} に {入|い}れる 。 {日|ひ} に {焼|や}けた {岩|いわ} の {上|うえ} に は 、 {置|お}かない 。」', en: 'Note: "Put a fish you are observing into the tub of water. Never put it on the sun-hot rock."' },
        prompt: { en: 'Where do you put the fish?' },
        options: [
          { jp: '{水|みず} の {入|はい}った {桶|おけ} に {入|い}れる 。', ok: true },
          { jp: '{岩|いわ} の {上|うえ} に {置|お}く 。', ok: false, why: no('置かない: never on the rock.') },
          { jp: '{手|て} で {持|も}った まま {見|み}る 。', ok: false, why: no('The note names a place for it: the tub.') },
        ], explain: { jp: '〜 に {入|い}れる ＝ put into …', en: 'に marks where it goes: the tub.' } }),
      A: CH({ item: 'g:adv_wake_ni_wa_ikanai', reading: 'おけ の みず に いれて みる', meaning: { en: 'look at it in the tub\'s water' },
        note: { jp: 'メモ ： 「{岩|いわ} は {日|ひ} に {焼|や}けて {熱|あつ}い 。 {見|み}る ため と は いえ 、 {魚|さかな} を その {上|うえ} に {置|お}く わけ に は いかない 。 {桶|おけ} の {水|みず} に {入|い}れる こと 。」', en: 'Note: "The rock is hot from the sun. Even to look at it, you can\'t put a fish on it. Put it in the tub\'s water."' },
        prompt: { en: 'What does the note ask?' },
        options: [
          { jp: '{桶|おけ} の {水|みず} に {入|い}れて {見|み}る 。', ok: true },
          { jp: '{岩|いわ} の {上|うえ} で 、 {手早|てばや}く {見|み}る 。', ok: false, why: no('わけにはいかない: you cannot put it on the rock, however quickly.') },
          { jp: '{海|うみ} に {戻|もど}して から 、 {見|み}る 。', ok: false, why: no('You look first, in the tub; then it goes back.') },
        ], explain: { jp: '〜 わけ に は いかない ＝ cannot (as things are)', en: 'Not a rule for its own sake: the rock is hot.' } }),
    } });

  S({ id: 'R05', site: 'fish.sazanami.rocks', intent: 'lift', title: { jp: '{戻|もど}って こない {浮|う}き', en: 'The float stays down' },
    scene: { en: 'The float went under with the last wave and has not come back up.' },
    rule: { jp: '{浮|う}き が {沈|しず}んで 、 {上|あ}がって こなく なったら 、 そっと {上|あ}げる 。', en: 'When the float goes under and stops coming back up, lift gently.' },
    misread: { en: 'A wave lets the float straight back up; this one stays down.' },
    stage: { float: 'under' },
    tasks: {
      F: W({ item: 'v:上げる', answer: 'あげる', accept: LIFT, reading: 'あげる', meaning: { en: 'lift' },
        teach: { title: 'あげる — to lift', jp: 'あげる', en: 'あげる (ageru): to lift. The note: when the float stays down, lift gently.' },
        prompt: { en: 'The float has gone under and stays down. Write “lift”.' },
        others: [O.wait, O.pull], explain: { jp: 'しずんだ まま なら 、 あげる', en: 'It stays down: lift.' } }),
      E: W({ item: 'v:上げる', answer: 'あげる', accept: LIFT, reading: 'あげる', meaning: { en: 'lift' },
        prompt: { en: 'The float went under and has not come back up. What does the note tell you to do now? Write one verb in Japanese.' },
        others: [O.wait, O.pull], explain: { jp: '{上|あ}げる ＝ to lift', en: 'The condition is met: lift gently.' } }),
      I: CH({ item: 'g:cond_tara', reading: 'そっと あげる', meaning: { en: 'lift gently now' },
        note: { jp: 'メモ ： 「{浮|う}き が {沈|しず}んで 、 {上|あ}がって こなく なったら 、 {上|あ}げる 。」 ／ いま 、 {浮|う}き は {沈|しず}んだ まま {上|あ}がって こない 。', en: 'Note: "When the float goes under and stops coming back up, lift." / Now the float is under and not coming back up.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: 'そっと {上|あ}げる 。', ok: true },
          { jp: 'まだ {待|ま}つ 。', ok: false, why: no('たら: once it stops coming back up — and it has.') },
          { jp: '{糸|いと} を {緩|ゆる}める 。', ok: false, why: no('Nothing is caught: the note\'s moment for lifting has come.') },
        ], explain: { jp: '〜 たら ＝ once …', en: 'The “once” has happened.' } }),
      A: CH({ item: 'g:hazu', reading: 'さかな だ 、 あげる', meaning: { en: 'it should have come up if it were the waves: it is a fish, so lift' },
        note: { jp: 'メモ ： 「{波|なみ} に {揺|ゆ}られた だけ なら 、 {浮|う}き は すぐ {上|あ}がって くる はず だ 。 {上|あ}がって こない なら 、 {魚|さかな} だ 。」', en: 'Note: "If it were only the waves, the float should come straight back up. If it doesn\'t, it\'s a fish."' },
        prompt: { en: 'The float has stayed down. What follows?' },
        options: [
          { jp: '{上|あ}がって こない ので 、 {魚|さかな} だ 。 そっと {上|あ}げる 。', ok: true },
          { jp: '{波|なみ} の せい なので 、 {待|ま}つ 。', ok: false, why: no('はず: if it were the waves, it should have come straight back up.') },
          { jp: '{浮|う}き が {壊|こわ}れた ので 、 {取|と}り{替|か}える 。', ok: false, why: no('The note reads a float that stays down as a fish.') },
        ], explain: { jp: '〜 はず ＝ should (be expected)', en: 'What should happen didn\'t: so it is a fish.' } }),
    } });

  S({ id: 'R06', site: 'fish.sazanami.rocks', intent: 'right', title: { jp: '{左|ひだり} に {子|こ}ども たち の {糸|いと}', en: 'The children\'s line on the left' },
    scene: { en: 'Mina and Riku are fishing from the rocks on your left; their line is in the water beside yours. The right is clear.' },
    rule: { jp: '{隣|となり} の {子|こ}ども たち の {糸|いと} と {絡|から}ませない 。 {右|みぎ} へ {寄|よ}せる 。', en: 'Don\'t tangle with the children\'s line beside you. Bring it to the right.' },
    misread: { en: 'Read where the other line is; the open side is the other way.' },
    stage: { neighbour: 'left' },
    tasks: {
      F: W({ item: 'v:右', answer: 'みぎ', accept: RIGHT, reading: 'みぎ', meaning: { en: 'right' },
        teach: { title: 'みぎ — right', jp: 'みぎ', en: 'みぎ (migi): right.' },
        prompt: { en: 'The children\'s line is on the left; the right is clear. Write “right”.' },
        others: [O.left, O.wait], explain: { jp: 'こども たち の いと の ない みぎ へ', en: 'Away from the children\'s line.' } }),
      E: W({ item: 'v:右', answer: 'みぎ', accept: RIGHT, reading: 'みぎ', meaning: { en: 'right' },
        prompt: { en: 'Mina and Riku\'s line is in the water on your left. Which way do you bring your fish? Write the direction in Japanese.' },
        others: [O.left, O.wait, O.pull], explain: { jp: '{右|みぎ} ＝ right', en: 'The clear water is on the right.' } }),
      I: CH({ item: 'g:v_nai', reading: 'からまない ように みぎ へ', meaning: { en: 'to the right, so as not to tangle' },
        note: { jp: 'メモ ： 「{子|こ}ども たち の {糸|いと} と {絡|から}まない よう に 、 {右|みぎ} へ {寄|よ}せる 。」 ／ {子|こ}ども たち は {左|ひだり} で {釣|つ}って いる 。', en: 'Note: "Bring it to the right so it doesn\'t tangle with the children\'s line." / The children are fishing on the left.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: '{右|みぎ} へ {寄|よ}せる 。', ok: true },
          { jp: '{左|ひだり} へ {寄|よ}せる 。', ok: false, why: no('絡まないように: the children\'s line is on the left.') },
          { jp: '{子|こ}ども たち に {糸|いと} を {上|あ}げて もらう 。', ok: false, why: no('The note asks you to move, not them.') },
        ], explain: { jp: '〜 ない よう に ＝ so as not to …', en: 'The negative tells you what to avoid.' } }),
      A: CH({ item: 'g:comp_yori_hou', reading: 'じぶん が みぎ へ よる', meaning: { en: 'move to the right yourself' },
        note: { jp: 'メモ ： 「{隣|となり} の {子|こ}ども たち に {場所|ばしょ} を {空|あ}けて もらう より 、 {自分|じぶん} が {右|みぎ} へ {寄|よ}る ほう が {早|はや}い 。」', en: 'Note: "Rather than ask the children next to you to make room, it\'s quicker to move to the right yourself."' },
        prompt: { en: 'What does the note suggest?' },
        options: [
          { jp: '{自分|じぶん} が {右|みぎ} へ {寄|よ}る 。', ok: true },
          { jp: '{子|こ}ども たち に {頼|たの}んで 、 {場所|ばしょ} を {空|あ}けて もらう 。', ok: false, why: no('より…ほうが早い: moving yourself is quicker than asking them.') },
          { jp: '{子|こ}ども たち の {糸|いと} に {合|あ}わせて 、 {左|ひだり} へ {寄|よ}る 。', ok: false, why: no('Left is where their line is.') },
        ], explain: { jp: 'A より B の ほう が 〜', en: 'A comparison: moving yourself beats asking.' } }),
    } });

  // ===================================================================================================
  // The boat, off the One-Pine Islet (fish.boat)
  // ===================================================================================================
  S({ id: 'B01', site: 'fish.boat', intent: 'wait', title: { jp: '{海鳥|うみどり} の {波紋|はもん}', en: 'A seabird\'s ripple' },
    scene: { en: 'A seabird has just dived near your float. Rings spread across the water; the float itself has not gone under.' },
    rule: { jp: '{鳥|とり} が {水|みず} を {打|う}った {波紋|はもん} は 、 {合図|あいず} で は ない 。 {浮|う}き が {沈|しず}む の を {待|ま}つ 。', en: 'The ripple from a bird hitting the water is not the signal. Wait for the float to go under.' },
    misread: { en: 'Something moved the water, but not your float.' },
    stage: { ripple: true },
    tasks: {
      F: CH({ item: 'v:待つ', reading: 'まつ', meaning: { en: 'wait' },
        teach: { title: 'まつ / あげる — wait / lift', jp: 'まつ ・ あげる', en: 'まつ (matsu): to wait. あげる (ageru): to lift. The note: the bird\'s ripple is not the signal.' },
        prompt: { en: 'A bird made the ripple; the float has not gone under. Which do you do?' },
        options: [
          { jp: 'まつ', ok: true },
          { jp: 'あげる', ok: false, why: no('The ripple is the bird\'s: the float has not gone under.') },
        ], explain: { jp: 'うき が しずむ まで 、 まつ', en: 'The bird, not a fish.' } }),
      E: W({ item: 'v:待つ', answer: 'まつ', accept: WAIT, reading: 'まつ', meaning: { en: 'wait' },
        prompt: { en: 'A seabird\'s dive made rings on the water, but the float is still up. What does the note tell you to do? Write one verb in Japanese.' },
        others: [O.lift, O.pull], explain: { jp: '{待|ま}つ ＝ to wait', en: 'The signal is the float going under.' } }),
      I: CH({ item: 'g:temo', reading: 'まだ まつ', meaning: { en: 'keep waiting' },
        note: { jp: 'メモ ： 「{波紋|はもん} が {見|み}えて も 、 {浮|う}き が {沈|しず}まなければ 、 {待|ま}つ 。」 ／ いま 、 {鳥|とり} の {波紋|はもん} が {広|ひろ}がって いる 。 {浮|う}き は {沈|しず}んで いない 。', en: 'Note: "Even if you see a ripple, wait while the float has not sunk." / A bird\'s ripple is spreading now. The float has not sunk.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: 'まだ {待|ま}つ 。', ok: true },
          { jp: '{波紋|はもん} の {所|ところ} へ 、 {投|な}げ{直|なお}す 。', ok: false, why: no('The ripple is the bird\'s: nothing in the note moves the line.') },
          { jp: 'すぐ {上|あ}げる 。', ok: false, why: no('ても: even with a ripple, you wait while the float is up.') },
        ], explain: { jp: '〜 て も ＝ even if …', en: 'A ripple doesn\'t change the rule.' } }),
      A: CH({ item: 'g:rashii', reading: 'うき が しずむ まで まつ', meaning: { en: 'the ripple is the bird\'s: wait for the float' },
        note: { jp: 'メモ ： 「{海鳥|うみどり} が {小魚|こざかな} を {追|お}って いる らしい 。 {波紋|はもん} は {鳥|とり} の もの で 、 {浮|う}き の {合図|あいず} で は ない 。」', en: 'Note: "The seabirds seem to be chasing small fish. The ripples are theirs, not your float\'s signal."' },
        prompt: { en: 'What follows from the note?' },
        options: [
          { jp: '{浮|う}き が {沈|しず}む まで 、 {待|ま}つ 。', ok: true },
          { jp: '{鳥|とり} の {下|した} に {魚|さかな} が いる ので 、 すぐ {上|あ}げる 。', ok: false, why: no('The ripples are the birds\' (鳥のもの), not a bite on your line.') },
          { jp: '{鳥|とり} を {追|お}い{払|はら}う 。', ok: false, why: no('The note only tells you whose ripples they are.') },
        ], explain: { jp: '〜 らしい ＝ it seems …', en: 'An inference about the birds; the rule about the float stands.' } }),
    } });

  S({ id: 'B02', site: 'fish.boat', intent: 'lift', title: { jp: 'ぴん と {張|は}った {糸|いと}', en: 'The line pulls tight' },
    scene: { en: 'The line runs straight and tight from the rod tip, down beside the boat.' },
    rule: { jp: '{糸|いと} が ぴん と {張|は}ったら 、 そっと {上|あ}げる 。', en: 'Once the line pulls tight, lift gently.' },
    misread: { en: 'Read the state of the line against the note.' },
    stage: { taut: true },
    tasks: {
      F: W({ item: 'v:上げる', answer: 'あげる', accept: LIFT, reading: 'あげる', meaning: { en: 'lift' },
        teach: { title: 'あげる — to lift', jp: 'あげる', en: 'あげる (ageru): to lift. The note: once the line pulls tight, lift gently.' },
        prompt: { en: 'The line has pulled tight. Write “lift”.' },
        others: [O.wait, O.pull], explain: { jp: 'ぴん と はったら 、 あげる', en: 'Tight line: lift.' } }),
      E: W({ item: 'v:上げる', answer: 'あげる', accept: LIFT, reading: 'あげる', meaning: { en: 'lift' },
        prompt: { en: 'The line runs straight and tight beside the boat. What does the note tell you to do now? Write one verb in Japanese.' },
        others: [O.wait, O.pull], explain: { jp: '{上|あ}げる ＝ to lift', en: 'The line is tight: it is time.' } }),
      I: CH({ item: 'g:toki', reading: 'そっと あげる', meaning: { en: 'lift gently now' },
        note: { jp: 'メモ ： 「{糸|いと} が ぴん と {張|は}った とき が 、 {上|あ}げる とき だ 。」 ／ いま 、 {糸|いと} は ぴん と {張|は}って いる 。', en: 'Note: "When the line pulls tight, that is when to lift." / The line is tight now.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: 'そっと {上|あ}げる 。', ok: true },
          { jp: 'まだ {待|ま}つ 。', ok: false, why: no('とき: the moment the note names is now.') },
          { jp: '{糸|いと} を {緩|ゆる}める 。', ok: false, why: no('Slackening undoes the tight line the note waits for.') },
        ], explain: { jp: '〜 とき ＝ when …', en: 'The “when” has come.' } }),
      A: CH({ item: 'g:shidai', reading: 'はった いま 、 すぐ あげる', meaning: { en: 'it is tight now: lift at once' },
        note: { jp: 'メモ ： 「{糸|いと} が {張|は}り {次第|しだい} 、 {上|あ}げる こと 。 {遅|おく}れる と 、 {魚|さかな} は {逃|に}げて しまう 。」', en: 'Note: "Lift as soon as the line pulls tight. Be late and the fish gets away."' },
        prompt: { en: 'The line has just pulled tight. What does the note ask?' },
        options: [
          { jp: '{張|は}った {今|いま} 、 すぐ {上|あ}げる 。', ok: true },
          { jp: '{張|は}って から 、 しばらく {待|ま}つ 。', ok: false, why: no('次第: as soon as. Waiting lets it get away.') },
          { jp: '{張|は}らない うち に 、 {上|あ}げる 。', ok: false, why: no('The note waits for the line to pull tight first.') },
        ], explain: { jp: '〜 {次第|しだい} ＝ as soon as …', en: 'No gap between the signal and the lift.' } }),
    } });

  S({ id: 'B03', site: 'fish.boat', intent: 'recover', title: { jp: '{流|なが}される {船|ふね}', en: 'The boat drifts' },
    scene: { en: 'The tide has carried the boat toward your line, and the line hangs slack in a loose curve.' },
    rule: { jp: '{船|ふね} が {流|なが}されて {糸|いと} が たるんだら 、 たるみ を {巻|ま}いて {取|と}る 。', en: 'If the boat drifts and the line goes slack, wind in the slack.' },
    misread: { en: 'The slack is the boat\'s drift, not the fish leaving.' },
    stage: { slack: true },
    tasks: {
      F: W({ item: 'v:巻く', answer: 'まく', accept: WIND, reading: 'まく', meaning: { en: 'wind (the line) in' },
        teach: { title: 'まく — to wind', jp: 'いと を まく', en: 'まく (maku): to wind, to reel in. The note: the boat drifted and the line went slack; wind it in.' },
        prompt: { en: 'The boat drifted and the line is slack. Wind it in. Write “wind”.' },
        template: { before: 'いと を ', after: '' },
        others: [O.pull, O.lift], explain: { jp: 'たるんだら 、 まく', en: 'Take up the slack the drift made.' } }),
      E: W({ item: 'v:巻く', answer: 'まく', accept: WIND, reading: 'まく', meaning: { en: 'wind in' },
        prompt: { en: 'The tide carried the boat toward the line and it went slack. Complete the note: wind in the line.' },
        template: { before: '{糸|いと} を ', after: '' },
        others: [O.pull, O.lift], explain: { jp: '{巻|ま}く ＝ to wind', en: 'Winding takes up the slack.' } }),
      I: CH({ item: 'g:te_shimau', reading: 'たるみ を まく', meaning: { en: 'wind in the slack' },
        note: { jp: 'メモ ： 「{船|ふね} が {流|なが}されると 、 {糸|いと} が たるんで しまう 。 たるんだら 、 {巻|ま}く 。」 ／ いま 、 {糸|いと} が たるんで いる 。', en: 'Note: "When the boat drifts, the line ends up slack. If it goes slack, wind in." / The line is slack now.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: 'たるみ を {巻|ま}く 。', ok: true },
          { jp: '{船|ふね} が {止|と}まる まで 、 {何|なに} も しない 。', ok: false, why: no('The note asks you to wind in the slack now.') },
          { jp: '{糸|いと} を {強|つよ}く {引|ひ}く 。', ok: false, why: no('The slack wants winding in, not a hard pull.') },
        ], explain: { jp: '〜 て しまう ＝ ends up …', en: 'The drift does it; you put it right.' } }),
      A: CH({ item: 'g:passive', reading: 'たるみ を とりながら おもさ を かんじる', meaning: { en: 'take up the slack while feeling for the weight' },
        note: { jp: 'メモ ： 「{潮|しお} に {船|ふね} が {流|なが}されれば 、 {糸|いと} は たるむ 。 {魚|さかな} が {逃|に}げた と は {限|かぎ}らない 。 たるみ を {取|と}りながら 、 {重|おも}さ を {感|かん}じる こと 。」', en: 'Note: "If the tide carries the boat, the line goes slack. It doesn\'t mean the fish has gone. Take up the slack while you feel for its weight."' },
        prompt: { en: 'What does the note ask?' },
        options: [
          { jp: 'たるみ を {取|と}りながら 、 {重|おも}さ を {感|かん}じる 。', ok: true },
          { jp: '{魚|さかな} が {逃|に}げた ので 、 {竿|さお} を {上|あ}げる 。', ok: false, why: no('とは限らない: slack doesn\'t mean it has gone; the boat was carried (流された).') },
          { jp: '{潮|しお} が {止|と}まる の を 、 {待|ま}つ 。', ok: false, why: no('The note asks you to take up the slack now.') },
        ], explain: { jp: '{流|なが}される ＝ to be carried (by the tide)', en: 'The boat was moved; the fish may still be there.' } }),
    } });

  S({ id: 'B04', site: 'fish.boat', intent: 'patch', title: { jp: '{二|ふた}つ の {浮標|ふひょう}', en: 'Two buoys' },
    scene: { en: 'Two buoys float off the islet, both painted the same red. Each carries a small tag.' },
    rule: { jp: 'この {記録|きろく} は 、 {深|ふか}い ほう で とる 。', en: 'Take this record on the deep side.' },
    misread: { en: 'The tag\'s meaning, not the colour, picks the place.' },
    stage: { markers: true },
    tasks: {
      F: CH({ item: 'v:深い', reading: 'ふかい', meaning: { en: 'deep' }, labels: { a: 'ふかい', b: 'あさい' },
        teach: { title: 'ふかい / あさい — deep / shallow', jp: 'ふかい ・ あさい', en: 'ふかい (fukai): deep. あさい (asai): shallow. Both buoys are red: read the tags.' },
        prompt: { en: 'The note asks for the deep side. Both buoys are red. Which tag marks the place?' },
        options: [
          { jp: 'ふかい', ok: true },
          { jp: 'あさい', ok: false, why: no('あさい means shallow.') },
        ], explain: { jp: 'ふかい ＝ deep', en: 'The tag, not the colour, tells you.' } }),
      E: CH({ item: 'v:深い', reading: 'ふかい ほう', meaning: { en: 'the deep side' }, labels: { a: '{深|ふか}い', b: '{浅|あさ}い' },
        prompt: { en: 'The note asks for the deep side. Both buoys are the same red. Which do you cast to?' },
        options: [
          { jp: '「{深|ふか}い」 の {浮標|ふひょう}', ok: true },
          { jp: '「{浅|あさ}い」 の {浮標|ふひょう}', ok: false, why: no('浅い: shallow.') },
          { jp: '{赤|あか}い {浮標|ふひょう}', ok: false, why: no('Both are red: colour can\'t tell them apart.') },
        ], explain: { jp: '{深|ふか}い ＝ deep', en: 'Same colour, different tags: read the tag.' } }),
      I: CH({ item: 'g:conj_node', reading: 'ふかい ほう の ふひょう', meaning: { en: 'the buoy tagged “deep”' }, labels: { a: '{深|ふか}い', b: '{浅|あさ}い' },
        note: { jp: 'メモ ： 「{浅|あさ}い {所|ところ} は {岩|いわ} が {多|おお}い ので 、 {深|ふか}い ほう の {浮標|ふひょう} を {使|つか}う 。」', en: 'Note: "The shallows are full of rocks, so use the buoy on the deep side."' },
        prompt: { en: 'Both buoys are red. Which do you use?' },
        options: [
          { jp: '「{深|ふか}い」 の {浮標|ふひょう}', ok: true },
          { jp: '「{浅|あさ}い」 の {浮標|ふひょう}', ok: false, why: no('ので: the shallows are rocky — that is the reason to avoid them.') },
          { jp: 'どちら でも いい 。', ok: false, why: no('The note gives a reason to choose one.') },
        ], explain: { jp: '〜 ので ＝ because …', en: 'The reason points to the deep buoy.' } }),
      A: CH({ item: 'g:comp_yori_hou', reading: 'おき の ふひょう', meaning: { en: 'the buoy tagged “offshore”: deeper than near the shore' }, labels: { a: '{沖|おき}', b: '{岸寄|きしよ}り' },
        note: { jp: 'メモ ： 「{沖|おき} の ほう が 、 {岸寄|きしよ}り より {深|ふか}い 。 {深|ふか}い ほう で {記録|きろく} を とる こと 。」', en: 'Note: "Offshore is deeper than near the shore. Take the record on the deep side."' },
        prompt: { en: 'The two red buoys are tagged 沖 and 岸寄り. Which do you use?' },
        options: [
          { jp: '「{沖|おき}」 の {浮標|ふひょう}', ok: true },
          { jp: '「{岸寄|きしよ}り」 の {浮標|ふひょう}', ok: false, why: no('より: offshore is deeper THAN near the shore.') },
          { jp: '{同|おな}じ {色|いろ} なので 、 どちら でも {同|おな}じ 。', ok: false, why: no('The colour is the same; what the tags mean is not.') },
        ], explain: { jp: 'A の ほう が B より 〜', en: 'A comparison: offshore is the deeper side.' } }),
    } });

  S({ id: 'B05', site: 'fish.boat', intent: 'close', title: { jp: '{二度|にど} {引|ひ}いて 、 {重|おも}い まま', en: 'Two tugs, then a steady weight' },
    scene: { en: 'The line tugged twice; now there is a steady weight on it.' },
    rule: { jp: '{二度|にど} {引|ひ}いて 、 {重|おも}さ が {続|つづ}いたら 、 ゆっくり {寄|よ}せる 。', en: 'After two tugs, if the weight stays, bring it in slowly.' },
    misread: { en: 'Two tugs and a steady weight is the moment to bring it near.' },
    stage: { dips: 2 },
    tasks: {
      F: W({ item: 'v:寄せる', answer: 'よせる', accept: CLOSER, reading: 'よせる', meaning: { en: 'bring (it) closer' },
        teach: { title: 'よせる — to bring closer', jp: 'よせる', en: 'よせる (yoseru): to bring something closer. The note: two tugs, a steady weight — bring it in slowly.' },
        prompt: { en: 'Two tugs, and the weight stays. Write “bring closer”.' },
        others: [O.wait, O.lift], explain: { jp: 'ゆっくり よせる', en: 'Bring it near, slowly.' } }),
      E: W({ item: 'v:寄せる', answer: 'よせる', accept: CLOSER, reading: 'よせる', meaning: { en: 'bring closer' },
        prompt: { en: 'The line tugged twice and the weight stays on it. What does the note tell you to do? Write one verb in Japanese.' },
        others: [O.wait, O.lift], explain: { jp: '{寄|よ}せる ＝ to bring closer', en: 'The weight stays: bring it in.' } }),
      I: CH({ item: 'g:cond_tara', reading: 'ゆっくり よせる', meaning: { en: 'bring it in slowly' },
        note: { jp: 'メモ ： 「{二度|にど} {引|ひ}いて 、 {重|おも}さ が {続|つづ}いたら 、 ゆっくり {寄|よ}せる 。」 ／ いま 、 {二度|にど} {引|ひ}いて 、 {重|おも}い まま だ 。', en: 'Note: "After two tugs, if the weight stays, bring it in slowly." / It has tugged twice and is still heavy.' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: 'ゆっくり {寄|よ}せる 。', ok: true },
          { jp: '{一気|いっき} に {上|あ}げる 。', ok: false, why: no('The note says slowly, and to bring it near first.') },
          { jp: 'まだ {待|ま}つ 。', ok: false, why: no('たら: two tugs and the weight stays — the condition is met.') },
        ], explain: { jp: '〜 たら ＝ once …', en: 'Both parts of the condition have happened.' } }),
      A: CH({ item: 'g:uchi_ni', reading: 'おもい うち に よせる', meaning: { en: 'bring it in while the weight is still there' },
        note: { jp: 'メモ ： 「{重|おも}さ が {続|つづ}いて いる うち に 、 ゆっくり {寄|よ}せる こと 。 {軽|かる}く なって から で は {遅|おそ}い 。」', en: 'Note: "Bring it in slowly while the weight is still there. Once it goes light, it\'s too late."' },
        prompt: { en: 'What does the note ask?' },
        options: [
          { jp: '{重|おも}い うち に 、 ゆっくり {寄|よ}せる 。', ok: true },
          { jp: '{軽|かる}く なる まで {待|ま}って から 、 {寄|よ}せる 。', ok: false, why: no('うちに: while it is still heavy. Light is too late.') },
          { jp: '{重|おも}い ので 、 {糸|いと} を {切|き}る 。', ok: false, why: no('The weight is the fish: the note says bring it in.') },
        ], explain: { jp: '〜 うち に ＝ while (it is still) …', en: 'Act before the moment passes.' } }),
    } });

  S({ id: 'B06', site: 'fish.boat', intent: 'slow', title: { jp: '{船|ふな}べり の すぐ {下|した}', en: 'Alongside the hull' },
    scene: { en: 'The fish is right alongside the boat now, just below the gunwale.' },
    rule: { jp: '{船|ふな}べり まで {来|き}たら 、 {急|いそ}が ない 。 ゆっくり {寄|よ}せる 。', en: 'Once it reaches the side of the boat, don\'t hurry. Ease it closer slowly.' },
    misread: { en: 'Close is not the moment to rush.' },
    stage: { near: true },
    tasks: {
      F: CH({ item: 'v:ゆっくり', reading: 'ゆっくり', meaning: { en: 'slowly' },
        teach: { title: 'ゆっくり / はやく — slowly / quickly', jp: 'ゆっくり ・ はやく', en: 'ゆっくり (yukkuri): slowly. はやく (hayaku): quickly. The note: alongside the boat, don\'t hurry.' },
        prompt: { en: 'The fish is right alongside the boat. How do you bring it in?' },
        options: [
          { jp: 'ゆっくり', ok: true },
          { jp: 'はやく', ok: false, why: no('The note says don\'t hurry (いそがない).') },
        ], explain: { jp: 'いそがない 。 ゆっくり', en: 'Slowly, now it is close.' } }),
      E: W({ item: 'v:ゆっくり', answer: 'ゆっくり', accept: SLOW, reading: 'ゆっくり', meaning: { en: 'slowly' },
        prompt: { en: 'The fish is alongside the hull. How does the note say to bring it closer? Write one word in Japanese.' },
        template: { before: '', after: ' {寄|よ}せる' },
        others: [O.lift, O.wait], explain: { jp: 'ゆっくり ＝ slowly', en: 'Close in: slowly.' } }),
      I: CH({ item: 'g:te_shimau', reading: 'ふなべり に あてない ように ゆっくり', meaning: { en: 'slowly, so it doesn\'t knock against the boat' },
        note: { jp: 'メモ ： 「{船|ふな}べり に {当|あ}たる と 、 {魚|さかな} が {傷|きず}ついて しまう 。 ゆっくり {寄|よ}せる 。」', en: 'Note: "If it knocks against the side of the boat, the fish gets hurt. Bring it in slowly."' },
        prompt: { en: 'What do you do?' },
        options: [
          { jp: '{船|ふな}べり に {当|あ}てない よう に 、 ゆっくり {寄|よ}せる 。', ok: true },
          { jp: '{急|いそ}いで {船|ふね} に {引|ひ}き{上|あ}げる 。', ok: false, why: no('傷ついてしまう: hurrying knocks it against the boat.') },
          { jp: '{船|ふな}べり に {当|あ}てて 、 {止|と}める 。', ok: false, why: no('Knocking it against the side is what hurts it.') },
        ], explain: { jp: '〜 て しまう ＝ ends up (regrettably) …', en: 'The unwanted result tells you why to go slowly.' } }),
      A: CH({ item: 'g:adv_ni_koshita', reading: 'ゆっくり よせる の が いちばん', meaning: { en: 'nothing beats bringing it in slowly' },
        note: { jp: 'メモ ： 「{船|ふな}べり の {近|ちか}く で は 、 ゆっくり {寄|よ}せる に {越|こ}した こと は ない 。」', en: 'Note: "Near the side of the boat, there is nothing better than bringing it in slowly."' },
        prompt: { en: 'What does the note mean?' },
        options: [
          { jp: 'ゆっくり {寄|よ}せる の が 、 {一番|いちばん} いい 。', ok: true },
          { jp: 'ゆっくり {寄|よ}せる {必要|ひつよう} は ない 。', ok: false, why: no('に越したことはない: nothing beats it — it is the best way.') },
          { jp: '{船|ふな}べり に {当|あ}てる ほう が {早|はや}い 。', ok: false, why: no('The note values slowly over quickly here.') },
        ], explain: { jp: '〜 に {越|こ}した こと は ない ＝ nothing beats …', en: 'A strong recommendation.' } }),
    } });

  // (the stations' props, the islet's map and its port are placed in src/content/zz_coast.js, after the maps load)

  // the reading at the stone (four levels): the oldest carving
  const e = (en, ok, why) => Object.assign({ en, ok: !!ok }, why ? { why: { en: why } } : {});
  C.challenges['sea.islet_stone'] = { title: T('The names on the stone', '{石|いし} の {名前|なまえ}'), tiers: {
    F: [CH({ item: 'v:来る', ctx: { jp: 'ちどりまる 、 なつ 、 ここ に きた 。', en: '' }, prompt: T('What does the carving say?'),
      options: [e('The Chidori-maru came here one summer.', 1), e('The Chidori-maru sank here.', 0, 'きた: came.')] })],
    E: [CH({ item: 'v:来る', ctx: { jp: '{千鳥丸|ちどりまる} 。 {夏|なつ} 、 {二人|ふたり} で {来|き}た 。', en: '' }, prompt: T('Who came, when, and how many?'),
      options: [e('The Chidori-maru, one summer, with two aboard.', 1), e('The Chidori-maru, one winter, alone.', 0, '{夏|なつ}: summer; {二人|ふたり}: two people.'), e('Two boats, in summer.', 0, '{二人|ふたり}: two people, in one boat.')] })],
    I: [CH({ item: 'g:tsumori', ctx: { jp: '{千鳥丸|ちどりまる} 。 {妻|つま} と {来|き}た 。 {来年|らいねん} も {二人|ふたり} で {来|く}る つもり だ 。', en: '' }, prompt: T('What did the one who carved it mean to do?'),
      options: [e('To come back the next year, the two of them again.', 1), e('To come back alone.', 0, '{二人|ふたり}で: the two of them.'), e('Never to come back.', 0, 'つもり: intends to come (来る).')] })],
    A: [CH({ item: 'g:adv_kara_koso', ctx: { jp: '{千鳥丸|ちどりまる} 。 {妻|つま} と {来|き}た 。 この {島|しま} の {松|まつ} が {一本|いっぽん} で {立|た}って いられる の は 、 {根|ね} が {深|ふか}い から こそ だ 。 {帰|かえ}る {港|みなと} が ある から こそ 、 {沖|おき} へ {出|で}られる 。', en: '' }, prompt: T('What lets a boat go out to sea, says the carving?'),
      options: [e('Having a harbour to come home to.', 1), e('Being strong enough to need no harbour.', 0, 'からこそ: precisely BECAUSE there is a harbour to return to.'), e('The pine on the islet.', 0, 'The pine is the comparison: it stands alone because its roots are deep.')] })],
  } };

  RB.script.add(`
@scene sea.islet_arrive
!if sea_islet_seen -> end
!set sea_islet_seen
narr: {沖|おき} の {小島|こじま} 。 {松|まつ} が {一本|いっぽん} 、 {風|かぜ} に {傾|かたむ}いて {立|た}って いる 。 {他|ほか} に は 、 {石|いし} が {一|ひと}つ と 、 {小|ちい}さな {桟橋|さんばし} だけ 。 || The islet out at sea. One pine stands there, leaning in the wind. Apart from it, a single stone and a small jetty.
?(comp=nao) nao: {地図|ちず} に は 、 {点|てん} {一|ひと}つ で {描|か}いて ある {島|しま} だ 。 {来|き}て みる と 、 {点|てん} より は {大|おお}きい な 。 || On the chart it's a single dot. Up close it's a bit bigger than a dot.
?(comp=mio) mio: {誰|だれ} も いない {島|しま} 。 …… たまに は 、 いい ね 。 || An island with nobody on it. …Now and then, that's nice.
?(comp=ren) ren: この {松|まつ} が 、 {灯台|とうだい} の {代|か}わり だった の かも しれません 。 {昔|むかし} の {船|ふね} に とって 。 || Perhaps this pine was a lighthouse, of a kind. For the boats of long ago.
?(comp=suzu) suzu: {舞台|ぶたい} も {客|きゃく} も ない {島|しま} 。 …… {松|まつ} が {一本|いっぽん} 、 {主役|しゅやく} ね 。 || An island with no stage and no audience. …One pine, playing the lead.
:end

@scene sea.islet_stone
narr: {平|たい}らな {石|いし} に 、 {船|ふね} の {名前|なまえ} が {幾|いく}つ も {彫|ほ}って ある 。 {一番|いちばん} {古|ふる}い {字|じ} は 、 {波|なみ} に {削|けず}られて {浅|あさ}く なって いる 。 || A flat stone carved with the names of boats. The oldest letters are worn shallow by the waves.
!if sea_islet_stone -> done
!challenge sea.islet_stone
!if var._res=0 -> later
?(var.sea_hull=chidori) narr: {千鳥丸|ちどりまる} 。 {桟橋|さんばし} に {繋|つな}いで ある {船|ふね} は 、 {昔|むかし} 、 この {名前|なまえ} で ここ に {来|き}た の だ 。 || The Chidori-maru. The boat tied up at the jetty came here once before, under that name.
!choice
* $boat {丸|まる} と {彫|ほ}る || Carve your boat's name -> carve
* {今|いま} は {彫|ほ}らない || Not now -> later
:carve
!set sea_islet_stone
?(var.sea_hull=chidori) narr: {千鳥丸|ちどりまる} の {隣|となり} に 、 $boat {丸|まる} と {彫|ほ}った 。 || Beside the Chidori-maru, you carve your boat's name.
?(!var.sea_hull=chidori) narr: {空|あ}いて いる ところ に 、 $boat {丸|まる} と {彫|ほ}った 。 || In a clear space, you carve your boat's name.
!end
:later
narr: {石|いし} は 、 また {今度|こんど} {読|よ}もう 。 || You can read the stone another time.
!end
:done
narr: $boat {丸|まる} の {名前|なまえ} も 、 {他|ほか} の {名前|なまえ} の {間|あいだ} に {並|なら}んで いる 。 || Your boat's name stands among the others now.

@scene sea.fuku_islet
!faceplayer
fuku: {一本松|いっぽんまつ} の {島|しま} へ {行|い}った の ？ …… {石|いし} に 、 {名前|なまえ} が あった でしょう 。 || You went to the one-pine island? …There was a name on the stone, wasn't there.
fuku[smile]: {結婚|けっこん} した {年|とし} の {夏|なつ} に 、 {二人|ふたり} で {行|い}った の よ 。 {来年|らいねん} も {来|く}る って 、 あの {人|ひと} が {彫|ほ}った の 。 {結局|けっきょく} 、 {一度|いちど} きり だった けど 。 || We went there together the summer we married. He carved that we'd come again the next year. In the end it was just the once.
fuku: {千鳥丸|ちどりまる} が 、 また あそこ へ {行|い}って くれた の ね 。 ありがとう 。 || So the Chidori-maru went there again. Thank you.

@scene coast.station_rocks
!if !fish.intro -> note
:menu
narr: {岩|いわ} の {間|あいだ} に {立|た}てた {杭|くい} 。 {竿|さお} が {一本|いっぽん} 、 {縛|しば}って ある 。 || A stake standing among the rocks. A rod is lashed to it.
!choice
* {竿|さお} を {出|だ}す || Cast. -> cast
* {釣|つ}り の {記録|きろく} を {見|み}る || Fishing notes. -> notes
* {釣|つ}り の きまり || Rules. -> rules
* {離|はな}れる || Leave. -> end
:cast
!hook fish_go fish.sazanami.rocks
!end
:notes
!menu fishing
!end
:rules
!call fish.rules
!goto menu
:note
!call coast.note
!hook fish_intro note
!goto menu

@scene coast.station_boat
!if !fish.intro -> note
:menu
narr: {船|ふね} の {艫綱|ともづな} を {結|むす}んだ {杭|くい} 。 {竿|さお} を {持|も}って {船|ふね} に {降|お}りれば 、 {船|ふね} の {上|うえ} から {釣|つ}れる 。 || The stake the boat's stern line is tied to. Take a rod down into the boat and you can fish from it.
!choice
* {竿|さお} を {出|だ}す || Cast. -> cast
* {釣|つ}り の {記録|きろく} を {見|み}る || Fishing notes. -> notes
* {釣|つ}り の きまり || Rules. -> rules
* {離|はな}れる || Leave. -> end
:cast
!hook fish_go fish.boat
!end
:notes
!menu fishing
!end
:rules
!call fish.rules
!goto menu
:note
!call coast.note
!hook fish_intro note
!goto menu

@scene coast.note
narr: {杭|くい} に 、 {紙|かみ} が {結|むす}んで ある 。 {字|じ} は ヤス の もの だ 。 || A note is tied to the stake, in Yasu's hand.
narr: 「 {海|うみ} の {魚|さかな} も 、 {見|み}て {書|か}いて おいて くれ 。 {漣|さざなみ} の {岩場|いわば} と 、 {一本松|いっぽんまつ} の {小島|こじま} に 、 {印|しるし} を {頼|たの}んで おいた 。 {釣|つ}ったら よく {見|み}て 、 {同|おな}じ {水|みず} に {逃|に}がす こと 。 」 || "Write down the sea's fish too, once you've seen them. I've asked for markers at the Sazanami rocks and the One-Pine Islet. Look well at what you catch, and let it go into the same water."
`, 'fishing/70_coast.js');
})(RB.fishing, RB.content, RB.mapkit);
