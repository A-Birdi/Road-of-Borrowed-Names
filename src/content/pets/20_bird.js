/* Pet vignette: the small bird — "The Ribbon by the Perch" (addendum §5.2). Saltglass, once the
 * harbour is yours to wander (quest.sg_main>=1: after meeting the harbourmaster), for good.
 *
 * Where: the old mooring post at the east end of the quay (sg.harbor 43,26), the beach just below it
 * (44,27) — clear of the market, the stalls, the piers, the sea-glass, the tide window's machinery (44–46,
 * 24–25) and every person.
 * Cause (visible, inspectable): a faded ribbon knotted to a nail on the post jumps in every gust and
 * flicks away the little bird that keeps trying to land on its familiar perch.
 * State (var.pet_bird): 0 not looked at, 1 looked at, 2 the ribbon is dealt with.
 * Ordinary route: look at the post, then untie the knot and take the ribbon off, OR wind the loose end
 * round the post and tuck it in. The bird settles on the post; stay still or hold out an open palm, it
 * hops closer, and it is invited (or "Not now": it stays on its post). No snatching, no cage, no
 * hearing-only clue (a chirp is also shown).
 * Field route (RB.pets.vignetteAction('bird', family)): 'unravel' (the knot comes loose) or 'wind' (a
 * gentle breeze lifts the ribbon off the nail and away along the quay, never at the bird). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const map = C.maps['sg.harbor'];
  // (the sand spot is a row below the post, clear of the tide window's machinery at 44–46, 24–25 and the
  // tiles you stand on to use it)
  const POST = [43, 26], SAND = [44, 27];
  const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const ON = 'quest.sg_main>=1';
  const K = RB.propKit;
  const LOOP = 4800, GUST = 2600;

  // the mooring post: weathered timber, a rope collar, a nail with the ribbon (fluttering), or bare
  function postArt(id, fixed) {
    RB.props.P[id] = {
      id, w: 1, h: 1, block: true,
      draw(c, x, y, pal, t, o) { c.save(); c.scale(0.5, 0.5); this.draw2(c, x * 2, y * 2, pal, t, o); c.restore(); },
      draw2(c, x, y, pal, t, o) {
        o = o || {};
        const ph = (t || 0) % LOOP;
        const fl = fixed ? 0 : o.still ? 1 : ph > GUST && ph < GUST + 700 ? 1 + (Math.floor((ph - GUST) / 90) % 3) : 0;
        const key = id + '|' + K.palInfo(pal).key + '|' + fl + '|' + (o.by || '');
        const cv = K.cached(key, () => K.make(40, 48, (g) => {
          const M = K.mat(pal), w5 = M.wood;
          // the post: a thick round timber, darker where the sea has reached, a rope collar
          K.R(g, 12, 8, 12, 36, w5[2]); K.R(g, 12, 8, 3, 36, w5[3]); K.R(g, 21, 8, 3, 36, w5[1]);
          K.R(g, 13, 6, 10, 3, w5[4]); K.R(g, 12, 34, 12, 10, w5[0]);
          K.R(g, 11, 22, 14, 3, '#9a8a64'); K.R(g, 11, 22, 14, 1, '#c8b88a'); K.R(g, 11, 24, 14, 1, '#6a5a40');
          K.R(g, 24, 15, 3, 2, '#46444f'); // the nail
          const rib = '#b05a6a', rib2 = '#d88a94';
          if (!fixed) {
            // the ribbon knotted on the nail, its tail flicking in the gust (fl 0 hangs)
            K.R(g, 25, 14, 3, 4, rib);
            const tail = fl === 0 ? [[27, 17], [28, 21], [27, 25], [28, 29]] : fl === 1 ? [[28, 16], [32, 16], [35, 14], [38, 15]] : fl === 2 ? [[28, 15], [31, 12], [34, 9], [37, 8]] : [[28, 17], [32, 19], [35, 22], [38, 21]];
            let prev = [26, 16];
            for (const q of tail) { K.line(g, prev[0], prev[1], q[0], q[1], rib, 2); K.line(g, prev[0], prev[1] - 1, q[0], q[1] - 1, rib2, 1); prev = q; }
          } else if (o.by === 'tucked') {
            // wound round the post and tucked in
            K.R(g, 12, 17, 12, 2, rib); K.R(g, 12, 17, 12, 1, rib2); K.R(g, 12, 20, 12, 1, rib);
          }
          K.outline(g, 40, 48, 'sel');
          g.globalCompositeOperation = 'destination-over';
          K.shadow(g, 18, 44, 9, 2.5, 0.3);
          g.globalCompositeOperation = 'source-over';
        }));
        c.drawImage(cv, x - 2, y - 16);
      },
    };
  }
  postArt('pet_post', false);
  postArt('pet_post_fixed', true);

  map.props.push(
    { p: 'pet_post', x: POST[0], y: POST[1], scene: 'pets.bird.post', if: ON + '&var.pet_bird<2' },
    { p: 'pet_post_fixed', x: POST[0], y: POST[1], scene: 'pets.bird.post', if: ON + '&var.pet_bird>=2&!pet_bird_tucked', o: { by: 'untied' } },
    { p: 'pet_post_fixed', x: POST[0], y: POST[1], scene: 'pets.bird.post', if: ON + '&var.pet_bird>=2&pet_bird_tucked', o: { by: 'tucked' } },
    { p: 'pet_spot', x: SAND[0], y: SAND[1], scene: 'pets.bird.bird', if: ON + '&!pet.bird' },
  );
  map.onEnter = (map.onEnter || []).concat([{ scene: 'pets.bird.notice', if: ON + '&!pet.bird&!seen.pets.bird.bird&!seen.pets.bird.post&comp', once: true }]);

  // ---- the bird before it joins you: tries the post, the ribbon flicks, it flutters down to the sand -------------
  const V = { near: null };
  const sm = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  RB.petWorld.addWild({
    id: 'bird', species: 'bird', look: 'brown', map: 'sg.harbor',
    show: (s) => RB.state.test(s, ON + '&!pet.bird'),
    place(s, t, reduce) {
      const step = (s.vars && s.vars.pet_bird) || 0;
      if (V.near) {
        const k = reduce ? 1 : Math.min(1, (performance.now() - V.near.t0) / 800);
        return { x: POST[0] + (V.near.to[0] - POST[0]) * sm(k), y: POST[1] + (V.near.to[1] - POST[1]) * sm(k), dir: V.near.face, po: k < 1 ? { wing: 1, flap: (t / 150) % 1 } : { hr: 16, hp: -8 }, up: k < 1 ? Math.round(14 * (1 - k) + Math.sin(k * Math.PI) * 4) : 0 };
      }
      if (step >= 2) {
        // on its post at last: fluffed, preening now and then
        const pr = !reduce && (t % 6000) > 4200 && (t % 6000) < 5200;
        return { x: POST[0], y: POST[1], dir: 'left', po: pr ? { preen: 0.8, fluff: 0.4 } : { fluff: 0.4, blink: !reduce && (t % 3900) < 150 ? 1 : 0 }, up: 17 };
      }
      if (reduce) return { x: SAND[0], y: SAND[1], dir: 'left', po: { hp: -14 } };
      const ph = t % LOOP;
      if (ph < 1400) return { x: SAND[0], y: SAND[1], dir: 'left', po: { hp: -14, hr: ph > 600 && ph < 1000 ? 18 : 0 } };                        // looks up at the post
      if (ph < 2000) { const k = (ph - 1400) / 600, q = lerp(SAND, POST, sm(k)); return { x: q[0], y: q[1], dir: 'left', po: { wing: 1, flap: (t / 140) % 1 }, up: Math.round(17 * sm(k)) }; } // flies up
      if (ph < GUST) return { x: POST[0], y: POST[1], dir: 'left', po: { wing: 0.3, flap: 0.2 }, up: 17 };                                       // lands
      if (ph < GUST + 250) return { x: POST[0], y: POST[1], dir: 'right', po: { wing: 1, flap: (t / 110) % 1, fluff: 1 }, up: 19 };            // the ribbon flicks: startled
      if (ph < GUST + 900) { const k = (ph - GUST - 250) / 650, q = lerp(POST, SAND, sm(k)); return { x: q[0], y: q[1], dir: 'right', po: { wing: 1, flap: (t / 140) % 1 }, up: Math.round(19 * (1 - sm(k))) }; }
      return { x: SAND[0], y: SAND[1], dir: 'left', po: { fluff: 0.6, hp: -6 } };
    },
  });
  function done(s, how) {
    if (((s.vars && s.vars.pet_bird) || 0) >= 2 || RB.pets.record(s, 'bird')) return false;
    s.vars.pet_bird = 2;
    s.flags['pet_bird_' + how] = true;
    return true;
  }
  RB.pets.addVignette('bird', {
    species: 'bird', map: 'sg.harbor', families: ['unravel', 'wind'],
    // the Weave sheet's target (RB.pets.fieldTargets / fieldWeave)
    open: (s) => RB.state.test(s, ON),
    cause: { x: POST[0], y: POST[1], label: T('the ribbon on the old post', '{古|ふる}い {杭|くい} の リボン') },
    fieldSay: {
      unravel: T('The stiff knot comes undone and the ribbon slips off the nail.', '{固|かた}い {結|むす}び{目|め} が ほどけて 、 リボン が {釘|くぎ} から {外|はず}れた 。'),
      wind: T('A gentle breeze lifts the ribbon off the nail and carries it away along the quay, never toward the bird.', 'やさしい {風|かぜ} が リボン を {釘|くぎ} から {持|も}ち{上|あ}げて 、 {岸壁|がんぺき} の {向|む}こう へ {運|はこ}んで いった 。 {鳥|とり} の {方|ほう} へ は {吹|ふ}かない 。'),
    },
    fieldNeutral: { '*': T('The ribbon stays knotted to the nail, flicking in the wind.', 'リボン は {釘|くぎ} に {結|むす}ばれた まま 、 {風|かぜ} に {跳|は}ねて いる 。') },
    title: T('The Ribbon by the Perch', '{止|と}まり{木|ぎ} の リボン'),
    met: T('At the old mooring post on the Saltglass quay, once the ribbon stopped flicking it away.', '{潮硝子|しおがらす} の {岸壁|がんぺき} の {古|ふる}い {杭|くい} で 、 リボン が {跳|は}ねなく なって から 。'),
    // ほどく loosens the salt-stiff knot; a gentle 風 lifts the ribbon off the nail, away along the quay
    apply(s, family) { return done(s, family === 'wind' ? 'blown' : 'untied'); },
    state: (s) => ({ step: (s.vars && s.vars.pet_bird) || 0, met: !!RB.pets.record(s, 'bird') }),
    stage(name) {
      const W = RB.world.W;
      if (name === 'near' && W.player) {
        const p = W.player;
        const to = [p.x + (p.x < POST[0] ? 1 : p.x > POST[0] ? -1 : 0), p.y + (p.x === POST[0] ? (p.y < POST[1] ? 1 : -1) : 0)];
        V.near = { t0: performance.now(), to: to[0] === POST[0] && to[1] === POST[1] ? SAND : to, face: p.x < POST[0] ? 'left' : 'right' };
        return new Promise((r) => setTimeout(r, RB.test && RB.test.auto ? 0 : 850));
      }
      if (name === 'back') V.near = null;
      return null;
    },
  });
  RB.bus.on('map:enter', () => { V.near = null; });

  RB.pets.meeting.bird = {
    title: T('The Ribbon by the Perch', '{止|と}まり{木|ぎ} の リボン'),
    text: T('At the east end of the Saltglass quay, a small bird kept landing on an old mooring post and being flicked away by a knotted ribbon. Once the ribbon was dealt with, it sat on its post — and then chose to come along.', '{潮硝子|しおがらす} の {岸壁|がんぺき} の {東|ひがし} の {端|はし} 。 {小鳥|ことり} が {古|ふる}い {杭|くい} に {止|と}まろう と して は 、 {結|むす}ばれた リボン に {追|お}われて いた 。 リボン が {片付|かたづ}く と 、 {小鳥|ことり} は {杭|くい} に {止|と}まり 、 やがて {一緒|いっしょ} に {来|く}る こと を {選|えら}んだ 。'),
    reply: {
      nao: T('Somebody tied that ribbon there once and forgot it. Not our business why. The bird’s business was the post.', '{誰|だれ} か が {昔|むかし} あそこ に {結|むす}んで 、 {忘|わす}れた ん だろ 。 {理由|りゆう} は {知|し}らない 。 {鳥|とり} に とって は 、 {杭|くい} の ほう が {大事|だいじ} だった 。'),
      mio: T('It only needed its post back. Most of what helps is like that — small, and exactly the right thing.', '{杭|くい} を {返|かえ}して あげた だけ 。 {役|やく} に {立|た}つ こと って 、 だいたい {小|ちい}さくて 、 ちょうど いい もの なの よ 。'),
      ren: T('A perch is a kind of lantern post for a bird — a place it knows to come back to. I understand that very well.', '{止|と}まり{木|ぎ} は 、 {鳥|とり} に とって の {灯|あか}り の {柱|はしら} です 。 {帰|かえ}る {場所|ばしょ} が わかる 。 よく わかります 。'),
      suzu: T('It kept trying for the same spot on stage. Stubborn. I like it already.', '{同|おな}じ {立|た}ち{位置|いち} を {何度|なんど} も {狙|ねら}って た ね 。 {頑固|がんこ} 。 もう {好|す}き に なっちゃった 。'),
    },
  };

  RB.script.add(`
@scene pets.bird.notice
?(party=nao) nao: {岸壁|がんぺき} の {端|はし} の {杭|くい} 、 {小鳥|ことり} が {何度|なんど} も {止|と}まり{損|そこ}ねてる 。 || The post at the end of the quay — a little bird keeps missing its landing.
?(party=mio) mio: {見|み}て 。 {岸壁|がんぺき} の {端|はし} に 、 {小|ちい}さな {鳥|とり} が いる 。 || Look — a little bird at the end of the quay.
?(party=ren) ren: {東|ひがし} の {杭|くい} に 、 {鳥|とり} が {止|と}まろう と して います 。 うまく いかない よう です 。 || A bird is trying to land on the east post. It isn't managing.
?(party=suzu) suzu: {岸壁|がんぺき} の {端|はし} 、 {小鳥|ことり} が {着地|ちゃくち} に {失敗|しっぱい} してる 。 {何回目|なんかいめ} かな 。 || End of the quay — a little bird fluffing its landing. How many tries is that?

@scene pets.bird.bird
# Staged: you lean in to watch the bird miss its landing; your companion's own answer (Nao points at its post,
# Mio's hand to her chest, Ren's hand to the chin, Suzu laughs at the actor who trips on the same board). Once it
# is settled: you look at it; standing still beside the post, you only listen to the waves; or you hold out an
# open palm, low. Then Nao's open hand (one letter's weight), Mio's nod, Ren's glance aside (birds read the road
# better), Suzu's small celebration; not now, you look at its post.
!if var.pet_bird>=2 -> settled
!gesture pc observe 43,26 hold
narr: {茶色|ちゃいろ} の {小鳥|ことり} が 、 {古|ふる}い {杭|くい} の {上|うえ} に {止|と}まろう と する 。 {風|かぜ} が {吹|ふ}く と 、 {杭|くい} の リボン が {跳|は}ねて 、 {鳥|とり} は {砂|すな} の {上|うえ} に {逃|に}げる 。 || A small brown bird tries to land on top of the old post. When the wind gusts, the ribbon on the post jumps and the bird flees to the sand.
?(party=nao) !gesture nao point 43,26
?(party=nao) nao: {好|す}きな {場所|ばしょ} が ある ん だな 。 {他|ほか} の {杭|くい} じゃ だめ らしい 。 || It's got a favourite spot. No other post will do, apparently.
?(party=mio) !gesture mio guard
?(party=mio) mio: あの リボン が {怖|こわ}い の ね 。 || It's the ribbon it's afraid of.
?(party=ren) !gesture ren chin
?(party=ren) ren: {帰|かえ}る {場所|ばしょ} が 、 {落|お}ち{着|つ}かない 。 {困|こま}り ます ね 。 || The place it comes back to won't keep still. That's hard.
?(party=suzu) !gesture suzu laugh
?(party=suzu) suzu: {毎回|まいかい} {同|おな}じ {所|ところ} で {転|ころ}ぶ {役者|やくしゃ} みたい 。 || Like an actor who trips on the same board every night.
!var pet_bird = 1
!end
:settled
!gesture pc observe 43,26
narr: {小鳥|ことり} は {杭|くい} の {上|うえ} で {羽|はね} を ふくらませて 、 こちら を {見|み}て いる 。 || The bird sits on top of the post with its feathers fluffed, watching you.
!choice
* {杭|くい} の {横|よこ} で じっと {待|ま}つ || Stand still beside the post and wait. -> still
* {手|て}のひら を {上|うえ} に {向|む}けて {出|だ}す || Hold out an open palm. -> palm
* そっと して おく || Leave it be. -> end
:still
!gesture pc -
narr: {波|なみ} の {音|おと} を {聞|き}きながら 、 しばらく {動|うご}かず に いる 。 || You stay still a while, listening to the waves.
narr: {小鳥|ことり} は {首|くび} を かしげて 、 ぴょん と {近|ちか}く に {降|お}りて きた 。 || The bird tilts its head, then hops down close to you.
!goto met
:palm
!gesture pc palm 43,26
narr: {手|て}のひら を {上|うえ} に {向|む}けて 、 {低|ひく}く {出|だ}す 。 {何|なに} も {持|も}って いない こと が 、 {鳥|とり} に も {見|み}える 。 || You hold out an open palm, low. The bird can see there is nothing in it.
narr: {小鳥|ことり} は {少|すこ}し {迷|まよ}って から 、 {指|ゆび} の {先|さき} に {一度|いちど} だけ {止|と}まって 、 {横|よこ} に {降|お}りた 。 || After a moment's doubt it perches once on your fingertip, then drops down beside you.
:met
!hook pet_vig bird near
?(party=nao) !gesture nao palm
?(party=nao) nao: {軽|かる}い な 。 {手紙|てがみ} {一通|いっつう} ぐらい だ 。 || Light thing. About one letter's worth.
?(party=mio) !gesture mio nod pc
?(party=mio) mio[smile]: {落|お}ち{着|つ}いた {顔|かお} を してる 。 || It looks settled now.
?(party=ren) !gesture ren aside
?(party=ren) ren: {鳥|とり} は {道|みち} を {空|そら} から {見|み}ます 。 {私|わたし} より ずっと {確|たし}か です 。 || Birds see the road from the sky. Far more reliably than I do.
?(party=suzu) !gesture suzu celebrate
?(party=suzu) suzu[laugh]: {最前列|さいぜんれつ} の {席|せき} 、 {確保|かくほ} ! || Front-row seat, secured!
narr: {小鳥|ことり} は {一|ひと}つ {鳴|な}いて 、 あなた の {肩|かた} の {高|たか}さ まで {飛|と}んで 、 また {降|お}りた 。 ついて {来|く}る つもり の よう だ 。 || The bird gives one chirp — you see its beak open — flies up to your shoulder's height and settles again. It seems to mean to come along.
!choice
* {一緒|いっしょ} に {行|い}こう か || Invite it to come with you. -> invite
* また {今度|こんど} ね || Not now. -> notnow
:invite
!hook pet_meet bird
!end
:notnow
!hook pet_vig bird back
!gesture pc observe 43,26
narr: {小鳥|ことり} は {杭|くい} の {上|うえ} に {戻|もど}った 。 ここ に {来|く}れば 、 また {会|あ}える 。 || The bird goes back to its post. It will be here whenever you come by.

@scene pets.bird.post
# Staged: you lean in to the low mooring post and the flapping ribbon; working the knot loose, you crouch to it
# (a kneel); winding the ribbon round, you stoop over the post to tuck it in. Your companion's own answer (Nao's nod, Mio points to
# the post the bird can land on now, Ren's nod, Suzu's small celebration), and you look up as the bird lands.
# Steady already, you look at the post.
!if var.pet_bird>=2&!pet.bird -> bird
!if var.pet_bird>=2 -> fixed
!gesture pc observe 43,26 hold
narr: {岸壁|がんぺき} の {端|はし} に 、 {古|ふる}い {杭|くい} が {立|た}って いる 。 {杭|くい} の {釘|くぎ} に 、 {色|いろ} の あせた リボン が {結|むす}ばれた まま に なって いる 。 || An old mooring post stands at the end of the quay. A faded ribbon is still knotted to a nail on it.
narr: {風|かぜ} が {吹|ふ}く たびに 、 リボン の {端|はし} が {跳|は}ねて 、 {杭|くい} の {上|うえ} を {払|はら}う 。 {結|むす}び{目|め} は {潮|しお} で {固|かた}く なって いる 。 || Each gust flips the ribbon's end up across the top of the post. The knot has gone stiff with salt.
!var pet_bird = 1
!choice
* {結|むす}び{目|め} を ほどいて 、 リボン を {外|はず}す || Work the knot loose and take the ribbon off. -> untie
* リボン を {杭|くい} に {巻|ま}きつけて 、 {端|はし} を {挟|はさ}む || Wind the ribbon round the post and tuck the end in. -> tuck
* そのまま に して おく || Leave it for now. -> end
:untie
!gesture pc kneel 43,26
narr: {固|かた}い {結|むす}び{目|め} を 、 {少|すこ}し ずつ ゆるめる 。 やがて ほどけて 、 リボン は あなた の {手|て} の {中|なか} に {残|のこ}った 。 || Bit by bit you ease the stiff knot. At last it gives, and the ribbon is left in your hand.
!var pet_bird = 2
!set pet_bird_untied
!goto after
:tuck
!gesture pc bend 43,26
narr: リボン を {杭|くい} に {二回|にかい} {巻|ま}いて 、 {端|はし} を {巻|ま}いた {下|した} に {挟|はさ}む 。 もう {跳|は}ねない 。 || You wind the ribbon twice round the post and tuck the end under the turns. It can't flap now.
!var pet_bird = 2
!set pet_bird_tucked
:after
?(party=nao) !gesture nao nod pc
?(party=nao) nao: よし 。 {着陸|ちゃくりく} {許可|きょか} {出|で}た ぞ 。 || Right. Cleared to land.
?(party=mio) !gesture mio point 43,26
?(party=mio) mio: これで {止|と}まれる ね 。 || Now it can land.
?(party=ren) !gesture ren nod pc
?(party=ren) ren: {杭|くい} が 、 {杭|くい} に {戻|もど}りました 。 || The post is a post again.
?(party=suzu) !gesture suzu celebrate
?(party=suzu) suzu: {舞台|ぶたい} の {片付|かたづ}け 、 {完了|かんりょう} ! || Stage cleared!
!look pc 43,26
narr: {小鳥|ことり} が {杭|くい} の {上|うえ} に {降|お}りて 、 {今度|こんど} は {逃|に}げない 。 {羽|はね} を ふくらませて 、 {落|お}ち{着|つ}いた 。 || The bird drops onto the post, and this time it stays. It fluffs its feathers and settles.
!end
:bird
!call pets.bird.bird
!end
:fixed
!gesture pc observe 43,26
?(pet_bird_tucked) narr: リボン は {杭|くい} に {巻|ま}きついて 、 もう {跳|は}ねない 。 || The ribbon is wound round the post and doesn't flap any more.
?(!pet_bird_tucked) narr: {杭|くい} の {釘|くぎ} に は 、 もう {何|なに} も {結|むす}ばれて いない 。 || Nothing is tied to the nail any more.
`, 'pets/bird');
})(RB.content);
