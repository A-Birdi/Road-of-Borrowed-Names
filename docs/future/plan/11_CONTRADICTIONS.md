# 11 · Contradictions and open decisions

*Expansion plan, draft 1 (2026-10-07). Planning only. Spoiler-safe.*

Robin asked for every contradiction that hasn't been answered yet, "like the illustration book we covered", with
ideas for covering each. That one is the model:
- **The tension:** chapter passwords for gallery access contradicted the spec's ban on share codes (line 238).
- **The resolution:** Robin dropped passwords for an always-viewable Main Menu gallery [H1].

The register has three parts:
- **A. Decisions that block a feature.** Robin's call is needed before building.
- **B. Tensions this plan resolves.** Please confirm or overrule.
- **C. Already resolved.** Recorded so nobody reopens them by accident.

Each entry gives: the two sides (with sources), why it matters, the options, the recommendation, and what is
needed.

---

## A. Decisions that block a feature

### C-01 · Six chapters, or ten (or twelve)
- **Sides.** Spec line 38: "Build six substantial chapters." Robin [R1]: "a solid 10, or… 12."
- **Why it matters.** Every inserted chapter touches flags, numbering, music, Bond, saves and the spec's playtime
  target.
- **Options:** keep six and grow only the postgame (10_STORY §3 C); insert four (D, recommended); insert six for
  twelve.
- **Needed:** Robin amends spec line 38 (and the playtime target at line 36) to the chosen count.

### C-02 · What happens to saves already past an inserted chapter, including Robin's
- **Sides.** Inserting chapters means existing saves skip them. Migrations "must never invent history"
  (ADDENDUM_CONTRACTS). Robin's own campaign will be finished before the expansion lands. The project rule is "Do
  not… require New Game".
- **Options** ([10_STORY.md](10_STORY.md) §9): i. detour framing; ii. Chapter Journey; iii. NG+; iv. postgame visit
  only.
- **Recommendation:** iv + ii. Every save visits the new regions' after-states at once; the story chapters play
  through a Chapter Journey or NG+.
- **Needed:** Robin's choice.

### C-03 · Restart-from-the-beginning on dungeon failure, and the spec's checkpoints
- **Sides.** Robin [R2 §2]: "If the player fails a dungeon, they should simply be able to restart from the
  beginning." Spec line 128: "Defeat should return the player to a sensible checkpoint without erasing learning
  progress or demanding repetitive grinding."
- **Recommendation:** the full restart for **optional** dungeons, announced on their preview card. **Story
  dungeons keep checkpoints**, plus companion help (E19).
- **Needed:** Robin confirms that "ordinary dungeons" meant optional ones.

### C-09 · Encounters that can't be won by Unravel alone
- **Sides.** Content rules: "Every battle must be winnable with Unravel alone" (AGENT_COMMON, CONTENT, ATLAS;
  validators and tests enforce it). Robin: puzzle battles, mediation, procedures, objectives [R1, R2 §1].
- **Recommendation.** Define new *encounter types* (procedure, social, objective) with their own guarantee: "Every
  procedure, social or objective encounter has at least two distinct ways to its conclusions, never needs
  handwriting, and can always be left without penalty." Ordinary combat keeps the Unravel rule.
- **Needed:** amend the rule's wording to cover combat only.

### C-12 · A temporary separation from the companion
- **Sides.** Robin [R2 §1] allows a companion to stay behind, be captured or be briefly incapacitated. Spec lines
  70 and 290 say "exactly two adventurers" and "no event creates a third party member"; HX52 says no operation
  removes them.
- **Recommendation.** Amend: "Exactly two adventurers after commitment, except a short authored separation followed
  by reunion." The proposed scene is the surety at the Mist Barrier ([10_STORY.md](10_STORY.md) §8).
- **Needed:** the amendment.

### C-13 · Mastery stars per input type and "no help-only rewards"
- **Sides.** Robin [H4]: stars per input type, awarded below 30% assisted questions. PRACTICE_CONTRACTS line 125:
  "No speed-only, handwriting-only or no-help-only reward"; spec lines 134 and 136: no mode is a lesser way to play
  or denied ordinary rewards.
- **Resolution.** Robin called them "inconsequential gold stars". If they unlock nothing and every input type has
  its own equal star, they are *records*, not rewards ([05_LANGUAGE.md](05_LANGUAGE.md) L3).
- **Needed:** add to the contract: "Mastery stars are records of demonstrated independence per input type; they
  unlock nothing."

