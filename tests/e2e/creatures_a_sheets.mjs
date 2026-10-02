// Creatures A: native frame sheets (battle addendum §18.5, §23.5). For each family in this area
// (and each palette variant that uses it), every idle drawing and every authored action frame,
// at native size (1×) and at 3×, from the BUILT index.html — the frames the battle draws, not
// a mock-up. Also reports per-frame generation time and the estimated resident pixels.
// Writes PNG sheets to tests/e2e/out/battle_creatures_a/ and, with --docs, WebP copies to
// docs/screenshots/battle/creatures_a/.
// Usage: node tests/e2e/creatures_a_sheets.mjs [family] [--docs] [--variants]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith('--'));
const toDocs = args.includes('--docs');
const variants = args.includes('--variants');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_creatures_a');
const docDir = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_a');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url, { viewport: { width: 1400, height: 900 } });

const FAM = ['moth', 'wisp', 'echo', 'blot', 'crab', 'golem', 'crane', 'sg_letter', 'clerk', 'warden'].filter((f) => !only || f === only);
const report = [];
for (const fam of FAM) {
  const r = await p.evaluate(async ([fam, variants]) => {
    const EA = RB.enemyArt, spec = EA.P[fam];
    // the palettes of the enemies that use this family (the first is the reference)
    const ids = Object.keys(RB.content.enemies).filter((id) => RB.content.enemies[id].art === fam).sort();
    const ref = { moth: 'rw.dustmoth', wisp: 'rw.reedling', echo: 'rw.mill_echo', blot: 'rw.inkblot', crab: 'sg.crab', golem: 'co.golem', crane: 'sa.crane', sg_letter: 'sg.letter', clerk: 'sg.tideclerk', warden: 'co.warden' }[fam];
    const order = [ref].concat(ids.filter((x) => x !== ref));
    const pal = (variants ? order : [ref]).map((id) => ({ id, o: RB.content.enemies[id].artOpts || {} }));
    const sets = [['idle', null, spec.seq ? [...new Set(spec.seq)].sort((a, b) => a - b) : [...Array(spec.frames || 1).keys()]]].concat(Object.keys(spec.poses || {}).map((k) => [k, spec.poses[k]]));
    const out = [];
    const times = [];
    for (const { id, o } of pal) {
      const rows = [];
      for (const [key, n, list] of sets) {
        const frames = [];
        if (key === 'idle') for (const f of list) { const t0 = performance.now(); const cv = EA.frame(fam, f, Object.assign({}, o)); times.push(performance.now() - t0); frames.push(cv); }
        else for (let i = 0; i < n; i++) {
          const c = document.createElement('canvas'); c.width = spec.w; c.height = spec.h;
          const g = c.getContext('2d');
          const [act, fm] = key.split('.');
          const t0 = performance.now();
          EA.drawPosed(g, fam, 0, Object.assign({}, o), spec.ox, spec.oy - (spec.dy || 0), 1, false, { act, family: fm || null, k: (i + 0.5) / n, dir: { x: -0.8, y: 0.6 } });
          times.push(performance.now() - t0);
          frames.push(c);
        }
        rows.push({ key, frames });
      }
      // a sheet: one row per set, native size then 3× (the 3× row below)
      const pad = 6, lab = 16, W = spec.w, Hh = spec.h;
      const maxN = Math.max(...rows.map((r) => r.frames.length));
      const sheet1 = document.createElement('canvas');
      sheet1.width = pad + maxN * (W + pad) + 150; sheet1.height = pad + rows.length * (Hh + pad + lab);
      const g1 = sheet1.getContext('2d');
      g1.fillStyle = '#6f6a62'; g1.fillRect(0, 0, sheet1.width, sheet1.height);
      g1.imageSmoothingEnabled = false;
      g1.font = '12px sans-serif';
      rows.forEach((r, ri) => {
        const y = pad + ri * (Hh + pad + lab);
        g1.fillStyle = '#f4ecd8'; g1.fillText(r.key + ' (' + r.frames.length + ')', pad, y + 12);
        r.frames.forEach((cv, i) => {
          const x = pad + i * (W + pad);
          g1.fillStyle = '#7d776e'; g1.fillRect(x, y + lab, W, Hh);
          g1.strokeStyle = '#8c857a'; g1.strokeRect(x + 0.5, y + lab + 0.5, W - 1, Hh - 1);
          g1.drawImage(cv, x, y + lab);
          g1.fillStyle = '#e8402a'; g1.fillRect(x + spec.ox - 1, y + lab + spec.oy, 3, 1); g1.fillRect(x + spec.ox, y + lab + spec.oy - 1, 1, 3);
        });
      });
      // 3× key poses: the first idle frame and the middle/last frame of each set
      const keys = [];
      rows.forEach((r) => { const ks = r.key === 'idle' ? [0, Math.floor(r.frames.length / 2)] : r.frames.length > 2 ? [0, r.frames.length - 1] : [r.frames.length - 1]; ks.forEach((k) => keys.push({ label: r.key + '#' + k, cv: r.frames[k] })); });
      const per = Math.max(1, Math.floor(2600 / (W * 3 + pad)));
      const sheet3 = document.createElement('canvas');
      sheet3.width = pad + per * (W * 3 + pad); sheet3.height = pad + Math.ceil(keys.length / per) * (Hh * 3 + pad + lab);
      const g3 = sheet3.getContext('2d');
      g3.fillStyle = '#6f6a62'; g3.fillRect(0, 0, sheet3.width, sheet3.height);
      g3.imageSmoothingEnabled = false; g3.font = '14px sans-serif';
      keys.forEach((kk, i) => {
        const x = pad + (i % per) * (W * 3 + pad), y = pad + Math.floor(i / per) * (Hh * 3 + pad + lab);
        g3.fillStyle = '#f4ecd8'; g3.fillText(kk.label, x, y + 13);
        g3.fillStyle = '#7d776e'; g3.fillRect(x, y + lab, W * 3, Hh * 3);
        g3.drawImage(kk.cv, x, y + lab, W * 3, Hh * 3);
      });
      out.push({ id, n1: sheet1.toDataURL('image/png'), n3: sheet3.toDataURL('image/png'), w1: sheet1.toDataURL('image/webp', 0.92), w3: sheet3.toDataURL('image/webp', 0.9), frames: rows.reduce((m, r) => m + r.frames.length, 0) });
    }
    times.sort((a, b) => a - b);
    const nFrames = sets.reduce((m, s) => m + (s[0] === 'idle' ? s[2].length : s[1]), 0);
    return { fam, w: spec.w, h: spec.h, ox: spec.ox, oy: spec.oy, sheets: out, frames: nFrames, bytes: spec.w * spec.h * 4 * nFrames, ms: { med: +times[Math.floor(times.length / 2)].toFixed(2), p95: +times[Math.floor(times.length * 0.95)].toFixed(2), max: +times[times.length - 1].toFixed(2) } };
  }, [fam, variants]);
  for (const s of r.sheets) {
    const tag = r.fam + (s.id ? '_' + s.id.replace(/\./g, '-') : '');
    const save = (dataUrl, f) => fs.writeFileSync(f, Buffer.from(dataUrl.split(',')[1], 'base64'));
    save(s.n1, path.join(outDir, 'sheet_' + tag + '_1x.png'));
    save(s.n3, path.join(outDir, 'sheet_' + tag + '_3x.png'));
    if (toDocs && s === r.sheets[0]) { save(s.w1, path.join(docDir, 'sheet_' + r.fam + '_1x.webp')); save(s.w3, path.join(docDir, 'sheet_' + r.fam + '_3x.webp')); }
  }
  report.push({ fam: r.fam, frame: r.w + '×' + r.h, origin: r.ox + ',' + r.oy, frames: r.frames, MiB: +(r.bytes / 1048576).toFixed(2), genMs: r.ms, variants: r.sheets.map((s) => s.id) });
  console.log(r.fam, r.w + '×' + r.h, 'frames', r.frames, 'MiB', (r.bytes / 1048576).toFixed(2), 'gen ms', JSON.stringify(r.ms));
}
fs.writeFileSync(path.join(outDir, 'sheets_report.json'), JSON.stringify(report, null, 1));

