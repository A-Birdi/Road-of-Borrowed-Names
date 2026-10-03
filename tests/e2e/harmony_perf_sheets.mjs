// Frame sheets of Nao's and Mio's Harmony stage performances (evidence for the owner's "a tad lacking"
// review, docs/screenshots/harmony/cutin/perf_v2/): a synthetic campaign in the Mill (the Flour Moth, 6 knots,
// Harmony full), the portrait Off so the stage is seen alone, the presentation clock slowed ×0.25 so each
// sampled moment is exact; the stage (the party and the creature) cropped at each moment and laid out in a
// labelled sheet. Mio's fixture puts you below full and gives the creature Heat, mist and Gathering, so each
// of her beats has something real to show.
// Usage: node tests/e2e/harmony_perf_sheets.mjs [--html path/relative/to/root.html] [--tag after]
//        [--vp 1280x720,390x844] [--comps nao,mio] [--out dir] [--reduce] (reduced motion)
//        [--check] (no sheets: the status marks through the performance and the pet's reaction, see below)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const html = opt('html', 'index.html');
const tag = opt('tag', 'after');
const vps = opt('vp', '1280x720,390x844').split(',').map((s) => s.split('x').map(Number));
const comps = opt('comps', 'nao,mio').split(',');
const out = path.resolve(root, opt('out', 'docs/screenshots/harmony/cutin/perf_v2'));
const reduce = args.includes('--reduce');
fs.mkdirSync(out, { recursive: true });
const NAME = { nao: 'Nao', mio: 'Mio', ren: 'Ren', suzu: 'Suzu' };
const wait = (p, ms) => p.waitForTimeout(ms);
const waitSel = (p, sel, o) => p.waitForSelector(sel, o).then((h) => { if (h) return h.dispose(); });
const assert = (c, m) => { if (!c) throw new Error(m); };

async function toCards(p) {
  for (let i = 0; i < 800; i++) {
    const s = await p.evaluate(() => ({ r: window.__result, dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !document.querySelector('.chal') && !RB.battleSeq.busy() && RB.combat.phase() === 'choose' }));
    if (s.cards || s.r) return s;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await wait(p, 25);
  }
  throw new Error('no decision came');
}
async function setup(p, o) {
  await p.evaluate(() => { const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__lastStep = step; return run(step, o); }; const L = RB.combatLogic, init = L.init; L.init = function (...a) { const st = init.apply(this, a); if (window.__onInit) window.__onInit(st); return st; }; });
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp, flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.learn.difficulty = 'normal';
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    if (o.pet) { RB.pets.meet(s, o.pet); RB.pets.select(s, o.pet); }
    Object.assign(RB.game.settings, { input: 'choice', textSpeed: 'normal', battleAnim: 'normal', reducedMotion: !!o.reduce, battleControls: 'adaptive', intentDisplay: 'adaptive', harmonyFlourish: !!o.flourish, petBattle: true, textScale: 1 });
    RB.game.applySettings();
    RB.battleSeq.setTimeScale(o.timeScale || 0.25);
    window.__onInit = (st) => {
      st.harmony = st.harmonyMax;
      for (const f of st.foes) { f.knots = f.maxKnots = 6; if (o.cond) Object.assign(f, o.cond); }
      st.knots = st.maxKnots = 6;
      if (o.cond) Object.assign(st, o.cond);
      if (o.pc != null) st.pc = o.pc;
      if (o.ward) st.ward = Object.assign({}, st.ward, o.ward);
    };
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    window.__result = null;
    RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'ps:' + Math.random() }).then((r) => { window.__result = r || 'done'; });
  }, o);
  await toCards(p);
}
async function commit(p, comp) {
  const i = await p.evaluate((m) => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && new RegExp(m, 'i').test(x.textContent.replace(/\s+/g, ' '))); return c ? c.getAttribute('data-i') : null; }, 'With ' + NAME[comp]);
  assert(i != null, 'no technique card for ' + comp);
  await p.evaluate((i) => { const el = document.querySelector('.rcard[data-i="' + i + '"]'); el.scrollIntoView({ block: 'center' }); el.click(); }, i);
  await waitSel(p, '.chal .mc .btn', { timeout: 10000 });
  const idx = await p.evaluate(() => {
    const st = window.__lastStep, bs = [...document.querySelectorAll('.chal .mc .btn')];
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
    const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
    const k = bs.findIndex((x) => right.some((r) => txt(x) === r.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))));
    if (k >= 0) { bs[k].setAttribute('data-right', '1'); bs[k].scrollIntoView({ block: 'center' }); }
    return k;
  });
  assert(idx >= 0, 'the right option is on screen');
  await p.click('.chal .mc .btn[data-right="1"]');
  await waitSel(p, '.fbwrap .fb-go', { timeout: 10000 });
  await p.evaluate(() => document.querySelector('.fbwrap .fb-go').scrollIntoView({ block: 'center' }));
  await p.click('.fbwrap .fb-go');
  await waitSel(p, '.ccard', { timeout: 8000 });
  await wait(p, 300);
  // (evidence, not a click test: anything over the menu — a line of dialogue, the first-time note — is read
  // and closed first, then the choice is pressed)
  for (let i = 0; i < 200 && !(await p.evaluate(() => RB.battleSeq.current() && RB.battleSeq.current().kind === 'player')); i++) {
    await p.evaluate(() => {
      if (RB.ui.dialogue.isOpen()) { RB.ui.dialogue.advance(true); return; }
      const ok = document.querySelector('[data-coach-ok]');
      if (ok) { ok.click(); return; }
      const c = [...document.querySelectorAll('.ccard')].find((x) => !x.disabled && /Join/i.test(x.textContent));
      if (c) c.click();
    });
    await wait(p, 60);
  }
  await p.waitForFunction(() => RB.battleSeq.current() && RB.battleSeq.current().kind === 'player', null, { timeout: 8000, polling: 'raf' });
}

