// Battle addendum playtest repairs, on the built index.html in Chromium, with real mouse and
// keyboard input in synthetic campaigns (fresh contexts; no save touched):
//   RBN-01  a distant click, an adjacent click and the action key reach the mill ladder's
//           interaction exactly once each; standing on it, a click steps off and interacts; an
//           interrupted walk and a target gone before arrival do nothing; the stairs too
//   RBN-02  a generated recall task names the script it accepts; choosing the katakana spelling
//           of a hiragana word is explained as a script mismatch in words that match the input
//   RBN-04  Heal at full resolve, solo: no "you both", no healing number; a truthful line
//   RBN-05  the soaked-letters activity no longer asserts rain
//   RBN-07  the gears' Elementary step says it is a guided first look and is recorded as assisted
// Usage: node tests/e2e/playtest_repairs.mjs [filter]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('timed out after 180 s')), 180000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String((e && e.message) || e).slice(0, 900)); console.log('FAIL ' + name + ': ' + String((e && e.message) || e).slice(0, 500)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const wait = (p, ms) => p.waitForTimeout(ms);

// ---- the world: a mill campaign, scene runs counted, real clicks on tiles -------------------------------
async function mill(p, x, y, flags) {
  await p.evaluate(([x, y, flags]) => {
    const s = RB.game.debugStart('rw.mill1', x, y, { comp: null, flags: Object.assign({ departed: false }, flags || {}) });
    s.learn.kanaKnown = 'both';
    window.__runs = [];
    const run = RB.script.run;
    RB.script.run = function (id, o) { window.__runs.push(id); return run.apply(this, arguments); };
  }, [x, y, flags || {}]);
  await wait(p, 400);
}
const tilePt = (p, x, y) => p.evaluate(([x, y]) => { const a = RB.render.tileToCss(x, y), c = RB.render.tileToCss(x + 1, y + 1); return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }; }, [x, y]);
async function clickTile(p, x, y) {
  let a = await tilePt(p, x, y);
  for (let k = 0; k < 30; k++) { await wait(p, 80); const b2 = await tilePt(p, x, y); if (Math.abs(b2.x - a.x) + Math.abs(b2.y - a.y) < 1) break; a = b2; }
  await p.mouse.click(a.x, a.y);
}
const pos = (p) => p.evaluate(() => ({ x: RB.world.W.player.x, y: RB.world.W.player.y, dir: RB.world.W.player.dir, mv: !!RB.world.W.player.mv, path: RB.world.W.path ? RB.world.W.path.length : null, runs: window.__runs.slice(), running: RB.script.isRunning(), mode: RB.game.mode() }));
async function settle(p, ms) { const t0 = Date.now(); for (;;) { const s = await pos(p); if ((!s.mv && s.path == null) || Date.now() - t0 > (ms || 8000)) return s; await wait(p, 60); } }
async function endScene(p) {
  for (let i = 0; i < 80; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ch: !!document.querySelector('.choices:not(.hidden) .choice'), run: RB.script.isRunning() }));
    if (!s.run && !s.dlg) return;
    if (s.ch) await p.locator('.choices:not(.hidden) .choice').last().click();
    else if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 80);
  }
}
const ladderRuns = (s) => s.runs.filter((r) => r === 'rw.m1_ladder').length;

