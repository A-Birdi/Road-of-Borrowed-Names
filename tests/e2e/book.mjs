// U01: the Wayfarer's Ledger as a book (expansion plan 15_INTERFACE; playbook §15A), a preview behind Settings ›
// Display › The Wayfarer's Ledger. Checked here, against the built index.html in Chromium, with a fixture shaped like
// Robin's save (Saltglass, Suzu, Samson the cat, the main road followed):
//  - the classic folio stays the default and keeps its behaviour;
//  - the book offers exactly the classic folio's controls and actions on Journey and Company (UI-A04);
//  - bookmarks stand in a column on wide screens and a row on narrow ones, and the arrow keys move along them (UI-A03);
//  - opening, turning sections and pages, restyling and closing never change the journey (UI-A12, UI-A19);
//  - text and controls rest on a flat plane: no transform on the leaves or their contents at rest (UI-A02);
//  - reduced motion runs no animation; flat draws no texture (UI-A02, UI-A12);
//  - closing hands the world back at once; the closing book shows its pages, cannot be used and is gone in moments;
//  - Settings switches the Ledger's look while it is open;
//  - phones: one leaf, no sideways scrolling, the five bookmarks in view (UI-A15);
//  - the Journey's "Next" says one destination once (UI-A06);
//  - the dialogue strip keeps its speaker and its manual Next (UI-A13);
//  - the preview's type: each role in its embedded face, nothing fetched, and the classic folio makes none (UI-A11).
// Usage: node tests/e2e/book.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 90s')), 90000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 700)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };

const FIXTURE = (style) => {
  if (style) { RB.game.settings.ledgerStyle = style; RB.game.applySettings(); }
  const s = RB.game.debugStart('sg.harbor', 20, 22, { comp: 'suzu', flags: { departed: true, ch1_done: true, rw_echo_done: true, sg_arrived: true } });
  s.player.name = 'Robin'; s.chapter = 2; s.playtime = 3 * 3600 + 27 * 60;
  s.quests = { rw_labels: { stage: 2, done: true, t: 1 }, rw_mill: { stage: 4, done: true, t: 2 }, rw_depart: { stage: 1, done: true, t: 3 }, sg_main: { stage: 8, done: false, t: 9 }, sg_cove: { stage: 1, done: false, t: 7 }, sg_seaglass: { stage: 1, done: false, t: 6 } };
  RB.pets.meet(s, 'cat', { map: 'sg.harbor' }); RB.pets.select(s, 'cat'); s.company.pets.cat.name = 'Samson';
  RB.company.sync && RB.company.sync(s, 'live');
  RB.questGuide.follow('sg_main');
  return true;
};
const open = (p, which) => p.evaluate((w) => { RB.ui.menu.close(); RB.ui.menu.open(w); }, which);
// what each control is and does: its tag, its data-* action and its words (word-help targets counted, not listed)
const ACTIONS = () => {
  const out = [];
  let words = 0;
  for (const el of document.querySelectorAll('.folio:not(.closing) button, .folio:not(.closing) [role="tab"], .folio:not(.closing) summary, .folio:not(.closing) input')) {
    if (el.dataset.i !== undefined) { words++; continue; }
    if (el.closest('.rail-arrow') || el.classList.contains('rail-arrow')) continue; // the rail's scroll arrows are layout, not actions
    const data = [...el.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name + '=' + a.value).sort().join(' ');
    out.push(el.tagName.toLowerCase() + '|' + data + '|' + (el.innerText || '').replace(/\s+/g, ' ').trim());
  }
  return { list: out.sort(), words: document.querySelectorAll('.folio:not(.closing) [data-i]').length };
};
// what the journey holds that browsing must never change (progress, records, choices, the followed quest)
const PROGRESS = () => JSON.stringify((({ chapter, flags, vars, quests, inv, equip, words, company, discovery, awarded, atlas, map, x, y, comp }) =>
  ({ chapter, flags, vars, quests, inv, equip, words, company, discovery, awarded, atlas, map, x, y, comp, items: RB.game.s.learn.items, follow: RB.questGuide.followed(RB.game.s) }))(RB.game.s));
