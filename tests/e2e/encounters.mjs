// The encounter platform on screen (expansion P04; src/ui/80_combat.js, 80s_encounter.js; the fixtures in
// src/content/encounters/00_fixtures.js), in Chromium on the built game, with no journey saved:
//  - an ordinary six-chapter battle shows none of the new controls;
//  - order numbers and aims on a group's slips; conditions on slips; the "Here:" line from a condition's rule;
//  - Wait is chosen on purpose (a confirmation), answers nothing, and the creatures act;
//  - an objective, a protected object on the party's slip, a ward before it;
//  - a guest with their own aim; a summoner's call bringing a creature onto the stage;
//  - the modifier row: an unnatural pairing dimmed with the reason; a pairing's phrase (typed whole, handwritten with
//    the rest shown);
//  - a conversation: the people, the record, a choice's language step, a companion's own move, Unravel finding
//    nothing tangled and marked tried; every conclusion text shown;
//  - a machine: a wrong step's interpretation shown before it commits, the restart; done; Resolve this step offered
//    the second time;
//  - phone width: no horizontal overflow; no errors, no network.
// Usage: node tests/e2e/encounters.mjs
import { serve, launch, page, companionTurn } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
async function test(name, fn) {
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; console.log('PASS ' + name); }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + String(e && e.stack || e).slice(0, 1200)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const WORDS = ['mamoru', 'mizu', 'hikari', 'kaze', 'nawa', 'ishi', 'iyasu', 'honoo', 'suzu', 'koe'];
async function begin(p, o) {
  await p.evaluate(([o, WORDS]) => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, o.comp ? { comp: o.comp } : {});
    s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E'; s.learn.difficulty = o.difficulty || 'normal';
    s.words = (o.words || WORDS).slice();
    RB.game.settings.input = o.input || 'choice';
    RB.game.settings.battleAnim = 'instant';
    RB.game.settings.intentDisplay = 'adaptive';
    RB.game.settings.compPlan = 'ask';
    RB.game.applySettings();
    window.__res = null;
    (o.enc ? RB.game.startEncounter(o.enc, {}) : RB.game.startBattle(o.enemy, {})).then((r) => { window.__res = r; });
  }, [o, WORDS]);
}
async function cards(p) {
  for (let i = 0; i < 300; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp[data-i], .enc-card'), conf: !!document.querySelector('.csheet') }));
    if (st.cards && !st.conf) break;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForSelector('.resp[data-i], .enc-card');
  await p.waitForTimeout(120);
}
const clickCard = async (p, re) => {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, re);
  assert(i != null, 'no card matching ' + re + ': ' + await p.evaluate(() => [...document.querySelectorAll('.rcard')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 60)).join(' | ')));
  await p.click('.rcard[data-i="' + i + '"]');
};
const confirmPick = async (p, re) => {
  try { await p.waitForFunction(() => !!document.querySelector('.csheet .pbtn'), null, { timeout: 15000 }); }
  catch (e) { throw new Error('no confirmation for ' + re + ': ' + JSON.stringify(await p.evaluate(() => ({ mode: RB.game.mode(), chal: !!document.querySelector('.chal'), fb: (document.querySelector('.fbwrap') || {}).textContent, cards: [...document.querySelectorAll('.rcard')].map((x) => x.textContent.replace(/\s+/g, ' ').slice(0, 40)), log: (document.querySelector('.enc-log, .clog') || {}).textContent })))); }
  await p.evaluate((m) => { const b = [...document.querySelectorAll('.csheet .pbtn')].find((x) => new RegExp(m, 'i').test(x.textContent)); b.click(); }, re);
};
// a confirmation that may or may not come (a companion with nothing to add asks nothing)
const maybeConfirm = async (p, re) => {
  for (let k = 0; k < 20; k++) {
    if (await p.evaluate(() => !!document.querySelector('.csheet .pbtn'))) { await confirmPick(p, re); return true; }
    if (await p.evaluate(() => !!document.querySelector('.enc-end'))) return false;
    await p.waitForTimeout(100);
  }
  return false;
};
// answer the open language step correctly in choice mode (the right option), continue
async function answer(p) {
  await p.waitForSelector('.chal');
  await p.evaluate(() => {
    const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click();
  });
  await p.waitForSelector('.chal .mc .btn');
  const ok = await p.evaluate(() => {
    const st = RB.challenge.active ? RB.challenge.active() : null;
    const btns = [...document.querySelectorAll('.chal .mc .btn')];
    // the runner marks nothing; try each until the feedback says right
    return btns.map((x) => x.textContent.trim());
  });
  for (let k = 0; k < ok.length; k++) {
    await p.evaluate((k) => { const b = [...document.querySelectorAll('.chal .mc .btn')][k]; if (b && !b.disabled) b.click(); }, k);
    await p.waitForTimeout(80);
    if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
  }
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
}
const noOverflow = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.body.scrollWidth <= innerWidth + 1);

