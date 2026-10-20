// Does a game build pick up a voice site's recordings? (VB-1; Local, 2026-10-20: "check the game picks up each stage's
// recordings".) The site's index (index.json, every scene index and the references index) against the recording
// manifest rebuilt from the build's own source (tools/voice/production_manifest.mjs). The runtime plays a variant only
// when the displayed line's key, speaker, dialect (and the player's voice and pitch) and spoken-text hash match
// (src/audio/52_voicebank.js wanted/pick), so this is checked for:
//  - each named set of recordings (a supplement's results, or a range of send corrections): every key the site lists
//    it under is a line of this build, served by the same recording id, with the same speaker, dialect and text hash;
//    a send correction's redo is served as its new take (run/results.json.gz), never the take it replaced;
//  - every line of the build: on the site or not, and what is missing by supplement (the stages still to come);
//  - every site variant this build never asks for (a line changed or gone since it was recorded: it cannot play);
//  - every reference reading, by key and id.
// Static only: the site's recordings themselves are not read (the publishing step checks their bytes).
// Usage: node tools/voice/site_pickup.mjs --site <site>/ja-JP [--manifest <RECORDING_MANIFEST.json.gz>]
//          [--sets SL1,SL3,SC10-SC14] [--json]
//   --manifest: the build's manifest; without it, one is rebuilt from this checkout's source into a temporary folder.
//   exit 1 when a named set does not resolve, a redo is served as its old take, or a site variant has a stale text hash.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const siteDir = opt('--site');
if (!siteDir || !fs.existsSync(path.join(siteDir, 'index.json'))) {
  console.error('usage: node tools/voice/site_pickup.mjs --site <site>/ja-JP [--manifest <file.json.gz>] [--sets SL1,SC10-SC14] [--json]');
  process.exit(2);
}
const P = (p) => path.join(root, 'docs/future/voice/production', p);
let manPath = opt('--manifest');
if (!manPath) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbn-pickup-'));
  execFileSync(process.execPath, [path.join(root, 'tools/voice/production_manifest.mjs'), '--out', tmp], { stdio: 'ignore' });
  manPath = path.join(tmp, 'RECORDING_MANIFEST.json.gz');
}
const idx = JSON.parse(fs.readFileSync(path.join(siteDir, 'index.json'), 'utf8'));
const man = JSON.parse(zlib.gunzipSync(fs.readFileSync(manPath)));
if (idx.schema !== 'rbn.voice.site/1') throw new Error('not a voice site: ' + idx.schema);

// the site: key → variants; id → where it is listed
const site = new Map(), siteById = new Map();
for (const [scene, rel] of Object.entries(idx.scenes || {})) {
  const sh = JSON.parse(fs.readFileSync(path.join(siteDir, rel), 'utf8'));
  for (const [key, vs] of Object.entries(sh.lines || {})) {
    site.set(key, vs);
    for (const v of vs) { if (!siteById.has(v.id)) siteById.set(v.id, []); siteById.get(v.id).push({ key, v }); }
  }
}
// the build: key → the entries that line is served by
const game = new Map();
for (const e of man.entries) for (const l of e.lines) { if (!game.has(l.key)) game.set(l.key, []); game.get(l.key).push(e); }
const dOf = (e) => (e.dialect === 'kansai' ? 'k' : 's');
const vOf = (e) => (e.speaker === 'pc' ? (e.voice || '') + (e.pitch === 'low' ? 'l' : e.pitch === 'high' ? 'h' : '') : '');
function resolve(id) {
  const at = siteById.get(id);
  if (!at) return 'not on the site';
  for (const { key, v } of at) {
    const e = (game.get(key) || []).find((x) => x.id === id);
    if (!game.has(key)) return 'key not in this build: ' + key;
    if (!e) return 'this build serves ' + key + ' with other recordings';
    if (e.textHash !== v.th) return 'text hash differs at ' + key;
    if (e.speaker !== v.sp || dOf(e) !== v.d || vOf(e) !== (v.v || '') + (v.p || '')) return 'speaker, dialect or voice differs at ' + key;
  }
  return null;
}