await test('RBN-01 the mill ladder: a distant click walks beside it, faces it and opens its scene once; again from beside it; the action key the same', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await mill(p, 7, 9);
  await clickTile(p, 2, 2);
  let s = await settle(p);
  await wait(p, 300);
  s = await pos(p);
  assert(!(s.x === 2 && s.y === 2), 'the player stops beside the ladder, not on it: ' + JSON.stringify(s));
  assert(Math.abs(s.x - 2) + Math.abs(s.y - 2) === 1 && ladderRuns(s) === 1, 'beside it, facing it, the ladder scene once: ' + JSON.stringify(s));
  await endScene(p);
  // the same tile again, now from beside it
  await clickTile(p, 2, 2);
  await wait(p, 400);
  s = await pos(p);
  assert(ladderRuns(s) === 2, 'an adjacent click: once more: ' + JSON.stringify(s));
  await endScene(p);
  // the action key, facing it
  await p.keyboard.press('Enter');
  await wait(p, 400);
  s = await pos(p);
  assert(ladderRuns(s) === 3, 'the action key reaches the same interaction: ' + JSON.stringify(s));
  await endScene(p);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('RBN-01 standing on the ladder: a click steps off and interacts once; a walk interrupted by a key does nothing; the stairs from afar', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await mill(p, 2, 2);
  await clickTile(p, 2, 2);
  let s = await settle(p);
  await wait(p, 300);
  s = await pos(p);
  assert(!(s.x === 2 && s.y === 2) && ladderRuns(s) === 1, 'stepped off and looked at it once: ' + JSON.stringify(s));
  await endScene(p);
  // a click towards the ladder from afar, then a direction key: the walk and its interaction are dropped
  await p.evaluate(() => { const W = RB.world.W; W.player.x = 7; W.player.y = 9; W.player.fx = 7; W.player.fy = 9; window.__runs = []; });
  await wait(p, 200);
  await clickTile(p, 2, 2);
  await wait(p, 260);
  await p.keyboard.down('ArrowRight'); await wait(p, 200); await p.keyboard.up('ArrowRight');
  s = await settle(p);
  await wait(p, 900);
  s = await pos(p);
  assert(ladderRuns(s) === 0, 'an interrupted walk interacts with nothing: ' + JSON.stringify(s));
  // the stairs (12,9) from afar
  await clickTile(p, 12, 9);
  await settle(p);
  await wait(p, 400);
  s = await pos(p);
  assert(s.runs.filter((r) => r === 'rw.m1_stairs').length === 1, 'the stairs from afar: once: ' + JSON.stringify(s));
  await endScene(p);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('RBN-01 a target gone before arrival (the jammed gears put right while walking): no interaction, no stray scene', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await mill(p, 2, 9);
  // the jammed gears (10,2) are shown only while !rw_gears; set the flag mid-walk
  await clickTile(p, 10, 2);
  await wait(p, 300);
  await p.evaluate(() => { RB.game.s.flags.rw_gears = true; });
  await settle(p);
  await wait(p, 600);
  const s = await pos(p);
  assert(s.runs.filter((r) => r === 'rw.m1_gears').length === 0, 'the gears scene did not run for a target that is no longer there: ' + JSON.stringify(s));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---- RBN-02: the task says the script it accepts -------------------------------------------------------
await test('RBN-02 "rain": the recall prompt names hiragana (or kanji); choosing アメ is a script mismatch said as a choice; あめ and 雨 are right', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  const r = await p.evaluate(async () => {
    const s = RB.game.debugStart('rw.village', 22, 30, { comp: null });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    const st = RB.tasks.vocabStep('雨|あめ', { recall: true });
    const accepts = ['あめ', '雨', 'アメ'].map((x) => RB.answers.check(x, { accept: st.accept, mode: st.mode, input: 'choice' }));
    const typed = RB.answers.check('あま', { accept: st.accept, mode: st.mode, input: 'ime' });
    const chose = RB.answers.check('あま', { accept: st.accept, mode: st.mode, input: 'choice' });
    return { prompt: st.prompt.en, ok: accepts.map((x) => x.ok), kataWhy: (accepts[2].feedback || []).map((f) => f.en).join(' | '), typed: (typed.feedback || []).map((f) => f.en).join(' | '), chose: (chose.feedback || []).map((f) => f.en).join(' | ') };
  });
  assert(/in hiragana, or in kanji/.test(r.prompt) && !/Kana is fine/.test(r.prompt), 'the prompt names the script: ' + r.prompt);
  assert(r.ok[0] && r.ok[1] && !r.ok[2], 'あめ and 雨 accepted, アメ not: ' + JSON.stringify(r.ok));
  assert(/written in hiragana; you used katakana/.test(r.kataWhy), 'アメ is explained as the other script: ' + r.kataWhy);
  assert(!/you wrote/.test(r.typed) && !/you wrote/.test(r.chose), 'no brush words for a typed or chosen answer: ' + JSON.stringify([r.typed, r.chose]));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---- RBN-04: Heal at full resolve, alone ----------------------------------------------------------------
await test('RBN-04 Heal alone at full resolve: the log says no recovery was needed (no "you both"), and no healing number appears', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: null, flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    s.words = ['iyasu'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1, 'word:iyasu': 1, 'intent:strike': 1, 'intent:sweep': 1, 'intent:shroud': 1, 'intent:rest': 1 };
    RB.game.settings.input = 'choice';
    window.__nums = [];
    const num = RB.battleStage.number;
    RB.battleStage.number = function (to, text, kind) { window.__nums.push(kind + ':' + text); return num.apply(this, arguments); };
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    window.__result = null;
    RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'foe:rw.mill1:m1a' }).then((x) => { window.__result = x || 'done'; });
  });
  for (let i = 0; i < 300; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() }));
    if (s.cards) break;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 50);
  }
  const card = await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => /heal, soothe/i.test(x.textContent)); return c ? c.getAttribute('data-i') : null; });
  assert(card != null, 'the heal response is offered');
  await p.click('.rcard[data-i="' + card + '"]');
  await p.waitForSelector('.chal .mc .btn');
  const right = await p.evaluate(() => { const bs = [...document.querySelectorAll('.chal .mc .btn')]; const b = bs.find((x) => /いやす|癒/.test(x.textContent)); return b ? bs.indexOf(b) : -1; });
  assert(right >= 0, 'the right option is there');
  await p.locator('.chal .mc .btn').nth(right).click();
  await p.waitForSelector('.fbwrap .fb-go');
  await p.click('.fbwrap .fb-go');
  // the exchange plays; read the log once the response has landed
  let log = '';
  for (let i = 0; i < 200; i++) { log = await p.evaluate(() => (document.querySelector('.clog') || {}).textContent || ''); if (/recovery|breathe/i.test(log)) break; await wait(p, 50); }
  const nums = await p.evaluate(() => window.__nums.filter((n) => n.startsWith('heal')));
  assert(/No recovery was needed: you are already steady/.test(log) && !/both/.test(log.split('recovery')[0].slice(-60)), 'a truthful solo line at full resolve: ' + log.slice(0, 300));
  assert(!nums.length, 'no healing number at full resolve: ' + JSON.stringify(nums));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---- RBN-05: the letters' lead ---------------------------------------------------------------------------
