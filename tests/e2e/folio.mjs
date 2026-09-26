// The pause folio: paper tabs (mouse, keyboard, touch), tab semantics, the
// overlap never stealing a neighbour's taps, focus and Back behaviour, old
// section names, sub-page memory across a resize, and phone composition
// (no horizontal overflow, no clipped tab labels, comfortable targets) at
// 320, 360 and 390 px, including 200% text.
// Usage: node tests/e2e/folio.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const start = (p) => p.evaluate(() => { RB.game.debugStart('sg.harbor', 20, 22, { comp: 'mio', flags: { departed: true, ch1_done: true, sg_arrived: true } }); });
const openMenu = (p, which) => p.evaluate((w) => RB.ui.menu.open(w), which || null);
const state = (p) => p.evaluate(() => ({
  open: RB.ui.menu.isOpen(), mode: RB.game.mode(),
  tabs: Array.from(document.querySelectorAll('.ptab')).map((t) => ({ id: t.dataset.id, sel: t.getAttribute('aria-selected'), ti: t.tabIndex, ctl: t.getAttribute('aria-controls') })),
  panel: (() => { const pn = document.getElementById('folio-page'); return pn ? { role: pn.getAttribute('role'), by: pn.getAttribute('aria-labelledby') } : null; })(),
  focus: document.activeElement && (document.activeElement.dataset.id || document.activeElement.className),
  title: (document.querySelector('.folio-head h2') || {}).textContent,
  sub: (document.querySelector('.subbtn[aria-pressed=true]') || {}).textContent || null,
  settings: RB.ui.settings.isOpen(),
}));