### C-14 · Is choosing the recognizer's second guess "assisted"?
- **Sides.** Robin [H4]: today choosing a candidate other than the recognizer's first counts as assisted, and that
  "would need ironing out first". Spec line 158: "A manual correction should allow progress while being recorded as
  assisted."
- **Options:**
  1. **Recognition repair.** A new category: picking among the recognizer's own candidates for the player's strokes
     is *input repair*. It does not count towards the 30% for any star. It is still recorded, so it is never claimed
     as unaided recognition.
  2. **As (1), with a limit:** only the top three candidates count as repair; anything further down, or a chart
     pick, counts as assisted.
  3. Keep it as assisted (today).
- **Recommendation:** (2). It credits recognisable handwriting while keeping lookups honest.
- **Needed:** Robin's choice, and an amendment to spec line 158 defining "recognition repair".

### C-17 · Timed or streak-based festival games and the no-clock rule
- **Sides.** Robin [R1]: personal streaks and high scores in festival minigames are fine. PRACTICE_CONTRACTS line
  123: "No clock anywhere except an explicitly started fishing response entry" (a unit test enforces it); spec line
  218: never require fast reactions.
- **Recommendation.** Festival games are untimed by default, with high scores counting moves, accuracy or length.
  Where speed is the game (taiko), add an **opt-in timed mode** exactly like fishing's.
- **Needed:** amend the contract to allow opt-in timed modes in pastimes, under the same conditions as fishing:
  off by default, paused by help, and never needed for anything.

### C-18 · The Atlas adapts during a run; Robin's rule says expeditions are fixed
- **Sides.** Robin [R2 §3]: a generated dungeon is fixed at generation and does not change after mistakes. Today
  the Atlas picks objective content on first contact and adds the player's weakest items to every encounter's pool
  mid-run.
- **Recommendation.** Choose all of a run's learning content at its start and store it. The run then still targets
  weak items, but stays fixed.
- **Needed:** Robin's approval to change existing Atlas behaviour.

### C-21 · How big the game may get
- **Sides.** The single file is about 13 MiB. The travel volume's painterly, animated illustrations with player
  layers could add 15 MiB or more. Robin plays in Firefox, which has never been tested. Spec line 18 asks for
  code-driven visuals; the approved Harmony art is the precedent for code-drawn painted assets.
- **Recommendation.** Set per-feature budgets (S6). Run a Firefox load test of a padded build *before* committing to
  the illustration count. Store painterly art as lossy WebP, decoded only when opened.
- **Needed:** Robin's ceiling (about 30 MiB is proposed).

### C-35 · Fixing the learning record changes existing behaviour
- **Sides.** The audit found:
  - the promotion rule is looser than its comment says (one typed or handwritten attempt *ever*, even a wrong one,
    unlocks choice-only promotion);
  - Foundations copy steps record as clean handwriting;
  - the activities' Translate flag never resets.
  Fixing them makes evidence honest, but some items will promote more slowly than before. Existing records stay
  as they are; nothing is lost.
- **Needed:** Robin's approval. These could also be fixed *before* the expansion, as quick wins (12_ROADMAP.md
  Phase 1).

---

## B. Tensions this plan resolves (please confirm or overrule)

