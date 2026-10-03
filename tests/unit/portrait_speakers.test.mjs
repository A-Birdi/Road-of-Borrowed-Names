// Portrait validation against the scripts (the paired addendum §12.3; docs/expressive/CONTRACT.md WI26), in node:
// the portrait tests (portrait_anim) check every portrait the renderer knows; this one starts from who actually
// speaks, line by line, in every scene, and from the expression tags those lines carry.
// - every speaker with a line (the companions for `comp`, the player) has a portrait, and every speaker with
//   20 or more lines ("major") has a living loop: over 30 s of a neutral line at least 6 blinks' worth of frame
//   changes, never more than 8 changes in any second, and a frame that returns to the still between motions;
// - every expression tag a speaker's lines use has a lead-in cue for that speaker (none for neutral), at most
//   900 ms long, after which the face settles: 400 ms with no change, then only the loop (the same small set of
//   frames a neutral line shows, over the tag's own face);
// (that a repeated speaker and tag replays no cue is play()'s rule, checked by portrait_anim with real clicks);
// - the share of all spoken lines that carry a tag, and of those that get a cue, is reported, with the speakers
//   by line count.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const C = RB.content, PA = RB.portraitAnim, PO = RB.portraits;
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const lines = {}, tags = {};
  let spoken = 0, tagged = 0;
  for (const id in C.scenes) for (const c of C.scenes[id].cmds || []) {
    if (c.op !== 'say' || !c.who || c.who === 'narr') continue;
    spoken++;
    if (c.expr && c.expr !== 'neutral') tagged++;
    for (const w of c.who === 'comp' ? COMPS : [c.who]) {
      lines[w] = (lines[w] || 0) + (c.who === 'comp' ? 1 / COMPS.length : 1);
      if (c.expr) { tags[w] = tags[w] || {}; tags[w][c.expr] = (tags[w][c.expr] || 0) + (c.who === 'comp' ? 1 / COMPS.length : 1); }
    }
  }
  const speakers = Object.keys(lines).sort((a, b) => lines[b] - lines[a]);
  const major = speakers.filter((w) => lines[w] >= 20);
  t.ok(speakers.length > 60 && major.length >= 15, 'speakers found in the scripts (' + speakers.length + ', ' + major.length + ' with 20 or more lines)');
  const noPortrait = speakers.filter((w) => !PO.subject(w));
  t.eq(noPortrait, [], 'every speaker has a portrait');

  // 1. the loop of every major speaker
  const badLoop = [];
  const loops = {};
  for (const w of major) {
    const tl = PA.timeline(w, 'neutral', { ms: 30000, seed: 7 });
    const f = tl.frames;
    let worst = 0;
    for (let i = 0; i < f.length; i++) { let n = 0; for (let j = i; j < f.length && f[j].t < f[i].t + 1000; j++) n++; worst = Math.max(worst, n); }
    const rest = f[0].k, returns = f.filter((x) => x.k === rest).length;
    loops[w] = { changes: f.length - 1, worst, distinct: new Set(f.map((x) => x.k)).size };
    if (f.length - 1 < 12 || worst > 8 || returns < 3) badLoop.push(w + ' (' + (f.length - 1) + ' changes in 30 s, ' + worst + ' in one second, back to rest ' + returns + '×)');
  }
  t.eq(badLoop, [], 'every major speaker\'s portrait lives: a loop of small motions that comes back to rest, never busy');

  // 2. cues on the tags each speaker's lines use, then the settle
  const missing = [], long = [], unsettled = [];
  let cueTags = 0, cueLines = 0;
  for (const w of speakers) for (const [tag, n] of Object.entries(tags[w] || {})) {
    if (tag === 'neutral') continue;
    const tl = PA.timeline(w, tag, { ms: 6000, seed: 7 });
    if (!tl.cueEnd) { missing.push(w + '[' + tag + ']'); continue; }
    cueTags++; cueLines += n;
    if (tl.cueEnd > 900) long.push(w + '[' + tag + '] ' + tl.cueEnd + ' ms');
    const after = tl.frames.filter((x) => x.t > tl.cueEnd && x.t < tl.cueEnd + 400);
    // the loop afterwards uses only frames this face shows when its tag's line runs without a cue
    const calm = new Set(PA.timeline(w, tag, { ms: 30000, seed: 7, cue: false }).frames.map((x) => x.k));
    const later = tl.frames.filter((x) => x.t >= tl.cueEnd + 400 && !calm.has(x.k));
    if (after.length || later.length) unsettled.push(w + '[' + tag + ']');
  }
  t.eq(missing, [], 'every expression tag a speaker uses has a lead-in cue for that speaker');
  t.eq(long, [], 'every cue is short (900 ms at most; it never delays the line)');
  t.eq(unsettled, [], 'after its cue the face settles: 400 ms without a change, then only its calm loop');

  t.log('spoken lines ' + spoken + ', tagged ' + tagged + ' (' + Math.round((100 * tagged) / spoken) + ' %); speaker × tag pairs with a cue: ' + cueTags + ' (' + Math.round(cueLines) + ' tagged lines)');
  t.log('major speakers (lines, loop changes in 30 s, most in one second, distinct frames): ' + major.map((w) => w + ' ' + Math.round(lines[w]) + '/' + loops[w].changes + '/' + loops[w].worst + '/' + loops[w].distinct).join(', '));
};
