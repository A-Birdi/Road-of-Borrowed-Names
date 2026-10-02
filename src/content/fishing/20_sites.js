/* A Quiet Cast — the three sites (Practice addendum §5.2), placed in existing
 * maps only. Each station is a small marker where the player stands facing
 * water; it appears with the postgame (`post`). The tiles were chosen from
 * the maps' compiled geometry (docs/practice/fishing.md shows each one and
 * why it blocks no path or story prop):
 *
 *   fish.reedwake.current  rw.village  stand (33,20) facing east; station (34,20)
 *        One reed tuft of the west bank's reed line (a blocked tile) becomes the
 *        station's plank step (still a blocked tile); before the postgame the
 *        tuft stands there as before. Below the bridge, five tiles up the bank
 *        from Yasu's pier.
 *   fish.reedwake.quiet    rw.road     stand (15,7) facing north; station (15,6)
 *        A stake in the shallows of the reed-ended pond beside the Lantern Road
 *        (a water tile: nothing walkable changes).
 *   fish.saltglass.harbor  sg.harbor   stand (27,28) facing south; station (27,29)
 *        A stake at the foot of the quay wall, between the two piers (a water
 *        tile: nothing walkable changes).
 *
 * Patches: three readable casting choices per site; the fish list of a patch
 * is fixed data. `at` is where the patch lies on the waterside stage (0..1 of
 * its width and height). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (F, C) {
  'use strict';
  F.addSite({
    id: 'fish.reedwake.current', map: 'rw.village', region: 'reedwake', dress: 'river', station: { x: 34, y: 20 }, stand: { x: 33, y: 20, dir: 'right' },
    name: { jp: '{葦|あし}ノ{瀬|せ} の {川岸|かわぎし}', en: 'Reedwake riverbank' },
    where: { jp: '{橋|はし} の {下流|かりゅう} 、 ヤス の {桟橋|さんばし} の {少|すこ}し {上|うえ}', en: 'Below the bridge, a little up the bank from Yasu\'s pier' },
    view: { en: 'You face east across the river. Upstream, on your left, the bridge; across the water, the far bank\'s reeds and trees.' },
    species: ['oikawa', 'kawamutsu', 'ugui'],
    patches: [
      { id: 'open', name: { jp: '{流|なが}れ の {真|ま}ん{中|なか}', en: 'Open current' }, desc: { en: 'Out in the middle, where the river runs fastest.' }, fish: ['oikawa', 'ugui'], at: [0.6, 0.47] },
      { id: 'edge', name: { jp: '{流|なが}れ の {縁|ふち}', en: 'Current edge' }, desc: { en: 'Where the quick water meets the slower water near your bank.' }, fish: ['kawamutsu', 'oikawa'], at: [0.78, 0.66] },
      { id: 'shade', name: { jp: '{木陰|こかげ} の {岸|きし}', en: 'Shaded bank' }, desc: { en: 'In the shade of the trees on the far bank.' }, fish: ['kawamutsu'], at: [0.4, 0.34] },
    ],
  });
  F.addSite({
    id: 'fish.reedwake.quiet', map: 'rw.road', region: 'reedwake', dress: 'pond', station: { x: 15, y: 6 }, stand: { x: 15, y: 7, dir: 'up' },
    name: { jp: '{灯|ひ}の{道|みち} の {池|いけ}', en: 'The pond by the Lantern Road' },
    where: { jp: '{葦|あし}ノ{瀬|せ} の {西|にし} 、 {灯|ひ}の{道|みち} の {北|きた} が わ', en: 'West of Reedwake, on the north side of the Lantern Road' },
    view: { en: 'You face north over a small still pond. Reeds close it in at both ends; trees stand beyond it.' },
    species: ['ginbuna', 'koi', 'motsugo'],
    patches: [
      { id: 'open', name: { jp: '{広|ひろ}い {水面|すいめん}', en: 'Open quiet water' }, desc: { en: 'The open middle of the pond.' }, fish: ['koi', 'ginbuna'], at: [0.6, 0.48] },
      { id: 'reeds', name: { jp: '{葦|あし} の きわ', en: 'Reed edge' }, desc: { en: 'Close to the reeds at the pond\'s end.' }, fish: ['motsugo', 'ginbuna'], at: [0.8, 0.58] },
      { id: 'shade', name: { jp: '{日陰|ひかげ} の {浅|あさ}い ところ', en: 'Shaded shallows' }, desc: { en: 'The shallow far margin, in the trees\' shade.' }, fish: ['motsugo'], at: [0.42, 0.34] },
    ],
  });
  F.addSite({
    id: 'fish.saltglass.harbor', map: 'sg.harbor', region: 'saltglass', dress: 'harbor', station: { x: 27, y: 29 }, stand: { x: 27, y: 28, dir: 'down' },
    name: { jp: '{潮|しお}{硝子|がらす} の {波止場|はとば}', en: 'Saltglass quay' },
    where: { jp: '{二|ふた}つ の {桟橋|さんばし} の {間|あいだ} 、 {岸壁|がんぺき} の {下|した}', en: 'At the foot of the quay wall, between the two piers' },
    view: { en: 'You face out over the harbour. A pier runs out on either side; beyond them is open water.' },
    species: ['mahaze', 'bora', 'maaji'],
    patches: [
      { id: 'inner', name: { jp: '{港|みなと} の {内側|うちがわ}', en: 'Inner harbour' }, desc: { en: 'The sheltered water between the piers.' }, fish: ['bora', 'mahaze'], at: [0.58, 0.5] },
      { id: 'shallows', name: { jp: '{底|そこ} の {見|み}える {浅瀬|あさせ}', en: 'Near-bottom shallows' }, desc: { en: 'Along the quay wall, where the bottom shows.' }, fish: ['mahaze'], at: [0.78, 0.7] },
      { id: 'outer', name: { jp: '{沖|おき} の ほう', en: 'Outer water' }, desc: { en: 'Out past the pier heads.' }, fish: ['maaji', 'bora'], at: [0.46, 0.3] },
    ],
  });

  // ---- placement in the maps (the pattern of src/content/lq/20_maps.js) ------------------------------------
  const setTiles = (map, cells) => {
    const rows = C.maps[map].terrain.slice();
    for (const [x, y, ch] of cells) rows[y] = rows[y].slice(0, x) + ch + rows[y].slice(x + 1);
    C.maps[map].terrain = rows;
  };
  const addProps = (map, props) => { C.maps[map].props = (C.maps[map].props || []).concat(props); };
  // the reed tuft at (34,20) stays a reed tuft until the postgame; then the station stands there (blocked either way)
  setTiles('rw.village', [[34, 20, '.']]);
  addProps('rw.village', [
    { p: 'reeds', x: 34, y: 20, if: '!post' },
    { p: 'fish_station', x: 34, y: 20, o: { kind: 'river' }, scene: 'fish.station.current', if: 'post' },
  ]);
  addProps('rw.road', [{ p: 'fish_station', x: 15, y: 6, o: { kind: 'pond' }, scene: 'fish.station.quiet', if: 'post' }]);
  addProps('sg.harbor', [{ p: 'fish_station', x: 27, y: 29, o: { kind: 'quay' }, scene: 'fish.station.harbor', if: 'post' }]);

  // ---- Yasu (preserving his routing and conversations) -----------------------------------------------------------
  // Two lines are put just before his ordinary postgame line, so his long-quest
  // conversations (src/content/lq, which load later and go first) keep priority.
  // The introduction plays his usual line first, then asks the favour once; the
  // thanks plays once after the survey is complete. While he waits by the far
  // bank's lantern (lq_road stage 4) the station's signed note introduces it.
  const yasu = (C.maps['rw.village'].npcs || []).find((n) => n.id === 'yasu');
  if (yasu && Array.isArray(yasu.talk)) {
    const i = yasu.talk.findIndex((t) => t.scene === 'rw.yasu_post');
    const add = [{ if: 'post&!fish.intro', scene: 'fish.yasu_intro' }, { if: 'post&fish.survey&!seen.fish.yasu_thanks', scene: 'fish.yasu_thanks' }];
    yasu.talk.splice(i >= 0 ? i : 0, 0, ...add);
  }

  // ---- the station marker (map art) -------------------------------------------------------------------------------
  const P = RB.props && RB.props.P;
  if (P) {
    P.fish_station = { id: 'fish_station', w: 1, h: 1, block: true, draw(c, x, y) { c.fillStyle = '#7a5a36'; c.fillRect(x + 7, y + 2, 2, 12); c.fillStyle = '#efe4c8'; c.fillRect(x + 9, y + 4, 4, 3); } };
  }
  if (RB.propArt && RB.propKit && P) {
    const K = RB.propKit, kit = RB.propArt.kit;
    const { R, ell, mix } = K;
    const PP = K.FIX.paper, IR = K.FIX.iron;
    RB.propArt.art('fish_station', {
      box: [-8, -30, 48, 64], ink: true,
      v: (o) => (o.kind || 'river'),
      draw(g, M, v) {
        const w5 = M.wood, rd = M.reed, wt = M.water;
        if (v === 'river') {
          // two planks laid out over the reed line to the water's edge, reeds on either side
          for (let k = 0; k < 2; k++) { R(g, 2, 12 + k * 8, 30, 6, w5[2 + k]); R(g, 2, 12 + k * 8, 30, 1, w5[4]); R(g, 2, 17 + k * 8, 30, 1, w5[1]); }
          for (const x of [0, 4, 27, 31]) { R(g, x, 2, 2, 12, rd[2]); R(g, x, 0, 1, 4, rd[3]); }
        } else {
          // the stake stands in the shallows: a ring of rippled water round its foot
          ell(g, 16, 27, 9, 3, mix(wt[2], '#ffffff', 0.35));
          ell(g, 16, 27, 6, 2, wt[1]);
        }
        // the survey stake, a tied paper note, and (at the quay) an iron ring
        kit.post(g, 13, -22, 5, v === 'river' ? 36 : 48, w5);
        R(g, 12, -23, 7, 2, w5[4]);
        R(g, 18, -14, 9, 11, PP[3]); R(g, 18, -14, 9, 1, PP[4]); R(g, 26, -13, 1, 10, PP[1]); R(g, 18, -4, 9, 1, PP[1]);
        for (let k = 0; k < 3; k++) R(g, 20, -11 + k * 3, 5 - (k & 1), 1, '#3c3450');
        R(g, 17, -13, 2, 1, '#b8342a'); // the cord that ties it
        if (v === 'quay') { R(g, 9, -6, 4, 4, IR[2]); R(g, 10, -5, 2, 2, IR[0]); }
        if (v === 'pond') { R(g, 9, 6, 3, 1, rd[2]); R(g, 21, 8, 3, 1, rd[2]); }
      },
      shadow: (v) => (v === 'river' ? [16, 28, 14, 3, 0.25] : null),
    });
  }
})(RB.fishing, RB.content);
