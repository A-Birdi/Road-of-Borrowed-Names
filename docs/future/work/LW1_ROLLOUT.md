# LW-1 · The Living World across the journey (C-87)

Astra's LW-1 audit (2026-10-12) found the Living World's engines built and tested on fixtures, but hardly any of
the ordinary journey using them: one town registered, no relations, road events or return keys, and the World
Proof's working people behind the development switch. Robin: reconcile it to the full scope of the expansion plan
(C-87). This file is the register: what the journey already had that does the same job (it counts, and is not
duplicated), what was authored to fill the gaps, and how each part is tested.

Four states are kept apart for each part, as the audit asks:
**engine** (the mechanism works on fixtures) · **content** (real people, places and scenes authored) ·
**reachable and tested** (an ordinary journey meets it; a test drives the real content, not a stand-in) ·
**presentation reviewed** (looked at, at play scale). "Reviewed" here means internally reviewed (AC-1 for art);
Robin's review comes at completion.

## 1. What the journey already had (the register, before the rollout)

Mapped by reading every region's content (a read-only pass over `src/content/`, 2026-10-12). Story placements that
change with flags are everywhere; most of the journey's "after" content is new lines on the same people.

| Region | W1 changes | W2 routines | W3 asking after | W5 road events | W6 return keys | Verbs (W9–W17) |
|---|---|---|---|---|---|---|
| Reedwake | talk lines; cellar hatch (`ed>=2&ch2_done`); Kōji's river boat after `mb2_done`; Yasu at the lost path | none | the lq chain | none | **the blank lantern** (lq): visible from Ch1, opened by a name gathered in Saltglass and Cinder Orchard | F1 discovery |
| Saltglass | the north road opens after `mb2_done`; Tetsu's licence stages; case props | story moves only (Shiori, Genzō, Sōta) | the licence chain | closures | the north exit | F2 |
| Manybridge / Blockprint | in-chapter moves; Tokubē leaves for Steamhollow | none | **Ichi, the bridge census, the press** | wanderers | the bricked door (W16) | **W9 stalls (talk only), W10 press, W11 barges, W13 locks, W14 Understage, W16, W17** |
| Cinder Orchard | the village after `ch3_done`; Heita "came through Manybridge" | none | partial | none | the ice room (same chapter) | F3 |
| Snowbell | day / evening / storm / morning placements for ten people | phases only | none | Chigusa's stall | the east drift | F4 |
| Keepers' Road | postgame | Hisae by night; Kikyō, Iwa, Seiji move | none | **once-only events** (fallen cedar, Iwa's stamp book, the moss lantern, wanderers) | **the Shuttered Hall door** | the moss-lantern procedure |
| Lanternfall | Jinpachi's calls; the north mist until `yn_done` | none | none | the mist | **the waystone "…路"** until `ko_done` | F5 |
| Kotonoha | leaves of older chapters appear | none | **the rumour told several ways** | wanderers | — | the Root Hollows (W13) |
| Sazanami | Isaku after `ch4_done` | none | none | none | none | side tasks |
| East Landing | **changes while you are away** (`el_pending`/`el_away`): silt and planks become a pier and a bell | none | none | none | none | **the notice (W9), the repair (W12)** |
| The sea | — | — | — | **sea situations**: one first time per route and weighted variants (`sea/21_situations.js`) | — | **repairs (W12), the mailbag (W11)** |
| Cloudroad | the Barrier becomes a teahouse (postgame) | weather phases | **route reports with certainty** | **the richest set**: the ford, the washed-out bridge, the rockslide, the fog ox, the fog porter, wanderers, the drift | — | **route planning, the relay (W11), pack horses (W15)** |
| Steamhollow | the guild after the quarrel; after the kettle | none | the masseur | first arrivals | — | house rules (read only), the vents (W13) |
| Archive road | placements by ending; colour drains (12-chapter) | none | none | none | none | F6 |
| Ashihara Shinden | grows by its own buildings | **7 residents × 2 slots** | none | none | none | **its notices (W9)** |

## 2. The rollout

