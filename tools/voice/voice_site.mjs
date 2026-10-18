// The voice site: the folder the game reads its recordings from (schema rbn.voice.site/1; docs/future/voice/production/
// VOICE_RUNTIME.md). Built from the production manifest (tools/voice/production_manifest.mjs) and the local worker's
// results (VOICE_DELIVERY.md §4). The same folder serves every delivery: beside the game (./voices/ja-JP/), a separate
// Pages repository on the same origin, or the voiced offline package (tools/publish/offline_package.mjs).
//
//   ja-JP/index.json                       small; read once a session (revalidated): build, script, where the rest is
//   ja-JP/idx/s/<scene>.<sha12>.json       one per scene: { lines: { <line key>: [ variant … ] } }, immutable
//   ja-JP/idx/refs.<sha12>.json            the reference readings and phrases: { <ref key>: { … } }, immutable
//   ja-JP/rec/<speaker>/<id>.<sha12>.opus  each recording, named by its id and its audio's SHA-256, immutable
//
// A recording that did not change keeps its file name, so its address is the same in every later build and anything a
// player's browser kept for it stays good. A result is accepted for any recording id the current manifest still lists,
// whichever manifest revision it was made under: ids come from speaker, player voice and pitch, dialect, delivery and
// the spoken text, so accepted audio is never regenerated because other lines changed. Variant fields: sp (speaker),
// d ('s' standard | 'k' Kansai), v ('A' | 'B') and p ('h' | 'l') for the player, f (file), b (bytes), h (SHA-256),
// t (seconds), th (SHA-256 of the spoken text, first 16), id (recording id).
// Usage: node tools/voice/voice_site.mjs --results <a.json>[,<b.json>] --files <dir>[,<dir>] --voice-build <id>
//          --out <site>/ja-JP [--production <RECORDING_MANIFEST.json.gz>] [--update] [--prune-older] [--max-bytes <n>]
//   --files: the folder each results file's `file` paths are relative to (one per results file, or one for all);
//   --update: write into an existing site (new names only; nothing is overwritten or removed).
// Kept from earlier builds (VR-C1): the site keeps what the current build names and what the build before it named, so
// a page opened before one update still finds its files. Anything older is reported, and removed from this publishing
// folder only with --prune-older (this folder is a copy for publishing; the accepted audio and its evidence stay
// where they are). Then the whole site folder is measured, kept files included, against the size guard's ceiling
// (--max-bytes, default 900,000,000 bytes: tools/publish/site_size.mjs); over it, exit 1: not to be deployed as it is.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { root } from '../../tests/lib/load.mjs';
import { measure, voiceNamed } from '../publish/site_size.mjs';

export const SITE_SCHEMA = 'rbn.voice.site/1';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const AUDIO = /\.(opus|ogg)$/;

// production: the manifest; recordings: { id: { bytes, sha256, seconds, ext } } (checked against the files already)
export function buildSite(production, recordings, o) {
  const errors = [];
  if (production.schema !== 'rbn.voice.production/1') errors.push('unknown production schema ' + production.schema);
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(o.voiceBuild || '')) errors.push('voice build id must be 1–64 of A–Z a–z 0–9 . _ -');
  const fileOf = (dir, id, r) => 'rec/' + dir + '/' + id + '.' + r.sha256.slice(0, 12) + '.' + (r.ext || 'opus');
  const scenes = {}, refs = {}, files = [], used = new Set();
  let seconds = 0, bytes = 0;
  const take = (id, dir) => {
    const r = recordings[id];
    if (!r) return null;
    if (!(r.bytes > 0) || !/^[0-9a-f]{64}$/.test(r.sha256 || '')) { errors.push(id + ': size and sha256 are required'); return null; }
    const f = fileOf(dir, id, r);
    if (!used.has(id)) { used.add(id); files.push({ id, f, r }); seconds += r.seconds || 0; bytes += r.bytes; }
    return f;
  };
  let missing = 0;
  for (const e of production.entries) {
    const f = take(e.id, /^[a-z0-9_]+$/.test(e.speaker) ? e.speaker : 'npc');
    if (!f) { missing++; continue; }
    const r = recordings[e.id];
    const v = { id: e.id, sp: e.speaker, d: e.dialect === 'kansai' ? 'k' : 's', f, b: r.bytes, h: r.sha256, t: r.seconds || null, th: e.textHash };
    if (e.speaker === 'pc') { v.v = e.voice; v.p = e.pitch === 'low' ? 'l' : 'h'; }
    for (const l of e.lines) {
      const sc = (scenes[l.scene] = scenes[l.scene] || { lines: {} });
      (sc.lines[l.key] = sc.lines[l.key] || []).push(v);
    }
  }
  let missingRefs = 0;
  for (const e of production.references || []) {
    const f = take(e.id, 'ref');
    if (!f) { missingRefs++; continue; }
    const r = recordings[e.id];
    refs[e.key] = { id: e.id, f, b: r.bytes, h: r.sha256, t: r.seconds || null };
  }
  const unused = Object.keys(recordings).filter((id) => !used.has(id));
  // the indexes, named by their content
  const out = {};
  const named = (dir, stem, obj) => {
    const text = JSON.stringify(obj);
    const p = dir + stem + '.' + sha(text).slice(0, 12) + '.json';
    out[p] = text;
    return p;
  };
  const sceneIdx = {};
  for (const id of Object.keys(scenes).sort()) sceneIdx[id] = named('idx/s/', id, scenes[id]);
  const refsPath = Object.keys(refs).length ? named('idx/', 'refs', refs) : null;
  const index = {
    schema: SITE_SCHEMA, voiceBuild: o.voiceBuild, scriptContentHash: production.contentHash, made: o.made || new Date().toISOString(),
    // word timings are estimated by the game from each word's beats, stretched to the recording (VOICE_RUNTIME.md)
    timing: 'estimated',
    encoding: production.delivery || null,
    scenes: sceneIdx, refs: refsPath,
    totals: { files: files.length, bytes, seconds: Math.round(seconds * 10) / 10, lines: Object.values(scenes).reduce((n, s) => n + Object.keys(s.lines).length, 0), references: Object.keys(refs).length, missingRecordings: missing, missingReferences: missingRefs, unusedResults: unused.length },
  };
  out['index.json'] = JSON.stringify(index);
  return { index, out, files, unused, errors };
}

