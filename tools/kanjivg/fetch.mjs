// Downloads the raw source data used by the recognizer tooling into
// tools/kanjivg/.cache/ (gitignored). Nothing here is needed at game runtime.
//
//   node tools/kanjivg/fetch.mjs            KanjiVG SVGs for every needed character
//                                           (the kana + every kanji the game displays)
//   node tools/kanjivg/fetch.mjs --fixtures also AnimCJK kana SVGs + Tomoe data
//                                           (independent test sources only)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { KANA, hex5, allChars, KANJIVG_COMMIT, ANIMCJK_COMMIT, TOMOE_URL } from './chars.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const CACHE = path.join(here, '.cache');

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (attempt >= 4) throw e;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

async function fetchAll(list, dir, urlOf, fileOf) {
  fs.mkdirSync(dir, { recursive: true });
  const missing = [];
  let got = 0;
  const queue = list.slice();
  const worker = async () => {
    while (queue.length) {
      const ch = queue.shift();
      const file = path.join(dir, fileOf(ch));
      if (fs.existsSync(file)) continue;
      const buf = await get(urlOf(ch));
      if (!buf) { missing.push(ch); continue; }
      fs.writeFileSync(file, buf);
      got++;
    }
  };
  await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
  return { missing, got };
}

// Minimal ustar reader: returns the named member of a gzipped tarball.
function untarMember(tgz, wanted) {
  const tar = zlib.gunzipSync(tgz);
  for (let off = 0; off + 512 <= tar.length; ) {
    const name = tar.toString('utf8', off, off + 100).replace(/\0.*$/s, '');
    if (!name) break;
    const size = parseInt(tar.toString('utf8', off + 124, off + 136).replace(/\0.*$/s, '').trim() || '0', 8);
    if (name === wanted) return tar.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return null;
}

async function main() {
  const fixtures = process.argv.includes('--fixtures');
  const kvgDir = path.join(CACHE, 'kanjivg');
  const ALL = (await allChars()).all;
  const r = await fetchAll(
    ALL, kvgDir,
    (ch) => `https://raw.githubusercontent.com/KanjiVG/kanjivg/${KANJIVG_COMMIT}/kanji/${hex5(ch)}.svg`,
    (ch) => `${hex5(ch)}.svg`,
  );
  console.log(`KanjiVG @${KANJIVG_COMMIT.slice(0, 7)}: ${ALL.length - r.missing.length}/${ALL.length} present (${r.got} downloaded now)`);
  if (r.missing.length) console.log('  MISSING from KanjiVG:', r.missing.join(' '));
  if (!fixtures) return;

  const acDir = path.join(CACHE, 'animcjk');
  const a = await fetchAll(
    KANA, acDir,
    (ch) => `https://raw.githubusercontent.com/parsimonhi/animCJK/${ANIMCJK_COMMIT}/svgsJaKana/${ch.codePointAt(0)}.svg`,
    (ch) => `${ch.codePointAt(0)}.svg`,
  );
  console.log(`AnimCJK @${ANIMCJK_COMMIT.slice(0, 7)}: ${KANA.length - a.missing.length}/${KANA.length} kana present`);
  if (a.missing.length) console.log('  missing from AnimCJK:', a.missing.join(' '));

  const tomoeXml = path.join(CACHE, 'tomoe-handwriting-ja.xml');
  if (!fs.existsSync(tomoeXml)) {
    const tgz = await get(TOMOE_URL);
    if (!tgz) throw new Error('Tomoe tarball not found');
    const xml = untarMember(tgz, 'tomoe-0.6.0/data/handwriting-ja.xml');
    if (!xml) throw new Error('handwriting-ja.xml not in tarball');
    fs.writeFileSync(tomoeXml, xml);
  }
  console.log('Tomoe 0.6.0 handwriting-ja.xml: cached');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
