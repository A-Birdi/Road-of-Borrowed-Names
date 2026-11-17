// QA-207: Ren's Company biography after the teacher's face is taken back (Agnes 6942984231; Local CL-887, CL-888; Cloud
// CC-640). In Chromium on the built game, on throwaway journeys in a fresh browser context each (never a real save), the
// Companion page read where the player reads it: the Ledger opened on Company > Companion (RB.ui.menu.open), its
// "What you know of …" list read from the page.
// Played (the scene's own order, from the Archive's Memories room, sa.memories; the journey made directly in the
// Conduits beside it, then the room entered through the game's own map transition so its own first-entry scene calls
// Ren's shelf; the choice picked by the test helper by its words, the reading after the face answered by the helper):
//  P1. Ren, "You decide" (the reported branch): mid-scene, at "Ren opens the folio." (after the flags are set, before
//      the face): the page read in the Ledger and the journey saved there through the game's own save; after the
//      scene: the bullet gone, "Took back the teacher's face…" shown; saved and loaded through the game's own save and
//      load: the same; the mid-scene save loaded: the same bullets (what the load does with the unfinished scene is
//      not looked at here: a separate characterization);
//  P2. Ren, "Take it back": after the scene, the bullet gone;
//  P3. Ren, "Leave it": after the scene, the bullet shown with "Left the teacher's face on the Archive shelf…"; saved
//      and loaded: the same;
//  P4. Nao, the shelf used, "Don't open it. Take it home to Ren.": Nao's own page, nothing of Ren's.
// Synthetic (the flags set directly, the room's first-entry scene marked seen so nothing plays; each also saved and
// loaded through the game's own save and load):
//  S1 before the shelf; S2 taken back, mid-scene (flags, not seen); S3 taken back, seen; S4 left; S5 carried home
//  with Nao: Nao's page.
// Every lane prints a fingerprint of the list it read, to compare with the parent's page (RB_PAGE); no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ren_face_bio.mjs
import { createHash } from 'node:crypto';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const fp = (x) => createHash('sha256').update(J(x)).digest('hex').slice(0, 12);
const FACE = 'Remembers every word Master Ushio taught, but not the teacher\'s face.';
const TOOK = /^Took back the teacher's face at the Archive/;
const LEFT = /^Left the teacher's face on the Archive shelf/;
const BASE = ['departed', 'ch1_done', 'ch2_done', 'ch3_done', 'ch4_done', 'ch5_done', 'sa_arrived', 'sa_ushio_found', 'sa_met_kasane', 'sa_kasane_left'];

