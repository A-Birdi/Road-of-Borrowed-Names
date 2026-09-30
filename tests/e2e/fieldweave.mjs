// Field Inkweaving and the six field puzzles, driven through the real game in
// the browser (addendum §13, §14.2-14.7, §23.5; docs/addendum/fieldweave.md).
//
// Every puzzle is solved by every valid method through the real UI: the Weave
// key / HUD tag / touch button, the sheet's target list, the word cards, the
// real challenge (handwriting through the recogniser, keyboard/IME, choice,
// "I don't know" assistance), the objects' inspection menus reached by
// facing them and pressing Enter, and F6's filing sheet. Also: the Weave
// control only near authored objects and only with learned words; cancel
// changes nothing; correct Japanese on the wrong object is neutral feedback
// and still counts as correct Japanese (language vs applicability vs
// completion); ineffective attempts explain themselves; reset; reload from a
// real save slot mid-puzzle and after completion; re-entry and double
// commits never award twice; assisted completion gives identical credit;
// companion reactions follow the method that actually solved it; F6 is not
// offered during the descent. Screenshots: tests/e2e/out/fieldweave/.
// Usage: node tests/e2e/fieldweave.mjs [section-pattern]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'tests/e2e/out/fieldweave');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0, n = 0;
const assert = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
let { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const shot = (name) => p.screenshot({ path: path.join(OUT, name + '.png') });

// ---- in-page helpers (re-installed after a reload) ------------------------------------------------------------
async function helpers() {
  await p.evaluate(() => {
    window.__ev = [];
    for (const e of ['present:action', 'discovery:resolved', 'keepsake:found', 'world:changed']) RB.bus.on(e, (x) => window.__ev.push([e, JSON.parse(JSON.stringify(x || null))]));
    window.__ink = (ch) => {
      const ref = RB.recog.reference(ch);
      const r = RB.util.rng(31 + ch.charCodeAt(0));
      return ref.strokes.map((st) => st.map((pt, i) => ({ x: (pt.x / ref.box) * 0.8 + 0.1 + (r() - 0.5) * 0.02, y: (pt.y / ref.box) * 0.8 + 0.1 + (r() - 0.5) * 0.02, t: 1000 + i * 16 })));
    };
    // a free tile beside an object, facing it (below first, as a player would walk up)
    window.__standBy = (pz, key) => {
      const o = RB.fieldweave.get(pz).objects[key], W = RB.world.W;
      const free = (x, y) => x >= 0 && y >= 0 && x < W.map.w && y < W.map.h && !RB.maps.blockedStatic(W.map, x, y) && !RB.maps.exitAt(W.map, x, y) && !W.npcs.some((q) => q.x === x && q.y === y);
      for (let i = 0; i < (o.w || 1); i++) {
        for (const [x, y, dir] of [[o.x + i, o.y + 1, 'up'], [o.x - 1, o.y, 'right'], [o.x + (o.w || 1), o.y, 'left'], [o.x + i, o.y - 1, 'down']]) {
          if (free(x, y)) { RB.test.place(x, y, dir); return [x, y, dir]; }
        }
      }
      return null;
    };
  });
}
await helpers();
const ev = (name) => p.evaluate((name) => window.__ev.filter((e) => !name || e[0] === name).map((e) => e[1]), name);
const clearEv = () => p.evaluate(() => { window.__ev.length = 0; });
const st = (pz) => p.evaluate((pz) => RB.fieldweave.stateOf(RB.game.s, pz), pz);
const rec = (pz) => p.evaluate((pz) => JSON.parse(JSON.stringify(RB.fieldweave.peek(RB.game.s, pz))), pz);
// what was said since the last action began (its last k lines, or all of them)
const mark = () => p.evaluate(() => { window.__mark = RB.game.s.backlog.length; });
const said = (k) => p.evaluate((k) => { const b = RB.game.s.backlog.slice(window.__mark || 0); return (k ? b.slice(-k) : b).map((l) => l.who + ': ' + l.en).join('\n'); }, k);

async function start(map, x, y, dir, o = {}) {
  await p.evaluate(({ map, x, y, dir, o }) => {
    if (RB.weave.isOpen()) RB.weave.close();
    const s = RB.game.debugStart(map, x, y, { dir, comp: o.comp === undefined ? 'mio' : o.comp, flags: o.flags || {} });
    s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E';
    s.words = (o.words || []).slice();
    RB.game.settings.input = o.input || 'choice';
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.reducedMotion = !!o.still;
    RB.game.applySettings && RB.game.applySettings();
    window.__ev.length = 0;
    // as after a real arrival: a first visit's scene plays first
    RB.game.runEnterEvents();
  }, { map, x, y, dir, o });
  // arrival scenes (a first visit, a chapter's opening) may start a moment after
  // the map appears: wait until the world has been quiet for half a second
  for (let quiet = 0, k = 0; quiet < 8 && k < 400; k++) {
    const s = await settle();
    if (s.ch) { await p.locator('.choices .choice').first().click(); quiet = 0; continue; }
    const idle = await p.evaluate(() => RB.game.mode() === 'world' && !RB.ui.dialogue.isOpen() && !RB.weave.busy());
    quiet = idle ? quiet + 1 : 0;
    await p.waitForTimeout(60);
  }
  await p.evaluate(() => { window.__ev.length = 0; });
}
// advance dialogue until the world (or a choice, the sheet, a challenge) is waiting
async function settle(max = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < max) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), ch: !!document.querySelector('.choices:not(.hidden) .choice'), busy: RB.weave.busy(), mode: RB.game.mode(), chal: !!document.querySelector('.chal'), sheet: RB.weave.isOpen() && !document.querySelector('.weave-sheet.hidden'), arr: !!document.querySelector('.arrange-sheet') }));
    if (s.ch || s.chal || s.sheet || s.arr) return s;
    if (s.dlg) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(30); continue; }
    if (!s.busy && s.mode === 'world') return s;
    await p.waitForTimeout(50);
  }
  throw new Error('settle: timed out ' + JSON.stringify(await p.evaluate(() => ({ mode: RB.game.mode(), busy: RB.weave.busy(), dlg: RB.ui.dialogue.isOpen() }))));
}
// face an object and press Enter (the real interaction), then pick a reply
async function inspect(pz, key, choiceRe) {
  await settle();
  const at = await p.evaluate(([pz, key]) => window.__standBy(pz, key), [pz, key]);
  if (!at) throw new Error('nowhere to stand by ' + pz + '.' + key);
  await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await mark();
  await p.keyboard.press('Enter');
  const s = await settle();
  if (!choiceRe) return s;
  if (!s.ch) throw new Error('no menu at ' + pz + '.' + key + ': ' + (await said(3)));
  const opts = await p.evaluate(() => [...document.querySelectorAll('.choices .choice')].map((b) => b.textContent));
  const i = opts.findIndex((t) => choiceRe.test(t));
  if (i < 0) throw new Error('no reply ' + choiceRe + ' at ' + pz + '.' + key + ' among ' + JSON.stringify(opts));
  await p.locator('.choices .choice').nth(i).click();
  return settle();
}
const menuOf = async (pz, key) => {
  await p.evaluate(([pz, key]) => window.__standBy(pz, key), [pz, key]);
  await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  await p.keyboard.press('Enter');
  await settle();
  const opts = await p.evaluate(() => [...document.querySelectorAll('.choices .choice')].map((b) => b.textContent));
  // leave it
  const i = opts.findIndex((t) => /Leave it|Step back/.test(t));
  if (i >= 0) { await p.locator('.choices .choice').nth(i).click(); await settle(); }
  return opts;
};
// the language step, answered the way a player would
async function answer(word, how) {
  await p.waitForSelector('.chal', { timeout: 6000 });
  const w = await p.evaluate((id) => { const x = RB.content.words[id]; return { r: x.r, k: RB.tasks.plain(x.jpK || x.jp) }; }, word);
  const tab = async (m) => { const has = await p.$('.chal .ptab[data-mode=' + m + ']'); if (has && (await has.getAttribute('aria-selected')) !== 'true') await has.click(); };
  const cont = async () => { await p.waitForSelector('.chal .fbwrap [data-a=continue]', { timeout: 6000 }); await p.click('.chal .fbwrap [data-a=continue]'); await p.waitForSelector('.chal', { state: 'detached', timeout: 6000 }); };
  if (how === 'cancel') { await p.click('.chal [data-a=leave]'); await p.waitForSelector('.chal', { state: 'detached', timeout: 6000 }); return; }
  if (how === 'assist') { await p.click('.chal [data-a=reveal]'); return cont(); }
  if (how === 'choice') {
    await tab('choice');
    await p.waitForSelector('.chal .mc .choice');
    const i = await p.evaluate((w) => [...document.querySelectorAll('.chal .mc .choice')].findIndex((b) => { const c = b.cloneNode(true); c.querySelectorAll('rt').forEach((r) => r.remove()); const t = c.textContent.replace(/\s+/g, ''); return t === w.r || t === w.k; }), w);
    if (i < 0) throw new Error('no choice for ' + w.r);
    await p.locator('.chal .mc .choice').nth(i).click();
    await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
    return cont();
  }
  if (how === 'ime' || how === 'wrong-ime') {
    await tab('ime');
    await p.waitForSelector('#ime-in');
    if (how === 'wrong-ime') {
      await p.fill('#ime-in', w.r.slice(0, -1) + (w.r.endsWith('あ') ? 'い' : 'あ'));
      await p.press('#ime-in', 'Enter');
      await p.waitForSelector('.chal .fbwrap[data-fb=no]');
    }
    await p.fill('#ime-in', w.r);
    await p.press('#ime-in', 'Enter');
    await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
    return cont();
  }
  if (how === 'hand') {
    await tab('hand');
    await p.waitForSelector('.chal .pad-ink');
    for (const ch of Array.from(w.r)) {
      await p.evaluate(async (ch) => { RB.pad.__last._inject(window.__ink(ch)); await new Promise((r) => setTimeout(r, 80)); }, ch);
      const read = await p.textContent('.chal .readas');
      if (read.indexOf(ch) < 0) throw new Error('the pad read ' + read + ' for ' + ch);
      await p.click('.chal [data-a=confirm]');
    }
    await p.click('.chal [data-a=submit]');
    await p.waitForSelector('.chal .fbwrap[data-fb=ok]');
    return cont();
  }
  throw new Error('unknown answer mode ' + how);
}
// open the sheet, choose the thing and the word, answer, and let the world answer back
async function weave(pz, key, word, how = 'choice', o = {}) {
  await settle();
  if (o.stand !== false) await p.evaluate(([pz, key]) => window.__standBy(pz, key), [pz, key]);
  if (!(await p.evaluate(() => RB.weave.isOpen()))) {
    await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    if (o.via === 'hud') await p.click('.hud .weave-b');
    else if (o.via === 'touch') await p.tap('.touchpad .tp-weave');
    else await p.keyboard.press('KeyV');
  }
  await p.waitForSelector('.weave-sheet:not(.hidden) .wv-t');
  const i = await p.evaluate((t) => RB.weave.state().targets.indexOf(t), pz + '.' + key);
  if (i < 0) throw new Error(pz + '.' + key + ' is not among ' + JSON.stringify(await p.evaluate(() => RB.weave.state().targets)));
  await p.click('.weave-sheet [data-t="' + i + '"]');
  const before = (await ev('present:action')).length;
  await mark();
  await p.click('.weave-sheet .wv-w[data-w="' + word + '"]');
  if (how !== 'routine') await answer(word, how);
  if (how === 'cancel') return null;
  if (o.frames) {
    for (let k = 0; k < o.frames; k++) { await p.waitForTimeout(k ? 190 : 60); await shot(o.frameName + '_' + k); }
  }
  await settle();
  const pres = await ev('present:action');
  return pres.length > before ? pres[pres.length - 1] : null;
}
async function reload(slot = 6) {
  await p.evaluate(async (slot) => { RB.save.setCurrent(slot, 0); await RB.save.writeSlot(slot, RB.game.s, { force: true }); }, slot);
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 15000 });
  await helpers();
  const ok = await p.evaluate(async (slot) => { RB.game.settings.textSpeed = 'instant'; RB.ui.title.hide(); return RB.game.loadCampaign(slot); }, slot);
  await p.waitForTimeout(300);
  await settle();
  return ok;
}
const reactionText = (pz) => p.evaluate((pz) => { const id = RB.game.s.company.react['puzzle:' + pz + ':done']; const r = RB.company.reactions.find((x) => x.id === id); return r ? { id, who: r.comp, en: r.lines[0].en } : { id }; }, pz);
const ksCount = () => p.evaluate(() => Object.keys(RB.game.s.discovery.keepsakes).length);
const words = ['mamoru', 'mizu', 'hikari', 'iyasu', 'kaze', 'nawa', 'ishi', 'tsuchi', 'koori', 'honoo', 'suzu', 'koe'];

