// RBN-QA-177 (Agnes 6381555286, 6381579700; Local CL-281): Ashihara's first festival narrated Kotoe's pupils singing
// with their papers over the lantern shot, which has no pupils, and "everyone sits round the fire" over a ring still
// dancing. In Chromium on the built game:
//  1. the night shot's 'pupils' phase: with Kotoe's school, Kotoe and four children on the road where it comes toward
//     us (never on the paddies), each sheet held up showing brush strokes, never letters; without the school, nobody;
//     before the phase, nobody; for each lantern place (street, channel, hill), at 1188×848 and 390×844, every sheet
//     above the dialogue sheet; Kotoe drawn once (with her pupils, or else walking along the road);
//  2. the fire shot: dancing, the ring turns and its figures walk; from the 'settle' phase (and through the gift) it
//     stands where it stopped, everyone still and facing the fire, Shō's beat at rest; the gift's hat as before; where
//     it stopped belongs to its playing: a drawing on its own rests where its own moment puts it; in a playing,
//     Previous back to the dance and Next again find it where it stopped; the shot's Replay stops it anew, live or
//     while looking back; a new
//     playing that opens settled never takes the last playing's place;
//  3. the scene, played with Next, with reduced motion, and with and without the school, with and without a
//     companion: the pupils' phase begins right before the pupils' line (only with the school), the settle right before
//     "Last of all, everyone gathers round the fire." (its Japanese as before), the gift before Mitsue's line; the hat
//     given, the festival done, the night over;
//  4. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/festival_phases.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const errorsAll = [];

