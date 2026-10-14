/* Roadside Keepsakes for Manybridge (Chapter 3) and Blockprint and Playhouse Rows (Chapter 4) (KS-1; the owner asked
 * for about two new keepsakes per new chapter). The guardian's indigo headband (gd_mb_keepsake) and the iroha print
 * (lw_iroha_print) were already theirs (00_items.js); these four are new, two of each kind:
 *   Manybridge
 *     ks_mb_cord   a person's thanks: Ichi, the boy lost in the canals one night and found by the East Bridge, ties a
 *                  knot for each bridge whose name he learns; he gives you a cord with one knot, Musubi Bridge.
 *                  His first talk option once the chapter is over (`mb1_done`), wherever his routine has him (the
 *                  Living World's places share one talk list, so the option is added to that list in place).
 *     ks_mb_token  a found thing: the porters' canal board, where the city's first barge went where it was told
 *                  (stage 1 of the chapter). After the chapter the board has new tokens; the old ones wait in a box
 *                  on the porters' shelf (a silent prop given a scene), Fujiya's wisteria barge among them.
 *   Blockprint and Playhouse Rows
 *     ks_mp_fan    a person's thanks: Tomi of the festival committee gives every helper a fan from the Opening of
 *                  the River, printed on Sōbē's press, the helpers' names on its back. Her first talk option at the
 *                  festival hall once the chapter is over (`mb2_done`).
 *     ks_mp_type   a found thing: "Names are heavy," the Understage said. After the festival, one piece of type, 名,
 *                  is left in an old type case at the bottom of the Understage (a silent prop given a scene).
 * Every condition is the chapter's own end (every finished playthrough has it), so a save already past these chapters
 * can still claim each one, once (the keepsake is then recorded and the option falls away). This file only adds to
 * maps defined earlier and loads after every chapter and after the Living World (zzz_living). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const KS = C.keepsakes;
  const T = (jp, en) => ({ jp, en });
  // a crisp pixel helper on a 32×32 context (whole pixels only)
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const OUT = '#2a2024';
  const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); R(g, cx - w, cy + y, w * 2 + 1, 1, c); } };
  const ring = (g, cx, cy, r, c) => { for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2; R(g, Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), 1, 1, c); } };
  const shadow = (g, w) => R(g, 16 - (w >> 1), 28, w, 1, 'rgba(0,0,0,0.22)');
  const def = (id, d) => { KS[id] = Object.assign({ id, ed: 2 }, d); };

  // ---- Manybridge ------------------------------------------------------------------------------------------------
  def('ks_mb_cord', {
    name: T('{橋|はし} を {数|かぞ}える {紐|ひも}', 'Bridge-Counting Cord'),
    desc: { en: 'A red-and-white cord from Ichi with a single knot in it: Musubi Bridge, the first of Manybridge\'s bridges. He ties a knot for every bridge whose name he learns, the way the boatmen\'s counting song goes. The next knots are yours to tie.' },
    how: { en: 'Given by Ichi once the bridges had their names back.' },
    region: 'manybridge', source: { kind: 'person', id: 'mb_ichi' },
    hint: {
      broad: { en: 'Someone small in Manybridge keeps count of the bridges, once they all have names again.' },
      specific: { en: 'Once the bridges have their names back, talk to Ichi: by his house in the Exchange district, or wherever he is learning more names.' },
    },
    art(g) {
      shadow(g, 26);
      // the cord: one S-shaped wave from left to right, twisted red and cream, the knot at its middle
      const f = (x) => Math.round(15 - 6 * Math.sin((x - 4) / 23 * Math.PI * 2));
      const span = (x) => { const a = f(x), b = f(Math.min(27, x + 1)); return [Math.min(a, b) - 1, Math.max(a, b)]; };
      for (let x = 4; x <= 27; x++) { const [t, b] = span(x); R(g, x, t - 1, 1, b - t + 3, OUT); }
      for (let x = 4; x <= 27; x++) {
        const [t, b] = span(x);
        for (let y = t; y <= b; y++) R(g, x, y, 1, 1, (x + y) % 3 === 0 ? '#e8d8b0' : (x + y) % 3 === 1 ? '#c84a3a' : '#a83a2e');
      }
      // the frayed ends
      R(g, 1, 13, 3, 5, OUT); R(g, 2, 14, 1, 1, '#e8d8b0'); R(g, 1, 16, 2, 1, '#c84a3a'); R(g, 3, 15, 1, 1, '#c84a3a');
      R(g, 28, 13, 3, 5, OUT); R(g, 29, 14, 1, 1, '#c84a3a'); R(g, 29, 16, 2, 1, '#e8d8b0'); R(g, 28, 15, 1, 1, '#c84a3a');
      // the one knot: Musubi Bridge
      disc(g, 16, 15, 4, OUT); disc(g, 16, 15, 3, '#c84a3a');
      R(g, 14, 13, 4, 1, '#e8d8b0'); R(g, 13, 14, 1, 2, '#e8d8b0'); R(g, 15, 15, 3, 1, '#e8d8b0');
      R(g, 15, 17, 4, 1, '#a83a2e'); R(g, 18, 14, 1, 3, '#a83a2e'); R(g, 14, 12, 2, 1, '#fff0d8');
    },
  });
  def('ks_mb_token', {
    name: T('{舟|ふね} の {駒|こま}', 'Barge Token'),
    desc: { en: 'A wooden barge token from the porters\' canal board, a wisteria flower burned into its side: Fujiya\'s rice barge, the first barge you sent, which went exactly where it was told. The board has new tokens now; the old ones went to whoever wanted them.' },
    how: { en: 'Taken from the box of old tokens on the porters\' shelf, once the bridges had their names back.' },
    region: 'manybridge', source: { kind: 'place', id: 'mb.porters' },
    hint: {
      broad: { en: 'In Manybridge, the first thing you set moving is still remembered.' },
      specific: { en: 'Once the bridges have their names back, look on the shelf in the porters\' office next to Fujiya.' },
    },
    art(g) {
      shadow(g, 24);
      // the hull, side on: a flat-bottomed barge, wider at the gunwale
      for (let y = 16; y <= 24; y++) { const i = Math.max(0, y - 17); R(g, 3 + i, y, 26 - i * 2, 1, OUT); }
      for (let y = 17; y <= 23; y++) { const i = y - 17; R(g, 4 + i, y, 24 - i * 2, 1, y === 17 ? '#e8c890' : y < 20 ? '#c89a60' : y < 22 ? '#a87a48' : '#8a6038'); }
      R(g, 5, 19, 22, 1, '#b08650'); // a plank seam
      // the cargo: a rice bale lying on the deck, tied twice
      R(g, 9, 9, 14, 8, OUT); R(g, 8, 10, 16, 6, OUT);
      R(g, 9, 10, 14, 6, '#d8c07a'); R(g, 10, 10, 12, 1, '#f0e0a0'); R(g, 9, 14, 14, 2, '#c0a660');
      R(g, 12, 9, 1, 8, '#7a5a30'); R(g, 19, 9, 1, 8, '#7a5a30');
      for (const [x, y] of [[10, 12], [15, 11], [17, 13], [21, 12]]) R(g, x, y, 1, 1, '#b89a50'); // straw
      // the brand: a wisteria flower burned into the side
      R(g, 14, 18, 5, 1, '#4a2e22');
      for (const [x, y] of [[14, 19], [16, 19], [18, 19], [15, 20], [17, 20], [16, 21]]) R(g, x, y, 1, 1, '#4a2e22');
      R(g, 6, 17, 3, 1, '#fff0c8'); // the shine on the gunwale
    },
  });

  // ---- Blockprint and Playhouse Rows ---------------------------------------------------------------------------------
  def('ks_mp_fan', {
    name: T('{川開|かわびら}き の {団扇|うちわ}', 'Opening-Night Fan'),
    desc: { en: 'A round fan from the Opening of the River, printed on Sōbē\'s press: fireworks on the front, and on the back the names of the festival committee and its helpers, yours among them. The yukata went back the next morning; this was Tomi\'s to give. (Fans printed with pictures, uchiwa-e, were a real Edo trade.)' },
    how: { en: 'Given by Tomi at the festival hall, after the Opening of the River.' },
    region: 'blockprint', source: { kind: 'person', id: 'mp_tomi' },
    hint: {
      broad: { en: 'On Playhouse Row, the festival\'s helpers are not forgotten.' },
      specific: { en: 'After the Opening of the River, see Tomi in the festival hall south of the canal.' },
    },
    art(g) {
      shadow(g, 14);
      // the bamboo handle
      R(g, 14, 20, 4, 8, OUT); R(g, 15, 20, 2, 7, '#c8a868'); R(g, 15, 20, 1, 7, '#e0c888'); R(g, 15, 24, 2, 1, '#a88848');
      // the round face: indigo paper on fine ribs, a cream binding at the rim
      disc(g, 16, 11, 10, OUT); disc(g, 16, 11, 9, '#2e4a7a');
      for (let k = -3; k <= 3; k++) for (let i = 0; i < 15; i++) R(g, Math.round(16 + k * 2.4 * i / 15), 19 - i, 1, 1, '#3a5888');
      ring(g, 16, 11, 9, '#e8dcc0');
      // the printed firework: a bloom of three rings of sparks, and a small blue one below it
      for (let a = 0; a < 12; a++) {
        const t = a / 12 * Math.PI * 2;
        R(g, Math.round(17 + Math.cos(t) * 2.5), Math.round(9 + Math.sin(t) * 2.5), 1, 1, '#f8e8a0');
        R(g, Math.round(17 + Math.cos(t) * 4.5), Math.round(9 + Math.sin(t) * 4.5), 1, 1, '#f0a050');
        R(g, Math.round(17 + Math.cos(t + 0.26) * 6.2), Math.round(9 + Math.sin(t + 0.26) * 6.2), 1, 1, '#e85a4a');
      }
      R(g, 16, 8, 2, 2, '#fff4c8');
      for (const [x, y] of [[10, 14], [12, 14], [11, 13], [11, 15], [9, 16], [13, 16]]) R(g, x, y, 1, 1, '#a8d8f0');
    },
  });
  // 名 ("name") as a glyph on a 10 × 10 grid, mirrored as type is cut
  const NA = ['...#......', '..#####...', '.#....#...', '#..#.#....', '....#.....', '...#......', '..#######.', '..#.....#.', '..#.....#.', '..#######.'];
  def('ks_mp_type', {
    name: T('「{名|な}」 の {活字|かつじ}', 'The Type for 名'),
    desc: { en: 'A single piece of wooden type cut with 名, "name", reversed as type always is. It was left in an old type case at the bottom of the Understage once the names had gone back up to the stage. "Names are heavy," the Understage said. This one is small, and light.' },
    how: { en: 'Found in an old type case at the bottom of the Understage, after the festival.' },
    region: 'blockprint', source: { kind: 'place', id: 'mp.bottom' },
    hint: {
      broad: { en: 'Something heavy was left behind, deep under Playhouse Row.' },
      specific: { en: 'After the festival, go back down to the very bottom of the Understage and look in the old type cases.' },
    },
    art(g) {
      shadow(g, 22);
      // the block, face on, its depth to the lower right
      R(g, 6, 6, 17, 17, OUT);
      for (let i = 1; i <= 3; i++) { R(g, 6 + i, 22 + i, 17, 1, OUT); R(g, 22 + i, 6 + i, 1, 17, OUT); }
      for (let i = 1; i <= 2; i++) { R(g, 7 + i, 22 + i, 15, 1, '#8a6436'); R(g, 22 + i, 7 + i, 1, 15, '#6e4e2a'); }
      R(g, 23, 23, 2, 2, '#5a3e22');
      // the face: the shoulder round the edge, the cut-away ground, the raised and inked character
      R(g, 7, 7, 15, 15, '#e0c48a'); R(g, 8, 8, 13, 13, '#a88250');
      NA.forEach((row, y) => { for (let x = 0; x < 10; x++) if (row[9 - x] === '#') R(g, 9 + x, 9 + y, 1, 1, '#1e1a20'); });
      R(g, 7, 7, 15, 1, '#f0dcaa'); R(g, 7, 7, 1, 15, '#f0dcaa'); // the light on the top and left edges
    },
  });

  // ---- where they are -------------------------------------------------------------------------------------------------
  const M = (id) => C.maps[id];
  // a guarded talk option at the head of a person's list (as src/content/zz_cases.js firstTalk), changed in place: a
  // Living World routine gives all of a resident's places one shared list (src/content/zzz_living/05_author.js)
  const firstTalk = (map, id, opt) => {
    const m = M(map), n = m && (m.npcs || []).find((q) => q.id === id);
    if (!n) return false;
    if (Array.isArray(n.talk)) n.talk.unshift(opt);
    else n.talk = [opt].concat(n.talk ? [{ scene: n.talk }] : []);
    return true;
  };
  // give an existing, silent prop a scene (only if it has none), as src/content/zz_cases.js sceneFor
  const sceneFor = (map, p, x, y, scene) => { const m = M(map); const pr = m && (m.props || []).find((q) => q.p === p && q.x === x && q.y === y); if (pr && !pr.scene) pr.scene = scene; return !!pr; };
  // Manybridge: Ichi (Exchange district by his house, or Sen's register, or Yoshi's old letters: one list)
  firstTalk('mb.exchange', 'mb_ichi', { if: 'mb1_done&!keepsake.ks_mb_cord', scene: 'mb.ks_cord_ichi' });
  // Manybridge: the porters' office shelf beside the canal board (the room is theirs; Take works outside after the story)
  sceneFor('mb.porters', 'shelf', 10, 2, 'mb.ks_token_shelf');
  // Playhouse Row: Tomi at the festival hall (open from the festival's end)
  firstTalk('mp.festhall', 'mp_tomi_h', { if: 'mb2_done&!keepsake.ks_mp_fan', scene: 'mp.ks_fan_tomi' });
  // the bottom of the Understage: the old type case by the west wall
  sceneFor('mp.bottom', 'mp_typecase', 2, 2, 'mp.ks_type_case');

  RB.lex.add(RB.lex.parseTable(`
団扇|うちわ|n|I|a round fan (flat, on a handle: the summer festival kind)
`));

  RB.script.add(`
@scene mb.ks_cord_ichi
# Staged: Ichi runs up with his long string of knots and shows you; he holds out a short new cord with one knot, from
# his hand to yours; your companion's word; you look at the cord in your hand.
!faceplayer
mb_ichi: あ ！ {橋|はし} の {名前|なまえ} を {返|かえ}して くれた {人|ひと} だ ！ || Oh! It's you! You gave the bridges their names back!
mb_ichi: {見|み}て 。 {橋|はし} の {名前|なまえ} を {一|ひと}つ {覚|おぼ}えたら 、 {紐|ひも} に {結|むす}び{目|め} を {一|ひと}つ {作|つく}る の 。 「 {一|ひと}つ {結|むす}んで 、 {二|ふた}つ {渡|わた}って 」 。 {船頭|せんどう} さん の {歌|うた} と {同|おな}じ だ よ 。 || Look. Every time I learn a bridge's name, I tie a knot in my string. "One, tie it; two, cross it." Same as the boatmen's song.
!prop mb_ichi cord
mb_ichi: これ は 、 {作|つく}った ばかり の {紐|ひも} 。 {結|むす}び{目|め} は まだ {一|ひと}つ だけ 。 {一番|いちばん} の {橋|はし} 、 {結|むす}び{橋|ばし} だ よ 。 || This one's new. It's only got one knot so far: bridge number one, Musubi Bridge.
!gesture mb_ichi handover pc
!gesture pc receive mb_ichi
mb_ichi: あげる ！ {次|つぎ} の {結|むす}び{目|め} は 、 {自分|じぶん} で {作|つく}って ね 。 もう {迷子|まいご} に ならない よ 。 {橋|はし} に {名前|なまえ} が ある から ！ || It's yours! Tie the next knots yourself, OK? I won't get lost any more. The bridges have names!
?(comp=nao) comp: {結|むす}び{目|め} {一|ひと}つ に 、 {名前|なまえ} {一|ひと}つ 。 {配達人|はいたつにん} の {帳面|ちょうめん} より {確|たし}か だ な 。 || One knot, one name. More reliable than a courier's ledger.
?(comp=mio) comp[smile]: イチ くん 、 {八百|はっぴゃく} {結|むす}んだら 、 {紐|ひも} が とても {長|なが}く なる ね 。 || Ichi, by the time you've tied eight hundred, that string will be awfully long.
?(comp=mio) mb_ichi: {長|なが}く なったら 、 {二本|にほん} に する ！ || Then I'll make two!
?(comp=ren) comp: {結|むす}び{目|め} を たどれば 、 {帰|かえ}り{道|みち} が {分|わ}かります ね 。 …… {私|わたし} に も 、 {一本|いっぽん} {必要|ひつよう} かも しれません 。 || Follow the knots back and you can find the way home. …Perhaps I need one too.
?(comp=suzu) comp[smile]: 「 {一|ひと}つ {結|むす}んで 、 {二|ふた}つ {渡|わた}って 」 。 いい {歌|うた} ね 。 {舞台|ぶたい} で {歌|うた}いたい くらい よ 。 || "One, tie it; two, cross it." A lovely song. I'd sing it on a stage.
!hook cs_keepsake ks_mb_cord
!gesture pc check prop=cord
narr: {橋|はし} を {数|かぞ}える {紐|ひも} を もらった 。 || You receive Ichi's bridge-counting cord.

@scene mb.ks_token_shelf
# Staged: you bend to the shelf by the canal board; a box of old tokens, the porters' note on its lid; you pick out
# the one with the wisteria brand (a choice); your companion's word. With it already taken, you look at the box.
?(!mb1_done) narr: {棚|たな} に 、 {荷札|にふだ} の {束|たば} と {縄|なわ} が {並|なら}んで いる 。 || On the shelf: bundles of cargo tags and coils of rope.
?(!mb1_done) !end
!if keepsake.ks_mb_token -> have
!gesture pc bend 10,2 hold
narr: {棚|たな} の {上|うえ} に {小|ちい}さな {箱|はこ} 。 {運河|うんが} の {盤|ばん} の {古|ふる}い {駒|こま} が 、 たくさん {入|はい}って いる 。 || A small box on the shelf, full of old tokens from the canal board.
narr: {蓋|ふた} に {貼|は}り{紙|がみ} 。 「 {盤|ばん} の {駒|こま} を {新|あたら}しく した 。 {古|ふる}い の は 、 {欲|ほ}しい {人|ひと} に やる 。 ―― {荷運|にはこ}び{屋|や} 」 || A note on the lid: "The board has new tokens. The old ones go to anyone who wants them. — The porters"
narr: {一|ひと}つ だけ 、 {藤|ふじ} の {花|はな} の {印|しるし} が {焼|や}いて ある {駒|こま} が ある 。 {藤屋|ふじや} の {米|こめ} の {舟|ふね} だ 。 あなた が {最初|さいしょ} に {送|おく}って 、 {言|い}われた {通|とお}り に {迷|まよ}わず {着|つ}いた {舟|ふね} 。 || One token alone has a wisteria flower burned into it: Fujiya's rice barge. The first barge you sent, and it went exactly where it was told without getting lost.
!choice
* {藤|ふじ} の {駒|こま} を もらう || Take the wisteria token -> take
* そのまま に する || Leave them -> end
:take
?(comp=nao) comp: {言|い}われた {通|とお}り に しか {行|い}かない {舟|ふね} 、 か 。 …… {正直|しょうじき} な {奴|やつ} だ 。 || A barge that only goes where it's told. …An honest sort.
?(comp=mio) comp[smile]: {最初|さいしょ} の {舟|ふね} が {着|つ}いた とき 、 ほっと した の 、 {覚|おぼ}えて います 。 || I remember how relieved I was when that first barge got there.
?(comp=ren) comp[shy]: {私|わたし} が {送|おく}って いたら 、 この {駒|こま} は {今頃|いまごろ} {海|うみ} の {上|うえ} です 。 || If I'd been the one sending it, this token would be at sea by now.
?(comp=suzu) comp[laugh]: {台本|だいほん} {通|どお}り の {役者|やくしゃ} の 、 {最初|さいしょ} の {舞台|ぶたい} ね 。 いい {記念|きねん} よ 。 || The actor who sticks to the script, and its first performance. A fine memento.
!hook cs_keepsake ks_mb_token
narr: {舟|ふね} の {駒|こま} を {一|ひと}つ もらった 。 || You take a barge token.
!end
:have
!gesture pc observe 10,2
narr: {箱|はこ} の {駒|こま} は 、 {少|すこ}し ずつ {減|へ}って いる 。 {子供|こども} たち が {持|も}って いく らしい 。 || The box is slowly emptying. The children seem to be taking them.

@scene mp.ks_fan_tomi
# Staged: Tomi among the summer's stall games; she takes a fan from the committee's stack and shows you the back,
# then gives it from her hand to yours; your companion's word.
!faceplayer
mp_tomi: あら 、 {来|き}て くれた の ね 。 ちょうど よかった わ 。 || Oh, you've come. Perfect timing.
mp_tomi: {川開|かわびら}き の {団扇|うちわ} よ 。 {宗兵衛|そうべえ} さん の {刷|す}り{場|ば} で {刷|す}って もらった の 。 {手伝|てつだ}って くれた {人|ひと} に 、 {一本|いっぽん} ずつ {配|くば}って いる の よ 。 || The Opening's fans. Sōbē's press printed them for us. I'm giving one to everyone who helped.
mp_tomi: {表|おもて} は {花火|はなび} 、 {裏|うら} は {世話役|せわやく} と {手伝|てつだ}い の {名前|なまえ} 。 || Fireworks on the front. On the back, the names of the committee and the helpers.
?(comp) mp_tomi: …… ほら 、 ここ 。 あなた たち の {名前|なまえ} も 、 ちゃんと {刷|す}って ある わ 。 || …Look, here. Your names are printed too.
?(!comp) mp_tomi: …… ほら 、 ここ 。 あなた の {名前|なまえ} も 、 ちゃんと {刷|す}って ある わ 。 || …Look, here. Your name is printed too.
!gesture mp_tomi handover pc
!gesture pc receive mp_tomi
mp_tomi: {浴衣|ゆかた} は {返|かえ}して もらった けど 、 これ は {返|かえ}さなくて いい の 。 {来年|らいねん} の {夏|なつ} も 、 これ で {扇|あお}いで ちょうだい 。 || The yukata had to come back, but this one is yours to keep. Fan yourself with it next summer too.
?(comp=nao) comp: {裏|うら} に {名前|なまえ} 、 か 。 …… {差出人|さしだしにん} の {欄|らん} みたい だ な 。 || Names on the back, eh. …Like the sender's line on a letter.
?(comp=mio) comp[smile]: {熱|ねつ} の ある {子|こ} を 、 これ で {扇|あお}いで あげられます ね 。 {薬箱|くすりばこ} に {入|い}れて おきます 。 || I can fan a child with a fever with this. I'll keep it in my medicine chest.
?(comp=ren) comp: {花火|はなび} は {消|き}えて も 、 {刷|す}った {花火|はなび} は {消|き}えません ね 。 || Fireworks fade, but printed fireworks don't.
?(comp=suzu) comp[smile]: {楽屋|がくや} で は 、 {団扇|うちわ} が ない と {困|こま}る の よ 。 {夏|なつ} の {舞台|ぶたい} は {暑|あつ}い から 。 || In the dressing room, you're lost without a fan. Summer stages are hot.
!hook cs_keepsake ks_mp_fan
narr: {川開|かわびら}き の {団扇|うちわ} を もらった 。 || You receive the Opening's fan.

@scene mp.ks_type_case
# Staged: down at the bottom of the Understage, now lit; you bend to the old type case by the west wall and take out
# the one piece of type left in it; your companion's word; you look at it in your hand. Before the festival's end the
# pit is too dark to see into; with it already taken, the case is empty.
?(!mb2_done) narr: {古|ふる}い {活字|かつじ} の {箱|はこ} 。 {暗|くら}くて 、 {中|なか} は よく {見|み}えない 。 || An old type case. It's too dark to see inside.
?(!mb2_done) !end
!if keepsake.ks_mp_type -> have
!gesture pc bend 2,2 hold
narr: {古|ふる}い {活字|かつじ} の {箱|はこ} 。 {仕切|しき}り は どれ も {空|から} だ が 、 {一|ひと}つ だけ {活字|かつじ} が {残|のこ}って いる 。 || An old type case. Every compartment is empty but one, where a single piece of type remains.
narr: {字|じ} は {鏡|かがみ} に {映|うつ}した よう に {彫|ほ}って ある 。 {活字|かつじ} だ から 。 {読|よ}む と 、 「{名|な}」 。 || The character is cut as if in a mirror, as type always is. It reads 名: "name".
narr: 「 {名前|なまえ} は {重|おも}い 」 と 、 {奈落|ならく} は {言|い}った 。 でも {手|て} に {取|と}る と 、 {小|ちい}さくて {軽|かる}い 。 || "Names are heavy," the Understage said. But in your hand it is small, and light.
?(comp=nao) comp: {重|おも}い もん か 。 {手紙|てがみ} {一通|いっつう} より {軽|かる}い ぞ 。 || Heavy? It's lighter than a single letter.
?(comp=mio) comp: こんな に {小|ちい}さい {字|じ} {一|ひと}つ が 、 {誰|だれ} か の {名前|なまえ} に なる の ね 。 || One little letter like this becomes part of somebody's name.
?(comp=ren) comp[smile]: {名前|なまえ} は {重荷|おもに} では ありません 。 …… ほら 、 こんな に {軽|かる}い 。 || Names are not burdens. …See? This light.
?(comp=suzu) comp: {軽|かる}くて も 、 {小|ちい}さくて も 、 {名前|なまえ} は {名前|なまえ} よ 。 {番付|ばんづけ} の {隅|すみ} の {小|ちい}さな {字|じ} でも ね 。 || Light or small, a name is a name. Even in small letters in the corner of a playbill.
!hook cs_keepsake ks_mp_type
!prop pc woodblock
!gesture pc check prop=woodblock
narr: 「{名|な}」 の {活字|かつじ} を {見|み}つけた 。 || You find the type for 名.
!end
:have
!gesture pc observe 2,2
narr: {古|ふる}い {活字|かつじ} の {箱|はこ} 。 {仕切|しき}り は 、 もう どれ も {空|から} だ 。 || The old type case. Every compartment is empty now.
`, 'zzzz_keepsakes/10_mb_mp');

  // Suzu's Kansai-ben for her lines above (src/lang/85_dialect.js; docs/dialect/suzu_kansai.md)
  RB.dialect.add('kansai', `
@ zzzz_keepsakes/10_mb_mp [mb.ks_cord_ichi]
= 「 {一|ひと}つ {結|むす}んで 、 {二|ふた}つ {渡|わた}って 」 。 いい {歌|うた} ね 。 {舞台|ぶたい} で {歌|うた}いたい くらい よ 。 || "One, tie it; two, cross it." A lovely song. I'd sing it on a stage.
> 「 {一|ひと}つ {結|むす}んで 、 {二|ふた}つ {渡|わた}って 」 。 ええ {歌|うた} や な 。 {舞台|ぶたい} で {歌|うた}いたい くらい や わ 。 || "One, tie it; two, cross it." Now that's a lovely song. I'd sing it on a stage, I would.
@ zzzz_keepsakes/10_mb_mp [mb.ks_token_shelf]
= {台本|だいほん} {通|どお}り の {役者|やくしゃ} の 、 {最初|さいしょ} の {舞台|ぶたい} ね 。 いい {記念|きねん} よ 。 || The actor who sticks to the script, and its first performance. A fine memento.
> {台本|だいほん} {通|どお}り の {役者|やくしゃ} の 、 {最初|さいしょ} の {舞台|ぶたい} や な 。 ええ {記念|きねん} や で 。 || The actor who sticks to the script, an' its first show. That's a fine memento, that is.
@ zzzz_keepsakes/10_mb_mp [mp.ks_fan_tomi]
= {楽屋|がくや} で は 、 {団扇|うちわ} が ない と {困|こま}る の よ 。 {夏|なつ} の {舞台|ぶたい} は {暑|あつ}い から 。 || In the dressing room, you're lost without a fan. Summer stages are hot.
> {楽屋|がくや} で は 、 {団扇|うちわ} が ない と {困|こま}る ねん 。 {夏|なつ} の {舞台|ぶたい} は {暑|あつ}い から な 。 || In the dressin' room, you're lost without a fan. Summer stages get hot, see.
@ zzzz_keepsakes/10_mb_mp [mp.ks_type_case]
= {軽|かる}くて も 、 {小|ちい}さくて も 、 {名前|なまえ} は {名前|なまえ} よ 。 {番付|ばんづけ} の {隅|すみ} の {小|ちい}さな {字|じ} でも ね 。 || Light or small, a name is a name. Even in small letters in the corner of a playbill.
> {軽|かる}くて も 、 {小|ちい}さくて も 、 {名前|なまえ} は {名前|なまえ} や 。 {番付|ばんづけ} の {隅|すみ} の {小|ちい}さな {字|じ} でも な 。 || Light or small, a name's a name. Even in little letters in the corner of a playbill.
`, 'zzzz_keepsakes/10_mb_mp.js');
})(RB.content);
