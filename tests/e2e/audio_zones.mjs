// Zone music in the real game (built index.html, Chromium): for every zone
// (src/audio/39_zones.js) a real battle against one of its creatures plays the
// zone's battle theme and, after stepping back from the fight, the map's own
// music returns; its boss plays the zone's boss theme; each zone's route map
// plays its route theme on entry. Audio is initialised (as after a click), so
// the songs are really scheduled, and the engine must record no error.
// Usage: node tools/build.mjs && node tests/e2e/audio_zones.mjs [zone]
import { serve, launch, page } from './lib.mjs';

const only = process.argv[2];
const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL:', m); } };

// the zones, their route maps and a placed creature + the boss of each
const { p: p0 } = await page(b, url);
const plan = await p0.evaluate(() => {
  const C = RB.content, A = RB.audio;
  const out = [];
  for (const [zid, z] of Object.entries(A.zones())) {
    if (z.chapter > 7) continue;
    const route = Object.keys(C.maps).find((m) => z.prefixes.some((pf) => m === pf + 'road')) || null;
    let foe = null;
    for (const [mid, m] of Object.entries(C.maps)) {
      for (const f of m.foes || []) {
        const e = C.enemies[f.enemy];
        if (!foe && e && !e.boss && A.zoneOf(e, m, mid) === zid) foe = { enemy: f.enemy, map: mid };
      }
    }
    // zones whose creatures are not placed on a map (the Atlas generates its
    // rooms): fight one of them on the first Reedwake route instead
    if (!foe) {
      const id = Object.keys(C.enemies).find((id) => !C.enemies[id].boss && A.zoneOf(C.enemies[id], null, id) === zid);
      if (id) foe = { enemy: id, map: 'rw.millroad' };
    }
    const boss = Object.keys(C.enemies).find((id) => C.enemies[id].boss && A.zoneOf(C.enemies[id], null, id) === zid);
    out.push({ zid, chapter: z.chapter, route, routeSong: z.route, battle: z.battle, boss: z.boss, foe, bossId: boss });
  }
  return out;
});
await p0.close();

async function cards(p) {
  for (let i = 0; i < 200; i++) {
    const st = await p.evaluate(() => ({ dlg: RB.ui.dialogue.isOpen(), cards: !!document.querySelector('.resp[data-i]') }));
    if (st.cards) return;
    if (st.dlg) await p.evaluate(() => RB.ui.dialogue.advance(true));
    await p.waitForTimeout(60);
  }
  await p.waitForSelector('.resp[data-i]', { timeout: 5000 });
}

for (const z of plan) {
  if (only && z.zid !== only) continue;
  console.log(`# ${z.zid} (chapter ${z.chapter}): route ${z.route} -> ${z.routeSong}; battle ${z.battle}; boss ${z.boss}`);
  // ---- route theme on entry, battle theme in a fight, map music restored after it
  {
    const { p, errors } = await page(b, url);
    const r = await p.evaluate(async ([z]) => {
      await RB.audio.init();
      const m = RB.content.maps[z.foe.map];
      const sp = (m.spawn && m.spawn.default) || [1, 1, 'down'];
      const s = RB.game.debugStart(z.foe.map, sp[0], sp[1], { comp: 'mio' });
      s.learn.kanaKnown = 'both';
      RB.game.settings.input = 'choice';
      const mapSong = RB.world.musicFor(RB.world.W.map.def, s);
      const atEntry = RB.audio.currentSong();
      window.__res = null;
      RB.game.startBattle(z.foe.enemy, {}).then((x) => { window.__res = x; });
      await new Promise((r) => setTimeout(r, 400));
      return { mapSong, atEntry, inBattle: RB.audio.currentSong(), ready: RB.audio.ready() };
    }, [z]);
    ok(r.ready, `${z.zid}: audio context running`);
    ok(r.atEntry === r.mapSong, `${z.zid}: ${z.foe.map} plays its music on entry (${r.mapSong}, got ${r.atEntry})`);
    ok(r.inBattle === z.battle, `${z.zid}: a fight with ${z.foe.enemy} plays ${z.battle} (got ${r.inBattle})`);
    await cards(p);
    await p.click('[data-flee]');
    await p.waitForSelector('.csheet .pbtn');
    await p.evaluate(() => [...document.querySelectorAll('.csheet .pbtn')].find((x) => /step back/i.test(x.textContent)).click());
    await p.waitForFunction(() => window.__res === 'flee' && RB.game.mode() === 'world', null, { timeout: 15000 });
    await p.waitForTimeout(300);
    const after = await p.evaluate(() => ({ song: RB.audio.currentSong(), want: RB.world.musicFor(RB.world.W.map.def, RB.game.s), err: RB.audio._.st.lastError }));
    ok(after.song === after.want, `${z.zid}: after the fight the map music returns (${after.want}, got ${after.song})`);
    ok(!after.err, `${z.zid}: audio engine error: ${after.err}`);
    if (z.route) {
      const rt = await p.evaluate((route) => { RB.world.enter(route); return RB.audio.currentSong(); }, z.route);
      ok(rt === z.routeSong, `${z.zid}: ${z.route} plays ${z.routeSong} (got ${rt})`);
    }
    ok(!errors.length, `${z.zid}: page errors: ${errors.slice(0, 3).join(' | ')}`);
    await p.close();
  }
  // ---- the boss theme
  if (z.bossId) {
    const { p, errors } = await page(b, url);
    const r = await p.evaluate(async ([z]) => {
      await RB.audio.init();
      const m = RB.content.maps[z.foe.map];
      const sp = (m.spawn && m.spawn.default) || [1, 1, 'down'];
      const s = RB.game.debugStart(z.foe.map, sp[0], sp[1], { comp: 'nao' });
      s.learn.kanaKnown = 'both';
      RB.game.startBattle(z.bossId, {});
      await new Promise((r) => setTimeout(r, 400));
      return { song: RB.audio.currentSong(), err: RB.audio._.st.lastError };
    }, [z]);
    ok(r.song === z.boss, `${z.zid}: the boss ${z.bossId} plays ${z.boss} (got ${r.song})`);
    ok(!r.err, `${z.zid}: audio engine error in the boss fight: ${r.err}`);
    ok(!errors.length, `${z.zid} boss: page errors: ${errors.slice(0, 3).join(' | ')}`);
    await p.close();
  }
}
await b.close();
srv.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
