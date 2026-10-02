// Battle backdrops, §19 of the battle-art addendum (RB.battlePlaces), in the
// built game:
//  (v) viewports — the same encounter at 320×640, 390×844, 844×390,
//      1280×800 and 1920×1080: one origin record and one accessory choice
//      everywhere (a resize never rerolls), the west-to-east order of the
//      landmarks kept, nothing decorative over an actor, and a wider canvas
//      shows more map columns of the same composition;
//  (m) menu movement — the overlay's free rectangle (the old "stage") changes
//      while the actors stay: the cached layer is not rebuilt and its pixels
//      do not change; a larger canvas with the same actors repeats the
//      smaller one pixel for pixel where they overlap (it reveals more);
//  (s) persistent state — the mill's gears jammed / repaired, the reed bed
//      on the mill road standing / cleared, the village bridge broken /
//      mended, the wheel still / turning: each pair differs in its record's
//      state keys and in the drawn layer, and the cache keeps them apart;
//  (r) every encounter setting (all placed foes, the scripted bosses, an
//      Atlas room) composes a reproducible origin record in the browser;
//  (e) no page errors.
// Captures (with a JSON origin record beside each) go to
// tests/e2e/out/battle_backdrops/. --docs writes WebP evidence to
// docs/screenshots/battle/backdrops/. --capture <label> only captures the
// representative set (used for the before/after comparison).
// Diagnostic fixtures (a companion in Chapter 1, a battle before the gears
// are mended, a fight by the village bridge) are labelled "diag" in names.
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const argv = process.argv;
const DOCS = argv.includes('--docs');
const BARE = argv.includes('--bare');
const ci = argv.indexOf('--capture');
const CAPTURE = ci > 0 ? argv[ci + 1] : null;
const oi = argv.indexOf('--only');
const ONLY = oi > 0 ? argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const outRoot = path.join(root, 'tests', 'e2e', 'out', 'battle_backdrops');
const outDir = path.join(outRoot, CAPTURE || 'run');
fs.mkdirSync(outDir, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
let fail = 0, pass = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else { pass++; console.log('ok   ' + m); } };
const allErrors = [];
const captures = [];

// the representative set: every backdrop family, indoors and out, with the bosses' rooms
const SET = [
  { tag: 'reedwake-mill-front', map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true } },
  { tag: 'reedwake-road', map: 'rw.millroad', foe: 'f1', flags: { rw_mill_open: true } },
  { tag: 'mill-ground-floor', map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true } },
  { tag: 'mill-wheel-pit', map: 'rw.mill0', foe: 'p2', flags: { rw_mill_open: true, rw_gears: true } },
  { tag: 'saltglass-shore', map: 'sg.cove', foe: 'c2' },
  { tag: 'saltglass-road', map: 'sg.road', foe: 'r1' },
  { tag: 'archive-entry-hall', map: 'sg.da_entry', foe: 'e2' },
  { tag: 'archive-reading-room', map: 'sg.da_reading', foe: 'r1' },
  { tag: 'archive-vault-boss', map: 'sg.da_vault', x: 4, y: 9, enemy: 'sg.tideclerk' },
  { tag: 'cinder-upper', map: 'co.upper', foe: 'm1' },
  { tag: 'cinder-oldworks', map: 'co.oldworks', foe: 's2' },
  { tag: 'kiln-hall', map: 'co.kiln', foe: 'g2' },
  { tag: 'kiln-core-boss', map: 'co.kiln_core', x: 7, y: 8, enemy: 'co.warden' },
  { tag: 'snowbell-path', map: 'sb.obs_path', foe: 'wisp1' },
  { tag: 'observatory-hall', map: 'sb.obs_hall', foe: 'wisp2' },
  { tag: 'observatory-charts', map: 'sb.obs_charts', foe: 'moth1' },
  { tag: 'observatory-dome-boss', map: 'sb.obs_dome', x: 4, y: 6, enemy: 'sb.boss' },
  { tag: 'lanternfall-stacks', map: 'lf.stacks', foe: 'st1' },
  { tag: 'belltower-mid', map: 'lf.tower_mid', foe: 'tm1' },
  { tag: 'belltower-bellhall-boss', map: 'lf.bellhall', x: 1, y: 5, enemy: 'lf.keeper' },
  { tag: 'still-road', map: 'sa.road', foe: 'c1' },
  { tag: 'still-stacks', map: 'sa.stacks', foe: 'w1' },
  { tag: 'still-conduits', map: 'sa.conduits', foe: 'g1' },
  { tag: 'still-heart-boss', map: 'sa.heart', x: 11, y: 11, enemy: 'sa.hush' },
];
// persistent-state pairs: [label, before, after]
const STATE = [
  ['mill-gears', { map: 'rw.mill1', x: 5, y: 6, enemy: 'rw.dustmoth', diag: true, flags: { rw_mill_open: true, rw_gears: false } }, { map: 'rw.mill1', x: 5, y: 6, enemy: 'rw.dustmoth', diag: true, flags: { rw_mill_open: true, rw_gears: true } }],
  // diagnostic: a Reedling on the road below the narrows, the reed bed that closes the animal track five columns east
  ['millroad-reeds', { map: 'rw.millroad', x: 7, y: 18, enemy: 'rw.reedling', diag: true, flags: { rw_mill_open: true, rw_mr_nao: false } }, { map: 'rw.millroad', x: 7, y: 18, enemy: 'rw.reedling', diag: true, flags: { rw_mill_open: true, rw_mr_nao: true } }],
  ['village-bridge', { map: 'rw.village', x: 33, y: 19, enemy: 'rw.reedling', diag: true, flags: { bridge_fixed: false } }, { map: 'rw.village', x: 33, y: 19, enemy: 'rw.reedling', diag: true, flags: { bridge_fixed: true } }],
  ['millroad-wheel', { map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true, rw_echo_done: false } }, { map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true, rw_echo_done: true } }],
];

