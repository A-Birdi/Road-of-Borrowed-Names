/* The six regional field puzzles (addendum §14.2-14.7) as data for
 * RB.fieldweave (src/engine/55_fieldweave.js). Each definition carries its
 * map anchors, eligibility, initial state and allowed values, what the player
 * can observe, the ordinary actions (run from the objects' inspection scenes
 * in 30_scenes.js), the field weaves by response family, the outcome
 * predicate, the method classes of the equivalent routes, the reset, the
 * reward and its line, persistent support marks, layered hints and the safe
 * arrangements used to repair an invalid saved state. Design notes, every
 * accepted route and every ineffective attempt: docs/addendum/fieldweave.md. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (FW) {
  'use strict';
  const T = (jp, en) => ({ jp, en });

  // ---- F1: A Dry Place for Names (Reedwake, beside the river warehouse) ----------------------------------
  // A hinged screen pinned with the warehouse's name slips swings in the draught
  // off the river. The clamp that would hold it cannot close on a moving edge.
  // Routes: swing the screen shut against its post, then clamp it; or hold it
  // with a Protect ward, then clamp it (the ward is a step, not a countdown: it
  // holds until the clamp does). Same final arrangement either way.
  FW.define({
    id: 'f1', region: 'reedwake', map: 'rw.village',
    title: T('{名札|なふだ} の {乾|かわ}いた {場所|ばしょ}', 'A Dry Place for Names'),
    eligible: null,
    init: { screen: 'swing', held: false, clamp: 'open' },
    values: { screen: ['swing', 'closed'], held: [false, true], clamp: ['open', 'set'] },
    solved: { screen: 'closed', held: false, clamp: 'set' },
    objects: {
      screen: {
        x: 32, y: 22, tall: 1.1, name: T('{札|ふだ} の {衝|つい}{立|たて}', 'the slip screen'),
        look: [
          { done: true, lines: [T('{衝|つい}{立|たて} は {柱|はしら} に {留|と}められて いる 。 {名札|なふだ} は {平|たい}ら に {乾|かわ}いて いて 、 どれ も {読|よ}める 。', 'The screen is clamped fast to its post. The name slips lie flat and dry; every one can be read.')] },
          { if: { held: true }, obs: 'still', jp: '{守|まも}り の {中|なか} で 、 {衝|つい}{立|たて} は {柱|はしら} に {寄|よ}った まま {止|と}まって いる 。 {留|と}め{具|ぐ} は まだ {開|ひら}いて いる 。', en: 'Inside the ward the screen rests still against its post. The clamp is still open.' },
          { if: { screen: 'closed' }, obs: 'still', jp: '{衝|つい}{立|たて} は {柱|はしら} に {寄|よ}せて {閉|し}めて ある 。 {川|かわ} の {風|かぜ} は {脇|わき} を {抜|ぬ}けて いく 。 {留|と}め{具|ぐ} は まだ {開|ひら}いて いる 。', en: 'The screen stands shut against its post; the draught off the river slides past it. The clamp is still open.' },
          { obs: 'draft', lines: [
            T('{葦|あし} の {紙|かみ} を {張|は}った {軽|かる}い {衝|つい}{立|たて} 。 {名札|なふだ} が {何枚|なんまい} も {留|と}めて ある 。', 'A light screen of reed paper on a hinged frame, pinned with name slips.'),
            T('{川|かわ} から {風|かぜ} が {吹|ふ}く たび に 、 {衝|つい}{立|たて} が {開|ひら}いて は {戻|もど}る 。 {札|ふだ} の {字|じ} は {揺|ゆ}れて 、 {読|よ}めない 。 {紙|かみ} {自体|じたい} は {乾|かわ}いて いる 。', 'Each gust off the river swings it open and back; the writing on the slips jerks past too fast to read. The paper itself is dry.'),
          ] },
        ],
      },
      clamp: {
        x: 33, y: 22, tall: 1, name: T('{留|と}め{具|ぐ}', 'the clamp'),
        look: [
          { done: true, jp: '{留|と}め{具|ぐ} が 、 {衝|つい}{立|たて} の {端|はし} を {柱|はしら} に しっかり {押|お}さえて いる 。', en: 'The clamp holds the edge of the screen fast to its post.' },
          { jp: '{木|き} の ねじ{留|ど}め が 、 {柱|はしら} の {釘|くぎ} に {開|ひら}いた まま {掛|か}かって いる 。 {衝|つい}{立|たて} の {端|はし} を {挟|はさ}む ため の もの だ 。', en: 'A wooden screw clamp hangs open on a nail in the post. It is meant to grip the edge of the screen.' },
        ],
      },
    },
    rules: [
      // ordinary actions (inspection menus)
      { act: 'close', obj: 'screen', if: { screen: 'swing', held: false, clamp: 'open' }, set: { screen: 'closed' }, obs: 'still',
        say: T('{風|かぜ} の {切|き}れ{目|め} に {衝|つい}{立|たて} を {押|お}さえ 、 {柱|はしら} に {寄|よ}せて {閉|し}めた 。 {風|かぜ} は {脇|わき} を {抜|ぬ}けて いく 。 {今|いま} は {止|と}まって いる が 、 まだ {何|なに} も {留|と}めて いない 。', 'Between gusts you catch the screen and swing it shut against its post. The draught slides past it now. It is still — but nothing holds it yet.') },
      { act: 'open', obj: 'screen', if: { screen: 'closed', clamp: 'open' }, set: { screen: 'swing' },
        say: T('{手|て} を {放|はな}す と 、 {次|つぎ} の {風|かぜ} で {衝|つい}{立|たて} は また {開|ひら}いた 。', 'You let go, and the next gust swings the screen open again.') },
      { act: 'clamp', obj: 'clamp', if: [{ screen: 'closed', clamp: 'open' }, { held: true, clamp: 'open' }], set: { clamp: 'set' },
        say: T('{衝|つい}{立|たて} が {止|と}まって いる {間|あいだ} に 、 {留|と}め{具|ぐ} で {端|はし} を {挟|はさ}み 、 ねじ を {締|し}めた 。 {札|ふだ} が {平|たい}ら に なり 、 {字|じ} が {読|よ}める 。', 'While the screen is still, you close the clamp on its edge and turn the screw tight. The slips lie flat, and the writing can be read.') },
      { act: 'clamp', obj: 'clamp', if: { clamp: 'open' }, obs: 'swing',
        say: T('{風|かぜ} の たび に {衝|つい}{立|たて} が {柱|はしら} から {離|はな}れる 。 {動|うご}く もの を 、 {留|と}め{具|ぐ} は {挟|はさ}めない 。', 'Each gust swings the screen away from the post. The clamp cannot close on an edge that will not keep still.') },
      // field weaves
      { weave: 'protect', obj: ['screen', 'clamp'], if: { screen: 'swing', held: false, clamp: 'open' }, set: { held: true }, fx: 'hold',
        say: T('{守|まも}り が {立|た}ち 、 {衝|つい}{立|たて} を {柱|はしら} に {押|お}し{戻|もど}して {止|と}めた 。 {守|まも}り が {支|ささ}えて いる {間|あいだ} に 、 {何|なに} か で {留|と}めれば いい 。', 'A ward rises, presses the screen back against its post and holds it there. While the ward holds, something only has to fasten it.') },
      { weave: 'protect', obj: ['screen', 'clamp'], if: { held: true },
        say: T('{守|まも}り は もう {衝|つい}{立|たて} を {支|ささ}えて いる 。', 'The ward is already holding the screen.') },
      { weave: 'protect', obj: ['screen', 'clamp'], if: { screen: 'closed' },
        say: T('{衝|つい}{立|たて} は もう {閉|し}めて あって 、 {動|うご}いて いない 。 {守|まも}る もの が ない 。', 'The screen is already shut and not moving. There is nothing for the ward to hold.') },
      { weave: 'water', obj: 'screen', obs: 'dry',
        say: T('{札|ふだ} は {乾|かわ}いて いる 。 {水|みず} は {油|あぶら} を {引|ひ}いた {枠|わく} で {玉|たま} に なり 、 {字|じ} に {触|ふ}れず に {流|なが}れ{落|お}ちた 。 {濡|ぬ}らす {必要|ひつよう} は ない 。', 'The slips are dry. The water beads on the oiled frame and runs off without touching the writing. Nothing here needs wetting.') },
      { weave: 'water', obj: 'clamp',
        say: T('{水|みず} が {留|と}め{具|ぐ} を {伝|つた}って {落|お}ちた 。 {留|と}め{具|ぐ} は {固|かた}まって いる わけ で は ない 。 {動|うご}く {端|はし} を {挟|はさ}めない だけ だ 。', 'Water runs down the clamp. The clamp isn\'t stuck; it just can\'t close on a moving edge.') },
      { weave: 'light', obj: ['screen', 'clamp'], if: { screen: 'swing', held: false }, obs: 'draft',
        say: T('{光|ひかり} の {中|なか} で よく {見|み}える 。 {川|かわ} から {風|かぜ} が {来|く}る たび に 、 {衝|つい}{立|たて} が {開|ひら}いて は {戻|もど}る 。 {光|ひかり} は {動|うご}き を {見|み}せる が 、 {止|と}め は しない 。', 'In the light you can see it plainly: each gust off the river swings the screen out and back. The light shows the movement; it doesn\'t stop it.') },
      { weave: 'wind', obj: ['screen', 'clamp'], if: { screen: 'swing' },
        say: T('{風|かぜ} が {増|ふ}えて 、 {衝|つい}{立|たて} は もっと {大|おお}きく {揺|ゆ}れた 。', 'More wind only swings the screen harder.') },
      { weave: 'bind', obj: ['screen', 'clamp'], if: { clamp: 'open' },
        say: T('{縄|なわ} の {形|かたち} が {衝|つい}{立|たて} に {絡|から}んで 、 すぐ {外|はず}れた 。 {揺|ゆ}れて いる {間|あいだ} は 、 {結|むす}ぶ {所|ところ} が ない 。', 'The shape of a rope loops the screen and slips off. While it swings there is nothing steady to tie it to.') },
    ],
    complete: { clamp: 'set' },
    solvedSay: T('{衝|つい}{立|たて} は もう しっかり {留|と}めて ある 。 {何|なに} も {足|た}さなくて いい 。', 'The screen is already fastened. It needs nothing more.'),
    // the ward was a step: once the clamp holds, it lets go, and the screen stays shut
    after: { held: false, screen: 'closed' },
    methods: [{ id: 'screened', if: { screen: 'closed' } }, { id: 'warded', if: { held: true } }],
    marks: [{ obj: 'screen', if: { held: true }, mark: 'ward' }],
    reward: {
      keepsake: 'reed_boat',
      say: [T('{衝|つい}{立|たて} の {裏|うら} 、 {軒下|のきした} の {乾|かわ}いた {棚|たな} に 、 {葦|あし} の {紙|かみ} で {折|お}った {小|ちい}さな {舟|ふね} が {並|なら}んで いる 。 {子|こ}ども の {字|じ} で 「 ひとつ どうぞ 」 。', 'Behind the screen, on a dry shelf under the eaves, sits a row of little boats folded from reed paper, and a note in a child\'s hand: "Take one."'),
        T('{一|ひと}つ {手|て} に {取|と}った 。 {乾|かわ}いて いて 、 {軽|かる}い 。', 'You take one. It is dry, and very light.')],
    },
    hints: [
      T('{留|と}め{具|ぐ} が {閉|し}まらない の は なぜ だろう 。 しばらく {衝|つい}{立|たて} を {見|み}て みよう 。', 'Why won\'t the clamp close? Watch the screen for a while.'),
      T('{衝|つい}{立|たて} が {少|すこ}し の {間|あいだ} {止|と}まって いれば いい 。 {風|かぜ} を よける か 、 {何|なに} か で {支|ささ}える か 。', 'The screen only needs to keep still for a moment: keep the draught off it, or hold it some other way.'),
      T('{衝|つい}{立|たて} を {調|しら}べて {柱|はしら} に {閉|し}め 、 {留|と}め{具|ぐ} を {締|し}める 。 または 、 {衝|つい}{立|たて} に 「 まもる 」 を {織|お}って {支|ささ}え 、 {留|と}め{具|ぐ} を {締|し}める 。', 'Look at the screen and swing it shut against its post, then close the clamp. Or weave まもる (protect) on the screen to hold it, then close the clamp.'),
    ],
  });

  // ---- F2: The Signal Float (Saltglass, on the beach past the quay) ------------------------------------
  // The harbour office's demonstration: a cork float with a label sits low in a
  // glass tank; it should rise to the viewing slot and stay there. Water only
  // goes in if the vent lets air out; the float stays at the slot only if its
  // line is held (the drum's catch, or a woven rope); the crank lifts it by the
  // line; a vane fixed to the pulley's axle does the same in the wind.
  FW.define({
    id: 'f2', region: 'saltglass', map: 'sg.harbor',
    title: T('{合図|あいず} の {浮|う}き', 'The Signal Float'),
    eligible: null,
    init: { vent: 'shut', catch: 'off', bound: false, level: 'low', float: 'cradle' },
    values: { vent: ['shut', 'open'], catch: ['off', 'on'], bound: [false, true], level: ['low', 'high'], float: ['cradle', 'stop', 'slot'] },
    solved: { vent: 'open', catch: 'on', bound: false, level: 'high', float: 'slot' },
    objects: {
      diagram: {
        x: 44, y: 24, tall: 0.9, name: T('{図|ず} の {板|いた}', 'the diagram board'),
        look: [{ lines: [
          T('{絵|え} の {描|か}いた {板|いた} 。 {矢印|やじるし} と {形|かたち} で {仕組|しく}み が {示|しめ}して ある 。', 'A painted board. Arrows and shapes show how the device works.'),
          T('① {水|みず} は {入|い}り{口|ぐち} から {入|はい}る 。 ② {空気|くうき} は {蓋|ふた} の {開|あ}いた {空気|くうき}{抜|ぬ}き から {出|で}る 。 ③ {浮|う}き は {水|みず} と {一緒|いっしょ} に {上|あ}がる 。', '① Water goes in at the inlet. ② Air leaves by the vent, its cap drawn open. ③ The float rises with the water.'),
          T('④ {浮|う}き の {紐|ひも} は {滑車|かっしゃ} を {通|とお}って {巻|ま}き{胴|どう} へ 。 {止|と}め{爪|づめ} を {掛|か}ければ 、 {浮|う}き は {窓|まど} の {所|ところ} で {止|と}まる 。', '④ The float\'s line runs over the pulley to the drum. With the catch set, the float stays at the viewing window.'),
          T('⑤ {取|と}っ{手|て} を {回|まわ}せば 、 {紐|ひも} で {浮|う}き を {上|あ}げられる 。 ⑥ {滑車|かっしゃ} の {軸|じく} に は {風車|かざぐるま} が {付|つ}いて いる 。', '⑤ Turning the crank lifts the float by its line. ⑥ A small vane is fixed to the pulley\'s axle.'),
        ], obs: 'diagram' }],
      },
      post: {
        x: 45, y: 24, tall: 1.4, name: T('{滑車|かっしゃ} の {柱|はしら}', 'the pulley post'),
        look: [{ obs: 'vane', jp: '{柱|はしら} の {上|うえ} に {滑車|かっしゃ} が ある 。 {浮|う}き の {紐|ひも} が その {上|うえ} を {通|とお}って 、 {巻|ま}き{胴|どう} に {下|お}りて いる 。 {滑車|かっしゃ} の {軸|じく} の {先|さき} に 、 {木|き} の {小|ちい}さな {風車|かざぐるま} 。', en: 'A pulley wheel tops the post. The float\'s line runs up over it and down to the drum. On the end of the pulley\'s axle sits a small wooden vane.' }],
      },
      crank: {
        x: 46, y: 24, tall: 0.8, name: T('{巻|ま}き{胴|どう} と {止|と}め{爪|づめ}', 'the drum and catch'),
        look: [
          { done: true, jp: '{止|と}め{爪|づめ} が {巻|ま}き{胴|どう} の {歯|は} に {掛|か}かり 、 {紐|ひも} を しっかり {止|と}めて いる 。', en: 'The catch sits in the drum\'s teeth and holds the line fast.' },
          { if: { bound: true }, jp: '{織|お}った {縄|なわ} が {巻|ま}き{胴|どう} を {押|お}さえて いる 。 {紐|ひも} は {巻|ま}ける が 、 {戻|もど}らない 。', en: 'A woven rope holds the drum: the line can be wound in, but it can\'t run back.' },
          { if: { catch: 'on' }, obs: 'catch', jp: '{止|と}め{爪|づめ} が {巻|ま}き{胴|どう} の {歯|は} に {掛|か}かって いる 。 {紐|ひも} は {巻|ま}ける が 、 {戻|もど}らない 。', en: 'The catch rests in the drum\'s teeth: the line can be wound in, but can\'t run back out.' },
          { obs: 'catch', jp: '{紐|ひも} を {巻|ま}く {胴|どう} と {取|と}っ{手|て} 。 {歯|は} の {付|つ}いた {止|と}め{爪|づめ} は 、 {上|あ}げた まま だ 。', en: 'A drum that the line winds on, and a crank handle. A toothed catch is lifted clear of it.' },
        ],
      },
      inlet: {
        x: 44, y: 25, tall: 0.6, name: T('{入|い}り{口|ぐち}', 'the inlet'),
        look: [{ jp: '{漏斗|じょうご} と {管|くだ} が 、 {水槽|すいそう} の {底|そこ} に つながって いる 。', en: 'A funnel and a pipe lead into the bottom of the tank.' }],
      },
      tank: {
        x: 45, y: 25, tall: 1.2, name: T('{浮|う}き の {水槽|すいそう}', 'the float tank'),
        look: [
          { done: true, lines: [T('{浮|う}き は {窓|まど} の {所|ところ} に {立|た}って いる 。 {札|ふだ} の {字|じ} が 、 ガラス {越|ご}し に はっきり {読|よ}める 。', 'The float stands in the viewing slot. Its label reads plainly through the glass.'),
            T('「 {見|み}えました か ？ {浮|う}き は {水|みず} と {一緒|いっしょ} に {上|あ}がります 。 ── {港|みなと} の {事務所|じむしょ} 」', '"Can you see this? A float rises with the water. — The Harbour Office"')] },
          { if: { float: 'stop' }, obs: 'tether', jp: '{浮|う}き は {水槽|すいそう} の {端|はし} の {止|と}め{木|ぎ} に {寄|よ}って いる 。 {手|て} は {届|とど}く が 、 {窓|まど} から は {外|はず}れて いる 。 {紐|ひも} は たるんで いる 。', en: 'The float has drifted against the stop at the tank\'s edge: safe and within reach, but away from the viewing slot. Its line hangs slack.' },
          { obs: 'label', jp: '{脚|あし} の {付|つ}いた ガラス の {水槽|すいそう} 。 {底|そこ} の {受|う}け{台|だい} に 、 {札|ふだ} を {付|つ}けた コルク の {浮|う}き 。 {低|ひく}すぎて {読|よ}めない 。 {上|うえ} の {目|め} の {高|たか}さ に 、 {木|き} の {窓|まど} {枠|わく} が ある 。', en: 'A glass-sided tank on legs. At the bottom, in its cradle, sits a cork float with a label, too low to read. Up at eye height is a wooden window frame: the viewing slot.' },
        ],
      },
      vent: {
        x: 46, y: 25, tall: 0.7, name: T('{空気|くうき}{抜|ぬ}き', 'the air vent'),
        look: [
          { if: { vent: 'open' }, jp: '{空気|くうき}{抜|ぬ}き の {蓋|ふた} は {一回|いっかい} {緩|ゆる}めて ある 。 {空気|くうき} が {出|で}られる 。', en: 'The vent\'s cap is turned back a turn. Air can get out.' },
          { obs: 'ventshut', jp: '{水槽|すいそう} の {蓋|ふた} から {出|で}た {短|みじか}い {管|くだ} 。 {蓋|ふた} が {固|かた}く {閉|し}まって いる 。', en: 'A short pipe rising from the tank\'s lid, its cap screwed tight.' },
        ],
      },
    },
    rules: [
      { act: 'vent_open', obj: 'vent', if: { vent: 'shut' }, set: { vent: 'open' },
        say: T('{蓋|ふた} を {一回|いっかい} {緩|ゆる}めた 。 {水槽|すいそう} の {空気|くうき} が {外|そと} に {出|で}られる 。', 'You turn the cap back a turn. Air in the tank can get out now.') },
      { act: 'vent_shut', obj: 'vent', if: { vent: 'open', level: 'low' }, set: { vent: 'shut' },
        say: T('{蓋|ふた} を {締|し}め{直|なお}した 。', 'You screw the cap back down.') },
      { act: 'vent_shut', obj: 'vent', if: { vent: 'open' },
        say: T('{水|みず} が {入|はい}って いる {間|あいだ} は 、 {蓋|ふた} は その まま に して おく 。', 'With water in the tank, you leave the cap as it is.') },
      { act: 'catch_on', obj: 'crank', if: { catch: 'off' }, set: { catch: 'on' }, obs: 'catch',
        say: T('{止|と}め{爪|づめ} を {巻|ま}き{胴|どう} の {歯|は} に {掛|か}けた 。 {紐|ひも} は {巻|ま}ける が 、 もう {戻|もど}らない 。', 'You drop the catch into the drum\'s teeth. The line can be wound in now, but it can\'t run back out.') },
      { act: 'catch_off', obj: 'crank', if: { catch: 'on', bound: false, float: ['cradle', 'stop'] }, set: { catch: 'off' },
        say: T('{止|と}め{爪|づめ} を {上|あ}げた 。 {巻|ま}き{胴|どう} は また {自由|じゆう} に {回|まわ}る 。', 'You lift the catch. The drum turns freely again.') },
      { act: 'crank', obj: 'crank', if: { float: 'cradle', catch: 'on' }, set: { float: 'slot' }, fx: 'crank',
        say: T('{取|と}っ{手|て} を {回|まわ}す と 、 {紐|ひも} が {滑車|かっしゃ} を {越|こ}えて {上|あ}がり 、 {浮|う}き は {窓|まど} の {所|ところ} まで {上|あ}がった 。 {止|と}め{爪|づめ} が かちり と {鳴|な}って 、 そこ で {止|と}まる 。', 'You wind the crank. The line runs up over the pulley and the float rises into the viewing slot. The catch clicks into place; there it stays.') },
      { act: 'crank', obj: 'crank', if: { float: 'cradle', catch: 'off' }, obs: 'catch',
        say: T('{回|まわ}して いる {間|あいだ} は {浮|う}き が {上|あ}がる 。 {手|て} を {離|はな}す と 、 {紐|ひも} が {戻|もど}って 、 {浮|う}き は {受|う}け{台|だい} に {沈|しず}んだ 。 {紐|ひも} を {止|と}める もの が ない 。', 'As you wind, the float lifts; the moment you let go, the line runs back and the float sinks to its cradle. Nothing holds the line.') },
      { act: 'crank', obj: 'crank', if: { float: 'stop' },
        say: T('{紐|ひも} が たるんで いる 。 {浮|う}き は {端|はし} の {止|と}め{木|ぎ} に {寄|よ}って いる 。 {先|さき} に {元|もと} に {戻|もど}そう 。', 'The line is slack: the float is resting against the stop at the edge. Set the tank back first.') },
      // water
      { weave: 'water', obj: ['inlet', 'tank'], if: { vent: 'shut', level: 'low' }, obs: 'vent', fx: 'gurgle',
        say: T('{水|みず} が {入|い}り{口|ぐち} に {流|なが}れ{込|こ}み 、 ごぼごぼ と {泡|あわ} に なって {戻|もど}って きた 。 {水位|すいい} は {変|か}わらない 。 {中|なか} の {空気|くうき} の {逃|に}げ{場|ば} が ない 。', 'Water pours into the inlet and bubbles straight back up out of it. The level doesn\'t change: the air inside has nowhere to go.') },
      { weave: 'water', obj: ['inlet', 'tank'], if: { vent: 'open', level: 'low', catch: 'on', float: 'cradle' }, set: { level: 'high', float: 'slot' },
        say: T('{水|みず} が {入|い}り{口|ぐち} から {入|はい}り 、 {空気|くうき} が {空気|くうき}{抜|ぬ}き から {抜|ぬ}けた 。 {浮|う}き は {水|みず} と {一緒|いっしょ} に {上|あ}がり 、 {紐|ひも} に {止|と}められて 、 ちょうど {窓|まど} の {所|ところ} で {止|と}まった 。', 'Water runs in at the inlet; air sighs out of the vent. The float rises with the water until its line stops it — right in the viewing slot.') },
      { weave: 'water', obj: ['inlet', 'tank'], if: { vent: 'open', level: 'low', catch: 'off' }, set: { level: 'high', float: 'stop' }, obs: 'tether',
        say: T('{水|みず} が {入|はい}り 、 {空気|くうき} が {抜|ぬ}けた 。 {浮|う}き は {上|あ}がった が 、 {紐|ひも} が {止|と}まって いない ので 、 {横|よこ} に {流|なが}れて {端|はし} の {止|と}め{木|ぎ} に {寄|よ}った 。 {無事|ぶじ} だ が 、 {窓|まど} から は {外|はず}れて いる 。', 'Water runs in; air sighs out. The float rises — and with nothing holding its line, it drifts sideways to rest against the stop at the edge. It\'s safe there, but out of the slot.') },
      { weave: 'water', obj: ['inlet', 'tank'], if: { level: 'high' },
        say: T('{水槽|すいそう} は もう {印|しるし} まで {満|み}ちて いる 。', 'The tank is already full to the mark.') },
      { weave: 'water', obj: 'vent',
        say: T('{水|みず} は {空気|くうき}{抜|ぬ}き の {蓋|ふた} を {伝|つた}って {流|なが}れ{落|お}ちた 。 {水|みず} の {入|い}り{口|ぐち} で は ない 。', 'Water runs down over the vent cap and away. This isn\'t where water goes in.') },
      // wind on the vane (the vane is fixed to the pulley's axle: drawn and on the diagram)
      { weave: 'wind', obj: 'post', if: { float: 'cradle', catch: 'on' }, set: { float: 'slot' }, fx: 'vane',
        say: T('{風|かぜ} が {軸|じく} の {風車|かざぐるま} を {回|まわ}し 、 {滑車|かっしゃ} が {紐|ひも} を {巻|ま}いた 。 {浮|う}き は {窓|まど} の {所|ところ} まで {上|あ}がり 、 {止|と}め{爪|づめ} が そこ で {止|と}めた 。', 'The wind turns the vane on the axle; the pulley winds the line; the float rises into the viewing slot, and the catch holds it there.') },
      { weave: 'wind', obj: 'post', if: { float: 'cradle', catch: 'off' }, obs: 'catch',
        say: T('{風車|かざぐるま} が {回|まわ}り 、 {浮|う}き が {少|すこ}し {上|あ}がる 。 {風|かぜ} が {止|や}む と 、 {紐|ひも} が {戻|もど}って {浮|う}き は {沈|しず}んだ 。 {紐|ひも} を {止|と}める もの が ない 。', 'The vane spins and the float lifts a little; as the gust dies, the line runs back and the float sinks. Nothing holds the line.') },
      { weave: 'wind', obj: 'post', if: { float: 'stop' },
        say: T('{風車|かざぐるま} は {回|まわ}る が 、 {紐|ひも} は たるんだ まま だ 。 {浮|う}き は {端|はし} に {寄|よ}って いる 。', 'The vane turns, but the line stays slack: the float is resting at the edge.') },
      { weave: 'wind', obj: ['tank', 'inlet', 'vent', 'crank', 'diagram'],
        say: T('{風|かぜ} が {水面|すいめん} を {揺|ゆ}らした 。 {浮|う}き は {受|う}け{台|だい} で {少|すこ}し {揺|ゆ}れた だけ だ 。', 'A breeze ruffles the water. The float only rocks a little in its cradle.') },
      // a woven rope instead of the catch
      { weave: 'bind', obj: ['crank', 'post'], if: { catch: 'off', bound: false }, set: { catch: 'on', bound: true }, obs: 'catch',
        say: T('{縄|なわ} の {形|かたち} が {巻|ま}き{胴|どう} に {巻|ま}きついて {押|お}さえた 。 {紐|ひも} は {巻|ま}ける が 、 {戻|もど}らない 。', 'The shape of a rope winds round the drum and holds it: the line can be wound in, but can\'t run back.') },
      { weave: 'bind', obj: ['crank', 'post'], if: { catch: 'on' },
        say: T('{紐|ひも} は もう {止|と}め{爪|づめ} で {止|と}まって いる 。', 'The catch already holds the line.') },
      { weave: 'light', obj: 'tank', if: { float: 'cradle' }, obs: 'label',
        say: T('{光|ひかり} が {水|みず} を {照|て}らし 、 {底|そこ} の {浮|う}き の {札|ふだ} が {見|み}えた 。 {低|ひく}すぎて 、 {字|じ} は {読|よ}めない 。', 'The light shines through the water onto the float\'s label at the bottom. It\'s too low to read.') },
    ],
    complete: { float: 'slot' },
    solvedSay: T('{浮|う}き は もう {窓|まど} の {所|ところ} に {止|と}まって いる 。', 'The float is already held at the viewing slot.'),
    // the woven rope gives way to the ordinary catch
    after: { bound: false, catch: 'on' },
    methods: [{ id: 'filled', if: { level: 'high' } }, { id: 'vane', rule: 'wind' }, { id: 'cranked', rule: 'crank' }],
    marks: [{ obj: 'crank', if: { bound: true }, mark: 'rope' }],
    resetSay: T('{栓|せん} を {抜|ぬ}いて {水|みず} を {出|だ}し 、 {浮|う}き を {受|う}け{台|だい} に {戻|もど}した 。 {蓋|ふた} と {止|と}め{爪|づめ} も 、 {最初|さいしょ} の {形|かたち} に {戻|もど}した 。', 'You pull the drain plug, let the water out and set the float back in its cradle. The cap and the catch go back as you found them.'),
    reward: {
      keepsake: 'cork_float',
      say: [T('{水槽|すいそう} の {脇|わき} に 、 {色|いろ} を {塗|ぬ}った {予備|よび} の {浮|う}き が 、 {網|あみ} の {袋|ふくろ} に {入|はい}って {下|さ}がって いる 。 {札|ふだ} に 「 {浮|う}き を {上|あ}げた {方|かた} に 、 お{一|ひと}つ ずつ 。 {港|みなと} の {事務所|じむしょ} 」 。', 'Beside the tank hangs a net bag of spare painted floats, with a card: "One each, for whoever gets the float up. — The Harbour Office."'),
        T('{一|ひと}つ {選|えら}んだ 。 {動|うご}いて いる {浮|う}き は 、 {水槽|すいそう} に {残|のこ}した まま だ 。', 'You choose one. The working float stays in its tank.')],
    },
    hints: [
      T('{横|よこ} の {図|ず} に 、 {仕組|しく}み が {描|か}いて ある 。 {浮|う}き が {窓|まど} の {所|ところ} に {留|とど}まる に は 、 {何|なに} が {要|い}る だろう 。', 'The diagram beside the tank shows how it works. What does the float need to stay at the window?'),
      T('{水|みず} は 、 {空気|くうき} が {出|で}られる とき だけ {入|はい}る 。 {浮|う}き が {窓|まど} に {留|とど}まる の は 、 {紐|ひも} が {止|と}まって いる とき だけ 。 {手|て} で {上|あ}げる {道具|どうぐ} も ある 。', 'Water only goes in if air can get out. The float only stays at the window if its line is held. There\'s also a way to lift it by hand.'),
      T('{空気|くうき}{抜|ぬ}き を {開|あ}け 、 {止|と}め{爪|づめ} を {掛|か}け 、 {入|い}り{口|ぐち} に 「 みず 」 を {織|お}る 。 または 、 {止|と}め{爪|づめ} を {掛|か}けて {取|と}っ{手|て} を {回|まわ}す 。 （ {風車|かざぐるま} に 「 かぜ 」 を {織|お}って も 、 {取|と}っ{手|て} と {同|おな}じ ）', 'Open the vent, set the catch on the drum, then weave みず (water) into the inlet. Or set the catch and wind the crank. (A かぜ (wind) weave on the vane does what the crank does.)'),
    ],
  });

  // ---- F3: The Maker's Mark (Cinder Orchard, Master Isao's glass workshop) --------------------------------
  // A finished lantern globe on the demonstration tray bears a shallow maker's
  // mark; its name card has fallen out. The tray rocks on a short foot, and the
  // lamp overhead flattens shallow grooves. Two independent requirements:
  // steady support (a peg from the rack, or a stone weave) and light from the
  // side (swing the lamp, or a light weave). Any mix of the two works.
  const F3_SEEN = (st) => st.support !== 'none' && st.light !== 'top';
  FW.define({
    id: 'f3', region: 'cinder', map: 'co.glass',
    title: T('{作|つく}り{手|て} の {印|しるし}', 'The Maker\'s Mark'),
    eligible: null,
    init: { support: 'none', light: 'top' },
    values: { support: ['none', 'peg', 'stone'], light: ['top', 'side', 'woven'] },
    solved: { support: 'peg', light: 'side' },
    objects: {
      tray: {
        x: 10, y: 5, tall: 0.9, name: T('{見本|みほん} の {台|だい}', 'the demonstration tray'),
        look: [
          { done: true, lines: [T('{台|だい} は {楔|くさび} で {据|す}わり 、 {灯|あか}り は {横|よこ} から {低|ひく}く {当|あ}たって いる 。 {火屋|ほや} の {縁|ふち} に 、 {作|つく}り{手|て} の {印|しるし} が はっきり {見|み}える 。 {葉|は} が {一枚|いちまい} 。', 'The tray sits steady on its wedge, with the lamp low beside it. On the globe\'s rim the maker\'s mark is plain: a single leaf.'),
            T('{名札|なふだ} も {札|ふだ} {立|た}て に {戻|もど}って いる 。 「 {灯|あか}り の {火屋|ほや} 　 {作|さく} ・ ヒロ 」 。', 'Its name card is back in the holder: "Lantern globe — made by Hiro."')] },
          { if: { support: 'none', light: 'top' }, obs: 'rock', lines: [
            T('{見本|みほん} の {台|だい} に 、 {仕上|しあ}がった {灯|あか}り の {火屋|ほや} が {一|ひと}つ 。 {触|さわ}る と {台|だい} が がたがた {揺|ゆ}れる 。 {脚|あし} が {一本|いっぽん} {短|みじか}い 。', 'On the demonstration tray sits one finished lantern globe. Touch it and the tray rocks: one foot of its stand is short.'),
            T('{縁|ふち} に {浅|あさ}い {彫|ほ}り が ある 。 {作|つく}り{手|て} の {印|しるし} らしい が 、 {真上|まうえ} の {灯|あか}り で は 、 かすか な {傷|きず} に しか {見|み}えない 。 {名札|なふだ} の {札|ふだ} {立|た}て は {空|から} だ 。', 'Shallow grooves run on the rim: a maker\'s mark, by the look of it, but under the lamp straight overhead they show as nothing more than a faint scratch. The name card\'s holder is empty.'),
          ] },
          { if: { support: 'none' }, obs: 'rock', jp: '{横|よこ} から の {光|ひかり} に {彫|ほ}り が {浮|う}かぶ が 、 {台|だい} が {揺|ゆ}れる たび に {形|かたち} が ぶれて 、 {読|よ}み{取|と}れない 。', en: 'Light from the side picks out the grooves, but each time the tray rocks the shape blurs. You can\'t make it out.' },
          { if: { light: 'top' }, obs: 'grooves', jp: '{台|だい} は {止|と}まって いる 。 でも {真上|まうえ} の {灯|あか}り で は 、 {縁|ふち} の {彫|ほ}り は かすか な {傷|きず} に しか {見|み}えない 。', en: 'The tray is still now. But under the lamp overhead the grooves on the rim are still only a faint scratch.' },
        ],
      },
      lamp: {
        x: 11, y: 4, tall: 1.2, name: T('{台|だい} の {灯|あか}り', 'the stand lamp'),
        look: [
          { if: { light: 'side' }, jp: '{灯|あか}り の {腕|うで} は {横|よこ} に {下|さ}げて ある 。 {光|ひかり} が {台|だい} の {上|うえ} を {低|ひく}く {這|は}う 。', en: 'The lamp\'s arm is swung down to the side; its light lies low across the tray.' },
          { jp: '{関節|かんせつ} の ある {腕|うで} に {付|つ}いた {灯|あか}り 。 {台|だい} の {真上|まうえ} に {下|さ}がって いる 。', en: 'A lamp on a jointed arm, hanging straight over the tray.' },
        ],
      },
      peg: {
        x: 9, y: 5, tall: 0.6, name: T('{楔|くさび} の {棚|たな}', 'the wedge rack'),
        look: [
          { if: { support: 'peg' }, jp: '{楔|くさび} が {一本|いっぽん} {減|へ}って いる 。 {台|だい} の {短|みじか}い {脚|あし} の {下|した} に ある 。', en: 'One wedge is missing from the rack: it\'s under the tray\'s short foot.' },
          { jp: '{台|だい} の {据|す}わり を {直|なお}す {木|き} の {楔|くさび} が 、 {何本|なんぼん} か {並|なら}んで いる 。', en: 'A rack of wooden wedges, for levelling stands.' },
        ],
      },
      note: {
        x: 11, y: 5, tall: 0.6, name: T('{親方|おやかた} の {貼|は}り{紙|がみ}', 'Master Isao\'s note'),
        look: [{ obs: 'note', lines: [
          T('イサオ の {字|じ} で 、 {貼|は}り{紙|がみ} 。 「 {印|しるし} を {見|み}る とき は 、 {台|だい} を {据|す}え 、 {灯|あか}り を {横|よこ} から {当|あ}てる こと 。 {上|うえ} から の {光|ひかり} で は 、 {浅|あさ}い {彫|ほ}り は {見|み}えない 。 」', 'A note in Master Isao\'s hand: "To see a mark, set the stand steady and bring the light in from the side. Light from above won\'t show a shallow cut."'),
          T('{下|した} に 、 この {工房|こうぼう} の {印|しるし} 。 「 {葉|は} ＝ ヒロ 。 {点|てん} {三|みっ}つ ＝ イサオ 。 {波|なみ} ＝ {先代|せんだい} 。 」', 'Below it, the workshop\'s marks: "Leaf — Hiro. Three dots — Isao. A wave — the old master."'),
        ] }],
      },
    },
    rules: [
      { act: 'peg_set', obj: 'peg', if: { support: 'none' }, set: { support: 'peg' },
        say: T('{棚|たな} から {楔|くさび} を {一本|いっぽん} {取|と}り 、 {台|だい} の {短|みじか}い {脚|あし} の {下|した} に {差|さ}し{込|こ}んだ 。 {台|だい} は {揺|ゆ}れなく なった 。', 'You take a wedge from the rack and slide it under the tray\'s short foot. The tray stops rocking.') },
      { act: 'peg_set', obj: 'peg', if: { support: 'stone' },
        say: T('{台|だい} は もう {据|す}わって いる 。', 'The tray is already steady.') },
      { act: 'peg_take', obj: 'peg', if: { support: 'peg' }, set: { support: 'none' },
        say: T('{楔|くさび} を {抜|ぬ}いた 。 {台|だい} は また {揺|ゆ}れる 。', 'You slide the wedge back out. The tray rocks again.') },
      { act: 'lamp_side', obj: 'lamp', if: { light: 'top' }, set: { light: 'side' },
        say: (b, a) => F3_SEEN(a) ? T('{灯|あか}り の {腕|うで} を {横|よこ} に {下|さ}げた 。 {低|ひく}い {光|ひかり} が {縁|ふち} を {撫|な}で 、 {浅|あさ}い {彫|ほ}り に {影|かげ} が {落|お}ちた 。', 'You swing the lamp\'s arm down to the side. Low light runs across the rim, and the shallow grooves fill with shadow.')
          : T('{灯|あか}り の {腕|うで} を {横|よこ} に {下|さ}げた 。 {彫|ほ}り が {浮|う}かぶ が 、 {台|だい} が {揺|ゆ}れて {形|かたち} が ぶれる 。', 'You swing the lamp\'s arm down to the side. The grooves stand out — but the tray rocks, and the shape blurs.') },
      { act: 'lamp_side', obj: 'lamp', if: { light: 'woven' },
        say: T('{光|ひかり} は もう {横|よこ} から {当|あ}たって いる 。', 'Light already comes in from the side.') },
      { act: 'lamp_top', obj: 'lamp', if: { light: 'side' }, set: { light: 'top' },
        say: T('{灯|あか}り を {真上|まうえ} に {戻|もど}した 。', 'You swing the lamp back overhead.') },
      // weaves
      { weave: 'stone', obj: ['tray', 'peg'], if: { support: 'none' }, set: { support: 'stone' },
        say: T('{石|いし} の {重|おも}み が {台|だい} の {脚|あし} に {沈|しず}み 、 {台|だい} は {揺|ゆ}れなく なった 。 そのまま {動|うご}かない 。', 'A stone\'s weight settles into the tray\'s stand. It stops rocking, and stays still.') },
      { weave: 'stone', obj: ['tray', 'peg'],
        say: T('{台|だい} は もう {据|す}わって いる 。', 'The tray is already steady.') },
      { weave: 'light', obj: 'tray', if: { light: 'top' }, set: { light: 'woven' },
        say: (b, a) => F3_SEEN(a) ? T('{細|ほそ}い {光|ひかり} が {横|よこ} から {低|ひく}く {差|さ}し 、 {縁|ふち} の {浅|あさ}い {彫|ほ}り に {影|かげ} が {落|お}ちた 。', 'A thin light comes in low from the side, and the shallow grooves on the rim fill with shadow.')
          : T('{細|ほそ}い {光|ひかり} が {横|よこ} から {差|さ}し 、 {彫|ほ}り が {光|ひか}った 。 でも {台|だい} が {揺|ゆ}れる たび に 、 {形|かたち} が ぶれる 。', 'A thin light comes in from the side and catches the grooves — but each time the tray rocks, the shape blurs.') },
      { weave: 'light', obj: 'tray',
        say: T('{光|ひかり} は もう {横|よこ} から {当|あ}たって いる 。', 'Light already comes in from the side.') },
      { weave: 'light', obj: 'lamp',
        say: T('{灯|あか}り は {明|あか}るく なった が 、 {真上|まうえ} から の まま だ 。 {上|うえ} から の {強|つよ}い {光|ひかり} は 、 {浅|あさ}い {彫|ほ}り を かえって {平|たい}ら に する 。', 'The lamp burns brighter, but still from overhead. Stronger light from above only flattens the shallow grooves.') },
      { weave: 'fire', obj: ['tray', 'lamp', 'peg', 'note'], obs: 'heat',
        say: T('{炎|ほのお} は {引|ひ}っ{込|こ}めた 。 {仕上|しあ}がった {火屋|ほや} に も 、 {机|つくえ} の {作|つく}り{掛|か}け の {火屋|ほや} に も 、 {熱|ねつ} は {要|い}らない 。 {印|しるし} を {読|よ}む だけ だ 。', 'You hold the flame back. Neither the finished globe nor the half-made ones on the table want heat: you only mean to read a mark.') },
      { weave: 'wind', obj: ['tray', 'peg'], if: { support: 'none' },
        say: T('{風|かぜ} は {台|だい} を {据|す}え は しない 。 かえって {大|おお}きく {揺|ゆ}れた 。', 'Wind doesn\'t steady the tray. It rocks harder.') },
      { weave: 'protect', obj: 'tray', if: { support: 'none' },
        say: T('{守|まも}り が {台|だい} を {囲|かこ}んで {傷|きず} から {守|まも}る 。 でも {台|だい} は {短|みじか}い {脚|あし} の まま 、 {揺|ゆ}れ{続|つづ}ける 。 {守|まも}り は {据|す}える もの で は ない 。', 'The ward rings the tray and keeps harm off it, but the tray still rocks on its short foot. A ward guards; it doesn\'t level.') },
      { weave: 'water', obj: 'tray',
        say: T('{水|みず} が ガラス の {上|うえ} で {玉|たま} に なった 。 {浅|あさ}い {彫|ほ}り が {見|み}え やすく なる わけ で は ない 。', 'Water beads on the glass. It doesn\'t make a shallow groove any easier to see.') },
      { weave: 'ice', obj: 'tray',
        say: T('ガラス が {白|しろ}く {曇|くも}り 、 {彫|ほ}り は {霜|しも} の {下|した} に {消|き}えた 。 {溶|と}ける と 、 {元|もと} の まま だ 。', 'Frost clouds the glass and the grooves vanish under it. When it melts, nothing has changed.') },
      { weave: 'bind', obj: ['tray', 'peg'], if: { support: 'none' },
        say: T('{縄|なわ} で は 、 {短|みじか}い {脚|あし} は {揃|そろ}わない 。', 'A rope can\'t even up a short foot.') },
    ],
    complete: { support: ['peg', 'stone'], light: ['side', 'woven'] },
    solvedSay: T('{印|しるし} は もう {読|よ}めて いる 。 {葉|は} が {一枚|いちまい} 。', 'The mark is already read: a single leaf.'),
    // the lasting arrangement: a wedge under the foot, the lamp left low beside the tray
    after: { support: 'peg', light: 'side' },
    methods: [{ id: 'ordinary', if: { support: 'peg', light: 'side' } }, { id: 'woven', if: { support: 'stone', light: 'woven' } }, { id: 'mixed' }],
    marks: [{ obj: 'tray', if: { support: 'stone' }, mark: 'stone' }, { obj: 'tray', if: { light: 'woven' }, mark: 'glow' }],
    resetSay: T('{楔|くさび} を {棚|たな} に {戻|もど}し 、 {灯|あか}り を {真上|まうえ} に {戻|もど}した 。', 'You put the wedge back in the rack and the lamp back overhead.'),
    reward: {
      keepsake: 'glass_leaf',
      say: [T('{名札|なふだ} を {札|ふだ} {立|た}て に {戻|もど}した 。 「 {灯|あか}り の {火屋|ほや} 　 {作|さく} ・ ヒロ 」 。', 'You slip the name card back into its holder: "Lantern globe — made by Hiro."'),
        { who: 'co_isao', jp: 'ヒロ の {葉|は} か 。 …… {俺|おれ} の {目|め} じゃ 、 もう {見|み}え ねえ 。 {棚|たな} の {皿|さら} の {葉|は} を {一|ひと}つ {持|も}って いけ 。 {棒|ぼう} の {切|き}れ{端|はし} で ヒロ が {作|つく}る ん だ 。', en: 'Hiro\'s leaf, is it. …My eyes can\'t pick it out any more. Take one of the leaves from the dish on the shelf. Hiro makes them from the ends of the rods.' },
        T('{棚|たな} の {皿|さら} に 、 {小|ちい}さな ガラス の {葉|は} が {何枚|なんまい} も {入|はい}って いる 。 {一枚|いちまい} {手|て} に {取|と}った 。', 'In a dish on the shelf lie a dozen little glass leaves. You take one.'),
      ],
    },
    hints: [
      T('{印|しるし} を {読|よ}めない {理由|りゆう} は {二|ふた}つ ある 。 {台|だい} の {動|うご}き と 、 {光|ひかり} の {来|く}る {方向|ほうこう} を {見|み}て みよう 。', 'Two things stop you reading the mark. Look at how the tray moves, and at where the light comes from.'),
      T('{台|だい} が {据|す}わって いて 、 しかも {光|ひかり} が {横|よこ} から {当|あ}たって いる こと 。 どちら も 、 {手|て} で も {言葉|ことば} で も できる 。', 'The tray has to be steady AND lit from the side. Each can be done by hand, or with a word.'),
      T('{棚|たな} の {楔|くさび} を {台|だい} の {脚|あし} に {差|さ}す （ または {台|だい} に 「 いし 」 か 「 つち 」 を {織|お}る ） 。 {灯|あか}り の {腕|うで} を {横|よこ} に {下|さ}げる （ または {台|だい} に 「 ひかり 」 を {織|お}る ） 。', 'Slide a wedge from the rack under the tray\'s foot (or weave いし or つち — stone, earth — on the tray), and swing the lamp to the side (or weave ひかり — light — on the tray).'),
    ],
  });

  // ---- F4: The Frosted Compartments (Snowbell, the post shelter's holding boxes) -----------------------
  // Three labelled boxes behind a glass cover. Frost hides the stamps on the
  // labels and freezes the cover shut. Sōsuke's note: Denji's carved toggles
  // are in the unaddressed box with the same stamp as Hayate's. Warm the cover
  // (a flame at its brass warming plate, or the warm cloth from the box beside
  // it), read the labels, open the matching box. A wrong box shows what is in
  // it and why it isn't the one, and closes again. No timer; the frost does
  // not come back.
  const BOXES = {
    a: { jp: '① 「 ハヤテ {様|さま} 」 と {丸|まる} の {判|はん} 。', en: '① "Hayate", with a round stamp ○.' },
    b: { jp: '② {名前|なまえ} なし 、 {三角|さんかく} の {判|はん} 。', en: '② No name, with a triangle stamp △.' },
    c: { jp: '③ {名前|なまえ} なし 、 {丸|まる} の {判|はん} 。', en: '③ No name, with a round stamp ○.' },
  };
  FW.define({
    id: 'f4', region: 'snowbell', map: 'sb.hamlet',
    title: T('{霜|しも} の {預|あず}かり{箱|ばこ}', 'The Frosted Compartments'),
    eligible: null,
    init: { frost: 'on', cleared: 'none', found: false },
    values: { frost: ['on', 'off'], cleared: ['none', 'cloth', 'flame'], found: [false, true] },
    solved: { frost: 'off', cleared: 'cloth', found: true },
    noReset: true,
    objects: {
      note: {
        x: 32, y: 28, tall: 0.8, name: T('{郵便|ゆうびん}{小屋|ごや} の {貼|は}り{紙|がみ}', 'the post shelter\'s note'),
        look: [{ obs: 'note', lines: [
          T('{小屋|こや} の {壁|かべ} に {貼|は}り{紙|がみ} 。 「 デンジ さん が {彫|ほ}った {雪|ゆき} の {留|と}め{具|ぐ} 、 ご{自由|じゆう} に どうぞ 。 」', 'A note pinned to the shelter wall: "Snowflake toggles carved by Denji — help yourself."'),
          T('「 {名前|なまえ} の ない {箱|はこ} の うち 、 ハヤテ さん の {箱|はこ} と {同|おな}じ {判|はん} の {方|ほう} に {入|い}れて あります 。 ── {郵便|ゆうびん}{小屋|ごや} ソウスケ 」', '"They\'re in whichever box without a name has the same stamp as Hayate\'s box. — Sousuke, at the post shelter"'),
        ] }],
      },
      cover: {
        x: 33, y: 28, w: 3, tall: 0.9, name: T('{霜|しも} の ついた {覆|おお}い', 'the frosted cover'),
        look: [
          { if: { frost: 'off' }, obs: 'labels', lines: [
            T('ガラス の {覆|おお}い は {澄|す}んで いる 。 {扉|とびら} が {三|みっ}つ 。 {札|ふだ} が はっきり {読|よ}める 。', 'The glass cover is clear. Three doors; the labels read plainly:'),
            BOXES.a, BOXES.b, BOXES.c,
          ] },
          { obs: 'frost', lines: [
            T('{三|みっ}つ の {扉|とびら} の {前|まえ} に 、 ガラス の {覆|おお}い 。 {霜|しも} で {白|しろ}く 、 {縁|ふち} が {凍|こお}りついて {開|あ}かない 。', 'A glass cover over three doors, white with frost, its edges frozen shut.'),
            T('{霜|しも} の {上|うえ} に {札|ふだ} の {上|うえ} {半分|はんぶん} だけ {見|み}える 。 ① 「 ハヤテ {様|さま} 」 、 ② と ③ は {名前|なまえ} なし 。 {判|はん} の ある {下|した} {半分|はんぶん} は 、 {霜|しも} が {厚|あつ}くて {見|み}えない 。', 'Above the frost line you can make out the top half of each label: ① "Hayate"; ② and ③ carry no name. The lower halves, where the stamps are, are thick with frost.'),
            T('{覆|おお}い の {枠|わく} に {真鍮|しんちゅう} の {小|ちい}さな {板|いた} 。 {矢印|やじるし} が {刻|きざ}んで あり 、 「 {温|あたた}める {所|ところ} 」 。', 'Set in the cover\'s frame is a small brass plate with an arrow stamped on it: "Warm here."'),
          ] },
        ],
      },
      a: { x: 33, y: 28, tall: 0.9, weave: false, name: T('{箱|はこ} ①', 'box ①') },
      b: { x: 34, y: 28, tall: 0.9, weave: false, name: T('{箱|はこ} ②', 'box ②') },
      c: { x: 35, y: 28, tall: 0.9, weave: false, name: T('{箱|はこ} ③', 'box ③') },
      cloth: {
        x: 36, y: 28, tall: 0.7, name: T('{温|あたた}め{箱|ばこ}', 'the warming box'),
        look: [{ jp: '{脚|あし} の ついた {蓋|ふた} {付|つ}き の {箱|はこ} 。 {中|なか} に {焼|や}いた {石|いし} と {厚|あつ}い {布|ぬの} 。 {蓋|ふた} に 「 {霜|しも} の とき に 」 。', en: 'A lidded box on legs. Inside, a heated stone and a thick cloth. On the lid: "For frost."' }],
      },
    },
    rules: [
      { act: 'wipe', obj: 'cloth', if: { frost: 'on' }, set: { frost: 'off', cleared: 'cloth' }, obs: 'labels',
        say: T('{箱|はこ} から {温|あたた}かい {布|ぬの} を {出|だ}し 、 {覆|おお}い の {枠|わく} に {当|あ}てた 。 {霜|しも} が ガラス から {引|ひ}いて いき 、 {覆|おお}い が {持|も}ち{上|あ}がる 。 {札|ふだ} が {全部|ぜんぶ} {読|よ}める 。', 'You take the warm cloth from the box and press it along the cover\'s frame. The frost draws back from the glass and the cover lifts free. Every label can be read.') },
      { act: 'wipe', obj: 'cloth', if: { frost: 'off' },
        say: T('{覆|おお}い は もう {澄|す}んで いる 。', 'The cover is already clear.') },
      ...['a', 'b', 'c'].map((k) => ({ act: 'open_' + k, obj: k, if: { frost: 'on' }, obs: 'frozen',
        say: T('ガラス の {覆|おお}い が {凍|こお}りついて いて 、 {扉|とびら} に {手|て} が {届|とど}かない 。', 'The glass cover is frozen shut over the doors; you can\'t get at them.') })),
      { act: 'open_a', obj: 'a', if: { frost: 'off' },
        say: [BOXES.a, T('{中|なか} は {空|から} で 、 {札|ふだ} が {一枚|いちまい} 。 「 {受|う}け{取|と}り {済|ず}み 。 ありがとう 」 。 {扉|とびら} を {閉|し}めた 。', 'Inside, only a card: "Collected. Thank you." You close the door again.')] },
      { act: 'open_b', obj: 'b', if: { frost: 'off' },
        say: [BOXES.b, T('{中|なか} に は 、 {包|つつ}んだ {灯心|とうしん} の {束|たば} と {札|ふだ} 。 「 {天文台|てんもんだい} の {灯|あか}り {用|よう} 。 {取|と}らないで ください 」 。 {扉|とびら} を {閉|し}めた 。', 'Inside: a wrapped bundle of lamp wicks, and a card: "For the observatory lamp. Please leave." You close the door again.')] },
      { act: 'open_c', obj: 'c', if: { frost: 'off', found: false }, set: { found: true },
        say: [BOXES.c, T('{中|なか} に 、 {木|き} を {彫|ほ}った {雪|ゆき} の {形|かたち} の {留|と}め{具|ぐ} が {小|ちい}さく {山|やま} に なって いる 。 {貼|は}り{紙|がみ} の とおり だ 。', 'Inside is a little heap of toggles carved from wood in the shape of snowflakes — just as the note said.')] },
      { act: 'open_c', obj: 'c', if: { found: true },
        say: T('③ の {箱|はこ} 。 {留|と}め{具|ぐ} は まだ {少|すこ}し {残|のこ}って いる 。 {次|つぎ} の {人|ひと} の ため に 、 {扉|とびら} を {閉|し}めた 。', 'Box ③. A few toggles are left; you close the door for whoever comes next.') },
      // weaves: warmth belongs at the brass plate on the cover
      { weave: 'fire', obj: 'cover', if: { frost: 'on' }, set: { frost: 'off', cleared: 'flame' }, obs: 'labels',
        say: T('{刻|きざ}まれた {矢印|やじるし} の とおり 、 {枠|わく} の {真鍮|しんちゅう} の {板|いた} に {炎|ほのお} の {温|ぬく}もり を {当|あ}てた 。 {熱|ねつ} が {枠|わく} を {伝|つた}わり 、 {霜|しも} が {引|ひ}いて 、 {覆|おお}い が {持|も}ち{上|あ}がる 。 {札|ふだ} が {全部|ぜんぶ} {読|よ}める 。', 'As the stamped arrow shows, you put the flame\'s warmth to the brass plate on the frame. The heat runs along the frame, the frost draws back, and the cover lifts free. Every label can be read.') },
      { weave: 'fire', obj: 'cover',
        say: T('{覆|おお}い は もう {澄|す}んで いる 。', 'The cover is already clear.') },
      { weave: 'fire', obj: 'cloth',
        say: T('{箱|はこ} の {石|いし} は もう {十分|じゅうぶん} {温|あたた}かい 。', 'The stone in the box is warm enough already.') },
      { weave: 'fire', obj: 'note',
        say: T('{紙|かみ} に {炎|ほのお} は {近|ちか}づけない 。', 'You keep the flame well away from the paper.') },
      { weave: 'ice', obj: 'cover', if: { frost: 'on' },
        say: T('{冷|ひ}やす と 、 {霜|しも} は かえって {厚|あつ}く なった 。 {札|ふだ} の {判|はん} は {隠|かく}れた まま だ 。', 'Cooling it only thickens the frost. The stamps stay hidden.') },
      { weave: 'light', obj: 'cover', if: { frost: 'on' },
        say: T('{光|ひかり} は {霜|しも} の {中|なか} で {散|ち}って 、 {札|ふだ} の {下|した} {半分|はんぶん} は {白|しろ}い まま だ 。', 'The light scatters in the frost; the lower halves of the labels stay a white blur.') },
      { weave: 'water', obj: 'cover', if: { frost: 'on' },
        say: T('{水|みず} は {冷|つめ}たい ガラス の {上|うえ} で {凍|こお}り 、 {霜|しも} が {一枚|いちまい} {増|ふ}えた だけ だ 。', 'The water freezes on the cold glass: one more thin layer of frost.') },
      { weave: 'wind', obj: 'cover', if: { frost: 'on' },
        say: T('{冷|つめ}たい {風|かぜ} が {吹|ふ}いた 。 {霜|しも} は その まま だ 。', 'A cold breeze. The frost stays.') },
    ],
    complete: { found: true },
    solvedSay: T('{留|と}め{具|ぐ} は もう {見|み}つけた 。', 'You have already found the toggles.'),
    methods: [{ id: 'flame', if: { cleared: 'flame' } }, { id: 'cloth', if: { cleared: 'cloth' } }],
    reward: {
      keepsake: 'snow_toggle',
      say: [T('{一|ひと}つ {手|て} に {取|と}って 、 {扉|とびら} を {閉|し}めた 。 {残|のこ}り は {次|つぎ} の {人|ひと} の ため に 。', 'You take one and close the door. The rest are for whoever comes next.')],
    },
    hints: [
      T('{貼|は}り{紙|がみ} は 、 {二|ふた}つ の {札|ふだ} を {比|くら}べる よう に {言|い}って いる 。 まず 、 {札|ふだ} を {全部|ぜんぶ} {見|み}える よう に しよう 。', 'The note asks you to compare two labels. First, get all the labels where you can see them.'),
      T('{覆|おお}い の {枠|わく} に 「 {温|あたた}める {所|ところ} 」 が ある 。 {横|よこ} の {箱|はこ} に は {温|あたた}かい {布|ぬの} 。 {札|ふだ} が {見|み}えたら 、 ハヤテ さん の {判|はん} を {確|たし}かめよう 。', 'The cover\'s frame has a place marked "Warm here", and the box beside it holds a warm cloth. Once you can see the labels, check Hayate\'s stamp.'),
      T('{温|あたた}め{箱|ばこ} の {布|ぬの} を {使|つか}う か 、 {覆|おお}い に 「 ほのお 」 を {織|お}る 。 ハヤテ さん の {判|はん} は {丸|まる} 。 {名前|なまえ} の ない {丸|まる} の {箱|はこ} は ③ 。', 'Use the cloth from the warming box, or weave ほのお (flame) on the cover. Hayate\'s stamp is a circle; the box with no name and a circle is ③.'),
    ],
  });

  // ---- F5: A Room That Answers Twice (Lanternfall, the listening corner of the Garden Quarter) ----------
  // A chime in a stone alcove sends its note down bamboo tubes. Explicit
  // channel model: from the alcove a left tube (mouth curtain mL) runs to a
  // flap B that turns either to the reading nook, where Fumi reads, or up into
  // a cross tube over the alcove to the display niche; a right tube (curtain
  // mR) runs straight to the display niche. The note must reach the display
  // and not the nook. Valid arrangements: mR open with mL drawn (any B); or
  // mL open with B to the cross tube (any mR).
  function route(st) {
    const nook = st.mL === 'open' && st.B === 'nook';
    const disp = st.mR === 'open' || (st.mL === 'open' && st.B === 'cross');
    return nook && disp ? 'both' : nook ? 'nook' : disp ? 'display' : 'lost';
  }
  const F5_SAY = {
    nook: T('{音|おと} は {左|ひだり} の {管|くだ} に {入|はい}り 、 {読書|どくしょ} {席|せき} へ {向|む}いた {仕切|しき}り を {通|とお}って 、 フミ さん の {横|よこ} に {出|で}た 。 フミ さん は {本|ほん} から {顔|かお} を {上|あ}げ 、 {指|ゆび} で {頁|ページ} を {押|お}さえて 、 {静|しず}か に なる の を {待|ま}った 。', 'The note runs into the left tube, past the flap turned toward the reading nook, and comes out beside Fumi. She looks up from her book, keeps her place with a finger, and waits for quiet.'),
    both: T('{音|おと} は {二|ふた}つ に {分|わ}かれた 。 {右|みぎ} の {管|くだ} から {展示|てんじ} の {棚|たな} へ ── {紙|かみ} の {花|はな} が {回|まわ}る 。 {左|ひだり} の {管|くだ} から {読書|どくしょ} {席|せき} へ ── フミ さん が {顔|かお} を {上|あ}げて 、 {静|しず}か に なる の を {待|ま}った 。', 'The note splits: down the right tube to the display niche, where the paper flower turns — and down the left tube to the reading nook, where Fumi looks up and waits for quiet.'),
    lost: T('{両方|りょうほう} の {口|くち} に {幕|まく} が {下|お}りて いる 。 {音|おと} は {布|ぬの} に {吸|す}われ 、 どこ に も {届|とど}かなかった 。', 'Both tube mouths are curtained. The note dies in the cloth and arrives nowhere.'),
    right: T('{音|おと} は {右|みぎ} の {管|くだ} を {下|くだ}って {展示|てんじ} の {棚|たな} に {届|とど}いた 。 {紙|かみ} の {花|はな} が くるり と {回|まわ}り 、 {紙|かみ} の {鈴|すず} が {揺|ゆ}れる 。 {読書|どくしょ} {席|せき} は {静|しず}か な まま だ 。', 'The note runs down the right tube into the display niche. The paper flower turns, and its little paper bell swings. The reading nook stays quiet.'),
    cross: T('{音|おと} は {左|ひだり} の {管|くだ} に {入|はい}り 、 {仕切|しき}り で {上|うえ} の {渡|わた}り{管|くだ} へ {曲|ま}がって 、 {祠|ほこら} の {上|うえ} を {越|こ}え 、 {展示|てんじ} の {棚|たな} に {降|お}りた 。 {紙|かみ} の {花|はな} が くるり と {回|まわ}る 。 {読書|どくしょ} {席|せき} は {静|しず}か な まま だ 。', 'The note runs into the left tube; at the flap it turns up into the cross tube, over the alcove, and down into the display niche. The paper flower turns. The reading nook stays quiet.'),
  };
  const F5_SEND = (st) => { const r = route(st); return r === 'display' ? (st.mR === 'open' ? [F5_SAY.right] : [F5_SAY.cross]) : r === 'both' ? [F5_SAY.both] : r === 'nook' ? [F5_SAY.nook, T('（ {仕切|しき}り も {幕|まく} も 、 {今|いま} の まま 。 {何度|なんど} でも {試|ため}せる 。 ）', '(The flap and the curtains stay as you set them. Try again whenever you like.)')] : [F5_SAY.lost]; };
  const F5_ARR = (st) => st.mR === 'open' && st.mL === 'drawn'
    ? T('{左|ひだり} の {口|くち} に {幕|まく} 、 {右|みぎ} の {口|くち} を {開|あ}けて 、 {右|みぎ} の {管|くだ} だけ を {通|とお}す 。', 'Left mouth curtained, right mouth open: the note goes by the right tube only.')
    : T('{仕切|しき}り を {渡|わた}り{管|くだ} に {向|む}けて 、 {左|ひだり} の {管|くだ} から {祠|ほこら} の {上|うえ} を {越|こ}えて {送|おく}る 。', 'The flap turned to the cross tube: the note goes by the left tube and over the alcove.');
  const toggles = (key, a, b, jpA, enA, jpB, enB) => [
    { act: key + '_toggle', obj: key, if: { [key]: a }, set: { [key]: b, sent: 'none' }, say: T(jpA, enA) },
    { act: key + '_toggle', obj: key, if: { [key]: b }, set: { [key]: a, sent: 'none' }, say: T(jpB, enB) },
  ];
  FW.define({
    id: 'f5', region: 'lanternfall', map: 'lf.gardens',
    title: T('{二度|にど} {答|こた}える {部屋|へや}', 'A Room That Answers Twice'),
    eligible: null,
    init: { mL: 'open', mR: 'drawn', B: 'nook', sent: 'none' },
    values: { mL: ['open', 'drawn'], mR: ['open', 'drawn'], B: ['nook', 'cross'], sent: ['none', 'nook', 'display', 'both', 'lost'] },
    solved: { mL: 'drawn', mR: 'open', B: 'nook', sent: 'display' },
    objects: {
      nook: {
        x: 15, y: 13, tall: 1.2, weave: true, name: T('{読書|どくしょ} {席|せき}', 'the reading nook'),
        look: [{ ifs: 'lf_bell_rung|post', jp: '{小|ちい}さな {屋根|やね} の {付|つ}いた {読書|どくしょ} {席|せき} 。 フミ さん が {本|ほん} を {読|よ}んで いる 。 {左|ひだり} の {管|くだ} の {先|さき} が 、 ここ に {開|ひら}いて いる 。', en: 'A little roofed reading seat. Fumi is reading here. The end of the left tube opens beside her.' },
          { jp: '{小|ちい}さな {屋根|やね} の {付|つ}いた {読書|どくしょ} {席|せき} 。 {誰|だれ} か が {本|ほん} を {読|よ}んで いる 。 {左|ひだり} の {管|くだ} の {先|さき} が 、 ここ に {開|ひら}いて いる 。', en: 'A little roofed reading seat, in use: someone is reading here. The end of the left tube opens beside her.' }],
      },
      B: {
        x: 16, y: 13, tall: 1.1, name: T('{分|わ}かれ{道|みち} の {仕切|しき}り', 'the junction flap'),
        look: [
          { if: { B: 'cross' }, jp: '{左|ひだり} の {管|くだ} の {分|わ}かれ{目|め} の {仕切|しき}り 。 {今|いま} は {上|うえ} の {渡|わた}り{管|くだ} に {向|む}いて いる 。 {渡|わた}り{管|くだ} は {祠|ほこら} の {上|うえ} を {越|こ}えて 、 {展示|てんじ} の {棚|たな} へ {降|お}りる 。', en: 'The flap where the left tube forks. It\'s turned up into the cross tube, which runs over the alcove and down to the display niche.' },
          { jp: '{左|ひだり} の {管|くだ} の {分|わ}かれ{目|め} の {仕切|しき}り 。 {今|いま} は {読書|どくしょ} {席|せき} に {向|む}いて いる 。 {反対|はんたい} に {倒|たお}せば 、 {上|うえ} の {渡|わた}り{管|くだ} へ {通|つう}じる 。', en: 'The flap where the left tube forks. It\'s turned toward the reading nook; flipped over, it would open into the cross tube above.' },
        ],
      },
      mL: {
        x: 17, y: 13, tall: 1.1, name: T('{左|ひだり} の {口|くち} の {幕|まく}', 'the left mouth curtain'),
        look: [
          { if: { mL: 'drawn' }, jp: '{左|ひだり} の {管|くだ} の {口|くち} に 、 {布|ぬの} の {幕|まく} が {下|お}りて いる 。', en: 'A cloth curtain hangs across the mouth of the left tube.' },
          { jp: '{左|ひだり} の {管|くだ} の {口|くち} 。 {布|ぬの} の {幕|まく} は {巻|ま}き{上|あ}げて ある 。', en: 'The mouth of the left tube. Its cloth curtain is rolled up.' },
        ],
      },
      alcove: {
        x: 18, y: 13, tall: 1.3, name: T('{石|いし} の {祠|ほこら}', 'the stone alcove'),
        look: [{ obs: 'alcove', jp: '{小|ちい}さな {石|いし} の {祠|ほこら} に 、 {吊|つ}り{鐘|がね} と {木|き} の {撞木|しゅもく} 。 {祠|ほこら} の {左右|さゆう} から 、 {竹|たけ} の {管|くだ} が {出|で}て いる 。', en: 'A little stone alcove with a hanging chime and a wooden striker. Bamboo tubes lead out of it to the left and the right.' }],
      },
      mR: {
        x: 19, y: 13, tall: 1.1, name: T('{右|みぎ} の {口|くち} の {幕|まく}', 'the right mouth curtain'),
        look: [
          { if: { mR: 'open' }, jp: '{右|みぎ} の {管|くだ} の {口|くち} 。 {布|ぬの} の {幕|まく} は {巻|ま}き{上|あ}げて ある 。', en: 'The mouth of the right tube. Its cloth curtain is rolled up.' },
          { jp: '{右|みぎ} の {管|くだ} の {口|くち} に 、 {布|ぬの} の {幕|まく} が {下|お}りて いる 。', en: 'A cloth curtain hangs across the mouth of the right tube.' },
        ],
      },
      display: {
        x: 20, y: 13, tall: 1.2, name: T('{展示|てんじ} の {棚|たな}', 'the display niche'),
        look: [{ jp: '{小|ちい}さな {展示|てんじ} の {棚|たな} 。 {紙|かみ} の {鈴蘭|すずらん} が {一輪|いちりん} 。 {音|おと} が {届|とど}く と {回|まわ}る {仕掛|しか}け 。 {誰|だれ} も いない 。 {右|みぎ} の {管|くだ} と 、 {上|うえ} の {渡|わた}り{管|くだ} が 、 ここ に {来|き}て いる 。', en: 'A small display niche holding one paper lily-of-the-valley, made to turn when a sound arrives. Nobody is here. The right tube and the cross tube both end here.' }],
      },
      diagram: {
        x: 21, y: 13, tall: 0.9, name: T('{管|くだ} の {図|ず}', 'the tube diagram'),
        look: [
          { done: true, fn: (st) => [T('{管|くだ} の {図|ず} の {横|よこ} に 、 {白墨|はくぼく} で {書|か}き{足|た}して ある 。 「 {読書|どくしょ} の {邪魔|じゃま} を しない {通|とお}し{方|かた} 」 。', 'Chalked beside the tube diagram: "A way through that doesn\'t disturb the reader:"'), F5_ARR(st)] },
          { obs: 'diagram', lines: [
            T('{管|くだ} の {図|ず} 。 {祠|ほこら} から {左|ひだり} の {管|くだ} → {仕切|しき}り 。 {仕切|しき}り から {一方|いっぽう} は {読書|どくしょ} {席|せき} 、 {一方|いっぽう} は {上|うえ} の {渡|わた}り{管|くだ} → {展示|てんじ} の {棚|たな} 。', 'A diagram of the tubes: from the alcove, a left tube to a flap; from the flap, one way to the reading nook, the other up into a cross tube that ends at the display niche.'),
            T('{祠|ほこら} から {右|みぎ} の {管|くだ} → {展示|てんじ} の {棚|たな} 。 {左右|さゆう} の {口|くち} に は {幕|まく} 。 {下|した} に 「 {読書|どくしょ} {中|ちゅう} の {人|ひと} が いる とき は 、 {鐘|かね} を {読書|どくしょ} {席|せき} に {送|おく}らないで 」 。', 'From the alcove, a right tube straight to the display niche. A curtain at each tube\'s mouth. Beneath: "When someone is reading, please don\'t send the chime to the reading nook."'),
          ] },
        ],
      },
    },
    rules: [
      ...toggles('mL', 'open', 'drawn', '{左|ひだり} の {口|くち} に {幕|まく} を {下|お}ろした 。', 'You let the curtain down over the left tube\'s mouth.', '{左|ひだり} の {口|くち} の {幕|まく} を {巻|ま}き{上|あ}げた 。', 'You roll up the curtain on the left tube\'s mouth.'),
      ...toggles('mR', 'drawn', 'open', '{右|みぎ} の {口|くち} の {幕|まく} を {巻|ま}き{上|あ}げた 。', 'You roll up the curtain on the right tube\'s mouth.', '{右|みぎ} の {口|くち} に {幕|まく} を {下|お}ろした 。', 'You let the curtain down over the right tube\'s mouth.'),
      ...toggles('B', 'nook', 'cross', '{仕切|しき}り を {倒|たお}して 、 {上|うえ} の {渡|わた}り{管|くだ} に {向|む}けた 。', 'You flip the flap over, turning it up into the cross tube.', '{仕切|しき}り を {戻|もど}して 、 {読書|どくしょ} {席|せき} に {向|む}けた 。', 'You flip the flap back toward the reading nook.'),
      { act: 'strike', obj: 'alcove', set: (st) => ({ sent: route(st) }), say: (b, a) => F5_SEND(a), fx: 'chime', obs: 'captions' },
      { weave: 'bell', obj: 'alcove', set: (st) => ({ sent: route(st) }), say: (b, a) => F5_SEND(a), fx: 'chime', obs: 'captions' },
      { weave: 'bell', obj: ['nook', 'B', 'mL', 'mR', 'display', 'diagram'],
        say: T('{澄|す}んだ {音|おと} が {庭|にわ} に {響|ひび}いた 。 {管|くだ} が {運|はこ}ぶ の は 、 {祠|ほこら} に {入|はい}った {音|おと} だけ だ 。', 'A clear note rings out across the garden. The tubes only carry what goes into the alcove.') },
      { weave: 'wind', obj: ['alcove', 'mL', 'mR', 'B'],
        say: T('{風|かぜ} が {管|くだ} を {抜|ぬ}けて 、 かすか に {鳴|な}った 。 {鐘|かね} の {音|おと} で は ない 。', 'Wind passes through the tubes with a faint hum. It isn\'t the chime\'s note.') },
    ],
    // a signal counts only when it reaches the display and not the nook
    complete: { sent: 'display' },
    after_acts: ['strike'], // the chime can still be struck afterwards: the note goes the confirmed way
    solvedSay: T('{展示|てんじ} の {花|はな} は 、 もう {正|ただ}しい {道|みち} で {鳴|な}った 。', 'The display\'s flower has already rung by the right way.'),
    methods: [{ id: 'rung', rule: 'bell' }, { id: 'struck', rule: 'strike' }],
    resetSay: T('{幕|まく} と {仕切|しき}り を 、 {最初|さいしょ} の {形|かたち} に {戻|もど}した 。', 'You set the curtains and the flap back as they were.'),
    reward: {
      keepsake: 'bell_clapper',
      say: [T('{図|ず} の {下|した} の {小箱|こばこ} に 、 {予備|よび} の {小|ちい}さな {撞木|しゅもく} が {並|なら}んで いる 。 {札|ふだ} に 「 {音|おと} の {通|とお}り{道|みち} の {記念|きねん} に 、 お{一|ひと}つ どうぞ 」 。', 'In a small box under the diagram lie spare miniature clappers. A card: "Take one, to remember the way the sound goes."'),
        T('{一|ひと}つ {手|て} に {取|と}った 。 {祠|ほこら} の {本物|ほんもの} の {撞木|しゅもく} は 、 その まま {吊|つ}って ある 。', 'You take one. The real striker in the alcove stays on its cord.')],
    },
    hints: [
      T('{祠|ほこら} に {入|はい}った {音|おと} は 、 どこ へ {行|い}く だろう 。 {図|ず} に {管|くだ} が {全部|ぜんぶ} {描|か}いて ある 。', 'Where does a sound sent into the alcove go? The diagram shows every tube.'),
      T('{音|おと} は {展示|てんじ} の {棚|たな} に {届|とど}いて 、 {読書|どくしょ} {席|せき} に は {届|とど}かない こと 。 {左右|さゆう} の {幕|まく} と {仕切|しき}り で 、 {行|い}き{先|さき} が {変|か}わる 。', 'The note must reach the display niche and not the reading nook. The two curtains and the flap change where it can go.'),
      T('{左|ひだり} の {幕|まく} を {下|お}ろして {右|みぎ} の {幕|まく} を {上|あ}げる か 、 {仕切|しき}り を {渡|わた}り{管|くだ} に {向|む}ける 。 それ から {鐘|かね} を {打|う}つ （ または {祠|ほこら} に 「 すず 」 か 「 こえ 」 を {織|お}る ） 。', 'Either let the left curtain down and roll the right one up, or flip the flap toward the cross tube. Then strike the chime (or weave すず or こえ — bell, voice — in the alcove).'),
    ],
  });

  // ---- F6: The Unbound Index (the Last Lamp Hut, below the Archive) ---------------------------------------
  // Oyone's index box for travellers has three public folders; three slips
  // have fallen out. The rule on the lid: notched slips go to Held for
  // collection; the others go up or down by the direction of their pressed
  // stamp. The notches can be seen; the stamps are too faint until raking
  // light (a light weave) or a charcoal rubbing brings them up. The slips
  // are filed through an arrangement sheet; wrong placements stay editable
  // and, when asked, say which visible rule they break. Optional, safe, and
  // closed during the descent after the last battle (until the walk home is over).
  const SLIPS = {
    s1: { jp: '{急|きゅう} な {坂|さか} で は 、 {左|ひだり} の {端|はし} を {歩|ある}く こと 。', en: 'On the steep slope, keep to the left edge.', notch: false, mark: 'down' },
    s2: { jp: '{青|あお}い {毛糸|けいと} の {手袋|てぶくろ} 、 {片方|かたほう} 。 {棚|たな} に あり 。', en: 'One blue wool glove. On the shelf.', notch: true, mark: 'up' },
    s3: { jp: '{昼|ひる} を {過|す}ぎる と 、 {石段|いしだん} が {凍|こお}る 。', en: 'After midday the stone steps freeze.', notch: false, mark: 'up' },
  };
  const FOLDERS = {
    up: T('{上|のぼ}り', 'Going up'),
    down: T('{下|くだ}り', 'Coming down'),
    held: T('{預|あず}かり{物|もの}', 'Held for collection'),
  };
  const RIGHT = (k) => (SLIPS[k].notch ? 'held' : SLIPS[k].mark);
  FW.define({
    id: 'f6', region: 'archive_road', map: 'sa.hut',
    title: T('{綴|と}じ{忘|わす}れ の {索引|さくいん}', 'The Unbound Index'),
    eligible: '!sa_descent|sa_done|post',
    init: { marks: 'hidden', how: 'none', s1: 'loose', s2: 'loose', s3: 'loose' },
    values: { marks: ['hidden', 'shown'], how: ['none', 'lit', 'rubbed'], s1: ['loose', 'up', 'down', 'held'], s2: ['loose', 'up', 'down', 'held'], s3: ['loose', 'up', 'down', 'held'] },
    solved: { marks: 'shown', how: 'rubbed', s1: 'down', s2: 'held', s3: 'up' },
    arrange: ['s1', 's2', 's3'], arrangeObj: 'box',
    slips: SLIPS, folders: FOLDERS,
    // what "Check against the rule" says about each slip (only visible facts)
    check(st) {
      const out = [];
      for (const k of ['s1', 's2', 's3']) {
        const n = { s1: '①', s2: '②', s3: '③' }[k], at = st[k], want = RIGHT(k);
        if (at === 'loose') { out.push({ k, ok: false, jp: n + ' は まだ どこ に も {入|はい}って いない 。', en: 'Slip ' + n + ' isn\'t filed yet.' }); continue; }
        if (SLIPS[k].notch) out.push(at === 'held' ? { k, ok: true, jp: n + ' に は {切|き}り{込|こ}み が ある 。 「 {預|あず}かり{物|もの} 」 で {合|あ}って いる 。', en: 'Slip ' + n + ' has a notch: Held for collection is right.' } : { k, ok: false, jp: n + ' の {縁|ふち} に は {切|き}り{込|こ}み が ある 。 {蓋|ふた} の {決|き}まり で は 、 {切|き}り{込|こ}み の ある {札|ふだ} は 「 {預|あず}かり{物|もの} 」 へ 。', en: 'Slip ' + n + ' has a notch in its edge. The rule on the lid sends notched slips to Held for collection.' });
        else if (at === 'held') out.push({ k, ok: false, jp: n + ' に は {切|き}り{込|こ}み が ない 。 「 {預|あず}かり{物|もの} 」 は {切|き}り{込|こ}み の ある {札|ふだ} の {綴|つづ}り だ 。', en: 'Slip ' + n + ' has no notch. Held for collection is only for notched slips.' });
        else if (st.marks !== 'shown') out.push({ k, ok: null, jp: n + ' の {押|お}し{印|いん} は {薄|うす}すぎて 、 {上向|うわむ}き か {下向|したむ}き か {分|わ}からない 。', en: 'Slip ' + n + '\'s pressed stamp is too faint to tell whether it points up or down.' });
        else out.push(at === want ? { k, ok: true, jp: n + ' の {押|お}し{印|いん} は ' + (want === 'up' ? '{上向|うわむ}き' : '{下向|したむ}き') + ' 。 {合|あ}って いる 。', en: 'Slip ' + n + '\'s stamp points ' + want + ': that\'s right.' } : { k, ok: false, jp: n + ' の {押|お}し{印|いん} は ' + (want === 'up' ? '{上向|うわむ}き' : '{下向|したむ}き') + ' 。 {決|き}まり で は 「 ' + (want === 'up' ? '{上|のぼ}り' : '{下|くだ}り') + ' 」 へ 。', en: 'Slip ' + n + '\'s stamp points ' + want + '. The rule sends it to ' + (want === 'up' ? 'Going up' : 'Coming down') + '.' });
      }
      return out;
    },
    objects: {
      box: {
        x: 7, y: 2, tall: 1, name: T('{索引|さくいん} {箱|ばこ}', 'the index box'),
        look: [
          { done: true, jp: '{索引|さくいん} {箱|ばこ} の {綴|つづ}り は 、 きちんと {揃|そろ}って いる 。 「 {上|のぼ}り 」 「 {下|くだ}り 」 「 {預|あず}かり{物|もの} 」 。', en: 'The index box\'s folders stand in order: Going up, Coming down, Held for collection.' },
          { obs: 'rule', lines: [
            T('{壁|かべ} の {索引|さくいん} {箱|ばこ} に 、 {旅人|たびびと} {向|む}け の {綴|つづ}り が {三|みっ}つ 。 「 {上|のぼ}り 」 「 {下|くだ}り 」 「 {預|あず}かり{物|もの} 」 。 「 {預|あず}かり{物|もの} 」 の {見出|みだ}し に は {切|き}り{込|こ}み が ある 。', 'On the wall, an index box of three folders for travellers: Going up, Coming down, Held for collection. The Held for collection tab has a notch cut in it.'),
            T('{蓋|ふた} の {裏|うら} に オヨネ の {字|じ} 。 「 {切|き}り{込|こ}み の ある {札|ふだ} は 「 {預|あず}かり{物|もの} 」 へ 。 ない {札|ふだ} は 、 {押|お}し{印|いん} が {上向|うわむ}き なら 「 {上|のぼ}り 」 、 {下向|したむ}き なら 「 {下|くだ}り 」 へ 。 」', 'Inside the lid, in Oyone\'s hand: "Slips with a notch go to Held for collection. Slips without: if the pressed stamp points up, to Going up; if down, to Coming down."'),
          ] },
        ],
      },
      slips: {
        x: 9, y: 4, tall: 0.6, name: T('{外|はず}れた {札|ふだ}', 'the loose slips'),
        look: [
          { done: true, jp: '{札|ふだ} は みな {綴|つづ}り に {戻|もど}った 。 {盆|ぼん} に は {炭|すみ} と {薄紙|うすがみ} が {残|のこ}って いる 。', en: 'The slips are all back in their folders. Charcoal and thin paper are left on the tray.' },
          { fn: (st) => [T('{盆|ぼん} の {上|うえ} に 、 {索引|さくいん} の {札|ふだ} が {三枚|さんまい} 。 {横|よこ} に {炭|すみ} の {棒|ぼう} と {薄紙|うすがみ} 。', 'On a tray: three index slips, and beside them a stick of charcoal and some thin paper.')]
            .concat(['s1', 's2', 's3'].map((k) => {
              const S = SLIPS[k], n = { s1: '①', s2: '②', s3: '③' }[k];
              const edge = S.notch ? T('{縁|ふち} に {切|き}り{込|こ}み 。', 'A notch in its edge.') : T('{縁|ふち} は まっすぐ 。', 'A straight edge.');
              const mk = st.marks === 'shown' ? (S.mark === 'up' ? T('{押|お}し{印|いん} は {上向|うわむ}き の {山形|やまがた} ▲ 。', 'Pressed stamp: a chevron pointing up ▲.') : T('{押|お}し{印|いん} は {下向|したむ}き の {山形|やまがた} ▼ 。', 'Pressed stamp: a chevron pointing down ▼.')) : T('{押|お}し{印|いん} は {薄|うす}くて {形|かたち} が {分|わ}からない 。', 'A pressed stamp, too faint to make out.');
              return T(n + ' 「 ' + S.jp + ' 」 ' + edge.jp + ' ' + mk.jp, n + ' "' + S.en + '" ' + edge.en + ' ' + mk.en);
            })), obs: 'slips' },
        ],
      },
    },
    rules: [
      { act: 'rub', obj: 'slips', if: { marks: 'hidden' }, set: { marks: 'shown', how: 'rubbed' }, obs: 'marks',
        say: T('{札|ふだ} に {薄紙|うすがみ} を {当|あ}て 、 {炭|すみ} で {軽|かる}く こすった 。 {押|お}し{印|いん} が {黒|くろ}く {浮|う}かんだ 。 ① は {下向|したむ}き ▼ 、 ② と ③ は {上向|うわむ}き ▲ 。', 'You lay thin paper over each slip and rub it lightly with the charcoal. The pressed stamps come up dark: ① points down ▼; ② and ③ point up ▲.') },
      { act: 'rub', obj: 'slips', if: { marks: 'shown' },
        say: T('{押|お}し{印|いん} は もう はっきり {見|み}えて いる 。', 'The stamps can already be seen clearly.') },
      { weave: 'light', obj: ['slips', 'box'], if: { marks: 'hidden' }, set: { marks: 'shown', how: 'lit' }, obs: 'marks',
        say: T('{光|ひかり} が {札|ふだ} の {上|うえ} を {横|よこ} から {低|ひく}く {走|はし}り 、 {浅|あさ}い {押|お}し{印|いん} に {小|ちい}さな {影|かげ} が できた 。 ① は {下向|したむ}き ▼ 、 ② と ③ は {上向|うわむ}き ▲ 。', 'Light runs low across the slips and the shallow stamps cast tiny shadows: ① points down ▼; ② and ③ point up ▲.') },
      { weave: 'light', obj: ['slips', 'box'],
        say: T('{押|お}し{印|いん} は もう {見|み}えて いる 。', 'The stamps can already be seen.') },
      { weave: 'wind', obj: ['slips', 'box'],
        say: T('{札|ふだ} が ふわり と {浮|う}いて 、 {同|おな}じ {所|ところ} に {落|お}ちた 。 {何|なに} も なくならない 。 {何|なに} も {片付|かたづ}かない 。', 'The slips lift, flutter, and settle back where they were. Nothing is lost — and nothing is sorted.') },
      { weave: 'fire', obj: ['slips', 'box'],
        say: T('{紙|かみ} の {近|ちか}く で {炎|ほのお} は {使|つか}わない 。', 'You don\'t use a flame near paper.') },
      { weave: 'water', obj: ['slips', 'box'],
        say: T('{水|みず} は {札|ふだ} の {墨|すみ} を {浮|う}かせて しまう 。 {手|て} を {止|と}めた 。', 'Water would lift the ink from the slips. You stop.') },
    ],
    complete: { marks: 'shown', s1: 'down', s2: 'held', s3: 'up' },
    solvedSay: T('{索引|さくいん} は もう {片付|かたづ}いて いる 。', 'The index is already in order.'),
    methods: [{ id: 'lit', if: { how: 'lit' } }, { id: 'rubbed', if: { how: 'rubbed' } }],
    resetSay: T('{札|ふだ} を {綴|つづ}り から {出|だ}して 、 {盆|ぼん} に {戻|もど}した 。', 'You take the slips out of the folders and put them back on the tray.'),
    reward: {
      keepsake: 'paperweight',
      say: [{ who: 'sa_oyone', jp: 'おや 、 {片付|かたづ}けて くれた の かい 。 {助|たす}かる よ 。 {箱|はこ} の {横|よこ} の {平|ひら}たい {石|いし} 、 {一|ひと}つ {持|も}って いき な 。 {紙|かみ} を {押|お}さえる の に 、 {沢|さわ} で {拾|ひろ}って {来|く}る ん だ 。 {上|うえ} は {風|かぜ} が {強|つよ}い から ね 。', en: 'Well, you\'ve sorted it for me? That\'s a help. Take one of those flat stones beside the box. I pick them up in the stream to hold papers down — it\'s windy up here.' },
        T('{手|て}の{平|ひら} に {収|おさ}まる 、 {滑|なめ}らか な {石|いし} を {一|ひと}つ {選|えら}んだ 。', 'You choose one smooth stone that fits your palm.')],
    },
    hints: [
      T('{蓋|ふた} の {裏|うら} の {決|き}まり を {読|よ}もう 。 {札|ふだ} の どこ を {見|み}れば いい だろう 。', 'Read the rule inside the lid. Which parts of a slip does it ask you to look at?'),
      T('{切|き}り{込|こ}み は {見|み}える 。 {押|お}し{印|いん} は {薄|うす}すぎる ので 、 まず {浮|う}かび{上|あ}がらせる 。 {低|ひく}い {光|ひかり} か 、 {炭|すみ} の こすり{出|だ}し で 。', 'The notches can be seen; the stamps are too faint, so bring them up first — with low light, or a charcoal rubbing.'),
      T('{札|ふだ} を {炭|すみ} で こする か 、 「 ひかり 」 を {織|お}る 。 ② （ {切|き}り{込|こ}み ） は 「 {預|あず}かり{物|もの} 」 、 ① （ ▼ ） は 「 {下|くだ}り 」 、 ③ （ ▲ ） は 「 {上|のぼ}り 」 。', 'Rub the slips with charcoal, or weave ひかり (light) on them. Then ② (notched) goes to Held for collection, ① (▼) to Coming down, ③ (▲) to Going up.'),
    ],
  });

  // repairs of invalid saved puzzle state run on every load (src/engine/80_save.js)
  if (RB.save && RB.save.addMigration) RB.save.addMigration((st) => FW.repair(st));
})(RB.fieldweave);
