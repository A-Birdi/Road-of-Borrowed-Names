// What leaving the Hall says, once a floor is counted (CL-739 (2), CL-740; Cloud CC-581; Agnes 6868287302's wording;
// Local CL-816). In Chromium on the built game, a throwaway journey after the story (slot 4 of a fresh browser context,
// never a player's saves), in Wing 1 (three floors: t1-t3, t4-t7 with the riddle stone's reprieve at t7, t8-t10).
// Trials are counted by the game's own hook (hall_trial), the sheet is opened from the chip, and the return lantern by
// its hook; each is answered by its button. The three texts (the sheet, the return lantern, the notice after leaving),
// in four states:
//  1. a floor not yet counted (nothing done, then one trial done): the old wording, unchanged, and the next ordinary
//     entry is that same floor;
//  2. the floor just counted, the tale unfinished: "This floor stays counted..." (the lantern with its own prefix),
//     the notice "You leave the Hall. This floor stays counted; ...", and the next entry is the first floor not yet
//     counted (also after walking back down to the counted floor before leaving);
//  3. the last floor just counted (the tale complete in that same call): "Every floor is counted: the tale is
//     complete...", "You leave the Hall. The tale stays complete; ...", and the next walk starts from the first floor;
//  4. a walk through the finished tale (practice), before and after its first floor's trials are done again: the same
//     completed wording, and the next walk again from the first floor;
// and the reprieve: absent, no reprieve option or sentence; earned (on a floor not yet counted, and on a counted one),
// its option and sentence on the sheet and the lantern as before, its own notice, and going back to where you left
// off returns you to the very tile with what you had done. The notice is the one shown after leaving. No page errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_leave_words.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };

const OPEN_SHEET = 'Leaving now starts this floor again next time; earlier floors stay done.';
const OPEN_LANTERN = 'The return lantern. Going back now starts this floor again next time; earlier floors stay done.';
const OPEN_NOTE = 'You leave the Hall. The floor you were on starts again next time; earlier floors stay done.';
const COUNTED = 'This floor stays counted. If you leave without a reprieve, next time you\'ll start on the first floor not yet counted.';
const COUNTED_NOTE = 'You leave the Hall. This floor stays counted; next time you\'ll start on the first floor not yet counted.';
const COMPLETE = 'Every floor is counted: the tale is complete. If you leave without a reprieve, the next walk starts from the first floor.';
const COMPLETE_NOTE = 'You leave the Hall. The tale stays complete; the next walk starts from the first floor.';
const KEEP_NOTE = 'You leave the Hall with the reprieve: the floor will be exactly as you left it.';
const SHEET_REPRIEVE = ' You have earned a reprieve.';
const LANTERN_REPRIEVE = ' With your reprieve, the floor can be kept exactly as it is.';
const ENTRY = ['hall.w1f1', 'hall.w1f2', 'hall.w1f3'];

