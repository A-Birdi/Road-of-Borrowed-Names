// Manybridge, Chapter 3 of the twelve-chapter edition (expansion P08), in Chromium on the built game, with throwaway
// sessions (no journey saved):
//  1. barge routing: the canals above the task; a blank bridge shows "?"; a wrong sentence sends the barge where it
//     says (the east storehouse), then the right one to the west storehouse; the result; no bare kanji; phone width;
//  2. the Tally Exchange dispute: three people (two heated, one closed off); Unravel finds nothing knotted; Wait lets
//     Gonta speak; the tally read out; a proposal; the rice found; the conclusion's flags;
//  3. the chart by edition: after Chapter 2 a six-chapter journey's chart has no Manybridge and no ferry route; a
//     twelve-chapter journey's has both.
// Usage: node tests/e2e/manybridge.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2] || '';
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1400)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.body.scrollWidth <= innerWidth + 1);
async function bareKanji(p, scope) {
  return p.evaluate((scope) => {
    const out = [];
    for (const rootEl of document.querySelectorAll(scope)) {
      const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (!/[一-鿿々]/.test(n.nodeValue)) continue;
        const el = n.parentElement;
        if (!el || !el.getClientRects().length || el.closest('.sr, rt, input, textarea, [hidden], [aria-hidden="true"]')) continue;
        if (!el.closest('ruby')) out.push(n.nodeValue.trim().slice(0, 30));
      }
    }
    return out;
  }, scope);
}
// a twelve-chapter journey after Chapter 2, in Manybridge
async function start(p, o) {
  await p.evaluate((o) => {
    const s = RB.game.debugStart(o.map || 'mb.porters', o.x || 6, o.y || 6, { comp: o.comp === undefined ? 'ren' : o.comp, flags: Object.assign({ departed: true, ch1_done: true, ch2_done: true }, o.flags || {}) });
    s.edition = o.edition || 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    s.learn.difficulty = 'normal';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    RB.game.settings.input = 'choice'; RB.game.settings.battleAnim = 'instant'; RB.game.settings.compPlan = 'ask';
    RB.game.applySettings();
  }, o);
}

await test('barge routing: the canals above the task; a wrong sentence sends the barge where it says; then the right one', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, { profile: 'E', flags: { mb_pl_fuji: true } });
  await p.evaluate(() => { window.__res = null; RB.challenge.run('mb.route1', {}).then((r) => { window.__res = r || { ok: false }; }); });
  await p.waitForSelector('.chal[data-kind=forge] .cn');
  const first = await p.evaluate(() => ({
    say: document.querySelector('.cn-say').textContent,
    blank: document.querySelectorAll('.cn-bridge.blank').length, named: document.querySelectorAll('.cn-bridge:not(.blank)').length,
    places: [...document.querySelectorAll('.cn-place')].length, label: document.querySelector('.cn-map').getAttribute('aria-label'),
  }));
  assert(/waits at Fujiya/.test(first.say) && first.places >= 5 && /A map of the canals/.test(first.label), 'the canal, the barge at Fujiya: ' + JSON.stringify(first));
  assert(first.named === 1 && first.blank >= 2, 'one bridge named (its plaque read again), the others blank: ' + JSON.stringify(first));
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn');
  // the east storehouse: wrong, and the barge goes there
  const wrong = await p.evaluate(() => { const x = [...document.querySelectorAll('.chal .mc .btn')].find((e) => /東/.test(e.textContent) && /藤屋/.test(e.textContent.replace(/\s/g, '').split('から')[0])); x.click(); return x.textContent.replace(/\s+/g, ''); });
  await p.waitForFunction(() => document.querySelector('.cn.cn-wrong'), null, { timeout: 8000 });
  const w = await p.evaluate(() => ({ say: document.querySelector('.cn-say').textContent, here: (document.querySelector('.cn-place.cn-here') || {}).dataset, fb: (document.querySelector('.fbwrap') || {}).textContent || '' }));
  assert(/east/i.test(w.say) && w.here && w.here.k === 'heiji_e', 'the barge went to the east storehouse, as the sentence said (' + wrong + '): ' + JSON.stringify(w));
  assert(/east/i.test(w.fb), 'and why it was wrong: ' + w.fb.slice(0, 200));
  // the west storehouse: right
  await p.evaluate(() => { const x = [...document.querySelectorAll('.chal .mc .btn')].find((e) => !e.disabled && /西/.test(e.textContent) && /まで/.test(e.textContent) && e.textContent.replace(/\s/g, '').indexOf('藤屋') < e.textContent.replace(/\s/g, '').indexOf('西')); x.click(); });
  await p.waitForFunction(() => document.querySelector('.cn.cn-ok'), null, { timeout: 8000 });
  const r = await p.evaluate(() => ({ say: document.querySelector('.cn-say').textContent, here: (document.querySelector('.cn-place.cn-here') || {}).dataset }));
  assert(/west/i.test(r.say) && r.here && r.here.k === 'heiji_w', 'the barge reached the west storehouse: ' + JSON.stringify(r));
  const bare = await bareKanji(p, '.chal');
  assert(!bare.length, 'every kanji on the task has its furigana: ' + bare.join(' | '));
  await p.setViewportSize({ width: 390, height: 800 });
  await p.waitForTimeout(200);
  assert(await noOverflow(p), 'no horizontal overflow at 390 px with the canal shown');
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  assert(await p.evaluate(() => window.__res.ok === true), 'the routing job succeeded (the first answer missed)');
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

