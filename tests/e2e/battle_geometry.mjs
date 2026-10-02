// Battle geometry (battle addendum §12.3, §22.2) measured on the built index.html in Chromium,
// in synthetic campaigns (fixtures: the Mill's Flour Moth, a party placed in the room — a
// diagnostic placement, not proof of reaching it). For each scene it records, in CSS px:
//   - the canvas and the actors' stage (the grid cell the actors are laid out in)
//   - every visible UI surface over the scene (occluders) and the UNION of the area they cover
//     (rasterised on a 4 px grid, so overlaps are not counted twice)
//   - the decision-safe and action-safe rectangles: the largest rectangle of scene not covered
//     by any UI surface, while choosing (decision view) and while an exchange plays (action view)
//   - the party slip (Resolve and Harmony), the banner when present, and how much of each actor's
//     box any UI surface covers in each view
//   - the status inset on the language sheet
// Targets (§22.2, at 100 % text, no keyboard): action-safe height ≥ 300 at 390×844, ≥ 240 at
// 320×640. Simulated conditions are labelled: a reduced viewport stands in for an on-screen
// keyboard; safe-area insets cannot be simulated in headless Chromium and are not claimed.
// With --shots <dir> it runs only the narrow, landscape-phone, large-text and Japanese-led scenes and
// saves a WebP still of each view (decision, language, action) there; the measurements are the same.
// Usage: node tests/e2e/battle_geometry.mjs [--out tests/e2e/out/battle_geometry.json] [--doc docs/battle/GEOMETRY.md] [--shots dir] [filter]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page } from './lib.mjs';

const args = process.argv.slice(2);
const outAt = args.indexOf('--out');
const OUT = outAt >= 0 ? args[outAt + 1] : 'tests/e2e/out/battle_geometry.json';
const docAt = args.indexOf('--doc');
const DOC = docAt >= 0 ? args[docAt + 1] : null;
const shotAt = args.indexOf('--shots');
const SHOTS = shotAt >= 0 ? args[shotAt + 1] : null;
const only = args.filter((a, i) => !a.startsWith('--') && ![outAt, docAt, shotAt].some((k) => k >= 0 && i === k + 1))[0];
const { srv, url } = await serve();
const b = await launch();
const VIEWS = [[320, 640], [390, 844], [412, 915], [844, 390], [768, 1024], [1366, 768], [1440, 900], [1920, 1080]];
const scenes = [];
for (const [w, h] of VIEWS) {
  scenes.push({ name: `${w}x${h} one creature, alone`, w, h, comp: null, foes: 1 });
  scenes.push({ name: `${w}x${h} three creatures, with Mio`, w, h, comp: 'mio', foes: 3 });
}
for (const sc of scenes) if (/^(320x640|390x844|844x390) three/.test(sc.name)) sc.shot = sc.name.split(' ')[0] + '_three_creatures';
scenes.push({ name: '390x844 three creatures, with Mio, 200% text', w: 390, h: 844, comp: 'mio', foes: 3, text: 2, shot: '390x844_text200' });
scenes.push({ name: '1366x768 three creatures, with Mio, 200% text', w: 1366, h: 768, comp: 'mio', foes: 3, text: 2, shot: '1366x768_text200' });
scenes.push({ name: '390x844 two creatures, with Nao, Japanese-led (profile A), long name', w: 390, h: 844, comp: 'nao', foes: 2, profile: 'A', longName: true, shot: '390x844_profileA_longname' });
scenes.push({ name: '390x500 one creature, with Suzu (SIMULATED on-screen keyboard: viewport reduced from 390x844)', w: 390, h: 500, comp: 'suzu', foes: 1, simulated: 'keyboard' });
scenes.push({ name: '390x844 one creature, with Ren, Keep visible controls', w: 390, h: 844, comp: 'ren', foes: 1, controls: 'keep' });

