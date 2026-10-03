// Harmony portrait art in the built game (Harmony addendum §6, §21, §23.3; the art only — the cut-in's
// placement, timing and lifecycle are the overlay's and are tested with it).
//   node tests/e2e/harmony_art.mjs
// 1. every appearance fixture (synthetic, generated from the registries) × the four pairings × enter/hold ×
//    standard/compact composes without an error; faces and hands lie inside the canvas;
// 2. neither face is covered by the other bust: each composition is compared, inside each face rectangle,
//    with the same composition drawn without the other bust;
// 3. the effective look keys the cache: equipping a keepsake through RB.equip (and unequipping it) gives a new
//    bust and new pixels; the stale entry is not reused; the equip:change event drops the player's stale entries;
// 4. 20 repeated compositions stay inside the caches' bounds;
// 5. phase and variant differ in pixels; a reduced-motion caller (still) gets the hold drawing;
// 6. cold and warm timings (performance.now) per pairing, with the environment.
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const t0 = Date.now();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL:', m); } };
const { srv, url } = await serve();
const browser = await launch();
const { p, errors, requests } = await page(browser, url, { viewport: { width: 1280, height: 720 } });

// ---- 1, 2: fixtures × pairings × phases × variants; face occlusion --------------------------------------------
const r1 = await p.evaluate(() => {
  const HA = RB.harmonyArt, list = RB.harmonyArtFixtures.fixtures();
  const px = (cv) => cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  const bad = [], occl = [];
  let n = 0, checked = 0;
  for (const f of list) for (const comp of HA.COMPANIONS) for (const phase of ['enter', 'hold']) for (const variant of ['standard', 'compact']) {
    const o = { comp, look: f.look, phase, variant };
    let c;
    try { c = HA.compose(o); } catch (e) { bad.push(f.id + ' ' + comp + ' ' + phase + ' ' + variant + ': ' + e.message); continue; }
    n++;
    const tag = f.id + ' ' + comp + ' ' + phase + ' ' + variant;
    if (c.faces.length !== 2) bad.push(tag + ': ' + c.faces.length + ' faces');
    for (const r of c.faces.concat(c.hands)) if (r.x < 0 || r.y < 0 || r.x + r.w > c.w || r.y + r.h > c.h) bad.push(tag + ': ' + r.who + ' rect outside the canvas');
    if (!c.bounds.w) bad.push(tag + ': empty');
    // the occlusion check: on every fixture with the acceptance companion order, and on all of them for the hold
    const full = px(c.cv);
    for (const fc of c.faces) {
      const other = HA.compose(Object.assign({}, o, { omit: fc.who === 'pc' ? 'comp' : 'pc' }));
      const d = px(other.cv);
      let diff = 0;
      for (let y = fc.y; y < fc.y + fc.h; y++) for (let x = fc.x; x < fc.x + fc.w; x++) {
        const i = (y * c.w + x) * 4;
        if (full[i] !== d[i] || full[i + 1] !== d[i + 1] || full[i + 2] !== d[i + 2] || full[i + 3] !== d[i + 3]) diff++;
      }
      checked++;
      if (diff) occl.push(tag + ': ' + diff + ' px of ' + fc.who + "'s face changed by the other bust");
    }
  }
  return { fixtures: list.length, n, checked, bad: bad.slice(0, 20), nBad: bad.length, occl: occl.slice(0, 20), nOccl: occl.length, cov: RB.harmonyArtFixtures.coverage(list), stats: HA.stats() };
});
console.log('fixtures', r1.fixtures, 'compositions', r1.n, 'face checks', r1.checked);
ok(r1.fixtures >= 24, 'at least 24 fixtures (' + r1.fixtures + ')');
ok(r1.n === r1.fixtures * 16 && r1.nBad === 0, r1.n + ' compositions (' + r1.fixtures + ' fixtures × 4 pairings × 2 phases × 2 variants) without an error: ' + JSON.stringify(r1.bad));
ok(r1.nOccl === 0, r1.checked + ' face checks: no face covered by the other bust: ' + JSON.stringify(r1.occl));
for (const k of Object.keys(r1.cov)) ok(!r1.cov[k].missing.length, 'coverage ' + k + ' ' + r1.cov[k].got + '/' + r1.cov[k].want + (r1.cov[k].missing.length ? ' missing ' + r1.cov[k].missing : ''));
ok(r1.stats.busts <= r1.stats.cap.busts && r1.stats.compositions <= r1.stats.cap.comps, 'caches bounded after the full set: ' + r1.stats.busts + ' busts, ' + r1.stats.compositions + ' compositions');

