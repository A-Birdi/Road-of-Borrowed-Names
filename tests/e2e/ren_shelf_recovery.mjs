// Ren's shelf after a save made partway through it (Local CL-889, CL-890 option A; Cloud CC-645; Agnes 6945102589):
// the reveal is written to the journey at its start (the face taken back, or left; the quest done) before it is shown,
// so a save made during it and loaded later held the outcome with the reveal unseen, and every later use of the shelf
// went to its "after" line. Two guarded jumps at the scene's head now replay the rest of the chosen branch while the
// scene is unseen and Ren travels with you; the state lines before them are not run again. A replay from the branch's
// start, never an exact resume. In Chromium on the built game, on throwaway journeys in a fresh browser context each
// (never a real save):
//  - played: the journey to the Archive made directly in the Conduits (synthetic), then the Memories room entered
//    through the game's own map transition so its first-entry scene calls the shelf with Ren; choices picked by the
//    test helper by their words, the reading answered by it;
//  - interrupted for real: at a chosen line, once it is on screen, the scene is held, and the journey saved through the
//    player's own way in:
//    the dialogue's History button, the Ledger's Save & Load, "Save this journey", a slot's "Save here"; Escape back to
//    the dialogue, and the scene goes on to its end;
//  - loaded for real: the Ledger button in the world, Save & Load, "Load a journey", the slot's Load, and Load in its
//    confirmation;
//  - the shelf used where it stands (RB.test.use: next to it, then the game's own interact, what OK does).
// Each use of the shelf is recorded: the lines said, the choices offered, quest-complete banners, and the reading's
// learning records (RB.game.s.learn.items) relative to the journey as it was just before that use.
//  R1 took, saved early (at "Ren opens the folio.", before the reading): loaded, the shelf replays the folio, the face,
//     the reading and Ren's lines; no choice, no quest banner; the reading's record goes from the loaded save's value
//     (none) to one; seen at the end; the flags as loaded.
//  R2 took, saved later (at "…Smiling. My teacher was smiling, then.", after the reading): the same replay from the
//     folio's opening; the loaded save already holds the reading's record, and the replay adds one more.
//  R3 left (saved at "…Yes. The lessons are all here."): Ren's three lines again, no choice, no banner, seen.
//  R4 repeated: R1's save loaded, the recovery itself saved at "Ren opens the folio." and loaded: a second full replay,
//     still no banner, seen at the end.
//  R5 a finished scene's revisit (no interruption): the shelf's "after" line only.
//  R6 a first, uninterrupted run ("You decide"): one quest banner, one reading record, seen.
//  R7 Nao: "Don't open it", saved at Nao's line after the choice, loaded: the shelf's "after" line only (no Ren branch).
// Every lane prints what it read, to compare with the parent's page (RB_PAGE); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ren_shelf_recovery.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'ch5_done', 'sa_arrived', 'sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left'];
const L = {
  open: /^Ren opens the folio\./,
  face: /^On the paper, a face surfaces\./,
  smiling: /^…Smiling\. My teacher was smiling, then\./,
  glasses: /^Ren takes off their glasses/,
  hand: /^…That's my teacher's hand\./,
  lessons: /^…Yes\. The lessons are all here\./,
  someday: /^Someday I'll come back for it\./,
  after: /^Ren's shelf\. The writing on the label/,
  naoDeliver: /^Deliveries are my speciality\./,
};
const has = (said, re) => said.some((x) => re.test(x));