async function start(p, o) {
  await p.evaluate(async ({ BASE, o }) => {
    const f = {};
    for (const k of BASE.concat(o.flags || [])) f[k] = true;
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.suzuSpeech = 'standard';
    // (played lanes start in the Conduits beside the room and go in through the game's own map transition, as its exit
    // does, so the room's first-entry scene plays; a debug start runs no entry scene)
    const s = o.play ? RB.game.debugStart('sa.conduits', 1, 17, { comp: o.comp, dir: 'left', edition: 2, flags: f })
      : RB.game.debugStart('sa.memories', 21, 9, { comp: o.comp, dir: 'left', edition: 2, flags: f });
    if (o.play) { s.seen['sa.conduits_enter'] = true; s.flags['enter:sa.conduits:sa.conduits_enter'] = true; }
    s.quests.ren_ushio = o.done ? { stage: 1, done: true, t: 1 } : { stage: 1, done: false, t: 1 };
    s.quests.sa_main = { stage: 3, done: false, t: 2 };
    if (o.seen) for (const k of o.seen) s.seen[k] = true;
    // synthetic lanes: the room's first-entry scene already seen, so nothing plays on arrival
    if (!o.play) { s.seen['sa.memories_enter'] = true; s.flags['enter:sa.memories:sa.memories_enter'] = true; }
    const pick = o.pick ? new RegExp(o.pick) : null;
    RB.test.enable({ choose: (opts) => { const i = pick ? opts.findIndex((x) => pick.test(x.en || '')) : 0; return i < 0 ? 0 : i; } });
    // the Ledger on Company > Companion, read and closed again (in the world or, mid-scene, over the dialogue)
    window.__read = async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const mode = RB.game.mode();
      RB.ui.menu.open('companion');
      await wait(400);
      const items = [...document.querySelectorAll('.co-know li')].map((x) => x.textContent.replace(/\s+/g, ' ').trim());
      const h = [...document.querySelectorAll('h4')].map((x) => x.textContent).find((x) => /What you know of/.test(x)) || null;
      const open = !!(RB.ui.menu.isOpen && RB.ui.menu.isOpen());
      RB.ui.menu.close();
      await wait(300);
      const st = RB.game.s;
      return { mode, open, of: h ? h.replace(/^.*What you know of\s*/, '').trim() : null, items, flags: { took: !!st.flags.sa_ren_took, left: !!st.flags.sa_ren_left, decided: !!st.flags.sa_ren_decided, carried: !!st.flags.sa_ren_carried }, seenShelf: !!st.seen['sa.shelf_ren'], quest: st.quests.ren_ushio ? !!st.quests.ren_ushio.done : null };
    };
    // mid-scene: the page read in the Ledger, then the journey saved there through the game's own save (slot 2)
    window.__midRead = async () => { const r = await window.__read(); await RB.save.manualSave(2); r.savedMid = true; return r; };
    window.__said = []; window.__mid = null; window.__picks = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = async function (l) {
      if (l) window.__said.push([l.who || '', l.en || '']);
      if (l && /^Ren opens the folio\./.test(l.en || '') && o.mid && !window.__mid) {
        try { window.__mid = await window.__midRead(); } catch (e) { window.__mid = { error: String(e && e.stack || e).slice(0, 300) }; }
      }
      return say.apply(this, arguments);
    };
  }, { BASE, o });
}
const read = (p) => p.evaluate(() => window.__read());
const sum = (r) => ({ of: r.of, face: r.items.includes(FACE), took: r.items.some((x) => TOOK.test(x)), left: r.items.some((x) => LEFT.test(x)), n: r.items.length, fp: fp(r.items) });
const saveLoad = (p, slot) => p.evaluate(async (slot) => {
  await RB.test.idle();
  await RB.save.manualSave(slot);
  await RB.game.loadCampaign(slot, 'manual');
  await new Promise((r) => setTimeout(r, 900));
  await RB.test.idle();
  return RB.game.s.map;
}, slot);
const loadOnly = (p, slot) => p.evaluate(async (slot) => {
  await RB.test.idle();
  const list = await RB.save.list();
  if (!list[slot - 1] || list[slot - 1].empty) return { map: null, mode: null, missing: true };
  await RB.game.loadCampaign(slot, 'manual');
  await new Promise((r) => setTimeout(r, 900));
  return { map: RB.game.s.map, mode: RB.game.mode() };
}, slot);
async function fresh() { const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } }); return { p, errors }; }

// ---- played lanes ----
async function played(name, o, checks) {
  const { p, errors } = await fresh();
  await start(p, Object.assign({ play: true }, o));
  // the room's own first-entry scene (with Ren it calls the shelf); for Nao, the shelf used where it stands
  const ran = await p.evaluate(async (o) => {
    await new Promise((r) => setTimeout(r, 1200));
    const done = async () => { for (let i = 0; i < 120 && RB.script.isRunning(); i++) await new Promise((r) => setTimeout(r, 250)); await RB.test.idle(30000); };
    await RB.test.go('sa.memories', 21, 9, 'left');
    await done();
    if (o.use) { await RB.test.use(4, 6); await done(); }
    return { seenEnter: !!RB.game.s.seen['sa.memories_enter'], seenShelf: !!RB.game.s.seen['sa.shelf_ren'], log: RB.test.log ? RB.test.log.filter((x) => x.t === 'choice').map((x) => x.opts[x.pick]) : [] };
  }, o);
  const after = await read(p);
  const mid = await p.evaluate(() => window.__mid);
  await checks({ p, ran, after, mid });
  ok(errors.length === 0, name + ': no page errors ' + J(errors.slice(0, 3)));
  await p.context().close();
}

