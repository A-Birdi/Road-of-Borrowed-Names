// Hanafuda on screen (expansion P06, C12; src/ui/88b_hanafuda.js, 88c_hanafuda_cards.js), in Chromium on the built
// game, with throwaway sessions:
//  - the menu; the months and their flowers (48 cards drawn); the sets with their names and readings;
//  - a game: a card that takes one, a card that must choose between two (both lit), laying a card down, the partner's
//    turn; a set made: stop or koi-koi; stopping scores it; the game's end goes to the record;
//  - phone width: the table fits; the Distractions page with its fanned cards;
//  - every kanji with its reading; no errors, no network. Captures in docs/screenshots/hanafuda/.
// Usage: node tests/e2e/hanafuda.mjs
import path from 'node:path';
import fs from 'node:fs';
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
const out = path.join(process.cwd(), 'docs', 'screenshots', 'hanafuda');
fs.mkdirSync(out, { recursive: true });
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
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
async function open(p) {
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: 'suzu', flags: { departed: true, pt_hanafuda: true } });
    s.edition = 2; s.player.nameJp = 'ハル';
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.lightbulb = false;
    window.__hf = RB.activity.launch('hanafuda', { source: 'distractions' });
  });
  await p.waitForSelector('.hf-menu');
}
const st = (p) => p.evaluate(() => { const v = RB.ui.hanafuda.state(); return JSON.parse(JSON.stringify({ view: v.view, g: v.g, m: v.m, sel: v.sel, ask: v.ask, thinking: v.thinking })); });
const yourTurn = (p) => p.waitForFunction(() => { const v = RB.ui.hanafuda.state(); return v && v.g && !v.thinking && ((v.g.turn === 0 && (v.g.phase === 'play' || v.g.phase === 'decide')) || v.g.phase === 'over'); }, null, { timeout: 30000 });

await test('the menu, the months and their flowers, the sets', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  assert(/with Suzu/.test(await p.textContent('.hf-folio')), 'played with Suzu');
  await p.click('[data-a="months"]');
  await p.waitForSelector('.hf-months');
  assert((await p.$$('.hf-months > li')).length === 12 && (await p.$$('.hf-months .hf-card')).length === 48, 'twelve months, forty-eight cards');
  assert(!(await bareKanji(p, '.hf-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.hf-folio')));
  await p.screenshot({ path: path.join(out, 'months.png') });
  await p.click('[data-a="menu"]');
  await p.click('[data-a="sets"]');
  await p.waitForSelector('.hf-yaku');
  assert((await p.$$('.hf-yaku > li')).length === 13, 'thirteen sets');
  assert(!(await bareKanji(p, '.hf-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.hf-folio')));
  await p.screenshot({ path: path.join(out, 'sets.png') });
  await p.click('[data-a="unsets"]');
  await p.waitForSelector('.hf-menu');
  assert(await p.evaluate(() => !!RB.game.s.practice.hanafuda.lessons.months), 'the months lesson kept');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  assert(!requests.length, 'no network: ' + requests.join(' '));
  await ctx.close();
});