async function start(p, o) {
  await p.evaluate(async ({ BASE, o }) => {
    const f = {};
    for (const k of BASE) f[k] = true;
    RB.game.settings.textSpeed = 'instant';
    const s = RB.game.debugStart('sa.conduits', 1, 17, { comp: o.comp, dir: 'left', edition: 2, flags: f });
    s.seen['sa.conduits_enter'] = true; s.flags['enter:sa.conduits:sa.conduits_enter'] = true;
    s.quests.ren_ushio = { stage: 1, done: false, t: 1 };
    s.quests.sa_main = { stage: 3, done: false, t: 2 };
    const pick = new RegExp(o.pick);
    RB.test.enable({ choose: (opts) => { const i = opts.findIndex((x) => pick.test(x.en || '')); return i < 0 ? 0 : i; } });
    // what each use of the shelf shows: lines, choices offered, quest-complete banners
    window.__said = []; window.__banners = 0; window.__hold = []; window.__held = null;
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = async function (l) {
      const en = (l && l.en) || '';
      if (l) window.__said.push(en);
      const r = await say.apply(this, arguments);
      // held while that line is on screen (shown, the box up), as a player stopping there would be
      const h = window.__hold[0];
      if (h && new RegExp(h).test(en)) {
        window.__hold.shift();
        await new Promise((res) => { window.__release = res; window.__held = en; });
      }
      return r;
    };
    const toast = RB.ui.toast;
    RB.ui.toast = function (t) { if (t && t.kind === 'quest_done') window.__banners++; return toast.apply(this, arguments); };
  }, { BASE, o });
}
const state = (p) => p.evaluate(() => {
  const s = RB.game.s;
  // the reading's own record (the lane's tier asks c:sa_ren; RB.learn.record raises its `seen` once per completion)
  return { map: s.map, mode: RB.game.mode(), took: !!s.flags.sa_ren_took, left: !!s.flags.sa_ren_left, decided: !!s.flags.sa_ren_decided, carried: !!s.flags.sa_ren_carried,
    seen: !!s.seen['sa.shelf_ren'], done: !!(s.quests.ren_ushio && s.quests.ren_ushio.done), reading: (s.learn.items['c:sa_ren'] || {}).seen || 0 };
});
const reset = (p) => p.evaluate(() => { window.__said = []; window.__banners = 0; window.__choices0 = RB.test.log.filter((x) => x.t === 'choice').length; });
const read = (p) => p.evaluate(() => ({ said: window.__said.slice(), banners: window.__banners, choices: RB.test.log.filter((x) => x.t === 'choice').length - (window.__choices0 || 0) }));
const idle = (p) => p.evaluate(async () => { for (let i = 0; i < 160 && RB.script.isRunning(); i++) await new Promise((r) => setTimeout(r, 250)); await RB.test.idle(30000); });
// the journey saved through the player's own way in, while the scene is held at a line
async function uiSave(p, slot) {
  await p.click('.dlg button:has-text("History")');
  await p.waitForTimeout(900);
  await p.click('.ledger-save');
  await p.waitForTimeout(500);
  await p.click('.sv-opt[data-a="save"]');
  await p.waitForTimeout(900);
  await p.click('.folio-ledger .rec[data-slot="' + slot + '"] [data-a="save"]');
  await p.waitForTimeout(900);
  const saved = await p.evaluate(async (slot) => { const l = await RB.save.list(); return !!(l[slot - 1] && !l[slot - 1].empty); }, slot);
  for (let i = 0; i < 5 && await p.evaluate(() => RB.ui.menu.isOpen() || RB.game.mode() !== 'dialogue'); i++) { await p.keyboard.press('Escape'); await p.waitForTimeout(500); }
  return { saved, mode: await p.evaluate(() => RB.game.mode()) };
}
// ... and loaded the same way, from the world (an empty slot is reported, not clicked)
async function uiLoad(p, slot) {
  const filled = await p.evaluate(async (slot) => { const l = await RB.save.list(); return !!(l[slot - 1] && !l[slot - 1].empty); }, slot);
  if (!filled) return Object.assign({ missing: true }, await state(p));
  await p.click('.menu-b');
  await p.waitForTimeout(900);
  await p.click('.ledger-save');
  await p.waitForTimeout(500);
  await p.click('.sv-opt[data-a="load"]');
  await p.waitForTimeout(900);
  await p.click('.folio-ledger .rec[data-slot="' + slot + '"] [data-a="load"]');
  await p.waitForTimeout(700);
  await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && x.textContent.trim() === 'Load'); const bt = bs[bs.length - 1]; if (bt) bt.click(); });
  await p.waitForTimeout(2000);
  await idle(p);
  return state(p);
}
// play until the scene is held at `re` (or ends), save there to `slot` through the UI, then let it finish
async function holdSave(p, run, re, slot) {
  await p.evaluate((src) => { window.__hold.push(src); window.__held = null; }, re.source);
  // (the helper that starts the scene waits at most 20 s for the world again; a scene held here for the save outlasts
  // that, so its own wait may give up: the scene itself goes on, and the wait below covers its end)
  const t0 = Date.now();
  const going = run().then(() => null, (e) => String(e && e.message || e).split('\n')[0]);
  let held = null;
  for (let i = 0; i < 150 && !(held = await p.evaluate(() => window.__held)); i++) await p.waitForTimeout(200);
  const tHeld = Date.now() - t0;
  const at = held ? await state(p) : null;
  const sv = held ? await uiSave(p, slot) : null;
  const tSaved = Date.now() - t0;
  await p.evaluate(() => { if (window.__release) window.__release(); window.__release = null; });
  const helper = await going;
  await idle(p);
  return { held, at, sv, ms: { held: tHeld, saved: tSaved, end: Date.now() - t0 }, helper };
}
const enterRoom = (p) => p.evaluate(async () => { await new Promise((r) => setTimeout(r, 1200)); await RB.test.go('sa.memories', 21, 9, 'left'); });
const useShelf = (p) => p.evaluate(async () => { await RB.test.use(4, 6); });
async function fresh() { const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } }); return { p, errors }; }
// each lane in its own context; a lane that stops early is a failure, and the next lane still runs
async function lane(name, fn) {
  const { p, errors } = await fresh();
  try { await fn(p, errors); } catch (e) { ok(false, name + ' stopped early: ' + String(e && e.message || e).split('\n')[0]); }
  await p.context().close();
}
async function useAndRead(p) { await reset(p); const before = await state(p); await useShelf(p); await idle(p); const r = await read(p); const after = await state(p); return { before, after, ...r }; }
const recovered = (u) => has(u.said, L.open) && has(u.said, L.face) && has(u.said, L.smiling) && has(u.said, L.glasses) && !has(u.said, L.hand) && !has(u.said, L.after) && u.choices === 0 && u.banners === 0;

