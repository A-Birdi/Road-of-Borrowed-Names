// Batch 3 Row 1's English, reached as a player reaches it on the built game (Cloud CC-598, CC-599; Local CL-833,
// CL-834, CL-835; Agnes 6883082806, 6883793139): Wing 7's letter through its whole ask, read and re-entry sequence,
// Wing 3's chores note and Wing 8's footprint board. Every move is a real key and every answer a real click, given
// only while the world waits (tests/e2e/walk.mjs, the driver: it answers only the layers each step expects, a
// challenge only from the step's own data, and fails on anything else).
//
// Synthetic, and only this: the journey after the story in the foyer (slot 4 of a fresh browser context; ngp_offered
// set), the wing's pattern and the level set in the foyer before the wing is entered, and the earlier floors of Wings
// 7 and 8 counted by the game's own hook (RB.hooks.hall_trial, for each of the floor's trials, inside a real visit
// entered by the screen and the card), each followed by the floor's return lantern and "Go in" again. Nothing writes
// the Hall's record; after each count the record is checked as play leaves it.
//
// The expected English is embedded here (the agreed table: Cloud CC-589, Local CL-822, Agnes 6874584737; the same
// strings tests/unit/hall_variant_english.test.mjs embeds). Each string is checked by exactly one check of its own;
// every other check is about the flow and the record. At 73cd133 (before Row 1) all 14 strings differ, so there
// exactly the 14 EN checks fail.
//
// R1  Wing 7 at E: pattern 0 with Mio, pattern 1 alone (Owan reads the letter); 7 checks each:
//  R1a floor 0 counted by the hook (the record as play leaves it); out by its lantern; in again: floor 1;
//  R1b a keepsake before the letter is asked about: not known yet;
//  R1c the letter: the reader's line, the challenge answered right the first time, the asked flag set, one quoted
//      line T; read again: no challenge, the same T;
//  R1d out by floor 1's lantern; in again: floor 1, the asked flag gone, asked again (right the first time), the
//      same T;
//  R1e the other keepsake is not the one (with Mio, her offer to say it again; alone, no companion line); the one
//      the letter names is set before the altar, t6 done in the visit;
//  R1-EN T is the agreed English;  R1-err no page or console errors and no unexpected layer.
// R2  Wing 3, E and A, both patterns, Mio; 3 checks each: R2a in to floor 0, the note walked to and read, exactly one
//     quoted line; R2-EN; R2-err.
// R3  Wing 8, E and A, pattern 0, Mio; 6 checks each: R3a floors 0 and 1 counted by the hook (the record checked
//     after each), floor 2, the board read, exactly four quoted lines; R3-EN for each of the four; R3-err.
// A run that stops counts every check it did not reach as failed.
// Not covered: F and I, the Grow route, Nao, Ren and Suzu (Suzu's one-time speech question needs a journey loaded from
// a save, 56_suzu_speech.js, and none is loaded here), other wings, visuals, real devices and screen readers.
// Usage: node tools/build.mjs && node tests/e2e/hall_native_readback.mjs [w7|w3|w8]   (EVIDENCE=<dir> keeps logs)
import { serve, launch, page } from './lib.mjs';
import { begin, settle, useAt, where, peek, visit, wingFlags, placeOf, quoted, evidence } from './walk.mjs';

