// A map without a song of its own (Robin, 2026-10-19: "Loading into an area that doesn't set the BGM will retain the
// currently playing / previous BGM, such as the Title Screen theme when loading into the Lantern Hall"), in Chromium
// on the built game, audio initialised (as after a click):
//  - coming into the world there from the title (a new journey's start, a load) plays the song of the place it opens
//    onto (the Lantern Hall: Reedwake's), not the title's;
//  - a load there while another place's song plays does the same;
//  - walking in from its village keeps the village's song, as before; a song a scene asked for is kept, as before.
// Usage: node tools/build.mjs && node tests/e2e/music_inherit.mjs
import { serve, launch, page } from './lib.mjs';

const { srv, url } = await serve();
const b = await launch();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('ok  ', m); } else { fail++; console.log('FAIL', m); } };

const { p, errors } = await page(b, url, { viewport: { width: 1280, height: 800 } });
const r = await p.evaluate(async () => {
  await RB.audio.init();
  const out = {};
  const start = (map, x, y) => RB.game.debugStart(map, x, y, { comp: 'nao', edition: RB.edition.forNew() });
  RB.audio.playSong('title');
  out.title = RB.audio.currentSong();
  start('rw.hall', 8, 10);
  out.hallFromTitle = RB.audio.currentSong();
  out.hallOwn = RB.world.musicFor(RB.world.W.map.def, RB.game.s);
  start('sg.harbor', 30, 20);
  out.harbor = RB.audio.currentSong();
  start('rw.tea', 4, 6);
  out.teaLoadedFromHarbor = RB.audio.currentSong();
  // walking: the village's song, then into the hall (an ordinary entry keeps what plays)
  start('rw.village', 24, 19);
  out.village = RB.audio.currentSong();
  RB.world.enter('rw.hall', 8, 10, 'up');
  out.hallWalked = RB.audio.currentSong();
  // a song a scene asked for, then into a map without one: kept
  RB.audio.playSong('mystery');
  RB.world.enter('rw.tea', 4, 6, 'up');
  out.sceneSongKept = RB.audio.currentSong();
  return out;
});
ok(r.title === 'title', 'the title\'s song plays: ' + r.title);
ok(r.hallOwn === null, 'the Lantern Hall has no song of its own');
ok(r.hallFromTitle === 'reedwake', 'from the title into the Lantern Hall: Reedwake\'s song, not the title\'s: ' + r.hallFromTitle);
ok(r.harbor && r.harbor !== 'reedwake', 'Saltglass\'s harbour plays its own: ' + r.harbor);
ok(r.teaLoadedFromHarbor === 'reedwake', 'loaded into the teahouse while the harbour\'s song played: Reedwake\'s: ' + r.teaLoadedFromHarbor);
ok(r.village === 'reedwake' && r.hallWalked === 'reedwake', 'walked in from the village: its song goes on: ' + r.hallWalked);
ok(r.sceneSongKept === 'mystery', 'a song a scene asked for is kept into a map without one: ' + r.sceneSongKept);
ok(!errors.length, 'no page errors: ' + errors.join(' | '));
console.log(pass + ' passed, ' + fail + ' failed');
await b.close(); srv.close();
process.exit(fail ? 1 : 0);
