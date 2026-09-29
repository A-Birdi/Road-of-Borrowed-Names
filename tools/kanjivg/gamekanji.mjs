// The kanji the game displays, derived from the source itself.
//
//   node tools/kanjivg/gamekanji.mjs          prints the count and the list
//   node tools/kanjivg/gamekanji.mjs --files  also where each kanji is used
//
// Scanned: every source file the build puts into index.html (tools/build.mjs
// listSources: core, lang, recog, audio, engine, learn, ui, content, atlas,
// main.js) plus src/index.template.html — the content, the interface strings,
// the lexicon (src/lang) and the Atlas. Comments are removed first (a small
// JavaScript scanner that knows strings, template literals and regular
// expressions), so a kanji that appears only in a code comment, or as the
// bound of a regular-expression range, is not counted. Generated recognizer data (src/recog/1*_*.js) is skipped: it is the
// output, not the text. The result is the set of CJK ideographs (plus 々,
// which the game writes inside ruby like a kanji) in string literals,
// template literals and markup.
//
// Used by tools/kanjivg/fetch.mjs and convert.mjs (which characters to
// download and convert) and by tests/unit/recog-coverage.test.mjs (every
// displayed kanji must have recognizer data).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..', '..');

// CJK Unified Ideographs (+ Extension A, compatibility ideographs) and 々.
export const KANJI_RE = /[㐀-䶿一-鿿豈-﫿々]/gu;
export const isKanjiChar = (c) => /^[㐀-䶿一-鿿豈-﫿々]$/u.test(c);

// Remove // and /* */ comments from JavaScript source, keeping strings,
// template literals (including ${...} nesting) and regular expression
// literals intact. Returns the code with comments replaced by spaces.
// opts.dropRegex: also blank out regular expression literals (a kanji range
// such as /[一-鿿]/ is code, not text the game shows).
export function stripComments(src, opts = {}) {
  let out = '';
  let i = 0;
  const n = src.length;
  // template literal nesting: each entry is the brace depth at which a ${ opened
  const tmpl = [];
  let braces = 0;
  let lastSig = ''; // last significant (non-space, non-comment) character, for regex detection
  let lastWord = '';
  const regexAfter = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^', '']);
  const kwBefore = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);
  const readString = (q) => {
    let s = src[i++];
    while (i < n) {
      const c = src[i];
      s += c; i++;
      if (c === '\\') { s += src[i] || ''; i++; continue; }
      if (c === q) break;
      if (c === '\n' && q !== '`') break; // unterminated: stop at line end
    }
    return s;
  };
  // template literal body from the current position (just after ` or after a closing } of ${)
  const readTemplate = () => {
    let s = '';
    while (i < n) {
      const c = src[i];
      if (c === '\\') { s += c + (src[i + 1] || ''); i += 2; continue; }
      if (c === '`') { s += c; i++; return { s, done: true }; }
      if (c === '$' && src[i + 1] === '{') { s += '${'; i += 2; return { s, done: false }; }
      s += c; i++;
    }
    return { s, done: true };
  };
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && src[i] !== '\n') { out += ' '; i++; }
      continue;
    }
    if (c === '/' && d === '*') {
      i += 2; out += '  ';
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { out += src[i] === '\n' ? '\n' : ' '; i++; }
      i += 2; out += '  ';
      continue;
    }
    if (c === '"' || c === "'") { out += readString(c); lastSig = c; lastWord = ''; continue; }
    if (c === '`') {
      out += '`'; i++;
      const r = readTemplate();
      out += r.s;
      if (!r.done) { tmpl.push(braces); braces++; }
      lastSig = '`'; lastWord = '';
      continue;
    }
    if (c === '/' && (regexAfter.has(lastSig) || kwBefore.has(lastWord))) {
      // regular expression literal
      let s = '/'; i++;
      let cls = false;
      while (i < n) {
        const e = src[i];
        s += e; i++;
        if (e === '\\') { s += src[i] || ''; i++; continue; }
        if (e === '[') cls = true;
        else if (e === ']') cls = false;
        else if (e === '/' && !cls) break;
        else if (e === '\n') break;
      }
      while (i < n && /[a-z]/i.test(src[i])) s += src[i++];
      out += opts.dropRegex ? '/' + ' '.repeat(Math.max(0, s.length - 2)) + '/' : s; lastSig = '/re'; lastWord = '';
      continue;
    }
    if (c === '{') braces++;
    if (c === '}') {
      braces--;
      if (tmpl.length && tmpl[tmpl.length - 1] === braces) {
        tmpl.pop();
        out += '}'; i++;
        const r = readTemplate();
        out += r.s;
        if (!r.done) { tmpl.push(braces); braces++; }
        lastSig = '`'; lastWord = '';
        continue;
      }
    }
    out += c; i++;
    if (!/\s/.test(c)) {
      if (/[A-Za-z0-9_$]/.test(c)) { lastWord = /[A-Za-z0-9_$]/.test(lastSig) ? lastWord + c : c; lastSig = c; }
      else { lastSig = c; lastWord = ''; }
      if (lastSig === ')' || lastSig === ']') lastSig = ')'; // division after a closing bracket
    }
  }
  return out;
}

async function sourceFiles() {
  const { listSources } = await import(pathToFileURL(path.join(ROOT, 'tools', 'build.mjs')).href);
  const files = listSources().filter((f) => !/[\\/]src[\\/]recog[\\/]1\d_[^\\/]+\.js$/.test(f));
  files.push(path.join(ROOT, 'src', 'index.template.html'));
  return files;
}

// {chars: [kanji sorted by code point], where: {kanji: [relative file paths]}}
export async function gameKanji() {
  const where = {};
  for (const f of await sourceFiles()) {
    let text = fs.readFileSync(f, 'utf8');
    if (f.endsWith('.js')) text = stripComments(text, { dropRegex: true });
    else text = text.replace(/<!--[\s\S]*?-->/g, ' ');
    const rel = path.relative(ROOT, f).split(path.sep).join('/');
    for (const c of text.match(KANJI_RE) || []) (where[c] = where[c] || new Set()).add(rel);
  }
  const chars = Object.keys(where).sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
  return { chars, where: Object.fromEntries(chars.map((c) => [c, [...where[c]].sort()])) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { chars, where } = await gameKanji();
  console.log(`${chars.length} distinct kanji displayed by the game`);
  if (process.argv.includes('--files')) for (const c of chars) console.log(c, where[c].join(' '));
  else console.log(chars.join(''));
}
