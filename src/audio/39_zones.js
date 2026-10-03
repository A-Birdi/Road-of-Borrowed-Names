/* Zone music: which battle and boss theme plays where.
 *
 * Every enemy carries a `region` (src/content/**); so does every map. A zone
 * groups the regions of one chapter's area and names its battle and boss
 * themes, its route theme and the overworld songs that belong to it (the
 * unit tests check every map against this table). Chapter 1 / Reedwake keeps
 * the original `battle` and `boss`.
 *
 * RB.audio.battleSong(enemy, mapDef, mapId) picks the song for a fight:
 *   1. enemy.music, when it names a real song other than the generic
 *      placeholders 'battle' / 'boss' — an explicit override wins;
 *   2. otherwise the zone of enemy.region, else of the map's region, else of
 *      the map id's prefix (sg. co. sb. lf. sa. …) — its boss theme for a boss
 *      (enemy.boss), its battle theme for anything else;
 *   3. otherwise Chapter 1's `boss` / `battle`.
 * 'battle' and 'boss' in content therefore mean "this zone's theme". */
var RB = (globalThis.RB = globalThis.RB || {});
RB.audio = RB.audio || {};

(function (A) {
  'use strict';
  const _ = (A._ = A._ || {});

  _.zones = {
    reedwake: {
      chapter: 1, regions: ['reedwake'], prefixes: ['rw.', 'lq.'],
      battle: 'battle', boss: 'boss', route: 'road',
      songs: ['reedwake', 'reedwake_night', 'road', 'mill'],
    },
    saltglass: {
      chapter: 2, regions: ['saltglass', 'archive'], prefixes: ['sg.'],
      battle: 'battle_saltglass', boss: 'boss_saltglass', route: 'sg_road',
      songs: ['sg_road', 'saltglass', 'drowned_archive'],
      cues: ['sg_confession', 'sg_counter', 'sg_letters', 'sg_lighthouse'],
    },
    cinder: {
      chapter: 3, regions: ['cinder'], prefixes: ['co.'],
      battle: 'battle_cinder', boss: 'boss_cinder', route: 'co_road',
      songs: ['co_road', 'cinder', 'co_terraces', 'kiln', 'co_festival'],
      cues: ['co_fire', 'co_assembly'],
    },
    snowbell: {
      chapter: 4, regions: ['snowbell'], prefixes: ['sb.'],
      battle: 'battle_snowbell', boss: 'boss_snowbell', route: 'sb_road',
      songs: ['sb_road', 'snowbell', 'observatory'],
      cues: ['sb_blizzard', 'sb_snowlight', 'sb_lamp'],
    },
    lanternfall: {
      chapter: 5, regions: ['lanternfall'], prefixes: ['lf.'],
      battle: 'battle_lanternfall', boss: 'boss_lanternfall', route: 'lf_road',
      songs: ['lf_road', 'lanternfall', 'lf_town_after', 'lf_records', 'belltower'],
      cues: ['lf_flood', 'lf_bell'],
    },
    still: {
      chapter: 6, regions: ['still', 'sa_mount', 'sa_still'], prefixes: ['sa.'],
      battle: 'battle', boss: 'boss', route: 'quiet_road',
      songs: ['still_archive', 'road'],
    },
    atlas: {
      chapter: 7, regions: ['atlas'], prefixes: ['atlas'],
      battle: 'battle', boss: 'boss',
      songs: ['atlas'],
    },
  };
  // Moods shared by every zone (investigation, rest, wonder, grief, the Hush,
  // the companions' own themes, the ending): allowed on any map.
  _.SHARED_MUSIC = ['mystery', 'inn', 'quiet_road', 'wonder', 'sorrow', 'hush', 'finale', 'ending', 'departure',
    'companion_nao', 'companion_mio', 'companion_ren', 'companion_suzu'];

  function zoneBy(key, val) {
    if (!val) return null;
    for (const id in _.zones) {
      const z = _.zones[id];
      if (key === 'region' ? z.regions.includes(val) : z.prefixes.some((p) => String(val).startsWith(p))) return id;
    }
    return null;
  }
  // zone id for an enemy and/or a map (null when nothing matches)
  A.zoneOf = function (enemy, mapDef, mapId) {
    return zoneBy('region', enemy && enemy.region) || zoneBy('region', mapDef && mapDef.region) || zoneBy('prefix', mapId) || null;
  };
  A.zones = () => JSON.parse(JSON.stringify(_.zones));

  A.battleSong = function (enemy, mapDef, mapId) {
    enemy = enemy || {};
    const want = enemy.music;
    if (want && want !== 'battle' && want !== 'boss' && _.songDefs && _.songDefs[want]) return want;
    const z = _.zones[A.zoneOf(enemy, mapDef, mapId)];
    const id = z ? (enemy.boss ? z.boss : z.battle) : null;
    if (id && _.songDefs && _.songDefs[id]) return id;
    return enemy.boss ? 'boss' : 'battle';
  };
})(RB.audio);
