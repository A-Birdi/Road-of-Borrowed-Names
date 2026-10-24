// RBN-QA-178 (Agnes 6382141488, 6382201500; Local CL-286): the rook's lesson said only "Move it up its file", and
// rejected the squares that does (one up, three up) while accepting two it never named; its partner's king stood on
// the rook's file, so the lesson began in check with the king offered as a target; no lesson's Japanese said what to
// do. In Chromium on the built game, with a throwaway session, for every lesson of the ladder:
//  1. its task on screen in English and Japanese; your partner's king never among the squares a piece of yours can go;
//  2. the squares it asks for solve it (the rook: up its file to the pawn's rank, and along the bottom rank to beside
//     your king), and each other square its piece can reach does not, with words that say so ("The rook can go there,
//     but that isn't the square asked for"); another piece's move keeps the words it had;
//  3. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/shogi_lesson_goals.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
await p.evaluate(() => {
  const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'mio', flags: { departed: true } });
  s.edition = 2; s.player.nameJp = 'ハル';
  RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
  window.__sg = RB.activity.launch('shogi', { source: 'distractions' });
});
await p.waitForSelector('.sg-ladder');

// in the page: open a lesson fresh, tap squares, read what it says
const run = (id, taps) => p.evaluate(([id, taps]) => {
  const leaf = document.querySelector('.sg-leaf');
  const click = (sel) => { const el = leaf.querySelector(sel); if (el) el.click(); return !!el; };
  // back to the ladder (Leave), and the lesson opened afresh
  if (RB.ui.shogi.state().view !== 'ladder') document.querySelector('[data-folio-close]').click();
  click('[data-a="lesson"][data-id="' + id + '"]');
  const out = { targets: [] };
  for (const [r, c] of taps) {
    click('[data-sq="' + r + ',' + c + '"]');
    out.targets.push([...leaf.querySelectorAll('.sg-sq.tgt')].map((e) => e.dataset.sq));
  }
  const v = RB.ui.shogi.state();
  out.solved = v.solved; out.status = leaf.querySelector('.sg-status').textContent;
  out.en = (leaf.querySelector('.sg-why .en') || {}).textContent || '';
  out.jp = leaf.querySelector('.sg-why') ? leaf.querySelector('.sg-why').textContent.replace(out.en, '') : '';
  return out;
}, [id, taps]);
// a lesson's facts from the game's own content: where its piece and your partner's king stand, its goals, and every
// square its piece can reach (by the rules engine)
const facts = (id) => p.evaluate((id) => {
  const L = RB.content.shogi.lessons.find((x) => x.id === id);
  let from = null, king = null, mine = [];
  L.board.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === L.piece) from = [r, c]; if (ch === 'k') king = [r, c]; if (ch !== '.' && ch === ch.toUpperCase()) mine.push([r, c]); }));
  const g = RB.shogi.newGame('mini');
  g.b = L.board.map((row) => [...row].map((ch) => (ch === '.' ? null : { t: ch.toUpperCase(), s: ch === ch.toUpperCase() ? 0 : 1, p: false })));
  g.h = [{}, {}]; g.turn = 0; g.hist = [];
  // (a square reached with or without promotion counted once, as the lesson plays it)
  const reach = [...new Set(RB.shogi.legal(g, 0).filter((m) => m.from && m.from[0] === from[0] && m.from[1] === from[1]).map((m) => m.to.join(',')))].map((k) => k.split(',').map(Number));
  return { from, king, mine, goals: [L.goal].concat(L.alt || []).map((x) => x.to), reach, en: L.say.en };
}, id);

for (const id of ['P', 'L', 'N', 'S', 'G', 'B', 'R', 'K']) {
  const f = await facts(id);
  // every piece of yours tapped in turn: none of them can go to your partner's king
  const look = await run(id, f.mine);
  const kingSq = f.king.join(',');
  ok(look.targets.every((t) => !t.includes(kingSq)) && /みよう/.test(look.jp) && look.en === f.en, 'lesson ' + id + ': its task in English and Japanese; your partner\'s king (' + kingSq + ') not a square any piece of yours can go (' + J({ en: look.en.slice(-90), jp: look.jp.slice(-40) }) + ')');
  for (const g of f.goals) {
    const r = await run(id, [f.from, g]);
    ok(r.solved, 'lesson ' + id + ': ' + J(f.from) + ' → ' + J(g) + ' solves it (' + r.status + ')');
  }
  const other = f.reach.filter((t) => !f.goals.some((g) => g[0] === t[0] && g[1] === t[1]));
  const wrong = [];
  for (const t of other) {
    const r = await run(id, [f.from, t]);
    if (r.solved || !/can go there, but that isn't the square asked for: start again/.test(r.status)) wrong.push([t, r.status]);
  }
  ok(!wrong.length, 'lesson ' + id + ': each other square its piece can reach (' + other.length + ': ' + J(other) + ') does not solve it, and says why' + (wrong.length ? ' ' + J(wrong) : ''));
}
// the rook's task names both squares; another piece's move keeps its words
{
  const f = await facts('R');
  ok(/to the pawn's rank, where it attacks the pawn, or along the bottom rank to beside your king/.test(f.en), 'the rook\'s task names both squares it asks for (' + f.en + ')');
  const r = await run('R', [[4, 4], [3, 3]]);
  ok(!r.solved && /A fine move, but not the one asked for: start again and try the rook\./.test(r.status), 'in the rook\'s lesson, your king moved instead: the words it had (' + r.status + ')');
}
ok(!errors.length, 'no page errors (' + J(errors).slice(0, 300) + ')');
await ctx.close(); await b.close(); srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
