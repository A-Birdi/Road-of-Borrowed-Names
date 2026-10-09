# 06 · The world: living towns, roads, return trips and the sea

*Expansion plan, draft 9 (2026-10-09, after Robin's seventh round of answers). Planning only.*

## What exists today (audit summary)

- **Shape.** The world is one chain of regions, each opened by the previous chapter's flag:
  - Reedwake → Saltglass → Cinder Orchard → Snowbell → Lanternfall → the Archive;
  - the side area Koharuno;
  - 91 authored maps.
- **Fast travel** lists five town hubs (`content/00_world.js:63-68`). **Defect (fixed on 2026-10-07,
  with a test that every charted road can be walked):** the route chart drew a Cinder–Lanternfall road that could
  not be walked.
- **NPCs are placed by flags.** One person may have several map entries with exclusive conditions; they walk to and
  from exits when flags change (`engine/50_world.js`). There are **no schedules or routines**, and "where someone
  was last seen" is kept only for the session.
- **There is no day or night cycle.** Night is set per map by story flags (`rw_night`, `sg_evening`, `sb_evening`)
  or scene presets. Nothing reads the clock.
- **No "where is X?" system exists.** The quest guide (gold diamond, edge arrows, chart mark) computes the next step.
- **Boats are scene props.** A choice, an illustrated sequence and a warp. There is no vehicle, sea map or sailing.
- **Later content only adds to earlier maps** (`talkFirst`, `addNpcs`, `addProps`); it never rewrites a scene
  (docs/CONTENT.md §10).

---

## W1 · Evolving communities

**What and why.** Robin: "truly Umazing" [R1]. After wider story beats, old towns are reshaped, NPCs have new
dialogue and activities, and revisits offer more than first conversations. Astra: make revisits meaningful without
making a missed conversation feel like lost content.

**Approach.**
- **Change beats per town.** Every town gets 2–4 *change beats* across the whole game, not just a post-story state.
  A beat is a bundle:
  - map edits (a new stall, a repaired bridge, a printed notice board);
  - new or moved NPCs;
  - new dialogue;
  - a new small activity or quest;
  - an optional letter announcing it.
  Each is triggered by a story flag elsewhere: "after Manybridge's festival, Saltglass's quay has city traders."
- **The S1 phase table** names the beats, so content reads `if: 'phase>=mid'`.
- **"What's new" is gentle.** The Journey shows a one-line hint per changed town ("Saltglass has changed since you
  last visited"). It never lists the changes. It can be turned off.
- **Nothing is missable.** A beat's content stays until seen. Later beats add to it, never replace it. A changed
  NPC still offers the old topic through "Talk about…".
- **Each new region's own after-states** are in [07_REGIONS.md](07_REGIONS.md). Existing towns gain beats from the
  new chapters:
  - **Reedwake:** a printed notice board from Manybridge; later, a ferry timetable that includes Kotonoha.
  - **Saltglass:** Ōmi's courier boat in the harbour; city traders; Fuku's bench; sea-trial gossip.
  - **Existing later towns:** beats in sealed note S8.

**Pros.** Directly Robin's favourite system; uses existing map and flag machinery.

**Cons.**
- Authoring volume across every town.
- Testing every beat at every chapter: phase fixtures, S7.

**Effort:** L (content-heavy).

---

## W2 · NPC routines

**What and why.** Robin [R1]: a variable routine system where, after a region's events, residents shift what they do
and where they go, triggered by story beats, by defeating something outside the map and returning, or by walking far
enough (2–3 or more screens away) that time seems to have passed. A day/night system was floated. Astra: coherent
routines; don't relocate arbitrarily; never reshuffle as the player approaches.

**Approach.**
- **Routine slots.** Each routine NPC has 2–4 *slots*, each a place plus an activity: "at the stall, selling";
  "on the quay, checking deliveries"; "at the teahouse, chatting with Hana". Slots are ordinary map entries with
  exclusive conditions on a per-town routine counter, so the "one person, one place" rule holds.
- **The routine tick** advances a town's counter (seeded choice of each NPC's next slot, S2) when any of these
  happens:
  - the player has been **at least three map transitions away** and comes back;
  - a story flag the town cares about is set;
  - the party rests at an inn.

  **Never** while the player is on that town's maps, and never mid-conversation.
- **Pinned while needed.** A person whose quest step is active stays put, or keeps a stated slot until the step
  resolves.
- **Existing walk-in and walk-out movement** already makes changes look natural.

**Pros.** Life and variety with no clock. Robin's own trigger idea.

**Cons.** People can be harder to find, which W3 answers.

**Effort:** M (engine), plus content per NPC.

---

## W3 · "Have you seen…?": finding people naturally

**What and why.** Robin [R2 §5]: ask nearby people whether they've seen someone; not everyone knows; some aren't
friendly; walking around shouldn't be too hard; the gold diamond helps; "a combination of search-support systems
can make this go far."

**Approach.**
- **A "Have you seen…?" topic** on talkable townsfolk (not every NPC), offering the people the player knows. The
  answer comes from the world, and is one of four kinds, kept distinct as Astra suggested:

  | Answer kind | When | Example |
  |---|---|---|
  | **Current sighting** | The target is on this or an adjacent map now (computed with the existing `mapsWith`) | 「さっき、工房に入っていきましたよ。」 |
  | **Usual routine** | The speaker *knows* the target: authored relations (family, colleagues, neighbours) | "She's usually on the quay after deliveries." |
  | **Uncertain recollection** | A loose acquaintance | "I think he mentioned the upper gate…" |
  | **Refusal / doesn't know** | Unfriendly or a stranger | "Why should I tell you?" |

- **Clues in the world:** a closed stall's sign (「休憩中。港にいます。」, a tiny document mission); a tool left at a
  workbench; a colleague.
- **Notes, not live trackers.** Answers go into Known details as *notes* ("usually on the quay", unverified), never
  a live marker. The gold-diamond guide stays the explicit, optional navigation aid.
- **Save "last seen by you".** `W.seenOn` is kept only for the session today; storing it gives the player a
  truthful "you last saw her at the teahouse."

**Pros.** Language use (asking, understanding answers) with a real purpose; natural.

**Cons.** Writing the relations table per town.

**Effort:** M.

---

## W4 · Day and night: evaluated, not recommended first

**Options:**

| Option | What it is | Pros | Cons |
|---|---|---|---|
| **A. None (routines by ticks, W2)** | Today's flag-set night stays | No content multiplication; no clock | Towns never change light by themselves |
| **B. Rest-advanced phases** | Resting moves a town through morning, day, evening and night; ambient light and routines follow | Atmosphere; evening strolls in Steamhollow and Manybridge | Every town needs 4 lighting states and 4 sets of placements. The "night leak" test must change. Story scenes must pin a phase. Large |
| **C. Real clock** | | | Excluded: wall clock, pressure, missable events |

**Recommendation.** **A** now. Use **B only inside new regions** where it carries the experience: Manybridge's
festival night, Steamhollow's evening yukata walk. These are *story-set* phases using the existing `alt` mechanism,
not a global cycle. Revisit B after Robin's playthrough.

---

## W5 · Road events

**What and why.** Robin [R1]: between regions, an event that always happens the first time you enter a road,
seems urgent, and can always be solved there with what you have. Ignoring it or leaving lets it disappear for a
while. Once solved, repeatable variants can turn up at random, keeping the lesson. [R2 §5]: no renewable resource
rewards. Astra: the unique event must stay available until it is resolved.

**Approach.**
- **Every road** (the six existing and the four new) gets:
  - **one unique first-arrival event**, a small self-contained scene with a stated problem:
    - a stranded traveller who speaks only one dialect;
    - a cart with a broken wheel and a repair card;
    - a lost child who knows only landmarks;
    - a toppled waystone;
    - a procession that has lost its order;
  - **a pool of 3–4 variants** that appear afterwards on a seeded chance (S2) of about one visit in five.
- **Looks urgent, has no clock.** Reading takes as long as it takes.
- **Leaving defers it.** The event withdraws and **re-offers itself on the next eligible visit**, recorded as
  "unfinished" in the Journey. The unique version is never lost to a generic one.
- **Rewards:** a scene, a Known detail, a keepsake for some, and a stamp for solving all of a road's events. Never
  consumables.
- **Existing roads:** the events trigger on the *next* eligible entry in older saves (content adds, never rewrites).

**Effort:** M (system), plus about 50 small events.

---

## W6 · New abilities reopen old places ("return keys")

**What and why.** Robin [R1]: "New abilities or words could be brought backwards to previous regions to help
resolve new/old sidequests, access other hidden areas that require a resolution with a newer mechanic first."

**Approach.**
- **New inkweaving words in new chapters**: ordinary Japanese words with their ordinary meanings, as the content
  rules require; only the effect is fiction. Candidates:

  | Word | Meaning | Its effect (proposed) |
  |---|---|---|
  | はし (橋) | bridge | Spans a gap. In battle, extends your ward to a guest or object. On the map, crosses gaps |
  | すみ (墨) | ink | Restores faded or blanked writing for a while. Battle: stains paper creatures, softening their blows |
  | みち (道) | way, road | Reveals a path in fog. Battle: guides a lost guest or neutral to safety |
  | ゆ (湯) | hot water | Thaws; restores a little resolve; on flame spirits makes steam |

- **Sealed spots in old regions.** About 3 per region, each needing a later word or mechanic: a fog-hidden path, a
  faded mural, a gap across a river. They lead to hidden rooms, Roadside Keepsakes, old side-quest endings or road
  shortcuts.
- **They are visible from the start**, with an in-world hint ("The ink here has faded beyond reading"), so returning
  is a remembered promise, not a hunt.
- **Hints:** the Known details page lists the sealed spots the player has noticed.

**Effort:** M.

---

## W7 · The Harbourmaster's long quest and sailing

**What and why.** Robin [R1]: after Chapter 2, a deal with the Harbourmaster begins a long quest reaching into
the later chapters. Its reward is a boat and a sailing activity, with:
- a travel log;
- random events;
- direct, manual interaction with the ship;
- learning about the sea;
- no way to fail travel;
- optional skipping;
- access to ports reached in the story;
- a mysterious island hinted at by folklore, reachable later by everyone.

**Canon hooks (Chapter 2, spoiler-safe).**
- **Harbourmaster Ōmi** is in Saltglass: brisk, fair, thirty years in the port. She suspends the ferry until its
  board tells the truth.
- **Tetsu**, the old ferryman, and **Shiori**, the tide-keeper with her tide book.
- **Fuku**, whose late husband's boat, the *Chidori-maru*, still sits at the quay.
- **The board's eastbound destination is never named**: in this plan, Manybridge.

### The quest: "A Licence for the Open Sea"

| Stage | When | What happens |
|---|---|---|
| 1. The deal | After Chapter 2 | Ōmi needs a courier boat for the coast. If the player restores an old hull and earns a licence, it is theirs to sail, carrying the coast's post. Fuku, after a conversation about her husband, entrusts the *Chidori-maru*'s hull (her choice; there are other boats if she declines) |
| 2. The yards | Manybridge | Shipwrights in the canal yards; the sail-maker; **the player names the boat** (kana, painted on by Blockprint Row's sign-writers; naming is this world's magic). Help is earned through favours: there is no currency |
| 3. Sea trials | A return to Saltglass, new Chapters 5–6 | Tetsu teaches sea words (帆, 舵, 錨, 潮, 風向き); reading Shiori's tide book; a short trial voyage around the point |
| 4. The licence | Saltglass, new Chapters 6–7 | Ōmi's licence exam: a document mission and a short interview (register with an official). It cannot be failed permanently: retry at once with feedback |
| 5. Maiden voyage | New Chapters 7–8 | First voyage to **Sazanami** and **East Landing**, then the hint of the island leads to **Kotonoha**: an early visit, before its main chapter (9) |

**Everyone gets there in Chapter 9.** Kotonoha is now a main chapter (C-01): players who skipped the quest reach it
by **public ferry** in Chapter 9 and miss nothing essential. They can still finish the quest afterwards and get the
boat.

### Sailing itself

- **Choose a destination** on the sea chart from ports already reached: Saltglass, Manybridge, Sazanami, East
  Landing, Kotonoha, and Reedwake's river landing for the small craft.
- **Two ways to travel, each switchable at any time:**
  1. **Sail yourself.** A top-down sea map with direct control. Steer with the movement keys or touch, set the sail
     to the wind (a wind arrow and a pennant show it), use the chart. **Untimed:** nothing pursues, nothing runs
     out, the boat cannot sink or be lost. A poorly set sail just makes the trip longer.
  2. **Let the crew sail.** Skip to arrival, as Robin asked.
- **Sea situations** happen on legs of the voyage (seeded, S2), in either mode:
  - a passing ship hails you (read its flags, answer its call);
  - fog rolls in (read the lighthouse signal, or use みち);
  - floating cargo with a label to read;
  - a creature on deck (an encounter);
  - a sea bird with a message;
  - a seal on the rocks (a sight for the log).

  **Unique first-time situations** per route, as with road events. **Story situations are never skipped:** in
  "crew sails" mode they interrupt the skip, so skipping never forfeits content.
- **Something goes wrong on board** (Robin, C-43): a sail tears, a line frays, the rudder pin works loose, a hatch
  leaks. The player can **fix it now**, writing or choosing the part and what to do with it (帆, 綱, 舵, 縫う, 結ぶ),
  or **at the next port**, where a shipwright helps. Until then the boat simply sails a little slower. The words
  come from the boat itself, so seafaring vocabulary is learned by handling it.
- **No failure, without saying so.** The boat never sinks, nothing is lost, and the crew's calm lines carry the
  message ("She'll get us there either way"; "We'll patch it in port if you'd rather"), never a warning or a "you
  cannot fail" label (Robin).
- **The travel log** (K2): every voyage writes an entry: route, sights, words learned, people met. It becomes a
  section of the travel volume.
- **Fishing from the boat:** a new station for the existing pastime.
- **Learning about the sea:** weather, tides, directions (北東), sail terms. Taught by Tetsu, practised on voyages.

**Pros.**
- Robin's strongest region idea.
- Makes the world feel larger.
- A home base (W8).

**Cons.**
- A new traversal mode (sea map, boat physics, controls).
- Risk of "excessive walking" at sea (spec line 56), which skipping answers.

**Effort:** XL (quest, sea maps, mode, events, ports).

---

## W8 · The boat as a home: the travelling reading room (A57)

- **The cabin:**
  - a shelf for keepsakes;
  - the travel volume on a lectern;
  - a **Distractions corner** (shogi board, karuta, the tactics board, festival games kept after the festival);
  - a bunk to rest (full resolve, like an inn);
  - companion conversations and the pet aboard.
- **No upkeep, no furniture economy** (Astra: a place for preparation and reflection, not maintenance).
- **Players without a boat** find the same Distractions corner in the Manybridge festival hall, so no pastime is
  boat-exclusive.

**Effort:** M.

---

## W9–W17 · Exploration verbs (Astra's group B, all rated solid by Robin)

| # | Verb | What the player does | Where |
|---|---|---|---|
| W9 (A17) | **Notices that change behaviour** | Compose or repair a notice from supported pieces; people visibly follow it (a queue forms on the left; a cart takes the other road). Different valid notices work differently | Manybridge (stalls, the lock); Steamhollow (house rules); the new settlement |
| W10 (A54) | **The press** | Set, print and circulate stories or notices; readers react to what's in them | Manybridge B (system in [08_CULTURE.md](08_CULTURE.md) C15) |
| W11 (A14) | **Courier route planning** | Plan several deliveries around who is where and when (phases, not clocks); several plans work | Manybridge barges; the Cloudroad relay |
| W12 (A15) | **Repair jobs** | Inspect, read instructions, choose a tool, test. Materials come with the job: no gathering | East Landing; Steamhollow vent pipes; restored lamps (D2) |
| W13 (A11) | **Connected inkweaving** | Water, airflow, weights across connected rooms; change one, trace the effect | Undercroft Locks; Steam Vents; Root Hollows |
| W14 (A16) | **Observation-first mechanisms** | Watch a machine's pattern (pausable), inspect a diagram, choose the next adjustment | The Understage; Hall wing 3 |
| W15 (A18) | **Creature routing** | Redirect a creature with light, shade, sound or a written sign rather than fight it | Cloudroad pack horses; Kotonoha leaflings |
| W16 (A19) | **Layered-site investigation** | Compare an old plan with today's place to find what's missing | Manybridge's Lost Contract; East Landing |
| W17 (A20) | **Stage-blocking** | Place actors and props from directions; test; revise the misunderstanding | Playhouse Row rehearsals |

All of these extend **Field Inkweaving's data model** (response family × object × state, three free hint layers) and
the **case engine** (evidence, hypotheses) rather than adding new engines.

**Quiet puzzle spaces** (Astra): while the player is examining a mechanism or comparing clues, roaming creatures
don't interrupt. Puzzle rooms have no wandering foes.

**Effort:** L in total, spread across regions.
