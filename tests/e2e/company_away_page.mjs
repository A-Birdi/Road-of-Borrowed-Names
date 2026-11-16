// B1, the Company panel while a companion is away (Agnes 6552476316, 6552577628, 6912326373; Local CL-582, CL-846;
// Cloud CC-422, CC-608), in Chromium on the built game, with synthetic campaigns in fresh pages (no real save is
// touched). Row numbers are CC-608's acceptance matrix; "synthetic" marks a state no scene produces, set directly.
//  1.  the Barrier surety, played (`cr.ujie`), with each of the four companions: the summary and the Companion page say
//      who waits and where, with the portrait drawn and labelled with their name (16), wide and on a phone;
//  2.  a night apart, played: Nao after the guarantee (`cr.nao_decides`), Mio and Suzu at Steamhollow;
//  3.  a quarrel, played: Nao and Ren at Steamhollow: the neutral words;
//  4-7. synthetic: a property-like reason (neutral words); a stale absence beside an active companion (the active
//      one); away beside a provisional one (away wins); an invalid identity (exactly today's text);
//  9.  a fresh Company page while away, with a pet: it opens on Companion;
//  10. Pet or Shared memories chosen before the absence: still chosen after it;
//  11. while away: no companion controls on the page or the right leaf, the HUD's Talk hidden, a click on the page
//      does nothing; the folio itself stays usable: Pet, Shared memories and Companion by real clicks, and Back
//      (Escape) closes it at once, on a phone too, even when a companion's detail was open before the absence;
//  12. saved while away and loaded (a slot and a full page reload): the same display;
//  13. the reunion, played (`cr.barrier_back`, `cr.porch_nao`, `yn.mio_dawn`, `yn.suzu_garden`, `yn.nao_footbath`,
//      `yn.ren_lanterns`): the ordinary Companion page again, with no away words;
//  15. opening, reading and moving about the Company page changes none of the journey's fields (comp, provisional,
//      vars, flags, quests, inv, company); the folio's own view (which page, which detail) is not the journey;
//  and no page errors.
// The Barrier interview's own challenge is answered by a stub (it is not what this tests).
// Usage: node tests/e2e/company_away_page.mjs   (RB_PAGE=<file> runs it against another build, as a control)
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const allErrors = [];
const WIDE = { width: 1280, height: 800 }, PHONE = { width: 390, height: 844 };
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true };
for (let n = 1; n <= 6; n++) Object.assign(DONE, { ['cr_st' + n]: true, ['cr_lamp' + n]: true, ['cr_given' + n]: true, ['cr_plan' + n]: true });
const YN = { cr_done: true, ch10_done: true, yn_evening: true, yn_eve_started: true };
const SUM = { surety: 'waiting at the Mist Barrier while you fetch Shizu\'s guarantee from Kumoi', night: 'apart tonight', other: 'away for now' };
const PAGE = {
  surety: (n) => n + ' is waiting at the Mist Barrier while you go up to Kumoi for the letter of guarantee from Shizu, the headwoman. Until you\'re back together, you travel and fight alone.',
  night: (n) => n + ' is spending tonight apart from you. Until you\'re back together, you travel and fight alone.',
  other: (n) => n + ' is away for now. Until you\'re back together, you travel and fight alone.',
};
const NAME = { nao: 'Nao', mio: 'Mio', ren: 'Ren', suzu: 'Suzu' };

