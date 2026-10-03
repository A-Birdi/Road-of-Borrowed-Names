# Harmony cut-ins: the earlier directives and the Art Direction Correction, reconciled

**Rule.** Where they conflict, the newer directive wins.

**Newer directive:** the owner's *Harmony Cut-In Art Direction Correction* of 2026-10-03, kept verbatim in
[`ART_DIRECTION_CORRECTION.md`](ART_DIRECTION_CORRECTION.md).

**Earlier directives:**
- the Harmony addendum, restated as ledger rows HX1–HX27 and HX58–HX59 in `docs/expressive/CONTRACT.md`, with the
  timing plan in `docs/expressive/HARMONY.md`;
- the world-review packet's Harmony documents 02 and 03 (`docs/review/WORLD_REVIEW_RECONCILIATION.md`);
- the artist brief v2 (`ASSET_BRIEF.md` as of `c2a799d`);
- the machine contract v2 (`contract/CONTRACT.md`, `src/ui/88_harmony_contract.js`).

**Result:**
- the brief becomes v3 ([`ASSET_BRIEF.md`](ASSET_BRIEF.md));
- the machine contract becomes v3 (a worker is building it);
- the remaining owner decisions are listed in §6.

**Status label of the current art:** the code-drawn busts are **provisional artwork**. Nothing is a visual
candidate yet. No external art is being produced until the owner relays the brief.

## 1. Measured: the mockup against the contract geometry

Measured on the owner's resupplied capture (2000 × 1087 px). The capture is not committed.

