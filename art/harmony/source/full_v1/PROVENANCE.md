# Provenance: the Harmony cut-in art, full delivery v1

**Owner:** Robin. Approved by Robin on 2026-10-06 ("The new Harmony pass I would consider finished").

**How it was made.** Every file here was drawn in code in this project:
- **References:** Robin made the reference sheets with Robin's image tool. They are original and used in this project
  under that tool's terms, and they are never committed (ASSET_BRIEF.md §10).
- **Renderers:** they read only numbers measured from those sheets (traced outlines, coordinates and sampled colour
  ramps). They never copy reference pixels.
- **Colours:** the player's kit was painted in look A's real colours with exact supplied masks, then converted to the
  contract's key families by `tools/harmony_keyify.mjs`.
- **Companions:** their frames are their final colours, as the contract requires.

**Contents.**
- **The player's kit:**
  - four heads and three in-between heads;
  - five garments built on one shared body base (coat, tunic, robe, apron, dress);
  - brush arms for every pose and pairing in fitted and wide sleeves, with in-betweens;
  - twelve hairstyles, with motion files for eleven;
  - thirteen accessories;
  - glasses, flower and satchel.
- **The companions' cut-ins:** Suzu, Nao, Mio and Ren, seven states each, with effect layers where the frames
  have them.

**Regeneration.**
```
node tools/harmony_import.mjs art/harmony/source/full_v1 --replace
```
This writes `assets/harmony/` byte for byte (CONTRACT.md §9).
