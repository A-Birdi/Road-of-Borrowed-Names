// Converts cached KanjiVG SVGs into src/recog/10_strokedata.js.
//   node tools/kanjivg/fetch.mjs && node tools/kanjivg/convert.mjs
//
// Characters: the 164 kana, and every kanji the game displays
// (tools/kanjivg/gamekanji.mjs derives that list from the source), so the
// file must be regenerated whenever new text brings a new kanji
// (tests/unit/recog-coverage.test.mjs fails until it is).
//
// For every character: the stroke paths are read in KanjiVG stroke-number order,
// each path is flattened (cubic/quadratic beziers sampled densely), resampled at
// ~0.5 unit spacing, simplified with Ramer–Douglas–Peucker and quantised to
// integers in KanjiVG's 109×109 box. Stroke order and direction are exactly
// KanjiVG's.
//
// Two encodings (both base64url, strokes separated by a space):
//  - kana (RB.recogData.d, unchanged from the first version so kana results
//    stay identical): RDP epsilon 0.45; every point is 3 characters encoding
//    x*109+y.
//  - kanji (RB.recogData.k, one line per kanji, the kanji first): RDP epsilon
//    0.8; the first point of a stroke is 3 characters as above, every further
//    point is 2 characters, dx+32 and dy+32 (|d| <= 31; a longer step is
//    split into equal steps on the same straight segment, which changes no
//    geometry).
// RB.recogData.rad lists each kanji's radical as KanjiVG marks it (the
// element of the group with kvg:radical "general", else "tradit", else
// "nelson"; the kvg:original form where KanjiVG gives one, so 氵 is 水 and
// ⺼ is 肉), aligned with the kanji order; '・' when KanjiVG marks none.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KANA, hex5, allChars, KANJIVG_COMMIT } from './chars.mjs';
import { flatten, resampleBySpacing, rdp } from './svgpath.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const CACHE = path.join(here, '.cache', 'kanjivg');
const OUT = path.join(root, 'src', 'recog', '10_strokedata.js');

export const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export const BOX = 109;
export const EPS_KANA = 0.45;
export const EPS_KANJI = 0.8;

export function encodeStroke(pts) {
  let s = '';
  for (const [x, y] of pts) {
    const v = x * BOX + y;
    s += B64[(v >> 12) & 63] + B64[(v >> 6) & 63] + B64[v & 63];
  }
  return s;
}
export function decodeStroke(s) {
  const out = [];
  for (let i = 0; i + 2 < s.length; i += 3) {
    const v = (B64.indexOf(s[i]) << 12) | (B64.indexOf(s[i + 1]) << 6) | B64.indexOf(s[i + 2]);
    out.push([Math.floor(v / BOX), v % BOX]);
  }
  return out;
}
// Kanji encoding: first point absolute (3 chars), then deltas (2 chars each).
export function encodeStrokeDelta(pts) {
  let s = encodeStroke([pts[0]]);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const dx = x1 - x0, dy = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 31));
    let px = x0, py = y0;
    for (let k = 1; k <= n; k++) {
      const qx = x0 + Math.round((dx * k) / n), qy = y0 + Math.round((dy * k) / n);
      s += B64[qx - px + 32] + B64[qy - py + 32];
      px = qx; py = qy;
    }
  }
  return s;
}
export function decodeStrokeDelta(s) {
  const out = decodeStroke(s.slice(0, 3));
  let [x, y] = out[0];
  for (let i = 3; i + 1 < s.length; i += 2) {
    x += B64.indexOf(s[i]) - 32; y += B64.indexOf(s[i + 1]) - 32;
    out.push([x, y]);
  }
  return out;
}

export function readKanjiVG(svg, ch) {
  const h = hex5(ch);
  const strokes = [];
  for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
    const tag = m[0];
    const id = /\bid="kvg:([0-9a-f]+)-s(\d+)"/.exec(tag);
    const d = /\sd="([^"]+)"/.exec(tag);
    if (!id || !d) continue;
    if (id[1] !== h) throw new Error(`${ch}: unexpected path id ${id[1]}`);
    strokes.push({ n: +id[2], d: d[1] });
  }
  strokes.sort((a, b) => a.n - b.n);
  strokes.forEach((s, i) => { if (s.n !== i + 1) throw new Error(`${ch}: stroke numbering gap at ${i + 1}`); });
  return strokes.map((s) => flatten(s.d));
}

// The radical KanjiVG marks for a character (see the header), or null.
export function readRadical(svg) {
  const groups = [...svg.matchAll(/<g\b[^>]*>/g)].map((m) => m[0]);
  for (const kind of ['general', 'tradit', 'nelson']) {
    for (const g of groups) {
      if (!new RegExp(`kvg:radical="${kind}"`).test(g)) continue;
      const orig = /kvg:original="([^"]+)"/.exec(g), el = /kvg:element="([^"]+)"/.exec(g);
      const r = (orig && orig[1]) || (el && el[1]);
      if (r) return [...r][0];
    }
  }
  return null;
}

export function compactStroke(dense, eps = EPS_KANA) {
  const even = resampleBySpacing(dense, 0.5);
  const simp = rdp(even, eps);
  const q = [];
  for (const [x, y] of simp) {
    const p = [Math.min(BOX - 1, Math.max(0, Math.round(x))), Math.min(BOX - 1, Math.max(0, Math.round(y)))];
    const last = q[q.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) q.push(p);
  }
  if (q.length === 1) q.push(q[0].slice()); // a dot still has a start and an end
  return q;
}

