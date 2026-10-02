// Location-aware battle backdrops (RB.battlePlaces), in the built game:
// (a) the Flour Moth out on the mill road fights in the open by the mill (the
//     mill's front and its wheel, no interior); the one in the mill fights
//     in the mill (timber wall, gears, millstone, the ladder and the stairs
//     the map has) — and every structural piece traces back to the map;
// (b) a small room keeps one structure under different presentation seeds
//     while the accessories change, all in valid zones;
// (c) outdoors the scenery follows the encounter's tile: riverbank and
//     inland on the mill road and in the village, shore and road at
//     Saltglass differ, and water only appears where the map has water;
// (d) the backdrop does not change through turns, hits and status changes;
//     a resize re-projects the same composition (the geometry follows the
//     actors, never the overlay's free rectangle: tests/e2e/battle_backdrops.mjs);
// (e) the presentation seed changes no battle state (two seeds, the same
//     scripted exchange, identical RB.combat.state() after every round), and
//     composing never calls Math.random;
// (f) nothing placed at random overlaps the creature, its knots or the
//     party's corner (the composer's records, and the static layer's pixels
//     with and without the accessories).
// Captures (with the chosen context and seed in the name, and a JSON record
// beside each) go to tests/e2e/out/backdrops/. With --docs, representative
// ones are copied to docs/screenshots/backdrops/ as WebP.
// Usage: node tests/e2e/backdrops.mjs [--docs] [--only a,b,c,d,e,f,atlas,phone,all]
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root, companionTurn } from './lib.mjs';

