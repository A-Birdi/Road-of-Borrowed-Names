// Art review captures of the BUILT index.html: world scenes per region and
// specimen sheets (every tile per palette, every prop, character sprites in all
// directions/frames, portraits). For inspecting art quality; not a pass/fail test.
// Usage: node tests/e2e/art_shots.mjs <outdir> [--maps id,id] [--vp 1280x800]
//        [--sheets tiles,props,sprites,portraits] [--no-maps] [--no-sheets] [--html index.html]
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, root } from './lib.mjs';

const argv = process.argv.slice(2);
const outDir = path.resolve(argv[0] && !argv[0].startsWith('--') ? argv[0] : path.join(root, 'tests/e2e/out/art'));
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const DEFAULT_MAPS = [
  'rw.village', 'rw.road', 'rw.hall', 'rw.tea', 'sg.harbor', 'sg.cove', 'sg.inn', 'sg.da_stacks', 'co.village', 'co.kiln', 'co.pottery',
  'sb.hamlet', 'sb.obs_path', 'sb.inn', 'lf.town', 'lf.gardens', 'lf.records', 'sa.road', 'sa.camp', 'sa.memories', 'sa.hut',
];
const maps = argv.includes('--no-maps') ? [] : opt('--maps', DEFAULT_MAPS.join(',')).split(',').filter(Boolean);
const sheets = argv.includes('--no-sheets') ? [] : opt('--sheets', 'tiles,props,sprites,portraits').split(',').filter(Boolean);
const [vw, vh] = opt('--vp', '1280x800').split('x').map(Number);
const htmlPath = path.resolve(root, opt('--html', 'index.html'));
fs.mkdirSync(outDir, { recursive: true });
const html = fs.readFileSync(htmlPath, 'utf8');
const srv = http.createServer((req, res) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const url = 'http://127.0.0.1:' + srv.address().port + '/';
const browser = await chromium.launch();

async function fresh(w, h, dpr) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr || 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  await p.waitForFunction(() => window.__RB_READY__);
  return { ctx, p, errors };
}

// ---- world scenes ------------------------------------------------------------------------
for (const id of maps) {
  const { ctx, p, errors } = await fresh(vw, vh, 1);
  const info = await p.evaluate((mid) => {
    const m = RB.maps.compile(mid);
    // start near the middle on a walkable tile
    let best = [Math.floor(m.w / 2), Math.floor(m.h / 2)], bd = 1e9;
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      if (m.tiles[y * m.w + x].walk && !RB.maps.blockedStatic(m, x, y)) {
        const d = Math.abs(x - m.w / 2) + Math.abs(y - m.h / 2);
        if (d < bd) { bd = d; best = [x, y]; }
      }
    }
    RB.game.debugStart(mid, best[0], best[1], { comp: 'mio', flags: { departed: true, ch1_done: true } });
    RB.game.settings.lightbulb = false;
    document.querySelectorAll('.hud, .touchpad').forEach((e) => e.classList.add('hidden'));
    return { w: m.w, h: m.h, region: m.region };
  }, id);
  await p.waitForTimeout(700);
  // close any arrival scene so the world is visible
  for (let i = 0; i < 20 && await p.evaluate(() => RB.ui.dialogue.isOpen()); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(60); }
  await p.evaluate(() => document.querySelectorAll('.hud, .touchpad, .dlg, .notices, .place').forEach((e) => e.classList.add('hidden')));
  await p.waitForTimeout(150);
  const t0 = Date.now();
  const frames = await p.evaluate(() => new Promise((res) => { let n = 0; const s = performance.now(); const f = () => { if (++n < 30) requestAnimationFrame(f); else res((performance.now() - s) / 30); }; requestAnimationFrame(f); }));
  void t0;
  const file = path.join(outDir, 'map_' + id + '.png');
  await p.screenshot({ path: file });
  console.log(`map ${id} (${info.region} ${info.w}x${info.h}) avg frame ${frames.toFixed(1)} ms` + (errors.length ? ' ERR ' + errors[0] : ''));
  await ctx.close();
}

