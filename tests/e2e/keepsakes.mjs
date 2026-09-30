// Roadside Keepsakes (addendum §17, §23.6; docs/addendum/fieldweave.md): the
// Journey › Keepsakes page in the real game. Counts (and hiding them, from the
// page and from Settings › Display), spoiler safety (no names of what is not
// found, places not yet visited grouped without names, the total without the
// list), hints broad then specific at no cost, the pixel art at whole-number
// zoom without blur, the companion's comment, putting one on display (kept
// across a reload; shown on Company › Shared memories), the first-find notice
// once, no duplicates, identical credit with or without assistance, Shared
// Journey counting only the current companion, Atlas Finds from real
// ownership, and the phone layout. Screenshots: tests/e2e/out/keepsakes/.
// Usage: node tests/e2e/keepsakes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'tests/e2e/out/keepsakes');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0, n = 0;
const assert = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
let { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
p.on('pageerror', (e) => console.log('  (page error: ' + String(e.stack || e).split('\n').slice(0, 3).join(' | ') + ')'));
const t0 = Date.now();

async function start(o = {}) {
  await p.evaluate((o) => {
    if (RB.ui.menu.isOpen()) RB.ui.menu.closeAll ? RB.ui.menu.closeAll() : RB.ui.menu.close();
    const s = RB.game.debugStart('rw.village', 30, 30, { dir: 'up', comp: o.comp || 'mio' });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.keepsakeCounts = true;
    s.visited = {}; for (const m of o.visited || ['rw.village']) s.visited[m] = true;
    window.__found = [];
    if (!window.__hooked) { window.__hooked = true; RB.bus.on('keepsake:found', (e) => window.__found.push(e.id)); }
  }, o);
  await p.waitForTimeout(150);
}
const openPage = async () => { await p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); RB.ui.menu.open('keepsakes'); }); await p.waitForSelector('.ks-page'); };
const closeMenu = () => p.evaluate(() => { if (RB.ui.menu.isOpen()) RB.ui.menu.close(); });
const pageText = () => p.evaluate(() => { const r = document.querySelector('.folio') || document.body; const c = r.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ' '); });
const reg = () => p.evaluate(() => { const K = RB.content.keepsakes; return Object.keys(K).map((id) => ({ id, en: K[id].name.en, cat: K[id].category || null, region: K[id].region })); });
const solveF1 = (how) => p.evaluate((how) => {
  const s = RB.game.s, FW = RB.fieldweave;
  if (how === 'assisted') { FW.weave(s, 'f1', 'screen', 'mamoru', { mode: 'choice', assisted: true, firstTry: false, mistakes: 2 }); FW.act(s, 'f1', 'clamp'); }
  else if (how === 'hand') { FW.weave(s, 'f1', 'screen', 'mamoru', { mode: 'hand', assisted: false, firstTry: true, mistakes: 0 }); FW.act(s, 'f1', 'clamp'); }
  else { FW.act(s, 'f1', 'close'); FW.act(s, 'f1', 'clamp'); }
  return JSON.parse(JSON.stringify(s.discovery.keepsakes));
}, how);

