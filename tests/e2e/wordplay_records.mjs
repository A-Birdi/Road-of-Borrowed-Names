// RBN-QA-168 (Agnes 6379200927): Shiritori's "Review a saved chain" list put each record's button, the row's only
// child, in the icon column an .entry starts with: a 44 px button, its words spilling past its border. In Chromium on
// the built game, a throwaway journey with Suzu at the coast inn, one real match played and conceded (a real record),
// then copies of it as further records (a pinned one, a first stage clear, the longest band and level names):
//  1. at 1188×848 (Agnes's) and 390×844, at 100 % and at 140 % text, with one record and with four: each record's
//     button spans its whole row, every part of its text inside its border, and nothing scrolls sideways;
//  2. keyboard: Tab reaches a record's button, which shows its focus ring;
//  3. a record opens, "Back to the list" returns to the list, and Close shuts the sheet;
//  4. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/wordplay_records.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const fmt = (o) => JSON.stringify(o);
const errorsAll = [];

// a journey with one real record (a match begun and conceded), and `more` copies as further records
async function begin(p, more) {
  return p.evaluate(async (more) => {
    const map = 'co.inn', d = RB.content.maps[map] || {}, seen = {};
    for (const ev of d.onEnter || []) seen['enter:' + map + ':' + ev.scene] = true;
    const s = RB.game.debugStart(map, 6, 8, { comp: 'suzu', flags: Object.assign({ departed: true, ch1_done: true }, seen) });
    s.chapter = 2; RB.company.sync(s, 'live'); RB.company.refresh(s);
    RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {};
    await new Promise((r) => setTimeout(r, 500));
    const W = RB.wordplay;
    const st = W.start(s, { format: 'competitive', band: 'pocket', level: 'casual', support: 'open' }, { first: 'cpu' });
    if (!st || st.ok === false) return 'no match: ' + fmt(st);
    W.concede(s);
    if (more) {
      const r = W.rec(s, 'suzu'), t = r.recent[r.recent.length - 1];
      const copy = (n, o) => Object.assign(JSON.parse(JSON.stringify(t)), { id: t.id + '-' + n }, o);
      r.recent.push(copy('long', { band: 'journey', level: 'partner', result: Object.assign({}, t.result, { winner: 'pc', cmoves: 18 }) }));
      r.pinned.push(copy('pin', { result: Object.assign({}, t.result, { cmoves: 8 }) }));
      r.firstClearTranscripts['everyday:thoughtful'] = copy('first', { band: 'everyday', level: 'thoughtful', result: Object.assign({}, t.result, { winner: 'pc', cmoves: 12 }) });
    }
    return W.transcripts(s, 'suzu').length;
  }, more);
}
// the list's rows: each record's button against its row, its text against its border, and sideways scrolling
const measure = (p) => p.evaluate(() => {
  const rows = [...document.querySelectorAll('.wp-trlist > .entry')];
  const out = rows.map((li) => {
    const bt = li.querySelector('.wp-tr'), lr = li.getBoundingClientRect(), br = bt.getBoundingClientRect(), cs = getComputedStyle(li);
    const inner = lr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const spill = [...bt.querySelectorAll('span')].filter((sp) => { const r = sp.getBoundingClientRect(); return r.width && (r.left < br.left - 1 || r.right > br.right + 1 || r.bottom > br.bottom + 1); }).length;
    return { row: Math.round(inner), button: Math.round(br.width), spill, over: bt.scrollWidth > bt.clientWidth + 1, text: bt.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) };
  });
  const leaf = document.querySelector('.wp-leaf');
  return { rows: out, leafSide: leaf ? leaf.scrollWidth > leaf.clientWidth + 1 : null, pageSide: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
});
const fits = (m, n) => m.rows.length === n && m.rows.every((r) => r.button >= r.row - 2 && !r.spill && !r.over) && !m.leafSide && !m.pageSide;

// ---- 1. layout
for (const [w, h] of [[1188, 848], [390, 844]]) {
  for (const scale of [1, 1.4]) {
    for (const more of [false, true]) {
      const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
      const n = await begin(p, more);
      await p.evaluate((scale) => { RB.game.settings.textScale = scale; RB.game.applySettings(); RB.ui.wordplay.records(RB.game.s); }, scale);
      await p.waitForSelector('.wp-trlist .wp-tr', { timeout: 10000 }).catch(() => {});
      await p.waitForTimeout(300);
      const m = await measure(p);
      ok(fits(m, more ? 4 : 1), w + 'x' + h + ', text ' + Math.round(scale * 100) + ' %, ' + (more ? 'four records' : 'one record') + ': each button spans its row, its text inside its border, no sideways scroll (' + fmt({ n, m }) + ')');
      errorsAll.push(...errors);
      await ctx.close();
    }
  }
}
// ---- 2. keyboard, 3. open, back, close
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  await begin(p, true);
  await p.evaluate(() => { RB.ui.wordplay.records(RB.game.s); });
  await p.waitForSelector('.wp-trlist .wp-tr', { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(300);
  let focus = null;
  for (let i = 0; i < 8 && !focus; i++) {
    await p.keyboard.press('Tab');
    focus = await p.evaluate(() => { const a = document.activeElement; if (!a || !a.matches('.wp-tr')) return null; const cs = getComputedStyle(a); return { ring: (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none', id: a.dataset.wpTr }; });
  }
  ok(focus && focus.ring, 'Tab reaches a record\'s button, which shows its focus ring (' + fmt(focus) + ')');
  await p.locator('.wp-trlist .wp-tr').first().click();
  const opened = await p.waitForSelector('.wp-review', { timeout: 10000 }).then(() => true).catch(() => false);
  const backB = p.locator('button', { hasText: 'Back to the list' }).first();
  const hasBack = await backB.count();
  if (hasBack) await backB.click();
  const back = await p.waitForSelector('.wp-trlist .wp-tr', { timeout: 10000 }).then(() => true).catch(() => false);
  await p.locator('[data-wp="close"]').first().click();
  await p.waitForTimeout(400);
  const closed = await p.evaluate(() => !document.querySelector('.wp-sheet') && !document.querySelector('.wp-trlist'));
  ok(opened && hasBack && back && closed, 'a record opens, "Back to the list" returns to the list, Close shuts the sheet (' + fmt({ opened, hasBack, back, closed }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