const AGREED = {
  w7: { 0: { E: 'A comb and a flute are put away in the storehouse. I\'d like the comb offered at the family altar.' },
    1: { E: 'A flute and a comb are put away in the storehouse. I\'d like the flute offered at the family altar.' } },
  w3: { 0: { E: 'Before waking the priest, carry the firewood. After drawing water, light the stone lantern. After lighting the stone lantern, carry the firewood.',
    A: 'As soon as the water is drawn, the stone lantern is to be lit. The firewood is carried by the lantern\'s light. Waking the priest comes once everything is in order.' },
  1: { E: 'Carrying the firewood comes last. After lighting the stone lantern, draw water. After drawing water, wake the priest.',
    A: 'As soon as the stone lantern is lit, the water is to be drawn. The priest is woken as soon as the water is ready. The firewood can wait until the priest is up.' } },
  w8: { E: { tosuke: 'Tōsuke was wearing straw boots. Saki is said to have seen him.', gonroku: 'Gonroku seems to be wearing geta. There was a clip-clop in the corridor.',
    saki: 'Saki is said to have cleared the snow in zōri.', hisa: 'A child\'s straw sandals should be small.' },
  A: { tosuke: 'This morning, Saki is reported to have seen Tōsuke wearing straw boots.', gonroku: 'Geta went clip-clop in the corridor, so it seems Gonroku is in geta.',
    saki: 'According to the landlady, Saki cleared the snow still in zōri.', hisa: 'Hisa is still a child, so the straw-sandal prints must be small.' } },
};
const WHO8 = ['tosuke', 'gonroku', 'saki', 'hisa'];
const SCREEN = { w3: [24, 2], w7: [16, 19], w8: [32, 19] };
const READER = { mio: 'I\'ll read it. I\'m used to old notebooks. What are we looking for?', alone: 'I\'ll read it for you. It\'s this house\'s letter. What do you want to know?' };
const OFFERS = ['Shall I say what the letter said again?', 'Shall I read the letter again?'];
const KEEP = { 0: ['comb', 'flute'], 1: ['flute', 'comb'] }; // [the one the letter names, the other]
const only = process.argv[2] || null;

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const same = (a, b) => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && same(a[k], b[k]));
};
const setupRec = (pat) => ({ lit: false, pat, choice: null, trials: {}, floors: [], done: false, held: null, notes: [] });
const firstTime = (log) => log.chal.length === 1 && log.chal[0].picks === 1 && flat(log.chal[0].fb) === '["ok"]';
const has = (said, en) => said.some((l) => l.en === en);
const hook = (p, w, ids) => p.evaluate(async ({ w, ids }) => { for (const id of ids) await RB.hooks.hall_trial([w, id]); }, { w, ids });
const lantern = async (p) => { const [x, y] = await placeOf(p, 'hall.return'); return useAt(p, x, y, { sheet: ['Return to the hearth'] }); };
const enterWing = async (p, w) => { const r = await useAt(p, ...SCREEN[w], { card: 'go' }); return { label: r.log.card[0], at: await where(p) }; };
// count floors 0..k-1 by the hook, each in a real visit, out by its lantern and in again; the record checked after each
async function countFloors(p, w, k, ids) {
  const steps = [];
  for (let f = 0; f < k; f++) {
    const e = await enterWing(p, w);
    await hook(p, w, ids[f]);
    await settle(p, {});
    const r = await peek(p, w);
    const o = await lantern(p);
    steps.push({ at: [e.label, e.at.map, e.at.floor], rec: flat(Object.keys(r.trials).sort()) === flat(ids.slice(0, f + 1).flat().sort()) && Object.values(r.trials).every((x) => flat(Object.keys(x).sort()) === '["route","t","tactics"]') && flat(r.floors) === flat(Array(f + 1).fill(true)) && r.done === false && r.held === null && !r.notes.length, out: o.log.sheet[0] });
  }
  return steps;
}
async function run(name, o, names, body) {
  const tag = ' (' + o.w + ', pattern ' + o.pat + ', ' + o.prof + ', ' + (o.comp === null ? 'alone' : 'Mio') + ')';
  const ev = evidence('hall_native_readback-' + o.w + '-p' + o.pat + '-' + o.prof + (o.comp === null ? '-alone' : ''));
  const done = new Set();
  const check = (n, c, detail) => { done.add(n); ev.note(n + ' ' + (c ? 'ok' : 'FAIL') + ' ' + detail); ok(c, n + ' ' + detail + tag); };
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  let stopped = null;
  try {
    const floors = await p.evaluate((w) => RB.hall.get(w).floors.map((f) => f.map), o.w);
    const ids = await p.evaluate((w) => RB.hall.get(w).floors.map((f, k) => RB.hall.floorTrials(w, k).map((t) => t.id)), o.w);
    await begin(p, o);
    await body(p, check, { floors, ids, ev });
  } catch (e) { stopped = e; ev.note('stopped: ' + (e.stack || e.message)); }
  const errName = names[names.length - 1];
  for (const n of names) if (n !== errName && !done.has(n)) check(n, false, 'not reached: ' + (stopped ? stopped.message : '?'));
  check(errName, !stopped && errors.length === 0, 'no page or console errors, no unexpected layer ' + flat({ stopped: stopped ? stopped.message : null, errors: errors.slice(0, 3) }));
  await ctx.close();
}

