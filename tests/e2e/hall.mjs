// The Hall of a Hundred Tales in Chromium on the built game (expansion P15; plan 04_DUNGEONS.md D9), with throwaway
// sessions (a fresh browser context each; slot 4 of that context only, never a player's saves):
//  1. the wing's card at the hearth: the tale, its theme and its folklore label with furigana on every kanji, the
//     rules, the three choices; Grow chosen there is kept, and going in puts you on the first floor with the chip;
//  2. a trial counted on the chip, the sheet (leave, suspend, stay; the reprieve offered only once earned), the
//     reprieve spent, and the card's "go back to where you left off" returning you to the very tile;
//  3. suspend and resume: the game closes to the title, loading the slot resumes exactly there once, and the
//     suspend point is then gone (never a seventh save);
//  4. the tenth door sealed until nine lanterns are relit; a told wing's truthful note on its card; the travel volume's
//     interim plate for a revealed tale.
// Usage: node tests/e2e/hall.mjs [filter]
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
// a twelve-chapter journey after the story, the key ledger in hand, in the Hall's foyer
async function start(p, o) {
  o = o || {};
  await p.evaluate((o) => {
    const done = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, postgame: true, hall_ledger: true, hall_foyer_seen: true,
      // the story's one New Game+ offer was made when it ended (src/ui/66d_ngplus.js), as in any journey after the story
      ngp_offered: true };
    const s = RB.game.debugStart('hall.foyer', o.x || 40, o.y || 14, { comp: o.comp === undefined ? 'mio' : o.comp, flags: done });
    s.edition = 2; s.player.nameJp = 'ハル'; s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    for (let k = 1; k <= (o.told || 0); k++) RB.hall.wrec(s, 'w' + k).done = true;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.input = 'choice'; RB.game.settings.lightbulb = false;
    RB.game.applySettings();
    RB.save.setCurrent(4, 0); // a throwaway session's slot, so the autosaves are written
    window.__lines = [];
    if (!RB.ui.dialogue.__kept) {
      const say = RB.ui.dialogue.say;
      RB.ui.dialogue.say = function (l) { window.__lines.push({ who: l.who || '', jp: l.jp || '', en: l.en || '' }); return say.apply(this, arguments); };
      RB.ui.dialogue.__kept = true;
    }
  }, o);
}
// a scene through the game: dialogue advanced, a language task answered in choice mode, a confirm sheet answered by
// its button text, and the wing's card handed to onCard (which must close it)
async function scene(p, id, o) {
  o = o || {};
  await p.evaluate((id) => { window.__done = false; window.__lines = []; RB.script.run(id).then(() => { window.__done = true; }); }, id);
  for (let i = 0; i < 600; i++) {
    const st = await p.evaluate(() => ({
      done: window.__done, open: RB.ui.dialogue.isOpen(), chal: !!document.querySelector('.chal'), ok: !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'),
      card: !!document.querySelector('.hall-card'), sheet: [...document.querySelectorAll('.csheet .foot button')].map((x) => x.textContent.trim()),
    }));
    if (st.done) return;
    if (st.card) { if (!o.onCard) throw new Error('a card opened with nobody to answer it'); await o.onCard(); continue; }
    if (st.sheet.length) {
      const k = o.sheet ? st.sheet.findIndex((t) => new RegExp(o.sheet, 'i').test(t)) : st.sheet.length - 1;
      await p.evaluate((k) => document.querySelectorAll('.csheet .foot button')[k].click(), k < 0 ? st.sheet.length - 1 : k);
      continue;
    }
    if (st.ok) {
      await p.click('.fbwrap[data-fb=ok] .fb-go'); continue;
    }
    if (st.chal) {
      await p.evaluate(() => { const tab = document.querySelector('.chal-tabs .ptab[data-mode="choice"]'); if (tab) tab.click(); });
      const n = await p.evaluate(() => document.querySelectorAll('.chal .mc .btn').length);
      for (let k = 0; k < n; k++) {
        await p.evaluate((k) => { const x = [...document.querySelectorAll('.chal .mc .btn')][k]; if (x && !x.disabled) x.click(); }, k);
        await p.waitForTimeout(80);
        if (await p.evaluate(() => !!document.querySelector('.fbwrap[data-fb=ok] .fb-go'))) break;
      }
      continue;
    }
    if (st.open) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(40);
  }
  throw new Error('scene ' + id + ' did not finish');
}
const where = (p) => p.evaluate(() => { const s = RB.game.s, v = RB.hall.visitOf(s), P = RB.world.W.player; return { map: RB.world.W.map.id, x: P.x, y: P.y, visit: v ? { wing: v.wing, floor: v.floor, done: Object.keys(v.done), reprieve: v.reprieve } : null, mode: RB.game.mode() }; });
const chip = async (p) => { await p.waitForTimeout(500); return p.evaluate(() => { const c = document.querySelector('.hall-chip'); return c && !c.classList.contains('hidden') ? c.textContent.replace(/\s+/g, ' ').trim() : null; }); };
// the sheet from the chip, answered by a button's text
async function sheet(p, pick) {
  // the last line of the scene before is still on screen: dismiss it, as a player does, before reaching for the chip
  for (let i = 0; i < 50 && await p.evaluate(() => RB.game.mode() !== 'world'); i++) { await p.evaluate(() => RB.ui.dialogue.isOpen() && RB.ui.dialogue.advance(true)); await p.waitForTimeout(80); }
  await p.evaluate(() => document.querySelector('.hall-chip').click());
  await p.waitForSelector('.csheet .foot button', { timeout: 5000 });
  const r = await p.evaluate(() => ({ q: document.querySelector('.csheet .q').textContent, opts: [...document.querySelectorAll('.csheet .foot button')].map((x) => x.textContent.trim()) }));
  const k = r.opts.findIndex((t) => new RegExp(pick, 'i').test(t));
  await p.evaluate((k) => document.querySelectorAll('.csheet .foot button')[k].click(), k);
  await p.waitForTimeout(900);
  return r;
}