async function open(viewport, o) {
  o = o || {};
  const r = await page(b, url, { viewport, dpr: o.dpr || 1, touch: !!o.touch, mobile: !!o.mobile });
  return r;
}
// Start a battle the way the game does: a placed foe (its tile, its own
// placement fields) or a scripted one (where the player stands).
async function battle(p, o) {
  await p.evaluate((o) => {
    let place = null, x = o.x, y = o.y, enemy = o.enemy;
    if (o.foe) { place = RB.content.maps[o.map].foes.find((f) => f.id === o.foe); x = place.x; y = place.y; enemy = place.enemy; }
    const s = RB.game.debugStart(o.map, x, Math.min(y + 1, RB.maps.compile(o.map).h - 2), { comp: o.comp === undefined ? 'mio' : o.comp, flags: o.flags || {} });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'mizu', 'hikari'];
    RB.game.settings.input = 'choice';
    RB.game.settings.reducedMotion = o.reduce !== false; RB.game.applySettings();
    window.__result = null;
    const opts = { where: { map: o.map, x, y }, place: place || undefined };
    if (o.foe) opts.foeKey = 'foe:' + o.map + ':' + o.foe;
    opts.presentSeed = o.seed != null ? o.seed : 7;
    RB.game.startBattle(enemy, opts).then((r) => { window.__result = r; });
  }, o);
  await cards(p);
  await p.waitForTimeout(250);
  return p.evaluate(() => ({ last: RB.battlePlaces.last(), origin: RB.battlePlaces.origin ? RB.battlePlaces.origin() : null }));
}
async function cards(p) {
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])') && !document.querySelector('.chal') }));
    if (st.cards) return true;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.evaluate(() => { const t = document.querySelector('.teach [data-ok]'); if (t) t.click(); const c = document.querySelector('[data-coach-ok]'); if (c) c.click(); });
    await p.waitForTimeout(60);
  }
  return false;
}
async function leave(p) {
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
}
// the overlay hidden: the whole scene, as an action view would reveal it
async function bare(p, on) {
  await p.evaluate((on) => {
    let st = document.getElementById('bb-bare');
    if (on && !st) { st = document.createElement('style'); st.id = 'bb-bare'; st.textContent = '.combat-ui, .hud, #hud { visibility: hidden !important; }'; document.head.appendChild(st); }
    if (!on && st) st.remove();
  }, on);
  await p.waitForTimeout(120);
}
async function shoot(p, name, rec, dir) {
  const d = dir || outDir;
  const file = path.join(d, name + '.png');
  await p.screenshot({ path: file });
  if (BARE) { await bare(p, true); await p.screenshot({ path: path.join(d, name + '__scene.png') }); await bare(p, false); }
  if (rec) fs.writeFileSync(path.join(d, name + '.json'), JSON.stringify(rec, null, 1));
  captures.push({ name, file });
  return file;
}