// ---- desktop: mouse, keyboard, semantics ------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p);
  await openMenu(p);
  await p.waitForSelector('.ptab');
  await p.waitForTimeout(60);
  let s = await state(p);
  assert(s.open && s.mode === 'menu', 'menu opens in menu mode');
  assert(s.tabs.map((t) => t.id).join() === 'journey,words,satchel,map', 'four primary tabs in fixed order: ' + s.tabs.map((t) => t.id).join());
  assert(await p.evaluate(() => document.querySelector('.tabrail').getAttribute('role') === 'tablist'), 'rail is a tablist');
  assert(s.tabs.every((t) => t.ctl === 'folio-page') && s.panel && s.panel.role === 'tabpanel' && s.panel.by === 'tab-journey', 'tabs control the tabpanel, which is labelled by the selected tab');
  assert(s.tabs.filter((t) => t.sel === 'true').length === 1 && s.tabs[0].sel === 'true' && s.tabs[0].ti === 0 && s.tabs.slice(1).every((t) => t.ti === -1), 'one selected tab with roving tabindex');
  assert(s.focus === 'journey', 'focus starts on the selected tab (' + s.focus + ')');
  // mouse
  await p.click('.ptab[data-id=satchel]');
  s = await state(p);
  assert(s.tabs[2].sel === 'true' && /Satchel/.test(s.title), 'click selects Satchel and shows its page');
  const order = (await state(p)).tabs.map((t) => t.id).join();
  assert(order === 'journey,words,satchel,map', 'selecting does not reorder the tabs');
  // keyboard: arrows, Home/End, wrap
  await p.focus('.ptab[data-id=satchel]');
  await p.keyboard.press('ArrowRight');
  s = await state(p);
  assert(s.tabs[3].sel === 'true' && s.focus === 'map', 'ArrowRight selects and focuses Map');
  await p.keyboard.press('ArrowRight');
  s = await state(p);
  assert(s.tabs[0].sel === 'true' && s.focus === 'journey', 'ArrowRight wraps to Journey');
  await p.keyboard.press('End');
  assert((await state(p)).focus === 'map', 'End goes to the last tab');
  await p.keyboard.press('Home');
  assert((await state(p)).focus === 'journey', 'Home goes to the first tab');
  await p.keyboard.press('ArrowLeft');
  s = await state(p);
  assert(s.focus === 'map' && s.mode === 'menu', 'ArrowLeft wraps; the game did not act on the arrow');
  // the overlapping faces never take a neighbour's clicks: probe each tab's box edges
  const probe = await p.evaluate(() => {
    const out = [];
    for (const t of document.querySelectorAll('.ptab')) {
      const r = t.getBoundingClientRect();
      for (const [x, y] of [[r.left + 2, r.top + r.height / 2], [r.right - 2, r.top + r.height / 2], [r.left + r.width / 2, r.top + 4], [r.left + r.width / 2, r.top + r.height / 2]]) {
        const hit = document.elementFromPoint(x, y);
        const tab = hit && hit.closest('.ptab');
        if (y > document.querySelector('.leafbox').getBoundingClientRect().top) continue; // tucked part is behind the page by design
        out.push({ id: t.dataset.id, got: tab ? tab.dataset.id : hit && hit.className });
      }
    }
    return out;
  });
  const stolen = probe.filter((x) => x.got !== x.id);
  assert(probe.length >= 12 && !stolen.length, 'every probed point in a tab\'s visible box reaches that tab (' + probe.length + ' probes' + (stolen.length ? '; stolen: ' + JSON.stringify(stolen) : '') + ')');
  const labelsVisible = await p.evaluate(() => Array.from(document.querySelectorAll('.ptab')).every((t) => {
    const l = t.querySelector('.tl').getBoundingClientRect();
    const hit = document.elementFromPoint(l.left + l.width / 2, l.top + l.height / 2);
    const a = t.getBoundingClientRect();
    return hit && hit.closest('.ptab') === t && l.left >= a.left - 0.5 && l.right <= a.right + 0.5;
  }));
  assert(labelsVisible, 'every tab label is unclipped and uncovered');
  // utilities: Settings then Back/Escape unwinds one layer at a time
  await p.click('[data-util=settings]');
  await p.waitForTimeout(80);
  s = await state(p);
  assert(s.settings, 'Settings utility opens the settings folio');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(80);
  s = await state(p);
  assert(!s.settings && s.open, 'Escape closes only Settings, the folio stays');
  await p.click('[data-util=save]');
  await p.waitForTimeout(80);
  assert(await p.evaluate(() => !!document.querySelector('.folio-sheet')), 'Save & Load utility opens the ledger sheet');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(80);
  assert(await p.evaluate(() => !document.querySelector('.folio-sheet') && RB.ui.menu.isOpen()), 'Escape closes the ledger sheet, the folio stays');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(80);
  s = await state(p);
  assert(!s.open && s.mode === 'world', 'Escape then closes the folio back to the world');
  // old section names open the right place
  for (const [old, expTitle, expSub] of [['journal', 'Journey', 'Quests'], ['log', 'Journey', 'Dialogue history'], ['notebook', 'Words', null], ['guide', 'Words', null], ['items', 'Satchel', null], ['map', 'Map', null]]) {
    await openMenu(p, old);
    await p.waitForTimeout(40);
    s = await state(p);
    const okSub = !expSub || (s.sub || '').includes(expSub);
    const guideOk = old !== 'guide' || await p.evaluate(() => /Guide/.test(document.querySelector('.folio .leaf').textContent));
    assert(s.open && s.title.includes(expTitle) && okSub && guideOk, `open('${old}') → ${expTitle}${expSub ? ' › ' + expSub : ''}`);
    await p.evaluate(() => RB.ui.menu.close());
  }
  await openMenu(p, 'settings');
  await p.waitForTimeout(40);
  assert((await state(p)).settings, "open('settings') opens Settings");
  await p.evaluate(() => { RB.ui.settings.close(); RB.ui.menu.close(); });
  // sub-page memory across a resize: Words › Guide stays put from spread to phone
  await openMenu(p, 'guide');
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(200);
  s = await state(p);
  const stillGuide = await p.evaluate(() => /Guide/.test(document.querySelector('.folio .leaf').textContent));
  assert(s.open && s.title.includes('Words') && stillGuide, 'resize from desktop to phone keeps the folio on Words › Guide');
  const wide = await p.evaluate(() => document.querySelector('.spread').classList.contains('two'));
  assert(!wide, 'phone width shows one page, not a shrunken spread');
  assert(!errors.length, 'no page errors (desktop) ' + errors.join('; '));
  await p.context().close();
}

