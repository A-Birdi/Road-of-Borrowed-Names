// CW-1, the traveller's setup book: the leaf-turn plan (src/ui/39_leafturn.js) against the motion contract of the CW-1
// package (demo/MOTION_CONTRACT.json and turn-plan.mjs): how many leaves, which way, how long; which printed page is on
// which face; and that the plan is pure. The motion itself is the browser test's (tests/e2e/cw1_setup_book.mjs).
import { load } from '../lib/load.mjs';

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const LT = RB.ui && RB.ui.leafTurn;
  t.ok(!!LT, 'RB.ui.leafTurn loads');
  if (!LT) return;
  const want = { 1: [360, 0, 40, 400], 2: [230, 12, 40, 512], 3: [180, 12, 40, 604], 4: [155, 12, 40, 696] };
  for (const n of [1, 2, 3, 4]) {
    for (const [from, to] of [[0, n], [4, 4 - n]]) {
      const P = LT.plan(from, to);
      t.eq([P.n, P.leafMs, P.gapMs, P.settleMs, P.totalMs], [n].concat(want[n]), 'plan ' + from + '→' + to + ': ' + n + ' leaves, the contract\'s timing');
      t.eq(P.forward, to > from, 'plan ' + from + '→' + to + ': direction');
      t.eq(P.hops.map((h) => h.from + '→' + h.to).join(' '), Array.from({ length: n }, (_, k) => (to > from ? from + k + '→' + (from + k + 1) : from - k + '→' + (from - k - 1))).join(' '), 'plan ' + from + '→' + to + ': one leaf per step, in order (4→1 is 4→3, 3→2, 2→1)');
      t.eq(P.easing, n > 1 ? 'cubic-bezier(.35,.05,.40,1)' : 'cubic-bezier(.32,.04,.22,1)', 'plan ' + from + '→' + to + ': easing');
    }
  }
  t.eq(LT.plan(2, 2).n, 0, 'no move, no leaf');
  // the faces (05 §5.2): forward i → i+1 lifts R(i) from the right and lands L(i+1) on the left over L(i), R(i+1)
  t.eq(LT.faces(1, 2), { forward: true, underLeft: [1, 'l'], underRight: [2, 'r'], front: [1, 'r'], back: [2, 'l'], origin: 'left center', angle: -180 }, 'forward faces');
  // backward i → i-1 lifts L(i) from the left and lands R(i-1) on the right over L(i-1), R(i)
  t.eq(LT.faces(2, 1), { forward: false, underLeft: [1, 'l'], underRight: [2, 'r'], front: [2, 'l'], back: [1, 'r'], origin: 'right center', angle: 180 }, 'backward faces');
  // every hop of a long move has the right pages: 4→1 shows L(3)/R(4) under L(4)→R(3), then L(2)/R(3), then L(1)/R(2)
  const P = LT.plan(4, 1);
  t.eq(P.hops.map((h) => { const f = LT.faces(h.from, h.to); return [f.underLeft[0], f.underRight[0], f.front.join(''), f.back.join('')]; }),
    [[3, 4, '4l', '3r'], [2, 3, '3l', '2r'], [1, 2, '2l', '1r']], '4→1: three leaves, each with the pages of its own step');
  // within ±15 % of the contract, as the brief allows: here exactly
  for (const n of [1, 2, 3, 4]) t.ok(Math.abs(LT.plan(0, n).totalMs - want[n][3]) <= want[n][3] * 0.15, 'total within 15 %: ' + n);
};
