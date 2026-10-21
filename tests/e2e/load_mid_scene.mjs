// RBN-QA-053 (Cloud; cleanup contract refined by Agnes 6308899611, Local CL-071/072): loading a journey in the middle of
// a scene left the old line's dialogue on screen (Next did nothing; you walked with it showing). On a change of
// campaign the old dialogue is now taken down at once: the reveal stops, the replies' layer comes down, the old line's
// resolver is dropped (not called, nothing chosen), and a line waiting for its speaker to walk in is not said. In
// Chromium on the built game, with a small test scene added in the page:
//  1. mid-line, through the real History -> Ledger -> Save & Load -> Load: no dialogue, no replies, the loaded journey;
//     you walk, and a new scene's lines and replies work;
//  2. mid-choice (the replies up), the same load: the replies' layer is gone, no reply was given to the old scene;
//  3. Return to the title mid-scene, then load from the title: no old dialogue anywhere;
//  4. the load's confirmation cancelled: the scene goes on (Next shows its next line);
//  5. a failed load (an empty slot) mid-scene, and the slot open in another tab with its warning cancelled: no hidden
//     dialogue trapping input; the scene has ended with the change, and the journey goes on from the map;
//  6. a line waiting for its speaker to walk in when the campaign changes is not said afterwards; no page errors.
// Usage: node tools/build.mjs && node tests/e2e/load_mid_scene.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const SCENE = `
@scene test.qa053
narr: いち || Line one.
narr: に || Line two.
!choice
* あ || Reply A. -> a
* い || Reply B. -> b
:a
!set qa053_a
narr: エー || A was chosen.
!end
:b
!set qa053_b
narr: ビー || B was chosen.

