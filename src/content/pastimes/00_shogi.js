/* Shogi's ladder (expansion P06, C12; the engine in src/engine/72b_shogi.js): eight short lessons that meet one piece
 * each, with a one-move puzzle that uses it; a few "mate in one" puzzles (詰将棋) at each size, every one checked by
 * the engine (tests/unit/shogi.test.mjs). Boards are written top row first; capitals are your pieces, small letters
 * your partner's; + marks a promoted piece. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.shogi = C.shogi || {};
  C.shogi.lessons = [
    { id: 'P', piece: 'P', board: ['..k..', '.....', '..p..', '..P..', '..K..'], goal: { to: [2, 2] }, say: T('The pawn steps straight forward, one square, and takes the same way. Take the pawn in front of it.', '{歩|ふ} は {前|まえ} に {一|ひと}つ {進|すす}む 。 {取|と}る の も {前|まえ} 。') },
    { id: 'L', piece: 'L', board: ['..k..', '..p..', '.....', '.....', '..L.K'], goal: { to: [1, 2] }, say: T('The lance runs straight forward as far as it likes, but never back. Take the pawn up its file.', '{香車|きょうしゃ} は {前|まえ} に どこ まで も {進|すす}める 。 {後|うし}ろ に は {戻|もど}れない 。') },
    { id: 'N', piece: 'N', board: ['k....', '.....', '..p..', '.....', '.N..K'], goal: { to: [2, 2] }, say: T('The knight jumps: two forward and one to the side, over anything in the way. Jump onto the pawn.', '{桂馬|けいま} は {二|ふた}つ {前|まえ} 、 {一|ひと}つ {横|よこ} に {跳|と}ぶ 。') },
    { id: 'S', piece: 'S', board: ['k....', '.....', '...p.', '..S..', '....K'], goal: { to: [2, 3] }, say: T('The silver steps one square forward or diagonally, five ways in all, but never straight to the side or straight back. Take the pawn diagonally ahead.', '{銀|ぎん} は {前|まえ} と {斜|なな}め に {一|ひと}つ {進|すす}む 。') },
    { id: 'G', piece: 'G', board: ['k....', '.....', '.....', '.pG..', '....K'], goal: { to: [3, 1] }, say: T('The gold steps one square any way but diagonally back. Take the pawn beside it.', '{金|きん} は {斜|なな}め {後|うし}ろ {以外|いがい} に {一|ひと}つ {動|うご}く 。') },
    { id: 'B', piece: 'B', board: ['k...p', '.....', '.....', '.....', 'B...K'], goal: { to: [0, 4] }, say: T('The bishop slides diagonally as far as the way is clear. Take the pawn in the far corner.', '{角|かく} は {斜|なな}め に どこ まで も {進|すす}む 。') },
    { id: 'R', piece: 'R', board: ['k....', '.....', '....p', '.....', 'R...K'], goal: { to: [2, 0] }, alt: [{ to: [4, 3] }], say: T('The rook slides straight along a rank or a file as far as the way is clear. Move it up its file.', '{飛車|ひしゃ} は {縦|たて} と {横|よこ} に どこ まで も {進|すす}む 。') },
    { id: 'K', piece: 'K', board: ['k....', '.....', '.....', '...p.', '..K..'], goal: { to: [3, 3] }, say: T('The king steps one square any way. Keep it safe: if it is caught, the game is lost. Take the pawn next to it.', '{玉|ぎょく} は どの {方向|ほうこう} に も {一|ひと}つ {進|すす}む 。') },
  ];
  // mate in one (詰将棋): the side to move is you; hand: your pieces in hand
  C.shogi.tsume = [
    { id: 't1', size: 'mini', board: ['..k..', '.....', '..G..', '.....', '....K'], hand: { G: 1 }, say: T('Mate in one: a gold from your hand.', '{一手詰|いってづ}め 。 {持|も}ち{駒|ごま} の {金|きん} で 。') },
    { id: 't2', size: 'mini', board: ['k....', '..R..', '.....', '.....', '....K'], hand: { G: 1 }, say: T('Mate in one: the king is in the corner.', '{一手詰|いってづ}め 。 {玉|ぎょく} は {隅|すみ} に いる 。') },
    { id: 't3', size: 'full', board: ['....k....', '.........', '....P....', '.........', '.........', '.........', '.........', '.........', '....K....'], hand: { G: 1 }, say: T('Mate in one, on the full board.', '{一手詰|いってづ}め 。 {本将棋|ほんしょうぎ} の {盤|ばん} で 。') },
    { id: 't4', size: 'mini', board: ['.k...', 'ppp..', '.....', '....R', '....K'], hand: {}, say: T('Mate in one: the rook. The king\'s own pawns hem it in.', '{一手詰|いってづ}め 。 {飛車|ひしゃ} で 。') },
    { id: 't5', size: 'full', board: ['...gks...', '...bpn...', '.........', '.........', '.........', '.........', '.........', '.........', '....K....'], hand: { N: 1 }, say: T('Mate in one: a knight from your hand. Only a knight can jump past the king\'s guards.', '{一手詰|いってづ}め 。 {持|も}ち{駒|ごま} の {桂馬|けいま} で 。') },
    { id: 't6', size: 'full', board: ['....k....', '.........', '....P....', '.........', '.........', '....L....', '.........', '.........', '....K....'], hand: {}, say: T('Mate in one: the pawn. A pawn that promotes moves like a gold.', '{一手詰|いってづ}め 。 {歩|ふ} が {成|な}れば 、 {金|きん} の よう に {動|うご}く 。') },
  ];

  // the pastime: Fuku teaches it on Saltglass's hill bench; a companion plays it on a travel board anywhere safe
  if (RB.pastimes) RB.pastimes.define('shogi', {
    title: T('Shogi', '{将棋|しょうぎ}'), kind: 'game', activity: 'shogi', companion: true, art: 'shogi',
    venue: T('Fuku\'s bench, on the hill above Saltglass harbour', '{潮硝子|しおがらす} の {丘|おか} の ベンチ'),
    met: (s) => RB.edition.of(s) >= 2 && !!((s.visited && s.visited['sg.harbor']) || (s.practice && s.practice.shogi && Object.keys(s.practice.shogi.games || {}).length)),
    blurb: T('Two armies of wedge-shaped pieces on a nine-by-nine board. A captured piece changes sides and can be dropped back into play: nothing is ever quite out of the game.', '{取|と}った {駒|こま} は {自分|じぶん} の {駒|こま} に なる 。'),
    howto: [
      T('Take turns moving one piece. Each kind of piece moves its own way; the lessons show each one.', '{一手|いって} ずつ {駒|こま} を {動|うご}かす 。'),
      T('Land on a piece of theirs to capture it. It goes into your hand, and on a later turn you may drop it on any empty square instead of moving.', '{取|と}った {駒|こま} は {持|も}ち{駒|ごま} 。 {空|あ}いて いる ところ に {打|う}てる 。'),
      T('Reach the far three ranks and most pieces may promote: they turn over and move differently.', '{奥|おく} の {三|さん} {段|だん} に {入|はい}る と {成|な}れる 。'),
      T('Attack the king so it has nowhere safe to go, and the game is yours: checkmate.', '{玉|ぎょく} が {詰|つ}めば {勝|か}ち 。'),
    ],
    records: (s) => {
      const r = RB.pastimes.rec(s, 'shogi');
      if (!r) return [];
      const out = [{ en: 'Pieces met', value: Object.keys(r.lessons).length + ' of ' + C.shogi.lessons.length }, { en: 'Puzzles solved', value: Object.keys(r.tsume).length + ' of ' + C.shogi.tsume.length }];
      const names = { hasami: 'Hasami shogi', small: 'The small board', mini: 'Mini-shogi', full: 'Shogi' };
      for (const k in names) if (r.games[k]) out.push({ en: names[k], value: (r.wins[k] || 0) + ' won of ' + r.games[k] });
      return out;
    },
  });
})(RB.content);
