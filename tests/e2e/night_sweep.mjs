// The night sweep (promised to Robin with C-86's light; P17): every map in every night or dark state the game
// has (a map's own darkness, or a story state's evening: `night`, or `ambient.dark` ≥ 0.3), with Light and shadow
// On and Off, measured and put on contact sheets for review. Synthetic sessions on the built index.html, creatures
// held off; the player stands where the map's middle is open floor (or its first spawn).
// Measures per picture (the world canvas only): the mean brightness (0–255), the share of crushed black (Y < 12),
// the brightest tenth (p90), and how much the player stands out from the ground around them (|ΔY|). A state is
// flagged when the On picture is much darker than Off (the light swallowing what the flat picture showed), when the
// player is hard to pick out, or when a night reads as day.
// Writes docs/screenshots/night/ (sheets and README.md with the table). Usage: node tests/e2e/night_sweep.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'docs/screenshots/night');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const { p, errors, ctx } = await page(b, url, { viewport: { width: 1280, height: 800 } });

// the states: [map, label, flags, vars]
const states = await p.evaluate(() => {
  const out = [];
  // a condition made true where it is plain flags and vars (the first alternative); null when it is not
  const make = (cond) => {
    const f = {}, v = {};
    for (const t of String(cond || '').split('|')[0].split('&').map((x) => x.trim()).filter(Boolean)) {
      let m;
      if ((m = /^!([A-Za-z_][\w]*)$/.exec(t))) f[m[1]] = false;
      else if ((m = /^var\.([\w]+)=(.+)$/.exec(t))) v[m[1]] = isNaN(+m[2]) ? m[2] : +m[2];
      else if ((m = /^([A-Za-z_][\w]*)$/.exec(t))) f[m[1]] = true;
      else if ((m = /^ed>=(\d)$/.exec(t))) { /* the shipped edition */ }
      else return null;
    }
    return { f, v };
  };
  for (const id of Object.keys(RB.content.maps).sort()) {
    const d = RB.content.maps[id];
    if (d.night || ((d.ambient || {}).dark >= 0.3)) out.push([id, 'own', {}, {}]);
    (d.alt || []).forEach((a, i) => {
      if (!(a.night || ((a.ambient || {}).dark >= 0.3))) return;
      const c = make(a.if);
      if (c) out.push([id, 'alt' + i + ' (' + a.if + ')', c.f, c.v]);
      else out.push([id, 'alt' + i + ' (' + a.if + ') NOT REPRODUCED', null, null]);
    });
  }
  return out;
});