const t0 = Date.now();
const ONLY = process.argv[2] ? new RegExp(process.argv[2], 'i') : null; // e.g. "F2" runs that section only
async function section(name, fn) {
  if (ONLY && !ONLY.test(name)) return;
  console.log('\n# ' + name);
  try { await fn(); } catch (e) { fail++; console.log('FAIL ' + name + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e)); }
}

// ==== the Weave control: only near authored objects, only learned words ==============================================
await section('the Weave control', async () => {
  await start('rw.village', 30, 30, 'up', { words: ['mamoru', 'mizu', 'hikari'] });
  let s = await p.evaluate(() => ({ btn: document.querySelector('.hud .weave-b').classList.contains('hidden'), avail: RB.weave.available(), can: document.body.classList.contains('can-weave') }));
  assert(s.btn && !s.avail && !s.can, 'away from any authored object the Weave tag is hidden and nothing is offered');
  await p.keyboard.press('KeyV');
  await p.waitForTimeout(150);
  assert(!(await p.evaluate(() => RB.weave.isOpen())), 'V away from a puzzle object opens nothing (never on mere scenery)');
  await p.evaluate(() => RB.test.place(32, 23, 'up'));
  await p.waitForTimeout(200);
  s = await p.evaluate(() => ({ btn: !document.querySelector('.hud .weave-b').classList.contains('hidden'), avail: RB.weave.available(), can: document.body.classList.contains('can-weave'), tag: document.querySelector('.hud .weave-b').textContent }));
  assert(s.btn && s.avail && s.can && /Weave/.test(s.tag) && /V/.test(s.tag), 'beside the slip screen the HUD shows "Weave" with its key (' + s.tag.trim() + ')');
  await p.keyboard.press('KeyV');
  await p.waitForSelector('.weave-sheet:not(.hidden)');
  s = await p.evaluate(() => ({ st: RB.weave.state(), cards: [...document.querySelectorAll('.wv-w')].map((b) => b.dataset.w), label: document.querySelector('.wv-label').textContent, look: document.querySelector('.wv-look').textContent, mode: RB.game.mode(), side: document.querySelector('.weave-sheet').classList.contains('side') }));
  assert(s.st.targets.join() === 'f1.screen,f1.clamp' && s.st.sel === 'f1.screen', 'the sheet lists the nearby things, the one in front first (' + s.st.targets + ')');
  assert(s.cards.join() === 'mamoru,mizu,hikari', 'only the words actually learned are offered (' + s.cards + ')');
  assert(/slip screen/.test(s.label) && /reed paper/.test(s.look), 'the chosen thing is labelled in the world and described from what can be seen');
  assert(s.mode === 'weave' && s.side, 'the sheet pauses the world and docks beside the view on a wide screen');
  await shot('sheet_wide');
  // arrow keys move between the nearby things; the label follows
  await p.focus('.weave-sheet [data-t="0"]');
  await p.keyboard.press('ArrowRight');
  s = await p.evaluate(() => ({ sel: RB.weave.state().sel, label: document.querySelector('.wv-label').textContent, focus: document.activeElement.dataset.t }));
  assert(s.sel === 'f1.clamp' && /clamp/.test(s.label) && s.focus === '1', 'arrow keys change the target; the label and focus follow');
  // clicking the thing in the world selects it too
  const pt = await p.evaluate(() => { const a = RB.render.tileToCss(32, 22), b2 = RB.render.tileToCss(33, 23); return { x: (a.x + b2.x) / 2, y: (a.y + b2.y) / 2 }; });
  await p.mouse.click(pt.x, pt.y);
  assert((await p.evaluate(() => RB.weave.state().sel)) === 'f1.screen', 'clicking the screen in the world selects it');
  // hints: three layers, no cost
  await p.click('.weave-sheet [data-a=hint]');
  await p.click('.weave-sheet [data-a=hint]');
  s = await p.evaluate(() => ({ n: document.querySelectorAll('.wv-hints li').length, lvl: RB.fieldweave.hintLevel(RB.game.s, 'f1'), txt: document.querySelector('.wv-hints').textContent }));
  assert(s.n === 2 && s.lvl === 2 && /A nudge/.test(s.txt) && /Closer/.test(s.txt), 'hints come a layer at a time (broad, then closer)');
  // Escape closes; nothing changed
  await p.keyboard.press('Escape');
  await p.waitForTimeout(150);
  s = await p.evaluate(() => ({ open: RB.weave.isOpen(), mode: RB.game.mode(), rec: RB.game.s.discovery.puzzles.f1 ? RB.game.s.discovery.puzzles.f1.state : null }));
  assert(!s.open && s.mode === 'world', 'Escape closes the sheet and returns to the world');
  await p.keyboard.press('KeyV');
  await p.waitForSelector('.weave-sheet:not(.hidden)');
  await p.keyboard.press('KeyV');
  await p.waitForTimeout(150);
  assert(!(await p.evaluate(() => RB.weave.isOpen())), 'V again closes it');
  // remappable: bind Weave to G and it follows
  await p.evaluate(() => { const bnd = RB.input.getBinds(); RB.input.setBinds(Object.assign({}, bnd, { weave: ['KeyG'] })); });
  await p.keyboard.press('KeyG');
  await p.waitForSelector('.weave-sheet:not(.hidden)');
  assert(true, 'the Weave key is remappable (G opens the sheet once bound)');
  await p.keyboard.press('Escape');
  await p.evaluate(() => RB.input.setBinds(null));
  // no words yet: no Weave at all
  await start('rw.village', 32, 23, 'up', { words: [] });
  assert(!(await p.evaluate(() => RB.weave.available())), 'before any word is learned there is nothing to weave');
});