// the encounter screen's controls (as in tests/e2e/encounters.mjs)
async function cards(p) {
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.enc-card'), conf: !!document.querySelector('.csheet'), end: !!document.querySelector('.enc-end') }));
    if ((st.cards && !st.conf) || st.end) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForSelector('.enc-card, .enc-end');
  await p.waitForTimeout(120);
}
const clickCard = async (p, re) => {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re);
  assert(i != null, 'no card matching ' + re + ': ' + await p.evaluate(() => [...document.querySelectorAll('.rcard')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 60)).join(' | ')));
  await p.click('.rcard[data-i="' + i + '"]');
};
const confirmPick = async (p, re) => {
  await p.waitForFunction(() => !!document.querySelector('.csheet .pbtn'), null, { timeout: 15000 });
  const ok = await p.evaluate((m) => { const x = [...document.querySelectorAll('.csheet .pbtn')].find((e) => new RegExp(m, 'i').test(e.textContent)); if (x) x.click(); return !!x; }, re);
  assert(ok, 'no button ' + re + ' in: ' + await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].map((x) => x.textContent).join(' | ')));
};
// whatever is asked after a choice: the companion's move (none), a confirmation (yes); stops at the next choice
async function settle(p) {
  for (let k = 0; k < 60; k++) {
    const st = await p.evaluate(() => ({ sheet: [...document.querySelectorAll('.csheet .pbtn')].map((x) => x.textContent), cards: !!document.querySelector('.enc-card') && !document.querySelector('.csheet'), end: !!document.querySelector('.enc-end'), chal: !!document.querySelector('.chal') }));
    if (st.end || st.cards || st.chal) return st;
    if (st.sheet.length) {
      const re = st.sheet.find((t) => /Nothing this time/i.test(t)) ? 'Nothing this time' : st.sheet.find((t) => /^Wait$|Yes|do it/i.test(t)) ? '^Wait$|Yes|do it' : null;
      if (re) await confirmPick(p, re);
    }
    await p.waitForTimeout(120);
  }
  return null;
}
async function answer(p) {
  await p.waitForSelector('.chal');
  await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
  await p.waitForSelector('.chal .mc .btn');
  const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
  for (let k = 0; k < n; k++) {
    await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
    await p.waitForTimeout(80);
    if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
const claims = (p) => p.evaluate(() => [...document.querySelectorAll('.enc-claim')].map((x) => x.textContent.replace(/\s+/g, ' ')));
const encLog = (p) => p.evaluate(() => (document.querySelector('.enc-log') || {}).textContent || '');

await test('the Tally Exchange dispute: Unravel finds nothing knotted; Wait lets Gonta speak; the tally; the rice found', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await start(p, { map: 'mb.tally', x: 10, y: 6, comp: 'ren', profile: 'E' });
  await p.evaluate(() => { window.__res = null; RB.game.startEncounter('mb.dispute', {}).then((r) => { window.__res = r; }); });
  await cards(p);
  const r0 = await p.evaluate(() => ({ people: [...document.querySelectorAll('.enc-person')].map((x) => x.textContent.replace(/\s+/g, ' ')) }));
  assert(r0.people.length === 3 && /Fujiko/.test(r0.people[0]) && /Heated/.test(r0.people[0]) && /Heated/.test(r0.people[1]) && /Gonta/.test(r0.people[2]) && /Closed off/.test(r0.people[2]), 'three people, two heated, Gonta closed off: ' + JSON.stringify(r0));
  assert((await claims(p)).length === 2, 'two things said so far');
  // Unravel: nothing knotted here
  await clickCard(p, 'Unravel');
  await settle(p);
  await cards(p);
  assert(/Nothing here is knotted/.test(await encLog(p)), 'Unravel finds nothing knotted: ' + (await encLog(p)).slice(-300));
  // asking Gonta now gets nothing; Wait is what lets him speak
  await clickCard(p, 'Wait');
  await settle(p);
  await cards(p);
  const l1 = await encLog(p), c1 = await claims(p);
  assert(/Gonta speaks up at last/.test(l1) && c1.some((x) => /shut/.test(x)), 'in the quiet, Gonta speaks: ' + JSON.stringify(c1) + ' ' + l1.slice(-300));
  // the tally, read out (a language step)
  await clickCard(p, 'read out Heiji');
  await settle(p);
  await answer(p);
  await settle(p);
  await cards(p);
  assert((await claims(p)).some((x) => /If the west storehouse is full/.test(x)), 'the tally is on record');
  // the proposal: all go and look in the east storehouse
  await clickCard(p, 'east storehouse');
  await settle(p);
  await answer(p);
  await settle(p);
  await p.waitForSelector('.enc-end', { timeout: 20000 });
  const end = await p.evaluate(() => document.querySelector('.enc-end').textContent);
  assert(/east storehouse/.test(end) && /thirty bales/.test(end), 'the rice is found: ' + end.slice(0, 200));
  const bare = await bareKanji(p, '.enc-sheet, .combat, .cb');
  assert(!bare.length, 'every kanji in the conversation has its furigana: ' + bare.join(' | '));
  await p.click('.enc-sheet [data-ok]');
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  const res = await p.evaluate(() => ({ outcome: window.__res.outcome, found: !!RB.game.s.flags.mb_rice_found, mode: RB.game.mode() }));
  assert(['resolved', 'found'].includes(res.outcome) && res.found && res.mode === 'world', 'concluded, the rice found, back in the world: ' + JSON.stringify(res));
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('the chart by edition: Manybridge and the ferry route only in a twelve-chapter journey', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  const chartOf = async (edition) => {
    await start(p, { map: 'sg.harbor', x: 20, y: 10, edition, flags: { sg_arrived: true } });
    return p.evaluate(() => {
      // (Manybridge marked as visited in both: a six-chapter chart must leave it out all the same)
      const s = RB.game.s; s.travel.reedwake = true; s.travel.saltglass = true; s.travel.manybridge = true;
      RB.ui.menu.open('map');
      const svg = document.querySelector('.chart');
      const r = { labels: [...svg.querySelectorAll('text')].map((t) => t.textContent), curves: [...svg.querySelectorAll('path[fill="none"]')].filter((x) => / Q/.test(x.getAttribute('d'))).length, dots: svg.querySelectorAll('circle').length, note: (document.querySelector('.chartbox + p') || {}).textContent || '' };
      RB.ui.menu.close();
      return r;
    });
  };
  const six = await chartOf(1);
  assert(!six.labels.includes('Manybridge') && six.curves === 0 && !/ferry/.test(six.note), 'a six-chapter chart is as it was: ' + JSON.stringify(six));
  const twelve = await chartOf(2);
  assert(twelve.labels.includes('Manybridge') && twelve.curves >= 1 && /ferry routes/.test(twelve.note) && twelve.dots === six.dots + 1, 'a twelve-chapter chart: Manybridge across the sea: ' + JSON.stringify(twelve));
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