const rows = [];
const shots = [];
for (const [map, label, flags, vars] of states) {
  if (!flags) { rows.push({ map, label, skipped: true }); continue; }
  const pair = {};
  for (const light of [true, false]) {
    const r = await p.evaluate(async ([map, flags, vars, light]) => {
      const def = RB.content.maps[map], m = RB.maps.compile(map);
      const f = Object.assign({ departed: true, ch1_done: true }, flags);
      for (const ev of def.onEnter || []) f['enter:' + map + ':' + ev.scene] = true;
      let X = m.w >> 1, Y = m.h >> 1;
      search: for (let r = 0; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (!RB.maps.blockedStatic(m, X + dx, Y + dy) && !RB.maps.exitAt(m, X + dx, Y + dy)) { X += dx; Y += dy; break search; }
      RB.game.settings.worldLight = light; RB.game.applySettings();
      const s = RB.game.debugStart(map, X, Y, { comp: 'nao', flags: f, dir: 'down', edition: RB.edition.forNew() });
      for (const k in f) if (f[k] === false) delete s.flags[k];
      Object.assign(s.vars, vars || {});
      RB.world.W.quietUntil = 1e15;
      RB.world.refreshActors(); RB.render.invalidate && RB.render.invalidate();
      for (let i = 0; i < 60 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((res) => setTimeout(res, 30)); }
      await new Promise((res) => setTimeout(res, 900));
      const amb = RB.render.ambientNow() || {};
      const cv = [...document.querySelectorAll('canvas')].sort((a, b2) => b2.width * b2.height - a.width * a.height)[0];
      const g = cv.getContext('2d'), W = cv.width, H = cv.height, d = g.getImageData(0, 0, W, H).data;
      const Yv = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      let sum = 0, n = 0, crushed = 0; const hist = new Uint32Array(256);
      for (let i = 0; i < d.length; i += 16) { const y = Yv(i); sum += y; n++; if (y < 12) crushed++; hist[Math.min(255, y | 0)]++; }
      let acc = 0, p90 = 0; for (let k = 0; k < 256; k++) { acc += hist[k]; if (acc >= n * 0.9) { p90 = k; break; } }
      // the player against the ground around them
      const pos = RB.render.tileToCss(RB.world.W.player.x, RB.world.W.player.y), k2 = W / cv.getBoundingClientRect().width;
      const box = (x0, y0, w, h) => { let s2 = 0, c = 0; for (let y = Math.max(0, y0); y < Math.min(H, y0 + h); y += 2) for (let x = Math.max(0, x0); x < Math.min(W, x0 + w); x += 2) { s2 += Yv((y * W + x) * 4); c++; } return c ? s2 / c : 0; };
      const vs = RB.render.viewSize(), t = Math.max(8, 16 * (cv.getBoundingClientRect().width / vs.w) * k2); // a tile, in canvas pixels
      const px = pos.x * k2, py = pos.y * k2;
      const me = box(px + t * 0.25, py - t * 0.6, t * 0.5, t * 1.4);
      const ring = (box(px - t * 1.5, py - t, t * 1.2, t * 2) + box(px + t * 1.3, py - t, t * 1.2, t * 2)) / 2;
      return { mean: Math.round(sum / n), crushed: Math.round((crushed / n) * 100), p90, dY: Math.round(Math.abs(me - ring)), night: !!amb.night, dark: (amb.ambient || {}).dark || 0, png: cv.toDataURL('image/png') };
    }, [map, flags, vars, light]);
    pair[light ? 'on' : 'off'] = r;
  }
  const on = pair.on, off = pair.off;
  const flagsOut = [];
  if (on.mean < off.mean * 0.55 && on.mean < 40) flagsOut.push('the light swallows the picture');
  if (on.dY < 10) flagsOut.push('the player is hard to pick out');
  if (on.night && on.mean > 140) flagsOut.push('a night that reads as day');
  if (on.crushed > 60) flagsOut.push('much of it crushed to black');
  rows.push({ map, label, on: { mean: on.mean, crushed: on.crushed, p90: on.p90, dY: on.dY }, off: { mean: off.mean, crushed: off.crushed, p90: off.p90, dY: off.dY }, night: on.night, dark: on.dark, flags: flagsOut });
  shots.push({ name: map + ' · ' + label.replace(/ \(.*/, ''), on: on.png, off: off.png });
}

// contact sheets: eight pairs (On above Off) per sheet
const PER = 8;
for (let i = 0; i < shots.length; i += PER) {
  const set = shots.slice(i, i + PER);
  const data = await p.evaluate(async (set) => {
    const TW = 320, TH = 200, cv = document.createElement('canvas'); cv.width = TW * 4; cv.height = Math.ceil(set.length / 4) * (TH * 2 + 22);
    const g = cv.getContext('2d'); g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, cv.width, cv.height);
    for (let k = 0; k < set.length; k++) {
      const x = (k % 4) * TW, y = Math.floor(k / 4) * (TH * 2 + 22);
      for (const [j, src] of [[0, set[k].on], [1, set[k].off]]) { const im = new Image(); im.src = src; await im.decode(); g.drawImage(im, x, y + 18 + j * TH, TW - 4, TH - 4); }
      g.fillStyle = '#eee'; g.font = '12px sans-serif'; g.fillText(set[k].name + '  (On above, Off below)', x + 4, y + 13);
    }
    return cv.toDataURL('image/webp', 0.85);
  }, set);
  fs.writeFileSync(path.join(OUT, 'night_' + String(i / PER + 1).padStart(2, '0') + '.webp'), Buffer.from(data.split(',')[1], 'base64'));
}
const md = ['# The night sweep: every night and dark state, light On and Off', '',
  'Made by `node tests/e2e/night_sweep.mjs` from the built `index.html` (synthetic sessions). Mean = mean brightness of the world',
  '(0–255); crushed = share of near-black pixels; p90 = the brightest tenth starts at; ΔY = how far the player stands out from',
  'the ground beside them. Contact sheets `night_NN.webp`: each place with Light and shadow On above and Off below.', '',
  '| Map | State | On: mean / crushed % / p90 / ΔY | Off: mean / crushed % / p90 / ΔY | Flags |', '|---|---|---|---|---|'];
for (const r of rows) md.push(r.skipped ? '| ' + r.map + ' | ' + r.label + ' | — | — | condition not reproducible here |'
  : '| ' + r.map + ' | ' + r.label + ' | ' + [r.on.mean, r.on.crushed, r.on.p90, r.on.dY].join(' / ') + ' | ' + [r.off.mean, r.off.crushed, r.off.p90, r.off.dY].join(' / ') + ' | ' + (r.flags.join('; ') || '—') + ' |');
fs.writeFileSync(path.join(OUT, 'README.md'), md.join('\n') + '\n');
const flagged = rows.filter((r) => r.flags && r.flags.length);
console.log(rows.length + ' states (' + rows.filter((r) => r.skipped).length + ' not reproduced), ' + flagged.length + ' flagged');
for (const r of flagged) console.log('FLAG ' + r.map + ' ' + r.label + ': ' + r.flags.join('; ') + ' ' + JSON.stringify(r.on));
if (errors.length) console.log('page errors: ' + errors.join(' | '));
await ctx.close(); await b.close(); srv.close();
