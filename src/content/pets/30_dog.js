/* Pet vignette: the dog — "The Gate That Will Not Stay" (addendum §5.2). Cinder Orchard, once the
 * village is yours to walk about (co_met_sayo), for good (postgame too).
 *
 * Where: the channel keeper's yard by the water (co.village): the little gate at 31,26 and the corner
 * behind it (32–33, 26), between Tamotsu's barrel and the reeds — clear of the square, the paths, the
 * bridge and every person's place.
 * Cause (visible, inspectable): a sociable dog, used to travellers, keeps lying down in the corner, and
 * the yard's gate — its latch loop slipped off, its stop peg lying in the grass — swings across the
 * corner in each gust down the channel, and he has to get up again.
 * State (var.pet_dog): 0 not looked at, 1 looked at, 2 the gate stays shut.
 * Ordinary route: look at the gate, then drop the latch loop back over its post OR push the stop peg
 * back into the ground. He settles; crouch and let him sniff your hand or sit down nearby. Permission:
 * Tamotsu, the channel keeper, in whose yard he sleeps, says plainly that he is nobody's dog and may
 * go if he chooses — before the invitation (which offers "Not now"). He is not abandoned, rescued or
 * exchanged: he chooses, and knows his way home.
 * Field route (RB.pets.vignetteAction('dog', family)): 'bind' (a rope word ties the gate to its post)
 * or 'stone' (a stone word weighs the stop). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const map = C.maps['co.village'];
  const GATE = [31, 26], CORNER = [32, 26], OUT = [33, 25];
  const ON = 'co_met_sayo';
  const K = RB.propKit;
  const LOOP = 5200, SWING = 2400;

  function gateArt(id, fixed) {
    RB.props.P[id] = {
      id, w: 1, h: 1, block: true,
      draw(c, x, y, pal, t, o) { c.save(); c.scale(0.5, 0.5); this.draw2(c, x * 2, y * 2, pal, t, o); c.restore(); },
      draw2(c, x, y, pal, t, o) {
        o = o || {};
        // loose: it swings open across the corner (to the right) and bangs back
        const ph = (t || 0) % LOOP;
        const open = fixed || o.still ? 0 : ph > SWING && ph < SWING + 500 ? Math.round(Math.sin(((ph - SWING) / 500) * Math.PI) * 3) : 0;
        const key = id + '|' + K.palInfo(pal).key + '|' + open + '|' + (o.by || '');
        const cv = K.cached(key, () => K.make(48, 40, (g) => {
          const M = K.mat(pal), w5 = M.wood;
          // the hinge post on the left and the latch post on the right
          K.R(g, 4, 6, 5, 28, w5[1]); K.R(g, 4, 6, 2, 28, w5[3]); K.R(g, 4, 5, 5, 2, w5[4]);
          K.R(g, 33, 12, 4, 22, w5[1]); K.R(g, 33, 12, 1, 22, w5[3]);
          // the gate: rails and slats, foreshortened as it swings open (0 shut .. 3 wide open)
          const len = [26, 21, 14, 8][open], dip = [0, 2, 4, 5][open];
          for (const ry of [13, 25]) { K.R(g, 9, ry + dip, len, 3, w5[2]); K.R(g, 9, ry + dip, len, 1, w5[4]); }
          for (let sx = 0; sx < len; sx += 5) { K.R(g, 10 + sx, 11 + dip, 3, 20, w5[2]); K.R(g, 10 + sx, 11 + dip, 1, 20, w5[3]); }
          if (open) K.R(g, 9 + len, 11 + dip, 1, 20, w5[0]);
          if (fixed && o.by === 'loop') { K.R(g, 32, 15, 6, 3, '#8a7a5a'); K.R(g, 32, 15, 6, 1, '#b8a67a'); }            // the latch loop over the post
          else if (fixed && o.by === 'peg') { K.R(g, 30, 30, 3, 6, w5[0]); K.R(g, 30, 30, 3, 1, w5[3]); }              // the stop peg back in
          else { K.R(g, 22, 34, 8, 2, w5[1]); K.R(g, 32, 17, 5, 2, '#8a7a5a'); }                                        // the peg in the grass, the loop hanging
          K.outline(g, 48, 40, 'sel');
          g.globalCompositeOperation = 'destination-over';
          K.shadow(g, 22, 35, 16, 2.5, 0.25);
          g.globalCompositeOperation = 'source-over';
        }));
        c.drawImage(cv, x - 6, y - 6);
      },
    };
  }
  gateArt('pet_gate', false);
  gateArt('pet_gate_fixed', true);

  map.props.push(
    { p: 'pet_gate', x: GATE[0], y: GATE[1], scene: 'pets.dog.gate', if: ON + '&var.pet_dog<2' },
    { p: 'pet_gate_fixed', x: GATE[0], y: GATE[1], scene: 'pets.dog.gate', if: ON + '&var.pet_dog>=2&!pet_dog_by_peg', o: { by: 'loop' } },
    { p: 'pet_gate_fixed', x: GATE[0], y: GATE[1], scene: 'pets.dog.gate', if: ON + '&var.pet_dog>=2&pet_dog_by_peg', o: { by: 'peg' } },
    { p: 'pet_spot', x: CORNER[0], y: CORNER[1], w: 2, scene: 'pets.dog.dog', if: ON + '&!pet.dog' },
  );
  map.onEnter = (map.onEnter || []).concat([{ scene: 'pets.dog.notice', if: ON + '&!pet.dog&!seen.pets.dog.dog&!seen.pets.dog.gate&comp', once: true }]);

  // ---- the dog before he joins you: lies down, the gate swings into him, he gets up and circles ---------------
  const V = { near: null };
  const sm = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  RB.petWorld.addWild({
    id: 'dog', species: 'dog', look: 'cream', map: 'co.village',
    show: (s) => RB.state.test(s, ON + '&!pet.dog'),
    place(s, t, reduce) {
      const step = (s.vars && s.vars.pet_dog) || 0;
      if (V.near) {
        const k = reduce ? 1 : Math.min(1, (performance.now() - V.near.t0) / 900);
        const [bx, by] = V.near.to;
        return { x: CORNER[0] + (bx - CORNER[0]) * sm(k), y: CORNER[1] + (by - CORNER[1]) * sm(k), dir: k < 1 ? V.near.dir : V.near.face, po: k < 1 ? { gait: 'walk', ph: (t / 360) % 1 } : { sit: 1, wag: reduce ? 0.5 : Math.sin(t / 90) * 0.7, hp: -8 } };
      }
      if (step >= 2) {
        const wag = !reduce && (t % 5000) < 700 ? Math.sin(t / 80) * 0.6 : 0;
        return { x: CORNER[0], y: CORNER[1], dir: 'down', po: { lie: 1, wag, blink: !reduce && (t % 3700) < 160 ? 1 : 0 } };
      }
      if (reduce) return { x: OUT[0], y: OUT[1], dir: 'left', po: { sit: 1, earF: 0.4 } };
      const ph = t % LOOP;
      if (ph < SWING) return { x: CORNER[0], y: CORNER[1], dir: 'down', po: { lie: ph < 400 ? ph / 400 : 1 } };                             // lies down
      if (ph < SWING + 300) return { x: CORNER[0], y: CORNER[1], dir: 'down', po: { sit: 1, earF: -0.6 } };                                 // the gate bumps him
      if (ph < SWING + 900) { const k = (ph - SWING - 300) / 600; return { x: CORNER[0] + k, y: CORNER[1] - k, dir: 'right', po: { gait: 'walk', ph: (t / 360) % 1 } }; } // gets up, out
      if (ph < 4400) return { x: OUT[0], y: OUT[1], dir: 'left', po: { sit: 1, hy: -10, wag: Math.sin(t / 150) * 0.2 } };                   // looks back at the corner
      const k = (ph - 4400) / 800;
      return { x: OUT[0] - k, y: OUT[1] + k, dir: 'left', po: { gait: 'walk', ph: (t / 360) % 1 } };                                         // tries again
    },
  });
  function shut(s, how) {
    if (((s.vars && s.vars.pet_dog) || 0) >= 2 || RB.pets.record(s, 'dog')) return false;
    s.vars.pet_dog = 2;
    s.flags['pet_dog_by_' + how] = true;
    return true;
  }
  RB.pets.addVignette('dog', {
    species: 'dog', map: 'co.village', families: ['bind', 'stone'],
    // the Weave sheet's target (RB.pets.fieldTargets / fieldWeave)
    open: (s) => RB.state.test(s, ON),
    cause: { x: GATE[0], y: GATE[1], label: T('the gate that will not stay shut', '{閉|し}まらない {戸|と}') },
    fieldSay: {
      bind: T('The shape of a rope ties the gate to its post. The wind comes, and it stays shut.', '{縄|なわ} の {形|かたち} が {戸|と} を {柱|はしら} に {結|むす}んだ 。 {風|かぜ} が {来|き}て も 、 もう {開|ひら}かない 。'),
      stone: T('A stone’s weight sinks the stop peg into the ground. The gate stays shut.', '{石|いし} の {重|おも}み が {杭|くい} を {地面|じめん} に {沈|しず}めた 。 {戸|と} は もう {開|ひら}かない 。'),
    },
    fieldNeutral: { '*': T('The gate is still swinging open and shut in the wind.', '{戸|と} は まだ {風|かぜ} で {開|ひら}いたり {閉|し}まったり して いる 。') },
    title: T('The Gate That Will Not Stay', '{閉|し}まらない {戸|と}'),
    met: T('In the channel keeper’s yard at Cinder Orchard, once the gate stayed shut — with Tamotsu’s blessing.', '{灰実|はいみ}の{里|さと} の {水番|みずばん} の {庭|にわ} で 、 {戸|と} が {閉|し}まる よう に なって から 。 タモツ も {認|みと}めて くれた 。'),
    // 縄 ties the gate to its post; 石 or 土 weighs the stop down
    apply(s, family) { return shut(s, family === 'bind' ? 'rope' : 'peg'); },
    state: (s) => ({ step: (s.vars && s.vars.pet_dog) || 0, met: !!RB.pets.record(s, 'dog') }),
    stage(name) {
      const W = RB.world.W;
      if (name === 'near' && W.player) {
        const to = RB.petWorld.nearTile(CORNER, { own: [CORNER, [CORNER[0] + 1, CORNER[1]]], avoid: [GATE], fallback: CORNER, leave: true });
        V.near = { t0: performance.now(), to, dir: to[0] > CORNER[0] ? 'right' : to[0] < CORNER[0] ? 'left' : to[1] > CORNER[1] ? 'down' : 'up', face: RB.petWorld.faceFrom(to) };
        return new Promise((r) => setTimeout(r, RB.test && RB.test.auto ? 0 : 950));
      }
      if (name === 'back') V.near = null;
      return null;
    },
  });
  RB.bus.on('map:enter', () => { V.near = null; });

  RB.pets.meeting.dog = {
    title: T('The Gate That Will Not Stay', '{閉|し}まらない {戸|と}'),
    text: T('By the channel keeper’s barrels in Cinder Orchard, a dog who greets every traveller kept being bumped out of his corner by a loose gate. Once it stayed shut he lay down at last — and then, with Tamotsu’s word, chose the road with you.', '{灰実|はいみ}の{里|さと} の {水番|みずばん} の {樽|たる} の {横|よこ} 。 {旅|たび}の{人|ひと} を {迎|むか}える {犬|いぬ} が 、 {緩|ゆる}んだ {戸|と} に {何度|なんど} も {隅|すみ} から {追|お}い{出|だ}されて いた 。 {戸|と} が {閉|し}まる と 、 やっと {横|よこ} に なり 、 タモツ の {一言|ひとこと} で 、 {一緒|いっしょ} の {道|みち} を {選|えら}んだ 。'),
    reply: {
      nao: T('He walks like he’s delivering something. I like him.', '{配達|はいたつ} {中|ちゅう} みたい な {歩|ある}き{方|かた} だ 。 {気|き} に {入|い}った 。'),
      mio: T('Tamotsu didn’t say it, but he’ll miss him. We should come back through here sometimes.', 'タモツ さん 、 {口|くち} に は {出|だ}さない けど 、 {寂|さび}しく なる と {思|おも}う 。 ときどき ここ を {通|とお}りましょう ね 。'),
      ren: T('A guide who knows the way home. I will try not to take it personally.', '{帰|かえ}り{道|みち} を {知|し}って いる {案内役|あんないやく} です ね 。 {気|き} に しない よう に します 。'),
      suzu: T('Every traveller got a welcome from him. It’s only fair somebody finally took him along for the show.', '{旅|たび}の{人|ひと} を {全員|ぜんいん} {出迎|でむか}えて きた ん だ もの 。 {一度|いちど} くらい 、 {一緒|いっしょ} に {旅|たび} に {出|で}て も いい よ ね 。'),
    },
  };

  RB.script.add(`
@scene pets.dog.notice
?(party=nao) nao: {水番|みずばん} の {庭|にわ} に 、 {犬|いぬ} が いる 。 {落|お}ち{着|つ}かない {顔|かお} だ 。 || There's a dog in the channel keeper's yard. Doesn't look settled.
?(party=mio) mio: {水路|すいろ} の {横|よこ} の {庭|にわ} 、 {犬|いぬ} が {何度|なんど} も {起|お}きて は {寝|ね}て を {繰|く}り{返|かえ}してる 。 || The yard by the channel — that dog keeps lying down and getting up again.
?(party=ren) ren: {水路|すいろ} の そば に 、 {人懐|ひとなつ}っこい {犬|いぬ} が います ね 。 || There's a friendly-looking dog by the channel.
?(party=suzu) suzu: {水番|みずばん} さん の {庭|にわ} に 、 {看板|かんばん} {犬|いぬ} {発見|はっけん} 。 でも 、 {寝|ね}られない みたい 。 || Spotted: one star dog in the channel keeper's yard. But he can't get to sleep.

@scene pets.dog.dog
!if var.pet_dog>=2 -> settled
narr: {薄|うす}い {茶色|ちゃいろ} の {犬|いぬ} が 、 {樽|たる} の {横|よこ} の {隅|すみ} で {横|よこ} に なろう と する 。 {水路|すいろ} から {風|かぜ} が {吹|ふ}く と 、 {小|ちい}さな {戸|と} が {開|ひら}いて {隅|すみ} に {当|あ}たり 、 {犬|いぬ} は また {起|お}き{上|あ}がる 。 || A pale fawn dog tries to lie down in the corner beside the barrel. When the wind comes up the channel, the little gate swings open into the corner, and he gets up again.
?(party=nao) nao: {寝床|ねどこ} に {扉|とびら} が {突|つ}っ{込|こ}んで くる ん じゃ 、 {寝|ね}られない よな 。 || Can't sleep with a door swinging into your bed.
?(party=mio) mio: {戸|と} が ちゃんと {閉|し}まれば 、 {休|やす}める のに 。 || If the gate would just stay shut, he could rest.
?(party=ren) ren: {風|かぜ} の {通|とお}り{道|みち} に {戸|と} が ある 。 {原因|げんいん} は あれ です ね 。 || There's a gate in the wind's path. That's the cause.
?(party=suzu) suzu: {幕|まく} が {閉|し}まらない {舞台|ぶたい} みたい 。 {落|お}ち{着|つ}かない よ ね 。 || Like a stage where the curtain won't stay down. Unsettling.
!var pet_dog = 1
!end
:settled
narr: {犬|いぬ} は {隅|すみ} で {長|なが}く {伸|の}びて いる 。 あなた を {見|み}る と 、 しっぽ で {地面|じめん} を {一度|いちど} たたいた 。 || The dog is stretched out in the corner. When he sees you, his tail thumps the ground once.
!choice
* しゃがんで 、 {手|て} の {匂|にお}い を かがせる || Crouch and let him sniff your hand. -> hand
* {樽|たる} の {横|よこ} に {座|すわ}って {待|ま}つ || Sit down by the barrel and wait. -> sit
* そっと して おく || Leave him be. -> end
:hand
narr: しゃがんで 、 {手|て} を {低|ひく}く {出|だ}す 。 {犬|いぬ} は {起|お}き{上|あ}がって {匂|にお}い を かぎ 、 {頭|あたま} を {押|お}しつけて きた 。 || You crouch and hold out a hand, low. He gets up, sniffs it, and presses his head into it.
!goto met
:sit
narr: {樽|たる} の {横|よこ} に {腰|こし} を {下|お}ろす 。 {水路|すいろ} の {水|みず} の {音|おと} が する 。 || You sit down by the barrel. There is the sound of the channel water.
narr: {犬|いぬ} は のそのそ と {起|お}きて きて 、 あなた の {隣|となり} に {座|すわ}った 。 || He gets up without hurrying, comes over and sits down next to you.
:met
!hook pet_vig dog near
?(party=nao) nao[smirk]: {道|みち} を {知|し}ってる {顔|かお} だ 。 || He looks like he knows the roads.
?(party=mio) mio[smile]: あったかい 。 {背中|せなか} が お{日様|ひさま} の {匂|にお}い 。 || He's warm. His back smells of sunshine.
?(party=ren) ren: {頼|たの}もしい {目|め} を して います 。 || He has a dependable look.
?(party=suzu) suzu[laugh]: {拍手|はくしゅ} の {代|か}わり に 、 しっぽ ! || Instead of applause — a tail!
co_tamotsu: そいつ は {誰|だれ} の {犬|いぬ} でも ない 。 {俺|おれ} の {庭|にわ} で {寝|ね}て 、 {橋|はし} で {旅|たび}の{人|ひと} を {迎|むか}える 。 || He's nobody's dog. Sleeps in my yard, meets every traveller at the bridge.
co_tamotsu: {行|い}きたい なら 、 {連|つ}れて {行|い}け 。 {帰|かえ}り{道|みち} は {知|し}ってる やつ だ 。 || If he wants to go with you, take him. He knows his way home.
narr: {犬|いぬ} は あなた の {顔|かお} を {見上|みあ}げて 、 {立|た}ち{上|あ}がった 。 {一緒|いっしょ} に {行|い}く {気|き} で いる よう だ 。 || The dog looks up at your face and stands. He seems ready to go with you.
!choice
* {一緒|いっしょ} に {来|く}る ? || Invite him to come with you. -> invite
* また {今度|こんど} ね || Not now. -> notnow
:invite
!hook pet_meet dog
!end
:notnow
!hook pet_vig dog back
narr: {犬|いぬ} は {隅|すみ} に {戻|もど}って 、 {長|なが}く {伸|の}びた 。 ここ に {来|く}れば 、 また {会|あ}える 。 || He goes back to his corner and stretches out. He'll be here whenever you come by.

@scene pets.dog.gate
!if var.pet_dog>=2&!pet.dog -> dog
!if var.pet_dog>=2 -> fixed
narr: {低|ひく}い {木|き} の {戸|と} が 、 {片方|かたほう} の {柱|はしら} だけ に {下|さ}がって いる 。 {留|と}め{輪|わ} が {柱|はしら} から {外|はず}れて 、 {戸|と} を {止|と}める {杭|くい} は {草|くさ} の {中|なか} に {落|お}ちて いる 。 || A low wooden gate hangs from one post only. Its latch loop has slipped off the other post, and the stop peg that held it shut lies in the grass.
!var pet_dog = 1
!choice
* {留|と}め{輪|わ} を {柱|はしら} に かけ{直|なお}す || Drop the latch loop back over the post. -> loop
* {杭|くい} を {地面|じめん} に {打|う}ち{直|なお}す || Push the stop peg back into the ground. -> peg
* そのまま に して おく || Leave it for now. -> end
:loop
narr: {留|と}め{輪|わ} を {柱|はしら} に かけ{直|なお}す 。 {戸|と} は かたん と {閉|し}まって 、 もう {動|うご}かない 。 || You drop the latch loop back over the post. The gate clacks shut and stays.
!var pet_dog = 2
!set pet_dog_by_loop
!goto after
:peg
narr: {杭|くい} を {戸|と} の {前|まえ} に {強|つよ}く {押|お}し{込|こ}む 。 {風|かぜ} が {来|き}て も 、 {戸|と} は もう {開|ひら}かない 。 || You push the stop peg firmly into the ground in front of the gate. The wind comes, and the gate no longer opens.
!var pet_dog = 2
!set pet_dog_by_peg
:after
?(party=nao) nao: {戸締|とじ}まり 、 {完了|かんりょう} 。 || Gate secured.
?(party=mio) mio: これで {寝|ね}られる わ ね 。 || Now he can sleep.
?(party=ren) ren: {小|ちい}さな {戸|と} ほど 、 よく {開|ひら}き ます から ね 。 || The small gates are always the ones that swing.
?(party=suzu) suzu: {幕|まく} 、 {下|お}りました ! || Curtain down!
narr: {犬|いぬ} は {隅|すみ} で ぐるり と {一回|いっかい} {回|まわ}って 、 {満足|まんぞく} そう に {横|よこ} に なった 。 || The dog turns round once in the corner and lies down, satisfied.
!end
:dog
!call pets.dog.dog
!end
:fixed
?(pet_dog_by_peg) narr: {杭|くい} が {戸|と} を しっかり {止|と}めて いる 。 || The peg holds the gate firmly shut.
?(!pet_dog_by_peg) narr: {留|と}め{輪|わ} が {柱|はしら} に かかって 、 {戸|と} は {閉|し}まった まま だ 。 || The latch loop is over the post; the gate stays shut.
`, 'pets/dog');
})(RB.content);