### LW-01 · The World Proof's working people are the journey's own — done
`src/engine/67_worldacts.js`: Yasu fishes from his pier, Tomo folds the washing, Kiyo sells fish, in an ordinary
journey, with the light on or off (the development switch and the light's kit no longer decide it). Each works only on
their own placement standing on their work's tile (`AT`): Yasu waiting by the lost path (`yasu_bank`) has no rod, a
wanderer away from their place has no basket; and not on a story's evening (`rw_night`, `sg_evening`). The idle
habits leave a working person alone and a working wanderer stays at the work (`src/engine/50_world.js`); the rod,
float, basket and parcels are drawn with the light off too.

### LW-02 · The journey's people at their work — done (47 people, 14 regions)
`src/content/zzz_living/00_work.js` gives curated placements a complete action of their trade
(`src/engine/67a_perform.js`), each with what it touches in front of them, reachable to talk to
(`RB.perform.check`). Ten actions were added for the towns' trades: plane (carpentry), hammer (the forge), stir (a
pot), serve (tea at a counter), polish (glass), knead (dough, clay), mend (nets), tally (counting into a book), hawk
(a stall), prune (a tree). The manifest (`C.work`) names each person and why the work is theirs; a few were moved one
tile, or given the bench, post or table their work needs. People left still on purpose are listed
(`C.stillOnPurpose`): Denji at his ice hole, the channel watch, Asa by her terrace signs, Sōta waiting for planks,
Tsuru. A person works only on their own tile and not on a story's evening unless the work is the night's (the
lamplighter, a reader). Ashihara's residents now change what they do with where they are (Shō at the moved forge,
Mohei's stall wherever the notice put it, Kotoe reading under the pine, Mitsue's list).

### LW-08 · "Where you last saw" — done
`src/engine/50_world.js` `sighted()`: someone is recorded as seen only while actually in view in the world (inside
the screen, fully there), checked a few times a second while the world is in play; entering a big map no longer
"sees" its far side, a menu or a reload records nothing by itself. What someone told you stays a note
(`src/engine/53_town.js` `note`), apart from what you saw.

### LW-09 · A placement that moves under the same id — done
`refreshActors()` kept the old figure (same id) but not its place. Now a person whose placement moved on the map
walks to the new place (or is simply there while the map is appearing, or behind an illustrated sequence); a scene
staging them keeps them where it put them.

### LW-04 (part) · Something new to say comes first
An asker (`asks: true`) offers Talk / Have you seen…? only once their current talk has been heard; a scene not yet
heard (the story's next step, a quest's) is said at once, never behind the question.

### LW-07 · The exploration actions (W9–W17): the register, before filling the gaps
A read of every place the plan names (2026-10-12). None of the journey's places used the templates of
`src/engine/55b_verbs.js` (only the development fixtures did); each place had its own bespoke scenes, challenges or
procedures. Status against the plan's description (Y done, P partly, N not):

| Verb | Place | What exists | Status |
|---|---|---|---|
| W9 notices change behaviour | Ashihara Shinden | the well and market notices move the washing, Taki, Natsu and Mohei's stall (two valid notices place them differently) | **Y** |
| | Manybridge's noodle stalls | a notice per stall is composed (forge), but only narration follows: no queue, nobody moves | P |
| | Manybridge's lock | the rules are read; nothing is composed | N |
| | Steamhollow's house rules | read and answered; nothing composed, nobody's behaviour changes | N |
| W10 the press | Blockprint Row | compose, print, post; readers react in dialogue only; nothing in the world follows | P |
| W11 courier planning | Manybridge barges / the Cloudroad relay / the sea mailbag | one delivery per sentence in a fixed order; a road choice per leg; two hand-overs in any order | P / P / N |
| W12 repair jobs | East Landing / Steamhollow's vent pipes / restored lamps | jobs done by others offscreen; a single click; read-and-act | P / N / P |
| W13 connected inkweaving | Undercroft Locks / Steam Vents / Root Hollows | linear per-map procedures; airflow within one map; a word-lock sequence | P |
| W14 observation-first | the Understage / Hall wing 3 | instruction-following procedures; a scheduling puzzle | P |
| W15 creature routing | Cloudroad pack horses / Kotonoha leaflings | a two-option menu with no language; battles | N |
| W16 layered sites | the Lost Contract / East Landing | one text question, no plan laid over the place; nothing at East Landing | P / N |
| W17 stage-blocking | Playhouse Row rehearsals | one of three ready blockings with a preview | P |

The gap-fill puts real instances of the templates at these places (production gates, real people, the
places' own maps), beside what each place already has, and is recorded here when done.

### Still to do in this rollout
LW-03 routines for the main towns; LW-04 the relations table and askers; LW-05 change beats; LW-06 road events and
return keys; LW-07 the verbs register; the production tests replacing the empty-registry expectations.

## 3. Tests

- `tests/unit/perform.test.mjs`: the manifest against the real placements (every performer in the manifest and
  every entry carrying its work; every map passes `check()`; people at work in every region; each contract valid).
  The old expectation that only the gallery performs is replaced.
- `tests/e2e/world.mjs`: Kiyo works on the ordinary page and with the light Off.
