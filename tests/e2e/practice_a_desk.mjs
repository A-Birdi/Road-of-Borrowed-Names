// The writing desk in the real game (Practice addendum §16, §23.6; docs/practice/suite_a.md), in
// Chromium against the built index.html, synthetic campaigns in a fresh profile:
//  - the Gull's small table offers the desk; the rest menu at the Gull adds "Writing desk" after
//    Just chat; Words › Ways to practise offers Begin here only at the Gull;
//  - the four modes are tabs chosen directly; Write from a prompt lists meanings only;
//  - Trace: real mouse strokes over the numbered reference; what the pad read (not told the
//    character) and a stroke-order note only when certain; never recorded as recall;
//  - Copy beside the model: real touch strokes (DevTools touch events) on a phone, the model in its
//    own square; never recorded as recall;
//  - Write from a prompt: no answer shown before it is asked for; handwriting with real strokes →
//    one ordinary assessment; with "How to write" (the model) → practice only;
//  - Typeset: a layout and paper, labelled typeset, never "your handwriting";
//  - keeping pages: a label, saved to the campaign's slot; at six, the replace/cancel sheet with
//    previews (cancel keeps the six; replace only the one chosen, after a confirmation);
//  - reload: the pages are back with their strokes, labels and saved state; Journey › Practice
//    mementos shows them; the practice shelf and the Shared memories pin (asked first when a
//    keepsake is up);
//  - a refused storage write leaves the art on screen marked unsaved and the pages as they were.
// Captures: docs/screenshots/practice_a/desk_*.png. Usage: node tests/e2e/practice_a_desk.mjs
import { serve, launch, page } from './lib.mjs';
import { start, useSlot, interactAndChoose, drawMouse, drawTouch, press, wait, shot, phone } from './practice_a_lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let fail = 0, n = 0;
const assert = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const t0 = Date.now();
const SLOT = 5;

const sheetText = (p, sel) => p.evaluate((s) => { const r = document.querySelector(s || '.pa-desk') || document.body; const c = r.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ' '); }, sel);
async function openDesk(p) {
  await interactAndChoose(p, /Sit at the writing desk/);
  await p.waitForSelector('.pa-desk .dk-cards');
  await wait(p, 200);
}
async function tab(p, mode, how) { await press(p, '.dk-tabs .ptab[data-id=' + mode + ']', how); await wait(p, 200); }
async function card(p, id, how) { await press(p, '.dk-card[data-card="' + id + '"]', how); await wait(p, 250); }
async function writeAll(p, how) {
  const out = [];
  for (let guard = 0; guard < 10; guard++) {
    const ch = await p.evaluate(() => { const li = document.querySelector('.dk-strip li.cur span[lang]'); if (!li) return null; const c = li.cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.trim(); });
    if (!ch) break;
    if (how === 'touch') await drawTouch(p, ch, '.dk-ink', 0.1); else await drawMouse(p, ch, '.dk-ink', 0.1);
    await p.waitForFunction(() => !document.querySelector('[data-dk=donech]').disabled);
    const last = await p.evaluate(() => /see the page/.test(document.querySelector('[data-dk=donech]').textContent));
    await press(p, '[data-dk=donech]', how);
    await wait(p, 300);
    out.push(ch);
    if (last) break;
  }
  return out;
}

