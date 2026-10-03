// Contact sheets for the Harmony portrait art (Harmony addendum §20.4, §23.3, §23.4): a development QA viewer,
// not a player-facing screen. Every sheet is labelled: the looks are SYNTHETIC FIXTURES generated from the
// registries (RB.harmonyArtFixtures), not saved campaigns or real play; the placement mocks lay the art over
// an existing battle capture to show its size at a display scale (placement belongs to the cut-in overlay).
//   node tests/e2e/harmony_art_sheets.mjs        → docs/screenshots/harmony/art/*.webp
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'docs/screenshots/harmony/art');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const browser = await launch();
const { p, errors } = await page(browser, url, { viewport: { width: 1280, height: 720 } });

// background captures for the placement mocks (existing evidence of the real battle frame)
const bg = (f) => 'data:image/webp;base64,' + fs.readFileSync(path.join(root, f)).toString('base64');
const BG = { wide: bg('docs/screenshots/battle/party_restyle/battle_1920x1080.webp'), phone: bg('docs/screenshots/battle/party_restyle/battle_390x844_three_cat.webp') };

const sheets = await p.evaluate(async (BG) => {
  const HA = RB.harmonyArt, FX = RB.harmonyArtFixtures, list = FX.fixtures();
  const acceptance = list.find((f) => f.id === 'acceptance_green_auburn');
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
  const label = (g, x, y, s, size, col) => { g.font = (size || 12) + 'px sans-serif'; g.fillStyle = col || '#e8e2d0'; g.fillText(s, x, y); };
  const out = {};
  const finish = (name, c) => { out[name] = c.toDataURL('image/webp', 0.9); };
  const BGC = '#3a3f52';
  // 1–3: the four pairings, both phases (standard 3×, compact 2×), and the art alone (no backing, no glints)
  const pairs = (name, variant, sc, o) => {
    const N = HA.NATIVE[variant], cw = N.w * sc, ch = N.h * sc, pad = 14, top = 40;
    const phases = o && o.phases ? o.phases : ['enter', 'hold'];
    const [c, g] = mk(pad + phases.length * (cw + pad), top + 4 * (ch + pad + 18));
    g.fillStyle = BGC; g.fillRect(0, 0, c.width, c.height);
    label(g, pad, 22, o && o.backing === false ? 'SYNTHETIC FIXTURE — the art alone (backing, glints off), 3× — not gameplay' : 'SYNTHETIC FIXTURE (' + acceptance.id + '), ' + variant + ' ' + N.w + '×' + N.h + ', ' + sc + '× — not gameplay', 13);
    HA.COMPANIONS.forEach((comp, r) => phases.forEach((phase, k) => {
      const cc = HA.compose(Object.assign({ comp, look: acceptance.look, phase, variant }, o || {}));
      const x = pad + k * (cw + pad), y = top + r * (ch + pad + 18);
      label(g, x, y + 12, comp + ' · ' + phase + (phase === 'enter' ? ' (arriving: crossing)' : ' (held gesture)'));
      g.drawImage(cc.cv, x, y + 18, cw, ch);
    }));
    finish(name, c);
  };
  pairs('pairings_standard_3x', 'standard', 3);
  pairs('pairings_compact_2x', 'compact', 2);
  pairs('pairings_art_only_3x', 'standard', 3, { backing: false, fx: false, phases: ['hold'] });
  // 4–5: every fixture's player bust (hold, and the crossing arrival), cropped to the figure, at 2×
  const busts = (name, phase, variant) => {
    const cols = 7, sc = 2, cw = 128 * sc, ch = 100 * sc, pad = 10, top = 40;
    const rows = Math.ceil(list.length / cols);
    const [c, g] = mk(pad + cols * (cw + pad), top + rows * (ch + pad + 16));
    g.fillStyle = BGC; g.fillRect(0, 0, c.width, c.height);
    label(g, pad, 22, 'SYNTHETIC FIXTURES (' + list.length + ', generated from the registries) — the player\'s bust, ' + phase + (phase === 'enter' ? ' (crossing)' : ' (hold)') + ', ' + variant + ', 2× — not gameplay', 13);
    list.forEach((f, i) => {
      const b = HA.bust('pc', f.look, 'rally', phase, variant);
      const x = pad + (i % cols) * (cw + pad), y = top + Math.floor(i / cols) * (ch + pad + 16);
      label(g, x, y + 11, f.id + (f.item ? '' : ''), 11, f.group === 'stress' ? '#f0c878' : f.group === 'keepsake' ? '#a8d0f0' : '#e8e2d0');
      g.drawImage(b.cv, 22, 0, 128, 100, x, y + 16, cw, ch);
    });
    finish(name, c);
  };
  busts('appearance_hold_2x', 'hold', 'standard');
  busts('appearance_crossing_2x', 'enter', 'standard');
  // 6: every fixture in the compact pairing (companions in turn), hold, 2×
  {
    const N = HA.NATIVE.compact, cols = 5, sc = 2, cw = N.w * sc, ch = N.h * sc, pad = 10, top = 40;
    const rows = Math.ceil(list.length / cols);
    const [c, g] = mk(pad + cols * (cw + pad), top + rows * (ch + pad + 16));
    g.fillStyle = BGC; g.fillRect(0, 0, c.width, c.height);
    label(g, pad, 22, 'SYNTHETIC FIXTURES — compact pairing (' + N.w + '×' + N.h + '), hold, 2×, companions in turn — not gameplay', 13);
    list.forEach((f, i) => {
      const cc = HA.compose({ comp: HA.COMPANIONS[i % 4], look: f.look, phase: 'hold', variant: 'compact' });
      const x = pad + (i % cols) * (cw + pad), y = top + Math.floor(i / cols) * (ch + pad + 16);
      label(g, x, y + 11, f.id + ' + ' + HA.COMPANIONS[i % 4], 11);
      g.drawImage(cc.cv, x, y + 16, cw, ch);
    });
    finish('appearance_compact_2x', c);
  }
  // 7: the size study: the native cluster beside the same look's battle figure (RB.battlers, 80 × 104) and
  // dialogue portrait (RB.portraits, 96 × 96) at 1×, 2× and 3×, so the art's pixel density can be compared
  // with the figures it plays beside
  {
    const look = acceptance.look, pad = 16, top = 40;
    const cc = HA.compose({ comp: 'suzu', look, phase: 'hold' });
    const fig = RB.battlers.preview(look, 'ready', null, 0);
    const por = RB.portraits.playerImage(look, 'smile');
    const scales = [1, 2, 3];
    const W = pad + scales.reduce((a, s) => a + (cc.w + fig.width + 96) * s + 3 * pad, 0);
    const H = top + 3 * 104 + 40;
    const [c, g] = mk(W, H);
    g.fillStyle = BGC; g.fillRect(0, 0, c.width, c.height);
    label(g, pad, 22, 'SIZE STUDY (synthetic fixture ' + acceptance.id + '): the native cluster ' + cc.w + '×' + cc.h + ' beside the same look\'s battle figure (80×104) and dialogue portrait (96×96), each at 1×, 2×, 3×', 13);
    let x = pad;
    for (const s of scales) {
      label(g, x, top + 12, s + '×', 12);
      g.drawImage(cc.cv, x, top + 20, cc.w * s, cc.h * s); x += cc.w * s + pad;
      g.drawImage(fig, x, top + 20, fig.width * s, fig.height * s); x += fig.width * s + pad;
      g.drawImage(por, x, top + 20, 96 * s, 96 * s); x += 96 * s + pad;
    }
    finish('size_study', c);
  }
  // 8: placement mocks at display scale over existing battle captures (the overlay decides real placement)
  const img = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = src; });
  const wide = await img(BG.wide), phone = await img(BG.phone);
  const mock = (name, vw, vh, variant, bgImg, comp, phase) => {
    const [c, g] = mk(vw, vh);
    g.imageSmoothingEnabled = true; g.drawImage(bgImg, 0, 0, vw, vh); g.imageSmoothingEnabled = false;
    const cc = HA.compose({ comp, look: acceptance.look, phase: phase || 'hold', variant });
    const s = HA.fitScale(vw, vh, variant);
    const y = Math.round(vh * (variant === 'compact' ? 0.3 : 0.42) - cc.anchor.y * s);
    g.drawImage(cc.cv, 0, y, cc.w * s, cc.h * s);
    g.fillStyle = 'rgba(10,12,24,0.72)'; g.fillRect(0, vh - 26, vw, 26);
    const vis = cc.bounds;
    label(g, 8, vh - 9, 'PLACEMENT MOCK over an existing battle capture — ' + vw + '×' + vh + ', ' + variant + ' at ' + s + '× (' + Math.round(vis.w * s / vw * 100) + '% × ' + Math.round(vis.h * s / vh * 100) + '% visible); placement is the overlay\'s', variant === 'compact' ? 10 : 13);
    finish(name, c);
  };
  mock('scale_1280x720_suzu', 1280, 720, 'standard', wide, 'suzu');
  mock('scale_1648x840_ren', 1648, 840, 'standard', wide, 'ren');
  mock('scale_1920x1080_mio', 1920, 1080, 'standard', wide, 'mio');
  mock('scale_390x844_nao_compact', 390, 844, 'compact', phone, 'nao');
  return out;
}, BG);

let bytes = 0;
for (const [name, data] of Object.entries(sheets)) {
  const buf = Buffer.from(data.split(',')[1], 'base64');
  fs.writeFileSync(path.join(OUT, name + '.webp'), buf);
  bytes += buf.length;
  console.log(name + '.webp', (buf.length / 1024).toFixed(0) + ' KiB');
}
console.log('total', (bytes / 1024).toFixed(0), 'KiB; page errors:', errors.length ? errors : 'none');
await browser.close(); srv.close();
process.exit(errors.length ? 1 : 0);
