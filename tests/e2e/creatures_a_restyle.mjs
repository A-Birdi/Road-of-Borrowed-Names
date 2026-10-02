// Creatures A restyle: before / after sheets per item (an enemy id in its own palette), from two
// BUILT pages — the current index.html ("after") and an earlier build ("before", by default
// tests/e2e/out/before_index.html, a copy of index.html built from the commit before the
// restyle). Each sheet: the idle drawing and each move's key pose at native size (1×) before and
// after, then the idle drawing and two key poses at 3×.
//
// --ref <png|webp> adds the art-direction reference image beside the 3× row, for a side-by-side
// read of the craft. Such sheets are written ONLY to tests/e2e/out/creatures_a_restyle/ (never to
// docs/): the reference is the owner's and is not committed.
//
// Usage: node tests/e2e/creatures_a_restyle.mjs [enemy-id …] [--before <html>] [--ref <img>] [--docs]
//        (no ids: every enemy of the area's families; --docs writes WebP copies without the
//        reference to docs/screenshots/battle/creatures_a_restyle/)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ids = args.filter((a, i) => !a.startsWith('--') && !['--before', '--ref'].includes(args[i - 1]));
const beforeHtml = opt('--before') || 'tests/e2e/out/before_index.html';
const refPath = opt('--ref');
const toDocs = args.includes('--docs');
const outDir = path.join(root, 'tests', 'e2e', 'out', 'creatures_a_restyle');
const docDir = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_a_restyle');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docDir, { recursive: true });

const { srv, url } = await serve();
const b = await launch();
const after = await page(b, url, { viewport: { width: 1400, height: 900 } });
const hasBefore = fs.existsSync(path.join(root, beforeHtml));
const before = hasBefore ? await page(b, url + beforeHtml.replace(/^\/+/, ''), { viewport: { width: 1400, height: 900 } }) : null;
if (!hasBefore) console.log('(no before build at ' + beforeHtml + ': after only)');

// the frames of one enemy: idle (first and middle drawing) and each move's key pose
async function frames(pg, id) {
  return pg.evaluate((id) => {
    const EA = RB.enemyArt, e = RB.content.enemies[id], fam = e.art, spec = EA.P[fam], o = Object.assign({}, e.artOpts || {});
    const kinds = new Set();
    const add = (k) => kinds.add(String(k).split(':')[0]);
    (e.pattern || []).forEach(add); (e.phases || []).forEach((ph) => (ph.pattern || []).forEach(add)); Object.keys(e.intents || {}).forEach(add);
    const seq = spec.seq || [...Array(spec.frames || 1).keys()];
    const cells = [{ label: 'idle', cv: EA.frame(fam, seq[0], o) }, { label: 'idle·' + Math.floor(seq.length / 3), cv: EA.frame(fam, seq[Math.floor(seq.length / 3)], o) }];
    const posed = (act, fm, i) => {
      const c = document.createElement('canvas'); c.width = spec.w; c.height = spec.h;
      EA.drawPosed(c.getContext('2d'), fam, 0, o, spec.ox, spec.oy - (spec.dy || 0), 1, false, { act, family: fm ? fm + '@' + i : null, k: 0.5, dir: { x: -0.8, y: 0.6 } });
      return c;
    };
    for (const k of [...kinds].filter((k) => k !== 'rest').sort()) {
      const cand = ['exec.' + k, 'cast.' + k].find((x) => spec.poses && (spec.poses[x] || (spec.alias && spec.alias[x])));
      if (!cand) continue;
      const key = spec.alias && spec.alias[cand] ? spec.alias[cand] : cand, n = spec.poses[key];
      const i = key.startsWith('exec') ? n - 1 : Math.floor(n / 2);
      const [act, fm] = cand.split('.');
      cells.push({ label: k, cv: posed(act, fm, i) });
      if (k === 'strike' && spec.poses['prep.strike']) cells.splice(cells.length - 1, 0, { label: 'strike aim', cv: posed('prep', 'strike', spec.poses['prep.strike'] - 1) });
    }
    if (spec.poses && spec.poses.recoil) cells.push({ label: 'recoil', cv: posed('recoil', null, 0) });
    return { fam, w: spec.w, h: spec.h, name: e.name && e.name.en, cells: cells.map((c) => { const k = document.createElement('canvas'); k.width = c.cv.width; k.height = c.cv.height; k.getContext('2d').drawImage(c.cv, 0, 0); return { label: c.label, url: k.toDataURL('image/png') }; }) };
  }, id);
}

