// Builds independent (non-KanjiVG) test fixtures for the recognizer:
//   node tools/kanjivg/fetch.mjs --fixtures && node tools/kanjivg/fixtures.mjs
// Outputs (test-only, never shipped in src/):
//   tests/fixtures/recog/animcjk-kana.json  stroke medians of AnimCJK kana SVGs (LGPL-3.0-or-later)
//   tests/fixtures/recog/tomoe-ja.json      Tomoe 0.6.0 handwriting-ja.xml entries for our characters:
//                                           the kana and every kanji the game displays (LGPL-2.1)
//   tests/fixtures/recog/tomoe-unknown.json Tomoe entries for 300 kanji the game does NOT use
//                                           (every n-th such entry in file order), for the
//                                           "a kanji the pad doesn't know" measurements (LGPL-2.1)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KANA, allChars, ANIMCJK_COMMIT, TOMOE_URL } from './chars.mjs';
import { parsePath } from './svgpath.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const CACHE = path.join(here, '.cache');
const OUT = path.join(root, 'tests', 'fixtures', 'recog');

function animcjk() {
  const chars = [];
  const notes = [];
  for (const ch of KANA) {
    const f = path.join(CACHE, 'animcjk', `${ch.codePointAt(0)}.svg`);
    if (!fs.existsSync(f)) { notes.push(`${ch}: missing`); continue; }
    const svg = fs.readFileSync(f, 'utf8');
    const strokes = new Map();
    for (const m of svg.matchAll(/clip-path="url\(#z\d+c(\d+)([a-z]?)\)"\s+d="([^"]+)"/g)) {
      const n = +m[1], part = m[2];
      // Strokes that overlap themselves are split into parts a, b, c... for
      // animation clipping; part "a" (or the unlettered path) carries the true
      // median of the whole stroke, later parts are shifted copies.
      if (part && part !== 'a') continue;
      const pts = [];
      for (const sp of parsePath(m[3])) {
        for (const seg of sp) {
          if (!pts.length) pts.push(seg.p0.map(Math.round));
          pts.push(seg.p1.map(Math.round));
        }
      }
      strokes.set(n, pts);
    }
    const nums = [...strokes.keys()].sort((a, b) => a - b);
    nums.forEach((n, i) => { if (n !== i + 1) throw new Error(`${ch}: stroke gap`); });
    chars.push({ ch, strokes: nums.map((n) => strokes.get(n)) });
  }
  return {
    source: `AnimCJK svgsJaKana (https://github.com/parsimonhi/animCJK, commit ${ANIMCJK_COMMIT.slice(0, 12)}), stroke medians`,
    licence: 'GNU LGPL v3 or later (kana SVGs are not derived from Arphic fonts), Copyright 2016-2026 FM&SH',
    box: 1024,
    notes,
    chars,
  };
}

function tomoeEntries() {
  const xml = fs.readFileSync(path.join(CACHE, 'tomoe-handwriting-ja.xml'), 'utf8');
  const out = [];
  for (const m of xml.matchAll(/<character>([\s\S]*?)<\/character>/g)) {
    const body = m[1];
    const u = /<utf8>([^<]*)<\/utf8>/.exec(body);
    if (!u) continue;
    const ch = u[1].replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
    const strokes = [];
    for (const s of body.matchAll(/<stroke>([\s\S]*?)<\/stroke>/g)) {
      strokes.push([...s[1].matchAll(/<point x="(-?\d+)" y="(-?\d+)"\s*\/>/g)].map((p) => [+p[1], +p[2]]));
    }
    out.push({ ch, strokes });
  }
  return out;
}
const TOMOE_HEAD = {
  source: `Tomoe 0.6.0 data/handwriting-ja.xml (${TOMOE_URL})`,
  licence: 'GNU LGPL v2.1 (Tomoe project: Kouhei Sutou, Hiroyuki Ikezoe, Takuro Ashie, Hiroyuki Komatsu et al.)',
  box: 1000,
};
function tomoe(all, want) {
  return { ...TOMOE_HEAD, chars: all.filter((c) => want.has(c.ch)) };
}
// Real kanji outside the game's set (a CJK ideograph, not a game kanji, not
// 々): every n-th in file order, 300 in all.
function tomoeUnknown(all, known) {
  const other = all.filter((c) => /^[\u4e00-\u9fff]$/u.test(c.ch) && !known.has(c.ch));
  const step = Math.max(1, Math.floor(other.length / 300));
  const chars = other.filter((_, i) => i % step === 0).slice(0, 300);
  return { ...TOMOE_HEAD, note: `kanji the game does not use: every ${step}th of ${other.length} such Tomoe entries`, chars };
}

function write(name, obj) {
  // one character per line keeps diffs readable
  const { chars, ...head } = obj;
  const lines = ['{'];
  for (const [k, v] of Object.entries(head)) lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  lines.push('  "chars": [');
  lines.push(chars.map((c) => '    ' + JSON.stringify(c)).join(',\n'));
  lines.push('  ]', '}', '');
  const file = path.join(OUT, name);
  fs.writeFileSync(file, lines.join('\n'));
  console.log(`wrote ${path.relative(root, file)}: ${chars.length} characters, ${(fs.statSync(file).size / 1024).toFixed(1)} KiB`);
}

fs.mkdirSync(OUT, { recursive: true });
const a = animcjk();
if (a.notes.length) console.log('AnimCJK notes:', a.notes.join('; '));
write('animcjk-kana.json', a);
const { all: ALL } = await allChars();
const entries = tomoeEntries();
const t = tomoe(entries, new Set(ALL));
write('tomoe-ja.json', t);
const missing = ALL.filter((c) => !t.chars.some((x) => x.ch === c));
console.log(`Tomoe: ${new Set(t.chars.map((c) => c.ch)).size} of ${ALL.length} supported characters have an entry; none for ${missing.length}`);
write('tomoe-unknown.json', tomoeUnknown(entries, new Set(ALL)));