async function main() {
  const { kanji } = await allChars();
  const missing = [];
  const stats = { kana: { points: 0, maxErr: 0 }, kanji: { points: 0, maxErr: 0 } };
  const encode = (ch, eps, enc, dec, st) => {
    const f = path.join(CACHE, `${hex5(ch)}.svg`);
    if (!fs.existsSync(f)) { missing.push(ch); return null; }
    const svg = fs.readFileSync(f, 'utf8');
    const strokes = readKanjiVG(svg, ch);
    const out = strokes.map((dense) => {
      const q = compactStroke(dense, eps);
      st.points += q.length;
      // Fidelity check: every dense sample must lie close to the stored polyline.
      for (const p of dense) {
        let best = Infinity;
        for (let i = 1; i < q.length; i++) best = Math.min(best, segDist(p, q[i - 1], q[i]));
        st.maxErr = Math.max(st.maxErr, best);
      }
      const e = enc(q);
      const back = dec(e);
      // the delta form may add points on a straight segment; they must lie on it
      for (const p of back) {
        let best = Infinity;
        for (let i = 1; i < q.length; i++) best = Math.min(best, segDist(p, q[i - 1], q[i]));
        if (best > 0.75) throw new Error(`${ch}: codec round-trip moved a point by ${best}`);
      }
      if (back[0][0] !== q[0][0] || back[0][1] !== q[0][1] || back[back.length - 1][0] !== q[q.length - 1][0] || back[back.length - 1][1] !== q[q.length - 1][1]) throw new Error(`${ch}: codec end points`);
      return e;
    });
    return { data: out.join(' '), radical: readRadical(svg) };
  };
  const kanaData = {};
  for (const ch of KANA) {
    const r = encode(ch, EPS_KANA, encodeStroke, decodeStroke, stats.kana);
    if (r) kanaData[ch] = r.data;
  }
  const kanjiLines = [];
  let rad = '';
  const noRadical = [];
  for (const ch of kanji) {
    const r = encode(ch, EPS_KANJI, encodeStrokeDelta, decodeStrokeDelta, stats.kanji);
    if (!r) continue;
    kanjiLines.push(ch + r.data);
    rad += r.radical || '・';
    if (!r.radical) noRadical.push(ch);
  }
  const lines = [];
  lines.push('/* GENERATED by tools/kanjivg/convert.mjs — do not edit by hand.');
  lines.push(' *');
  lines.push(' * Stroke data derived from KanjiVG (https://kanjivg.tagaini.net,');
  lines.push(' * https://github.com/KanjiVG/kanjivg, commit ' + KANJIVG_COMMIT.slice(0, 12) + '),');
  lines.push(' * Copyright (C) 2009/2010/2011 Ulrich Apel and the KanjiVG project, licensed under');
  lines.push(' * Creative Commons Attribution-Share Alike 3.0 (CC BY-SA 3.0,');
  lines.push(' * https://creativecommons.org/licenses/by-sa/3.0/). This file is an adapted');
  lines.push(' * form: paths were sampled into point sequences, simplified and quantised to');
  lines.push(' * integers in the 109x109 box. Stroke order and direction are unchanged.');
  lines.push(' * The radicals in `rad` are KanjiVG\'s radical markings for each kanji.');
  lines.push(' * This adapted data is distributed under the same licence (CC BY-SA 3.0).');
  lines.push(' * See data/NOTICE.txt.');
  lines.push(' *');
  lines.push(' * Kana: d[ch] = strokes separated by " "; each point is 3 base64url chars');
  lines.push(' * encoding x*109+y (integers, 0..108, SVG orientation: y grows downward).');
  lines.push(' * Kanji: k[i] = the kanji, then its strokes separated by " "; a stroke is');
  lines.push(' * its first point (3 chars, as above), then one step per 2 chars: dx+32,');
  lines.push(' * dy+32. rad: the radical of each kanji of k, in the same order. */');
  lines.push('var RB = (globalThis.RB = globalThis.RB || {});');
  lines.push('');
  lines.push('RB.recogData = {');
  lines.push("  source: 'KanjiVG " + KANJIVG_COMMIT.slice(0, 12) + " (CC BY-SA 3.0, Ulrich Apel)',");
  lines.push('  box: ' + BOX + ',');
  lines.push("  alphabet: '" + B64 + "',");
  lines.push('  d: {');
  for (const ch of KANA) if (kanaData[ch] != null) lines.push(`    '${ch}': '${kanaData[ch]}',`);
  lines.push('  },');
  lines.push("  rad: '" + rad + "',");
  lines.push('  k: [');
  for (const l of kanjiLines) lines.push(`    '${l}',`);
  lines.push('  ],');
  lines.push('};');
  lines.push('');
  const js = lines.join('\n');
  fs.writeFileSync(OUT, js);
  const kanaN = KANA.filter((c) => kanaData[c] != null).length;
  console.log(`wrote ${path.relative(root, OUT)}: ${(Buffer.byteLength(js) / 1024).toFixed(1)} KiB (${Buffer.byteLength(js)} bytes), ${kanaN} kana + ${kanjiLines.length} kanji`);
  console.log(`  kana: ${stats.kana.points} points, max polyline deviation ${stats.kana.maxErr.toFixed(2)} units (RDP ${EPS_KANA})`);
  console.log(`  kanji: ${stats.kanji.points} points, max polyline deviation ${stats.kanji.maxErr.toFixed(2)} units (RDP ${EPS_KANJI})`);
  if (noRadical.length) console.log(`  no radical marked in KanjiVG (${noRadical.length}): ${noRadical.join('')}`);
  if (missing.length) console.log('MISSING (not in cache / KanjiVG):', missing.join(' '));
}

function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L2 = dx * dx + dy * dy;
  let t = L2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