const DOCS = process.argv.includes('--docs');
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const outDir = path.join(root, 'tests', 'e2e', 'out', 'backdrops');
fs.mkdirSync(outDir, { recursive: true });
if (!ONLY) for (const f of fs.readdirSync(outDir)) if (/\.(png|json)$/.test(f)) fs.unlinkSync(path.join(outDir, f));
const { srv, url } = await serve();
const b = await launch();
let fail = 0, pass = 0;
const assert = (c, m) => { if (!c) { fail++; console.log('FAIL ' + m); } else { pass++; console.log('ok   ' + m); } };
let { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const captures = [];

// Start a battle the way the game does: a placed foe (its tile, its own
// placement fields) or a scripted one (where the player stands).
async function battle(o) {
  await p.evaluate((o) => {
    let place = null, x = o.x, y = o.y, enemy = o.enemy;
    if (o.foe) { place = RB.content.maps[o.map].foes.find((f) => f.id === o.foe); x = place.x; y = place.y; enemy = place.enemy; }
    const s = RB.game.debugStart(o.map, o.px != null ? o.px : x, o.py != null ? o.py : y + 1, { comp: 'mio', flags: o.flags || {} });
    s.learn.kanaKnown = 'both'; s.learn.profile = 'E'; s.words = ['mamoru', 'mizu', 'hikari'];
    RB.game.settings.input = 'choice';
    RB.game.settings.reducedMotion = o.reduce !== false; RB.game.applySettings();
    window.__result = null;
    const opts = { where: { map: o.map, x, y }, place: place || undefined };
    if (o.foe) opts.foeKey = 'foe:' + o.map + ':' + o.foe;
    if (o.seed != null) opts.presentSeed = o.seed;
    RB.game.startBattle(enemy, opts).then((r) => { window.__result = r; });
  }, o);
  await cards();
  await p.waitForTimeout(200);
  return p.evaluate(() => RB.battlePlaces.last());
}
async function cards() {
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.rcard[data-i]:not([disabled])') && !document.querySelector('.chal') }));
    if (st.cards) return true;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.evaluate(() => { const t = document.querySelector('.teach [data-ok]'); if (t) t.click(); });
    await p.waitForTimeout(60);
  }
  return false;
}
async function leave() {
  await p.reload();
  await p.waitForFunction(() => window.__RB_READY__ === true);
}
async function capture(rec, label) {
  const name = [label, rec.map, rec.x + '_' + rec.y, 'seed' + rec.seed, (rec.zone || '').replace(/[^a-z0-9]+/gi, '-')].join('__');
  const file = path.join(outDir, name + '.png');
  await p.screenshot({ path: file });
  fs.writeFileSync(path.join(outDir, name + '.json'), JSON.stringify(rec, null, 1));
  captures.push({ label, file, rec });
  return file;
}
const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
// every structural or nearby piece must be a real prop, building or tile run of that map
async function traceable(rec) {
  return p.evaluate((rec) => {
    const m = RB.maps.compile(rec.map);
    const bad = [];
    const all = rec.structure.map((s) => s.from).concat(rec.contextSel, (rec.lines || []).map((l) => l.from));
    for (const f of all) {
      const mm = /^(\w+):([\w.]+)@(.+)$/.exec(f);
      if (!mm) { bad.push(f); continue; }
      const [, src, id, at] = mm;
      if (src === 'prop') { const [x, y] = at.split(',').map(Number); if (!m.props.some((q) => q.p === id && q.x === x && q.y === y)) bad.push(f); }
      else if (src === 'struct') { const [x, y] = at.split(',').map(Number); if (!m.structs.some((q) => q.x === x && q.y === y)) bad.push(f); }
      else if (src === 'tiles') {
        const want = { water: ['water', 'shallow', 'darkwater'], cliffs: ['cliff'], bridge: ['bridgeH', 'bridgeV'], doorway: null }[id];
        if (want) { const [a, z] = at.split('-').map(Number); let ok = false; for (let x = a; x <= (z || a); x++) for (let y = 0; y < m.h; y++) if (want.includes(m.tiles[y * m.w + x].id)) ok = true; if (!ok && id === 'water') ok = m.props.some((q) => (q.p === 'lf_flood' || q.p === 'water') && q.x >= a && q.x <= z); if (!ok) bad.push(f); }
      } else bad.push(f);
    }
    return bad;
  }, rec);
}
// accessories: clear of the creature, the party and the response's lane; on
// their support. (Placement does not depend on the canvas's size, so a cluster
// may lie past the right edge of a small canvas: out of view, not misplaced.)
function zoneProblems(rec) {
  const out = [];
  const F = rec.frame;
  for (const a of rec.accessoriesPlaced) {
    if (!a.shown) continue;
    const r = a.rect;
    if (inter(r, F.creature)) out.push(a.id + ' over the creature');
    if (inter(r, F.party)) out.push(a.id + ' over the party');
    if (F.lane && inter(r, F.lane)) out.push(a.id + ' behind the response\'s lane');
    if (r.x + r.w < 0) out.push(a.id + ' left of the canvas ' + JSON.stringify(r));
    if ((a.zone === 'hang' || a.zone === 'beam') && (r.y < F.beamY - 2 || r.y > F.beamY + 16)) out.push(a.id + ' hangs without its beam (y ' + r.y + ', beam ' + F.beamY + ')');
    if ((a.zone === 'base' || a.zone === 'side' || a.zone === 'fore') && r.y + r.h < F.HZ) out.push(a.id + ' floats above the floor');
  }
  for (const c of rec.context) if (c.shown && c.rect && (inter(c.rect, F.creature) || inter(c.rect, F.party))) out.push('context ' + c.id + ' over an actor');
  return out;
}