// the worker's results, each file checked (size and SHA-256) where it is
export function readResults(list, dirs) {
  const recordings = {}, errors = [];
  list.forEach((rp, i) => {
    const res = JSON.parse(fs.readFileSync(rp, 'utf8'));
    if (res.schema && res.schema !== 'rbn.voice.results/1') errors.push(rp + ': unknown results schema ' + res.schema);
    const dir = dirs[i] || dirs[0] || path.dirname(rp);
    for (const [id, r] of Object.entries(res.recordings || {})) {
      if (!r.file || !AUDIO.test(r.file) || r.file.includes('..') || path.isAbsolute(r.file)) { errors.push(id + ': bad file name ' + r.file); continue; }
      const src = path.join(dir, r.file);
      if (!fs.existsSync(src)) { errors.push(id + ': missing file ' + r.file); continue; }
      const b = fs.readFileSync(src);
      if (b.length !== r.bytes || sha(b) !== r.sha256) { errors.push(id + ': size or hash differs: ' + r.file); continue; }
      recordings[id] = { bytes: r.bytes, sha256: r.sha256, seconds: r.seconds || null, ext: r.file.split('.').pop(), src };
    }
  });
  return { recordings, errors };
}

export function writeSite(dir, site, recordings, update) {
  if (fs.existsSync(dir) && fs.readdirSync(dir).length && !update) throw new Error('the output folder is not empty (use --update to add to a site)');
  for (const [p, text] of Object.entries(site.out)) {
    const dst = path.join(dir, p);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    if (p !== 'index.json' && fs.existsSync(dst)) { if (fs.readFileSync(dst, 'utf8') !== text) throw new Error('a content-named file differs: ' + p); continue; }
    fs.writeFileSync(dst, text);
  }
  for (const f of site.files) {
    const dst = path.join(dir, f.f);
    if (fs.existsSync(dst)) continue; // the same name is the same audio
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(recordings[f.id].src, dst);
  }
}

// run as a command (on Windows too: a file URL is file:///C:/…, never 'file://' + the path the shell gave)
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  if (!opt('--results') || !opt('--voice-build') || !opt('--out')) { console.error('usage: --results <a.json>[,<b.json>] --files <dir>[,<dir>] --voice-build <id> --out <site>/ja-JP [--production <gz>] [--update]'); process.exit(2); }
  const prodPath = opt('--production') || path.join(root, 'docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz');
  const production = JSON.parse(zlib.gunzipSync(fs.readFileSync(prodPath)).toString());
  const { recordings, errors: re } = readResults(opt('--results').split(','), (opt('--files') || '').split(',').filter(Boolean));
  const site = buildSite(production, recordings, { voiceBuild: opt('--voice-build') });
  const errors = re.concat(site.errors);
  if (errors.length) { console.error(errors.slice(0, 30).join('\n') + (errors.length > 30 ? '\n… ' + (errors.length - 30) + ' more' : '')); process.exit(1); }
  const out = opt('--out');
  // what the build before this one named (kept), read before its index is replaced
  const before = a.includes('--update') && fs.existsSync(path.join(out, 'index.json')) ? voiceNamed(out) : null;
  writeSite(out, site, recordings, a.includes('--update'));
  const now = voiceNamed(out);
  const older = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else older.push(path.relative(out, p).split(path.sep).join('/')); } };
  walk(out);
  const stale = older.filter((f) => /^(idx|rec)\//.test(f) && !now.named.has(f) && !(before && before.named.has(f)));
  let pruned = 0;
  if (a.includes('--prune-older')) for (const f of stale) { fs.rmSync(path.join(out, f)); pruned++; }
  const m = measure(path.dirname(path.resolve(out)), { maxBytes: +opt('--max-bytes') || 0 });
  console.log(JSON.stringify(Object.assign({ out }, site.index.totals, {
    keptFromPreviousBuild: before ? before.voiceBuild : null, olderThanThat: stale.length, pruned,
    folder: { files: m.files, bytes: m.bytes, ceiling: m.ceiling, headroom: m.headroom, voice: m.voice },
  })));
  if (!m.ok) { console.error('voice_site: the site folder is ' + m.bytes + ' bytes, over the ceiling of ' + m.ceiling + '; not to be deployed as it is'); process.exit(1); }
}