// ---- capture-only mode (before/after comparison) ----------------------------------------------
if (CAPTURE) {
  for (const [vw, vh, dpr, tag] of [[1280, 800, 1, 'desk'], [390, 844, 2, 'phone']]) {
    const { p, ctx, errors } = await open({ width: vw, height: vh }, { dpr, touch: tag === 'phone', mobile: tag === 'phone' });
    for (const o of SET) {
      if (ONLY && !ONLY.some((k) => o.tag.startsWith(k))) continue;
      if (tag === 'phone' && !/mill-|shore|reading|kiln-hall|still-road|observatory-hall/.test(o.tag)) continue;
      const r = await battle(p, o);
      await shoot(p, o.tag + '__' + tag, r);
      await leave(p);
    }
    if (tag === 'desk') for (const [label, A, B] of STATE) {
      if (ONLY && !ONLY.some((k) => ('state-' + label).startsWith(k))) continue;
      const ra = await battle(p, A); await shoot(p, 'state-' + label + (A.diag ? '-diag' : '') + '-1-before__' + tag, ra); await leave(p);
      const rb = await battle(p, B); await shoot(p, 'state-' + label + (B.diag ? '-diag' : '') + '-2-after__' + tag, rb); await leave(p);
    }
    allErrors.push(...errors);
    await ctx.close();
  }
  console.log(allErrors.length ? 'page errors: ' + allErrors.slice(0, 5).join(' | ') : 'no page errors');
  console.log(captures.length + ' captures in ' + path.relative(root, outDir));
  await b.close(); srv.close();
  process.exit(0);
}

// ---- the test ------------------------------------------------------------------------------------
const inter = (a, b) => a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
// nothing decorative over an actor or the response's lane; accessories on their support
function problems(L) {
  const out = [], F = L.frame;
  if (!F) return ['no frame'];
  for (const a of L.accessoriesPlaced) {
    if (!a.shown) continue;
    for (const [k, r] of [['creature', F.creature], ['party', F.party], ['lane', F.lane]].concat((F.creatures || []).map((q, i) => ['creature ' + i, q]))) if (inter(a.rect, r)) out.push(a.id + ' over the ' + k);
    if ((a.zone === 'hang' || a.zone === 'beam') && (a.rect.y < F.beamY - 2 || a.rect.y > F.beamY + 16)) out.push(a.id + ' hangs without its beam (y ' + a.rect.y + ', beam ' + F.beamY + ')');
    if ((a.zone === 'base' || a.zone === 'side' || a.zone === 'fore') && a.rect.y + a.rect.h < F.HZ) out.push(a.id + ' floats above the floor');
  }
  for (const c of L.context) if (c.shown && c.rect && (inter(c.rect, F.creature) || inter(c.rect, F.party))) out.push('context ' + c.id + ' over an actor');
  return out;
}
// the arrangement RB.combat hands the backdrop (canvas px), for off-screen probes
const frameNow = (p) => p.evaluate(() => {
  const lay = RB.battleStage.lay(), ctx = RB.combat.context(), e = RB.content.enemies[ctx.id] || {};
  const vs = RB.render.viewSize(), A = RB.render.ART;
  return { key: ctx.bg, w: Math.round(vs.w * A), h: Math.round(vs.h * A), hz: lay.hz, F: { ex: lay.ex, ey: lay.ey, ext: lay.ext, px: lay.px, py: lay.py, ps: lay.ps, scale: lay.scale, art: e.art, party: lay.party } };
});