// ---- phones: touch, composition, no overflow ---------------------------------------------------
for (const [w, h, scale] of [[390, 844, 1], [360, 800, 1], [320, 640, 1], [390, 844, 2]]) {
  const { p, errors } = await page(b, url, { viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });
  if (scale !== 1) await p.evaluate((sc) => { RB.game.settings.textScale = sc; RB.game.applySettings(); }, scale);
  await start(p);
  const tag = w + 'x' + h + (scale !== 1 ? ' @' + scale * 100 + '% text' : '');
  for (const sec of ['journey', 'words', 'satchel', 'map']) {
    await openMenu(p, sec);
    await p.waitForTimeout(120);
    const m = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const over = [];
      for (const e of document.querySelectorAll('.folio *')) {
        const r = e.getBoundingClientRect();
        if (!r.width || e.closest('.tabrail, .ribbon') || getComputedStyle(e).visibility === 'hidden') continue;
        if (r.right > vw + 1 || r.left < -1) over.push(e.tagName + '.' + e.className);
      }
      const rail = document.querySelector('.tabrail');
      const tabs = Array.from(document.querySelectorAll('.ptab'));
      const wrap = document.querySelector('.tabrail-wrap');
      // a label is clipped if it spills out of its own tab (the decorative face overflows by design, so compare the label box)
      const clipped = tabs.filter((t) => { const a = t.getBoundingClientRect(), l = t.querySelector('.tl').getBoundingClientRect(); return l.left < a.left - 0.5 || l.right > a.right + 0.5; }).map((t) => t.dataset.id);
      const small = Array.from(document.querySelectorAll('.folio .ptab, .folio .cbtn, .folio .pbtn, .folio .index button, .folio .subbtn')).filter((e) => e.offsetParent && (e.getBoundingClientRect().height < 43.5 || e.getBoundingClientRect().width < 43.5)).map((e) => e.textContent.trim().slice(0, 20));
      return {
        docOverflow: document.documentElement.scrollWidth > vw + 1, over: over.slice(0, 5), clipped, small: small.slice(0, 5),
        railFits: rail.scrollWidth <= rail.clientWidth + 1, arrows: wrap.classList.contains('overflowing'),
        closeVisible: (() => { const c = document.querySelector('[data-folio-close]').getBoundingClientRect(); return c.right <= vw && c.left >= 0; })(),
        two: document.querySelector('.spread').classList.contains('two'),
      };
    });
    assert(!m.docOverflow && !m.over.length, `${tag} ${sec}: nothing wider than the screen` + (m.over.length ? ' ' + m.over.join(', ') : ''));
    assert(!m.clipped.length, `${tag} ${sec}: no tab label clipped` + (m.clipped.length ? ' ' + m.clipped : ''));
    assert(m.railFits || m.arrows, `${tag} ${sec}: tab rail fits, or scrolls with visible arrows`);
    assert(!m.small.length, `${tag} ${sec}: controls at least 44px` + (m.small.length ? ' ' + JSON.stringify(m.small) : ''));
    assert(m.closeVisible && !m.two, `${tag} ${sec}: Close on screen; one page, not a spread`);
    await p.evaluate(() => RB.ui.menu.close());
  }
  // the rail settles when the folio opens: its overflow state and tab positions
  // hold still from the first frame (they once flickered at 320 px)
  const steady = await p.evaluate(async () => {
    RB.ui.menu.open('journey');
    const seen = new Set();
    for (let i = 0; i < 12; i++) {
      const w = document.querySelector('.tabrail-wrap'), t = document.querySelector('.ptab[data-id=words]');
      seen.add(w.classList.contains('overflowing') + ':' + Math.round(t.getBoundingClientRect().left) + ':' + document.querySelector('.tabrail').scrollLeft);
      await new Promise((r) => requestAnimationFrame(r));
    }
    RB.ui.menu.close();
    return Array.from(seen);
  });
  assert(steady.length === 1, `${tag}: tab rail is steady from the first frame (${steady.join(' | ')})`);
  // touch: tapping a tab selects it; the page never moves the world
  await openMenu(p, 'journey');
  await p.waitForTimeout(100);
  const box = await p.evaluate(() => { const t = document.querySelector('.ptab[data-id=words]'); t.scrollIntoView({ inline: 'nearest' }); const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 3 }; });
  const pos0 = await p.evaluate(() => [RB.game.s.x, RB.game.s.y].join());
  await p.touchscreen.tap(box.x, box.y);
  await p.waitForTimeout(120);
  const s = await state(p);
  assert(s.tabs[1].sel === 'true', `${tag}: tap selects Words`);
  // phone sub-page: open a Words contents entry, Back returns to contents, Back again closes
  await p.evaluate(() => { const bt = document.querySelector('.folio .index button'); bt && bt.click(); });
  await p.waitForTimeout(80);
  const inSub = await p.evaluate(() => !!document.querySelector('.folio .backline'));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(80);
  const atIndex = await p.evaluate(() => !!document.querySelector('.folio .index') && RB.ui.menu.isOpen());
  assert(inSub && atIndex, `${tag}: Back leaves a Words sub-page before closing the folio`);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(80);
  const pos1 = await p.evaluate(() => [RB.game.s.x, RB.game.s.y].join());
  assert(!(await p.evaluate(() => RB.ui.menu.isOpen())) && pos0 === pos1, `${tag}: second Back closes; character did not move`);
  assert(!errors.length, `${tag}: no page errors ` + errors.join('; '));
  await p.context().close();
}

await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
