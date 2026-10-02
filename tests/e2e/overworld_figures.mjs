// The overworld player across the appearance registry (battle addendum §7.6 as it applies to the road sprites,
// §20): in the BUILT game, headless Chromium, no save touched.
//  - full-registry composition: every hairstyle × every clothing cut (pairwise), every creation accessory and
//    every keepsake worn at least once with each cut, every skin tone and hair colour — in all four directions
//    and every frame (stand, steps, blink, the eight-phase walk, idle breathing; a turn's pivot uses these
//    frames): nothing is clipped by the frame, no figure is taller than an adult with a hat (56 art px with the
//    outline; the frame is 40×58 with the foot anchor at (20, 55)), the sole sits on the same row in every frame
//    of a direction, and no frame fails to draw;
//  - eight deliberately different player configurations (the auburn-haired, glasses-and-flower, green-outfit
//    test appearance among them) drawn on the road in four directions and walking, beside the same look's
//    battle figure (the one appearance source both use) — a gallery for visual review.
// Writes tests/e2e/out/battle_pets_overworld/figures_gallery.png and figures_report.json.
// Usage: node tests/e2e/overworld_figures.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const outDir = path.join(root, 'tests/e2e/out/battle_pets_overworld');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const r = await p.evaluate(() => {
  const SP = RB.sprites;
  const SHAPES = ['tunic', 'robe', 'coat', 'apron', 'dress'];
  const keep = Object.keys(RB.content.items || {}).filter((id) => RB.content.items[id].acc);
  const looks = [];
  // pairwise: hairstyle × cut, with accessories, skin, hair colour and clothing cycling through their registries
  const A = SP.ACCESSORIES;
  let k = 0;
  for (const hair of SP.HAIRSTYLES) for (const shape of SHAPES) {
    looks.push({ skin: k % SP.SKIN.length, hair, hairColor: k % SP.HAIR.length, outfit: k % SP.CLOTH.length, shape, acc: [A[k % A.length], A[(k + 3) % A.length]] });
    k++;
  }
  // every accessory with every cut, alone
  for (const a of A) for (const shape of SHAPES) looks.push({ skin: 2, hair: 'long', hairColor: 3, outfit: 2, shape, acc: [a] });
  // every keepsake (worn through the equipment source), with each cut
  for (const id of keep) for (const shape of SHAPES) looks.push(RB.equip.lookWith ? RB.equip.lookWith({ skin: 4, hair: 'bun', hairColor: 0, outfit: 6, shape, acc: ['scarf'] }, id) : null);
  // a child and an older adult (NPC sizes on the same rig)
  looks.push({ skin: 1, hair: 'twintails', hairColor: 4, outfit: 3, shape: 'dress', size: 'child', acc: ['ribbon'] });
  looks.push({ skin: 5, hair: 'shaved', hairColor: 5, outfit: 5, shape: 'robe', age: 'old', acc: ['cane', 'beard'] });
  const frames = [0, 1, 2, 3, 'w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'i0', 'i1', 'i2', 'i3', 'i1b'];
  const W = SP.FRAME.w, H = SP.FRAME.h;
  const bbox = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 100) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
  const problems = [], heights = [];
  let drawn = 0;
  for (const look of looks.filter(Boolean)) for (const dir of ['down', 'up', 'left', 'right']) {
    const soles = new Set();
    for (const f of frames) {
      let cv = null;
      try { cv = SP.getArt(look, dir, f); } catch (e) { problems.push('throws ' + JSON.stringify(look) + ' ' + dir + ' ' + f + ': ' + e.message); continue; }
      if (!cv) { problems.push('no frame ' + JSON.stringify(look) + ' ' + dir + ' ' + f); continue; }
      drawn++;
      const [x0, y0, x1, y1] = bbox(cv);
      if (x0 < 0 || x0 === 0 || x1 >= W - 1 || y0 <= 0) problems.push('clipped ' + JSON.stringify(look) + ' ' + dir + ' ' + f + ' ' + [x0, y0, x1, y1]);
      const hgt = y1 - y0 + 1; heights.push(hgt);
      if (hgt > 56) problems.push('tall ' + hgt + ' ' + JSON.stringify(look) + ' ' + dir + ' ' + f);
      soles.add(y1);
    }
    if (soles.size > 1) problems.push('the sole moves ' + [...soles] + ' ' + JSON.stringify(look) + ' ' + dir);
  }
  // the gallery: eight deliberately different players, road (4 directions, a walk step, idle) beside battle
  const G = [
    { name: 'auburn, glasses, flower, green', look: { skin: 1, hair: 'wavy', hairColor: 3, outfit: 2, shape: 'tunic', acc: ['glasses', 'flower'] } },
    { name: 'dark skin, long hair, hat, scarf', look: { skin: 6, hair: 'long', hairColor: 0, outfit: 5, shape: 'coat', acc: ['hat', 'scarf'] } },
    { name: 'twin tails, apron, headband, earrings', look: { skin: 0, hair: 'twintails', hairColor: 4, outfit: 1, shape: 'apron', acc: ['headband', 'earrings'] } },
    { name: 'shaved, robe, cape, satchel', look: { skin: 4, hair: 'shaved', hairColor: 1, outfit: 3, shape: 'robe', acc: ['cape', 'satchel'] } },
    { name: 'curly, teal hair, coat', look: { skin: 3, hair: 'curly', hairColor: 8, outfit: 7, shape: 'coat', acc: ['glasses'] } },
    { name: 'braid, white hair, tunic', look: { skin: 2, hair: 'braid', hairColor: 6, outfit: 6, shape: 'tunic', acc: ['scarf', 'flower'] } },
    { name: 'spiky, plum hair, apron', look: { skin: 5, hair: 'spiky', hairColor: 9, outfit: 4, shape: 'apron', acc: ['hat'] } },
    { name: 'head wrap, robe', look: { skin: 6, hair: 'wrap', hairColor: 2, outfit: 0, shape: 'robe', acc: ['earrings', 'satchel'] } },
  ];
  const SC = 3, CW = W * SC, CH = H * SC;
  const cv = document.createElement('canvas'); cv.width = 12 + 7 * (CW + 4) + 110 * SC; cv.height = G.length * (CH + 24);
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#7f9a62'; c.fillRect(0, 0, cv.width, cv.height);
  c.font = '15px sans-serif';
  G.forEach((g, i) => {
    const y = i * (CH + 24);
    c.fillStyle = '#1c2530'; c.fillText(g.name, 8, y + 16);
    ['down', 'left', 'up', 'right'].forEach((d, j) => c.drawImage(SP.getArt(g.look, d, 0), 8 + j * (CW + 4), y + 20, CW, CH));
    c.drawImage(SP.getArt(g.look, 'right', 'w2'), 8 + 4 * (CW + 4), y + 20, CW, CH);
    c.drawImage(SP.getArt(g.look, 'down', 'w6'), 8 + 5 * (CW + 4), y + 20, CW, CH);
    c.drawImage(SP.getArt(g.look, 'down', 'i1'), 8 + 6 * (CW + 4), y + 20, CW, CH);
    // the same look in battle (scale 1 there is the same art grid; drawn here at 1.5x so it fits the row)
    const bf = RB.battlers.preview(g.look, 'ready', null, 0);
    c.drawImage(bf, 8 + 7 * (CW + 4), y + 20 + CH - bf.height * 1.5 * SC / 2, bf.width * 1.5 * SC / 2, bf.height * 1.5 * SC / 2);
  });
  return { looks: looks.filter(Boolean).length, keepsakes: keep.length, drawn, problems, maxH: Math.max(...heights), minH: Math.min(...heights), url: cv.toDataURL('image/png') };
});
fs.writeFileSync(path.join(outDir, 'figures_gallery.png'), Buffer.from(r.url.split(',')[1], 'base64'));
delete r.url;
fs.writeFileSync(path.join(outDir, 'figures_report.json'), JSON.stringify(Object.assign(r, { errors }), null, 1));
console.log('looks ' + r.looks + ' (keepsakes ' + r.keepsakes + '), frames drawn ' + r.drawn + ', figure heights ' + r.minH + '–' + r.maxH + ' art px, problems ' + r.problems.length + (r.problems.length ? ':\n  ' + r.problems.slice(0, 12).join('\n  ') : '') + (errors.length ? '\npage errors: ' + errors.join(' | ') : ''));
await ctx.close(); await b.close(); srv.close();
process.exit(r.problems.length || errors.length ? 1 : 0);