// ---- (a) the Flour Moth: out by the mill, and in the mill ------------------------------------
if (want('a')) {
  const out = await battle({ map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true }, seed: 7 });
  const ctx = await p.evaluate(() => RB.combat.context());
  await capture(out, 'a-moth-outside');
  const ids = out.structure.map((s) => s.from);
  assert(out.setting === 'outdoor' && ctx.bg === 'reedwake' && !out.fallback, 'the moth on the mill road fights out of doors (' + out.setting + ', ' + ctx.bg + ')');
  assert(ids.some((f) => f.startsWith('struct:building@6,1')) && ids.includes('prop:millwheel@14,2'), 'the mill\'s front and its wheel are in view: ' + ids.join(' '));
  assert(out.landmarks.some((l) => l.id === 'building' && l.shown) && out.landmarks.some((l) => l.id === 'millwheel' && l.shown), 'and drawn');
  assert(!ids.some((f) => /ladder|gears|millstone|stairs/.test(f)) && out.view.mode === 'land', 'nothing of the interior (no ladder, gears, millstone, stairs)');
  assert(/mill/.test(out.zone) && /by-building/.test(out.zone), 'its zone says so: ' + out.zone);
  const bad = await traceable(out);
  assert(!bad.length, 'every piece of scenery is on the map (' + (bad.join(', ') || 'all traced') + ')');
  await leave();

  const inn = await battle({ map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true }, seed: 7 });
  await capture(inn, 'a-moth-inside');
  const ids2 = inn.structure.map((s) => s.from);
  assert(inn.setting === 'indoor' && inn.key === 'mill' && inn.small && inn.view.mode === 'room', 'the moth in the mill fights in the mill (a small room: one glancing view)');
  assert(['prop:ladder@2,2', 'prop:gears@10,2', 'prop:millstone@6,4', 'prop:stairs@12,9'].every((f) => ids2.includes(f)), 'the ladder, gears, millstone and stairs the map has: ' + ids2.join(' '));
  assert(inn.landmarks.find((l) => l.id === 'ladder').shown && inn.landmarks.find((l) => l.id === 'gears').shown, 'the ladder and the gear train are drawn');
  const lad = inn.landmarks.find((l) => l.id === 'ladder').rect, gear = inn.landmarks.find((l) => l.id === 'gears').rect;
  assert(lad.x < gear.x, 'the ladder stays west of the gears, as on the map (' + lad.x + ' < ' + gear.x + ')');
  assert(!(await traceable(inn)).length, 'every piece of the room is on the map');
  await leave();
  // a room without stairs or a ladder gets none
  const hall = await battle({ map: 'sg.da_reading', foe: 'r1', seed: 7 });
  await capture(hall, 'a-reading-room');
  const has = await p.evaluate(() => { const m = RB.maps.compile('sg.da_reading'); return { ladder: m.props.some((q) => q.p === 'ladder'), stairs: m.props.some((q) => q.p === 'stairs') }; });
  assert(!has.ladder && !has.stairs && !hall.structure.some((s) => /ladder|stairs/.test(s.id)), 'the reading room has no stairs or ladder on its map, and none in its backdrop');
  await leave();
}

// ---- (b) small room: fixed structure, varying accessories -------------------------------------
if (want('b')) {
  const seeds = [1, 2, 3, 4, 5, 6];
  const recs = [];
  for (const seed of seeds) { recs.push(await battle({ map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true }, seed })); if (seed <= 3) await capture(recs[recs.length - 1], 'b-mill-seed'); await leave(); }
  const struct = (r) => JSON.stringify(r.landmarks.map((l) => [l.from, l.shown, l.rect]));
  assert(recs.every((r) => struct(r) === struct(recs[0])), 'six seeds, one structure (same landmarks in the same places)');
  const sel = recs.map((r) => r.accessories.map((a) => a.id + '/' + a.variant).join(','));
  assert(new Set(sel).size >= 4, 'the accessories differ between seeds (' + new Set(sel).size + ' different selections of ' + seeds.length + ')');
  const shown = recs.map((r) => r.accessoriesPlaced.filter((a) => a.shown && a.rect.x < r.frame.W).length);
  // (this narrow decision-view stage leaves little wall or floor that is not behind an actor or the response's lane)
  assert(shown.every((n) => n >= 1) && shown.reduce((a, n) => a + n, 0) >= shown.length * 1.5, 'each seed dresses the room with clusters in view, two in most (' + shown.join(',') + ')');
  const probs = recs.flatMap((r) => zoneProblems(r).map((x) => 'seed ' + r.seed + ': ' + x));
  assert(!probs.length, 'every accessory in a valid zone (' + (probs.join('; ') || 'none out of place') + ')');
  const again = await battle({ map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true }, seed: 3 });
  assert(JSON.stringify(again.accessoriesPlaced) === JSON.stringify(recs[2].accessoriesPlaced), 'the same seed reproduces the same arrangement');
  await leave();
  const plain = await battle({ map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true } });
  const plain2 = (await leave(), await battle({ map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true } }));
  assert(plain.seed === plain2.seed && plain.counter === 1 && plain2.counter === 1, 'without a forced seed the seed comes from the map, the tile and the encounter count (' + plain.seed + ')');
  await leave();
}

