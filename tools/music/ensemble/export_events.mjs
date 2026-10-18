// MT-1 production step 1: the current score and its first-pass performance, from this checkout's own source.
//
//   node tools/music/ensemble/export_events.mjs [songId ...]        (default: the two pilots)
//
// Compiles each song with the game's sequencer (src/core + src/audio in a vm, as the unit tests do), fingerprints it
// (mt1-score-v1) and realises its first pass exactly as the Original Player does: one seeded stream per song, drawn in
// event order, percussion velocity then noise seed, pitched timing jitter then velocity (20_sequencer.js, fire). The
// Ensemble plays that realisation; the Original's later cycles draw fresh variations, a recording repeats its own.
// Writes <work>/<id>/score.json, performance.json and source.json (work: RBN_MUSIC_WORK, default tmp/music-ensemble).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { load, root } from '../../../tests/lib/load.mjs';
import { scoreFingerprint } from './fingerprint.mjs';

export const PILOTS = ['snowbell', 'battle_keepers'];
export const OFFSET = 0.05; // the performance's score zero, seconds into the render (as SC-1)
export const workDir = () => path.resolve(root, process.env.RBN_MUSIC_WORK || 'tmp/music-ensemble');

export function compile(ids) {
  const RB = load(['core', 'audio'], { __RB_TEST__: true });
  const out = {};
  for (const id of ids) {
    const song = RB.audio._.getSong(id);
    if (!song) throw new Error('unknown song ' + id);
    const score = JSON.parse(JSON.stringify(song));
    const r = RB.util.rng(RB.util.hashStr(id));
    const events = score.events.map((e, ix) => {
      const at = OFFSET + e.t;
      let t, v, noiseSeed = null;
      if (e.p) { t = at; v = e.v * (0.94 + r() * 0.12); noiseSeed = r(); }
      else { t = Math.max(at + (r() - 0.5) * 0.012, 0); v = e.v * (0.94 + r() * 0.1); }
      const tk = score.tracks[e.tr];
      return Object.assign({}, e, { ix, score_t: e.t, t, v, track: tk.name, trackGain: tk.v ?? 0.7, noiseSeed });
    });
    out[id] = { score, fingerprint: scoreFingerprint(score), events };
  }
  return out;
}

function sourceRecord() {
  const files = ['src/audio/10_synth.js', 'src/audio/20_sequencer.js'].concat(
    fs.readdirSync(path.join(root, 'src/audio')).filter((f) => /^3\d_songs.*\.js$/.test(f)).sort().map((f) => 'src/audio/' + f));
  const hashes = {};
  for (const f of files) hashes[f] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex');
  let head = null, dirty = null;
  try {
    head = execSync('git rev-parse HEAD', { cwd: root }).toString().trim();
    dirty = execSync('git status --porcelain -- src/audio', { cwd: root }).toString().trim() !== '';
  } catch (e) { /* not a checkout */ }
  return { head, audioSourceDirty: dirty, files: hashes };
}

// run as a command (on Windows too: a file URL is file:///C:/…, never 'file://' + the path the shell gave)
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const ids = process.argv.slice(2).length ? process.argv.slice(2) : PILOTS;
  const all = compile(ids), src = sourceRecord();
  for (const id of ids) {
    const { score, fingerprint, events } = all[id];
    const dir = path.join(workDir(), id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'score.json'), JSON.stringify(score));
    fs.writeFileSync(path.join(dir, 'performance.json'), JSON.stringify(events));
    fs.writeFileSync(path.join(dir, 'source.json'), JSON.stringify(Object.assign({ songId: id, fingerprint, offset: OFFSET, length: score.length, loop: score.loop, loopStart: score.loopStart, loopIdx: score.loopIdx, events: events.length }, src), null, 2));
    console.log(id, fingerprint, 'D', score.length, 'L', score.loopStart, 'events', events.length, 'loopIdx', score.loopIdx);
  }
}
