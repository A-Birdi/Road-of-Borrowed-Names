/* The pastimes after the story (expansion P15g; sealed S9): shogi's two places, in a twelve-chapter journey.
 *  - Snowbell's abandoned game (the inn's side table, ch4/30_scenes_hamlet.js sb.inn_table): a guest left it in the
 *    middle one winter morning, saying it was mate in one; nobody at the inn could bring themselves to clear it away.
 *    The gold that rolled off the board is the piece in your hand: a mate-in-one puzzle at its place (`place`), which
 *    joins the ladder's puzzles once it has been solved there (src/ui/88_shogi.js, hook pt_tsume).
 *  - The hill bench above Saltglass harbour: Isamu, home from the Last Lamp Hut, plays Fuku there every morning (he
 *    has not won yet), and either of them will play you. The pawn left on the bench is back on the board.
 * The six-chapter game is unchanged: the inn's table and the bench say what they said before, then nothing more. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  const POST = 'ed>=2&postgame';
  // the abandoned game: their camp with both golds gone and your pawn pushed through to it; the gold off the board is
  // yours to drop (mate in one: checked by the engine, tests/unit/shogi.test.mjs)
  C.shogi.tsume.push({ id: 'sb_inn', size: 'full', place: 'sb.inn',
    board: ['lns.k.snl', '.......b.', 'ppppPpppp', '.........', 'r........', '.........', 'PPPP.PPPP', '.B.....R.', 'LNSGKGSNL'], hand: { G: 1 },
    say: T('The game left at the Snowbell inn. The gold that rolled off the board is in your hand: mate in one.', '{雪鈴|ゆきすず} の {宿|やど} に {残|のこ}された {一局|いっきょく} 。 {盤|ばん} から {転|ころ}がった {金|きん} が {持|も}ち{駒|ごま} 。 {一手詰|いってづ}め 。') });

  // the inn's table and the bench: wrapped, never edited
  for (const p of C.maps['sb.inn'].props) if (p.scene === 'sb.inn_table') p.scene = 'pt.sb_inn_table';
  for (const p of C.maps['sg.harbor'].props) if (p.scene === 'sg.bench_fuku') p.scene = 'pt.bench';
  const BOTH = POST + '&sa_isamu_done&quest.sg_seaglass=done';
  C.maps['sg.harbor'].npcs.push({ id: 'sa_isamu_b', char: 'sa_isamu', x: 42, y: 8, dir: 'left', if: BOTH, talk: 'pt.bench_two' });

  RB.script.add(`
@scene pt.sb_inn_table
!call sb.inn_table
!if !ed>=2|!postgame -> end
!if pt_tsume_sb_inn -> done
narr: {盤|ばん} の {上|うえ} は 、 {前|まえ} に {見|み}た とき の まま だ 。 {転|ころ}がって いる {駒|こま} は 、 {金|きん} 。 || The board is just as it was when you saw it before. The piece that rolled off is a gold.
yae: その {一局|いっきょく} ？ {冬|ふゆ} に {泊|と}まった お{客|きゃく}さん が 、 {雪|ゆき} の {止|や}んだ {朝|あさ} に {急|いそ}いで {出|で}て {行|い}った の 。 「 {次|つぎ} の {一手|いって} で {詰|つ}む 」 って {言|い}い{残|のこ}して ね 。 || That game? A guest who stayed the winter left in a hurry the morning the snow stopped. "It's mate on the next move," they said on the way out.
yae: {誰|だれ} も {片付|かたづ}けられない の よ 。 {続|つづ}き が {気|き}に なって 。 || Nobody can bring themselves to clear it away. We all want to know how it ends.
!choice
* {続|つづ}き を {指|さ}す || Finish the game -> play
* そっと して おく || Leave it be -> leave
:play
!hook pt_tsume sb_inn
!end
:leave
narr: {盤|ばん} は 、 また {誰|だれ} か を {待|ま}って いる 。 || The board goes on waiting for someone.
!end
:done
narr: {玉|ぎょく} の {前|まえ} に 、 {打|う}った {金|きん} が {立|た}って いる 。 {一局|いっきょく} は 、 {終|お}わった 。 || The gold you dropped stands in front of the king. The game is over.
yae: {本当|ほんとう} に {一手|いって} で {詰|つ}んだ ん だ ね 。 あの お{客|きゃく}さん 、 {嘘|うそ} は {言|い}って なかった 。 …… {片付|かたづ}ける の 、 もう {少|すこ}し {後|あと} に しよう かな 。 || So it really was mate in one. That guest wasn't lying. …I think I'll leave clearing it away a little longer.
:end

@scene pt.bench
!if ed>=2&postgame&sa_isamu_done&quest.sg_seaglass=done -> two
!call sg.bench_fuku
!end
:two
!call pt.bench_two

@scene pt.bench_two
narr: ベンチ に {盤|ばん} を {広|ひろ}げて 、 イサム さん が {座|すわ}って いる 。 {家|いえ} の {方|ほう} から 、 フク さん も {降|お}りて くる 。 || Isamu sits at the bench with the board laid out. Fuku is coming down the path from her house.
!walkto fuku 39 8 right
sa_isamu: {帰|かえ}って から は 、 {毎朝|まいあさ} ここ で {一局|いっきょく} だ 。 {網|あみ} の {繕|つくろ}い は 、 {昼|ひる} から で いい 。 || Since I came home it's been a game here every morning. The nets can wait till the afternoon.
fuku[smile]: {五年|ごねん} {分|ぶん} 、 {負|ま}け が たまって いる の よ 。 この {人|ひと} 。 || He has five years of losing to make up, this one.
sa_isamu: …… まだ {一勝|いっしょう} も して いない 。 || …I haven't won one yet.
fuku: ベンチ に {忘|わす}れて いた {歩|ふ} も 、 やっと {盤|ばん} に {戻|もど}った わ 。 || And the pawn that was left on the bench is back on the board at last.
sa_isamu: お{前|まえ} さん も {指|さ}す か ？ {俺|おれ} と でも 、 フク さん と でも 。 || You playing too? With me, or with Fuku.
!choice
* イサム さん と {指|さ}す || Play Isamu -> isamu
* フク さん と {指|さ}す || Play Fuku -> fuku
* {今|いま} は {見|み}て いる || Just watch for now -> watch
:isamu
sa_isamu: よし 。 {手加減|てかげん} は …… {少|すこ}し だけ な 。 || Right. I'll go easy on you… a little.
!hook pt_play shogi sa_isamu
!end
:fuku
fuku: じゃあ 、 イサム さん は {見学|けんがく} ね 。 || Then Isamu can watch and learn.
!hook pt_play shogi fuku
!end
:watch
narr: {駒|こま} の {音|おと} が 、 {港|みなと} の {波|なみ} の {音|おと} に {混|ま}じる 。 {今朝|けさ} も 、 フク さん が {勝|か}った 。 || The click of the pieces mixes with the sound of the harbour's waves. This morning, too, Fuku wins.
`, 'pastimes/60_postgame.js');
})(RB.content);