// everything else, without play time, to compare the book with the classic folio
const SNAP = () => JSON.stringify(Object.assign({}, RB.game.s, { playtime: 0 }));
// let finite animations finish (the world's endless ones are left alone)
const settle = (p) => p.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => null))));

await test('the classic folio is the default and keeps its behaviour', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  const def = await p.evaluate(() => RB.game.settings.ledgerStyle);
  assert(def === 'classic', 'default ledgerStyle: ' + def);
  await p.evaluate(FIXTURE, null);
  await open(p, 'journal');
  const o = await p.evaluate(() => ({ book: !!document.querySelector('.folio.book'), ui: document.body.classList.contains('book-ui'), orient: document.querySelector('.tabrail').getAttribute('aria-orientation') }));
  assert(!o.book && !o.ui && o.orient === 'horizontal', 'classic: ' + JSON.stringify(o));
  // Up/Down on a classic tab do nothing (only Left/Right move, as before)
  await p.focus('.ptab[aria-selected="true"]');
  await p.keyboard.press('ArrowDown');
  const sel = await p.evaluate(() => document.querySelector('.ptab[aria-selected="true"]').dataset.id);
  assert(sel === 'journey', 'ArrowDown moved a classic tab to ' + sel);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('the book offers exactly the classic folio\'s controls and actions (Journey, Company)', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, null);
  const read = async () => { const r = {}; for (const w of ['journal', 'companion', 'memories', 'pet']) { await open(p, w); await p.waitForTimeout(150); r[w] = await p.evaluate(ACTIONS); } return r; };
  const classic = await read();
  await p.evaluate(() => { RB.game.settings.ledgerStyle = 'book'; RB.game.applySettings(); });
  const book = await read();
  for (const w of Object.keys(classic)) {
    const a = classic[w].list.join('\n'), c = book[w].list.join('\n');
    if (a !== c) {
      const miss = classic[w].list.filter((x) => !book[w].list.includes(x)), extra = book[w].list.filter((x) => !classic[w].list.includes(x));
      throw new Error(w + ': controls differ; missing in the book: ' + JSON.stringify(miss).slice(0, 300) + '; only in the book: ' + JSON.stringify(extra).slice(0, 300));
    }
    assert(classic[w].words === book[w].words, w + ': word-help targets ' + classic[w].words + ' vs ' + book[w].words);
    assert(classic[w].list.length > 5, w + ': controls read: ' + classic[w].list.length);
  }
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('bookmarks: a column on wide screens, a row on narrow ones; the arrow keys move along them', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, 'book');
  await open(p, 'journal');
  await p.waitForTimeout(400);
  assert(await p.evaluate(() => document.querySelector('.folio.book .tabrail').getAttribute('aria-orientation')) === 'vertical', 'column at 1440');
  await p.focus('.ptab[aria-selected="true"]');
  await p.keyboard.press('ArrowDown');
  let sel = await p.evaluate(() => document.querySelector('.ptab[aria-selected="true"]').dataset.id);
  assert(sel === 'words', 'ArrowDown → words: ' + sel);
  await p.keyboard.press('ArrowUp');
  sel = await p.evaluate(() => document.querySelector('.ptab[aria-selected="true"]').dataset.id);
  assert(sel === 'journey', 'ArrowUp → journey: ' + sel);
  // no edge arrows on the column; the bookmarks stand outside the pages, beside them
  const geo = await p.evaluate(() => {
    const rail = document.querySelector('.tabrail-wrap'), pages = document.querySelector('.folio.book .leafbox').getBoundingClientRect();
    const tabs = [...document.querySelectorAll('.ptab')].map((t) => t.getBoundingClientRect());
    return { over: rail.classList.contains('overflowing'), right: tabs.every((r) => r.left >= pages.right - 30 && r.right <= innerWidth), visible: tabs.every((r) => r.width > 60 && r.height >= 44) };
  });
  assert(!geo.over && geo.right && geo.visible, 'column geometry: ' + JSON.stringify(geo));
  await p.setViewportSize({ width: 820, height: 900 });
  await p.waitForTimeout(400);
  assert(await p.evaluate(() => document.querySelector('.folio.book .tabrail').getAttribute('aria-orientation')) === 'horizontal', 'row at 820');
  await p.focus('.ptab[aria-selected="true"]');
  await p.keyboard.press('ArrowRight');
  sel = await p.evaluate(() => document.querySelector('.ptab[aria-selected="true"]').dataset.id);
  assert(sel === 'words', 'ArrowRight in a row → words: ' + sel);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// browse every section and sub-page; returns the journey before and after, and its progress before and after
async function browse(style, restyle) {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, style);
  const before = await p.evaluate(SNAP), pBefore = await p.evaluate(PROGRESS);
  await open(p, 'journal');
  for (const sec of ['words', 'satchel', 'map', 'company', 'journey']) {
    await p.click('.ptab[data-id="' + sec + '"]');
    await p.waitForTimeout(80);
    // every sub-page the section offers
    const subs = await p.evaluate(() => [...document.querySelectorAll('.folio [data-jv], .folio [data-sub], .folio [data-mv], .folio [data-cp]')].map((e) => { const k = ['jv', 'sub', 'mv', 'cp'].find((x) => e.dataset[x] !== undefined); return '[data-' + k + '="' + e.dataset[k] + '"]'; }));
    for (const q of [...new Set(subs)]) { const h = await p.$('.folio:not(.closing) ' + q); if (h) { await h.click(); await p.waitForTimeout(40); } }
  }
  // choose another quest to read (selection, not following), restyle while open (the book), then close
  await p.click('.ptab[data-id="journey"]');
  await p.evaluate(() => { const e = document.querySelector('.folio [data-q="sg_cove"]'); if (e) e.click(); });
  if (restyle) await p.evaluate(() => { RB.game.settings.ledgerStyle = 'flat'; RB.game.applySettings(); RB.ui.menu.restyle(); RB.game.settings.ledgerStyle = 'book'; RB.game.applySettings(); RB.ui.menu.restyle(); });
  await p.evaluate(() => RB.ui.menu.close());
  const after = await p.evaluate(SNAP), pAfter = await p.evaluate(PROGRESS);
  await ctx.close();
  return { before, after, pBefore, pAfter, errors };
}
await test('opening, turning, restyling and closing never change the journey', async () => {
  const c = await browse(null, false), k = await browse('book', true);
  // no progress, record, choice or followed quest moves; and the book changes nothing the classic folio does not
  assert(k.pBefore === k.pAfter, 'the journey\'s progress changed while browsing the book');
  assert(c.pBefore === c.pAfter, 'the journey\'s progress changed while browsing the classic folio');
  const delta = (r) => { const a = JSON.parse(r.before), z = JSON.parse(r.after), out = []; for (const key of new Set([...Object.keys(a), ...Object.keys(z)])) if (JSON.stringify(a[key]) !== JSON.stringify(z[key])) out.push(key); return out.sort().join(','); };
  assert(delta(c) === delta(k), 'the book changes other parts of the state than the classic folio: classic [' + delta(c) + '] book [' + delta(k) + ']');
  assert(!c.errors.length && !k.errors.length, c.errors.concat(k.errors).join('; '));
});

