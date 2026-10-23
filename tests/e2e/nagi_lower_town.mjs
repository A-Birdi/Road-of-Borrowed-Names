// RBN-QA-134 (Agnes 6353888589, 6354377552; Local CL-234, CL-235, CL-236): once the lantern in the shallows has said
// "Tell Nagi", Nagi names Lower Town Street, once. In Chromium on the built game, with throwaway journeys, on the
// avenue where she stands (her other places share the same talk list: tests/unit/nagi_lower_town.test.mjs):
//  1. an old save: after Lanternfall's lantern, its scene seen and its note held, written by the manual save of
//     RB_OLD_PAGE=<a build without the change> (the cut's) in the same browser, then loaded with this build's load:
//     talking to her plays her one line naming Lower Town Street, first; talking again, not that line. Without
//     RB_OLD_PAGE the save is written by this build from the same state, and the log says which;
//  2. after the ending, the lantern seen: the line, first;
//  3. before the lantern: not the line;
//  4. a save holding the note and the lit lantern with the lantern's scene unseen (a manual save from the menu during
//     that scene's last moment): not the line. A recorded limitation, not a wish: the scene is not played again;
//  5. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/nagi_lower_town.mjs   (RB_OLD_PAGE=zz_old.html for 1's old save)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const OLD = process.env.RB_OLD_PAGE || null;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true, cr_done: true };
const NOTE = 'lw_lf_lower_town', LAMP = 'cr.lw_lf_lamps_open', SC = 'cr.lw_lf_nagi_lower';
const allErrors = [];
const pageAt = (file, opts) => page(b, file ? url + file : url, opts || {});

// a journey on the avenue, near Nagi's place, in the state o describes
async function start(p, o) {
  await p.evaluate(([DONE, o, NOTE]) => {
    const at = RB.content.maps['lf.town'].npcs.find((n) => n.id === 'lf_nagi');
    const s = RB.game.debugStart('lf.town', at.x, at.y + 2, { dir: 'up', edition: RB.edition.forNew(), flags: Object.assign({}, DONE, o.flags || {}) });
    for (const id of o.seen || []) s.seen[id] = true;
    if (o.note) s.notebook.push({ kind: 'lore', id: NOTE, t: Date.now() });
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = false;
    RB.world.enter('lf.town', at.x, at.y + 2, 'up', { fresh: true });
  }, [DONE, o, NOTE]);
  await settled(p);
}
async function settled(p) {
  await p.waitForFunction(() => RB.world.W && RB.world.W.time - RB.world.W.enteredAt > 1500, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(100);
}
// stand beside her, facing her, and talk (as tests/e2e/living_world.mjs does); every line that plays
async function talk(p) {
  const where = await p.evaluate(() => {
    const W = RB.world.W, n = W.npcs.find((a) => a.id === 'lf_nagi'), m = W.map;
    if (!n) return null;
    const free = (x, y) => !RB.maps.blockedStatic(m, x, y) && !RB.maps.exitAt(m, x, y) && !W.npcs.some((o) => o !== n && o.x === x && o.y === y);
    const at = [[0, 1, 'up'], [1, 0, 'left'], [-1, 0, 'right'], [0, -1, 'down']].find(([dx, dy]) => free(n.x + dx, n.y + dy));
    if (!at) return null;
    RB.test.place(n.x + at[0], n.y + at[1], at[2]);
    RB.world.interact();
    return W.map.id + ' ' + n.x + ',' + n.y;
  });
  const lines = [];
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(() => { const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown(); return { d: d ? (d.who || '') + ': ' + String(d.en || '') : null, run: RB.script.isRunning() }; });
    if (st.d) {
      if (!lines.length || lines[lines.length - 1] !== st.d) { lines.push(st.d); await p.waitForTimeout(100); }
      await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance());
      await p.waitForTimeout(60);
      continue;
    }
    const ch = await p.evaluate(() => { const c = document.querySelector('.choices:not(.hidden) .choice'); if (c) { c.click(); return true; } return false; });
    if (ch) { await p.waitForTimeout(120); continue; }
    if (!st.run && lines.length) break;
    if (!st.run && i > 20) break;
    await p.waitForTimeout(60);
  }
  await p.waitForTimeout(300);
  return { where, lines };
}
const LINE = /^lf_nagi: Lower Town Street\. You found it on a lantern in the shallows, then\./;
const named = (r) => r.lines.some((l) => /Lower Town Street/.test(l) && /^lf_nagi:/.test(l));
const fmt = (r) => JSON.stringify({ at: r.where, lines: r.lines.slice(0, 3).map((l) => l.slice(0, 70)) });

