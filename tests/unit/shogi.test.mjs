// Shogi and its ladder (expansion P06, C12; src/engine/72b_shogi.js, src/content/pastimes/00_shogi.js): the rules
// are real (perft from the start position matches the published counts for shogi and mini-shogi); drops and their
// limits (二歩, 打ち歩詰め, nowhere a piece could never move again); promotion optional in the zone and forced where
// needed; no move leaves your own king in check; mate and repetition end a game; handicaps remove the right pieces
// and the giver moves first; the engine plays legal moves deterministically; every lesson's goal is a legal move
// with its piece; every mate-in-one puzzle is one; hasami shogi takes by sandwiching, in corners, and in rows.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const S = RB.shogi, H = RB.hasami, C = RB.content;
  const pos = (variant, rows, hand, turn) => {
    const g = S.newGame(variant);
    g.b = rows.map((r) => [...r].map((ch) => (ch === '.' ? null : { t: ch.toUpperCase(), s: ch === ch.toUpperCase() ? 0 : 1, p: false })));
    g.h = [Object.assign({}, hand || {}), {}]; g.turn = turn || 0; g.hist = [];
    return g;
  };
  const has = (ms, pred) => ms.some(pred);

  // ---- perft: the published counts -----------------------------------------------------------------------------
  t.eq([1, 2, 3].map((n) => S.perft(S.newGame('full'), n)), [30, 900, 25470], 'shogi from the start: 30, 900, 25,470 positions');
  t.eq([1, 2, 3, 4].map((n) => S.perft(S.newGame('mini'), n)), [14, 181, 2512, 35401], 'mini-shogi: 14, 181, 2,512, 35,401');
  t.ok(S.perft(S.newGame('small'), 3) > 0, 'the small board plays');

  // ---- drops --------------------------------------------------------------------------------------------------------
  {
    const g = pos('mini', ['....k', '.....', '..P..', '.....', 'K....'], { P: 1 });
    t.ok(!has(S.legal(g), (m) => m.drop === 'P' && m.to[1] === 2), '二歩: no second pawn on a file that has one');
    t.ok(!has(S.legal(g), (m) => m.drop === 'P' && m.to[0] === 0), 'no pawn dropped where it could never move');
    t.ok(has(S.legal(g), (m) => m.drop === 'P' && m.to[1] === 1 && m.to[0] === 2), 'elsewhere it may be dropped');
    // 打ち歩詰め: a pawn drop that would mate at once is illegal (the gold guards the pawn; the king has nowhere to go)
    const u = pos('mini', ['k....', '.....', '.G...', '.....', '....K'], { P: 1 });
    u.b[0][1] = { t: 'R', s: 1, p: false }; // the king's own rook beside it, so it cannot step aside
    const pawnMate = { drop: 'P', to: [1, 0] };
    const afterDrop = S.play(u, Object.assign({ from: null, promote: false }, pawnMate));
    const mates = S.inCheck(afterDrop, 1) && !S.legal(afterDrop, 1).length;
    t.ok(!mates || !has(S.legal(u), (m) => m.drop === 'P' && m.to[0] === 1 && m.to[1] === 0), '打ち歩詰め: a pawn drop that mates at once is refused' + (mates ? '' : ' (position check)'));
    const kn = pos('full', ['....k....', '.........', '.........', '.........', '.........', '.........', '.........', '.........', '....K....'], { N: 1, L: 1 });
    t.ok(!has(S.legal(kn), (m) => m.drop === 'N' && m.to[0] <= 1), 'no knight dropped on the last two ranks');
    t.ok(!has(S.legal(kn), (m) => m.drop === 'L' && m.to[0] === 0), 'no lance on the last');
  }
  // ---- promotion ---------------------------------------------------------------------------------------------------
  {
    const g = pos('full', ['....k....', '.........', '.........', 'P........', '.........', '.........', '.........', '.........', '....K....']);
    const ms = S.legal(g).filter((m) => m.from && m.from[0] === 3);
    t.ok(has(ms, (m) => m.promote) && has(ms, (m) => !m.promote), 'entering the zone: promotion is a choice');
    const g2 = pos('full', ['....k....', 'P........', '.........', '.........', '.........', '.........', '.........', '.........', '....K....']);
    const m2 = S.legal(g2).filter((m) => m.from && m.from[0] === 1);
    t.ok(m2.length && m2.every((m) => m.promote), 'a pawn onto the last rank must promote');
    const n = S.play(g2, m2[0]);
    t.eq([n.b[0][0].t, n.b[0][0].p], ['P', true], 'and becomes と');
    t.eq(S.nameOf('P', true).short, 'と', 'named と');
  }
  // ---- check, mate, repetition --------------------------------------------------------------------------------------
  {
    const g = pos('mini', ['....k', '.....', '.....', '.....', 'K...r'], {}, 0);
    g.b[4][4] = { t: 'R', s: 1, p: false };
    t.ok(S.inCheck(g, 0), 'a rook along the rank: check');
    t.ok(S.legal(g).every((m) => !S.inCheck(S.play(g, m), 0)), 'every legal move gets out of check');
    for (const tz of C.shogi.tsume) {
      const p = pos(tz.size, tz.board, tz.hand);
      const m = S.mateIn(p, 1);
      t.ok(!!m, tz.id + ': a mate in one');
      const after = S.play(p, m);
      t.eq(S.status(after), { over: true, winner: 0, why: 'mate' }, tz.id + ': and it is mate');
    }
    // the same position four times: a draw (千日手)
    let r = pos('mini', ['....k', '.....', '.....', '.....', 'K....']);
    r.hist = [S.key(r)];
    const shuffle = [[{ from: [4, 0], to: [3, 0] }], [{ from: [0, 4], to: [1, 4] }], [{ from: [3, 0], to: [4, 0] }], [{ from: [1, 4], to: [0, 4] }]];
    for (let k = 0; k < 3; k++) for (const [m] of shuffle) r = S.play(r, Object.assign({ drop: null, promote: false }, m));
    t.eq(S.status(r).why, 'repetition', 'the same position four times: a draw');
  }
  // ---- handicaps ----------------------------------------------------------------------------------------------------
  {
    const g = S.newGame('full', 'two');
    t.eq([g.b[1][1], g.b[1][7], g.turn], [null, null, 1], '二枚落ち: the giver\'s rook and bishop are off, and the giver moves first');
    const l = S.newGame('full', 'lance');
    t.ok(l.b[0][8] === null && l.b[0][0] && l.b[0][0].t === 'L', '香落ち: the giver\'s left lance (as they see it) is off');
    t.eq(S.perft(S.newGame('full', 'none'), 1), 30, 'even: as usual');
  }
  // ---- the engine -----------------------------------------------------------------------------------------------------
  for (const v of ['small', 'mini']) for (const L of [1, 2]) {
    let g = S.newGame(v), ok = true, moves = 0;
    for (let i = 0; i < 12; i++) { if (S.status(g).over) break; const m = S.choose(g, L); if (!S.legal(g).some((x) => S.eqMove(x, m))) { ok = false; break; } g = S.play(g, m); moves++; }
    t.ok(ok && moves > 0, v + ' level ' + L + ': the engine plays legal moves (' + moves + ')');
  }
  t.eq(JSON.stringify(S.choose(S.newGame('mini'), 2)), JSON.stringify(S.choose(S.newGame('mini'), 2)), 'and the same choice in the same position');
  {
    // it takes a free piece, and mates when it can
    const g = pos('mini', ['....k', '.....', '..p..', '..R..', 'K....']);
    const m = S.choose(g, 2);
    t.ok(m.to[0] === 2 && m.to[1] === 2, 'a free pawn is taken');
    const tz = C.shogi.tsume[0];
    const p = pos(tz.size, tz.board, tz.hand);
    t.eq(S.status(S.play(p, S.choose(p, 2))).why, 'mate', 'a mate in one is found');
  }
  // ---- the lessons ----------------------------------------------------------------------------------------------------
  for (const L of C.shogi.lessons) {
    const g = pos('mini', L.board);
    const goals = [L.goal].concat(L.alt || []);
    const ms = S.legal(g).filter((m) => m.from && g.b[m.from[0]][m.from[1]].t === L.piece);
    t.ok(goals.every((goal) => ms.some((m) => m.to[0] === goal.to[0] && m.to[1] === goal.to[1])), 'lesson ' + L.id + ': its goal is a legal move of its piece');
    t.ok(L.say.jp && L.say.en && RB.jp.validate(L.say.jp).length === 0, 'lesson ' + L.id + ': words with furigana');
  }
  // ---- words for a move ----------------------------------------------------------------------------------------------
  {
    const g = pos('mini', ['....k', '.....', '..p..', '..R..', 'K....']);
    const d = S.describe(g, { from: [3, 2], to: [2, 2], drop: null, promote: false });
    t.ok(/rook/.test(d.en) && /taking your pawn|pawn/.test(d.en) && RB.jp.validate(d.jp).length === 0, 'a move in words: ' + d.en + ' / ' + d.jp);
  }

  // ---- the Japanese: furigana on every kanji and every word in the dictionary (pieces, ladder, lessons, puzzles, the
  // screen's own words, and the partner's sentences about a move) ------------------------------------------------------
  {
    const fs = await import('node:fs');
    const errs = [], unknown = new Map();
    const jcheck = (line, where) => {
      if (!line) return;
      for (const p of RB.jp.validate(line)) errs.push(where + ': ' + (p.msg || JSON.stringify(p)));
      for (const tk of RB.jp.parse(line)) {
        if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
        let info; try { info = RB.jp.lookup(tk); } catch (e) { info = { unknown: true }; }
        if (info.unknown && !unknown.has(tk.surface)) unknown.set(tk.surface, where);
      }
    };
    const walk = (o, where, seen = new Set()) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, where + '[' + i + ']', seen)); return; }
      if (typeof o.jp === 'string') { jcheck(o.jp, where); if (typeof o.en !== 'string' || !o.en) errs.push(where + ': no English'); }
      for (const k in o) if (k !== 'jp' && o[k] && typeof o[k] === 'object') walk(o[k], where + '.' + k, seen);
    };
    walk(C.shogi, 'content'); walk(RB.pastimes.get('shogi'), 'pastime'); walk(S.NAMES, 'names'); walk(S.PROMOTED, 'promoted'); walk(S.VARIANTS, 'variants'); walk(S.HANDICAPS, 'handicaps');
    const ui = fs.readFileSync(new URL('../../src/ui/88_shogi.js', import.meta.url), 'utf8');
    for (const m of ui.matchAll(/(?:jhtml\(|jp: )'((?:[^'\\]|\\.)*[぀-ヿ一-鿿](?:[^'\\]|\\.)*)'/g)) jcheck(m[1], 'screen');
    // the partner's words for moves of every kind: quiet, a capture, a drop, a promotion, check
    const said = [];
    for (const v of ['small', 'mini', 'full']) {
      let g = S.newGame(v);
      for (let i = 0; i < 24 && !S.status(g).over; i++) { const ms = S.legal(g); const m = ms[(i * 7) % ms.length]; said.push(S.describe(g, m)); g = S.play(g, m); }
    }
    for (const tz of C.shogi.tsume) { const p = pos(tz.size, tz.board, tz.hand); for (const m of S.legal(p)) said.push(S.describe(p, m)); }
    said.forEach((d, i) => jcheck(d.jp, 'said ' + i));
    t.eq(errs, [], 'every line has furigana on its kanji and English beside it');
    t.eq([...unknown.entries()].map(([w, at]) => w + ' (' + at + ')'), [], 'every word is in the dictionary');
  }

  // ---- hasami shogi --------------------------------------------------------------------------------------------------
  {
    const g = H.newGame();
    t.eq([g.b[8].every((x) => x === 0), g.b[0].every((x) => x === 1), g.turn], [true, true, 0], 'nine a side on the back ranks; you begin');
    const e = (rows) => { const n = H.newGame(); n.b = rows.map((r) => [...r].map((ch) => (ch === 'x' ? 0 : ch === 'o' ? 1 : null))); n.taken = [0, 0]; return n; };
    // a sandwich along a rank, two in a row
    let n = e(['.........', '.........', '.........', '.........', 'xoo......', '.........', '.........', '.........', '...x.....']);
    n = H.play(n, { from: [8, 3], to: [4, 3] });
    t.eq([n.taken[0], n.b[4][1], n.b[4][2]], [2, null, null], 'two in a row, sandwiched: both taken');
    // moving between two of theirs is safe
    let m = e(['.........', '.........', '.........', '.........', 'o.o......', '.........', '.........', '.........', '.x.......']);
    m = H.play(m, { from: [8, 1], to: [4, 1] });
    t.eq([m.b[4][1], m.taken[1]], [0, 0], 'stepping between two of theirs is safe');
    // a corner
    let c = e(['o........', '.x.......', '.........', '.........', '.........', '.........', '.........', '.........', 'x........']);
    c.b[0][1] = null; c.b[1][0] = 0;
    c = H.play(c, { from: [1, 1], to: [0, 1] });
    t.eq([c.b[0][0], c.taken[0]], [null, 1], 'a corner piece with both neighbours yours: taken');
    let w = H.newGame(); w.taken = [5, 0];
    t.eq(H.status(w), { over: true, winner: 0, why: 'five' }, 'five taken: a win');
    const ms = H.legal(H.newGame());
    t.ok(ms.length === 9 * 7 && ms.every((x) => x.from[0] === 8), 'every piece can run up its file at the start, as far as the other side (' + ms.length + ' moves)');
    t.ok(!!H.choose(H.newGame(), 2), 'the partner moves');
  }
};
