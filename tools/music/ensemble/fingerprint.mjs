/** The score fingerprint (mt1-score-v1), build time, Node only: MT-1's reference implementation, unchanged.
 * The game computes the same value at run time (src/audio/22_ensemble.js, _.canonicalScore) and compares it with the
 * fingerprint a recording was made from before it downloads anything; tests/unit checks the two agree.
 * Callers pass a plain JSON copy of the compiled score (JSON.parse(JSON.stringify(song))), as the game does.
 */
import {createHash} from 'node:crypto';
export const FINGERPRINT_VERSION='mt1-score-v1';
function normalize(value) {
  if(value===null || typeof value==='string' || typeof value==='boolean') return value;
  if(typeof value==='number') {
    if(!Number.isFinite(value)) throw new TypeError('nonfinite musical value');
    // Nanosecond/1e-9 numeric precision: far finer than an audio sample.
    const scaled=value*1e9; if(!Number.isFinite(scaled)) throw new RangeError('musical value too large to canonicalize');
    const n=Math.round(scaled)/1e9; return Object.is(n,-0)?0:n;
  }
  if(Array.isArray(value)) return value.map(v=>{
    if(v===undefined) throw new TypeError('undefined array value'); return normalize(v);
  });
  if(value && Object.getPrototypeOf(value)===Object.prototype) {
    const result={};
    for(const key of Object.keys(value).sort()) if(value[key]!==undefined) result[key]=normalize(value[key]);
    return result;
  }
  throw new TypeError('unsupported value in compiled score');
}
export function scoreProjection(score) {
  if(!score || typeof score.id!=='string' || !Array.isArray(score.events) || !Array.isArray(score.tracks) || !Array.isArray(score.sections)) throw new TypeError('compiled score with id/events/tracks/sections required');
  if(!Number.isFinite(score.length)||score.length<=0||typeof score.loop!=='boolean'||!Number.isFinite(score.loopStart)||score.loopStart<0||score.loopStart>=score.length) throw new RangeError('invalid compiled timeline');
  const fields={fingerprintVersion:FINGERPRINT_VERSION};
  // Includes whole ordered event/track/section structures; excludes title, notes,
  // sourceCommit, definition and render/export timestamps. New compiler semantics
  // must update this version rather than assume unknown fields are inaudible.
  for(const key of ['id','length','loop','loopStart','loopIdx','bpm','echo','tracks','sections','events']) fields[key]=score[key]??null;
  return normalize(fields);
}
export function canonicalScore(score) {return JSON.stringify(scoreProjection(score));}
export function scoreFingerprint(score) {return 'sha256:'+createHash('sha256').update(canonicalScore(score),'utf8').digest('hex');}