// R1 + R4: took, saved early; then the recovery itself interrupted and loaded again
await lane('R1/R4', async (p, errors) => {
  await start(p, { comp: 'ren', pick: '^Take it back' });
  const h = await holdSave(p, () => enterRoom(p), L.open, 2);
  const first = await state(p);
  console.log('     R1 held ' + J(h.held) + ' at ' + J(h.at) + ' saved ' + J(h.sv) + ' first run ends ' + J(first));
  ok(h.held && h.at.took && h.at.done && !h.at.seen && h.sv && h.sv.saved && h.sv.mode === 'dialogue' && first.seen && first.reading === 1, 'R1 the first run held at "Ren opens the folio." and saved there through the Ledger; the scene then finished (one reading record)');
  const loaded = await uiLoad(p, 2);
  const u = await useAndRead(p);
  console.log('     R1 loaded ' + J(loaded) + ' shelf ' + J({ banners: u.banners, choices: u.choices, lines: u.said.length, after: u.after }));
  ok(loaded.mode === 'world' && loaded.took && loaded.done && !loaded.seen && loaded.reading === 0, 'R1 the early save, loaded through the Ledger: taken back, quest done, the scene unseen, no reading record yet ' + J(loaded));
  ok(recovered(u), 'R1 the shelf replays the folio, the face, the reading and Ren\'s lines; no choice, no quest banner, not the "after" line');
  ok(u.after.seen && u.after.took && u.after.decided && u.after.done && u.after.reading === u.before.reading + 1, 'R1 after it: seen, the flags and the quest as loaded, the reading\'s record one more than the loaded save\'s (' + u.before.reading + ' -> ' + u.after.reading + ')');
  // R4: the early save again, the recovery saved at the same line, loaded, the shelf once more
  await uiLoad(p, 2);
  await reset(p);
  const h2 = await holdSave(p, () => useShelf(p), L.open, 3);
  const r2a = await read(p);
  const loaded2 = await uiLoad(p, 3);
  const u2 = await useAndRead(p);
  console.log('     R4 held ' + J(h2.held) + ' ' + J({ ms: h2.ms, helper: h2.helper }) + ' at ' + J(h2.at) + ' loaded ' + J(loaded2) + ' shelf ' + J({ banners: u2.banners, choices: u2.choices, lines: u2.said.length, after: u2.after }));
  ok(h2.held && h2.sv && h2.sv.saved && r2a.banners === 0 && r2a.choices === 0, 'R4 the recovery itself held at "Ren opens the folio." and saved there; it finished without a banner or a choice');
  ok(!loaded2.missing && loaded2.took && loaded2.done && !loaded2.seen && recovered(u2) && u2.after.seen && u2.after.reading === u2.before.reading + 1, 'R4 that save loaded: the shelf replays the whole branch again, no banner, seen at the end, one more reading record than the loaded save\'s (' + u2.before.reading + ' -> ' + u2.after.reading + ')');
  ok(errors.length === 0, 'R1/R4 no page errors ' + J(errors.slice(0, 3)));
});

