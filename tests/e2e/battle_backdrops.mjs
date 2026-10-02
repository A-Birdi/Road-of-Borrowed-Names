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
