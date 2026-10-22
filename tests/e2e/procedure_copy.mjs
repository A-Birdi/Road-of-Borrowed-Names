// RBN-QA-112 (Agnes 6344362652; Local CL-207): the room allocation's footer said "A wrong step sends the machine
// back", and the Step away confirm "The machine stays as you leave it", on every procedure: the front desk, the
// spring cooking and the Hall's trials are not machines, and in a 'stable' procedure a wrong action does not send
// the whole thing back. In Chromium on the built game, every procedure in the game that opens on its own sheet,
// opened as the game opens it (the five led by a battle, the guardians', the moss on the steps and the two bosses',
// are fought on the battle screen, which has none of these words; the line for a wrong step, which they share, is in
// the unit test):
//  1. the footer: "A wrong action may undo progress; a language mistake only means trying again." (Agnes 6345961972);
//  2. the section that shows where it stands is labelled "Where things stand" for a screen reader;
//  3. Step away asks "Step away? It stays as you leave it; you can come back whenever you like."; Stay keeps you
//     there, and Step away leaves;
//  4. none of the screen's own words (footer, labels, the Step away confirm) says "machine";
//  4b. a procedure that does not keep its place (none in the game today; one made for the test) says instead "Step
//      away? Next time, this starts again from the beginning.";
//  5. no page errors.
// (What a wrong action undoes, per restart, and the line for a wrong step with no words of its own:
// tests/unit/procedure_copy.test.mjs.)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const FOOT = 'A wrong action may undo progress; a language mistake only means trying again.';
const AWAY = 'Step away? It stays as you leave it; you can come back whenever you like.';

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 860 } });
await p.evaluate(() => { RB.game.debugStart('rw.millroad', 10, 22, {}); RB.game.settings.textSpeed = 'instant'; });
await p.waitForTimeout(600);
const all = await p.evaluate(() => Object.keys(RB.content.encounters).filter((id) => RB.content.encounters[id].procedure).sort());
const led = await p.evaluate(() => Object.keys(RB.content.encounters).filter((id) => RB.content.encounters[id].procedure && RB.content.encounters[id].lead).sort());
const ids = all.filter((id) => !led.includes(id));
const footBad = [], labelBad = [], awayBad = [], wordBad = [], openBad = [];
for (const id of ids) {
  // (each from the world: should anything leave the game elsewhere, start that one again from a fresh journey)
  const inWorld = await p.evaluate(() => RB.game.mode() === 'world' && !document.querySelector('.enc-sheet')).catch(() => false);
  if (!inWorld) { await p.evaluate(() => { RB.game.debugStart('rw.millroad', 10, 22, {}); RB.game.settings.textSpeed = 'instant'; }); await p.waitForTimeout(800); }
  await p.evaluate((id) => { window.__res = null; RB.game.startEncounter(id, {}).then((r) => { window.__res = r; }); }, id);
  const opened = await p.waitForSelector('.enc-sheet .enc-card', { timeout: 15000 }).then(() => true).catch(() => false);
  if (!opened) { openBad.push(id + ' (mode ' + (await p.evaluate(() => RB.game.mode()).catch(() => '?')) + ')'); continue; }
  const r = await p.evaluate(() => {
    const sheet = document.querySelector('.enc-sheet');
    const foot = [...sheet.querySelectorAll('.muted.small')].map((x) => x.textContent.trim()).find((t) => /wrong/i.test(t)) || '';
    const sec = sheet.querySelector('.enc-machine');
    const labels = [...sheet.querySelectorAll('[aria-label]')].map((x) => x.getAttribute('aria-label'));
    return { foot, label: sec && sec.getAttribute('aria-label'), labels };
  });
  if (r.foot !== FOOT) footBad.push({ id, foot: r.foot });
  if (r.label !== 'Where things stand') labelBad.push({ id, label: r.label });
  if (/machine/i.test(r.foot + ' ' + r.labels.join(' '))) wordBad.push({ id, where: 'footer or labels', labels: r.labels });
  // Step away: the confirm's words; Stay keeps you here; then Step away leaves
  await p.click('.enc-sheet [data-away]');
  await p.waitForSelector('.csheet', { timeout: 5000 });
  const q = await p.evaluate(() => (document.querySelector('.csheet .q') || document.querySelector('.csheet')).textContent.trim());
  if (q !== AWAY) awayBad.push({ id, q });
  if (/machine/i.test(q)) wordBad.push({ id, where: 'step away', q });
  await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].find((y) => /^\s*Stay\s*$/.test(y.textContent)).click());
  await p.waitForTimeout(250);
  const stayed = await p.evaluate(() => !!document.querySelector('.enc-sheet .enc-card') && !window.__res);
  await p.click('.enc-sheet [data-away]');
  await p.waitForSelector('.csheet', { timeout: 5000 });
  await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].find((y) => /^\s*Step away\s*$/.test(y.textContent)).click());
  const left = await p.waitForFunction(() => window.__res, null, { timeout: 10000 }).then(() => true).catch(() => false);
  if (!stayed || !left) awayBad.push({ id, stayed, left });
  for (let i = 0; i < 40 && await p.evaluate(() => RB.ui.dialogue.isOpen() || RB.game.mode() !== 'world'); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); }
}
// a procedure that does not keep its place (none in the game today): Step away says so instead (Agnes 6345961972)
await p.waitForFunction(() => RB.game.mode() === 'world' && !document.querySelector('.enc-sheet') && !RB.ui.dialogue.isOpen(), null, { timeout: 15000 }).catch(() => {});
const started = await p.evaluate(() => {
  const d = JSON.parse(JSON.stringify(RB.content.encounters['fx.sluice']));
  d.id = 'fx.sluice_nokeep'; d.procedure.id = 'fx_sluice_nokeep'; d.procedure.keep = false;
  RB.content.encounters['fx.sluice_nokeep'] = d;
  window.__res = null; window.__nk = 'pending';
  RB.game.startEncounter('fx.sluice_nokeep', {}).then((r) => { window.__res = r; window.__nk = r ? 'done' : 'not started'; });
  return RB.game.mode();
});
let noKeep = null;
if (await p.waitForSelector('.enc-sheet .enc-card', { timeout: 15000 }).then(() => true).catch(() => false)) {
  await p.click('.enc-sheet [data-away]');
  await p.waitForSelector('.csheet', { timeout: 5000 });
  noKeep = await p.evaluate(() => (document.querySelector('.csheet .q') || document.querySelector('.csheet')).textContent.trim());
  await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].find((y) => /^\s*Step away\s*$/.test(y.textContent)).click());
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 }).catch(() => {});
} else noKeep = 'did not open (mode ' + started + ', ' + (await p.evaluate(() => window.__nk)) + ')';
ok(all.length >= 27 && led.join() === 'gd.ko,gd.rw,kr.moss_steps,mb.boss,mp.boss' && ids.length === all.length - led.length && !openBad.length, `every procedure on its own sheet opens (${ids.length} of ${all.length}; led by a battle: ${led.join(', ')})` + (openBad.length ? ': not opened ' + openBad.join(', ') : ''));
ok(!footBad.length, `the footer on each: "${FOOT}"` + (footBad.length ? ' (' + JSON.stringify(footBad.slice(0, 4)) + ')' : ''));
ok(!labelBad.length, 'the section is "Where things stand" to a screen reader' + (labelBad.length ? ' (' + JSON.stringify(labelBad.slice(0, 4)) + ')' : ''));
ok(!awayBad.length, `Step away asks "${AWAY}"; Stay keeps you there, Step away leaves` + (awayBad.length ? ' (' + JSON.stringify(awayBad.slice(0, 4)) + ')' : ''));
ok(!wordBad.length, 'none of the screen\'s own words says "machine"' + (wordBad.length ? ' (' + JSON.stringify(wordBad.slice(0, 4)) + ')' : ''));
ok(noKeep === 'Step away? Next time, this starts again from the beginning.', 'a procedure that does not keep its place says so: "' + noKeep + '"');
ok(errors.length === 0, 'no page errors' + (errors.length ? ' (' + errors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