// measured in the page: occluders, union area, largest free rectangle (4 px grid)
function measure() {
  const vw = innerWidth, vh = innerHeight, G = 4;
  const vis = (e) => { if (!e) return false; const cs = getComputedStyle(e); if (cs.visibility !== 'visible' || cs.display === 'none' || +cs.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.right > 0 && r.bottom > 0 && r.left < vw && r.top < vh; };
  const R = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; };
  const ui = document.querySelector('.combat-ui');
  // (the creatures' plates sit on the scene: each counts, like a badge; off the scene the slip row counts whole)
  const sel = ['.cb-foe:not(.onstage)', '.cb-foe.onstage [data-foe]', '.intent', '.cb-dock', '.cb-party', '.cb-coachbox .cb-coach', '.cb-banner.on', '.cb-skip:not([hidden])', '.cb-badges .cb-ib', '#cb-icard:not([hidden])', '.chal', '.dlg:not(.hidden)', '#hud'];
  const occ = [];
  for (const s of sel) for (const e of document.querySelectorAll(s)) {
    if (s !== '.chal' && s !== '#hud' && s !== '.dlg:not(.hidden)' && ui && !ui.contains(e)) continue;
    if (vis(e)) occ.push({ sel: s, ...R(e) });
  }
  const cols = Math.ceil(vw / G), rows = Math.ceil(vh / G);
  const cov = new Uint8Array(cols * rows);
  for (const o of occ) {
    const x0 = Math.max(0, Math.floor(o.x / G)), x1 = Math.min(cols, Math.ceil((o.x + o.w) / G)), y0 = Math.max(0, Math.floor(o.y / G)), y1 = Math.min(rows, Math.ceil((o.y + o.h) / G));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) cov[y * cols + x] = 1;
  }
  let covered = 0;
  for (let k = 0; k < cov.length; k++) covered += cov[k];
  // the largest free rectangle (histogram method)
  const hist = new Int32Array(cols);
  let best = { a: 0 };
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) hist[x] = cov[y * cols + x] ? 0 : hist[x] + 1;
    const st = [];
    for (let x = 0; x <= cols; x++) {
      const hgt = x < cols ? hist[x] : 0;
      let start = x;
      while (st.length && st[st.length - 1][1] >= hgt) {
        const [sx, sh] = st.pop();
        const a = sh * (x - sx);
        if (a > best.a) best = { a, x: sx * G, y: (y - sh + 1) * G, w: (x - sx) * G, h: sh * G };
        start = sx;
      }
      st.push([start, hgt]);
    }
  }
  // the tallest free column band at least 60 % of the viewport wide (or 280 px) — the "action-safe" height
  let tall = { h: 0 };
  const minW = Math.min(cols, Math.max(Math.ceil(280 / G), Math.ceil(cols * 0.6)));
  // per row: the longest free run; a band is consecutive rows whose free runs overlap by ≥ minW
  for (let y0 = 0; y0 < rows; y0++) {
    let lo = 0, hi = cols, y = y0;
    // intersect free intervals row by row (the run containing the most free cells of row y0)
    const runs = (yy) => { const out = []; let s = -1; for (let x = 0; x <= cols; x++) { const free = x < cols && !cov[yy * cols + x]; if (free && s < 0) s = x; if (!free && s >= 0) { out.push([s, x]); s = -1; } } return out; };
    const first = runs(y0).filter(([a, c]) => c - a >= minW).sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]))[0];
    if (!first) continue;
    [lo, hi] = first;
    while (y + 1 < rows) {
      const nx = runs(y + 1).map(([a, c]) => [Math.max(a, lo), Math.min(c, hi)]).filter(([a, c]) => c - a >= minW).sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]))[0];
      if (!nx) break;
      [lo, hi] = nx; y++;
    }
    const hgt = (y - y0 + 1) * G;
    if (hgt > tall.h) tall = { x: lo * G, y: y0 * G, w: (hi - lo) * G, h: hgt };
  }
  const stage = document.querySelector('.combat-ui > .cb-stage');
  const canvas = document.querySelector('canvas');
  const S = RB.battleStage.stats();
  const actors = [];
  for (const q of S.hits || []) if (!q.settled) actors.push({ who: 'foe:' + q.i, x: q.x, y: q.y, w: q.w, h: q.h });
  const lay = S.lay, cp = S.cssPerArt;
  if (lay) for (const k of ['pc', 'comp']) { const f = lay[k]; if (!f) continue; const fw = lay.frame.w * lay.ps, fh = lay.frame.h * lay.ps; actors.push({ who: k, x: Math.round((f.x - fw / 2) * cp), y: Math.round((f.y - fh) * cp), w: Math.round(fw * cp), h: Math.round(fh * cp) }); }
  for (const a of actors) {
    let n = 0, c = 0;
    for (let y = a.y; y < a.y + a.h; y += G) for (let x = a.x; x < a.x + a.w; x += G) { if (x < 0 || y < 0 || x >= vw || y >= vh) continue; n++; if (cov[Math.floor(y / G) * cols + Math.floor(x / G)]) c++; }
    a.covered = n ? +(c / n).toFixed(2) : null;
  }
  const party = document.querySelector('.cb-party');
  const banner = document.querySelector('.cb-banner.on');
  const inset = document.querySelector('.chal .chal-status');
  return {
    canvas: canvas ? R(canvas) : null, stage: stage ? R(stage) : null, party: party && vis(party) ? R(party) : null,
    partyCovered: party ? (() => { const r = party.getBoundingClientRect(); const t = document.elementFromPoint(r.left + Math.min(40, r.width / 2), r.top + Math.min(20, r.height / 2)); return !(t && party.contains(t)); })() : null,
    banner: banner ? R(banner) : null, inset: inset && vis(inset) ? { ...R(inset), text: inset.textContent.replace(/\s+/g, ' ').trim() } : null,
    occluders: occ, coveredArea: covered * G * G, viewArea: vw * vh, coveredShare: +(covered / (cols * rows)).toFixed(3),
    largestFree: best.a ? { x: best.x, y: best.y, w: best.w, h: best.h } : null, band: tall.h ? tall : null, actors,
  };
}