if (!CAPTURE) {
  // (v) one encounter at five viewport sizes -------------------------------------------------------
  const VIEWS = [[320, 640], [390, 844], [844, 390], [1280, 800], [1920, 1080]];
  const ENC = [
    { tag: 'mill-ground-floor', map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true } },
    { tag: 'reedwake-mill-front', map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true } },
    { tag: 'saltglass-shore', map: 'sg.cove', foe: 'c2' },
  ];
  const resources = [];
  if (want('v')) for (const enc of ENC) {
    const recs = [];
    for (const [w, h] of VIEWS) {
      const { p, ctx, errors } = await open({ width: w, height: h });
      const r = await battle(p, enc);
      await shoot(p, 'v-' + enc.tag + '__' + w + 'x' + h, r);
      await bare(p, true); await p.screenshot({ path: path.join(outDir, 'v-' + enc.tag + '__' + w + 'x' + h + '__scene.png') }); await bare(p, false);
      recs.push({ w, h, L: r.last, O: r.origin });
      resources.push(Object.assign({ at: enc.tag + ' ' + w + 'x' + h }, await p.evaluate(() => RB.battlePlaces.resources())));
      allErrors.push(...errors);
      await ctx.close();
    }
    const o0 = JSON.stringify(recs[0].O);
    assert(recs.every((r) => JSON.stringify(r.O) === o0), enc.tag + ': one origin record at every size (seed, anchors, state keys and accessory homes unchanged; a resize never rerolls)');
    const probs = recs.flatMap((r) => problems(r.L).map((x) => r.w + 'x' + r.h + ': ' + x));
    assert(!probs.length, enc.tag + ': at every size nothing decorative over an actor or the response lane, everything on its support (' + (probs.join('; ') || 'clear') + ')');
    // west to east on the back wall, as on the map, at every size
    const order = recs.map((r) => {
      const wall = r.L.landmarks.filter((l) => l.shown && l.rect && l.tier === 'wall' && /^prop:/.test(l.from)).map((l) => ({ mx: +l.from.split('@')[1].split(',')[0], x: l.rect.x + l.rect.w / 2 }));
      return wall.every((q, i) => wall.every((z) => (q.mx < z.mx ? q.x < z.x : q.mx > z.mx ? q.x > z.x : true)));
    });
    assert(order.every(Boolean), enc.tag + ': the back wall\'s landmarks keep their west-to-east order at every size');
    // a wider canvas (at the same actor scale) shows more map columns of the same picture
    const byU = {};
    for (const r of recs) (byU[r.L.frame.u] = byU[r.L.frame.u] || []).push(r);
    let grows = true;
    for (const u in byU) { const s = byU[u].slice().sort((a, b) => a.L.frame.W - b.L.frame.W); for (let i = 1; i < s.length; i++) if (s[i].L.frame.W > s[i - 1].L.frame.W && s[i].L.frame.cols[1] - s[i].L.frame.cols[0] < s[i - 1].L.frame.cols[1] - s[i - 1].L.frame.cols[0] - 0.01) grows = false; }
    console.log('     ' + enc.tag + ' columns shown: ' + recs.map((r) => r.w + 'x' + r.h + '→' + r.L.frame.W + 'x' + r.L.frame.H + ' u' + r.L.frame.u + ' cols ' + r.L.frame.cols.join('…')).join(' | '));
    assert(grows, enc.tag + ': a wider canvas shows more columns (never fewer)');
  }

  // (m) menu movement and revealing: the overlay rectangle is ignored; a larger canvas repeats the smaller one --
  if (want('m')) {
    const { p, ctx, errors } = await open({ width: 1280, height: 800 });
    for (const enc of [ENC[0], ENC[1], { tag: 'archive-entry-hall', map: 'sg.da_entry', foe: 'e2' }]) {
      await battle(p, enc);
      const fr = await frameNow(p);
      const pr = await p.evaluate((fr) => {
        const BP = RB.battlePlaces;
        const a = BP.probe(fr.F, fr.w, fr.h, fr.hz);
        const b = BP.probe(Object.assign({}, fr.F, { S: { x: 0, y: 0, w: fr.w, h: fr.h } }), fr.w, fr.h, fr.hz);
        const c = BP.probe(Object.assign({}, fr.F, { S: { x: 40, y: 300, w: 200, h: 90 } }), fr.w, fr.h, fr.hz);
        const big = BP.probe(fr.F, fr.w * 2 + 130, fr.h * 2 + 70, fr.hz, { x: 0, y: 0, w: a.W, h: a.H }, true);
        // where they differ, if they do (for the message)
        const a2 = BP.probe(fr.F, fr.w, fr.h, fr.hz, null, true);
        const da = a2.cv.getContext('2d').getImageData(0, 0, a.W, a.H).data, db = big.cv.getContext('2d').getImageData(0, 0, a.W, a.H).data;
        let n = 0, box = [1e9, 1e9, -1, -1];
        for (let y = 0; y < a.H; y++) for (let x = 0; x < a.W; x++) { const i = (y * a.W + x) * 4; if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) { n++; box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)]; } }
        delete big.cv; delete a2.cv;
        return { a, b, c, big, diff: { n, box } };
      }, fr);
      assert(pr.a.sum === pr.b.sum && pr.a.sum === pr.c.sum && pr.a.key === pr.b.key && pr.a.key === pr.c.key, enc.tag + ': the panels\' rectangle (the old stage) changes nothing: one layer key, one checksum (' + pr.a.sum + ')');
      assert(pr.big.sum === pr.a.sum && pr.big.W > pr.a.W && pr.diff.n === 0, enc.tag + ': a canvas twice as large (same actors) repeats this one pixel for pixel where they overlap (' + pr.a.W + 'x' + pr.a.H + ' inside ' + pr.big.W + 'x' + pr.big.H + '; ' + pr.diff.n + ' pixels differ' + (pr.diff.n ? ' in ' + pr.diff.box.join(',') : '') + ')');
      // the live layer: panels withdrawn and returned (their space kept) — not rebuilt, not changed
      const before = await p.evaluate(() => ({ b: RB.battlePlaces.last().builds, s: RB.battlePlaces.checksum() }));
      await bare(p, true); await p.waitForTimeout(300);
      const mid = await p.evaluate(() => ({ b: RB.battlePlaces.last().builds, s: RB.battlePlaces.checksum() }));
      await bare(p, false); await p.waitForTimeout(300);
      const after = await p.evaluate(() => ({ b: RB.battlePlaces.last().builds, s: RB.battlePlaces.checksum() }));
      assert(before.b === mid.b && mid.b === after.b && before.s === mid.s && mid.s === after.s, enc.tag + ': panels withdrawn and back: the cached layer is not rebuilt and does not change (builds ' + before.b + ')');
      await leave(p);
    }
    allErrors.push(...errors);
    await ctx.close();
  }

  // (s) persistent state ---------------------------------------------------------------------------
  if (want('s')) {
    const { p, ctx, errors } = await open({ width: 1280, height: 800 });
    for (const [label, A, B] of STATE) {
      const ra = await battle(p, A);
      const sa = await p.evaluate(() => RB.battlePlaces.checksum());
      await shoot(p, 'state-' + label + (A.diag ? '-diag' : '') + '-1-before', ra);
      await bare(p, true); await p.screenshot({ path: path.join(outDir, 'state-' + label + (A.diag ? '-diag' : '') + '-1-before__scene.png') }); await bare(p, false);
      await leave(p);
      const rb = await battle(p, B);
      const sb = await p.evaluate(() => RB.battlePlaces.checksum());
      await shoot(p, 'state-' + label + (B.diag ? '-diag' : '') + '-2-after', rb);
      await bare(p, true); await p.screenshot({ path: path.join(outDir, 'state-' + label + (B.diag ? '-diag' : '') + '-2-after__scene.png') }); await bare(p, false);
      await leave(p);
      const ka = ra.origin.state.join(' '), kb = rb.origin.state.join(' ');
      assert(ka !== kb && ra.origin.sig !== rb.origin.sig && ra.last.layerKey !== rb.last.layerKey, label + ': the state keys differ (' + ka + ' → ' + kb + '), so do the signature and the cache key');
      assert(sa !== sb, label + ': and the drawn layer differs (' + sa + ' → ' + sb + ')');
      if (label === 'mill-gears') assert(ra.origin.anchors.includes('prop:ladder@2,2>hatch-shut') && rb.origin.anchors.includes('prop:ladder@2,2>hatch-open') && ra.last.structure.some((s) => s.id === 'gears'), label + ': the hatch over the ladder shut while the gears are jammed, open after');
      if (label === 'millroad-reeds') assert(ra.origin.context.concat(ra.origin.lines).some((f) => /reeds@12,1[4-7]/.test(f)) && !rb.origin.context.concat(rb.origin.lines).some((f) => /reeds@12,1[4-7]/.test(f)), label + ': the reed bed across the track before Nao clears it, none after');
      if (label === 'millroad-wheel') assert(ra.origin.state.includes('prop:millwheel@14,2?!rw_echo_done=1') && rb.origin.state.includes('prop:millwheel@14,2?rw_echo_done=1'), label + ': the still wheel before the Echo is settled, the turning one after');
    }
    allErrors.push(...errors);
    await ctx.close();
  }

  // (a) motion: mended machinery turns, jammed machinery and reduced motion rest; the scene hushes while you read
  if (want('a')) {
    const { p, ctx, errors } = await open({ width: 1280, height: 800 });
    const sample = async (still) => p.evaluate(({ still }) => {
      const L = RB.battlePlaces.last(), g = L.landmarks.find((l) => l.id === 'gears' || l.id === 'millwheel');
      const lay = RB.battleStage.lay(), e = RB.content.enemies[RB.combat.context().id];
      const vs = RB.render.viewSize(), A = RB.render.ART, w = Math.round(vs.w * A), h = Math.round(vs.h * A);
      const F = { ex: lay.ex, ey: lay.ey, ext: lay.ext, px: lay.px, py: lay.py, ps: lay.ps, scale: lay.scale, art: e.art, party: lay.party, hush: 0, particles: false };
      const sums = [];
      for (const t of [1000, 2600, 4200]) {
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
        RB.battlePlaces.draw(c, RB.combat.context().bg, w, h, lay.hz, t, still, F);
        const u = L.frame.u, r = g.rect, d = c.getImageData(r.x * u, r.y * u, r.w * u, r.h * u).data;
        let hs = 2166136261 >>> 0; for (let i = 0; i < d.length; i += 4) { hs ^= d[i] | (d[i + 1] << 8) | (d[i + 2] << 16); hs = Math.imul(hs, 16777619) >>> 0; }
        sums.push(hs >>> 0);
      }
      return sums;
    }, { still });
    await battle(p, { map: 'rw.mill1', x: 5, y: 6, enemy: 'rw.dustmoth', flags: { rw_mill_open: true, rw_gears: true }, reduce: false });
    const turning = await sample(false), resting = await sample(true);
    await p.waitForTimeout(150); // a live frame or two (the samples above set their own hush)
    const hush = await p.evaluate(() => ({ ph: RB.combat.phase(), h: RB.battlePlaces.last().hush }));
    await leave(p);
    await battle(p, { map: 'rw.mill1', x: 5, y: 6, enemy: 'rw.dustmoth', flags: { rw_mill_open: true, rw_gears: false }, reduce: false });
    const jammed = await sample(false);
    await leave(p);
    await battle(p, { map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true, rw_echo_done: true }, reduce: false });
    const wheel = await sample(false), wheelStill = await sample(true);
    await leave(p);
    assert(new Set(turning).size > 1 && new Set(resting).size === 1, 'the mended gear train turns over time; with reduced motion it rests (' + new Set(turning).size + ' / ' + new Set(resting).size + ' distinct frames)');
    assert(new Set(jammed).size === 1, 'the jammed gear train never turns (its wedge and cocked shaft say so in every frame)');
    assert(new Set(wheel).size > 1 && new Set(wheelStill).size === 1, 'the freed water wheel turns; with reduced motion it rests');
    assert(hush.ph === 'choose' && hush.h === 0.5, 'while you read and choose, the scenery runs at half (hush ' + hush.h + ' in phase ' + hush.ph + ')');
    allErrors.push(...errors);
    await ctx.close();
  }

  // (r) every encounter setting composes a reproducible origin record, in the built game ------------
  if (want('r')) {
    const { p, ctx, errors } = await open({ width: 1280, height: 800 });
    const res = await p.evaluate(() => {
      const C = RB.content, BP = RB.battlePlaces;
      RB.game.debugStart('rw.hall', 5, 5, { comp: 'mio', flags: { rw_mill_open: true, rw_gears: true, postgame: true } });
      const s = RB.game.s;
      for (const seed of [99, 4242]) RB.atlas.register(RB.atlas.newRun(s, ['mirror'], { seed }));
      const list = [];
      for (const id in C.maps) for (const f of C.maps[id].foes || []) list.push([id, f.x, f.y, f.enemy, f.bg]);
      for (const b of [['sg.da_vault', 4, 9, 'sg.tideclerk'], ['co.kiln_core', 7, 8, 'co.warden'], ['sb.obs_dome', 4, 6, 'sb.boss'], ['lf.bellhall', 1, 5, 'lf.keeper'], ['sa.heart', 11, 11, 'sa.hush'], ['rw.mill1', 6, 6, 'rw.mill_echo']]) list.push(b);
      const bad = [];
      let n = 0, atlas = 0;
      for (const [id, x, y, enemy, bg] of list) {
        const m = RB.maps.compile(id);
        const e = Object.assign({ id: enemy }, C.enemies[enemy] || {});
        e.setting = RB.render.enclosed(m) ? 'indoor' : 'outdoor';
        let k = bg || e.bg || e.region || 'reedwake';
        if (e.setting === 'outdoor' && { mill: 1, archive: 1, kiln: 1, observatory: 1, belltower: 1 }[k]) k = { reedwake: 1, saltglass: 1, cinder: 1, snowbell: 1, lanternfall: 1 }[e.region] ? e.region : 'reedwake';
        e.bgKey = k;
        const c = BP.compose(e, { map: id, x, y }, 7);
        const o = BP.origin(c), o2 = BP.origin(BP.recompose(JSON.parse(JSON.stringify(o))));
        n++; if (id.startsWith('atlas.')) atlas++;
        if (c.fallback || JSON.stringify(o) !== JSON.stringify(o2)) bad.push(id + '@' + x + ',' + y + (c.fallback ? ' fallback' : ' differs'));
      }
      return { n, atlas, bad };
    });
    assert(!res.bad.length && res.n >= 60 && res.atlas >= 3, res.n + ' encounter settings (every placed foe, the six scripted bosses, ' + res.atlas + ' Atlas rooms) compose a place whose origin record rebuilds it exactly (' + (res.bad.join(', ') || 'all') + ')');
    allErrors.push(...errors);
    await ctx.close();
  }

  // (w) §2.9: the warehouse narration's floorboard, as the world draws it (evidence; no battle happens there)
  if (want('w')) {
    const { p, ctx, errors } = await open({ width: 1280, height: 800 });
    await p.evaluate(() => { RB.game.debugStart('rw.warehouse', 5, 7, { dir: 'up' }); });
    await p.waitForTimeout(500);
    await shoot(p, 'warehouse-entrance-2_9');
    allErrors.push(...errors);
    await ctx.close();
  }

  if (resources.length) {
    console.log('     resources (static layers kept, their bytes; the art caches behind them):');
    for (const r of resources) console.log('       ' + r.at + ': ' + r.layers + ' layer(s) ' + (r.layerBytes / 1048576).toFixed(2) + ' MiB, art ' + (r.art ? r.art.sprites + ' sprites ' + (r.art.bytes / 1048576).toFixed(2) + ' MiB' : '?') + ', last build ' + r.lastMs + ' ms (max ' + r.maxMs + ')');
    fs.writeFileSync(path.join(outDir, 'resources.json'), JSON.stringify(resources, null, 1));
  }
  console.log(allErrors.length ? 'page errors: ' + allErrors.slice(0, 5).join(' | ') : 'no page errors');
  assert(!allErrors.length, 'no console or page errors');

  // ---- evidence: WebP composites in docs/screenshots/battle/backdrops/ ------------------------------
  if (DOCS) {
    const dir = path.join(root, 'docs', 'screenshots', 'battle', 'backdrops');
    fs.mkdirSync(dir, { recursive: true });
    const q = await (await b.newContext()).newPage();
    // compose images side by side (or in a row), each scaled, into one WebP
    const composite = async (files, out, scale, labels) => {
      const ds = files.filter((f) => fs.existsSync(f)).map((f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'));
      if (ds.length !== files.length) { console.log('     (missing input for ' + out + ')'); return; }
      const b64 = await q.evaluate(async ({ ds, scale, labels }) => {
        const ims = await Promise.all(ds.map(async (d) => { const im = new Image(); im.src = d; await im.decode(); return im; }));
        const gap = 8, lab = labels ? 18 : 0;
        const W = ims.reduce((m, im) => m + Math.round(im.width * scale), 0) + gap * (ims.length - 1), H = Math.max(...ims.map((im) => Math.round(im.height * scale))) + lab;
        const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        const g = cv.getContext('2d'); g.fillStyle = '#1b1a24'; g.fillRect(0, 0, W, H);
        let x = 0;
        ims.forEach((im, i) => { g.imageSmoothingEnabled = scale < 1; g.drawImage(im, x, lab, Math.round(im.width * scale), Math.round(im.height * scale)); if (labels) { g.fillStyle = '#f0ead8'; g.font = '13px sans-serif'; g.fillText(labels[i], x + 4, 13); } x += Math.round(im.width * scale) + gap; });
        return cv.toDataURL('image/webp', 0.86).split(',')[1];
      }, { ds, scale, labels });
      fs.writeFileSync(path.join(dir, out), Buffer.from(b64, 'base64'));
    };
    const B4 = path.join(outRoot, 'before'), AF = path.join(outRoot, 'after');
    // before (the base build) / after, per region family, as the player sees it at 1280×800, and the whole scene after
    for (const o of SET) {
      await composite([path.join(B4, o.tag + '__desk.png'), path.join(AF, o.tag + '__desk.png'), path.join(AF, o.tag + '__desk__scene.png')], 'family-' + o.tag + '.webp', 0.5, ['before (base build)', 'after', 'after: the whole scene (panels hidden)']);
    }
    for (const t of ['mill-ground-floor', 'mill-wheel-pit', 'reedwake-mill-front', 'saltglass-shore', 'archive-reading-room', 'kiln-hall', 'still-road', 'observatory-hall']) await composite([path.join(B4, t + '__phone.png'), path.join(AF, t + '__phone.png')], 'phone-' + t + '.webp', 0.5, ['before, 390×844', 'after, 390×844']);
    for (const [label, A] of STATE) { const d = A.diag ? '-diag' : ''; await composite([path.join(outDir, 'state-' + label + d + '-1-before__scene.png'), path.join(outDir, 'state-' + label + d + '-2-after__scene.png')], 'state-' + label + d + '.webp', 0.5, ['before (' + Object.entries(A.flags).filter(([k]) => k !== 'rw_mill_open').map(([k, v]) => k + '=' + v).join(' ') + ')', 'after']); }
    for (const enc of ['mill-ground-floor', 'reedwake-mill-front', 'saltglass-shore']) await composite(VIEWS.map(([w, h]) => path.join(outDir, 'v-' + enc + '__' + w + 'x' + h + '__scene.png')), 'viewports-' + enc + '.webp', 0.34, VIEWS.map(([w, h]) => w + '×' + h));
    await composite([path.join(outDir, 'warehouse-entrance-2_9.png')], 'warehouse-2_9.webp', 0.6, ['rw.warehouse from its door: no gap in the boards is drawn (§2.9)']);
    console.log('docs evidence written to', path.relative(root, dir));
    // a short recording of the ambient motion (mended gears and dust; the freed wheel), real time
    const rec = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: path.join(outDir, 'video'), size: { width: 960, height: 600 } } });
    const vp = await rec.newPage();
    await vp.goto(url); await vp.waitForFunction(() => window.__RB_READY__ === true);
    await battle(vp, { map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true }, reduce: false });
    await bare(vp, true); await vp.waitForTimeout(4200);
    await leave(vp);
    await battle(vp, { map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true, rw_echo_done: true }, reduce: false });
    await bare(vp, true); await vp.waitForTimeout(3600);
    const vpath = await vp.video().path();
    await rec.close();
    fs.copyFileSync(vpath, path.join(dir, 'motion-mill-gears-and-wheel.webm'));
    console.log('recording: ' + path.relative(root, path.join(dir, 'motion-mill-gears-and-wheel.webm')) + ' (' + Math.round(fs.statSync(path.join(dir, 'motion-mill-gears-and-wheel.webm')).size / 1024) + ' KiB)');
  }
  console.log('\n' + pass + ' passed, ' + fail + ' failed; captures in ' + path.relative(root, outDir));
  await b.close(); srv.close();
  process.exit(fail ? 1 : 0);
}
