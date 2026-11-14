// Wings 1 and 4 of the Hall walked as a player walks them, on the built game (Cloud CC-598, CC-599; Local CL-833,
// CL-834, CL-835; Agnes 6883082806, 6883793139): the card trial reached by the screen, the Hall card and the floor, the
// cards and plaques walked to and used, leaving and coming back, a counted floor, and the tale walked again as
// practice. Both patterns of each wing at E, with Mio. Every move is a real key and every answer a real click, given
// only while the world waits (tests/e2e/walk.mjs, the driver: it answers only the layers each step expects, a
// challenge only from the step's own data, and fails on anything else).
//
// Synthetic, and only this: the journey after the story in the foyer (slot 4 of a fresh browser context; ngp_offered
// set), the wing's pattern and the level set in the foyer before the wing is entered, and trials other than t3
// counted by the game's own hook (RB.hooks.hall_trial, inside a real visit) where a step says so: N5 (the floor's
// other two) and N6 (the rest of the wing). Nothing writes the Hall's record.
//
// Each run (15 checks):
//  N1  before going in the record is the setup's; the screen used, the card's "Go in": floor 0, not practice
//      (R0 is the record now);
//  C1  the stone's challenge, "Come back later" with no pick: the later line; no card gone, nothing done in the
//      visit, the record R0;
//  C2  one deliberate wrong pick (shown wrong), then "Come back later": the same;
//  N2a the stone's challenge answered right the first time: t3 done in the visit only; the record still R0 (the floor
//      is not counted until its other trials are done; 98h_hall.js markTrial);
//  N2b exactly one card gone, the agreed one (AGREED_ODD), which is also the data's odd one;
//  N3  each card or plaque walked to and used: Wing 4, the agreed card's tile no longer blocks and using it finds
//      nothing (you then stand on it), the other three their name and saying and block; Wing 1, the agreed plaque says
//      only its name, the other three their saying, and all block;
//  N4a out by floor 0's return lantern ("Return to the hearth"): in the foyer, no visit, no flag of the wing's visit,
//      the record R0;
//  N4b in again: floor 0, nothing gone, every card back with its saying; the stone asks again, right the first time;
//      t3 done in the visit; the record R0;
//  N4c the same agreed card goes again;
//  N5a the floor's other two trials by the hook: the record has exactly floor 0's trials, floor 0 counted;
//  N5b up floor 0's stairs to floor 1; out by its lantern; the next "Go in" lands on floor 1;
//  N6a the rest of the wing by the hook: the tale complete in the record; out; the card offers "Walk the tale again":
//      floor 0, practice (Rd is the record now, the same as before going in);
//  N6b every card back; the stone asks, right the first time; the record Rd throughout;
//  N6c the agreed card goes in practice too;
//  E   no page or console errors and no unexpected layer (a run that stops counts every check it did not reach as
//      failed).
// Once per file: no Hall floor's exit leads down (each leads to its own wing's next floor up), and no scene's !warp
// moves the player onto a Hall floor. That covers exits and scene commands only: code can still put the player on a
// floor (the Hall's own goIn, 89h_hall.js, by the hall_enter hook; the expedition hook xp_enter is used only for the
// cellars), and this does not prove otherwise.
//
// Overlaps, kept on purpose (the walking path is what is new here): N2-N3 cover the same wings, patterns and level
// as hall_wrong_card.mjs steps 1-2 (reached there by helpers); N5 overlaps hall_stairs.mjs and hall_leave_words.mjs
// state 2; N6 overlaps hall_leave_words.mjs state 4.
// Not covered: other levels and the Grow route, other companions, other wings, Suspend and the load menu, the reveal
// path, visuals, real devices and screen readers.
// Usage: node tools/build.mjs && node tests/e2e/hall_native_walk.mjs [w4|w1] [0|1]   (EVIDENCE=<dir> keeps logs)
import { serve, launch, page } from './lib.mjs';
import { begin, settle, useAt, walkTo, takeExit, where, peek, visit, wingFlags, gone, blocked, placeOf, exitTo, quoted, evidence } from './walk.mjs';

