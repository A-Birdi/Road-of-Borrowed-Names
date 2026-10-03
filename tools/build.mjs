// Assembles the self-contained index.html from src/.
// Usage: node tools/build.mjs [--out path]
import fs from 'node:fs';
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
    .replace('/*CSS*/', () => css)
    .replace('/*JS*/', () => js);
  fs.writeFileSync(out, html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`built ${path.relative(root, out)} — ${files.length} source files, ${kb} KiB`);
  if (ha) console.log(`  painted Harmony art: ${ha.files} PNGs, ${(ha.png / 1024).toFixed(1)} KiB encoded, ${(ha.embedded / 1024).toFixed(1)} KiB embedded (base64) from ${path.relative(root, harmonyDir)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