// ---- the place, the rest menu, the Words index -----------------------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { at: 'desk' });
  const opts = await p.evaluate(() => RB.company.restOptions(RB.game.s, RB.company.restHere(RB.game.s)).map((o) => o.label.en));
  assert(opts.indexOf('Writing desk') >= 0, 'the Gull is a rest place with a desk: its rest menu adds Writing desk');
  // the full rest menu: Just chat (where there is banter) first, Not now last, the desk among the added choices
  await p.evaluate(() => { RB.script.run('co.rest'); });
  await p.waitForSelector('button.choice');
  const menu = await p.evaluate(() => [...document.querySelectorAll('button.choice')].map((b) => { const c = b.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); }));
  const iDesk = menu.findIndex((t) => /Writing desk/.test(t)), iChat = menu.findIndex((t) => /Just chat/.test(t)), iNot = menu.findIndex((t) => /Not now/.test(t));
  assert(iDesk > 0 && iNot === menu.length - 1 && (iChat < 0 || iChat === 0), 'rest menu order kept: ' + menu.map((t) => t.replace(/^\d+\s*/, '').split('.')[0]).join(' | '));
  await shot(p, 'desk_rest_menu_1280');
  await press(p, 'button.choice:nth-of-type(' + (iDesk + 1) + ')');
  await p.waitForSelector('.pa-desk .dk-cards', { timeout: 5000 });
  assert(await p.evaluate(() => RB.activity.active() && RB.activity.active().ctx.source === 'companion-talk'), 'chosen from the rest menu, the desk opens after the rest scene has ended');
  await press(p, '[data-dk=leave]');
  await wait(p, 500);
  await p.evaluate(() => RB.ui.menu.open('practice'));
  await p.waitForSelector('[data-pr-begin=desk]');
  assert(!(await p.evaluate(() => !!document.querySelector('[data-pr-begin=lanterns]'))), 'Words › Ways to practise: Begin here for the desk at the Gull, not for the lamps');
  await p.evaluate(() => RB.ui.menu.close());
  assert(!errors.length, 'no errors: ' + errors.join('; '));
  await ctx.close();
}