// ---- 3: the effective look through the equipment API ------------------------------------------------------------
const r3 = await p.evaluate(() => {
  const HA = RB.harmonyArt;
  HA.clear();
  const s = { player: { look: { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['flower', 'glasses'] } }, equip: { charm: null, tool: null, cosmetic: null } };
  const sig = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 3) h = Math.imul(h ^ d[i], 16777619) >>> 0; return h; };
  const out = {};
  const a = HA.compose({ comp: 'suzu', look: RB.equip.look(s), phase: 'hold' });
  out.k0 = a.key; out.s0 = sig(a.cv); out.b0 = HA.stats().builds;
  RB.equip.equip(s, 'co_straw_hat');
  const lookHat = RB.equip.look(s);
  out.hatInLook = (lookHat.acc || []).includes('hat');
  const b = HA.compose({ comp: 'suzu', look: lookHat, phase: 'hold' });
  out.k1 = b.key; out.s1 = sig(b.cv); out.b1 = HA.stats().builds;
  out.keysAfterEquip = HA.stats().keys;
  RB.equip.equip(s, 'lf_ferry_cap'); // a cap takes the hat's place (same place on the head)
  const lookCap = RB.equip.look(s);
  out.capReplacesHat = (lookCap.acc || []).includes('cap') && !(lookCap.acc || []).includes('hat');
  const c = HA.compose({ comp: 'suzu', look: lookCap, phase: 'hold' });
  out.k2 = c.key; out.s2 = sig(c.cv);
  RB.equip.unequip(s, 'cosmetic');
  const d = HA.compose({ comp: 'suzu', look: RB.equip.look(s), phase: 'hold' });
  out.k3 = d.key; out.s3 = sig(d.cv);
  return out;
});
ok(r3.hatInLook, 'equipping the straw hat puts a hat in RB.equip.look');
ok(r3.k1 !== r3.k0 && r3.s1 !== r3.s0, 'equipping a keepsake: a new key and new pixels (the old entry is not reused)');
ok(r3.b1 > r3.b0, 'equipping a keepsake builds a new player bust (' + r3.b0 + ' → ' + r3.b1 + ' builds)');
ok(r3.capReplacesHat && r3.k2 !== r3.k1 && r3.s2 !== r3.s1, 'a cap takes the hat\'s place: another key and drawing');
ok(r3.k3 === r3.k0 && r3.s3 === r3.s0, 'unequipping returns to the first look\'s key and pixels');

// equip:change drops the player's stale entries for the running game's look
const r3b = await p.evaluate(() => {
  const HA = RB.harmonyArt;
  HA.clear();
  const g = RB.game;
  const saved = g.s;
  g.s = { player: { look: { skin: 3, hair: 'bob', hairColor: 0, outfit: 4, shape: 'robe', acc: ['scarf'] } }, equip: { charm: null, tool: null, cosmetic: null } };
  try {
    HA.prepare({ comp: 'nao', look: RB.equip.look(g.s), phase: 'hold' });
    const before = HA.stats().keys.busts.filter((k) => k.split('|')[1] === 'pc').length;
    RB.equip.equip(g.s, 'sb_scarf');
    const after = HA.stats().keys.busts.filter((k) => k.split('|')[1] === 'pc').length;
    HA.prepare({ comp: 'nao', look: RB.equip.look(g.s), phase: 'hold' });
    const fresh = HA.stats().keys.busts.filter((k) => k.split('|')[1] === 'pc').length;
    return { before, after, fresh };
  } finally { g.s = saved; }
});
ok(r3b.before === 1 && r3b.after === 0 && r3b.fresh === 1, 'equip:change drops the stale player bust; the next composition builds the worn look (' + JSON.stringify(r3b) + ')');

// ---- 4: 20 repeated compositions stay bounded ------------------------------------------------------------------
const r4 = await p.evaluate(() => {
  const HA = RB.harmonyArt, list = RB.harmonyArtFixtures.fixtures();
  HA.clear();
  const sizes = [];
  for (let i = 0; i < 20; i++) { HA.compose({ comp: HA.COMPANIONS[i % 4], look: list[i % list.length].look, phase: i % 2 ? 'enter' : 'hold' }); const st = HA.stats(); sizes.push([st.busts, st.compositions, st.bytes]); }
  for (let i = 0; i < 20; i++) HA.compose({ comp: 'ren', look: list[0].look, phase: 'hold' });
  const st = HA.stats();
  return { sizes, final: { busts: st.busts, compositions: st.compositions, bytes: st.bytes, cap: st.cap, hits: st.hits, evictions: st.evictions } };
});
const maxB = Math.max(...r4.sizes.map((s) => s[0])), maxC = Math.max(...r4.sizes.map((s) => s[1])), maxBytes = Math.max(...r4.sizes.map((s) => s[2]));
ok(maxB <= r4.final.cap.busts && maxC <= r4.final.cap.comps, '20 varied compositions: at most ' + maxB + ' busts / ' + maxC + ' compositions cached (caps ' + r4.final.cap.busts + ' / ' + r4.final.cap.comps + '), ' + (maxBytes / 1048576).toFixed(2) + ' MiB');
ok(r4.final.busts === maxB && r4.final.compositions === maxC, '20 repeats of one composition add nothing (' + r4.final.busts + ' busts, ' + r4.final.compositions + ' compositions)');

