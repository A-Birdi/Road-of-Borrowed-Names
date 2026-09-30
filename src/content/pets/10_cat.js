/* Pet vignette: the cat — "A Dry Corner" (addendum §5.2). Reedwake, from the
 * Chapter 1 resolution (rw_echo_done) on, for good (postgame too).
 *
 * Where: the corner under the carpenter's east eave (rw.village, 14–16 × 23),
 * beside the hay and clear of every path, door and person.
 * Cause (visible and inspectable): a ginger cat keeps creeping toward the dry
 * corner and backing off, because an old reed screen leaning there has slipped
 * off its stone and knocks against the wall in the draught.
 * State (var.pet_cat): 0 not looked at, 1 looked at, 2 the screen is steady.
 * Ordinary route: look at the screen, then set its foot back on the stone OR
 * tie its cord to the nail (either is enough). Then the cat comes in and curls
 * up; offer a hand or sit nearby and wait (no timer, no stealth, no speed), it
 * comes to you, and it is invited — or "Not now", and it stays in its corner.
 * Field route (RB.pets.vignetteAction('cat', family)): 'bind' (a rope word ties
 * the screen) or 'stone' (a stone word steadies its foot) moves the same state
 * to 2, recording the method; nothing else differs.
 * Late entry: a save already past Chapter 1 finds it the next time it passes
 * through Reedwake; a companion mentions it once. Nothing is missable. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const map = C.maps['rw.village'];
  const CORNER = [15, 23], WATCH = [16, 23], SCREEN = [14, 23];
  const ON = 'rw_echo_done';

  // ---- props: the reed screen (loose / steadied) and the cat's spot ---------------------------------------
  const K = RB.propKit;
  const LOOP = 5600, KNOCK = 3000;
  function screenArt(id, fixed) {
    RB.props.P[id] = {
      id, w: 1, h: 1, block: true,
      draw(c, x, y, pal, t, o) { c.save(); c.scale(0.5, 0.5); this.draw2(c, x * 2, y * 2, pal, t, o); c.restore(); },
      draw2(c, x, y, pal, t, o) {
        o = o || {};
        // the loose screen swings out at its foot and knocks back (frame from the same clock as the cat's loop)
        const ph = (t || 0) % LOOP;
        const sw = fixed || o.still ? 0 : ph > KNOCK - 300 && ph < KNOCK ? Math.round(((ph - (KNOCK - 300)) / 300) * 3) : ph >= KNOCK && ph < KNOCK + 90 ? 1 : 0;
        const key = id + '|' + K.palInfo(pal).key + '|' + sw + '|' + (o.by || '');
        const cv = K.cached(key, () => K.make(24, 44, (g) => {
          const M = K.mat(pal), reed = K.FIX.straw, wd = M.wood;
          // leaning split reeds (straw-coloured): thin vertical slats, dark binding threads across, the foot
          // pushed out by `sw`; the side toward the light a step lighter
          for (let r = 0; r < 34; r++) {
            const off = Math.round((r / 33) * sw) + Math.round(r / 11);
            for (let i = 0; i < 14; i++) K.R(g, 3 + i + off, 6 + r, 1, 1, i % 2 === 0 ? reed[i < 5 ? 3 : 2] : reed[i < 5 ? 2 : 1]);
            if (r % 7 === 3) K.R(g, 3 + off, 6 + r, 14, 1, '#6a4a2a'); // the binding threads across
          }
          K.R(g, 3, 4, 14, 3, wd[2]); K.R(g, 3, 4, 14, 1, wd[4]); // the top rod
          if (fixed && o.by === 'cord') { K.line(g, 10, 5, 3, 2, '#8a6a4a', 1); K.R(g, 2, 1, 2, 2, '#46444f'); }        // tied to the nail
          else { K.line(g, 12, 7, 13 + sw, 16, '#8a6a4a', 1); K.R(g, 2, 1, 2, 2, '#46444f'); }                         // the cord hanging loose
          if (fixed && o.by === 'stone') { K.R(g, 5, 38, 13, 4, M.stone[2]); K.R(g, 5, 38, 13, 1, M.stone[4]); K.R(g, 6, 41, 12, 1, M.stone[0]); }
          else K.R(g, 2, 40, 9, 3, M.stone[1]);                                                                     // the stone it slipped off
          K.outline(g, 24, 44, 'sel');
          g.globalCompositeOperation = 'destination-over';
          K.shadow(g, 11, 42, 9, 2.5, 0.3);
          g.globalCompositeOperation = 'source-over';
        }));
        c.drawImage(cv, x - 2, y - 14);
      },
    };
  }
  screenArt('pet_screen', false);
  screenArt('pet_screen_fixed', true);
  // an animal's spot: nothing drawn (the animal is drawn by RB.petWorld); it makes the spot something you can look at
  if (!RB.props.P.pet_spot) {
    RB.props.P.pet_spot = { id: 'pet_spot', w: 1, h: 1, block: true, draw() {}, draw2() {} };
  }

  map.props.push(
    { p: 'pet_screen', x: SCREEN[0], y: SCREEN[1], scene: 'pets.cat.screen', if: ON + '&var.pet_cat<2' },
    { p: 'pet_screen_fixed', x: SCREEN[0], y: SCREEN[1], scene: 'pets.cat.screen', if: ON + '&var.pet_cat>=2&!pet_cat_by_cord', o: { by: 'stone' } },
    { p: 'pet_screen_fixed', x: SCREEN[0], y: SCREEN[1], scene: 'pets.cat.screen', if: ON + '&var.pet_cat>=2&pet_cat_by_cord', o: { by: 'cord' } },
    { p: 'pet_spot', x: CORNER[0], y: CORNER[1], w: 2, scene: 'pets.cat.cat', if: ON + '&!pet.cat' },
  );
  // late entry: once, a companion notices (only when nothing else is waiting to run here)
  map.onEnter = (map.onEnter || []).concat([{ scene: 'pets.cat.notice', if: ON + '&!pet.cat&!seen.pets.cat.cat&!seen.pets.cat.screen&comp', once: true }]);

  // ---- the cat before it joins you (drawn by RB.petWorld; never solid, never an actor) ---------------------------
  const V = { near: null, settledAt: 0 };
  const sm = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  RB.petWorld.addWild({
    id: 'cat', species: 'cat', look: 'ginger', map: 'rw.village',
    show: (s) => RB.state.test(s, ON + '&!pet.cat'),
    place(s, t, reduce) {
      const step = (s.vars && s.vars.pet_cat) || 0;
      // invited closer (the meeting): it comes to sit beside you
      if (V.near) {
        const k = reduce ? 1 : Math.min(1, (performance.now() - V.near.t0) / 900);
        const [ax, ay] = V.near.from, [bx, by] = V.near.to;
        return { x: ax + (bx - ax) * sm(k), y: ay + (by - ay) * sm(k), dir: k < 1 ? V.near.dir : V.near.face, po: k < 1 ? { gait: 'walk', ph: (t / 380) % 1 } : { sit: 1, hp: -10 } };
      }
      if (step >= 2) {
        // the screen is steady: it curls up in the dry corner and dozes
        const blink = !reduce && (t % 4200) < 180;
        return { x: CORNER[0], y: CORNER[1], dir: 'down', po: { lie: 1, blink: blink ? 1 : 0.5 } };
      }
      if (reduce) return { x: WATCH[0], y: WATCH[1], dir: 'left', po: { sit: 1, earF: -0.4 } };
      // creeps toward the corner, the screen knocks, it backs off (the same clock as the screen's swing)
      const ph = t % LOOP;
      if (ph < 1800) return { x: WATCH[0], y: WATCH[1], dir: 'left', po: { sit: 1, tFlick: ph > 900 && ph < 1300 ? 24 : 0 } };
      if (ph < 2500) { const k = (ph - 1800) / 700; return { x: WATCH[0] - k, y: WATCH[1], dir: 'left', po: { gait: 'walk', ph: (t / 380) % 1 } }; }
      if (ph < KNOCK) return { x: CORNER[0], y: CORNER[1], dir: 'left', po: { hp: 12, nose: 1 } };
      if (ph < KNOCK + 220) return { x: CORNER[0], y: CORNER[1], dir: 'left', po: { crouch: 1, earF: -1 } };
      if (ph < KNOCK + 700) { const k = (ph - KNOCK - 220) / 480; return { x: CORNER[0] + sm(k), y: CORNER[1], dir: 'right', po: { gait: 'run', ph: (t / 280) % 1 } }; }
      return { x: WATCH[0], y: WATCH[1], dir: ph < 4300 ? 'right' : 'left', po: { sit: ph < 4000 ? 0.5 : 1, earF: ph < 4600 ? -0.6 : 0 } };
    },
  });

  // ---- the vignette: its state machine, open to the field-weaving route ------------------------------------------
  function steady(s, how) {
    if (((s.vars && s.vars.pet_cat) || 0) >= 2 || RB.pets.record(s, 'cat')) return false;
    s.vars.pet_cat = 2;
    s.flags['pet_cat_by_' + how] = true;
    return true;
  }
  RB.pets.addVignette('cat', {
    species: 'cat', map: 'rw.village', families: ['bind', 'stone'],
    title: T('A Dry Corner', '{乾|かわ}いた {隅|すみ}'),
    met: T('Under the carpenter’s eaves in Reedwake, once the loose reed screen was steadied.', '{葦|あし}ノ{瀬|せ} の {大工|だいく} の {軒下|のきした} で 、 すだれ を {直|なお}した あと 。'),
    // a known, gentle field response steadies the same screen: 縄 ties it, 石 or 土 weighs its foot
    apply(s, family) { return steady(s, family === 'bind' ? 'cord' : 'stone'); },
    state: (s) => ({ step: (s.vars && s.vars.pet_cat) || 0, met: !!RB.pets.record(s, 'cat'), by: s.flags.pet_cat_by_cord ? 'cord' : s.flags.pet_cat_by_stone ? 'stone' : null }),
    stage(name) {
      const W = RB.world.W;
      if (name === 'near' && W.player) {
        // to a free tile at your side (left or right, where it is seen), then it sits and looks up
        const to = RB.petWorld.nearTile(CORNER, { own: [CORNER, [CORNER[0] + 1, CORNER[1]]], avoid: [SCREEN] });
        V.near = { t0: performance.now(), from: CORNER, to, dir: to[0] > CORNER[0] ? 'right' : to[0] < CORNER[0] ? 'left' : to[1] > CORNER[1] ? 'down' : 'up', face: RB.petWorld.faceFrom(to) };
        return new Promise((r) => setTimeout(r, RB.test && RB.test.auto ? 0 : 950));
      }
      if (name === 'back') { V.near = null; }
      return null;
    },
  });
  RB.bus.on('map:enter', () => { V.near = null; });

  // ---- the meeting memory ------------------------------------------------------------------------------------
  RB.pets.meeting.cat = {
    title: T('A Dry Corner', '{乾|かわ}いた {隅|すみ}'),
    text: T('Under the carpenter’s eaves in Reedwake, once the reed screen stopped knocking, a ginger cat came in out of the draught — and then came with you.', '{葦|あし}ノ{瀬|せ} の {大工|だいく} の {軒下|のきした} 。 すだれ が {鳴|な}らなく なる と 、 {茶|ちゃ}トラ の {猫|ねこ} が {風|かぜ} を {避|さ}けて {入|はい}って きた 。 そして 、 {一緒|いっしょ} に {来|く}る こと に なった 。'),
    reply: {
      nao: T('Cats pick their own places. You got picked.', '{猫|ねこ} は {自分|じぶん} で {場所|ばしょ} を {選|えら}ぶ 。 {選|えら}ばれた ん だ よ 。'),
      mio: T('That corner really was the only dry spot. I’m glad it trusted us with it.', 'あの {隅|すみ} 、 {本当|ほんとう} に {一番|いちばん} {乾|かわ}いて いた の 。 {任|まか}せて もらえて 、 よかった 。'),
      ren: T('One small repair, and there was somewhere to be. Most of my work is like that, when it goes well.', '{小|ちい}さな {修理|しゅうり} {一|ひと}つ で 、 {居場所|いばしょ} が できました 。 うまく いく {時|とき} の {仕事|しごと} は 、 だいたい そう です 。'),
      suzu: T('A headliner from opening night. I’ll have to work on my entrances.', '{初日|しょにち} から {主役|しゅやく} だ ね 。 わたし も {登場|とうじょう} の {仕方|しかた} を {練習|れんしゅう} しなきゃ 。'),
    },
  };

  RB.script.add(`
@scene pets.cat.notice
?(party=nao) nao: {大工|だいく} の {家|いえ} の {横|よこ} 、 {猫|ねこ} が うろうろ してる 。 || There's a cat hanging about by the carpenter's.
?(party=mio) mio: あら 。 {大工|だいく} さん の {家|いえ} の {横|よこ} に 、 {猫|ねこ} が いる 。 || Oh — there's a cat by the carpenter's house.
?(party=ren) ren: {大工|だいく} の {家|いえ} の {軒下|のきした} に 、 {猫|ねこ} が います ね 。 {落|お}ち{着|つ}かない よう です 。 || There's a cat under the carpenter's eaves. It doesn't look settled.
?(party=suzu) suzu: ね 、 {大工|だいく} さん の {家|いえ} の {横|よこ} 。 {猫|ねこ} が {出|で}たり {入|はい}ったり してる 。 || Look, by the carpenter's house. A cat, in and out, in and out.

@scene pets.cat.cat
!if var.pet_cat>=2 -> settled
narr: {茶|ちゃ}トラ の {猫|ねこ} が 、 {大工|だいく} の {家|いえ} の {軒下|のきした} に {近|ちか}づいて は 、 また {離|はな}れる 。 || A ginger cat keeps creeping in under the carpenter's eaves, then backing out again.
narr: {立|た}てかけた すだれ が {風|かぜ} で {揺|ゆ}れて 、 {壁|かべ} に コトン と {当|あ}たる 。 その たびに 、 {猫|ねこ} は {身|み} を {縮|ちぢ}める 。 || A reed screen leaning there swings in the draught and knocks against the wall. Each time, the cat flinches away.
?(party=nao) nao: あの すだれ だな 。 {鳴|な}る たびに {逃|に}げてる 。 || It's that screen. Every time it knocks, off it goes.
?(party=mio) mio: {乾|かわ}いた {場所|ばしょ} が ほしい だけ なのに ね 。 || All it wants is somewhere dry.
?(party=ren) ren: {風|かぜ} の {通|とお}り{道|みち} に 、 {落|お}ち{着|つ}かない {物|もの} が {一|ひと}つ 。 あれ です ね 。 || One restless thing in the draught's path. That's it, isn't it.
?(party=suzu) suzu: {入|はい}って は {出|で}て 、 {入|はい}って は {出|で}て 。 {舞台|ぶたい} の {袖|そで} で {待|ま}ってる みたい 。 || In, out, in, out. Like waiting in the wings.
!var pet_cat = 1
!end
:settled
narr: {猫|ねこ} は {乾|かわ}いた {隅|すみ} で {丸|まる}く なって 、 {目|め} を {細|ほそ}めて こちら を {見|み}て いる 。 || The cat is curled up in the dry corner, watching you through half-closed eyes.
!choice
* そっと {手|て} を {低|ひく}く {出|だ}す || Offer a hand, slowly and low. -> hand
* {近|ちか}く に {座|すわ}って {待|ま}つ || Sit down nearby and wait. -> sit
* そっと して おく || Leave it be. -> end
:hand
narr: {急|いそ}がず に {手|て} を {出|だ}す 。 {猫|ねこ} は しばらく {匂|にお}い を かいで から 、 {頭|あたま} を {手|て} に {押|お}しつけた 。 || You hold out a hand and don't hurry. After a while the cat sniffs it, then pushes its head into your palm.
!goto met
:sit
narr: {少|すこ}し {離|はな}れて 、 {腰|こし} を {下|お}ろす 。 {風|かぜ} の {音|おと} だけ が する 。 || You sit down a little way off. There is only the sound of the wind.
narr: やがて {猫|ねこ} は {起|お}き{上|あ}がって 、 あなた の {横|よこ} に {来|き}て {座|すわ}った 。 || In time the cat gets up, comes over, and sits down beside you.
:met
!hook pet_vig cat near
?(party=nao) nao[smirk]: {気|き} に {入|い}られた な 。 || It likes you.
?(party=mio) mio[smile]: {怖|こわ}くない って 、 わかった みたい 。 || I think it knows you're not frightening.
?(party=ren) ren: {猫|ねこ} は {道|みち} に {迷|まよ}わない そう です 。 {少|すこ}し うらやましい 。 || They say cats never lose their way. I'm a little envious.
?(party=suzu) suzu[laugh]: {客席|きゃくせき} が {一|ひと}つ 、 {埋|う}まった ! || One seat in the house, taken!
narr: {猫|ねこ} は あなた を {見上|みあ}げて 、 {動|うご}かない 。 {一緒|いっしょ} に {来|く}る {気|き} が ある よう だ 。 || The cat looks up at you and doesn't move off. It seems willing to come along.
!choice
* {一緒|いっしょ} に {来|く}る ? || Invite it to come with you. -> invite
* また {今度|こんど} ね || Not now. -> notnow
:invite
!hook pet_meet cat
!end
:notnow
!hook pet_vig cat back
narr: {猫|ねこ} は {隅|すみ} に {戻|もど}って 、 また {丸|まる}く なった 。 ここ に {来|く}れば 、 また {会|あ}える 。 || The cat goes back to its corner and curls up again. It will be here whenever you come by.

@scene pets.cat.screen
!if var.pet_cat>=2 -> fixed
narr: {古|ふる}い すだれ が 、 {大工|だいく} の {家|いえ} の {壁|かべ} に {立|た}てかけて ある 。 {下|した} の {端|はし} が {石|いし} から {外|はず}れて いて 、 {風|かぜ} が {吹|ふ}く と {揺|ゆ}れる 。 || An old reed screen leans against the carpenter's wall. Its foot has slipped off the stone it stood on, so it swings whenever the wind blows.
narr: {軒|のき} に は {古|ふる}い {釘|くぎ} が あって 、 すだれ の {上|うえ} から {紐|ひも} が {垂|た}れて いる 。 || There's an old nail under the eaves, and a cord hangs loose from the top of the screen.
!var pet_cat = 1
!choice
* すだれ の {下|した} を {石|いし} の {上|うえ} に {戻|もど}す || Set its foot back on the stone. -> stone
* {紐|ひも} を {釘|くぎ} に {結|むす}ぶ || Tie the cord to the nail. -> tie
* そのまま に して おく || Leave it for now. -> end
:stone
narr: すだれ の {下|した} を {平|たい}らな {石|いし} の {上|うえ} に {戻|もど}す 。 もう {揺|ゆ}れない 。 || You set the foot of the screen back on the flat stone. It stops swinging.
!var pet_cat = 2
!set pet_cat_by_stone
!goto after
:tie
narr: {紐|ひも} を {釘|くぎ} に しっかり {結|むす}ぶ 。 すだれ は {壁|かべ} に {沿|そ}って {静|しず}か に なった 。 || You tie the cord firmly to the nail. The screen lies quiet against the wall.
!var pet_cat = 2
!set pet_cat_by_cord
:after
?(party=nao) nao: よし 。 これで {音|おと} は しない 。 || There. No more knocking.
?(party=mio) mio: {静|しず}か に なった ね 。 {見|み}て 、 {来|く}る よ 。 || It's quiet now. Look — here it comes.
?(party=ren) ren: {小|ちい}さな {仕事|しごと} ほど 、 {大事|だいじ} です 。 || The small jobs matter most.
?(party=suzu) suzu: {舞台|ぶたい} {装置|そうち} 、 {固定|こてい} {完了|かんりょう} ! || Set piece secured!
narr: {猫|ねこ} が {少|すこ}し ずつ {軒下|のきした} に {入|はい}って きて 、 {乾|かわ}いた {隅|すみ} で {丸|まる}く なる 。 || Bit by bit the cat comes in under the eaves and curls up in the dry corner.
!end
:fixed
?(pet_cat_by_cord) narr: すだれ は {釘|くぎ} に {結|むす}ばれて 、 {静|しず}か に {立|た}って いる 。 || The screen stands quietly, tied to the nail.
?(!pet_cat_by_cord) narr: すだれ は {石|いし} の {上|うえ} に {戻|もど}って 、 {静|しず}か に {立|た}って いる 。 || The screen stands quietly, back on its stone.
`, 'pets/cat');
})(RB.content);
