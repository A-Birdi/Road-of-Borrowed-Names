// Practice suite A at the addendum's sizes (§20.2): 320×640, 390×844, 844×390 (phones, touch),
// 1280×800, and 200 % text, in Chromium against the built index.html. Every screen of lantern
// tending (preparation, a lamp's step, between lamps, the end), the writing desk (each mode's word
// list, Trace with two characters, Copy, the page, Typeset, the six-page replace sheet) and
// Journey › Practice mementos: no horizontal overflow, principal controls at least 44×44, and
// focus starts on a control. Captures: docs/screenshots/practice_a/layout_*.png (a selection).
// Usage: node tests/e2e/practice_a_layout.mjs [filter]
import { serve, launch, page } from './lib.mjs';
import { start, press, wait, overflow, smallTargets, shot, phone, drawMouse } from './practice_a_lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let fail = 0, n = 0;
const assert = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const t0 = Date.now();

const CONFIGS = [
  { name: '320x640', o: phone(320, 640), text: 1 },
  { name: '320x640_x2', o: phone(320, 640), text: 2, shots: true },
  { name: '390x844', o: phone(390, 844), text: 1 },
  { name: '390x844_x2', o: phone(390, 844), text: 2 },
  { name: '844x390', o: phone(844, 390), text: 1, shots: true },
  { name: '1280x800', o: { viewport: { width: 1280, height: 800 } }, text: 1 },
  { name: '1280x800_x2', o: { viewport: { width: 1280, height: 800 } }, text: 2 },
];
let HOW = 'mouse';
const TARGETS = '[data-pa], [data-dk]:not([data-dk=order]), .dk-card, .pm-cell, .pm-detail .pbtn, .pa-mode, .pa-desk .opt, .pa-lamps .opt, .dk-tabs .ptab, .pa-replace [data-rep], .pa-replace [data-x], #pa-topic';

async function lampsPrep(p, text) {
  await start(p, { items: ['v:水', 'v:海', 'v:山', 'k:あ'], input: 'choice', text });
  await p.evaluate(() => { RB.practiceA.launch('lanterns', { source: 'world-prop' }); });
  await p.waitForSelector('[data-pa=begin]');
  await wait(p, 250);
}
async function answerByChoice(p) {
  const st = await p.evaluate(() => { const s = RB.ui.lanterns._step(); return { kind: s.kind, answer: s.answer ? RB.tasks.plain(s.answer) : null, options: s.options ? s.options.map((o) => ({ ok: !!o.ok, t: (o.en || o.jp || '').replace(/\s+/g, '') })) : null }; });
  if (st.kind === 'write') await press(p, '.chal-tabs .ptab[data-mode=choice]', HOW);
  await p.waitForSelector('.mc .btn.choice');
  const i = await p.evaluate((st) => [...document.querySelectorAll('.mc .btn.choice')].findIndex((x) => { const c = x.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); const t = c.textContent.replace(/\s+/g, ''); return st.kind === 'write' ? t === st.answer : st.options.some((o) => o.ok && t.indexOf(o.t) >= 0); }), st);
  await press(p, '.mc .btn.choice:nth-child(' + (i + 1) + ')', HOW);
  await p.waitForSelector('.fbwrap[data-fb=ok]');
  await press(p, '.fbwrap [data-a=continue]', HOW);
}
async function deskOpen(p, text, mode) {
  await start(p, { at: 'desk', items: ['v:月'], text });
  await p.evaluate(() => { RB.practiceA.launch('copying', { source: 'world-prop' }); });
  await p.waitForSelector('.dk-cards');
  if (mode) { await press(p, '.dk-tabs .ptab[data-id=' + mode + ']', HOW); await wait(p, 200); }
  await wait(p, 200);
}
async function sixPages(p) {
  await p.evaluate(async () => {
    const ref = (w) => [{ ch: w, strokes: RB.recog.reference(w).strokes.map((st) => st.map((q) => ({ x: q.x / 109, y: q.y / 109 }))) }];
    for (const w of ['山', '川', '石', '木', '月']) await RB.practiceDesk.keepPage(RB.game.s, { word: w, mode: 'copy', ink: ref(w), label: 'Copied ' + w });
    await RB.practiceDesk.keepPage(RB.game.s, { word: '星', reading: 'ほし', mode: 'typeset', typeset: { jp: '{星|ほし}', layout: 'card', paper: 'grid', en: 'star' }, label: 'Star, typeset' });
  });
}