await test('the reading plane is flat at rest (no transform on the leaves or their text)', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, 'book');
  for (const w of ['journal', 'companion']) {
    await open(p, w);
    await p.click('.ptab[data-id="' + (w === 'journal' ? 'company' : 'journey') + '"]'); // a turn, then back
    await p.click('.ptab[data-id="' + (w === 'journal' ? 'journey' : 'company') + '"]');
    await settle(p);
    const o = await p.evaluate(() => {
      const f = document.querySelector('.folio.book');
      const moved = [...f.querySelectorAll('.leafbox, .leafbox *')].filter((e) => getComputedStyle(e).transform !== 'none' && !e.closest('.co-mount'));
      return { folio: getComputedStyle(f).transform, moved: moved.map((e) => e.tagName + '.' + e.className).slice(0, 5) };
    });
    assert(o.folio === 'none' && !o.moved.length, w + ': at rest ' + JSON.stringify(o));
  }
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('reduced motion runs no animation; flat draws no texture or depth', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, 'book');
  await p.evaluate(() => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
  await open(p, 'journal');
  const anims = await p.evaluate(() => document.querySelector('.folio.book').getAnimations({ subtree: true }).filter((a) => a.playState === 'running').length);
  assert(anims === 0, 'animations running with reduced motion: ' + anims);
  await p.evaluate(() => { RB.game.settings.reducedMotion = false; RB.game.settings.ledgerStyle = 'flat'; RB.game.applySettings(); });
  await open(p, 'journal');
  await p.waitForTimeout(300);
  const flat = await p.evaluate(() => { const l = document.querySelector('.folio.book.book-flat .leaf'); const cs = getComputedStyle(l); return { bg: cs.backgroundImage, shadow: cs.boxShadow, filter: getComputedStyle(document.querySelector('.folio.book .spread')).filter }; });
  assert(flat.bg === 'none' && flat.shadow === 'none' && flat.filter === 'none', 'flat: ' + JSON.stringify(flat));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('closing hands the world back at once; the closing book cannot be used and is soon gone; reopening works', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, 'book');
  await open(p, 'journal');
  await p.waitForTimeout(400);
  const o = await p.evaluate(() => { RB.ui.menu.close(); const g = document.querySelector('.folio-scrim.closing'); const lb = g && g.querySelector('.leafbox'); return { mode: RB.game.mode(), open: RB.ui.menu.isOpen(), ghost: !!g, inert: g ? g.inert : null, leaves: lb ? getComputedStyle(lb).opacity : null }; });
  assert(o.mode !== 'menu' && !o.open && o.ghost && o.inert === true, 'just after close: ' + JSON.stringify(o));
  // the closing book shows its pages as they were (re-attaching it must not replay the leaves' arrival: a blank cover)
  assert(o.leaves === '1', 'the closing book\'s leaves: opacity ' + o.leaves);
  // reopening at once: exactly one live book, and it answers
  await p.evaluate(() => RB.ui.menu.open('companion'));
  const live = await p.evaluate(() => document.querySelectorAll('.folio-scrim:not(.closing) .folio.book').length);
  assert(live === 1, 'live books: ' + live);
  await p.click('.ptab[data-id="journey"]');
  assert(await p.evaluate(() => RB.ui.menu.current().section) === 'journey', 'the reopened book works');
  await p.waitForTimeout(400);
  assert(await p.evaluate(() => !document.querySelector('.folio-scrim.closing')), 'the closing copy is gone');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Settings switches the Ledger\'s look while it is open', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, null);
  await open(p, 'journal');
  await p.click('.folio-foot [data-util="settings"]');
  await p.waitForTimeout(200);
  await p.evaluate(() => { const t = [...document.querySelectorAll('[data-g], .subbtn, button')].find((e) => /Display/.test(e.textContent) && e.offsetParent); if (t) t.click(); });
  await p.waitForTimeout(200);
  await p.click('input[data-set="ledgerStyle"][value="book"]');
  await p.waitForTimeout(200);
  const o = await p.evaluate(() => ({ style: RB.game.settings.ledgerStyle, book: !!document.querySelector('.folio.book'), ui: document.body.classList.contains('book-ui') }));
  assert(o.style === 'book' && o.book && o.ui, 'after choosing the book: ' + JSON.stringify(o));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