async function scene(sc) {
  const { p, errors, ctx } = await page(b, url, { viewport: { width: sc.w, height: sc.h } });
  // a still of the view just measured, as WebP (only with --shots)
  const still = async (view) => {
    if (!SHOTS || !sc.shot) return;
    const png = await p.screenshot();
    const b64 = await p.evaluate(async (d) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; cv.getContext('2d').drawImage(img, 0, 0); return cv.toDataURL('image/webp', 0.86).split(',')[1]; }, png.toString('base64'));
    fs.mkdirSync(SHOTS, { recursive: true });
    fs.writeFileSync(path.join(SHOTS, sc.shot + '_' + view + '.webp'), Buffer.from(b64, 'base64'));
  };
  await p.evaluate((o) => {
    const s = RB.game.debugStart('rw.mill1', 7, 9, { comp: o.comp, flags: { rw_gears: true } });
    s.learn.kanaKnown = 'both'; s.learn.profile = o.profile || 'E'; s.learn.difficulty = o.foes > 2 ? 'hard' : 'normal';
    if (o.longName) { s.player.name = 'Bartholomew-Alexandrina'; s.player.nameJp = 'バーソロミュー'; }
    s.words = ['mizu', 'iyasu', 'mamoru'];
    s.tips = { harmony: 1, harmonyFull: 1, cturn: 1, group: 1 };
    for (const k of ['strike', 'sweep', 'shroud', 'rest', 'heat', 'charge', 'lie', 'mirror', 'plea']) s.tips['intent:' + k] = 1;
    for (const w of s.words) s.tips['word:' + w] = 1;
    RB.game.settings.input = 'choice';
    RB.game.settings.battleControls = o.controls || 'adaptive';
    if (o.text) RB.game.settings.textScale = o.text;
    RB.game.applySettings();
    const place = RB.content.maps['rw.mill1'].foes.find((f) => f.id === 'm1a');
    window.__result = null;
    RB.game.startBattle(place.enemy, { place, where: { map: 'rw.mill1', x: place.x, y: place.y }, foeKey: 'geo', group: o.foes > 1 ? Array(o.foes - 1).fill(place.enemy) : undefined }).then((r) => { window.__result = r || 'done'; });
  }, sc);
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !RB.battleSeq.busy() }));
    if (s.cards) break;
    if (s.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(40);
  }
  await p.mouse.move(1, 1);
  await p.waitForTimeout(500);
  const out = { ...sc };
  out.decision = await p.evaluate(measure);
  await still('decision');
  // the language view (the status inset on the sheet)
  await p.evaluate(() => { const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__lastStep = step; return run(step, o); }; });
  const card = await p.evaluate(() => { const c = [...document.querySelectorAll('.rcard[data-i]')].find((x) => !x.disabled && /unravel/i.test(x.textContent)); return c && c.getAttribute('data-i'); });
  await p.evaluate((i) => document.querySelector('.rcard[data-i="' + i + '"]').scrollIntoView({ block: 'center' }), card);
  await p.click('.rcard[data-i="' + card + '"]');
  await p.waitForSelector('.chal .mc .btn', { timeout: 10000 });
  await p.mouse.move(1, 1); // (off the word the click left the pointer on, whose hover help would cover the sheet)
  await p.waitForTimeout(400);
  out.language = await p.evaluate(measure);
  await still('language');
  // answer right, take the companion's turn, and measure the action view mid-exchange
  await p.evaluate(() => {
    const st = window.__lastStep;
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => (o.text != null ? RB.tasks.plain(o.text) : o.en || ''));
    const txt = (el) => { const c = el.cloneNode(true); c.querySelectorAll('rt,.enline').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
    const bs = [...document.querySelectorAll('.chal .mc .btn')];
    const k = bs.findIndex((x) => right.some((r) => txt(x) === r.replace(/\s+/g, '') || (x.querySelector('.enline') && right.includes(x.querySelector('.enline').textContent.trim()))));
    bs[k].setAttribute('data-right', '1');
  });
  await p.evaluate(() => document.querySelector('.chal .mc .btn[data-right="1"]').scrollIntoView({ block: 'center' }));
  await p.click('.chal .mc .btn[data-right="1"]');
  await p.waitForSelector('.fbwrap .fb-go', { timeout: 10000 });
  await p.evaluate(() => document.querySelector('.fbwrap .fb-go').scrollIntoView({ block: 'center' }));
  await p.click('.fbwrap .fb-go');
  if (sc.comp) {
    await p.waitForSelector('.ccard', { timeout: 8000 });
    // (the pointer, left where Continue was, can rest on a word whose hover help then covers the card)
    await p.mouse.move(1, 1);
    await p.waitForTimeout(300); // the companion's menu ignores presses in its first 250 ms
    await p.evaluate(() => { const c = [...document.querySelectorAll('.ccard[data-a]')].find((x) => !x.disabled); c.scrollIntoView({ block: 'center' }); c.setAttribute('data-pick', '1'); });
    await p.click('.ccard[data-pick="1"]');
  }
  await p.waitForFunction(() => document.querySelector('.combat-ui').classList.contains('cb-acting') && RB.battleSeq.busy(), null, { timeout: 8000 });
  await p.waitForTimeout(320); // the withdrawal has finished
  out.action = await p.evaluate(measure);
  await still('action');
  out.errors = errors.slice();
  await ctx.close();
  return out;
}

