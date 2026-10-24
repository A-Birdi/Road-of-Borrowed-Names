// RBN-QA-175 (Agnes 6381315831; Local CL-278): Ashihara's notice board was drawn with its five generic papers whatever
// was posted, and "Nothing on it yet" was said with the washing's notice up (the market's put off). In Chromium on the
// built game, with throwaway journeys at Ashihara Shinden:
//  1. the board shows what as.board says is on it: Mitsue's call for the roads' names before they are named (one
//     paper, its line "Names for the roads wanted"); after, a blank board ("Nothing on it yet"); the washing's notice
//     (one paper; the line no longer says nothing is on it, and it goes on to the market); both notices (two, read
//     back); the channel's turns (three); a child's picture of the festival (a picture); in both renderers (the drawn
//     art: its light paper measured; the flat one: its papers counted);
//  2. a save and load with the washing's notice up: the same board, the same line;
//  3. every other notice board in the game as before: none lists notices, and each draws exactly as on CC-021's build
//     (both renderers, the 58 boards' pixels and fills folded into one digest, measured there: -378012995);
//  4. no page errors.
// Usage: node tools/build.mjs && node tests/e2e/ashihara_board.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok   ' + m); } else { fail++; console.log('FAIL ' + m); } };
const J = JSON.stringify;
const DONE = { departed: true, ch1_done: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_done: true, yn_done: true, ch6_done: true };

// a journey at the board, in a given state: the quest's stage (null: not begun) and the flags
async function begin(p, stage, flags, vars) {
  await p.evaluate(async ([stage, flags, vars, done]) => {
    const s = RB.game.debugStart('as.village', 9, 9, { edition: RB.edition.forNew(), comp: 'suzu', flags: Object.assign({}, done, flags), dir: 'up' });
    if (stage != null) s.quests.as_main = { stage, done: false, t: 0 };
    Object.assign(s.vars, vars || {});
    RB.game.settings.textSpeed = 'instant'; RB.save.autosave = async () => {};
    // a notice put off (the challenge left): the scene's own "later"
    RB.challenge.run = async () => null;
    // whatever plays on arriving (the village's own arrival) is over before the board is looked at
    let quiet = 0;
    for (let i = 0; i < 200 && quiet < 10; i++) {
      if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
      quiet = RB.ui.dialogue.isOpen() || RB.script.isRunning() ? 0 : quiet + 1;
      await new Promise((r) => setTimeout(r, 60));
    }
  }, [stage, flags, vars, DONE]);
}
// the board now: its papers in the flat renderer (counted), its drawn art's light paper (pixels), its variant
const board = (p) => p.evaluate(() => {
  const m = RB.world.W.map, pr = m.props.find((q) => q.p === 'noticeboard' && q.scene === 'as.board'), P = RB.props.P.noticeboard;
  if (!pr) return { missing: true };
  const o = Object.assign({ cx: pr.x, cy: pr.y }, pr.o || {});
  const fills = [];
  const ctx = { set fillStyle(v) { this._f = v; }, get fillStyle() { return this._f; }, fillRect(x, y, w, h) { fills.push([this._f, x, y, w, h]); } };
  P.draw(ctx, 0, 0, RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake, 0, o);
  const papers = fills.filter((f) => f[0] === '#f4efe0' || f[0] === '#efe6d0').length;
  const cv = document.createElement('canvas'); cv.width = 120; cv.height = 110;
  const g = cv.getContext('2d');
  P.draw2(g, 20, 40, RB.tiles.PAL[m.region] || RB.tiles.PAL.reedwake, 0, o);
  const d = g.getImageData(0, 0, cv.width, cv.height).data;
  let light = 0, dark = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 200) continue;
    if (d[i] > 200 && d[i + 1] > 190 && d[i + 2] > 160) light++;
    if (d[i + 2] > d[i] + 25 && d[i] < 90) dark++; // the picture's night sky
  }
  return { papers, light, sky: dark, posted: P.posted ? P.posted(o) : null, o: pr.o || null };
});
// as.board as it plays from the board: its lines, until it ends
async function play(p) {
  return p.evaluate(async () => {
    const m = RB.world.W.map, pr = m.props.find((q) => q.p === 'noticeboard' && q.scene === 'as.board');
    const lines = [];
    const say = RB.ui.dialogue.say;
    RB.ui.dialogue.say = function (l) { lines.push(String((l && l.en) || '')); return say.apply(this, arguments); };
    let done = false;
    RB.script.run('as.board', { prop: pr }).then(() => { done = true; });
    for (let i = 0; i < 200 && !done; i++) { if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 50)); }
    RB.ui.dialogue.say = say;
    // (the village's own arrival, "Before the reed plain…", waits for the first scene to end and then plays: not the
    // board's)
    return { done, lines: lines.filter((l) => !/^Before the reed plain/.test(l)) };
  });
}
const errorsAll = [];
const { p, ctx, errors } = await page(b, url, { viewport: { width: 1188, height: 848 } });
// ---- 1. each state -------------------------------------------------------------------------------------------------------
const S = {};
const V = { as_wash: 'stream', as_market: 'board' };
for (const [name, stage, flags] of [
  ['call', 0, {}],
  ['blank', 1, {}],
  ['water', 1, { as_nt_water: true }],
  ['both', 2, { as_nt_water: true, as_nt_market: true }],
  ['turns', 3, { as_nt_water: true, as_nt_market: true, as_dp_water: true }],
  ['picture', 3, { as_nt_water: true, as_nt_market: true, as_dp_water: true, as_fest_done: true }],
]) {
  await begin(p, stage, flags, flags.as_nt_market ? V : flags.as_nt_water ? { as_wash: 'stream' } : {});
  const bd = await board(p);
  const sc = await play(p);
  S[name] = Object.assign({ lines: sc.lines.map((l) => l.slice(0, 80)), done: sc.done }, bd);
}
ok(S.call.papers === 1 && /Names for the roads wanted/.test(S.call.lines.join('|')) && S.call.light > S.blank.light + 40,
  'before the roads are named: one paper (Mitsue\'s call), as the board\'s line says (' + J({ papers: S.call.papers, light: S.call.light, lines: S.call.lines }) + ')');
