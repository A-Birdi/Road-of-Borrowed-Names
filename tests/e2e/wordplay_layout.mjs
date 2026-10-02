// Companion shiritori: layouts, captures and the Japanese interface (Practice addendum §20.2,
// §14.4, §14.6). Built index.html, synthetic campaigns, the TEST-ONLY fixture bank. At
// 320×640 (and at 200 % text), 390×844, 844×390 and 1280×800: the preparation sheet, the
// table (writing, choosing), a result, the Company card and a look back fit with no sideways
// scroll, principal controls are at least 44×44 CSS px, and the required kana stays on screen.
// All four companions are captured at the table (with a pet resting beside one of them), and
// the table's labels follow Settings › Interface language = Japanese. Reduced motion keeps
// every rule cue. Captures: tests/e2e/out/wordplay/ (--docs copies a curated set to
// docs/screenshots/wordplay/).
// Usage: node tests/e2e/wordplay_layout.mjs [--docs]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { fixtureDef } from './wordplay_fixture.mjs';

const DOCS = process.argv.includes('--docs');
const OUT = path.join(root, 'tests/e2e/out/wordplay');
const DOC = path.join(root, 'docs/screenshots/wordplay');
fs.mkdirSync(OUT, { recursive: true });
if (DOCS) fs.mkdirSync(DOC, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0, pass = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else { pass++; console.log('ok   ' + m); } };
// docs: WebP at full scale (small enough for the repository), like tests/e2e/shots_to_docs.mjs
let conv = null;
async function toWebp(src, dst) {
  conv = conv || await b.newPage();
  const data = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
  const b64 = await conv.evaluate(async (data) => {
    const img = new Image(); img.src = data; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.86).split(',')[1];
  }, data);
  fs.writeFileSync(dst, Buffer.from(b64, 'base64'));
}
const shot = async (p, name) => { const f = path.join(OUT, name + '.png'); await p.evaluate(() => document.querySelectorAll('#overlay .notices > *').forEach((n) => n.remove())); await p.screenshot({ path: f }); if (DOCS) await toWebp(f, path.join(DOC, name + '.webp')); return f; };