for (const [w, h] of [[375, 667], [344, 882], [320, 640]]) {
  await test('phone ' + w + '×' + h + ': one leaf, no sideways scrolling, all five bookmarks in one row', async () => {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: w, height: h }, mobile: true, touch: true });
    await p.evaluate(FIXTURE, 'book');
    for (const sec of ['journal', 'companion']) {
      await open(p, sec);
      await settle(p);
      const o = await p.evaluate(() => ({
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
        leafB: getComputedStyle(document.querySelector('.leaf-b')).display, orient: document.querySelector('.tabrail').getAttribute('aria-orientation'),
        over: document.querySelector('.tabrail-wrap').classList.contains('overflowing'),
        head: (document.querySelector('.bk-runhead .bk-meta') || {}).textContent || '',
        close: (() => { const r = document.querySelector('[data-folio-close]').getBoundingClientRect(); return r.right <= innerWidth && r.top >= 0 && r.height >= 44; })(),
      }));
      assert(o.sw <= o.cw && o.leafB === 'none' && o.orient === 'horizontal' && o.close, sec + ': ' + JSON.stringify(o));
      assert(/Robin/.test(o.head), sec + ': the running head carries who and how long: ' + o.head);
      assert(!o.over, sec + ': the five bookmarks fit without scrolling at ' + w);
    }
    assert(!errors.length, errors.join('; '));
    await ctx.close();
  });
}

