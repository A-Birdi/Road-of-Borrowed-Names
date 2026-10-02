// Native frame sheets for the Creatures B families (battle addendum §18.5, §22.4), rendered by
// the BUILT index.html in Chromium: each family's idle frames and every authored action frame,
// at native size and at 3×, on a neutral ground, with the frame size and timing printed beside.
// Also measures each family's frame build time (first build, uncached) for the record.
// Usage: node tests/e2e/creatures_b_sheets.mjs [family …] [--scale N] [--docs]
//   writes tests/e2e/out/battle_creatures_b/sheets/<family>.png (native ×scale, default 2)
//   with --docs: docs/screenshots/battle/creatures_b/sheet_<family>.webp (native) and
//   keys_<family>.webp (key poses at 3×)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const toDocs = args.includes('--docs');
const si = args.indexOf('--scale');
const scale = si >= 0 ? +args[si + 1] : 2;
const only = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--scale');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'battle_creatures_b', 'sheets');
const docDir = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_b');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docDir, { recursive: true });
// family → the options of a representative enemy (and alternates shown on the key sheet)
const FAM = {
  bell: [{ col: '#3c5c8a' }, { col: '#7a8a6a' }],
  lf_keeper: [{ col: '#4a5a52' }],
  lantern: [{ col: '#8ab8f0' }, { col: '#9aa8d8' }, { col: '#e8a060' }, { col: '#d8c0a0' }],
  sb_frostlamp: [{}],
  lf_conduit: [{ col: '#8a90c8' }],
  fox: [{ col: '#e8d0a0' }],
  sb_snowfox: [{}],
  hush: [{}],
  sa_hush: [{}],
  atlas_cartographer: [{}],
  spirit: [{}],
};
const fams = only.length ? only : Object.keys(FAM);
const { srv, url } = await serve();
const b = await launch();
const { p, errors } = await page(b, url);
const report = [];
for (const id of fams) {
  if (!FAM[id]) { console.log('unknown family', id); continue; }
  const r = await p.evaluate(([id, opts, scale]) => {
    const EA = RB.enemyArt, K = RB.pxkit, spec = EA.P[id], R = RB.creaturesB && RB.creaturesB.RIGS[id];
    if (!spec) return { err: 'no definition' };
    const o = opts[0];
    const seq = spec.seq || [...Array(spec.frames || 1).keys()];
    const idleF = [...new Set(seq)];
    const acts = R ? Object.keys(R.poses).filter((a) => !a.startsWith('key:')) : [];
    const rows = [{ name: 'idle ×' + idleF.length + ' @' + spec.ms + 'ms', frames: idleF.map((f) => ({ f })) }].concat(acts.map((a) => ({ name: a, frames: [...Array(R.poses[a]).keys()].map((i) => ({ act: a, i, n: R.poses[a] })) })));
    const build = (fr, oo) => {
      const L = K.layer(spec.w, spec.h, spec.ox, spec.oy);
      const t0 = performance.now();
      const out = (fr.act ? spec.pose(L, fr.act, fr.i, fr.n, oo, EA.H, -1) : spec.build(L, fr.f, oo, EA.H)) || L;
      const ms = performance.now() - t0;
      return { cv: out.canvas(), ms, px: out.px, w: out.w, h: out.h };
    };
    const maxN = Math.max(...rows.map((r) => r.frames.length));
    const lab = 150;
    const W = lab + maxN * spec.w * scale, H = rows.length * spec.h * scale;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    c.fillStyle = '#5a5048'; c.fillRect(0, 0, W, H);
    c.imageSmoothingEnabled = false;
    let times = [], clipped = [];
    rows.forEach((row, y) => {
      c.fillStyle = y % 2 ? '#544a42' : '#5e544b'; c.fillRect(0, y * spec.h * scale, W, spec.h * scale);
      c.fillStyle = '#efe4c8'; c.font = '13px monospace'; c.fillText(row.name, 6, y * spec.h * scale + 18);
      row.frames.forEach((fr, x) => {
        const B = build(fr, o);
        times.push(B.ms);
        // an authored frame that touches the canvas edge is clipped
        let edge = false;
        for (let xx = 0; xx < B.w && !edge; xx++) if ((B.px[xx] >>> 24) || (B.px[(B.h - 1) * B.w + xx] >>> 24)) edge = true;
        for (let yy = 0; yy < B.h && !edge; yy++) if ((B.px[yy * B.w] >>> 24) || (B.px[yy * B.w + B.w - 1] >>> 24)) edge = true;
        if (edge) clipped.push(row.name + '#' + x);
        c.drawImage(B.cv, lab + x * spec.w * scale, y * spec.h * scale, spec.w * scale, spec.h * scale);
        // the origin (anchor) as a small cross
        c.fillStyle = 'rgba(255,80,80,0.6)';
        const ax = lab + x * spec.w * scale + spec.ox * scale, ay = y * spec.h * scale + spec.oy * scale;
        c.fillRect(ax - 3, ay, 7, 1); c.fillRect(ax, ay - 3, 1, 7);
      });
    });
    // key poses at 3× for every variant: idle 0, then each move's held key
    const keys = R ? Object.keys(R.poses).filter((a) => a.startsWith('key:')) : [];
    const kfr = [{ f: idleF[0], name: 'idle' }].concat(keys.map((a) => ({ act: a, i: 0, n: 1, name: a.slice(4) })));
    // (wrapped at five a row, each variant's rows one under another)
    const ks = 3, kc = document.createElement('canvas'), cols = Math.min(5, kfr.length), rowsPer = Math.ceil(kfr.length / cols);
    kc.width = cols * spec.w * ks; kc.height = opts.length * rowsPer * spec.h * ks;
    const g = kc.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#5a5048'; g.fillRect(0, 0, kc.width, kc.height);
    opts.forEach((oo, v) => kfr.forEach((fr, n) => { const x = n % cols, y = v * rowsPer + Math.floor(n / cols); const B = build(fr, oo); g.drawImage(B.cv, x * spec.w * ks, y * spec.h * ks, spec.w * ks, spec.h * ks); g.fillStyle = '#efe4c8'; g.font = '22px monospace'; g.fillText(fr.name, x * spec.w * ks + 8, y * spec.h * ks + 26); }));
    times.sort((a, b) => a - b);
    return { url: cv.toDataURL('image/png'), keys: kc.toDataURL('image/png'), keysW: kc.width, w: spec.w, h: spec.h, rows: rows.map((r) => r.name + ':' + r.frames.length), median: times[times.length >> 1], max: times[times.length - 1], clipped };
  }, [id, FAM[id], scale]);
  if (r.err) { console.log(id, r.err); continue; }
  const png = path.join(outDir, id + '.png');
  fs.writeFileSync(png, Buffer.from(r.url.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outDir, 'keys_' + id + '.png'), Buffer.from(r.keys.split(',')[1], 'base64'));
  report.push({ id, w: r.w, h: r.h, rows: r.rows, buildMs: { median: +r.median.toFixed(2), max: +r.max.toFixed(2) }, clipped: r.clipped });
  console.log(id, r.w + 'x' + r.h, 'build median', r.median.toFixed(2), 'ms max', r.max.toFixed(2), 'ms', r.clipped.length ? 'CLIPPED: ' + r.clipped.join(', ') : 'no clipped frames');
  if (toDocs) {
    // WebP copies for the record (lossless)
    const toWebp = async (dataUrl, file) => {
      const webp = await p.evaluate(async (u) => { const im = new Image(); im.src = u; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 1); }, dataUrl);
      fs.writeFileSync(file, Buffer.from(webp.split(',')[1], 'base64'));
    };
    // native size sheet (re-rendered at 1×) and key poses at 3×
    if (scale !== 1) {
      const r1 = await p.evaluate(([id, o]) => {
        const EA = RB.enemyArt, K = RB.pxkit, spec = EA.P[id], R = RB.creaturesB.RIGS[id];
        const seq = spec.seq || [...Array(spec.frames || 1).keys()];
        const rows = [[...new Set(seq)].map((f) => ({ f }))].concat(Object.keys(R.poses).filter((a) => !a.startsWith('key:')).map((a) => [...Array(R.poses[a]).keys()].map((i) => ({ act: a, i, n: R.poses[a] }))));
        const maxN = Math.max(...rows.map((r) => r.length));
        const cv = document.createElement('canvas'); cv.width = maxN * spec.w; cv.height = rows.length * spec.h;
        const c = cv.getContext('2d'); c.fillStyle = '#5a5048'; c.fillRect(0, 0, cv.width, cv.height);
        rows.forEach((row, y) => row.forEach((fr, x) => { const L = K.layer(spec.w, spec.h, spec.ox, spec.oy); const out = (fr.act ? spec.pose(L, fr.act, fr.i, fr.n, o, EA.H, -1) : spec.build(L, fr.f, o, EA.H)) || L; c.drawImage(out.canvas(), x * spec.w, y * spec.h); }));
        return cv.toDataURL('image/png');
      }, [id, FAM[id][0]]);
      await toWebp(r1, path.join(docDir, 'sheet_' + id + '.webp'));
    } else await toWebp(r.url, path.join(docDir, 'sheet_' + id + '.webp'));
    await toWebp(r.keys, path.join(docDir, 'keys_' + id + '.webp'));
  }
}
fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
console.log(errors.length ? 'page errors: ' + errors.join(' | ') : 'no page errors');
await b.close(); srv.close();