// the named sets
const corrections = () => JSON.parse(fs.readFileSync(P('supplements/SEND_CORRECTIONS.json'), 'utf8')).corrections;
const results = JSON.parse(zlib.gunzipSync(fs.readFileSync(P('run/results.json.gz'))));
const supersededSha = new Set(Object.values(results.superseded || {}).map((x) => x.sha256));
const out = { voiceBuild: idx.voiceBuild, siteScript: String(idx.scriptContentHash).slice(0, 12), buildScript: String(man.contentHash).slice(0, 12), sets: {} };
let bad = 0;
for (const name of (opt('--sets') || '').split(',').filter(Boolean)) {
  let ids, redo = false;
  const m = /^SC(\d+)-SC(\d+)$/.exec(name);
  if (m) { ids = corrections().filter((c) => { const n = +String(c.ref).slice(2); return n >= +m[1] && n <= +m[2]; }).map((c) => c.id); redo = true; }
  else ids = Object.keys(JSON.parse(fs.readFileSync(P('run/results_' + name + '.json'), 'utf8')).recordings);
  const un = [];
  for (const id of ids) { const why = resolve(id); if (why) un.push(id + ': ' + why); }
  const s = { ids: ids.length, resolved: ids.length - un.length, unresolved: un.slice(0, 10) };
  if (redo) {
    s.newTake = ids.filter((id) => results.recordings[id] && (siteById.get(id) || []).every(({ v }) => v.h === results.recordings[id].sha256)).length;
    s.oldTakeServed = ids.filter((id) => (siteById.get(id) || []).some(({ v }) => supersededSha.has(v.h)));
    bad += s.oldTakeServed.length + (ids.length - s.newTake);
  }
  bad += un.length;
  out.sets[name] = s;
}
// every line of the build
const supp = {};
for (const f of fs.readdirSync(P('supplements')).filter((f) => /^[A-Z]+\d+_SUPPLEMENT\.json$/.test(f))) {
  const s = JSON.parse(fs.readFileSync(P('supplements/' + f), 'utf8'));
  for (const e of s.entries || s.recordings || []) supp[e.id] = f.split('_')[0];
}
let pairs = 0, onSite = 0, thStale = 0;
const missing = new Set();
for (const [key, es] of game) for (const e of es) {
  pairs++;
  const v = (site.get(key) || []).find((x) => x.id === e.id);
  if (!v) { missing.add(e.id); continue; }
  onSite++;
  if (v.th !== e.textHash) thStale++;
}
const missBy = {};
for (const id of missing) { const k = supp[id] || 'not in a supplement'; missBy[k] = (missBy[k] || 0) + 1; }
out.lines = { linePairs: pairs, onSite, missingRecordings: missing.size, missingBy: missBy, textHashStale: thStale };
bad += thStale;
// site variants this build never asks for
let unasked = 0;
const unaskedBy = {};
for (const [key, vs] of site) for (const v of vs) {
  if ((game.get(key) || []).some((x) => x.id === v.id)) continue;
  unasked++;
  const sc = key.split('#')[0];
  unaskedBy[sc] = (unaskedBy[sc] || 0) + 1;
}
out.siteOnly = { variantsThisBuildNeverAsksFor: unasked, byScene: Object.entries(unaskedBy).sort((a, b) => b[1] - a[1]).slice(0, 12) };
// reference readings
if (idx.refs) {
  const R = JSON.parse(fs.readFileSync(path.join(siteDir, idx.refs), 'utf8'));
  const refs = R.refs || R;
  let same = 0, miss = 0, other = 0;
  for (const r of man.references || []) { const e = refs[r.key]; if (!e) miss++; else if (e.id === r.id) same++; else other++; }
  out.references = { inBuild: (man.references || []).length, onSiteSameId: same, missing: miss, otherId: other };
}
if (args.includes('--json')) console.log(JSON.stringify(out, null, 1));
else {
  console.log(`voice build ${out.voiceBuild} (script ${out.siteScript}) against this build (script ${out.buildScript})`);
  for (const [n, s] of Object.entries(out.sets)) console.log(`  ${n}: ${s.resolved} of ${s.ids} resolved` + (s.newTake != null ? `; new take served ${s.newTake} of ${s.ids}, old take served ${s.oldTakeServed.length}` : '') + (s.unresolved.length ? '\n    ' + s.unresolved.join('\n    ') : ''));
  console.log(`  lines: ${out.lines.onSite} of ${out.lines.linePairs} on the site; ${out.lines.missingRecordings} recordings missing ${JSON.stringify(out.lines.missingBy)}; stale text hashes ${out.lines.textHashStale}`);
  console.log(`  site variants this build never asks for: ${out.siteOnly.variantsThisBuildNeverAsksFor}` + (out.siteOnly.byScene.length ? ' ' + JSON.stringify(out.siteOnly.byScene) : ''));
  if (out.references) console.log(`  references: ${out.references.onSiteSameId} of ${out.references.inBuild} on the site with the same id; missing ${out.references.missing}; other id ${out.references.otherId}`);
}
process.exit(bad ? 1 : 0);
