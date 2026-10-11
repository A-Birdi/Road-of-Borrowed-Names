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
| Maps | 226 | 130 on interim regional kits (cr, el, hall, ko, kr, mb, mp, sea, yn) | P16d |
| Creatures | 105 | 46 on a borrowed family (echo 11, golem 11, blot 8, wisp 7, moth 4, clerk 2, warden, lf_keeper, lantern) | P16b; each audited "incomplete" with its reason (F-36, F-93, F-104, F-135) |
| Travel-volume pages | 47 | **0** (was 20 plates) | P16c done |
| Cosmetics | 27 | one gap: the Kettle's Mother's hood is worn on the road but the Harmony bust calls it "not a player option" | P16d |
| Characters | 263 | — | portraits and road figures exist for all |

## Plan

| Part | Item | Where | Status |
|---|---|---|---|
| P16a | **The census and register**: maps and their kits, map states, creatures and their families, the travel volume, the wardrobe (cosmetics on road figure, portrait and Harmony bust), characters; captures per region | `tools/art_census.mjs`, `docs/future/work/art_census.json`, `docs/screenshots/p16/census/` | Done (implemented, internally reviewed): the numbers above; the census found the volume's chapter numbering (F-140) and the boat-naming gap in automated runs |
| P16b | **The interim creatures' own families**: the 46 creatures drawn on borrowed families get drawings of their own, with the same deliveries (no move a family cannot perform) | `src/ui/78*.js` | Not started |
| P16c | **The travel volume's paintings**: the six new chapters (13 pages: Manybridge's named bridge and its dusk; the press and the fireworks; the Vigil and the dawn on the Keepers' Road; Kotonoha's garden and its ending; the Cloudroad's summit, letter and relay; the Kettle and Steamhollow's end), the nine old guardians, the Hall's ten tales and the settlement's first festival (20 pages) | `src/ui/43g_seq_paint.js` (shared painting kit), `43h_seq_mb1.js` … `43m_seq_yn.js`, `43n_seq_post.js` | Done (implemented provisionally, internally reviewed): 33 pages, every one wired into its scene and linked from the volume; no interim plate left (F-141). Unit `tests/unit/sequence_p16.test.mjs` 363/0 (registry, scripts, volume); browser `tests/e2e/sequence_p16.mjs` (every page played through the volume's own viewer at 1280×720, 390×844 and 844×390, focus above the sheet, the campaign untouched, reduced motion holding at once); evidence stills `docs/screenshots/sequences/p16/` |
| P16d | **The interim regional kits** (cr, el, hall, ko, kr, mb, mp, sea, yn), **the yukata cut** (F-44) and **the hood in Harmony** | `src/ui/` region kits, `RB.festDress`, `88_harmony_acc` | Not started |
| P16e | **U05/U06**: dialogue, title, help, writing prompts, battle slips and confirmations in the book family; the finished materials and transitions everywhere; old styles removed once nothing uses them | `src/ui/` | Not started |

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

## Rules kept

- Art is presentation only: no rule, reward, learning check or save field changes (AC-1 scope).
- No letters, kana or kanji are drawn in an illustration; writing is brush marks and ruled lines.
- Every displayed title keeps its furigana; titles of the guardians' pages are the guardians' own names.
- Interim art never worse than its surroundings (Phase Z); nothing is called approved before Robin's review.
- Offline only: no remote asset, font or library.