// ==== F1: ineffective attempts, cancel, handwriting, warded route (Mio) ============================================
let mioLine = null;
await section('F1 A Dry Place for Names: the ward route, written by hand', async () => {
  await start('rw.village', 33, 24, 'up', { words: ['mamoru', 'mizu', 'hikari'], input: 'hand', comp: 'mio' });
  // the ordinary action that cannot work yet explains why
  await inspect('f1', 'clamp', /Close the clamp/);
  assert(/cannot close on an edge that will not keep still/.test(await said()) && (await st('f1')).clamp === 'open', 'clamping a swinging screen is explained and changes nothing');
  // correct Japanese on the wrong thing: neutral physical feedback, still correct Japanese
  const learnBefore = await p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s.learn.stats)));
  let r = await weave('f1', 'screen', 'mizu', 'ime');
  const learnAfter = await p.evaluate(() => JSON.parse(JSON.stringify(RB.game.s.learn.stats)));
  assert(r && r.result === 'neutral' && r.family === 'water' && /Nothing here needs wetting/.test(await said()), 'Water on the dry slips: neutral, with the physical reason ("' + (await said(1)).slice(6, 60) + '…")');
  assert(JSON.stringify(await st('f1')) === JSON.stringify({ screen: 'swing', held: false, clamp: 'open' }), 'the neutral weave changed nothing');
  assert(learnAfter.typed === (learnBefore.typed || 0) + 1 && (learnAfter.mistakes || 0) === (learnBefore.mistakes || 0), 'the typed みず still counts as correct Japanese (typed ' + learnBefore.typed + '→' + learnAfter.typed + '); applicability is not a language mistake');
  // cancel changes nothing
  await clearEv();
  const r0 = JSON.stringify(await rec('f1'));
  r = await weave('f1', 'screen', 'mamoru', 'cancel');
  const back = await p.evaluate(() => ({ open: RB.weave.isOpen(), hidden: document.querySelector('.weave-sheet').classList.contains('hidden'), focus: document.activeElement && document.activeElement.dataset.w }));
  assert(back.open && !back.hidden && back.focus === 'mamoru', '"Choose a different word" returns to the sheet with the word card focused');
  assert(JSON.stringify(await rec('f1')) === r0 && !(await ev('present:action')).length, 'cancelling the writing changes nothing and shows nothing');
  await p.keyboard.press('Escape');
  // Protect by handwriting: the ward holds the screen (a step, not a countdown)
  await clearEv();
  r = await weave('f1', 'screen', 'mamoru', 'hand', { frames: 7, frameName: 'f1_ward_anim' });
  const s1 = await st('f1');
  assert(r && r.result === 'effective' && r.family === 'protect' && r.scope === 'field' && r.targets.join() === 'obj:f1.screen' && r.at.x === 32, 'present:action { scope field, protect, at the screen, effective }');
  assert(s1.held === true && s1.clamp === 'open', 'the ward holds the screen still; the clamp is still to do');
  const lastLang = await p.evaluate(() => { const l = RB.fieldweave.peek(RB.game.s, 'f1').log; return l[l.length - 1]; });
  assert(lastLang && lastLang.lang && lastLang.lang.mode === 'hand' && !lastLang.lang.assisted, 'the handwritten answer went through the real recogniser and checker (mode hand)');
  await p.waitForTimeout(3000);
  assert((await st('f1')).held === true, 'no timer: the ward is still holding after a wait');
  await shot('f1_ward_held');
  // the ordinary step completes it
  await clearEv();
  await inspect('f1', 'clamp', /Close the clamp/);
  const done = await rec('f1');
  const res = await ev('discovery:resolved'), ks = await ev('keepsake:found');
  assert(done.done && done.method === 'warded' && done.state.clamp === 'set' && done.state.held === false && done.state.screen === 'closed', 'clamped while warded: done by "warded"; the ward lets go, the screen stays shut');
  assert(res.length === 1 && res[0].kind === 'puzzle' && res[0].id === 'f1' && res[0].region === 'reedwake' && res[0].method === 'warded', 'discovery:resolved { puzzle f1, reedwake, warded } once');
  assert(ks.length === 1 && ks[0].id === 'reed_boat' && (await p.evaluate(() => !!RB.game.s.discovery.keepsakes.reed_boat)), 'the Folded Reed Boat is found once');
  const rt = await reactionText('f1');
  const log = await said();
  mioLine = rt.en;
  assert(rt.id === 'f1.mio.warded' && log.indexOf('mio: ' + rt.en) >= 0, 'Mio reacts to the ward route, briefly ("' + rt.en + '")');
  assert(/Take one/.test(log), 'the keepsake is found in the world (the children\'s note)');
  await p.waitForSelector('.ks-toast', { timeout: 6000 });
  assert(true, 'a brief non-blocking notice names the keepsake');
  await shot('f1_done');
  // re-entry: the result stays, nothing awards twice, the routine weave needs no writing
  await clearEv();
  r = await weave('f1', 'screen', 'mamoru', 'routine');
  assert(r && r.result === 'neutral' && /already fastened/.test(await said()), 'weaving again on the finished screen: "already fastened" (a routine repeat needs no writing)');
  const opts = await menuOf('f1', 'clamp');
  assert(!opts.length, 'the finished clamp offers no action');
  await p.evaluate(() => { RB.fieldweave.act(RB.game.s, 'f1', 'clamp'); RB.fieldweave.weave(RB.game.s, 'f1', 'screen', 'mamoru', { mode: 'choice' }); });
  assert(!(await ev('discovery:resolved')).length && !(await ev('keepsake:found')).length && (await ksCount()) === 1, 'double commits and re-entry award nothing twice');
  // reload from a real save slot
  const ok = await reload(6);
  const after = await p.evaluate(() => ({ r: RB.fieldweave.peek(RB.game.s, 'f1'), ks: Object.keys(RB.game.s.discovery.keepsakes), view: RB.fieldweave.view(RB.game.s, 'f1'), map: RB.game.s.map }));
  assert(ok && after.r.done && after.r.method === 'warded' && after.ks.join() === 'reed_boat' && after.view.clamp === 'set' && after.map === 'rw.village', 'after saving and reloading, the screen is still fastened and the keepsake kept');
  await shot('f1_after_reload');
});

