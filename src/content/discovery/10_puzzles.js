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
        x: 32, y: 22, tall: 1.1, name: T('{札|ふだ} の {衝立|ついたて}', 'the slip screen'),
        look: [
          { done: true, lines: [T('{衝立|ついたて} は {柱|はしら} に {留|と}められて いる 。 {名札|なふだ} は {平|たい}ら に {乾|かわ}いて いて 、 どれ も {読|よ}める 。', 'The screen is clamped fast to its post. The name slips lie flat and dry; every one can be read.')] },
          { if: { held: true }, obs: 'still', jp: '{守|まも}り の {中|なか} で 、 {衝立|ついたて} は {柱|はしら} に {寄|よ}った まま {止|と}まって いる 。 {留|と}め{具|ぐ} は まだ {開|ひら}いて いる 。', en: 'Inside the ward the screen rests still against its post. The clamp is still open.' },
          { if: { screen: 'closed' }, obs: 'still', jp: '{衝立|ついたて} は {柱|はしら} に {寄|よ}せて {閉|し}めて ある 。 {川|かわ} の {風|かぜ} は {脇|わき} を {抜|ぬ}けて いく 。 {留|と}め{具|ぐ} は まだ {開|ひら}いて いる 。', en: 'The screen stands shut against its post; the draught off the river slides past it. The clamp is still open.' },
          { obs: 'draft', lines: [
            T('{葦|あし} の {紙|かみ} を {張|は}った {軽|かる}い {衝立|ついたて} 。 {名札|なふだ} が {何枚|なんまい} も {留|と}めて ある 。', 'A light screen of reed paper on a hinged frame, pinned with name slips.'),
            T('{川|かわ} から {風|かぜ} が {吹|ふ}く たび に 、 {衝立|ついたて} が {開|ひら}いて は {戻|もど}る 。 {札|ふだ} の {字|じ} は {揺|ゆ}れて 、 {読|よ}めない 。 {紙|かみ} {自体|じたい} は {乾|かわ}いて いる 。', 'Each gust off the river swings it open and back; the writing on the slips jerks past too fast to read. The paper itself is dry.'),
          ] },
        ],
      },
      clamp: {
        x: 33, y: 22, tall: 1, name: T('{留|と}め{具|ぐ}', 'the clamp'),
        look: [
          { done: true, jp: '{留|と}め{具|ぐ} が 、 {衝立|ついたて} の {端|はし} を {柱|はしら} に しっかり {押|お}さえて いる 。', en: 'The clamp holds the edge of the screen fast to its post.' },
          { jp: '{木|き} の ねじ{留|ど}め が 、 {柱|はしら} の {釘|くぎ} に {開|ひら}いた まま {掛|か}かって いる 。 {衝立|ついたて} の {端|はし} を {挟|はさ}む ため の もの だ 。', en: 'A wooden screw clamp hangs open on a nail in the post. It is meant to grip the edge of the screen.' },
        ],
      },
    },
    rules: [
      // ordinary actions (inspection menus)
      { act: 'close', obj: 'screen', if: { screen: 'swing', held: false, clamp: 'open' }, set: { screen: 'closed' }, obs: 'still',
        say: T('{風|かぜ} の {切|き}れ{目|め} に {衝立|ついたて} を {押|お}さえ 、 {柱|はしら} に {寄|よ}せて {閉|し}めた 。 {風|かぜ} は {脇|わき} を {抜|ぬ}けて いく 。 {今|いま} は {止|と}まって いる が 、 まだ {何|なに} も {留|と}めて いない 。', 'Between gusts you catch the screen and swing it shut against its post. The draught slides past it now. It is still — but nothing holds it yet.') },
      { act: 'open', obj: 'screen', if: { screen: 'closed', clamp: 'open' }, set: { screen: 'swing' },
        say: T('{手|て} を {放|はな}す と 、 {次|つぎ} の {風|かぜ} で {衝立|ついたて} は また {開|ひら}いた 。', 'You let go, and the next gust swings the screen open again.') },
      { act: 'clamp', obj: 'clamp', if: [{ screen: 'closed', clamp: 'open' }, { held: true, clamp: 'open' }], set: { clamp: 'set' },
        say: T('{衝立|ついたて} が {止|と}まって いる {間|あいだ} に 、 {留|と}め{具|ぐ} で {端|はし} を {挟|はさ}み 、 ねじ を {締|し}めた 。 {札|ふだ} が {平|たい}ら に なり 、 {字|じ} が {読|よ}める 。', 'While the screen is still, you close the clamp on its edge and turn the screw tight. The slips lie flat, and the writing can be read.') },
      { act: 'clamp', obj: 'clamp', if: { clamp: 'open' }, obs: 'swing',
        say: T('{風|かぜ} の たび に {衝立|ついたて} が {柱|はしら} から {離|はな}れる 。 {動|うご}く もの を 、 {留|と}め{具|ぐ} は {挟|はさ}めない 。', 'Each gust swings the screen away from the post. The clamp cannot close on an edge that will not keep still.') },
      // field weaves
      { weave: 'protect', obj: ['screen', 'clamp'], if: { screen: 'swing', held: false, clamp: 'open' }, set: { held: true }, fx: 'hold',
        say: T('{守|まも}り が {立|た}ち 、 {衝立|ついたて} を {柱|はしら} に {押|お}し{戻|もど}して {止|と}めた 。 {守|まも}り が {支|ささ}えて いる {間|あいだ} に 、 {何|なに} か で {留|と}めれば いい 。', 'A ward rises, presses the screen back against its post and holds it there. While the ward holds, something only has to fasten it.') },
      { weave: 'protect', obj: ['screen', 'clamp'], if: { held: true },
        say: T('{守|まも}り は もう {衝立|ついたて} を {支|ささ}えて いる 。', 'The ward is already holding the screen.') },
      { weave: 'protect', obj: ['screen', 'clamp'], if: { screen: 'closed' },
        say: T('{衝立|ついたて} は もう {閉|し}めて あって 、 {動|うご}いて いない 。 {守|まも}る もの が ない 。', 'The screen is already shut and not moving. There is nothing for the ward to hold.') },
      { weave: 'water', obj: 'screen', obs: 'dry',
        say: T('{札|ふだ} は {乾|かわ}いて いる 。 {水|みず} は {油|あぶら} を {引|ひ}いた {枠|わく} で {玉|たま} に なり 、 {字|じ} に {触|ふ}れず に {流|なが}れ{落|お}ちた 。 {濡|ぬ}らす {必要|ひつよう} は ない 。', 'The slips are dry. The water beads on the oiled frame and runs off without touching the writing. Nothing here needs wetting.') },
      { weave: 'water', obj: 'clamp',
        say: T('{水|みず} が {留|と}め{具|ぐ} を {伝|つた}って {落|お}ちた 。 {留|と}め{具|ぐ} は {固|かた}まって いる わけ で は ない 。 {動|うご}く {端|はし} を {挟|はさ}めない だけ だ 。', 'Water runs down the clamp. The clamp isn\'t stuck; it just can\'t close on a moving edge.') },
      { weave: 'light', obj: ['screen', 'clamp'], if: { screen: 'swing', held: false }, obs: 'draft',
        say: T('{光|ひかり} の {中|なか} で よく {見|み}える 。 {川|かわ} から {風|かぜ} が {来|く}る たび に 、 {衝立|ついたて} が {開|ひら}いて は {戻|もど}る 。 {光|ひかり} は {動|うご}き を {見|み}せる が 、 {止|と}め は しない 。', 'In the light you can see it plainly: each gust off the river swings the screen out and back. The light shows the movement; it doesn\'t stop it.') },
      { weave: 'wind', obj: ['screen', 'clamp'], if: { screen: 'swing' },
        say: T('{風|かぜ} が {増|ふ}えて 、 {衝立|ついたて} は もっと {大|おお}きく {揺|ゆ}れた 。', 'More wind only swings the screen harder.') },
      { weave: 'bind', obj: ['screen', 'clamp'], if: { clamp: 'open' },
        say: T('{縄|なわ} の {形|かたち} が {衝立|ついたて} に {絡|から}んで 、 すぐ {外|はず}れた 。 {揺|ゆ}れて いる {間|あいだ} は 、 {結|むす}ぶ {所|ところ} が ない 。', 'The shape of a rope loops the screen and slips off. While it swings there is nothing steady to tie it to.') },
    ],
    complete: { clamp: 'set' },
    solvedSay: T('{衝立|ついたて} は もう しっかり {留|と}めて ある 。 {何|なに} も {足|た}さなくて いい 。', 'The screen is already fastened. It needs nothing more.'),
    // the ward was a step: once the clamp holds, it lets go, and the screen stays shut
    after: { held: false, screen: 'closed' },
    methods: [{ id: 'screened', if: { screen: 'closed' } }, { id: 'warded', if: { held: true } }],
    marks: [{ obj: 'screen', if: { held: true }, mark: 'ward' }],
    reward: {
      keepsake: 'reed_boat',
      say: [T('{衝立|ついたて} の {裏|うら} 、 {軒下|のきした} の {乾|かわ}いた {棚|たな} に 、 {葦|あし} の {紙|かみ} で {折|お}った {小|ちい}さな {舟|ふね} が {並|なら}んで いる 。 {子|こ}ども の {字|じ} で 「 ひとつ どうぞ 」 。', 'Behind the screen, on a dry shelf under the eaves, sits a row of little boats folded from reed paper, and a note in a child\'s hand: "Take one."'),
        T('{一|ひと}つ {手|て} に {取|と}った 。 {乾|かわ}いて いて 、 {軽|かる}い 。', 'You take one. It is dry, and very light.')],
    },
    hints: [
      T('{留|と}め{具|ぐ} が {閉|し}まらない の は なぜ だろう 。 しばらく {衝立|ついたて} を {見|み}て みよう 。', 'Why won\'t the clamp close? Watch the screen for a while.'),
      T('{衝立|ついたて} が {少|すこ}し の {間|あいだ} {止|と}まって いれば いい 。 {風|かぜ} を よける か 、 {何|なに} か で {支|ささ}える か 。', 'The screen only needs to keep still for a moment: keep the draught off it, or hold it some other way.'),
      T('{衝立|ついたて} を {調|しら}べて {柱|はしら} に {閉|し}め 、 {留|と}め{具|ぐ} を {締|し}める 。 または 、 {衝立|ついたて} に 「 まもる 」 を {織|お}って {支|ささ}え 、 {留|と}め{具|ぐ} を {締|し}める 。', 'Look at the screen and swing it shut against its post, then close the clamp. Or weave まもる (protect) on the screen to hold it, then close the clamp.'),
    ],
  });

  // repairs of invalid saved puzzle state run on every load (src/engine/80_save.js)
  if (RB.save && RB.save.addMigration) RB.save.addMigration((st) => FW.repair(st));
})(RB.fieldweave);