// a journey after the story, the key ledger in hand, in the Hall's foyer (as tests/e2e/hall.mjs)
async function start(p) {
  await p.evaluate(() => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true };
    const s = RB.game.debugStart('hall.foyer', 40, 14, { comp: 'mio', flags: done });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.save.setCurrent(4, 0);
    window.__notes = [];
    const n = RB.ui.notice;
    RB.ui.notice = function (t) { window.__notes.push(String(t)); return n.apply(this, arguments); };
  });
}
const where = (p) => p.evaluate(() => {
  const s = RB.game.s, v = RB.hall.visitOf(s), r = RB.hall.peek(s, 'w1'), P = RB.world.W.player;
  return { map: RB.world.W.map.id, x: P.x, y: P.y, mode: RB.game.mode(), visit: v ? { floor: v.floor, done: Object.keys(v.done).sort(), reprieve: v.reprieve, practice: v.practice } : null,
    floors: r ? r.floors.slice() : [], tale: !!(r && r.done), held: !!(r && r.held) };
});
async function settle(p) {
  for (let i = 0; i < 60 && await p.evaluate(() => RB.game.mode() !== 'world'); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(80); }
  await p.waitForTimeout(500); // the chip follows the visit (every 400 ms)
}
async function goIn(p, held) {
  await p.evaluate(async (held) => { await RB.ui.hall.goIn('w1', held); }, !!held);
  await settle(p);
}
async function trials(p, ids) {
  for (const t of ids) await p.evaluate(async (t) => { await RB.hooks.hall_trial(['w1', t]); }, t);
  await settle(p);
}
// the sheet or the return lantern, read, then answered by a button's text
async function answer(p, pick) {
  await p.waitForSelector('.csheet .foot button', { timeout: 5000 });
  const r = await p.evaluate(() => ({ q: document.querySelector('.csheet .q').textContent, opts: [...document.querySelectorAll('.csheet .foot button')].map((x) => x.textContent.trim()) }));
  const k = r.opts.findIndex((t) => new RegExp(pick, 'i').test(t));
  r.picked = k >= 0 ? r.opts[k] : null;
  await p.evaluate(() => { window.__notes = []; });
  await p.evaluate((k) => document.querySelectorAll('.csheet .foot button')[k].click(), k < 0 ? r.opts.length - 1 : k);
  for (let i = 0; i < 50 && await p.evaluate(() => !!document.querySelector('.csheet')); i++) await p.waitForTimeout(60);
  if (/Leave|Return|reprieve|keeping/i.test(r.picked || '')) for (let i = 0; i < 80 && await p.evaluate(() => !!RB.hall.visitOf(RB.game.s) || RB.game.mode() !== 'world'); i++) await p.waitForTimeout(80);
  await p.waitForTimeout(300);
  r.notes = await p.evaluate(() => window.__notes.slice());
  return r;
}
async function sheet(p, pick) {
  await settle(p);
  await p.evaluate(() => document.querySelector('.hall-chip').click());
  return answer(p, pick);
}
async function lantern(p, pick) {
  await settle(p);
  await p.evaluate(() => { RB.hooks.hall_return(); });
  return answer(p, pick);
}
// the sheet's question: the wing, the trials counted, then the leave sentence (and the reprieve's, if earned)
const sheetTail = (q) => q.replace(/^.*? trials counted( \(walking the tale again: nothing changes your records\))?\. /, '');
// no reprieve offered: no option for it, and neither the sheet's nor the lantern's sentence about it (the new clauses
// themselves say "without a reprieve")
const noReprieve = (r) => !r.opts.some((t) => /reprieve/i.test(t)) && !r.q.includes(SHEET_REPRIEVE.trim()) && !r.q.includes(LANTERN_REPRIEVE.trim());

const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
await start(p);

// ---- 1. a floor not yet counted ------------------------------------------------------------------------------------
await goIn(p);
let w = await where(p);
ok(w.map === ENTRY[0] && w.visit && w.visit.floor === 0 && !w.visit.practice, '1 in, on the first floor: ' + JSON.stringify(w));
let r = await sheet(p, 'Stay');
ok(sheetTail(r.q) === OPEN_SHEET && noReprieve(r), '1 sheet, nothing done: the old wording, no reprieve: ' + r.q);
ok(r.opts.join('|') === 'Leave the Hall|Suspend: close the game here|Stay', '1 sheet options unchanged: ' + r.opts.join(' / '));
r = await lantern(p, 'Stay');
ok(r.q === OPEN_LANTERN && noReprieve(r) && r.opts.join('|') === 'Return to the hearth|Stay', '1 lantern, nothing done: the old wording and options: ' + r.q + ' / ' + r.opts.join(' / '));
await trials(p, ['t2']);
w = await where(p);
ok(w.visit && w.visit.done.join() === 't2' && !w.floors[0], '1 one trial done, the floor not yet counted: ' + JSON.stringify(w));
r = await sheet(p, 'Stay');
ok(sheetTail(r.q) === OPEN_SHEET, '1 sheet, one trial done: the old wording: ' + r.q);
r = await lantern(p, 'Return to the hearth');
ok(r.q === OPEN_LANTERN, '1 lantern, one trial done: the old wording: ' + r.q);
ok(r.notes.length === 1 && r.notes[0] === OPEN_NOTE, '1 left by the lantern: the old notice: ' + JSON.stringify(r.notes));
w = await where(p);
ok(!w.visit && w.map === 'hall.foyer' && !w.floors[0], '1 out, at the hearth, nothing counted: ' + JSON.stringify(w));
await goIn(p);
w = await where(p);
ok(w.map === ENTRY[0] && w.visit && w.visit.floor === 0 && w.visit.done.length === 0, '1 the next entry: the same floor, started again: ' + JSON.stringify(w));

