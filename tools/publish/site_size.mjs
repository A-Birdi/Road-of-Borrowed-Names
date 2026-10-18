// The size of a publishing folder, all of it, and a guard before it is deployed (VR-C1; Robin, 2026-10-16: "Measure the
// full publishing directory including retained historical assets, and add a size guard before deployment").
// GitHub Pages refuses a published site over 1 GB (docs.github.com, "GitHub Pages limits"); the guard's default ceiling
// is 900,000,000 bytes, a 10 % margin under 10^9 bytes (the stricter reading of "1 GB"). The game's site and the voice
// site are separate Pages sites, each with its own limit, so each is measured on its own.
// Every file under the folder counts: what the current build names and anything kept from earlier builds. For a voice
// site (<dir>/<lang>/index.json, schema rbn.voice.site/1) the report also splits the bytes into what the current index
// names and what it does not (kept for pages opened before an update, or no longer needed).
// Usage: node tools/publish/site_size.mjs <folder> [--max-bytes <n>] [--json]   (exit 1 when over the ceiling)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const PAGES_LIMIT = 1000000000;
export const DEFAULT_CEILING = 900000000;

function walk(dir) {
  const out = [];
  const go = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) go(p);
      else if (e.isFile()) out.push({ p, rel: path.relative(dir, p).split(path.sep).join('/'), bytes: fs.statSync(p).size });
    }
  };
  go(dir);
  return out;
}

// the files a voice site's current index names (its index, the indexes it lists, every recording they list)
export function voiceNamed(langDir) {
  const ix = JSON.parse(fs.readFileSync(path.join(langDir, 'index.json'), 'utf8'));
  if (ix.schema !== 'rbn.voice.site/1') return null;
  const named = new Set(['index.json']);
  for (const s of Object.values(ix.scenes || {}).concat(ix.refs ? [ix.refs] : [])) {
    named.add(s);
    const f = path.join(langDir, s);
    if (!fs.existsSync(f)) continue;
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j.lines) { for (const vs of Object.values(j.lines)) for (const v of vs) named.add(v.f); }
    else for (const v of Object.values(j)) if (v && v.f) named.add(v.f);
  }
  return { voiceBuild: ix.voiceBuild, named };
}

export function measure(dir, o = {}) {
  const files = walk(dir);
  const bytes = files.reduce((n, f) => n + f.bytes, 0);
  const ceiling = o.maxBytes > 0 ? o.maxBytes : DEFAULT_CEILING;
  const r = { dir, files: files.length, bytes, ceiling, pagesLimit: PAGES_LIMIT, headroom: ceiling - bytes, ok: bytes <= ceiling };
  // a voice site: what the current build names, and what is only kept
  const voice = [];
  for (const lang of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const ld = path.join(dir, lang);
    if (!fs.existsSync(path.join(ld, 'index.json'))) continue;
    const v = voiceNamed(ld);
    if (!v) continue;
    let named = 0, namedFiles = 0, kept = 0, keptFiles = 0;
    for (const f of files) {
      if (!f.rel.startsWith(lang + '/')) continue;
      if (v.named.has(f.rel.slice(lang.length + 1))) { named += f.bytes; namedFiles++; } else { kept += f.bytes; keptFiles++; }
    }
    voice.push({ lang, voiceBuild: v.voiceBuild, current: { files: namedFiles, bytes: named }, notInCurrentBuild: { files: keptFiles, bytes: kept } });
  }
  if (voice.length) r.voice = voice;
  return r;
}

// run as a command (on Windows too: a file URL is file:///C:/…, never 'file://' + the path the shell gave)
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const a = process.argv.slice(2);
  const dir = a.find((x, i) => !x.startsWith('--') && a[i - 1] !== '--max-bytes');
  if (!dir || !fs.existsSync(dir)) { console.error('usage: node tools/publish/site_size.mjs <folder> [--max-bytes <n>] [--json]'); process.exit(2); }
  const i = a.indexOf('--max-bytes');
  const r = measure(dir, { maxBytes: i >= 0 ? +a[i + 1] : 0 });
  if (a.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else {
    console.log(`${r.dir}: ${r.files} files, ${r.bytes.toLocaleString('en')} bytes; ceiling ${r.ceiling.toLocaleString('en')} (Pages limit ${PAGES_LIMIT.toLocaleString('en')}); ${r.ok ? 'within it, ' + r.headroom.toLocaleString('en') + ' bytes to spare' : 'OVER by ' + (-r.headroom).toLocaleString('en') + ' bytes'}`);
    for (const v of r.voice || []) console.log(`  ${v.lang} (voice build ${v.voiceBuild}): current build ${v.current.files} files, ${v.current.bytes.toLocaleString('en')} bytes; not named by it ${v.notInCurrentBuild.files} files, ${v.notInCurrentBuild.bytes.toLocaleString('en')} bytes`);
  }
  if (!r.ok) { console.error('site_size: over the ceiling; not to be deployed as it is'); process.exit(1); }
}