// ---- nothing found yet: counts, spoiler safety, hints ---------------------------------------------------------
{
  await start();
  const all = await reg();
  const road = all.filter((k) => k.cat !== 'shared');
  await openPage();
  let tx = await pageText();
  assert(tx.indexOf('0 of ' + road.length + ' found') >= 0 && /1 of 6 regions known/.test(tx), 'counts: 0 of ' + road.length + ' found, 1 of 6 regions known');
  const leaked = all.filter((k) => tx.indexOf(k.en) >= 0).map((k) => k.en);
  assert(!leaked.length, 'no keepsake name appears before it is found' + (leaked.length ? ' (' + leaked.join(', ') + ')' : ''));
  assert(/Reedwake/.test(tx) && !/Saltglass|Cinder Orchard|Snowbell|Lanternfall|Still Archive/.test(tx), 'only the visited region is named');
  const later = road.length - road.filter((k) => [].concat(k.region).indexOf('reedwake') >= 0).length;
  assert(tx.indexOf('Places not yet visited') >= 0 && tx.indexOf(later + ' more keepsake') >= 0, 'places not yet visited: "' + later + ' more … further along the road", unnamed');
  // hints, one layer at a time, no cost
  await p.click('.ks-cell.unfound[data-ks-sel="reed_boat"]');
  await p.click('[data-ks-hint="reed_boat"]');
  tx = await pageText();
  const K = await p.evaluate(() => RB.content.keepsakes.reed_boat.hint);
  assert(tx.indexOf(K.broad.en) >= 0 && tx.indexOf(K.specific.en) < 0, 'a hint: the broad one first');
  await p.click('[data-ks-hint="reed_boat"]');
  tx = await pageText();
  const hs = await p.evaluate(() => ({ lv: RB.game.s.discovery.hints['keepsake:reed_boat'], ks: Object.keys(RB.game.s.discovery.keepsakes).length, btn: !!document.querySelector('[data-ks-hint]') }));
  assert(tx.indexOf(K.specific.en) >= 0 && hs.lv === 2 && !hs.btn && hs.ks === 0, 'then the specific one; no more buttons; nothing spent or given');
  await p.screenshot({ path: path.join(OUT, 'ks_hints.png') });
  // hiding the counts, on the page
  await p.click('[data-ks="counts"]');
  tx = await pageText();
  assert(/Counts hidden/.test(tx) && tx.indexOf(road.length + ' found') < 0 && /More wait further along the road/.test(tx) && (await p.evaluate(() => RB.game.settings.keepsakeCounts)) === false, 'Hide counts: no numbers anywhere on the page');
  await p.click('[data-ks="counts"]');
  assert((await p.evaluate(() => RB.game.settings.keepsakeCounts)) === true, 'Show counts again');
  await closeMenu();
  // … and from Settings › Display
  await p.evaluate(() => RB.ui.settings.open());
  await p.click('[data-grp="display"]');
  const row = await p.$('input[data-sw="keepsakeCounts"]');
  assert(!!row && (await row.isChecked()), 'Settings › Display has "Counts in Roadside Keepsakes" (on)');
  await p.click('label.switch:has(input[data-sw="keepsakeCounts"])');
  // (the settings page re-renders after saving; let it, before closing it)
  await p.waitForFunction(() => { const i = document.querySelector('input[data-sw="keepsakeCounts"]'); return i && !i.checked; });
  await p.waitForTimeout(200);
  assert((await p.evaluate(() => RB.game.settings.keepsakeCounts)) === false, 'switching it off there hides the counts too');
  await p.evaluate(() => RB.ui.settings.close ? RB.ui.settings.close() : RB.ui.menu.closeAll());
  await p.waitForTimeout(150);
  await p.evaluate(() => { RB.game.settings.keepsakeCounts = true; });
}

