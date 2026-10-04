// Animated dialogue portraits (src/ui/21_portrait_anim.js) on the layered portrait renderer
// (src/engine/35_portraits.js), in node with a stand-in canvas: frame keys, the rest frame is the still,
// a blink touches only the eyes, every tag's cue plays once then holds still while it settles, a repeated
// tag does not replay it, scene-once cues, Reduce motion, blink cadence and frame density for every
// speaking portrait, the byte-capped cache, the integer display scale, and the eye-area fixes
// (docs/expressive/PORTRAITS.md §3, §4).
import { load } from '../lib/load.mjs';

// a canvas stand-in: what is put is what is read back
class Ctx2 {
  constructor(cv) { this.cv = cv; }
  putImageData(img) { this.cv.data = new Uint8ClampedArray(img.data); }
  getImageData(x, y, w, h) { return { data: this.cv.data || new Uint8ClampedArray(w * h * 4) }; }
  drawImage(src) { if (src && src.data) this.cv.data = new Uint8ClampedArray(src.data); }
  save() {} restore() {} translate() {} scale() {} fillRect() {}
}
class OffscreenCanvas { constructor(w, h) { this.width = w; this.height = h; } getContext() { return this.ctx || (this.ctx = new Ctx2(this)); } }
class ImageData { constructor(d, w, h) { this.data = d; this.width = w; this.height = h; } }