await test('a game: take one, choose between two, lay down, the partner; a set, stop, scored and recorded', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await open(p);
  await p.click('input[name="hf-len"][value="1"]');
  await p.click('input[name="hf-level"][value="1"]');
  await p.click('[data-a="start"]');
  await p.waitForSelector('.hf-field');
  await yourTurn(p);
  // arrange a known position on the current table: pine in hand against one pine on the field; plum against two
  await p.evaluate(() => {
    const g = RB.ui.hanafuda.state().g, H = RB.hanafuda;
    const of = (m) => H.DECK.filter((c) => c.m === m).map((c) => c.id);
    const pine = of(1), plum = of(2), cherry = of(3), iris = of(5);
    const used = new Set([...pine, ...plum, ...cherry, ...iris]);
    const rest = H.DECK.map((c) => c.id).filter((id) => !used.has(id));
    g.turn = 0; g.phase = 'play'; g.caught = [[], []]; g.koi = [0, 0]; g.shown = [0, 0];
    g.hands = [[pine[2], plum[2], cherry[2], iris[0]], rest.slice(0, 4)];
    g.field = [pine[3], plum[0], plum[1], cherry[3]];
    g.pile = [iris[1], iris[2], iris[3]].concat(rest.slice(4, 30));
  });
  await p.click('[data-a="help"]'); await p.click('[data-a="help"]'); // drawn again with matching help on
  assert((await p.$$('.hf-hand .hf-card.pairs')).length === 3, 'matching help: three of the hand pair with the field');
  const pine = await p.evaluate(() => RB.hanafuda.DECK.filter((c) => c.m === 1).map((c) => c.id));
  await p.click('[data-h="' + pine[2] + '"]');
  await yourTurn(p);
  let s = await st(p);
  assert(s.g.caught[0].includes(pine[2]) && s.g.caught[0].includes(pine[3]), 'one of its month: taken');
  assert(s.g.log.some((l) => l.p === 1), 'the partner played');
  // two of a month on the field: both lit, choose one
  const plum = await p.evaluate(() => {
    // the two plums on the field and the third in hand, whatever the partner did
    const g = RB.ui.hanafuda.state().g, H = RB.hanafuda;
    const pl = H.DECK.filter((c) => c.m === 2).map((c) => c.id);
    for (const z of [g.hands[1], g.pile, g.caught[1], g.caught[0], g.field, g.hands[0]]) for (const x of pl) { const i = z.indexOf(x); if (i >= 0) z.splice(i, 1); }
    g.field.push(pl[0], pl[1]); g.hands[0].push(pl[2]);
    g.turn = 0; g.phase = 'play';
    return pl;
  });
  await p.click('[data-a="help"]'); await p.click('[data-a="help"]');
  {
    await p.click('[data-h="' + plum[2] + '"]');
    await p.waitForSelector('.hf-field .hf-card.ask');
    assert((await p.$$('.hf-field .hf-card.ask')).length === 2, 'two of its month: both lit to choose from');
    await p.screenshot({ path: path.join(out, 'choose_two.png') });
    await p.click('.hf-field .hf-card.ask[data-f="' + plum[1] + '"]');
    await yourTurn(p);
    s = await st(p);
    assert(s.g.caught[0].includes(plum[1]) && !s.g.caught[0].includes(plum[0]), 'the chosen one taken, the other left');
  }
  // a card with nothing of its month on the field: lay it down
  // a card whose month is nowhere on the field (made so, whatever the partner did)
  const loneCard = await p.evaluate(() => {
    const g = RB.ui.hanafuda.state().g, H = RB.hanafuda;
    const pw = H.DECK.filter((c) => c.m === 12).map((c) => c.id);
    for (const z of [g.hands[1], g.pile, g.caught[1], g.caught[0], g.field, g.hands[0]]) for (const x of pw) { const i = z.indexOf(x); if (i >= 0) z.splice(i, 1); }
    g.hands[0].push(pw[1]); g.pile.push(pw[0], pw[2], pw[3]);
    g.turn = 0; g.phase = 'play';
    return pw[1];
  });
  await p.click('[data-a="help"]'); await p.click('[data-a="help"]');
  {
    await p.click('[data-h="' + loneCard + '"]');
    await p.waitForSelector('[data-a="lay"]');
    await p.click('[data-a="lay"]');
    await yourTurn(p);
    s = await st(p);
    assert(!s.g.hands[0].includes(loneCard), 'laid down');
  }
  // a set: three brights, then stop
  await p.evaluate(() => {
    const g = RB.ui.hanafuda.state().g, H = RB.hanafuda;
    const id = (tag) => H.DECK.find((c) => c.tag === tag).id;
    const pampas = H.DECK.filter((c) => c.m === 8 && c.kind === 'kasu').map((c) => c.id);
    g.turn = 0; g.phase = 'play'; g.shown = [0, 0];
    g.caught[0] = [id('crane'), id('curtain')];
    g.caught[1] = g.caught[1].filter((x) => x !== id('moon'));
    g.field = g.field.filter((x) => H.card(x).m !== 8 && x !== id('crane') && x !== id('curtain')).concat([pampas[0]]);
    g.hands[0] = [id('moon')].concat(g.hands[0].filter((x) => H.card(x).m !== 8 && x !== id('crane') && x !== id('curtain'))).slice(0, 3);
    g.hands[1] = g.hands[1].filter((x) => H.card(x).m !== 8);
    g.pile = g.pile.filter((x) => H.card(x).m !== 8 && x !== id('crane') && x !== id('curtain'));
  });
  await p.click('[data-a="help"]'); await p.click('[data-a="help"]'); // the table drawn again
  const moon = await p.evaluate(() => RB.hanafuda.DECK.find((c) => c.tag === 'moon').id);
  await p.click('[data-h="' + moon + '"]');
  await p.waitForSelector('.hf-decide', { timeout: 8000 });
  assert(/Stop: 5 points/.test(await p.textContent('.hf-decide')), 'three brights: stop for 5, or koi-koi');
  assert(!(await bareKanji(p, '.hf-folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.hf-folio')));
  await p.screenshot({ path: path.join(out, 'decide.png') });
  await p.click('[data-a="stop"]');
  await p.waitForSelector('.hf-over');
  assert(/You win the game, 5 to 0/.test(await p.textContent('.hf-over')), 'stopped: 5 points, and a one-month game won');
  const r = await p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s.practice.hanafuda)));
  assert(r.games === 1 && r.wins === 1 && r.best === 5 && r.yaku.sanko === 1, 'the record: a game, a win, a best of 5, three brights made: ' + JSON.stringify(r));
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('phone width: the table fits; the Distractions page with its cards', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await open(p);
  await p.click('[data-a="start"]');
  await p.waitForSelector('.hf-field');
  await yourTurn(p);
  assert(await noOverflow(p), 'the table fits the phone');
  await p.screenshot({ path: path.join(out, 'table_phone.png'), fullPage: false });
  await p.evaluate(() => RB.ui.hanafuda.close());
  await p.waitForFunction(() => RB.game.mode() === 'world');
  await p.evaluate(() => RB.ui.menu.open('distractions'));
  await p.waitForSelector('.ds-item[data-ds="hanafuda"]');
  await p.click('.ds-item[data-ds="hanafuda"]');
  await p.waitForSelector('.ds-page .ds-how');
  assert(await noOverflow(p), 'its page fits');
  assert(!(await bareKanji(p, '.folio')).length, 'kanji with readings: ' + (await bareKanji(p, '.folio')));
  await p.screenshot({ path: path.join(out, 'distractions_page_phone.png'), fullPage: false });
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
