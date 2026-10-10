/* Shogi (将棋) and its teaching ladder (expansion P06; docs/future/plan/08_CULTURE.md C12): one rules engine for every
 * board the ladder uses, real rules throughout (spec line 32: authenticity).
 *
 *   variants  small  3×4, 玉 金 銀 歩 a side: capturing, drops and one promotion (a teaching board in the spirit of
 *                    the children's variants played in Japan; built with the game's own pieces and names)
 *             mini   5×5 五五将棋 (Gogo shogi): 玉 金 銀 角 飛 歩, the whole game on a small board
 *             full   9×9 本将棋, with the handicaps a teacher gives (駒落ち: 香落ち 角落ち 飛車落ち 二枚落ち; the
 *                    handicap giver, 上手, moves first)
 *   rules     moves of all eight pieces and their promotions; drops (持ち駒) with their limits: no piece where it
 *             could never move again, no second unpromoted pawn on a file (二歩), no pawn drop that mates at once
 *             (打ち歩詰め); promotion optional in the zone and forced where a piece could never move again; a move
 *             may not leave its own king in check; checkmate ends the game (詰み), and so does having no legal
 *             move; the same position four times is a draw (千日手).
 *   engine    negamax with alpha-beta, iterative deepening and a node budget (no Workers: CSP), material and a
 *             little position; levels by depth. Deterministic: ties are broken by a hash of the position, never
 *             a random stream.
 * Positions are plain JSON: { v: variant, b: [[piece|null]] (row 0 is the top, gote's side), h: [{ P: n …},
 * { … }] (hands: sente, gote), turn: 0 (sente, the player, bottom) | 1, hist: [position keys] }. A piece:
 * { t: 'K'|'R'|'B'|'G'|'S'|'N'|'L'|'P', s: 0|1, p: promoted }. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.shogi = (function () {
  'use strict';
  const NAMES = {
    K: { jp: '{玉|ぎょく}', en: 'King', short: '玉', reading: 'ぎょく' },
    R: { jp: '{飛車|ひしゃ}', en: 'Rook', short: '飛', reading: 'ひ' },
    B: { jp: '{角|かく}', en: 'Bishop', short: '角', reading: 'かく' },
    G: { jp: '{金|きん}', en: 'Gold general', short: '金', reading: 'きん' },
    S: { jp: '{銀|ぎん}', en: 'Silver general', short: '銀', reading: 'ぎん' },
    N: { jp: '{桂馬|けいま}', en: 'Knight', short: '桂', reading: 'けい' },
    L: { jp: '{香車|きょうしゃ}', en: 'Lance', short: '香', reading: 'きょう' },
    P: { jp: '{歩|ふ}', en: 'Pawn', short: '歩', reading: 'ふ' },
  };
  const PROMOTED = {
    R: { jp: '{龍|りゅう}', en: 'Dragon (promoted rook)', short: '龍', reading: 'りゅう' },
    B: { jp: '{馬|うま}', en: 'Horse (promoted bishop)', short: '馬', reading: 'うま' },
    S: { jp: '{成銀|なりぎん}', en: 'Promoted silver', short: '全', reading: 'なりぎん' },
    N: { jp: '{成桂|なりけい}', en: 'Promoted knight', short: '圭', reading: 'なりけい' },
    L: { jp: '{成香|なりきょう}', en: 'Promoted lance', short: '杏', reading: 'なりきょう' },
    P: { jp: 'と', en: 'Tokin (promoted pawn)', short: 'と', reading: 'と' },
  };
  const CAN_PROMOTE = { R: 1, B: 1, S: 1, N: 1, L: 1, P: 1 };
  const VALUE = { P: 100, L: 300, N: 350, S: 450, G: 500, B: 750, R: 900, K: 0 };
  const PVALUE = { P: 520, L: 500, N: 500, S: 500, B: 1050, R: 1250 };
  const HAND_BONUS = 1.1;

  // ---- variants ----------------------------------------------------------------------------------------------------
  const VARIANTS = {
    small: { rows: 4, cols: 3, zone: 1, setup: ['GKS', '.P.'], drops: true, label: { en: 'The small board', jp: '{小|ちい}さな {盤|ばん}' } },
    mini: { rows: 5, cols: 5, zone: 1, setup: ['KGSBR', 'P....'], drops: true, label: { en: 'Mini-shogi (5×5)', jp: '{五五将棋|ごごしょうぎ}' } },
    full: { rows: 9, cols: 9, zone: 3, setup: ['LNSGKGSNL', '.B.....R.', 'PPPPPPPPP'], drops: true, label: { en: 'Shogi', jp: '{将棋|しょうぎ}' } },
  };
  // handicaps: what the giver (gote, the stronger player) removes from their own side, by their own file
  const HANDICAPS = {
    none: { remove: [], label: { en: 'Even', jp: '{平手|ひらて}' } },
    lance: { remove: [[0, 0]], label: { en: 'Lance handicap', jp: '{香落|きょうお}ち' } },
    bishop: { remove: [[1, 1]], label: { en: 'Bishop handicap', jp: '{角落|かくお}ち' } },
    rook: { remove: [[1, 7]], label: { en: 'Rook handicap', jp: '{飛車落|ひしゃお}ち' } },
    two: { remove: [[1, 1], [1, 7]], label: { en: 'Two-piece handicap', jp: '{二枚落|にまいお}ち' } },
  };
  function newGame(variant, handicap) {
    const V = VARIANTS[variant];
    if (!V) throw new Error('shogi: no variant ' + variant);
    const b = [];
    for (let r = 0; r < V.rows; r++) b.push(new Array(V.cols).fill(null));
    // sente (0) at the bottom reads its setup from its own back rank upward; gote (1) is the same turned round
    V.setup.forEach((row, i) => {
      for (let c = 0; c < V.cols; c++) {
        const ch = row[c];
        if (ch === '.') continue;
        b[V.rows - 1 - i][c] = { t: ch, s: 0, p: false };
        b[i][V.cols - 1 - c] = { t: ch, s: 1, p: false };
      }
    });
    const hc = HANDICAPS[handicap || 'none'] || HANDICAPS.none;
    // gote's pieces as gote sees them: (rank from its back row, file from its own left) → board (rank, cols-1-file)
    for (const [rank, file] of hc.remove) b[rank][V.cols - 1 - file] = null;
    const g = { v: variant, b, h: [{}, {}], turn: hc.remove.length ? 1 : 0, hist: [], hc: handicap || 'none', moves: 0 };
    g.hist.push(key(g));
    return g;
  }
  const clone = (g) => JSON.parse(JSON.stringify(g));

  // ---- moves -------------------------------------------------------------------------------------------------------
  // directions as [dr, dc] for sente (forward is -1 row); gote's are turned round
  const GOLD = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]];
  const STEP = {
    K: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
    G: GOLD, S: [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 1]], N: [], L: [], P: [[-1, 0]], R: [], B: [],
  };
  const SLIDE = { R: [[-1, 0], [1, 0], [0, -1], [0, 1]], B: [[-1, -1], [-1, 1], [1, -1], [1, 1]], L: [[-1, 0]] };
  function rays(pc) {
    if (pc.p) {
      if (pc.t === 'R') return { step: [[-1, -1], [-1, 1], [1, -1], [1, 1]], slide: SLIDE.R, jump: [] };
      if (pc.t === 'B') return { step: [[-1, 0], [1, 0], [0, -1], [0, 1]], slide: SLIDE.B, jump: [] };
      return { step: GOLD, slide: [], jump: [] };
    }
    return { step: STEP[pc.t] || [], slide: SLIDE[pc.t] || [], jump: pc.t === 'N' ? [[-2, -1], [-2, 1]] : [] };
  }
  const V_ = (g) => VARIANTS[g.v];
  const inside = (g, r, c) => r >= 0 && c >= 0 && r < V_(g).rows && c < V_(g).cols;
  // squares a piece at (r, c) attacks
  function attacks(g, r, c) {
    const pc = g.b[r][c], out = [];
    const f = pc.s === 0 ? 1 : -1;
    const R_ = rays(pc);
    for (const [dr, dc] of R_.step.concat(R_.jump)) { const rr = r + dr * f, cc = c + dc * f; if (inside(g, rr, cc)) out.push([rr, cc]); }
    for (const [dr, dc] of R_.slide) {
      let rr = r + dr * f, cc = c + dc * f;
      while (inside(g, rr, cc)) { out.push([rr, cc]); if (g.b[rr][cc]) break; rr += dr * f; cc += dc * f; }
    }
    return out;
  }
  // a rank counted from a side's own far edge (0 = the last rank it can reach)
  const fromFar = (g, s, r) => (s === 0 ? r : V_(g).rows - 1 - r);
  const inZone = (g, s, r) => fromFar(g, s, r) < V_(g).zone;
  // could a piece of this kind ever move again from this rank?
  function stuck(g, t, s, r) {
    const far = fromFar(g, s, r);
    if ((t === 'P' || t === 'L') && far === 0) return true;
    if (t === 'N' && far <= 1) return true;
    return false;
  }
  function kingAt(g, s) {
    for (let r = 0; r < g.b.length; r++) for (let c = 0; c < g.b[r].length; c++) { const p = g.b[r][c]; if (p && p.t === 'K' && p.s === s) return [r, c]; }
    return null;
  }
  // Is (r, c) attacked by side `by`? Looked for outward from the square: along each of the eight lines the first
  // piece met, and the two knight squares (the same answer as trying every piece, much faster).
  const ALL8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  function hits(pc, dr, dc, dist) {
    // does pc, standing dist squares away along (dr, dc) from the target, reach it? (its own vector is -(dr, dc))
    const f = pc.s === 0 ? 1 : -1;
    const vr = -dr * f, vc = -dc * f; // the attacker's step toward the target, in its own orientation
    const R_ = rays(pc);
    if (dist === 1 && R_.step.some(([a, b]) => a === vr && b === vc)) return true;
    return R_.slide.some(([a, b]) => a === vr && b === vc);
  }
  function attacked(g, r, c, by) {
    for (const [dr, dc] of ALL8) {
      let rr = r + dr, cc = c + dc, d = 1;
      while (inside(g, rr, cc)) {
        const p = g.b[rr][cc];
        if (p) { if (p.s === by && hits(p, dr, dc, d)) return true; break; }
        rr += dr; cc += dc; d++;
      }
    }
    // a knight of `by` stands two ranks behind the target (from its own side) and one file over
    const f = by === 0 ? 1 : -1;
    for (const dc of [-1, 1]) {
      const rr = r + 2 * f, cc = c + dc;
      if (!inside(g, rr, cc)) continue;
      const p = g.b[rr][cc];
      if (p && p.s === by && p.t === 'N' && !p.p) return true;
    }
    return false;
  }
  function inCheck(g, s) { const k = kingAt(g, s); return !!k && attacked(g, k[0], k[1], 1 - s); }
  // pseudo-legal moves: { from: [r, c] | null, to: [r, c], drop: t | null, promote: bool }
  function pseudo(g, s) {
    const out = [];
    const V = V_(g);
    for (let r = 0; r < V.rows; r++) for (let c = 0; c < V.cols; c++) {
      const pc = g.b[r][c];
      if (!pc || pc.s !== s) continue;
      for (const [tr, tc] of attacks(g, r, c)) {
        const tgt = g.b[tr][tc];
        if (tgt && tgt.s === s) continue;
        const canP = !pc.p && CAN_PROMOTE[pc.t] && (inZone(g, s, r) || inZone(g, s, tr));
        if (!stuck(g, pc.t, s, tr) || pc.p) out.push({ from: [r, c], to: [tr, tc], drop: null, promote: false });
        if (canP) out.push({ from: [r, c], to: [tr, tc], drop: null, promote: true });
      }
    }
    if (V.drops) {
      for (const t in g.h[s]) {
        if (!g.h[s][t]) continue;
        for (let r = 0; r < V.rows; r++) for (let c = 0; c < V.cols; c++) {
          if (g.b[r][c] || stuck(g, t, s, r)) continue;
          if (t === 'P') { let two = false; for (let rr = 0; rr < V.rows; rr++) { const q = g.b[rr][c]; if (q && q.s === s && q.t === 'P' && !q.p) { two = true; break; } } if (two) continue; }
          out.push({ from: null, to: [r, c], drop: t, promote: false });
        }
      }
    }
    return out;
  }
  // play a move on a copy (or in place with `inPlace`)
  function play(g, m, inPlace) {
    const n = inPlace ? g : clone(g);
    const s = n.turn;
    if (m.drop) {
      n.h[s][m.drop]--;
      if (!n.h[s][m.drop]) delete n.h[s][m.drop];
      n.b[m.to[0]][m.to[1]] = { t: m.drop, s, p: false };
    } else {
      const pc = n.b[m.from[0]][m.from[1]];
      const cap = n.b[m.to[0]][m.to[1]];
      if (cap) { n.h[s][cap.t] = (n.h[s][cap.t] || 0) + 1; }
      n.b[m.from[0]][m.from[1]] = null;
      n.b[m.to[0]][m.to[1]] = { t: pc.t, s, p: pc.p || !!m.promote };
    }
    n.turn = 1 - s;
    n.moves = (n.moves || 0) + 1;
    n.hist = (n.hist || []).concat([key(n)]);
    n.last = m;
    return n;
  }
  function key(g) {
    let k = g.turn + '|';
    for (const row of g.b) for (const p of row) k += p ? (p.s ? p.t.toLowerCase() : p.t) + (p.p ? '+' : '') : '.';
    for (const s of [0, 1]) k += '|' + Object.keys(g.h[s]).sort().map((t) => t + g.h[s][t]).join('');
    return k;
  }
  // legal moves: own king never left in check; a pawn drop may not mate at once
  function legal(g, s) {
    s = s == null ? g.turn : s;
    const out = [];
    for (const m of pseudo(g, s)) {
      const n = play(Object.assign({}, g, { turn: s, hist: [] }), m);
      if (inCheck(n, s)) continue;
      if (m.drop === 'P') {
        const k = kingAt(n, 1 - s);
        if (k && inCheck(n, 1 - s) && noMoves(n, 1 - s)) continue; // 打ち歩詰め
      }
      out.push(m);
    }
    return out;
  }
  function noMoves(g, s) {
    for (const m of pseudo(g, s)) { const n = play(Object.assign({}, g, { turn: s, hist: [] }), m); if (!inCheck(n, s)) return false; }
    return true;
  }
  // { over, winner, why: 'mate' | 'nomoves' | 'repetition' | 'resign' }
  function status(g) {
    const s = g.turn;
    if (!legal(g, s).length) return { over: true, winner: 1 - s, why: inCheck(g, s) ? 'mate' : 'nomoves' };
    const k = key(g);
    if ((g.hist || []).filter((x) => x === k).length >= 4) return { over: true, winner: null, why: 'repetition' };
    return { over: false };
  }
  const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  const eqMove = (a, b) => !!a && !!b && (a.drop || null) === (b.drop || null) && same(a.to, b.to) && (a.from ? same(a.from, b.from) : !b.from) && !!a.promote === !!b.promote;

  // ---- the engine ----------------------------------------------------------------------------------------------
  function evaluate(g, s) {
    let v = 0;
    const V = V_(g);
    for (let r = 0; r < V.rows; r++) for (let c = 0; c < V.cols; c++) {
      const p = g.b[r][c];
      if (!p) continue;
      let x = p.p ? PVALUE[p.t] : VALUE[p.t];
      // a little for pieces that have come forward (not the king)
      if (p.t !== 'K') x += (V.rows - 1 - fromFar(g, p.s, r)) * 4;
      v += p.s === s ? x : -x;
    }
    for (const side of [0, 1]) for (const t in g.h[side]) { const x = VALUE[t] * HAND_BONUS * g.h[side][t]; v += side === s ? x : -x; }
    return v;
  }
  function order(g, ms) {
    return ms.map((m) => {
      const cap = !m.drop && g.b[m.to[0]][m.to[1]];
      return { m, k: (cap ? 10 * VALUE[cap.t] + 1000 : 0) + (m.promote ? 600 : 0) };
    }).sort((a, b) => b.k - a.k).map((x) => x.m);
  }
  const MATE = 100000;
  function search(g, depth, alpha, beta, ctx) {
    ctx.nodes++;
    const s = g.turn;
    if (depth <= 0 || ctx.nodes > ctx.budget) return evaluate(g, s);
    const ms = legal(g, s);
    if (!ms.length) return -MATE + ctx.ply;
    let best = -Infinity;
    for (const m of order(g, ms)) {
      const n = play(Object.assign({}, g, { hist: [] }), m);
      ctx.ply++;
      const v = -search(n, depth - 1, -beta, -alpha, ctx);
      ctx.ply--;
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  }
  const LEVELS = { 1: { depth: 1, budget: 4000, slack: 120 }, 2: { depth: 2, budget: 20000, slack: 40 }, 3: { depth: 3, budget: 25000, slack: 0 } };
  // the engine's choice: the best by search, a weaker level choosing among moves within its slack of the best
  function choose(g, level) {
    const L = LEVELS[level] || LEVELS[1];
    const ms = legal(g, g.turn);
    if (!ms.length) return null;
    const scored = [];
    const ctx = { nodes: 0, budget: L.budget, ply: 1 };
    for (const m of order(g, ms)) {
      const n = play(Object.assign({}, g, { hist: [] }), m);
      const v = -search(n, L.depth - 1, -Infinity, Infinity, ctx);
      scored.push({ m, v });
    }
    scored.sort((a, b) => b.v - a.v);
    const top = scored.filter((x) => x.v >= scored[0].v - L.slack);
    // deterministic among equals: a hash of the position
    let h = 0; const k = key(g);
    for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
    return top[h % top.length].m;
  }
  // mate in n for the side to move (tsume): the first move of a forced mate, or null
  function mateIn(g, n) {
    const s = g.turn;
    for (const m of legal(g, s)) {
      const a = play(Object.assign({}, g, { hist: [] }), m);
      if (forcedMate(a, n - 1, s)) return m;
    }
    return null;
  }
  // after the attacker's move: every defence still loses within n more attacker moves (and every attacker move checks)
  function forcedMate(g, n, att) {
    if (!inCheck(g, g.turn)) return false;
    const defs = legal(g, g.turn);
    if (!defs.length) return true;
    if (n <= 0) return false;
    for (const d of defs) {
      const b = play(Object.assign({}, g, { hist: [] }), d);
      let ok = false;
      for (const m of legal(b, att)) {
        const c = play(Object.assign({}, b, { hist: [] }), m);
        if (forcedMate(c, n - 1, att)) { ok = true; break; }
      }
      if (!ok) return false;
    }
    return true;
  }
  // the number of positions after n plies (perft), for the tests
  function perft(g, n) {
    if (n === 0) return 1;
    let t = 0;
    for (const m of legal(g, g.turn)) t += n === 1 ? 1 : perft(play(Object.assign({}, g, { hist: [] }), m), n - 1);
    return t;
  }

  // ---- words for a move ------------------------------------------------------------------------------------------
  const nameOf = (t, p) => (p && PROMOTED[t]) || NAMES[t];
  // in the player's terms: which piece, from where to where, what it took, and why it matters (王手, 成る, 打つ)
  function describe(g, m) {
    const pc = m.drop ? { t: m.drop, p: false } : g.b[m.from[0]][m.from[1]];
    const cap = !m.drop && g.b[m.to[0]][m.to[1]];
    const n = play(Object.assign({}, g, { hist: [] }), m);
    const parts = [];
    const nm = nameOf(pc.t, pc.p);
    if (m.drop) parts.push({ en: 'drops a ' + nm.en.toLowerCase() + ' from hand', jp: nm.jp + ' を {打|う}つ' });
    else parts.push({ en: 'moves the ' + nm.en.toLowerCase(), jp: nm.jp + ' を {動|うご}かす' });
    if (cap) parts.push({ en: 'taking your ' + nameOf(cap.t, cap.p).en.toLowerCase() + ' (it goes to their hand)', jp: nameOf(cap.t, cap.p).jp + ' を {取|と}る' });
    if (m.promote) parts.push({ en: 'and promotes it', jp: '{成|な}る' });
    if (inCheck(n, n.turn)) parts.push({ en: 'check: the king must get out of it', jp: '{王手|おうて}' });
    return { en: parts.map((p) => p.en).join(', ') + '.', jp: parts.map((p) => p.jp).join(' 、 ') + ' 。', check: inCheck(n, n.turn), capture: cap ? cap.t : null };
  }
  // squares as the game shows them (files right to left, 1 at the right; ranks top to bottom, 一 at the top)
  const KANJI = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function square(g, r, c) { return (V_(g).cols - c) + KANJI[r]; }

  return {
    NAMES, PROMOTED, VARIANTS, HANDICAPS, VALUE, LEVELS,
    newGame, clone, play, legal, pseudo, status, inCheck, attacks, kingAt, key, evaluate, choose, mateIn, perft,
    describe, square, eqMove, nameOf, stuck, inZone, rays,
  };
})();

// ---- はさみ将棋 (hasami shogi): pawns only, the board before the rules ---------------------------------------------
// Explicit ruleset: a 9×9 board, nine pieces a side on its back rank (歩 for you, と for your partner, as children
// play it); a piece moves any distance along its rank or file without jumping; pieces of the other side caught in a
// line between the piece that just moved and another of yours are taken (any number in a row); a piece in a corner
// is taken when both squares beside it are yours; moving between two of theirs is safe. The first to take five
// wins (五枚取り); with no move, you lose; after 200 moves, a draw.
RB.hasami = (function () {
  'use strict';
  const N = 9, WIN = 5, LIMIT = 200;
  function newGame() {
    const b = [];
    for (let r = 0; r < N; r++) b.push(new Array(N).fill(null));
    for (let c = 0; c < N; c++) { b[N - 1][c] = 0; b[0][c] = 1; }
    return { b, turn: 0, taken: [0, 0], moves: 0, last: null };
  }
  const inside = (r, c) => r >= 0 && c >= 0 && r < N && c < N;
  function legal(g) {
    const out = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (g.b[r][c] !== g.turn) continue;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        let rr = r + dr, cc = c + dc;
        while (inside(rr, cc) && g.b[rr][cc] === null) { out.push({ from: [r, c], to: [rr, cc] }); rr += dr; cc += dc; }
      }
    }
    return out;
  }
  function play(g, m) {
    const n = JSON.parse(JSON.stringify(g));
    const s = n.turn, o = 1 - s;
    n.b[m.from[0]][m.from[1]] = null;
    n.b[m.to[0]][m.to[1]] = s;
    const caught = [];
    const [r, c] = m.to;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const run = [];
      let rr = r + dr, cc = c + dc;
      while (inside(rr, cc) && n.b[rr][cc] === o) { run.push([rr, cc]); rr += dr; cc += dc; }
      if (run.length && inside(rr, cc) && n.b[rr][cc] === s) caught.push(...run);
    }
    // corners: a piece of theirs in a corner with both neighbours ours
    for (const [cr, cc2] of [[0, 0], [0, N - 1], [N - 1, 0], [N - 1, N - 1]]) {
      if (n.b[cr][cc2] !== o) continue;
      const nb = [[cr, cc2 === 0 ? 1 : N - 2], [cr === 0 ? 1 : N - 2, cc2]];
      if (nb.every(([a, b]) => n.b[a][b] === s) && nb.some(([a, b]) => a === r && b === c)) caught.push([cr, cc2]);
    }
    for (const [a, b] of caught) n.b[a][b] = null;
    n.taken[s] += caught.length;
    n.turn = o;
    n.moves++;
    n.last = Object.assign({}, m, { caught });
    return n;
  }
  function status(g) {
    for (const s of [0, 1]) if (g.taken[s] >= WIN) return { over: true, winner: s, why: 'five' };
    if (!legal(g).length) return { over: true, winner: 1 - g.turn, why: 'nomoves' };
    if (g.moves >= LIMIT) return { over: true, winner: null, why: 'limit' };
    return { over: false };
  }
  // a simple partner: the move that takes most, then one that leaves nothing to be taken next, deterministic
  function choose(g, level) {
    const ms = legal(g);
    if (!ms.length) return null;
    let best = null, bestV = -Infinity;
    ms.forEach((m, i) => {
      const n = play(g, m);
      let v = (n.taken[g.turn] - g.taken[g.turn]) * 100;
      if (level >= 2) { let worst = 0; for (const r of legal(n)) { const k = play(n, r); worst = Math.max(worst, k.taken[n.turn] - n.taken[n.turn]); } v -= worst * 90; }
      v += ((i * 2654435761) >>> 0) % 7; // a fixed, varied preference among equals
      if (v > bestV) { bestV = v; best = m; }
    });
    return best;
  }
  return { N, WIN, LIMIT, newGame, legal, play, status, choose };
})();
