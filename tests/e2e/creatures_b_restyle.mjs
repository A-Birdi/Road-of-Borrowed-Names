// Creatures B restyle evidence (docs/battle/creatures_b.md, "Restyle"): before/after sheets of each
// family's key poses at native size and at 3×, rendered by two BUILT pages in Chromium — the
// current index.html ("after") and an earlier build saved beside it ("before"). Optionally an
// art-direction reference image is placed beside them (for review only: those sheets are written
// to the output folder, never to docs/, and the reference is never copied into the repository).
// Usage:
//   node tests/e2e/creatures_b_restyle.mjs sheets [family …] [--before <html path under repo>] [--ref <image>] [--docs]
//     before defaults to tests/e2e/out/restyle_b/before.html (build it from the earlier commit:
//     node tools/build.mjs --out tests/e2e/out/restyle_b/before.html)
//   writes tests/e2e/out/restyle_b/sheet_<family>.png (and _ref.png with --ref); with --docs a WebP
//   copy of the before/after sheet (without the reference) in docs/screenshots/battle/creatures_b_restyle/
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const toDocs = args.includes('--docs');
const mode = args[0] || 'sheets';
const valued = new Set(['--before', '--ref', '--scale', '--vp', '--name', '--map']);
const only = args.slice(1).filter((a, i) => !a.startsWith('--') && !valued.has(args[i]));
const outDir = path.join(root, 'tests', 'e2e', 'out', 'restyle_b');
const docDir = path.join(root, 'docs', 'screenshots', 'battle', 'creatures_b_restyle');
fs.mkdirSync(outDir, { recursive: true });
if (toDocs) fs.mkdirSync(docDir, { recursive: true });
const beforeRel = opt('--before', 'tests/e2e/out/restyle_b/before.html');
const refPath = opt('--ref', null);

// family → options of its enemies (one key-pose row per variant)
export const FAM = {
  sb_snowfox: [{}],
  fox: [{ col: '#e8d0a0' }],
  lf_keeper: [{ col: '#4a5a52' }],
  bell: [{ col: '#3c5c8a' }, { col: '#7a8a6a' }],
  lantern: [{ col: '#8ab8f0' }, { col: '#9aa8d8' }, { col: '#e8a060' }, { col: '#d8c0a0' }],
  sb_frostlamp: [{}],
  lf_conduit: [{ col: '#8a90c8' }],
  hush: [{}],
  sa_hush: [{}],
  atlas_cartographer: [{}],
  spirit: [{}],
};

// key poses of one family in one page: idle frame 0 and the held key of every move, plus two more
// idle frames; returns PNG data URLs of each frame (native size, transparent) and the frame size
async function keysOf(p, id, variants) {
  return p.evaluate(([id, variants]) => {
    const EA = RB.enemyArt, K = RB.pxkit, spec = EA.P[id], R = RB.creaturesB && RB.creaturesB.RIGS[id];
    if (!spec) return null;
    const seq = spec.seq || [...Array(spec.frames || 1).keys()];
    const idle = [...new Set(seq)];
    const keys = R ? Object.keys(R.poses).filter((a) => a.startsWith('key:')).sort() : [];
    const list = [{ f: idle[0], name: 'idle' }].concat(keys.map((a) => ({ act: a, i: 0, n: 1, name: a.slice(4) })), [{ act: 'recoil', i: 0, n: R ? R.poses.recoil : 1, name: 'recoil' }]);
    const out = variants.map((o) => list.map((fr) => {
      const L = K.layer(spec.w, spec.h, spec.ox, spec.oy);
      const t0 = performance.now();
      const res = (fr.act ? spec.pose(L, fr.act, fr.i, fr.n, o, EA.H, -1) : spec.build(L, fr.f, o, EA.H)) || L;
      const ms = performance.now() - t0;
      const cv = document.createElement('canvas'); cv.width = spec.w; cv.height = spec.h; cv.getContext('2d').drawImage(res.canvas(), 0, 0);
      return { name: fr.name, url: cv.toDataURL('image/png'), ms };
    }));
    return { w: spec.w, h: spec.h, ox: spec.ox, oy: spec.oy, rows: out };
  }, [id, variants]);
}

