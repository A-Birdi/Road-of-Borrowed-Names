// MT-1 production step 4: measure the media files in Chromium, calibrate them in the game's own graph, and write the
// manifest (development tool; nothing here ships).
//
//   node tools/music/ensemble/verify.mjs [songId ...]        (RB_PAGE=<built page> to use a scratch build)
//
// For each song packaged by package.py, with the built game page loaded in Chromium (the installed Playwright):
//  1. decode   every file at 48 kHz and 44.1 kHz with the browser's own decodeAudioData: channels, frames, finite;
//              at 48 kHz, alignment and coding error against the lossless master (min-error shift within +-32 frames
//              at a dozen windows: the shift must be 0, i.e. the SNR at no shift within 1 dB of the best).
//  2. place    the game's own scheduler (RB.audio.renderEnsembleOffline, raw) from the cue's start through the join
//              and two cycle boundaries, and around boundaries 3 to 10, against a model built from the decoded files
//              (linear interpolation at the exact read positions, the same crossfade gains): the scheduler puts every
//              stretch where the score clock says. At each join/boundary: the two renderings blended (their agreement)
//              and the largest sample step against the render's own 99.9th percentile (a click would stand out).
//  3. calibrate the Ensemble's trim so its integrated loudness through the whole game graph (music bus, ducking at
//              rest, master chain) over the first pass equals the Original's within 0.5 LU (BS.1770, loudness.mjs),
//              with the Original warm as in live play; peaks and NaN checked; the second format checked at that trim.
//  4. align    the two performances musically: onset envelopes (1 ms) of the Original and the Ensemble in phase,
//              cross-correlated within +-50 ms: the lag must be within 5 ms.
//  5. hand over Original -> Ensemble -> Original mid-phrase (XF, linear, as live): momentary loudness through each
//              fade against the levels either side.
// Writes docs/music/ensemble/qa/<id>.json and assets/music/ensemble/manifest.json. A format that fails is left out
// of the manifest; a track is `ready` only if a format passes everything and the provenance notice is in place.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { serve, launch, page, root } from '../../../tests/e2e/lib.mjs';
import { compile, workDir, PILOTS } from './export_events.mjs';
import { MANIFEST } from './manifest.mjs';
import { PAGE_LIB, XJ } from './page_lib.mjs';

const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const IDS = ids.length ? ids : PILOTS;
const QA = 'docs/music/ensemble/qa';
const NOTICE = 'assets/music/ensemble/NOTICE.md';

// float32 WAV (as soundfile writes it): the interleaved samples of its data chunk
function readWav(f) {
  const b = fs.readFileSync(f);
  let o = 12, fmt = null, data = null;
  while (o + 8 <= b.length) {
    const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4);
    if (id === 'fmt ') fmt = { tag: b.readUInt16LE(o + 8), ch: b.readUInt16LE(o + 10), rate: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) };
    if (id === 'data') data = b.subarray(o + 8, o + 8 + n);
    o += 8 + n + (n & 1);
  }
  if (!fmt || !data || fmt.bits !== 32 || fmt.ch !== 2) throw new Error('expected a 32-bit float stereo WAV: ' + f);
  const x = new Float32Array(data.buffer.slice(data.byteOffset, data.byteOffset + data.length));
  return { rate: fmt.rate, frames: x.length / 2, x };
}
const f32 = (b64) => { const b = Buffer.from(b64, 'base64'); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); };

function alignWindow(master, at, L, R, search = 32) {
  // master: interleaved; L/R: decoded windows starting at at - search, length win + 2 search
  const win = L.length - 2 * search;
  let sig = 0;
  for (let i = 0; i < win; i++) sig += master[2 * (at + i)] ** 2 + master[2 * (at + i) + 1] ** 2;
  if (Math.sqrt(sig / (2 * win)) < 1e-4) return null;
  let best = null, e0 = null;
  for (let lag = -search; lag <= search; lag++) {
    let e = 0;
    for (let i = 0; i < win; i++) {
      const d0 = master[2 * (at + i)] - L[search + lag + i], d1 = master[2 * (at + i) + 1] - R[search + lag + i];
      e += d0 * d0 + d1 * d1;
    }
    if (lag === 0) e0 = e;
    if (!best || e < best.e) best = { lag, e };
  }
  const db = (e) => +(10 * Math.log10(sig / Math.max(1e-30, e))).toFixed(2);
  return { at, lag: best.lag, snrDb: db(e0), bestSnrDb: db(best.e) };
}