// ---- 1. the old save --------------------------------------------------------------------------------------------------------
{
  const first = await pageAt(OLD);
  await start(first.p, { flags: { lw_lf_lamps_lit: true }, seen: [LAMP], note: true });
  await first.p.evaluate(async () => { await RB.save.manualSave(1); });
  console.log('     the old save written by ' + (OLD ? OLD + ' (a build without the change)' : 'this build from the same state (RB_OLD_PAGE not given)'));
  allErrors.push(...first.errors.map((e) => 'old page: ' + e));
  await first.p.close();
  const { p, errors } = await pageAt(null, { context: first.ctx });
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(1, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  await p.evaluate(() => { RB.game.settings.textSpeed = 'instant'; RB.game.settings.skipSeen = false; });
  await settled(p);
  const st = await p.evaluate(([LAMP, NOTE, SC]) => ({ lamp: !!RB.game.s.seen[LAMP], note: RB.game.s.notebook.some((e) => e.id === NOTE), heard: !!RB.game.s.seen[SC], map: RB.game.s.map }), [LAMP, NOTE, SC]);
  ok(ld === 'loaded' && st.lamp && st.note && !st.heard && st.map === 'lf.town', 'the old save loads: the lantern\'s scene seen, its note held, her line not yet heard (' + ld + ' ' + JSON.stringify(st) + ')');
  const r1 = await talk(p);
  ok(r1.lines.length >= 1 && LINE.test(r1.lines[0]), 'talking to her: her one line naming Lower Town Street, first (' + fmt(r1) + ')');
  const heard = await p.evaluate((SC) => !!RB.game.s.seen[SC], SC);
  const r2 = await talk(p);
  ok(heard && r2.lines.length >= 1 && !named(r2), 'talking again: not that line (' + fmt(r2) + ')');
  allErrors.push(...errors);
  await p.close();
}
// ---- 2. after the ending ----------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await pageAt(null);
  await start(p, { flags: { lw_lf_lamps_lit: true, postgame: true }, seen: [LAMP], note: true });
  const r = await talk(p);
  ok(r.lines.length >= 1 && LINE.test(r.lines[0]), 'after the ending, the lantern seen: the line, first (' + fmt(r) + ')');
  allErrors.push(...errors);
  await ctx.close();
}
// ---- 3. before the lantern --------------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await pageAt(null);
  await start(p, {});
  const r = await talk(p);
  ok(r.lines.length >= 1 && !named(r), 'before the lantern: not the line (' + fmt(r) + ')');
  allErrors.push(...errors);
  await ctx.close();
}
// ---- 4. the note held, the lantern's scene unseen (the recorded limitation) ---------------------------------------------------
{
  const { p, ctx, errors } = await pageAt(null);
  await start(p, { flags: { lw_lf_lamps_lit: true }, note: true });
  const r = await talk(p);
  ok(r.lines.length >= 1 && !named(r), 'the note and the lit lantern without the lantern\'s scene seen: not the line, a recorded limitation (' + fmt(r) + ')');
  allErrors.push(...errors);
  await ctx.close();
}
ok(!allErrors.length, 'no page errors' + (allErrors.length ? ': ' + allErrors.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