| | Mockup | Contract v2 at 2× | Contract v2 at 1× (what the owner's ~2048 × 1046 view gets today) |
|---|---|---|---|
| Pair footprint | about 700 × 270 px: 35 % of the width, 25 % of the height | 704 × 320 canvas, about 704 × 280–300 visible | 352 × 160 |
| Face, cheek to cheek | about 108–110 px | face box 50 art px → 100 px | 50 px |
| Eye width | about 27–30 px | about 12–14 art px → 24–28 px | about 13 px |
| One art pixel | about 2–2.5 screen px (stepped edges on the bow and hair) | 2 px | 1 px |

**Conclusions:**
- The contract's canvas and face box already match the mockup when shown at 2×. The geometry needs no
  redesign.
- The owner's screen currently gets 1×, so faces are about half the mockup's size. The newer directive (§3.6)
  makes "comparable visible face size and battle footprint" a requirement, so the 2× fix is mandatory, not a
  refinement (C2 below).

## 2. Where the two agree (kept)

| Topic | Earlier | Newer | Status |
|---|---|---|---|
| The mockup's role | Fidelity and composition target (brief v2, packet document 02) | The same (§2, §9) | Agreed |
| Not an enlarged dialogue portrait | Code busts are provisional; painted art replaces them | "not a normal dialogue portrait made larger" (§2, §9) | Agreed |
| Both participants animate inside the portrait | Six states per character; slide-and-fade is not enough | The same (§7.1, §9) | Agreed |
| Player customisation | A layered kit, read from `RB.equip.look` at action start (HX8, contract §6) | "layered illustrated kit" (§4–§5) | Agreed |
| Inventory from source | `registry.json`: resolver, base vs cosmetic override, visible-in-crop, unresolved items | §5.1 | Agreed (already exported) |
| Hidden artwork | The eyes are drawn under the glasses; a hat covers the scalp above its band | §5.2 | Agreed |
| Occlusion by pose | Contract §6: the arm over the glasses, `armSlot` per pose, fixed earring sides, straps on the torso | §5.3 | Agreed |
| Identity | Never copy the mockup player's flower, complexion or wink onto every player | §5.5 | Agreed |
| Composition | Companion left, player right; cooperative; no VS or slogan; a hand directed outward | §3.4 | Agreed |
| Companion personalities | Per-pairing table (brief v2 §4) | §6 table | Agreed; the newer wording is added (§3) |
| Shared player rally, distinct companions | Player prep/cue shared; peak/settle per technique; per-companion frames | §7.2 | Agreed |
| Duration and modes | 780 ms Normal; Fast 100/220/160; Instant none | §7.3–§7.4 | Agreed |
| Fade, never pop or slide out | A token lifecycle that fades in place | §7.4 | Agreed |
| Battle frame untouched | Protected rectangles 12 px clear; banner only during the animated action | §8 | Agreed |
| Particles off | Gate: pairings distinct with backing and particles off | §3.5 | Agreed |
| Cache and staleness | Cache keyed by look, art version and campaign; cleared on change | §5.6 | Agreed |
| External art is a handoff, not a claim | The brief, plus "Waiting for Batch 1" | §11 | Agreed |
| Visual approval separate from tests | Two gates (technical integration; the owner's visual approval) | §9, §12 | Agreed |

## 3. Conflicts, and how they are resolved (the newer directive wins)

| # | Earlier said | Newer says | Resolution |
|---|---|---|---|
| **C1** | The player kit is painted in **exactly five key shades** per recolourable material, and the importer snaps to them. Every player material ends at five tones, while the companions are unrestricted. | Recolouring must preserve the illustration and give richer colour transitions; dark and light colours keep readable form; no visibly lower-fidelity player (§3.5, §4, §5.4, §6). | **Contract v3, "key families, free values".** Paint each material in its key colour family with as many values as the drawing needs. The game projects each pixel onto the family's key curve and maps it onto the chosen palette's curve, keeping the painted hue and chroma deviations. Exact v2 shades still give today's colours. Proof: every supported skin, hair colour and cloth palette, with a numeric floor on neighbouring-value contrast. |
| **C2** | 2× only from 1677 × 1067; the owner's ~2048 × 1046 view gets 1×, "planned fix" (brief v2 §11.1). | Compare at a comparable visible face size and footprint (§3.6); do not enlarge the overlay to consume the arena (§8). | **Mandatory.** Fit the painted pair on its visible bounds across the whole timeline. The same 42 % / 30 % / 12 % limits apply, so the owner's view gets 2×: faces about 100 px, footprint about 34 % × 27–29 %. Integer scales only. The overlay does not grow beyond the existing limits. |
| **C3** | Batch 1 (26 files) proves fidelity, animation and two player looks together, then one review. | Phase 1: player + Suzu at the quality bar, then the owner's approval. Phase 2: a materially different look. Then formalise and roll out (§10). | **Batch 1 is split.** 1a = Suzu + look A (18 required) → the owner's approval. 1b = look B (9 required) → customisation proof. Batches 2–4 only after both. |
| **C4** | Reduced motion shows `settle_b` alone. | "Suitable held poses and restrained fades" (§7.4). | `peak` held, then `settle_b` held, with a cross-fade of at most 120 ms and no travel. Code busts unchanged. |
| **C5** | "The head never changes angle." Four head expressions, so every hairstyle fits one head. | Expression through eyes, lids, brows, highlights, mouth, cheeks **and head angle**. "A tiny change to the mouth on an otherwise neutral frontal face is not sufficient" (§3.1). Pose-aware art where a turn changes anatomy (§5.3). | **One expressive head angle**, the mockup's tilted three-quarter, not a neutral frontal face. It stays consistent across states so the hair and accessory layers fit, but every state changes the eyes, lids, brows, mouth and cheeks, not only the mouth. Whole-pixel head and torso nudges per state are allowed (contract §6). The companions' frames are free to change angle. A second authored head angle with matching hair is an open option (§6, item 3). |
| **C6** | Look A = ponytail, green coat, glasses, flower; the satchel only in look B. | Show the worn satchel strap where applicable (§3.3, §5.5). The mockup's player wears a strap. | `acc_satchel` moves into look A. Look B gets `acc_scarf` + `acc_headband`, a recolourable hair-mounted piece on a different hairstyle. |
| **C7** | Deliveries go to `art/harmony/incoming/` (ignored); only normalised exports are committed. | Preserve approved source art and the means to regenerate its exports (§10 Phase 3, §12). | Unreviewed drops stay ignored. **Approved** deliveries are committed under `art/harmony/source/<batch>/`, with provenance. The importer regenerates `assets/harmony/` from them byte-for-byte. |
| **C8** | Brief v2 said only "PNG with transparency (or one flat #ff00ff)". The v2 importer already refused painted checkerboards (`tools/harmony/grid.mjs` `looksLikeCheckerboard`; unit test in `harmony_import.test.mjs`). | A checkerboard painted into a flattened image is not transparency (§11). | **No conflict in the machine**, only in the brief's wording. Brief v3 states the rule. The contract worker hardens detection only if it finds a gap. |
| **C9** | Status words: "provisional fallback", "waiting for Batch 1". | Labels: provisional artwork / visual candidate awaiting approval / approved visual direction / integrated and verified (§12). | Adopted in the brief, REQUIREMENTS.md, and the manifest (`approval` per pairing and for the kit, shown only in the dev viewer). |

## 4. What the newer directive adds that the earlier ones lacked

- **Phase 1 deliverables:**
  - the principal held pose at in-battle size **and** at native authoring size;
  - then the internal animation;
  - then the battle integration, compared at the same footprint (§10).
- **Phase 2:** the alternate look shown as a still **and** an animation, with the same face quality (§10).
- **Handoff completeness (§11):**
  - the source revision;
  - reference roles: current implementation samples are "for comparison rather than imitation";
  - editable/source components among the deliverables;
  - the statement that a flattened picture is not a separated kit and that temporal consistency must be
    checked, not assumed.
- **Suzu's earrings** follow through with the hair and ribbon.
- **Mio** is "not a generic timid pose".
- **Ren:** a glasses adjustment alone cannot be the whole performance. This was already secondary in v2.
- **No endless minor revisions of an unsuccessful method** (§9): the code busts are not polished further.
  Effort goes to the painted kit.

## 5. What the earlier directives add, and the newer one does not contradict (kept)

- **Exact geometry:**
  - canvases 192 × 160, pair 352 × 160, compact 248 × 128;
  - facing: the companion turned right, the player turned left;
  - neck pits, face boxes, band crop lines, phone-safe regions.
- **The six performance states and their Normal and Fast timing**, with required vs optional states.
- **Key colour families** (now free-valued), **mask colours, binary alpha, file naming, the manifest and
  `import.json`**, and the importer's report.
- **Asset keys:** 86 required and 33 optional asset keys from `registry.json`, with the accessory slots,
  sides and hat-band rule.
- **Rendering conventions:** warm light from the upper left, a cool rim light on the right silhouette, and a
  selective dark outline (#140c18) that lightens inside the shape.
- **Batches 2–4 and their gates.**
- **Budgets** (contract §10) and the rights/provenance note per delivery.

## 6. Open points for the owner

1. **Look A's hairstyle.** v2 chose the ponytail. In the mockup the player's hair reads as shorter, layered
   and wavy, with no ponytail visible. Which of the game's 12 hairstyles is the acceptance look? The choices
   are short, bob, long, ponytail, bun, curly, spiky, braid, shaved, twintails, wavy and wrap.
2. **The wink.** The mockup's player winks. The player's four head states are shared by all four pairings,
   so a wink would play with Nao, Mio and Ren too. The proposal: no wink on the shared player head; the wink
   stays Suzu's. Say if you want a Suzu-only player peak head instead (one extra file).
3. **A second head angle.** Allowing a different head angle at `peak` means every hairstyle (and hair-mounted
   accessory) also needs that angle: about 24 more hair files. The proposal: one expressive tilted angle
   now; decide after Batch 1a.
4. **Small phones.** These are not your devices. At 375 × 667 and 320 × 640, faces stay at about 52 CSS px,
   under the addendum's 64. The compact crop cannot grow without covering the battle.

## 7. Work and owners

| Item | Who | State |
|---|---|---|
| C1, C2, C4, C7, C9 (manifest), Batch 1a/1b registry; contract v3; reference sheets | Contract worker | In progress |
| Brief v3 (this reconciliation applied); the published brief page | Lead | This commit (brief); page next |
| Nao's and Mio's **stage** performances (not the portrait) | Choreography worker | In progress (separate request) |
| Batch 1a art | The owner's image tool, when the owner relays the brief | **Not started**: nothing is being generated |
