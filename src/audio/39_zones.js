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
    // Chapters 2–6 (31_… 35_songs_ch*.js) and the Atlas (36_songs_atlas.js)
    saltglass: {
      chapter: 2, regions: ['saltglass', 'archive'], prefixes: ['sg.'],
      battle: 'battle_saltglass', boss: 'boss_saltglass', route: 'sg_road',
      songs: ['sg_road', 'saltglass', 'drowned_archive'],
      cues: ['sg_confession', 'sg_counter', 'sg_letters', 'sg_lighthouse'],
    },
    // the twelve-chapter edition's Manybridge (37_songs_mb.js): its chapter number is the twelve-chapter one; the
    // twelve-chapter intensity ladder (C-22, re-tiered in P14) is checked in tests/unit/audio_zones.test.mjs
    manybridge: {
      chapter: 3, edition: 2, regions: ['manybridge'], prefixes: ['mb.', 'mp.'],
      battle: 'battle_manybridge', boss: 'boss_manybridge', route: null,
      songs: ['manybridge', 'undercroft', 'playhouse', 'understage', 'festival'],
      cues: ['fireworks'],
    },
    // Chapter 4 (38_songs_mp.js) is the same city and its creatures fight to the city's battle theme; only its boss,
    // the Lord of the Understage (region 'understage'), has a theme of its own
    understage: {
      chapter: 4, edition: 2, regions: ['understage'], prefixes: [],
      battle: 'battle_manybridge', boss: 'boss_understage', route: null,
      songs: ['understage'],
    },
    // the twelve-chapter edition's Keepers' Road, Chapter 7 (38_songs_kr.js): biwa-led; its battle and boss themes sit
    // a step above Snowbell's and below Lanternfall's, the chapters either side of it in that edition
    keepers: {
      chapter: 7, edition: 2, regions: ['keepers'], prefixes: ['kr.'],
      battle: 'battle_keepers', boss: 'boss_keepers', route: null,
      songs: ['keepers', 'kr_cave', 'kr_vigil', 'kr_hall'],
    },
    // the twelve-chapter edition's Kotonoha, Chapter 9 (38_songs_ko.js): bowed voice, koto harmonics, glass chimes; its
    // battle and boss themes sit a step above Lanternfall's (Chapter 8 there) and below the Archive's
    kotonoha: {
      chapter: 9, edition: 2, regions: ['kotonoha'], prefixes: ['ko.'],
      battle: 'battle_ko', boss: 'boss_ko', route: null,
      songs: ['kotonoha', 'ko_roots', 'ko_garden'],
    },
    // the coastal sea, sailed in the boat (38v_songs_sea.js): a creature on deck fights to the island's battle theme
    sea: {
      chapter: 9, edition: 2, regions: ['sea'], prefixes: ['sea.'],
      battle: 'battle_ko', boss: 'boss_ko', route: null,
      songs: ['sea'],
    },
    // Sazanami, the fishing hamlet up the coast (38w_songs_sz.js); East Landing is Saltglass's (its region and song)
    sazanami: {
      chapter: 9, edition: 2, regions: ['sazanami'], prefixes: ['sz.'],
      battle: 'battle_ko', boss: 'boss_ko', route: null,
      songs: ['sazanami'],
    },
    // the twelve-chapter edition's Cloudroad, Chapter 10 (38x_songs_cr.js): shakuhachi and koto walking; its battle and
    // boss themes sit a step above Kotonoha's and below the Archive's
    cloudroad: {
      chapter: 10, edition: 2, regions: ['cloudroad', 'cloudtop'], prefixes: ['cr.'],
      battle: 'battle_cr', boss: 'boss_cr', route: null,
      songs: ['cloudroad', 'cr_pass', 'cr_hut'],
    },
    // the twelve-chapter edition's Steamhollow, Chapter 11 (38y_songs_yn.js): koto and shamisen, geta on stone; its
    // battle and boss themes sit a step above the Cloudroad's and below the Archive's
    steamhollow: {
      chapter: 11, edition: 2, regions: ['steamhollow', 'yn_vents'], prefixes: ['yn.'],
      battle: 'battle_yn', boss: 'yn_kettle', route: null,
      songs: ['steamhollow', 'yn_evening', 'yn_vents', 'yn_north'],
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
      battle: 'battle_still', boss: 'boss_hush', route: 'sa_road',
      songs: ['sa_road', 'sa_road_home', 'still_archive', 'sa_memories', 'sa_thin', 'sa_drone'],
      cues: ['sa_kasane', 'sa_toya'],
    },
    atlas: { // the post-game Unwritten Atlas
      chapter: 7, regions: ['atlas'], prefixes: ['atlas'],
      battle: 'battle_atlas', boss: 'boss_atlas',
      songs: ['atlas'],
    },
    // the Hall of a Hundred Tales (38zh_songs_hall.js), postgame in the twelve-chapter edition: each wing its own song;
    // its creatures fight to the Atlas's themes, the other post-story place
    hall: {
      chapter: 12, edition: 2, postgame: true, regions: ['hall', 'hall_w1', 'hall_w2'], prefixes: ['hall.'],
      battle: 'battle_atlas', boss: 'boss_atlas', route: null,
      songs: ['hall', 'hall_w1', 'hall_w2'],
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
