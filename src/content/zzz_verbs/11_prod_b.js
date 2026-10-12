/* Exploration actions in the journey, set B (expansion P05; docs/future/plan/06_WORLD.md W12–W16; the register in
 * docs/future/work/LW1_ROLLOUT.md, LW-07). Production instances of the templates in src/engine/55b_verbs.js: no
 * `fixture`, each gated on its place's own story being done, each an optional activity beside what the place already
 * has (nothing here changes a story step, and nothing here gives a consumable).
 *
 *   W12 repair   yn_vent_pipe      Steamhollow, the Valve Hall (yn.vents1): a joint on the bath-keepers' pipe hissing
 *                                  steam by the stair; their card and tool bag hang on it (yn_done)
 *                el_bell_care      East Landing: the bell hangs again but hardly swings on the old post's rusted
 *                                  hanger; Genroku's old card and the things for it are in a box at the bell post (el_done)
 *                kr_hall_lamp      the Keepers' Road, the Shuttered Hall (kr.hall): one of its dark stone lanterns,
 *                                  mended and lit by hand from Hisae's box; once it burns, it stays lit (kr_done)
 *   W13 network  mb_under_sluices  the Undercroft Locks, across the Upper Basin, the Channels and the Great Lock
 *                                  (mb.under1–3): the keeper's small sluices; a fourth tablet by the middle gate says
 *                                  what to aim for (both channel basins at half, the shallows below the Great Lock
 *                                  above water); several ways get there (mb1_done). (The Steam Vents' airflow is not
 *                                  here: the network template's words and sheet speak only of water.)
 *   W14 observe  mp_koseri         the Understage, the Trap Room's east bay (mp.under1): the small lift rises without
 *                                  its cue and sinks back; Manbē's note says how it should go (mp_under_done)
 *   W15 route    cr_cloud_ox       the Cloudroad, the Ledge (cr.leg4): a Cloud Ox lies across the gorge road, and one
 *                                  of Genji's pack horses waits at the gorge's mouth (the ledge is no road for horses);
 *                                  light sends the ox into the cliff's shadow, the horse bell sends it off as fog (cr_done)
 *                ko_leafling       Kotonoha, the Lower Terraces: a Leafling sits on the keepers' path reading its leaf
 *                                  wrong; a breeze sets it down by the leaf heap, a clear note sends it home (ko_done)
 *   W16 layers   mb_kura_plan      Manybridge, Warehouse Row: Zenzō's old canal plan laid over today's row, after the
 *                                  Lost Contract: why was the door walled up? (three readings fit) (quest mb_lc done)
 *                el_old_plan       East Landing: the Seto family's plan of the landing before the sand: why did it
 *                                  silt up? (three readings fit) (el_done)
 *
 * People: none are placed (every action is worked through its prop); the creatures are the routes' own (vbf_*).
 * Quiet: every prop stands clear of the maps' patrolling creatures' rounds, and creatures keep still while you stand
 * at one (src/engine/50_world.js atMechanism).
 *
 * Two things are not plain additions, and both are here on purpose:
 *  - the Shuttered Hall's lantern at 23,16 (src/content/kr/10_maps.js) is the lamp the repair restores: it stands
 *    while the job is undone and a lit one stands in its place after (only if it is still there, unconditioned);
 *  - this folder (src/content/zzz_verbs/) loads after every region's, so the maps it places on are all there. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const V = RB.verbs;
  const T = (en, jp) => ({ en, jp });

  function whenMaps(ids, fn) { for (const id of ids) if (!C.maps[id]) throw new Error('verbs: no map ' + id); fn(); }

  RB.lex.add(RB.lex.parseTable(`
しゅうしゅう|しゅうしゅう|adv|A|with a hiss (steam escaping)
真水|まみず|n|A|fresh water (not salt)
油皿|あぶらざら|n|A|an oil dish (the dish a lamp's wick burns in)
刷毛|はけ|n|A|a flat brush
小ぜり|こぜり|n|A|a small trap lift (raises one actor through the stage floor)
カム|カム|n|A|a cam (a shaped wheel on a turning shaft that lifts or trips a part of a machine)
馬方|うまかた|n|A|a pack-horse driver
呼び鈴|よびりん|n|A|a bell rung to call someone
梁|はり|n|A|a beam (the heavy timber over a door or across a roof)
波除け|なみよけ|n|A|a breakwater (a wall built out into the sea against the waves)
杭|くい|n|A|a stake, a post driven into the ground
ばね|ばね|n|A|a spring (a coil of metal that pushes back)
スパナ|スパナ|n|A|a spanner, a wrench
延びる|のびる|v1|A|to stretch out, to extend (a road, a wall)
`), 'verbs');

  // ==== W12 · repair jobs ==========================================================================================

  // Steamhollow, the Valve Hall: a hissing joint on the pipe down the wall by the stair (the bath-keepers' card and
  // their tool bag hang on it). A wisp of steam shows at the joint until it is mended.
  const VENT_GATE = 'ed>=2&yn_done';
  whenMaps(['yn.vents1'], () => {
    V.define('repair', {
      id: 'yn_vent_pipe', map: 'yn.vents1', region: 'steamhollow', if: VENT_GATE, x: 10, y: 16, prop: 'fw_ventpipe',
      name: T('A pipe that hisses', '{湯気|ゆげ} が {漏|も}れる {管|くだ}'),
      inspect: T('Steam hisses from a joint halfway down the pipe. The small valve on it is open, the old hemp wound round the joint has rotted to threads, and the clamp over it hangs loose.',
        '{管|くだ} の {継|つ}ぎ{目|め} から 、 {湯気|ゆげ} が しゅうしゅう と {漏|も}れて いる 。 {小|ちい}さな {弁|べん} は {開|あ}いた まま だ 。 {継|つ}ぎ{目|め} に {巻|ま}いた {古|ふる}い {麻|あさ} は ぼろぼろ で 、 {留|と}め{金|がね} も {緩|ゆる}んで いる 。'),
      parts: { valve: T('small valve', '{小|ちい}さな {弁|べん}'), joint: T('joint', '{継|つ}ぎ{目|め}'), clamp: T('clamp', '{留|と}め{金|がね}') },
      read: [
        T('A bath-keepers\' card is tied to the pipe. It says:', '{管|くだ} に 、 {湯守|ゆもり} の {札|ふだ} が {結|むす}んで ある 。'),
        T('1. Close the small valve with the handle.', '{一|いち} 、 {取|と}っ{手|て} で {小|ちい}さな {弁|べん} を {閉|し}める 。'),
        T('2. Wind new hemp round the joint.', '{二|に} 、 {継|つ}ぎ{目|め} に {新|あたら}しい {麻|あさ} を {巻|ま}く 。'),
        T('3. Tighten the clamp with the spanner.', '{三|さん} 、 スパナ で {留|と}め{金|がね} を {締|し}める 。'),
      ],
      tools: [
        { id: 'handle', jp: '{取|と}っ{手|て}', en: 'valve handle' },
        { id: 'hemp', jp: '{麻|あさ} の {紐|ひも}', en: 'hemp cord' },
        { id: 'spanner', jp: 'スパナ', en: 'spanner' },
      ],
      steps: [
        { part: 'valve', tool: 'handle', done: T('You fit the handle and close the small valve. The hissing stops.', '{取|と}っ{手|て} を {差|さ}して 、 {小|ちい}さな {弁|べん} を {閉|し}めた 。 {湯気|ゆげ} の {音|おと} が {静|しず}か に なった 。') },
        { part: 'joint', tool: 'hemp', done: T('You pick out the rotten hemp and wind the new cord tightly round the joint.', '{古|ふる}い {麻|あさ} を {取|と}って 、 {新|あたら}しい {紐|ひも} を {継|つ}ぎ{目|め} に きつく {巻|ま}いた 。') },
        { part: 'clamp', tool: 'spanner', done: T('You tighten the clamp down over the hemp, a little at a time.', '{麻|あさ} の {上|うえ} から 、 スパナ で {留|と}め{金|がね} を {少|すこ}し ずつ {締|し}めた 。') },
      ],
      ran: T('You open the small valve again. The steam runs up the pipe towards the baths, and the joint holds: not a hiss.',
        '{小|ちい}さな {弁|べん} を また {開|あ}ける 。 {湯気|ゆげ} は {管|くだ} を {上|のぼ}って 、 {湯|ゆ} の {方|ほう} へ {流|なが}れて いく 。 {継|つ}ぎ{目|め} から は 、 もう {何|なに} も {漏|も}れない 。'),
    });
    C.maps['yn.vents1'].props.push({ p: 'yn_steam', x: 11, y: 16, if: VENT_GATE + '&!puzzle.yn_vent_pipe=done' });
  });

  // East Landing: the landing's bell hangs again, but the old post's hanger is rusted stiff. Genroku's card was kept
  // with the bell all those years; the things for the job are in a box at the bell post.
  V.define('repair', {
    id: 'el_bell_care', map: 'el.landing', region: 'saltglass', if: 'ed>=2&el_done', x: 19, y: 9, prop: 'chest',
    name: T('The landing bell\'s stiff hanger', '{渡|わた}し{場|ば} の {鐘|かね} の {固|かた}い {金具|かなぐ}'),
    inspect: T('The bell rings, but it hardly swings: the iron hanger on the old post is stiff with thirty years of rust, and the old cord Genroku kept with it is close to breaking. Spray from the inlet has already dried white on its rim.',
      '{鐘|かね} は {鳴|な}る が 、 ほとんど {揺|ゆ}れない 。 {古|ふる}い {柱|はしら} の {鉄|てつ} の {金具|かなぐ} は 、 {三十年|さんじゅうねん} の {錆|さび} で {固|かた}い 。 {一緒|いっしょ} に {仕舞|しま}って あった {古|ふる}い {紐|ひも} も 、 {切|き}れ そう だ 。 {縁|ふち} に は もう 、 {入|い}り{江|え} の {塩|しお} が {白|しろ}く {付|つ}いて いる 。'),
    parts: { rim: T('rim', '{鐘|かね} の {縁|ふち}'), hanger: T('hanger', '{金具|かなぐ}'), cord: T('cord', '{紐|ひも}') },
    read: [
      T('A card in Genroku\'s small, cramped hand, kept with the bell for thirty years:', 'ゲンロク の {小|ちい}さな {字|じ} の {札|ふだ} 。 {三十年|さんじゅうねん} 、 {鐘|かね} と {一緒|いっしょ} に {仕舞|しま}って あった 。'),
      T('1. Wash the salt off the rim with fresh water.', '{一|いち} 、 {真水|まみず} で {縁|ふち} の {塩|しお} を {洗|あら}う 。'),
      T('2. Oil the hanger.', '{二|に} 、 {金具|かなぐ} に {油|あぶら} を さす 。'),
      T('3. Change the cord for a new one.', '{三|さん} 、 {紐|ひも} を {新|あたら}しい の に {替|か}える 。'),
    ],
    tools: [
      { id: 'water', jp: '{真水|まみず} の {桶|おけ}', en: 'bucket of fresh water' },
      { id: 'oil', jp: '{油|あぶら}', en: 'oil' },
      { id: 'cord', jp: '{新|あたら}しい {紐|ひも}', en: 'new cord' },
    ],
    steps: [
      { part: 'rim', tool: 'water', done: T('You wash the rim with fresh water. The white crust of salt runs off.', '{真水|まみず} で {縁|ふち} を {洗|あら}った 。 {白|しろ}い {塩|しお} が {流|なが}れ{落|お}ちた 。') },
      { part: 'hanger', tool: 'oil', done: T('You oil the hanger and work it back and forth until the bell swings freely.', '{金具|かなぐ} に {油|あぶら} を さして 、 {何度|なんど} も {動|うご}かした 。 {鐘|かね} が {軽|かる}く {揺|ゆ}れる よう に なった 。') },
      { part: 'cord', tool: 'cord', done: T('You take off the worn cord and tie on the new one.', '{古|ふる}い {紐|ひも} を {外|はず}して 、 {新|あたら}しい {紐|ひも} を {結|むす}んだ 。') },
    ],
    ran: T('You pull the new cord. The bell swings freely now, and its clear note rings across the inlet and carries round the headland towards the harbour.',
      '{新|あたら}しい {紐|ひも} を {引|ひ}く 。 {鐘|かね} は {大|おお}きく {揺|ゆ}れて 、 {澄|す}んだ {音|おと} が {入|い}り{江|え} に {響|ひび}く 。 {音|おと} は {岬|みさき} の {向|む}こう の {港|みなと} の {方|ほう} へ {届|とど}いて いった 。'),
  });

  // The Keepers' Road, the Shuttered Hall: the dark stone lantern at 23,16, mended by hand from Hisae's box beside it.
  const HALL_GATE = 'ed>=2&kr_done';
  V.define('repair', {
    id: 'kr_hall_lamp', map: 'kr.hall', region: 'keepers', if: HALL_GATE, x: 24, y: 16, prop: 'chest',
    name: T('A dark stone lantern', '{灯|ひ} の {消|き}えた {灯籠|とうろう}'),
    inspect: T('The lantern\'s light box is full of old ash, the paper of its screen is torn, and the oil dish inside is dry.',
      '{火袋|ひぶくろ} の {中|なか} は {古|ふる}い {灰|はい} で いっぱい だ 。 {障子|しょうじ} の {紙|かみ} は {破|やぶ}れて いて 、 {油皿|あぶらざら} は {乾|かわ}いて いる 。'),
    parts: { box: T('light box', '{火袋|ひぶくろ}'), screen: T('paper screen', '{障子|しょうじ}'), dish: T('oil dish', '{油皿|あぶらざら}') },
    read: [
      T('A card in Hisae\'s hand lies in the box: how the keepers mend a lantern.', '{箱|はこ} の {中|なか} に 、 ヒサエ の {字|じ} の {札|ふだ} が ある 。 {灯守|ひもり} の {灯籠|とうろう} の {直|なお}し{方|かた} だ 。'),
      T('1. Brush the old ash out of the light box.', '{一|いち} 、 {刷毛|はけ} で {火袋|ひぶくろ} の {灰|はい} を {払|はら}う 。'),
      T('2. Paste new paper on the screen.', '{二|に} 、 {障子|しょうじ} に {新|あたら}しい {紙|かみ} を {貼|は}る 。'),
      T('3. Pour rapeseed oil into the dish and lay a new wick in it.', '{三|さん} 、 {油皿|あぶらざら} に {菜種|なたね} の {油|あぶら} を {入|い}れて 、 {新|あたら}しい {灯心|とうしん} を {置|お}く 。'),
    ],
    tools: [
      { id: 'brush', jp: '{刷毛|はけ}', en: 'brush' },
      { id: 'paper', jp: '{紙|かみ} と {糊|のり}', en: 'paper and paste' },
      { id: 'oil', jp: '{油|あぶら} と {灯心|とうしん}', en: 'oil and a wick' },
    ],
    steps: [
      { part: 'box', tool: 'brush', done: T('You brush the ash out of the light box. The stone inside is clean and grey again.', '{刷毛|はけ} で {火袋|ひぶくろ} の {灰|はい} を {払|はら}った 。 {中|なか} の {石|いし} が きれい に なった 。') },
      { part: 'screen', tool: 'paper', done: T('You paste new paper over the torn screen and smooth it flat.', '{破|やぶ}れた {障子|しょうじ} に {新|あたら}しい {紙|かみ} を {貼|は}って 、 {平|たい}ら に {伸|の}ばした 。') },
      { part: 'dish', tool: 'oil', done: T('You pour rapeseed oil into the dish and lay a new wick in it.', '{油皿|あぶらざら} に {菜種|なたね} の {油|あぶら} を {入|い}れて 、 {新|あたら}しい {灯心|とうしん} を {置|お}いた 。') },
    ],
    ran: T('You light the wick. Warm light shows through the new paper, and the forecourt of the hall is a little less dark.',
      '{灯心|とうしん} に {火|ひ} を つける 。 {新|あたら}しい {紙|かみ} の {向|む}こう に 、 {暖|あたた}かい {光|ひかり} が {見|み}えた 。 {館|やかた} の {前|まえ} が 、 {少|すこ}し {明|あか}るく なった 。'),
  });
  {
    const hall = C.maps['kr.hall'];
    const dark = hall && (hall.props || []).find((p) => p.p === 'kr_toro' && p.x === 23 && p.y === 16 && !p.if);
    if (dark) {
      dark.if = '!puzzle.kr_hall_lamp=done';
      hall.props.push({ p: 'kr_toro', x: 23, y: 16, o: { lit: true }, if: 'puzzle.kr_hall_lamp=done', scene: 'kr.vb_hall_lamp' });
    }
  }

  // ==== W13 · connected inkweaving ===================================================================================

  // The Undercroft Locks: the keeper's small sluices, beside the great gates the story worked. The Upper Basin is fed
  // from the city's canals (a source); the outflow under the Great Lock runs on to the oldest canal (a drain). The
  // fourth tablet (mb.vb_tablet4, by the middle gate's wheel) asks for both channel basins at half with the shallows below the
  // Great Lock above water. Two routes among others: fill both basins from above, shut the Upper Basin off and let
  // the Great Lock's chamber take a third, then drain the chamber alone; or level a full basin with an empty one,
  // refill the first from above, and level them again.
  const UNDER_GATE = 'ed>=2&mb1_done';
  V.define('network', {
    id: 'mb_under_sluices', region: 'manybridge', if: UNDER_GATE, medium: 'water', levels: 3,
    name: T('The keeper\'s small sluices', '{番人|ばんにん} の {小|ちい}さな {水門|すいもん}'),
    basins: {
      upper: { map: 'mb.under1', x: 16, y: 11, jp: '{上|うえ} の {池|いけ}', en: 'Upper Basin', level: 3 },
      west: { map: 'mb.under2', x: 11, y: 11, jp: '{西|にし} の {池|いけ}', en: 'west basin', level: 0 },
      east: { map: 'mb.under2', x: 25, y: 11, jp: '{東|ひがし} の {池|いけ}', en: 'east basin', level: 0 },
      lock: { map: 'mb.under3', x: 14, y: 10, jp: '{大閘門|だいこうもん} の {中|なか}', en: 'Great Lock\'s chamber', level: 0 },
      out: { map: 'mb.under3', x: 22, y: 16, jp: '{古|ふる}い {運河|うんが} へ の {出口|でぐち}', en: 'outflow to the oldest canal', level: 0 },
    },
    gates: {
      ga: { between: ['upper', 'west'], map: 'mb.under1', x: 12, y: 17, jp: '{上|うえ} の {池|いけ} から {西|にし} の {池|いけ} へ の {水門|すいもん}', en: 'sluice from the Upper Basin to the west basin', open: false },
      gb: { between: ['west', 'east'], map: 'mb.under2', x: 20, y: 5, jp: '{西|にし} と {東|ひがし} の {池|いけ} の {間|あいだ} の {水門|すいもん}', en: 'sluice between the west and east basins', open: false },
      gc: { between: ['east', 'lock'], map: 'mb.under3', x: 12, y: 2, jp: '{東|ひがし} の {池|いけ} から {大閘門|だいこうもん} へ の {水門|すいもん}', en: 'sluice from the east basin to the Great Lock', open: false },
      gd: { between: ['lock', 'out'], map: 'mb.under3', x: 16, y: 2, jp: '{大閘門|だいこうもん} から {古|ふる}い {運河|うんが} へ の {水門|すいもん}', en: 'sluice from the Great Lock to the oldest canal', open: false },
    },
    sources: ['upper'], drains: ['out'],
    required: [{
      id: 'shallows', basin: 'lock', max: 1, map: 'mb.under3', tiles: [[13, 16], [14, 16], [15, 16]], prop: 'lf_flood',
      jp: '{大閘門|だいこうもん} の {下|した} の {浅瀬|あさせ}', en: 'the shallows below the Great Lock',
      look: T('The shallows below the Great Lock are under deep water. Nobody can wade along here now.', '{大閘門|だいこうもん} の {下|した} の {浅瀬|あさせ} が 、 {深|ふか}い {水|みず} の {下|した} だ 。 {今|いま} は {通|とお}れない 。'),
    }],
    goal: { west: 2, east: 2, lock: [0, 1] },
  });
  C.maps['mb.under2'].props.push({ p: 'sign', x: 17, y: 5, if: UNDER_GATE, scene: 'mb.vb_tablet4' });

  // ==== W14 · observation first ======================================================================================

  // The Understage, the Trap Room's east bay: the small lift. As it is, it rises with no cue and sinks back again; the
  // bell's cord has come off its cam, and the catch's spring is too weak to hold. Manbē's note (mp.vb_koseri_note) says
  // how it should go. Adding a second weight only makes it slam up.
  const STAGE_GATE = 'ed>=2&mp_under_done';
  V.define('observe', {
    id: 'mp_koseri', map: 'mp.under1', region: 'manybridge', if: STAGE_GATE, x: 24, y: 8, prop: 'mp_lift', beat: 1100,
    name: T('The small lift in the east bay', '{東|ひがし} の {奥|おく} の {小|こ}ぜり'),
    parts: [
      { key: 'bell', jp: '{合図|あいず} の {鈴|すず}', en: 'cue bell', states: { quiet: T('quiet', '{静|しず}か'), ring: T('ringing', '{鳴|な}って いる') } },
      { key: 'weight', jp: '{錘|おもり}', en: 'counterweight', states: { up: T('hanging high', '{上|うえ}'), down: T('dropped', '{下|した}') } },
      { key: 'lift', jp: '{小|こ}ぜり', en: 'small lift', states: {
        down: T('down', '{下|した}'), rising: T('rising', '{上|あ}がって いる'), up: T('up, level with the stage', '{舞台|ぶたい} と {同|おな}じ {高|たか}さ'),
        sinking: T('sinking back', '{沈|しず}んで いる'), jolt: T('slamming up and shaking', '{跳|は}ね{上|あ}がって {揺|ゆ}れて いる') } },
      { key: 'catch', jp: '{留|と}め{金|がね}', en: 'catch', states: { open: T('open', '{開|あ}いて いる'), shut: T('holding', '{掛|か}かって いる') } },
    ],
    phases: {
      wait: { jp: '{小|こ}ぜり は {下|した} で {待|ま}つ', en: 'the lift waits below', parts: { bell: 'quiet', weight: 'up', lift: 'down', catch: 'open' } },
      cue: { jp: '{合図|あいず} の {鈴|すず} が {鳴|な}る', en: 'the cue bell rings', parts: { bell: 'ring', weight: 'up', lift: 'down', catch: 'open' } },
      rise: { jp: '{錘|おもり} が {下|お}りて 、 {小|こ}ぜり が {上|あ}がる', en: 'the weight drops and the lift rises', parts: { bell: 'quiet', weight: 'down', lift: 'rising', catch: 'open' } },
      hold: { jp: '{留|と}め{金|がね} が {掛|か}かる', en: 'the catch holds the lift', parts: { bell: 'quiet', weight: 'down', lift: 'up', catch: 'shut' } },
      slip: { jp: '{小|こ}ぜり が {沈|しず}む', en: 'the lift sinks back', parts: { bell: 'quiet', weight: 'up', lift: 'sinking', catch: 'open' } },
      bang: { jp: '{小|こ}ぜり が {跳|は}ね{上|あ}がる', en: 'the lift slams up', parts: { bell: 'quiet', weight: 'down', lift: 'jolt', catch: 'open' } },
    },
    base: ['wait', 'rise', 'slip'],
    adjustments: [
      { id: 'cord', op: 'insert', a: 'cue', b: 'wait', jp: '{鈴|すず} の {紐|ひも} を カム に {掛|か}け{直|なお}す', en: 'put the bell\'s cord back on its cam' },
      { id: 'spring', op: 'replace', a: 'slip', b: 'hold', jp: '{留|と}め{金|がね} に {新|あたら}しい ばね を {付|つ}ける', en: 'fit a new spring to the catch' },
      { id: 'weight', op: 'replace', a: 'rise', b: 'bang', jp: '{錘|おもり} を もう {一|ひと}つ {足|た}す', en: 'add a second weight' },
    ],
    goal: ['wait', 'cue', 'rise', 'hold'],
    clues: [
      { id: 'cord_off', phase: 'wait', jp: '{鈴|すず} の {紐|ひも} が カム から {外|はず}れて 、 {垂|た}れて いる 。', en: 'The bell\'s cord has come off its cam and hangs loose.' },
      { id: 'no_cue', phase: 'rise', jp: '{鈴|すず} が {鳴|な}らない まま 、 {小|こ}ぜり が {上|あ}がって いく 。 {速|はや}さ は ちょうど いい 。', en: 'The lift rises without the bell ever ringing. Its speed is just right.' },
      { id: 'weak', phase: 'slip', jp: '{留|と}め{金|がね} の ばね が {弱|よわ}くて 、 {掛|か}かる {前|まえ} に {小|こ}ぜり が {沈|しず}む 。', en: 'The catch\'s spring is weak: the lift sinks before the catch can hold it.' },
    ],
  });
  C.maps['mp.under1'].props.push({ p: 'sign', x: 26, y: 7, if: STAGE_GATE, scene: 'mp.vb_koseri_note' });

  // ==== W15 · creature routing =======================================================================================

  // The Cloudroad, the Ledge: a Cloud Ox lies across the road in the narrow of the gorge. One of Genji's pack horses
  // waits at the gorge's mouth with its load until the road is clear (the ledge is no road for horses).
  const CR_GATE = 'ed>=2&cr_done';
  V.define('route', {
    id: 'cr_cloud_ox', map: 'cr.leg4', region: 'cloudroad', if: CR_GATE,
    creature: { enemy: 'cr.ox', at: { block: [17, 11], shade: [23, 18], away: null }, say: {
      block: T('A Cloud Ox lies across the road in the narrow of the gorge, chewing on the fog. Genji\'s pack horse cannot get past it.', '{谷|たに} の {狭|せま}い {所|ところ} で 、 {雲牛|くもうし} が {道|みち} に {寝|ね}そべって 、 {霧|きり} を {噛|か}んで いる 。 ゲンジ の {馬|うま} は {通|とお}れない 。'),
      shade: T('The Cloud Ox lies in the cliff\'s shadow at the mouth of the gorge, off the road. The way through is clear.', '{雲牛|くもうし} は {谷|たに} の {出口|でぐち} の {崖|がけ} の {陰|かげ} に いる 。 {道|みち} は {通|とお}れる 。'),
      away: T('The Cloud Ox has wandered off over the gorge and become fog again.', '{雲牛|くもうし} は {谷|たに} の {上|うえ} へ {行|い}って 、 また {霧|きり} に {戻|もど}った 。'),
    } },
    start: 'block', goal: ['shade', 'away'],
    means: [
      { id: 'lamp', family: 'light', from: ['block'], to: 'shade', obj: { key: 'lamp', x: 12, y: 10, prop: 'lantern', jp: '{馬方|うまかた} の {灯|あか}り', en: 'the horse drivers\' lamp' },
        say: T('The lamp flares up. Where the light falls on it, the cloud of the ox grows thin; it heaves itself up, unhurried, and lies down again in the shadow of the cliff, off the road.',
          '{灯|あか}り が {明|あか}るく なった 。 {光|ひかり} が {当|あ}たる と 、 {牛|うし} の {雲|くも} が {薄|うす}く なる 。 {牛|うし} は のっそり と {立|た}ち{上|あ}がって 、 {崖|がけ} の {陰|かげ} で また {寝|ね}そべった 。'), fx: 'light' },
      { id: 'bell', family: 'bell', from: ['block', 'shade'], to: 'away', obj: { key: 'bell', x: 12, y: 13, prop: 'cs_bellpost', jp: '{馬|うま} の {鈴|すず}', en: 'the horse bell' }, sound: true,
        say: T('The horse bell rings out, clear, again and again. The Cloud Ox lifts its head at every ring, gets up, wanders off the road and out over the gorge, and turns back into fog.',
          '{馬|うま} の {鈴|すず} が 、 {何度|なんど} も {澄|す}んだ {音|おと} で {鳴|な}る 。 {雲牛|くもうし} は {鳴|な}る たび に {頭|あたま} を {上|あ}げ 、 {立|た}ち{上|あ}がって {道|みち} を {外|はず}れた 。 そして {谷|たに} の {上|うえ} で 、 また {霧|きり} に {戻|もど}った 。'), fx: 'ring' },
    ],
  });
  C.maps['cr.leg4'].props.push({ p: 'cr_horse', x: 10, y: 10, if: CR_GATE + '&puzzle.cr_cloud_ox.route=block', scene: 'cr.vb_horse_wait' });

  // Kotonoha, the Lower Terraces: a Leafling sits on the keepers' path on the middle terrace, reading its leaf wrong to
  // everyone who passes. A breeze sets it down by the leaf heap; a clear note, and it reads the leaf right and goes.
  V.define('route', {
    id: 'ko_leafling', map: 'ko.terraces', region: 'kotonoha', if: 'ed>=2&ko_done',
    creature: { enemy: 'ko.leafling', at: { block: [18, 10], aside: [25, 13], away: null }, say: {
      block: T('A Leafling sits in the middle of the keepers\' path, holding up its leaf and reading it out wrong, on purpose, to everyone who comes by.', '{木|こ}の{葉|は}{童|わらし} が {葉守|はもり} の {道|みち} の {真|ま}ん{中|なか} に {座|すわ}って いる 。 {葉|は} を {掲|かか}げて 、 {通|とお}る {人|ひと} に わざと {間違|まちが}えて {読|よ}んで いる 。'),
      aside: T('The Leafling sits beside the heap of leaves at the end of the terrace, reading to the leaves. The path is clear.', '{木|こ}の{葉|は}{童|わらし} は {段|だん} の {端|はし} の {葉|は} の {山|やま} の {横|よこ} で 、 {葉|は} に {向|む}かって {読|よ}んで いる 。 {道|みち} は {通|とお}れる 。'),
      away: T('The Leafling has gone off up the terraces on the wind.', '{木|こ}の{葉|は}{童|わらし} は {風|かぜ} に {乗|の}って 、 {上|うえ} の {段|だん} へ {飛|と}んで いった 。'),
    } },
    start: 'block', goal: ['aside', 'away'],
    means: [
      { id: 'breeze', family: 'wind', from: ['block'], to: 'aside', obj: { key: 'current', x: 20, y: 13, prop: 'ko_current', jp: '{上|のぼ}る {風|かぜ}', en: 'the rising air' },
        say: T('A breeze gathers over the terrace. The Leafling, light as a draught, is lifted off the path, tumbles along, and comes down beside the heap of leaves at the far end.',
          '{段|だん} の {上|うえ} に {風|かぜ} が {集|あつ}まる 。 {軽|かる}い {木|こ}の{葉|は}{童|わらし} は {道|みち} から {持|も}ち{上|あ}げられて 、 ころころ と {転|ころ}がり 、 {端|はし} の {葉|は} の {山|やま} の {横|よこ} に {下|お}りた 。'), fx: 'vane' },
      { id: 'note', family: 'bell', from: ['block', 'aside'], to: 'away', obj: { key: 'bell', x: 16, y: 12, prop: 'sb_bellpost', jp: '{呼|よ}び{鈴|りん}', en: 'the keepers\' calling bell' }, sound: true,
        say: T('A clear note rings out over the terraces. The Leafling turns its leaf towards the sound and, for once, reads it out right: "Kaeru: go home." Then it lets the wind carry it off up the terraces.',
          '{澄|す}んだ {音|おと} が {段|だん} に {響|ひび}く 。 {木|こ}の{葉|は}{童|わらし} は {音|おと} の {方|ほう} に {葉|は} を {向|む}けて 、 {一度|いちど} だけ {正|ただ}しく {読|よ}んだ 。 「{帰|かえ}る」 。 そして 、 {風|かぜ} に {乗|の}って {上|うえ} の {段|だん} へ {飛|と}んで いった 。'), fx: 'ring' },
    ],
  });

  // ==== W16 · layered sites ==========================================================================================

  // Manybridge, Warehouse Row: Zenzō's grandfather's canal plan, spread on a table by his storehouse once the Lost
  // Contract is home. Why was the door walled up? Three readings fit what is there; one does not.
  V.define('layers', {
    id: 'mb_kura_plan', map: 'mb.kura', region: 'manybridge', if: 'ed>=2&quest.mb_lc=done', near: 1,
    title: T('Zenzō\'s old canal plan', 'ゼンゾウ の {古|ふる}い {運河|うんが} の {図|ず}'),
    question: T('Why was the storehouse door walled up?', 'なぜ {蔵|くら} の {戸|と} は {塗|ぬ}り{込|こ}められた の か 。'),
    plan: {
      x: 30, y: 24, prop: 'table', title: T('Warehouse Row, drawn sixty years ago', '{六十年|ろくじゅうねん} {前|まえ} の {蔵|くら} の {並|なら}び'),
      marks: [
        { id: 'landing', x: 37, y: 15, jp: '{荷揚|にあ}げ {場|ば}', en: 'a landing stage', now: 'missing',
          obs: T('Where the plan shows a landing stage, the bank is a straight stone wall. Under the water you can just make out steps going down.', '{図|ず} で は {荷揚|にあ}げ {場|ば} だ が 、 {今|いま} は まっすぐ な {石|いし} の {岸|きし} だ 。 {水|みず} の {下|した} に 、 {下|くだ}って いく {石段|いしだん} が うっすら {見|み}える 。') },
        { id: 'door', x: 37, y: 23, area: { x: 36, y: 23, w: 3, h: 2 }, jp: '{蔵|くら} の {戸|と}', en: 'the storehouse door', now: 'present',
          obs: T('Over the door, two crests are cut into the beam side by side: Zenzō\'s house and Fujiya. The plaster that covered them had been laid on with care.', '{戸|と} の {上|うえ} の {梁|はり} に 、 {紋|もん} が {二|ふた}つ {並|なら}んで {彫|ほ}って ある 。 ゼンゾウ の {家|いえ} と 、 {藤屋|ふじや} の {紋|もん} だ 。 その {上|うえ} の しっくい は 、 {丁寧|ていねい} に {塗|ぬ}って あった 。') },
        { id: 'fujiya', x: 29, y: 6, area: { x: 28, y: 6, w: 3, h: 1 }, jp: '{藤屋|ふじや} の {蔵|くら}', en: 'Fujiya\'s storehouse', now: 'present',
          obs: T('On the plan this is Fujiya\'s storehouse, across the canal from Zenzō\'s. Today it is Heiji\'s, and the crest over its door has been planed away.', '{図|ず} で は 、 {運河|うんが} の {向|む}こう の {藤屋|ふじや} の {蔵|くら} だ 。 {今|いま} は ヘイジ の {蔵|くら} で 、 {戸|と} の {上|うえ} の {紋|もん} は {削|けず}られて いる 。') },
      ],
    },
    hypotheses: [
      { id: 'together', label: T('Both houses walled it up together, to keep the agreement safe until it could be kept again.', '{両家|りょうけ} が {一緒|いっしょ} に {塗|ぬ}り{込|こ}めた 。 また {守|まも}れる {日|ひ} まで 、 {約定書|やくじょうしょ} を {大事|だいじ} に {仕舞|しま}って おく ため に 。'), from: ['door'], correct: true },
      { id: 'landing', label: T('When the landing stage was taken away, a door onto the canal was no use any more, so it was walled up with the agreement inside.', '{荷揚|にあ}げ {場|ば} が なくなって 、 {運河|うんが} {側|がわ} の {戸|と} は {要|い}らなく なった 。 だから {約定書|やくじょうしょ} を {入|い}れた まま {塗|ぬ}り{込|こ}めた 。'), from: ['landing'], correct: true },
      { id: 'sold', label: T('When Fujiya sold its storehouse across the canal, there was no cargo left for the two houses to guard for each other, and the agreement was shut away.', '{藤屋|ふじや} が {向|む}こう の {蔵|くら} を {売|う}って 、 {互|たが}い に {守|まも}る {荷|に} が なくなった 。 それ で {約定書|やくじょうしょ} を {仕舞|しま}った 。'), from: ['fujiya'], correct: true },
      { id: 'hide', label: T('Zenzō\'s grandfather walled it up to hide the agreement from Fujiya.', 'ゼンゾウ の {祖父|そふ} が 、 {藤屋|ふじや} に {隠|かく}す ため に {塗|ぬ}り{込|こ}めた 。'), from: ['door'],
        mismatch: T('Fujiya\'s crest is cut over the door beside that of Zenzō\'s house: it was not hidden from Fujiya.', '{戸|と} の {上|うえ} に は 、 {藤屋|ふじや} の {紋|もん} も {並|なら}んで いる 。 {藤屋|ふじや} に {隠|かく}した の で は ない 。') },
    ],
    sufficient: [['door', 'landing'], ['door', 'fujiya'], ['landing', 'fujiya']],
  });

  // East Landing: the Seto family's plan of the landing from before it closed, pinned on Genroku's shack. Why did the
  // landing silt up? Three readings fit; "it was always shallow" does not.
  V.define('layers', {
    id: 'el_old_plan', map: 'el.landing', region: 'saltglass', if: 'ed>=2&el_done', near: 1,
    title: T('The landing before the sand', '{砂|すな} が {来|く}る {前|まえ} の {渡|わた}し{場|ば}'),
    question: T('Why did the landing silt up?', 'なぜ {渡|わた}し{場|ば} は {砂|すな} で {埋|う}まった の か 。'),
    plan: {
      x: 27, y: 7, prop: 'noticeboard', title: T('The Seto family\'s plan of the landing, from before it closed', '{閉|と}じる {前|まえ} の 、 セト {家|け} の {渡|わた}し{場|ば} の {図|ず}'),
      marks: [
        { id: 'wall', x: 28, y: 12, jp: '{石|いし} の {波除|なみよ}け', en: 'a stone breakwater', now: 'missing',
          obs: T('The plan shows a stone breakwater running out into the sea from here. Today there is only a broken line of stones under the water, and the waves come straight in over it, carrying sand.', '{図|ず} で は 、 ここ から {海|うみ} へ {石|いし} の {波除|なみよ}け が {延|の}びて いる 。 {今|いま} は 、 {崩|くず}れた {石|いし} が {水|みず} の {下|した} に {並|なら}んで いる だけ だ 。 {波|なみ} が その {上|うえ} を {越|こ}えて 、 {砂|すな} を {運|はこ}んで くる 。') },
        { id: 'stakes', x: 15, y: 12, jp: '{水路|すいろ} の {杭|くい}', en: 'the channel\'s stakes', now: 'present',
          obs: T('The plan marks stakes along the edge of a deep channel. They are still here, black and worn down to stumps, and the new channel runs right beside them.', '{図|ず} に は 、 {深|ふか}い {水路|すいろ} の {縁|ふち} に {杭|くい} が {描|か}いて ある 。 {杭|くい} は {今|いま} も ここ に {残|のこ}って いて 、 {黒|くろ}く {短|みじか}く なって いる 。 {新|あたら}しい {水路|すいろ} は 、 その すぐ {横|よこ} を {通|とお}って いる 。') },
        { id: 'workshop', x: 9, y: 7, jp: '{鐘|かね} の {工房|こうぼう}', en: 'the bell workshop', now: 'missing',
          obs: T('Where the plan shows the bell workshop there are flat foundation stones in the grass, and a ring of scorched earth where a furnace stood. A note in small letters on the plan: "The workshop keeps the breakwater."', '{図|ず} で は {鐘|かね} の {工房|こうぼう} の {場所|ばしょ} だ 。 {草|くさ} の {中|なか} に {平|たい}らな {土台|どだい} の {石|いし} と 、 {黒|くろ}く {焦|こ}げた {丸|まる} い {跡|あと} が ある 。 {図|ず} の {隅|すみ} に 、 {小|ちい}さな {字|じ} で 「{波除|なみよ}け の {手入|てい}れ は {工房|こうぼう} が する 」 と {書|か}いて ある 。') },
      ],
    },
    hypotheses: [
      { id: 'wall', label: T('The breakwater fell into the sea, and the waves have carried sand in over it ever since.', '{石|いし} の {波除|なみよ}け が {崩|くず}れて 、 それ から ずっと 、 {波|なみ} が {砂|すな} を {運|はこ}んで {来|き}た 。'), from: ['wall'], correct: true },
      { id: 'nobody', label: T('When the bell workshop moved to the stone quay, nobody was left to keep up the breakwater, and the sand came in.', '{鐘|かね} の {工房|こうぼう} が {石|いし} の {岸壁|がんぺき} へ {移|うつ}って 、 {波除|なみよ}け を {直|なお}す {人|ひと} が いなく なった 。 だから {砂|すな} が {入|はい}って {来|き}た 。'), from: ['workshop'], correct: true },
      { id: 'channel', label: T('Once the boats stopped coming in, nobody dug the channel out any more, and it filled up.', '{船|ふね} が {来|こ}なく なって 、 {水路|すいろ} を {掘|ほ}る {人|ひと} も いなく なった 。 それ で {埋|う}まった 。'), from: ['stakes'], correct: true },
      { id: 'never', label: T('The landing was always shallow: the plan is wrong.', '{渡|わた}し{場|ば} は {最初|さいしょ} から {浅|あさ}かった 。 {図|ず} が {間違|まちが}って いる 。'), from: ['stakes'],
        mismatch: T('The old stakes stand along the edge of a deep channel: boats did come in here once.', '{古|ふる}い {杭|くい} が 、 {深|ふか}い {水路|すいろ} の {縁|ふち} に {並|なら}んで いる 。 {昔|むかし} は {船|ふね} が {入|はい}って {来|き}た の だ 。') },
    ],
    sufficient: [['wall', 'workshop'], ['wall', 'stakes'], ['stakes', 'workshop']],
  });

  // ==== the scenes the props above open ==============================================================================
  RB.script.add(`
@scene mb.vb_tablet4
# The fourth tablet, by the middle gate's wheel in the Channels: what the keeper's small sluices are for.
!gesture pc read
narr: {真|ま}ん{中|なか} の {門|もん} の {車輪|しゃりん} の {横|よこ} に 、 {四|よん} の {石板|せきばん} が ある 。 || Beside the middle gate's wheel there is a fourth tablet.
narr: 「{朝|あさ} の {舟|ふね} が {出|で}る {前|まえ} に 、 {西|にし} と {東|ひがし} の {池|いけ} を 、 {半分|はんぶん} の {高|たか}さ に {揃|そろ}えて おく こと 。 {大閘門|だいこうもん} の {下|した} の {浅瀬|あさせ} は 、 {水|みず} に {沈|しず}めない こと 。」 || "Before the morning boats go out, set the west and east basins level, at half. Do not put the shallows below the Great Lock under water."
narr: {上|うえ} の {池|いけ} 、 この {水路|すいろ} 、 {大閘門|だいこうもん} に 、 {小|ちい}さな {水門|すいもん} が ある らしい 。 || There seem to be small sluices at the Upper Basin, here in the Channels and at the Great Lock.

@scene mp.vb_koseri_note
# Manbē's note on the small lift in the Trap Room's east bay: how it should go.
!gesture pc read
narr: {柱|はしら} に マンベエ の {走|はし}り{書|が}き が {貼|は}って ある 。 || Manbē's scrawl is pinned to the post.
narr: 「{小|こ}ぜり 。 {合図|あいず} の {鈴|すず} が {鳴|な}って から 、 {上|あ}げる 。 {上|あ}がったら 、 {留|と}め{金|がね} で {止|と}める 。 {次|つぎ} の {芝居|しばい} まで に 、 {誰|だれ} か {直|なお}して くれ ！」 || "Small lift. Raise it after the cue bell rings. Once it's up, hold it with the catch. Somebody fix it before the next show!"

@scene cr.vb_horse_wait
# One of Genji's pack horses, waiting at the gorge's mouth while a Cloud Ox lies across the road.
narr: {荷|に} を {背負|せお}った {馬|うま} が 、 {谷|たに} の {入|い}り{口|ぐち} で {止|と}まって いる 。 {耳|みみ} を {後|うし}ろ に {倒|たお}して 、 {先|さき} へ {進|すす}もう と しない 。 || A horse with its load stands at the mouth of the gorge, ears laid back, and will not go on.
narr: {首|くび} の {札|ふだ} に 「{馬返|うまがえ}し 、 ゲンジ」 。 {崖道|がけみち} は {馬|うま} の {道|みち} で は ない 。 {谷|たに} の {道|みち} しか ない のに 、 その {真|ま}ん{中|なか} に {大|おお}きな {白|しろ}い {影|かげ} が {寝|ね}そべって いる 。 || The tag on its neck says "Umagaeshi, Genji". The ledge is no road for horses; the gorge road is the only way, and a great white shape lies across the middle of it.

@scene kr.vb_hall_lamp
# The Shuttered Hall's stone lantern, mended by hand.
narr: {自分|じぶん} で {直|なお}した {灯籠|とうろう} 。 {新|あたら}しい {紙|かみ} の {向|む}こう で 、 {小|ちい}さな {火|ひ} が {揺|ゆ}れて いる 。 || The lantern you mended yourself. Behind the new paper, a small flame flickers.
`, 'zzz_verbs/11_prod_b');
})(RB.content);
