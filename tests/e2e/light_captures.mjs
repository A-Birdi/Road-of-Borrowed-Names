// Captures of light and shadow on every region (C-86; src/engine/65_worldlook.js), for Robin's review: one or two
// outdoor maps per region of the twelve chapters and the postgame, rooms lit by their windows, lamps and fires,
// two nights, the same places with "Light and shadow" Off beside them, the wider outdoor view on a 1920×1080 screen
// and a phone. Synthetic sessions (never a real save); the arrival scenes are passed and creatures held off so the
// place itself shows (each from the middle of the map unless a place is named). Writes WebP files and an index to docs/screenshots/light/.
// Usage: node tests/e2e/light_captures.mjs
import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, page, root } from './lib.mjs';

const OUT = path.join(root, 'docs/screenshots/light');
fs.mkdirSync(OUT, { recursive: true });
const { srv, url } = await serve();
const b = await launch();
const written = [];
// every chapter's story so far, so each place shows as a traveller arriving finds it
const DONE = { departed: true, ch1_done: true, sg_arrived: true, ch2_done: true, mb1_done: true, mb2_done: true, ch3_done: true, ch4_done: true, kr_done: true, ch5_done: true, ko_done: true, cr_called: true };

async function webp(p, png, file) {
  const data = await p.evaluate(async (b64) => {
    const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode();
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight;
    c.getContext('2d').drawImage(i, 0, 0);
    return c.toDataURL('image/webp', 0.9);
  }, png.toString('base64'));
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data.split(',')[1], 'base64'));
  written.push(file);
}
// [file, map, x, y, extra flags, light on?]
async function shoot(set, viewport, opts) {
  opts = opts || {};
  const { p, ctx, errors } = await page(b, url, { viewport, dpr: opts.dpr, mobile: opts.mobile, touch: opts.mobile });
  for (const [file, map, x, y, extra, light] of set) {
    await p.evaluate(([map, x, y, extra, light, DONE]) => {
      const def = RB.content.maps[map], m = RB.maps.compile(map);
      let X = x, Y = y;
      if (X == null) {
        // the middle of the map where one can stand (it frames the place better than an arrival at its edge)
        const sp = def.spawn || {}, k = Object.keys(sp)[0];
        [X, Y] = k && Array.isArray(sp[k]) ? sp[k] : [m.w >> 1, m.h >> 1];
        const cx = m.w >> 1, cy = m.h >> 1;
        search: for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
          if (!RB.maps.blockedStatic(m, cx + dx, cy + dy) && !RB.maps.exitAt(m, cx + dx, cy + dy)) { X = cx + dx; Y = cy + dy; break search; }
      }
      const f = Object.assign({}, DONE, extra || {});
      for (const ev of def.onEnter || []) f['enter:' + map + ':' + ev.scene] = true;
      RB.game.settings.worldLight = light !== false;
      RB.game.applySettings();
      const s = RB.game.debugStart(map, X, Y, { comp: 'nao', flags: f, dir: 'down' });
      s.edition = 2;
      RB.world.W.quietUntil = 1e15;
    }, [map, x == null ? null : x, y == null ? null : y, extra || null, light, DONE]);
    for (let i = 0; i < 200 && await p.evaluate(() => RB.ui.dialogue.isOpen()); i++) { await p.evaluate(() => RB.ui.dialogue.advance(true)); await p.waitForTimeout(30); }
    await p.waitForTimeout(1500);
    await webp(p, await p.screenshot(), file);
  }
  if (errors.length) console.log('page errors: ' + errors.join('; '));
  await ctx.close();
}
const DESK = { width: 1440, height: 900 };
// outdoors: each region under its own sun, in chapter order, then the postgame
await shoot([
  ['c01_reedwake_village.webp', 'rw.village', 22, 18],
  ['c01_reedwake_road.webp', 'rw.road'],
  ['c02_saltglass_harbour.webp', 'sg.harbor'],
  ['c09_east_landing.webp', 'el.landing'],
  ['c03_manybridge_exchange.webp', 'mb.exchange'],
  ['c04_blockprint_row.webp', 'mp.blockprint'],
  ['c05_cinder_orchard_village.webp', 'co.village'],
  ['c05_cinder_orchard_terraces.webp', 'co.terraces'],
  ['c06_snowbell_hamlet.webp', 'sb.hamlet'],
  ['c07_keepers_road_foot.webp', 'kr.foot'],
  ['c08_lanternfall_town.webp', 'lf.town'],
  ['c09_kotonoha_village.webp', 'ko.village'],
  ['c09_sazanami_hamlet.webp', 'sz.hamlet'],
  ['c09_the_sea.webp', 'sea.coast'],
  ['c10_cloudroad_sakashita.webp', 'cr.sakashita', 12, 14],
  ['c10_cloudroad_oiwake.webp', 'cr.oiwake'],
  ['c10_above_the_clouds_kumoi.webp', 'cr.kumoi'],
  ['c11_steamhollow_upper.webp', 'yn.upper'],
  ['c12_archive_mountain_road.webp', 'sa.road'],
  ['c12_still_archive_gate.webp', 'sa.gate'],
  ['pg_ashihara_shinden.webp', 'as.village'],
  ['pg_hall_wing_six.webp', 'hall.w6f1'],
  ['pg_hall_wing_one_lamps.webp', 'hall.w1f1'],
], DESK);
// rooms: daylight through the building's own windows, lamps, hearths and stoves; dark places by their lamps
await shoot([
  ['room_c01_reedwake_teahouse.webp', 'rw.tea'],
  ['room_c01_reedwake_lantern_hall.webp', 'rw.hall'],
  ['room_c01_reedwake_mill.webp', 'rw.mill1'],
  ['room_c02_saltglass_inn.webp', 'sg.inn'],
  ['room_c03_manybridge_inn.webp', 'mb.inn'],
  ['room_c04_playhouse_theatre.webp', 'mp.theatre'],
  ['room_c05_cinder_orchard_kiln.webp', 'co.kiln'],
  ['room_c06_snowbell_inn.webp', 'sb.inn'],
  ['room_c07_keepers_lodge.webp', 'kr.lodge_in'],
  ['room_c08_lanternfall_inn.webp', 'lf.inn'],
  ['room_c09_kotonoha_lodge.webp', 'ko.lodge'],
  ['room_c10_cloudroad_inn.webp', 'cr.saka_inn'],
  ['room_c11_steamhollow_kami_inn.webp', 'yn.kami'],
  ['room_pg_hall_foyer.webp', 'hall.foyer'],
], DESK);
// nights, and the same places with the light Off (the flat picture, as before)
await shoot([
  ['night_c01_reedwake_village.webp', 'rw.village', 22, 18, { rw_night: true }],
  ['night_c05_cinder_orchard_festival.webp', 'co.festival'],
  ['off_c10_cloudroad_sakashita.webp', 'cr.sakashita', 12, 14, null, false],
  ['off_c01_reedwake_teahouse.webp', 'rw.tea', null, null, null, false],
  ['off_c01_reedwake_village.webp', 'rw.village', 22, 18, null, false],
], DESK);
// the wider outdoor view where a screen allows it (30 tiles at 1920×1080); a phone keeps the game's own view
await shoot([['wide_c10_cloudroad_sakashita_1920.webp', 'cr.sakashita', 12, 14]], { width: 1920, height: 1080 });
await shoot([['phone_c10_cloudroad_sakashita.webp', 'cr.sakashita', 12, 14], ['phone_c01_reedwake_teahouse.webp', 'rw.tea']], { width: 390, height: 844 }, { dpr: 3, mobile: true });