async function composeSheet(p, id, before, after, ref) {
  return p.evaluate(async ([id, before, after, ref]) => {
    const load = async (u) => { const im = new Image(); im.src = u; await im.decode(); return im; };
    // a frame cropped to the union of the drawn area of before and after (plus a margin)
    const crop = (im) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, im.width, im.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < im.height; y++) for (let x = 0; x < im.width; x++) if (d[(y * im.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return x1 < 0 ? [0, 0, im.width, im.height] : [x0, y0, x1 + 1, y1 + 1]; };
    const names = after.rows[0].map((r) => r.name);
    const B = before ? await Promise.all(before.rows[0].map((r) => load(r.url))) : [];
    const A = await Promise.all(after.rows[0].map((r) => load(r.url)));
    const bName = before ? before.rows[0].map((r) => r.name) : [];
    // the union box of every pose, per build (so poses line up at the same size)
    const box = (ims) => ims.reduce((m, im) => { const b = crop(im); return [Math.min(m[0], b[0]), Math.min(m[1], b[1]), Math.max(m[2], b[2]), Math.max(m[3], b[3])]; }, [1e9, 1e9, -1, -1]);
    const bb = B.length ? box(B) : null, ab = box(A);
    const pad = 6;
    const bw = bb ? bb[2] - bb[0] + pad * 2 : 0, bh = bb ? bb[3] - bb[1] + pad * 2 : 0, aw = ab[2] - ab[0] + pad * 2, ah = ab[3] - ab[1] + pad * 2;
    const R = ref ? await load(ref) : null;
    // layout: row 1 native (before poses | after poses), row 2 the idle and two key poses at 3×
    // (before | after), the reference (if given) at the right scaled to the 3× row's height
    const n = names.length, lab = 22;
    const w1 = (bb ? n * bw + 24 : 0) + n * aw;
    const pick = [0, Math.min(1, n - 1), Math.min(2, n - 1)].filter((v, i, a) => a.indexOf(v) === i);
    const h3 = Math.max(bh, ah) * 3;
    const w3 = (bb ? pick.length * bw * 3 + 24 : 0) + pick.length * aw * 3;
    const refW = R ? Math.round(R.width * (h3 / R.height)) : 0;
    const W = Math.max(w1, w3 + (R ? refW + 24 : 0)) + 16, H = lab + Math.max(bh, ah) + 16 + lab + h3 + 16;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#4e4640'; g.fillRect(0, 0, W, H);
    g.font = '13px monospace'; g.fillStyle = '#efe4c8';
    const put = (im, b, x, y, s) => g.drawImage(im, b[0] - pad, b[1] - pad, b[2] - b[0] + pad * 2, b[3] - b[1] + pad * 2, x, y, (b[2] - b[0] + pad * 2) * s, (b[3] - b[1] + pad * 2) * s);
    let x = 8, y = lab;
    if (bb) { g.fillText('before (1x)', x, 15); names.forEach((nm, i) => { const j = bName.indexOf(nm); if (j >= 0) put(B[j], bb, x + i * bw, y, 1); g.fillText(nm, x + i * bw + 2, y + bh - 2); }); x += n * bw + 24; }
    g.fillText('after (1x)', x, 15); names.forEach((nm, i) => { put(A[i], ab, x + i * aw, y, 1); g.fillText(nm, x + i * aw + 2, y + ah - 2); });
    y += Math.max(bh, ah) + 16 + lab; x = 8;
    if (bb) { g.fillText('before (3x)', x, y - 6); pick.forEach((i, k) => { const j = bName.indexOf(names[i]); if (j >= 0) put(B[j], bb, x + k * bw * 3, y, 3); }); x += pick.length * bw * 3 + 24; }
    g.fillText('after (3x): ' + pick.map((i) => names[i]).join(', '), x, y - 6); pick.forEach((i, k) => put(A[i], ab, x + k * aw * 3, y, 3));
    x += pick.length * aw * 3 + 24;
    if (R) { g.fillText('reference (art direction, not in the repository)', x, y - 6); g.drawImage(R, x, y, refW, h3); }
    return { png: cv.toDataURL('image/png'), webp: cv.toDataURL('image/webp', 0.92) };
  }, [id, before, after, ref]);
}

const { srv, url } = await serve();
const b = await launch();
const pA = await page(b, url, { viewport: { width: 1400, height: 900 } });
const hasBefore = fs.existsSync(path.join(root, beforeRel));
const pB = hasBefore ? await page(b, url + beforeRel, { viewport: { width: 1400, height: 900 } }) : null;
const ref = refPath && fs.existsSync(refPath) ? 'data:image/' + (refPath.endsWith('.webp') ? 'webp' : 'png') + ';base64,' + fs.readFileSync(refPath).toString('base64') : null;
if (mode === 'sheets') {
  const fams = only.length ? only : Object.keys(FAM);
  for (const id of fams) {
    if (!FAM[id]) { console.log('unknown family', id); continue; }
    const after = await keysOf(pA.p, id, FAM[id]);
    const before = pB ? await keysOf(pB.p, id, FAM[id]) : null;
    const s = await composeSheet(pA.p, id, before, after, null);
    fs.writeFileSync(path.join(outDir, 'sheet_' + id + '.png'), Buffer.from(s.png.split(',')[1], 'base64'));
    if (toDocs) fs.writeFileSync(path.join(docDir, 'sheet_' + id + '.webp'), Buffer.from(s.webp.split(',')[1], 'base64'));
    if (ref) { const r = await composeSheet(pA.p, id, before, after, ref); fs.writeFileSync(path.join(outDir, 'sheet_' + id + '_ref.png'), Buffer.from(r.png.split(',')[1], 'base64')); }
    const ms = after.rows[0].map((r) => r.ms).sort((a, b) => a - b);
    console.log(id, after.w + 'x' + after.h, 'key frames built: median', ms[ms.length >> 1].toFixed(1), 'ms, max', ms[ms.length - 1].toFixed(1), 'ms');
  }
}
// battle: the decision view of a real battle (diagnostic fixture: a synthetic campaign, the battle
// started directly with Mio) at one or more viewports, with this build and the before build:
//   node tests/e2e/creatures_b_restyle.mjs battle <enemy>[,<group enemy>…] [--vp 1920x1080,1280x800,390x844] [--name n] [--docs]
if (mode === 'battle') {
  const ids = (only[0] || 'sb.fox').split(',');
  const vps = opt('--vp', '1920x1080,1280x800,390x844').split(',').map((v) => v.split('x').map(Number));
  const name = opt('--name', ids.join('+'));
  // where the battle happens (the backdrop is composed from the real place): map:x:y
  const [mapId, mx, my] = opt('--map', 'rw.millroad:10:22').split(':');
  for (const [w, h] of vps) {
    for (const [tag, rel] of [['after', ''], ['before', hasBefore ? beforeRel : null]]) {
      if (rel == null) continue;
      const { p, ctx, errors } = await page(b, url + rel, { viewport: { width: w, height: h } });
      await p.evaluate(([ids, mapId, mx, my]) => {
        const s = RB.game.debugStart(mapId, +mx, +my, { comp: 'mio' });
        s.learn.kanaKnown = 'both'; s.learn.profile = 'E';
        s.tips = Object.assign({ harmony: 1, harmonyFull: 1, cturn: 1, group: 1 }, ...['strike', 'sweep', 'rest', 'heat', 'shroud', 'charge', 'gust', 'mend', 'lie', 'plea', 'flood', 'chill', 'silence', 'mirror'].map((k) => ({ ['intent:' + k]: 1 })));
        RB.game.settings.input = 'choice';
        RB.game.applySettings();
        RB.game.startBattle(ids[0], ids.length > 1 ? { group: ids.slice(1) } : {});
      }, [ids, mapId, mx, my]);
      for (let i = 0; i < 300; i++) {
        const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]') && !RB.battleSeq.busy(), coach: !!document.querySelector('[data-coach-ok]'), teach: !!document.querySelector('button[data-ok]') }));
        if (st.cards) break;
        if (st.coach) await p.click('[data-coach-ok]').catch(() => {});
        if (st.teach) await p.click('button[data-ok]').catch(() => {});
        if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
        await p.waitForTimeout(50);
      }
      await p.waitForTimeout(700);
      const f = path.join(outDir, 'battle_' + name + '_' + w + 'x' + h + '_' + tag + '.png');
      await p.screenshot({ path: f });
      if (toDocs && tag === 'after') {
        const webp = await p.evaluate(async (u) => { const im = new Image(); im.src = u; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/webp', 0.9); }, 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
        fs.writeFileSync(path.join(docDir, 'battle_' + name + '_' + w + 'x' + h + '.webp'), Buffer.from(webp.split(',')[1], 'base64'));
      }
      if (errors.length) console.log('page errors (' + tag + ' ' + w + 'x' + h + '): ' + errors.join(' | '));
      console.log('captured', path.basename(f));
      await ctx.close();
    }
  }
}
const errs = pA.errors.concat(pB ? pB.errors : []);
console.log(errs.length ? 'page errors: ' + errs.join(' | ') : 'no page errors');
await b.close(); srv.close();
