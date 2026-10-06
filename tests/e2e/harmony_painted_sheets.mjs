// Capture sheets of the approved painted Harmony art (expressive ledger HX67): for each companion, the paired cut-in at
// every state of its timeline, at the play scale of a desktop window (2×: 1920×1080 or Robin's 2048×1046): look A as
// played (the ink band and the effects layer drawn, as RB.harmonyArt composes it), look A with the band and the effects
// off (the pair alone), a contrasting look B as played; and the two held poses Reduce motion shows. Real-time recordings with the backing, the particles and the stage, and
// the stage performances with the portrait Off, come from `node tests/e2e/harmony_cutin.mjs --docs`.
// Usage: node tests/e2e/harmony_painted_sheets.mjs   (writes docs/screenshots/harmony/painted/)
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const out = path.join(root, 'docs/screenshots/harmony/painted');
fs.mkdirSync(out, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const { p, errors, requests } = await page(b, url, { viewport: { width: 1920, height: 1080 } });
await p.waitForFunction(() => window.__RB_READY__ === true, null, { timeout: 30000 });
const res = await p.evaluate(async () => {
  const HA = RB.harmonyArt, HR = RB.harmonyRaster, HC = RB.harmonyContract;
  for (let i = 0; i < 100 && !HR.active(); i++) await new Promise((r) => setTimeout(r, 50));
  const LA = { skin: 1, hair: 'ponytail', hairColor: 3, outfit: 2, shape: 'coat', acc: ['glasses', 'flower', 'satchel'] };
  const LB = { skin: 5, hair: 'curly', hairColor: 8, outfit: 6, shape: 'robe', acc: ['scarf', 'headband'] };
  const NAME = { nao: 'Nao', mio: 'Mio', ren: 'Ren', suzu: 'Suzu' };
  // Normal timing of the portrait (82d_harmony_cutin.js: in 0–220, hold 220–1,040, out 1,040–1,400 ms)
  const SEG = { in: [0, 220], hold: [220, 820], out: [1040, 360] };
  const RM = HC.REDUCED_MOTION;
  const out = {}, info = {};
  const ready = async (comp, look, phase, bare) => {
    const spec = Object.assign({ comp, look, phase }, bare ? { backing: false, fx: false } : {});
    for (let i = 0; i < 80; i++) { HA.clear(); const c = HA.compose(spec); if (c.painted && c.painted[comp] === 'painted' && c.painted.pc === 'painted') return c; await new Promise((r) => setTimeout(r, 100)); }
    return HA.compose(spec);
  };
  for (const comp of HA.COMPANIONS) {
    // each state once, at the moment it first shows (settle_b also carries on through the fade)
    const tl = (HA.timeline(comp, 'normal') || []).map((e) => ({ phase: e.phase, ms: Math.round(SEG[e.seg][0] + SEG[e.seg][1] * (+e.from || 0)) })).filter((e, i, a) => a.findIndex((x) => x.phase === e.phase) === i);
    const states = tl.map((e) => e.phase);
    for (const look of [LA, LB]) for (const bare of [false, true]) HA.prepare(states.map((phase) => Object.assign({ comp, look, phase }, bare ? { backing: false, fx: false } : {})), { async: true });
    const sc = 2, W = 352 * sc, H = 160 * sc, gap = 18, lab = 34, cols = states.length, head = 70;
    const rows = [['Look A as played (ink band and effects): ponytail, coat, glasses, flower, satchel (skin 1, auburn, green)', LA, false],
      ['Look A, the pair alone (ink band and effects off)', LA, true],
      ['Look B as played: curly, robe, scarf, headband (skin 5, teal, undyed linen)', LB, false]];
    const cv = document.createElement('canvas');
    cv.width = gap + cols * (W + gap);
    cv.height = head + rows.length * (H + lab + 24) + (H + lab + 40) + 30;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#1e2229'; g.fillRect(0, 0, cv.width, cv.height);
    const txt = (s, x, y, size, col, bold) => { g.font = (bold ? '600 ' : '') + size + 'px system-ui, sans-serif'; g.fillStyle = col; g.fillText(s, x, y); };
    txt('Harmony cut-in, ' + NAME[comp] + ' and the player: the approved painted art, every state at 2× (as in a desktop window at 1920×1080)', gap, 30, 22, '#f0d79a', true);
    txt('Times are Normal battle playback, from the cut-in\'s start. Fast plays the same states over 780 ms; Instant shows none.', gap, 56, 16, '#c9c3b6');
    const painted = [];
    for (let r = 0; r < rows.length; r++) {
      const [label, look, bare] = rows[r];
      const y0 = head + r * (H + lab + 24);
      txt(label, gap, y0 + 18, 16, '#e9e6df', true);
      for (let i = 0; i < states.length; i++) {
        const c = await ready(comp, look, states[i], bare);
        painted.push(c.painted && c.painted[comp] === 'painted' && c.painted.pc === 'painted');
        const x = gap + i * (W + gap);
        g.fillStyle = '#2a303a'; g.fillRect(x, y0 + 24, W, H);
        g.drawImage(c.cv, x, y0 + 24, c.w * sc, c.h * sc);
        txt(states[i] + ' · ' + tl[i].ms + ' ms', x + 4, y0 + 24 + H + 22, 16, '#d8b46a', true);
      }
    }
    // Reduce motion: the held poses, peak then settle_b, one cross-fade
    const y1 = head + rows.length * (H + lab + 24);
    const held = RM ? RM.states.filter((s) => states.indexOf(s) >= 0) : [];
    txt('Reduce motion (look A as played): ' + held.join(' held, then ') + ' held; one cross-fade of at most ' + (RM ? Math.min(120, RM.crossFade) : '?') + ' ms; no travel', gap, y1 + 18, 16, '#e9e6df', true);
    for (let i = 0; i < held.length; i++) {
      const c = await ready(comp, LA, held[i]);
      const x = gap + i * (W + gap);
      g.fillStyle = '#2a303a'; g.fillRect(x, y1 + 24, W, H);
      g.drawImage(c.cv, x, y1 + 24, c.w * sc, c.h * sc);
      txt(held[i] + (i ? ' (to the end)' : ' (from the start)'), x + 4, y1 + 24 + H + 22, 16, '#d8b46a', true);
    }
    out['states_' + comp + '_2x.webp'] = cv.toDataURL('image/webp', 0.86);
    info[comp] = { states, times: tl.map((e) => e.ms), held, painted: painted.every(Boolean), size: [cv.width, cv.height] };
  }
  return { out, info, approval: HR.manifest().pc.approval };
});
for (const [name, data] of Object.entries(res.out)) fs.writeFileSync(path.join(out, name), Buffer.from(data.split(',')[1], 'base64'));
const summary = Object.fromEntries(Object.entries(res.info).map(([k, v]) => [k, Object.assign({}, v, { file: 'docs/screenshots/harmony/painted/states_' + k + '_2x.webp', bytes: fs.statSync(path.join(out, 'states_' + k + '_2x.webp')).size })]));
fs.writeFileSync(path.join(out, 'sheets.json'), JSON.stringify({ date: new Date().toISOString().slice(0, 10), approval: res.approval, note: 'Headless Chromium (Playwright) on Linux; the shipped index.html with the approved art; RB.harmonyArt.compose, as played (ink band and effects) and with backing: false, fx: false.', sheets: summary }, null, 1) + '\n');
for (const [k, v] of Object.entries(summary)) console.log(k, v.states.join(' '), '| times', v.times.join(' '), '| held', v.held.join(' → '), '| painted', v.painted, '|', v.bytes, 'B');
console.log('errors', JSON.stringify(errors), 'requests', requests.length);
await b.close();
srv.close();
const bad = !Object.values(summary).every((v) => v.painted) || errors.length || requests.length;
process.exit(bad ? 1 : 0);