// ---- 2. the floor just counted, the tale unfinished ------------------------------------------------------------------
await trials(p, ['t1', 't2', 't3']);
w = await where(p);
ok(w.floors[0] === true && !w.tale && w.visit && w.visit.floor === 0, '2 the first floor counted, the tale unfinished: ' + JSON.stringify(w));
r = await sheet(p, 'Stay');
ok(sheetTail(r.q) === COUNTED && noReprieve(r), '2 sheet: "This floor stays counted...", no reprieve: ' + r.q);
r = await lantern(p, 'Stay');
ok(r.q === 'The return lantern. ' + COUNTED && noReprieve(r), '2 lantern: its prefix, then "This floor stays counted...": ' + r.q);
r = await sheet(p, 'Leave the Hall');
ok(r.notes.length === 1 && r.notes[0] === COUNTED_NOTE, '2 left by the sheet: "You leave the Hall. This floor stays counted; ...": ' + JSON.stringify(r.notes));
await goIn(p);
w = await where(p);
ok(w.map === ENTRY[1] && w.visit && w.visit.floor === 1, '2 the next entry: the first floor not yet counted (the second): ' + JSON.stringify(w));
r = await sheet(p, 'Stay');
ok(sheetTail(r.q) === OPEN_SHEET, '2 on the second floor, not yet counted: the old wording: ' + r.q);
// back down to the counted first floor, then out: the next entry is still the first floor not yet counted
await p.evaluate(() => { RB.world.enter('hall.w1f1', 18, 22, 'down'); });
await settle(p);
w = await where(p);
ok(w.map === ENTRY[0] && w.visit && w.visit.floor === 0, '2 walked back down to the first floor: ' + JSON.stringify(w));
r = await lantern(p, 'Stay');
ok(r.q === 'The return lantern. ' + COUNTED, '2 lantern on the counted floor walked back to: "This floor stays counted...": ' + r.q);
r = await lantern(p, 'Return to the hearth');
ok(r.notes.length === 1 && r.notes[0] === COUNTED_NOTE, '2 left by the lantern from there: the counted notice: ' + JSON.stringify(r.notes));
await goIn(p);
w = await where(p);
ok(w.map === ENTRY[1] && w.visit && w.visit.floor === 1, '2 the next entry: the second floor again, not the first: ' + JSON.stringify(w));

// ---- the reprieve, on a floor not yet counted and on a counted one -----------------------------------------------------
await trials(p, ['t7']);
w = await where(p);
ok(w.visit && w.visit.reprieve === 1 && !w.floors[1], 'R the riddle stone: a reprieve, the second floor not yet counted: ' + JSON.stringify(w));
r = await sheet(p, 'Stay');
ok(r.q.endsWith(OPEN_SHEET + SHEET_REPRIEVE) && r.opts.join('|') === 'Leave the Hall|Use the reprieve: leave, keeping this floor|Suspend: close the game here|Stay', 'R sheet, not yet counted: the old wording, then the reprieve, as before: ' + r.q + ' / ' + r.opts.join(' / '));
r = await lantern(p, 'Stay');
ok(r.q === OPEN_LANTERN + LANTERN_REPRIEVE && r.opts.join('|') === 'Return to the hearth|Return keeping this floor (the reprieve)|Stay', 'R lantern, not yet counted: the old wording, then the reprieve, as before: ' + r.q + ' / ' + r.opts.join(' / '));
await trials(p, ['t4', 't5', 't6']);
w = await where(p);
ok(w.floors[1] === true && !w.tale && w.visit && w.visit.reprieve === 1, 'R the second floor counted, the reprieve still there: ' + JSON.stringify(w));
r = await sheet(p, 'Stay');
ok(sheetTail(r.q) === COUNTED + SHEET_REPRIEVE && r.opts.includes('Use the reprieve: leave, keeping this floor'), 'R sheet, counted: "This floor stays counted...", then the reprieve and its option: ' + r.q);
r = await lantern(p, 'Stay');
ok(r.q === 'The return lantern. ' + COUNTED + LANTERN_REPRIEVE && r.opts.includes('Return keeping this floor (the reprieve)'), 'R lantern, counted: its prefix, "This floor stays counted...", then the reprieve and its option: ' + r.q);
await p.evaluate(() => { RB.world.enter('hall.w1f2', 24, 22, 'left'); });
await settle(p);
const stood = await where(p);
r = await lantern(p, 'keeping');
ok(r.picked === 'Return keeping this floor (the reprieve)' && r.notes.length === 1 && r.notes[0] === KEEP_NOTE, 'R the reprieve spent at the lantern: its own notice, unchanged: ' + JSON.stringify(r.notes));
w = await where(p);
ok(!w.visit && w.held && w.map === 'hall.foyer', 'R out, the floor held: ' + JSON.stringify(w));
await goIn(p, true);
w = await where(p);
ok(w.map === stood.map && w.x === stood.x && w.y === stood.y && stood.x === 24 && w.visit && w.visit.floor === 1 && ['t4', 't5', 't6', 't7'].every((t) => w.visit.done.includes(t)) && w.visit.reprieve === 0 && !w.held,
  'R going back to where you left off: the very tile, with what you had done: ' + JSON.stringify(w) + ' (stood ' + JSON.stringify(stood) + ')');
