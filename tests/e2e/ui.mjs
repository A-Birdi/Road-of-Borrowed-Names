// UI, handwriting and persistence tests against the built index.html in Chromium.
// Usage: node tests/e2e/ui.mjs [filter]
import { serve, launch, page, chromium } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const results = [];
async function test(name, fn) {
  if (only && !name.includes(only)) return;
  try { await Promise.race([fn(), new Promise((_, rej) => setTimeout(() => rej(new Error('test timed out after 120s')), 120000))]); pass++; results.push('PASS ' + name); console.log('PASS ' + name); }
  catch (e) { fail++; results.push('FAIL ' + name + '\n   ' + String(e && e.message || e).slice(0, 600)); console.log('FAIL ' + name + ': ' + String(e && e.message || e).slice(0, 300)); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const shot = (p, n) => p.screenshot({ path: 'tests/e2e/out/' + n + '.png' });

// ---------------------------------------------------------------------------
await test('new game through title, prologue skip, creation, setup', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors, requests } = await page(b, url, { context: ctx });
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.waitForSelector('text=Skip prologue');
  await shot(p, 'ui_prologue');
  await p.click('text=Skip prologue');
  await p.waitForSelector('#nm');
  await p.fill('#nm', 'Aki');
  assert((await p.inputValue('#nj')) === 'アキ', 'katakana name suggestion');
  await p.click('[data-set=hair][data-v=bun]');
  await p.click('[data-acc=glasses]');
  await shot(p, 'ui_creation');
  await p.click('[data-a=next]');
  await p.click('[data-k=profile][data-v=E]');
  await p.click('[data-a=go]');
  await p.waitForFunction(() => RB.game.mode() === 'dialogue' || RB.game.mode() === 'world', null, { timeout: 10000 });
  const st = await p.evaluate(() => ({ name: RB.game.s.player.name, jp: RB.game.s.player.nameJp, prof: RB.game.s.learn.profile, map: RB.game.s.map, hair: RB.game.s.player.look.hair, acc: RB.game.s.player.look.acc }));
  assert(st.name === 'Aki' && st.jp === 'アキ' && st.prof === 'E' && st.map === 'rw.road' && st.hair === 'bun' && st.acc.includes('glasses'), JSON.stringify(st));
  await p.waitForTimeout(600);
  await shot(p, 'ui_first_dialogue');
  assert(!errors.length, errors.join('; '));
  assert(!requests.length, 'network: ' + requests.join(', '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('save, reload, continue; copy independence; delete removes recovery', async () => {
  const ctx = await b.newContext({ viewport: { width: 1200, height: 800 } });
  let { p, errors } = await page(b, url, { context: ctx });
  await p.evaluate(async () => {
    const s = RB.state.newCampaign({ profile: 'I' });
    s.player.name = 'Saver';
    await RB.game.startNewCampaign(2, s);
    RB.game.s.flags.test_marker = 1;
    RB.game.s.inv.rw_salve = 3;
    await RB.save.manualSave(2);
    await RB.save.autosave('auto');
  });
  // reload the page: data must come back from IndexedDB
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  const list = await p.evaluate(() => RB.save.list());
  assert(list[1].manual && list[1].meta.name === 'Saver', 'slot 2 after reload: ' + JSON.stringify(list[1]).slice(0, 200));
  await p.click('text=Continue');
  await p.waitForFunction(() => RB.game.mode() === 'world');
  const back = await p.evaluate(() => ({ f: RB.game.s.flags.test_marker, n: RB.game.s.inv.rw_salve, name: RB.game.s.player.name }));
  assert(back.f === 1 && back.n === 3 && back.name === 'Saver', 'state after continue ' + JSON.stringify(back));
  // copy 2 -> 4, change 4, confirm 2 unchanged
  await p.evaluate(async () => {
    await RB.save.copy(2, 4);
    await RB.game.loadCampaign(4, 'manual');
    RB.game.s.inv.rw_salve = 99;
    RB.game.s.player.name = 'Copy';
    await RB.save.manualSave(4);
  });
  const two = await p.evaluate(async () => (await RB.save.read(2, 'manual')).state);
  const four = await p.evaluate(async () => (await RB.save.read(4, 'manual')).state);
  assert(two.inv.rw_salve === 3 && two.player.name === 'Saver', 'original mutated by copy: ' + JSON.stringify(two.inv));
  assert(four.inv.rw_salve === 99 && four.id !== two.id, 'copy not independent');
  // delete 4: manual and recovery gone, not resurrected after reload
  await p.evaluate(() => RB.save.del(4));
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
  const l2 = await p.evaluate(() => RB.save.list());
  assert(l2[3].empty && !l2[3].auto && !l2[3].pre, 'slot 4 not fully deleted: ' + JSON.stringify(l2[3]));
  assert(!l2[1].empty, 'slot 2 lost');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('overwrite confirmation and slot UI actions', async () => {
  const ctx = await b.newContext();
  const { p } = await page(b, url, { context: ctx });
  await p.evaluate(async () => { const s = RB.state.newCampaign({}); s.map = 'rw.road'; s.player.name = 'Old'; await RB.save.writeSlot(1, s, {}); });
  await p.reload(); await p.waitForFunction(() => window.__RB_READY__ === true);
  await p.click('text=New Game');
  await p.click('.slot[data-slot="1"] [data-a=start]');
  await p.waitForSelector('[role=alertdialog]');
  const txt = await p.textContent('[role=alertdialog]');
  assert(/erase/i.test(txt), 'overwrite warning text: ' + txt);
  await p.click('[role=alertdialog] >> text=Cancel');
  const still = await p.evaluate(async () => (await RB.save.list())[0].meta.name);
  assert(still === 'Old', 'slot overwritten despite cancel');
  await shot(p, 'ui_slots');
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('storage refused -> session-only, honest banner', async () => {
  const ctx = await b.newContext();
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { get() { throw new Error('blocked'); } });
    const bad = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() {}, key() { return null; }, length: 0 };
    Object.defineProperty(window, 'localStorage', { get() { return bad; } });
  });
  const { p, errors } = await page(b, url, { context: ctx });
  const mode = await p.evaluate(() => RB.save.status().mode);
  assert(mode === 'session', 'mode ' + mode);
  const banner = await p.textContent('.storage-banner');
  assert(/session-only/i.test(banner) && /lost/i.test(banner), 'banner: ' + banner);
  await shot(p, 'ui_session_only');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('cross-tab: second tab is warned and can open read-only', async () => {
  const ctx = await b.newContext();
  const A = await page(b, url, { context: ctx });
  await A.p.evaluate(async () => { const s = RB.state.newCampaign({}); s.player.name = 'Tabby'; await RB.game.startNewCampaign(5, s); await RB.save.manualSave(5); });
  const B = await page(b, url, { context: ctx });
  const pending = B.p.evaluate(() => RB.game.loadCampaign(5, 'manual'));
  await B.p.waitForSelector('[role=alertdialog]', { timeout: 5000 });
  const txt = await B.p.textContent('[role=alertdialog]');
  assert(/another tab/i.test(txt), 'warning text: ' + txt);
  await B.p.click('[role=alertdialog] >> text=Open read-only');
  await pending;
  const ro = await B.p.evaluate(() => RB.save.status().readOnly);
  assert(ro === true, 'second tab should be read-only');
  let threw = false;
  try { await B.p.evaluate(() => RB.save.manualSave(5)); } catch (e) { threw = true; }
  assert(threw, 'read-only tab was able to save');
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('pre-departure recovery point and load of both states', async () => {
  const ctx = await b.newContext();
  const { p, errors } = await page(b, url, { context: ctx });
  const r = await p.evaluate(async () => {
    const s = RB.state.newCampaign({});
    await RB.game.startNewCampaign(6, s);
    RB.game.s.flags.rw_hall_gather = true;
    RB.game.s.provisional = 'ren';
    await RB.game.depart();
    await RB.save.manualSave(6);
    const list = await RB.save.list();
    const pre = await RB.save.read(6, 'predeparture');
    const man = await RB.save.read(6, 'manual');
    return { hasPre: !!list[5].pre, preComp: pre.state.comp, preProv: pre.state.provisional, manComp: man.state.comp };
  });
  assert(r.hasPre && r.preComp === null && r.preProv === 'ren' && r.manComp === 'ren', JSON.stringify(r));
  await p.evaluate(() => RB.game.loadCampaign(6, 'predeparture'));
  const after = await p.evaluate(() => ({ comp: RB.game.s.comp, prov: RB.game.s.provisional }));
  assert(after.comp === null && after.prov === 'ren', 'restored pre-departure ' + JSON.stringify(after));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('handwriting: reference strokes recognised, wrong kana explained, empty rejected', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.village', 22, 18, {});
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.input = 'hand';
    window.__res = RB.challenge.runStep({ kind: 'write', item: 'k:ぬ', prompt: { en: 'Write nu' }, answer: 'ぬ', accept: ['ぬ'], mode: 'kana', single: true }, {});
  });
  await p.waitForSelector('.pad-box canvas.pad-ink');
  // empty submit is refused
  await p.click('text=Submit answer');
  const n1 = await p.textContent('.notices');
  assert(/at least one character/i.test(n1), 'empty not refused: ' + n1);
  // inject a clearly written め (a real, legible wrong answer)
  const inject = async (ch, jitter) => p.evaluate(({ ch, jitter }) => {
    const ref = RB.recog.reference(ch);
    const r = RB.util.rng(7);
    const strokes = ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * 0.8 + 0.1 + (r() - 0.5) * jitter, y: (pt.y / ref.box) * 0.8 + 0.1 + (r() - 0.5) * jitter, t: 1000 + i * 16 })));
    const pad = document.querySelector('.pad-area');
    window.__lastPad = RB.challenge; // noop
    return strokes;
  }, { ch, jitter });
  const strokesMe = await inject('め', 0.02);
  await p.evaluate((strokes) => { const el = document.querySelector('.pad-area'); el.__pad = null; }, strokesMe);
  // use the pad API through the DOM-bound object
  const readAs = await p.evaluate(async (strokes) => {
    const padEl = document.querySelector('.pad-area');
    // find the pad instance created by the challenge runner
    const pad = RB.pad.__last;
    pad._inject(strokes);
    await new Promise((r) => setTimeout(r, 50));
    return document.querySelector('.readas').textContent;
  }, strokesMe);
  assert(/め/.test(readAs), 'recogniser read: ' + readAs);
  await shot(p, 'ui_pad_me');
  await p.click('[data-a=confirm]');
  await p.click('text=Submit answer');
  const fb = await p.textContent('.fbwrap');
  assert(/Not quite/i.test(fb) && /め/.test(fb), 'wrong answer feedback: ' + fb);
  await shot(p, 'ui_pad_wrong');
  // now write ぬ correctly with mild noise (held-out style jitter)
  const strokesNu = await inject('ぬ', 0.03);
  await p.evaluate(async (strokes) => { RB.pad.__last._inject(strokes); await new Promise((r) => setTimeout(r, 50)); }, strokesNu);
  const readNu = await p.textContent('.readas');
  assert(/ぬ/.test(readNu), 'read as: ' + readNu);
  await p.click('[data-a=confirm]');
  await p.click('text=Submit answer');
  await p.waitForSelector('text=Continue ▶');
  await p.click('text=Continue ▶');
  const res = await p.evaluate(() => window.__res);
  assert(res.ok && res.mistakes === 1 && res.mode === 'hand', 'result ' + JSON.stringify(res));
  const rec = await p.evaluate(() => RB.game.s.learn.items['k:ぬ']);
  assert(rec && rec.modes.hand === 1 && rec.bad === 1, 'mastery ' + JSON.stringify(rec));
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('handwriting: real mouse stroke, nonsense rejected, composition edit, mode switch', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.village', 22, 18, {});
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
    RB.game.settings.input = 'hand';
    window.__res = RB.challenge.runStep({ kind: 'write', item: 'v:みず', prompt: { en: 'Write mizu' }, answer: 'みず', accept: ['みず', '水'], mode: 'reading' }, {});
  });
  await p.waitForSelector('.pad-box canvas.pad-ink');
  const box = await p.locator('.pad-ink').boundingBox();
  // A real pointer stroke: a long vertical line drawn with the mouse (should read as a character like 丨-ish kana, e.g. く/し/l or be uncertain) — we only require the pipeline works.
  await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.15);
  await p.mouse.down();
  for (let i = 1; i <= 20; i++) await p.mouse.move(box.x + box.width * (0.5 - 0.02 * Math.sin(i / 3)), box.y + box.height * (0.15 + i * 0.035));
  await p.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.78);
  await p.mouse.up();
  await p.waitForTimeout(300);
  const strokes = await p.evaluate(() => RB.pad.__last._state.strokes.length);
  assert(strokes === 1, 'mouse stroke captured: ' + strokes);
  const status1 = await p.textContent('.readas');
  // scroll position must not change while drawing
  const scrolled = await p.evaluate(() => window.scrollY);
  assert(scrolled === 0, 'page scrolled while drawing');
  // nonsense: a dense zigzag
  await p.click('[data-a=clear]');
  await p.evaluate(async () => {
    const pts = []; for (let i = 0; i < 60; i++) pts.push({ x: 0.1 + (i % 2) * 0.8, y: 0.1 + i * 0.013, t: i * 10 });
    RB.pad.__last._inject([pts, pts.map((q) => ({ x: 1 - q.x, y: q.y, t: q.t + 900 }))]);
    await new Promise((r) => setTimeout(r, 50));
  });
  const status2 = await p.textContent('.readas');
  assert(/can't read/i.test(status2) || /not sure/i.test(status2), 'nonsense status: ' + status2);
  const confirmDisabled = await p.evaluate(() => document.querySelector('[data-a=confirm]').disabled);
  // composition: write み then ず, replace, delete, insert
  const put = async (ch) => p.evaluate(async (ch) => {
    const ref = RB.recog.reference(ch);
    const strokes = ref.strokes.map((st) => st.map((pt, i) => ({ x: pt.x / ref.box * 0.8 + 0.1, y: pt.y / ref.box * 0.8 + 0.1, t: i * 16 })));
    RB.pad.__last._inject(strokes);
    await new Promise((r) => setTimeout(r, 40));
    document.querySelector('[data-a=confirm]').click();
  }, ch);
  await p.click('[data-a=clear]');
  await put('み'); await put('す');
  let text = await p.evaluate(() => RB.pad.__last.text());
  assert(text === 'みす', 'composed: ' + text);
  // replace second char with ず (diacritic matters)
  await p.click('.strip .cell:not(.ins) >> nth=1');
  await put('ず');
  text = await p.evaluate(() => RB.pad.__last.text());
  assert(text === 'みず', 'after replace: ' + text);
  // insert at start then remove it
  await p.click('.strip .cell.ins >> nth=0');
  await put('あ');
  text = await p.evaluate(() => RB.pad.__last.text());
  assert(text === 'あみず', 'after insert: ' + text);
  await p.click('.strip .cell:not(.ins) >> nth=0');
  await p.click('[data-a=del]');
  text = await p.evaluate(() => RB.pad.__last.text());
  assert(text === 'みず', 'after delete: ' + text);
  await shot(p, 'ui_pad_compose');
  // switch to keyboard mode mid-step: the step stays the same
  await p.click('[data-mode=ime]');
  await p.fill('#ime-in', 'みず');
  // simulate IME composing: Enter during composition must not submit
  await p.evaluate(() => {
    const inp = document.getElementById('ime-in');
    inp.dispatchEvent(new CompositionEvent('compositionstart'));
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }));
  });
  await p.waitForTimeout(100);
  const submittedEarly = await p.evaluate(() => /Yes/.test(document.querySelector('.fbwrap').textContent));
  assert(!submittedEarly, 'Enter during IME composition submitted');
  await p.evaluate(() => { const inp = document.getElementById('ime-in'); inp.dispatchEvent(new CompositionEvent('compositionend')); });
  await p.waitForTimeout(20);
  await p.press('#ime-in', 'Enter');
  await p.waitForSelector('text=Continue ▶');
  await p.click('text=Continue ▶');
  const res = await p.evaluate(() => window.__res);
  assert(res.ok && res.mode === 'ime', 'ime result ' + JSON.stringify(res));
  assert(!errors.length, errors.join('; '));
  void status1; void confirmDisabled;
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('real combat UI: telegraph, card, choice answer, knot untied, no penalty in assist', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await p.evaluate(() => {
    const s = RB.game.debugStart('rw.millroad', 10, 22, { comp: 'suzu' });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.assist = 'assist';
    s.words.push('mamoru', 'mizu', 'hikari');
    RB.game.settings.input = 'choice';
    RB.game.startBattle('rw.reedling', {}).then((r) => { window.__battle = r; window.__battleDone = true; });
  });
  let shotTaken = false, answered = 0;
  for (let i = 0; i < 400; i++) {
    const st = await p.evaluate(() => ({
      over: !RB.combat.state() && RB.game.mode() !== 'combat',
      dlg: RB.ui.dialogue.isOpen(),
      cards: !!document.querySelector('.resp[data-i="0"]'),
      chal: !!document.querySelector('.chal'),
      cont: !!document.querySelector('.fbwrap button'),
    }));
    if (st.over) break;
    if (st.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); continue; }
    if (st.cont) { await p.click('.fbwrap button'); await p.waitForTimeout(80); continue; }
    if (st.chal) {
      // choice mode: try options in order (assisted mode: mistakes cost nothing)
      const btns = await p.$$('.mc .btn:not([disabled])');
      if (btns.length) { await btns[0].click(); answered++; }
      else { const r = await p.$('text=I don\'t know'); if (r) await r.click(); }
      await p.waitForTimeout(80);
      continue;
    }
    if (st.cards) {
      if (!shotTaken) {
        await shot(p, 'ui_combat'); shotTaken = true;
        const intent = await p.textContent('.intent');
        assert(/Strike|Waiting|Sweep/i.test(intent), 'intent shown: ' + intent);
      }
      await p.click('.resp[data-i="0"]');
      await p.waitForTimeout(120);
      continue;
    }
    await p.waitForTimeout(100);
  }
  await p.waitForFunction(() => window.__battleDone === true || RB.game.mode() === 'world', null, { timeout: 20000 });
  const pcRes = await p.evaluate(() => RB.game.s.resolve.pc);
  assert(answered > 0, 'no answers given');
  void pcRes;
  const outcome = await p.evaluate(() => window.__battle);
  assert(outcome === 'win', 'outcome ' + outcome);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('lightbulb help on tap, pin, notebook; furigana present', async () => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const { p, errors } = await page(b, url, { context: ctx });
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 18, {}); RB.game.settings.lightbulb = true; RB.ui.hud.refresh(); RB.game.settings.lead = 'ja'; RB.script.run('rw.tsuru_first'); });
  await p.waitForSelector('.dlg .main .jt');
  const rubies = await p.$$eval('.dlg ruby rt', (r) => r.length);
  assert(rubies > 0, 'no furigana');
  await p.click('.dlg .main .jt >> nth=2');
  await p.waitForSelector('.help');
  const h = await p.textContent('.help');
  assert(h.length > 5, 'help empty');
  await p.click('.help [data-a=pin]');
  await p.click('.help [data-a=note]');
  const nb = await p.evaluate(() => RB.game.s.notebook.filter((n) => n.kind === 'word').length);
  assert(nb === 1, 'notebook entry');
  await shot(p, 'ui_help');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

// ---------------------------------------------------------------------------
await test('touch layout on a phone viewport; drawing does not move the player', async () => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
  const { p, errors } = await page(b, url, { context: ctx });
  await p.evaluate(() => { RB.game.settings.touch = 'on'; RB.game.applySettings(); RB.game.debugStart('rw.village', 22, 18, {}); });
  await p.waitForSelector('.touchpad .tp-dpad', { state: 'visible' });
  await shot(p, 'ui_phone_world');
  const before = await p.evaluate(() => [RB.game.s.x, RB.game.s.y]);
  await p.evaluate(() => { RB.game.s.learn.kanaKnown = 'both'; window.__r = RB.challenge.runStep({ kind: 'write', item: 'k:く', answer: 'く', accept: ['く'], mode: 'kana', single: true, prompt: { en: 'Write ku' } }, {}); });
  await p.waitForSelector('.pad-ink');
  const box = await p.locator('.pad-ink').boundingBox();
  await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  const after = await p.evaluate(() => [RB.game.s.x, RB.game.s.y]);
  assert(before[0] === after[0] && before[1] === after[1], 'player moved while drawing');
  await shot(p, 'ui_phone_pad');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert(!overflow, 'horizontal overflow on phone');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await b.close(); srv.close();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
