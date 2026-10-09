// The book preview's embedded type (expansion U02; data/fonts/README.md).
//  - data/fonts/fonts.json describes exactly the files the build embeds (SHA-256 and size), each with its source
//    (URL, SHA-256 of the original) and licence file;
//  - coverage, read by tools/fonts/subset.py from each subset's own cmap: every Japanese character in the game's
//    source draws in the learning face (BIZ UDGothic) and every kana and kanji in the heading face (Shippori Mincho);
//    every Latin letter, digit and punctuation mark draws in the reading face (Vollkorn), and the UI list (BIZ
//    UDPGothic for kana and Latin, BIZ UDGothic behind it for kanji) draws everything. Symbols and emoji are left to
//    the system fonts behind them, as today.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = path.join(root, 'data', 'fonts');

function parseRanges(s) {
  const set = new Set();
  for (const part of s.split(',')) {
    const [a, b] = part.split('-').map((x) => parseInt(x, 16));
    for (let c = a; c <= (b === undefined ? a : b); c++) set.add(c);
  }
  return set;
}
function gameChars() {
  const out = new Set();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|html|css)$/.test(e.name)) for (const ch of fs.readFileSync(p, 'utf8')) out.add(ch.codePointAt(0));
    }
  };
  walk(path.join(root, 'src'));
  return out;
}

export default async (t) => {
  const { faces } = JSON.parse(fs.readFileSync(path.join(dir, 'fonts.json'), 'utf8'));
  const sources = JSON.parse(fs.readFileSync(path.join(dir, 'sources.json'), 'utf8'));
  t.eq(faces.length, sources.faces.length, 'one subset for each listed source');
  const by = {};
  for (const f of faces) {
    const b = fs.readFileSync(path.join(dir, f.out));
    t.eq(crypto.createHash('sha256').update(b).digest('hex'), f.sha256, f.out + ': the file is the one recorded');
    t.eq(b.length, f.bytes, f.out + ': size');
    t.ok(/^[0-9a-f]{64}$/.test(f.source.sha256) && /^https:\/\/raw\.githubusercontent\.com\/google\/fonts\//.test(f.source.url), f.out + ': source and its hash recorded');
    t.ok(f.source.licence === 'OFL-1.1' && fs.existsSync(path.join(dir, f.source.licenceFile)), f.out + ': OFL licence file beside it');
    t.ok(!/Reserved Font Name/.test(fs.readFileSync(path.join(dir, f.source.licenceFile), 'utf8').split('SIL OPEN FONT LICENSE')[0]), f.out + ': no Reserved Font Name to honour');
    const key = f.family + '|' + f.style + '|' + f.weight;
    by[key] = parseRanges(f.codepoints);
    t.ok(/^RB /.test(f.family), f.out + ': a CSS name of the game\'s own ("' + f.family + '")');
  }
  const notice = fs.readFileSync(path.join(root, 'data', 'NOTICE.txt'), 'utf8');
  for (const name of ['Vollkorn', 'BIZ UDPGothic', 'BIZ UDGothic', 'Shippori Mincho', 'SIL OPEN FONT LICENSE Version 1.1']) t.ok(notice.includes(name), 'NOTICE.txt names ' + name);

  // In the source but never drawn as text: regex range ends (U+9FFF, U+309F, U+30FF), the half-width kana table that
  // normalises what a player types (U+FF61–FF9F), and 〰, a battle icon drawn by the system's symbol font.
  const notText = (c) => c === 0x9fff || c === 0x309f || c === 0x30ff || (c >= 0xff61 && c <= 0xff9f) || c === 0x3030;
  const chars = new Set([...gameChars()].filter((c) => !notText(c)));
  const kanaKanji = [...chars].filter((c) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(String.fromCodePoint(c)));
  const cjkPunct = [...chars].filter((c) => (c >= 0x3000 && c <= 0x303f) || (c >= 0xff01 && c <= 0xff5e));
  const latin = [...chars].filter((c) => c < 0x2e80 && /[\p{L}\p{N}\p{P}]/u.test(String.fromCodePoint(c)) && !/\p{M}/u.test(String.fromCodePoint(c)));
  const missing = (set, list) => list.filter((c) => !set.has(c)).map((c) => String.fromCodePoint(c));
  t.ok(kanaKanji.length > 1500, 'kana and kanji in the game: ' + kanaKanji.length);
  for (const w of ['400', '700']) {
    const m = missing(by['RB UD Gothic|normal|' + w], [...kanaKanji, ...cjkPunct, ...latin]);
    t.eq(m, [], 'the learning face (weight ' + w + ') draws every Japanese and Latin character the game uses');
    // the UI face carries kana, punctuation and Latin; its kanji come from UD Gothic behind it (the same drawings)
    const kana = kanaKanji.filter((c) => !/\p{Script=Han}/u.test(String.fromCodePoint(c)));
    const p = missing(by['RB UD Gothic P|normal|' + w], [...kana, ...cjkPunct, ...latin]);
    t.eq(p, [], 'the UI face (weight ' + w + ') draws every kana, punctuation mark and Latin character the game uses');
    const ui = new Set([...by['RB UD Gothic P|normal|' + w], ...by['RB UD Gothic|normal|' + w]]);
    t.eq(missing(ui, [...kanaKanji, ...cjkPunct, ...latin]), [], 'the UI list (weight ' + w + ') draws every Japanese and Latin character the game uses');
  }
  t.eq(missing(by['RB Shippori Mincho|normal|400 700'], kanaKanji), [], 'the heading face draws every kana and kanji the game uses');
  // the Latin roles' list is Vollkorn, then BIZ UDPGothic (for ※, ① and the like), then today's system fonts
  for (const st of ['normal', 'italic']) {
    const stack = new Set([...by['RB Vollkorn|' + st + '|400 900'], ...by['RB UD Gothic P|normal|400']]);
    t.eq(missing(stack, latin), [], 'the reading list (' + st + ') draws every Latin letter, digit and mark the game uses');
    const own = missing(by['RB Vollkorn|' + st + '|400 900'], latin.filter((c) => /\p{Script=Latin}/u.test(String.fromCodePoint(c)) || c < 0x80));
    t.eq(own, [], 'Vollkorn (' + st + ') itself draws every Latin letter and ASCII character the game uses');
  }
};