| # | Tension | Sides | This plan's resolution | Where |
|---|---|---|---|---|
| C-04 | Persistent health vs mistake costs that never compound | R1 wants health and status to persist; spec line 128 | Carry over only what tactics cost; restore what language mistakes cost at each encounter's end | D2 |
| C-05 | Stationed resources vs resource softlocks | R2 §2; spec line 216 | Exits always reachable; leaving is always possible; defeat applies the expedition rule | D2, D3 |
| C-06 | Suspend in the Trials vs six visible slots and no hidden saves | H2; spec lines 224, 228, 238 | A per-slot recovery-style record, removed with the slot, never listed as a save | D9 |
| C-07 | Ambushes vs visible, avoidable foes | R1; AGENT_COMMON | Ambushes only in dungeons whose preview says so; telegraphed on the map | E20 |
| C-08 | Arrivals and wanderers vs "Relaxed: one creature" and rules without randomness | R2 §1; COMBAT_NOTES | Relaxed never sees hostile arrivals; every random draw is seeded per save and stored before the battle | E2, S2 |
| C-10 | Lasting side-quest outcomes from "choosing incorrectly or waiting" vs no irreversible punishment for honest mistakes | R1; spec line 208 | The game shows the intention it understood before a committing action; recognition failures never commit; Wait counts only when chosen | E17 |
| C-11 | NPC deaths vs protected people | R2 §1; spec lines 94, 54, 242 | Never unchosen companion candidates, never people the player helped in a way that undoes their help; rare and authored | E17, 10_STORY |
| C-15 | A listening star using the device voice vs no listening validation from synthetic speech | H4; spec lines 280, 218 | Labelled "listening practice with your device's voice"; offered only where a voice exists; absent, not missing, elsewhere | L3 |
| C-16 | A "Distractions" tab vs never launching place-based activities remotely | R2 §6; practice index rule | The list lives in Company › Pastimes; companion games start anywhere safe; place games at their place | K7 |
| C-19 | Seals that survive deleting a save vs deletion removing a slot's data | R1's original wish; spec lines 228, 252 | Seals belong to saves; viewing never depends on any save (H1), so nothing is lost but the mark. **Alternative:** a device-level "ever witnessed" record, which needs a spec amendment | S3, K4 |
| C-20 | Always fully viewable vs spoilers | H1; Robin's own wish to avoid spoilers; HX52; Astra | Veiled until revealed; one press per page or chapter; a setting removes the veil. H3 replaces HX53's "event-time appearance" for the Main Menu | K5 |
| C-22 | Inserted chapters vs the strict music intensity ladder | audio rule ZM2 | Re-tier battle and boss themes across ten chapters; keep the loudness ceiling | 07_REGIONS |
| C-23 | Achievements without trackers vs counting milestones | R1 | Curated stamps only; natural milestones allowed (Robin's own example); no visible counters towards them | K1 |
| C-24 | Printing stories "without restraint" vs never faking understanding of free text | R1; spec lines 182, 206 | Story blocks with tags; readers react only to what the blocks say; proofreading kept separate | C15 |
| C-25 | Construction tasks vs "accept every valid answer" | R0; spec line 138; validator gap | Authored alternatives, checked by an upgraded validator | L7, S5 |
| C-26 | A dialect field guide vs "questions always use standard Japanese" and no caricature | R1; dialect rules | The guide is for understanding only; questions stay standard; native review per dialect | C5 |
| C-27 | On-screen bathing vs the player's chosen pronouns (Japanese public baths are usually separated by sex) and tone | R1; spec lines 62, 72 | Bathing scenes in private reserved baths (a real custom); towel-wrapped, nonsexual, adults; a "shown / summarised" comfort setting | R3, C13 |
| C-28 | Shogi pieces vs furigana on every kanji (and no furigana toggle) | spec line 186; project rule | Pieces show their kanji *with readings*, as Japanese learner sets do | C12 |
| C-29 | A "Grow" route for Advanced players vs no level above Advanced | R0; spec lines 168, 170 | Grow means nuance, genres and conflicting perspectives for A; never an invented tier or certification | L18 |
| C-30 | Road events that "disappear for a time" vs no missable content | R1; spec line 208 | They re-offer themselves on later visits until resolved; the Journey keeps them as unfinished | W5 |
| C-31 | Suzu "aspires to be a star" vs canon (she isn't one; she wants a double-act partner) | R1; canon | Build her stage arc on the canon: the 相方, a manzai routine with the player | C11 |
| C-32 | New Bond events vs the exact Bond table capped at 12 | company.md | Rebalance the table across ten chapters; cap unchanged; no gifts or loops | 10_STORY §7 |
| C-34 | New Game+ carryover of records | spec line 252 (must be defined) | NG+ carries stamps, seals, stars and the portfolio | K9 |
| C-36 | Spacing reviews by days vs "nothing reads the wall clock" | Astra; practice core | Read the date only to space reviews; never show overdue counts or streaks | L6 |
| C-37 | "The Ledger" means two things | Robin calls the pause menu "the Ledger"; the game calls it the *folio*, and its *ledger* is the title's list of saves | The plan says "folio" for the pause menu. Robin may prefer to rename one of them | — |
| C-38 | A day/night system vs the flag-only night design | R1 floated it; the night-leak continuity test | Not now; story-set evenings only in new regions; routines move on ticks | W4 |
| C-39 | Companion highlighting answers in story dungeons vs honest evidence | R2 §3 | Recorded as answer-supplied help; changes nothing else | E19 |
| C-41 | "Overly assisted" by weighting suspected fishing vs inferring motives | R2 §4; Astra | Robin's H4 first version (under 30% of questions assisted) decides; categories by what help supplied; weighting later | L2, L3 |
| C-42 | More than three creatures vs layout, Harmony and memory | R1; audit | Three for ordinary encounters; up to five actors in authored set pieces with a two-row formation | E12 |
| C-43 | Hands-on sailing vs untimed play, no reflex, no excessive walking | R1; spec lines 116, 218, 56 | Direct control with nothing chasing and no failure; skip at any time; story events never skipped | W7 |
| C-44 | Early island content vs "only words the player can know by then" and every profile and companion | R2 §10; AGENT_COMMON; spec lines 246, 298 | Story phase, profile and introduced concepts read separately (S1); concept gates validated | R4, S1 |
| C-45 | "Elimination" in group encounters is undefined | R1 | Defined per encounter, never the most severe by default | E17 |
| C-46 | Festival clothing vs garment shapes hard-coded in every renderer, and keepsakes that may change colour only | R1; audit | A fifth garment cut (yukata), built in all renderers, interim art now, painted layers in the art pass | C10a |
| C-47 | "Suspend only in the Trials" vs shiritori's "rest later" and the Atlas's resume | H2; audit | H2 is about expeditions; shiritori's pause is a game pause, unaffected; the Atlas resumes by ordinary autosave, consistent with H2 | D3 |
| C-48 | Chapter numbers in the consultation (5, 8) vs the renumbered ten | R1; the context note says they were illustrative | The plan maps them: boat around new 6–7; island for everyone from new 8 | R4 |
| C-49 | Tsuru as the Trials' lore source vs her canon voice | R1 | Fits: she had a teacher, and keeper lore is hers; lines in her dry voice | D9 |
| C-51 | The spec's 10–15 hour target vs a longer main story | spec line 36 | Restate the target after deciding C-01; measure, never claim | 10_STORY §11 |
| C-52 | A Main Menu illustration of one companion when Continue travels with another | H3; Astra | The other participants stay fixed; only the player's look follows Continue | K2 |
| C-53 | Superboss and Trials rewards vs "no exclusive essentials" | A30; R1; spec line 126 | Stamps, illustrations (revealable) and cosmetics only | E16, D9 |

---

## C. Already resolved (do not reopen without Robin)

| Topic | Resolution | Source |
|---|---|---|
| Gallery passwords | Dropped; the book is always viewable from the Main Menu | H1 (passwords also clashed with spec line 238) |
| Player appearance in illustrations | Continue save's look on the Main Menu; the player's own in game | H3 (replaces Astra's event-time appearance) |
| Suspend | Only the Trials; never from a battle | H2 |
| Mastery stars, first version | Per input type; under 30% of questions assisted | H4 |
| Testing cadence | F/Ren routinely; the 16-combination matrix only on request | R2 §10, 2026-10-06 |
| The final art pass | Near the end, once content is settled | R2 §10, H6 |
| Exclusions | Crafting economy, collectible card game, daily chores, global difficulty scalar, correctness damage, politeness score, streaks outside recreational games, AI grading, RNG drops, pronunciation scoring, battle lanes, route editor, potion satchel, troupe death, gallery accounts | R1, R2 |
| Onsen on screen | Allowed, towel-wrapped and nonsexual | R1 |
| Ordinary dungeon failure | Restart from the beginning (scope: C-03) | R2 §2 |
| Generated dungeons | Fixed at generation; previewed before entry | R2 §3 |

---

## D. Existing defects found by the audit (not expansion work)

Found while reading the code for this plan. Each is small and fixable now if Robin wants. None has been changed.

| Defect | Where | Effect a player can see |
|---|---|---|
| Words › "Grammar met" always shows its empty message | `ui/50_menu.js:439-443` reads `RB.grammar.points`, which doesn't exist | The grammar page never lists anything |
| The lantern activity's label lookup has the same bug | `engine/77_lanterns.js:210-213` | Grammar lamps fall back to the question's own title or "A reading question" instead of the grammar point's name |
| Story activities' Translate never resets between customers or letters | `ui/75_activities.js:51,120` | Later answers in the same activity are recorded as assisted |
| Foundations copy steps record as unassisted handwriting | `ui/65_challenge.js:140,157` | Evidence of handwriting is overstated for F players |
| The promotion rule's "varied" condition uses lifetime tallies, including wrong attempts | `learn/10_mastery.js:55-60` | Items can reach the top box by choice alone after one typed attempt |
| The route chart draws a Cinder–Lanternfall road that cannot be walked | `content/00_world.js:68` | A road on the chart that doesn't exist |
| Creature patrols use `Math.random` while NPCs use seeded streams | `engine/50_world.js:719-720` | Patrols aren't reproducible in tests; harmless in play |
| Ordering validation never checks `alts` | `tools/validate.mjs:339-342` | An authored alternative could be unreachable |