const { srv, url } = await serve();
const b = await launch();
// --check: no sheets — the technique played once per companion at Normal in real time (portrait On, a pet in
// battle, a ward before each of you so the status marks are drawn throughout), every animation frame recorded:
// the status marks drawn through every pose of the performance and anchored on the figure (the chest between
// the head and the feet, near the figure's own foot point), and the pet's reaction to the technique
if (args.includes('--check')) {
  const res = {};
  let bad = 0;
  for (const comp of comps) {
    const { p, errors, ctx } = await page(b, url + html, { viewport: { width: 1280, height: 720 } });
    await setup(p, Object.assign(comp === 'mio' ? { comp, pc: 7, cond: { heat: 2, shroud: true, charged: true } } : { comp }, { reduce, flourish: true, timeScale: 1, pet: 'cat', ward: { pc: 2, comp: 2 } }));
    await p.evaluate(() => {
      const R = (window.__CK = { rows: [], pet0: JSON.stringify((((RB.battlePets.stats().stats || {}).families) || {})) });
      const tick = () => { const st = RB.combat.debug().stage, f = st && st.frame, cur = RB.battleSeq.current(); if (f && cur && cur.kind === 'player') R.rows.push({ pt: cur.t, poses: Object.assign({}, f.poses), marks: (f.marks || []).slice(), a: { comp: st.anchors.comp && { head: st.anchors.comp.head, chest: st.anchors.comp.chest, feet: st.anchors.comp.feet }, pc: st.anchors.pc && { head: st.anchors.pc.head, chest: st.anchors.pc.chest, feet: st.anchors.pc.feet } } }); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await commit(p, comp);
    for (let i = 0; i < 400 && (await p.evaluate(() => RB.battleSeq.busy())); i++) await wait(p, 25);
    const r = await p.evaluate(() => ({ rows: window.__CK.rows, pet0: JSON.parse(window.__CK.pet0), pet1: ((RB.battlePets.stats().stats || {}).families) || {} }));
    const perf = r.rows.filter((x) => /^(anticipate|act|recover):/.test(x.poses.comp || ''));
    const withWards = perf.filter((x) => x.marks.includes('ward:comp:2') && x.marks.includes('ward:pc:2'));
    const off = perf.filter((x) => { const A = x.a.comp; return !A || !(A.head.y < A.chest.y && A.chest.y < A.feet.y) || Math.abs(A.chest.x - A.feet.x) > 40; });
    const poses = [...new Set(perf.map((x) => x.poses.comp))];
    const tech = (r.pet1.technique || 0) - (r.pet0.technique || 0);
    res[comp] = { frames: r.rows.length, performanceFrames: perf.length, wardsDrawn: withWards.length, anchorsOff: off.length, poses, petTechniqueReactions: tech, errors };
    const ok = perf.length > 20 && withWards.length === perf.length && !off.length && tech >= 1 && !errors.length;
    if (!ok) bad++;
    console.log((ok ? 'ok ' : 'NOT OK ') + comp + ': ' + JSON.stringify(res[comp]));
    await ctx.close();
  }
  await b.close(); srv.close();
  fs.writeFileSync(path.join(root, 'tests', 'e2e', 'out', 'harmony_perf_check.json'), JSON.stringify(res, null, 1));
  process.exit(bad ? 1 : 0);
}
const made = [];
for (const comp of comps) {
  for (const [W, H] of vps) {
    const { p, errors, ctx } = await page(b, url + html, { viewport: { width: W, height: H } });
    await setup(p, Object.assign(comp === 'mio' ? { comp, pc: 7, cond: { heat: 2, shroud: true, charged: true } } : { comp }, { reduce }));
    await commit(p, comp);
    // the stage: the party and the creature (with its knots), in CSS px
    const box = await p.evaluate(() => {
      const st = RB.battleStage.stats(), cp = st.cssPerArt, L = st.lay, f = L.foes[0];
      const x0 = Math.min(L.party.x, f.left) * cp - 16, y0 = Math.min(L.party.y, f.top) * cp - 30;
      const x1 = Math.max(L.party.x + L.party.w, f.right) * cp + 16, y1 = Math.max(L.party.y + L.party.h, f.bottom, f.ky) * cp + 12;
      const X0 = Math.max(0, Math.round(x0)), Y0 = Math.max(0, Math.round(y0));
      return { x: X0, y: Y0, width: Math.min(innerWidth, Math.round(x1)) - X0, height: Math.min(innerHeight, Math.round(y1)) - Y0 };
    });
    const T = await p.evaluate((c) => RB.partyChoreo.TECH[c], comp);
    const sig = T.pAt + T.pAnt;
    const times = [0, 300, T.pAt + T.pAnt * 0.5, sig, sig + T.pAct * 0.2, sig + T.pAct * 0.4, sig + T.pAct * 0.6, sig + T.pAct, T.contact, T.contact + 120, T.contact + 300, T.contact + 480, T.rec + 60 + T.recD * 0.5, T.end - 20].map(Math.round).sort((x, y) => x - y).filter((x, i, a) => !i || x - a[i - 1] >= 40);
    const shots = [];
    for (const tt of times) {
      await p.waitForFunction((tt) => { const c = RB.battleSeq.current(); return !c || c.t >= tt; }, tt, { timeout: 30000, polling: 'raf' });
      const at = await p.evaluate(() => (RB.battleSeq.current() || {}).t);
      shots.push({ label: at == null ? 'end' : at + ' ms', png: await p.screenshot({ clip: box }) });
    }
    // a sheet: cells at their native size (pixel art is never resampled), 7 to a row on a desktop crop, fewer
    // for a tall phone crop; webp, re-encoded smaller until it is under about 300 KB
    const cols = box.width > box.height ? 4 : 7;
    let q = 0.86, data = null, bytes = 0;
    for (; q > 0.3; q -= 0.08) {
      data = await p.evaluate(async ([urls, labels, cols, q, title]) => {
        const imgs = await Promise.all(urls.map((u) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = u; })));
        const w = imgs[0].width, h = imgs[0].height, lab = 18, gap = 4, head = 22, rows = Math.ceil(imgs.length / cols);
        const cv = document.createElement('canvas'); cv.width = cols * (w + gap) + gap; cv.height = head + rows * (h + lab + gap) + gap;
        const g = cv.getContext('2d'); g.fillStyle = '#1c1a26'; g.fillRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false;
        g.fillStyle = '#efe4c8'; g.font = '600 13px system-ui, sans-serif'; g.fillText(title, gap + 2, 15);
        imgs.forEach((im, i) => { const x = gap + (i % cols) * (w + gap), y = head + Math.floor(i / cols) * (h + lab + gap); g.drawImage(im, x, y); g.fillStyle = '#efe4c8'; g.font = '600 12px system-ui, sans-serif'; g.fillText(labels[i], x + 4, y + h + 13); });
        return cv.toDataURL('image/webp', q);
      }, [shots.map((s) => 'data:image/png;base64,' + s.png.toString('base64')), shots.map((s) => s.label), cols, q, NAME[comp] + ' — ' + tag + ' — ' + W + '×' + H + (reduce ? ' — reduced motion' : '') + ' — portrait Off, presentation ms']);
      bytes = Buffer.from(data.split(',')[1], 'base64').length;
      if (bytes < 300 * 1024) break;
    }
    const dst = path.join(out, comp + '_' + tag + '_' + W + 'x' + H + '.webp');
    fs.writeFileSync(dst, Buffer.from(data.split(',')[1], 'base64'));
    made.push({ file: path.relative(root, dst), bytes, times, box });
    await p.evaluate(() => RB.battleSeq.setTimeScale(4));
    for (let i = 0; i < 400 && (await p.evaluate(() => RB.battleSeq.busy())); i++) await wait(p, 25);
    if (errors.length) console.log('page errors (' + comp + ' ' + W + 'x' + H + '): ' + errors.join('; '));
    await ctx.close();
    console.log('wrote ' + path.relative(root, dst) + ' (' + Math.round(bytes / 1024) + ' KB)');
  }
}
await b.close(); srv.close();
fs.writeFileSync(path.join(out, 'sheets_' + tag + '.json'), JSON.stringify({ html, tag, made }, null, 1));