// ==== F1: the ordinary route (Nao), no writing at all ================================================================
await section('F1: the ordinary route, and another companion', async () => {
  await start('rw.village', 33, 24, 'up', { words: ['mamoru'], comp: 'nao' });
  await inspect('f1', 'screen', /Swing the screen shut/);
  assert((await st('f1')).screen === 'closed', 'swinging the screen shut by hand');
  await inspect('f1', 'screen', /Let go/);
  assert((await st('f1')).screen === 'swing', 'letting go: it swings again (a mistaken step is reversible)');
  // Protect on a shut screen explains itself
  await inspect('f1', 'screen', /Swing the screen shut/);
  const r = await weave('f1', 'screen', 'mamoru', 'choice');
  assert(r.result === 'neutral' && /nothing for the ward to hold/.test(await said()), 'a ward on a shut screen: nothing to hold (neutral)');
  await inspect('f1', 'clamp', /Close the clamp/);
  const d = await rec('f1'), rt = await reactionText('f1');
  assert(d.done && d.method === 'screened', 'shut by hand, then clamped: done by "screened"');
  assert(rt.id === 'f1.nao.screened' && rt.en !== mioLine && (await said()).indexOf('nao: ' + rt.en) >= 0, 'Nao reacts to the ordinary route, differently ("' + rt.en + '")');
  assert((await p.evaluate(() => JSON.stringify(Object.keys(RB.game.s.discovery.keepsakes)))) === '["reed_boat"]', 'the same keepsake either way');
});

