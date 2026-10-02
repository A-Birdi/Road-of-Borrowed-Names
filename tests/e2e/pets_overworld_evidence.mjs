// Evidence for the pets-in-battle and overworld parity work (battle addendum §11, §20), from BUILT games in
// headless Chromium (synthetic session-only campaigns; the base build is tests/e2e/out/battle_pets_overworld/
// base_index.html, built from 982c8df). Scratch output: tests/e2e/out/battle_pets_overworld/evidence/;
// committed copies (WebP): docs/screenshots/battle/pets_overworld/.
//  - pet frames at native size and at 3× (the coverage matrix: every family, the creature's move — brace, hit,
//    soft, status, settle — victory, idles, stances; three moments and the reduced-motion hold), base and now;
//  - timeline strips: each species through one exchange (your response, then the creature's Strike) sampled
//    every 40 ms on the presentation clock from the real observer, with the count of drawn-frame changes (pose cadence)
//    and the timing trace (JSON);
//  - every look of every species, battle and road views, base and now;
//  - battle stage crops (from tests/e2e/battle_pets_overworld.mjs captures, when present).
// Usage: node tests/e2e/pets_overworld_evidence.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';
import { sheet } from './sheet.mjs';

const ev = path.join(root, 'tests/e2e/out/battle_pets_overworld/evidence');
const docs = path.join(root, 'docs/screenshots/battle/pets_overworld');
fs.mkdirSync(ev, { recursive: true });
fs.mkdirSync(docs, { recursive: true });
const BASE = '/tests/e2e/out/battle_pets_overworld/base_index.html';
const { srv, url } = await serve();
const b = await launch();
const save = (f, dataUrl) => { fs.writeFileSync(f, Buffer.from(dataUrl.split(',')[1], 'base64')); return f; };

