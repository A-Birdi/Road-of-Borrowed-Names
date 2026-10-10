/* Shogi on screen (expansion P06, C12; the rules in src/engine/72b_shogi.js, the ladder's lessons and puzzles in
 * src/content/pastimes/00_shogi.js). An activity (RB.activity 'shogi'): played with your companion on their travel
 * board anywhere safe, from the Ledger's Distractions. The ladder, each rung playable on its own:
 *   1 Meet the pieces (eight lessons, any order)  2 Hasami shogi  3 The small board  4 Mini-shogi
 *   5 Shogi, with the handicaps a teacher gives   and puzzles: mate in one (詰将棋)
 * Always there, never counted against you: Show moves, Why? (the partner's last move in a sentence), Take back.
 * Every piece shows its kanji with its reading. No clock; losing costs nothing (G15). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.ui.shogi = (function () {
  'use strict';
  const esc = RB.util.esc;
  const I = (n) => (RB.ui.folio ? RB.ui.folio.icon(n) : '');
  const J = (x) => (x && x.jp ? RB.ui.jhtml(x.jp) : '');
  const SG = () => RB.shogi, HS = () => RB.hasami;
  const S = () => RB.game.s;
  // who sits across the board: whoever the launch names (Fuku at her bench), else your companion, else Fuku
  const partner = () => { const w = (V && V.with) || null; return w && RB.content.chars[w] ? RB.content.chars[w].name.en : w === 'fuku' || !w ? 'Fuku' : w; };
  const LEVEL = [[1, 'Gentle'], [2, 'Steady'], [3, 'Thoughtful']];
  let V = null;

  RB.activity.register('shogi', {
    title: { en: 'Shogi', jp: '{将棋|しょうぎ}' },
    // a companion game needs the companion with you; a place game (Fuku at her bench) needs only a quiet moment
    eligible: (s, ctx) => {
      if (!(ctx && ctx.with) && !s.comp) return { ok: false, why: 'There is nobody to play with here.' };
      return RB.activity.safe ? RB.activity.safe(ctx && ctx.with ? {} : { companion: true }) : { ok: true };
    },
    run: (session) => run(session),
    dispose: (session) => { if (V && V.session === session) close(); },
  });

  function run(session) {
    return new Promise((resolve) => {
      const s = S();
      const ctx = (session && session.ctx) || {};
      const who = ctx.with || s.comp || 'fuku';
      const fr = RB.ui.folio.frame({ cls: 'sg-folio', onClose: () => leave(), closeLabel: 'Leave', closeIcon: 'back' });
      fr.setTitle(RB.ui.label('{将棋|しょうぎ}', 'Shogi') + ' <span class="sg-with">' + esc('with ' + (RB.content.chars[who] ? RB.content.chars[who].name.en : 'Fuku')) + '</span>', '');
      fr.box.innerHTML = '<div class="leaf sg-leaf" tabindex="-1"></div>';
      V = { session, s, with: who, fr, leaf: fr.box.firstChild, view: 'ladder', resolve, level: 1, show: true, sel: null, ask: null, said: null, thinking: false };
      V.layer = { el: fr.scrim, name: 'shogi', noAutofocus: true, onCancel: () => leave() };
      V.leaf.addEventListener('click', onClick);
      V.leaf.addEventListener('change', (e) => { const lv = e.target.closest && e.target.closest('input[name="sg-level"]'); if (lv && V) V.level = +lv.value; });
      RB.ui.pushLayer(V.layer);
      render();
    });
  }
  function close() { if (!V) return; RB.ui.popLayer(V.layer); const r = V.resolve; V = null; r({ ok: true }); }
  function leave() { if (!V) return; if (V.view === 'ladder') close(); else { V.view = 'ladder'; V.g = null; V.said = null; render(); } }
  const rec = () => RB.pastimes.rec(S(), 'shogi');

  // ---- the ladder ---------------------------------------------------------------------------------------------
  const RUNGS = [
    { id: 'lessons', n: 1, title: { en: 'Meet the pieces', jp: '{駒|こま} を {知|し}る' }, d: 'One piece at a time: its name, how it moves, and a one-move puzzle.' },
    { id: 'hasami', n: 2, title: { en: 'Hasami shogi', jp: 'はさみ{将棋|しょうぎ}' }, d: 'A children\'s game on the shogi board: pawns only. Take by sandwiching; first to take five wins.' },
    { id: 'small', n: 3, title: { en: 'The small board', jp: '{小|ちい}さな {盤|ばん}' }, d: 'Four kinds of piece on a 3×4 board: capturing, and dropping a captured piece back into play.' },
    { id: 'mini', n: 4, title: { en: 'Mini-shogi', jp: '{五五将棋|ごごしょうぎ}' }, d: 'Every idea of the full game, promotion too, on a 5×5 board.' },
    { id: 'full', n: 5, title: { en: 'Shogi', jp: '{本将棋|ほんしょうぎ}' }, d: 'The real game. Your partner can give a handicap, playing without some pieces, so you can win.' },
    { id: 'tsume', n: 0, title: { en: 'Puzzles: mate in one', jp: '{詰将棋|つめしょうぎ}' }, d: 'Checkmate in a single move.' },
  ];
  function ladder() {
    const r = rec();
    const wins = (k) => (r.wins[k] || 0), games = (k) => (r.games[k] || 0);
    let h = '<p class="sg-intro">Each rung is a game of its own; nobody has to climb to the top. Show moves, Why? and Take back are always there and never count against you.</p><ol class="sg-ladder">';
    for (const g of RUNGS) {
      const note = g.id === 'lessons' ? Object.keys(r.lessons).length + ' of ' + RB.content.shogi.lessons.length + ' met'
        : g.id === 'tsume' ? Object.keys(r.tsume).length + ' of ' + RB.content.shogi.tsume.length + ' solved'
        : games(g.id) ? wins(g.id) + ' won of ' + games(g.id) : 'Not played yet';
      h += '<li class="sg-rung"><div class="sg-rt">' + (g.n ? '<span class="sg-n">' + g.n + '</span>' : '<span class="sg-n">' + RB.ui.jhtml('{詰|つめ}') + '</span>') + '<span class="vb-jp">' + J(g.title) + '</span><span class="en">' + esc(g.title.en) + '</span></div><p class="small">' + esc(g.d) + '</p><p class="muted small">' + esc(note) + '</p>' +
        (g.id === 'lessons' ? '<div class="sg-acts">' + RB.content.shogi.lessons.map((L) => '<button type="button" class="pbtn small" data-a="lesson" data-id="' + L.id + '">' + (r.lessons[L.id] ? '✓ ' : '') + RB.ui.jhtml(SG().NAMES[L.piece].jp) + '</button>').join('') + '</div>'
          : g.id === 'tsume' ? '<div class="sg-acts">' + RB.content.shogi.tsume.map((T, i) => '<button type="button" class="pbtn small" data-a="tsume" data-id="' + T.id + '">' + (r.tsume[T.id] ? '✓ ' : '') + 'Puzzle ' + (i + 1) + '</button>').join('') + '</div>'
          : g.id === 'full' ? '<div class="sg-acts">' + ['two', 'rook', 'bishop', 'lance', 'none'].map((hc) => '<button type="button" class="pbtn small" data-a="play" data-v="full" data-hc="' + hc + '">' + RB.ui.jhtml(SG().HANDICAPS[hc].label.jp) + ' <span class="en">' + esc(SG().HANDICAPS[hc].label.en) + '</span></button>').join('') + '</div>'
          : '<div class="sg-acts"><button type="button" class="pbtn" data-a="play" data-v="' + g.id + '">' + I('next') + '<span>Play</span></button></div>') + '</li>';
    }
    h += '</ol><fieldset class="sg-level"><legend>How hard ' + esc(partner()) + ' plays</legend>' + LEVEL.map(([n, l]) => '<label class="opt"><input type="radio" name="sg-level" value="' + n + '"' + (V.level === n ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</fieldset>';
    return h;
  }

  // ---- the board ------------------------------------------------------------------------------------------------
  const KAN = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const KANR = ['いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
  function pieceHtml(p) {
    const nm = SG().nameOf(p.t, p.p);
    return '<span class="sg-pc' + (p.s ? ' gote' : '') + (p.p ? ' prom' : '') + '"><ruby>' + esc(nm.short) + '<rt>' + esc(nm.reading) + '</rt></ruby></span>';
  }
  function boardHtml(g, o) {
    const rows = g.b.length, cols = g.b[0].length;
    const targets = new Set((o.targets || []).map((t) => t[0] + ',' + t[1]));
    const lastTo = g.last && g.last.to, lastFrom = g.last && g.last.from;
    let h = '<div class="sg-wrap" style="--cols:' + cols + ';--rows:' + rows + '"><div class="sg-files" aria-hidden="true">' + Array.from({ length: cols }, (x, c) => '<span>' + (cols - c) + '</span>').join('') + '</div><div class="sg-mid"><div class="sg-board" role="group" aria-label="The board, ' + cols + ' by ' + rows + '">';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const p = g.b[r][c];
      const k = r + ',' + c;
      const cls = ['sg-sq'];
      if (o.sel && o.sel[0] === r && o.sel[1] === c) cls.push('sel');
      if (targets.has(k)) cls.push('tgt');
      if ((lastTo && lastTo[0] === r && lastTo[1] === c) || (lastFrom && lastFrom[0] === r && lastFrom[1] === c)) cls.push('last');
      if (o.checkAt && o.checkAt[0] === r && o.checkAt[1] === c) cls.push('chk');
      const what = p === null || p === undefined ? 'empty' : typeof p === 'object' ? (p.s ? 'their ' : 'your ') + SG().nameOf(p.t, p.p).en.toLowerCase() : (p ? 'their piece' : 'your piece');
      const name = (cols - c) + (KAN[r] || r + 1) + ': ' + what + (targets.has(k) ? ' (you can move here)' : '');
      h += '<button type="button" class="' + cls.join(' ') + '" data-sq="' + k + '" aria-label="' + esc(name) + '">' + (p !== null && p !== undefined ? (typeof p === 'object' ? pieceHtml(p) : hasamiPiece(p)) : '') + '</button>';
    }
    h += '</div><div class="sg-ranks" aria-hidden="true">' + Array.from({ length: rows }, (x, r) => '<span><ruby>' + KAN[r] + '<rt>' + KANR[r] + '</rt></ruby></span>').join('') + '</div></div></div>';
    return h;
  }
  const hasamiPiece = (side) => '<span class="sg-pc' + (side ? ' gote' : '') + '"><ruby>' + (side ? 'と' : '歩') + '<rt>' + (side ? 'と' : 'ふ') + '</rt></ruby></span>';
  function handHtml(g, side, mine) {
    const h = g.h[side], keys = Object.keys(h).filter((t) => h[t]);
    const lab = RB.ui.jhtml('{持|も}ち{駒|ごま}') + ' <span class="en">' + (mine ? 'In your hand' : 'In ' + esc(partner()) + '\'s hand') + '</span>';
    return '<div class="sg-hand' + (mine ? ' mine' : '') + '"><span class="sg-hl">' + lab + '</span>' + (keys.length ? keys.map((t) => '<button type="button" class="sg-hp' + (V.drop === t && mine ? ' sel' : '') + '"' + (mine ? ' data-a="drop" data-t="' + t + '"' : ' disabled') + ' aria-label="' + esc(SG().NAMES[t].en + ' × ' + h[t]) + '">' + pieceHtml({ t, s: mine ? 0 : 1, p: false }) + (h[t] > 1 ? '<span class="sg-cnt">×' + h[t] + '</span>' : '') + '</button>').join('') : '<span class="muted small">none</span>') + '</div>';
  }

  // ---- a game ------------------------------------------------------------------------------------------------------
  function startGame(kind, hc) {
    V.kind = kind; V.sel = null; V.drop = null; V.ask = null; V.said = null; V.counted = null; V.lastExplain = null;
    if (kind === 'hasami') { V.view = 'hasami'; V.g = HS().newGame(); V.hist = []; }
    else { V.view = 'game'; V.g = SG().newGame(kind, hc || 'none'); V.hist = []; V.hc = hc || 'none'; }
    render();
    if (V.view === 'game' && V.g.turn === 1) partnerMove();
  }
  function gameHtml() {
    const g = V.g;
    const st = SG().status(g);
    const k = SG().kingAt(g, g.turn);
    const check = !st.over && SG().inCheck(g, g.turn);
    let targets = [];
    if (V.show && V.sel) targets = SG().legal(g, 0).filter((m) => m.from && m.from[0] === V.sel[0] && m.from[1] === V.sel[1]).map((m) => m.to);
    if (V.show && V.drop) targets = SG().legal(g, 0).filter((m) => m.drop === V.drop).map((m) => m.to);
    let line;
    if (st.over) line = st.winner === 0 ? '<b>' + RB.ui.jhtml('{詰|つ}み') + '</b> You win.' : st.winner === 1 ? (st.why === 'mate' ? '<b>' + RB.ui.jhtml('{詰|つ}み') + '</b> ' + esc(partner()) + ' wins this one.' : esc(partner()) + ' wins this one.') : 'A draw: the same position four times (' + RB.ui.jhtml('{千日手|せんにちて}') + ').';
    else if (V.thinking) line = esc(partner()) + ' is thinking…';
    else line = (g.turn === 0 ? 'Your move.' : esc(partner()) + '\'s move.') + (check ? ' <b class="sg-check">' + RB.ui.jhtml('{王手|おうて}') + '</b> Your king is in check: get it out.' : '');
    let h = '<div class="sg-top"><span class="vb-jp">' + J(SG().VARIANTS[V.kind].label) + '</span>' + (V.hc && V.hc !== 'none' ? ' · ' + RB.ui.jhtml(SG().HANDICAPS[V.hc].label.jp) : '') + '</div>' +
      '<div class="sg-play"><div class="sg-bcol">' + handHtml(g, 1, false) + boardHtml(g, { sel: V.sel, targets, checkAt: check ? k : null }) + handHtml(g, 0, true) + '</div><div class="sg-side">' + 
      '<p class="sg-status" role="status">' + line + '</p>';
    h += askHtml();
    if (V.said) h += '<p class="sg-why">' + RB.ui.jhtml(V.said.jp) + '<span class="en">' + esc(V.said.en) + '</span></p>';
    h += '<div class="sg-acts"><label class="opt"><input type="checkbox" data-a="show"' + (V.show ? ' checked' : '') + '><span>Show moves</span></label>' +
      '<button type="button" class="pbtn small" data-a="why"' + (g.last && g.turn === 0 ? '' : ' disabled') + '>Why?</button>' +
      '<button type="button" class="pbtn small" data-a="back"' + (V.hist.length ? '' : ' disabled') + '>Take back</button>' +
      '<button type="button" class="pbtn small" data-a="again">New game</button></div>' + '</div></div>';
    return h;
  }
  // promotion is a choice when a piece enters, leaves or moves within the far zone: asked, never assumed
  const askHtml = () => (V.ask ? '<div class="sg-ask" role="group" aria-label="Promote?"><span>' + RB.ui.jhtml('{成|な}ります か') + ' <span class="en">Promote it?</span></span><button type="button" class="pbtn primary" data-a="prom" data-v="1">' + RB.ui.jhtml('{成|な}る') + ' <span class="en">Promote</span></button><button type="button" class="pbtn" data-a="prom" data-v="0">' + RB.ui.jhtml('{不成|ならず}') + ' <span class="en">Don\'t</span></button></div>' : '');
  function partnerMove() {
    if (!V || V.view !== 'game') return;
    V.thinking = true; render();
    setTimeout(() => {
      if (!V || V.view !== 'game') return;
      const g = V.g, m = SG().choose(g, V.level);
      V.thinking = false;
      if (m) { V.lastExplain = SG().describe(g, m); V.g = SG().play(g, m); }
      finishIfOver();
      render();
    }, 60);
  }
  function finishIfOver() {
    const st = V.view === 'hasami' ? HS().status(V.g) : SG().status(V.g);
    if (st.over && !V.counted) { V.counted = { won: st.winner === 0 }; RB.pastimes.result(S(), 'shogi', V.kind, st.winner === 0); if (RB.stampBook) RB.stampBook.settle(S()); }
  }
  function tryMove(m) {
    const g = V.g;
    V.hist.push(g);
    V.g = SG().play(g, m);
    V.sel = null; V.drop = null; V.ask = null; V.said = null;
    finishIfOver();
    render();
    if (!SG().status(V.g).over) partnerMove();
  }
  function clickSquare(r, c) {
    const g = V.g;
    if (V.thinking || SG().status(g).over || g.turn !== 0) return;
    const legal = SG().legal(g, 0);
    if (V.drop) {
      const m = legal.find((x) => x.drop === V.drop && x.to[0] === r && x.to[1] === c);
      if (m) return tryMove(m);
      V.drop = null; render(); return;
    }
    const p = g.b[r][c];
    if (V.sel) {
      const ms = legal.filter((x) => x.from && x.from[0] === V.sel[0] && x.from[1] === V.sel[1] && x.to[0] === r && x.to[1] === c);
      if (ms.length === 2) { V.ask = ms; render(); return; }
      if (ms.length === 1) return tryMove(ms[0]);
    }
    V.sel = p && p.s === 0 ? [r, c] : null;
    render();
  }

  // ---- hasami ------------------------------------------------------------------------------------------------------
  function hasamiHtml() {
    const g = V.g, st = HS().status(g);
    let targets = [];
    if (V.show && V.sel) targets = HS().legal(g).filter((m) => m.from[0] === V.sel[0] && m.from[1] === V.sel[1]).map((m) => m.to);
    const line = st.over ? (st.winner === 0 ? 'You took five. You win.' : st.winner === 1 ? esc(partner()) + ' wins this one.' : 'A long game: a draw.') : V.thinking ? esc(partner()) + ' is thinking…' : g.turn === 0 ? 'Your move: slide a piece along its rank or file.' : esc(partner()) + '\'s move.';
    return '<div class="sg-top"><span class="vb-jp">' + RB.ui.jhtml('はさみ{将棋|しょうぎ}') + '</span> · taken: you ' + g.taken[0] + ', ' + esc(partner()) + ' ' + g.taken[1] + ' (first to five)</div>' +
      '<div class="sg-play"><div class="sg-bcol">' + boardHtml(g, { sel: V.sel, targets }) + '</div><div class="sg-side">' + '<p class="sg-status" role="status">' + line + '</p>' +
      (g.last && g.last.caught && g.last.caught.length ? '<p class="sg-why">' + (g.turn === 0 ? esc(partner()) + ' sandwiched ' : 'You sandwiched ') + g.last.caught.length + ' piece' + (g.last.caught.length > 1 ? 's' : '') + '.</p>' : '') +
      '<div class="sg-acts"><label class="opt"><input type="checkbox" data-a="show"' + (V.show ? ' checked' : '') + '><span>Show moves</span></label><button type="button" class="pbtn small" data-a="back"' + (V.hist.length ? '' : ' disabled') + '>Take back</button><button type="button" class="pbtn small" data-a="again">New game</button></div>' + '</div></div>';
  }
  function hasamiClick(r, c) {
    const g = V.g;
    if (V.thinking || HS().status(g).over || g.turn !== 0) return;
    if (V.sel) {
      const m = HS().legal(g).find((x) => x.from[0] === V.sel[0] && x.from[1] === V.sel[1] && x.to[0] === r && x.to[1] === c);
      if (m) {
        V.hist.push(g); V.g = HS().play(g, m); V.sel = null; finishIfOver(); render();
        if (!HS().status(V.g).over) {
          V.thinking = true; render();
          setTimeout(() => { if (!V || V.view !== 'hasami') return; V.thinking = false; const mm = HS().choose(V.g, V.level); if (mm) V.g = HS().play(V.g, mm); finishIfOver(); render(); }, 60);
        }
        return;
      }
    }
    V.sel = g.b[r][c] === 0 ? [r, c] : null;
    render();
  }

  // ---- lessons and puzzles ----------------------------------------------------------------------------------------
  function fromRows(variant, rows, hand) {
    const g = SG().newGame(variant);
    g.b = rows.map((row) => [...row].map((ch) => (ch === '.' ? null : { t: ch.toUpperCase(), s: ch === ch.toUpperCase() ? 0 : 1, p: false })));
    g.h = [Object.assign({}, hand || {}), {}]; g.turn = 0; g.hist = [];
    return g;
  }
  function startLesson(id) {
    const L = RB.content.shogi.lessons.find((x) => x.id === id);
    V.view = 'lesson'; V.L = L; V.g = fromRows('mini', L.board); V.sel = null; V.said = null; V.solved = false;
    render();
  }
  // how a piece moves, drawn as a learner's set draws it: the piece in the middle, a dot where it steps, a line where
  // it slides as far as it likes, a ring where it jumps
  function moveDiagram(t) {
    const R = SG().rays({ t, s: 0, p: false });
    const mark = {};
    for (const [dr, dc] of R.step) mark[(2 + dr) + ',' + (2 + dc)] = 'step';
    for (const [dr, dc] of R.jump) mark[(2 + dr) + ',' + (2 + dc)] = 'jump';
    for (const [dr, dc] of R.slide) for (let k = 1; k <= 2; k++) mark[(2 + dr * k) + ',' + (2 + dc * k)] = k === 2 ? 'slide end' : 'slide';
    let h = '<div class="sg-diag" aria-hidden="true">';
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) h += '<span class="' + (r === 2 && c === 2 ? 'me' : mark[r + ',' + c] || '') + '">' + (r === 2 && c === 2 ? pieceHtml({ t, s: 0, p: false }) : '') + '</span>';
    const words = [R.step.length ? 'one square, to a dot' : '', R.slide.length ? 'as far as it likes along a line of dots' : '', R.jump.length ? 'by jumping to a ring, over anything in between' : ''];
    return h + '</div><p class="small muted sg-diagw">It moves ' + esc(words.filter(Boolean).join(', or ')) + '.</p>';
  }
  function lessonHtml() {
    const L = V.L, g = V.g, nm = SG().NAMES[L.piece];
    let targets = [];
    if (V.sel) targets = SG().legal(g, 0).filter((m) => m.from && m.from[0] === V.sel[0] && m.from[1] === V.sel[1]).map((m) => m.to);
    return '<div class="sg-top"><span class="vb-jp">' + RB.ui.jhtml(nm.jp) + '</span> <span class="en">' + esc(nm.en) + '</span></div>' +
      '<div class="sg-lesson"><div>' + moveDiagram(L.piece) + '</div><p class="sg-why">' + RB.ui.jhtml(L.say.jp) + '<span class="en">' + esc(L.say.en) + '</span></p></div>' + '<div class="sg-play"><div class="sg-bcol">' + boardHtml(g, { sel: V.sel, targets }) + '</div><div class="sg-side">' + 
      '<p class="sg-status" role="status">' + (V.solved ? '<b>Well done.</b> That is how the ' + esc(nm.en.toLowerCase()) + ' moves.' : V.said ? esc(V.said) : 'Tap the ' + esc(nm.en.toLowerCase()) + ' to see where it can go, then make the move.') + '</p>' +
      '<div class="sg-acts">' + (V.solved ? '<button type="button" class="pbtn primary" data-a="ladder">Back to the ladder</button>' : '<button type="button" class="pbtn small" data-a="reset">Start again</button>') + '</div>' + '</div></div>';
  }
  function lessonClick(r, c) {
    if (V.solved) return;
    const g = V.g, L = V.L;
    if (V.sel) {
      const ms = SG().legal(g, 0).filter((m) => m.from && m.from[0] === V.sel[0] && m.from[1] === V.sel[1] && m.to[0] === r && m.to[1] === c);
      if (ms.length) {
        const pc = g.b[V.sel[0]][V.sel[1]];
        V.g = SG().play(g, ms.find((m) => !m.promote) || ms[0]);
        V.sel = null;
        const goals = [L.goal].concat(L.alt || []);
        if (pc.t === L.piece && goals.some((x) => x.to[0] === r && x.to[1] === c)) { V.solved = true; rec().lessons[L.id] = Date.now(); }
        else V.said = 'A fine move, but not the one asked for: start again and try the ' + SG().NAMES[L.piece].en.toLowerCase() + '.';
        render(); return;
      }
    }
    const p = g.b[r][c];
    V.sel = p && p.s === 0 ? [r, c] : null;
    render();
  }
  function startTsume(id) {
    const T = RB.content.shogi.tsume.find((x) => x.id === id);
    V.view = 'tsume'; V.T = T; V.g = fromRows(T.size, T.board, T.hand); V.sel = null; V.drop = null; V.said = null; V.solved = false;
    render();
  }
  function tsumeHtml() {
    const g = V.g;
    let targets = [];
    if (V.sel) targets = SG().legal(g, 0).filter((m) => m.from && m.from[0] === V.sel[0] && m.from[1] === V.sel[1]).map((m) => m.to);
    if (V.drop) targets = SG().legal(g, 0).filter((m) => m.drop === V.drop).map((m) => m.to);
    return '<div class="sg-top"><span class="vb-jp">' + RB.ui.jhtml('{詰将棋|つめしょうぎ}') + '</span> <span class="en">Mate in one</span></div><p class="sg-why">' + RB.ui.jhtml(V.T.say.jp) + '<span class="en">' + esc(V.T.say.en) + '</span></p>' +
      '<div class="sg-play"><div class="sg-bcol">' + handHtml(g, 1, false) + boardHtml(g, { sel: V.sel, targets }) + handHtml(g, 0, true) + '</div><div class="sg-side">' + askHtml() +
      '<p class="sg-status" role="status">' + (V.solved ? '<b>' + RB.ui.jhtml('{詰|つ}み') + '</b> Checkmate. Solved.' : V.said ? esc(V.said) : 'Find the move that leaves the king no way out.') + '</p>' +
      '<div class="sg-acts">' + (V.solved ? '<button type="button" class="pbtn primary" data-a="ladder">Back to the ladder</button>' : '<button type="button" class="pbtn small" data-a="reset">Start again</button>') + '</div>' + '</div></div>';
  }
  function tsumeClick(r, c) {
    if (V.solved) return;
    const g = V.g, legal = SG().legal(g, 0);
    V.ask = null;
    let m = null;
    if (V.drop) m = legal.find((x) => x.drop === V.drop && x.to[0] === r && x.to[1] === c);
    else if (V.sel) {
      const ms = legal.filter((x) => x.from && x.from[0] === V.sel[0] && x.from[1] === V.sel[1] && x.to[0] === r && x.to[1] === c);
      if (ms.length === 2) { V.ask = ms; render(); return; }
      m = ms[0];
    }
    if (m) return tsumeTry(m);
    const p = g.b[r][c];
    V.sel = p && p.s === 0 ? [r, c] : null; V.drop = null;
    render();
  }
  function tsumeTry(m) {
    // the board is not changed by a wrong try: the words say why, and the puzzle stays as it was
    const n = SG().play(V.g, m);
    const st = SG().status(n);
    V.sel = null; V.drop = null; V.ask = null;
    if (st.over && st.winner === 0) { V.g = n; V.solved = true; V.said = null; rec().tsume[V.T.id] = Date.now(); if (RB.stampBook) RB.stampBook.settle(S()); }
    else V.said = SG().inCheck(n, 1) ? 'Check, but the king can still get away. Look for the move that closes every escape.' : 'That is not check. The king must be attacked, with nowhere to go.';
    render();
  }

  // ---- render and input --------------------------------------------------------------------------------------------
  function render() {
    if (!V) return;
    const h = V.view === 'ladder' ? ladder() : V.view === 'game' ? gameHtml() : V.view === 'hasami' ? hasamiHtml() : V.view === 'lesson' ? lessonHtml() : tsumeHtml();
    V.leaf.innerHTML = h;
  }
  function onClick(e) {
    if (!V) return;
    const t = e.target;
    const sq = t.closest('[data-sq]');
    if (sq) {
      const [r, c] = sq.dataset.sq.split(',').map(Number);
      if (V.view === 'game') clickSquare(r, c); else if (V.view === 'hasami') hasamiClick(r, c); else if (V.view === 'lesson') lessonClick(r, c); else if (V.view === 'tsume') tsumeClick(r, c);
      return;
    }
    const b = t.closest('[data-a]');
    if (!b) { const lv = t.closest('input[name="sg-level"]'); if (lv) V.level = +lv.value; return; }
    const a = b.dataset.a;
    if (a === 'lesson') return startLesson(b.dataset.id);
    if (a === 'tsume') return startTsume(b.dataset.id);
    if (a === 'play') return b.dataset.v === 'hasami' ? startGame('hasami') : startGame(b.dataset.v, b.dataset.hc);
    if (a === 'ladder') { V.view = 'ladder'; render(); return; }
    if (a === 'reset') return V.view === 'lesson' ? startLesson(V.L.id) : startTsume(V.T.id);
    if (a === 'again') return startGame(V.kind, V.hc);
    if (a === 'show') { V.show = b.checked; render(); return; }
    if (a === 'drop') { V.drop = V.drop === b.dataset.t ? null : b.dataset.t; V.sel = null; render(); return; }
    if (a === 'prom') { const m = V.ask && V.ask.find((x) => !!x.promote === (b.dataset.v === '1')); V.ask = null; if (m) { if (V.view === 'tsume') tsumeTry(m); else tryMove(m); } return; }
    if (a === 'why') { V.said = V.lastExplain ? { en: partner() + ' ' + V.lastExplain.en, jp: V.lastExplain.jp } : null; render(); return; }
    if (a === 'back') {
      if (!V.hist.length) return;
      V.g = V.hist.pop(); V.sel = null; V.drop = null; V.ask = null; V.said = null;
      // a finished game taken back is not finished: its result comes off the record (Take back never counts against you)
      if (V.counted) { const r = rec(); r.games[V.kind] = Math.max(0, (r.games[V.kind] || 1) - 1); if (V.counted.won) r.wins[V.kind] = Math.max(0, (r.wins[V.kind] || 1) - 1); V.counted = null; }
      render(); return;
    }
  }
  // ---- a place's game: Fuku at her bench (src/content/pastimes/20_scenes.js) -----------------------------------------
  RB.hooks = RB.hooks || {};
  RB.hooks.pt_fuku_bench = async () => { await RB.script.run('pt.fuku_bench'); };
  // after the scene has let go of the screen, the board opens with the person who offered it
  RB.hooks.pt_play = async (a) => {
    const kind = a && a[0], who = a && a[1];
    if (!kind) return;
    const t0 = Date.now();
    const tick = () => {
      if (!RB.game || !RB.game.s) return;
      if (!RB.script.isRunning() && RB.game.mode() === 'world') {
        RB.activity.launch(kind, { source: 'world-prop', with: who }).then((r) => { if (r && !r.ok && r.why && r.why !== 'The campaign changed.') RB.ui.notice(r.why, 'info'); });
        return;
      }
      if (Date.now() - t0 < 4000) setTimeout(tick, 40);
    };
    setTimeout(tick, 0);
  };

  return { run, state: () => (V ? { view: V.view, kind: V.kind, g: V.g, level: V.level, solved: !!V.solved, thinking: V.thinking } : null), close };
})();