await test('an ordinary battle of the six-chapter game shows none of the platform\'s new controls', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enemy: 'rw.reedling', comp: 'ren' });
  await cards(p);
  const r = await p.evaluate(() => ({ wait: [...document.querySelectorAll('.rcard')].some((x) => /Wait/.test(x.textContent)), mods: !!document.querySelector('.cb-mods'), obj: !!document.querySelector('.cb-obj'), ord: !!document.querySelector('.fs-ord, .ib-o'), rules: JSON.stringify(RB.combat.debug ? null : null) }));
  assert(!r.wait && !r.mods && !r.obj && !r.ord, 'nothing new: ' + JSON.stringify(r));
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('a group: order numbers and aims; conditions on the slips; "Here:" from a condition\'s rule; Wait on purpose', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enc: 'fx.ordinary', comp: 'ren' });
  await cards(p);
  const r = await p.evaluate(() => ({
    ords: [...document.querySelectorAll('.cb-foe .fs .fs-ord')].map((x) => x.textContent),
    labels: [...document.querySelectorAll('.cb-foe .fs')].map((x) => x.getAttribute('aria-label')),
    pills: [...document.querySelectorAll('.cb-foe .fs .pill')].map((x) => x.textContent.trim()),
    badges: [...document.querySelectorAll('.cb-ib .ib-o')].map((x) => x.textContent),
  }));
  // the slips carry the order when the stage is too small for badges; the badges carry it otherwise
  assert((r.ords.join(',') === '1,2' || r.badges.join(',') === '1,2') && r.labels.every((l) => /acting (first|second)/.test(l)), 'the numbered order: ' + JSON.stringify(r));
  assert(r.labels.some((l) => /Made of flame/.test(l)) && r.labels.some((l) => /Made of paper/.test(l)), 'conditions named on the slips: ' + r.labels.join(' | '));
  // target the ember, then read water's line
  await p.evaluate(() => RB.combat.target(0));
  const here = await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard')].find((x) => /water/i.test(x.textContent) && !/ice/i.test(x.textContent)); return c && c.querySelector('.rc-here') ? c.querySelector('.rc-here').textContent : null; });
  assert(here && /quenches part of/i.test(here), 'water on a creature of flame, by the rule: ' + here);
  // Wait: a confirmation first; "Choose again" changes nothing
  await clickCard(p, 'Wait and watch');
  await confirmPick(p, 'Choose again');
  await cards(p);
  await clickCard(p, 'Wait and watch');
  await confirmPick(p, '^Wait$');
  await companionTurn(p);
  await p.waitForFunction(() => RB.combat.phase() === 'choose' || window.__res, null, { timeout: 20000 });
  const log = await p.evaluate(() => (document.querySelector('.clog') || {}).textContent || '');
  assert(/watch/i.test(log), 'Wait was played: ' + log.slice(0, 200));
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('an objective: the line above, the letter on the party\'s slip, a ward before it', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enc: 'fx.protect', comp: null });
  await cards(p);
  const r = await p.evaluate(() => ({ obj: (document.querySelector('.cb-obj') || {}).textContent || '', party: (document.querySelector('.cb-party') || {}).textContent || '', ward: [...document.querySelectorAll('.rcard')].some((x) => /letter/.test(x.textContent) && /protect/i.test(x.textContent)) }));
  assert(/Keep the letter safe/.test(r.obj) && /the letter/.test(r.party) && r.ward, 'objective, letter and ward: ' + JSON.stringify(r));
  await clickCard(p, 'protect.*the letter|the letter.*protect');
  await answer(p);
  await p.waitForFunction(() => RB.combat.phase() === 'choose' || window.__res, null, { timeout: 20000 });
  const hp = await p.evaluate(() => { const c = RB.combat.context ? null : null; const t = document.querySelector('.cb-party').textContent; return t; });
  assert(/3 \/ 3/.test(hp), 'the ward caught the blow meant for the letter: ' + hp);
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('a guest with their own aim; a summoner\'s call brings a creature onto the stage', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(p, { enc: 'fx.guest', comp: null });
  await cards(p);
  assert(/porter/i.test(await p.evaluate(() => document.querySelector('.cb-party').textContent)), 'the porter is on the party\'s slip, as a guest');
  await clickCard(p, 'water');
  await answer(p);
  await p.waitForFunction(() => RB.combat.phase() === 'choose' || window.__res, null, { timeout: 20000 });
  const log = await p.evaluate(() => (document.querySelector('.clog') || {}).textContent || '');
  assert(/porter heaves/i.test(log), 'the porter acted by their own aim: ' + log.slice(0, 300));
  await ctx.close();
  const q = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await begin(q.p, { enc: 'fx.summoner', comp: null, difficulty: 'hard' });
  await cards(q.p);
  const n0 = await q.p.evaluate(() => document.querySelectorAll('.cb-foe .fs, .cb-foe .fplate').length);
  await clickCard(q.p, 'water');
  await answer(q.p);
  await q.p.waitForFunction(() => RB.combat.phase() === 'choose' || window.__res, null, { timeout: 20000 });
  const n1 = await q.p.evaluate(() => ({ slips: document.querySelectorAll('.cb-foe .fs').length, foes: RB.battleStage.lay() ? RB.battleStage.lay().foes.length : 0, log: (document.querySelector('.clog') || {}).textContent || '' }));
  assert(n1.slips === 2 && n1.foes === 2 && /joins the encounter/.test(n1.log), 'the call brought a creature: ' + n0 + ' -> ' + JSON.stringify(n1).slice(0, 300));
  assert(!q.errors.length && !q.requests.length && !errors.length, 'no errors, no network: ' + q.errors.concat(q.requests, errors).join(' | '));
  await q.ctx.close();
});