// --bounds: per family, the union of the drawn pixels over every idle and posed frame, and the
// frames whose drawing touches the canvas edge (clipped)
if (args.includes('--bounds')) {
  const fams = ids.length ? ids : ['moth', 'wisp', 'echo', 'blot', 'crab', 'golem', 'crane', 'sg_letter', 'clerk', 'warden'];
  const r = await (args.includes("--of-before") && before ? before : after).p.evaluate((fams) => fams.map((fam) => {
    const EA = RB.enemyArt, spec = EA.P[fam];
    const ids = Object.keys(RB.content.enemies).filter((id) => RB.content.enemies[id].art === fam);
    const o = Object.assign({}, (RB.content.enemies[ids[0]] || {}).artOpts || {});
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; const clipped = [];
    const scan = (cv, label) => {
      const k = document.createElement('canvas'); k.width = cv.width; k.height = cv.height; const g = k.getContext('2d'); g.drawImage(cv, 0, 0);
      const d = g.getImageData(0, 0, k.width, k.height).data;
      let a0 = 1e9, b0 = 1e9, a1 = -1, b1 = -1;
      for (let y = 0; y < k.height; y++) for (let x = 0; x < k.width; x++) if (d[(y * k.width + x) * 4 + 3] > 8) { if (x < a0) a0 = x; if (x > a1) a1 = x; if (y < b0) b0 = y; if (y > b1) b1 = y; }
      if (a1 < 0) return;
      x0 = Math.min(x0, a0); y0 = Math.min(y0, b0); x1 = Math.max(x1, a1); y1 = Math.max(y1, b1);
      if (a0 === 0 || b0 === 0 || a1 === k.width - 1 || b1 === k.height - 1) clipped.push(label + ' [' + a0 + ',' + b0 + '–' + a1 + ',' + b1 + ']');
    };
    const seq = [...new Set(spec.seq || [...Array(spec.frames).keys()])];
    for (const f of seq) scan(EA.frame(fam, f, o), 'idle' + f);
    const idleBox = [x0, y0, x1, y1];
    for (const key of Object.keys(spec.poses || {})) for (let i = 0; i < spec.poses[key]; i++) {
      const c = document.createElement('canvas'); c.width = spec.w; c.height = spec.h;
      const [act, fm] = key.split('.');
      EA.drawPosed(c.getContext('2d'), fam, 0, o, spec.ox, spec.oy - (spec.dy || 0), 1, false, { act, family: fm ? fm + '@' + i : null, k: (i + 0.5) / spec.poses[key], dir: { x: -0.8, y: 0.6 } });
      scan(c, key + '#' + i);
    }
    const ex = EA.extent(fam, o);
    return { fam, extent: [ex.left, ex.top, ex.right, ex.bottom, ex.right - ex.left, ex.bottom - ex.top], frame: spec.w + '×' + spec.h, origin: [spec.ox, spec.oy], idle: idleBox, idleSize: [idleBox[2] - idleBox[0] + 1, idleBox[3] - idleBox[1] + 1], all: [x0, y0, x1, y1], clipped };
  }), fams);
  for (const x of r) console.log(JSON.stringify(x));
  await b.close(); srv.close();
  process.exit(0);
}

const all = ids.length ? ids : await after.p.evaluate(() => Object.keys(RB.creaturesA.audit.enemies).sort((a, b) => (RB.creaturesA.audit.enemies[a].art + a).localeCompare(RB.creaturesA.audit.enemies[b].art + b)));
const ref = refPath ? 'data:image/' + (refPath.endsWith('.webp') ? 'webp' : 'png') + ';base64,' + fs.readFileSync(refPath).toString('base64') : null;