async function begin(p, comp, o) {
  o = o || {};
  await p.evaluate(([def, comp, o]) => {
    RB.shiritori.addBank(def);
    const map = 'co.inn';
    const d = RB.content.maps[map] || {};
    const seen = {};
    for (const ev of d.onEnter || []) seen['enter:' + map + ':' + ev.scene] = true;
    const s = RB.game.debugStart(map, 6, 8, { comp, flags: Object.assign({ departed: true, ch1_done: true }, seen) });
    s.chapter = 2;
    RB.practice.set(s, 'demoSeen', true);
    if (o.pet && RB.pets && RB.petArt) {
      s.company.pets[o.pet] = { name: 'Mochi', reading: 'もち', look: RB.petArt.LOOK_ORDER[o.pet][0], met: { t: 1, map }, nameAtMeet: 'Mochi' };
      s.company.pet = o.pet;
    }
    RB.company.sync(s, 'live');
    RB.ui.wordplay.launch({ source: 'words' });
  }, [fixtureDef('pocket'), comp, o]);
  await p.waitForSelector('.wp-prep');
  await p.waitForTimeout(150);
}
async function table(p) {
  await p.locator('.wp-leaf [data-wp="start"]').click();
  await p.waitForSelector('.wp-table');
  // the companion may respond first: wait for your turn
  for (let i = 0; i < 100; i++) { if (await p.evaluate(() => { const a = RB.wordplay.ns(RB.game.s).active; return a && a.st.next === 'pc' && !a.cpuMove; })) break; await p.waitForTimeout(40); }
  await p.waitForTimeout(200);
}
// sideways overflow, small principal targets, the required kana in view
const audit = (p, sel) => p.evaluate((sel) => {
  const leaf = document.querySelector('.wp-leaf');
  const over = Array.from(document.querySelectorAll('.wp-leaf, .wp-leaf *')).filter((e) => e.scrollWidth > e.clientWidth + 2 && !['visible', 'hidden', 'clip'].includes(getComputedStyle(e).overflowX) && e.clientWidth > 0)
    .map((e) => (e.className && e.className.baseVal == null ? e.className : e.tagName) + ':' + e.scrollWidth + '>' + e.clientWidth).slice(0, 5);
  const wide = Array.from(document.querySelectorAll('.wp-leaf *')).filter((e) => { const r = e.getBoundingClientRect(); const L = leaf.getBoundingClientRect(); return r.width > 0 && (r.right > L.right + 2 || r.left < L.left - 2) && getComputedStyle(e).position !== 'absolute'; }).map((e) => e.className || e.tagName).slice(0, 5);
  const small = Array.from(document.querySelectorAll(sel)).filter((x) => x.offsetParent && x.getClientRects().length).filter((x) => { const r = x.getBoundingClientRect(); return r.height < 43.5 || r.width < 43.5; }).map((x) => (x.dataset.wp || x.dataset.wpTab || x.className) + ' ' + Math.round(x.getBoundingClientRect().width) + 'x' + Math.round(x.getBoundingClientRect().height));
  return { hscroll: document.documentElement.scrollWidth > innerWidth + 1 || (leaf && leaf.scrollWidth > leaf.clientWidth + 2), over, wide, small };
}, sel);
const PRINCIPAL = '.wp-leaf .wp-tab, .wp-leaf [data-wp="play"], .wp-leaf [data-wp="clear"], .wp-leaf [data-wp="stuck"], .wp-leaf [data-wp="leave"], .wp-leaf [data-wp="rules"], .wp-leaf .wp-word, .wp-leaf [data-wp="start"], .wp-leaf .wp-opt, .wp-leaf [data-wp="rematch"], .wp-leaf [data-wp="change"], .wp-leaf [data-wp="look"], .wp-folio [data-folio-close]';