async function start(p, map, x, y, comp, flags, o = {}) {
  await p.evaluate(([map, x, y, comp, flags, o]) => {
    const s = RB.game.debugStart(map, x, y, { dir: 'up', edition: RB.edition.forNew(), comp, flags });
    for (const m in RB.content.maps) for (const ev of RB.content.maps[m].onEnter || []) s.flags['enter:' + m + ':' + ev.scene] = true;
    if (o.pet) { s.company.pets[o.pet] = { name: 'Tama' }; s.company.pet = o.pet; }
    Object.assign(s.quests, o.quests || {});
    RB.game.settings.textSpeed = 'instant';
    // (Suzu's way of speaking is already chosen: a journey loaded from a save otherwise asks it once, src/ui/56_suzu_speech.js)
    RB.game.settings.suzuSpeech = 'standard';
    if (RB.challenge) RB.challenge.run = async () => ({ ok: true });
    if (RB.company && RB.company.sync) { RB.company.sync(s, 'live'); RB.company.refresh(s); }
    RB.bus.emit('company:changed', {});
  }, [map, x, y, comp, Object.assign({}, DONE, flags || {}), o]);
  await p.waitForTimeout(900);
}
// a scene played through: lines advanced, choices picked by their words (null: the first)
async function play(p, scene, picks) {
  await p.evaluate((sc) => { RB.script.run(sc); }, scene);
  let k = 0, last = null;
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({ d: RB.ui.dialogue.isOpen(), en: (document.querySelector('.dlg:not(.hidden) .main') || {}).textContent || '', run: RB.script.isRunning(), ch: [...document.querySelectorAll('.choices:not(.hidden) .choice')].map((x) => x.textContent) }));
    if (st.ch.length) {
      const re = picks && picks[k++];
      const loc = p.locator('.choices:not(.hidden) .choice');
      await (re ? loc.filter({ hasText: re }).first() : loc.first()).click();
      await p.waitForTimeout(250);
      continue;
    }
    if (st.d) {
      if (st.en === last) { await p.waitForTimeout(80); continue; }
      last = st.en;
      await p.waitForTimeout(100); await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance()); await p.waitForTimeout(80); continue;
    }
    if (!st.run && i > 3) break;
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(1500);
}
const settled = (p) => p.waitForFunction(() => !document.getAnimations().some((a) => {
  const el = a.effect && a.effect.target;
  return (a.playState === 'running' || a.pending) && el && el.closest && el.closest('.folio') && a.effect.getComputedTiming().endTime !== Infinity;
}), null, { timeout: 5000 }).catch(() => {});
const openCompany = async (p) => { await p.evaluate(() => RB.ui.menu.open('company')); await p.waitForSelector('.co-page'); await settled(p); await p.waitForTimeout(250); };
const closeMenu = async (p) => { await p.evaluate(() => RB.ui.menu.close()); await p.waitForTimeout(200); };
// what the open Company shows
const read = (p) => p.evaluate(() => {
  const t = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : null);
  const who = document.querySelectorAll('.co-pair .co-who');
  const cv = document.querySelector('.co-page canvas.co-portrait');
  let drawn = 0;
  if (cv) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) drawn++; }
  const B = document.querySelector('.spread.two > .leaf-b');
  const bRest = B ? [...B.children].filter((c) => !c.classList.contains('bk-runhead')) : null;
  const hud = document.querySelector('.hud .co-topic');
  return {
    who: t(who[0]), pet: t(who[1]), page: t(document.querySelector('.co-page')),
    pressed: (document.querySelector('[data-cp][aria-pressed="true"]') || {}).dataset ? document.querySelector('[data-cp][aria-pressed="true"]').dataset.cp : null,
    label: cv ? cv.getAttribute('aria-label') : null, drawn,
    controls: document.querySelectorAll('.folio [data-co-act], .folio [data-co-topic], .folio [data-co-sec], .folio [data-co-case-talk], .folio [data-co-case-open], .folio [data-suzu-speech-set], .folio .co-support, .folio .co-bond, .folio .co-said').length,
    right: bRest ? bRest.length + ':' + bRest.map((c) => c.textContent).join('').trim().length : 'one-page',
    back: !!document.querySelector('.co-back'), hud: !!(hud && !hud.hidden), wide: RB.ui.folio.wide(), open: RB.ui.menu.isOpen(),
  };
});
const fields = (p) => p.evaluate(() => { const s = RB.game.s; return JSON.stringify({ comp: s.comp, provisional: s.provisional, vars: s.vars, flags: s.flags, quests: s.quests, inv: s.inv, company: s.company }); });
const aw = (r, id, k) => r.who === NAME[id] + ' ' + SUM[k] && r.page.indexOf(PAGE[k](NAME[id])) >= 0 && !/No one|travelling with you for now/.test(r.page + r.who);
const ordinary = (r, id) => r.who.indexOf(NAME[id]) === 0 && !/Until you're back together|waiting at the Mist Barrier|apart tonight|away for now/.test(r.who + ' ' + r.page) && /Bond/.test(r.page);
// the away display, wide and then on a phone; the journey's fields before and after (15)
async function checkAway(p, id, k, label) {
  const f0 = await fields(p);
  for (const vp of [WIDE, PHONE]) {
    await p.setViewportSize(vp);
    await openCompany(p);
    const r = await read(p);
    const where = label + (vp === WIDE ? ', wide' : ', phone');
    ok(aw(r, id, k), where + ': the summary and the page say who and why (' + JSON.stringify({ who: r.who, page: (r.page || '').slice(0, 220) }) + ')');
    ok(r.pressed === 'companion', where + ': the Companion page (' + r.pressed + ')');
    ok(r.label === 'Portrait of ' + NAME[id] && r.drawn > 0, where + ': the portrait is drawn and labelled with their name (16) (' + r.label + ', ' + r.drawn + ' px)');
    ok(r.controls === 0 && !r.back && !r.hud && (vp === WIDE ? r.right === '0:0' : true), where + ': nothing to do with them; the right leaf empty; the HUD\'s Talk hidden (11) (' + JSON.stringify({ c: r.controls, back: r.back, hud: r.hud, right: r.right }) + ')');
    await closeMenu(p);
  }
  await p.setViewportSize(WIDE);
  ok((await fields(p)) === f0, label + ': opening and reading the page changes none of the journey\'s fields (15)');
}
async function checkOrdinary(p, id, label) {
  await openCompany(p);
  const r = await read(p);
  ok(ordinary(r, id) && r.pressed === 'companion', label + ': the ordinary Companion page again, no away words (13) (' + JSON.stringify({ who: r.who, page: (r.page || '').slice(0, 160) }) + ')');
  await closeMenu(p);
}
const st = (p) => p.evaluate(() => ({ comp: RB.game.s.comp, away: (RB.game.s.vars && RB.game.s.vars._away) || null, why: (RB.game.s.vars && RB.game.s.vars._away_why) || null }));

