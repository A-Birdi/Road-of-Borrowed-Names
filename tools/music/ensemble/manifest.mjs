// MT-1: the Ensemble manifest (assets/music/ensemble/manifest.json) checked against the files and the current scores,
// and the runtime catalog the build embeds (RB.audio.ensembleCatalog). Node only; used by tools/build.mjs and tests.
//
// The manifest follows MT-1's authoring schema (contracts/ensemble_manifest.schema.json in Robin's package). A track
// reaches the game only if it is `ready` and every one of these holds: the manifest is runtimeEnabled; its score
// fingerprint is the current build's (a stale recording stays out); its timeline is the current score's; every
// evidence flag is true and names a report; the mix profile is the pre-master music bus with its gain and room stated;
// each media file exists inside assets/music/ensemble/, at the stated size and SHA-256, with sane playable frames; the
// first-pass and steady-loop alternatives pair up by type; and each steady cycle is the score's period within 50 ppm.
// (MT-2) A cue that does not loop has one file per alternative (layout single_pass) covering the whole score, and its
// own evidence list (no seam, no repeat).
// Anything else is reported and left out: the song plays its Original.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { scoreFingerprint } from './fingerprint.mjs';

export const MANIFEST = 'assets/music/ensemble/manifest.json';
export const MAX_PPM = 50;
const URL_RE = /^\.\/assets\/music\/ensemble\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:mp3|ogg|opus|wav|flac)$/;
const TYPES = { opus: 'audio/ogg; codecs="opus"', ogg: 'audio/ogg', mp3: 'audio/mpeg', flac: 'audio/flac', wav: 'audio/wav' };
const MIMES = ['audio/mpeg', 'audio/ogg', 'audio/opus', 'audio/wav', 'audio/flac'];
const EVIDENCE = ['scoreCompatibleWithCurrentBuild', 'scoreEventsPreserved', 'decodedAlignmentVerified', 'firstPassSeamVerified', 'repeatedLoopVerified', 'gameMixCalibrated', 'distributionProvenanceRecorded'];
// (MT-2) a cue that does not loop is one file, the whole score with its decay (layout single_pass): no seam, no repeat
const EVIDENCE_ONCE = ['scoreCompatibleWithCurrentBuild', 'scoreEventsPreserved', 'decodedAlignmentVerified', 'oneShotPlacementVerified', 'gameMixCalibrated', 'distributionProvenanceRecorded'];