// ---- specimen sheets -------------------------------------------------------------------
if (sheets.length) {
  const { ctx, p, errors } = await fresh(1600, 1000, 1);
  await p.evaluate(() => { RB.game.debugStart('rw.village', 22, 30, {}); });
  for (const kind of sheets) {
    const size = await p.evaluate((kind) => {
      const ART = RB.render.ART || 2, TS = 16, A = TS * ART;
      const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
      const label = (g, text, x, y) => { g.font = '11px sans-serif'; g.fillStyle = '#e8e0cc'; g.fillText(text, x, y); };
      const drawTile = (g, t, x, y, pal, tx, ty) => {
        const nb = () => t;
        if (t.draw2) t.draw2(g, x, y, pal, RB.tiles.hh(tx, ty), nb, tx, ty);
        else { g.save(); g.scale(ART, ART); t.draw(g, x / ART, y / ART, pal, RB.tiles.hh(tx, ty), nb); g.restore(); }
      };
      let cv, g;
      if (kind === 'tiles') {
        const pals = Object.keys(RB.tiles.PAL).filter((k) => k !== 'interior');
        const ids = Object.keys(RB.tiles.T);
        const cell = A * 2 + 10;
        [cv, g] = mk(120 + ids.length * cell, 24 + pals.length * (cell + 14));
        g.fillStyle = '#20222a'; g.fillRect(0, 0, cv.width, cv.height);
        ids.forEach((id, i) => label(g, id, 120 + i * cell, 14));
        pals.forEach((pk, r) => {
          const pal = RB.tiles.PAL[pk];
          const y0 = 24 + r * (cell + 14);
          label(g, pk, 6, y0 + A);
          ids.forEach((id, i) => {
            const t = RB.tiles.T[id];
            for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) drawTile(g, t, 120 + i * cell + dx * A, y0 + dy * A, pal, i * 2 + dx + 3, r * 2 + dy + 3);
          });
        });
      } else if (kind === 'props') {
        const pal = RB.tiles.PAL.reedwake;
        const ids = Object.keys(RB.props.P);
        const cols = 10, cw = A * 3 + 16, ch = A * 4 + 16;
        [cv, g] = mk(cols * cw, Math.ceil(ids.length / cols) * ch + 10);
        g.fillStyle = '#20222a'; g.fillRect(0, 0, cv.width, cv.height);
        ids.forEach((id, i) => {
          const pd = RB.props.P[id];
          const x0 = (i % cols) * cw + 8, y0 = Math.floor(i / cols) * ch + 8;
          for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) drawTile(g, RB.tiles.T.grass, x0 + x * A, y0 + A * 0.5 + y * A, pal, x, y);
          const px = x0, py = y0 + A * 1.5;
          const o = { cx: i, cy: 0, still: true };
          if (pd.draw2) pd.draw2(g, px, py, pal, 0, o);
          else { g.save(); g.scale(ART, ART); pd.draw(g, px / ART, py / ART, pal, 0, o); g.restore(); }
          label(g, id + ' ' + pd.w + '×' + pd.h, x0, y0 + ch - 12);
        });
        // structures
        const S = RB.props.STRUCT, S2 = RB.props.STRUCT2 || {};
        const extra = mk(cv.width, cv.height + 360);
        extra[1].drawImage(cv, 0, 0);
        [cv, g] = extra;
        g.fillStyle = '#20222a'; g.fillRect(0, cv.height - 360, cv.width, 360);
        let sx = 10;
        for (const [kindS, w, h] of [['house', 6, 4], ['house', 4, 3], ['tower', 3, 5]]) {
          const o = { w, h, windows: [1, w - 2], door: Math.floor(w / 2), night: false, x: 0, y: 0, type: kindS };
          const y0 = cv.height - 350;
          if (S2[kindS]) S2[kindS](g, sx, y0 + 40, pal, 0, o);
          else { g.save(); g.scale(ART, ART); S[kindS](g, sx / ART, (y0 + 40) / ART, pal, 0, o); g.restore(); }
          label(g, kindS + ' ' + w + '×' + h, sx, y0 + 16);
          sx += w * A + 40;
        }
      } else if (kind === 'sprites') {
        const looks = [];
        for (const hs of RB.sprites.HAIRSTYLES) looks.push({ name: hs, look: { skin: looks.length % RB.sprites.SKIN.length, hair: hs, hairColor: looks.length % 8, outfit: looks.length % RB.sprites.CLOTH.length, shape: ['tunic', 'robe', 'apron', 'coat'][looks.length % 4], acc: [] } });
        for (const acc of RB.sprites.ACCESSORIES) looks.push({ name: acc, look: { skin: 2, hair: 'short', hairColor: 1, outfit: 3, shape: 'tunic', acc: [acc] } });
        for (const id of Object.keys(RB.content.chars)) { const ch = RB.content.chars[id]; if (ch.look) looks.push({ name: id, look: ch.look }); }
        for (const cu of Object.keys(RB.sprites.custom)) looks.push({ name: cu, look: { custom: cu } });
        const dirs = ['down', 'up', 'left', 'right'];
        const cw = 36 * 2 + 4, cols = 4;
        const colW = 90 + dirs.length * 3 * 36;
        const perCol = Math.ceil(looks.length / cols);
        [cv, g] = mk(colW * cols, perCol * 54 + 20);
        g.fillStyle = '#6a7a5a'; g.fillRect(0, 0, cv.width, cv.height);
        looks.forEach((L, i) => {
          const x0 = Math.floor(i / perCol) * colW, y0 = (i % perCol) * 54 + 6;
          label(g, L.name.slice(0, 12), x0 + 4, y0 + 30);
          dirs.forEach((d, di) => [0, 1, 2].forEach((f, fi) => {
            const art = RB.sprites.getArt && RB.sprites.getArt(L.look, d, f);
            const x = x0 + 90 + (di * 3 + fi) * 36;
            if (art) g.drawImage(art, x, y0); else g.drawImage(RB.sprites.get(L.look, d, f), x, y0, 32, 48);
          }));
        });
        void cw;
      } else if (kind === 'portraits') {
        const ids = Object.keys(RB.content.chars).filter((id) => RB.portraits.image(id, 'neutral'));
        const exprs = ['neutral', 'smile', 'sad', 'surprised', 'angry', 'thinking'];
        const cell = 104;
        [cv, g] = mk(110 + exprs.length * cell, ids.length * cell + 30);
        g.fillStyle = '#20222a'; g.fillRect(0, 0, cv.width, cv.height);
        exprs.forEach((e, i) => label(g, e, 110 + i * cell, 14));
        ids.forEach((id, r) => {
          label(g, id, 6, 30 + r * cell + 48);
          exprs.forEach((e, i) => {
            const img = RB.portraits.image(id, e);
            if (!img) return;
            g.fillStyle = '#2a3048'; g.fillRect(110 + i * cell, 22 + r * cell, 96, 96);
            g.drawImage(img, 110 + i * cell, 22 + r * cell, 96, 96);
          });
        });
      }
      cv.id = 'sheet';
      cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;image-rendering:pixelated;background:#20222a';
      document.getElementById('sheet') && document.getElementById('sheet').remove();
      document.body.appendChild(cv);
      return { w: cv.width, h: cv.height };
    }, kind);
    await p.setViewportSize({ width: Math.min(8000, size.w), height: Math.min(8000, size.h) });
    await p.waitForTimeout(100);
    const file = path.join(outDir, 'sheet_' + kind + '.png');
    await p.locator('#sheet').screenshot({ path: file });
    console.log('sheet ' + kind + ' ' + size.w + 'x' + size.h + (errors.length ? ' ERR ' + errors.join('; ') : ''));
  }
  await ctx.close();
}
await browser.close(); srv.close();