const VPS = [
  { w: 320, h: 640, scale: 1, comp: 'mio', touch: true },
  { w: 320, h: 640, scale: 2, comp: 'ren', touch: true },
  { w: 390, h: 844, scale: 1, comp: 'suzu', touch: true },
  { w: 844, h: 390, scale: 1, comp: 'nao', touch: true },
  { w: 1280, h: 800, scale: 1, comp: 'mio' },
];
for (const vp of VPS) {
  const tag = vp.w + 'x' + vp.h + (vp.scale > 1 ? '_text200' : '');
  const { p, errors, requests } = await page(b, url, { viewport: { width: vp.w, height: vp.h }, touch: !!vp.touch, mobile: !!vp.touch });
  await p.evaluate((sc) => { RB.game.settings.textScale = sc; RB.game.applySettings(); }, vp.scale);
  await begin(p, vp.comp);
  let a = await audit(p, PRINCIPAL);
  assert(!a.hscroll && !a.over.length && !a.wide.length && !a.small.length, tag + ': the preparation sheet fits, targets ≥ 44 px (' + JSON.stringify(a) + ')');
  await shot(p, 'prep_' + vp.comp + '_' + tag);
  await table(p);
  a = await audit(p, PRINCIPAL);
  const kana = await p.evaluate(() => { const r = document.querySelector('.wp-req .wp-kana').getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight; });
  assert(!a.hscroll && !a.over.length && !a.wide.length && !a.small.length, tag + ': the table fits with no sideways scroll, targets ≥ 44 px (' + JSON.stringify(a) + ')');
  assert(kana, tag + ': the required kana is on screen when the table opens');
  const pad = await p.evaluate(() => { const c = document.querySelector('.wp-pane .pad-ink'); if (!c) return null; const r = c.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); });
  assert(pad == null || pad >= 120, tag + ': the writing pad stays usable (' + pad + ' px)');
  await shot(p, 'table_' + vp.comp + '_' + tag);
  // choosing from the bank
  await p.locator('[data-wp-tab="select"]').click();
  await p.waitForTimeout(120);
  a = await audit(p, PRINCIPAL);
  const n = await p.evaluate(() => document.querySelectorAll('.wp-bank .wp-word').length);
  assert(n > 0 && !a.hscroll && !a.over.length && !a.small.length, tag + ': Choose lists the bank by kana; it fits (' + n + ' words; ' + JSON.stringify(a) + ')');
  await shot(p, 'choose_' + vp.comp + '_' + tag);
  // a result: concede (the quickest real ending)
  await p.locator('.wp-leaf [data-wp="stuck"]').click();
  await p.locator('.wp-leaf [data-wp="concede"]').click();
  await p.waitForSelector('.csheet');
  await p.locator('.csheet .pbtn', { hasText: 'Concede' }).click();
  await p.waitForSelector('.wp-result');
  await p.waitForTimeout(150);
  a = await audit(p, PRINCIPAL);
  assert(!a.hscroll && !a.over.length && !a.small.length, tag + ': the result fits (' + JSON.stringify(a) + ')');
  await shot(p, 'result_' + vp.comp + '_' + tag);
  await p.locator('.wp-leaf [data-wp="look"]').click();
  await p.waitForSelector('.wp-review');
  a = await audit(p, '.wp-leaf .wp-turnbtn, .wp-leaf [data-wp="back"]');
  assert(!a.hscroll && !a.over.length && !a.small.length, tag + ': Look back fits (' + JSON.stringify(a) + ')');
  await shot(p, 'review_' + vp.comp + '_' + tag);
  await p.locator('.wp-leaf [data-wp="back"]').click();
  await p.waitForSelector('.wp-result');
  await p.locator('.wp-leaf [data-wp="leave"]').click();
  for (let i = 0; i < 50 && await p.evaluate(() => !!RB.activity.active() || RB.game.mode() !== 'world'); i++) await p.waitForTimeout(60);
  // the Company card
  await p.evaluate(() => RB.ui.menu.open('companion'));
  await p.waitForSelector('.wp-card');
  await p.evaluate(() => document.querySelector('.wp-card').scrollIntoView());
  await p.waitForTimeout(100);
  const card = await p.evaluate(() => {
    const leafs = Array.from(document.querySelectorAll('#folio-page .leaf'));
    const over = leafs.some((l) => l.scrollWidth > l.clientWidth + 2) || document.documentElement.scrollWidth > innerWidth + 1;
    const small = Array.from(document.querySelectorAll('.wp-card .pbtn')).filter((x) => x.offsetParent).filter((x) => x.getBoundingClientRect().height < 43.5).length;
    const g = document.querySelector('.wp-grid').getBoundingClientRect(), c = document.querySelector('.wp-card').getBoundingClientRect();
    return { over, small, grid: g.right <= c.right + 2 };
  });
  assert(!card.over && !card.small && card.grid, tag + ': Company › Wordplay fits, grid within the page (' + JSON.stringify(card) + ')');
  await shot(p, 'company_' + vp.comp + '_' + tag);
  assert(!errors.length, tag + ': no page errors (' + errors.slice(0, 2).join(' | ') + ')');
  assert(!requests.length, tag + ': no external requests');
  await p.context().close();
}