// the agreed odd card of each wing and pattern (CL-812, CL-828/829, CC-596): Wing 4 card 2 / 3, Wing 1 plaque 3 / 2
const AGREED_ODD = { w4: [2, 3], w1: [3, 2] };
const WING = {
  w4: { screen: [32, 2], item: (i) => 'hall.w4.card' + i, name: "One of the peddler's cards.", data: 'hallW4Cards', later: 'Read the cards one by one, then come back.' },
  w1: { screen: [8, 2], item: (i) => 'hall.w1.plaque' + i, name: 'A stone plaque.', data: 'hallW1Plaques', later: 'Read the plaques one by one, then come back.' },
};
const NAMES = ['N1', 'C1', 'C2', 'N2a', 'N2b', 'N3', 'N4a', 'N4b', 'N4c', 'N5a', 'N5b', 'N6a', 'N6b', 'N6c', 'E'];
const only = process.argv.slice(2);

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

// the four cards or plaques, each walked to and used; `odd` (1-4): the one expected gone (Wing 4) or bare (Wing 1)
async function readAll(p, w, odd) {
  const out = [];
  for (let i = 1; i <= 4; i++) {
    const [x, y] = await placeOf(p, WING[w].item(i));
    const blk = await blocked(p, x, y);
    if (w === 'w4' && i === odd && !blk) {
      const u = await useAt(p, x, y, {});
      const at = await walkTo(p, x, y);
      out.push({ i, blocked: blk, said: u.said.map((l) => l.en), stoodOn: at.x === x && at.y === y });
      continue;
    }
    const u = await useAt(p, x, y, {});
    out.push({ i, blocked: blk, said: u.said.map((l) => l.en), quoted: quoted(u.said).length });
  }
  return out;
}
const full = (c, w) => c.blocked && c.said && c.said[0] === WING[w].name && c.quoted === 1;
const bare = (c, w) => c.blocked && c.said && c.said.length === 1 && c.said[0] === WING[w].name;
const goneOk = (c) => !c.blocked && c.said && c.said.length === 0 && c.stoodOn === true;
const back = (cs, w) => cs.length === 4 && cs.every((c) => full(c, w));
const firstTime = (log) => log.chal.length === 1 && log.chal[0].picks === 1 && flat(log.chal[0].fb) === '["ok"]';
const dataOdd = (p, w, pat) => p.evaluate(({ d, pat }) => RB.content[d][pat].E.findIndex((c) => c[1] === 1) + 1, { d: WING[w].data, pat });
const hook = (p, w, ids) => p.evaluate(async ({ w, ids }) => { for (const id of ids) await RB.hooks.hall_trial([w, id]); }, { w, ids });
const lantern = async (p) => { const [x, y] = await placeOf(p, 'hall.return'); return useAt(p, x, y, { sheet: ['Return to the hearth'] }); };
const enterWing = async (p, w) => { const r = await useAt(p, ...WING[w].screen, { card: 'go' }); return { label: r.log.card[0], at: await where(p) }; };