// ---- found: the notice once, the entry, zoom, the comment, display, no duplicates ---------------------------------
{
  await start({ comp: 'mio' });
  await solveF1('screened');
  const notice = await p.waitForSelector('.ks-toast', { timeout: 6000 }).then(() => p.textContent('.ks-toast')).catch(() => '');
  assert(/Keepsake found/.test(notice) && /Folded Reed Boat/.test(notice), 'the first find: a brief notice ("' + notice.replace(/\s+/g, ' ').trim().slice(0, 60) + '")');
  await p.screenshot({ path: path.join(OUT, 'ks_notice.png') });
  // a second award of the same keepsake is refused
  const again = await p.evaluate(() => RB.discovery.keepsake(RB.game.s, 'reed_boat', { kind: 'puzzle', id: 'f1' }));
  await p.waitForTimeout(700);
  const f = await p.evaluate(() => ({ found: window.__found, n: Object.keys(RB.game.s.discovery.keepsakes).length, toasts: document.querySelectorAll('.ks-toast').length }));
  assert(!again && f.found.join() === 'reed_boat' && f.n === 1 && f.toasts <= 1, 'no duplicates: a second award is refused, one keepsake:found, one notice');
  await p.evaluate(() => { RB.game.s.company.react['puzzle:f1:done'] = RB.game.s.company.react['puzzle:f1:done'] || 'f1.mio.screened'; });
  await openPage();
  const tx = await pageText();
  const road = (await reg()).filter((k) => k.cat !== 'shared');
  assert(tx.indexOf('1 of ' + road.length + ' found') >= 0 && /Folded Reed Boat/.test(tx), 'found: counted, named');
  const det = await p.evaluate(() => {
    const d = document.querySelector('.ks-detail');
    const cv = d.querySelector('.ks-slot-big canvas');
    return { name: d.querySelector('.ks-name').textContent, reading: !!d.querySelector('.ks-name rt'), comment: (d.querySelector('.ks-comment') || {}).textContent || '', w: cv.width, css: cv.style.width, ir: getComputedStyle(cv).imageRendering };
  });
  const react = await p.evaluate(() => { const id = RB.game.s.company.react['puzzle:f1:done']; return RB.company.reactions.find((r) => r.id === id).lines[0].en; });
  assert(/Folded Reed Boat/.test(det.name) && det.reading, 'the entry: name with its reading');
  assert(det.comment.indexOf(react) >= 0 && /Mio/.test(det.comment), 'the companion\'s comment from the time ("' + react + '")');
  assert(det.w === 32 && det.css === '128px' && /pixelated|crisp-edges/.test(det.ir), 'the art: 32×32 drawn at ×4 (128 px), never smoothed (' + det.ir + ')');
  for (const z of [2, 8]) {
    await p.click('[data-ks-zoom="' + z + '"]');
    const css = await p.evaluate(() => document.querySelector('.ks-detail .ks-slot-big canvas').style.width);
    assert(css === 32 * z + 'px', 'zoom ×' + z + ' → ' + css);
  }
  await p.click('[data-ks-zoom="4"]');
  // on display
  await p.click('[data-ks-pin="reed_boat"]');
  const disp = await p.evaluate(() => ({ d: RB.game.s.discovery.display, box: document.querySelector('.ks-display').textContent }));
  assert(disp.d === 'reed_boat' && /Folded Reed Boat/.test(disp.box), 'Put on display: shown at the top of the page');
  await p.screenshot({ path: path.join(OUT, 'ks_found_wide.png') });
  await p.evaluate(() => { RB.ui.menu.open('memories'); });
  await p.waitForTimeout(300);
  const comp = await p.evaluate(() => { const e = document.querySelector('.ks-company'); return e ? e.textContent : ''; });
  assert(/Folded Reed Boat/.test(comp), 'Company › Shared memories shows the keepsake on display');
  await p.screenshot({ path: path.join(OUT, 'ks_company_display.png') });
  await closeMenu();
  // kept across a reload
  await p.evaluate(async () => { RB.save.setCurrent(6, 0); await RB.save.writeSlot(6, RB.game.s, { force: true }); });
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  const ok = await p.evaluate(async () => { RB.ui.title.hide(); return RB.game.loadCampaign(6); });
  await p.waitForTimeout(300);
  const after = await p.evaluate(() => ({ ks: Object.keys(RB.game.s.discovery.keepsakes), d: RB.game.s.discovery.display, hints: RB.game.s.discovery.hints }));
  assert(ok && after.ks.join() === 'reed_boat' && after.d === 'reed_boat', 'after a reload: the keepsake and the display are kept');
  await p.evaluate(() => { window.__found = []; window.__hooked = true; RB.bus.on('keepsake:found', (e) => window.__found.push(e.id)); });
  await p.evaluate(() => RB.game.settings.textSpeed = 'instant');
  // taking it down
  await openPage();
  await p.click('[data-ks-pin="reed_boat"]');
  assert((await p.evaluate(() => RB.game.s.discovery.display)) === null, 'taking it down again');
  await closeMenu();
}