ok(S.blank.papers === 0 && S.blank.light < 40 && /Nothing on it yet/.test(S.blank.lines[0] || ''),
  'named, nothing posted yet: a blank board, and "Nothing on it yet" (' + J({ papers: S.blank.papers, light: S.blank.light, lines: S.blank.lines.slice(0, 2) }) + ')');
ok(S.water.papers === 1 && S.water.light > S.blank.light + 40 && !S.water.lines.some((l) => /Nothing on it yet/.test(l)) && /single shop/.test(S.water.lines[0] || ''),
  'the washing\'s notice up, the market\'s put off: one paper, never "Nothing on it yet"; straight on to the market (' + J({ papers: S.water.papers, light: S.water.light, lines: S.water.lines }) + ')');
ok(S.both.papers === 2 && S.both.light > S.water.light + 20 && S.both.lines.length === 2 && /washing|Washing/.test(S.both.lines.join('|')),
  'both notices: two papers, read back (' + J({ papers: S.both.papers, light: S.both.light, lines: S.both.lines }) + ')');
ok(S.turns.papers === 3 && S.turns.light > S.both.light + 20 && S.turns.lines.length === 3 && S.picture.papers === 4 && S.picture.sky > S.turns.sky + 20 && S.picture.lines.length === 4,
  'the channel\'s turns: three papers; the festival\'s picture: and a picture, each read back (' + J({ turns: [S.turns.papers, S.turns.light, S.turns.lines.length], picture: [S.picture.papers, S.picture.sky, S.picture.lines.length] }) + ')');
// ---- 2. a save and load with the washing's notice up ----------------------------------------------------------------------
await begin(p, 1, { as_nt_water: true }, { as_wash: 'stream' });
const loaded = await p.evaluate(async () => { try { await RB.save.manualSave(1); await RB.game.loadCampaign(1, 'manual'); return 'loaded'; } catch (e) { return 'failed: ' + e.message; } });
await p.waitForTimeout(900);
await p.evaluate(async () => { RB.challenge.run = async () => null; for (let i = 0; i < 40 && RB.ui.dialogue.isOpen(); i++) { RB.ui.dialogue.advance(true); await new Promise((r) => setTimeout(r, 40)); } });
const L = await board(p), Lp = await play(p);
ok(loaded === 'loaded' && L.papers === 1 && L.light === S.water.light && J(Lp.lines.map((l) => l.slice(0, 80))) === J(S.water.lines),
  'saved and loaded with the washing\'s notice up: the same board, the same lines (' + J({ loaded, papers: L.papers, light: L.light, lines: Lp.lines.length }) + ')');
// ---- 3. every other notice board as before ---------------------------------------------------------------------------------
const others = await p.evaluate(() => {
  const out = [];
  for (const [id, d] of Object.entries(RB.content.maps)) for (const q of d.props || []) if (q.p === 'noticeboard') out.push([id, q.x, q.y, !!(q.o && (q.o.papers || q.o.picture))]);
  return out;
});
const listed = others.filter((q) => q[3]);
const digest = await p.evaluate(() => {
  const P = RB.props.P.noticeboard, out = [];
  for (const [id, d] of Object.entries(RB.content.maps)) for (const q of d.props || []) {
    if (q.p !== 'noticeboard' || id === 'as.village') continue;
    const pal = RB.tiles.PAL[d.region] || RB.tiles.PAL.reedwake, o = Object.assign({ cx: q.x, cy: q.y }, q.o || {});
    const cv = document.createElement('canvas'); cv.width = 120; cv.height = 110; const g = cv.getContext('2d');
    P.draw2(g, 20, 40, pal, 0, o);
    const dd = g.getImageData(0, 0, 120, 110).data; let h = 0; for (let i = 0; i < dd.length; i++) h = (h * 31 + dd[i]) | 0;
    const fills = []; const c2 = { set fillStyle(v) { this._f = v; }, get fillStyle() { return this._f; }, fillRect(x, y, w, hh) { fills.push(this._f + x + ',' + y + ',' + w + ',' + hh); } };
    P.draw(c2, 0, 0, pal, 0, o);
    let h2 = 0; for (const ch of fills.join('|')) h2 = (h2 * 31 + ch.charCodeAt(0)) | 0;
    out.push(h ^ h2);
  }
  let all = 0; for (const x of out) all = (all * 31 + x) | 0;
  return { n: out.length, all };
});
ok(listed.length === 1 && listed[0][0] === 'as.village' && digest.n === 58 && digest.all === -378012995,
  'only Ashihara\'s board lists its notices; the other ' + digest.n + ' draw exactly as on CC-021\'s build (' + J({ listed, digest }) + ')');
errorsAll.push(...errors);
await ctx.close();
ok(!errorsAll.length, 'no page errors' + (errorsAll.length ? ': ' + errorsAll.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
