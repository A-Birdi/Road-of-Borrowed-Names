// Zone music (src/audio/39_zones.js and 31_… 36_songs_ch*.js) against the
// real content: every map from Chapter 2 on plays its own zone's music or a
// shared mood (never Chapter 1's road theme), each zone's battle and boss
// themes are the ones chosen for its enemies, explicit enemy.music still
// wins, every scene cue exists, and the battle themes grow in intensity from
// chapter to chapter (numbers printed; see tests/lib/intensity.mjs).
import { load } from '../lib/load.mjs';
import { intensity, fmtIntensity } from '../lib/intensity.mjs';

// zones that have their own score so far (chapter by chapter)
const SCORED = ['saltglass', 'cinder', 'snowbell', 'lanternfall'];

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const A = RB.audio, _ = A._, C = RB.content;
  const Z = _.zones;
  const CH1 = new Set(['road', 'reedwake', 'reedwake_night', 'mill', 'battle', 'boss', 'title', 'prologue']);
  const songs = _.songDefs;

  // ---- the table names real songs
  t.ok(typeof A.battleSong === 'function' && typeof A.zoneOf === 'function', 'RB.audio.battleSong / zoneOf exist');
  for (const [zid, z] of Object.entries(Z)) {
    for (const id of [z.battle, z.boss, z.route, ...(z.songs || []), ...(z.cues || [])].filter(Boolean)) t.ok(!!songs[id], `zone ${zid}: song ${id} exists`);
  }
  for (const id of _.SHARED_MUSIC) t.ok(!!songs[id], 'shared mood exists: ' + id);
  t.ok(Z.reedwake.battle === 'battle' && Z.reedwake.boss === 'boss' && Z.reedwake.route === 'road', 'Chapter 1 keeps battle, boss and road');

  // ---- maps
  const cands = (m) => (m.music == null ? [] : typeof m.music === 'string' ? [m.music] : Array.isArray(m.music) ? m.music.map((x) => x.id) : ['<function>']);
  let mapsChecked = 0;
  for (const [mid, m] of Object.entries(C.maps)) {
    const zid = A.zoneOf(null, m, mid);
    t.ok(!!Z[zid], `map ${mid} belongs to a zone (${zid})`);
    if (!SCORED.includes(zid)) continue;
    const z = Z[zid];
    const allowed = new Set([...(z.songs || []), ...(z.cues || []), z.route, ..._.SHARED_MUSIC]);
    for (const id of cands(m)) {
      mapsChecked++;
      t.ok(!CH1.has(id), `${mid} (${zid}) does not fall back to Chapter 1's "${id}"`);
      t.ok(allowed.has(id), `${mid} (${zid}) plays its zone's music or a shared mood (got "${id}")`);
    }
  }
  t.log('maps checked in scored zones:', mapsChecked, 'music entries');
  for (const zid of SCORED) {
    const z = Z[zid];
    const roads = Object.keys(C.maps).filter((mid) => mid === z.prefixes[0] + 'road');
    t.ok(roads.length === 1, `${zid}: has a route map ${z.prefixes[0]}road`);
    for (const mid of roads) {
      const c = cands(C.maps[mid]);
      t.ok(c[c.length - 1] === z.route, `${mid}: the route plays ${z.route} (got ${c.join(', ')})`);
      t.ok(!c.includes('road'), `${mid}: never the Chapter 1 road theme`);
    }
    t.ok(z.battle !== 'battle' && z.boss !== 'boss', `${zid}: has its own battle and boss themes`);
    t.ok(songs[z.battle].kind === 'battle' && songs[z.boss].kind === 'boss', `${zid}: battle/boss songs are marked as such`);
  }

  // ---- battle and boss selection for every enemy
  let enemies = 0;
  for (const [eid, e0] of Object.entries(C.enemies)) {
    const e = Object.assign({ id: eid }, e0);
    const zid = A.zoneOf(e, null, eid);
    t.ok(!!Z[zid], `enemy ${eid} belongs to a zone (${e.region})`);
    if (!Z[zid]) continue;
    const want = e.boss ? Z[zid].boss : Z[zid].battle;
    const got = A.battleSong(e, null, null);
    t.ok(got === want, `${eid} (${zid}${e.boss ? ', boss' : ''}) plays ${want} (got ${got})`);
    if (zid === 'reedwake') t.ok(got === (e.boss ? 'boss' : 'battle'), `${eid}: Chapter 1 keeps ${e.boss ? 'boss' : 'battle'}`);
    enemies++;
  }
  t.log('enemies checked:', enemies);
  t.ok(A.battleSong({ region: 'saltglass', music: 'sorrow' }) === 'sorrow', 'an explicit enemy.music still overrides the zone');
  t.ok(A.battleSong({ region: 'saltglass', music: 'no_such_song' }) === Z.saltglass.battle, 'an unknown enemy.music falls back to the zone theme');
  t.ok(A.battleSong({ region: 'saltglass', music: 'battle' }) === Z.saltglass.battle && A.battleSong({ region: 'saltglass', music: 'boss', boss: true }) === Z.saltglass.boss, '"battle"/"boss" in content mean the zone theme');
  t.ok(A.battleSong({}, C.maps['sg.harbor'], 'sg.harbor') === Z.saltglass.battle, 'no enemy region: the map region decides');
  t.ok(A.battleSong({ boss: true }, { region: 'interior' }, 'sg.office') === Z.saltglass.boss, 'interior map: the map id prefix decides');
  t.ok(A.battleSong({}, null, null) === 'battle' && A.battleSong({ boss: true }) === 'boss', 'nothing known: Chapter 1 themes');

  // ---- scene cues
  let cues = 0;
  for (const [sid, sc] of Object.entries(C.scenes)) {
    let warpedTo = null; // a scene that warps back to Reedwake may play Reedwake's music there
    for (const c of sc.cmds) {
      if (c.op === 'warp') warpedTo = (c.args || [])[0];
      if (c.op !== 'music' || (c.args || [])[0] === '-') continue;
      const id = c.args[0];
      cues++;
      t.ok(!!songs[id], `${sid}: !music ${id} exists`);
      const zid = A.zoneOf(null, warpedTo ? C.maps[warpedTo] : null, warpedTo || sid);
      if (SCORED.includes(zid)) t.ok(!CH1.has(id), `${sid} (${zid}): no Chapter 1 song as a cue (${id})`);
    }
  }
  t.log('scene !music commands:', cues);
  for (const zid of SCORED) {
    for (const id of Z[zid].cues || []) {
      const used = Object.values(C.scenes).some((sc) => sc.cmds.some((c) => c.op === 'music' && c.args && c.args[0] === id));
      t.ok(used, `${zid}: cue ${id} is used by a scene`);
    }
  }

  // ---- intensity: battle (and boss) themes rise from chapter to chapter
  const order = Object.entries(Z).filter(([zid, z]) => z.chapter <= 6 && (zid === 'reedwake' || SCORED.includes(zid))).sort((a, b) => a[1].chapter - b[1].chapter);
  const rows = { battle: [], boss: [] };
  for (const [zid, z] of order) {
    for (const kind of ['battle', 'boss']) {
      const m = intensity(_.compile(songs[z[kind]]));
      rows[kind].push([zid, z[kind], m]);
      t.log(`ch${z.chapter} ${kind.padEnd(6)} ${z[kind].padEnd(20)} ${fmtIntensity(m)}`);
    }
  }
  const b = rows.battle;
  for (let i = 1; i < b.length; i++) {
    const [p, c] = [b[i - 1][2], b[i][2]];
    const w = `${b[i - 1][1]} -> ${b[i][1]}`;
    t.ok(c.score > p.score, `battle intensity rises: ${w} (score ${p.score.toFixed(2)} -> ${c.score.toFixed(2)})`);
    t.ok(c.bpm > p.bpm, `battle tempo rises: ${w} (${p.bpm.toFixed(0)} -> ${c.bpm.toFixed(0)})`);
    t.ok(c.density > p.density, `battle note density rises: ${w} (${p.density.toFixed(2)} -> ${c.density.toFixed(2)})`);
    t.ok(c.perc > p.perc, `battle percussion weight rises: ${w} (${p.perc.toFixed(2)} -> ${c.perc.toFixed(2)})`);
    t.ok(c.dissonance >= p.dissonance, `battle harmonic tension does not fall: ${w} (${(p.dissonance * 100).toFixed(1)} -> ${(c.dissonance * 100).toFixed(1)} %)`);
    t.ok(c.layers >= p.layers, `battle layering does not fall: ${w} (${p.layers.toFixed(2)} -> ${c.layers.toFixed(2)})`);
  }
  const bo = rows.boss;
  for (let i = 1; i < bo.length; i++) {
    t.ok(bo[i][2].score > bo[i - 1][2].score, `boss intensity rises: ${bo[i - 1][1]} -> ${bo[i][1]} (score ${bo[i - 1][2].score.toFixed(2)} -> ${bo[i][2].score.toFixed(2)})`);
  }
  // every battle theme stays below its zone's boss theme
  for (let i = 0; i < b.length; i++) t.ok(b[i][2].score < bo[i][2].score, `${b[i][1]} is calmer than ${bo[i][1]}`);
};
