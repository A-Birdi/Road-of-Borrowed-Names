/* KS-1, continued: the six-chapter road's things that call themselves keepsakes. Seven are rewards the first edition
 * already gave (a ribbon, Mochi's bell, Asahi's glass earrings, Asa's straw hat, the ferry clerk's cap, the bell
 * fragment, Tsuzuri's bookmark) and one comes from the Koharuno road (the kakishibu tenugui); like the expansion's
 * fourteen (00_items.js) they were satchel items the catalogue never listed. Each entry names its item, so it is
 * recorded when the item is given (src/engine/05_state.js give(), for the journey being played) and on load for a save
 * that already holds it. The items themselves are unchanged. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const KS = C.keepsakes;
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const OUT = '#2a2024';
  const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); R(g, cx - w, cy + y, w * 2 + 1, 1, c); } };
  const shadow = (g, w) => R(g, 16 - (w >> 1), 28, w, 1, 'rgba(0,0,0,0.22)');
  const item = (id) => C.items[id] || { name: { jp: id, en: id } };
  const def = (id, d) => { KS[id] = Object.assign({ id, item: id, name: item(id).name }, d); };
  const QUEST = (id) => ({ kind: 'quest', id });

  def('rw_ribbon', {
    region: 'reedwake', source: QUEST('rw_tools'),
    desc: { en: 'The end of a ribbon Kiku wove long ago, its colour faded. Her thank-you for bringing back her shuttle.' },
    how: { en: 'Given by Kiku when her borrowed shuttle came home.' },
    hint: { broad: { en: 'In Reedwake, borrowed tools are waiting to go home.' }, specific: { en: 'Return what was borrowed from Kiku, the weaver.' } },
    art(g) {
      shadow(g, 20);
      R(g, 13, 10, 6, 6, OUT); R(g, 14, 11, 4, 4, '#b84a5a'); // the knot
      for (let i = 0; i < 7; i++) { R(g, 6 + i, 8 + (i >> 1), 7 - i, 2, OUT); R(g, 7 + i, 9 + (i >> 1), 6 - i, 1, '#d06878'); R(g, 19, 8 + (i >> 1), 7 - i, 2, OUT); R(g, 19, 9 + (i >> 1), 6 - i, 1, '#d06878'); }
      R(g, 12, 16, 3, 11, OUT); R(g, 13, 16, 1, 10, '#c05a6a'); R(g, 17, 16, 3, 9, OUT); R(g, 18, 16, 1, 8, '#c05a6a');
      R(g, 9, 10, 2, 1, '#e8a0a8'); R(g, 21, 10, 2, 1, '#e8a0a8');
    },
  });
  def('rw_catbell', {
    region: 'reedwake', source: QUEST('rw_mochi'),
    desc: { en: 'Mochi\'s old bell, still on its red cord.' },
    how: { en: 'Given when Mochi the cat was found and brought home.' },
    hint: { broad: { en: 'Someone in Reedwake is missing a small, furry friend.' }, specific: { en: 'Help find Mochi, the cat who wandered off.' } },
    art(g) {
      shadow(g, 16);
      for (let x = 5; x <= 27; x++) { const y = 9 + Math.round(Math.sin((x - 5) / 22 * Math.PI) * 6); R(g, x, y, 1, 2, '#b8302a'); }
      disc(g, 16, 19, 6, OUT); disc(g, 16, 19, 5, '#d8b040'); R(g, 13, 16, 3, 2, '#f4e08a');
      R(g, 11, 20, 11, 1, OUT); R(g, 15, 21, 2, 3, OUT); R(g, 14, 13, 4, 1, '#8a6a20');
    },
  });
  def('sg_glass_earrings', {
    region: 'saltglass', source: QUEST('sg_seaglass'),
    desc: { en: 'Asahi\'s thank-you: two drops of frosted blue glass from the glassworks.' },
    how: { en: 'Given by Asahi when the sea-glass nameplate reached Fuku.' },
    hint: { broad: { en: 'Saltglass\'s glassworks owe someone a favour.' }, specific: { en: 'Gather blue sea glass for Asahi and help name Fuku\'s husband\'s boat.' } },
    art(g) {
      shadow(g, 18);
      for (const cx of [11, 21]) {
        R(g, cx, 5, 1, 5, '#c8ccd4'); R(g, cx + 1, 4, 2, 1, '#c8ccd4');
        for (let y = 10; y < 24; y++) { const w = Math.round(Math.sin((y - 10) / 14 * Math.PI) * 4 + (y > 17 ? 1 : 0)); R(g, cx - w - 1, y, w * 2 + 3, 1, OUT); R(g, cx - w, y, w * 2 + 1, 1, y < 15 ? '#9ac8e4' : '#6aa4cc'); }
        R(g, cx - 2, 13, 1, 3, '#e4f2fa');
      }
    },
  });
  def('co_straw_hat', {
    region: 'cinder', source: QUEST('co_signs'),
    desc: { en: 'Asa\'s spare straw hat, from the terraces above Cinder Orchard.' },
    how: { en: 'Given by Asa when the terraces\' signposts could be read again.' },
    hint: { broad: { en: 'On Cinder Orchard\'s terraces, the way has been lost.' }, specific: { en: 'Help Asa write the terrace signposts again.' } },
    art(g) {
      shadow(g, 26);
      R(g, 3, 19, 26, 4, OUT); R(g, 4, 20, 24, 2, '#e0c070');
      disc(g, 16, 17, 7, OUT); disc(g, 16, 17, 6, '#e8cc80'); R(g, 9, 17, 15, 3, '#e0c070');
      R(g, 9, 18, 15, 2, '#a83a2a'); // the band
      for (let x = 5; x < 28; x += 3) R(g, x, 21, 1, 1, '#b0904a');
      for (let x = 11; x < 22; x += 3) R(g, x, 13, 1, 1, '#c8a858');
    },
  });
  def('lf_ferry_cap', {
    region: 'lanternfall', source: QUEST('lf_timetable'),
    desc: { en: 'A spare ferry clerk\'s cap from Umi\'s office, navy with a brass badge. It makes people ask you when the next boat leaves.' },
    how: { en: 'Given at the ferry office once Tsuya knew which boat really leaves.' },
    hint: { broad: { en: 'Someone in Lanternfall waits every day for a boat.' }, specific: { en: 'Read the ferry timetable and tell Tsuya when a boat really runs.' } },
    art(g) {
      shadow(g, 22);
      for (let y = -9; y <= 0; y++) { const w = Math.floor(Math.sqrt(81 - y * y)); R(g, 16 - w, 16 + y, w * 2 + 1, 1, OUT); if (y > -9) { const v = Math.floor(Math.sqrt(64 - y * y)); R(g, 16 - v, 16 + y, v * 2 + 1, 1, '#2c4468'); } }
      R(g, 6, 17, 21, 3, OUT); R(g, 7, 17, 19, 2, '#22364f');
      R(g, 4, 20, 20, 3, OUT); R(g, 5, 20, 18, 2, '#1a2a40'); // the peak
      R(g, 14, 11, 5, 4, OUT); R(g, 15, 12, 3, 2, '#d8b04a'); // the badge
      R(g, 10, 9, 4, 1, '#4a6a94');
    },
  });
  def('lf_bell_shard', {
    region: 'lanternfall', source: { kind: 'encounter', id: 'lf.keeper' },
    desc: { en: 'A chip of bronze from the drowned bell. It seems to hum faintly when someone near you is about to say no.' },
    how: { en: 'Left behind when the drowned bell\'s keeper settled.' },
    hint: { broad: { en: 'Under Lanternfall\'s lake, something guards the old bell.' }, specific: { en: 'Settle the keeper of the drowned bell in the tower.' } },
    art(g) {
      shadow(g, 16);
      const pts = [[9, 10], [20, 6], [25, 15], [19, 25], [8, 21]];
      for (let y = 6; y <= 25; y++) {
        let xs = [];
        for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; if ((y >= Math.min(y1, y2)) && (y < Math.max(y1, y2))) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1)); }
        xs.sort((a, b) => a - b);
        if (xs.length >= 2) { const a = Math.round(xs[0]), b = Math.round(xs[xs.length - 1]); R(g, a - 1, y, b - a + 2, 1, OUT); R(g, a, y, Math.max(0, b - a), 1, y < 12 ? '#b89a4a' : '#8a6a32'); }
      }
      R(g, 13, 11, 5, 1, '#e0c878'); R(g, 11, 17, 1, 4, '#5a8a6a'); R(g, 19, 19, 2, 1, '#5a8a6a'); // the shine, the patina
    },
  });
  def('sa_bookmark', {
    region: 'archive_road', source: QUEST('sa_clerk'),
    desc: { en: 'A bookmark of pale card with a red thread, given by Tsuzuri. Its job is to keep a place between pages.' },
    how: { en: 'Given by the catalogue clerk, once it had its name.' },
    hint: { broad: { en: 'In the Still Archive, someone has been waiting for a name.' }, specific: { en: 'Find Master Ushio\'s notes and bring them to the clerk in the Reading Room.' } },
    art(g) {
      shadow(g, 12);
      R(g, 11, 3, 10, 23, OUT); R(g, 12, 4, 8, 21, '#f0e8d4');
      R(g, 14, 7, 4, 4, OUT); R(g, 15, 8, 2, 2, '#f0e8d4'); // the hole
      for (let y = 13; y < 23; y += 3) R(g, 13, y, 6, 1, '#c8bca0');
      R(g, 16, 11, 1, 14, '#b8302a'); R(g, 15, 25, 1, 3, '#b8302a'); R(g, 17, 25, 1, 3, '#b8302a'); // the thread
    },
  });
  def('lq_tenugui', {
    region: 'reedwake', ed: 2, source: { kind: 'quest', id: 'lq_road' },
    desc: { en: 'A cotton cloth dyed with kakishibu, the brown-orange dye made from unripe persimmons, from the tree-keeper\'s chest in Koharuno.' },
    how: { en: 'Found in the tree-keeper\'s chest when the road to Koharuno came back.' },
    hint: { broad: { en: 'Across Reedwake\'s river, a road\'s name has faded.' }, specific: { en: 'Bring back the road to Koharuno and look in the tree-keeper\'s house.' } },
    art(g) {
      shadow(g, 24);
      R(g, 4, 9, 24, 15, OUT); R(g, 5, 10, 22, 13, '#b8642a');
      for (let x = 5; x < 27; x += 4) R(g, x, 10, 2, 13, '#a4561f');
      R(g, 5, 15, 22, 2, '#d08a4a'); // the fold
      for (let x = 6; x < 27; x += 2) { R(g, x, 24, 1, 2, '#b8642a'); R(g, x, 7, 1, 2, '#b8642a'); }
      disc(g, 21, 19, 2, '#e8a050'); R(g, 21, 16, 1, 1, '#5a7a3a'); // a persimmon mark
    },
  });
})(RB.content);
