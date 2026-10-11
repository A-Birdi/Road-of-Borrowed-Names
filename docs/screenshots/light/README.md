# Light and shadow on every map (C-86): captures for review

Made by `node tests/e2e/light_captures.mjs` from the built `index.html` (synthetic sessions). Status: implemented
provisionally, internally reviewed (AC-1); Robin's review at completion.

`c01`…`c12` name the chapter of the twelve-chapter journey a place belongs to; `pg` the postgame.

- `cNN_..`: outdoors, one or two maps per region, each under its own sun (SUNS in `src/engine/65_worldlook.js`)
  with the regional kit's ground dressing; `pg_hall_wing_one_lamps`: a dark wing, lit by its lamps.
- `room_..`: rooms: daylight through the windows their building has outside, lamps, hearths and stoves; dark
  places (the kiln, the mill) by their own lamps inside the game's darkness.
- `night_..`: two nights: no sun, the lamps cast the shadows.
- `off_..`: the same places with Settings → "Light and shadow" Off (the flat picture, as the game was).
- `wide_..`: the wider outdoor view on a 1920×1080 screen (30 tiles across; the game's own is 20).
- `phone_..`: a phone (390×844 at 3×), which keeps the game's own view.

## Files

- `c01_reedwake_village.webp`
- `c01_reedwake_road.webp`
- `c02_saltglass_harbour.webp`
- `c09_east_landing.webp`
- `c03_manybridge_exchange.webp`
- `c04_blockprint_row.webp`
- `c05_cinder_orchard_village.webp`
- `c05_cinder_orchard_terraces.webp`
- `c06_snowbell_hamlet.webp`
- `c07_keepers_road_foot.webp`
- `c08_lanternfall_town.webp`
- `c09_kotonoha_village.webp`
- `c09_sazanami_hamlet.webp`
- `c09_the_sea.webp`
- `c10_cloudroad_sakashita.webp`
- `c10_cloudroad_oiwake.webp`
- `c10_above_the_clouds_kumoi.webp`
- `c11_steamhollow_upper.webp`
- `c12_archive_mountain_road.webp`
- `c12_still_archive_gate.webp`
- `pg_ashihara_shinden.webp`
- `pg_hall_wing_six.webp`
- `pg_hall_wing_one_lamps.webp`
- `room_c01_reedwake_teahouse.webp`
- `room_c01_reedwake_lantern_hall.webp`
- `room_c01_reedwake_mill.webp`
- `room_c02_saltglass_inn.webp`
- `room_c03_manybridge_inn.webp`
- `room_c04_playhouse_theatre.webp`
- `room_c05_cinder_orchard_kiln.webp`
- `room_c06_snowbell_inn.webp`
- `room_c07_keepers_lodge.webp`
- `room_c08_lanternfall_inn.webp`
- `room_c09_kotonoha_lodge.webp`
- `room_c10_cloudroad_inn.webp`
- `room_c11_steamhollow_kami_inn.webp`
- `room_pg_hall_foyer.webp`
- `night_c01_reedwake_village.webp`
- `night_c05_cinder_orchard_festival.webp`
- `off_c10_cloudroad_sakashita.webp`
- `off_c01_reedwake_teahouse.webp`
- `off_c01_reedwake_village.webp`
- `wide_c10_cloudroad_sakashita_1920.webp`
- `phone_c10_cloudroad_sakashita.webp`
- `phone_c01_reedwake_teahouse.webp`