// ---- 1, 2, 12, 13: the Barrier, each companion ---------------------------------------------------------------------------
for (const id of ['nao', 'mio', 'ren', 'suzu']) {
  const { p, errors } = await page(b, url, { viewport: WIDE });
  await start(p, 'cr.barrier_office', 6, 4, id, { cr_seals_checked: true });
  await play(p, 'cr.ujie', [/back soon/]);
  const s1 = await st(p);
  ok(s1.comp === null && s1.away === id && s1.why === 'surety', id + ': the surety played: away at the Barrier (' + JSON.stringify(s1) + ')');
  await checkAway(p, id, 'surety', id + ', the surety');
  if (id === 'suzu') {
    // 12: a save and load in a slot
    await p.evaluate(async () => { await RB.save.writeSlot(4, RB.game.s, { force: true }); await RB.game.loadCampaign(4); });
    await p.waitForTimeout(1500);
    await openCompany(p);
    const r = await read(p);
    ok(aw(r, 'suzu', 'surety'), 'suzu: saved while away and loaded: the same display (12) (' + r.who + ')');
    await closeMenu(p);
  }
  // 13: the guarantee brought back
  await p.evaluate(() => RB.state.give(RB.game.s, 'cr_proof'));
  await play(p, 'cr.barrier_back', null);
  if (id !== 'nao') {
    const s2 = await st(p);
    ok(s2.comp === id && !s2.away, id + ': the guarantee brought back: together again (' + JSON.stringify(s2) + ')');
    await checkOrdinary(p, id, id + ', back from the Barrier');
  } else {
    // 2: Nao goes down to Kirishita alone, a night apart; then the porch
    const s2 = await st(p);
    ok(s2.comp === null && s2.away === 'nao' && s2.why === 'night', 'nao: after the guarantee, a night apart (' + JSON.stringify(s2) + ')');
    await checkAway(p, 'nao', 'night', 'nao, the night apart');
    await p.evaluate(() => { RB.world.enter('cr.kirishita', 9, 14, 'up', {}); });
    await p.waitForTimeout(1200);
    await play(p, 'cr.porch_nao', null);
    const s3 = await st(p);
    ok(s3.comp === 'nao' && !s3.away, 'nao: on the porch, together again (' + JSON.stringify(s3) + ')');
    await checkOrdinary(p, 'nao', 'nao, on the porch');
  }
  allErrors.push(...errors); await p.close();
}