export function readManifest(root) {
  const f = path.join(root, MANIFEST);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

const isInt = (v, min = 0) => Number.isSafeInteger(v) && v >= min;

// the problems with one asset reference (an empty list: none)
function assetProblems(a, root) {
  const p = [];
  if (!a || typeof a !== 'object') return ['asset missing'];
  if (typeof a.relativeUrl !== 'string' || !URL_RE.test(a.relativeUrl) || a.relativeUrl.includes('..')) p.push('relativeUrl not in ./assets/music/ensemble/: ' + a.relativeUrl);
  if (!MIMES.includes(a.mimeType)) p.push('mimeType ' + a.mimeType);
  if (!/^[a-f0-9]{64}$/.test(a.sha256 || '')) p.push('sha256 malformed');
  if (!isInt(a.encodedBytes, 1)) p.push('encodedBytes');
  if (!isInt(a.sampleRate, 8000) || a.sampleRate > 192000) p.push('sampleRate');
  if (a.channels !== 2) p.push('channels (the game plays stereo recordings)');
  if (!isInt(a.decodedFrames, 1) || !isInt(a.playableStartFrame) || !isInt(a.playableEndFrame, 1) || a.playableStartFrame >= a.playableEndFrame || a.playableEndFrame > a.decodedFrames) p.push('playable frames');
  if (!p.length) {
    const f = path.join(root, a.relativeUrl);
    if (!f.startsWith(path.join(root, 'assets', 'music', 'ensemble') + path.sep) || !fs.existsSync(f)) p.push('file missing: ' + a.relativeUrl);
    else {
      const b = fs.readFileSync(f);
      if (b.length !== a.encodedBytes) p.push('size ' + b.length + ' != ' + a.encodedBytes + ': ' + a.relativeUrl);
      else if (crypto.createHash('sha256').update(b).digest('hex') !== a.sha256) p.push('sha256 differs: ' + a.relativeUrl);
    }
  }
  return p;
}

// the problems that keep one track out of the game (an empty list: it is eligible)
export function trackProblems(t, score, root) {
  const p = [];
  if (!t || t.releaseStatus !== 'ready') return ['not ready (' + (t && t.releaseStatus) + ')'];
  if (!score) return ['no such song in the current build'];
  if (t.fingerprintVersion !== 'mt1-score-v1') p.push('fingerprintVersion');
  const fp = scoreFingerprint(JSON.parse(JSON.stringify(score)));
  if (t.scoreFingerprint !== fp) p.push('stale: recorded from ' + String(t.scoreFingerprint).slice(0, 19) + '…, the current score is ' + fp.slice(0, 19) + '…');
  const tl = t.timeline || {};
  if (tl.loop !== score.loop || Math.abs(tl.durationSec - score.length) > 1e-9 || Math.abs(tl.loopStartSec - score.loopStart) > 1e-9) p.push('timeline differs from the score');
  if (!/^[a-f0-9]{40}$/.test(t.referenceCommit || '')) p.push('referenceCommit');
  if (!t.rendererRevision) p.push('rendererRevision');
  const m = t.mix || {};
  if (m.profile !== 'pre_master_music_bus') p.push('mix profile ' + m.profile + ' (the game inserts recordings before the music volume)');
  if (typeof m.gainDb !== 'number' || !isFinite(m.gainDb) || m.gainDb < -24 || m.gainDb > 12) p.push('mix gainDb');
  if (m.roomBaked !== true) p.push('roomBaked (the game adds no room to a recording)');
  if (m.userVolumeBaked !== false) p.push('userVolumeBaked');
  const ev = t.evidence || {};
  for (const k of score.loop ? EVIDENCE : EVIDENCE_ONCE) if (ev[k] !== true) p.push('evidence ' + k);
  if (!Array.isArray(ev.reportPaths) || !ev.reportPaths.length) p.push('evidence reportPaths');
  else for (const r of ev.reportPaths) if (!fs.existsSync(path.join(root, r))) p.push('report missing: ' + r);
  const as = t.assets;
  if (!score.loop) {
    // (MT-2) one file per alternative: the whole cue; its playable span covers the score
    if (!as || as.layout !== 'single_pass' || !Array.isArray(as.firstPass) || !as.firstPass.length || as.steadyLoop) p.push('assets layout (single_pass, for a cue that does not loop)');
    else as.firstPass.forEach((a, i) => {
      for (const q of assetProblems(a, root)) p.push('firstPass[' + i + '] ' + q);
      if (a && isInt(a.playableEndFrame) && a.sampleRate && (a.playableEndFrame - a.playableStartFrame) / a.sampleRate < score.length) p.push('firstPass[' + i + '] ends before the score does');
    });
  } else if (!as || as.layout !== 'split_firstpass_loop' || !Array.isArray(as.firstPass) || !Array.isArray(as.steadyLoop)) p.push('assets layout (split_firstpass_loop)');
  else {
    if (as.firstPass.length !== as.steadyLoop.length || !as.firstPass.length) p.push('first-pass and steady-loop alternatives do not pair');
    as.firstPass.forEach((a, i) => {
      for (const q of assetProblems(a, root)) p.push('firstPass[' + i + '] ' + q);
      const b = as.steadyLoop[i];
      for (const q of assetProblems(b, root)) p.push('steadyLoop[' + i + '] ' + q);
      if (b && (a.mimeType !== b.mimeType || path.extname(a.relativeUrl) !== path.extname(b.relativeUrl))) p.push('alternative ' + i + ' pairs two types');
      if (b && isInt(b.playableEndFrame) && b.sampleRate) {
        const ppm = Math.abs((b.playableEndFrame - b.playableStartFrame) / b.sampleRate / (score.length - score.loopStart) - 1) * 1e6;
        if (!(ppm <= MAX_PPM)) p.push('steadyLoop[' + i + '] period ' + ppm.toFixed(2) + ' ppm from the score');
      }
    });
  }
  return p;
}

const ref = (a) => ({ url: a.relativeUrl, sha256: a.sha256, bytes: a.encodedBytes, rate: a.sampleRate, frames: a.decodedFrames, start: a.playableStartFrame, end: a.playableEndFrame });

// the catalog the game embeds: eligible tracks only, development notes left out; { catalog, report }
export function runtimeCatalog(manifest, getSong, root) {
  const report = [];
  const songs = {};
  if (manifest && manifest.schemaVersion === 1 && manifest.runtimeEnabled === true && Array.isArray(manifest.tracks)) {
    for (const t of manifest.tracks) {
      const problems = trackProblems(t, getSong(t.songId), root);
      report.push({ songId: t.songId, eligible: !problems.length, problems });
      if (problems.length) continue;
      songs[t.songId] = {
        releaseStatus: 'ready', fingerprint: t.scoreFingerprint, durationSec: t.timeline.durationSec, loop: t.timeline.loop, loopStartSec: t.timeline.loopStartSec,
        trim: Math.pow(10, t.mix.gainDb / 20),
        formats: t.assets.firstPass.map((a, i) => ({ codec: path.extname(a.relativeUrl).slice(1), type: TYPES[path.extname(a.relativeUrl).slice(1)], first: ref(a), loop: t.assets.steadyLoop ? ref(t.assets.steadyLoop[i]) : null })),
      };
    }
  } else if (manifest) report.push({ songId: null, eligible: false, problems: ['manifest not runtimeEnabled (or not schema 1)'] });
  return { catalog: Object.keys(songs).length ? { version: 1, songs } : null, report };
}