export default async (t) => {
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true, OffscreenCanvas, ImageData });
  const PT = RB.portraits, A = RB.portraitAnim;
  t.ok(PT && A, 'RB.portraits and RB.portraitAnim are loaded');
  const ids = Object.keys(RB.content.chars).filter((id) => id !== 'narr' && PT.subject(id));
  const human = ids.filter((id) => !PT.subject(id).p.kind && !PT.subject(id).p.extra2);
  t.ok(ids.length >= 88, 'speaking portraits: ' + ids.length);
  const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2] || a[i + 3] !== b[i + 3]) n++; return n; };
  const box = (a, b) => { let x0 = 99, y0 = 99, x1 = -1, y1 = -1; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) { const x = (i / 4) % 96, y = Math.floor(i / 384); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return x1 < 0 ? null : [x0, y0, x1, y1]; };
  const lum = (d, i) => (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;

  // ---- frame keys -----------------------------------------------------------------------------------------
  t.eq(PT.frameKey(null), '', 'no frame: the still');
  t.eq(PT.frameKey({}), '', 'an empty frame is the still');
  t.eq(PT.frameKey({ head: [0, 0], body: [0, 0], sway: 0 }), '', 'zero offsets are the still');
  const keys = [{ lids: 'half' }, { lids: 'closed' }, { look: [1, 0] }, { look: [-1, 0] }, { head: [0, -1] }, { body: [0, -1] }, { sway: 1 }, { glint: 0 }, { glint: 1 }, { glassDy: 1 }, { wink: true }, { blush: 0.5 }, { expr: 'neutral' }].map(PT.frameKey);
  t.eq(new Set(keys).size, keys.length, 'distinct frames have distinct keys');
  t.eq(PT.frameKey({ look: [1, 0], lids: 'half' }), PT.frameKey({ lids: 'half', look: [1, 0] }), 'a key does not depend on property order');

  // ---- the rest frame is the still; a blink touches only the eyes ---------------------------------------------
  let restSame = 0, blinkBad = [], breathBad = [];
  for (const id of human) {
    const p = PT.subject(id).p;
    const still = PT.renderBuf(p, 'neutral', null).d;
    if (!diff(still, PT.renderBuf(p, 'neutral', { head: [0, 0] }, 'u|' + id).d)) restSame++;
    const blink = PT.renderBuf(p, 'neutral', { lids: 'closed' }, 'u|' + id).d;
    const bx = box(still, blink);
    if (!bx || bx[0] < 22 || bx[2] > 74 || bx[1] < 34 || bx[3] > 58) blinkBad.push(id + ' ' + JSON.stringify(bx));
    // a breath moves the figure by one pixel: the frame equals the still shifted up a row, almost everywhere
    const br = PT.renderBuf(p, 'neutral', { head: [0, -1], body: [0, -1] }, 'u|' + id).d;
    let off = 0;
    for (let y = 0; y < 95; y++) for (let x = 0; x < 96; x++) { const i = (y * 96 + x) * 4, j = ((y + 1) * 96 + x) * 4; if (br[i] !== still[j] || br[i + 1] !== still[j + 1] || br[i + 2] !== still[j + 2]) off++; }
    if (off > 60) breathBad.push(id + ' ' + off);
  }
  t.eq(restSame, human.length, 'the idle loop\'s rest frame is exactly the still portrait (' + human.length + ' faces)');
  t.eq(blinkBad, [], 'a blink changes only the eye area');
  t.eq(breathBad, [], 'a breath (shoulders and head up a pixel) is the still moved up one row (≤ 60 px elsewhere: the frame\'s edges)');

  // ---- the eye-area fixes (PORTRAITS.md §3) ---------------------------------------------------------------------
  const D = PT.debug;
  const lashRows = (T) => T.filter((r) => /k/.test(r) && !/w/.test(r)).length;
  t.eq(lashRows(D.EYE_T.narrow), 1, 'narrow eyes: one lash row over the opening');
  t.eq(D.EYE_T.narrow.filter((r) => /w/.test(r)).length, 3, 'narrow eyes keep their three-row opening');
  let covered = [], browLow = [], whites = [];
  for (const id of human) {
    const p = PT.subject(id).p;
    const d = PT.renderBuf(p, 'neutral', null).d;
    // the fringe never covers the eye: the upper lash line of both eyes (inner columns) is dark
    const T = D.EYE_T[D.EYE_T[p.eyes] ? p.eyes : 'round'];
    const firstK = T.findIndex((r) => /k/.test(r));
    let dark = 0, n = 0;
    for (const [cx, side] of [[D.EYE_CX[0], -1], [D.EYE_CX[1], 1]]) {
      for (let i = 4; i <= 8; i++) { const x = side > 0 ? cx - 6 + i : cx + 5 - i, y = D.EYE_CY - 4 + firstK + 1; const k = (y * 96 + x) * 4; if (T[firstK + 1][i] !== 'k') continue; n++; if (lum(d, k) < 0.2) dark++; }
    }
    if (dark < n - (p.acc.includes('glasses') ? 1 : 0)) covered.push(id + ' ' + dark + '/' + n); // a lens highlight may sit on the lash line
    // white either side of the iris in the neutral eye (gaze reads from it)
    const row = D.EYE_CY - 4 + T.findIndex((r) => /^\.w{11}\.$/.test(r));
    let w = 0;
    for (let x = 30; x <= 66; x++) { const k = (row * 96 + x) * 4; if (lum(d, k) > 0.85) w++; }
    whites.push(w);
    if (w < 6) browLow.push(id + ' whites ' + w);
    // a brow reads against what is under it
    if (!p.acc.includes('hat') && !p.acc.includes('cap')) {
      const px = D.browPixels(p, 'flat');
      const low = {};
      for (const [x, y] of px) low[x] = Math.max(low[x] == null ? -1 : low[x], y);
      let c = 0, m = 0;
      for (const x in low) { const k = (low[x] * 96 + +x) * 4, k2 = ((low[x] + 1) * 96 + +x) * 4; c += Math.abs(lum(d, k) - lum(d, k2)); m++; }
      if (c / m < 0.18) browLow.push(id + ' brow contrast ' + (c / m).toFixed(2));
    }
  }
  t.eq(covered, [], 'no fringe covers an upper lash line (' + human.length + ' faces)');
  t.eq(browLow, [], 'every face shows white beside the iris and a brow that contrasts with what is under it (hats aside)');
  t.log('white pixels on the neutral eyes\' middle row: min ' + Math.min(...whites) + ', median ' + whites.sort((a, b) => a - b)[whites.length >> 1]);

  // ---- cues: once, in order, then still while settling ------------------------------------------------------------
  const TAGS = ['surprise', 'laugh', 'smile', 'smirk', 'think', 'worry', 'sad', 'closed', 'angry', 'shy', 'tired'];
  for (const tag of TAGS) {
    let bad = [];
    for (const who of ['nao', 'mio', 'ren', 'suzu', 'omi', 'kanta', 'pc']) {
      const tl = A.timeline(who, tag, { ms: 5000 });
      const beats = tl.frames.filter((f) => f.t < tl.cueEnd);
      const settleChanges = tl.frames.filter((f) => f.t > tl.cueEnd && f.t < tl.cueEnd + 400);
      if (beats.length < 2 || tl.cueEnd < 200 || tl.cueEnd > 900 || settleChanges.length) bad.push(who + ' beats ' + beats.length + ' end ' + tl.cueEnd + ' settle ' + settleChanges.length);
    }
    t.eq(bad, [], tag + ': a cue of 2+ beats in 200–900 ms, then 400 ms still (Nao, Mio, Ren, Suzu, Ōmi, Kanta, the player)');
  }
  t.eq(A.timeline('nao', null, { ms: 2000 }).cueEnd, 0, 'no tag, no cue');
  t.eq(A.timeline('nao', 'neutral', { ms: 2000 }).cueEnd, 0, 'neutral has no cue');
  t.ok(A.timeline('suzu', 'laugh', { ms: 1000 }).frames[0].fr.wink, 'Suzu\'s laugh opens with a wink');
  t.ok(A.timeline('ren', 'think', { ms: 1000 }).frames.some((f) => f.fr.glassDy === -1), 'Ren adjusts their glasses on a think line');
  t.ok(!A.timeline('ren', 'think', { ms: 1000, used: ['ren:adjust'] }).frames.some((f) => f.fr.glassDy === -1), 'but only once a scene (a glint instead)');
  t.ok(A.timeline('nao', 'smirk', { ms: 1000 }).frames.some((f) => f.fr.head && f.fr.head[0] === -1), 'Nao turns their head a little away on a smirk');
  t.ok(A.timeline('wataru', 'sad', { ms: 1000 }).frames.some((f) => f.fr.look && f.fr.look[0] === -1), 'Wataru\'s sadness looks aside');

  // ---- the shared profile: the actor system's mannerism profile is the one the portrait reads (WI13) ---------
  // Everyone with an authored profile (the player, the companions, the recurring cast) and portrait art: the
  // portrait's class overlay is their actor class (or the block's own `class`), every rate the block gives is
  // the one played, each cue variant it names (and each tell with a portrait counterpart) reaches the cue;
  // the portrait player's own table is the fallback, and a person with no profile at all gets the default loop.
  const M = RB.mannerisms, MP = M.profiles();
  const authored = Object.keys(MP).filter((id) => PT.subject(id));
  const expectOf = (k, w, pr) => {
    if (k === 'glint') return pr.glasses ? w || { every: [10000, 16000] } : null; // only glasses catch the light
    if (k === 'sway') return pr.swings ? w || { every: [7000, 12000] } : null; // only hair or things that hang sway
    if (k === 'habit' && w && /^glasses/.test(w.kind) && !pr.glasses) return null;
    return w;
  };
  const notShared = [], wrongCls = [], wrongVal = [], wrongCue = [];
  let blocks = 0, checked = 0;
  for (const id of authored) {
    const sj = PT.subject(id), pr = A.profileOf(sj.who, sj.p), prof = M.of(id), pb = prof.portrait || {};
    if (prof.portrait) blocks++;
    if (pr.from !== 'shared') notShared.push(id + ' ' + pr.from);
    const cls = pb.class || prof.class;
    if (pr.cls !== cls) wrongCls.push(id + ' ' + pr.cls + ' (want ' + cls + ')');
    for (const k of A.SHARED_KEYS) if (k in pb) { checked++; if (JSON.stringify(pr[k]) !== JSON.stringify(expectOf(k, pb[k], pr))) wrongVal.push(id + '.' + k + ' ' + JSON.stringify(pr[k])); }
    const c = pb.cues || {}, tells = prof.tells || {};
    if (c.smirk && c.smirk.turn && JSON.stringify(pr.hold && pr.hold.smirk && pr.hold.smirk.head) !== JSON.stringify(c.smirk.turn)) wrongCue.push(id + ' smirk.turn');
    if (((c.smirk && c.smirk.wink) || (c.laugh && c.laugh.wink)) && !pr.wink) wrongCue.push(id + ' wink');
    if (c.laugh && c.laugh.hidden && pr.laugh !== 'hidden') wrongCue.push(id + ' laugh.hidden');
    if (c.worry && c.worry.nod && !pr.nod) wrongCue.push(id + ' worry.nod');
    if (c.think && c.think.lids && !pr.thinkLids) wrongCue.push(id + ' think.lids');
    if (((c.think && c.think.adjust) || tells.think === 'glasses') && pr.glasses && !pr.adjust) wrongCue.push(id + ' think.adjust');
    if (c.closed && c.closed.slow && pr.slowClose !== c.closed.slow) wrongCue.push(id + ' closed.slow');
    const sadWant = c.sad && c.sad.look ? c.sad.look : tells.sad === 'aside' || tells.sad === 'avert' ? [-1, 1] : null;
    if (sadWant && JSON.stringify(pr.sadLook) !== JSON.stringify(sadWant)) wrongCue.push(id + ' sad.look ' + JSON.stringify(pr.sadLook));
    if (pb.serious && pb.serious.some((e) => !(pr.serious && pr.serious[e]))) wrongCue.push(id + ' serious');
  }
  t.ok(authored.length >= 75 && blocks >= 25, `profiles with portrait art: ${authored.length}; with a portrait block: ${blocks}`);
  t.eq(notShared, [], 'every speaking person with an actor profile takes their portrait from it (from: shared)');
  t.eq(wrongCls, [], 'the portrait\'s class overlay is the actor class (or the block\'s own class)');
  t.ok(checked >= 40, `the portrait blocks' rates (${checked}) are the ones in the played profile`);
  t.eq(wrongVal, [], 'every rate a portrait block gives is the one played (glints only with glasses, sway only with hair that hangs)');
  t.eq(wrongCue, [], 'every cue variant a block names, and each tell with a portrait counterpart, reaches the profile');
  // the same profile, as played: by id
  const look = (id, tag, ms) => A.timeline(id, tag, { ms: ms || 1200 }).frames;
  t.eq(A.timeline('pc', null, { ms: 100 }).profile.cls, 'base', 'the player keeps the plain loop (their actor class is traveller; the block says base)');
  t.eq(A.timeline('ren', null, { ms: 100 }).profile.cls, 'keeper', 'Ren\'s portrait has the keeper\'s overlay, as on the road');
  t.ok(look('nao', 'sad').some((f) => f.fr.look && f.fr.look[0] === -1 && f.fr.look[1] === 1), 'Nao\'s sadness looks away (tells.sad \'aside\')');
  t.ok(look('akari', 'sad').some((f) => f.fr.look && f.fr.look[0] === -1), 'Akari\'s sadness averts (tells.sad \'avert\')');
  t.ok(look('hana', 'sad').some((f) => f.fr.look && f.fr.look[0] === 1 && f.fr.look[1] === 1), 'Hana\'s sadness looks to the cups (her block over her tell)');
  t.ok(look('co_tokiwa', 'think').some((f) => f.fr.glassDy === -1), 'Tokiwa adjusts the glasses on a think line (tells.think \'glasses\')');
  const glances = (id) => [...new Set(A.timeline(id, null, { ms: 90000, seed: 3 }).frames.filter((f) => f.fr.look).map((f) => JSON.stringify(f.fr.look)))].sort();
  t.eq(glances('tamae'), ['[1,0]'], 'Tamae\'s glances go one way, toward the kitchen (her block)');
  t.eq(glances('lf_tokuji'), ['[1,0]'], 'Tokuji stares one way, at the lake (his block)');
  // the fallback and the default
  const seto = A.profileOf('cs_seto', PT.subject('cs_seto').p);
  t.ok(!MP.cs_seto && seto.from === 'portrait' && seto.cls === 'elder', 'a person without an actor profile keeps the portrait player\'s own row (Seto: elder)');
  const nobody = A.profileOf('zz_nobody', { acc: [], style: 'short' });
  t.ok(nobody.from === 'default' && nobody.cls === 'base' && JSON.stringify(nobody.blink) === JSON.stringify(A.CLASS.base.blink) && JSON.stringify(nobody.glance) === JSON.stringify(A.CLASS.base.glance) && !nobody.habit && !nobody.tilt, 'a person with no profile anywhere gets the default loop');
  const saved = RB.mannerisms;
  RB.mannerisms = undefined;
  const bare = A.profileOf('nao', PT.subject('nao').p);
  RB.mannerisms = saved;
  t.ok(bare.from === 'portrait' && JSON.stringify(bare.blink) === JSON.stringify([4400, 7400]) && !bare.sadLook, 'without the actor system the bespoke row is the whole profile (the fallback)');

  // ---- the player: cues once per tag, Reduce motion still -------------------------------------------------------------
  RB.game.G.settings = { reducedMotion: false, textSpeed: 'normal' };
  const cv = new OffscreenCanvas(96, 96);
  cv.isConnected = true;
  A.resetStats();
  A.play(cv, { who: 'suzu', expr: 'laugh', scene: 'u.1' });
  A.play(cv, { who: 'suzu', expr: 'laugh', scene: 'u.1' });
  t.eq(A.stats().cues, 1, 'the same speaker and tag on consecutive lines: one cue');
  A.play(cv, { who: 'suzu', expr: 'sad', scene: 'u.1' });
  t.eq(A.stats().cues, 2, 'another tag: its cue');
  A.play(cv, { who: 'mio', expr: 'sad', scene: 'u.1' });
  t.eq(A.stats().cues, 3, 'another speaker with the same tag: a cue');
  A.stop();
  A.play(cv, { who: 'mio', expr: 'sad', scene: 'u.1' });
  t.eq(A.stats().cues, 4, 'after the portrait was gone (narration, the dialogue closed): a fresh appearance cues again');
  t.ok(A.state().animating && A.state().scheduled, 'animating with a timer');
  RB.game.G.settings.reducedMotion = true;
  A.resetStats();
  A.play(cv, { who: 'nao', expr: 'surprise', scene: 'u.1' });
  const st = A.state();
  t.ok(!st.animating && !st.scheduled && A.stats().cues === 0 && A.stats().paints === 1, 'Reduce motion: one paint of the held expression, no cue, no timer');
  t.eq(diff(cv.data, PT.renderBuf(PT.subject('nao').p, 'surprise', null).d), 0, 'and it is the still portrait');
  RB.game.G.settings.reducedMotion = false;
  A.stop();
  t.eq(A.state(), null, 'stopped: nothing held');

  // ---- every speaking portrait: cadence and density over 60 s -------------------------------------------------------------
  let cad = [], dense = [], motion = [];
  for (const id of ['pc', ...ids]) {
    const fr = A.timeline(id, null, { ms: 60000 }).frames;
    const starts = [];
    fr.forEach((f, i) => { if (f.fr.lids === 'half' && (!i || !fr[i - 1].fr.lids) && fr[i + 1] && fr[i + 1].fr.lids === 'closed') starts.push(f.t); }); // a squint is not a blink
    const gaps = starts.slice(1).map((s, i) => s - starts[i]);
    if (starts.length < 6 || Math.min(...gaps) < 2000) cad.push(id + ' ' + starts.length + ' blinks, min gap ' + Math.min(...gaps));
    let mx = 0;
    for (let i = 0; i < fr.length; i++) { let n = 0; for (let j = i; j < fr.length && fr[j].t < fr[i].t + 1000; j++) n++; mx = Math.max(mx, n); }
    if (mx > 8) dense.push(id + ' ' + mx);
    const kinds = new Set(); for (const f of fr) for (const k in f.fr) kinds.add(k);
    if (!kinds.has('lids') || !kinds.has('body') || kinds.size < 3) motion.push(id + ' ' + [...kinds]);
  }
  t.eq(cad, [], 'every portrait blinks on an irregular cadence: ≥ 6 blinks a minute, never two within 2 s (a double blink is one)');
  t.eq(dense, [], 'never more than 8 frame changes in a second');
  t.eq(motion, [], 'every portrait has at least three kinds of motion (blink, breath and a habit, glance or sway)');

  // ---- the cache stays under its cap; layers are stored cropped ------------------------------------------------------------
  PT.clearCache();
  PT.setCacheCap(768 * 1024);
  let over = 0;
  for (const id of ids.slice(0, 30)) for (const e of ['neutral', 'smile', 'worry', 'surprise']) {
    PT.frame(PT.subject(id), e, null); PT.frame(PT.subject(id), e, { lids: 'closed' }); PT.frame(PT.subject(id), e, { head: [0, -1], body: [0, -1] });
    if (PT.cacheStats().bytes > 768 * 1024) over++;
  }
  const cs = PT.cacheStats();
  t.eq(over, 0, `the cache never exceeds its cap (${(cs.bytes / 1024).toFixed(0)} KiB of 768, ${cs.entries} entries, ${cs.evicted} evicted)`);
  PT.clearCache();
  PT.setCacheCap(64 * 1024 * 1024);
  PT.frame(PT.subject('suzu'), 'neutral', null);
  const one = PT.cacheStats();
  t.ok(one.bytes < 0.75 * one.entries * 96 * 96 * 4, `layers are kept cropped: one portrait = ${one.entries} entries in ${(one.bytes / 1024).toFixed(0)} KiB (full canvases would be ${(one.entries * 36).toFixed(0)} KiB)`);
  PT.setCacheCap(8 * 1024 * 1024);

  // ---- integer display scale ------------------------------------------------------------------------------------------------
  t.eq([[116, 1], [116, 2], [116, 1.5], [116, 3], [116, 1.25], [84, 1], [84, 2], [84, 3], [64, 1], [64, 2], [64, 3]].map(([s, r]) => A.fitSize(s, r)),
    [116, 116, 128, 128, 116, 96, 96, 96, 64, 64, 64], 'the portrait\'s CSS size: a whole number of device pixels per art pixel within 15% of the layout size, else the layout size (desktop keeps 116 at ratio 1 and 2: the owner chose it over 96)');
  t.eq([1, 1.5, 2, 2.625, 3, 3.5].map((r) => A.fitSize(64, r, false)), [64, 64, 64, 64, 64, 54.86], 'the phone layout never grows the portrait (it has a row of its own above the sheet); it may shrink to a whole multiple (3.5: 2×)');
};
