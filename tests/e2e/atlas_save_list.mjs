// The Save ledger's readability for Unwritten Atlas saves (Agnes 6563018827, 6563408499, 6563687836; Local CL-621,
// CL-623, CL-624; Cloud CC-459 to CC-461). In Chromium on the built game, on IndexedDB, with ?dev=saves and synthetic
// journeys only (never a player's saves): a journey saved standing in the camp of an expedition (slots 2 and 3), and
// one whose run id is an object that stops the run's own recovery (slot 4):
//  1. a cold launch (the page reloaded): in the Load ledger the camp rows are the journey, with Load and Export (QA),
//     and the title offers Continue; slot 4 is still "Unreadable save", with its reason;
//  2. Load from slot 2's row: the journey stands in the camp, the run restored;
//  3. home early from the camp (the run's own extraction): back in the Lantern Hall with the run's maps dropped; the
//     Save ledger shows slot 3 as the journey, with the ordinary actions (Overwrite, Copy, Delete), not "Unreadable";
//  4. the QA restore of slot 3's export into an empty slot (5) of a fresh profile, then a cold launch there: the restored
//     row is the journey with Load, and it loads in the camp;
//  no page errors (console errors included).
// Usage: node tools/build.mjs && node tests/e2e/atlas_save_list.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const DEV = url + '?dev=saves';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);

async function openLedger(p, slot) {
  await p.click('.title [data-a=load]');
  await p.waitForSelector('.folio-ledger .rec');
  const tab = 'lp' + Math.floor((slot - 1) / 6);
  if (await p.getAttribute('.folio-ledger .ptab[data-id=' + tab + ']', 'aria-selected') !== 'true') await p.click('.folio-ledger .ptab[data-id=' + tab + ']');
  await p.waitForSelector('.folio-ledger .rec[data-slot="' + slot + '"]');
}
const row = (p, n) => p.evaluate((n) => {
  const r = document.querySelector('.folio-ledger .rec[data-slot="' + n + '"]');
  if (!r) return null;
  const t = (q) => { const e = r.querySelector(q); return e ? e.textContent.trim() : null; };
  return { corrupt: r.classList.contains('corrupt'), head: t('h3'), place: t('.rec-place .en'), why: t('.rec-why'), acts: [...r.querySelectorAll('[data-a]')].map((x) => x.getAttribute('data-a')) };
}, n);
const atlasMaps = (p) => p.evaluate(() => Object.keys(RB.content.maps).filter((k) => k.startsWith('atlas.')).length);

const { p, errors } = await page(b, DEV, { viewport: { width: 1280, height: 800 } });
const made = await p.evaluate(async () => {
  const s = RB.game.debugStart('rw.hall', 5, 5, { edition: RB.edition.forNew(), comp: 'ren', profile: 'E', flags: { post: true, postgame: true } });
  s.player.name = 'Camp Six';
  const run = RB.atlas.newRun(s, [], { seed: 424242 });
  s.atlas.run = run;
  RB.atlas.register(run);
  const id = RB.atlas.mapId(run, 'c'), sp = RB.content.maps[id].spawn.default;
  s.map = id; s.x = sp[0]; s.y = sp[1];
  await RB.save.writeSlot(2, s, { force: true });
  await RB.save.writeSlot(3, s, { force: true });
  const bad = RB.util.deepClone(s);
  bad.atlas.run.id = JSON.parse('{"toString":null,"valueOf":null}');
  await RB.save.writeSlot(4, bad, { force: true });
  await RB.game.toTitle();
  return { map: id, x: s.x, y: s.y };
});

// 1. a cold launch
await p.reload();
await p.waitForSelector('.title [data-a=load]');
await p.waitForTimeout(400);
const cold = { maps: await atlasMaps(p), cont: await p.evaluate(() => { const c = document.querySelector('.title [data-a=continue]'); return !!c && !c.classList.contains('hidden'); }) };
await openLedger(p, 2);
const rA = await row(p, 2), rB = await row(p, 3), rX = await row(p, 4);
ok(cold.maps === 0 && [rA, rB].every((r) => r && !r.corrupt && /Camp Six/.test(r.head) && r.acts.includes('load') && r.acts.includes('qaexport')),
  '1 a cold launch (no expedition maps registered): the camp rows are the journey, with Load and Export (QA) ' + flat({ maps: cold.maps, rA, rB }));
ok(cold.cont, '1 and the title offers Continue');
ok(rX && rX.corrupt && /Unreadable save/.test(rX.head) && /^unknown map atlas\./.test(rX.why || '') && !rX.acts.includes('load') && !rX.acts.includes('qaexport'),
  '1 slot 4 (a run id that stops the run\'s own recovery): still "Unreadable save", with its reason ' + flat(rX));