// ---- Trace, Prompt, Typeset with the mouse; keeping pages; reload --------------------------------------------
{
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await start(p, { at: 'desk', items: ['v:月', 'v:空'] });
  await useSlot(p, SLOT);
  await openDesk(p);
  let tx = await sheetText(p);
  const tabs = await p.evaluate(() => [...document.querySelectorAll('.dk-tabs .ptab')].map((t) => t.dataset.id));
  assert(JSON.stringify(tabs) === JSON.stringify(['trace', 'copy', 'prompt', 'typeset']) && /Trace/.test(tx), 'four modes, each a tab, chosen directly');
  const nCards = await p.evaluate(() => document.querySelectorAll('.dk-card').length);
  assert(nCards === 20, 'twenty base cards (' + nCards + ')');
  await shot(p, 'desk_cards_trace_1280');
  // Trace 木 with the mouse
  await p.evaluate(() => { window.__records.length = 0; });
  await card(p, 'tree');
  await p.waitForSelector('.dk-ink');
  await wait(p, 200);
  await shot(p, 'desk_trace_before_1280');
  const traced = await writeAll(p, 'mouse');
  await p.waitForSelector('.dk-pagebox canvas');
  tx = await sheetText(p);
  assert(traced.join('') === '木', 'traced 木 stroke by stroke');
  const obs = await p.evaluate(() => RB.ui.desk.observe('木', [[{ x: 0.1, y: 0.4 }, { x: 0.9, y: 0.4 }]]));
  assert(obs && obs.kind, 'the observation helper answers for any drawing');
  assert(/Your handwriting/.test(tx) && /traced over the numbered strokes/.test(tx), 'the page is labelled "Your handwriting · traced"');
  assert(!(await p.evaluate(() => window.__records.length)), 'tracing records no mastery event');
  assert(await p.evaluate(() => RB.learn.introduced('v:木') && !(RB.game.s.learn.items['v:木'] && RB.game.s.learn.items['v:木'].box)), 'the card is introduced, not promoted');
  await shot(p, 'desk_trace_page_1280');
  // the observation shown for the last character, before the page
  await p.fill('#dk-label', 'My first tree');
  await press(p, '[data-dk=keep]');
  await p.waitForSelector('[data-dk=leave]');
  tx = await sheetText(p);
  assert(/Kept and saved/.test(tx), 'kept and saved to the slot');
  const pg1 = await p.evaluate(() => { const pg = RB.game.s.practice.deskPages[0]; return { label: pg.label, mode: pg.mode, saved: pg.saved, n: pg.strokes[0].s.length, ch: pg.strokes[0].ch, bytes: pg.bytes }; });
  assert(pg1.label === 'My first tree' && pg1.mode === 'trace' && pg1.saved && pg1.ch === '木' && pg1.n === 4 && pg1.bytes < 4096, 'the page keeps the real strokes (4), its label, mode and size: ' + JSON.stringify(pg1));
  // Write from a prompt: the cards show meanings only
  await press(p, '[data-dk=words]');
  await p.waitForSelector('.dk-cards');
  await tab(p, 'prompt');
  const faces = await p.evaluate(() => [...document.querySelectorAll('.dk-card')].map((c) => c.textContent));
  assert(faces.every((f) => !/[一-鿿]/.test(f)), 'Write from a prompt lists meanings only: no word shown before it is asked for');
  await shot(p, 'desk_cards_prompt_1280');
  await p.evaluate(() => { window.__records.length = 0; });
  await card(p, 'moon');
  await p.waitForSelector('.chal .pad-ink');
  await wait(p, 300);
  const task = await sheetText(p, '.chal-task');
  assert(!/月/.test(task) && /moon/.test(task), 'the task shows the meaning and a sentence with a gap, not 月 (' + task.slice(0, 90) + ')');
  await shot(p, 'desk_prompt_task_1280');
  await drawMouse(p, '月', '.pad-ink');
  await p.waitForFunction(() => !document.querySelector('.pad-confirm').disabled);
  const read = await p.evaluate(() => { const c = document.querySelector('.readas .big').cloneNode(true); c.querySelectorAll('rt').forEach((x) => x.remove()); return c.textContent.trim(); });
  await press(p, '.pad-confirm');
  await press(p, '.chal-submit');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await press(p, '.fbwrap [data-a=continue]');
  await p.waitForSelector('.dk-pagebox canvas');
  tx = await sheetText(p);
  const recs = await p.evaluate(() => window.__records.filter((r) => r.ctx === 'practice:copying'));
  assert(read === '月' && /counts as an ordinary answer/.test(tx) && recs.length === 1 && recs[0].id === 'v:月' && recs[0].ok && recs[0].mode === 'hand' && !recs[0].assisted, 'written from the prompt by hand (read as ' + read + '): one ordinary assessment ' + JSON.stringify(recs));
  assert(/written from a prompt/.test(tx), 'and a page of your handwriting can be kept');
  await shot(p, 'desk_prompt_page_1280');
  await press(p, '[data-dk=keep]');
  await p.waitForSelector('[data-dk=leave]');
  // written again at this desk (the answer has been in view): practice only
  await press(p, '[data-dk=again]');
  await p.waitForSelector('.chal .pad-ink');
  await p.evaluate(() => { window.__records.length = 0; });
  await drawMouse(p, '月', '.pad-ink');
  await p.waitForFunction(() => !document.querySelector('.pad-confirm').disabled);
  await press(p, '.pad-confirm');
  await press(p, '.chal-submit');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await press(p, '.fbwrap [data-a=continue]');
  await p.waitForSelector('.dk-done');
  tx = await sheetText(p);
  assert(/counts as practice/.test(tx) && !(await p.evaluate(() => window.__records.filter((r) => r.ctx === 'practice:copying').length)), 'written again at the same sitting: practice only, no second event');
  // another word, with the model shown through How to write: practice only
  await press(p, '[data-dk=words]');
  await p.waitForSelector('.dk-cards');
  await card(p, 'sky');
  await p.waitForSelector('.chal .pad-ink');
  await p.evaluate(() => { window.__records.length = 0; });
  await press(p, '.chal [data-a=more]');
  await press(p, '.chal [data-a=model]');
  await drawMouse(p, '空', '.pad-ink');
  await p.waitForFunction(() => !document.querySelector('.pad-confirm').disabled);
  await press(p, '.pad-confirm');
  await press(p, '.chal-submit');
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await press(p, '.fbwrap [data-a=continue]');
  await p.waitForSelector('.dk-done');
  tx = await sheetText(p);
  assert(/counts as practice/.test(tx) && !(await p.evaluate(() => window.__records.filter((r) => r.ctx === 'practice:copying').length)), 'with the model shown (How to write): practice only, no mastery event');
  // Typeset
  await press(p, '[data-dk=words]');
  await p.waitForSelector('.dk-cards');
  await tab(p, 'typeset');
  await card(p, 'star');
  await p.waitForSelector('[data-dk=make]');
  await press(p, 'input[name=dk-lay][value=vertical]');
  await press(p, 'input[name=dk-paper][value=grid]');
  await shot(p, 'desk_typeset_1280');
  await press(p, '[data-dk=make]');
  await p.waitForSelector('[data-dk=keep]');
  tx = await sheetText(p);
  assert(/Typeset — not handwriting/.test(tx) && !/Your handwriting/.test(tx), 'a typeset page is labelled typeset, never your handwriting');
  await press(p, '[data-dk=keep]');
  await p.waitForSelector('[data-dk=leave]');
  const kinds = await p.evaluate(() => RB.game.s.practice.deskPages.map((x) => x.mode + (x.strokes ? '+strokes' : '') + (x.typeset ? '+typeset' : '')));
  assert(JSON.stringify(kinds) === JSON.stringify(['trace+strokes', 'prompt+strokes', 'typeset+typeset']), 'three pages: ' + kinds.join(', '));
  // fill to six through the same keepPage, then the seventh asks
  await p.evaluate(async () => {
    for (const w of ['山', '川', '石']) await RB.practiceDesk.keepPage(RB.game.s, { word: w, reading: '', mode: 'copy', ink: [{ ch: w, strokes: RB.recog.reference(w).strokes.map((st) => st.map((q) => ({ x: q.x / 109, y: q.y / 109 }))) }], label: 'Copied ' + w });
  });
  assert((await p.evaluate(() => RB.game.s.practice.deskPages.length)) === 6, 'six pages kept');
  await press(p, '[data-dk=words]');
  await p.waitForSelector('.dk-cards');
  await tab(p, 'trace');
  await card(p, 'rain');
  await writeAll(p, 'mouse');
  await p.waitForSelector('[data-dk=keep]');
  await press(p, '[data-dk=keep]');
  await p.waitForSelector('.pa-replace .dk-replist');
  await wait(p, 200);
  const prevs = await p.evaluate(() => ({ items: document.querySelectorAll('.pa-replace .dk-repitem').length, canv: document.querySelectorAll('.pa-replace .dk-repitem canvas').length, type: document.querySelectorAll('.pa-replace .dk-repitem .dk-type').length, fresh: !!document.querySelector('.pa-replace .dk-newprev canvas') }));
  assert(prevs.items === 6 && prevs.canv === 5 && prevs.type === 1 && prevs.fresh, 'the replace sheet previews the six and the new page: ' + JSON.stringify(prevs));
  await shot(p, 'desk_replace_1280');
  await press(p, '.pa-replace [data-x]');
  await p.waitForSelector('.dk-status');
  tx = await sheetText(p);
  const after6 = await p.evaluate(() => RB.game.s.practice.deskPages.map((x) => x.label));
  assert(/Not kept: your six pages are as they were/.test(tx) && after6.length === 6 && after6.indexOf('My first tree') === 0, 'cancel: the six are unchanged, the new page still on screen');
  await press(p, '[data-dk=keep]');
  await p.waitForSelector('.pa-replace [data-rep]');
  await press(p, '.pa-replace .dk-repitem:nth-child(4) [data-rep]');
  await p.waitForSelector('.csheet');
  await shot(p, 'desk_replace_confirm_1280');
  await press(p, '.csheet .pbtn.danger');
  await p.waitForSelector('[data-dk=leave]');
  const after7 = await p.evaluate(() => RB.game.s.practice.deskPages.map((x) => x.label));
  assert(after7.length === 6 && after7[3] === 'Rain, traced' && after7.indexOf('Copied 山') < 0 && after7[0] === 'My first tree', 'replace: only the chosen page, in its place: ' + after7.join(' | '));
  await press(p, '[data-dk=leave]');
  await wait(p, 500);
  // the mementos page, the shelf, the pin
  await p.evaluate(() => RB.ui.menu.open('journey'));
  await p.waitForSelector('[data-jv=mementos]');
  await press(p, '[data-jv=mementos]');
  await p.waitForSelector('.pm-grid');
  const cells = await p.evaluate(() => [...document.querySelectorAll('.pm-cell')].map((c) => c.textContent.replace(/\s+/g, ' ')));
  assert(cells.length === 6 && cells.filter((c) => /Your handwriting/.test(c)).length === 5 && cells.filter((c) => /Typeset/.test(c)).length === 1, 'Practice mementos: the six pages, handwriting and typeset told apart');
  await press(p, '.pm-cell:nth-child(1)');
  await press(p, '.pm-detail [data-pm-shelf]');
  await wait(p, 200);
  assert(await p.evaluate(() => RB.game.s.practice.mementoDisplay.shelf && !RB.game.s.discovery.display), 'on the practice shelf; no keepsake display touched');
  await shot(p, 'desk_mementos_1280');
  await p.evaluate(() => RB.ui.menu.close());
  await wait(p, 300);
  // reload: the autosave brings everything back
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  const ok = await p.evaluate(async (slot) => { RB.ui.title.hide(); return RB.game.loadCampaign(slot, 'auto'); }, SLOT);
  await wait(p, 400);
  const back = await p.evaluate(() => ({ labels: RB.game.s.practice.deskPages.map((x) => x.label), saved: RB.game.s.practice.deskPages.every((x) => x.saved), strokes: RB.game.s.practice.deskPages[0].strokes[0].s.length, shelf: RB.game.s.practice.mementoDisplay.shelf }));
  assert(ok && back.labels.length === 6 && back.labels[0] === 'My first tree' && back.labels[3] === 'Rain, traced' && back.saved && back.strokes === 4 && back.shelf, 'after a reload: the six pages, their strokes, labels and shelf (' + JSON.stringify(back) + ')');
  await p.evaluate(() => RB.ui.menu.open('journey'));
  await press(p, '[data-jv=mementos]');
  await p.waitForSelector('.pm-detail');
  // pin on Shared memories while a keepsake is on display: asked first
  const kid = await p.evaluate(() => { const s = RB.game.s; const id = Object.keys(RB.content.keepsakes).find((k) => RB.content.keepsakes[k].category !== 'shared'); s.discovery.keepsakes[id] = { map: 'rw.village' }; s.discovery.display = id; return id; });
  await press(p, '.pm-detail [data-pm-pin]');
  await p.waitForSelector('.csheet');
  const q = await p.evaluate(() => document.querySelector('.csheet .q').textContent);
  assert(/instead of the keepsake/.test(q), 'pinning while a keepsake is up asks first: ' + q.slice(0, 80));
  await press(p, '.csheet .pbtn:last-child');
  await wait(p, 200);
  assert(await p.evaluate((k) => RB.game.s.discovery.display === k && !RB.game.s.practice.mementoDisplay.pin, kid), 'declined: the keepsake stays up');
  await press(p, '.pm-detail [data-pm-pin]');
  await p.waitForSelector('.csheet');
  await press(p, '.csheet .pbtn.primary');
  await wait(p, 200);
  const pin = await p.evaluate((k) => ({ disp: RB.game.s.discovery.display, found: !!RB.game.s.discovery.keepsakes[k], pin: RB.game.s.practice.mementoDisplay.pin }), kid);
  assert(!pin.disp && pin.found && pin.pin, 'chosen: the practice page is pinned; the keepsake is down but still found');
  await p.evaluate(() => { RB.ui.menu.close(); RB.ui.menu.open('memories'); });
  await p.waitForSelector('.pm-company');
  await shot(p, 'desk_pinned_memories_1280');
  assert(await p.evaluate(() => document.querySelectorAll('.co-pinned').length === 1), 'Company › Shared memories shows the one pinned display');
  await p.evaluate(() => RB.ui.menu.close());
  assert(!errors.length, 'no errors: ' + errors.join('; '));
  await ctx.close();
}