r = await sheet(p, 'Leave the Hall');
ok(sheetTail(r.q) === COUNTED && noReprieve(r) && r.notes.length === 1 && r.notes[0] === COUNTED_NOTE, 'R from the held floor, its reprieve spent: "This floor stays counted...", left with the counted notice: ' + r.q + ' / ' + JSON.stringify(r.notes));
await goIn(p);
w = await where(p);
ok(w.map === ENTRY[2] && w.visit && w.visit.floor === 2 && !w.visit.practice, 'R the next entry: the third floor, the first not yet counted: ' + JSON.stringify(w));

// ---- 3. the last floor just counted: the tale complete -----------------------------------------------------------------
await trials(p, ['t8', 't9', 't10']);
w = await where(p);
ok(w.floors.length === 3 && w.floors.every(Boolean) && w.tale && w.visit && w.visit.floor === 2, '3 every floor counted, the tale complete, still on its last floor: ' + JSON.stringify(w));
r = await sheet(p, 'Stay');
ok(sheetTail(r.q) === COMPLETE && noReprieve(r), '3 sheet: "Every floor is counted: the tale is complete...": ' + r.q);
r = await lantern(p, 'Stay');
ok(r.q === 'The return lantern. ' + COMPLETE, '3 lantern: its prefix, then "Every floor is counted...": ' + r.q);
r = await sheet(p, 'Leave the Hall');
ok(r.notes.length === 1 && r.notes[0] === COMPLETE_NOTE, '3 left by the sheet: "You leave the Hall. The tale stays complete; ...": ' + JSON.stringify(r.notes));
await goIn(p);
w = await where(p);
ok(w.map === ENTRY[0] && w.visit && w.visit.floor === 0 && w.visit.practice && w.tale, '3 the next walk: from the first floor, through the finished tale: ' + JSON.stringify(w));

// ---- 4. a walk through the finished tale ---------------------------------------------------------------------------------
r = await sheet(p, 'Stay');
ok(/\(walking the tale again: nothing changes your records\)\. /.test(r.q) && sheetTail(r.q) === COMPLETE, '4 sheet, walking it again: the walk noted, then "Every floor is counted...": ' + r.q);
r = await lantern(p, 'Stay');
ok(r.q === 'The return lantern. ' + COMPLETE, '4 lantern, walking it again: "Every floor is counted...": ' + r.q);
await trials(p, ['t1', 't2', 't3']);
w = await where(p);
ok(w.visit && w.visit.practice && ['t1', 't2', 't3'].every((t) => w.visit.done.includes(t)), '4 the first floor\'s trials done again on the walk: ' + JSON.stringify(w));
r = await sheet(p, 'Stay');
ok(sheetTail(r.q) === COMPLETE, '4 sheet, that floor done again: still the completed wording, not the floor\'s: ' + r.q);
r = await lantern(p, 'Return to the hearth');
ok(r.q === 'The return lantern. ' + COMPLETE && r.notes.length === 1 && r.notes[0] === COMPLETE_NOTE, '4 lantern: "Every floor is counted...", left with "The tale stays complete; ...": ' + r.q + ' / ' + JSON.stringify(r.notes));
await goIn(p);
w = await where(p);
ok(w.map === ENTRY[0] && w.visit && w.visit.floor === 0 && w.visit.practice && w.visit.done.length === 0, '4 the next walk: from the first floor again: ' + JSON.stringify(w));

ok(errors.length === 0, 'no page errors (console errors included): ' + errors.join(' | '));
await p.close();
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