// --roster: every enemy id of these families (the audit's list) — its idle drawing and the key
// pose of each move it uses — in its own palette, at native size, labelled
if (args.includes('--roster')) {
  const r = await p.evaluate(() => {
    const EA = RB.enemyArt, A = RB.creaturesA;
    const ids = Object.keys(A.audit.enemies).sort((a, b) => (A.audit.enemies[a].art + a).localeCompare(A.audit.enemies[b].art + b));
    const kindsOf = (e) => { const ks = new Set(); const add = (k) => ks.add(String(k).split(':')[0]); (e.pattern || []).forEach(add); (e.phases || []).forEach((ph) => (ph.pattern || []).forEach(add)); Object.keys(e.intents || {}).forEach(add); return [...ks].filter((k) => k !== 'rest'); };
    const FAMOF = { strike: 'strike', lie: 'lie', mirror: 'mirror', chill: 'chill' };
    const rows = ids.map((id) => {
      const e = RB.content.enemies[id], fam = e.art, spec = EA.P[fam], o = Object.assign({}, e.artOpts || {});
      const cells = [{ label: 'idle', cv: EA.frame(fam, spec.seq ? spec.seq[0] : 0, o) }];
      for (const k of kindsOf(e)) {
        // the move's key pose: the last exec frame (strike-like) or the middle cast frame
        const cand = ['exec.' + k, 'cast.' + k, 'exec.' + (FAMOF[k] || k)].find((x) => spec.poses[x] || (spec.alias && spec.alias[x]));
        if (!cand) continue;
        const key = spec.alias && spec.alias[cand] ? spec.alias[cand] : cand, n = spec.poses[key], i = key.startsWith('exec') ? n - 1 : Math.floor(n / 2);
        const c = document.createElement('canvas'); c.width = spec.w; c.height = spec.h;
        const [act, fm] = cand.split('.');
        EA.drawPosed(c.getContext('2d'), fam, 0, o, spec.ox, spec.oy - (spec.dy || 0), 1, false, { act, family: fm + '@' + i, k: 0.5, dir: { x: -0.8, y: 0.6 } });
        cells.push({ label: k, cv: c });
      }
      return { id, name: e.name && e.name.en, fam, d: A.audit.enemies[id].disposition, cells };
    });
    const CW = 160, CH = 150, pad = 4, lab = 30, maxC = Math.max(...rows.map((r) => r.cells.length));
    const perRow = 2, colW = 150 + maxC * (CW + pad);
    const sheet = document.createElement('canvas');
    sheet.width = perRow * colW + pad; sheet.height = Math.ceil(rows.length / perRow) * (CH + lab) + pad;
    const g = sheet.getContext('2d');
    g.fillStyle = '#6f6a62'; g.fillRect(0, 0, sheet.width, sheet.height); g.imageSmoothingEnabled = false;
    rows.forEach((r, ri) => {
      const x0 = (ri % perRow) * colW + pad, y0 = Math.floor(ri / perRow) * (CH + lab) + pad;
      g.fillStyle = '#f4ecd8'; g.font = 'bold 12px sans-serif'; g.fillText(r.id, x0, y0 + 14); g.font = '11px sans-serif'; g.fillText((r.name || '') + ' · ' + r.fam + ' · ' + r.d, x0, y0 + 28);
      r.cells.forEach((c, ci) => {
        const x = x0 + 150 + ci * (CW + pad) - 150 + (ci === 0 ? 0 : 0);
        const cx = x0 + ci * (CW + pad), cy = y0 + lab;
        g.fillStyle = '#7d776e'; g.fillRect(cx, cy, CW, CH - 6);
        // fit the native frame (scale 1, cropped about its origin if larger than the cell)
        const s = Math.min(1, CW / c.cv.width, (CH - 6) / c.cv.height);
        g.drawImage(c.cv, cx + (CW - c.cv.width * s) / 2, cy + (CH - 6 - c.cv.height * s) / 2, c.cv.width * s, c.cv.height * s);
        g.fillStyle = '#f4ecd8'; g.font = '10px sans-serif'; g.fillText(c.label, cx + 3, cy + 12);
        void x;
      });
    });
    return { png: sheet.toDataURL('image/png'), webp: sheet.toDataURL('image/webp', 0.9), n: rows.length };
  });
  fs.writeFileSync(path.join(outDir, 'roster_all_enemies.png'), Buffer.from(r.png.split(',')[1], 'base64'));
  if (toDocs) fs.writeFileSync(path.join(docDir, 'roster_all_enemies.webp'), Buffer.from(r.webp.split(',')[1], 'base64'));
  console.log('roster: ' + r.n + ' enemies');
}
console.log(errors.length ? 'page errors: ' + errors.join(' | ') : 'no page errors');
await b.close(); srv.close();
process.exit(errors.length ? 1 : 0);