function db(x) { return 20 * Math.log10(x); }

async function verifySong(p, id, cur) {
  const work = path.join(workDir(), id);
  const rep = JSON.parse(fs.readFileSync(path.join(work, 'render.json'), 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(work, 'package.json'), 'utf8'));
  const masters = { first: readWav(path.join(work, rep.head.file)), loop: readWav(path.join(work, rep.loop.file)) };
  const song = cur.score, D = song.length, L0 = song.loopStart, Pd = D - L0;
  const out = { songId: id, generatedBy: 'tools/music/ensemble/verify.mjs', browser: await p.evaluate(() => navigator.userAgent), fingerprint: cur.fingerprint, renderFingerprint: rep.fingerprint, formats: [] };
  const fmts = pkg.assets.first.map((a, i) => ({ codec: a.codec, first: a, loop: pkg.assets.loop[i] }));
  // 1. decode
  for (const f of fmts) {
    const r = { codec: f.codec, decode: {}, alignment: {} };
    for (const role of ['first', 'loop']) {
      const a = f[role], url = './assets/music/ensemble/' + a.file;
      const d = await p.evaluate(([u]) => window.__mtDecode(u, [48000, 44100]), [url]);
      r.decode[role] = d;
      const m = masters[role];
      const ok48 = d.rates[48000].frames === m.frames && d.rates[48000].channels === 2 && d.rates[48000].finite;
      const exp441 = m.frames * 44100 / 48000;
      const ok441 = Math.abs(d.rates[44100].frames - exp441) <= 2 && d.rates[44100].channels === 2 && d.rates[44100].finite;
      const win = 8192, search = 32, ps = a.playableStartFrame, pe = a.playableEndFrame;
      const starts = [ps, Math.max(ps, pe - win)];
      for (let s = ps + 4096; s < pe - win; s += Math.max(win, Math.floor((pe - ps) / 12))) starts.push(s);
      const ws = await p.evaluate(([u, st, w, se]) => window.__mtWindows(u, st, w, se), [url, starts, win, search]);
      const al = ws.map((w) => alignWindow(m.x, w.at, f32(w.L), f32(w.R), search)).filter(Boolean);
      const aligned = al.length >= 3 && al.every((x) => x.lag === 0 || x.bestSnrDb - x.snrDb < 1);
      r.alignment[role] = { frames48k: d.rates[48000].frames, masterFrames: m.frames, frames44k: d.rates[44100].frames, ok48, ok441, windows: al, aligned, minSnrDb: Math.min(...al.map((x) => x.snrDb)) };
      console.log(id, f.codec, role, 'frames', d.rates[48000].frames, '/', m.frames, '44.1k', d.rates[44100].frames, 'aligned', aligned, 'min SNR', r.alignment[role].minSnrDb);
    }
    r.decodeOk = ['first', 'loop'].every((k) => r.alignment[k].ok48 && r.alignment[k].ok441 && r.alignment[k].aligned);
    out.formats.push(r);
  }
  const entryFor = (trim) => ({
    releaseStatus: 'ready', fingerprint: cur.fingerprint, durationSec: D, loop: song.loop, loopStartSec: L0, trim,
    formats: fmts.map((f) => ({ codec: f.codec, first: ref(f.first, out, f.codec, 'first'), loop: ref(f.loop, out, f.codec, 'loop') })),
  });
  function ref(a, o, codec, role) {
    const fr = o.formats.find((x) => x.codec === codec).alignment[role].frames48k;
    return { url: './assets/music/ensemble/' + a.file, sha256: a.sha256, bytes: a.encodedBytes, rate: 48000, frames: fr, start: a.playableStartFrame, end: a.playableEndFrame };
  }
  // 2. placement: the cue's start through the join and two boundaries; then boundaries 3..10
  const entry = entryFor(1);
  for (let fi = 0; fi < fmts.length; fi++) {
    const r = out.formats[fi];
    if (!r.decodeOk) continue;
    r.placement = [];
    r.placement.push(await p.evaluate(([i, e, k, fr, s]) => window.__mtPlace(i, e, k, fr, s), [id, entry, fi, 0, D + Pd + 1.5]));
    for (let k = 3; k <= 10; k++) {
      const from = D + (k - 1) * Pd - 1;
      r.placement.push(await p.evaluate(([i, e, kk, fr, s]) => window.__mtPlace(i, e, kk, fr, s), [id, entry, fi, from, 2.5]));
    }
    // mid-way starts: in the first pass before the join, after it, and deep in a later cycle at an odd phase
    for (const from of [1.234567, rep.head.joinSec + 3.21, D + 6 * Pd + Pd * 0.61803]) r.placement.push(await p.evaluate(([i, e, kk, fr, s]) => window.__mtPlace(i, e, kk, fr, s), [id, entry, fi, from, 3]));
    const all = r.placement, seams = all.flatMap((x) => x.seams);
    r.placementOk = all.every((x) => x.modelSnrDb >= 60);
    r.joins = seams.filter((s) => s.kind === 'join');
    r.boundaries = seams.filter((s) => s.kind === 'boundary');
    r.seamOk = r.joins.length >= 1 && seams.every((s) => s.agreementDb >= 12 && s.stepRatio <= 1.05);
    r.boundariesSeen = r.boundaries.length;
    r.models = [...new Set(all.map((x) => x.model))];
    console.log(id, r.codec, 'placement SNR min', Math.min(...all.map((x) => x.modelSnrDb)), 'read model', r.models.join('/'), 'joins', r.joins.map((s) => [s.agreementDb, s.stepRatio]), 'boundaries', r.boundaries.length, 'agreement min', Math.min(...r.boundaries.map((s) => s.agreementDb)), 'step max', Math.max(...seams.map((s) => s.stepRatio)));
  }
  // 3. calibration (first passing format), then the others at its trim
  const fi0 = out.formats.findIndex((r) => r.decodeOk && r.placementOk && r.seamOk);
  if (fi0 < 0) { out.ready = false; out.reason = 'no format passed decode/placement/seams'; return out; }
  const orig = await p.evaluate(([i, e, k, s]) => window.__mtGraph(i, e, k, s, { mix: 1, until: s - 0.05, onsets: 'O', momentary: true }), [id, entry, fi0, D + 0.05]);
  let trim = Math.pow(10, -0 / 20), ens = null;
  const iters = [];
  for (let it = 0; it < 4; it++) {
    ens = await p.evaluate(([i, e, k, s, t]) => window.__mtGraph(i, e, k, s, { mix: 0, trim: t, until: s - 0.05, onsets: 'E', momentary: true }), [id, entry, fi0, D + 0.05, trim]);
    const diff = orig.integrated - ens.integrated;
    iters.push({ trim, ensembleLufs: ens.integrated, diffLu: diff });
    if (Math.abs(diff) <= 0.1) break;
    trim *= Math.pow(10, diff / 20);
  }
  const final = iters[iters.length - 1];
  const onset = await p.evaluate(() => window.__mtOnsetLag(50));
  out.calibration = { window: 'the first pass, 0 to ' + D + ' s, 48 kHz, default volumes, no ducking', originalLufs: orig.integrated, originalPeak: orig.peak, iterations: iters, trim: final.trim, gainDb: db(final.trim), ensembleLufs: final.ensembleLufs, diffLu: final.diffLu, ensemblePeak: ens.peak, nan: ens.nan, clippedSamples: ens.clipped };
  // (the momentary series of each performance alone, for the handover check; the last Ensemble render is at the final trim)
  const momO = orig.momentary, momE = ens.momentary;
  out.calibrationOk = Math.abs(final.diffLu) <= 0.5 && !ens.nan && ens.peak <= 1;
  out.onsets = onset;
  // the two performances' attacks line up: the peak within 15 ms (a sampled instrument's own attack is part of it),
  // and at least three times the correlation 40 ms away (a beat or a frame out would not be)
  // (two different instrumentations correlate weakly in absolute terms; what matters is a clear peak near zero)
  out.onsetOk = Math.abs(onset.lagMs) <= 15 && onset.r >= 0.03 && onset.r >= 3 * Math.max(0, onset.rAt40);
  console.log(id, 'Original', orig.integrated.toFixed(2), 'LUFS; Ensemble', final.ensembleLufs.toFixed(2), 'at', db(final.trim).toFixed(2), 'dB; onset lag', onset.lagMs, 'ms (r', onset.r, 'r at 40 ms', onset.rAt40 + ')');
  for (let fi = 0; fi < fmts.length; fi++) {
    const r = out.formats[fi];
    if (!r.decodeOk || !r.placementOk || !r.seamOk) { r.ok = false; continue; }
    if (fi === fi0) { r.loudness = { lufs: final.ensembleLufs, diffLu: final.diffLu }; r.ok = out.calibrationOk; continue; }
    const e2 = await p.evaluate(([i, e, k, s, t]) => window.__mtGraph(i, e, k, s, { mix: 0, trim: t, until: s - 0.05 }), [id, entry, fi, D + 0.05, final.trim]);
    r.loudness = { lufs: e2.integrated, diffLu: orig.integrated - e2.integrated, peak: e2.peak, nan: e2.nan };
    r.ok = Math.abs(r.loudness.diffLu) <= 0.5 && !e2.nan && e2.peak <= 1;
    console.log(id, r.codec, 'at the same trim', e2.integrated.toFixed(2), 'LUFS (', r.loudness.diffLu.toFixed(2), 'LU)');
  }
  // 5. handovers mid-phrase: Original -> Ensemble at H1, back at H2 (render times)
  const H1 = Math.min(D - 12, 20.3), H2 = H1 + 6.1;
  const ho = await p.evaluate(([i, e, k, s, t, a, b]) => window.__mtGraph(i, e, k, s, { mix: 1, trim: t, momentary: true, handovers: [{ at: a, to: 'ensemble' }, { at: b, to: 'original' }] }), [id, entry, fi0, H2 + 4, final.trim, H1, H2]);
  // each 400 ms block touching a fade, against the same block of each performance alone (same render clock): a fade
  // that summed badly would rise above both or sink below both
  const at = (arr, t) => { const m = arr.find((x) => Math.abs(x.t - t) < 1e-6); return m ? m.lufs : null; };
  out.handovers = [H1, H2].map((h) => {
    // (block times are from the render's 0.05 s start, the handover times are render times)
    const rows = ho.momentary.filter((m) => m.t + 0.05 > h && m.t + 0.05 - 0.4 < h + 0.2).map((m) => {
      const o = at(momO, m.t), e = at(momE, m.t);
      return { t: +m.t.toFixed(2), handover: +m.lufs.toFixed(2), original: o != null ? +o.toFixed(2) : null, ensemble: e != null ? +e.toFixed(2) : null, above: +(m.lufs - Math.max(o, e)).toFixed(2), below: +(Math.min(o, e) - m.lufs).toFixed(2) };
    });
    return { at: h, blocks: rows.length, bumpLu: Math.max(...rows.map((r) => r.above)), dipLu: Math.max(...rows.map((r) => r.below)), rows };
  });
  out.handoverOk = out.handovers.every((h) => h.blocks >= 4 && h.bumpLu <= 1 && h.dipLu <= 1.5);
  console.log(id, 'handovers', out.handovers.map((h) => `above both ${h.bumpLu.toFixed(2)} LU, below both ${h.dipLu.toFixed(2)} LU over ${h.blocks} blocks`).join('; '));
  return out;
}