@scene test.qa053walk
narr: いち || Before the walk-in.
hana: に || Hana, after walking in.
`;
async function start(o = {}) {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 } });
  await p.evaluate((SCENE) => {
    // (the village's own arrival scene already seen, so it does not follow the test scene's end)
    RB.game.debugStart('rw.village', 22, 30, { edition: RB.edition.forNew(), comp: 'suzu', dir: 'down', flags: { departed: true, ch1_done: true, 'enter:rw.village:rw.village_first': true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.script.add(SCENE, 'test');
  }, SCENE);
  await p.waitForTimeout(900);
  await p.evaluate(async () => { await RB.save.manualSave(1); });
  return { p, errors };
}
const st = (p) => p.evaluate(() => {
  const box = document.querySelector('.dlg'), ch = document.querySelector('.choices');
  const d = RB.ui.dialogue.isOpen() && RB.ui.dialogue.shown();
  return { open: !!RB.ui.dialogue.isOpen(), line: d ? String(d.en || '') : null, box: !!(box && box.offsetParent && !box.classList.contains('hidden')),
    choices: !!(ch && !ch.classList.contains('hidden') && ch.children.length), top: (RB.ui.topLayer && RB.ui.topLayer() || {}).name || null,
    inDlg: document.body.classList.contains('in-dialogue'), run: RB.script.isRunning(), mode: RB.game.mode(), pos: RB.world.W.player ? [RB.world.W.player.x, RB.world.W.player.y] : null,
    flags: RB.game.s ? { a: !!RB.game.s.flags.qa053_a, b: !!RB.game.s.flags.qa053_b } : null };
});
const until = async (p, f, ms = 4000) => { const t0 = Date.now(); let r; while (Date.now() - t0 < ms) { r = await st(p); if (f(r)) return r; await p.waitForTimeout(100); } return r; };
const click = (p, re) => p.evaluate((src) => { const re = new RegExp(src); const bt = [...document.querySelectorAll('button')].filter((x) => x.offsetParent).find((x) => re.test(x.textContent.trim())); if (bt) { bt.click(); return true; } return false; }, re.source);
// History -> Ledger -> Save & Load -> Load a journey -> slot 1 Load -> confirm (or cancel)
async function ledgerLoad(p, confirm = true) {
  await p.evaluate(() => { const h = [...document.querySelectorAll('.dlg button')].find((x) => /History/.test(x.textContent)); if (h) h.click(); else RB.ui.menu.open('log'); });
  await p.waitForTimeout(900);
  await p.evaluate(() => { const s = document.querySelector('.ledger-save'); if (s) s.click(); });
  await p.waitForTimeout(500);
  await click(p, /^Load a journey/);
  await p.waitForTimeout(900);
  await p.evaluate(() => { const bt = [...document.querySelectorAll('button.primary')].filter((x) => x.offsetParent && x.textContent.trim() === 'Load')[0]; if (bt) bt.click(); });
  await p.waitForTimeout(700);
  await p.evaluate((confirm) => { const bs = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && x.textContent.trim() === (confirm ? 'Load' : 'Cancel')); const bt = bs[bs.length - 1]; if (bt) bt.click(); }, confirm);
  await p.waitForTimeout(1800);
}
async function walks(p) { const a = (await st(p)).pos; await p.keyboard.down('ArrowUp'); await p.waitForTimeout(300); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(400); return (await st(p)).pos.join() !== a.join(); }
async function newSceneWorks(p) {
  await p.evaluate(() => { RB.script.run('test.qa053'); });
  const a = await until(p, (r) => /Line one/.test(r.line || ''));
  await p.click('.dlg .b-next').catch(() => {}); await p.waitForTimeout(300);
  await p.click('.dlg .b-next').catch(() => {});
  const c = await until(p, (r) => r.choices);
  await click(p, /Reply A/);
  const d = await until(p, (r) => /A was chosen/.test(r.line || ''));
  await p.click('.dlg .b-next').catch(() => {});
  const e = await until(p, (r) => !r.run && !r.open);
  return !!(a && /Line one/.test(a.line || '') && c && c.choices && d && /A was chosen/.test(d.line || '') && e && e.flags.a && !e.open);
}
// 1. mid-line
{
  const { p, errors } = await start();
  await p.evaluate(() => { RB.script.run('test.qa053'); });
  const before = await until(p, (r) => /Line one/.test(r.line || ''));
  await ledgerLoad(p);
  const r = await st(p);
  ok(before && /Line one/.test(before.line || '') && !r.open && !r.box && !r.inDlg && !r.run && r.mode === 'world', 'mid-line, the Ledger\'s Load: the old line is gone, no dialogue left on screen (' + JSON.stringify(r) + ')');
  ok(await walks(p), 'mid-line: you walk on the loaded journey');
  ok(await newSceneWorks(p), 'mid-line: a new scene\'s lines and replies work after the load');
  ok(!errors.length, 'mid-line: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 2. mid-choice
{
  const { p, errors } = await start();
  await p.evaluate(() => { RB.script.run('test.qa053'); });
  await until(p, (r) => /Line one/.test(r.line || ''));
  await p.click('.dlg .b-next').catch(() => {}); await p.waitForTimeout(300);
  await p.click('.dlg .b-next').catch(() => {});
  const up = await until(p, (r) => r.choices);
  await ledgerLoad(p);
  const r = await st(p);
  ok(up && up.choices && !r.choices && r.top !== 'choices' && !r.open && !r.box && !r.run, 'mid-choice, the Ledger\'s Load: the replies and their layer are gone with the line (' + JSON.stringify(r) + ')');
  await p.waitForTimeout(800);
  const z = await st(p);
  ok(!z.flags.a && !z.flags.b, 'mid-choice: no reply was given to the old scene (' + JSON.stringify(z.flags) + ')');
  ok(await walks(p) && await newSceneWorks(p), 'mid-choice: you walk, and a new scene with replies works');
  ok(!errors.length, 'mid-choice: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 3. the title mid-scene, then a load from the title
{
  const { p, errors } = await start();
  await p.evaluate(() => { RB.script.run('test.qa053'); });
  await until(p, (r) => /Line one/.test(r.line || ''));
  await p.evaluate(() => { const h = [...document.querySelectorAll('.dlg button')].find((x) => /History/.test(x.textContent)); if (h) h.click(); });
  await p.waitForTimeout(900);
  await p.evaluate(() => { const s = document.querySelector('.ledger-save'); if (s) s.click(); });
  await p.waitForTimeout(500);
  await p.evaluate(() => { const o = document.querySelector('.sv-opt[data-a="title"]'); if (o) o.click(); });
  await p.waitForTimeout(700);
  await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && x.textContent.trim() === 'Return to title'); const bt = bs[bs.length - 1]; if (bt) bt.click(); });
  await p.waitForTimeout(1500);
  const t = await st(p);
  ok(t.mode === 'title' && !t.open && !t.box && !t.choices && !t.inDlg, 'to the title mid-scene: the title, no old dialogue over it (' + JSON.stringify({ mode: t.mode, open: t.open, box: t.box, inDlg: t.inDlg }) + ')');
  const ld = await p.evaluate(async () => { try { return await RB.game.loadCampaign(1, 'manual'); } catch (e) { return 'refused: ' + e.message; } });
  await p.waitForTimeout(1200);
  const r = await st(p);
  ok(ld === true && !r.open && !r.box && r.mode === 'world' && await walks(p), 'then a load from the title: the journey, no old dialogue, you walk (' + JSON.stringify({ ld, open: r.open, mode: r.mode }) + ')');
  ok(!errors.length, 'title: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 4. the confirmation cancelled
{
  const { p, errors } = await start();
  await p.evaluate(() => { RB.script.run('test.qa053'); });
  await until(p, (r) => /Line one/.test(r.line || ''));
  await ledgerLoad(p, false);
  // back out of the Ledger, then the scene goes on
  for (let i = 0; i < 4; i++) { const top = await p.evaluate(() => (RB.ui.topLayer && RB.ui.topLayer() || {}).name || null); if (!top || top === 'choices') break; await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
  await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].filter((x) => x.offsetParent).find((x) => /^Close$/.test(x.textContent.trim())); if (bt) bt.click(); });
  await p.waitForTimeout(800);
  const a = await st(p);
  await p.click('.dlg .b-next').catch(() => {});
  const r = await until(p, (q) => /Line two/.test(q.line || ''));
  ok(/Line one/.test(a.line || '') && r && /Line two/.test(r.line || ''), 'the load cancelled: the scene goes on, Next shows its next line (' + JSON.stringify({ before: a.line, after: r && r.line }) + ')');
  ok(!errors.length, 'cancelled: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 5. a failed load (an empty slot) mid-scene
{
  const { p, errors } = await start();
  await p.evaluate(() => { RB.script.run('test.qa053'); });
  await until(p, (r) => /Line one/.test(r.line || ''));
  const res = await p.evaluate(async () => { try { return await RB.game.loadCampaign(5, 'manual'); } catch (e) { return 'failed: ' + String(e && e.message || e).slice(0, 60); } });
  await p.waitForTimeout(1000);
  const r = await st(p);
  const moved = await walks(p);
  console.log('note failed load: ' + JSON.stringify({ res, after: { open: r.open, box: r.box, run: r.run, mode: r.mode }, walks: moved }));
  ok(/Nothing saved/.test(String(res)) && !r.open && !r.box && !r.inDlg && r.mode === 'world' && moved, 'a failed load mid-scene: no dialogue left trapping input, the journey goes on from the map (' + JSON.stringify({ box: r.box, mode: r.mode, walks: moved }) + ')');
  ok(!errors.length, 'failed load: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
// 5b. the slot open in another tab (the same browser), mid-scene, through the Ledger: the warning's Cancel
{
  const other = await page(b, url, { viewport: { width: 1180, height: 757 } });
  const ctx = other.p.context();
  // the other tab saves its journey to slot 1 and so holds the slot (src/engine/80_save.js claim)
  await other.p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, { edition: RB.edition.forNew(), comp: 'suzu', dir: 'down', flags: { departed: true, ch1_done: true, 'enter:rw.village:rw.village_first': true } }); });
  await other.p.waitForTimeout(600);
  await other.p.evaluate(async () => { await RB.save.manualSave(1); });
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 757 }, context: ctx });
  await p.evaluate((SCENE) => {
    RB.game.debugStart('rw.village', 22, 30, { edition: RB.edition.forNew(), comp: 'suzu', dir: 'down', flags: { departed: true, ch1_done: true, 'enter:rw.village:rw.village_first': true } });
    RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    RB.script.add(SCENE, 'test');
  }, SCENE);
  await p.waitForTimeout(900);
  await p.evaluate(() => { RB.script.run('test.qa053'); });
  await until(p, (r) => /Line one/.test(r.line || ''));
  await ledgerLoad(p);
  const warned = await p.evaluate(() => [...document.querySelectorAll('button')].some((x) => x.offsetParent && x.textContent.trim() === 'Take over here'));
  await p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter((x) => x.offsetParent && x.textContent.trim() === 'Cancel'); const bt = bs[bs.length - 1]; if (bt) bt.click(); });
  await p.waitForTimeout(800);
  for (let i = 0; i < 4; i++) { const top = await p.evaluate(() => (RB.ui.topLayer && RB.ui.topLayer() || {}).name || null); if (!top) break; await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
  await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].filter((x) => x.offsetParent).find((x) => /^Close$/.test(x.textContent.trim())); if (bt) bt.click(); });
  await p.waitForTimeout(800);
  const r = await st(p);
  const moved = await walks(p);
  console.log('note busy slot: ' + JSON.stringify({ warned, after: { open: r.open, box: r.box, run: r.run, mode: r.mode }, walks: moved }));
  ok(warned && !r.open && !r.box && !r.inDlg && r.mode === 'world' && moved, 'the slot open in another tab, the warning cancelled mid-scene: no hidden dialogue, the journey goes on from the map (' + JSON.stringify({ warned, box: r.box, mode: r.mode, walks: moved }) + ')');
  ok(!errors.length && !other.errors.length, 'busy slot: no page errors ' + errors.concat(other.errors).slice(0, 2).join(' | '));
  await p.close(); await other.p.close();
}
// 6. a line waiting for its speaker to walk in
{
  const { p, errors } = await start();
  await p.evaluate(() => { RB.script.run('test.qa053walk'); });
  await until(p, (r) => /Before the walk-in/.test(r.line || ''));
  await p.click('.dlg .b-next').catch(() => {});
  await p.waitForTimeout(150);
  const ld = await p.evaluate(async () => { try { return await RB.game.loadCampaign(1, 'manual'); } catch (e) { return 'refused: ' + e.message; } });
  await p.waitForTimeout(3800);
  const r = await st(p);
  ok(ld === true && !r.open && !/Hana, after walking in/.test(r.line || ''), 'a line waiting for its speaker when the campaign changes is not said afterwards (' + JSON.stringify({ ld, open: r.open, line: r.line }) + ')');
  ok(!errors.length, 'walk-in: no page errors ' + errors.slice(0, 2).join(' | '));
  await p.close();
}
console.log(`\nload_mid_scene: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
