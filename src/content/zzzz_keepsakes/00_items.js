/* Roadside Keepsakes for the twelve-chapter road (KS-1, Robin 2026-10-14: "there are only 6 Keepsakes still? We've
 * added much more content to allow more Keepsakes"). The expansion gave fourteen things it calls keepsakes (the nine
 * old guardians' gifts, the iroha print, the tide-stone rubbing, the "Fish Street" name slip, the Lantern of the
 * Hundred and the planting hat) as satchel items only; the catalogue (src/ui/58_keepsakes.js) never listed them.
 * Here each becomes a catalogue entry naming its item (`item`): RB.discovery.fromItem records it when a scene gives
 * the item (src/engine/70_script.js `!give`), and a save that already holds it has it recorded on load (below), so
 * nothing found before this change is lost. The items themselves are unchanged (what they do, where they come from).
 * The new chapters' own Roadside Keepsakes are in the files after this one. Every entry here is twelve-chapter
 * (`ed: 2`): the guardians, the Hall and Ashihara Shinden belong to it. */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const KS = C.keepsakes;
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const OUT = '#2a2024';
  // a filled disc on the pixel grid (crisp: whole pixels only)
  const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); R(g, cx - w, cy + y, w * 2 + 1, 1, c); } };
  const ring = (g, cx, cy, r, c) => { for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2; R(g, Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), 1, 1, c); } };
  const shadow = (g, w) => R(g, 16 - (w >> 1), 28, w, 1, 'rgba(0,0,0,0.22)');
  const item = (id) => C.items[id] || { name: { jp: id, en: id } };
  const def = (id, itemId, d) => { KS[id] = Object.assign({ id, item: itemId, ed: 2, name: item(itemId).name }, d); };

  // ---- the old guardians' gifts (src/content/guardians/50_records.js; their shrines: src/content/zz_guardians.js) ----
  const GUARD = (k) => ({ kind: 'guardian', id: 'gd.' + k });
  def('gd_rw_keepsake', 'gd_rw_keepsake', {
    region: 'reedwake', source: GUARD('rw'),
    desc: { en: 'Flour-white and patched, older than the village. The founder\'s voice left it between the millstones when it was settled.' },
    how: { en: 'Given when the old guardian under Reedwake\'s mill was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, something old in Reedwake\'s mill is still awake.' }, specific: { en: 'Go down to the mill\'s wheel pit once the story is over; a small shrine waits there.' } },
    art(g) {
      shadow(g, 20);
      R(g, 6, 13, 20, 10, OUT); R(g, 7, 12, 18, 1, OUT); R(g, 4, 22, 24, 3, OUT);
      R(g, 7, 13, 18, 9, '#e6dcc4'); R(g, 8, 13, 16, 2, '#f4ecd8'); R(g, 5, 22, 22, 2, '#d4c8ac');
      R(g, 9, 16, 5, 4, '#cfc2a2'); R(g, 9, 16, 5, 1, '#b8a888'); R(g, 13, 17, 1, 3, '#b8a888'); // the patch
      [[18, 15], [21, 18], [11, 21], [24, 20], [16, 13]].forEach(([x, y]) => R(g, x, y, 1, 1, '#ffffff')); // flour
      R(g, 15, 10, 2, 2, OUT); R(g, 15, 10, 2, 1, '#cfc2a2'); // the button on top
    },
  });
  def('gd_sg_keepsake', 'gd_sg_keepsake', {
    region: 'saltglass', source: GUARD('sg'),
    desc: { en: 'Round spectacles on a thin gold chain, left in the Harbour Office\'s top drawer "for the next clerk".' },
    how: { en: 'Given when the old guardian of the Harbour Office was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, an old office in Saltglass is still keeping its records.' }, specific: { en: 'Once the story is over, look in the Harbour Office by the filing chest.' } },
    art(g) {
      shadow(g, 22);
      for (const cx of [10, 22]) { disc(g, cx, 16, 5, OUT); disc(g, cx, 16, 4, '#5a6a7a'); disc(g, cx, 16, 3, '#cfe0ea'); R(g, cx - 2, 14, 2, 1, '#ffffff'); }
      R(g, 15, 15, 2, 1, '#5a6a7a'); R(g, 15, 14, 2, 1, OUT);
      // the chain, hanging in a loop below
      for (let x = 5; x <= 27; x += 2) { const y = 21 + Math.round(Math.sin((x - 5) / 22 * Math.PI) * 5); R(g, x, y, 1, 1, '#c8a858'); }
      R(g, 4, 16, 1, 5, '#c8a858'); R(g, 27, 16, 1, 5, '#c8a858');
    },
  });
  def('gd_co_keepsake', 'gd_co_keepsake', {
    region: 'cinder', source: GUARD('co'),
    desc: { en: 'A scarf dyed the colour of the First Fire, and somehow always a little warm.' },
    how: { en: 'Given when the old guardian at the heart of the Great Kiln was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, the oldest fire in Cinder Orchard still burns.' }, specific: { en: 'Once the story is over, go into the Great Kiln, down to its core.' } },
    art(g) {
      shadow(g, 22);
      // a folded scarf: two crossing bands with fringes
      R(g, 5, 9, 20, 7, OUT); R(g, 6, 10, 18, 5, '#c4502a');
      R(g, 13, 13, 7, 14, OUT); R(g, 14, 14, 5, 12, '#b04424');
      for (const y of [11, 13]) R(g, 6, y, 18, 1, '#f0a050');
      for (const y of [17, 20, 23]) R(g, 14, y, 5, 1, '#f0a050');
      for (let i = 0; i < 3; i++) R(g, 14 + i * 2, 27, 1, 2, '#c4502a');
      R(g, 4, 10, 1, 5, '#e06a3a'); R(g, 25, 10, 1, 5, '#e06a3a');
      R(g, 22, 6, 1, 2, 'rgba(240,160,80,0.7)'); R(g, 24, 4, 1, 2, 'rgba(240,160,80,0.5)'); // warmth
    },
  });
  def('gd_sb_keepsake', 'gd_sb_keepsake', {
    region: 'snowbell', source: GUARD('sb'),
    desc: { en: 'Two chips of starlight the Sister Star left on the observatory floor, set on silver hooks.' },
    how: { en: 'Given when the old guardian of Snowbell\'s observatory was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, someone in Snowbell\'s sky is still watching.' }, specific: { en: 'Once the story is over, climb to the observatory\'s dome.' } },
    art(g) {
      shadow(g, 18);
      for (const [cx, cy] of [[10, 17], [22, 19]]) {
        R(g, cx, cy - 9, 1, 4, '#b8bccc'); R(g, cx + 1, cy - 10, 2, 1, '#b8bccc'); // the hook
        R(g, cx - 1, cy - 5, 3, 11, OUT); R(g, cx - 5, cy - 1, 11, 3, OUT);
        R(g, cx, cy - 4, 1, 9, '#eef0ff'); R(g, cx - 4, cy, 9, 1, '#eef0ff');
        R(g, cx - 1, cy - 1, 3, 3, '#ffffff'); R(g, cx - 2, cy - 2, 1, 1, '#a8b8ff'); R(g, cx + 2, cy + 2, 1, 1, '#a8b8ff');
      }
    },
  });
  def('gd_lf_keepsake', 'gd_lf_keepsake', {
    region: 'lanternfall', source: GUARD('lf'),
    desc: { en: 'A little bronze bell that rings the same low note as the Drowned Bell.' },
    how: { en: 'Given when the old guardian of the bell hall was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, the one who made Lanternfall\'s bell has not gone quiet.' }, specific: { en: 'Once the story is over, go to the bell hall under the tower.' } },
    art(g) {
      shadow(g, 16);
      R(g, 15, 3, 2, 5, '#7a3a2a'); R(g, 13, 7, 6, 2, OUT);
      for (let y = 9; y < 24; y++) { const w = 4 + Math.floor((y - 9) * 0.45); R(g, 16 - w - 1, y, w * 2 + 2, 1, OUT); R(g, 16 - w, y, w * 2, 1, y < 12 ? '#b89a4a' : '#9a7a3a'); }
      R(g, 8, 24, 16, 2, OUT); R(g, 9, 24, 14, 1, '#7a5a2a');
      R(g, 12, 12, 1, 9, '#d8c07a'); R(g, 15, 25, 2, 2, '#5a4020'); // the shine, the clapper
    },
  });
  def('gd_mb_keepsake', 'gd_mb_keepsake', {
    region: 'manybridge', source: GUARD('mb'),
    desc: { en: 'Old indigo, unfaded, once tied round the first bridge\'s oldest pile.' },
    how: { en: 'Given when the old guardian under Manybridge\'s first bridge was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, the oldest of Manybridge\'s bridges remembers who built it.' }, specific: { en: 'Once the story is over, go down to the first bridge\'s footing.' } },
    art(g) {
      shadow(g, 22);
      // a headband tied in a ring, its knot and two loose ends
      ring(g, 15, 15, 9, OUT); ring(g, 15, 15, 8, '#2e4a6a'); ring(g, 15, 15, 7, '#3a5a80'); ring(g, 15, 15, 6, OUT);
      R(g, 21, 18, 5, 4, OUT); R(g, 22, 19, 3, 2, '#2e4a6a');
      R(g, 24, 21, 3, 7, OUT); R(g, 25, 22, 1, 5, '#3a5a80'); R(g, 21, 22, 3, 6, OUT); R(g, 22, 23, 1, 4, '#3a5a80');
      R(g, 9, 11, 3, 1, '#c8d0e0'); R(g, 7, 14, 1, 2, '#c8d0e0'); // the white pattern
    },
  });
  def('gd_cr_keepsake', 'gd_cr_keepsake', {
    region: 'cloudroad', source: GUARD('cr'),
    desc: { en: 'A cape white as the Cloud Ox Elder, light, and always a little damp.' },
    how: { en: 'Given when the old guardian at the Cloudroad\'s summit was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, something old grazes above the Cloudroad.' }, specific: { en: 'Once the story is over, climb to the summit.' } },
    art(g) {
      shadow(g, 22);
      R(g, 12, 5, 8, 3, OUT); R(g, 13, 6, 6, 1, '#c8ccd4');
      for (let y = 8; y < 26; y++) { const w = 4 + Math.floor((y - 8) * 0.5); R(g, 16 - w - 1, y, w * 2 + 2, 1, OUT); R(g, 16 - w, y, w * 2, 1, y % 5 === 0 ? '#d0d6de' : '#e4e8ee'); }
      R(g, 7, 26, 18, 1, OUT);
      [[10, 20], [21, 16], [18, 23]].forEach(([x, y]) => { R(g, x, y, 1, 2, '#9ab8d8'); }); // the damp
    },
  });
  def('gd_yn_keepsake', 'gd_yn_keepsake', {
    region: 'steamhollow', source: GUARD('yn'),
    desc: { en: 'A steam-grey hood, folded on the edge of the Kettle\'s pool after its mother went back to sleep.' },
    how: { en: 'Given when the old guardian of the Kettle Below was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, the oldest spring under Steamhollow is still warm.' }, specific: { en: 'Once the story is over, go down to the Kettle Below.' } },
    art(g) {
      shadow(g, 20);
      // the hood, folded: a rounded crown over a band
      disc(g, 16, 17, 9, OUT); disc(g, 16, 17, 8, '#b8b2aa'); R(g, 7, 17, 19, 10, OUT); R(g, 8, 17, 17, 9, '#b8b2aa');
      R(g, 8, 22, 17, 2, '#a49e96'); disc(g, 16, 18, 4, '#5a5258'); R(g, 12, 18, 9, 5, '#5a5258');
      for (let i = 0; i < 3; i++) { R(g, 10 + i * 6, 6 - (i % 2), 1, 2, 'rgba(240,240,240,0.7)'); R(g, 11 + i * 6, 4 - (i % 2), 1, 2, 'rgba(240,240,240,0.5)'); }
    },
  });
  def('gd_ko_keepsake', 'gd_ko_keepsake', {
    region: 'kotonoha', source: GUARD('ko'),
    desc: { en: 'A single leaf left on the newest shelf of Kotonoha\'s garden, addressed to you.' },
    how: { en: 'Given when the old guardian of Kotonoha\'s garden was settled, after the story.' },
    hint: { broad: { en: 'Long after the story, the island\'s first keeper is still in the garden.' }, specific: { en: 'Once the story is over, go to the garden at the island\'s heart.' } },
    art(g) {
      shadow(g, 18);
      for (let y = 5; y < 26; y++) { const t = (y - 5) / 21, w = Math.round(Math.sin(t * Math.PI) * 8); R(g, 16 - w - 1, y, w * 2 + 2, 1, OUT); R(g, 16 - w, y, w * 2, 1, t < 0.4 ? '#5a9a4a' : '#4a8a3a'); }
      R(g, 16, 6, 1, 22, '#2e5a2a');
      for (let i = 0; i < 4; i++) { R(g, 12 - i, 10 + i * 4, 4, 1, '#2e5a2a'); R(g, 17, 10 + i * 4, 4 - (i >> 1), 1, '#2e5a2a'); }
      R(g, 21, 21, 7, 4, OUT); R(g, 22, 22, 5, 2, '#f4ecd0'); R(g, 23, 22, 3, 1, '#8a7a5a'); // the address tag
    },
  });

  // ---- the Living World's keepsakes (src/content/zzz_living/) ------------------------------------------------------
  def('lw_iroha_print', 'lw_iroha_print', {
    region: 'blockprint', source: { kind: 'sealed', id: 'mp_iroha' },
    desc: { en: 'A sheet from the old teaching block in Blockprint Row\'s press room: the iroha poem, every kana once and only once, printed so that no kind of letter faded.' },
    how: { en: 'Printed from the old block in the press room, once あらゆる could read every kind of letter on it.' },
    hint: { broad: { en: 'An old block in Blockprint Row has letters of every kind, and some have faded.' }, specific: { en: 'Bring あらゆる (every kind of) to the scroll on the press room\'s back wall.' } },
    art(g) {
      shadow(g, 20);
      R(g, 6, 3, 20, 25, OUT); R(g, 7, 4, 18, 23, '#f4ecd0'); R(g, 7, 4, 18, 1, '#fff8e4');
      for (let col = 0; col < 5; col++) for (let row = 0; row < 7; row++) if ((col * 7 + row) % 5 !== 3) R(g, 21 - col * 3, 6 + row * 3, 2, 2, '#3a3036');
      R(g, 8, 22, 4, 4, '#b83a2e'); R(g, 9, 23, 2, 2, '#e8806a'); // the press's seal
    },
  });
  def('lw_ko_tiderubbing', 'lw_ko_tiderubbing', {
    region: 'kotonoha', source: { kind: 'sealed', id: 'ko_tide' },
    desc: { en: 'A rubbing of the old tide calendar at Kotonoha\'s tide pools: one notch for each tide. Koyomi has a copy of her own now.' },
    how: { en: 'Rubbed from the tide stone by the pools, once ごとに could count the tides it keeps.' },
    hint: { broad: { en: 'A stone by Kotonoha\'s tide pools keeps count of something.' }, specific: { en: 'Bring ごとに (with each) to the tide stone at the north end of the pools.' } },
    art(g) {
      shadow(g, 22);
      R(g, 4, 6, 24, 20, OUT); R(g, 5, 7, 22, 18, '#ece4d0');
      disc(g, 16, 16, 7, '#4a4650'); disc(g, 16, 16, 5, '#ece4d0'); disc(g, 16, 16, 2, '#4a4650');
      for (let a = 0; a < 12; a++) { const t = a / 12 * Math.PI * 2; R(g, Math.round(16 + Math.cos(t) * 9), Math.round(16 + Math.sin(t) * 7), 1, 1, '#4a4650'); }
      R(g, 6, 8, 3, 1, '#a8a4b0'); R(g, 23, 23, 3, 1, '#a8a4b0'); // the charcoal's edges
    },
  });
  def('lw_sa_slip', 'lw_sa_slip', {
    region: 'archive_road', source: { kind: 'road', id: 'sa_road' },
    desc: { en: 'A name slip from one of Lanternfall\'s lamp shades, caught on a thorn on the Archive road on its way uphill. Nagi has long since written the street\'s names again.' },
    how: { en: 'Read and kept, the first time you climbed the Archive road.' },
    hint: { broad: { en: 'On the road up to the Still Archive, something written is trying to leave.' }, specific: { en: 'The first time you climb the Archive road, look at the thorns by the path.' } },
    art(g) {
      shadow(g, 10);
      R(g, 15, 2, 1, 4, '#8a7a5a');
      R(g, 11, 5, 10, 22, OUT); R(g, 12, 6, 8, 20, '#f0e6cc');
      for (let y = 8; y < 24; y += 3) R(g, 15, y, 2, 2, '#4a3a40');
      R(g, 18, 22, 2, 4, '#c8bca0'); R(g, 20, 21, 4, 1, '#5a4a32'); R(g, 22, 20, 1, 1, '#5a4a32'); // the torn corner, the thorn
    },
  });

  // ---- the Hall of a Hundred Tales and Ashihara Shinden --------------------------------------------------------------
  def('hall_lantern', 'hall_lantern', {
    region: 'hall', source: { kind: 'hall', id: 'w10' },
    desc: { en: 'The Hall\'s last hand lantern, from Keeper Tsuru when the hundredth tale was told.' },
    how: { en: 'Given by Keeper Tsuru when the hundredth tale, your own, was told.' },
    hint: { broad: { en: 'The Hall\'s keeper has one lantern left to give.' }, specific: { en: 'Tell the hundredth tale, at the top of the Hall.' } },
    art(g) {
      shadow(g, 14);
      R(g, 15, 2, 2, 3, OUT); R(g, 11, 5, 10, 3, OUT); R(g, 12, 5, 8, 2, '#3a3036');
      for (let y = 8; y < 24; y++) { const t = (y - 8) / 16, w = 5 + Math.round(Math.sin(t * Math.PI) * 3); R(g, 16 - w - 1, y, w * 2 + 2, 1, OUT); R(g, 16 - w, y, w * 2, 1, t > 0.3 && t < 0.75 ? '#f8d070' : '#f0c060'); }
      for (const y of [11, 15, 19]) R(g, 9, y, 14, 1, '#c8903a');
      R(g, 11, 24, 10, 3, OUT); R(g, 12, 24, 8, 2, '#3a3036');
      R(g, 13, 13, 6, 5, '#fff0b8'); // the light
    },
  });
  def('as_kasa', 'as_kasa', {
    region: 'ashihara', source: { kind: 'settlement', id: 'as.festival' },
    desc: { en: 'A sedge hat from the villagers of Ashihara Shinden, the kind worn for planting rice.' },
    how: { en: 'Given by the villagers round the fire, on Ashihara Shinden\'s first festival night.' },
    hint: { broad: { en: 'A new village on the reed plain is getting ready for something.' }, specific: { en: 'Help Ashihara Shinden until it holds its first festival.' } },
    art(g) {
      shadow(g, 24);
      for (let y = 8; y < 22; y++) { const w = Math.round((y - 7) * 0.95); R(g, 16 - w - 1, y, w * 2 + 2, 1, OUT); R(g, 16 - w, y, w * 2, 1, y % 3 === 0 ? '#b0904a' : '#c8a860'); }
      R(g, 3, 22, 26, 2, OUT); R(g, 4, 21, 24, 1, '#b0904a');
      R(g, 15, 6, 2, 2, OUT);
      for (let i = 0; i < 5; i++) R(g, 16 - i * 3, 10 + i * 2, 1, 1, '#8a6a30'); // the weave's rays
      R(g, 9, 24, 1, 3, '#7a3a2a'); R(g, 22, 24, 1, 3, '#7a3a2a'); R(g, 10, 27, 12, 1, '#7a3a2a'); // the chin cord
    },
  });

  // a save that already holds one of these items has it recorded as found (quietly: no notice on load; `how` says so)
  function backfill(st) {
    const d = st.discovery;
    if (!d || !d.keepsakes) return;
    const worn = Object.values(st.equip || {});
    for (const id in KS) {
      const k = KS[id];
      if (!k || !k.item || d.keepsakes[id]) continue;
      if (!((st.inv && st.inv[k.item] > 0) || worn.indexOf(k.item) >= 0)) continue;
      d.keepsakes[id] = { t: Date.now(), map: null, how: { kind: 'item', id: k.item, recorded: 'on load' } };
      if (!st.awarded) st.awarded = {};
      if (!st.awarded['keepsake:' + id]) st.awarded['keepsake:' + id] = Date.now();
    }
  }
  if (RB.save && RB.save.addMigration) RB.save.addMigration(backfill);
  C.keepsakeBackfill = backfill;
})(RB.content);