// ---- (c) outdoor locality ----------------------------------------------------------------
if (want('c')) {
  const pairs = [
    ['mill road: riverbank vs inland', { map: 'rw.millroad', x: 17, y: 12, enemy: 'rw.reedling', flags: { rw_mill_open: true } }, { map: 'rw.millroad', x: 6, y: 21, enemy: 'rw.reedling', flags: { rw_mill_open: true } }],
    ['village: riverbank vs inland', { map: 'rw.village', x: 30, y: 20, enemy: 'rw.reedling' }, { map: 'rw.village', x: 12, y: 14, enemy: 'rw.reedling' }],
    ['Saltglass: shore vs road', { map: 'sg.cove', foe: 'c2' }, { map: 'sg.road', x: 30, y: 8, enemy: 'sg.crab' }],
  ];
  let first = true;
  for (const [label, A, B] of pairs) {
    const ra = await battle(Object.assign({ seed: 5 }, A)); await capture(ra, 'c-' + label.split(':')[0].replace(/\W+/g, '') + '-1'); await leave();
    const rb = await battle(Object.assign({ seed: 5 }, B)); await capture(rb, 'c-' + label.split(':')[0].replace(/\W+/g, '') + '-2'); await leave();
    const scen = (r) => new Set(r.structure.map((s) => s.id).concat(r.contextSel.map((f) => f.split('@')[0]), (r.lines || []).map((l) => 'line:' + l.group)));
    const sa = scen(ra), sb = scen(rb);
    const only = (x, y) => [...x].filter((k) => !y.has(k));
    assert(ra.zone !== rb.zone && (only(sa, sb).length + only(sb, sa).length) >= 2, label + ': different nearby scenery (' + ra.zone + ' / ' + rb.zone + '; only first: ' + only(sa, sb).join(',') + '; only second: ' + only(sb, sa).join(',') + ')');
    const wa = ra.structure.some((s) => s.id === 'water'), wb = rb.structure.some((s) => s.id === 'water');
    // water cells in the view window the composer reads (10 west, 6 east, 10 ahead, 3 behind)
    const mapWater = await p.evaluate(([a, b]) => {
      const near = (o) => { const m = RB.maps.compile(o.map); let n = 0; for (let y = o.y - 10; y <= o.y + 3; y++) for (let x = o.x - 10; x <= o.x + 6; x++) { const t = RB.maps.tileAt(m, x, y); if (t && /water|shallow/.test(t.id)) n++; } return n; };
      return [near(a), near(b)];
    }, [{ map: ra.map, x: ra.x, y: ra.y }, { map: rb.map, x: rb.x, y: rb.y }]);
    assert((!wa || mapWater[0] > 0) && (!wb || mapWater[1] > 0), label + ': water is shown only where the map has water in view (' + wa + '/' + mapWater[0] + ' cells, ' + wb + '/' + mapWater[1] + ' cells)');
    if (first) assert(wa && !wb && mapWater[1] === 0, label + ': the riverbank has the river, the inland spot none');
    first = false;
    assert(!(await traceable(ra)).length && !(await traceable(rb)).length, label + ': both drawn from real features');
  }
}