// ---- identical credit with or without assistance ----------------------------------------------------------------------
{
  const recs = {};
  for (const how of ['hand', 'assisted', 'screened']) {
    await start({ comp: 'ren' });
    const r = await solveF1(how === 'screened' ? 'screened' : how);
    recs[how] = r.reed_boat;
  }
  const strip = (x) => JSON.stringify(Object.assign({}, x, { t: 0, how: Object.assign({}, x.how, { method: 0 }) }));
  assert(recs.hand && strip(recs.hand) === strip(recs.assisted) && strip(recs.hand) === strip(recs.screened), 'the keepsake record is the same whether the Protect was handwritten, given with help, or not needed at all');
  assert(!/assist/i.test(JSON.stringify(recs.assisted)), 'nothing in the record marks the assisted route');
  await openPage();
  const cellOf = () => p.evaluate(() => document.querySelector('[data-ks-sel="reed_boat"]').outerHTML.replace(/ on"/g, '"').replace(/aria-pressed="\w+"|data-src="\d+"/g, ''));
  const cellA = await cellOf();
  await closeMenu();
  await start({ comp: 'ren' });
  await solveF1('hand');
  await openPage();
  const cellH = await cellOf();
  assert(cellA === cellH, 'and the catalogue shows it identically' + (cellA === cellH ? '' : ': ' + cellA + ' vs ' + cellH));
  await closeMenu();
}

// ---- Shared Journey counts only the current companion; Atlas Finds from real ownership -----------------------------
{
  await start({ comp: 'nao' });
  await p.evaluate(() => {
    const art = (g) => { g.fillStyle = '#c8503a'; g.fillRect(8, 8, 16, 16); };
    RB.content.keepsakes.__t_nao = { name: { jp: 'テスト', en: 'Test memento N' }, desc: { en: 't' }, region: 'reedwake', source: { kind: 'test', id: 'n' }, category: 'shared', comp: 'nao', hint: { broad: { en: 'b' }, specific: { en: 's' } }, art };
    RB.content.keepsakes.__t_mio = { name: { jp: 'テスト', en: 'Test memento M' }, desc: { en: 't' }, region: 'reedwake', source: { kind: 'test', id: 'm' }, category: 'shared', companion: 'mio', hint: { broad: { en: 'b' }, specific: { en: 's' } }, art };
    RB.discovery.keepsake(RB.game.s, '__t_nao', { kind: 'test', id: 'n' });
  });
  await openPage();
  const tx = await pageText();
  const road = (await reg()).filter((k) => k.cat !== 'shared');
  assert(/Shared Journey with Nao/.test(tx) && /1 of 1/.test(tx) && /Test memento N/.test(tx) && !/Test memento M/.test(tx), 'Shared Journey: only Nao\'s memento, counted 1 of 1');
  assert(tx.indexOf('0 of ' + road.length + ' found') >= 0, 'a memento is not counted among the road\'s keepsakes');
  await closeMenu();
  // Atlas Finds: what is owned, as the Satchel has it
  const atl = await p.evaluate(() => { const A = RB.content.atlas || {}; const id = (A.rewardOrder || []).find((x) => RB.content.items[x]); return id ? { id, en: RB.content.items[id].name.en } : null; });
  if (atl) {
    await p.evaluate((id) => { const s = RB.game.s; s.atlas.unlocked = true; s.inv[id] = 1; }, atl.id);
    await openPage();
    const t2 = await pageText();
    assert(/Atlas Finds/.test(t2) && t2.indexOf(atl.en) >= 0, 'Atlas Finds lists an owned Atlas reward (' + atl.en + ')');
    await closeMenu();
    await p.evaluate((id) => { delete RB.game.s.inv[id]; }, atl.id);
    await openPage();
    const t3 = await pageText();
    assert(t3.indexOf(atl.en) < 0 && /Nothing yet/.test(t3), '… and not one that is not owned');
    await closeMenu();
  } else assert(false, 'an Atlas reward exists to check Atlas Finds with');
  await p.evaluate(() => { delete RB.content.keepsakes.__t_nao; delete RB.content.keepsakes.__t_mio; });
}

// ---- phone ----------------------------------------------------------------------------------------------------------------
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(url);
  await pg.waitForFunction(() => window.__RB_READY__ === true);
  const old = p; p = pg;
  try {
    await start({ comp: 'mio', visited: ['rw.village', 'sg.harbor', 'co.village'] });
    await solveF1('screened');
    await openPage();
    await pg.tap('[data-ks-sel="reed_boat"]');
    await pg.waitForTimeout(200);
    const o = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, over: [...document.querySelectorAll('.ks-page *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1); }).length, cells: [...document.querySelectorAll('.ks-cell')].map((c) => Math.round(c.getBoundingClientRect().height)) }));
    assert(o.sw <= 390 && !o.over && o.cells.every((h) => h >= 44), 'phone: no sideways overflow, cells at least 44 px tall');
    await pg.screenshot({ path: path.join(OUT, 'ks_phone.png'), fullPage: false });
    assert(!errs.length, 'no page errors on the phone');
  } finally { p = old; await ctx.close(); }
}

assert(!errors.length, 'no console or page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
console.log('\n' + (n - fail) + '/' + n + ' checks passed in ' + Math.round((Date.now() - t0) / 1000) + ' s' + (fail ? ' — ' + fail + ' FAILED' : ''));
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