// R2: took, saved after the reading
await lane('R2', async (p, errors) => {
  await start(p, { comp: 'ren', pick: '^Take it back' });
  const h = await holdSave(p, () => enterRoom(p), L.smiling, 2);
  console.log('     R2 held ' + J(h.held) + ' at ' + J(h.at));
  ok(h.held && h.at.took && !h.at.seen && h.at.reading === 1 && h.sv && h.sv.saved, 'R2 the first run held at "…Smiling. My teacher was smiling, then." (after the reading: one record) and saved there');
  const loaded = await uiLoad(p, 2);
  const u = await useAndRead(p);
  console.log('     R2 loaded ' + J(loaded) + ' shelf ' + J({ banners: u.banners, choices: u.choices, after: u.after }));
  ok(loaded.took && !loaded.seen && loaded.reading === 1 && recovered(u), 'R2 loaded (the reading\'s record already 1): the shelf replays from the folio\'s opening, the reading again; no choice, no banner');
  ok(u.after.seen && u.after.reading === u.before.reading + 1, 'R2 after it: seen, and the reading\'s record one more than the loaded save\'s (' + u.before.reading + ' -> ' + u.after.reading + ')');
  ok(errors.length === 0, 'R2 no page errors ' + J(errors.slice(0, 3)));
});

// R3: left, saved at Ren's first line after the choice
await lane('R3', async (p, errors) => {
  await start(p, { comp: 'ren', pick: '^Leave it' });
  const h = await holdSave(p, () => enterRoom(p), L.lessons, 2);
  const first = await state(p);
  ok(h.held && h.at.left && h.at.done && !h.at.seen && h.sv && h.sv.saved && first.seen, 'R3 the first run held at "…Yes. The lessons are all here." and saved there; the scene then finished');
  const loaded = await uiLoad(p, 2);
  const u = await useAndRead(p);
  console.log('     R3 loaded ' + J(loaded) + ' shelf ' + J({ said: u.said, banners: u.banners, choices: u.choices, after: u.after }));
  ok(loaded.left && !loaded.took && loaded.done && !loaded.seen && has(u.said, L.lessons) && has(u.said, L.someday) && !has(u.said, L.hand) && !has(u.said, L.after) && u.choices === 0 && u.banners === 0, 'R3 loaded: the shelf says Ren\'s three lines again; no choice, no banner, not the "after" line');
  ok(u.after.seen && u.after.left && !u.after.took && u.after.reading === u.before.reading, 'R3 after it: seen, still left, no reading (' + u.after.reading + ')');
  ok(errors.length === 0, 'R3 no page errors ' + J(errors.slice(0, 3)));
});

// R5 + R6: a first, uninterrupted run ("You decide"), then the finished scene's revisit
await lane('R5/R6', async (p, errors) => {
  await start(p, { comp: 'ren', pick: '^You decide' });
  await reset(p);
  await enterRoom(p);
  await idle(p);
  const r = await read(p), st = await state(p);
  console.log('     R6 first run ' + J({ banners: r.banners, choices: r.choices, st }));
  ok(has(r.said, L.hand) && has(r.said, L.open) && has(r.said, L.glasses) && r.choices === 1 && r.banners === 1 && st.seen && st.took && st.reading === 1, 'R6 a first, uninterrupted run: Ren\'s lines before the choice, one choice, one quest banner, the reveal, one reading record, seen');
  const u = await useAndRead(p);
  console.log('     R5 revisit ' + J({ said: u.said, banners: u.banners, choices: u.choices }));
  ok(u.said.length === 1 && has(u.said, L.after) && u.banners === 0 && u.choices === 0 && u.after.reading === u.before.reading, 'R5 the finished scene revisited: the "after" line only, as before');
  ok(errors.length === 0, 'R5/R6 no page errors ' + J(errors.slice(0, 3)));
});

// R7: Nao, "Don't open it", saved partway, loaded: the shelf's "after" line, as before
await lane('R7', async (p, errors) => {
  await start(p, { comp: 'nao', pick: '^Don\'t open it' });
  await enterRoom(p);
  await idle(p);
  await reset(p);
  const h = await holdSave(p, () => useShelf(p), L.naoDeliver, 2);
  const loaded = await uiLoad(p, 2);
  const u = await useAndRead(p);
  console.log('     R7 held ' + J(h.held) + ' loaded ' + J(loaded) + ' shelf ' + J({ said: u.said, banners: u.banners }));
  ok(h.held && h.sv && h.sv.saved && loaded.carried && !loaded.took && !loaded.seen && u.said.length === 1 && has(u.said, L.after) && u.choices === 0 && u.after.seen, 'R7 Nao saved after "Don\'t open it", loaded: the shelf\'s "after" line only, as before');
  ok(errors.length === 0, 'R7 no page errors ' + J(errors.slice(0, 3)));
});

console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
