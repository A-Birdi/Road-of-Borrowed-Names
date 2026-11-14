// The wing card's rule about leaving (Agnes 6870214603's text; Local CL-820; Cloud CC-586), after Batch 2's row 2 made
// the sheet, the return lantern and the notice say what leaving does once a floor is counted. In Chromium on the built
// game, a throwaway journey after the story (slot 4 of a fresh browser context, never a player's saves), Wing 1. The
// card is opened at the hearth (RB.ui.hall.card, as the door's scene opens it), in five states: a new wing; part done
// with nothing counted; a floor counted; a floor held by a reprieve; the tale finished. Each time:
//  - the Rules list holds the new line in place of the old one, and the other six rules word for word as before;
//  - the buttons are as before for that state (Go in, Walk the tale again, or Go back to where you left off with Start
//    the floor afresh), with Not now; the route and tactics choices are there, with the wing's own choice checked;
//  - Not now closes the card and starts nothing (0); in two states the card's other button answers as before (Go in 1,
//    Go back to where you left off 2), and a route chosen on the card is kept.
// Progress is set with the game's own hooks (going in, counting trials, leaving), not by playing the scenes. No page
// errors.
// Usage: node tools/build.mjs && node tests/e2e/hall_card_rules.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

const NEW = 'You can leave at any time outside a battle. If you leave without using a reprieve, an uncounted floor starts again; counted floors stay done. For a finished tale, leaving without a reprieve means the next walk starts from the first floor.';
const OLD = 'You can leave at any time outside a battle: the floor you were on starts again next time.';
const RULES = [
  'Resolve carries from encounter to encounter in a wing (what mistakes cost always comes back).',
  'A floor\'s trials count once every trial on it is done; from then on they stay done.',
  'Defeat starts the current floor again; earlier floors stay done.',
  NEW,
  'Some trials earn a reprieve: leave with the floor kept exactly as it is.',
  'You can suspend anywhere outside a battle and resume exactly there.',
  'Every creature is in plain sight. Help is always there, and nothing gets harder after a mistake.',
];
const RADIOS = ['route:consolidate', 'route:grow', 'tactics:relaxed', 'tactics:normal', 'tactics:hard'];

async function start(p) {
  await p.evaluate(() => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true, ngp_offered: true };
    const s = RB.game.debugStart('hall.foyer', 40, 14, { comp: 'mio', flags: done });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.save.setCurrent(4, 0);
  });
}
async function settle(p) {
  for (let i = 0; i < 60 && await p.evaluate(() => RB.game.mode() !== 'world'); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(80); }
  await p.waitForTimeout(300);
}
const goIn = async (p, held) => { await p.evaluate(async (held) => { await RB.ui.hall.goIn('w1', held); }, !!held); await settle(p); };
const trials = async (p, ids) => { for (const t of ids) await p.evaluate(async (t) => { await RB.hooks.hall_trial(['w1', t]); }, t); await settle(p); };
const leave = async (p, keep) => { await p.evaluate(async (keep) => { await RB.ui.hall.leave(keep); }, !!keep); await settle(p); };
// the card at the hearth: what it shows, then answered by a button
async function card(p, press, also) {
  await p.evaluate(() => { window.__card = undefined; RB.ui.hall.card('w1').then((v) => { window.__card = v; }); });
  await p.waitForSelector('.hall-card', { timeout: 5000 });
  const seen = await p.evaluate(() => ({
    rules: [...document.querySelectorAll('.hall-card .xp-rules li')].map((x) => x.textContent),
    buttons: [...document.querySelectorAll('.hall-folio .sg-acts [data-a]')].map((x) => x.getAttribute('data-a') + ':' + x.textContent.trim()),
    radios: [...document.querySelectorAll('.hall-card input[type=radio]')].map((x) => x.name + ':' + x.value),
    checked: [...document.querySelectorAll('.hall-card input[type=radio]:checked')].map((x) => x.name + ':' + x.value),
    choice: RB.hall.choice(RB.game.s, 'w1'),
  }));
  if (also) await also();
  await p.click('.hall-folio [data-a=' + press + ']');
  await p.waitForFunction(() => window.__card !== undefined, null, { timeout: 5000 });
  seen.result = await p.evaluate(() => window.__card);
  seen.open = await p.evaluate(() => !!document.querySelector('.hall-card'));
  seen.inWing = await p.evaluate(() => !!RB.hall.visitOf(RB.game.s));
  seen.after = await p.evaluate(() => RB.hall.choice(RB.game.s, 'w1'));
  return seen;
}
const rulesOk = (c) => c.rules.length === 7 && c.rules.every((x, i) => x === RULES[i]) && c.rules.indexOf(OLD) < 0;
const choicesOk = (c) => flat(c.radios) === flat(RADIOS) && flat(c.checked) === flat(['route:' + c.choice.route, 'tactics:' + c.choice.tactics]);
const where = (p) => p.evaluate(() => { const v = RB.hall.visitOf(RB.game.s), P = RB.world.W.player; return { map: RB.world.W.map.id, x: P.x, y: P.y, floor: v ? v.floor : null }; });