// ---- Copy beside the model with touch on a phone; a refused storage write -----------------------------------
{
  const { p, errors, ctx } = await page(b, url, phone(390, 844));
  await start(p, { at: 'desk' });
  await useSlot(p, 4);
  await openDesk(p);
  await tab(p, 'copy', 'touch');
  await shot(p, 'desk_cards_copy_390');
  await p.evaluate(() => { window.__records.length = 0; });
  await card(p, 'river', 'touch');
  await p.waitForSelector('.dk-model canvas');
  await wait(p, 250);
  const layout = await p.evaluate(() => { const a = document.querySelector('.dk-sq').getBoundingClientRect(), m = document.querySelector('.dk-model').getBoundingClientRect(); return { overlap: !(a.right <= m.left || m.right <= a.left || a.bottom <= m.top || m.bottom <= a.top) }; });
  assert(!layout.overlap, 'the model sits in its own square, not under the writing');
  await shot(p, 'desk_copy_390');
  const types = [];
  await p.evaluate(() => { window.__ptypes = []; document.querySelector('.dk-ink').addEventListener('pointerdown', (e) => window.__ptypes.push(e.pointerType)); });
  const w = await writeAll(p, 'touch');
  types.push(...(await p.evaluate(() => window.__ptypes)));
  assert(w.join('') === '川' && types.length === 3 && types.every((t) => t === 'touch'), 'copied 川 with three touch strokes (' + types.join(',') + ')');
  await p.waitForSelector('[data-dk=keep]');
  assert(!(await p.evaluate(() => window.__records.length)), 'copying records no mastery event');
  await shot(p, 'desk_copy_page_390');
  // storage refuses the write: art stays, marked unsaved, nothing kept
  await p.evaluate(() => { window.__realAuto = RB.save.autosave; RB.save.autosave = async () => null; });
  await press(p, '[data-dk=keep]', 'touch');
  await p.waitForSelector('.dk-status');
  await wait(p, 200);
  const st = await p.evaluate(() => ({ text: document.querySelector('.dk-status').textContent, uns: !!document.querySelector('.dk-prev .uns'), art: !!document.querySelector('.dk-pagebox canvas'), pages: RB.game.s.practice.deskPages.length }));
  assert(/Not saved: storage refused it/.test(st.text) && st.uns && st.art && st.pages === 0, 'a refused write: the art stays on screen, marked Not saved; no page claimed kept');
  await shot(p, 'desk_unsaved_390');
  await p.evaluate(() => { RB.save.autosave = window.__realAuto; });
  await press(p, '[data-dk=keep]', 'touch');
  await p.waitForSelector('[data-dk=leave]');
  assert(await p.evaluate(() => RB.game.s.practice.deskPages.length === 1 && RB.game.s.practice.deskPages[0].saved), 'trying again once storage works: kept and saved');
  await press(p, '[data-dk=leave]', 'touch');
  await wait(p, 400);
  assert(!errors.length, 'no errors: ' + errors.join('; '));
  await ctx.close();
}

await b.close(); srv.close();
console.log('\n' + (n - fail) + '/' + n + ' checks passed (' + Math.round((Date.now() - t0) / 1000) + ' s)');
process.exit(fail ? 1 : 0);
