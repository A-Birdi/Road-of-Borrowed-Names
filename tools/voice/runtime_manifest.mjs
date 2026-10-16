// The runtime voice manifest (Robin, 2026-10-16: "Prepare a configurable, versioned voice manifest so a separate
// GitHub Pages voice repository or imported Release pack can serve the same recordings if needed").
// Built from the production manifest (tools/voice/production_manifest.mjs) and the local worker's results: which file
// says which displayed line, for which speaker, player voice and dialect, with its size, hash and length. The same
// manifest serves the recordings from any of three places, chosen by its `base` (docs/future/voice/production/
// VOICE_DELIVERY.md):
//   - beside the game:            ./voices/ja-JP/<voiceBuild>/
//   - a separate Pages repository: ../<voice-repo>/ja-JP/<voiceBuild>/  (the same origin, a-birdi.github.io, so the
//                                  page's connect-src 'self' already allows it; no absolute URL is written into the game)
//   - an imported Release pack:    pack:<voiceBuild>  (a file the player chooses; read locally, never fetched)
// A recording is keyed by the line's key (scene#hash of its markup) and its variant (speaker, dialect, and for the player
// voice A/B and pitch high/low), never by text alone; a manifest
// built for other lines (another script content hash) is refused, so stale audio is never played as "close enough".
// The narrator's reference readings (LI-8) sit under `references`, keyed by kind:written|reading.
// Usage: node tools/voice/runtime_manifest.mjs --results <worker results.json> --voice-build <id>
//          [--base <relative path | pack:id>] [--production <RECORDING_MANIFEST.json.gz>] [--files <dir>] [--out <file>]
//   --files: also check every file's size and SHA-256 against the results.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { root } from '../../tests/lib/load.mjs';

export const RUNTIME_SCHEMA = 'rbn.voice.runtime/1';
export function buildRuntime(production, results, opts) {
  const errors = [];
  if (production.schema !== 'rbn.voice.production/1') errors.push('unknown production schema ' + production.schema);
  if (results.contentHash && results.contentHash !== production.contentHash) errors.push('the results were made for another script (content ' + String(results.contentHash).slice(0, 12) + ', manifest ' + production.contentHash.slice(0, 12) + ')');
  const voiceBuild = opts.voiceBuild;
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(voiceBuild || '')) errors.push('voice build id must be 1–64 of A–Z a–z 0–9 . _ -');
  const base = opts.base || './voices/ja-JP/' + voiceBuild + '/';
  if (/^[a-z]+:\/\//i.test(base)) errors.push('base must be relative (or pack:<id>): an absolute URL would be contacted by every copy of the game');
  const lines = {};
  let files = 0, bytes = 0, seconds = 0;
  const missing = [];
  for (const e of production.entries) {
    const r = (results.recordings || {})[e.id];
    if (!r) { missing.push(e.id); continue; }
    if (!r.file || !/^[A-Za-z0-9._/-]+\.(opus|ogg|mp3|m4a)$/.test(r.file) || r.file.includes('..')) { errors.push(e.id + ': bad file name ' + r.file); continue; }
    if (!(r.bytes > 0) || !/^[0-9a-f]{64}$/.test(r.sha256 || '')) { errors.push(e.id + ': size and sha256 are required'); continue; }
    files++; bytes += r.bytes; seconds += r.seconds || 0;
    for (const l of e.lines) {
      (lines[l.key] = lines[l.key] || []).push(Object.assign({ speaker: e.speaker, dialect: e.dialect, delivery: e.delivery, file: r.file, bytes: r.bytes, sha256: r.sha256, seconds: r.seconds || null, textHash: e.textHash },
        e.voice ? { voice: e.voice } : {}, e.pitch ? { pitch: e.pitch } : {}));
    }
  }
  // the narrator's reference readings (LI-8), keyed by kind:written|reading (word help, the notebook, the kana chart)
  const references = {};
  const missingRefs = [];
  for (const e of production.references || []) {
    const r = (results.recordings || {})[e.id];
    if (!r) { missingRefs.push(e.id); continue; }
    if (!r.file || !/^[A-Za-z0-9._/-]+\.(opus|ogg|mp3|m4a)$/.test(r.file) || r.file.includes('..')) { errors.push(e.id + ': bad file name ' + r.file); continue; }
    if (!(r.bytes > 0) || !/^[0-9a-f]{64}$/.test(r.sha256 || '')) { errors.push(e.id + ': size and sha256 are required'); continue; }
    files++; bytes += r.bytes; seconds += r.seconds || 0;
    references[e.key] = { file: r.file, bytes: r.bytes, sha256: r.sha256, seconds: r.seconds || null };
  }
  const manifest = {
    schema: RUNTIME_SCHEMA, voiceBuild, base, scriptContentHash: production.contentHash,
    formats: [...new Set(Object.values(results.recordings || {}).map((r) => String(r.file).split('.').pop()))].sort(),
    totals: { files, bytes, seconds: Math.round(seconds * 10) / 10, lines: Object.keys(lines).length, references: Object.keys(references).length, missingRecordings: missing.length, missingReferences: missingRefs.length },
    lines, references,
  };
  return { manifest, errors, missing: missing.concat(missingRefs) };
}

if (import.meta.url === 'file://' + process.argv[1]) {
  const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  if (!opt('--results') || !opt('--voice-build')) { console.error('usage: --results <file> --voice-build <id> [--base <path|pack:id>] [--production <gz>] [--files <dir>] [--out <file>]'); process.exit(2); }
  const prodPath = opt('--production') || path.join(root, 'docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz');
  const production = JSON.parse(zlib.gunzipSync(fs.readFileSync(prodPath)).toString());
  const results = JSON.parse(fs.readFileSync(opt('--results'), 'utf8'));
  const { manifest, errors, missing } = buildRuntime(production, results, { voiceBuild: opt('--voice-build'), base: opt('--base') });
  if (opt('--files')) {
    for (const r of Object.values(results.recordings || {})) {
      const f = path.join(opt('--files'), r.file);
      if (!fs.existsSync(f)) { errors.push('missing file ' + r.file); continue; }
      const b = fs.readFileSync(f);
      if (b.length !== r.bytes || crypto.createHash('sha256').update(b).digest('hex') !== r.sha256) errors.push('size or hash differs: ' + r.file);
    }
  }
  if (errors.length) { console.error(errors.slice(0, 30).join('\n') + (errors.length > 30 ? '\n… ' + (errors.length - 30) + ' more' : '')); process.exit(1); }
  const out = opt('--out') || 'manifest.json';
  fs.writeFileSync(out, JSON.stringify(manifest));
  console.log(JSON.stringify(Object.assign({ out }, manifest.totals, { missing: missing.length })));
}