// ---- all four companions at the table, and a pet resting beside one --------------------------------------------------
for (const [comp, pet] of [['nao', null], ['mio', 'cat'], ['ren', null], ['suzu', null]]) {
  const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, comp, { pet });
  await table(p);
  // one companion move on the board, so the table shows the companion playing
  const w = await p.evaluate(() => { const L = RB.wordplay.live(RB.game.s); return RB.shiritori.safeReplies(L.active.st, L.bank).sort((x, y) => (x.reading < y.reading ? -1 : 1))[0].reading; });
  await p.locator('[data-wp-tab="ime"]').click();
  await p.locator('#wp-ime').fill(w);
  await p.locator('#wp-ime').press('Enter');
  for (let i = 0; i < 100; i++) { if (await p.evaluate(() => { const a = RB.wordplay.ns(RB.game.s).active; return !a || (a.st.next === 'pc' && !a.cpuMove); })) break; await p.waitForTimeout(40); }
  await p.waitForTimeout(250);
  const view = await p.evaluate(() => {
    const cv = document.querySelector('.wp-face');
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
    const pet = document.querySelector('.wp-pet');
    let pn = 0; if (pet) { const e = pet.getContext('2d').getImageData(0, 0, pet.width, pet.height).data; for (let i = 3; i < e.length; i += 4) if (e[i]) pn++; }
    return { face: n, pet: pet ? pn : null, gesture: document.querySelector('.wp-gesture').textContent, slips: document.querySelectorAll('.wp-slips .slip').length, chain: document.querySelectorAll('.wp-chain li').length };
  });
  assert(view.face > 5000 && view.slips >= 2 && view.chain >= 3, comp + ': at the table in their own portrait, slips on the board (' + JSON.stringify(view) + ')');
  if (pet) assert(view.pet > 200, comp + ': the pet rests beside the table (cosmetic only)');
  await shot(p, 'at_table_' + comp + '_1280x800');
  assert(!errors.length, comp + ': no page errors (' + errors.slice(0, 2).join(' | ') + ')');
  await p.context().close();
}

// ---- the Japanese interface and reduced motion -------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true });
  await p.evaluate(() => { RB.game.settings.uiLang = 'ja'; RB.game.settings.reducedMotion = true; RB.game.applySettings(); });
  await begin(p, 'ren');
  const prep = await p.evaluate(() => ({ start: document.querySelector('[data-wp="start"]').textContent, legend: document.querySelector('.wp-field legend').textContent, ja: !!document.querySelector('[data-wp="start"] .jline') }));
  assert(prep.ja && /始/.test(prep.start) && /遊/.test(prep.legend), 'Japanese interface: the preparation sheet\'s labels in Japanese (' + prep.start.trim() + ' / ' + prep.legend + ')');
  await table(p);
  const lab = await p.evaluate(() => ({ play: document.querySelector('[data-wp="play"]').textContent, tabs: Array.from(document.querySelectorAll('.wp-tab')).map((x) => x.textContent.trim()), rt: document.querySelectorAll('[data-wp="play"] rt').length }));
  assert(/言葉/.test(lab.play) && lab.rt > 0 && /書/.test(lab.tabs[0]) && /打/.test(lab.tabs[1]) && /選/.test(lab.tabs[2]), 'Japanese interface: Play word, Write/Type/Choose in Japanese with furigana (' + lab.tabs.join(' ') + ')');
  await shot(p, 'table_ren_ja_390x844');
  // reduced motion: one companion move still shows every cue, with no gesture animation
  const w = await p.evaluate(() => { const L = RB.wordplay.live(RB.game.s); return RB.shiritori.safeReplies(L.active.st, L.bank)[0].reading; });
  await p.locator('[data-wp-tab="ime"]').click();
  await p.locator('#wp-ime').fill(w);
  await p.locator('#wp-ime').press('Enter');
  const t0 = Date.now();
  for (let i = 0; i < 100; i++) { if (await p.evaluate(() => { const a = RB.wordplay.ns(RB.game.s).active; return !a || (a.st.next === 'pc' && !a.cpuMove); })) break; await p.waitForTimeout(30); }
  const rm = await p.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.wp-face')).animationName, kana: document.querySelector('.wp-req').textContent, chain: document.querySelectorAll('.wp-chain li').length }));
  assert((rm.anim === 'none' || !rm.anim) && rm.chain >= 3 && /[ぁ-ゖ]/.test(rm.kana), 'reduced motion: no gesture animation, the move and the required kana still shown (' + (Date.now() - t0) + ' ms)');
  assert(!errors.length, 'no page errors (' + errors.slice(0, 2).join(' | ') + ')');
  await p.context().close();
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