ok(await atlasMaps(p) === 0, '1 and listing registered no expedition maps');

// 2. Load from slot 6's row
const hasLoad = await p.$('.folio-ledger .rec[data-slot="2"] [data-a=load]');
if (hasLoad) await hasLoad.click(); else await p.evaluate(() => RB.game.loadCampaign(2, 'manual'));
await p.waitForFunction(() => RB.game.s && RB.game.s.map && RB.game.s.map.startsWith('atlas.'), null, { timeout: 15000 }).catch(() => {});
const L = await p.evaluate(() => ({ map: RB.game.s && RB.game.s.map, x: RB.game.s && RB.game.s.x, y: RB.game.s && RB.game.s.y, run: !!(RB.game.s && RB.game.s.atlas.run) }));
ok(!!hasLoad && L.map === made.map && L.x === made.x && L.y === made.y && L.run, '2 Load from slot 2\'s row: standing in the camp, where it was saved, the run restored ' + flat(L));

// 3. home early from the camp, then the Save ledger
await p.evaluate(async () => {
  RB.game.settings.textSpeed = 'instant';
  RB.test.enable({});
  await new Promise((r) => setTimeout(r, 500));
  await RB.test.idle();
  RB.hooks.atlas_extract(['early']);
  await new Promise((r) => setTimeout(r, 500));
  await RB.test.idle();
});
await p.waitForFunction(() => RB.game.s.map === 'rw.hall' && !RB.game.s.atlas.run, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(500);
const home = { map: await p.evaluate(() => RB.game.s.map), maps: await atlasMaps(p) };
await p.evaluate(() => RB.ui.title.slots('save', true));
await p.waitForSelector('.folio-ledger .rec[data-slot="3"]').catch(() => {});
const sB = await row(p, 3);
ok(home.map === 'rw.hall' && home.maps === 0, '3 home early from the camp: in the Lantern Hall, the run\'s maps dropped ' + flat(home));
ok(sB && !sB.corrupt && /Camp Six/.test(sB.head) && !/Unreadable/.test(sB.head) && sB.acts.includes('save') && sB.acts.includes('copy') && sB.acts.includes('delete'),
  '3 the Save ledger then: slot 3 is the journey, with Overwrite, Copy and Delete, not "Unreadable save" ' + flat(sB));
const text = await p.evaluate(async () => (await RB.save.qa.exportSlot(3, 'camp')).text);
ok(!errors.length, '1-3 no page errors ' + errors.slice(0, 3).join(' | '));
await p.context().close();

// 4. the QA restore into a fresh profile, then a cold launch there
{
  const { p, errors } = await page(b, DEV, { viewport: { width: 1280, height: 800 } });
  const res = await p.evaluate(async (text) => { const c = await RB.save.qa.check(text); const r = await RB.save.qa.restore(text, 5); return { ok: c.ok, errors: c.errors, r: !!r }; }, text);
  await p.reload();
  await p.waitForSelector('.title [data-a=load]');
  await p.waitForTimeout(400);
  const maps = await atlasMaps(p);
  await openLedger(p, 5);
  const rR = await row(p, 5);
  ok(res.ok && maps === 0 && rR && !rR.corrupt && /Camp Six/.test(rR.head) && rR.acts.includes('load'),
    '4 the QA restore of slot 3\'s export into a fresh profile, then a cold launch: the row is the journey, with Load ' + flat({ check: res.ok, errors: res.errors, maps, rR }));
  const btn = await p.$('.folio-ledger .rec[data-slot="5"] [data-a=load]');
  if (btn) await btn.click(); else await p.evaluate(() => RB.game.loadCampaign(5, 'manual'));
  await p.waitForFunction(() => RB.game.s && RB.game.s.map && RB.game.s.map.startsWith('atlas.'), null, { timeout: 15000 }).catch(() => {});
  const LR = await p.evaluate(() => ({ map: RB.game.s && RB.game.s.map, run: !!(RB.game.s && RB.game.s.atlas.run) }));
  ok(!!btn && LR.map === made.map && LR.run, '4 and it loads from its row, in the camp ' + flat(LR));
  ok(!errors.length, '4 no page errors ' + errors.slice(0, 3).join(' | '));
  await p.context().close();
}

console.log(`\natlas_save_list: ${pass} passed, ${fail} failed`);
await b.close(); srv.close(); process.exit(fail ? 1 : 0);