const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function rendererRevision() {
  const h = crypto.createHash('sha256');
  for (const f of ['export_events.mjs', 'rs1.py', 'render.py', 'package.py']) h.update(fs.readFileSync(path.join(root, 'tools/music/ensemble', f)));
  return 'mt1-tools-sha256:' + h.digest('hex').slice(0, 16);
}

const cur = compile(IDS);
const { srv, url } = await serve();
const browser = await launch();
// (the page under test is built before its manifest exists, so its policy still says connect-src 'none': this
// development measurement bypasses the page's CSP to read the files; the built game's own policy is tested apart)
const { p, errors } = await page(browser, url, { context: await browser.newContext({ bypassCSP: true }) });
await p.addScriptTag({ content: fs.readFileSync(path.join(root, 'tools/music/ensemble/loudness.mjs'), 'utf8').replace(/export function/g, 'function') + '\nwindow.__lufs = loudness;' });
await p.addScriptTag({ content: PAGE_LIB });
fs.mkdirSync(path.join(root, QA), { recursive: true });
const manPath = path.join(root, MANIFEST);
const manifest = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : { schemaVersion: 1, runtimeEnabled: false, coverage: '', tracks: [] };
for (const id of IDS) {
  const res = await verifySong(p, id, cur[id]);
  const rep = JSON.parse(fs.readFileSync(path.join(workDir(), id, 'render.json'), 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(workDir(), id, 'package.json'), 'utf8'));
  res.render = rep;
  res.renderer = rendererRevision();
  const qa = path.join(QA, id + '.json');
  fs.writeFileSync(path.join(root, qa), JSON.stringify(res, null, 1));
  const good = (res.formats || []).map((r, i) => (r.ok ? i : -1)).filter((i) => i >= 0);
  const asset = (a, role, codec) => ({
    relativeUrl: './assets/music/ensemble/' + a.file, mimeType: a.mimeType, sha256: a.sha256, encodedBytes: a.encodedBytes, sampleRate: a.sampleRate, channels: 2,
    decodedFrames: res.formats.find((x) => x.codec === codec).alignment[role].frames48k, playableStartFrame: a.playableStartFrame, playableEndFrame: a.playableEndFrame,
    ...(role === 'loop' ? { loopStartFrame: a.playableStartFrame } : {}),
  });
  const src = JSON.parse(fs.readFileSync(path.join(workDir(), id, 'source.json'), 'utf8'));
  const ev = {
    scoreCompatibleWithCurrentBuild: res.fingerprint === res.renderFingerprint,
    scoreEventsPreserved: rep.loop.eventsPlaced === rep.loop.eventsInRepeat && rep.head.eventsPlaced > 0 && !!res.onsetOk,
    decodedAlignmentVerified: good.length > 0 && !!res.onsetOk,
    firstPassSeamVerified: good.length > 0 && good.every((i) => res.formats[i].joins.length > 0 && res.formats[i].seamOk),
    repeatedLoopVerified: good.length > 0 && good.every((i) => res.formats[i].boundariesSeen >= 10 && res.formats[i].placementOk),
    gameMixCalibrated: !!res.calibrationOk && !!res.handoverOk,
    distributionProvenanceRecorded: fs.existsSync(path.join(root, NOTICE)),
    reportPaths: [qa],
  };
  const ready = Object.entries(ev).every(([k, v]) => k === 'reportPaths' || v === true);
  const track = {
    songId: id, releaseStatus: ready ? 'ready' : 'pending_production', fingerprintVersion: 'mt1-score-v1', scoreFingerprint: res.fingerprint,
    referenceCommit: src.head, rendererRevision: res.renderer,
    timeline: { durationSec: cur[id].score.length, loop: cur[id].score.loop, loopStartSec: cur[id].score.loopStart },
    assets: good.length ? { layout: 'split_firstpass_loop', firstPass: good.map((i) => asset(pkg.assets.first[i], 'first', res.formats[i].codec)), steadyLoop: good.map((i) => asset(pkg.assets.loop[i], 'loop', res.formats[i].codec)) } : null,
    mix: res.calibration ? { profile: 'pre_master_music_bus', gainDb: +res.calibration.gainDb.toFixed(3), roomBaked: true, userVolumeBaked: false } : { profile: 'pending', gainDb: null, roomBaked: null, userVolumeBaked: false },
    evidence: ev,
    notes: 'SC-1 instrumental treatment of the current score (first-pass realisation), rendered by tools/music/ensemble at 48 kHz: a first pass to ' + rep.head.joinSec.toFixed(3) + ' s and one circular steady cycle, with guards. Machine-checked in Chromium only (' + qa + '); not yet listened to by Robin.',
  };
  const i = manifest.tracks.findIndex((t) => t.songId === id);
  if (i >= 0) manifest.tracks[i] = track; else manifest.tracks.push(track);
  console.log(id, ready ? 'READY' : 'pending', JSON.stringify(ev));
}
manifest.runtimeEnabled = manifest.tracks.some((t) => t.releaseStatus === 'ready');
manifest.coverage = 'Pilot: ' + manifest.tracks.filter((t) => t.releaseStatus === 'ready').map((t) => t.songId).join(', ') + '. Every other song plays its Original.';
fs.writeFileSync(manPath, JSON.stringify(manifest, null, 2) + '\n');
if (errors.length) console.log('page errors:', errors.slice(0, 5));
await browser.close();
srv.close();
