// Assembles the self-contained index.html from src/.
// Usage: node tools/build.mjs [--out path]
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.join(root, 'index.html');
// painted Harmony art to embed (docs/harmony/contract/CONTRACT.md §7): assets/harmony/ unless --harmony <dir>
const haIdx = args.indexOf('--harmony');
const harmonyDir = haIdx >= 0 ? path.resolve(args[haIdx + 1]) : path.join(root, 'assets', 'harmony');

// The manifest and every PNG it lists, base64, as RB.harmonyAssets (installed by src/ui/88_harmony_raster.js).
// Nothing at all is added when there is no manifest.
export function harmonyAssets(dir = harmonyDir) {
  const mf = path.join(dir, 'manifest.json');
  if (!fs.existsSync(mf)) return null;
  const manifest = JSON.parse(fs.readFileSync(mf, 'utf8'));
  const files = {};
  let bytes = 0;
  for (const f of Object.values(manifest.files || {})) for (const n of [f.png, f.mask]) {
    if (!n) continue;
    const b = fs.readFileSync(path.join(dir, n));
    files[n] = b.toString('base64');
    bytes += b.length;
  }
  const js = 'RB.harmonyAssets = ' + JSON.stringify({ manifest, files }).replace(/</g, '\\u003c') + ';\n';
  return { js, files: Object.keys(files).length, png: bytes, embedded: Buffer.byteLength(js) };
}

// The book interface's embedded type (expansion U02; data/fonts/README.md): the subsets listed in data/fonts/fonts.json,
// as base64 in an inert JSON block (<script type="application/json" id="rb-type">). The page never parses it unless
// the book preview is on (src/ui/13_booktype.js makes FontFaces from it then), so it costs the classic look nothing
// but the bytes. A subset whose bytes don't match the manifest stops the build: the coverage the tests check is that
// file's.
export function fontFaces(dir = path.join(root, 'data', 'fonts')) {
  const mf = path.join(dir, 'fonts.json');
  if (!fs.existsSync(mf)) return null;
  const { faces } = JSON.parse(fs.readFileSync(mf, 'utf8'));
  const list = [];
  let bytes = 0;
  for (const f of faces) {
    const b = fs.readFileSync(path.join(dir, f.out));
    const h = crypto.createHash('sha256').update(b).digest('hex');
    if (h !== f.sha256) throw new Error(`data/fonts/${f.out}: SHA-256 ${h} does not match fonts.json`);
    bytes += b.length;
    list.push({ family: f.family, weight: f.weight, style: f.style, b64: b.toString('base64') });
  }
  const json = JSON.stringify(list);
  if (json.includes('<')) throw new Error('font data must not contain "<"');
  return { json, faces: faces.length, bytes, embedded: Buffer.byteLength(json) };
}

export function listSources() {
  const manifest = JSON.parse(fs.readFileSync(path.join(src, 'manifest.json'), 'utf8'));
  const files = [];
  for (const entry of manifest.order) {
    const p = path.join(src, entry);
    if (!fs.existsSync(p)) continue; // directories may not exist yet during development
    if (fs.statSync(p).isDirectory()) {
      const walk = (d) =>
        fs
          .readdirSync(d, { withFileTypes: true })
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((e) => {
            const fp = path.join(d, e.name);
            if (e.isDirectory()) walk(fp);
            else if (e.name.endsWith('.js')) files.push(fp);
          });
      walk(p);
    } else files.push(p);
  }
  return files;
}

function build() {
  const tpl = fs.readFileSync(path.join(src, 'index.template.html'), 'utf8');
  // styles: every src/styles/*.css in name order (tokens first, then areas)
  const styleDir = path.join(src, 'styles');
  const css = fs.readdirSync(styleDir).filter((f) => f.endsWith('.css')).sort()
    .map((f) => `/* ==== src/styles/${f} ==== */\n` + fs.readFileSync(path.join(styleDir, f), 'utf8')).join('\n');
  if (css.includes('</style')) throw new Error('CSS contains "</style"');
  const ff = fontFaces();
  const files = listSources();
  const licences0 = fs.readFileSync(path.join(root, 'data', 'NOTICE.txt'), 'utf8');
  let js = `var RB = (globalThis.RB = globalThis.RB || {});\nRB.NOTICE = ${JSON.stringify(licences0).replace(/</g, '\\u003c')};\n`;
  const ha = harmonyAssets();
  if (ha) js += ha.js;
  for (const f of files) {
    const rel = path.relative(root, f).split(path.sep).join('/');
    const code = fs.readFileSync(f, 'utf8');
    if (code.includes('</script')) throw new Error(`${rel} contains "</script" which would break inlining`);
    js += `\n/* ==== ${rel} ==== */\n${code}\n`;
  }
  const licences = fs.readFileSync(path.join(root, 'data', 'NOTICE.txt'), 'utf8');
  if (licences.includes('-->')) throw new Error('NOTICE.txt must not contain -->');
  const html = tpl
    .replace('<!--NOTICE-->', () => `<!--\n${licences}\n-->`)
    .replace('<!--TYPE-->', () => (ff ? `<script type="application/json" id="rb-type">${ff.json}</script>` : ''))
    .replace('/*CSS*/', () => css)
    .replace('/*JS*/', () => js);
  fs.writeFileSync(out, html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`built ${path.relative(root, out)} — ${files.length} source files, ${kb} KiB`);
  if (ff) console.log(`  type: ${ff.faces} font subsets, ${(ff.bytes / 1024).toFixed(1)} KiB encoded, ${(ff.embedded / 1024).toFixed(1)} KiB embedded (base64) from data/fonts`);
  if (ha) console.log(`  painted Harmony art: ${ha.files} PNGs, ${(ha.png / 1024).toFixed(1)} KiB encoded, ${(ha.embedded / 1024).toFixed(1)} KiB embedded (base64) from ${path.relative(root, harmonyDir)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
