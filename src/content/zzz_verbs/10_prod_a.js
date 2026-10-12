/* Exploration actions in the journey, first set (expansion P05; plan 06_WORLD.md W9–W11 and W17; the register in
 * docs/future/work/LW1_ROLLOUT.md, LW-07). Production instances of the templates of src/engine/55b_verbs.js (the
 * development fixtures, src/content/verbs/00_fixtures.js, are their format reference). Each is an optional activity
 * beside what its place already has, for twelve-chapter journeys only (ed>=2), once the story has reached it:
 *
 *   W9  notices that change behaviour (kind `notice`; the people follow what was posted, one place each)
 *       mb_vb_queue   Manybridge, the noodle stalls (mb.exchange), after the Rival Noodle Stalls (quest mb_noodle):
 *                     where Masaya's and Masuya's customers queue, so the crowd stops bunching at the foot of the
 *                     Middle Bridge. In front of the stalls or down toward the well both work; "in front of the
 *                     bridge" is followed and makes it worse; "in the middle" or "hurry" is understood as unclear.
 *       mb_vb_lock    Manybridge, the lock (the lock apron by the lock-keeper's house, mb.exchange), after the
 *                     chapter (mb1_done): where boats wait for the reopened lock. The boatmen and their barges wait
 *                     this side of the Storehouse Bridge, or pulled in to the bank; "in front of the lock" keeps
 *                     the mouth jammed. The barges are props here, beside the template's people.
 *       yn_vb_bath    Steamhollow, the Lower House's lobby (yn.shimo), after the agreement (yn_done): a bath notice
 *                     for guests coming out of the open-air bath, who stand about dripping in front of the curtain.
 *                     Towels back to the desk, or resting quietly by the hearth, both clear it; "wait in front of
 *                     the curtain" is followed and changes nothing; "rinse before you get in" is a real custom
 *                     they already keep, so nothing moves.
 *   W10 the press's readers act in the world. The press records the page last circulated (RB.press.of(s).blocks,
 *       src/engine/72p_press.js); a condition head added here, `printed.<block id>`, reads it (only once this
 *       journey has printed: press_printed). Three regulars of Blockprint Row and a child follow the page now out:
 *         the Opening's fireworks, on the Long Canal's bank  → they claim spots with straw mats on Playhouse Row's bank
 *         a new play, in front of the playhouse             → a queue at the theatre door
 *         a lost cat                                        → a child brings a calico cat to the press's board
 *         a new soba shop, on the Long Canal's bank         → they turn up at Masaya's and Masuya's counters
 *       A page has one "what": the regulars are in one place at a time.
 *   W11 courier rounds (kind `courier`; who is where on each leg of the round, never a clock; several plans work)
 *       mb_vb_barges  Manybridge, the porters' office (mb.porters), once the barge routing and the dispute are done
 *                     (mb_dispute_done): four loads for three barge runs, three people on the move
 *       cr_vb_relay   the Cloudroad, Oiwake's relay office (cr.oiwake_post), once the relay is running again
 *                     (cr_done): four deliveries for three legs, three people on the move
 *   W17 stage-blocking (kind `blocking`)
 *       mp_vb_stage   Playhouse Row's theatre (mp.theatre), Manbē's rehearsals after the first (mp_rehearsal_done):
 *                     the matinée's ferry scene, placed from his directions, rehearsed and revised freely; the
 *                     painted willow and the stone lantern are scenery nobody stands in.
 *
 * The Lower House's map is defined by src/content/yn/10_maps.js, which loads after this folder (verbs/ sorts before
 * yn/); its notice is defined the moment that map is (a one-time setter on the map table), so its board and guests are
 * placed on the real map. New townsfolk are defined here with their looks; no consumable rewards. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const V = RB.verbs;
  const T = (en, jp) => ({ en, jp });
  const B = (id, b) => 'puzzle.' + id + '.behaviour=' + b;
  const ch = (id, d) => (C.chars[id] = d);
  const addTo = (map, key, items) => {
    const m = C.maps[map];
    if (!m) return;
    m[key] = m[key] || [];
    for (const it of items) m[key].push(it);
    if (RB.maps && RB.maps.forget) RB.maps.forget(map);
  };
  // (this folder, src/content/zzz_verbs/, loads after every region's, so the maps placed on are all there)
  function whenMap(id, fn) { if (!C.maps[id]) throw new Error('verbs: no map ' + id); fn(); }

  // ---- the people ---------------------------------------------------------------------------------------------------
  // Manybridge: three customers of the noodle stalls; two boatmen waiting for the lock
  ch('mb_vb_gosuke', {
    name: T('Gosuke', 'ゴスケ'), voice: { pitch: 0.8 },
    look: { skin: 3, hair: 'short', hairColor: 0, cloth: ['#7a6040', '#5e4a30', '#e0d0b0'], shape: 'tunic', acc: ['headband', 'toolbelt'], bandCol: '#e8e0cc' },
    portrait: { eyes: 'round', style: 'short', acc: ['headband'], bandCol: '#e8e0cc', bg: '#33281e' },
  });
  ch('mb_vb_otane', {
    name: T('Otane', 'オタネ'), voice: { pitch: 1.04 },
    look: { skin: 2, hair: 'bun', hairColor: 1, cloth: ['#4a7a72', '#3a5e58', '#e8e0cc'], shape: 'apron', acc: ['basket'] },
    portrait: { eyes: 'soft', style: 'bun', collar: 'apron', bg: '#24343a' },
  });
  ch('mb_vb_kinji', {
    name: T('Kinji', 'キンジ'), voice: { pitch: 1.08 },
    look: { skin: 1, hair: 'bob', hairColor: 0, cloth: ['#3e4a6a', '#2e3854', '#e4dccc'], shape: 'coat', acc: ['pencil'] },
    portrait: { eyes: 'narrow', style: 'bob', collar: 'high', acc: ['pencil'], bg: '#1e2638' },
  });
  ch('mb_vb_torakichi', {
    name: T('Torakichi', 'トラキチ'), voice: { pitch: 0.74 },
    look: { skin: 4, hair: 'short', hairColor: 0, cloth: ['#5a6a7a', '#465462', '#d8ccb0'], shape: 'tunic', acc: ['hat', 'beard'], hatCol: '#c8b07a' },
    portrait: { eyes: 'sharp', style: 'short', beard: '#3a302a', acc: ['hat'], hatCol: '#c8b07a', bg: '#24323e' },
  });
  ch('mb_vb_magobe', {
    name: T('Magobē', 'マゴベエ'), voice: { pitch: 0.7 },
    look: { skin: 3, hair: 'shaved', hairColor: 6, cloth: ['#6a5a4a', '#524638', '#c8b490'], shape: 'tunic', acc: ['headband'], bandCol: '#d8ccb0', age: 'old' },
    portrait: { eyes: 'narrow', style: 'shaved', age: 'old', acc: ['headband'], bandCol: '#d8ccb0', bg: '#2c241c' },
  });
  // Steamhollow: three guests of the Lower House, in the house's yukata
  ch('yn_vb_ofumi', {
    name: T('Ofumi', 'オフミ'), voice: { pitch: 1.02 },
    look: { skin: 1, hair: 'bun', hairColor: 2, cloth: ['#e8e4f0', '#c4c0d8', '#3a4a7a'], shape: 'robe', acc: [] },
    portrait: { eyes: 'soft', style: 'bun', collar: 'open', bg: '#2a2c44' },
  });
  ch('yn_vb_kamekichi', {
    name: T('Kamekichi', 'カメキチ'), voice: { pitch: 0.76 },
    look: { skin: 3, hair: 'shaved', hairColor: 6, cloth: ['#e8e4f0', '#c4c0d8', '#3a4a7a'], shape: 'robe', acc: ['beard'], age: 'old' },
    portrait: { eyes: 'round', style: 'shaved', beard: '#d8d8d8', age: 'old', collar: 'open', bg: '#2a2c44' },
  });
  ch('yn_vb_tatsuzo', {
    name: T('Tatsuzō', 'タツゾウ'), voice: { pitch: 0.88 },
    look: { skin: 2, hair: 'short', hairColor: 1, cloth: ['#e8e4f0', '#c4c0d8', '#3a4a7a'], shape: 'robe', acc: [] },
    portrait: { eyes: 'narrow', style: 'short', collar: 'open', bg: '#2a2c44' },
  });
  // Blockprint Row: three regulars who read every sheet the press puts out, a child, and a calico cat
  ch('mp_vb_chosuke', {
    name: T('Chōsuke', 'チョウスケ'), voice: { pitch: 0.78 },
    look: { skin: 2, hair: 'short', hairColor: 6, cloth: ['#5a4a6a', '#463a54', '#e0d4c0'], shape: 'coat', acc: ['glasses', 'hat'], hatCol: '#6a5a3a', age: 'old' },
    portrait: { eyes: 'narrow', style: 'short', age: 'old', acc: ['glasses', 'hat'], hatCol: '#6a5a3a', bg: '#2c2636' },
  });
  ch('mp_vb_ohatsu', {
    name: T('Ohatsu', 'オハツ'), voice: { pitch: 1.06 },
    look: { skin: 1, hair: 'ponytail', hairColor: 1, cloth: ['#a4543a', '#82422e', '#f0e4c8'], shape: 'apron', acc: ['scarf'], scarfCol: '#e8c060' },
    portrait: { eyes: 'round', style: 'ponytail', collar: 'apron', acc: ['scarf'], bg: '#3a2a26' },
  });
  ch('mp_vb_rokuro', {
    name: T('Rokurō', 'ロクロウ'), voice: { pitch: 0.96 },
    look: { skin: 3, hair: 'spiky', hairColor: 0, cloth: ['#3a5a4a', '#2c463a', '#e8e0cc'], shape: 'tunic', acc: ['satchel'] },
    portrait: { eyes: 'round', style: 'spiky', bg: '#22302a' },
  });
  ch('mp_vb_ginta', {
    name: T('Ginta', 'ギンタ'), voice: { pitch: 1.28 },
    look: { skin: 2, hair: 'spiky', hairColor: 1, cloth: ['#6a8ab0', '#52708e', '#f0e4c8'], shape: 'tunic', acc: [], size: 'child' },
    portrait: { eyes: 'round', style: 'spiky', bg: '#262c3a' },
  });
  ch('mp_vb_mike', {
    name: T('Mike', 'ミケ'), voice: { pitch: 1.4 }, look: { pet: 'cat', look: 'calico', rest: [1500, 6000] },
    portrait: { kind: 'cat', skin: ['#f1ebdf', '#d8d0c0'], hair: ['#d6843c', '#3b3334', '#f6f1e8'], cloth: ['#c86a5a', '#a85a4a', '#e8c060'], style: 'short', eyes: 'round', bg: '#2e2a26' },
  });

  // ---- W9 · Manybridge's noodle stalls: where the queue goes ---------------------------------------------------------
  // The stalls face south; the crowd has spilled north round the foot of the Middle Bridge (23–24, 23).
  const Q = 'mb_vb_queue';
  V.define('notice', {
    id: Q, if: 'ed>=2&quest.mb_noodle=done', map: 'mb.exchange', x: 19, y: 26, region: 'manybridge',
    title: T('A notice for the noodle queue', '{蕎麦|そば} の {列|れつ} の {貼|は}り{紙|がみ}'),
    slots: [
      { key: 'where', label: T('Where the line goes', '{列|れつ} は どこ'), options: [
        { id: 'front', jp: '{屋台|やたい} の {前|まえ} に', en: 'in front of the stalls' },
        { id: 'well', jp: '{井戸|いど} の {方|ほう} に', en: 'toward the well' },
        { id: 'bridge', jp: '{橋|はし} の {前|まえ} に', en: 'in front of the bridge' },
        { id: 'middle', jp: '{真|ま}ん{中|なか} に', en: 'in the middle' },
      ] },
      { key: 'do', label: T('What to do', '{何|なに} を して ほしい'), options: [
        { id: 'line', jp: '{一列|いちれつ} に {並|なら}んで ください', en: 'please line up in single file' },
        { id: 'wait', jp: '{並|なら}んで お{待|ま}ち ください', en: 'please line up and wait' },
        { id: 'hurry', jp: '{急|いそ}いで ください', en: 'please hurry' },
      ] },
    ],
    readings: [
      { when: { where: 'front', do: ['line', 'wait'] }, behaviour: 'front',
        heard: T('People read it and line up in front of each stall\'s counter. Nobody is left at the foot of the bridge.', '{読|よ}んだ {人|ひと} たち は 、 それぞれ の {屋台|やたい} の {前|まえ} に {並|なら}んだ 。 {橋|はし} の {前|まえ} に は 、 もう {誰|だれ} も いない 。') },
      { when: { where: 'well', do: ['line', 'wait'] }, behaviour: 'well',
        heard: T('People read it and form one line running down toward the well. The foot of the bridge is clear.', '{読|よ}んだ {人|ひと} たち は 、 {井戸|いど} の {方|ほう} へ {一列|いちれつ} に {並|なら}んだ 。 {橋|はし} の {前|まえ} が {空|あ}いた 。') },
      { when: { where: 'bridge', do: ['line', 'wait'] }, behaviour: 'bridge',
        heard: T('People do just what it says and line up in front of the bridge. Now the queue starts at its foot, and people crossing the bridge have to squeeze past it.', '{言|い}われた とおり 、 {人|ひと} たち は {橋|はし} の {前|まえ} に {並|なら}んだ 。 {橋|はし} を {渡|わた}って きた {人|ひと} は 、 {列|れつ} の {横|よこ} を {無理|むり} に {通|とお}って いる 。') },
    ],
    unclear: T('People read it, look at one another, and stay where they were, bunched round the foot of the bridge.', '{読|よ}んだ {人|ひと} たち は {顔|かお} を {見合|みあ}わせて 、 {橋|はし} の {前|まえ} に {集|あつ}まった まま だ 。'),
    goal: ['front', 'well'],
    people: (() => {
      const crowd = [{ char: 'mb_vb_gosuke', x: 22, y: 23, dir: 'right' }, { char: 'mb_vb_otane', x: 25, y: 23, dir: 'left' }, { char: 'mb_vb_kinji', x: 24, y: 24, dir: 'up' }];
      const talk = (p) => Object.assign({ talk: 'mb.vb_' + p.char.slice(6) }, p);
      return {
        none: crowd.map(talk),
        unclear: crowd.map(talk),
        // Haru may be at Masaya's counter (16, 27): the line takes its right-hand side
        front: [{ char: 'mb_vb_gosuke', x: 17, y: 27, dir: 'up' }, { char: 'mb_vb_otane', x: 17, y: 28, dir: 'up' }, { char: 'mb_vb_kinji', x: 22, y: 27, dir: 'up' }].map(talk),
        well: [{ char: 'mb_vb_gosuke', x: 25, y: 27, dir: 'up' }, { char: 'mb_vb_otane', x: 25, y: 28, dir: 'up' }, { char: 'mb_vb_kinji', x: 25, y: 29, dir: 'up' }].map(talk),
        bridge: [{ char: 'mb_vb_gosuke', x: 22, y: 23, dir: 'right' }, { char: 'mb_vb_otane', x: 21, y: 23, dir: 'right' }, { char: 'mb_vb_kinji', x: 20, y: 23, dir: 'right' }].map(talk),
      };
    })(),
  });

  // ---- W9 · Manybridge's lock: where boats wait ----------------------------------------------------------------------
  // The Long Canal runs east into the lock under the lock-keeper's house (the vault at 52, 19); boats come from the
  // west, under the Storehouse Bridge (42–43). Two barges and their boatmen wait where the notice says.
  const L = 'mb_vb_lock', LOCK_IF = 'ed>=2&mb1_done';
  const lockPeople = {
    jam: [{ char: 'mb_vb_torakichi', x: 50, y: 20, dir: 'down' }, { char: 'mb_vb_magobe', x: 50, y: 21, dir: 'up' }],
    bridge: [{ char: 'mb_vb_torakichi', x: 39, y: 23, dir: 'up' }, { char: 'mb_vb_magobe', x: 40, y: 23, dir: 'up' }],
    bank: [{ char: 'mb_vb_torakichi', x: 45, y: 23, dir: 'up' }, { char: 'mb_vb_magobe', x: 48, y: 23, dir: 'up' }],
  };
  const withTalk = (list) => list.map((p) => Object.assign({ talk: 'mb.vb_' + p.char.slice(6) }, p));
  V.define('notice', {
    id: L, if: LOCK_IF, map: 'mb.exchange', x: 47, y: 19, region: 'manybridge',
    title: T('A notice for boats waiting for the lock', '{閘門|こうもん} を {待|ま}つ {舟|ふね} へ'),
    slots: [
      { key: 'where', label: T('Where to wait', '{待|ま}つ {場所|ばしょ}'), options: [
        { id: 'bridge', jp: '{蔵橋|くらばし} の {手前|てまえ} で', en: 'this side of the Storehouse Bridge' },
        { id: 'bank', jp: '{岸|きし} に {寄|よ}せて', en: 'pulled in to the bank' },
        { id: 'gate', jp: '{閘門|こうもん} の {前|まえ} で', en: 'in front of the lock' },
        { id: 'any', jp: 'どこ でも', en: 'anywhere' },
      ] },
      { key: 'do', label: T('What to do', '{何|なに} を して ほしい'), options: [
        { id: 'line', jp: '{一列|いちれつ} に {並|なら}んで お{待|ま}ち ください', en: 'please wait in single file' },
        { id: 'turn', jp: '{順番|じゅんばん} に お{待|ま}ち ください', en: 'please wait your turn' },
        { id: 'rush', jp: '{急|いそ}いで {入|はい}って ください', en: 'please hurry in' },
      ] },
    ],
    readings: [
      { when: { where: 'bridge', do: ['line', 'turn'] }, behaviour: 'bridge',
        heard: T('The boatmen read it and pole their barges back to wait this side of the Storehouse Bridge. The lock\'s mouth is clear, and the boats coming out pass easily.', '{船頭|せんどう} たち は {読|よ}んで 、 {蔵橋|くらばし} の {手前|てまえ} まで {舟|ふね} を {戻|もど}した 。 {閘門|こうもん} の {口|くち} が {空|あ}いて 、 {出|で}る {舟|ふね} も すぐ {通|とお}れる 。') },
      { when: { where: 'bank', do: ['line', 'turn'] }, behaviour: 'bank',
        heard: T('The boatmen read it and tie up along the bank, one behind the other. The middle of the canal is open for the boats coming out.', '{船頭|せんどう} たち は {読|よ}んで 、 {岸|きし} に {舟|ふね} を {寄|よ}せ 、 {一列|いちれつ} に {並|なら}んだ 。 {運河|うんが} の {真|ま}ん{中|なか} が {空|あ}いて 、 {出|で}る {舟|ふね} が {通|とお}れる 。') },
      { when: { where: 'gate', do: ['line', 'turn'] }, behaviour: 'gate',
        heard: T('The boatmen do what it says and wait in front of the lock, where they already were. The mouth stays jammed: nothing can come out.', '{船頭|せんどう} たち は {言|い}われた とおり 、 {閘門|こうもん} の {前|まえ} で {待|ま}って いる 。 {前|まえ} と {同|おな}じ だ 。 {口|くち} が ふさがって 、 {出|で}る {舟|ふね} が {通|とお}れない 。') },
    ],
    unclear: T('The boatmen read it, puzzled, and stay jammed at the lock\'s mouth.', '{船頭|せんどう} たち は {読|よ}んで {首|くび} を かしげ 、 {閘門|こうもん} の {口|くち} に {詰|つ}まった まま だ 。'),
    goal: ['bridge', 'bank'],
    people: { none: withTalk(lockPeople.jam), unclear: withTalk(lockPeople.jam), gate: withTalk(lockPeople.jam), bridge: withTalk(lockPeople.bridge), bank: withTalk(lockPeople.bank) },
  });
  // the barges, where their boatmen are: jammed two abreast at the lock's mouth, west of the bridge, or along the bank
  const barges = { jam: [[47, 20], [47, 21]], bridge: [[38, 20], [38, 22]], bank: [[44, 22], [47, 22]] };
  const bargeState = { none: 'jam', unclear: 'jam', gate: 'jam', bridge: 'bridge', bank: 'bank' };
  addTo('mb.exchange', 'props', [].concat(...Object.keys(bargeState).map((b) => barges[bargeState[b]].map(([x, y]) => ({ p: 'mb_barge', x, y, if: LOCK_IF + '&' + B(L, b) })))));

  // ---- W9 · Steamhollow's Lower House: a notice for the bath ---------------------------------------------------------
  // The lobby (yn.shimo): the desk (2–4, 3), the hearth (10–11, 6–7), the curtain to the open-air bath (13, 2). The
  // guests just out of the bath stand about in front of the curtain; the way to it (13, 3) is always left open.
  const H = 'yn_vb_bath';
  whenMap('yn.shimo', () => V.define('notice', {
    id: H, if: 'ed>=2&yn_done', map: 'yn.shimo', x: 9, y: 2, region: 'steamhollow',
    title: T('A notice for the bath', 'お{風呂|ふろ} の {貼|は}り{紙|がみ}'),
    slots: [
      { key: 'time', label: T('When', 'いつ'), options: [
        { id: 'after', jp: 'お{風呂|ふろ} から {出|で}たら', en: 'when you come out of the bath' },
        { id: 'before', jp: 'お{風呂|ふろ} に {入|はい}る {前|まえ} に', en: 'before you get in' },
        { id: 'night', jp: '{夜|よる} は', en: 'at night' },
      ] },
      { key: 'what', label: T('What to do', '{何|なに} を する'), options: [
        { id: 'towel', jp: '{手拭|てぬぐ}い を {帳場|ちょうば} に {返|かえ}して ください', en: 'please return your towel to the desk' },
        { id: 'hearth', jp: '{囲炉裏|いろり} の そば で {静|しず}か に {休|やす}んで ください', en: 'please rest quietly by the hearth' },
        { id: 'curtain', jp: '{暖簾|のれん} の {前|まえ} で {待|ま}って ください', en: 'please wait in front of the curtain' },
        { id: 'rinse', jp: '{体|からだ} を {流|なが}して ください', en: 'please rinse yourself' },
      ] },
    ],
    readings: [
      { when: { time: ['after', 'night'], what: 'towel' }, behaviour: 'desk',
        heard: T('Guests coming out of the bath read it and take their towels back to the desk, one after another. The way to the curtain is clear.', 'お{風呂|ふろ} から {出|で}た {客|きゃく} は 、 {順番|じゅんばん} に {手拭|てぬぐ}い を {帳場|ちょうば} へ {返|かえ}しに {行|い}った 。 {暖簾|のれん} の {前|まえ} が {空|あ}いた 。') },
      { when: { time: ['after', 'night'], what: 'hearth' }, behaviour: 'hearth',
        heard: T('Guests coming out of the bath read it and go to sit by the hearth, talking softly. The way to the curtain is clear.', 'お{風呂|ふろ} から {出|で}た {客|きゃく} は 、 {囲炉裏|いろり} の そば に {座|すわ}って 、 {小|ちい}さな {声|こえ} で {話|はな}して いる 。 {暖簾|のれん} の {前|まえ} が {空|あ}いた 。') },
      { when: { time: ['after', 'before', 'night'], what: 'curtain' }, behaviour: 'curtain',
        heard: T('The guests do just what it says: they wait in front of the curtain, dripping, exactly as before. Now it is the rule.', '{言|い}われた とおり 、 {客|きゃく} は {暖簾|のれん} の {前|まえ} で {待|ま}って いる 。 {前|まえ} と {同|おな}じ だ 。 {今度|こんど} は 、 それ が {決|き}まり に なって しまった 。') },
      { when: { time: 'before', what: 'rinse' }, behaviour: 'rinse',
        heard: T('The guests nod: everyone rinses before getting in already. But the ones coming out still stand about in front of the curtain.', '{客|きゃく} は うなずいた 。 {入|はい}る {前|まえ} に {体|からだ} を {流|なが}す の は 、 もう みんな {知|し}って いる 。 でも 、 {出|で}て きた {人|ひと} は 、 まだ {暖簾|のれん} の {前|まえ} に いる 。') },
    ],
    unclear: T('The guests read it, look at one another, and go on standing about in front of the curtain.', '{客|きゃく} は {貼|は}り{紙|がみ} を {読|よ}んで {顔|かお} を {見合|みあ}わせ 、 {暖簾|のれん} の {前|まえ} に {立|た}った まま だ 。'),
    goal: ['desk', 'hearth'],
    people: (() => {
      const talk = (p) => Object.assign({ talk: 'yn.vb_' + p.char.slice(6) }, p);
      const curtain = [{ char: 'yn_vb_ofumi', x: 12, y: 3, dir: 'left' }, { char: 'yn_vb_kamekichi', x: 11, y: 3, dir: 'right' }, { char: 'yn_vb_tatsuzo', x: 12, y: 4, dir: 'up' }].map(talk);
      return {
        none: curtain, unclear: curtain, curtain, rinse: curtain,
        desk: [{ char: 'yn_vb_ofumi', x: 2, y: 4, dir: 'up' }, { char: 'yn_vb_kamekichi', x: 2, y: 5, dir: 'up' }, { char: 'yn_vb_tatsuzo', x: 2, y: 6, dir: 'up' }].map(talk),
        hearth: [{ char: 'yn_vb_ofumi', x: 9, y: 6, dir: 'right' }, { char: 'yn_vb_kamekichi', x: 12, y: 6, dir: 'left' }, { char: 'yn_vb_tatsuzo', x: 10, y: 8, dir: 'up' }].map(talk),
      };
    })(),
  }));

  // ---- W10 · the press's readers in the world ------------------------------------------------------------------------
  // printed.<block id>: the page now circulated has that block (the record keeps only the latest version, so a
  // revision moves everyone on). Nothing before this journey has printed.
  RB.state.addTerm('printed', (s, rest) => {
    const p = RB.press && RB.press.of(s);
    if (!p || !p.blocks || !(s.flags && s.flags.press_printed)) return false;
    return Object.keys(p.blocks).some((k) => p.blocks[k] === rest);
  });
  const PR = 'ed>=2&press_printed&';
  const FEST = PR + 'printed.n_festival&printed.n_bank&!mp_fest_night';
  const PLAY = PR + 'printed.n_play&printed.n_playhouse&!mp_fest_night';
  const CAT = PR + 'printed.n_cat';
  const SOBA = PR + 'printed.n_soba&printed.n_bank';
  const reader = (who, x, y, dir, cond, tag) => ({ id: who + '_' + tag, char: who, x, y, dir, if: cond, talk: 'mp.vb_' + who.slice(6) });
  // the Opening's fireworks on the bank: spots claimed with straw mats, on Playhouse Row's bank (the festival's)
  addTo('mp.playhouse', 'npcs', [
    reader('mp_vb_chosuke', 17, 23, 'down', FEST, 'fest'),
    reader('mp_vb_ohatsu', 18, 23, 'down', FEST, 'fest'),
    reader('mp_vb_rokuro', 27, 23, 'down', FEST, 'fest'),
    // a new play at the playhouse: a queue at the theatre door (its step, 23, 11, stays free)
    reader('mp_vb_chosuke', 24, 11, 'left', PLAY, 'play'),
    reader('mp_vb_ohatsu', 25, 11, 'left', PLAY, 'play'),
    reader('mp_vb_rokuro', 26, 11, 'left', PLAY, 'play'),
  ]);
  addTo('mp.playhouse', 'props', [{ p: 'mat', x: 17, y: 24, if: FEST }, { p: 'mat', x: 18, y: 24, if: FEST }, { p: 'mat', x: 27, y: 24, if: FEST }]);
  // a lost cat: a child brings one to the press's board
  addTo('mp.blockprint', 'npcs', [
    { id: 'mp_vb_ginta', char: 'mp_vb_ginta', x: 13, y: 14, dir: 'left', if: CAT, talk: 'mp.vb_ginta' },
    { id: 'mp_vb_mike', char: 'mp_vb_mike', x: 12, y: 14, dir: 'right', if: CAT, talk: 'mp.vb_mike' },
  ]);
  // a new soba shop on the Long Canal's bank: they turn up at the stalls that are there
  addTo('mb.exchange', 'npcs', [
    reader('mp_vb_chosuke', 15, 27, 'up', SOBA, 'soba'),
    reader('mp_vb_ohatsu', 21, 27, 'up', SOBA, 'soba'),
  ]);

  // ---- W11 · courier rounds ---------------------------------------------------------------------------------------------
  // Manybridge's barges: four loads, three runs, so one stop has to reach two people; Heiji, Uno and Kansuke are on
  // the move, Sen keeps the Exchange. Three rounds work (kawaya > tally > fujiya, pier > tally > kawaya,
  // tally > pier > fujiya).
  V.define('courier', {
    id: 'mb_vb_barges', if: 'ed>=2&mb_dispute_done', map: 'mb.porters', x: 2, y: 4, prop: 'desk',
    title: T('The barge\'s round', '{荷舟|にぶね} の {配達|はいたつ}'),
    legs: [T('The first run', '{最初|さいしょ} の {便|びん}'), T('The second run', '{二番目|にばんめ} の {便|びん}'), T('The last run', '{最後|さいご} の {便|びん}')],
    stops: {
      fujiya: T('Fujiya\'s landing', '{藤屋|ふじや} の {舟着|ふなつ}き{場|ば}'),
      kawaya: T('below Kawaya, the inn', '{川屋|かわや} の {下|した}'),
      tally: T('below the Tally Exchange', '{札場|ふだば} の {下|した}'),
      kura: T('Warehouse Row', '{蔵|くら} の {並|なら}び'),
      pier: T('the ferry pier', '{渡|わた}し{場|ば}'),
    },
    recipients: {
      heiji: { name: T('Heiji', 'ヘイジ'), at: ['kura', 'tally', 'fujiya'] },
      uno: { name: T('Uno, at Kawaya', '{川屋|かわや} の ウノ'), at: ['kawaya', 'pier', 'kawaya'] },
      kansuke: { name: T('Kansuke the boatman', '{船頭|せんどう} の カンスケ'), at: ['pier', 'kura', 'fujiya'] },
      sen: { name: T('Sen, at the Tally Exchange', '{札場|ふだば} の セン'), at: ['tally', 'tally', 'tally'] },
    },
    parcels: [
      { id: 'letter', to: 'heiji', jp: '{藤屋|ふじや} から の {手紙|てがみ}', en: 'a letter from Fujiya' },
      { id: 'fish', to: 'uno', jp: '{干物|ひもの}', en: 'dried fish' },
      { id: 'rope', to: 'kansuke', jp: '{新|あたら}しい {縄|なわ}', en: 'new rope' },
      { id: 'tallies', to: 'sen', jp: '{札|ふだ} の {束|たば}', en: 'a bundle of tallies' },
    ],
  });
  // the Cloudroad relay: four deliveries, three legs; Rin is walking the road up, Sada carrying loads up and down it,
  // Ine going down to Oiwake for supplies; Otaki keeps her inn. Three rounds work (suginoki > suginoki > nakayama,
  // suginoki > nakayama > sakashita, sakashita > oiwake > nakayama).
  V.define('courier', {
    id: 'cr_vb_relay', if: 'ed>=2&cr_done', map: 'cr.oiwake_post', x: 7, y: 3, prop: 'desk',
    title: T('The relay\'s round', '{継|つ}ぎ{飛脚|びきゃく} の {配達|はいたつ}'),
    legs: [T('The first leg', '{最初|さいしょ} の {道|みち}'), T('The second leg', '{次|つぎ} の {道|みち}'), T('The last leg', '{最後|さいご} の {道|みち}')],
    stops: {
      oiwake: T('Oiwake', '{追分|おいわけ}'),
      suginoki: T('Suginoki', '{杉|すぎ}ノ{木|き}'),
      sakashita: T('Sakashita', '{坂下|さかした}'),
      nakayama: T('Nakayama', '{中山|なかやま}'),
    },
    recipients: {
      rin: { name: T('Rin the mapmaker', '{地図|ちず} を {描|か}く リン'), at: ['suginoki', 'sakashita', 'nakayama'] },
      sada: { name: T('Sada the porter', '{荷運|にはこ}び の サダ'), at: ['sakashita', 'suginoki', 'sakashita'] },
      ine: { name: T('Ine, of the teahouse', '{茶屋|ちゃや} の イネ'), at: ['suginoki', 'oiwake', 'oiwake'] },
      otaki: { name: T('Otaki, at Nakayama\'s inn', '{中山|なかやま} の {宿|やど} の オタキ'), at: ['nakayama', 'nakayama', 'nakayama'] },
    },
    parcels: [
      { id: 'ink', to: 'rin', jp: '{墨|すみ}', en: 'ink' },
      { id: 'sandals', to: 'sada', jp: '{草鞋|わらじ}', en: 'straw sandals' },
      { id: 'tea', to: 'ine', jp: '{茶|ちゃ} の {葉|は}', en: 'tea leaves' },
      { id: 'letter', to: 'otaki', jp: '{手紙|てがみ}', en: 'a letter' },
    ],
  });

  // ---- W17 · Playhouse Row: blocking the matinée's ferry scene -----------------------------------------------------------
  // Columns 0–4 from the audience's left, rows 0 (back) to 2 (front). The painted willow (0, 0) and the stone lantern
  // of the far bank (4, 0) are scenery. Either side of the daughter will do for the lantern.
  V.define('blocking', {
    id: 'mp_vb_stage', if: 'ed>=2&mp_rehearsal_done', map: 'mp.theatre', x: 12, y: 6, prop: 'desk',
    name: T('The matinée: the ferry scene', '{昼|ひる} の {部|ぶ} 、 {渡|わた}し の {場面|ばめん}'),
    stage: { w: 5, h: 3, scenery: [[0, 0], [4, 0]] },
    pieces: [
      { id: 'saku', kind: 'actor', jp: 'サクタロウ', en: 'Sakutarō' },
      { id: 'hina', kind: 'actor', jp: '{娘役|むすめやく}', en: 'the daughter' },
      { id: 'sendo', kind: 'actor', jp: '{船頭|せんどう}', en: 'the boatman' },
      { id: 'boat', kind: 'prop', jp: '{舟|ふね}', en: 'the boat' },
      { id: 'lantern', kind: 'prop', jp: '{提灯|ちょうちん}', en: 'the paper lantern' },
    ],
    directions: [
      { jp: '{舟|ふね} は {上手|かみて} の {前|まえ} に {置|お}いて ください 。', en: 'Put the boat at the front on the kamite side (the audience\'s right).', want: { who: 'boat', at: [4, 2] } },
      { jp: '{船頭|せんどう} は その {隣|となり} に {立|た}って ください 。', en: 'The boatman stands next to it.', want: { who: 'sendo', next: 'boat' } },
      { jp: '{娘役|むすめやく} は {真|ま}ん{中|なか} の {奥|おく} に {立|た}って ください 。', en: 'The daughter stands at the back, in the middle.', want: { who: 'hina', at: [2, 0] } },
      { jp: '{提灯|ちょうちん} は {娘役|むすめやく} の {隣|となり} に {置|お}いて ください 。 どちら の {隣|となり} でも いい です 。', en: 'Put the lantern next to the daughter. Either side will do.', want: { who: 'lantern', next: 'hina' } },
      { jp: 'サクタロウ は まだ {出|で}ません 。 {下手|しもて} の {袖|そで} で {待|ま}って いて ください 。', en: 'Sakutarō is not on yet: wait in the wings on the shimote side (the audience\'s left).', want: { who: 'saku', wing: 'left' } },
    ],
  });

  // ---- words ------------------------------------------------------------------------------------------------------------
  RB.lex.add(RB.lex.parseTable(`
ゴスケ||name|F|Gosuke (a carpenter in Manybridge)
オタネ||name|F|Otane (a Manybridge townswoman)
キンジ||name|F|Kinji (a clerk in Manybridge)
トラキチ||name|F|Torakichi (a Manybridge boatman)
マゴベエ||name|F|Magobē (an old Manybridge boatman)
オフミ||name|F|Ofumi (a guest at the Lower House)
カメキチ||name|F|Kamekichi (a guest at the Lower House)
タツゾウ||name|F|Tatsuzō (a guest at the Lower House)
チョウスケ||name|F|Chōsuke (a reader of the press, Blockprint Row)
オハツ||name|F|Ohatsu (a reader of the press, Blockprint Row)
ロクロウ||name|F|Rokurō (a reader of the press, Blockprint Row)
ギンタ||name|F|Ginta (a child of Blockprint Row)
ミケ||name|F|Mike (a calico cat's name: 三毛, three-coloured)
舟着き場|ふなつきば|n|I|a landing stage for boats
三毛猫|みけねこ|n|I|a calico cat (三毛: three colours)
三毛|みけ|n|I|three-coloured (of a cat's coat: white, brown and black)
昼休み|ひるやすみ|n|E|lunch break
湯上がり|ゆあがり|n|I|just out of the bath (the warmth after bathing)
`), 'verbs');

  // ---- what the people say -------------------------------------------------------------------------------------------
  const q = (b) => B(Q, b), lk = (b) => B(L, b), bt = (b) => B(H, b);
  RB.script.add(`
@scene mb.vb_gosuke
# A customer of the noodle stalls (mb_vb_queue): what the queue is doing, as the notice left it.
!faceplayer
?(${q('none')}|${q('unclear')}) mb_vb_gosuke: まさ{屋|や} と ます{屋|や} 、 どっち の {列|れつ} か {分|わ}からない 。 {橋|はし} の {前|まえ} で {待|ま}って いる だけ だ 。 || Masaya's or Masuya's, I can't tell which line this is. I'm just waiting at the foot of the bridge.
?(${q('front')}) mb_vb_gosuke: {屋台|やたい} の {前|まえ} に {並|なら}ぶ の が 、 {一番|いちばん} {分|わ}かりやすい な 。 {湯気|ゆげ} も よく {見|み}える 。 || Lining up in front of the stall is clearest. You can see the steam, too.
?(${q('well')}) mb_vb_gosuke: {列|れつ} は {長|なが}い が 、 {橋|はし} の {前|まえ} は {空|あ}いて いる 。 {橋|はし} を {直|なお}す {大工|だいく} と して は 、 それ が {一番|いちばん} {嬉|うれ}しい 。 || The line's long, but the bridge is clear. As a carpenter who mends the bridges, that's what I like best.
?(${q('bridge')}) mb_vb_gosuke: {橋|はし} の {前|まえ} に {並|なら}べ と {書|か}いて ある から {並|なら}んだ が …… {橋|はし} から {来|く}る {人|ひと} に 、 {何度|なんど} も ぶつかる 。 || It said to line up in front of the bridge, so I did… but people coming off it keep bumping into me.

@scene mb.vb_otane
!faceplayer
?(${q('none')}|${q('unclear')}) mb_vb_otane: {押|お}さないで よ 。 …… {誰|だれ} が {先|さき} か 、 もう {分|わ}からない わ 。 || Don't push. …Nobody knows who was first any more.
?(${q('front')}) mb_vb_otane: まさ{屋|や} の {前|まえ} は まさ{屋|や} の {列|れつ} 。 {赤|あか}い のれん と {一緒|いっしょ} で 、 {間違|まちが}えない わ ね 。 || In front of Masaya is Masaya's line. With the red curtain too, nobody gets it wrong.
?(${q('well')}) mb_vb_otane: {井戸|いど} の {方|ほう} まで {並|なら}んで いる の 。 {水|みず} を {汲|く}む {人|ひと} と お{話|はなし} が できて 、 {退屈|たいくつ} しない わ 。 || The line goes right down toward the well. I can chat with the people drawing water, so I'm not bored.
?(${q('bridge')}) mb_vb_otane: {言|い}われた とおり に {並|なら}んだ のに 、 {橋|はし} を {渡|わた}る {人|ひと} に {怒|おこ}られた わ 。 || I lined up just as it said, and someone crossing the bridge told me off.

@scene mb.vb_kinji
!faceplayer
?(${q('none')}|${q('unclear')}) mb_vb_kinji: {札場|ふだば} の {昼休|ひるやす}み は {短|みじか}い ん です 。 でも 、 どこ に {並|なら}べば いい の か …… 。 || The Tally Exchange's lunch break is short. But where am I supposed to stand…
?(${q('front')}) mb_vb_kinji: ます{屋|や} の {前|まえ} に {並|なら}んで います 。 {青|あお}い のれん が {目印|めじるし} です 。 || I'm in line in front of Masuya. The blue curtain's the sign.
?(${q('well')}) mb_vb_kinji: {一列|いちれつ} だ と 、 {自分|じぶん} の {番|ばん} が {分|わ}かって 、 {安心|あんしん} します 。 || With one line, I know when my turn is coming. It's a relief.
?(${q('bridge')}) mb_vb_kinji: {張|は}り{紙|がみ} の {言葉|ことば} は {正|ただ}しく {守|まも}りました 。 …… {場所|ばしょ} が {悪|わる}い だけ です 。 || I followed the notice to the letter. …It's just the place that's wrong.

@scene mb.vb_torakichi
# A boatman waiting for the lock (mb_vb_lock).
!faceplayer
?(${lk('none')}|${lk('unclear')}) mb_vb_torakichi: {閘門|こうもん} が また {開|あ}いた と {聞|き}いて {来|き}た が 、 {舟|ふね} が {口|くち} で {詰|つ}まって 、 {誰|だれ} も {動|うご}けない 。 || I heard the lock was open again, so I came. But the boats are jammed at the mouth and nobody can move.
?(${lk('gate')}) mb_vb_torakichi: {張|は}り{紙|がみ} に 「{閘門|こうもん} の {前|まえ} で 」 と ある 。 だから みんな ここ に いる 。 …… だから {詰|つ}まる ん だ 。 || The notice says "in front of the lock". So everyone's here. …That's why it's jammed.
?(${lk('bridge')}) mb_vb_torakichi: {蔵橋|くらばし} の {手前|てまえ} で {待|ま}つ 。 {出|で}る {舟|ふね} が {先|さき} に {通|とお}れる から 、 {早|はや}く {回|まわ}る ん だ 。 || We wait this side of the Storehouse Bridge. Boats coming out get through first, so it all moves faster.
?(${lk('bank')}) mb_vb_torakichi: {岸|きし} に {寄|よ}せて {一列|いちれつ} だ 。 {真|ま}ん{中|なか} が {空|あ}いて いれば 、 {出|で}る {舟|ふね} も {楽|らく} だ 。 || Pulled in to the bank, single file. With the middle open, boats coming out have it easy.

@scene mb.vb_magobe
!faceplayer
?(${lk('none')}|${lk('unclear')}|${lk('gate')}) mb_vb_magobe: {儂|わし} が {先|さき} だ 。 トラキチ は 、 {自分|じぶん} が {先|さき} だ と {言|い}う 。 …… マツ さん の {戸|と} を {叩|たた}く しか ない か 。 || I was here first. Torakichi says otherwise. …Nothing for it but to knock on Matsu's door.
?(${lk('bridge')}|${lk('bank')}) mb_vb_magobe: {待|ま}つ {場所|ばしょ} が {決|き}まって いる と 、 {喧嘩|けんか} に ならない 。 {紙|かみ} {一枚|いちまい} で 、 {大|たい}した もん だ 。 || When everyone knows where to wait, nobody quarrels. Quite something, for one sheet of paper.

@scene yn.vb_ofumi
# A guest of the Lower House just out of the bath (yn_vb_bath).
!faceplayer
?(${bt('none')}|${bt('unclear')}|${bt('rinse')}|${bt('curtain')}) yn_vb_ofumi: {露天風呂|ろてんぶろ} 、 いい お{湯|ゆ} でした よ 。 …… あら 、 {暖簾|のれん} の {前|まえ} で {話|はな}し{込|こ}んで しまって 。 ごめんなさい ね 。 || The open-air bath was lovely. …Oh, we've got to chatting right in front of the curtain. Sorry.
?(${bt('desk')}) yn_vb_ofumi: {手拭|てぬぐ}い は {帳場|ちょうば} に {返|かえ}す の ね 。 {貼|は}り{紙|がみ} が あって 、 {助|たす}かる わ 。 || So towels go back to the desk. The notice is a help.
?(${bt('hearth')}) yn_vb_ofumi: {囲炉裏|いろり} の そば で 、 {湯上|ゆあ}がり の お{茶|ちゃ} 。 {夜|よる} {遅|おそ}い から 、 {小|ちい}さな {声|こえ} で ね 。 || Tea by the hearth after the bath. It's late, so we keep our voices down.

@scene yn.vb_kamekichi
!faceplayer
?(${bt('none')}|${bt('unclear')}|${bt('rinse')}|${bt('curtain')}) yn_vb_kamekichi: {湯|ゆ} から {出|で}る と 、 つい ここ で {立|た}ち{話|ばな}し を して しまう 。 {後|うし}ろ の {人|ひと} が {入|はい}れない な 。 || Out of the bath, I always end up standing here talking. The people behind can't get in.
?(${bt('desk')}) yn_vb_kamekichi: {帳場|ちょうば} に {並|なら}んで {手拭|てぬぐ}い を {返|かえ}す 。 タヘエ さん が 「{次|つぎ} ！」 と {大|おお}きな {声|こえ} で {言|い}う の が 、 また {楽|たの}しい 。 || Queue at the desk and hand your towel back. And Tahei shouting "Next!" is half the fun.
?(${bt('hearth')}) yn_vb_kamekichi: {火|ひ} の そば で {静|しず}か に {温|あたた}まる 。 {湯|ゆ} の {後|あと} は 、 これ が {一番|いちばん} だ 。 || Warming up quietly by the fire. After the bath, there's nothing better.

@scene yn.vb_tatsuzo
!faceplayer
?(${bt('none')}|${bt('unclear')}|${bt('curtain')}) yn_vb_tatsuzo: {体|からだ} から {湯気|ゆげ} が {出|で}て いる うち は 、 {寒|さむ}く ない 。 だから 、 ここ で いい か と {思|おも}って 。 || While I'm still steaming, I don't feel the cold. So I thought here would do.
?(${bt('rinse')}) yn_vb_tatsuzo: {入|はい}る {前|まえ} に {流|なが}す の は 、 もちろん です よ 。 でも 、 {出|で}た {後|あと} の こと は {書|か}いて ない ね 。 || Rinsing before you get in? Of course. But it says nothing about after you come out.
?(${bt('desk')}) yn_vb_tatsuzo: {濡|ぬ}れた {手拭|てぬぐ}い を {返|かえ}したら 、 {乾|かわ}いた の を くれました 。 いい {宿|やど} です 。 || I handed back my wet towel and got a dry one. A good inn.
?(${bt('hearth')}) yn_vb_tatsuzo: {暖簾|のれん} の {前|まえ} より 、 {囲炉裏|いろり} の そば の {方|ほう} が {暖|あたた}かい 。 {当|あ}たり{前|まえ} です ね 。 || It's warmer by the hearth than in front of the curtain. Of course it is.

@scene mp.vb_chosuke
# A regular reader of the press (W10): where the page now out has brought him.
!faceplayer
?(printed.n_festival) mp_vb_chosuke: {川開|かわびら}き の {知|し}らせ を {読|よ}んで 、 {朝|あさ} から {場所|ばしょ} を {取|と}って いる ん だ 。 {花火|はなび} は 、 {一番|いちばん} {前|まえ} で {見|み}たい から ね 。 || I read the notice for the Opening, so I've been holding a spot since morning. I want to see the fireworks from the very front.
?(printed.n_play) mp_vb_chosuke: {新|あたら}しい {芝居|しばい} の {刷|す}り{物|もの} を {見|み}た よ 。 {木戸|きど} が {開|あ}く まで 、 ここ で {待|ま}つ 。 || Saw the print about the new play. I'll wait here till the doors open.
?(printed.n_soba) mp_vb_chosuke: {新|あたら}しい {蕎麦屋|そばや} は どこ だい ？ {見|み}つからない から 、 まさ{屋|や} で {食|た}べて いく よ 。 || Where's this new soba shop? Can't find it, so I'll eat at Masaya's.

@scene mp.vb_ohatsu
!faceplayer
?(printed.n_festival) mp_vb_ohatsu: ござ を {敷|し}いて おけば 、 {夜|よる} まで {誰|だれ} も {座|すわ}らない の 。 {場所|ばしょ} {取|と}り は 、 {祭|まつ}り の {楽|たの}しみ の {一|ひと}つ よ 。 || Lay a mat down and nobody takes the spot till evening. Claiming spots is half the fun of a festival.
?(printed.n_play) mp_vb_ohatsu: {芝居|しばい} が {始|はじ}まる って 、 {刷|す}り{物|もの} に {書|か}いて あった の 。 {一番|いちばん} {乗|の}り は 、 あの {人|ひと} に {取|と}られちゃった けど 。 || The print said a play was opening. That fellow beat me to the front of the line, though.
?(printed.n_soba) mp_vb_ohatsu: {長堀|ながほり} の {岸|きし} の {新|あたら}しい {蕎麦屋|そばや} …… ます{屋|や} さん の こと かしら 。 まあ 、 おいしければ どこ でも いい わ 。 || A new soba shop on the Long Canal… does it mean Masuya? Well, anywhere's fine if it's good.

@scene mp.vb_rokuro
!faceplayer
?(printed.n_festival) mp_vb_rokuro: {刷|す}り{物|もの} に 、 {長堀|ながほり} の {岸|きし} で {花火|はなび} って あった から 。 {友達|ともだち} の {分|ぶん} も 、 ござ で {取|と}って ある 。 || The print said fireworks on the Long Canal's bank. I've saved a mat's worth for my friends, too.
?(printed.n_play) mp_vb_rokuro: {芝居小屋|しばいごや} の {前|まえ} に {並|なら}ぶ の は 、 {初|はじ}めて です 。 {刷|す}り{物|もの} を {読|よ}まなかったら 、 {来|こ}なかった な 。 || First time I've queued at the playhouse. If I hadn't read the print, I wouldn't have come.

@scene mp.vb_ginta
# A child who read the lost-cat notice and brought a cat to the press's board.
!faceplayer
mp_vb_ginta: {刷|す}り{場|ば} の {貼|は}り{紙|がみ} の {猫|ねこ} 、 この {子|こ} でしょ ？ {墨橋|すみばし} の {下|した} に いた よ ！ || The cat on the press's notice — it's this one, isn't it? It was under the Ink Bridge!
narr: {三毛猫|みけねこ} が 、 {大|おお}きな あくび を した 。 || The calico cat gives an enormous yawn.
mp_vb_ginta: {飼|か}い{主|ぬし} が {来|く}る まで 、 ここ で {待|ま}って いる 。 {三毛|みけ} だ から 、 ミケ って {呼|よ}んで いる の 。 || I'll wait here till the owner comes. It's three colours, so I'm calling it Mike.

@scene mp.vb_mike
narr: {白|しろ} と {茶|ちゃ} と {黒|くろ} の {三毛猫|みけねこ} 。 {貼|は}り{紙|がみ} の {下|した} で {丸|まる}く なって 、 {目|め} を {細|ほそ}めて いる 。 || A calico cat, white, brown and black. It has curled up under the notice board, eyes half shut.
`, 'zzz_verbs/10_prod_a');
})(RB.content);
