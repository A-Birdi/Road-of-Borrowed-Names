// MT-2 production step 1b: the Original's part balance, measured in Chromium (development tool; nothing here ships).
//
//   node tools/music/ensemble/stems.mjs [songId ...]        (default: every song; RB_PAGE=<built page> as verify.mjs)
//
// For each song, the game's own player renders the first pass ([0, D) of the cue, 48 kHz) with every track's strip
// tapped to its own channel (after the track's gain, before its pan, the room and the echo: page_lib.mjs __mtStems).
// Per part: the K-weighted mean square (BS.1770's filter, ungated) and the RMS. render.py sets each Ensemble part's
// gain so that the part, rendered from the same first pass and measured the same way, has the Original part's
// K-weighted level: the Original's balance, carried over part by part. Writes <work>/<id>/stems.json.
// The same render also gives the whole Original through the game graph, measured exactly as verify.mjs's calibration
// measures it (integrated loudness, peak, momentary levels, onset envelope): <work>/<id>/original.json, which
// verify.mjs uses instead of rendering the Original's first pass a second time.
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from '../../../tests/e2e/lib.mjs';
import { compile, workDir } from './export_events.mjs';
import { PAGE_LIB } from './page_lib.mjs';
import { load } from '../../../tests/lib/load.mjs';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const IDS = args.length ? args : load(['core', 'audio'], { __RB_TEST__: true }).audio.songList().map((s) => s.id || s);
const cur = compile(IDS);
const { srv, url } = await serve();
const browser = await launch();
const { p, errors } = await page(browser, url);
await p.addScriptTag({ content: fs.readFileSync(path.join(root, 'tools/music/ensemble/loudness.mjs'), 'utf8').replace(/export function/g, 'function') + '\nwindow.__lufs = loudness; window.__kWeight = kWeight;' });
await p.addScriptTag({ content: PAGE_LIB });
for (const id of IDS) {
  const D = cur[id].score.length, t0 = Date.now();
  const { parts, whole } = await p.evaluate(([i, s]) => window.__mtStems(i, s + 0.05), [id, D]);
  const dir = path.join(workDir(), id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'stems.json'), JSON.stringify({ songId: id, fingerprint: cur[id].fingerprint, window: [0, D], sampleRate: 48000, measuredBy: 'tools/music/ensemble/stems.mjs (Chromium, the game\'s player, strips tapped before pan/room/echo)', parts }, null, 1));
  fs.writeFileSync(path.join(dir, 'original.json'), JSON.stringify(Object.assign({ songId: id, fingerprint: cur[id].fingerprint, browser: await p.evaluate(() => navigator.userAgent), measuredBy: 'tools/music/ensemble/stems.mjs: the Original\'s first pass through the game graph, measured as verify.mjs\'s __mtGraph(mix 1, until D)' }, whole)));
  console.log(id, 'D', D.toFixed(2), 'Original', whole.integrated.toFixed(2), 'LUFS;', parts.map((q) => q.track + ' ' + (q.kms > 0 ? (10 * Math.log10(q.kms)).toFixed(1) : '-inf')).join(', '), ((Date.now() - t0) / 1000).toFixed(1) + ' s');
}
if (errors.length) console.log('page errors:', errors.slice(0, 5));
await browser.close();
srv.close();
