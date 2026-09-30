/* Pet vignette: the tanuki — "Paper in the Clearing" (addendum §5.2). The Orchard Road, the wooded
 * approach to Cinder Orchard, from your arrival there in Chapter 3 (co_arrived) and for good.
 *
 * Where: the edge of the tall grass under the tree line (co.road): a hollow at 6,3 under a big tree, the
 * gap in the trees at 5,2 where the draught comes in, the loose papers at 5,4 — off the road, clear of the
 * lanterns, the bench, the north path and its scrub.
 * Cause (visible, inspectable): a few loose sheets of paper (old festival notices, soft with weather)
 * lie by the hollow; each time the draught slips through the gap in the trees they lift and skitter
 * across the tanuki's path, and it backs off.
 * State (var.pet_tanuki): 0 not looked at, 1 looked at, 2 the clearing is tidy.
 * Ordinary route: look at the gap (optional; it tells you where the wind comes in) or at the papers,
 * then gather them and weigh them under a flat stone OR tuck them into the rock's lee. Then wait
 * quietly — the pause is told, never timed — and it comes out to you; the invitation offers "Not now".
 * No food, no trap, nothing that frightens it.
 * Field route (RB.pets.vignetteAction('tanuki', family)): 'wind' (a gentle breeze carries the sheets
 * into the rock's lee, where they settle) or 'stone' (a stone word weighs them down): the same tidy end. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const map = C.maps['co.road'];
  const HOLLOW = [6, 3], GAP = [5, 2], PAPERS = [5, 4], EDGE = [8, 3];
  const ON = 'co_arrived';
  const K = RB.propKit;
  const LOOP = 5600, GUST = 3000;

  function papersArt(id, tidy) {
    RB.props.P[id] = {
      id, w: 1, h: 1, block: true,
      draw(c, x, y, pal, t, o) { c.save(); c.scale(0.5, 0.5); this.draw2(c, x * 2, y * 2, pal, t, o); c.restore(); },
      draw2(c, x, y, pal, t, o) {
        o = o || {};
        const ph = (t || 0) % LOOP;
        // the loose sheets lift in the gust and skitter (a frame of 0..3); tidy: a neat stack
        const f = tidy || o.still ? 0 : ph > GUST && ph < GUST + 800 ? 1 + (Math.floor((ph - GUST) / 180) % 3) : 0;
        const key = id + '|' + K.palInfo(pal).key + '|' + f + '|' + (o.by || '');
        const cv = K.cached(key, () => K.make(56, 44, (g) => {
          const pp = K.FIX.paper, M = K.mat(pal);
          const sheet = (x0, y0, w, h, lift) => {
            K.R(g, x0, y0 - lift, w, h, pp[3]); K.R(g, x0, y0 - lift, w, 1, pp[4]); K.R(g, x0, y0 - lift + h - 1, w, 1, pp[1]);
            K.R(g, x0 + 2, y0 - lift + 2, w - 5, 1, '#8a7a6a'); K.R(g, x0 + 2, y0 - lift + 4, w - 7, 1, '#8a7a6a');
          };
          if (tidy) {
            // a neat stack, a flat stone on top — or tucked into the lee of the rock
            const st = M.stone;
            if (o.by === 'lee') {
              // tucked in behind a boulder, out of the draught: only their edges show
              for (let i = 0; i < 4; i++) sheet(22 - i, 24 - i, 14, 9, 0);
              K.ell(g, 37, 28, 12, 7, st[0]); K.ell(g, 36, 27, 11, 6.2, st[1]); K.ell(g, 35, 26, 8.5, 4.6, st[2]); K.ell(g, 33, 24.5, 5, 2.2, st[3]); K.R(g, 31, 23, 3, 1, st[4]);
              K.line(g, 41, 25, 43, 30, st[0], 1); K.line(g, 28, 31, 46, 31, st[0], 1);
            } else {
              // a neat stack, a flat river stone on top
              for (let i = 0; i < 4; i++) sheet(18 - i, 26 - i, 16, 9, 0);
              K.ell(g, 23, 21.5, 7, 3.2, st[0]); K.ell(g, 22.5, 21, 6.5, 2.6, st[1]); K.ell(g, 22, 20.5, 5, 1.8, st[2]); K.R(g, 19, 20, 3, 1, st[4]);
            }
          } else {
            const L = [[6, 28, 0], [22, 32, 0], [36, 26, 0], [14, 20, 0]];
            if (f) { L[0][2] = f === 1 ? 5 : f === 2 ? 9 : 3; L[2][2] = f === 2 ? 4 : f === 3 ? 8 : 2; L[0][0] += f * 4; L[2][0] += f * 3; }
            for (const [x0, y0, lift] of L) sheet(x0, y0, 14, 9, lift);
          }
          K.outline(g, 56, 44, 'sel');
          g.globalCompositeOperation = 'destination-over';
          K.shadow(g, 28, 38, 20, 3, 0.18);
          g.globalCompositeOperation = 'source-over';
        }));
        c.drawImage(cv, x - 12, y - 10);
      },
    };
  }
  papersArt('pet_papers', false);
  papersArt('pet_papers_tidy', true);
  // the tanuki's hollow: a den dug in under the roots at the foot of the big tree (seen, and solid for you)
  const SOIL = ['#2e2118', '#46321f', '#5f462c', '#7b5d3b', '#98794f'];
  RB.props.P.pet_hollow = {
    id: 'pet_hollow', w: 1, h: 1, block: true,
    draw(c, x, y, pal, t, o) { c.save(); c.scale(0.5, 0.5); this.draw2(c, x * 2, y * 2, pal, t, o); c.restore(); },
    draw2(c, x, y, pal) {
      // art px (a tile is 32×32); the roots reach up into the trunk of the tree above
      const cv = K.cached('pet_hollow|' + K.palInfo(pal).key, () => K.make(38, 40, (g) => {
        const M = K.mat(pal), tr = M.trunk;
        // the earth thrown up round the entrance, lit from the upper left
        K.ell(g, 19, 30, 16, 7.5, SOIL[1]);
        K.ell(g, 18, 29, 15, 6.5, SOIL[2]);
        K.ell(g, 15, 27, 9, 3.5, SOIL[3]);
        K.ell(g, 12, 26, 4, 1.5, SOIL[4]);
        // the entrance: dark, deeper inside, a lit lip at the front
        K.ell(g, 20, 29.5, 8.5, 5, '#1b130d');
        K.ell(g, 20, 30.5, 6, 3.5, '#0f0b08');
        K.R(g, 14, 34, 12, 1, SOIL[3]);
        // a thick old root arches over the entrance (the den is dug in under it), rootlets run off into the earth
        const bark = (pts, w) => {
          for (let i = 0; i + 3 < pts.length; i += 2) K.line(g, pts[i], pts[i + 1], pts[i + 2], pts[i + 3], tr[0], w + 1);
          for (let i = 0; i + 3 < pts.length; i += 2) K.line(g, pts[i], pts[i + 1], pts[i + 2], pts[i + 3], tr[2], w);
          for (let i = 0; i + 3 < pts.length; i += 2) K.line(g, pts[i], pts[i + 1] - Math.floor(w / 2), pts[i + 2], pts[i + 3] - Math.floor(w / 2), tr[4], 1);
        };
        bark([1, 29, 6, 25, 11, 23, 17, 22, 23, 22, 29, 24, 33, 27, 37, 30], 3);
        bark([8, 24, 5, 21, 3, 20], 1);
        bark([28, 23, 31, 20, 34, 19], 1);
        K.R(g, 16, 21, 2, 1, tr[4]); K.R(g, 22, 21, 1, 1, tr[4]);
        // fallen leaves on the earth
        const LV = ['#b8541e', '#d9822e', '#8e3a1a', '#e3a240'];
        [[5, 31, 0], [9, 35, 1], [29, 33, 2], [25, 36, 3], [33, 30, 1], [3, 27, 3]].forEach(([lx, ly, k]) => K.R(g, lx, ly, 2, 1, LV[k]));
        K.outline(g, 38, 40, 'sel');
        g.globalCompositeOperation = 'destination-over';
        K.shadow(g, 19, 33, 15, 3, 0.2);
        g.globalCompositeOperation = 'source-over';
      }));
      c.drawImage(cv, x - 3, y - 10);
    },
  };
  // the gap in the trees where the draught comes in: nothing drawn (the trees are the map's), only looked at
  if (!RB.props.P.pet_look) RB.props.P.pet_look = { id: 'pet_look', w: 1, h: 1, block: false, draw() {}, draw2() {} };

  map.props.push(
    { p: 'pet_look', x: GAP[0], y: GAP[1], scene: 'pets.tanuki.gap', if: ON },
    { p: 'pet_papers', x: PAPERS[0], y: PAPERS[1], scene: 'pets.tanuki.papers', if: ON + '&var.pet_tanuki<2' },
    { p: 'pet_papers_tidy', x: PAPERS[0], y: PAPERS[1], scene: 'pets.tanuki.papers', if: ON + '&var.pet_tanuki>=2&!pet_tanuki_by_lee', o: { by: 'stone' } },
    { p: 'pet_papers_tidy', x: PAPERS[0], y: PAPERS[1], scene: 'pets.tanuki.papers', if: ON + '&var.pet_tanuki>=2&pet_tanuki_by_lee', o: { by: 'lee' } },
    { p: 'pet_hollow', x: HOLLOW[0], y: HOLLOW[1], scene: 'pets.tanuki.tanuki', if: ON + '&!pet.tanuki' },
    { p: 'pet_hollow', x: HOLLOW[0], y: HOLLOW[1], scene: 'pets.tanuki.empty', if: ON + '&pet.tanuki' },
  );
  map.onEnter = (map.onEnter || []).concat([{ scene: 'pets.tanuki.notice', if: ON + '&!pet.tanuki&!seen.pets.tanuki.tanuki&!seen.pets.tanuki.papers&comp', once: true }]);

  // ---- the tanuki before it joins you: comes toward its hollow, the papers skitter, it backs off --------------
  const V = { near: null };
  const sm = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  RB.petWorld.addWild({
    id: 'tanuki', species: 'tanuki', look: 'warm', map: 'co.road',
    show: (s) => RB.state.test(s, ON + '&!pet.tanuki'),
    place(s, t, reduce) {
      const step = (s.vars && s.vars.pet_tanuki) || 0;
      if (V.near) {
        const k = reduce ? 1 : Math.min(1, (performance.now() - V.near.t0) / 1100);
        const [bx, by] = V.near.to;
        return { x: HOLLOW[0] + (bx - HOLLOW[0]) * sm(k), y: HOLLOW[1] + (by - HOLLOW[1]) * sm(k), dir: k < 1 ? V.near.dir : V.near.face, po: k < 1 ? { gait: 'walk', ph: (t / 420) % 1 } : { sit: 1, paws: 1, hp: -8 } };
      }
      if (V.peek) return { x: HOLLOW[0], y: HOLLOW[1], dir: 'down', po: { sit: 0.6, hp: -6, nose: reduce ? 0 : Math.floor(t / 200) % 2 } };
      if (step >= 2) return { x: HOLLOW[0], y: HOLLOW[1], dir: 'down', po: { lie: 1, blink: !reduce && (t % 4400) < 170 ? 1 : 0.5 } };
      if (reduce) return { x: EDGE[0], y: EDGE[1], dir: 'left', po: { sit: 1, earF: -0.4 } };
      const ph = t % LOOP;
      if (ph < 1600) return { x: EDGE[0], y: EDGE[1], dir: 'left', po: { sit: 1, nose: Math.floor(t / 220) % 2 } };
      if (ph < 2600) { const k = (ph - 1600) / 1000; return { x: EDGE[0] - 2 * k, y: EDGE[1], dir: 'left', po: { gait: 'walk', ph: (t / 420) % 1 } }; }
      if (ph < GUST) return { x: HOLLOW[0], y: HOLLOW[1], dir: 'left', po: { hp: 10, nose: 1 } };
      if (ph < GUST + 300) return { x: HOLLOW[0], y: HOLLOW[1], dir: 'left', po: { lean: -0.8, crouch: 0.4, earF: -0.8 } };  // the papers skitter at it
      if (ph < GUST + 1000) { const k = (ph - GUST - 300) / 700; return { x: HOLLOW[0] + 2 * sm(k), y: HOLLOW[1], dir: 'right', po: { gait: 'run', ph: (t / 300) % 1 } }; }
      return { x: EDGE[0], y: EDGE[1], dir: 'left', po: { sit: 1, earF: -0.3 } };
    },
  });
  function tidy(s, how) {
    if (((s.vars && s.vars.pet_tanuki) || 0) >= 2 || RB.pets.record(s, 'tanuki')) return false;
    s.vars.pet_tanuki = 2;
    s.flags['pet_tanuki_by_' + how] = true;
    return true;
  }
  RB.pets.addVignette('tanuki', {
    species: 'tanuki', map: 'co.road', families: ['wind', 'stone'],
    // the Weave sheet's target (RB.pets.fieldTargets / fieldWeave)
    open: (s) => RB.state.test(s, ON),
    cause: { x: PAPERS[0], y: PAPERS[1], label: T('the loose papers in the grass', '{草|くさ} の {上|うえ} の {紙|かみ}') },
    fieldSay: {
      wind: T('A gentle breeze gathers the sheets and carries them into the rock’s lee. They will not fly from there.', 'やさしい {風|かぜ} が {紙|かみ} を {集|あつ}めて 、 {岩|いわ} の {陰|かげ} に そっと {運|はこ}んだ 。 そこ なら もう {舞|ま}わない 。'),
      stone: T('A stone’s weight holds the sheets down. The wind comes, and they no longer move.', '{石|いし} の {重|おも}み が {紙|かみ} を {押|お}さえた 。 {風|かぜ} が {来|き}て も 、 もう {動|うご}かない 。'),
    },
    fieldNeutral: { '*': T('The sheets still lift each time the wind comes.', '{紙|かみ} は まだ {風|かぜ} が {来|く}る たびに {浮|う}き{上|あ}がる 。') },
    title: T('Paper in the Clearing', '{草|くさ}むら の {紙|かみ}'),
    met: T('At the edge of the trees on the Orchard Road, once the loose papers stopped skittering past its hollow.', '{灰実|はいみ} へ の {坂道|さかみち} の {木|き} の {下|した} で 、 {紙|かみ} が {舞|ま}わなく なって から 。'),
    // a gentle 風 carries the sheets into the rock's lee, where they settle; 石 or 土 weighs them down
    apply(s, family) { return tidy(s, family === 'wind' ? 'lee' : 'stone'); },
    state: (s) => ({ step: (s.vars && s.vars.pet_tanuki) || 0, met: !!RB.pets.record(s, 'tanuki') }),
    stage(name) {
      const W = RB.world.W;
      if (name === 'peek') { V.peek = true; return new Promise((r) => setTimeout(r, RB.test && RB.test.auto ? 0 : 600)); }
      if (name === 'near' && W.player) {
        V.peek = false;
        const to = RB.petWorld.nearTile(HOLLOW, { own: [HOLLOW], avoid: [PAPERS, GAP], fallback: EDGE, leave: true });
        V.near = { t0: performance.now(), to, dir: to[0] > HOLLOW[0] ? 'right' : to[0] < HOLLOW[0] ? 'left' : 'down', face: RB.petWorld.faceFrom(to) };
        return new Promise((r) => setTimeout(r, RB.test && RB.test.auto ? 0 : 1150));
      }
      if (name === 'back') { V.near = null; V.peek = false; }
      return null;
    },
  });
  RB.bus.on('map:enter', () => { V.near = null; V.peek = false; });

  RB.pets.meeting.tanuki = {
    title: T('Paper in the Clearing', '{草|くさ}むら の {紙|かみ}'),
    text: T('Under the trees by the Orchard Road, old notices kept blowing across a tanuki’s hollow. Once they were gathered up, you waited — and after a while it came out, sat down beside you, and decided to come along.', '{灰実|はいみ} へ の {坂道|さかみち} の {木|き} の {下|した} 。 {古|ふる}い {貼|は}り{紙|がみ} が 、 たぬき の {寝床|ねどこ} の {前|まえ} を {何度|なんど} も {飛|と}んで いた 。 {紙|かみ} を まとめて 、 しばらく {待|ま}つ と 、 たぬき は {出|で}て きて {隣|となり} に {座|すわ}り 、 {一緒|いっしょ} に {来|く}る こと に した 。'),
    reply: {
      nao: T('It copied the way you sat. Watch it — it’ll be sorting letters by next week.', 'お{前|まえ} の {座|すわ}り{方|かた} 、 まね してた な 。 {来週|らいしゅう} に は {手紙|てがみ} を {仕分|しわ}けてる かも な 。'),
      mio: T('It wasn’t frightened of us — only of the paper. That’s rather sweet.', '{私|わたし}たち じゃ なくて 、 {紙|かみ} が {怖|こわ}かった の ね 。 なんだか かわいい 。'),
      ren: T('Old notices in the grass, and a creature who only wanted quiet. The Hush would have tidied it differently. I prefer this.', '{草|くさ} の {中|なか} の {古|ふる}い {貼|は}り{紙|がみ} と 、 {静|しず}か に {休|やす}みたい だけ の {生|い}き{物|もの} 。 しじま なら 、 {違|ちが}う やり{方|かた} で {片付|かたづ}けた でしょう 。 {私|わたし} は こちら が いい 。'),
      suzu: T('A born understudy. It learns every move by watching. We’ll get along.', '{生|う}まれつき の {代役|だいやく} だ ね 。 {見|み}て {全部|ぜんぶ} {覚|おぼ}える 。 きっと {気|き} が {合|あ}う よ 。'),
    },
  };

  RB.script.add(`
@scene pets.tanuki.notice
?(party=nao) nao: {道|みち} の {北|きた} 、 {木|き} の {下|した} に たぬき が いる 。 {何|なに} か を {気|き} に してる 。 || North of the road, under the trees — a tanuki. Something's bothering it.
?(party=mio) mio: あそこ 、 {木|き} の {下|した} 。 たぬき が {行|い}ったり {来|き}たり してる 。 || There, under the trees. A tanuki, going back and forth.
?(party=ren) ren: {木|き} の {根元|ねもと} に 、 たぬき が います 。 {落|お}ち{着|つ}けない よう です ね 。 || There's a tanuki at the foot of the trees. It can't seem to settle.
?(party=suzu) suzu: {見|み}て {見|み}て 、 たぬき ! {木|き} の {下|した} で 、 {出|で}たり {入|はい}ったり 。 || Look, look — a tanuki! In and out under the trees.

@scene pets.tanuki.tanuki
!if var.pet_tanuki>=2 -> settled
narr: たぬき が 、 {大|おお}きな {木|き} の {根元|ねもと} の くぼみ に {戻|もど}ろう と する 。 {風|かぜ} が {吹|ふ}く と 、 {草|くさ} の {上|うえ} の {紙|かみ} が {舞|ま}い{上|あ}がって 、 たぬき は {後|うし}ろ に {下|さ}がって しまう 。 || A tanuki keeps trying to get back to the hollow at the foot of the big tree. When the wind blows, the papers in the grass fly up, and it backs away.
?(party=nao) nao: {紙|かみ} が {苦手|にがて} な たぬき 、 か 。 {俺|おれ} と は {気|き} が {合|あ}わない な 。 || A tanuki that can't stand paper. We wouldn't get on.
?(party=mio) mio: {寝床|ねどこ} の {前|まえ} が 、 {散|ち}らかって いる の ね 。 || The front of its bed is all cluttered.
?(party=ren) ren: {風|かぜ} は どこ から {入|はい}って くる の でしょう 。 {木|き} の {間|あいだ} か な 。 || Where is the wind getting in? Between the trees, perhaps.
?(party=suzu) suzu: {出番|でばん} の たびに {紙吹雪|かみふぶき} 。 {本人|ほんにん} は {嬉|うれ}しくない みたい 。 || Confetti at every entrance. It doesn't seem pleased.
!var pet_tanuki = 1
!end
:settled
narr: たぬき は くぼみ の {中|なか} で {丸|まる}く なって いる 。 {目|め} だけ が こちら を {見|み}て いる 。 || The tanuki is curled up in the hollow. Only its eyes are on you.
!choice
* {道|みち} の {端|はし} に {座|すわ}って 、 {静|しず}か に {待|ま}つ || Sit at the edge of the path and wait quietly. -> wait
* そっと して おく || Leave it be. -> end
:wait
narr: {道|みち} の {端|はし} に {腰|こし} を {下|お}ろす 。 {葉|は} が {一枚|いちまい} 、 {落|お}ちて くる 。 || You sit down at the edge of the path. A leaf drifts down.
narr: もう {一枚|いちまい} 。 {遠|とお}く で 、 {鳥|とり} が {鳴|な}いた 。 || Then another. Far off, a bird calls.
!hook pet_vig tanuki peek
narr: くぼみ から 、 {黒|くろ}い {鼻|はな} が {少|すこ}し だけ {出|で}て きた 。 {鼻|はな} が ぴくぴく {動|うご}く 。 || A black nose edges out of the hollow. It twitches.
narr: たぬき は ゆっくり {出|で}て きて 、 あなた の {靴|くつ} の {匂|にお}い を かいで 、 {隣|となり} に {座|すわ}った 。 {座|すわ}り{方|かた} が 、 あなた と そっくり だ 。 || The tanuki comes out slowly, sniffs your boots, and sits down beside you. It sits exactly the way you do.
!hook pet_vig tanuki near
?(party=nao) nao[smirk]: まね が {上手|うま}い な 。 || Good at copying, isn't it.
?(party=mio) mio[smile]: {前足|まえあし} を そろえて いる 。 お{行儀|ぎょうぎ} が いい の ね 。 || Front paws together. Very well-mannered.
?(party=ren) ren: {待|ま}つ こと が 、 {一番|いちばん} の {言葉|ことば} でした ね 。 || Waiting said more than anything we could have.
?(party=suzu) suzu[laugh]: {新人|しんじん} {役者|やくしゃ} 、 {入団|にゅうだん} {希望|きぼう} ! || A new player, hoping to join the company!
narr: たぬき は あなた を {見上|みあ}げて 、 {首|くび} を かしげた 。 {一緒|いっしょ} に {来|く}る {気|き} が ある よう だ 。 || The tanuki looks up at you and tilts its head. It seems willing to come along.
!choice
* {一緒|いっしょ} に {来|く}る ? || Invite it to come with you. -> invite
* また {今度|こんど} ね || Not now. -> notnow
:invite
!hook pet_meet tanuki
!end
:notnow
!hook pet_vig tanuki back
narr: たぬき は くぼみ に {戻|もど}って 、 また {丸|まる}く なった 。 ここ に {来|く}れば 、 また {会|あ}える 。 || The tanuki goes back into its hollow and curls up again. It will be here whenever you come by.

@scene pets.tanuki.empty
narr: {木|き} の {根元|ねもと} の くぼみ 。 {今|いま} は {空|から} だ 。 {落|お}ち{葉|ば} が {少|すこ}し {入|はい}って いる 。 || The hollow at the foot of the tree. Empty now, with a few fallen leaves inside.

@scene pets.tanuki.gap
narr: {木|き} と {木|き} の {間|あいだ} に 、 {隙間|すきま} が ある 。 {坂|さか} の {下|した} から {来|く}る {風|かぜ} が 、 ここ で {細|ほそ}く なって {草|くさ} の {上|うえ} を {抜|ぬ}けて いく 。 || There's a gap between the trees. The wind coming up the slope narrows here and slips across the grass.
?(var.pet_tanuki<2) narr: {風|かぜ} の {通|とお}り{道|みち} の {先|さき} に 、 {紙|かみ} が {何枚|なんまい} か {散|ち}らばって いる 。 {岩|いわ} の {陰|かげ} なら 、 {風|かぜ} は {届|とど}かない 。 || A few sheets of paper lie scattered where the draught runs. Behind the rock, the wind wouldn't reach.
?(var.pet_tanuki<1) !var pet_tanuki = 1

@scene pets.tanuki.papers
!if var.pet_tanuki>=2&!pet.tanuki -> tanuki
!if var.pet_tanuki>=2 -> fixed
narr: {古|ふる}い {祭|まつ}り の {貼|は}り{紙|がみ} が 、 {何枚|なんまい} か {草|くさ} の {上|うえ} に {落|お}ちて いる 。 {雨|あめ} で やわらかく なって いて 、 {風|かぜ} が {来|く}る たびに {浮|う}き{上|あ}がる 。 || A few old festival notices lie in the grass, soft with rain. Every time the wind comes, they lift.
!var pet_tanuki = 1
!choice
* {紙|かみ} を まとめて 、 {平|たい}らな {石|いし} で {押|お}さえる || Gather them up and weigh them down with a flat stone. -> stone
* {紙|かみ} を まとめて 、 {岩|いわ} の {陰|かげ} に {入|い}れる || Gather them up and tuck them into the rock's lee. -> lee
* そのまま に して おく || Leave them for now. -> end
:stone
narr: {紙|かみ} を {一枚|いちまい} ずつ {拾|ひろ}って {重|かさ}ね 、 {平|たい}らな {石|いし} を {上|うえ} に {置|お}く 。 {風|かぜ} が {来|き}て も 、 もう {動|うご}かない 。 || You pick up the sheets one by one, stack them, and set a flat stone on top. The wind comes, and they no longer move.
!var pet_tanuki = 2
!set pet_tanuki_by_stone
!goto after
:lee
narr: {紙|かみ} を まとめて 、 {岩|いわ} の {陰|かげ} に {差|さ}し{込|こ}む 。 {風|かぜ} は {岩|いわ} の {上|うえ} を {通|とお}り{過|す}ぎて いく 。 || You gather the sheets and slip them into the lee of the rock. The wind passes over the top of it.
!var pet_tanuki = 2
!set pet_tanuki_by_lee
:after
?(party=nao) nao: {配達|はいたつ} {前|まえ} の {手紙|てがみ} みたい に なった な 。 || Looks like a bundle ready for delivery.
?(party=mio) mio: {片付|かたづ}いた ね 。 {入|はい}り{口|ぐち} が すっきり した 。 || That's tidy. The way in is clear now.
?(party=ren) ren: {紙|かみ} は {飛|と}ばさず に 、 {残|のこ}して おきましょう 。 {誰|だれ} か の {字|じ} です から 。 || Better to keep the papers than let them blow away. Someone wrote them.
?(party=suzu) suzu: {紙吹雪|かみふぶき} 、 {片付|かたづ}け {完了|かんりょう} ! || Confetti cleared!
narr: {風|かぜ} が {吹|ふ}いて も 、 もう {何|なに} も {舞|ま}わない 。 たぬき が くぼみ に {入|はい}って 、 {丸|まる}く なった 。 || The wind blows and nothing flies any more. The tanuki slips into its hollow and curls up.
!end
:tanuki
!call pets.tanuki.tanuki
!end
:fixed
?(pet_tanuki_by_lee) narr: {紙|かみ} は {岩|いわ} の {陰|かげ} に まとまって いる 。 || The papers are gathered in the rock's lee.
?(!pet_tanuki_by_lee) narr: {紙|かみ} は {石|いし} の {下|した} に きちんと {重|かさ}なって いる 。 || The papers lie neatly stacked under the stone.
`, 'pets/tanuki');
})(RB.content);