await test('RBN-05 the soaked letters: a neutral lead, not "run in the rain"', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { const s = RB.game.debugStart('rw.village', 22, 30, { comp: null }); s.learn.kanaKnown = 'both'; RB.activities.run('rw.a_letters'); });
  await p.waitForSelector('.act-lead');
  const lead = await p.evaluate(() => document.querySelector('.act-lead').textContent);
  assert(/The address is missing\. Read the letter: who is it for\?/.test(lead) && !/rain/i.test(lead), 'neutral lead: ' + lead);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('RBN-07 the gears (Elementary): the guided first look says so on the task and is recorded as practice with help', async () => {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
  await p.evaluate(() => { const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: null }); s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; window.__act = null; RB.challenge.run('rw.c_mill_gears', { scene: 'test' }).then((r) => { window.__act = r || 'done'; }); });
  await p.waitForSelector('.chal [data-add]', { timeout: 10000 }).then((h) => h.dispose());
  const note = await p.evaluate(() => (document.querySelector('.chal .chal-guided') || {}).textContent || '');
  assert(/guided first look/i.test(note) && /practice with help/i.test(note), 'the task says it is guided: ' + note);
  // put the plates in the order shown, with real clicks, and check
  for (const w of ['まず', 'つぎに', 'それから', 'さいごに']) {
    const i = await p.evaluate((w) => { const t = [...document.querySelectorAll('.chal [data-add]')].find((x) => !x.disabled && x.textContent.replace(/\s+/g, '') === w); return t ? t.getAttribute('data-add') : null; }, w);
    assert(i != null, 'plate ' + w + ' on screen');
    await p.click('.chal [data-add="' + i + '"]');
  }
  await p.click('.chal [data-a=submit]');
  await p.waitForSelector('.fbwrap', { timeout: 8000 }).then((h) => h.dispose());
  const fb = await p.evaluate(() => document.querySelector('.fbwrap').textContent.replace(/\s+/g, ' '));
  assert(/Guided practice — that's fine/.test(fb), 'the result is said to be guided practice: ' + fb);
  await p.click('.fbwrap .fb-go'); // the record is written when the task closes
  await p.waitForFunction(() => window.__act, null, { timeout: 8000 });
  const rec = await p.evaluate(() => { const r = RB.game.s.learn.items['c:rw_gears_e']; return r && { ok: r.ok, assisted: r.modes.assisted, seen: r.seen }; });
  assert(rec && rec.assisted === 1 && rec.ok === 0 && rec.seen === 1, 'recorded as assisted, not as an independent success: ' + JSON.stringify(rec));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

console.log('\n' + results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
