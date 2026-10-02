// Shared helpers for Practice suite A's browser tests (practice_a_lamps.mjs,
// practice_a_desk.mjs, practice_a_layout.mjs): synthetic campaigns started at the
// Lantern Hall or the Gull, real pointer strokes (mouse moves, or touch through the
// DevTools protocol so the page receives genuine touch pointer events), choosing a
// dialogue reply by clicking it, layout checks, and captures.
import fs from 'node:fs';
import path from 'node:path';
import { root } from './lib.mjs';

export const SHOTS = path.join(root, 'docs/screenshots/practice_a');
fs.mkdirSync(SHOTS, { recursive: true });
export const OUT = path.join(root, 'tests/e2e/out/practice_a');
fs.mkdirSync(OUT, { recursive: true });

export const wait = (p, ms) => p.waitForTimeout(ms);
export const phone = (w, h) => ({ viewport: { width: w, height: h }, touch: true, mobile: true, dpr: 2 });

// A campaign after Chapter 1 standing before the practice lamps (8,2 facing the rack at 9,2)
// or at the Gull's small table (9,6 facing down to 9,7). items: learning records to start with.
export async function start(p, o = {}) {
  await p.evaluate((o) => {
    if (RB.ui.menu.isOpen()) RB.ui.menu.close();
    const at = o.at === 'desk' ? ['sg.inn', 9, 6, 'down'] : o.at === 'village' ? ['rw.village', 22, 30, 'up'] : ['rw.hall', 8, 2, 'right'];
    const s = RB.game.debugStart(at[0], at[1], at[2], { comp: o.comp || 'mio', dir: at[3], flags: Object.assign({ ch1_done: true, departed: true, rw_echo_done: true, rw_hall_gather: true }, o.flags || {}) });
    RB.game.settings.textSpeed = 'instant';
    RB.game.settings.input = o.input || 'hand';
    RB.game.settings.textScale = o.text || 1;
    RB.game.applySettings();
    s.learn.profile = o.profile || 'E';
    s.learn.kanaKnown = 'both';
    s.chapter = o.chapter || 2;
    s.visited = { 'rw.village': true, 'rw.hall': true, 'sg.harbor': true, 'sg.inn': true };
    for (const id of o.items || []) RB.learn.record(id, { ok: true, mode: 'choice' });
    // the companionship records catch up with the synthetic flags now (the first scene's end
    // would do it otherwise), so before/after comparisons see only what the activity did
    if (RB.company && RB.company.settle) RB.company.settle();
    window.__records = [];
    if (!window.__spied) {
      window.__spied = true;
      const real = RB.learn.record;
      RB.learn.record = function (id, r) { window.__records.push({ id, ok: r.ok, mode: r.mode, assisted: !!r.assisted, ctx: r.ctx }); return real.apply(this, arguments); };
    }
  }, o);
  await wait(p, 250);
}
// Save the synthetic campaign to a slot so autosaves have somewhere to go (never a player's save:
// a fresh browser profile).
export async function useSlot(p, slot) {
  await p.evaluate(async (slot) => { RB.save.setCurrent(slot, 0); await RB.save.writeSlot(slot, RB.game.s, { force: true }); }, slot);
}

// Interact with what the player faces, then click the dialogue reply whose text matches.
export async function interactAndChoose(p, re) {
  await p.evaluate(() => RB.world.interact());
  // read the narration (Next) until the replies are offered
  for (let i = 0; i < 30; i++) {
    const st = await p.evaluate((src) => ({ has: [...document.querySelectorAll('button.choice')].some((b) => new RegExp(src).test(b.textContent)), next: !!document.querySelector('.b-next') && !document.querySelector('button.choice') }), re.source);
    if (st.has) break;
    if (st.next && i % 2 === 1) await p.evaluate(() => { const n = document.querySelector('.b-next'); if (n) n.click(); });
    await wait(p, 150);
  }
  const box = await p.evaluate((src) => { const b = [...document.querySelectorAll('button.choice')].find((x) => new RegExp(src).test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, re.source);
  if (!box) throw new Error('no reply matching ' + re);
  await p.mouse.click(box.x, box.y);
}

// The reference strokes of a character mapped onto an element's box (inset like a writer
// leaves a margin), with intermediate points as a hand would move.
export async function strokesFor(p, ch, sel, inset = 0.12) {
  return p.evaluate(([c, s, k]) => {
    const ref = RB.recog.reference(c);
    const el = document.querySelector(s);
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    // fill the square as a writer would: the character's own extent scaled to the box less the margin
    const all = ref.strokes.flat();
    const x0 = Math.min(...all.map((q) => q.x)), x1 = Math.max(...all.map((q) => q.x)), y0 = Math.min(...all.map((q) => q.y)), y1 = Math.max(...all.map((q) => q.y));
    const sz = Math.max(x1 - x0, y1 - y0) || 1, f = (1 - 2 * k) / sz;
    const ox = (1 - (x1 - x0) * f) / 2, oy = (1 - (y1 - y0) * f) / 2;
    const map = (q) => ({ x: r.left + (ox + (q.x - x0) * f) * r.width, y: r.top + (oy + (q.y - y0) * f) * r.height });
    return ref.strokes.map((st) => {
      const out = [];
      st.forEach((q, i) => {
        if (i) { const a = st[i - 1]; for (let j = 1; j < 3; j++) out.push(map({ x: a.x + (q.x - a.x) * j / 3, y: a.y + (q.y - a.y) * j / 3 })); }
        out.push(map(q));
      });
      return out;
    });
  }, [ch, sel, inset]);
}
// Draw with the mouse (real pointerdown/move/up on the canvas).
export async function drawMouse(p, ch, sel, inset) {
  const strokes = await strokesFor(p, ch, sel, inset);
  for (const st of strokes) {
    await p.mouse.move(st[0].x, st[0].y);
    await p.mouse.down();
    for (const q of st.slice(1)) await p.mouse.move(q.x, q.y);
    await p.mouse.up();
    await wait(p, 30);
  }
  await wait(p, 300);
  return strokes.length;
}
// Draw with touch (touchStart/Move/End through the DevTools protocol: the page sees touch
// pointers, pointerType "touch").
export async function drawTouch(p, ch, sel, inset) {
  const strokes = await strokesFor(p, ch, sel, inset);
  const cdp = await p.context().newCDPSession(p);
  for (const st of strokes) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: st[0].x, y: st[0].y }] });
    for (const q of st.slice(1)) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: q.x, y: q.y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await wait(p, 30);
  }
  await cdp.detach();
  await wait(p, 300);
  return strokes.length;
}
// Click (or tap) an element by selector at its centre, scrolled into view.
export async function press(p, sel, how) {
  // scrolled into view at once (no smooth scrolling under the pointer), then the centre of what shows
  const ok = await p.evaluate((s) => { const el = document.querySelector(s); if (!el) return false; el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }); return true; }, sel);
  if (!ok) throw new Error('nothing to press: ' + sel);
  await wait(p, 60);
  // the first point of it that is really on top (a tab half under a rail's arrow is pressed on its visible part)
  const pt = await p.evaluate((s) => {
    const el = document.querySelector(s); if (!el) return null;
    const r = el.getBoundingClientRect(), y = r.top + r.height / 2;
    const xs = [0.5, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9].map((f) => r.left + r.width * f);
    for (const x of xs) { const t = document.elementFromPoint(x, y); if (t && (t === el || el.contains(t))) return { x, y }; }
    return { x: r.left + r.width / 2, y };
  }, sel);
  if (!pt) throw new Error('nothing to press: ' + sel);
  if (how === 'touch') await p.touchscreen.tap(pt.x, pt.y);
  else await p.mouse.click(pt.x, pt.y);
}