for (const id of all) {
  const A = await frames(after.p, id);
  const B = before ? await frames(before.p, id).catch(() => null) : null;
  for (const withRef of ref ? [false, true] : [false]) {
    const out = await after.p.evaluate(async ([A, B, ref, id]) => {
      const load = (u) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = u; });
      const rows = [];
      if (B) rows.push({ tag: 'before', d: B, ims: await Promise.all(B.cells.map((c) => load(c.url))) });
      rows.push({ tag: 'after', d: A, ims: await Promise.all(A.cells.map((c) => load(c.url))) });
      const refIm = ref ? await load(ref) : null;
      const pad = 8, lab = 16, head = 26;
      const w1 = rows.reduce((m, r) => Math.max(m, pad + r.ims.reduce((s, im) => s + im.width + pad, 0) + 70), 0);
      // 3×: idle, strike aim/strike (or the first move) per row
      const pick = (r) => { const ix = [0]; const s = r.d.cells.findIndex((c) => c.label === 'strike'); ix.push(s > 0 ? s : Math.min(2, r.ims.length - 1)); const a = r.d.cells.findIndex((c) => c.label === 'strike aim'); if (a > 0) ix.splice(1, 0, a); return ix.slice(0, 3); };
      const w3 = rows.reduce((m, r) => Math.max(m, pick(r).reduce((s, i) => s + r.ims[i].width * 3 + pad, pad + 70)), 0) + (refIm ? refIm.width + pad : 0);
      const h1 = rows.reduce((m, r) => m + Math.max(...r.ims.map((im) => im.height)) + lab + pad, 0);
      const h3 = rows.reduce((m, r) => m + Math.max(...pick(r).map((i) => r.ims[i].height * 3)) + lab + pad, 0);
      const cv = document.createElement('canvas');
      cv.width = Math.max(w1, w3); cv.height = head + h1 + Math.max(h3, refIm ? refIm.height + lab : 0) + pad * 2;
      const g = cv.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.fillStyle = '#4a4540'; g.fillRect(0, 0, cv.width, cv.height);
      g.fillStyle = '#f4ecd8'; g.font = 'bold 15px sans-serif';
      g.fillText(id + ' — ' + (A.name || '') + ' (' + A.fam + ')  ·  native ' + (B ? B.w + '×' + B.h + ' → ' : '') + A.w + '×' + A.h, pad, 18);
      let y = head;
      g.font = '11px sans-serif';
      for (const r of rows) {
        const hh = Math.max(...r.ims.map((im) => im.height));
        g.fillStyle = '#f4ecd8'; g.fillText(r.tag + ' 1×', pad, y + lab + 12);
        let x = pad + 62;
        r.ims.forEach((im, i) => {
          g.fillStyle = '#5a5550'; g.fillRect(x, y + lab, im.width, hh);
          g.drawImage(im, x, y + lab);
          g.fillStyle = '#f4ecd8'; g.fillText(r.d.cells[i].label, x + 2, y + 11);
          x += im.width + pad;
        });
        y += hh + lab + pad;
      }
      y += pad;
      const y3 = y;
      let xr = 0;
      for (const r of rows) {
        const ix = pick(r), hh = Math.max(...ix.map((i) => r.ims[i].height * 3));
        g.fillStyle = '#f4ecd8'; g.fillText(r.tag + ' 3×', pad, y + lab + 12);
        let x = pad + 62;
        for (const i of ix) {
          const im = r.ims[i];
          g.fillStyle = '#5a5550'; g.fillRect(x, y + lab, im.width * 3, hh);
          g.drawImage(im, x, y + lab, im.width * 3, im.height * 3);
          g.fillStyle = '#f4ecd8'; g.fillText(r.d.cells[i].label, x + 2, y + 11);
          x += im.width * 3 + pad;
        }
        xr = Math.max(xr, x);
        y += hh + lab + pad;
      }
      if (refIm) { g.fillStyle = '#f4ecd8'; g.fillText('art-direction reference (not committed)', xr, y3 + 11); g.drawImage(refIm, xr, y3 + lab); }
      return { png: cv.toDataURL('image/png'), webp: cv.toDataURL('image/webp', 0.92) };
    }, [A, B, withRef ? ref : null, id]);
    const tag = id.replace(/\./g, '-') + (withRef ? '_vs_reference' : '');
    fs.writeFileSync(path.join(outDir, 'restyle_' + tag + '.png'), Buffer.from(out.png.split(',')[1], 'base64'));
    if (toDocs && !withRef) fs.writeFileSync(path.join(docDir, 'sheet_' + tag + '.webp'), Buffer.from(out.webp.split(',')[1], 'base64'));
  }
  console.log(id, A.fam, A.w + '×' + A.h, A.cells.length + ' cells');
}
const errs = after.errors.concat(before ? before.errors : []);
console.log(errs.length ? 'page errors: ' + errs.join(' | ') : 'no page errors');
await b.close(); srv.close();
process.exit(errs.length ? 1 : 0);
