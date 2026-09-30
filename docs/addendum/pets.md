# Cosmetic pets (worker P) — record

Status: **in progress** — the cat vertical slice is complete (world, battle, Company, vignette,
save/load, evidence); the dog, the bird and the tanuki follow to the same standard. This file is
rewritten with the final numbers when all four are done.

## Files
- `src/engine/37_pets_0family.js` — `RB.families`: every response, technique and companion action → a response family.
- `src/engine/37_pets_1data.js` — `RB.pets`: species, names (plain text, 24 grapheme clusters), records, selection, looks, conditions (`pet`, `pet=cat`, `pet.cat`), portraits, vignette registry and field route, greetings.
- `src/engine/37_pets_2art.js` — `RB.petArt` volume rasterizer (the battlers' method: posed volumes, depth buffer, 5-step hue-shifted ramps, contours, selective outline).
- `src/engine/37_pets_3rig.js` — the four rigs, 3 looks each, views (road 4 directions, battle rear three-quarter, preview, portrait), the frame cache.
- `src/engine/57_petworld.js` — `RB.petWorld`: following, settling, catch-up, the pre-acquisition animals, scene staging.
- `src/ui/85_battle_pets.js` — `RB.battlePets`: the battle observer (reactions per species × family), settings rows.
- `src/ui/54_company_pet.js` — Company › Pet, the naming sheet (`RB.ui.petName`).
- `src/styles/35_pets.css`; `src/content/pets/` (lexicon, hooks, vignettes).
- Tests: `tests/unit/pets.test.mjs`, `tests/e2e/pets.mjs`, `tests/e2e/pets_video.mjs`, `tests/e2e/pets_docs.mjs`.

## Shared files touched (hook lines only)
- `src/engine/50_world.js` — one line at the end of `update`: `RB.petWorld.update(dt)`.
- `src/engine/60_render.js` — one line in `drawWorld`: `RB.petWorld.push(list, c, ax, ay, t)`.
- `src/ui/80_combat.js` — emits `present:action` / `present:enemy` / `present:scene` (a small `present()` helper; failures are caught).
- `src/ui/83_battle_stage.js` — `layout()` reserves `lay.pet` (and includes it in the party box); `draw()` calls `RB.battlePets.draw` before your figure.
- `tests/e2e/run.mjs` — `pets.mjs` added to the default list.
- Generated: `src/recog/10_strokedata.js`, `src/lang/75_kanjiread.js` (regenerated for the new kanji; the lead regenerates at merge).