await test('the modifier row: an unnatural pairing dimmed with the reason; the phrase typed whole, handwritten with the rest shown', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await begin(p, { enc: 'fx.mods', comp: 'ren', input: 'hand' });
  await cards(p);
  assert(await p.evaluate(() => document.querySelectorAll('.cb-mods .mod-chip').length === 11), 'eleven modifier chips');
  await p.evaluate(() => [...document.querySelectorAll('.cb-mods .mod-chip')].find((x) => x.dataset.mod === 'subete').click());
  await p.waitForTimeout(100);
  const r = await p.evaluate(() => ({
    water: (() => { const c = [...document.querySelectorAll('.rcard')].find((x) => /water/i.test(x.textContent)); return c ? { dis: c.disabled, t: c.textContent } : null; })(),
    ward: (() => { const c = [...document.querySelectorAll('.rcard.modded')].find((x) => /protect/i.test(x.textContent)); return c ? c.textContent.replace(/\s+/g, ' ') : null; })(),
  }));
  assert(r.water && r.water.dis && /does not read naturally/.test(r.water.t), 'water dimmed with the reason: ' + JSON.stringify(r.water));
  assert(r.ward && /すべて/.test(r.ward), 'protect extended: ' + r.ward);
  await clickCard(p, 'すべて を');
  await p.waitForSelector('.chal');
  const hand = await p.evaluate(() => ({ tpl: (document.querySelector('.chal-tpl') || {}).textContent || '', prompt: (document.querySelector('.chal-prompt') || {}).textContent || '' }));
  assert(/守る|まもる/.test(hand.tpl) && /missing words/i.test(hand.prompt), 'handwritten: the modifier and its particle, the rest shown: ' + JSON.stringify(hand));
  await p.evaluate(() => document.querySelector('.chal-tabs .ptab[data-mode="ime"]').click());
  await p.waitForTimeout(80);
  const typed = await p.evaluate(() => ({ tpl: (document.querySelector('.chal-tpl') || {}).textContent || '', prompt: (document.querySelector('.chal-prompt') || {}).textContent || '' }));
  assert(!typed.tpl && /whole phrase/i.test(typed.prompt), 'typed: the whole phrase: ' + JSON.stringify(typed));
  await p.fill('.chal input', 'すべてをまもる');
  await p.click('[data-a=submit]');
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  await p.waitForTimeout(150);
  const items = await p.evaluate(() => Object.keys(RB.game.s.learn.items).filter((k) => /全て|mod_subete|守る/.test(k)));
  assert(items.indexOf('g:mod_subete') >= 0 && items.indexOf('v:全て') >= 0, 'the phrase\'s items recorded: ' + items.join(', '));
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('a conversation: the people, the record, a choice and its language step, a companion\'s own move; Unravel finds nothing tangled', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await begin(p, { enc: 'fx.dispute', comp: 'ren' });
  await p.waitForSelector('.enc-card');
  const r = await p.evaluate(() => ({ people: [...document.querySelectorAll('.enc-person')].map((x) => x.textContent.replace(/\s+/g, ' ')), claims: document.querySelectorAll('.enc-claim').length }));
  assert(r.people.length === 2 && /Heated/.test(r.people[0]) && /Closed off/.test(r.people[1]) && r.claims === 2, 'the people and the record: ' + JSON.stringify(r));
  // Unravel: nothing tangled, then marked tried
  await clickCard(p, 'Unravel');
  await confirmPick(p, 'Nothing this time');
  await p.waitForSelector('.enc-card');
  const t1 = await p.evaluate(() => ({ log: document.querySelector('.enc-log').textContent, tried: [...document.querySelectorAll('.enc-card')].some((x) => /Unravel/.test(x.textContent) && /Tried/.test(x.textContent)) }));
  assert(/Nothing here is tangled/.test(t1.log) && t1.tried, 'nothing tangled, and tried: ' + JSON.stringify(t1).slice(0, 300));
  // ask where: the language step, then Ren's own move
  await clickCard(p, 'where they picked them up');
  await answer(p);
  await confirmPick(p, 'Hold the lamp');
  await p.waitForSelector('.enc-card');
  const t2 = await p.evaluate(() => ({ claims: [...document.querySelectorAll('.enc-claim')].map((x) => x.textContent), log: document.querySelector('.enc-log').textContent }));
  assert(t2.claims.length === 4 && /lamp close/.test(t2.log), 'the back door and the slip are on record: ' + JSON.stringify(t2).slice(0, 400));
  await clickCard(p, 'third goes out this afternoon');
  await answer(p);
  await maybeConfirm(p, 'Nothing this time');
  await p.waitForSelector('.enc-end');
  assert(/Nobody was a thief/.test(await p.evaluate(() => document.querySelector('.enc-end').textContent)), 'the conclusion is told');
  await p.click('.enc-sheet [data-ok]');
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  assert(await p.evaluate(() => window.__res.outcome === 'resolved' && RB.game.mode() === 'world'), 'resolved, back in the world');
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('a machine: a wrong step shown before it commits, the restart; done; Resolve this step the second time', async () => {
  const { p, errors, requests, ctx } = await page(b, url, { viewport: { width: 1280, height: 860 } });
  await begin(p, { enc: 'fx.sluice', comp: null });
  await p.waitForSelector('.enc-card');
  assert(/Step 1 of 3/.test(await p.evaluate(() => document.querySelector('.enc-machine').textContent)), 'the machine, step 1 of 3');
  await clickCard(p, 'Turn the wheel');
  await answer(p);
  await p.waitForSelector('.csheet');
  assert(/You will turn the wheel first/.test(await p.evaluate(() => document.querySelector('.csheet').textContent)), 'what you meant, before it commits');
  await confirmPick(p, 'Yes, do it');
  await p.waitForSelector('.enc-card');
  assert(/jams/.test(await p.evaluate(() => document.querySelector('.enc-log').textContent)), 'the wrong step: back to the start');
  for (const a of ['Open the gate', 'Turn the wheel', 'Close the gate']) { await clickCard(p, a); await answer(p); await confirmPick(p, 'Yes, do it'); await p.waitForSelector('.enc-card, .enc-end'); }
  await p.waitForSelector('.enc-end');
  await p.click('.enc-sheet [data-ok]');
  await p.waitForFunction(() => window.__res, null, { timeout: 10000 });
  await p.evaluate(() => { window.__res = null; RB.game.startEncounter('fx.sluice', {}).then((r) => { window.__res = r; }); });
  await p.waitForSelector('.enc-card');
  assert(await p.evaluate(() => [...document.querySelectorAll('.enc-card')].some((x) => /completed before/.test(x.textContent))), 'Resolve this step is offered');
  // phone width: nothing overflows
  await p.setViewportSize({ width: 390, height: 800 });
  await p.waitForTimeout(200);
  assert(await noOverflow(p), 'no horizontal overflow at 390 px');
  assert(!errors.length && !requests.length, 'no errors, no network: ' + errors.concat(requests).join(' | '));
  await ctx.close();
});

await test('phone width: a battle with an objective and a group does not overflow', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  await begin(p, { enc: 'fx.protect', comp: 'ren' });
  await cards(p);
  assert(await noOverflow(p), 'no horizontal overflow at 390 px');
  assert(!errors.length, 'no errors: ' + errors.join(' | '));
  await ctx.close();
});

await test('five on the creatures\' side: two rows, every creature on the stage, at desktop and phone sizes (captures)', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const out = path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'docs', 'screenshots', 'encounters');
  fs.mkdirSync(out, { recursive: true });
  for (const [w, h, name, mobile] of [[1280, 800, 'five_desktop', false], [390, 844, 'five_phone', true]]) {
    const { p, errors, ctx } = await page(b, url, { viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile });
    await begin(p, { enc: 'fx.five', comp: 'ren' });
    await cards(p);
    await p.waitForTimeout(400);
    const lay = await p.evaluate(() => { const L = RB.battleStage.lay(); return L ? { n: L.foes.length, rows: L.foes.map((f) => f.row), xs: L.foes.map((f) => f.ex), ys: L.foes.map((f) => f.ey) } : null; });
    assert(lay && lay.n === 5 && lay.rows.filter((r) => r === 'back').length === 2, name + ': two rows: ' + JSON.stringify(lay));
    assert(await p.evaluate(() => document.querySelectorAll('.cb-foe .fs').length === 5), name + ': five slips');
    assert(await noOverflow(p), name + ': no horizontal overflow');
    await p.screenshot({ path: path.join(out, name + '.png') });
    assert(!errors.length, name + ': no errors: ' + errors.join(' | '));
    await ctx.close();
  }
});

await b.close();
srv.close();
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
