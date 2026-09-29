// Title screen and six-slot travel ledger, driven with real clicks and keys
// against the built index.html (fresh isolated contexts, synthetic saves only).
// Usage: node tests/e2e/title_ledger.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 120s')), 120000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.message || e).slice(0, 600)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

// six synthetic campaigns built from real content ids (like visual.mjs V.sixSlots)
async function seedSix(p, emptyLast) {
  await p.evaluate(async (emptyLast) => {
    const maps = [['rw.village', 22, 30, 'nao'], ['sg.harbor', 20, 22, 'mio'], ['co.village', 20, 18, 'ren'], ['sb.hamlet', 20, 20, 'suzu'], ['lf.town', 26, 20, 'mio'], ['sa.camp', 10, 10, 'ren']];
    const names = ['Robin', 'Aki', 'Wayfarer with a rather long name that keeps going', 'Hana', 'Sora', 'Kei'];
    for (let i = 0; i < 6; i++) {
      if (emptyLast && i === 5) continue;
      const [m, x, y, c] = maps[i];
      const s = RB.game.debugStart(m, x, y, { comp: c, profile: 'E', flags: { departed: true } });
      s.player.name = names[i]; s.chapter = i + 1; s.playtime = 1800 * (i + 1) + 77;
      await new Promise((r) => setTimeout(r, 90));
      await RB.save.writeSlot(i + 1, s, { force: true, thumb: RB.render.thumbnail() });
    }
    await RB.game.toTitle();
  }, !!emptyLast);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
}
async function ctxPage(vp, opts = {}) {
  const ctx = await b.newContext({ viewport: vp || { width: 1280, height: 800 }, hasTouch: !!opts.touch, isMobile: !!opts.touch });
  if (opts.init) await ctx.addInitScript(opts.init);
  const r = await page(b, url, { context: ctx });
  // touch contexts use real taps (a mouse pointer passing over Japanese text opens hover help)
  const hit = (sel) => (opts.touch ? r.p.tap(sel) : r.p.click(sel));
  return Object.assign(r, { ctx, hit });
}
// visible controls inside a container that are narrower/shorter than 44 px,
// and anything poking out past the right edge of the viewport
async function layoutProblems(p, scope) {
  return p.evaluate((scope) => {
    const out = [];
    const W = window.innerWidth;
    if (document.documentElement.scrollWidth > W + 1) out.push('page scrollWidth ' + document.documentElement.scrollWidth + ' > ' + W);
    const root = document.querySelector(scope);
    if (!root) return ['no ' + scope];
    for (const el of root.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || el.closest('[hidden]')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      if (r.right > W + 1.5 || r.left < -1.5) out.push('outside viewport: ' + el.tagName + '.' + el.className + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
      if (el.matches('button') && !el.closest('.jline') && (r.height < 43.5 || r.width < 43.5)) out.push('small control: ' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
    for (const sc of root.querySelectorAll('.leaf, .title, .tmenu, .deck')) if (sc.scrollWidth > sc.clientWidth + 1) out.push('horizontal overflow in .' + sc.className + ' ' + sc.scrollWidth + '>' + sc.clientWidth);
    return out.slice(0, 12);
  }, scope);
}

// ---------------------------------------------------------------------------
await test('first visit: New Game has focus, no Continue, no word help over the title', async () => {
  const { p, errors, ctx, hit } = await ctxPage({ width: 390, height: 844 }, { touch: true });
  await p.waitForTimeout(400);
  const st = await p.evaluate(() => ({ focus: document.activeElement && document.activeElement.getAttribute('data-a'), jt: !!(document.activeElement && document.activeElement.closest('.jt')), help: !!document.querySelector('.help'), cont: !!document.querySelector('.title [data-a=continue]:not(.hidden)') }));
  assert(st.focus === 'new' && !st.jt, 'initial focus: ' + JSON.stringify(st));
  assert(!st.help, 'word help card opened on the title');
  assert(!st.cont, 'Continue shown without any save');
  // the subtitle still has furigana and its words still give help on tap
  assert(await p.locator('.title .mast-jp rt').count() >= 3, 'subtitle furigana missing');
  await p.locator('.title .mast-jp .jt').first().tap();
  await p.waitForSelector('.help');
  await p.mouse.click(5, 420); // dismiss by tapping elsewhere
  // touch guidance, not the keyboard paragraph
  assert(await p.locator('.title .g-touch').isVisible(), 'touch guidance hidden on a touch device');
  assert(!(await p.locator('.title .g-keys').isVisible()), 'keyboard guidance shown on a touch device');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('with a save: Continue is shown, focused and names the journey; Enter continues into a visible world', async () => {
  const { p, errors, ctx } = await ctxPage({ width: 1280, height: 800 });
  await seedSix(p, true);
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.waitForSelector('.title [data-a=continue]:not(.hidden)');
  await p.waitForTimeout(200);
  const st = await p.evaluate(() => ({ focus: document.activeElement && document.activeElement.getAttribute('data-a'), help: !!document.querySelector('.help'), sub: document.querySelector('.title [data-cont]').textContent }));
  assert(st.focus === 'continue', 'focus should be on Continue: ' + JSON.stringify(st));
  assert(!st.help, 'word help opened on the title');
  assert(/Sora/.test(st.sub) && /played/.test(st.sub), 'Continue does not name the newest journey: ' + st.sub);
  assert(await p.locator('.title .g-keys').isVisible(), 'keyboard guidance missing on desktop');
  // arrows move through the menu; back up and confirm Continue with Enter
  await p.keyboard.press('ArrowDown');
  assert((await p.evaluate(() => document.activeElement.getAttribute('data-a'))) === 'new', 'ArrowDown did not reach New Game');
  await p.keyboard.press('ArrowUp');
  await p.evaluate(() => { window.__ov = 'unset'; const so = RB.render.setOverride; RB.render.setOverride = (f) => { window.__ov = f; so(f); }; window.__spr = 0; const g = RB.sprites.get; RB.sprites.get = function (...a) { window.__spr++; return g.apply(this, a); }; });
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => RB.game.mode() === 'world' && RB.game.s && RB.game.s.player.name === 'Sora');
  await p.waitForTimeout(250);
  const w = await p.evaluate(() => ({ ov: window.__ov, spr: window.__spr, title: !!document.querySelector('.title') }));
  assert(w.ov === null && w.spr > 0 && !w.title, 'world not rendering after Continue: ' + JSON.stringify({ ov: String(w.ov), spr: w.spr, title: w.title }));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('storage status: short line with expandable details; session-only stays prominent', async () => {
  const { p, errors, ctx } = await ctxPage({ width: 390, height: 844 });
  const line = p.locator('.title .storage-banner');
  assert(/saving works/i.test(await line.innerText()), 'short status: ' + await line.innerText());
  assert(!(await p.locator('#st-det').isVisible()), 'details should start folded');
  const more = p.locator('.title [data-a=storage]');
  assert((await more.getAttribute('aria-expanded')) === 'false', 'aria-expanded');
  await more.click();
  assert(await p.locator('#st-det').isVisible(), 'details did not open');
  assert((await more.getAttribute('aria-expanded')) === 'true', 'aria-expanded after open');
  assert(/IndexedDB/.test(await p.locator('#st-det').innerText()), 'details text');
  await more.click();
  assert(!(await p.locator('#st-det').isVisible()), 'details did not fold');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
  // a browser context that refuses storage
  const s = await ctxPage({ width: 390, height: 844 }, {
    init: () => {
      Object.defineProperty(window, 'indexedDB', { get() { throw new Error('blocked'); } });
      const bad = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() {}, key() { return null; }, length: 0 };
      Object.defineProperty(window, 'localStorage', { get() { return bad; } });
    },
  });
  assert((await s.p.evaluate(() => RB.save.status().mode)) === 'session', 'not session mode');
  const bad = s.p.locator('.title .st-bad');
  assert(await bad.isVisible(), 'session-only warning not visible');
  const txt = await bad.innerText();
  assert(/session only/i.test(txt) && /lost/i.test(txt), 'session warning text: ' + txt);
  assert(await s.p.locator('.title [data-a=storage]').count() === 0, 'session-only warning must not be folded behind Details');
  await s.p.click('.title [data-a=load]');
  assert(await s.p.locator('.folio-ledger .note-slip.bad').isVisible(), 'ledger lacks the session-only warning');
  assert(!s.errors.length, s.errors.join('; '));
  await s.ctx.close();
});

// ---------------------------------------------------------------------------
for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  await test(`ledger ${vp.width}x${vp.height}: six filled records, then one empty; Back and Escape close only the ledger`, async () => {
    const { p, errors, ctx, hit } = await ctxPage(vp, { touch: vp.width < 700 });
    await seedSix(p, false);
    await hit('.title [data-a=load]');
    await p.waitForSelector('.folio-ledger .rec');
    await p.waitForTimeout(250);
    const recs = await p.evaluate(() => Array.from(document.querySelectorAll('.folio-ledger .rec')).map((r) => {
      const img = r.querySelector('.rec-thumb img');
      const box = r.getBoundingClientRect();
      return { slot: r.dataset.slot, img: !!img && img.complete && img.naturalWidth > 0, text: r.innerText, x: Math.round(box.left), load: !!r.querySelector('[data-a=load]') };
    }));
    assert(recs.length === 6, 'records: ' + recs.length);
    for (const r of recs) {
      assert(r.img, 'slot ' + r.slot + ' has no real thumbnail');
      assert(/Slot \d/i.test(r.text) && /played/.test(r.text) && /saved/.test(r.text) && r.load, 'slot ' + r.slot + ' record incomplete: ' + r.text.replace(/\s+/g, ' ').slice(0, 160));
    }
    assert(/Aki\s*&\s*Mio/.test(recs[1].text) && /Saltglass/.test(recs[1].text), 'slot 2 names/place: ' + recs[1].text.replace(/\s+/g, ' '));
    assert(/rather long name/.test(recs[2].text), 'long name missing');
    const cols = new Set(recs.map((r) => r.x)).size;
    if (vp.width < 700) assert(cols === 1, 'phone ledger should be one column, got ' + cols);
    else assert(cols === 2, 'desktop ledger should be a two-page spread, got ' + cols + ' columns');
    const probs = await layoutProblems(p, '.folio-ledger');
    assert(!probs.length, 'layout: ' + probs.join(' | '));
    // Escape closes only the ledger
    await p.keyboard.press('Escape');
    await p.waitForTimeout(100);
    assert(await p.locator('.folio-ledger').count() === 0 && await p.locator('.title').count() === 1, 'Escape did not return to the title');
    // an empty slot reads as empty, with no load action
    await p.evaluate(() => RB.save.del(6));
    await hit('.title [data-a=load]');
    const six = p.locator('.folio-ledger .rec[data-slot="6"]');
    await six.waitFor();
    assert(/empty/i.test(await six.innerText()) && await six.locator('button').count() === 0, 'empty slot 6: ' + await six.innerText());
    await hit('.folio-ledger [data-folio-close]');
    assert(await p.locator('.folio-ledger').count() === 0 && await p.locator('.title').count() === 1, 'Back did not return to the title');
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

// ---------------------------------------------------------------------------
await test('Manage → Delete asks first and Cancel keeps the save; Copy duplicates into an empty slot', async () => {
  const { p, errors, ctx, hit } = await ctxPage({ width: 390, height: 844 }, { touch: true });
  await seedSix(p, true);
  await hit('.title [data-a=load]');
  const r2 = p.locator('.rec[data-slot="2"]');
  await r2.waitFor();
  assert(!(await r2.locator('[data-a=delete]').isVisible()), 'Delete should sit in the folded Manage area');
  const mg = r2.locator('[data-a=manage]');
  assert(/manage/i.test(await mg.innerText()), 'Manage is not plainly labelled');
  await mg.tap();
  assert((await mg.getAttribute('aria-expanded')) === 'true', 'Manage did not open');
  const del = r2.locator('[data-a=delete]');
  assert(/delete/i.test(await del.innerText()), 'Delete not labelled');
  await del.tap();
  await p.waitForSelector('[role=alertdialog]');
  assert(/cannot be undone/i.test(await p.textContent('[role=alertdialog]')), 'no destructive confirmation');
  await p.click('[role=alertdialog] button:has-text("Cancel")');
  await p.waitForTimeout(150);
  const still = await p.evaluate(async () => { const l = await RB.save.list(); return l[1].manual && l[1].meta.name; });
  assert(still === 'Aki', 'slot 2 changed after Cancel: ' + still);
  // Copy slot 2 into the empty slot 6
  if (!(await p.locator('.rec[data-slot="2"] [data-a=copy]').isVisible())) await hit('.rec[data-slot="2"] [data-a=manage]');
  await hit('.rec[data-slot="2"] [data-a=copy]');
  await p.waitForSelector('[role=alertdialog]');
  await p.click('[role=alertdialog] button:has-text("Slot 6 (empty)")');
  await p.waitForFunction(async () => { const l = await RB.save.list(); return !l[5].empty; });
  const six = p.locator('.rec[data-slot="6"]');
  await p.waitForFunction(() => /Aki/.test((document.querySelector('.rec[data-slot="6"]') || {}).innerText || ''));
  assert(await six.locator('.rec-thumb img').count() === 1, 'copy lacks the thumbnail');
  const ids = await p.evaluate(async () => [(await RB.save.read(2, 'manual')).state.id, (await RB.save.read(6, 'manual')).state.id]);
  assert(ids[0] && ids[1] && ids[0] !== ids[1], 'copy is not an independent campaign');
  // Delete for real: confirm, the record becomes empty
  if (!(await p.locator('.rec[data-slot="6"] [data-a=delete]').isVisible())) await hit('.rec[data-slot="6"] [data-a=manage]');
  await hit('.rec[data-slot="6"] [data-a=delete]');
  await p.click('[role=alertdialog] button:has-text("Delete")');
  await p.waitForFunction(() => /empty/i.test((document.querySelector('.rec[data-slot="6"]') || {}).innerText || ''));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('loading a slot by click enters the world with world rendering (no title override)', async () => {
  const { p, errors, ctx } = await ctxPage({ width: 1280, height: 800 });
  await seedSix(p, true);
  await p.click('.title [data-a=load]');
  await p.evaluate(() => { window.__ov = 'unset'; const so = RB.render.setOverride; RB.render.setOverride = (f) => { window.__ov = f; so(f); }; window.__spr = 0; const g = RB.sprites.get; RB.sprites.get = function (...a) { window.__spr++; return g.apply(this, a); }; });
  await p.click('.rec[data-slot="3"] [data-a=load]');
  await p.waitForFunction(() => RB.game.mode() === 'world' && RB.game.s && RB.game.s.map === 'co.village');
  await p.waitForTimeout(250);
  const w = await p.evaluate(() => ({ ov: window.__ov, spr: window.__spr, title: !!document.querySelector('.title'), ledger: !!document.querySelector('.folio-ledger'), panel: document.body.classList.contains('in-panel') }));
  assert(w.ov === null, 'render override not cleared after load: ' + String(w.ov));
  assert(w.spr > 0 && !w.title && !w.ledger && !w.panel, 'world not shown cleanly: ' + JSON.stringify(w));
  // in game: Save & Load sheet → Load… → load another slot; the pause folio's sheet must not stay open
  await p.evaluate(() => RB.ui.menu.open());
  await p.click('[data-util=save]');
  await p.click('.folio-sheet [data-a=save]');
  await p.waitForSelector('.folio-ledger .rec');
  const cur = p.locator('.rec.current');
  assert(await cur.count() === 1 && /this journey/i.test(await cur.innerText()), 'current journey not marked in the save ledger');
  // save this journey into the empty slot 6 by click; the record fills in with a thumbnail
  await p.click('.rec[data-slot="6"] [data-a=save]');
  await p.waitForFunction(() => /Wayfarer/.test((document.querySelector('.rec[data-slot="6"]') || {}).innerText || ''));
  assert(await p.locator('.rec[data-slot="6"] .rec-thumb img').count() === 1, 'saved record lacks its thumbnail');
  const saved = await p.evaluate(async () => { const l = await RB.save.list(); return l[5].manual && l[5].meta.place; });
  assert(saved === 'Cinder Orchard', 'slot 6 after Save here: ' + saved);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(100);
  assert(await p.locator('.folio-ledger').count() === 0 && await p.locator('.folio-sheet').count() === 1, 'Escape should close only the ledger');
  await p.click('.folio-sheet [data-a=load]');
  await p.click('.rec[data-slot="1"] [data-a=load]');
  await p.click('[role=alertdialog] button:has-text("Load")');
  await p.waitForFunction(() => RB.game.mode() === 'world' && RB.game.s.player.name === 'Robin');
  await p.waitForTimeout(200);
  const after = await p.evaluate(() => ({ top: RB.ui.topLayer() && RB.ui.topLayer().name, folios: document.querySelectorAll('.folio-scrim').length }));
  assert(!after.top && after.folios === 0, 'layers left over the world after loading from the game: ' + JSON.stringify(after));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
for (const w of [320, 360, 390]) {
  await test(`no overflow and 44 px controls at ${w} px wide, normal and 200% text (title, ledger)`, async () => {
    const { p, errors, ctx, hit } = await ctxPage({ width: w, height: w === 320 ? 640 : 800 }, { touch: true });
    await seedSix(p, true);
    for (const scale of [1, 2]) {
      await p.evaluate((sc) => { RB.game.settings.textScale = sc; RB.game.applySettings(); }, scale);
      await p.waitForTimeout(150);
      let probs = await layoutProblems(p, '.title');
      assert(!probs.length, 'title @' + scale + 'x: ' + probs.join(' | '));
      // every menu action is reachable by scrolling the title's one scroll surface
      const last = p.locator('.title [data-a=about]');
      await last.scrollIntoViewIfNeeded();
      assert(await last.isVisible(), 'About unreachable');
      await hit('.title [data-a=load]');
      await p.waitForSelector('.folio-ledger .rec');
      await hit('.rec[data-slot="3"] [data-a=manage]');
      probs = await layoutProblems(p, '.folio-ledger');
      assert(!probs.length, 'ledger @' + scale + 'x: ' + probs.join(' | '));
      await hit('.folio-ledger [data-folio-close]');
    }
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

// ---------------------------------------------------------------------------
// the scene behind the title: the noren and the moon keep clear of the title
// wherever the page puts it, the title clears the open door, and the sky is
// alive (twinkling, a shooting star, a comet) except with reduced motion
for (const [w, h, layout, noren] of [[1280, 800, 'wide/s', true], [900, 1000, 'wide/centred', false], [390, 844, 'tall/centred', false], [844, 390, 'wide/sl', true]]) {
  await test(`title scene ${w}x${h}: ${layout}, moon and noren clear of the title and folio`, async () => {
    const { p, ctx, errors } = await ctxPage({ width: w, height: h });
    await p.waitForFunction(() => RB.ui.title.sky().layout && RB.ui.title.sky().live);
    const r = await p.evaluate(() => {
      const st = RB.ui.title.sky(), cv = document.querySelector('canvas').getBoundingClientRect();
      // the words themselves (the heading's box spans its whole grid column)
      const box = (sel) => {
        const e = document.querySelector(sel); if (!e) return null;
        const rs = [];
        if (sel === '.title .deck') rs.push(e.getBoundingClientRect());
        else { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), rg = document.createRange(); for (let n = w.nextNode(); n; n = w.nextNode()) if (n.nodeValue.trim()) { rg.selectNodeContents(n); rs.push(...rg.getClientRects()); } }
        return rs.length ? { l: Math.min(...rs.map((q) => q.left)), r: Math.max(...rs.map((q) => q.right)), t: Math.min(...rs.map((q) => q.top)), b: Math.max(...rs.map((q) => q.bottom)) } : null;
      };
      return { st, cv: { l: cv.left, t: cv.top, w: cv.width, h: cv.height }, h1: box('.title h1'), jp: box('.title .mast-jp'), deck: box('.title .deck') };
    });
    const { st, cv } = r;
    assert(st.layout === layout, 'layout ' + st.layout + ', expected ' + layout);
    assert(st.noren === noren, 'noren ' + st.noren);
    assert(st.stars > 10, 'only ' + st.stars + ' stars');
    const m = { x: cv.l + st.moon[0] * cv.w, y: cv.t + st.moon[1] * cv.h, r: st.moon[2] * cv.w + 2 };
    for (const k of ['h1', 'jp', 'deck']) {
      const q = r[k];
      const hit = q && m.x + m.r > q.l && m.x - m.r < q.r && m.y + m.r > q.t && m.y - m.r < q.b;
      assert(!hit, 'the moon at ' + Math.round(m.x) + ',' + Math.round(m.y) + ' is behind the ' + k);
    }
    if (layout.startsWith('wide/s')) assert(r.h1.l >= cv.l + st.door * cv.w + 4, 'the title starts at ' + Math.round(r.h1.l) + ' over the open door (to ' + Math.round(cv.l + st.door * cv.w) + ')');
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}
await test('title sky: a shooting star and a comet cross it; reduced motion holds it still', async () => {
  const { p, ctx, errors } = await ctxPage({ width: 1280, height: 800 });
  await p.waitForFunction(() => RB.ui.title.sky().live);
  await p.evaluate(() => RB.ui.title.sky.soon());
  await p.waitForFunction(() => RB.ui.title.sky().meteor && RB.ui.title.sky().comet, null, { timeout: 3000 });
  await p.screenshot({ path: 'tests/e2e/out/title_sky.png' });
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; });
  await p.waitForFunction(() => { const s = RB.ui.title.sky(); return !s.live && !s.meteor && !s.comet; }, null, { timeout: 3000 });
  await p.waitForTimeout(300);
  const still = await p.evaluate(() => RB.ui.title.sky());
  assert(!still.live && !still.meteor, 'reduced motion: the sky still moves ' + JSON.stringify(still));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Settings and About open from the title and Back returns to it', async () => {
  const { p, errors, ctx, hit } = await ctxPage({ width: 390, height: 844 }, { touch: true });
  await hit('.title [data-a=settings]');
  await p.waitForSelector('.folio-settings');
  assert(/preferences for every campaign/i.test(await p.textContent('.folio-settings .folio-head')), 'settings without a campaign');
  await hit('.folio-settings [data-folio-close]');
  await p.waitForTimeout(100);
  assert(await p.locator('.folio-settings').count() === 0 && await p.locator('.title').count() === 1, 'settings did not close to the title');
  await hit('.title [data-a=about]');
  await p.waitForSelector('.folio-about');
  assert(/third-party data/i.test(await p.textContent('.folio-about')), 'about content');
  const probs = await layoutProblems(p, '.folio-about');
  assert(!probs.length, 'about layout: ' + probs.join(' | '));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(100);
  assert(await p.locator('.folio-about').count() === 0 && await p.locator('.title').count() === 1, 'about did not close to the title');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('keyboard: open the ledger from the title and close it; focus returns without a help card', async () => {
  const { p, errors, ctx } = await ctxPage({ width: 1280, height: 800 });
  await seedSix(p, true);
  await p.waitForTimeout(200);
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown');
  assert((await p.evaluate(() => document.activeElement.getAttribute('data-a'))) === 'load', 'arrows did not reach Load');
  await p.keyboard.press('Enter');
  await p.waitForSelector('.folio-ledger .rec');
  await p.waitForTimeout(100);
  const f = await p.evaluate(() => { const a = document.activeElement; return { a: a.getAttribute('data-a'), slot: a.closest('[data-slot]') && a.closest('[data-slot]').dataset.slot }; });
  assert(f.a === 'load' && f.slot === '1', 'ledger focus should start on slot 1 Load: ' + JSON.stringify(f));
  await p.keyboard.press('ArrowDown');
  assert(await p.evaluate(() => !!document.activeElement.closest('.folio-ledger')), 'arrow navigation left the ledger');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  const back = await p.evaluate(() => ({ a: document.activeElement.getAttribute('data-a'), help: !!document.querySelector('.help'), ledger: !!document.querySelector('.folio-ledger') }));
  assert(!back.ledger && back.a === 'load' && !back.help, 'after Escape: ' + JSON.stringify(back));
  // Settings closing back to the title must not land on a Japanese word either
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
  await p.waitForSelector('.folio-settings');
  await p.keyboard.press('Escape'); await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  const st = await p.evaluate(() => ({ settings: !!document.querySelector('.folio-settings'), help: !!document.querySelector('.help'), jt: !!document.activeElement.closest('.jt'), a: document.activeElement.getAttribute('data-a') }));
  assert(!st.settings && !st.help && !st.jt && st.a, 'after Settings: ' + JSON.stringify(st));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('an unreadable record stays readable and its autosave can be recovered; a read-only tab cannot press Save on its journey', async () => {
  const { p, errors, ctx } = await ctxPage({ width: 1280, height: 800 });
  await seedSix(p, true);
  await p.evaluate(async () => {
    const good = (await RB.save.read(4, 'manual')).state;
    await RB.save.writeRecovery(4, good, 'auto', null);
    const bad = JSON.parse(JSON.stringify(good)); bad.map = 'no.such.map';
    await RB.save.writeSlot(4, bad, { force: true });
  });
  await p.click('.title [data-a=load]');
  const r4 = p.locator('.rec[data-slot="4"]');
  await r4.waitFor();
  const t4 = await r4.innerText();
  assert(/unreadable/i.test(t4) && /left untouched/i.test(t4) && /no\.such\.map/.test(t4), 'corrupt record text: ' + t4);
  assert(await r4.locator('[data-a=load]').count() === 0, 'an unreadable record offers Load');
  await p.click('.rec[data-slot="4"] [data-a=manage]');
  await p.click('.rec[data-slot="4"] [data-a=loadauto]');
  await p.waitForFunction(() => RB.game.mode() === 'world' && RB.game.s && RB.game.s.player.name === 'Hana');
  const raw = await p.evaluate(async () => (await RB.save.list())[3].corrupt);
  assert(raw === true, 'the unreadable record was changed by recovering');
  // another tab took this campaign over: Save on it is shown but disabled
  await p.evaluate(() => { RB.save.setReadOnly(true); RB.ui.menu.open(); });
  await p.click('[data-util=save]');
  await p.click('.folio-sheet [data-a=save]');
  await p.waitForSelector('.folio-ledger .rec');
  assert(await p.locator('.folio-ledger .note-slip.warn').isVisible(), 'read-only warning missing');
  const save4 = p.locator('.rec[data-slot="4"] [data-a=save]');
  assert(await save4.isDisabled() && /read-only/i.test(await save4.innerText()), 'read-only Save should be disabled and say why');
  assert(await p.locator('.rec[data-slot="6"] [data-a=save]').isEnabled(), 'saving to another slot should stay possible');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close(); srv.close();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