const lines = ['# Light and shadow on every map (C-86): captures for review', '',
  'Made by `node tests/e2e/light_captures.mjs` from the built `index.html` (synthetic sessions). Status: implemented',
  'provisionally, internally reviewed (AC-1); Robin\'s review at completion.', '',
  '`c01`…`c12` name the chapter of the twelve-chapter journey a place belongs to; `pg` the postgame.', '',
  '- `cNN_..`: outdoors, one or two maps per region, each under its own sun (SUNS in `src/engine/65_worldlook.js`)',
  '  with the regional kit\'s ground dressing; `pg_hall_wing_one_lamps`: a dark wing, lit by its lamps.',
  '- `room_..`: rooms: daylight through the windows their building has outside, lamps, hearths and stoves; dark',
  '  places (the kiln, the mill) by their own lamps inside the game\'s darkness.',
  '- `night_..`: two nights: no sun, the lamps cast the shadows.',
  '- `off_..`: the same places with Settings → "Light and shadow" Off (the flat picture, as the game was).',
  '- `wide_..`: the wider outdoor view on a 1920×1080 screen (30 tiles across; the game\'s own is 20).',
  '- `phone_..`: a phone (390×844 at 3×), which keeps the game\'s own view.', '', '## Files', ''];
for (const f of written) lines.push('- `' + f + '`');
fs.writeFileSync(path.join(OUT, 'README.md'), lines.join('\n') + '\n');
console.log(written.length + ' captures in docs/screenshots/light/');
await b.close(); srv.close();
