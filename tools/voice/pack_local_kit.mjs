// VA-1: packs the local-engine audition kit for Windows (tools/voice/windows/README-FIRST.md): the runner and its
// modules, the frozen corpus, the local engines' casting templates, the provider inventory, the Windows wrapper and
// a manifest of every file's SHA-256 with the commit it came from. A plain zip (stored, no compression, no
// dependencies), unpacked anywhere and run with Node alone. Hosted providers are not in it: their runs need an
// authorization and stay with the cloud runner.
//   node tools/voice/pack_local_kit.mjs [--out <file.zip>]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const KIT_FILES = [
  'tools/voice/audition.mjs', 'tools/voice/providers.mjs', 'tools/voice/audio_check.mjs', 'tools/voice/gallery.mjs', 'tools/voice/ledger.mjs',
  'tools/voice/qwen_local_job.py', 'tools/voice/windows/run-local-audition.ps1', 'tools/voice/windows/run-local-audition.cmd',
  'docs/future/voice/corpus/audition_corpus.json', 'docs/future/voice/inventory/provider_inventory.json',
  'docs/future/voice/casting/voicevox.json', 'docs/future/voice/casting/voicevox_nemo.json', 'docs/future/voice/casting/aivis.json', 'docs/future/voice/casting/qwen.json',
];

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
// a stored (uncompressed) zip with UTF-8 names and a fixed timestamp, so the same files give the same bytes
export function zip(entries) {
  const parts = [], central = [];
  let offset = 0;
  const DOS_TIME = 0, DOS_DATE = (2026 - 1980) << 9 | 1 << 5 | 1;
  for (const { name, data } of entries) {
    const n = Buffer.from(name, 'utf8'), crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(0, 8);
    local.writeUInt16LE(DOS_TIME, 10); local.writeUInt16LE(DOS_DATE, 12); local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(n.length, 26); local.writeUInt16LE(0, 28);
    parts.push(local, n, data);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(0, 10);
    cen.writeUInt16LE(DOS_TIME, 12); cen.writeUInt16LE(DOS_DATE, 14); cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(data.length, 20); cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(n.length, 28); cen.writeUInt32LE(offset, 42);
    central.push(cen, n);
    offset += 30 + n.length + data.length;
  }
  const cd = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, cd, end]);
}

export function packKit(outFile) {
  let commit = null;
  try { commit = execSync('git rev-parse HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) { void e; }
  // batch files keep Windows line endings whatever the checkout did to them
  const entries = KIT_FILES.map((f) => ({ name: f, data: f.endsWith('.cmd') ? Buffer.from(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\r?\n/g, '\r\n')) : fs.readFileSync(path.join(ROOT, f)) }));
  entries.unshift({ name: 'README-FIRST.md', data: fs.readFileSync(path.join(ROOT, 'tools/voice/windows/README-FIRST.md')) });
  entries.push({ name: 'docs/future/voice/usage/README.md', data: fs.readFileSync(path.join(ROOT, 'docs/future/voice/usage/README.md')) });
  const manifest = { schemaVersion: 'rbn-voice-local-kit-1', builtFrom: commit, note: 'local engines only (VOICEVOX, VOICEVOX Nemo, AivisSpeech) and the Qwen local job; no credential, no hosted provider', files: entries.map((e) => ({ path: e.name, sha256: crypto.createHash('sha256').update(e.data).digest('hex'), bytes: e.data.length })) };
  entries.push({ name: 'KIT_MANIFEST.json', data: Buffer.from(JSON.stringify(manifest, null, 1) + '\n') });
  const buf = zip(entries);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, buf);
  return { file: outFile, files: entries.length, bytes: buf.length, commit };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isMain) {
  const i = process.argv.indexOf('--out');
  const out = i > 0 ? path.resolve(process.argv[i + 1]) : path.join(ROOT, 'voice-audition', 'kits', 'rbn-va1-local-kit.zip');
  const r = packKit(out);
  console.log(JSON.stringify({ file: path.relative(ROOT, r.file), files: r.files, bytes: r.bytes, builtFrom: r.commit }));
}
