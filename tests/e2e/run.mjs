// Runs the browser test scripts against the built index.html, one after another,
// and prints a summary. Usage: node tests/e2e/run.mjs [--full | --extra] [--skip=a.mjs,…] [--part=k/n]
//   default: UI, systems, audio, per-chapter story tests (one or two
//            configurations each), an Atlas expedition, and one whole-game run
//   --full:  per-chapter story tests in all their configurations and the
//            16-combination whole-game matrix (takes an hour or more)
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const full = process.argv.includes('--full');
let suites = [
  ['ui.mjs'], ['systems.mjs'], ['settings.mjs'], ['settings_access.mjs'], ['settings_review.mjs'], ['ledger_li.mjs'], ['folio.mjs'], ['equipment.mjs'], ['characters.mjs'], ['play_ui.mjs'], ['choice_rows.mjs'], ['world_view.mjs'], ['world_fixes.mjs'], ['encounters.mjs'], ['procedure_copy.mjs'], ['guest_arrivals.mjs'], ['social_battle.mjs'], ['card_press.mjs'], ['social_preview.mjs'], ['departures.mjs'], ['walk_round.mjs'], ['props_balance.mjs'], ['sequence_manual.mjs', '--quick'], ['quest_guide.mjs'], ['fieldweave.mjs'], ['mill_road.mjs'], ['keepsakes.mjs'], ['backdrops.mjs'], ['title_ledger.mjs'], ['create.mjs'], ['prologue.mjs'], ['interludes.mjs'], ['lookout_vista.mjs'], ['keeper_reveal.mjs'], ['lf_arrival_view.mjs'], ['ko_crossing.mjs'], ['interlude_ahead.mjs'], ['ko_first_sight.mjs'], ['suzu_stage.mjs'], ['enter_ownership.mjs'], ['tide_split.mjs'], ['reunion_ways.mjs'], ['yoshino_exhibit_line.mjs'], ['wind_stone.mjs'], ['tide_night.mjs'], ['interlude_lifecycle.mjs'], ['fare_pay_staging.mjs'], ['geese_event.mjs'], ['road_oil.mjs'], ['fog_event.mjs'], ['walkto_options.mjs'], ['bath_partition.mjs'], ['goatshed_fence.mjs'], ['learning_ui.mjs'], ['kb_reflow.mjs'], ['pad_kanji.mjs'], ['kanji_chart.mjs'], ['combat_ui.mjs'], ['combat_small.mjs'], ['battle_anim.mjs'], ['battle_group.mjs'], ['companion_turn.mjs'], ['playtest_repairs.mjs'], ['battle_presentation.mjs'], ['battle_party.mjs'], ['battle_creatures_b.mjs'], ['creatures_c.mjs', '--quick'], ['battle_backdrops.mjs'], ['battle_pets_overworld.mjs', '--battles-only'], ['battle_cycle.mjs'], ['battle_overlap.mjs'], ['battle_settings.mjs'], ['bookmarks.mjs'], ['book.mjs'], ['book_surfaces.mjs'], ['pets.mjs'], ['town_animals.mjs'], ['lighthouse_top.mjs'], ['route_after_ch2.mjs'], ['road_on.mjs'], ['counter_tap.mjs'], ['tap_moving.mjs'], ['learning_qa039.mjs'], ['hall_entry.mjs'], ['pets_greet.mjs'], ['pets_weave.mjs'], ['pets_gallery.mjs'], ['lodge_arrival.mjs'], ['hall_door.mjs'], ['ruin_lanterns.mjs'], ['load_mid_scene.mjs'], ['fade_load.mjs'], ['battle_start_abandon.mjs'], ['prep_abandon.mjs'], ['guide_next_step.mjs'], ['guide_climb.mjs'], ['leaf_marker.mjs'], ['leaf_home.mjs'], ['ao_lesson_line.mjs'], ['ao_whereabouts.mjs'], ['guide_archive.mjs'], ['guide_stacks.mjs'], ['lodge_quarrel.mjs'], ['companion_away.mjs'], ['ren_apart.mjs'], ['lodge_evening.mjs'], ['guide_kana.mjs'], ['guide_reveal.mjs'], ['guide_tellings.mjs'], ['guide_roots_leaf.mjs'], ['guide_vigil.mjs'], ['social_wait.mjs'], ['look_purity.mjs'], ['mitsu_frame.mjs'], ['audio.check.mjs'], ['audio_levels.mjs'],
  ['shift_load_regression.mjs', '--origin'], ['shift_load_regression.mjs'], // hotfix regressions (http origin, file://)
  ['travel_rules.mjs'], // quick travel: open air yes; buildings, dungeons, story locks and conversations say why not
  full ? ['story_ch1.mjs'] : ['story_ch1.mjs', 'F', 'mio'],
  full ? ['story_ch3.mjs'] : ['story_ch3.mjs', 'E', 'nao'], ['side_ch3.mjs'], ['cinder_clue_order.mjs'], ['kiln_door.mjs'], ['shino_thanks.mjs'], ['kana_homophones.mjs'],
  full ? ['story_ch4.mjs'] : ['story_ch4.mjs', 'I', 'ren', 'go'],
  ['postgame_quests.mjs'], ['census_plaques.mjs'], ['ink_water.mjs'],
  full ? ['story_ch5.mjs'] : ['story_ch5.mjs', 'A', 'suzu'],
  ...(full ? [0, 1, 2, 3, 4].map((i) => ['story_ch6.mjs', String(i)]) : [['story_ch6.mjs', '2']]),
  ['atlas.check.mjs'],
  // the Hall of a Hundred Tales (P15): the card with its furigana, the chip, the sheet, the reprieve, suspend and resume
  ['hall.mjs'], ['hall_stairs.mjs'], ['hall_story_passages.mjs'], ['postgame.mjs'],
  // the travel volume's pages painted in the art pass (P16): every page through the volume's viewer at three sizes
  ['sequence_p16.mjs'],
  // AR-1: every illustrated shot at three sizes paints its whole frame, keeps held things within reach, draws cleanly
  ['sequence_art_integrity.mjs', '--quick'],
  // the companion ending extensions and The Pages We Keep (all four companions; captures to tests/e2e/out/pages)
  ['pages_ending.mjs'],
  // companionship: Company › Companion and Shared memories, invitations, reflections, rest (addendum §6–9, §19)
  ['company.mjs'],
  ['company_pets.mjs'],
  ['dialect_kansai.mjs'], // Suzu's optional Kansai-ben: the choice, Settings, Company › Suzu, word help, saves (docs/dialect/suzu_kansai.md)
  ['addendum_integration.mjs'],
  // overworld actors: idle life in each chapter, Wataru and Omi (both routes x 4 companions), one performed
  // scene per chapter (docs/expressive/GESTURES.md §9); actor_workplaces.mjs (5 x 45 s) runs on its own
  // (staging_chapters by chapter: whole, it outgrew one script's 40-minute limit)
  ['actor_life.mjs'], ...['showcase', '1', '2', '3', '4', '5', '6', 'misc'].map((c) => ['staging_chapters.mjs', '--ch=' + c]), ['staging_wataru.mjs'],
  // HX68: staged scenes started through the world from other sides, with tiles taken, actors absent, movement
  // interrupted, a key held, repeated and revisited; HX52: every illustrated sequence and the world agree (--full: all
  // branches and companions)
  full ? ['staging_variants.mjs'] : ['staging_variants.mjs', '--quick'],
  full ? ['sequence_world.mjs'] : ['sequence_world.mjs', '--quick'],
  // the two quest lines across the chapters (fixtures; --full adds all four
  // companions and a whole-game run with both lines as goals)
  full ? ['long_quests.mjs', '--all-companions'] : ['long_quests.mjs', '--fixtures-only'],
  // the long-quest landmarks redrawn, Masaru's bakery, the warehouse's missing floorboard, the
  // observatory's headroom: geometry and use tiles as recorded before, draw2, paths (World review WR-04/05)
  ['landmarks.mjs'],
  // the two deduction cases, the refined sequences and their keepsakes, Known Details (addendum §14.8–§18)
  ['cases.mjs'], ['cases_shots.mjs'], ['known.mjs'],
  ['pace.mjs'], // fishing pace: the optional response-entry clock, calibration, records (Practice addendum §7, §23.3)
  ['practice_b.mjs'], // practice suite B: letters, the Proofreader's Tray, One word two moments (docs/practice/suite_b.md)
  ['wordplay.mjs'], // companion shiritori: the table, records, bond and talk priority (docs/practice/wordplay.md)
  ['wordplay_layout.mjs'], // companion shiritori: layouts, four companions at the table, Japanese labels
  ['wordplay_records.mjs'], // companion shiritori: the saved-chain list's rows span their row (RBN-QA-168)
  ['practice_a_lamps.mjs'], ['practice_a_desk.mjs'], ['practice_a_layout.mjs'], // Practice suite A: lamps, writing desk, mementos (addendum §15, §16)
  // A Quiet Cast: the three fishing sites, a complete catch, repair, survey, reload, captures, layouts (practice addendum §5–§8)
  ['fishing.mjs'],
  // A Quiet Cast's coast (P15g): the two coast stations from the world, every coast situation on the stage, the six
  // fish observed, and a six-chapter journey keeping its three stations
  ['fishing_coast.mjs'],
  // painted Harmony busts: the contract v2 raster path with the SYNTHETIC sample (docs/harmony/contract/CONTRACT.md)
  ['harmony_raster.mjs'],
  ['harmony_appearance.mjs'], // HX66: every hairstyle, cut, accessory and keepsake on the painted kit; stress pairs; equip, unequip, save/load, slot switch
  ['portrait_dev.mjs'], // the portrait viewer (?dev=portraits): refused normally, sizes by the game's fit, no keys to the title
  // the expansion's own suites (P01–P15), each run at its phase end and gathered here at P17 so that a complete run
  // covers them: the world proof, the living world and its actions, the workshop, the records, the pastimes, the
  // Distractions tab, the pilot expedition and the Atlas's board, then the six new chapters, the sea and the ports
  ['world.mjs'], ['world_light.mjs'], ['world_slice.mjs'], ['world_living.mjs'], ['living_world.mjs'], ['return_hints.mjs'], ['settings_ledger_refresh.mjs'], ['verbs.mjs'], ['verbs_journey.mjs'], ['perform.mjs'], ['workshop.mjs'], ['records.mjs'], ['letters_order.mjs'], ['answer_order.mjs'], ['old_saves.mjs'],
  ['distractions.mjs'], ['hanafuda.mjs'], ['karuta.mjs'], ['shogi.mjs'], ['festival.mjs'], ['festival_games.mjs'], ['festival_help_pause.mjs'], ['expedition.mjs'], ['atlas_board.mjs'],
  ['manybridge.mjs'], ['manybridge2.mjs'], ['keepers.mjs'], ['licence.mjs'], ['sailing.mjs'], ['ports.mjs'], ['kotonoha.mjs'],
  ['cloudroad.mjs'], ['nakayama_inns.mjs'], ['cloud_sea.mjs'], ['ledge_horse.mjs'], ['courier_shelf.mjs'], ['jinpachi_letter.mjs'], ['leg2_boulder.mjs'], ['steamhollow.mjs'], ['playhouse_audience.mjs'], ['tsuneji_egg.mjs'], ['egg_recovery.mjs'], ['suzu_books_route.mjs'], ['zenroku_inquiry.mjs'], ['valve_line.mjs'], ['yn_guide.mjs'], ['archive12.mjs'],
  full ? ['matrix.mjs'] : ['pursue.mjs', 'E', 'mio'],
];
// --extra: the long functional checks kept out of the default run for their length (the battle addendum's creatures,
// geometry and invariance, the Harmony flourish, the illustrated sequences of Chapters 3–6, the animated portraits,
// the overworld figures, the audit fixes); P17's closure runs them once with `--extra`
if (process.argv.includes('--extra')) suites = [
  ['creatures_a.mjs'], ['battle_geometry.mjs'], ['battle_invariance.mjs'], ['harmony_cutin.mjs'], ['sequence_chapters.mjs'],
  ['sequence_chapters_56.mjs'], ['sequence_dev.mjs'], ['portrait_anim.mjs'], ['overworld_figures.mjs'], ['audit_fixes.mjs'],
];
// --skip=a.mjs,b.mjs leaves those scripts out; --part=k/n runs the k-th of n equal slices of what is left (a long
// suite split across several runs, e.g. under a time limit per run)
const skip = ((process.argv.find((a) => a.startsWith('--skip=')) || '').slice(7)).split(',').filter(Boolean);
if (skip.length) suites = suites.filter(([file]) => !skip.includes(file));
const part = (process.argv.find((a) => a.startsWith('--part=')) || '').slice(7);
if (part) {
  const [k, n] = part.split('/').map(Number);
  const size = Math.ceil(suites.length / n);
  suites = suites.slice((k - 1) * size, k * size);
}
// --list prints the scripts this selection would run, and runs none
if (process.argv.includes('--list')) { for (const [file, ...args] of suites) console.log([file, ...args].join(' ')); process.exit(0); }
// each script has a time limit (--limit=minutes, default 40): a script that hangs (waiting on a sheet nobody answers)
// is stopped and counted as failed instead of holding up the rest of the run
const limitMin = +((process.argv.find((a) => a.startsWith('--limit=')) || '').slice(8)) || 40;
const results = [];
for (const [file, ...args] of suites) {
  const t0 = Date.now();
  let timedOut = false;
  const code = await new Promise((resolve) => {
    const ch = spawn(process.execPath, [path.join(here, file), ...args], { stdio: 'inherit' });
    const timer = setTimeout(() => { timedOut = true; ch.kill('SIGKILL'); }, limitMin * 60000);
    ch.on('close', (c) => { clearTimeout(timer); resolve(c); });
  });
  const ok = code === 0 && !timedOut;
  results.push({ name: [file, ...args].join(' ') + (timedOut ? ' (stopped after ' + limitMin + ' min)' : ''), ok, s: Math.round((Date.now() - t0) / 1000) });
  console.log((ok ? '== PASS ' : '== FAIL ') + results[results.length - 1].name + ' (' + results[results.length - 1].s + ' s)\n');
}
console.log('\nSummary:');
for (const r of results) console.log('  ' + (r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + '  ' + r.s + ' s');
const failed = results.filter((r) => !r.ok).length;
console.log('\n' + (results.length - failed) + '/' + results.length + ' browser test scripts passed');
process.exit(failed ? 1 : 0);
