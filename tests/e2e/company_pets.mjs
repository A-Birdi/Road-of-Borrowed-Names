// Pets and companionship together (addendum §5.3, §6.3–6.4, §19.2; tests §23.2 "rest interactions and
// non-pet alternatives", §23.3 "no pet / hidden pet"): the seams neither worker could test on its own branch.
// Built index.html, headless Chromium, synthetic session-only campaigns (no player saves are touched).
// 1. Meeting an animal through the real meeting hook (named with the keyboard, "Travel together" clicked)
//    leaves exactly one Pets memory — with the chosen name and the place — shown once in Shared memories.
// 2. At a rest setting (the Reedwake teahouse) talking to the companion offers "Greet the cat together"
//    beside the ordinary choices; choosing it plays that companion × animal moment; nothing is awarded,
//    and it is offered again next time.
// 3. With the animal hidden in exploration, or with no animal chosen, the rest menu does not offer it and
//    the other choices remain.
// Captures: tests/e2e/out/company_pets/.
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'tests/e2e/out/company_pets');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const wait = (ms) => p.waitForTimeout(ms);
const state = () => p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s)));
const choices = () => p.evaluate(() => [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((c) => c.textContent.replace(/\s+/g, ' ').trim()));

// play a dialogue through with real clicks (Next on lines; the reply matching `pick` on choices)
async function talk(picks) {
  picks = [].concat(picks || []);
  const seen = [];
  for (let i = 0; i < 80; i++) {
    const st = await p.evaluate(() => ({
      choices: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((c) => c.textContent.replace(/\s+/g, ' ').trim()),
      dlg: !!document.querySelector('.dlg:not(.hidden)'), running: RB.script.isRunning(), mode: RB.game.mode(),
      line: (document.querySelector('.dlg:not(.hidden) .main') || {}).textContent || '',
    }));
    if (st.choices.length) {
      const want = picks.length ? picks.shift() : null;
      const idx = want ? st.choices.findIndex((c) => new RegExp(want, 'i').test(c)) : 0;
      if (idx < 0) throw new Error('no reply matching ' + want + ' in ' + JSON.stringify(st.choices));
      seen.push('> ' + st.choices[idx]);
      await wait(160);
      await p.locator('.choices:not(.hidden) .choice').nth(idx).click();
      await wait(120);
      continue;
    }
    if (st.dlg) { seen.push(st.line.slice(0, 200)); await p.locator('.dlg .b-next').click(); await wait(90); continue; }
    if (!st.running && st.mode === 'world') { await wait(200); if (!(await p.evaluate(() => RB.script.isRunning() || !!document.querySelector('.dlg:not(.hidden)')))) return seen; }
    else await wait(100);
  }
  throw new Error('dialogue did not finish: ' + seen.slice(-4).join(' | '));
}
async function restMenu() {
  await p.evaluate(() => RB.game.companionTalk());
  await p.waitForSelector('.choices:not(.hidden) .choice', { timeout: 8000 });
  await wait(120);
  return choices();
}

// ---- a committed companion at the Reedwake teahouse (a rest setting) -----------------------------------------------
await p.evaluate(() => {
  const def = RB.content.maps['rw.tea'] || {};
  const seen = {};
  for (const ev of def.onEnter || []) seen['enter:rw.tea:' + ev.scene] = true;
  const s = RB.game.debugStart('rw.tea', 4, 6, { comp: 'mio', dir: 'up', flags: Object.assign({ departed: true, ch1_done: true, rw_arrived: true, rw_echo_done: true }, seen) });
  s.chapter = 2;
  RB.game.settings.textSpeed = 'instant';
  RB.company.sync(s, 'live');
  RB.company.refresh(s);
});
await wait(400);
// a step or two so Mio stands beside you, as in play
for (const d of ['ArrowLeft', 'ArrowUp']) { await p.keyboard.down(d); await wait(260); await p.keyboard.up(d); await wait(200); }
const rest0 = await p.evaluate(() => ({ rest: RB.company.restHere(RB.game.s), comp: !!(RB.world.W && RB.world.W.comp) }));
assert(rest0.rest && rest0.comp, 'the teahouse is a rest setting and Mio is beside you (' + JSON.stringify(rest0) + ')');

// ---- 3a. no animal chosen: nothing to greet, the ordinary rest choices remain ----------------------------------------
let menu = await restMenu();
assert(!menu.some((c) => /Greet the/.test(c)) && menu.some((c) => /Not now/.test(c)) && menu.length >= 2, 'no animal: the rest menu has no greeting, the other choices remain (' + menu.join(' | ') + ')');
await talk(['Not now']);

// ---- 1. meeting the cat through the real hook: one memory, the chosen name, the place ---------------------------------
await p.evaluate(() => { window.__met = null; RB.hooks.pet_meet(['cat']).then(() => { window.__met = true; }); });
await p.waitForSelector('#pn-name', { timeout: 8000 });
await p.fill('#pn-name', 'タマ');
await p.keyboard.press('Enter');
await p.waitForSelector('.csheet button', { timeout: 8000 });
await p.locator('.csheet button', { hasText: 'Travel together' }).click();
await p.waitForFunction(() => window.__met === true, null, { timeout: 10000 });
await wait(300);
let st = await state();
const pets = st.company.memories.filter((m) => m.kind === 'pets');
assert(pets.length === 1 && pets[0].id === 'pet:met:cat', 'one meeting, one Pets memory (' + pets.map((m) => m.id).join(', ') + ')');
assert(pets[0] && pets[0].petName === 'タマ' && pets[0].pet && pets[0].pet.name === 'タマ', 'the memory keeps the name chosen at the meeting');
assert(pets[0] && pets[0].place && pets[0].place.en && pets[0].reply && pets[0].reply.en, 'it records the place and Mio\'s words then (' + JSON.stringify(pets[0] && pets[0].place) + ')');
await p.evaluate(() => RB.ui.menu.open('memories'));
await p.waitForSelector('.co-mem');
await p.click('[data-co-filter=pets]');
await wait(80);
const shown = await p.evaluate(() => [...document.querySelectorAll('.co-mem')].map((e) => ({ kind: e.dataset.kind, t: e.textContent.replace(/\s+/g, ' ') })));
assert(shown.length === 1 && shown[0].kind === 'pets' && /タマ/.test(shown[0].t) && new RegExp(pets[0].place.en).test(shown[0].t), 'Shared memories › Pets shows it once, with the name and the place (' + shown.map((x) => x.t.slice(0, 90)).join(' || ') + ')');
await p.screenshot({ path: path.join(OUT, 'memories_pets_1280x800.png') });
// a notice over the open folio (like "… is travelling with you" just now) never takes a click meant for a
// tab under it: a real click where the two overlap opens that tab
await p.evaluate(() => RB.ui.notice('A notice raised while the folio is open, long enough to reach the tabs'));
await wait(150);
const hit = await p.evaluate(() => {
  const n = [...document.querySelectorAll('#overlay .notices .notice')].pop().getBoundingClientRect();
  for (const t of document.querySelectorAll('.folio [role=tab]')) {
    const r = t.getBoundingClientRect();
    const x0 = Math.max(r.left, n.left), x1 = Math.min(r.right, n.right), y0 = Math.max(r.top, n.top), y1 = Math.min(r.bottom, n.bottom);
    if (x1 - x0 > 8 && y1 - y0 > 4 && t.getAttribute('aria-selected') !== 'true') return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, tab: t.textContent.replace(/\s+/g, ' ').trim() };
  }
  return null;
});
if (hit) {
  await p.mouse.click(hit.x, hit.y);
  await wait(250);
  const now = await p.evaluate(() => { const t = document.querySelector('.folio [role=tab][aria-selected=true]'); return t ? t.textContent.replace(/\s+/g, ' ').trim() : ''; });
  assert(now === hit.tab, 'a click on the "' + hit.tab + '" tab where a notice covers it opens that tab (now: ' + now + ')');
} else console.log('note: no unselected tab lies under the notice at this size; the click-through check did not apply');
await p.evaluate(() => RB.ui.menu.close());
await wait(200);

