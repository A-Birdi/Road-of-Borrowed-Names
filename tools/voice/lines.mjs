// VA-1 (VS01): every spoken line in the compiled scenes, for choosing the audition corpus.
// Each line: { key, scene, idx, file, line, who, expr, if, jp, plain, en, prev, next, region }.
//   key    a stable id: the scene and a hash of the line's Japanese (survives lines inserted before it);
//   plain  the Japanese as shown, without readings and without the learner spacing (what a voice would speak);
//   prev / next  the neighbouring spoken lines of the same scene (context for the review, never spoken).
// Usage: node tools/voice/lines.mjs [--who suzu] [--grep <regex on en/jp>] [--region rw] [--json]
import crypto from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { load } from '../../tests/lib/load.mjs';

globalThis.__RB_TEST__ = true;
export const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
// a display line's spoken form: furigana groups to their kanji, the learner's word spacing removed (Japanese is
// written without spaces; the spaces are the game's reading aid), anything else unchanged
export const spoken = (jp) => RB.jp.plain(jp).replace(/\s+/g, '').normalize('NFC');
export const keyOf = (scene, jp) => scene + '#' + crypto.createHash('sha256').update(String(jp)).digest('hex').slice(0, 10);
export const regionOf = (scene) => scene.split('.')[0];
export function allLines() {
  const out = [];
  for (const id in RB.content.scenes) {
    const cmds = RB.content.scenes[id].cmds || [];
    const says = [];
    cmds.forEach((c, idx) => { if (c.op === 'say' && c.jp) says.push({ c, idx }); });
    says.forEach(({ c, idx }, k) => {
      out.push({
        key: keyOf(id, c.jp), scene: id, idx, file: c.file || RB.content.scenes[id].file, line: c.line, who: c.who || 'narr', expr: c.expr || null,
        if: c.if || null, jp: c.jp, plain: spoken(c.jp), en: c.en || '', region: regionOf(id),
        prev: k > 0 ? { who: says[k - 1].c.who || 'narr', plain: spoken(says[k - 1].c.jp), en: says[k - 1].c.en || '' } : null,
        next: k < says.length - 1 ? { who: says[k + 1].c.who || 'narr', plain: spoken(says[k + 1].c.jp), en: says[k + 1].c.en || '' } : null,
      });
    });
  }
  // lines the game shows by its own code, outside the scenes (src/content/00_prologue.js RB.content.spokenLines),
  // under the scene id it shows them with; a companion's line names the companions who can say it (comps). Listed once
  // for each speaker: the same words from two people are two recordings ("I saw them just now, over by Hana's Teahouse"
  // is Hana's neighbours' answer and Tomo's; the line's key is the scene and the words, the recording the speaker's)
  const seen = new Set(out.map((l) => l.key + '|' + l.who));
  const listed = [].concat(RB.content.spokenLines || [], ...(RB.content.spokenSources || []).map((f) => f()));
  for (const x of listed) {
    const key = keyOf(x.scene, x.jp);
    if (seen.has(key + '|' + (x.who || 'narr'))) continue;
    seen.add(key + '|' + (x.who || 'narr'));
    out.push({
      key, scene: x.scene, idx: null, file: x.file || null, line: null, who: x.who || 'narr', expr: x.expr || null, if: null, jp: x.jp, plain: spoken(x.jp),
      en: x.en || '', region: regionOf(x.scene), prev: null, next: null, code: true, comps: x.comps || null,
    });
  }
  return out;
}
// run as a command (on Windows too: a file URL is file:///C:/…, never 'file://' + the path the shell gave)
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  let L = allLines();
  if (opt('--who')) L = L.filter((l) => l.who === opt('--who'));
  if (opt('--region')) L = L.filter((l) => opt('--region').split(',').includes(l.region));
  if (opt('--grep')) { const re = new RegExp(opt('--grep'), 'i'); L = L.filter((l) => re.test(l.en) || re.test(l.plain)); }
  if (a.includes('--json')) console.log(JSON.stringify(L));
  else for (const l of L) console.log([l.key, l.who + (l.expr ? '[' + l.expr + ']' : ''), l.if || '', l.plain, l.en].join('\t'));
}
