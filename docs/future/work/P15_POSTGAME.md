# P15 · The whole postgame

*Playbook P15 ("Complete the postgame, not just its prototype"); plan [04_DUNGEONS.md](../plan/04_DUNGEONS.md) D9
(the Hall of a Hundred Tales), [03_ENCOUNTERS.md](../plan/03_ENCOUNTERS.md) E16 (superbosses),
[07_REGIONS.md](../plan/07_REGIONS.md) R7 (the new settlement) and Kotonoha's matured state,
[10_STORY.md](../plan/10_STORY.md) §10 (the postgame, expanded), sealed notes S6 (Ashihara Shinden), S7 (the old
guardians), S8 (change beats, the Cinder Orchard festival revisit), S9 (shogi on the hill bench), S14 (each
companion's postgame beat), F-64 (the shuttered Hall), F-82 (fishing's new stations). Authorised by C-81. The
illustrations' painting is art work (P16, AC-1); P15 places each one in the travel volume with its interim page.
**Twelve-chapter journeys only**: the six-chapter game's postgame is unchanged.*

## What P15 builds

The story is over and the roads go on (10_STORY §10). Nothing here reopens the threat: lingering effects,
discoveries, disputes and new places carry the adventure. Every part is optional, and none is a gate for another
except where it says so (the Hall's tenth wing follows the nine).

## Plan

| Part | Item | Source | Where | Status |
|---|---|---|---|---|
| P15a | **The Hall's engine**: ten wings of ten trials (one hundred deliberate trial ids, a manifest with no duplicate or unreachable id); a wing's floors with the expedition rules (persistent condition, stations per floor, the floor restarted on defeat, the emergency retreat resetting only the current floor, earlier floors and wings kept); hearths (a wing's checkpoint, its lantern relit for good); the earned reprieve (back to the surface with the floor exactly as it was); suspend (anywhere outside battle, resumed exactly there; a per-slot recovery-style record removed with the slot, never a seventh save); the three choices per wing (the campaign's profile; Consolidate or Grow; Relaxed, Standard or Demanding), shown on the wing's card and changed at a hearth; the variation fixed when a wing is entered (which pattern of rooms, which version of a puzzle) | D9, D1–D4, H2 | `src/engine/98h_hall.js`, `src/ui/89h_hall.js` | Planned |
| P15a | **The way in**: Tsuru gives the hall's key ledger after the story; the shuttered Hall above the Keepers' Road opens; the foyer of ten alcoves, one lantern per wing | D9 Lore, F-64 | `src/content/hall/` | Planned |
| P15a | **Wing 1, The Lamp at the Crossroads** (finding the way: directions, signs, asking again): ten trials | D9 | `src/content/hall/` | Planned |
| P15b | Wings 2–5: The Fox's Wedding (who does what to whom), The Bell Before Dawn (sequence and timing), The Borrowed Umbrella (requests, permission, intention, misunderstanding), The Two Wells (reasons and contrasts) | D9 | `src/content/hall/` | In progress: wing 2 built (`11_w2_maps.js`, `16_w2_learning.js`, `22_w2_scenes.js`, song `hall_w2`, stamp; unit test `tests/unit/hall_w2.test.mjs` 103/0; F-122, F-123); wing 3 built (`12_w3_maps.js`, `17_w3_learning.js`, `23_w3_scenes.js`, song `hall_w3`, stamp, grammar points うちに and 次第; unit test `tests/unit/hall_w3.test.mjs` 106/0; F-124); wing 4 built (`13_w4_maps.js`, `18_w4_learning.js`, `24_w4_scenes.js`, song `hall_w4`, stamp; unit test `tests/unit/hall_w4.test.mjs` 103/0; F-126); wing 5 built (`14_w5_maps.js`, `19_w5_learning.js`, `25_w5_scenes.js`, song `hall_w5`, stamp, grammar point おかげで／せいで; unit test `tests/unit/hall_w5.test.mjs` 104/0; F-127). Wings 2–5 done |
| P15c | Wings 6–9: The Toll That Changed (conditions and exceptions), The House That Remembers (what was left unsaid), Three Witnesses at the Inn (whose account), The Crane's Return (to whom are you speaking) | D9 | `src/content/hall/` | Planned |
| P15d | Wing 10, The Hundredth Tale (the player's own journey told back, mixing everything); all ten: the Hundredth Tale's page, a commemorative keepsake, a last conversation with Tsuru | D9 Rewards | `src/content/hall/` | Planned |
| P15d | Rewards per wing: a lantern relit, a stamp, the travel volume's page of its tale (revealable by confirmation without finishing: viewable, never witnessed or completed), the companion's reflection, an optional truthful note (route, tactical setting, help used, by L2's categories), never a gate | D9 Rewards, H1, K1, K2 | records | Planned |
| P15e | **The old guardians** (superbosses): one per region, awakened after the story, each built round one mechanic family (conditions, arrivals, procedure or argument), never padded health; a stamp, an illustration (revealable), a keepsake; retries keep the learning; no mandatory input mode | E16, S7 | `src/content/guardians/` | Planned |
| P15f | **Ashihara Shinden** (葦原新田), the new settlement: named on the road by the sixth restoration (S6); help it become a place by naming its streets, writing its first notices (notices change what people do), settling its first disputes (mediation), arranging its first festival; residents move in with routines that change as it grows; each improvement changes the map; never currency or maintenance chores | R7, S6, A17, E8, A50 | `src/content/settle/` | Planned |
| P15g | **Returns**: Kotonoha matured and its deepest grove (what the Archive kept, names nobody came for, by the ending's choice about the Archive); the Cinder Orchard's yearly festival, a repeatable map of its own (Suzu's "twenty festivals"); Snowbell's lamp rota and Akari's letters; Lanternfall's objections board; Manybridge's broadsheet's last editions; the checkpoint teahouse; the festival hall open again | 10_STORY §10, S8, 07_REGIONS | the regions | Planned |
| P15g | **The companions' postgame beats** (S14): Suzu and the player perform the double act for the troupe in the festival hall; the relay runs end to end and Nao carries the player's letters; Kikue visits the festival hall with a jar labelled "undecided"; Ren and Hisae walk the Keepers' Road on the night its lanterns are lit | S14 | the regions | Planned |
| P15g | **Pastimes' remaining content**: shogi on the hill bench with Fuku and Isamu (S9); Snowbell's abandoned game as a mate puzzle; A Quiet Cast's two new stations, Sazanami and the boat (F-82); the boat's postgame destinations | S9, F-82, R6 | pastimes, sea | Planned |
| P15h | Tests and phase end: the hundred-trial manifest; each wing's route and settings; every reset path (defeat, retreat, reprieve, suspend); runs with no delver; guardian policy; the settlement's progression; pastime fixtures; the optional stays optional | playbook P15 evidence | `tests/` | Planned |

## Rules kept

- Not one hundred mandatory battles; never restarting from room one; help never withheld; nothing escalates after
  mistakes; no final collectible behind a perfect run (D9's "must not be" list).
- A random visit (a delver, a variation) is never counted as a mandatory trial.
- Grow never changes the global profile; for Advanced players it means nuance, genres and conflicting perspectives,
  never an invented "native" tier.
- Revealing an illustration marks it viewable, never witnessed or completed.
- No currency, no upkeep, no timers in the settlement; disputes may end in disagreement kept.
- Kasane never appears as a guardian (S7). The Hush is ended; only its effects remain (S10).
- Every displayed kanji has furigana; every new Japanese line goes through the review ledger (self-review only).
