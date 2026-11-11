// RBN-QA-211 on screen, in Chromium (Agnes 6748887479; Local CL-734, CL-735 §2a, CL-736; Agnes 6749602707; Cloud
// CC-544): selecting the Hall's key ledger in the Satchel threw (its description an { en } object handed to enVars as
// text), so the details stayed blank and the Satchel's buttons stopped answering until a reload. On the built game, the
// real Satchel, clicked:
//  1. the wide (two-page) layout: the ledger shows its English description; then the Letter of introduction and the
//     Cloud cape are each selectable at once, with their own details;
//  2. every registered item carried at once, each selected in turn: its own name in the details, no error;
//  3. malformed entries added for the test (an { en } object, { en: number }, a Japanese-only object, null, a number):
//     none throws; the { en } one shows its English, the others nothing; after each, the Letter, then the cape, are
//     still selectable without a reload; a plain description's $name is filled in, and literal markup in it is shown as
//     text, not made into markup;
//  4. the narrow (one-page) layout: every carried item's row opens with its own details, and closes again;
//  5. the ledger after a save, a load, and a browser reload with a load: its description again, no error;
//  no page errors throughout.
// Usage: node tools/build.mjs && node tests/e2e/satchel_desc.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const flat = (x) => JSON.stringify(x);
const LEDGER = /An old book of the lantern-keepers' hall above the Keepers' Road/;

async function begin(p, all) {
  await p.evaluate((all) => {
    const s = RB.game.debugStart('rw.hall', 5, 5, { edition: RB.edition.forNew(), comp: 'ren', profile: 'E' });
    s.player.name = 'Haru';
    RB.game.settings.reducedMotion = true; RB.game.settings.textSpeed = 'instant'; RB.game.applySettings();
    if (all) for (const id in RB.content.items) s.inv[id] = 1;
    else for (const id of ['hall_ledger', 'rw_letter', 'gd_cr_keepsake']) s.inv[id] = 1;
  }, all);
  await p.waitForTimeout(200);
}
// opening the Satchel: null, or what it threw (an error here stops nothing else: the check that needs it fails)
const openSatchel = async (p) => {
  let threw = null;
  try { await p.evaluate(() => RB.ui.menu.open('satchel')); } catch (e) { threw = String(e.message || e).split('\n')[0]; }
  await p.waitForSelector('[data-it="hall_ledger"]', { timeout: 5000 }).catch(() => {});
  return threw;
};
// click a row as the player does, then read the details it shows (two-page: the right page; one-page: under the row)
const pick = (p, id, two) => p.evaluate(async ([id, two]) => {
  const row = document.querySelector('[data-it="' + id + '"]');
  if (!row) return { missing: true };
  row.click();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const box = two ? document.querySelector('.leaf-b .idetail') : (document.querySelector('[data-it="' + id + '"]') || {}).closest && document.querySelector('[data-it="' + id + '"]').closest('li').querySelector('.inline-detail .idetail');
  if (!box) return { box: false, cur: (document.querySelector('[data-it="' + id + '"]') || {}).getAttribute && document.querySelector('[data-it="' + id + '"]').getAttribute('aria-current') };
  const h = box.querySelector('h3 .en'), ps = [...box.querySelectorAll(':scope > p')].map((x) => x.textContent);
  return { box: true, name: h ? h.textContent : null, text: ps.join(' | '), bold: !!box.querySelector('p b'), cur: document.querySelector('[data-it="' + id + '"]').getAttribute('aria-current'), exp: document.querySelector('[data-it="' + id + '"]').getAttribute('aria-expanded') };
}, [id, two]);
const nameOf = (p, id) => p.evaluate((id) => RB.content.items[id].name.en, id);