// ==== F2: the three routes, reset, reload mid-puzzle, wrong answer then right, assistance ===========================
await section('F2 The Float That Will Not Rise', async () => {
  const at = ['sg.harbor', 45, 27, 'up', { flags: { ch2_start: true } }];
  // filled: the vent first, then water — typed, with a wrong answer first
  await start(...at.slice(0, 4), Object.assign({}, at[4], { words, input: 'ime', comp: 'ren' }));
  let r = await weave('f2', 'tank', 'mizu', 'ime');
  assert(r.result === 'neutral' && /air|vent|cap/i.test(await said()) && (await st('f2')).level === 'low', 'water with the vent shut: it will not go in, and says why (' + (await said(1)).slice(6, 70) + '…)');
  await inspect('f2', 'vent', /Turn the cap back/);
  assert((await st('f2')).vent === 'open', 'the vent cap opened by hand');
  // reset (the sheet's Reset appears once something has moved)
  await p.evaluate(() => window.__standBy('f2', 'tank'));
  await p.keyboard.press('KeyV');
  await p.waitForSelector('.weave-sheet:not(.hidden)');
  const hasReset = await p.evaluate(() => !document.querySelector('.weave-sheet [data-a=reset]').classList.contains('hidden'));
  await p.click('.weave-sheet [data-a=reset]');
  await settle();
  const rr = await rec('f2');
  assert(hasReset && rr.state.vent === 'shut' && rr.seen && Object.keys(rr.seen).length > 0, 'Reset puts the mechanism back and keeps what was observed');
  await inspect('f2', 'vent', /Turn the cap back/);
  await inspect('f2', 'crank', /Drop the catch/);
  // reload mid-puzzle
  const ok = await reload(5);
  assert(ok && JSON.stringify(await st('f2')) === JSON.stringify({ vent: 'open', catch: 'on', bound: false, level: 'low', float: 'cradle' }), 'reloaded mid-puzzle: the vent is open and the catch on, exactly as left');
  await p.evaluate(() => { RB.game.settings.input = 'ime'; });
  r = await weave('f2', 'inlet', 'mizu', 'wrong-ime');
  const d = await rec('f2');
  const lg = d.log.filter((x) => x.lang).pop();
  assert(r.result === 'complete' && d.done && d.method === 'filled' && d.state.float === 'slot', 'water through the funnel: the float rises to the slot (filled)');
  assert(lg && lg.lang.firstTry === false && lg.lang.mistakes === 1, 'the mistyped first answer is recorded as a language mistake, and the world still answers the right word');
  assert((await p.evaluate(() => !!RB.game.s.discovery.keepsakes.cork_float)), 'the Painted Cork Float');
  await shot('f2_filled');
  // cranked: ordinary, no words
  await start(...at.slice(0, 4), Object.assign({}, at[4], { words: [], comp: 'mio' }));
  await inspect('f2', 'crank', /Wind the crank/);
  assert((await st('f2')).float === 'cradle' && /Nothing holds the line/.test(await said()), 'winding without the catch: the float sinks back when you let go (explained)');
  await inspect('f2', 'crank', /Drop the catch/);
  await inspect('f2', 'crank', /Wind the crank/);
  let dd = await rec('f2');
  assert(dd.done && dd.method === 'cranked' && (await reactionText('f2')).id === 'f2.mio.cranked', 'catch, then the crank: done by "cranked"; Mio\'s line for it');
  // vane: bind (with assistance) then wind (choice)
  await start(...at.slice(0, 4), Object.assign({}, at[4], { words, input: 'choice', comp: 'suzu' }));
  r = await weave('f2', 'crank', 'nawa', 'assist');
  const s2 = await st('f2');
  const lg2 = (await rec('f2')).log.filter((x) => x.lang).pop();
  assert(r.result === 'effective' && s2.bound && s2.catch === 'on' && lg2.lang.assisted, 'an assisted Bind still binds the crank and sets the catch (recorded as assisted)');
  r = await weave('f2', 'post', 'kaze', 'choice', { frames: 6, frameName: 'f2_vane_anim' });
  dd = await rec('f2');
  assert(r.result === 'complete' && dd.done && dd.method === 'vane' && dd.state.bound === false && dd.state.catch === 'on', 'Wind on the vane lifts the float; the cord lets go and the catch holds (vane)');
  assert((await p.evaluate(() => Object.keys(RB.game.s.discovery.keepsakes).join())) === 'cork_float' && (await reactionText('f2')).id === 'f2.suzu.vane', 'assisted completion: the same keepsake, Suzu\'s line for the vane');
  await shot('f2_vane');
});