for (const w of ['w4', 'w1']) for (const pat of [0, 1]) {
  if (only[0] && only[0] !== w) continue;
  if (only[1] !== undefined && +only[1] !== pat) continue;
  const tag = ' (' + w + ', pattern ' + pat + ', E, Mio)';
  const ev = evidence('hall_native_walk-' + w + '-p' + pat);
  const done = new Set();
  const check = (name, c, detail) => { done.add(name); ev.note(name + ' ' + (c ? 'ok' : 'FAIL') + ' ' + detail); ok(c, name + ' ' + detail + tag); };
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  let stopped = null;
  try {
    const odd = AGREED_ODD[w][pat];
    const floors = await p.evaluate((w) => RB.hall.get(w).floors.map((f) => f.map), w);
    const ids = await p.evaluate((w) => RB.hall.get(w).floors.map((f, k) => RB.hall.floorTrials(w, k).map((t) => t.id)), w);
    await begin(p, { w, pat, prof: 'E' });
    // N1
    const r00 = await peek(p, w);
    const e1 = await enterWing(p, w);
    const R0 = await peek(p, w);
    check('N1', same(r00, setupRec(pat)) && e1.label === 'Go in' && e1.at.map === floors[0] && e1.at.floor === 0 && e1.at.practice === false && R0.lit === true,
      'the record before going in is the setup\'s; the screen, the card\'s "Go in": floor 0, not practice ' + flat({ before: r00, label: e1.label, at: e1.at }));
    const stone = await placeOf(p, 'hall.' + w + '.t3');
    // C1, C2
    for (const [name, how] of [['C1', 'later'], ['C2', 'wrong-later']]) {
      const t = await useAt(p, ...stone, { chal: [how] });
      const c = t.log.chal[0] || {}, g = await gone(p, w), v = await visit(p), r = await peek(p, w);
      const shown = how === 'later' ? c.picks === 0 && flat(c.fb) === '[]' : c.picks === 1 && flat(c.fb) === '["no"]';
      check(name, t.log.chal.length === 1 && shown && t.said.some((l) => l.en === WING[w].later) && !g.length && same(v.done, {}) && same(r, R0),
        (how === 'later' ? '"Come back later" with no pick' : 'one deliberate wrong pick, then "Come back later"') + ': the later line, nothing gone, nothing done, the record R0 ' + flat({ chal: t.log.chal, gone: g, done: v.done }));
    }
    // N2a, N2b
    await ev.shot(p, 'before-pass');
    const t1 = await useAt(p, ...stone, { chal: ['right'] });
    const v1 = await visit(p), r1 = await peek(p, w), g1 = await gone(p, w), dOdd = await dataOdd(p, w, pat);
    check('N2a', firstTime(t1.log) && same(v1.done, { t3: true }) && same(r1, R0), 'the challenge answered right the first time: t3 done in the visit only, the record R0 ' + flat({ chal: t1.log.chal, done: v1.done }));
    check('N2b', flat(g1) === flat([odd]) && dOdd === odd, 'exactly one card gone, the agreed one ' + odd + ' (the data\'s odd one: ' + dOdd + ') ' + flat({ gone: g1 }));
    // N3
    const c3 = await readAll(p, w, odd);
    await ev.shot(p, 'after-pass');
    check('N3', c3.every((c) => (c.i === odd ? (w === 'w4' ? goneOk(c) : bare(c, w)) : full(c, w))),
      (w === 'w4' ? 'the agreed card\'s tile no longer blocks, using it finds nothing, you stand on it; the other three name, saying, and block' : 'the agreed plaque says only its name; the other three their saying; all block') + ' ' + flat(c3.map((c) => [c.i, c.blocked, c.said ? c.said.length : null, c.stoodOn])));
    // N4a, N4b, N4c
    const o4 = await lantern(p);
    const a4 = await where(p), v4 = await visit(p), f4 = await wingFlags(p, w), r4 = await peek(p, w);
    check('N4a', flat(o4.log.sheet) === '["Return to the hearth"]' && a4.map === 'hall.foyer' && v4 === null && !f4.length && same(r4, R0), 'out by floor 0\'s lantern: the foyer, no visit, no flag of the visit, the record R0 ' + flat({ at: a4.map, flags: f4 }));
    const e4 = await enterWing(p, w);
    const g4 = await gone(p, w), c4 = await readAll(p, w, 0);
    const t4 = await useAt(p, ...stone, { chal: ['right'] });
    const v4b = await visit(p), r4b = await peek(p, w), g4b = await gone(p, w);
    check('N4b', e4.label === 'Go in' && e4.at.floor === 0 && !g4.length && back(c4, w) && firstTime(t4.log) && same(v4b.done, { t3: true }) && same(r4b, R0),
      'in again: floor 0, nothing gone, every card back with its saying; asked again, right the first time; t3 done in the visit; the record R0 ' + flat({ at: e4.at, cards: c4.map((c) => [c.i, c.blocked, c.said.length]), chal: t4.log.chal }));
    check('N4c', flat(g4b) === flat([odd]), 'the same agreed card goes again ' + flat({ gone: g4b }));
    // N5a, N5b
    await hook(p, w, ids[0].filter((id) => id !== 't3'));
    await settle(p, {});
    const r5 = await peek(p, w);
    const recOk = (r, k) => flat(Object.keys(r.trials).sort()) === flat(ids.slice(0, k).flat().sort()) && Object.values(r.trials).every((x) => flat(Object.keys(x).sort()) === '["route","t","tactics"]') && flat(r.floors) === flat(Array(k).fill(true)) && r.held === null;
    check('N5a', recOk(r5, 1) && r5.done === false && !r5.notes.length, 'the floor\'s other two trials by the hook: the record has exactly floor 0\'s trials, floor 0 counted ' + flat({ trials: Object.keys(r5.trials), floors: r5.floors }));
    const up = await takeExit(p, ...(await exitTo(p, floors[1])), {});
    const o5 = await lantern(p);
    const e5 = await enterWing(p, w);
    check('N5b', up.at.map === floors[1] && up.at.floor === 1 && flat(o5.log.sheet) === '["Return to the hearth"]' && e5.label === 'Go in' && e5.at.map === floors[1] && e5.at.floor === 1,
      'up the stairs to floor 1; out by its lantern; the next "Go in" lands on floor 1 ' + flat({ up: up.at, next: e5.at }));
    // N6a, N6b, N6c
    await hook(p, w, ids.slice(1).flat());
    await settle(p, {});
    const r6 = await peek(p, w);
    const o6 = await lantern(p);
    const Rd = await peek(p, w);
    const e6 = await enterWing(p, w);
    const r6b = await peek(p, w);
    const parts6 = { complete: recOk(r6, floors.length) && r6.done === true && r6.notes.length === 1, out: o6.log.sheet, outKept: same(Rd, r6), inKept: same(r6b, Rd) };
    check('N6a', parts6.complete && flat(o6.log.sheet) === '["Return to the hearth"]' && parts6.outKept && e6.label === 'Walk the tale again' && e6.at.map === floors[0] && e6.at.floor === 0 && e6.at.practice === true && parts6.inKept,
      'the rest of the wing by the hook: the tale complete; out; "Walk the tale again": floor 0, practice; the record unchanged ' + flat({ label: e6.label, at: e6.at, parts: parts6 }));
    if (!parts6.complete || !parts6.outKept || !parts6.inKept) ev.note('N6a records ' + flat({ r6, Rd, r6b }));
    const c6 = await readAll(p, w, 0);
    const r6c = await peek(p, w);
    const t6 = await useAt(p, ...stone, { chal: ['right'] });
    const r6d = await peek(p, w), g6 = await gone(p, w), v6 = await visit(p);
    check('N6b', back(c6, w) && same(r6c, Rd) && firstTime(t6.log) && v6.practice === true && same(r6d, Rd), 'practice: every card back; asked, right the first time; the record Rd throughout ' + flat({ cards: c6.map((c) => [c.i, c.blocked, c.said.length]), chal: t6.log.chal }));
    check('N6c', flat(g6) === flat([odd]), 'the agreed card goes in practice too ' + flat({ gone: g6 }));
  } catch (e) { stopped = e; ev.note('stopped: ' + (e.stack || e.message)); }
  for (const n of NAMES) if (n !== 'E' && !done.has(n)) check(n, false, 'not reached: ' + (stopped ? stopped.message : '?'));
  check('E', !stopped && errors.length === 0, 'no page or console errors, no unexpected layer ' + flat({ stopped: stopped ? stopped.message : null, errors: errors.slice(0, 3) }));
  await ctx.close();
}