// ---- 2. the rest menu offers the greeting; it plays; nothing is awarded; offered again ----------------------------------
const before = await state();
menu = await restMenu();
assert(menu.some((c) => /Greet the cat together/.test(c)) && menu.some((c) => /Not now/.test(c)), 'at the teahouse, talking to Mio offers "Greet the cat together" beside the other choices (' + menu.join(' | ') + ')');
await p.screenshot({ path: path.join(OUT, 'rest_menu_greet_1280x800.png') });
const g = await talk(['Greet the cat together']);
st = await state();
assert(g.length >= 2 && g.slice(1).some((l) => /Mio/.test(l) && /cat/.test(l)), 'the Mio × cat moment plays (' + g.slice(0, 3).join(' | ') + ')');
const same = (k) => JSON.stringify(st[k]) === JSON.stringify(before[k]);
assert(same('inv') && same('words') && JSON.stringify(st.company.bond) === JSON.stringify(before.company.bond) && st.company.memories.length === before.company.memories.length, 'nothing is awarded: items, words, bond and memories unchanged');
menu = await restMenu();
assert(menu.some((c) => /Greet the cat together/.test(c)), 'and it is offered again: a moment, not a one-off reward');
await talk(['Not now']);

// ---- 3b. the animal hidden in exploration: not offered ------------------------------------------------------------------
await p.evaluate(() => { RB.game.settings.petWorld = false; RB.game.applySettings && RB.game.applySettings(); });
await wait(200);
menu = await restMenu();
assert(!menu.some((c) => /Greet the/.test(c)) && menu.some((c) => /Not now/.test(c)), 'with the animal hidden in exploration the greeting is not offered (' + menu.join(' | ') + ')');
await talk(['Not now']);
await p.evaluate(() => { RB.game.settings.petWorld = true; RB.game.applySettings && RB.game.applySettings(); });

assert(!errors.length, 'no page errors: ' + errors.join('; '));
await b.close(); srv.close();
console.log(fail ? fail + ' failed' : 'all ok');
process.exit(fail ? 1 : 0);
