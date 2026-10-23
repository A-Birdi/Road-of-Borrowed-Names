// What waits on a return, the Reedwake pilot (Robin, 2026-10-23, issue #1 6373239443; Local CL-240, CL-241; Agnes
// 6372913375; src/engine/53_town.js returns(), src/ui/50_menu.js). In Chromium on the built game, with throwaway
// twelve-chapter journeys in Saltglass that can travel to Reedwake, where the flood stone was noticed and can open now
// and Chapter 1's stamp is earned and not pressed:
//  1. appearance, at a desktop and a phone size: the Journey's Places has one line for Reedwake, both languages, every
//     kanji with its reading, never naming what waits; the Map's chart tags Reedwake's place (its title says so, and so
//     does the chart's own description), the legend says what a tag means, and Reedwake's Travel row says it in words;
//  2. it stays: after a visit to Reedwake and back (the "changed" line goes on a visit; this does not), and after a
//     save and a load;
//  3. it goes with what it names: the flood stone looked at again (it opens), then the stamp pressed at the stand;
//     nothing is left, and nothing reminds you of the pressed stamp;
//  4. absent: town hints off; out of reach (no travel known); the need not yet met; a six-chapter journey;
//  5. an older journey loaded with all three keys openable and both stamps waiting: one quiet line for the town, and
//     nothing pops up;
//  6. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/return_hints.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const errorsAll = [];
// a journey past the first chapter: Reedwake known, the Mill done
const PAST = { departed: true, rw_arrived: true, rw_met_tsuru: true, ch1_done: true };

async function begin(p, o) {
  o = o || {};
  await p.evaluate(async (o) => {
    const s = RB.game.debugStart(o.map || 'sg.harbor', o.x || 20, o.y || 14, { dir: 'down', edition: o.edition || RB.edition.forNew(), flags: o.flags });
    s.travel = Object.assign({}, o.travel || { reedwake: true, saltglass: true });
    if (s.world) Object.assign(s.world.sealed, o.sealed || {});
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.townHints = o.hints || 'on';
    RB.save.autosave = async () => {};
    await new Promise((r) => setTimeout(r, 600));
  }, o);
}
// what the menus show: the Journey's Places lines for the pilot, the chart's tag and description, the legend, the
// Travel row; and any kanji in the line outside its ruby
const look = (p) => p.evaluate(async () => {
  const wait = () => new Promise((r) => setTimeout(r, 250));
  RB.ui.menu.close(); RB.ui.menu.open('journey'); await wait();
  const lines = [...document.querySelectorAll('.ret-line')];
  const bareKanji = lines.map((li) => {
    const c = li.cloneNode(true);
    c.querySelectorAll('ruby, .en').forEach((n) => n.remove());
    return (c.textContent.match(/[㐀-鿿々]/g) || []).join('');
  }).join('');
  const out = { lines: lines.map((li) => ({ town: li.dataset.town, en: (li.querySelector('.en') || {}).textContent || '', ruby: li.querySelectorAll('ruby').length, jp: [...li.querySelectorAll('ruby, rb')].length })), bareKanji,
    changed: /has changed since/.test(document.querySelector('.folio') ? document.querySelector('.folio').textContent : '') };
  RB.ui.menu.close(); RB.ui.menu.open('map'); await wait();
  const svg = document.querySelector('svg.chart'), tag = document.querySelector('[data-place="reedwake"] .ret-tag');
  out.tags = [...document.querySelectorAll('.ret-tag')].map((g) => g.closest('[data-place]').dataset.place);
  out.title = tag ? (tag.querySelector('title') || {}).textContent : null;
  out.aria = svg ? svg.getAttribute('aria-label') : '';
  // (the legend under the chart: its own paragraph, not the page's text, which holds the game's script too)
  out.legend = [...document.querySelectorAll('.chartbox ~ p')].some((q) => /A small tag by a town means something may be waiting for you there/.test(q.textContent));
  out.row = [...document.querySelectorAll('.ret-kind')].map((k) => (k.closest('.entry').querySelector('.t .en') || {}).textContent + ': ' + k.textContent);
  RB.ui.menu.close();
  return out;
});
const shown = (v) => v.lines.length === 1 && v.lines[0].town === 'reedwake' && v.lines[0].ruby > 0 && !v.bareKanji && v.tags.join() === 'reedwake' &&
  v.title === 'Something may be waiting for you in Reedwake' && /Something may be waiting for you in Reedwake/.test(v.aria) && v.legend && v.row.join() === 'Reedwake: something may be waiting for you here';
const none = (v) => !v.lines.length && !v.tags.length && !v.row.length && !v.legend && !/waiting for you/.test(v.aria);
const brief = (v) => JSON.stringify({ lines: v.lines, bare: v.bareKanji, tags: v.tags, title: v.title, legend: v.legend, row: v.row, aria: (v.aria.match(/Something may[^.]*/) || [''])[0] });
const BOTH = { flags: Object.assign({ learn_wait: true }, PAST), sealed: { rw_floodstone: 'noticed' } };