// ---- 1. and 2.: the shots drawn directly (RB.sequence.drawAt) ------------------------------------------------------------
for (const [W, H] of [[1188, 848], [390, 844]]) {
  const { p, ctx, errors } = await page(b, url, { viewport: { width: W, height: H } });
  const R = await p.evaluate(([W, H]) => {
    const vb = Math.round(H * 0.64);
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
    const sheets = (o) => {
      c.clearRect(0, 0, W, H);
      RB.sequence.drawAt(c, W, H, Object.assign({ seq: 'as.festival', vb }, o));
      const d = c.getImageData(0, 0, W, H).data;
      let n = 0, below = 0, strokes = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        if (d[i] === 0xe8 && d[i + 1] === 0xd8 && d[i + 2] === 0xb0) { n++; if (y >= vb) below++; }
      }
      // the strokes: the ink colour inside a sheet's bounding rows
      for (let y = 0; y < H; y++) for (let x = 1; x < W - 1; x++) { const i = (y * W + x) * 4; if (d[i] === 0x2a && d[i + 1] === 0x20 && d[i + 2] === 0x24 && d[i - 4] === 0xe8) strokes++; }
      return { n, below, strokes };
    };
    const out = {};
    for (const way of ['street', 'canal', 'hill']) {
      const test = (school) => (cond) => (cond === 'var.as_lan=' + way) || (school && cond === 'as_kotoe');
      out[way] = {
        school: sheets({ shot: 'night', phase: 'pupils', still: true, test: test(true) }),
        none: sheets({ shot: 'night', phase: 'pupils', still: true, test: test(false) }),
        before: sheets({ shot: 'night', phase: 'light', still: true, test: test(true) }),
        moving: sheets({ shot: 'night', phase: 'pupils', k: 1, t: 1234, test: test(true) }),
      };
    }
    // 2. the ring: record each figure drawn (its look's name, facing, frame and where it is put)
    const Q = RB.seqKit, fig0 = Q.figure, names = new Map(Object.entries(RB.content.chars).map(([id, ch]) => [ch.look, id]));
    const ring = (phase, t, keep) => {
      const drawn = [], made = new Map();
      Q.figure = function (look, dir, key) { const f = fig0.apply(this, arguments); if (f) made.set(f.cv, (names.get(look) || '?') + ' ' + dir + ' ' + key); return f; };
      const di = c.drawImage;
      c.drawImage = function (img, x, y) { if (made.has(img)) drawn.push(made.get(img) + ' @' + x + ',' + y); return di.apply(this, arguments); };
      try { RB.sequence.drawAt(c, W, H, { seq: 'as.festival', shot: 'fire', phase, k: 1, t, vb, test: () => false, keep }); } finally { Q.figure = fig0; c.drawImage = di; }
      return drawn.filter((s) => !/^as_sho /.test(s));
    };
    // Kotoe drawn once: with her pupils (from the phase), else on her way along the road
    const kotoe = (school, phase) => {
      const seen = [];
      Q.figure = function (look) { const f = fig0.apply(this, arguments); if (names.get(look) === 'as_kotoe') seen.push(1); return f; };
      try { RB.sequence.drawAt(c, W, H, { seq: 'as.festival', shot: 'night', phase, still: true, vb, test: (cond) => (school && cond === 'as_kotoe') || cond === 'var.as_lan=street' }); } finally { Q.figure = fig0; }
      return seen.length;
    };
    const once = [kotoe(true, 'pupils'), kotoe(false, 'pupils'), kotoe(true, 'light')];
    const dance = [ring('dance', 1000), ring('dance', 4000)];
    // one playing (one keep): settled at 1000 ms, then later frames and the gift; then drawings on their own (a fresh
    // keep each), settled at 4000 ms: their own resting place, the same each time, not the playing's
    const one = {};
    const settle = [ring('settle', 1000, one), ring('settle', 4000, one), ring('gift', 6000, one)];
    const alone = [ring('settle', 4000), ring('settle', 4000)];
    const sho = (phase, t) => { c.clearRect(0, 0, W, H); RB.sequence.drawAt(c, W, H, { seq: 'as.festival', shot: 'fire', phase, k: 1, t, vb, test: () => false }); return c.getImageData(0, 0, Math.round(W * 0.4), H).data.length; };
    void sho;
    return { vb, out, dance, settle, alone, once };
  }, [W, H]);
  const ways = Object.entries(R.out);
  ok(ways.every(([, o]) => o.school.n > 40 && o.school.below === 0 && o.school.strokes > 0 && o.none.n === 0 && o.before.n === 0 && o.moving.n > 40),
    W + '×' + H + ': the pupils\' phase, for each lantern place: with the school, the sheets held up above the dialogue sheet, with strokes on them; without it, or before the phase, none (' + J(Object.fromEntries(ways.map(([k, o]) => [k, [o.school.n, o.school.below, o.school.strokes, o.none.n, o.before.n]]))) + ')');
  ok(J(R.once) === '[1,1,1]', W + '×' + H + ': Kotoe drawn once: with her pupils in their phase, else on her way along the road (' + J(R.once) + ')');
  const walking = (l) => l.some((s) => / w\d @/.test(s));
  ok(walking(R.dance[0]) && J(R.dance[0]) !== J(R.dance[1]),
    W + '×' + H + ': dancing, the ring walks and turns (' + J({ a: R.dance[0].slice(0, 2), b: R.dance[1].slice(0, 2) }) + ')');
  ok(R.settle.every((l) => l.length === 6 && l.every((s) => / i0 @/.test(s))) && J(R.settle[0]) === J(R.settle[1]) && J(R.settle[1]) === J(R.settle[2]),
    W + '×' + H + ': from the settle and through the gift, the six stand still where they stopped, each facing the fire (' + J(R.settle[0]) + ')');
  ok(R.alone.every((l) => l.length === 6 && l.every((s) => / i0 @/.test(s))) && J(R.alone[0]) === J(R.alone[1]) && J(R.alone[0]) !== J(R.settle[0]),
    W + '×' + H + ': a settled drawing on its own rests where its own moment puts it, the same each time, not where another playing stopped (' + J({ alone: R.alone[0].slice(0, 2), playing: R.settle[0].slice(0, 2) }) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 2b. the ring's rest belongs to its playing (Agnes 6382514084): Previous and back finds it where it stopped; a new
// playing (a replay of the memory, another scene) that opens on the settled ring rests where its own moment puts it,
// never where an earlier playing stopped; the shot's own Replay dances again and stops where it then is --------------
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  await p.evaluate(() => {
    RB.game.debugStart('as.village', 10, 10, { edition: RB.edition.forNew(), comp: null, flags: { departed: true }, dir: 'up' });
    RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {};
    const Q = RB.seqKit, fig0 = Q.figure, names = new Map(Object.entries(RB.content.chars).map(([id, ch]) => [ch.look, id]));
    const DANCERS = ['as_mitsue', 'as_yoshizo', 'as_taki', 'as_natsu', 'as_kotoe', 'as_mohei'];
    const made = new WeakMap(), drawn = [];
    Q.figure = function (look, dir, key) { const f = fig0.apply(this, arguments); const id = names.get(look); if (f && DANCERS.includes(id)) made.set(f.cv, id + ' ' + dir + ' ' + key); return f; };
    // (a playing draws into its own buffer, an offscreen canvas where there is one)
    for (const K of [window.CanvasRenderingContext2D, window.OffscreenCanvasRenderingContext2D].filter(Boolean)) {
      const di = K.prototype.drawImage;
      K.prototype.drawImage = function (img, x, y) { if (made.has(img)) { const e = made.get(img) + ' @' + x + ',' + y; drawn.push(e); if (window.__rec) window.__rec.push(e); if (drawn.length > 600) drawn.splice(0, 300); } return di.apply(this, arguments); };
    }
    // the ring as last drawn: the six dancers of the latest frame
    window.__ring = async () => { await new Promise((r) => setTimeout(r, 260)); return drawn.slice(-6).sort(); };
    const line = (en) => ({ who: 'narr', jp: 'あ 。', en });
    window.__beats = (from) => [['dance', 'They dance.'], ['settle', 'They gather round.'], ['gift', 'The hat.']].slice(from).map(([phase, en]) => ({ shot: 'fire', phase, line: line(en) }));
    window.__view = (from) => { window.__done = RB.sequence.view({ seq: 'as.festival', beats: window.__beats(from || 0), label: 'Test', name: 'seq-test', seen: () => true }); };
  });
  const click = (a) => p.evaluate((a) => { const el = document.querySelector('.seq-view [data-a="' + a + '"]'); if (el) el.click(); return !!el; }, a);
  const wait = (ms) => p.waitForTimeout(ms);
  await p.evaluate(() => window.__view(0));
  await wait(1600); await click('next'); await wait(1300); await click('next'); await wait(1300);
  const atGift = await p.evaluate(() => window.__ring());
  await click('prev'); await wait(300); await click('prev'); await wait(400);
  const lookedBack = await p.evaluate(() => window.__ring());
  await wait(1500);
  await click('next'); await wait(300); await click('next'); await wait(600);
  const again = await p.evaluate(() => window.__ring());
  const still = (l) => l.length === 6 && l.every((x) => / i0 @/.test(x));
  ok(still(atGift) && lookedBack.some((x) => / w\d @/.test(x)) && J(again) === J(atGift),
    'one playing: at the gift the ring stands where it stopped; Previous back to the dance shows it dancing; Next back to the gift finds it where it stopped, though time has passed (' + J({ gift: atGift.slice(0, 2), back: lookedBack.slice(0, 1), again: again.slice(0, 2) }) + ')');
  // the shot's own Replay: the dance again, then it stops where it then is, everyone facing the fire
  await p.evaluate(() => { const el = document.querySelector('.seq-view [data-a="replay"]'); if (el) el.click(); });
  await wait(3600);
  const replayed = await p.evaluate(() => window.__ring());
  ok(still(replayed), 'the shot\'s Replay: the dance again, then the six stand still, facing the fire (' + J(replayed.slice(0, 2)) + ')');
  // the shot's Replay while looking back (Previous to the settle, then Replay; Local CL-293, Agnes 6383443005): it dances
  // again and comes to rest without a jump, exactly where the ring stood; Next to the live gift finds it there too
  await click('prev'); await wait(400);
  const backBefore = await p.evaluate(() => window.__ring());
  await p.evaluate(() => { window.__rec = []; const el = document.querySelector('.seq-view [data-a="replay"]'); if (el) el.click(); });
  await wait(3200);
  const backRest = await p.evaluate(() => window.__ring());
  const rec = await p.evaluate(() => { const r = window.__rec; window.__rec = null; return r; });
  // each dancer, from its last dancing frame to its first at rest: how far it moved, against its largest step between
  // the dancing frames just before (the ring turning, and the dance's little bob)
  const SIX = ['as_mitsue', 'as_yoshizo', 'as_taki', 'as_natsu', 'as_kotoe', 'as_mohei'];
  const parse = (e) => { const m = /^(\S+) (\S+) (\S+) @(-?\d+),(-?\d+)$/.exec(e); return m && { id: m[1], key: m[3], x: +m[4], y: +m[5] }; };
  const steps = SIX.map((id) => {
    const seq = rec.map(parse).filter((q) => q && q.id === id);
    const i = seq.findIndex((q, k) => k > 0 && q.key === 'i0' && /^w\d$/.test(seq[k - 1].key));
    if (i < 2) return { id, none: seq.length };
    let pace = 0;
    for (let k = Math.max(1, i - 6); k < i; k++) pace = Math.max(pace, Math.hypot(seq[k].x - seq[k - 1].x, seq[k].y - seq[k - 1].y));
    return { id, jump: Math.round(Math.hypot(seq[i].x - seq[i - 1].x, seq[i].y - seq[i - 1].y)), pace: Math.round(pace) };
  });
  ok(steps.every((q) => q.jump != null && q.jump <= Math.max(16, q.pace * 2)) && still(backRest) && J(backRest) === J(backBefore),
    'the shot\'s Replay while looking back: the dance again, coming to rest without a jump, exactly where the ring stood (' + J({ steps, rest: backRest.slice(0, 2), before: backBefore.slice(0, 2) }) + ')');
  await click('next'); await wait(600);
  const liveAgain = await p.evaluate(() => window.__ring());
  ok(J(liveAgain) === J(replayed), 'and Next to the live gift after it: the ring where it stood there (' + J({ now: liveAgain.slice(0, 2), before: replayed.slice(0, 2) }) + ')');
  // a new playing that opens on the settled ring (a memory's replay, another scene), seconds later
  await p.evaluate(() => { const el = document.querySelector('.seq-view [data-a="skip"]'); if (el) el.click(); });
  await p.evaluate(() => RB.sequence.closeView && RB.sequence.closeView('test'));
  await wait(2500);
  await p.evaluate(() => window.__view(1));
  await wait(2000);
  const fresh = await p.evaluate(() => window.__ring());
  ok(still(fresh) && J(fresh) !== J(replayed) && J(fresh) !== J(atGift),
    'a new playing opening on the settled ring rests where its own moment puts it, not where the last playing stopped (' + J({ fresh: fresh.slice(0, 2), last: replayed.slice(0, 2) }) + ')');
  ok(!errors.length, 'the playings: no page errors (' + J(errors).slice(0, 300) + ')');
  errorsAll.push(...errors);
  await ctx.close();
}