async function devPage(pg) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(() => { window.__RB_DEV_PETS__ = true; });
  return page(b, url + (pg || ''), { context: ctx });
}
// 1. coverage matrices
for (const [tag, pg] of [['now', ''], ['base', BASE]]) {
  const { p, ctx } = await devPage(pg);
  for (const sc of [1, 3]) {
    const d = await p.evaluate((sc) => RB.pets.dev.sheet({ scale: sc }).toDataURL('image/png'), sc);
    save(path.join(ev, 'matrix_' + tag + '_' + sc + 'x.png'), d);
  }
  await ctx.close();
}
// 2. timeline strips (now) — the real observer, the real frames
const trace = {};
{
  const { p, ctx } = await devPage('');
  for (const sp of ['cat', 'dog', 'bird', 'tanuki']) {
    const r = await p.evaluate((sp) => {
      const s = RB.game.debugStart('rw.millroad', 11, 13, { dir: 'up', comp: 'mio' });
      RB.pets.meet(s, sp); RB.pets.select(s, sp); RB.game.settings.reducedMotion = false;
      const BP = RB.battlePets;
      let clock = 0;
      const orig = RB.battleSeq.now; RB.battleSeq.now = () => clock;
      clock = -3000;
      RB.bus.emit('present:scene', { scope: 'battle', phase: 'enter', comp: 'mio', t0: -3000 });
      clock = 0;
      RB.bus.emit('present:scene', { scope: 'battle', phase: 'calm', t0: 0 });
      // your Unravel (beat 560, ends 1140), then the moth's Strike from 1300 (contact 640, ends 1250)
      RB.bus.emit('present:action', { scope: 'battle', actor: 'pc', family: 'unravel', targets: ['foe:0'], exchange: 1, t0: 100, beat: 560, end: 1140 });
      RB.bus.emit('present:enemy', { scope: 'battle', actor: 'foe:0', kind: 'strike', targets: ['pc'], outcome: 'hit', exchange: 1, t0: 1300, at: 640, end: 1250 });
      const look = RB.pets.lookOf(s, sp);
      const frames = [], keys = [];
      const SC = 3, step = 40, T = 2700;
      for (let t = 0; t <= T; t += step) {
        clock = t;
        const q = BP.poseAt(t, 100000 + t, false);
        const f = RB.petArt.frame(sp, look, { kind: 'battle' }, q.po);
        frames.push({ t, f, lift: q.lift || 0, dx: q.dx || 0 });
        // a pose change is a different drawn frame (the cache's frame) or a different lift
        if (!window.__fid) window.__fid = new Map();
        if (!window.__fid.has(f)) window.__fid.set(f, window.__fid.size);
        keys.push(window.__fid.get(f) + '|' + (q.lift || 0));
      }
      const changes = keys.filter((k, i) => i && k !== keys[i - 1]).length;
      const distinct = new Set(keys).size;
      const st = BP.stats();
      RB.bus.emit('present:scene', { scope: 'battle', phase: 'exit' });
      RB.battleSeq.now = orig;
      // strip: one frame every 120 ms (every third sample) with its time
      const pick = frames.filter((_, i) => i % 3 === 0);
      const CW = 50, CH = 58;
      const cv = document.createElement('canvas'); cv.width = pick.length * CW * SC; cv.height = (CH + 10) * SC;
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#7f9a62'; g.fillRect(0, 0, cv.width, cv.height);
      g.font = (6 * SC) + 'px sans-serif'; g.fillStyle = '#1c2530';
      pick.forEach((q, i) => {
        const x = i * CW * SC;
        g.fillStyle = q.t < 1300 ? 'rgba(60,110,200,0.18)' : 'rgba(200,60,60,0.18)'; g.fillRect(x, 0, CW * SC, 9 * SC);
        g.fillStyle = '#1c2530'; g.fillText(q.t + ' ms', x + 2 * SC, 7 * SC);
        g.drawImage(q.f.cv, x + (CW - q.f.w) / 2 * SC, (CH + 6 - q.f.h - q.lift) * SC, q.f.w * SC, q.f.h * SC);
      });
      return { url: cv.toDataURL('image/png'), changes, distinct, samples: keys.length, step, trace: st.trace, stats: st.stats };
    }, sp);
    save(path.join(ev, 'timeline_' + sp + '.png'), r.url);
    trace[sp] = { sampleEveryMs: r.step, samples: r.samples, poseChanges: r.changes, distinctPoses: r.distinct, changesPerSecond: Math.round((r.changes / (r.samples * r.step / 1000)) * 10) / 10, trace: r.trace, stats: r.stats };
  }
  await ctx.close();
}
fs.writeFileSync(path.join(ev, 'timing_trace.json'), JSON.stringify(trace, null, 1));
// 3. every look, now and base
for (const [tag, pg] of [['now', ''], ['base', BASE]]) {
  const { p, ctx } = await devPage(pg);
  const d = await p.evaluate(() => {
    const SC = 3, cells = [];
    for (const sp of RB.pets.ORDER) for (const lk of RB.petArt.LOOK_ORDER[sp]) {
      const calm = RB.battlePets.sampleAny(sp, 'calm', null, null, {});
      const ms = RB.battlePets.sampleAny(sp, 'react', 'interpret', 0, {}).ms;
      const re = RB.battlePets.sampleAny(sp, 'react', 'interpret', ms * 0.1, { actor: 'pc' });
      cells.push([RB.petArt.frame(sp, lk, { kind: 'battle' }, calm.po), RB.petArt.frame(sp, lk, { kind: 'battle' }, re.po), RB.petArt.frame(sp, lk, { kind: 'world', dir: 'down' }, { sit: 1 }), RB.petArt.frame(sp, lk, { kind: 'world', dir: 'right' }, { gait: 'walk', ph: 0.3 })]);
    }
    const CW = 56, CH = 58, cols = 3;
    const cv = document.createElement('canvas'); cv.width = cols * 4 * CW * SC; cv.height = Math.ceil(cells.length / cols) * CH * SC;
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#7f9a62'; c.fillRect(0, 0, cv.width, cv.height);
    cells.forEach((fs4, i) => { const x0 = (i % cols) * 4 * CW * SC, y0 = Math.floor(i / cols) * CH * SC; fs4.forEach((f, j) => c.drawImage(f.cv, x0 + j * CW * SC, y0 + (CH - f.h - 2) * SC, f.w * SC, f.h * SC)); });
    return cv.toDataURL('image/png');
  });
  save(path.join(ev, 'looks_' + tag + '_3x.png'), d);
  await ctx.close();
}
// 4. WebP copies for the docs
const W = async (src, out, label, o) => sheet(path.join(docs, out), [{ label, f: src }], Object.assign({ cols: 1, scale: 1, browser: b }, o || {}));
await W(path.join(ev, 'matrix_now_1x.png'), 'pets_matrix_native.webp', 'Pets in battle: coverage matrix at native size (this build)');
await W(path.join(ev, 'matrix_now_3x.png'), 'pets_matrix_3x.webp', 'Pets in battle: coverage matrix at 3× (this build)');
await W(path.join(ev, 'matrix_base_3x.png'), 'pets_matrix_3x_before.webp', 'Before (base 982c8df): coverage matrix at 3×');
await W(path.join(ev, 'looks_now_3x.png'), 'pets_looks_3x.webp', 'Every look: battle calm, battle reaction, road sitting, road walking (3×, this build)');
await W(path.join(ev, 'looks_base_3x.png'), 'pets_looks_3x_before.webp', 'Before (base 982c8df): every look at 3×');
for (const sp of ['cat', 'dog', 'bird', 'tanuki']) await W(path.join(ev, 'timeline_' + sp + '.png'), 'pets_timeline_' + sp + '.webp', sp + ': your Unravel (blue, 100–1240 ms), then the creature\'s Strike (red, from 1300 ms): every 120 ms at 3×; ' + trace[sp].poseChanges + ' pose changes in ' + trace[sp].samples + ' samples of 40 ms');
fs.copyFileSync(path.join(ev, 'timing_trace.json'), path.join(docs, 'pets_timing_trace.json'));
// battle stage captures from the browser test, when present
const shotDir = path.join(root, 'tests/e2e/out/battle_pets_overworld');
const shots = ['none', 'cat', 'dog', 'bird', 'tanuki', 'solo_cat', 'phone_tanuki', 'reduced_bird'].map((k) => ({ k, f: path.join(shotDir, 'battle_' + k + '.png') })).filter((q) => fs.existsSync(q.f));
if (shots.length) await sheet(path.join(docs, 'battle_pets_stage.webp'), shots.map((q) => ({ label: 'battle: ' + q.k.replace('_', ' '), f: q.f })), { cols: 3, scale: 0.5, browser: b });
// overworld before/after (from tests/e2e/overworld_parity_shots.mjs run on the base build into base_shots/ and on
// this build into new_shots/), the road figures gallery, and the exit mat
const bs = path.join(shotDir, 'base_shots'), ns = path.join(shotDir, 'new_shots');
if (fs.existsSync(path.join(bs, 'index.json')) && fs.existsSync(path.join(ns, 'index.json'))) {
  const B0 = JSON.parse(fs.readFileSync(path.join(bs, 'index.json'), 'utf8')), N0 = JSON.parse(fs.readFileSync(path.join(ns, 'index.json'), 'utf8'));
  const pairs = (B0.regions || []).map((q) => [q, (N0.regions || []).find((r) => r.name === q.name)]).filter((x) => x[1]);
  for (let i = 0; i < pairs.length; i += 4) {
    const items = [];
    for (const [a, n] of pairs.slice(i, i + 4)) items.push({ label: a.name + ' (' + a.map + ') — before', f: a.f }, { label: a.name + ' — after', f: n.f });
    if (items.length) await sheet(path.join(docs, 'overworld_regions_' + (i / 4 + 1) + '.webp'), items, { cols: 2, scale: 0.5, browser: b });
  }
  const props = (B0.props || []).map((q) => [q, (N0.props || []).find((r) => r.kind === q.kind)]).filter((x) => x[1]);
  for (let i = 0; i < props.length; i += 10) {
    const items = [];
    for (const [a, n] of props.slice(i, i + 10)) items.push({ label: a.kind + ' ' + a.map + ' before', f: a.f1 }, { label: 'after', f: n.f1 });
    await sheet(path.join(docs, 'overworld_interactables_' + (i / 10 + 1) + '.webp'), items, { cols: 4, scale: 1, browser: b });
  }
  const em = props.find(([a]) => a.kind === 'exitmat');
  if (em) await sheet(path.join(docs, 'overworld_exitmat.webp'), [{ label: 'exit mat, co.glass — before (base 982c8df)', f: em[0].f0 }, { label: 'after', f: em[1].f0 }], { cols: 2, scale: 2, browser: b });
}
if (fs.existsSync(path.join(shotDir, 'figures_gallery.png'))) await sheet(path.join(docs, 'overworld_figures_gallery.webp'), [{ label: 'Eight player looks on the road (down, left, up, right, walking, idle) beside the same look in battle (3×)', f: path.join(shotDir, 'figures_gallery.png') }], { cols: 1, scale: 1, browser: b });
console.log('evidence written:', fs.readdirSync(docs).join(', '));
console.log(JSON.stringify(Object.fromEntries(Object.entries(trace).map(([k, v]) => [k, { poseChanges: v.poseChanges, distinct: v.distinctPoses, perSecond: v.changesPerSecond }]))));
await b.close(); srv.close();
