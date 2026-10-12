// MT-1, the music performance (Original / Ensemble; docs/MUSIC_PERFORMANCE.md), in node: the score fingerprint the
// game computes against the build tool's, the cue clock, the asset-path rules, the catalog's gates, the manifest
// checks against the files and the current scores, and the built page's catalog and connection policy.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { load, root } from '../lib/load.mjs';
import { scoreFingerprint } from '../../tools/music/ensemble/fingerprint.mjs';
import { readManifest, runtimeCatalog, trackProblems } from '../../tools/music/ensemble/manifest.mjs';

export default async (t) => {
  // a hosted page at a sub-path, for the URL rules (the vm has no document of its own)
  const loc = { protocol: 'https:', origin: 'https://example.test', href: 'https://example.test/rb/index.html' };
  const RB = load(['core', 'audio'], { __RB_TEST__: true, URL, location: loc, document: { baseURI: loc.href } });
  const A = RB.audio, _ = A._;

  // ---- the fingerprint: the game's canonical form hashes to the build tool's value, for every song
  let same = 0, n = 0;
  for (const id of Object.keys(_.songDefs)) {
    const song = _.getSong(id);
    const runtime = 'sha256:' + crypto.createHash('sha256').update(_.canonicalScore(song), 'utf8').digest('hex');
    n++;
    if (runtime === scoreFingerprint(JSON.parse(JSON.stringify(song)))) same++;
  }
  t.ok(n > 100 && same === n, 'the game and the build tool fingerprint every song alike (' + same + '/' + n + ')');

  // ---- the cue clock (score time e from the Original player's anchor; L the loop start, D the length)
  const mk = (length, loopStart, loop) => ({ song: { id: 'x', length, loopStart, loop }, anchor0: 10 });
  const kp = mk(71.57894736842104, 4.2105263157894735, true), sb = mk(94.5, 0, true), one = mk(6, 0, false);
  const at = (p, e) => _.clockAt(p, p.anchor0 + e);
  t.eq([at(kp, 0).pos, at(kp, 0).cycle], [0, 0], 'clock: the cue starts at score zero, first pass');
  t.ok(Math.abs(at(kp, 71.5).pos - 71.5) < 1e-9 && at(kp, 71.5).cycle === 0, 'clock: the first pass runs to D (the introduction is played once)');
  const P = 71.57894736842104 - 4.2105263157894735;
  t.ok(Math.abs(at(kp, 71.57894736842104 + 1).pos - (4.2105263157894735 + 1)) < 1e-9 && at(kp, 71.57894736842104 + 1).cycle === 1, 'clock: after D the repeat starts at L, not at zero (cycle 1)');
  const deep = at(kp, 71.57894736842104 + 9 * P + 2.5);
  t.ok(Math.abs(deep.pos - (4.2105263157894735 + 2.5)) < 1e-6 && deep.cycle === 10, 'clock: ten cycles on, the same phase (no drift in the mapping)');
  t.ok(Math.abs(at(sb, 94.5 * 3 + 0.25).pos - 0.25) < 1e-9 && at(sb, 94.5 * 3 + 0.25).cycle === 3, 'clock: Snowbell loops from zero (its introduction is in its repeat)');
  t.ok(at(one, 7).done && at(one, 7).pos === 6 && !at(one, 5).done, 'clock: a one-shot ends at D and stays ended');
  const b = at(kp, 71.57894736842104 + P);
  t.ok(b.pos >= 4.2105263157894735 && b.pos < 4.2105263157894735 + 1e-6, 'clock: an exact boundary gives the loop start, never a negative remainder');

  // ---- the setting: anything but the two names is Original
  t.ok(A.performance() === 'original', 'the performance starts as Original');
  A.setPerformance('ensemble');
  t.ok(A.performance() === 'ensemble', 'Ensemble can be chosen');
  for (const bad of ['../x', 'Ensemble', '', null, undefined, 5, { a: 1 }]) { A.setPerformance(bad); t.ok(A.performance() === 'original', 'an unknown preference is Original: ' + JSON.stringify(bad)); }
  t.ok(A.performanceStatus().state === 'off' || A.performanceStatus().state === 'none', 'with no audio context nothing plays, and nothing is fetched (' + A.performanceStatus().state + ')');
  t.ok(A.ensembleMemory().requests === 0, 'no request without a context, a cue and Ensemble');

  // ---- asset paths: only ./assets/music/ensemble/…, this origin, a known extension
  const okUrl = _.assetUrl({ url: './assets/music/ensemble/snowbell/snowbell.loop.0123456789abcdef.opus' });
  t.ok(okUrl === 'https://example.test/rb/assets/music/ensemble/snowbell/snowbell.loop.0123456789abcdef.opus', 'a catalog path resolves beside the hosted page (' + okUrl + ')');
  for (const bad of ['../assets/music/ensemble/a.opus', './assets/music/ensemble/../../secret.opus', './assets/music/ensemble/%2e%2e/a.opus', './assets/music/ensemble/a%2fb.opus', 'https://evil.test/assets/music/ensemble/a.opus', '//evil.test/assets/music/ensemble/a.opus', '/assets/music/ensemble/a.opus', './assets/music/ensemble/a.opus?x=1', './assets/music/ensemble/a.opus#t', './assets\\music\\ensemble\\a.opus', './assets/music/other/a.opus', './assets/music/ensemble/a.js', './assets/music/ensemble//a.opus', 'data:audio/ogg;base64,AAAA', 'javascript:alert(1)', '', null]) {
    let threw = false;
    try { _.assetUrl({ url: bad }); } catch (e) { threw = true; }
    t.ok(threw, 'an asset path is refused: ' + JSON.stringify(bad));
  }

  // ---- the catalog's runtime gate: a ready entry must describe a playable layout for its timeline
  const fmt = (o) => Object.assign({ codec: 'opus', type: 'audio/ogg; codecs="opus"', first: { url: './assets/music/ensemble/x/a.opus', sha256: 'a'.repeat(64), bytes: 10, rate: 48000, frames: 1000, start: 100, end: 900 }, loop: { url: './assets/music/ensemble/x/b.opus', sha256: 'b'.repeat(64), bytes: 10, rate: 48000, frames: Math.round(94.5 * 48000) + 2000, start: 1000, end: 1000 + Math.round(94.5 * 48000) } }, o || {});
  const entry = (f, o) => Object.assign({ releaseStatus: 'ready', fingerprint: 'sha256:' + '0'.repeat(64), durationSec: 94.5, loop: true, loopStartSec: 0, trim: 1, formats: [f] }, o || {});
  A.ensembleCatalog = { version: 1, songs: { snowbell: entry(fmt()) } };
  t.eq(A.ensembleSongs(), ['snowbell'], 'a well-formed ready entry is offered');
  A.ensembleCatalog = { version: 1, songs: { snowbell: entry(fmt(), { releaseStatus: 'pending_production' }) } };
  t.eq(A.ensembleSongs(), [], 'a pending entry is not');
  A.ensembleCatalog = { version: 1, songs: { snowbell: entry(fmt({ loop: Object.assign({}, fmt().loop, { end: 1000 + Math.round(94.5 * 48000 * 1.0001) , frames: 9e6 }) })) } };
  t.eq(A.ensembleSongs(), [], 'a steady cycle 100 ppm off the score\'s period is not (limit 50)');
  A.ensembleCatalog = { version: 1, songs: { snowbell: entry(fmt({ first: Object.assign({}, fmt().first, { end: 2000 }) })) } };
  t.eq(A.ensembleSongs(), [], 'playable frames beyond the decoded length are not');
  A.ensembleCatalog = null;
  t.eq(A.ensembleSongs(), [], 'no catalog, no Ensemble songs');

  // ---- the manifest against the files and the current scores
  const man = readManifest(root);
  const getSong = (id) => { try { return _.getSong(id); } catch (e) { return null; } };
  if (man) {
    for (const tr of man.tracks) {
      const p = trackProblems(tr, getSong(tr.songId), root);
      if (tr.releaseStatus === 'ready') t.ok(!p.length, 'manifest: ' + tr.songId + ' is ready and still eligible (recorded from the current score, files present and as stated)' + (p.length ? ': ' + p.join('; ') : ''));
      else t.log('manifest: ' + tr.songId + ' is ' + tr.releaseStatus);
    }
    // a stale recording is refused before anything is downloaded; so is a file that changed
    const ready = man.tracks.find((x) => x.releaseStatus === 'ready');
    if (ready) {
      const stale = JSON.parse(JSON.stringify(ready));
      stale.scoreFingerprint = 'sha256:' + '1'.repeat(64);
      t.ok(trackProblems(stale, getSong(stale.songId), root).some((q) => /^stale/.test(q)), 'manifest: a recording of a different score is left out (stale)');
      const changed = JSON.parse(JSON.stringify(ready));
      changed.assets.firstPass[0].sha256 = '2'.repeat(64);
      t.ok(trackProblems(changed, getSong(changed.songId), root).some((q) => /sha256 differs/.test(q)), 'manifest: a file whose content differs from its record is left out');
      const unsafe = JSON.parse(JSON.stringify(ready));
      unsafe.assets.steadyLoop[0].relativeUrl = './assets/music/ensemble/../../index.html';
      t.ok(trackProblems(unsafe, getSong(unsafe.songId), root).some((q) => /relativeUrl/.test(q)), 'manifest: a path out of the music directory is left out');
      const unproven = JSON.parse(JSON.stringify(ready));
      unproven.evidence.repeatedLoopVerified = false;
      t.ok(trackProblems(unproven, getSong(unproven.songId), root).some((q) => /repeatedLoopVerified/.test(q)), 'manifest: a track without its evidence is left out');
    }
    const { catalog } = runtimeCatalog(man, getSong, root);
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const csp = (html.match(/connect-src '([a-z]+)'/) || [])[1];
    if (catalog) {
      t.ok(csp === 'self' && html.includes('RB.audio.ensembleCatalog = '), 'index.html: built with the catalog, connect-src \'self\'');
      const m = html.match(/RB\.audio\.ensembleCatalog = (\{.*?\});\n/);
      t.ok(m && JSON.stringify(JSON.parse(m[1])) === JSON.stringify(catalog), 'index.html: its catalog is the manifest\'s eligible tracks, as they are now (rebuild after a manifest change)');
      t.ok(!/assets\/music\/ensemble\/[^"']+\.(opus|mp3)["'][^]*base64/.test(html.slice(0, 2000)), 'index.html: the recordings are referenced, not embedded');
      for (const id of Object.keys(catalog.songs)) for (const f of catalog.songs[id].formats) t.ok(f.type && f.first.url.startsWith('./assets/music/ensemble/') && f.loop.url.startsWith('./assets/music/ensemble/'), 'catalog: ' + id + ' ' + f.codec + ' has a type to ask the browser about and files in the music directory');
    } else t.ok(csp === 'none' && !html.includes('RB.audio.ensembleCatalog = '), 'index.html: no eligible recording, no catalog, connect-src \'none\'');
  } else t.ok(!fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('ensembleCatalog = '), 'no manifest, no catalog');
};