// ---- 1. the wide layout: the ledger, then the Letter and the cape --------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, false);
  const opened = await openSatchel(p);
  ok(!opened, '1 the Satchel opens (the ledger is the first thing carried) ' + (opened || ''));
  const L = await pick(p, 'hall_ledger', true);
  ok(L.box && L.name === 'The Hall\'s key ledger' && LEDGER.test(L.text) && L.cur === 'true', '1 wide: the ledger shows its English description ' + flat({ name: L.name, cur: L.cur }));
  const A = await pick(p, 'rw_letter', true), B = await pick(p, 'gd_cr_keepsake', true);
  ok(A.box && A.name === 'Letter of introduction' && A.cur === 'true', '1 then the Letter of introduction at once ' + flat({ name: A.name, cur: A.cur }));
  ok(B.box && B.name === 'Cloud cape' && B.cur === 'true', '1 then the Cloud cape ' + flat({ name: B.name, cur: B.cur }));
  ok(!errors.length, '1 no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 2 and 3. every item, then malformed entries, in the wide layout ---------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, true);
  await openSatchel(p);
  const ids = await p.evaluate(() => Object.keys(RB.game.s.inv).filter((id) => RB.content.items[id]));
  const wrong = [];
  for (const id of ids) {
    const r = await pick(p, id, true);
    const want = await nameOf(p, id);
    if (!r.box || r.name !== want || r.cur !== 'true') wrong.push(id + ' ' + flat(r));
  }
  ok(ids.length > 100 && !wrong.length, '2 wide: every registered item carried (' + ids.length + '), each selected shows its own details ' + wrong.slice(0, 5).join('; '));
  ok(!errors.length, '2 no page errors ' + errors.join('; '));

  const BAD = [['qa_probe_en', { en: 'Probe English.' }, 'Probe English.'], ['qa_probe_ennum', { en: 5 }, ''], ['qa_probe_jp', { jp: '{古|ふる}い {本|ほん}' }, ''], ['qa_probe_null', null, ''], ['qa_probe_num', 5, '']];
  await p.evaluate((BAD) => {
    const s = RB.game.s;
    for (const [id, desc] of BAD) { RB.content.items[id] = { name: { en: 'Probe ' + id, jp: 'テスト' }, desc }; s.inv[id] = 1; }
    RB.content.items.qa_probe_plain = { name: { en: 'Probe plain', jp: 'テスト' }, desc: 'Kept for $name. <b>not bold</b>' }; s.inv.qa_probe_plain = 1;
    RB.ui.menu.close(); RB.ui.menu.open('satchel');
  }, BAD).catch((e) => console.log('     (reopening threw: ' + String(e.message).split('\n')[0] + ')'));
  await p.waitForSelector('[data-it="qa_probe_en"]', { timeout: 5000 }).catch(() => {});
  for (const [id, , want] of BAD) {
    const r = await pick(p, id, true);
    const a = await pick(p, 'rw_letter', true), c = await pick(p, 'gd_cr_keepsake', true);
    ok(r.box && r.name === 'Probe ' + id && (r.text || '').split(' | ')[0] === want && a.box && a.name === 'Letter of introduction' && c.box && c.name === 'Cloud cape',
      '3 ' + id + ': ' + (want ? 'its English' : 'no description') + ', no error; then the Letter and the cape still answer ' + flat({ text: (r.text || '').split(' | ')[0], a: a.name, c: c.name }));
  }
  const pl = await pick(p, 'qa_probe_plain', true);
  ok(pl.box && (pl.text || '').split(' | ')[0] === 'Kept for Haru. <b>not bold</b>' && !pl.bold, '3 a plain description: $name filled in, literal markup shown as text ' + flat({ text: pl.text, bold: pl.bold }));
  ok(!errors.length, '3 no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 4. the narrow layout: every row opens with its details ------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 } });
  await begin(p, true);
  await openSatchel(p);
  const two = await p.evaluate(() => !!document.querySelector('.leaf-b .idetail'));
  const ids = await p.evaluate(() => Object.keys(RB.game.s.inv).filter((id) => RB.content.items[id]));
  const wrong = [];
  for (const id of ids) {
    const r = await pick(p, id, false);
    const want = await nameOf(p, id);
    if (!r.box || r.name !== want || r.exp !== 'true') wrong.push(id + ' ' + flat(r));
    else {
      const shut = await p.evaluate(async (id) => { document.querySelector('[data-it="' + id + '"]').click(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); const el = document.querySelector('[data-it="' + id + '"]'); return el.getAttribute('aria-expanded') === 'false' && !el.closest('li').querySelector('.inline-detail'); }, id);
      if (!shut) wrong.push(id + ' did not close');
    }
  }
  ok(!two, '4 narrow: one page, details open under the row (no right-hand details page)');
  ok(ids.length > 100 && !wrong.length, '4 narrow: every carried item\'s row (' + ids.length + ') opens with its own details and closes again ' + wrong.slice(0, 5).join('; '));
  ok(!errors.length, '4 no page errors ' + errors.join('; '));
  await p.context().close();
}

// ---- 5. the ledger across save, load and a browser reload ------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, false);
  await p.evaluate(async () => { await RB.save.writeSlot(2, RB.game.s, { force: true }); });
  await p.evaluate(async () => { await RB.game.toTitle(); await RB.game.loadCampaign(2, 'manual'); });
  await p.waitForTimeout(400);
  await openSatchel(p);
  const a = await pick(p, 'hall_ledger', true);
  ok(a.box && LEDGER.test(a.text), '5 after a save and a load: the ledger\'s description ' + flat({ name: a.name }));
  await p.evaluate(async () => { RB.ui.menu.close(); await RB.game.toTitle(); });
  await p.reload();
  await p.waitForSelector('.title [data-a=load]');
  await p.waitForTimeout(300);
  await p.evaluate(async () => { await RB.game.loadCampaign(2, 'manual'); });
  await p.waitForTimeout(400);
  await openSatchel(p);
  const c = await pick(p, 'hall_ledger', true);
  const d = await pick(p, 'rw_letter', true);
  ok(c.box && LEDGER.test(c.text) && d.box && d.name === 'Letter of introduction', '5 after a browser reload and a load: the ledger, then the Letter ' + flat({ c: c.name, d: d.name }));
  ok(!errors.length, '5 no page errors ' + errors.join('; '));
  await p.context().close();
}

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