// ---- 5: phase, variant, reduced motion ----------------------------------------------------------------------------
const r5 = await p.evaluate(() => {
  const HA = RB.harmonyArt, look = RB.harmonyArtFixtures.fixtures()[13].look;
  const px = (c) => c.cv.getContext('2d').getImageData(0, 0, c.w, c.h).data;
  const diff = (a, b) => { if (a.length !== b.length) return -1; let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) n++; return n; };
  const out = {};
  for (const comp of HA.COMPANIONS) {
    const e = HA.compose({ comp, look, phase: 'enter' }), h = HA.compose({ comp, look, phase: 'hold' });
    const still = HA.compose({ comp, look, phase: 'enter', still: true });
    const cm = HA.compose({ comp, look, phase: 'hold', variant: 'compact' });
    out[comp] = { phase: diff(px(e), px(h)), still: diff(px(still), px(h)), stillKey: still.key === h.key, variant: [cm.w, cm.h, h.w, h.h], compactFaceH: cm.faces.map((f) => f.h) };
  }
  return out;
});
for (const comp of Object.keys(r5)) {
  const v = r5[comp];
  ok(v.phase > 150, comp + ': enter and hold differ (' + v.phase + ' px)');
  ok(v.still === 0 && v.stillKey, comp + ': a reduced-motion caller gets the hold drawing');
  ok(v.variant[0] !== v.variant[2] || v.variant[1] !== v.variant[3], comp + ': compact ' + v.variant[0] + '×' + v.variant[1] + ' vs standard ' + v.variant[2] + '×' + v.variant[3]);
  ok(v.compactFaceH.every((h) => h * 2 >= 64), comp + ': compact faces ≥ 64 CSS px tall at 2× (' + v.compactFaceH.map((h) => h * 2) + ')');
}
const fits = await p.evaluate(() => ({ s1280: RB.harmonyArt.fitScale(1280, 720), s1648: RB.harmonyArt.fitScale(1648, 840), s1920: RB.harmonyArt.fitScale(1920, 1080), s1440: RB.harmonyArt.fitScale(1440, 900), c390: RB.harmonyArt.fitScale(390, 844, 'compact'), c320: RB.harmonyArt.fitScale(320, 640, 'compact') }));
ok(fits.s1280 === 2 && fits.s1648 === 2 && fits.s1920 === 3 && fits.c390 === 2 && fits.c320 === 2, 'display scales: ' + JSON.stringify(fits));

// ---- 6: cold and warm timings ---------------------------------------------------------------------------------------
const r6 = await p.evaluate(() => {
  const HA = RB.harmonyArt, look = RB.harmonyArtFixtures.fixtures()[13].look;
  const out = {};
  for (const comp of HA.COMPANIONS) {
    HA.clear();
    const t0 = performance.now(); HA.compose({ comp, look, phase: 'hold' }); const cold = performance.now() - t0;
    const t1 = performance.now(); HA.compose({ comp, look, phase: 'hold' }); const warm = performance.now() - t1;
    const t2 = performance.now(); HA.prepare({ comp, look }); const prep = performance.now() - t2;
    out[comp] = { coldMs: +cold.toFixed(1), warmMs: +warm.toFixed(2), prepareBothPhasesMs: +prep.toFixed(1) };
  }
  const st = HA.stats();
  return { out, bytes: st.bytes, busts: st.busts, compositions: st.compositions, env: { ua: navigator.userAgent, cores: navigator.hardwareConcurrency, view: [innerWidth, innerHeight], dpr: devicePixelRatio } };
});
console.log('timings', JSON.stringify(r6.out));
console.log('environment', JSON.stringify(r6.env));
ok(Object.values(r6.out).every((v) => v.warmMs < 5), 'warm compositions come from the cache (< 5 ms)');
ok(!errors.length, 'no page errors: ' + errors.join(' | '));
ok(!requests.length, 'no network requests: ' + requests.join(' | '));

const res = { date: new Date().toISOString().slice(0, 10), pass, fail, fixtures: r1.fixtures, compositions: r1.n, faceChecks: r1.checked, coverage: r1.cov, equip: r3, equipEvent: r3b, bounded: r4.final, scales: fits, timings: r6.out, cache: { bytes: r6.bytes, busts: r6.busts, compositions: r6.compositions }, environment: Object.assign({ automation: 'Playwright, headless Chromium (software canvas), shared 4-core machine; not a physical device' }, r6.env), seconds: Math.round((Date.now() - t0) / 1000) };
fs.mkdirSync(path.join(root, 'docs/harmony'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/harmony/art_test_results.json'), JSON.stringify(res, null, 1) + '\n');
console.log(`\n${pass} passed, ${fail} failed (${res.seconds} s)`);
await browser.close(); srv.close();
process.exit(fail ? 1 : 0);