// ==== F3: ordinary, woven, and mixed ===================================================================================
await section('F3 The Maker\'s Mark', async () => {
  const go = (comp) => start('co.glass', 12, 7, 'left', { words, input: 'choice', comp });
  await go('ren');
  let r = await weave('f3', 'tray', 'honoo', 'choice');
  assert(r.result === 'neutral' && (await st('f3')).support === 'none', 'fire on a finished piece is declined (' + (await said(1)).slice(6, 70) + '…)');
  await inspect('f3', 'peg', /Slide a wedge/);
  await inspect('f3', 'lamp', /Swing the lamp's arm down/);
  let d = await rec('f3');
  assert(d.done && d.method === 'ordinary' && /co_isao: .*leaf/i.test(await said()), 'wedge and low lamp: the leaf is read (ordinary); Isao names Hiro');
  await shot('f3_ordinary');
  await go('nao');
  r = await weave('f3', 'tray', 'ishi', 'choice');
  assert(r.result === 'effective' && (await st('f3')).support === 'stone', 'Stone under the short foot steadies the tray');
  r = await weave('f3', 'tray', 'hikari', 'choice');
  d = await rec('f3');
  assert(r.result === 'complete' && d.method === 'woven', 'woven light from the side: the mark shows (woven)');
  await shot('f3_woven');
  await go('suzu');
  await inspect('f3', 'peg', /Slide a wedge/);
  await weave('f3', 'tray', 'hikari', 'choice');
  d = await rec('f3');
  assert(d.done && d.method === 'mixed' && (await reactionText('f3')).id === 'f3.suzu.mixed', 'wedge and woven light: done by "mixed"');
  await go('mio');
  await weave('f3', 'tray', 'tsuchi', 'choice');
  await inspect('f3', 'lamp', /Swing the lamp's arm down/);
  d = await rec('f3');
  assert(d.done && d.method === 'mixed' && d.log.some((x) => x.w === 'tsuchi' && x.lang && x.lang.mode === 'choice') && d.state.support === 'peg', 'Earth (stone family) and the low lamp: also "mixed"; afterwards the workshop\'s own wedge holds it');
});

// ==== F4: wrong boxes explain themselves; flame or cloth =====================================================================
await section('F4 The Frozen Parcel Box', async () => {
  await start('sb.hamlet', 34, 30, 'up', { words, input: 'choice', comp: 'nao' });
  await inspect('f4', 'b', /Open box ②/);
  const fz = await said();
  assert(/frozen shut/.test(fz) && !(await st('f4')).found, 'a frozen door will not open (explained)' + (/frozen shut/.test(fz) ? '' : ': ' + fz));
  await inspect('f4', 'cloth', /warm cloth/);
  assert((await st('f4')).frost === 'off', 'the warm cloth clears the frost from the cover');
  await inspect('f4', 'a', /Open box ①/);
  assert(/Collected/.test(await said()), 'box ① says why not (already collected)');
  await inspect('f4', 'b', /Open box ②/);
  assert(/Please leave/.test(await said()), 'box ② says why not');
  const hid = await p.evaluate(() => { window.__standBy('f4', 'cover'); return true; });
  void hid;
  await p.keyboard.press('KeyV');
  await p.waitForSelector('.weave-sheet:not(.hidden)');
  assert(await p.evaluate(() => document.querySelector('.weave-sheet [data-a=reset]').classList.contains('hidden')), 'no Reset for the frost (it does not come back)');
  await p.keyboard.press('Escape');
  await inspect('f4', 'c', /Open box ③/);
  let d = await rec('f4');
  assert(d.done && d.method === 'cloth' && (await p.evaluate(() => !!RB.game.s.discovery.keepsakes.snow_toggle)), 'box ③ (the round stamp, no name): the Snowflake Toggle (cloth)');
  await shot('f4_cloth');
  await start('sb.hamlet', 34, 30, 'up', { words, input: 'choice', comp: 'ren' });
  const r = await weave('f4', 'cover', 'koori', 'choice');
  assert(r.result === 'neutral' && (await st('f4')).frost === 'on', 'Ice on frost does nothing useful (neutral)');
  await weave('f4', 'cover', 'honoo', 'choice');
  await inspect('f4', 'c', /Open box ③/);
  d = await rec('f4');
  assert(d.done && d.method === 'flame' && (await reactionText('f4')).id === 'f4.ren.flame', 'Fire at the warming plate, then box ③ (flame)');
});

// ==== F5: the sound goes where the channels send it =========================================================================
await section('F5 The Bell That Rings the Wrong Room', async () => {
  await start('lf.gardens', 18, 15, 'up', { words, input: 'choice', comp: 'mio' });
  await inspect('f5', 'alcove', /Strike the chime/);
  assert((await st('f5')).sent === 'nook' && /nook|reading/i.test(await said()), 'as found, the chime sounds in the reading nook (explained)');
  await inspect('f5', 'B', /Flip the flap/);
  await inspect('f5', 'alcove', /Strike the chime/);
  let d = await rec('f5');
  assert(d.done && d.method === 'struck' && d.state.sent === 'display', 'flap over, then the chime struck by hand: the display niche answers (struck)');
  await inspect('f5', 'alcove', /Strike the chime/);
  assert((await rec('f5')).done && /display|flower/i.test(await said()), 'the chime can still be struck afterwards');
  await start('lf.gardens', 18, 15, 'up', { words, input: 'choice', comp: 'ren' });
  await inspect('f5', 'mL', /Let the curtain down/);
  await inspect('f5', 'mR', /Roll the curtain up/);
  const r = await weave('f5', 'alcove', 'suzu', 'choice', { frames: 5, frameName: 'f5_bell_anim' });
  d = await rec('f5');
  assert(r.result === 'complete' && d.method === 'rung' && (await reactionText('f5')).id === 'f5.ren.rung', 'left curtain down, right up, Bell woven at the chime: display (rung)');
  await shot('f5_rung');
  await start('lf.gardens', 18, 15, 'up', { words, input: 'choice', comp: 'suzu' });
  await inspect('f5', 'B', /Flip the flap/);
  await weave('f5', 'alcove', 'koe', 'choice');
  d = await rec('f5');
  assert(d.done && d.method === 'rung', 'Voice (the bell family) through the cross tube also rings the display (rung)');
});

// ==== F6: marks by light or rubbing, then the filing sheet =====================================================================
await section('F6 The Index That Files Itself Wrong', async () => {
  // not offered during the descent
  await start('sa.hut', 9, 5, 'up', { words, input: 'choice', comp: 'suzu', flags: { sa_descent: true } });
  assert(!(await p.evaluate(() => RB.weave.available())) && !(await p.evaluate(() => RB.fieldweave.eligible(RB.game.s, 'f6'))), 'during the descent the index box is not a puzzle (and nothing is offered)');
  await start('sa.hut', 9, 5, 'up', { words, input: 'hand', comp: 'suzu' });
  const r = await weave('f6', 'slips', 'hikari', 'hand');
  assert(r.result === 'effective' && (await st('f6')).marks === 'shown', 'Light (written by hand) raises the pressed stamps');
  await inspect('f6', 'box', /File the slips/);
  await p.waitForSelector('.arrange-sheet');
  // a wrong placement first, checked against the rule
  await p.click('.arrange-sheet [data-k="s2"][data-f="up"]');
  await p.click('.arrange-sheet [data-a=check]');
  const fb = await p.evaluate(() => [...document.querySelectorAll('.ar-list li')].map((l) => l.className + ':' + l.querySelector('.en').textContent));
  assert(fb.some((x) => /^no:.*notch/.test(x)), 'the check names the visible rule a placement breaks (the notch)');
  await shot('f6_sheet_check');
  await p.click('.arrange-sheet [data-k="s1"][data-f="down"]');
  await p.click('.arrange-sheet [data-k="s3"][data-f="up"]');
  await p.click('.arrange-sheet [data-k="s2"][data-f="held"]');
  await settle();
  let d = await rec('f6');
  assert(d.done && d.method === 'lit' && (await p.evaluate(() => !!RB.game.s.discovery.keepsakes.paperweight)) && !(await p.evaluate(() => !!document.querySelector('.arrange-sheet'))), 'filed by the rule: the sheet closes, done (lit), the Pocket Paperweight');
  await start('sa.hut', 9, 5, 'up', { words: [], input: 'choice', comp: 'mio' });
  await inspect('f6', 'slips', /Lay thin paper/);
  await inspect('f6', 'slips', /File the slips/);
  await p.waitForSelector('.arrange-sheet');
  for (const [k, f] of [['s3', 'up'], ['s2', 'held'], ['s1', 'down']]) await p.click('.arrange-sheet [data-k="' + k + '"][data-f="' + f + '"]');
  await settle();
  d = await rec('f6');
  assert(d.done && d.method === 'rubbed' && (await reactionText('f6')).id === 'f6.mio.rubbed', 'charcoal rubbing, filed in another order: done (rubbed), with no words at all');
});

// ==== phone: touch Weave, docking clear of the target, tap-to-select ==============================================
await section('phone: touch and docking', async () => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(url);
  await pg.waitForFunction(() => window.__RB_READY__ === true);
  const old = p; p = pg;
  try {
    await helpers();
    await start('rw.village', 32, 23, 'up', { words: ['mamoru', 'mizu', 'hikari'], input: 'choice', comp: 'mio' });
    await pg.waitForTimeout(250);
    const vis = await pg.evaluate(() => { const bb = document.querySelector('.touchpad .tp-weave'); return bb && !bb.classList.contains('hidden') && bb.getBoundingClientRect().width >= 44; });
    assert(vis, 'the touch pad shows a Weave button (at least 44 px)');
    await pg.tap('.touchpad .tp-weave');
    await pg.waitForSelector('.weave-sheet:not(.hidden)');
    const geo = await pg.evaluate(() => {
      const r = document.querySelector('.weave-sheet').getBoundingClientRect();
      const a = RB.render.tileToCss(32, 21.4), bb = RB.render.tileToCss(34, 23), pl = RB.render.tileToCss(32, 23), pl2 = RB.render.tileToCss(33, 24);
      const hit = (x0, y0, x1, y1) => !(x1 < r.left || x0 > r.right || y1 < r.top || y0 > r.bottom);
      return { top: document.querySelector('.weave-sheet').classList.contains('top'), overTarget: hit(a.x, a.y, bb.x, bb.y), overPlayer: hit(pl.x, pl.y, pl2.x, pl2.y), w: r.width, sw: document.documentElement.scrollWidth };
    });
    assert(!geo.overTarget && !geo.overPlayer && geo.sw <= 390, 'the sheet docks ' + (geo.top ? 'above' : 'below') + ' clear of the screen and the player, no sideways scroll');
    await pg.screenshot({ path: path.join(OUT, 'sheet_phone.png') });
    // tap the clamp in the world
    const pt = await pg.evaluate(() => { const a = RB.render.tileToCss(33, 22), bb = RB.render.tileToCss(34, 23); return { x: (a.x + bb.x) / 2, y: (a.y + bb.y) / 2 }; });
    await pg.touchscreen.tap(pt.x, pt.y);
    assert((await pg.evaluate(() => RB.weave.state().sel)) === 'f1.clamp', 'tapping the clamp in the world selects it');
    await pg.tap('.weave-sheet [data-t="0"]');
    await pg.tap('.weave-sheet .wv-w[data-w="mamoru"]');
    await pg.waitForSelector('.chal .mc .choice');
    await pg.screenshot({ path: path.join(OUT, 'challenge_phone.png') });
    await answer('mamoru', 'choice');
    await settle();
    assert((await st('f1')).held === true, 'woven by touch: the ward holds the screen');
    assert(!errs.length, 'no page errors on the phone (' + errs.slice(0, 2).join(' | ') + ')');
  } finally { p = old; await ctx.close(); }
});

// ==== reduced motion: shorter, the same result ===================================================================
await section('reduced motion', async () => {
  await start('rw.village', 32, 23, 'up', { words: ['mamoru'], input: 'choice', comp: 'mio', still: true });
  const t1 = Date.now();
  const r = await weave('f1', 'screen', 'mamoru', 'choice');
  assert(r.result === 'effective' && (await st('f1')).held && (await p.evaluate(() => RB.game.reducedMotion())), 'with reduced motion the same step happens (' + (Date.now() - t1) + ' ms with answering)');
});

assert(!errors.length, 'no console or page errors' + (errors.length ? ': ' + errors.slice(0, 4).join(' | ') : ''));
console.log('\n' + (n - fail) + '/' + n + ' checks passed in ' + Math.round((Date.now() - t0) / 1000) + ' s' + (fail ? ' — ' + fail + ' FAILED' : ''));
await b.close();
srv.close();
process.exit(fail ? 1 : 0);