// ---- R1: Wing 7's letter --------------------------------------------------------------------------------------------------
if (!only || only === 'w7') for (const [pat, comp] of [[0, undefined], [1, null]]) {
  await run('R1', { w: 'w7', pat, prof: 'E', comp }, ['R1a', 'R1b', 'R1c', 'R1d', 'R1e', 'R1-EN', 'R1-err'], async (p, check, { floors, ids, ev }) => {
    const reader = comp === null ? READER.alone : READER.mio;
    const [right, other] = KEEP[pat];
    const r00 = await peek(p, 'w7');
    const counted = await countFloors(p, 'w7', 1, ids);
    const e = await enterWing(p, 'w7');
    check('R1a', same(r00, setupRec(pat)) && counted.every((s) => s.rec && s.out === 'Return to the hearth') && counted[0].at[1] === floors[0] && e.label === 'Go in' && e.at.map === floors[1] && e.at.floor === 1,
      'floor 0 counted by the hook (the record as play leaves it); out by its lantern; in again: floor 1 ' + flat({ setup: r00, counted, at: e.at }));
    const desk = await placeOf(p, 'hall.w7.t6'), kr = await placeOf(p, 'hall.w7.m_' + right), ko = await placeOf(p, 'hall.w7.m_' + other);
    const k0 = await useAt(p, ...kr, {});
    check('R1b', has(k0.said, 'You don\'t know yet which one the letter means. Have it read first.') && !(await visit(p)).done.t6, 'a keepsake before the letter is asked about: not known yet ' + flat(k0.said.map((l) => l.en)));
    const l1 = await useAt(p, ...desk, { chal: ['right'] });
    const asked1 = (await wingFlags(p, 'w7')).includes('xp_hall_w7_f1_asked');
    const T = quoted(l1.said);
    const l2 = await useAt(p, ...desk, {});
    await ev.shot(p, 'letter');
    check('R1c', has(l1.said, reader) && firstTime(l1.log) && asked1 && T.length === 1 && !l2.log.chal.length && flat(quoted(l2.said)) === flat(T),
      'the letter: the reader\'s line, asked right the first time, the asked flag set, one quoted line; read again with no challenge, the same line ' + flat({ reader: has(l1.said, reader), chal: l1.log.chal, asked1, T, again: quoted(l2.said) }));
    const o1 = await lantern(p);
    const e2 = await enterWing(p, 'w7');
    const asked2 = (await wingFlags(p, 'w7')).includes('xp_hall_w7_f1_asked');
    const l3 = await useAt(p, ...desk, { chal: ['right'] });
    check('R1d', o1.log.sheet[0] === 'Return to the hearth' && e2.at.map === floors[1] && e2.at.floor === 1 && !asked2 && firstTime(l3.log) && flat(quoted(l3.said)) === flat(T),
      'out by floor 1\'s lantern; in again: floor 1, the asked flag gone, asked again right the first time, the same line ' + flat({ at: e2.at, asked2, chal: l3.log.chal, T3: quoted(l3.said) }));
    const kw = await useAt(p, ...ko, {});
    const kr2 = await useAt(p, ...kr, {});
    const v = await visit(p);
    const offered = OFFERS.some((x) => has(kw.said, x));
    check('R1e', has(kw.said, 'The letter doesn\'t seem to mean this one.') && (comp === null ? !offered : has(kw.said, OFFERS[0])) && has(kr2.said, 'You set the ' + right + ' gently before the family altar.') && v.done.t6 === true,
      'the other keepsake is not the one' + (comp === null ? ' (no companion line)' : ' (Mio offers to say it again)') + '; the named one set before the altar; t6 done in the visit ' + flat({ other: kw.said.map((l) => l.en), right: kr2.said.map((l) => l.en), t6: v.done.t6 }));
    check('R1-EN', T.length === 1 && T[0] === AGREED.w7[pat].E, 'the letter\'s English is the agreed one ' + flat(T));
  });
}
// ---- R2: Wing 3's note ------------------------------------------------------------------------------------------------------
if (!only || only === 'w3') for (const prof of ['E', 'A']) for (const pat of [0, 1]) {
  await run('R2', { w: 'w3', pat, prof }, ['R2a', 'R2-EN', 'R2-err'], async (p, check, { floors }) => {
    const r00 = await peek(p, 'w3');
    const e = await enterWing(p, 'w3');
    const n = await useAt(p, ...(await placeOf(p, 'hall.w3.t2_note')), {});
    const q = quoted(n.said);
    check('R2a', same(r00, setupRec(pat)) && e.label === 'Go in' && e.at.map === floors[0] && e.at.floor === 0 && q.length === 1, 'in to floor 0; the note walked to and read: one quoted line ' + flat({ at: e.at, q }));
    check('R2-EN', q.length === 1 && q[0] === AGREED.w3[pat][prof], 'the note\'s English is the agreed one ' + flat(q));
  });
}
// ---- R3: Wing 8's board -----------------------------------------------------------------------------------------------------
if (!only || only === 'w8') for (const prof of ['E', 'A']) {
  await run('R3', { w: 'w8', pat: 0, prof }, ['R3a', ...WHO8.map((x) => 'R3-EN ' + x), 'R3-err'], async (p, check, { floors, ids, ev }) => {
    const r00 = await peek(p, 'w8');
    const counted = await countFloors(p, 'w8', 2, ids);
    const e = await enterWing(p, 'w8');
    const n = await useAt(p, ...(await placeOf(p, 'hall.w8.t8_board')), {});
    const q = quoted(n.said);
    await ev.shot(p, 'board');
    check('R3a', same(r00, setupRec(0)) && counted.length === 2 && counted.every((s, k) => s.rec && s.out === 'Return to the hearth' && s.at[1] === floors[k] && s.at[2] === k) && e.at.map === floors[2] && e.at.floor === 2 && q.length === 4,
      'floors 0 and 1 counted by the hook (the record as play leaves it after each); floor 2; the board read: four quoted lines ' + flat({ counted, at: e.at, n: q.length }));
    WHO8.forEach((x, i) => check('R3-EN ' + x, q[i] === AGREED.w8[prof][x], x + '\'s line is the agreed one ' + flat(q[i] || null)));
  });
}
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