// ---- 3. the scene ---------------------------------------------------------------------------------------------------------
const AS = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true, as_streets: true, as_nt_water: true, as_nt_market: true, as_dp_water: true, as_dp_noise: true, as_hall: true };
async function festival(p, o) {
  return p.evaluate(async ([o, AS]) => {
    const flags = Object.assign({}, AS, o.school ? { as_kotoe: true } : {});
    const s = RB.game.debugStart('as.village', 10, 10, { edition: RB.edition.forNew(), comp: o.comp || null, flags, dir: 'up' });
    s.quests.as_main = { stage: 3, done: false, t: 0 };
    s.vars.as_lan = o.way;
    RB.game.settings.textSpeed = 'instant'; RB.game.settings.reducedMotion = !!o.reduce; RB.game.applySettings();
    RB.save.autosave = async () => {};
    let quiet = 0;
    for (let i = 0; i < 200 && quiet < 10; i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); quiet = RB.ui.dialogue.isOpen() || RB.script.isRunning() ? 0 : quiet + 1; await new Promise((r) => setTimeout(r, 60)); }
    const log = [];
    const ts = RB.sequence.toShot, say = RB.ui.dialogue.say;
    RB.sequence.toShot = function (id, ph) { log.push('#' + id + (ph ? '/' + ph : '')); return ts.apply(this, arguments); };
    RB.ui.dialogue.say = function (l) { log.push(String((l && l.en) || '').slice(0, 60) + (l && l.jp && /焚/.test(l.jp) ? ' [jp ' + l.jp + ']' : '')); return say.apply(this, arguments); };
    let done = false;
    RB.script.run('as.festival').then(() => { done = true; });
    for (let i = 0; i < 1500 && !done; i++) {
      if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
      await new Promise((r) => setTimeout(r, 40));
    }
    RB.sequence.toShot = ts; RB.ui.dialogue.say = say;
    const st = RB.game.s;
    return { done, log, kasa: !!(st.inv.as_kasa), fest: !!st.flags.as_fest_done, night: !!st.flags.as_fest_night };
  }, [o, AS]);
}
{
  const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
  const runs = [];
  for (const o of [{ way: 'street', school: true, comp: 'suzu' }, { way: 'canal', school: false, comp: null }, { way: 'hill', school: true, comp: 'nao', reduce: true }]) runs.push([o, await festival(p, o)]);
  for (const [o, r] of runs) {
    const L = r.log, iP = L.indexOf('#night/pupils'), iPL = L.findIndex((l) => /^Kotoe's pupils sing/.test(l));
    const iS = L.indexOf('#fire/settle'), iC = L.findIndex((l) => /^Last of all, everyone gathers round the fire\./.test(l)), iG = L.indexOf('#fire/gift'), iH = L.findIndex((l) => /^This is for you, from all of us/.test(l));
    const jp = (L[iC] || '').includes('[jp {最後|さいご} に 、 {皆|みんな} で {焚|た}き{火|び} を {囲|かこ}んだ 。]');
    const pupilsOk = o.school ? iP >= 0 && iPL === iP + 1 : iP < 0 && iPL < 0;
    ok(r.done && pupilsOk && iS >= 0 && iC === iS + 1 && jp && iG > iC && iH === iG + 1 && !L.some((l) => /sits round the fire/.test(l)) && r.kasa && r.fest && !r.night,
      'the festival (' + J(o) + '): ' + (o.school ? 'the pupils\' phase right before their line; ' : 'no school, no pupils\' phase; ') + 'the settle right before "everyone gathers round the fire" (its Japanese as before), the gift before Mitsue\'s line; the hat given, the festival done, the night over (' + J({ shots: L.filter((l) => l[0] === '#'), iP, iPL, iS, iC, iG, iH, jp, kasa: r.kasa, fest: r.fest, night: r.night }) + ')');
  }
  errorsAll.push(...errors);
  await ctx.close();
}
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