// ---- 2, 3, 12, 13: Steamhollow -------------------------------------------------------------------------------------------
const YN_CASES = [['mio', 'yn.mio_evening', 'night', 'yn.mio_dawn'], ['suzu', 'yn.suzu_evening', 'night', 'yn.suzu_garden'], ['nao', 'yn.nao_evening', 'other', 'yn.nao_footbath'], ['ren', 'yn.ren_evening', 'other', 'yn.ren_lanterns']];
for (const [id, scene, k, back] of YN_CASES) {
  const { p, errors } = await page(b, url, { viewport: WIDE });
  await start(p, 'yn.lower', 20, 16, id, YN);
  await play(p, scene, null);
  const s1 = await st(p);
  ok(s1.comp === null && s1.away === id && s1.why === (k === 'night' ? 'night' : 'quarrel'), id + ': ' + scene + ' played: away, ' + s1.why + ' (' + JSON.stringify(s1) + ')');
  await checkAway(p, id, k, id + ', ' + (k === 'night' ? 'the night apart' : 'the quarrel'));
  if (id === 'mio') {
    // 12: a full page reload, then the journey loaded from its manual save
    await p.evaluate(async () => { await RB.save.manualSave(1); });
    await p.reload();
    await p.waitForFunction(() => window.RB && RB.game && RB.save, null, { timeout: 30000 });
    await p.evaluate(async () => { await RB.game.loadCampaign(1, 'manual'); });
    await p.waitForTimeout(1500);
    await openCompany(p);
    const r = await read(p);
    ok(aw(r, 'mio', 'night'), 'mio: saved, the page reloaded and the journey loaded: the same display (12) (' + r.who + ')');
    await closeMenu(p);
  }
  if (id === 'suzu') { await p.evaluate(() => { RB.world.enter('yn.lower', 20, 16, 'up', {}); }); await p.waitForTimeout(1200); }
  await play(p, back, null);
  const s2 = await st(p);
  ok(s2.comp === id && !s2.away, id + ': ' + back + ': together again (' + JSON.stringify(s2) + ')');
  await checkOrdinary(p, id, id + ', ' + back);
  allErrors.push(...errors); await p.close();
}

// ---- 9, 10, 11: which page opens, and the folio stays usable -------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: WIDE });
  // 9: a fresh Company page while away, with a pet
  await start(p, 'cr.barrier_office', 6, 4, 'nao', { cr_seals_checked: true }, { pet: 'cat' });
  await p.evaluate(() => { RB.hooks.comp_away(['night']); RB.bus.emit('company:changed', {}); });
  await openCompany(p);
  let r = await read(p);
  ok(r.pressed === 'companion' && aw(r, 'nao', 'night') && /Tama/.test(r.pet || ''), 'a fresh page while away, with a pet: it opens on Companion; the pet half unchanged (9, 8) (' + JSON.stringify({ pressed: r.pressed, who: r.who, pet: r.pet }) + ')');
  // 11: a click on the page does nothing
  const before = await fields(p), mode0 = await p.evaluate(() => RB.game.mode());
  // (on a build without the away page there is no paragraph to click: that is recorded, not thrown)
  const para = await p.locator('.co-page .co-away').count();
  if (para) { await p.locator('.co-page .co-away').click(); await p.waitForTimeout(300); }
  r = await read(p);
  ok(para > 0 && (await fields(p)) === before && (await p.evaluate(() => RB.game.mode())) === mode0 && r.open && aw(r, 'nao', 'night'), 'a click on the away page does nothing (11)');
  // the folio stays usable: Pet, Shared memories, Companion by real clicks; Back closes it
  await p.locator('[data-cp="pet"]').click(); await p.waitForTimeout(300);
  const onPet = await read(p);
  await p.locator('[data-cp="memories"]').click(); await p.waitForTimeout(300);
  const onMem = await read(p);
  await p.locator('[data-cp="companion"]').click(); await p.waitForTimeout(300);
  const onComp = await read(p);
  ok(onPet.pressed === 'pet' && onMem.pressed === 'memories' && onComp.pressed === 'companion' && aw(onComp, 'nao', 'night'), 'while away, Pet, Shared memories and Companion open by real clicks (11) (' + [onPet.pressed, onMem.pressed, onComp.pressed].join(', ') + ')');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(!(await p.evaluate(() => RB.ui.menu.isOpen())), 'while away, Back (Escape) closes the folio (11)');
  ok((await fields(p)) === before, 'moving about the Company page changes none of the journey\'s fields (15)');
  allErrors.push(...errors); await p.close();
}
for (const chosen of ['pet', 'memories']) {
  const { p, errors } = await page(b, url, { viewport: WIDE });
  await start(p, 'cr.barrier_office', 6, 4, 'mio', { cr_seals_checked: true }, { pet: 'cat' });
  await openCompany(p);
  await p.locator('[data-cp="' + chosen + '"]').click(); await p.waitForTimeout(300);
  await closeMenu(p);
  await play(p, 'cr.ujie', [/back soon/]);
  await openCompany(p);
  const r = await read(p);
  ok(r.pressed === chosen, chosen + ' chosen before the absence: still chosen after it (10) (' + r.pressed + ')');
  await p.locator('[data-cp="companion"]').click(); await p.waitForTimeout(300);
  ok(aw(await read(p), 'mio', 'surety'), chosen + ' chosen before: Companion, clicked, shows the absence (10)');
  await closeMenu(p);
  allErrors.push(...errors); await p.close();
}
// 11: a companion's detail open on a phone, then the absence: Back closes the folio at once; after the reunion, the
// ordinary page (the detail is not reopened)
{
  const { p, errors } = await page(b, url, { viewport: PHONE });
  await start(p, 'cr.barrier_office', 6, 4, 'nao', { cr_seals_checked: true }, { quests: { lf_nao: { stage: 0, done: false } } });
  await openCompany(p);
  const hasQuest = await p.locator('[data-co-act="quest"]').count();
  if (hasQuest) { await p.locator('[data-co-act="quest"]').first().click(); await p.waitForTimeout(300); }
  const det = await read(p);
  ok(hasQuest > 0 && det.back, 'on a phone, Nao\'s personal-quest detail is open (' + JSON.stringify({ hasQuest, back: det.back }) + ')');
  await closeMenu(p);
  await p.evaluate(() => { RB.hooks.comp_away(['surety']); RB.bus.emit('company:changed', {}); });
  await openCompany(p);
  const r = await read(p);
  ok(aw(r, 'nao', 'surety') && !r.back, 'then away: the away page, with no detail left open (11) (' + JSON.stringify({ who: r.who, back: r.back }) + ')');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  ok(!(await p.evaluate(() => RB.ui.menu.isOpen())), 'on a phone, one Back (Escape) closes the folio (11)');
  await p.evaluate(() => { RB.hooks.comp_back(); RB.bus.emit('company:changed', {}); });
  await openCompany(p);
  const back = await read(p);
  ok(ordinary(back, 'nao') && !back.back && back.controls > 0, 'back together: the ordinary page, with its actions, and no stale detail (13) (' + JSON.stringify({ who: back.who, back: back.back, c: back.controls }) + ')');
  await closeMenu(p);
  allErrors.push(...errors); await p.close();
}