await played('P1 Ren, "You decide"', { comp: 'ren', pick: '^You decide', mid: true }, async ({ p, ran, after, mid }) => {
  if (mid && mid.error) console.log('     P1 mid-scene read failed: ' + mid.error);
  const a = sum(after), m = mid && mid.items ? sum(mid) : null;
  console.log('     P1 picks ' + J(ran.log) + ' mid ' + J(m && Object.assign({ mode: mid.mode, flags: mid.flags, seenShelf: mid.seenShelf }, m)) + ' after ' + J(a));
  ok(ran.seenShelf && after.flags.took && after.flags.decided && after.quest === true, 'P1 the scene played: the face taken back ' + J({ ran, flags: after.flags }));
  ok(m && mid.open && mid.mode === 'dialogue' && mid.flags.took && !mid.seenShelf && !m.face && m.took, 'P1 mid-scene, in the Ledger over the dialogue: the bullet gone, "Took back" shown ' + J(m));
  ok(!a.face && a.took && !a.left && a.of === 'Ren', 'P1 after the scene: the bullet gone, "Took back" shown ' + J(a));
  await saveLoad(p, 1);
  const s1 = sum(await read(p));
  ok(!s1.face && s1.took && s1.fp === a.fp, 'P1 saved and loaded: the same bullets ' + J(s1));
  const lm = await loadOnly(p, 2);
  const r2 = await read(p), s2 = sum(r2);
  console.log('     P1 mid-scene save loaded ' + J(lm) + ' ' + J({ flags: r2.flags, seenShelf: r2.seenShelf }));
  ok(mid.savedMid && r2.flags.took && !s2.face && s2.took, 'P1 the mid-scene save, loaded: the bullet gone, "Took back" shown ' + J(s2));
});
await played('P2 Ren, "Take it back"', { comp: 'ren', pick: '^Take it back' }, async ({ ran, after }) => {
  const a = sum(after);
  console.log('     P2 picks ' + J(ran.log) + ' after ' + J(a));
  ok(ran.seenShelf && after.flags.took && !a.face && a.took, 'P2 after the scene: the bullet gone, "Took back" shown ' + J(a));
});
await played('P3 Ren, "Leave it"', { comp: 'ren', pick: '^Leave it' }, async ({ p, ran, after }) => {
  const a = sum(after);
  console.log('     P3 picks ' + J(ran.log) + ' after ' + J(a));
  ok(ran.seenShelf && after.flags.left && !after.flags.took && a.face && a.left && !a.took, 'P3 after the scene: the bullet shown, with "Left the teacher\'s face" ' + J(a));
  await saveLoad(p, 1);
  const s1 = sum(await read(p));
  ok(s1.face && s1.left && s1.fp === a.fp, 'P3 saved and loaded: the same bullets ' + J(s1));
});
await played('P4 Nao, the shelf, "Take it home"', { comp: 'nao', pick: '^Don\'t open it', use: true }, async ({ ran, after }) => {
  const a = sum(after);
  console.log('     P4 picks ' + J(ran.log) + ' after ' + J(a));
  ok(ran.seenShelf && after.flags.carried && !after.flags.took && a.of === 'Nao' && !a.face && !a.took && !a.left, 'P4 carried home with Nao: Nao\'s page, nothing of Ren\'s ' + J(a));
});

// ---- synthetic lanes ----
const SYN = [
  { n: 'S1 before the shelf', o: { comp: 'ren' }, want: { of: 'Ren', face: true, took: false, left: false } },
  { n: 'S2 taken back, mid-scene (flags, not seen)', o: { comp: 'ren', flags: ['sa_ren_took', 'sa_ren_decided'], done: true }, want: { of: 'Ren', face: false, took: true, left: false } },
  { n: 'S3 taken back, seen', o: { comp: 'ren', flags: ['sa_ren_took', 'sa_ren_decided'], done: true, seen: ['sa.shelf_ren'] }, want: { of: 'Ren', face: false, took: true, left: false } },
  { n: 'S4 left', o: { comp: 'ren', flags: ['sa_ren_left', 'sa_ren_decided'], done: true, seen: ['sa.shelf_ren'] }, want: { of: 'Ren', face: true, took: false, left: true } },
  { n: 'S5 carried home with Nao', o: { comp: 'nao', flags: ['sa_ren_decided', 'sa_ren_carried'], seen: ['sa.shelf_ren'] }, want: { of: 'Nao', face: false, took: false, left: false } },
];
for (const c of SYN) {
  const { p, errors } = await fresh();
  await start(p, c.o);
  await p.evaluate(() => new Promise((r) => setTimeout(r, 1200)));
  const a = sum(await read(p));
  const w = c.want;
  ok(a.of === w.of && a.face === w.face && a.took === w.took && a.left === w.left, c.n + ': ' + (w.face ? 'the bullet shown' : 'no teacher-face bullet') + ' ' + J(a));
  await saveLoad(p, 1);
  const s1 = sum(await read(p));
  ok(s1.fp === a.fp, c.n + ', saved and loaded: the same bullets ' + J(s1));
  ok(errors.length === 0, c.n + ': no page errors ' + J(errors.slice(0, 3)));
  await p.context().close();
}

console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
