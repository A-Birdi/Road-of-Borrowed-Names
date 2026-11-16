// Sanpei and the Ghostwriter: after the ending, his testimony comes before the broadsheet (QA-208; Cloud CC-610;
// Agnes 6913897483; Local CL-848). In Chromium on the built game, on throwaway journeys (never a real save), in the
// press room in Manybridge: Sanpei talked to through the world's own interact, every challenge answered by the test
// helper; saves made and loaded through the game's own save and load:
//  A. after the ending, "A Ghostwriter's Debt" at step 1 and no testimony yet: his testimony; a save and load; then the
//     broadsheet; then, after two later deeds (the festival, the library), the broadsheet again with two more
//     headlines; Ryusui's meeting is then open to the journey (the testimony and a seeded manuscript: synthetic);
//  B. the same, saved and loaded before talking: the testimony first;
//  C. after the ending without the quest: the broadsheet first, as before;
//  D. before the ending, the quest at step 1: the testimony, as before;
//  no page errors.
// Usage: node tools/build.mjs && node tests/e2e/sanpei_order.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const BASE = ['departed', 'ch1_done', 'ch2_done', 'mb1_done', 'mp_sobe_met', 'mp_theatre_seen'];

async function at(p, o) {
  await p.evaluate(async ({ BASE, o }) => {
    const f = {};
    for (const k of BASE) f[k] = true;
    if (o.post) Object.assign(f, { postgame: true, mb2_done: true });
    RB.game.settings.textSpeed = 'instant';
    const s = RB.game.debugStart('mp.pressroom', 5, 6, { comp: 'mio', dir: 'up', edition: 2, flags: f });
    if (o.ghost) { s.quests.mp_ghost = { stage: 1, done: false, t: 2 }; s.flags.mp_ghost_heard = true; }
    if (o.manuscript) RB.state.give(s, 'mp_manuscript', 1);
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    RB.test.enable({ choose: () => 0 });
    window.__runs = [];
    const run = RB.challenge.run;
    RB.challenge.run = async function (id) { const r = await run.apply(this, arguments); window.__runs.push([id, !!(r && r.ok)]); return r; };
    await new Promise((r) => setTimeout(r, 900));
    RB.world.refreshActors();
    window.__said = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { if (l) window.__said.push(l.en || ''); return say.apply(this, arguments); };
  }, { BASE, o });
}
const talk = (p) => p.evaluate(async () => {
  window.__said = []; window.__runs = [];
  await RB.test.idle();
  if (!RB.world.W.npcs.some((n) => n.id === 'mp_sanpei')) return { said: [], runs: [], missing: true };
  await RB.test.talk('mp_sanpei'); await RB.test.idle(); await new Promise((r) => setTimeout(r, 300)); await RB.test.idle();
  return { said: window.__said.slice(), runs: window.__runs.slice(), missing: false };
});
const saveLoad = (p) => p.evaluate(async () => {
  await RB.test.idle();
  await RB.save.manualSave(1);
  await RB.game.loadCampaign(1, 'manual');
  await new Promise((r) => setTimeout(r, 800));
  await RB.test.idle();
  return RB.world.W.map.id;
});
const TESTIMONY = /Shinobu always brings them/, SHEET = /^I've decided to print the last few myself\./;
const kind = (t) => (t.said.some((x) => TESTIMONY.test(x)) ? 'testimony' : t.said.some((x) => SHEET.test(x)) ? 'broadsheet' : 'other:' + (t.said[0] || '').slice(0, 30));
const flags = (p) => p.evaluate(() => ({ testimony: !!RB.game.s.flags.mp_ghost_sanpei, meeting: RB.state.test(RB.game.s, 'quest.mp_ghost=1&item.mp_manuscript&mp_ghost_sanpei') }));

// A. after the ending, the quest at step 1
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { post: true, ghost: true, manuscript: true });
  const t1 = await talk(p);
  const f1 = await flags(p);
  ok(!t1.missing && kind(t1) === 'testimony' && f1.testimony && f1.meeting, 'A after the ending, the quest at step 1: his testimony first; Ryusui\'s meeting now open (seeded manuscript, synthetic) ' + flat({ k: kind(t1), f1 }));
  const m = await saveLoad(p);
  const t2 = await talk(p);
  ok(m === 'mp.pressroom' && kind(t2) === 'broadsheet' && t2.runs.length === 1 && t2.runs[0][0] === 'rt.headline', 'A saved and loaded, then the broadsheet ' + flat({ m, k: kind(t2), runs: t2.runs }));
  await p.evaluate(() => { RB.game.s.flags.as_fest_done = true; RB.game.s.flags.end_archive_library = true; });
  const t3 = await talk(p);
  ok(kind(t3) === 'broadsheet' && t3.said.length === t2.said.length + 2, 'A after the festival and the library, the broadsheet again: two more headlines ' + flat({ n2: t2.said.length, n3: t3.said.length }));
  ok(!errors.length, 'A no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// B. saved and loaded before talking
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { post: true, ghost: true });
  const m = await saveLoad(p);
  const t1 = await talk(p);
  const t2 = await talk(p);
  ok(m === 'mp.pressroom' && kind(t1) === 'testimony' && kind(t2) === 'broadsheet', 'B saved and loaded before talking: the testimony, then the broadsheet ' + flat({ m, k1: kind(t1), k2: kind(t2) }));
  ok(!errors.length, 'B no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// C. after the ending without the quest
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { post: true });
  const t1 = await talk(p);
  ok(kind(t1) === 'broadsheet', 'C after the ending without the quest: the broadsheet first, as before ' + kind(t1));
  ok(!errors.length, 'C no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

// D. before the ending, the quest at step 1
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await at(p, { ghost: true });
  const t1 = await talk(p);
  ok(kind(t1) === 'testimony', 'D before the ending, the quest at step 1: the testimony, as before ' + kind(t1));
  ok(!errors.length, 'D no page errors ' + errors.slice(0, 2).join(' | '));
  await p.context().close();
}

console.log(`\nsanpei_order: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