const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
await start(p);

// 1. a new wing
let c = await card(p, 'no');
ok(rulesOk(c), '1 new: the Rules list holds the new line, the other six as before ' + flat(c.rules[3]));
ok(flat(c.buttons) === flat(['go:Go in', 'no:Not now']) && choicesOk(c), '1 new: Go in and Not now; the route and tactics choices, the wing\'s own checked ' + flat({ buttons: c.buttons, checked: c.checked }));
ok(c.result === 0 && !c.open && !c.inWing, '1 new: Not now closes the card and starts nothing ' + flat({ result: c.result, open: c.open, inWing: c.inWing }));

// 2. part done, nothing counted (one trial done, then left)
await goIn(p);
await trials(p, ['t2']);
await leave(p);
c = await card(p, 'no');
ok(rulesOk(c) && flat(c.buttons) === flat(['go:Go in', 'no:Not now']) && choicesOk(c) && c.result === 0 && !c.inWing,
  '2 part done, nothing counted: the new line, the other rules as before; Go in, Not now; Not now starts nothing ' + flat({ buttons: c.buttons, result: c.result }));

// 3. a floor counted; Go in, with Grow chosen on the card
await goIn(p);
await trials(p, ['t1', 't2', 't3']);
await leave(p);
c = await card(p, 'go', () => p.click('.hall-card input[name=route][value=grow]'));
await settle(p);
ok(rulesOk(c) && flat(c.buttons) === flat(['go:Go in', 'no:Not now']) && choicesOk(c), '3 a floor counted: the new line, the other rules as before; Go in, Not now; the choices ' + flat({ buttons: c.buttons }));
ok(c.result === 1 && !c.open && c.after.route === 'grow', '3 Go in answers as before (1), and Grow chosen on the card is kept ' + flat({ result: c.result, after: c.after }));

// 4. a floor held by a reprieve (the riddle stone, then kept on leaving); Go back to where you left off
await goIn(p, false);
await trials(p, ['t7']);
await p.evaluate(() => { RB.world.enter('hall.w1f2', 24, 22, 'left'); });
await settle(p);
const stood = await where(p);
await leave(p, true);
c = await card(p, 'held');
ok(rulesOk(c) && flat(c.buttons) === flat(['held:Go back to where you left off', 'go:Start the floor afresh', 'no:Not now']) && choicesOk(c),
  '4 a floor held: the new line, the other rules as before; Go back to where you left off, Start the floor afresh, Not now; the choices ' + flat({ buttons: c.buttons }));
ok(c.result === 2 && !c.open, '4 Go back to where you left off answers as before (2) ' + flat({ result: c.result }));
await goIn(p, true);
const back = await where(p);
ok(back.map === stood.map && back.x === stood.x && back.y === stood.y, '4 and going back puts you on the very tile ' + flat({ back, stood }));

// 5. the tale finished (every floor counted), then left
await trials(p, ['t4', 't5', 't6']);
await leave(p);
await goIn(p);
await trials(p, ['t8', 't9', 't10']);
await leave(p);
const tale = await p.evaluate(() => !!RB.hall.peek(RB.game.s, 'w1').done);
c = await card(p, 'no');
ok(tale && rulesOk(c) && flat(c.buttons) === flat(['go:Walk the tale again', 'no:Not now']) && choicesOk(c) && c.result === 0 && !c.inWing,
  '5 the tale finished: the new line, the other rules as before; Walk the tale again, Not now; Not now starts nothing ' + flat({ tale, buttons: c.buttons, result: c.result }));

ok(errors.length === 0, 'no page errors (console errors included): ' + errors.join(' | '));
await p.close();
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
