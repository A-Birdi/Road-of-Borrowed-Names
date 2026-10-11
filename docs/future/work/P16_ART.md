# P16 · The art pass

*Playbook P16 ("the art pass over old and new, including the book's finished materials"); roadmap Phases 11 and Z
([12_ROADMAP.md](../plan/12_ROADMAP.md)); interface packets U05 and U06 ([15_INTERFACE.md](../plan/15_INTERFACE.md)
§6). Governed by Robin's AC-1 critique (C-82, digest [AC1_ART.md](../plan/AC1_ART.md)), which applies to art work
only. Authorised by C-81. Status words follow AC-1: "implemented provisionally" and "internally reviewed", never
"approved"; Robin reviews the whole at completion.*

## What P16 covers

Phase Z's register made concrete: every feature built in P08–P15 listed the art it was leaving at an interim
standard (creatures on borrowed families, regional kits marked interim, travel-volume pages shown as plates, the
yukata cut, the book's remaining skins). P16 measures that register (the census), then works through it. Nothing in
P16 changes a rule, a reward, a learning check or a save field; art is presentation only.

## The register (the census)

`node tools/art_census.mjs` prints the summary and writes [art_census.json](art_census.json); `--check` exits 1 if
anything it can measure is missing. Contact sheets per region: `docs/screenshots/p16/census/<region>.webp`.

| What | Count | Interim | Notes |
|---|---|---|---|
| Maps | 226 | **0** (was 130 on interim regional kits: cr, el, hall, ko, kr, mb, mp, sea, yn) | P16d: each kit's props reviewed at art resolution and the weak ones redrawn |
| Creatures | 105 | **0** (was 46 on a borrowed family: echo 11, golem 11, blot 8, wisp 7, moth 4, clerk 2, warden, lf_keeper, lantern) | P16b done: each has its own family on the creature kit, audited "upgraded" |
| Travel-volume pages | 47 | **0** (was 20 plates) | P16c done |
| Cosmetics | 27 | the Kettle's Mother's hood: now drawn on the Harmony code bust (`A.hood`); the painted bust file stays on the register | P16d (painted file) |
| Characters | 263 | — | portraits and road figures exist for all |

## Plan

| Part | Item | Where | Status |
|---|---|---|---|
| P16a | **The census and register**: maps and their kits, map states, creatures and their families, the travel volume, the wardrobe (cosmetics on road figure, portrait and Harmony bust), characters; captures per region | `tools/art_census.mjs`, `docs/future/work/art_census.json`, `docs/screenshots/p16/census/` | Done (implemented, internally reviewed): the numbers above; the census found the volume's chapter numbering (F-140) and the boat-naming gap in automated runs |
| P16b | **The interim creatures' own families**: the 46 creatures drawn on borrowed families get drawings of their own, with the same deliveries (no move a family cannot perform) | `src/ui/78u_creature_kit.js` (the kit), `78v_kit_manybridge.js`, `78w_kit_road.js`, `78x_kit_sea_cloud.js`, `78y_kit_steam.js`, `78z_kit_guardians.js`; `src/content/zz_creatures_c.js` (the move) | Done (implemented provisionally, internally reviewed): 46 families, one per creature, none shared; unit `tests/unit/creatures_c.test.mjs` (every move kind × normal/reduced/warded/soft through the sequencer, every pose draws, 6–12 idle drawings, audit records, the frame budget) and `creatures_a.test.mjs` (the ten families' share plus those moved stays 84); battle stills `docs/screenshots/p16/creatures/` (`tests/e2e/creatures_c.mjs --docs`). Their map figures are the same drawings at rest, reduced to the map's scale |
| P16c | **The travel volume's paintings**: the six new chapters (13 pages: Manybridge's named bridge and its dusk; the press and the fireworks; the Vigil and the dawn on the Keepers' Road; Kotonoha's garden and its ending; the Cloudroad's summit, letter and relay; the Kettle and Steamhollow's end), the nine old guardians, the Hall's ten tales and the settlement's first festival (20 pages) | `src/ui/43g_seq_paint.js` (shared painting kit), `43h_seq_mb1.js` … `43m_seq_yn.js`, `43n_seq_post.js` | Done (implemented provisionally, internally reviewed): 33 pages, every one wired into its scene and linked from the volume; no interim plate left (F-141). Unit `tests/unit/sequence_p16.test.mjs` 363/0 (registry, scripts, volume); browser `tests/e2e/sequence_p16.mjs` (every page played through the volume's own viewer at 1280×720, 390×844 and 844×390, focus above the sheet, the campaign untouched, reduced motion holding at once); evidence stills `docs/screenshots/sequences/p16/` |
| P16d | **The interim regional kits** (cr, el, hall, ko, kr, mb, mp, sea, yn), **the yukata cut** (F-44) and **the hood in Harmony** | `src/content/<region>/02_art.js`, `src/engine/32_spriteart.js` (`garmentFB`), `58f_festdress.js`, `src/ui/88_harmony_acc.js` | Done (implemented provisionally, internally reviewed): the 63 props of the nine kits drawn on prop sheets and looked at; redrawn where they fell short (the Cloudroad's packhorse; the Understage's festival lanterns, now round chōchin, and its stage lift, with a frame, a ladder and lit boards; the noodle stall's sign, which read as a Latin letter); each kit's header records it. The yukata: a print of small morning-glory florets in the obi's colour, a wide obi and its bow at the back, on the road sprite (the side view keeps the plain robe). The hood: drawn on the Harmony code bust; a painted bust file for it stays on the register (`acc_hood`). The 46 creatures' map figures are now their own drawings at rest at the map's scale (`RB.creatureKit.overworld`) |
| P16e | **U05/U06**: dialogue, title, help, writing prompts, battle slips and confirmations in the book family; the finished materials and transitions everywhere; old styles removed once nothing uses them | `src/styles/90_book.css`, `src/ui/50_menu.js`, `55_settings.js`, `20_dialogue.js` | Done (implemented provisionally, internally reviewed): the book on every surface, the classic folio retired with a parity baseline (F-142); the browser suite's first third then found the book's wider faces and the dialogue's book layout breaking small screens (the sheet in a narrow column on phones, a name over its line, Keep outside the sheet, a slip summary and cloth buttons too wide at 200 % text, a typing field's Submit under the keyboard, a closing Ledger's copy read as the open one): all fixed (F-143) |

## How the pages are painted (P16c)

- **One kit for every later page** (`43g_seq_paint.js`): stars, water, glints, rings, a stepped glow (four dithered
  bands, cached, no gradients), lanterns, planks, roofs, paper slips with brush marks (never letters), grass in
  clumps, clouds, tree crowns, a pxkit layer that takes fractional shades, and a pinhole camera (`cam`) so a shot can
  be built as a small place in metres.
- **The guardians' places** are built through that camera as rooms or landscapes: the place in one layer without
  outlines (architecture keeps its own edges), the things in it in an outlined layer, the light that falls into the
  place (a shaft from its window with motes), a framing foreground in shadow, and a dithered fall-off toward the
  frame's edges round the keepsake (AC-1's foreground framing, dimensional landmark, light separation and selective
  focus). The kiln is traced per pixel (a barrel vault lit by its embers).
- **The tales** are a separate register on purpose: ink and wash on paper inside the game's pixel grid, one accent
  colour each and a red seal that is a pattern, never a character.
- **Every page** keeps its one-time action at or under 1.5 s, its focal area above the dialogue sheet at every
  layout, nothing written into the campaign, and reduced motion holding each action at its end.

## How the creatures are drawn (P16b)

- **One kit, one drawing each** (`78u_creature_kit.js`). A creature is an anatomy written as one function over a
  shared pose vocabulary (lean, lift, squash, reach, open, glow, eyes, tilt, wing, puff, a cycle): its silhouette,
  materials and features stay its own in every pose, while how each kind of move is performed (wind-up, contact,
  recovery, timing, effect) is the kit's, the same shapes the old families used, tested once. Each is a family on
  the Creatures A rig, so the enemy art, the sequencer and the audit treat it like every other.
- **Shared drawing helpers**: a tube with one continuous shading along a path (necks, feet, tentacles, limbs; no
  banding where pieces join), a standing figure built of tubes (the ghosts and the people made of flour, fog, bark,
  timber or skin), the Creatures A ramps, ball shading, stones, rims, cast shadows and outlines; fractional shades
  on every kit layer.
- **Light and colour**: lit from the upper left, cool rims on the right, ramps chosen per material (pale ramps for
  cloud, steam, fog, paper and light; dull ramps for iron); translucency for the ghosts, the steam and the water.
- **No writing**: ledgers, slips, plans, placards and the marks inside the jelly and on the weevil are ruled lines,
  bars, curls and blots. Shapes that read as kana were redrawn (the weevil's and the jelly's marks).
- **Within the budget**: every canvas at most about 300 × 296 so a full enemy-art cache stays under 48 MiB; at most
  140 frames a family.

## Rules kept

- Art is presentation only: no rule, reward, learning check or save field changes (AC-1 scope).
- No letters, kana or kanji are drawn in an illustration; writing is brush marks and ruled lines.
- Every displayed title keeps its furigana; titles of the guardians' pages are the guardians' own names.
- Interim art never worse than its surroundings (Phase Z); nothing is called approved before Robin's review.
- Offline only: no remote asset, font or library.
