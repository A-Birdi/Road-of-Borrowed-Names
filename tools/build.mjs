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
  const css = fs.readFileSync(path.join(src, 'styles.css'), 'utf8');
  const files = listSources();
  const licences0 = fs.readFileSync(path.join(root, 'data', 'NOTICE.txt'), 'utf8');
  let js = `var RB = (globalThis.RB = globalThis.RB || {});\nRB.NOTICE = ${JSON.stringify(licences0).replace(/</g, '\\u003c')};\n`;
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();