// Anything wider than the screen under a root (rt and screen-reader text aside).
export async function overflow(p, rootSel) {
  return p.evaluate((rs) => {
    const W = innerWidth, out = [];
    if (document.documentElement.scrollWidth > W + 1) out.push('page ' + document.documentElement.scrollWidth);
    for (const el of document.querySelectorAll(rs + ' *')) {
      if (el.closest('.sr') || el.matches('rt, rt *, option, optgroup')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || !el.getClientRects().length) continue;
      const q = el.getBoundingClientRect();
      if (!(q.width && q.height && (q.right > W + 1 || q.left < -1))) continue;
      // inside a container that clips or scrolls sideways (a tab rail), and that container is on screen: not overflow
      let clip = null;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { if (a.namespaceURI === 'http://www.w3.org/2000/svg') continue; const ox = getComputedStyle(a).overflowX; if (ox !== 'visible') { clip = a; break; } }
      if (clip) { const r = clip.getBoundingClientRect(); if (r.left >= -1 && r.right <= W + 1) continue; }
      out.push((typeof el.className === 'string' && el.className ? el.className : el.tagName) + ' ' + Math.round(q.left) + '..' + Math.round(q.right));
    }
    return out.slice(0, 8);
  }, rootSel);
}
// Principal controls smaller than the 44×44 target.
export async function smallTargets(p, sel) {
  return p.evaluate((s) => [...document.querySelectorAll(s)].filter((e) => e.offsetParent)
    .map((e) => { const r = e.getBoundingClientRect(); return [e.getAttribute('data-pa') || e.getAttribute('data-dk') || e.getAttribute('data-card') || e.className, Math.round(r.width), Math.round(r.height)]; })
    .filter(([, w, h]) => w < 43.5 || h < 43.5).slice(0, 6), sel);
}
// Suite B's proofreading page, in the shape docs/practice/suite_b.md gives, and — until suite B is
// merged into this build — a stand-in for its memento source with the same list item shape
// (on a merged build its own source is there and the stand-in is not added).
export const PROOF_PAGE = { id: 'proof:P01:E', kind: 'proof', mode: 'proof', typeset: { task: 'P01', lv: 'E', lines: ['{右|みぎ} の {戸|と} から {入|はい}って ください 。'], title: { jp: '{戸|と}', en: 'Which door?' } }, label: 'Which door?', saved: false, created: 1000, updated: 1000 };
export async function proofSource(p) {
  return p.evaluate(() => {
    const has = RB.practice.mementos(RB.game.s).some((m) => m.source === 'proof');
    if (!has) RB.practice.addMementoSource({ id: 'proof', order: 60, list: (s) => RB.practiceDesk.pages(s, 'proof').map((pg) => ({ id: pg.id, kind: 'proof', title: { jp: pg.typeset.title.jp, en: pg.label }, note: 'A proofreading page, typeset in the game\'s lettering (not handwriting).', html: () => '<div class="pb-kept">' + pg.typeset.lines.map((l) => '<p>' + RB.ui.jhtml(l) + '</p>').join('') + '</div>' })) });
    return has ? 'suite B' : 'stand-in';
  });
}
export async function shot(p, name) {
  await p.screenshot({ path: path.join(SHOTS, name + '.png') });
}
