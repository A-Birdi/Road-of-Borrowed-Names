// The conches' comics (Kotonoha; Agnes 6550310863 and 6550523690; Local CL-576; Cloud CC-417): each line's comic says
// what one particular wrong placing would mean ("From the old boatman to Chitose, it would sound as if…"), but the sheet
// showed it for every wrong placing, so a placing that was never made got its joke (Agnes's c2: Chitose → Yoshi was
// told about the boatman). Now each line's comicIf names the one field its comic changes, and the comic shows only for
// that exact placing, the other field right; every other wrong placing gets the clue alone. In node, the real rules:
//  1. the six tags, as agreed: a1 who the boatman; a2 who the boatman; b1 who Yoshi; b2 to Yoshi; c1 who Chitose; c2 to
//     the boatman;
//  2. every placing of every line (the four people in each field, sixteen per line): the comic fits exactly one, the
//     tagged pair; never the right one; never one wrong in both fields; never another single-field mistake;
//  3. c2 pinned: Chitose → Yoshi gets the clue alone (Agnes's native case); Chitose → the boatman gets its comic; a wrong
//     speaker with the right listener, the clue alone; the right pair, no comic;
//  4. a tag missing or malformed (none, null, a string, an array, an empty object, both fields, an unknown field, someone
//     not among the people, the right person) never shows the comic, even for the placing it meant, and is reported, by
//     the same rule tools/validate.mjs applies (which names the line);
//  5. unchanged: the judge, the solution, every line's text, clue and comic; every line still has its clue and its comic
//     (tests/unit/ko_ch9.test.mjs).
// The sheet itself (rendered feedback for each row, edits and resubmission) is tests/e2e/conch_comic.mjs.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const H = RB.shells, d = RB.content.shells['ko.s_first'];
  const fits = typeof H.comicFits === 'function' ? H.comicFits : () => 'MISSING';
  const problem = typeof H.comicProblem === 'function' ? H.comicProblem : () => 'MISSING';
  const F = Object.fromEntries(d.frags.map((f) => [f.id, f]));
  const ids = d.people.map((p) => p.id);

  // ---- 1. the tags
  t.eq(d.frags.map((f) => [f.id, f.comicIf]), [['a1', { who: 'sendo' }], ['a2', { who: 'sendo' }], ['b1', { who: 'yoshi' }], ['b2', { to: 'yoshi' }], ['c1', { who: 'chitose' }], ['c2', { to: 'sendo' }]], '1 the six lines\' tags, as agreed');
  t.eq(d.frags.map((f) => problem(d, f)), [null, null, null, null, null, null], '1 each is well formed');

  // ---- 2. every placing of every line
  for (const f of d.frags) {
    const hits = [];
    for (const who of ids) for (const to of ids) if (fits(d, f, { who, to }) === true) hits.push(who + '>' + to);
    const k = Object.keys(f.comicIf || {})[0];
    const want = k === 'who' ? f.comicIf.who + '>' + f.to : f.who + '>' + (f.comicIf || {}).to;
    t.eq(hits, [want], '2 ' + f.id + ': of the sixteen placings, the comic fits only ' + want);
  }
  t.ok(d.frags.every((f) => fits(d, f, { who: f.who, to: f.to }) === false && fits(d, f, {}) === false && fits(d, f, null) === false), '2 never the right pair, nor a line not yet placed');

  // ---- 3. c2 pinned
  const c2 = F.c2;
  t.eq([fits(d, c2, { who: 'chitose', to: 'yoshi' }), fits(d, c2, { who: 'chitose', to: 'sendo' }), fits(d, c2, { who: 'yoshi', to: 'ano' }), fits(d, c2, { who: 'chitose', to: 'ano' })], [false, true, false, false],
    '3 c2: Chitose → Yoshi the clue alone; Chitose → the boatman its comic; Yoshi → the one far away the clue alone; right, no comic');

  // ---- 4. missing or malformed tags
  const bad = [['no comicIf', undefined], ['null', null], ['a string', 'sendo'], ['an array', ['who', 'sendo']], ['an empty object', {}], ['both fields', { who: 'sendo', to: 'chitose' }],
    ['an unknown field', { by: 'sendo' }], ['someone not among the people', { who: 'tanaka' }], ['the right person', { who: 'yoshi' }]];
  const rows = bad.map(([what, tag]) => {
    const f = Object.assign({}, F.a1);
    if (tag === undefined) delete f.comicIf; else f.comicIf = tag;
    return { what, problem: problem(d, f), fits: fits(d, f, { who: 'sendo', to: 'chitose' }) };
  });
  t.ok(rows.every((r) => typeof r.problem === 'string' && r.problem.length > 0 && r.problem !== 'MISSING' && r.fits === false),
    '4 a1 with its tag missing or malformed: reported, and its comic never shown, even for the boatman → Chitose ' + JSON.stringify(rows.filter((r) => !(typeof r.problem === 'string' && r.problem !== 'MISSING' && r.fits === false))));
  t.ok(problem(d, Object.assign({}, F.a1, { comic: null, comicIf: undefined })) === null, '4 a line with no comic needs no tag');
  const src = fs.readFileSync(new URL('../../tools/validate.mjs', import.meta.url), 'utf8');
  t.ok(/const cp = RB\.shells\.comicProblem\(d, f\); if \(cp\) E\(w \+ ': line ' \+ f\.id \+ ' ' \+ cp\);/.test(src), '4 tools/validate.mjs applies the same rule to every line, naming it');
  const ui = fs.readFileSync(new URL('../../src/ui/89s_shells.js', import.meta.url), 'utf8');
  t.ok(/\(H\.comicFits\(d, f, p\) \? esc\(f\.comic\.en\) \+ ' ' : ''\)/.test(ui) && !/\(f\.comic \? esc\(f\.comic\.en\)/.test(ui), '4 the sheet shows a comic only through that rule');

  // ---- 5. unchanged
  t.ok(H.judge(d, H.autoPlaced(d)).ok, '5 placed right, the reconstruction is done');
  const w = H.autoPlaced(d); w.c2 = { who: 'chitose', to: 'yoshi' };
  const r = H.judge(d, w);
  t.ok(!r.ok && !r.frags.c2.ok && r.frags.c2.done && r.frags.c2.who && !r.frags.c2.to && r.frags.a1.ok, '5 the judge as before: c2 wrong in its listener, the rest kept');
  t.eq(d.frags.map((f) => [f.who, f.to]), [['yoshi', 'chitose'], ['chitose', 'yoshi'], ['sendo', 'chitose'], ['chitose', 'sendo'], ['yoshi', 'sendo'], ['chitose', 'ano']], '5 the solution as before');
  t.ok(d.frags.every((f) => f.cue && f.cue.en && f.comic && f.comic.en), '5 every line still has its clue and its comic');
};