// ---- (d) stability through turns, hits, statuses; a resize reframes ------------------------------
async function answerUnravel() {
  const c = await p.evaluate(() => { const x = [...document.querySelectorAll('.rcard')].find((e) => /unravel/i.test(e.textContent) && !e.disabled); if (!x) return null; x.click(); return true; });
  if (!c) return false;
  await p.waitForSelector('.chal .mc .btn');
  await p.evaluate(() => {
    const st = window.__step, bs = [...document.querySelectorAll('.chal .mc .btn')];
    const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
    const html = (o) => o.text != null ? RB.ui.jhtml(o.text) : (o.jp ? RB.ui.jhtml(o.jp) : '') + (o.en ? '<span class="enline">' + RB.util.esc(o.en) + '</span>' : '');
    const right = RB.challenge.choicesFor(st).filter((o) => o.ok).map((o) => txt(html(o)));
    bs.find((x) => right.includes(x.textContent.replace(/\s+/g, ' ').trim())).click();
  });
  await p.waitForSelector('.fbwrap[data-fb=ok] .fb-go');
  await p.click('.fbwrap[data-fb=ok] .fb-go');
  // with a companion, their turn comes next (the response is queued until they choose)
  await companionTurn(p);
  return true;
}
async function wrapSteps() {
  await p.evaluate(() => { if (!window.__wrapped) { window.__wrapped = true; const run = RB.challenge.runStep; RB.challenge.runStep = (step, o) => { window.__step = step; return run(step, o); }; } });
}
if (want('d')) {
  // Part 1: the overlay's layout held still (the telegraph card pinned to its
  // first height), so any change in the backdrop could only come from the
  // backdrop: two exchanges (the Echo strikes back), Heat, then Shroud, a
  // ward and a lower resolve set by hand. Part 2 (real layout): a longer
  // telegraph makes the card taller and the whole arena moves; the backdrop is
  // then reframed with the same composition.
  const r0 = await battle({ map: 'rw.mill1', x: 5, y: 6, enemy: 'rw.mill_echo', flags: { rw_mill_open: true, rw_gears: true }, seed: 9 });
  await wrapSteps();
  await capture(r0, 'd-before');
  await p.evaluate(() => {
    // pin the overlay's slips (foe, telegraph, party) at their first heights
    const css = ['.cb-foe', '.intent', '.cb-party'].map((q) => { const h = document.querySelector('.combat-ui ' + q).getBoundingClientRect().height; return '.combat-ui ' + q + ' { height: ' + h + 'px !important; min-height: 0 !important; overflow: hidden !important; }'; }).join('\n');
    const st = document.createElement('style'); st.id = 'pin'; st.textContent = css; document.head.appendChild(st);
  });
  await p.waitForTimeout(600);
  const base = await p.evaluate(() => ({ sum: RB.battlePlaces.checksum(), rec: RB.battlePlaces.last() }));
  console.log('     pinned: frame ' + base.rec.frame.key);
  // the strip of scene right of the creature, from its top to the horizon (under the response panel at this size; its pixels are the backdrop's)
  const crop = async () => {
    const F = (await p.evaluate(() => RB.battlePlaces.last())).frame;
    const k = await p.evaluate(() => RB.render.viewSize().scale / 2);
    const st = await p.evaluate(() => { const r = document.querySelector('.combat-ui .cb-stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const x0 = Math.round((F.creature.x + F.creature.w + 2) * k), x1 = Math.round(st.x + st.w) - 2, y0 = Math.round(Math.max(F.creature.y * k, st.y)), y1 = Math.round(F.HZ * k);
    return p.screenshot({ clip: { x: x0, y: y0, width: Math.max(8, x1 - x0), height: Math.max(8, y1 - y0) } });
  };
  const px0 = await crop();
  const snaps = [];
  let px1 = null;
  for (let round = 0; round < 2; round++) {
    const before = await p.evaluate(() => JSON.stringify(RB.combat.state()));
    await answerUnravel();
    await cards();
    await p.waitForTimeout(400);
    const after = await p.evaluate(() => ({ st: JSON.stringify(RB.combat.state()), sum: RB.battlePlaces.checksum(), rec: RB.battlePlaces.last() }));
    snaps.push({ changed: before !== after.st, sum: after.sum, key: after.rec.frame.key, builds: after.rec.builds });
    console.log('     round ' + (round + 1) + ': frame ' + after.rec.frame.key);
    // after the first exchange (the Echo struck back); the second brings Heat, which tints the whole screen by design
    if (round === 0) px1 = await crop();
  }
  await p.evaluate(() => { const st = RB.combat.state(); st.shroud = true; st.pc = Math.max(1, st.pc - 2); st.ward.pc = 1; RB.combat.refresh(); });
  await p.waitForTimeout(300);
  const r1 = await p.evaluate(() => ({ sum: RB.battlePlaces.checksum(), rec: RB.battlePlaces.last() }));
  assert(snaps.every((s) => s.changed), 'two exchanges played (the battle state changed each round; resolve, knots and Heat moved)');
  assert(snaps.every((s) => s.key === base.rec.frame.key && s.sum === base.sum) && r1.sum === base.sum && r1.rec.frame.key === base.rec.frame.key, 'with the overlay\'s layout held, the backdrop\'s static layer is identical pixel for pixel through two turns, a blow, Heat, Shroud, a ward and a hit (checksum ' + base.sum + ')');
  assert(r1.rec.builds === base.rec.builds, 'and it was built once, not again (' + base.rec.builds + ' → ' + r1.rec.builds + ')');
  assert(px1 && Buffer.compare(px0, px1) === 0, 'the screen beside the creature (backdrop only) is unchanged after an exchange and a blow');
  // Part 2: let the overlay take its natural height again
  await p.evaluate(() => document.getElementById('pin').remove());
  await p.waitForTimeout(700);
  const r3 = await p.evaluate(() => RB.battlePlaces.last());
  const selOf = (r) => JSON.stringify({ s: r.structure, a: r.accessories, c: r.contextSel });
  const order = (r) => r.landmarks.filter((l) => l.rect && l.shown).sort((a, b) => a.rect.x - b.rect.x || a.from.localeCompare(b.from)).map((l) => l.from).join(' ');
  console.log('     overlay back to its own height: frame ' + base.rec.frame.key + ' → ' + r3.frame.key);
  assert(selOf(r3) === selOf(r0) && order(r3) === order(base.rec), 'when the telegraph card changes height the arena may move; the backdrop follows with the same composition, its landmarks in the same order (' + order(r3) + ')');
  // resize: the same selection, reframed
  await p.setViewportSize({ width: 1100, height: 700 });
  await p.waitForTimeout(900);
  const r2 = await p.evaluate(() => RB.battlePlaces.last());
  await capture(r2, 'd-after-resize');
  assert(selOf(r2) === selOf(r0) && JSON.stringify(r2.origin) === JSON.stringify(r0.origin), 'after a resize (' + r0.frame.W + '×' + r0.frame.H + ' → ' + r2.frame.W + '×' + r2.frame.H + ') the same composition: structure, context, accessories, one origin record');
  assert(!zoneProblems(r2).length, 'and everything is still in a valid zone (' + zoneProblems(r2).join('; ') + ')');
  await p.setViewportSize({ width: 1280, height: 800 });
  await leave();
}

// ---- (e) isolation: the seed changes no battle state --------------------------------------
if (want('e')) {
  const run = async (seed) => {
    await battle({ map: 'rw.mill1', x: 5, y: 6, enemy: 'rw.mill_echo', flags: { rw_mill_open: true, rw_gears: true }, seed });
    await wrapSteps();
    const out = [await p.evaluate(() => JSON.stringify(RB.combat.state()))];
    for (let round = 0; round < 2; round++) { await answerUnravel(); await cards(); await p.waitForTimeout(300); out.push(await p.evaluate(() => JSON.stringify(RB.combat.state()))); }
    await leave();
    return out;
  };
  const a = await run(101), c = await run(90210);
  assert(a.length === c.length && a.every((s, i) => s === c[i]), 'the same exchange under seeds 101 and 90210 gives the same RB.combat.state() after every round (' + a.length + ' snapshots)');
  const rnd = await p.evaluate(() => {
    const s = RB.game.debugStart('rw.mill1', 3, 5, { comp: 'mio', flags: { rw_gears: true } });
    void s;
    let n = 0;
    const orig = Math.random;
    Math.random = () => { n++; return orig(); };
    try {
      const e = Object.assign({ id: 'rw.dustmoth', where: { map: 'rw.mill1', x: 3, y: 4 }, setting: 'indoor', bgKey: 'mill', art: 'moth' }, RB.content.enemies['rw.dustmoth']);
      e.bgKey = 'mill';
      RB.battlePlaces.begin(e, { presentSeed: 42 });
      const cv = document.createElement('canvas'); cv.width = 640; cv.height = 400;
      RB.battlePlaces.draw(cv.getContext('2d'), 'mill', 640, 400, 242, 1000, false, { S: { x: 8, y: 116, w: 398, h: 204 }, ex: 255, ey: 206, ext: { top: -80, bottom: 70 }, px: 48, py: 263, ps: 1, scale: 1, art: e.art });
    } finally { Math.random = orig; }
    return n;
  });
  assert(rnd === 0, 'composing and painting a backdrop calls Math.random ' + rnd + ' times');
}

// ---- (f) nothing overlaps the actors: records and pixels ------------------------------------
if (want('f')) {
  const places = [
    { map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true }, seed: 2 },
    { map: 'rw.mill1', x: 5, y: 6, enemy: 'rw.mill_echo', flags: { rw_mill_open: true, rw_gears: true }, seed: 4 },
    { map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true }, seed: 2 },
    { map: 'sg.cove', foe: 'c1', seed: 3 },
    { map: 'co.kiln', foe: 'g2', seed: 3 },
    { map: 'sb.obs_path', foe: 'fox2', seed: 3 },
    { map: 'lf.stacks', foe: 'st1', seed: 3 },
    { map: 'sa.stacks', foe: 'm1', seed: 3 },
  ];
  for (const o of places) {
    const r = await battle(o);
    await capture(r, 'f-' + (o.foe || o.enemy));
    const probs = zoneProblems(r);
    assert(!probs.length, r.map + ' (' + r.zone + '): accessories and nearby scenery clear of the creature, knots and party (' + (probs.join('; ') || 'clear') + ')');
    const diff = await p.evaluate(() => {
      const a = RB.battlePlaces.layerPixels(), z = RB.battlePlaces.layerPixels({ noAccessories: true });
      const F = RB.battlePlaces.last().frame;
      const inside = (x, y, r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
      let changed = 0, bad = 0;
      for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
        const i = (y * a.w + x) * 4;
        if (a.data[i] !== z.data[i] || a.data[i + 1] !== z.data[i + 1] || a.data[i + 2] !== z.data[i + 2]) { changed++; if (inside(x, y, F.creature) || inside(x, y, F.party)) bad++; }
      }
      return { changed, bad };
    });
    assert(diff.bad === 0, r.map + ': of ' + diff.changed + ' pixels the accessories add, ' + diff.bad + ' fall in the creature\'s or the party\'s box');
    await leave();
  }
}

// ---- an Unwritten Atlas room keeps the parchment map's identity ------------------------------------
if (want('atlas')) {
  await p.evaluate(() => {
    RB.game.debugStart('rw.hall', 5, 5, { comp: 'mio', profile: 'E', flags: { post: true } });
    RB.game.settings.textSpeed = 'instant';
    RB.atlas._debug.flags.seed = 7;
    RB.hooks.atlas_start([], {});
  });
  for (let i = 0; i < 150; i++) {
    const ok = await p.evaluate(() => {
      if (RB.atlas._debug.run() && !RB.ui.dialogue.isOpen()) return true;
      const ch = document.querySelector('.choices:not(.hidden) button'); if (ch) { ch.click(); return false; }
      const pb = [...document.querySelectorAll('.panel .foot .btn.primary, .panel [data-ok], .folio [data-ok], .csheet .foot .pbtn.primary')].find((e) => e.offsetParent); if (pb) { pb.click(); return false; }
      if (RB.ui.dialogue.isOpen()) RB.ui.dialogue.advance(true);
      return false;
    });
    if (ok) break;
    await p.waitForTimeout(80);
  }
  const room = await p.evaluate(() => { const plan = RB.atlas._debug.plan(); const r = Object.values(plan).find((q) => q.foes.length); return r ? { id: r.id, foe: r.foes[0] } : null; });
  assert(!!room, 'an expedition with a foe in one of its rooms (' + (room && room.id) + ')');
  if (room) {
    await p.evaluate((room) => { RB.game.settings.reducedMotion = true; RB.game.applySettings(); RB.game.startBattle(room.foe.enemy, { where: { map: room.id, x: room.foe.x, y: room.foe.y }, presentSeed: 3 }); }, room);
    await cards();
    await p.waitForTimeout(250);
    const r = await p.evaluate(() => RB.battlePlaces.last());
    await capture(r, 'atlas');
    assert(r.key === 'atlas' && !r.fallback && r.fam === 'atlas', 'the Atlas room composes its own place on the parchment map (' + r.zone + ')');
    assert(!(await traceable(r)).length && !zoneProblems(r).length, 'its pieces are on the generated map and everything is in a valid zone');
  }
  await leave();
}

// ---- a phone: the stage is a narrow strip, the same rules hold ------------------------------------
if (want('phone')) {
  const ph = await page(b, url, { viewport: { width: 390, height: 844 }, touch: true, mobile: true, dpr: 2 });
  const keep = p; p = ph.p;
  for (const o of [{ map: 'rw.mill1', foe: 'm1a', flags: { rw_mill_open: true, rw_gears: true }, seed: 3 }, { map: 'rw.millroad', foe: 'f3', flags: { rw_mill_open: true }, seed: 3 }, { map: 'sg.cove', foe: 'c2', seed: 3 }]) {
    const r = await battle(o);
    await capture(r, 'phone-' + o.foe);
    const probs = zoneProblems(r);
    assert(!r.fallback && !probs.length, 'phone ' + r.map + ': composed, everything in a valid zone (' + (probs.join('; ') || r.accessoriesPlaced.filter((q) => q.shown).length + ' clusters shown') + ')');
    await leave();
  }
  errors.push(...ph.errors);
  await ph.ctx.close();
  p = keep;
}

// ---- every other place that hosts a battle composes a backdrop ------------------------------------
if (want('all')) {
  const all = await p.evaluate(() => {
    const out = [];
    for (const id in RB.content.maps) for (const f of RB.content.maps[id].foes || []) out.push({ map: id, foe: f.id });
    return out;
  });
  const bosses = [
    { map: 'sg.da_vault', x: 4, y: 9, enemy: 'sg.tideclerk' }, { map: 'co.kiln_core', x: 7, y: 8, enemy: 'co.warden' },
    { map: 'sb.obs_dome', x: 4, y: 6, enemy: 'sb.boss' }, { map: 'lf.bellhall', x: 1, y: 5, enemy: 'lf.keeper' }, { map: 'sa.heart', x: 11, y: 11, enemy: 'sa.hush' },
  ];
  const fallbacks = [], slow = [];
  let n = 0;
  for (const o of all.concat(bosses)) {
    const r = await battle(Object.assign({ seed: 1 }, o));
    n++;
    if (!r || r.fallback) fallbacks.push(o.map + ' ' + (o.foe || o.enemy) + ': ' + (r && r.fallback));
    const probs = zoneProblems(r);
    if (probs.length) fallbacks.push(o.map + ' ' + (o.foe || o.enemy) + ': ' + probs.join('; '));
    if (o.enemy) await capture(r, 'boss-' + o.enemy);
    if (r.buildMs > 60) slow.push(o.map + ' ' + r.buildMs + 'ms');
    await leave();
  }
  assert(!fallbacks.length, n + ' battle places (every placed foe and the scripted bosses) compose a place with everything in valid zones (' + (fallbacks.join(' | ') || 'all') + ')');
  console.log('     composition build over 60 ms (first use of prop art): ' + (slow.join(', ') || 'none'));
}

console.log(errors.length ? 'page errors: ' + errors.slice(0, 5).join(' | ') : 'no page errors');
assert(!errors.length, 'no console or page errors');

if (DOCS) {
  const dir = path.join(root, 'docs', 'screenshots', 'backdrops');
  fs.mkdirSync(dir, { recursive: true });
  const q = await (await b.newContext()).newPage();
  for (const c of captures.filter((c) => /^(a-|b-|c-|d-after|boss-|atlas|phone-)/.test(c.label))) {
    const data = 'data:image/png;base64,' + fs.readFileSync(c.file).toString('base64');
    const b64 = await q.evaluate(async (data) => {
      const img = new Image(); img.src = data; await img.decode();
      const cv = document.createElement('canvas'); cv.width = Math.round(img.width / 2); cv.height = Math.round(img.height / 2);
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(img, 0, 0, cv.width, cv.height);
      return cv.toDataURL('image/webp', 0.92).split(',')[1];
    }, data);
    fs.writeFileSync(path.join(dir, path.basename(c.file, '.png') + '.webp'), Buffer.from(b64, 'base64'));
  }
  console.log('docs captures written to', path.relative(root, dir));
}
console.log('\n' + pass + ' passed, ' + fail + ' failed; captures in ' + path.relative(root, outDir));
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