const results = [];
for (const sc of scenes) {
  if ((only && !sc.name.includes(only)) || (SHOTS && !sc.shot)) continue;
  try { const r = await scene(sc); results.push(r); console.log('measured ' + sc.name + ': action-safe band ' + (r.action.band ? r.action.band.w + '×' + r.action.band.h : '—') + ', decision band ' + (r.decision.band ? r.decision.band.w + '×' + r.decision.band.h : '—')); }
  catch (e) { results.push({ ...sc, error: String(e && e.message || e).replace(/\x1b\[[0-9;]*m/g, '').slice(0, 1500) }); console.log('FAILED ' + sc.name + ': ' + String(e && e.message || e).slice(0, 300)); }
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ when: new Date().toISOString(), browser: 'Chromium (Playwright, headless)', results }, null, 1));
// the §22.2 targets
const tgt = { '390x844': 300, '320x640': 240 };
let bad = 0;
for (const r of results) {
  if (r.error) { bad++; continue; }
  const key = r.w + 'x' + r.h;
  if (tgt[key] && !r.text && !r.simulated && !r.controls && !r.profile) {
    const h = r.action.band ? r.action.band.h : 0;
    console.log((h >= tgt[key] ? 'meets ' : 'MISSES ') + key + ' action-safe target ' + tgt[key] + ': ' + h + ' (' + r.name + ')');
    if (h < tgt[key]) bad++;
  }
  for (const v of ['decision', 'action']) if (r[v].partyCovered || !r[v].party) { console.log('STATUS HIDDEN in ' + v + ': ' + r.name); bad++; }
  if (!r.language.inset) { console.log('NO STATUS INSET on the language sheet: ' + r.name); bad++; }
  if (r.errors.length) { console.log('page errors: ' + r.name + ': ' + r.errors.join('; ')); bad++; }
}
if (DOC) {
  const crypto = await import('node:crypto');
  const html = fs.readFileSync('index.html');
  const f = (r) => (r ? r.w + '×' + r.h : '—');
  const pc = (v) => Math.round(v * 100) + ' %';
  const lines = [
    '# Battle geometry (battle addendum §12.3, §22.2) — measured',
    '',
    'Generated by `node tests/e2e/battle_geometry.mjs --doc docs/battle/GEOMETRY.md` on ' + new Date().toISOString().slice(0, 10) + ', in headless Chromium',
    '(Playwright) on Linux, on `index.html` of ' + html.length.toLocaleString('en') + ' bytes (SHA-256 `' + crypto.createHash('sha256').update(html).digest('hex').slice(0, 16) + '…`).',
    'Synthetic campaigns: the Flour Moth in the Mill (a diagnostic placement), answered right with a real click,',
    'the companion\'s first support chosen, the action view measured 320 ms after the menus withdrew.',
    '',
    'All sizes in CSS px. **Stage** = the cell the actors are laid out in (decision view; they keep that place and scale in the',
    'action view, §12.3). **Free** = the largest rectangle of scene no UI surface covers, and the share of the screen that UI',
    'surfaces cover (their union, rasterised on a 4 px grid, overlaps counted once). **Action-safe band** = the tallest free',
    'band at least 60 % of the screen wide (or 280 px). **Actors covered** = how much of each actor\'s box any UI surface',
    'covers in the action view (f0 is the lead creature; badges count as covering).',
    '',
    '| Scene | Stage | Decision: free / covered | Action: band / free / covered | Status visible (action) | Status inset (language sheet) | Actors covered (action) |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const r of results) {
    if (r.error) { lines.push('| ' + r.name + ' | error: ' + r.error.split('\n')[0].replace(/\|/g, '/') + ' | | | | | |'); continue; }
    const d = r.decision, a = r.action, l = r.language;
    lines.push('| ' + r.name + ' | ' + f(d.stage) + ' | ' + f(d.largestFree) + ' / ' + pc(d.coveredShare) + ' | ' + f(a.band) + ' / ' + f(a.largestFree) + ' / ' + pc(a.coveredShare) + ' | ' +
      (a.party && !a.partyCovered ? 'yes' : 'NO') + ' | ' + (l.inset ? 'yes' : 'NO') + ' | ' + a.actors.map((x) => x.who.replace('foe:', 'f') + ' ' + pc(x.covered || 0)).join(', ') + ' |');
  }
  lines.push('', '## Targets (§22.2, 100 % text, no keyboard)', '');
  for (const r of results) {
    const key = r.w + 'x' + r.h;
    if (!r.error && tgt[key] && !r.text && !r.simulated && !r.controls && !r.profile) lines.push('- ' + r.name + ': action-safe height ' + (r.action.band ? r.action.band.h : 0) + ' (target ' + tgt[key] + ') — ' + ((r.action.band ? r.action.band.h : 0) >= tgt[key] ? 'met' : '**missed**'));
  }
  lines.push('', '## Limits', '',
    '- Safe-area insets (notches, rounded corners) cannot be simulated in headless Chromium; none are claimed.',
    '- The on-screen keyboard is simulated by a shorter viewport (labelled); a real phone keyboard is not tested.',
    '- Headless Chromium only: not Firefox, Safari or a physical phone or foldable.');
  fs.mkdirSync(path.dirname(DOC), { recursive: true });
  fs.writeFileSync(DOC, lines.join('\n') + '\n');
  console.log('wrote ' + DOC);
}
console.log('\nwrote ' + OUT + ' (' + results.length + ' scenes); ' + (bad ? bad + ' problem(s)' : 'all targets met'));
await b.close();
srv.close();
process.exit(bad ? 1 : 0);