const STATES = {
  async lamps_prep(p, c) { await lampsPrep(p, c.text); return '.pa-lamps'; },
  async lamps_topic(p, c) { await lampsPrep(p, c.text); await press(p, 'input[name=pa-mode][value=topic]', HOW); await p.waitForSelector('#pa-topic'); return '.pa-lamps'; },
  async lamps_step(p, c) { await lampsPrep(p, c.text); await press(p, '[data-pa=begin]', HOW); await p.waitForSelector('.chal-frame'); await wait(p, 200); return '.chal .chal-situ'; },
  async lamps_between(p, c) { await lampsPrep(p, c.text); await press(p, '[data-pa=begin]', HOW); await p.waitForSelector('.chal-frame'); await answerByChoice(p); await p.waitForSelector('[data-pa=next]'); return '.pa-lamps'; },
  async lamps_end(p, c) { await STATES.lamps_between(p, c); await press(p, '[data-pa=stop]', HOW); await p.waitForSelector('.pa-end'); await press(p, '.pa-reviewed summary', HOW); await wait(p, 300); return '.pa-lamps'; },
  async desk_trace_cards(p, c) { await deskOpen(p, c.text); return '.pa-desk'; },
  async desk_prompt_cards(p, c) { await deskOpen(p, c.text, 'prompt'); return '.pa-desk'; },
  async desk_trace(p, c) { await deskOpen(p, c.text); await press(p, '.dk-card[data-card=name]', HOW); await p.waitForSelector('.dk-ink'); await wait(p, 250); return '.pa-desk'; },
  async desk_copy(p, c) { await deskOpen(p, c.text, 'copy'); await press(p, '.dk-card[data-card=letter]', HOW); await p.waitForSelector('.dk-model canvas'); await wait(p, 250); return '.pa-desk'; },
  async desk_page(p, c) {
    await deskOpen(p, c.text); await press(p, '.dk-card[data-card=tree]', HOW); await p.waitForSelector('.dk-ink'); await wait(p, 200);
    await drawMouse(p, '木', '.dk-ink', 0.1); await press(p, '[data-dk=donech]', HOW); await p.waitForSelector('[data-dk=keep]'); await wait(p, 200); return '.pa-desk';
  },
  async desk_typeset(p, c) { await deskOpen(p, c.text, 'typeset'); await press(p, '.dk-card[data-card=home]', HOW); await p.waitForSelector('[data-dk=make]'); await press(p, 'input[name=dk-lay][value=sentence]', HOW); await wait(p, 200); return '.pa-desk'; },
  async desk_replace(p, c) {
    await deskOpen(p, c.text); await sixPages(p);
    await p.evaluate(() => { RB.practiceDesk.keepPage(RB.game.s, { word: '雨', mode: 'trace', ink: [{ ch: '雨', strokes: RB.recog.reference('雨').strokes.map((st) => st.map((q) => ({ x: q.x / 109, y: q.y / 109 }))) }], label: 'Rain, traced' }); });
    await p.waitForSelector('.pa-replace .dk-replist'); await wait(p, 250); return '.pa-replace';
  },
  async mementos(p, c) {
    await deskOpen(p, c.text); await sixPages(p);
    await press(p, '[data-dk=leave]', HOW); await wait(p, 500);
    await p.evaluate(() => RB.ui.menu.open('journey')); await p.waitForSelector('[data-jv=mementos]');
    await press(p, '[data-jv=mementos]', HOW); await p.waitForSelector('.pm-grid'); await wait(p, 250);
    return '.folio';
  },
};

for (const c of CONFIGS) {
  for (const name of Object.keys(STATES)) {
    if (only && !(c.name + ' ' + name).includes(only)) continue;
    const { p, errors, ctx } = await page(b, url, c.o);
    HOW = c.o.touch ? 'touch' : 'mouse';
    let rootSel = null, err = null;
    try { rootSel = await STATES[name](p, c); } catch (e) { err = e; }
    if (err) { await p.screenshot({ path: 'tests/e2e/out/practice_a/fail_' + name + '_' + c.name + '.png' }); assert(false, c.name + ' ' + name + ': could not reach the state: ' + String(err.message || err).split('\n')[0]); await ctx.close(); continue; }
    await wait(p, 150); // focus is placed once the sheet has rendered (a timeout after the step closes)
    const of = await overflow(p, rootSel);
    // the lamp's step is the shared challenge screen: only this suite's header line is checked there
    const small = name === 'lamps_step' ? [] : await smallTargets(p, TARGETS);
    const focus = await p.evaluate(() => { const a = document.activeElement; return !!(a && a !== document.body && a.closest('.pa-lamps, .pa-desk, .pa-replace, .folio, .chal, .csheet')); });
    assert(!of.length, c.name + ' ' + name + ': no horizontal overflow' + (of.length ? ' ' + JSON.stringify(of) : ''));
    assert(!small.length, c.name + ' ' + name + ': principal controls at least 44×44' + (small.length ? ' ' + JSON.stringify(small) : ''));
    if (name !== 'mementos' && name !== 'lamps_step') assert(focus, c.name + ' ' + name + ': keyboard focus is inside the sheet');
    if (c.shots || ['lamps_prep', 'desk_trace', 'desk_copy', 'mementos'].includes(name) && c.name === '1280x800') await shot(p, 'layout_' + name + '_' + c.name);
    assert(!errors.length, c.name + ' ' + name + ': no errors' + (errors.length ? ' ' + errors.join('; ') : ''));
    await ctx.close();
  }
}

await b.close(); srv.close();
console.log('\n' + (n - fail) + '/' + n + ' checks passed (' + Math.round((Date.now() - t0) / 1000) + ' s)');
process.exit(fail ? 1 : 0);
