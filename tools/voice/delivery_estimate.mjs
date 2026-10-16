// How many bytes the full-game voice would take in the selected delivery encoding (Robin, 2026-10-16: "Voice bytes from
// the selected delivery encoding, including reference readings and manifests"). An estimate from measurements, not a
// measurement of recordings that do not exist yet:
//  - what is recorded: the production manifest (tools/voice/production_manifest.mjs), dialogue and reference readings;
//  - how long each take is: the measured speaking rate of the VA-2 casting samples (docs/future/voice/va2/run/
//    results.json, seconds per character of the text each engine was sent), per section: narrator, companion, NPC, player;
//  - how many bytes a second is: the VA-2 render setting (va2_render.py: Ogg Opus 48 kHz mono, libsndfile compression
//    level 0.8), measured on this machine with libsndfile 1.2.2 at about 57–58 kbit/s plus about 900 bytes of headers
//    per file (--kbps and --header to change);
//  - the reference readings are short citation takes: the narrator's rate plus an edge per take (--ref-edge, seconds;
//    PRODUCTION_ESTIMATE.md §1b: to be measured on a dozen citation takes first);
//  - the voice site's indexes (tools/voice/voice_site.mjs): built for every recording with placeholder sizes and
//    hashes of the real shape (index.json, one index per scene, the reference index).
// Usage: node tools/voice/delivery_estimate.mjs [--production <RECORDING_MANIFEST.json.gz>] [--kbps 58] [--header 900]
//          [--ref-edge 0.4] [--json]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { root } from '../../tests/lib/load.mjs';
import { buildSite } from './voice_site.mjs';

const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const prodPath = opt('--production', path.join(root, 'docs/future/voice/production/manifest/RECORDING_MANIFEST.json.gz'));
const KBPS = Number(opt('--kbps', 58)), HEADER = Number(opt('--header', 900)), REF_EDGE = Number(opt('--ref-edge', 0.4));
const prod = JSON.parse(zlib.gunzipSync(fs.readFileSync(prodPath)).toString());
const va2 = JSON.parse(fs.readFileSync(path.join(root, 'docs/future/voice/va2/run/results.json'), 'utf8'));

// measured seconds per character, per VA-2 section
const acc = {};
for (const t of Object.values(va2.takes)) {
  if (t.mock || t.engine === 'sound' || !(t.seconds > 0)) continue;
  const s = acc[t.section] || (acc[t.section] = { seconds: 0, chars: 0, takes: 0 });
  s.seconds += t.seconds; s.chars += [...t.textSent].length; s.takes++;
}
const rate = {};
for (const k in acc) rate[k] = acc[k].seconds / acc[k].chars;
const sectionOf = (speaker) => (speaker === 'narrator' ? 'narrator' : speaker === 'pc' ? 'player' : ['nao', 'mio', 'ren', 'suzu'].includes(speaker) ? 'companion' : 'npc');
const Bps = (KBPS * 1000) / 8;
const bytesOf = (sec) => Math.round(sec * Bps) + HEADER;

const rows = {};
const add = (k, sec) => { const r = rows[k] || (rows[k] = { files: 0, seconds: 0, bytes: 0 }); r.files++; r.seconds += sec; r.bytes += bytesOf(sec); };
const fake = {};
const hex = (s) => crypto.createHash('sha256').update(s).digest('hex');
for (const e of prod.entries) {
  const sec = e.chars * rate[sectionOf(e.speaker)];
  add(sectionOf(e.speaker), sec);
  fake[e.id] = { bytes: bytesOf(sec), sha256: hex(e.id), seconds: Math.round(sec * 100) / 100 };
}
for (const r of prod.references || []) {
  const sec = r.chars * rate.narrator + REF_EDGE;
  add('reference', sec);
  fake[r.id] = { bytes: bytesOf(sec), sha256: hex(r.id), seconds: Math.round(sec * 100) / 100 };
}
const site = buildSite(prod, fake, { voiceBuild: 'vb-estimate', made: 'estimate' });
if (site.errors.length) { console.error(site.errors.slice(0, 5).join('\n')); process.exit(1); }
const mjson = Buffer.from(Object.values(site.out).join(''));
const gzAll = Object.values(site.out).reduce((n, t) => n + zlib.gzipSync(Buffer.from(t), { level: 9 }).length, 0);
const audio = Object.values(rows).reduce((n, r) => n + r.bytes, 0);
const out = {
  production: { contentHash: prod.contentHash, recordings: prod.entries.length, references: (prod.references || []).length },
  assumptions: { kbps: KBPS, headerBytesPerFile: HEADER, referenceEdgeSeconds: REF_EDGE, secondsPerChar: Object.fromEntries(Object.entries(rate).map(([k, v]) => [k, Math.round(v * 10000) / 10000])), va2Takes: Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, v.takes])) },
  bySection: Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, { files: r.files, hours: Math.round((r.seconds / 3600) * 100) / 100, bytes: r.bytes }])),
  audio: { files: Object.values(rows).reduce((n, r) => n + r.files, 0), hours: Math.round((Object.values(rows).reduce((n, r) => n + r.seconds, 0) / 3600) * 100) / 100, bytes: audio },
  runtimeManifest: { bytes: mjson.length, gzipBytes: gzAll, files: Object.keys(site.out).length },
  total: { bytes: audio + mjson.length },
};
if (a.includes('--json')) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
const mb = (b) => (b / 1e6).toFixed(1) + ' MB';
console.log('script content ' + prod.contentHash.slice(0, 12) + ': ' + out.production.recordings + ' dialogue recordings + ' + out.production.references + ' reference readings');
for (const [k, r] of Object.entries(out.bySection)) console.log('  ' + k.padEnd(10) + String(r.files).padStart(7) + ' files ' + String(r.hours).padStart(7) + ' h ' + mb(r.bytes).padStart(10));
console.log('  audio      ' + String(out.audio.files).padStart(7) + ' files ' + String(out.audio.hours).padStart(7) + ' h ' + mb(out.audio.bytes).padStart(10));
console.log('  site indexes ' + out.runtimeManifest.files + ' files, ' + mb(out.runtimeManifest.bytes) + ' (gzip ' + mb(out.runtimeManifest.gzipBytes) + ')');
console.log('  total      ' + mb(out.total.bytes) + ' at ' + KBPS + ' kbit/s + ' + HEADER + ' B per file');