// once per file: exits and scene commands (data only)
if (!only.length) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const d = await p.evaluate(() => {
    const floor = {};
    for (const wing of RB.hall.list()) wing.floors.forEach((f, k) => { floor[f.map] = { w: wing.id, k }; });
    const exits = [];
    for (const m of Object.keys(floor)) for (const e of RB.maps.compile(m).exits || []) exits.push({ from: m, to: e.to, up: !!floor[e.to] && floor[e.to].w === floor[m].w && floor[e.to].k === floor[m].k + 1 });
    let warps = 0;
    const onto = [];
    for (const id of Object.keys(RB.content.scenes)) for (const c of RB.content.scenes[id].cmds || []) if (c.op === 'warp') { warps++; if (floor[c.args[0]]) onto.push(id + ' -> ' + c.args[0]); }
    return { floors: Object.keys(floor).length, exits: exits.length, notUp: exits.filter((e) => !e.up), warps, onto };
  });
  ok(d.floors > 0 && d.exits > 0 && !d.notUp.length && d.warps > 0 && !d.onto.length && errors.length === 0,
    'exits and scene commands: every exit on a Hall floor leads to its own wing\'s next floor up (none down); no scene\'s !warp moves the player onto a Hall floor (code entry, the Hall\'s goIn, is not covered) ' + flat(d));
  await ctx.close();
}
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
