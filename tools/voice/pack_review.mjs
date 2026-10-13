// VA-1: packs a first-review folder (voice-audition/VA1/<revision>/) into ordinary ZIPs, each under 30,000,000 bytes
// (§13), for private return. Part 1 holds START_REVIEW.html, the gallery, the result records, the requests, the
// casting files and voice inventories given with --extra, and as much audio as fits; later parts hold the rest of the
// audio. Extract every part into one folder and open START_REVIEW.html. REVIEW_PARTS.txt (in part 1) lists each
// part's files and SHA-256. Model weights, installers and caches are never included: only the review folder's own
// files and the named extras.
//   node tools/voice/pack_review.mjs [--out <review folder>] [--to <dir for the zips>] [--extra a.json,b.json]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { zip } from './pack_local_kit.mjs';
import { loadCorpus } from './audition.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LIMIT = 29000000; // under 30,000,000 with room for the zip's own headers
const SKIP = /(^|\/)(jobs\/.*\.json|.*\.(onnx|aivmx|safetensors|bin|pt|7z|exe|msi|whl)$)/i;

function walk(dir, base = dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, base));
    else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

export function packReview(dir, toDir, extras = []) {
  const files = walk(dir).filter((f) => !SKIP.test(f) && !/^review-part-\d+\.zip$/.test(f));
  const isAudio = (f) => /^audio\//.test(f);
  const entry = (name, data) => ({ name, data, size: data.length + 76 + 2 * Buffer.byteLength(name) });
  const first = files.filter((f) => !isAudio(f)).map((f) => entry(f, fs.readFileSync(path.join(dir, f))));
  for (const x of extras) first.push(entry('extras/' + path.basename(x), fs.readFileSync(x)));
  if (!first.some((e) => e.name === 'START_REVIEW.html')) throw new Error('no START_REVIEW.html in ' + dir + ': build the gallery first');
  // audio ordered as the review presents it (sections, then case and take), so part 1 starts with the first sections
  const audio = files.filter(isAudio).sort();
  const parts = [first];
  let size = first.reduce((n, e) => n + e.size, 0) + 4096; // room for REVIEW_PARTS.txt
  if (size > LIMIT) throw new Error('the review\'s pages and records alone exceed one part');
  for (const f of audio) {
    const e = entry(f, fs.readFileSync(path.join(dir, f)));
    if (e.size > LIMIT) throw new Error(f + ' alone exceeds a part');
    if (size + e.size > LIMIT) { parts.push([]); size = 0; }
    parts[parts.length - 1].push(e);
    size += e.size;
  }
  const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
  const listing = ['VA-1 first review: ' + parts.length + ' part(s). Extract every part into ONE folder, then open START_REVIEW.html.', ''];
  parts.forEach((p, i) => { listing.push('review-part-' + (i + 1) + '.zip'); for (const e of p) listing.push('  ' + sha(e.data) + '  ' + e.name); });
  parts[0].push(entry('REVIEW_PARTS.txt', Buffer.from(listing.join('\n') + '\n')));
  fs.mkdirSync(toDir, { recursive: true });
  return parts.map((p, i) => {
    const buf = zip(p.map((e) => ({ name: e.name, data: e.data })));
    if (buf.length >= 30000000) throw new Error('part ' + (i + 1) + ' reached ' + buf.length + ' bytes');
    const f = path.join(toDir, 'review-part-' + (i + 1) + '.zip');
    fs.writeFileSync(f, buf);
    return { file: f, bytes: buf.length, files: p.length, sha256: sha(buf) };
  });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isMain) {
  const a = process.argv.slice(2);
  const opt = (k) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : undefined; };
  const { revision } = loadCorpus();
  const dir = path.resolve(opt('out') || path.join(ROOT, 'voice-audition', 'VA1', revision));
  const to = path.resolve(opt('to') || path.join(ROOT, 'voice-audition', 'review-zips'));
  const parts = packReview(dir, to, (opt('extra') || '').split(',').filter(Boolean));
  console.log(JSON.stringify(parts.map((p) => ({ file: path.relative(ROOT, p.file), bytes: p.bytes, files: p.files })), null, 1));
}