// ---- 1. appearance ---------------------------------------------------------------------------------------------------
for (const [w, h] of [[1280, 800], [390, 844]]) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: w, height: h } });
  await begin(p, BOTH);
  const v = await look(p);
  ok(shown(v) && v.lines[0].en === 'Something you noticed in Reedwake may open now, and a stamp you have earned waits to be pressed there.',
    w + 'x' + h + ': one line for Reedwake in the Journey (both languages, every kanji with its reading), the chart\'s tag, its title and description, the legend and the Travel row (' + brief(v) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 2. it stays: a visit, then a save and a load ----------------------------------------------------------------------
// ---- 3. it goes with what it names ------------------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, BOTH);
  await p.evaluate(async () => { await RB.game.transition('rw.village', 22, 18, 'down'); await new Promise((r) => setTimeout(r, 900)); await RB.game.transition('sg.harbor', 20, 14, 'down'); await new Promise((r) => setTimeout(r, 900)); });
  const v1 = await look(p);
  ok(shown(v1) && !v1.changed, 'after a visit to Reedwake and back it is still there (' + brief(v1) + ')');
  await p.evaluate(async () => { await RB.save.manualSave(3); });
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(3, 'manual'); await new Promise((r) => setTimeout(r, 900)); RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {}; return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  const v2 = await look(p);
  ok(ld === 'loaded' && shown(v2), 'after a save and a load it is still there (' + ld + ', ' + brief(v2) + ')');
  // the flood stone, looked at again where it stands: it opens
  await p.evaluate(async () => { await RB.game.transition('rw.village', 41, 20, 'up'); await new Promise((r) => setTimeout(r, 900)); });
  await p.evaluate(() => { RB.script.run('rw.lw_seal_rw_floodstone'); });
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen(), run: RB.script.isRunning(), ch: document.querySelectorAll('.choices:not(.hidden) .choice').length }));
    if (st.ch) { await p.locator('.choices:not(.hidden) .choice').first().click(); continue; }
    if (st.d) { await p.evaluate(() => RB.ui.dialogue.advance()); await p.waitForTimeout(60); continue; }
    if (!st.run && i > 5) break;
    await p.waitForTimeout(100);
  }
  const opened = await p.evaluate(() => RB.game.s.world.sealed.rw_floodstone);
  const v3 = await look(p);
  ok(opened === 'open' && v3.lines.length === 1 && v3.lines[0].en === 'A stamp you have earned waits to be pressed in Reedwake.' && v3.tags.join() === 'reedwake',
    'the flood stone opened: the line keeps only the stamp, the tag stays for it (' + opened + ', ' + brief(v3) + ')');
  // the stand's own hook, as pressing it does
  await p.evaluate(() => { RB.hooks.rb_stand(['reedwake'], {}); });
  for (let i = 0; i < 100; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen(), run: RB.script.isRunning() }));
    if (st.d) { await p.evaluate(() => RB.ui.dialogue.advance()); await p.waitForTimeout(60); continue; }
    if (!st.run && i > 5) break;
    await p.waitForTimeout(100);
  }
  const press = await p.evaluate(() => RB.stampBook.pressed(RB.game.s, 'ch.rw'));
  const v4 = await look(p);
  ok(press && none(v4), 'the stamp pressed: nothing left, and nothing reminds you of it (' + press + ', ' + brief(v4) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 4. absent ----------------------------------------------------------------------------------------------------------------
{
  const cases = [
    ['town hints off', Object.assign({ hints: 'off' }, BOTH)],
    ['out of reach (no travel known)', Object.assign({ travel: {} }, BOTH)],
    ['the stone\'s need not yet met, no stamp earned', { flags: { departed: true, rw_arrived: true }, sealed: { rw_floodstone: 'noticed' } }],
    ['a six-chapter journey', Object.assign({ edition: 1 }, BOTH)],
  ];
  for (const [name, o] of cases) {
    const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
    await begin(p, o);
    const v = await look(p);
    ok(none(v), name + ': nothing in the Journey or on the Map (' + brief(v) + ')');
    errorsAll.push(...errors);
    await ctx.close();
  }
}

// ---- 5. an older journey with everything waiting ----------------------------------------------------------------------------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const ALL = { flags: Object.assign({ learn_wait: true, mod_sorezore: true, mod_subete: true }, PAST), sealed: { rw_floodstone: 'noticed', rw_jars: 'noticed', rw_votives: 'noticed' } };
  await begin(p, ALL);
  await p.evaluate(async () => { await RB.save.manualSave(4); });
  await p.evaluate(() => { window.__pops = 0; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && (n.matches('.toast, .award, [role="alert"]') || n.querySelector('.toast, .award, [role="alert"]'))) window.__pops++; }).observe(document.body, { childList: true, subtree: true }); });
  const ld = await p.evaluate(async () => { try { await RB.game.loadCampaign(4, 'manual'); await new Promise((r) => setTimeout(r, 2000)); RB.save.autosave = async () => {}; return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
  const pops = await p.evaluate(() => window.__pops);
  const n = await p.evaluate(() => RB.town.returns(RB.game.s).map((r) => r.keys.length + ' keys, ' + r.stamps.length + ' stamps'));
  const v = await look(p);
  ok(ld === 'loaded' && pops === 0 && shown(v) && /Something you noticed in Reedwake may open now/.test(v.lines[0].en), 'loaded with three keys and stamps waiting (' + n + '): one quiet line for the town, nothing pops up (' + JSON.stringify({ ld, pops }) + ', ' + brief(v) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