await test('the Journey\'s "Next" says one destination once', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, 'book');
  await open(p, 'journal');
  await p.waitForTimeout(200);
  const n = await p.evaluate(() => [...document.querySelectorAll('.folio .qnext .nline')].map((e) => e.innerText.replace(/\s+/g, ' ')));
  assert(n.length === 1 && /Tide Clerk/.test(n[0]), 'Next lines: ' + JSON.stringify(n));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('the dialogue strip keeps its speaker and its manual Next', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, 'book');
  await p.evaluate(() => {
    RB.script.add('@scene t.book\nsuzu: {港|みなと} の {客|きゃく} は {厳|きび}しい 。|| Harbour audiences are tough.\nsuzu: {行|い}こう 。|| Let\'s go.\n', 't');
    window.__done = false; RB.script.run('t.book').then(() => { window.__done = true; });
  });
  await p.waitForSelector('.dlg:not(.hidden) .b-next');
  await settle(p);
  await p.waitForTimeout(600);
  const o = await p.evaluate(() => ({ who: document.querySelector('.dlg .who .nm').textContent, line: document.querySelector('.dlg .main').innerText, ui: document.body.classList.contains('book-ui') }));
  assert(o.ui && o.who === 'Suzu' && /Harbour/.test(o.line), 'strip: ' + JSON.stringify(o));
  await p.waitForTimeout(1500);
  assert(await p.evaluate(() => /Harbour/.test(document.querySelector('.dlg .main').innerText)), 'the line waits for Next (no automatic advance)');
  await p.click('.dlg .b-next');
  try { await p.waitForFunction(() => /Let/.test(document.querySelector('.dlg .main').innerText), null, { timeout: 5000 }); }
  catch (e) { throw new Error('Next did not advance; the line reads: ' + await p.evaluate(() => document.querySelector('.dlg .main').innerText + ' | hidden=' + document.querySelector('.dlg').classList.contains('hidden'))); }
  // a press while the words are still appearing completes the line (the game's rule); Enter on the whole line ends it.
  // The reveal ends one step (at most 180 ms) after its last word shows; a press inside that step only completes the
  // line (existing behaviour, unchanged by the book), so wait it out as a reader would.
  await p.waitForFunction(() => !document.querySelector('.dlg .reveal-hide'), null, { timeout: 5000 }).catch(() => { throw new Error('the line never finished appearing'); });
  await p.waitForTimeout(250);
  await p.keyboard.press('Enter');
  await p.waitForFunction(() => window.__done === true, null, { timeout: 5000 }).catch(async () => { throw new Error('Enter did not end the scene: ' + JSON.stringify(await p.evaluate(() => ({ main: document.querySelector('.dlg .main').innerText, focus: document.activeElement && (document.activeElement.className || document.activeElement.tagName), mode: RB.game.mode && RB.game.mode() })))); });
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('the preview\'s type: each role in its embedded face, nothing fetched; the classic folio makes none', async () => {
  const RB_FACES = () => [...document.fonts].filter((f) => /^"?RB /.test(f.family)).map((f) => f.family.replace(/"/g, '') + ' ' + f.weight + ' ' + f.style + ' ' + f.status);
  // classic: the faces are in the page but never named, so never decoded
  {
    const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
    await p.evaluate(FIXTURE, null);
    await open(p, 'journal');
    await p.waitForTimeout(500);
    const faces = await p.evaluate(RB_FACES);
    assert(faces.length === 0 && !(await p.evaluate(() => RB.bookType.installed())), 'classic makes no font of the preview: ' + faces.join('; '));
    assert(!errors.length && !requests.length, errors.concat(requests).join('; '));
    await ctx.close();
  }
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1440, height: 900 } });
  await p.evaluate(FIXTURE, 'book');
  const first = (q) => p.evaluate((q) => { const e = document.querySelector(q); return e ? getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g, '').trim() : 'none: ' + q; }, q);
  await open(p, 'journal');
  const n = await p.evaluate(() => RB.bookType.install());
  assert(n === 7, 'faces loaded from the page\'s own bytes: ' + n);
  await p.evaluate(() => document.fonts.ready);
  const want = {
    '.folio.book .bk-sec': 'RB Shippori Mincho',                          // the running head (Japanese heading)
    '.folio.book .qdetail h3 .jline': 'RB Shippori Mincho',               // the quest's title
    '.folio.book .qdetail .earlier .jline': 'RB UD Gothic',               // earlier steps (learning text)
    '.folio.book .qdetail .qnext .jline': 'RB UD Gothic',                 // the Next margin note
    '.folio.book .leaf .entry .jline': 'RB UD Gothic',
    '.folio.book .leaf .entry .en': 'RB Vollkorn',                         // English reading text
    '.folio.book .qdetail .en-title': 'RB Vollkorn',
    '.folio.book .ptab': 'RB UD Gothic P',                                 // controls
    '.folio.book .leaf button.pbtn': 'RB UD Gothic P',
  };
  for (const [q, f] of Object.entries(want)) { const got = await first(q); assert(got === f, q + ': ' + got + ' (want ' + f + ')'); }
  await open(p, 'company');
  await p.evaluate(() => document.fonts.ready);
  for (const [q, f] of Object.entries({ '.folio.book .co-name h3 .jline': 'RB Shippori Mincho', '.folio.book .co-thought .jline': 'RB UD Gothic', '.folio.book .co-thought .en': 'RB Vollkorn' })) {
    const got = await first(q); assert(got === f, q + ': ' + got + ' (want ' + f + ')');
  }
  await p.evaluate(() => RB.ui.menu.close());
  await p.evaluate(() => { RB.script.add('@scene t.type\nsuzu: {港|みなと} の {客|きゃく} は {厳|きび}しい 。|| Harbour audiences are tough.\n', 't'); RB.script.run('t.type'); });
  await p.waitForSelector('.dlg:not(.hidden) .b-next');
  for (const [q, f] of Object.entries({ '.dlg .main.en': 'RB Vollkorn', '.dlg .who .nm': 'RB Vollkorn', '.dlg .b-next': 'RB UD Gothic P' })) {
    const got = await first(q); assert(got === f, q + ': ' + got + ' (want ' + f + ')');
  }
  // Japanese leading: the line itself in the learning face
  await p.evaluate(() => { RB.game.settings.lead = 'ja'; RB.ui.dialogue.refresh(); });
  { const got = await first('.dlg .main .jline'); assert(got === 'RB UD Gothic', 'Japanese-led line: ' + got); }
  const faces = await p.evaluate(RB_FACES);
  assert(faces.length === 7 && faces.every((f) => / loaded$/.test(f)), 'book: every embedded face decoded: ' + faces.join('; '));
  assert(!errors.length, errors.join('; '));
  assert(!requests.length, 'nothing fetched: ' + requests.join('; '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