await test('the card: tale, theme and folklore with furigana, the rules, the choices; Grow kept; in, with the chip', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p);
  let seen = null;
  await scene(p, 'hall.door_w9', { onCard: async () => {
    seen = await p.evaluate(() => ({ text: document.querySelector('.hall-card').textContent.replace(/\s+/g, ' '), radios: [...document.querySelectorAll('.hall-card input[type=radio]')].map((x) => x.name + ':' + x.value), rt: document.querySelectorAll('.hall-card rt').length }));
    seen.bare = await bareKanji(p, '.hall-folio');
    await p.click('.hall-card input[name=route][value=grow]');
    await p.click('.hall-folio [data-a=go]');
  } });
  assert(seen, 'the ninth door opens onto its card');
  assert(/The Crane's Return/.test(seen.text) && /Folklore/.test(seen.text) && /real custom/.test(seen.text) && /Rules/.test(seen.text) && /changed only here/.test(seen.text), 'the card: the tale, its folklore label, the rules, the choices: ' + seen.text.slice(0, 300));
  assert(['route:consolidate', 'route:grow', 'tactics:relaxed', 'tactics:normal', 'tactics:hard'].every((r) => seen.radios.includes(r)), 'the route and the tactical setting to choose: ' + seen.radios.join(' '));
  assert(seen.bare.length === 0 && seen.rt > 5, 'every kanji on the card has its furigana (the folklore label and the Grow note included): ' + JSON.stringify(seen.bare));
  const w = await where(p);
  assert(w.map === 'hall.w9f1' && w.visit && w.visit.wing === 'w9' && w.visit.floor === 0, 'in, on the first floor: ' + JSON.stringify(w));
  assert(await p.evaluate(() => RB.hall.choice(RB.game.s, 'w9').route === 'grow'), 'Grow, chosen at the hearth, is kept');
  const c = await chip(p);
  assert(c && /Crane's Return/.test(c) && /0\/10/.test(c), 'the chip: the wing and its trials: ' + c);
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('a trial on the chip, the sheet, the reprieve spent, and back to the very tile', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p);
  await p.evaluate(async () => { await RB.ui.hall.goIn('w9'); });
  await p.waitForTimeout(400);
  await scene(p, 'hall.w9.t3');
  assert(await p.evaluate(() => RB.hall.trialDone(RB.game.s, 'w9', 't3')), 'the prayer boards answered: the trial done');
  let c = await chip(p);
  assert(/1\/10/.test(c) && !/reprieve/.test(c), 'the chip counts it: ' + c);
  const r1 = await sheet(p, 'Stay');
  assert(r1.opts.includes('Leave the Hall') && r1.opts.some((t) => /^Suspend/.test(t)) && r1.opts.includes('Stay') && !r1.opts.some((t) => /reprieve/i.test(t)), 'the sheet: leave, suspend, stay; no reprieve before one is earned: ' + r1.opts.join(' / '));
  assert((await where(p)).map === 'hall.w9f1', 'staying keeps you where you are');
  // the riddle stone earns the reprieve; stand somewhere particular, then spend it
  await scene(p, 'hall.w9.t7');
  c = await chip(p);
  assert(/reprieve/.test(c), 'the riddle answered: the chip shows the reprieve: ' + c);
  await p.evaluate(() => { RB.world.enter('hall.w9f2', 23, 14, 'left'); });
  await p.waitForTimeout(400);
  const stood = await where(p);
  const r2 = await sheet(p, 'Use the reprieve');
  assert(r2.opts.some((t) => /Use the reprieve/.test(t)), 'with a reprieve earned, the sheet offers it: ' + r2.opts.join(' / '));
  let w = await where(p);
  assert(w.map === 'hall.foyer' && !w.visit && await p.evaluate(() => !!RB.hall.peek(RB.game.s, 'w9').held), 'back at the hearth, the floor held: ' + JSON.stringify(w));
  assert((await chip(p)) === null, 'out of the wing, no chip');
  let held = false;
  await scene(p, 'hall.door_w9', { onCard: async () => { held = await p.evaluate(() => !!document.querySelector('.hall-folio [data-a=held]')); await p.click('.hall-folio [data-a=held]'); } });
  w = await where(p);
  assert(held && w.map === 'hall.w9f2' && w.x === stood.x && w.y === stood.y && stood.x === 23 && w.visit && w.visit.done.includes('t3') && w.visit.done.includes('t7'), 'going back to where you left off: the very tile, with what you had done: ' + JSON.stringify(w) + ' (stood ' + JSON.stringify(stood) + ')');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('suspend: the title, then loading resumes exactly there, once', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p);
  await p.evaluate(async () => { await RB.save.manualSave(4); await RB.ui.hall.goIn('w9'); });
  await p.waitForTimeout(400);
  await scene(p, 'hall.w9.t3');
  await p.evaluate(() => { RB.world.enter('hall.w9f1', 22, 10, 'left'); });
  await p.waitForTimeout(400);
  await sheet(p, 'Suspend');
  await p.waitForTimeout(800);
  assert(await p.evaluate(() => RB.game.mode() === 'title'), 'suspending closes the game to the title');
  const listed = await p.evaluate(async () => { const l = await RB.save.list(); return { sus: !!l[3].suspend, newer: l[3].suspendNewer }; });
  assert(listed.sus && listed.newer, 'the slot lists its suspend point, newest: ' + JSON.stringify(listed));
  await p.evaluate(async () => { await RB.game.loadCampaign(4); });
  await p.waitForTimeout(800);
  let w = await where(p);
  assert(w.map === 'hall.w9f1' && w.x === 22 && w.y === 10 && w.visit && w.visit.wing === 'w9' && w.visit.done.includes('t3'), 'loading resumes exactly there, with the trial done: ' + JSON.stringify(w));
  const after = await p.evaluate(async () => { const l = await RB.save.list(); return { sus: !!l[3].suspend, filled: l.filter((x) => !x.empty).length }; });
  assert(!after.sus && after.filled === 1, 'the suspend point is used once and gone; one slot, no extra save: ' + JSON.stringify(after));
  await p.evaluate(async () => { await RB.game.toTitle(); await RB.game.loadCampaign(4); });
  await p.waitForTimeout(800);
  w = await where(p);
  assert(w.map !== 'hall.w9f1' || w.x !== 22, 'loaded again, the slot\'s own save, not the suspend point: ' + JSON.stringify(w));
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

await test('the tenth door, a told wing\'s note on its card, the volume\'s interim plate', async () => {
  const { p, errors } = await page(b, url, { viewport: { width: 1180, height: 820 } });
  await start(p, { told: 8, x: 24, y: 14 });
  let carded = false;
  await scene(p, 'hall.door_w10', { onCard: async () => { carded = true; await p.click('.hall-folio [data-a=no]'); } });
  let ls = await p.evaluate(() => window.__lines.map((l) => l.en));
  assert(!carded && ls.some((x) => /not told until the nine lights are back/.test(x)), 'eight relit: the tenth door is sealed: ' + JSON.stringify(ls));
  await p.evaluate(() => { RB.hall.wrec(RB.game.s, 'w9').done = true; });
  await scene(p, 'hall.door_w10', { onCard: async () => { carded = true; await p.click('.hall-folio [data-a=no]'); } });
  assert(carded, 'nine relit: the tenth door opens onto its card');
  // a told wing's note, on its card
  await p.evaluate(() => { const s = RB.game.s, r = RB.hall.wrec(s, 'w8'); r.notes.push({ at: Date.now(), route: 'grow', tactics: 'normal', profile: 'E', answers: 31, help: { conceptual: 2, constrain: 1, supplied: 0 } }); });
  let note = null;
  await scene(p, 'hall.door_w8', { onCard: async () => { note = await p.evaluate(() => document.querySelector('.hall-card').textContent.replace(/\s+/g, ' ')); await p.click('.hall-folio [data-a=no]'); } });
  assert(note && /Your note/.test(note) && /Grow route, Standard tactics, at Elementary: 31 answers; help used: 2 conceptual, 1 answer-narrowing, 0 answer supplied/.test(note) && /opens and closes nothing/.test(note), 'the told wing\'s truthful note: ' + (note || '').slice(0, 400));
  // the travel volume: a tale revealed by confirmation shows its interim plate, with furigana
  await p.evaluate(() => { RB.volume.revealSpecial(RB.game.s, 'hall.w9'); RB.ui.menu.open('volume'); });
  await p.waitForSelector('.rb-plate', { timeout: 8000 });
  const pl = await p.evaluate(() => ({ n: document.querySelectorAll('.rb-plate').length, rt: document.querySelectorAll('.rb-plate rt').length, veiled: document.querySelectorAll('.rb-pg.veiled').length }));
  const bare = await bareKanji(p, '.rb-plate');
  assert(pl.n >= 1 && pl.rt > 0 && bare.length === 0, 'the revealed tale\'s interim plate, its title with furigana: ' + JSON.stringify(pl) + ' ' + JSON.stringify(bare));
  assert(await p.evaluate(() => !RB.volume.witnessed(RB.game.s, RB.volume.page('hall.w9'))), 'revealed, the page is viewable but not witnessed');
  assert(errors.length === 0, 'no page errors: ' + errors.join(' | '));
  await p.close();
});

console.log(pass + ' passed, ' + fail + ' failed');
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