// ---- 4-7: synthetic states ------------------------------------------------------------------------------------------------
{
  const { p, errors } = await page(b, url, { viewport: WIDE });
  await start(p, 'cr.barrier_office', 6, 4, null, { cr_seals_checked: true });
  const set = (o) => p.evaluate((o) => { const s = RB.game.s; s.comp = o.comp || null; s.provisional = o.prov || null; s.vars = Object.assign({}, o.vars || {}); RB.bus.emit('company:changed', {}); }, o);
  await set({ vars: { _away: 'mio', _away_why: 'constructor' } });
  await openCompany(p); let r = await read(p); await closeMenu(p);
  ok(aw(r, 'mio', 'other') && !/Mist Barrier|Kumoi|tonight/.test(r.page), 'synthetic, a property-like reason: the neutral words, no place (4) (' + r.who + ')');
  await set({ comp: 'nao', vars: { _away: 'mio', _away_why: 'surety' } });
  await openCompany(p); r = await read(p); await closeMenu(p);
  ok(ordinary(r, 'nao') && r.who.indexOf('Mio') < 0, 'synthetic, a stale absence beside an active companion: the active one (5) (' + r.who + ')');
  await set({ prov: 'ren', vars: { _away: 'suzu', _away_why: 'night' } });
  await openCompany(p); r = await read(p); await closeMenu(p);
  ok(aw(r, 'suzu', 'night'), 'synthetic, away beside a provisional one: away wins (6) (' + r.who + ')');
  await set({ prov: 'mio', vars: { _away: 'zzz', _away_why: 'surety' } });
  await openCompany(p); r = await read(p); await closeMenu(p);
  ok(/Mio is travelling with you for now/.test(r.page) && /travelling with you for now; not yet decided/.test(r.who) && !/waiting|Until you're back together/.test(r.page + r.who), 'synthetic, an invalid identity beside a provisional one: exactly today\'s provisional text (7) (' + r.who + ')');
  await set({ vars: { _away: '', _away_why: 'night' } });
  await openCompany(p); r = await read(p); await closeMenu(p);
  ok(/No one travels with you yet/.test(r.page) && /No one has joined you yet/.test(r.who), 'synthetic, an empty identity: exactly today\'s empty text (7) (' + r.who + ')');
  allErrors.push(...errors); await p.close();
}

ok(allErrors.length === 0, 'no page errors' + (allErrors.length ? ' (' + allErrors.slice(0, 3).join(' | ') + ')' : ''));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
