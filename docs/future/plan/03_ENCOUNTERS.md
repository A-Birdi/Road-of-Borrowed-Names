# 03 · Encounters

*Expansion plan, draft 7 (2026-10-08, after Robin's fifth round of answers). Planning only.*

Robin's diagnosis [R1]: "Given our current enemy diversity, combinations and 'approach' means little — we typically
have battle flow in an expectant pattern, which can totally feel stale quickly." The fix is not more creatures. It
is **more kinds of decisions**, each one readable, and a few genuine "Wow!" moments for people who pay attention.

## What exists today (audit summary)

- **The rules are clear and deterministic** (`engine/95_combat.js`). One language step per exchange; your response,
  then the companion's support action, then each creature's telegraphed move.
- **Responses act through global tags.** Water clears Heat on every creature; light clears the target's mist; and
  so on (`TAG_REACH` at line 112, effects at 353–431). Only an authored creature move can override what answers it
  (`intents[key].counters`).
- **Whiffs happen silently.** Water with no Heat present, rope with nothing gathered, or stone without Gust or Flood
  change nothing, and **nothing marks the card as ineffective before you choose**. Robin remembers Light being
  previewed as useless without Shroud. That was an older build, or a reading of the move's help note; the cards
  themselves do not say it.
- **Hard-wired limits:**
  - two party slots (`pc`, `comp`) throughout the rules, stage and choreography;
  - at most three creatures, with a formation that breaks at four (`ui/83_battle_stage.js:186,214,219`);
  - outcomes are only win, lose or flee;
  - phases trigger only on knot thresholds;
  - nothing summons;
  - creatures never join mid-battle.
- **Guarantees to keep:**
  - mistakes cost at most 1 per exchange and nothing in Assisted mode;
  - recognition uncertainty never causes damage;
  - defeat returns you to a checkpoint with learning kept;
  - nothing acts while you read.
- **The closest existing base for contextual rules** is Field Inkweaving's rule table: response family × object ×
  state gives an effect, with a plain fallback per family (`engine/55_fieldweave.js`). It already has a
  "routine" repeat that skips the language step without recall credit, the precedent for Robin's "Resolve this
  step".

---

## E1 · Participants with purposes (the actor model)

**What and why.** Robin [R2 §1]: wanderers who "waltz into battle" with a clear intention and target; allies who
fend off a specific creature; people who linger and engage you if you interfere with them. Astra's reading:
"each participant has a purpose, rather than everyone belonging permanently to one of two teams."

**Approach.** Generalise the battle state from `pc / comp / foes[]` to a list of **actors**:

| Kind | Controlled by | Example | Can the player target them? |
|---|---|---|---|
| `party` | the player (you) and the support menu (companion) | you, your companion | (ally effects) |
| `guest` | its own agenda | a canal porter defending their barge | ally effects only, if they accept them |
| `foe` | its pattern | creatures | yes |
| `neutral` | its agenda | a merchant caught in the middle; quarrelling parties | depends on the encounter |
| `object` | the procedure | a sluice gate, a stage trap, a lantern to protect | yes, with procedure actions |

- **Each non-party actor has an agenda**: `{wants, target, leavesWhen, reactsTo}`. For example, *drive off the Tally
  Crab; leave when it settles or flees; if the player harms the crab before it can, remark and leave satisfied; if
  the player blocks its way, become engaged*. Robin's rule is honoured: interference has consequences specific to
  that person, and **helping does not universally provoke hostility**.
- **Spec boundary.** "Exactly two adventurers… other characters… must not become additional controllable party
  members" (spec lines 70 and 290). Guests are never on your menu. You can *ask* (a social action, E8); they decide.
- **Party rules unchanged:** the companion's turn, Harmony and techniques stay as they are.

**Engineering.**
- A rules refactor (XL). Keep `st.pc`, `st.comp` and `st.foes` as views onto the actor list, so the Atlas's patches,
  saves (battles are never saved) and tests keep working; this is the same trick `FOE_KEYS` already uses.
- Stage slots for guests and neutrals.
- A third party-status card for a guest ("Wayfarer · Nao · Porter"), without an action menu.

**Pros.** Every later encounter type (E2–E8) becomes data on one model.

**Cons.** The largest engineering item in this file. Choreography and art need guest figures.

**Tests.** Every existing battle test passes unchanged on the refactor before any new feature uses it.

**Effort:** XL.

---

## E2 · Arrivals, reinforcements and summons, counted in turns

**What and why.** Robin [R1, R2 §1]:
- Ambush encounters where more enemies join if you take too long.
- Dungeon arrivals by depth, difficulty and how full the room was.
- Bosses that summon, repeatedly if the encounter warrants it, but always dispatchable and never an automatic loss.
- Never time-based, never infinite in ordinary encounters, and not in every battle.

**Approach.**
- **Arrival rules are authored per encounter or per dungeon zone**, never global:

  | Encounter type | Rule |
  |---|---|
  | Ordinary map encounter | No arrivals (as today) |
  | Eligible dungeon encounter | 0–2 arrivals, scheduled at battle start from the zone's table (S2 seeded): `after N committed exchanges`, `when the lead falls below K knots`, or `if a signal is not silenced` |
  | Ambush (announced in the dungeon's preview) | Starts with fewer creatures; others arrive on stated exchanges |
  | Summoning boss | A summon every N exchanges, indefinitely if authored, **with at most M summons standing at once**. Summons are weak (1–2 knots) and are themselves a way to gain Harmony |

- **Make arrivals preventable.** An arrival is *telegraphed* like any other move: "A second moth is coming: in 2
  exchanges." A response can stop it, such as ringing the bell to call the swarm off or binding the door with rope,
  so preventing the next arrival can be worth more than attacking.
- **Never a reading clock.** Only committed exchanges count. Opening help, drawing, or the settings sheet does
  nothing.
- **Tactical challenge settings:**
  - Relaxed: never any hostile arrival (keeps the tested rule "Relaxed: always one creature").
  - Standard: authored arrivals.
  - Demanding: authored arrivals plus the zone's optional extras.

**Pros.** Directly delivers Robin's ambushes and summoning bosses while keeping reading time free.

**Cons.**
- The difficulty curve test needs a new model of arrivals.
- Encounters can get long; cap the total at authoring time.

**Open.**
- Summon cadence and standing caps per boss.
- Whether Standard should ever see an ambush.

**Effort:** L (on E1).

---

## E3 · Wanderers

**What and why.** Robin's passerby allies and passerby threats, "random yet not super common"; the same wanderer
should not follow you around [R2 §1].

**Approach.**
- **A small authored cast per region** (3–5): the canal porter, the busker, the pilgrim, the smuggler, the
  bath-keeper, the word-keeper's apprentice. Each has an agenda (E1), a sentence they say on arrival at every
  profile tier, and an intent bubble showing their target.
- **Eligibility:** dungeon and road encounters only, never story or boss battles unless authored.
- **Budget:** at most about 1 in 8 eligible encounters (tunable), drawn from the seeded stream.
- **Memory:** a wanderer cannot appear again within the next 5 encounters, and never twice in a row (Astra).
- **Dialogue doesn't cost a turn.** An in-battle remark pauses the battle like any line (Astra: "An intervening
  dialogue box should pause the encounter normally").
- **Reactions are authored per wanderer**:
  - thanks and leaves;
  - lingers and helps with the next creature;
  - grumbles that you stole their catch;
  - becomes engaged after you block them, which is a social mini-encounter, not combat by default.
- **Bond and memory.** A wanderer met several times becomes a known person, with a line in Known details and a
  cameo in a later scene (evolving communities, W1).

**Pros.** Life and surprise without unfairness.

**Cons.**
- Writing each wanderer at four tiers.
- Choreography for guest actions.

**Effort:** M (content) on E1.

---

## E4 · Contextual response relationships ("conditions"), not an element chart

**What and why.** Robin's example [R1]: "An enemy on fire being hit with a Wind-type response flaring up more, or a
truly Fire-type enemy like a sentient flame… snuffed out by earth or water, emboldened by fire or wind."
Explicitly: **not** "an excuse to tie in an elemental weakness system because it's shared nearly universally
among JRPGs."

**Approach: visible conditions with consistent rules.**
- **A condition is something you can see and name**: *burning*, *wet*, *misted*, *frozen*, *airborne*, *rooted*,
  *made of paper*, *made of flame*, *glass*, *buried*. Creatures and the field can carry them. Each condition is
  shown on the creature's slip as a word with furigana and an icon, and explained in help.
- **A rule table**, the same model as Field Inkweaving: condition × response family gives an effect. Rules are
  per condition, *never per species*, so learning one creature teaches the world. Proposed core (to tune):

  | Condition | Water | Wind | Stone / earth | Flame | Ice | Light | Rope |
  |---|---|---|---|---|---|---|---|
  | **burning** | puts it out | **flares** (spreads to a neighbour) | smothers it | no change | steam: the field becomes misted | — | — |
  | **made of flame** (a fire spirit) | weakens it (a knot frees more easily) | **emboldens it** (+1 power) | buries it, so it skips a move | emboldens it | steam cloud | — | — |
  | **wet** | — | dries it | — | steam: misted | **freezes** (skips a move) | — | — |
  | **misted** | — | clears all | — | — | — | clears target | — |
  | **paper** | goes soggy (its blows weaken) | scatters (to the back) | — | **catches** (frees a knot, but threatens anything paper you protect) | — | — | bundles (Gathering stops) |
  | **airborne** | — | blown away (skips a move) | — | — | — | — | **grounded** |
  | **frozen** | — | — | **cracks** (frees a knot) | thaws (becomes wet) | — | — | — |

- **Combinations are where the "Wow!" lives** (A23): the companion's draught makes a creature wet, your ice
  freezes it; your wind clears mist, and the next light finds the hidden knot. They are taught by play, explained
  in help, and never secret.
- **Trade-offs, not universal success** (Astra, confirmed by Robin [R2 §9]): wind on a burning creature is valid
  Japanese and *bad tactics*. The preview says so (E5).
- **Field conditions** (rain, a flooded floor, a paper-strewn room) come from the place. That ties encounters to
  where they happen, as the battle backdrops already do.

**Pros.**
- Depth from a small, learnable set.
- The words (みず, かぜ, ほのお) gain meaning beyond a single counter.
- Rewards attention, as Robin asked.

**Cons.**
- Balance: the curve test must model conditions.
- Every creature needs its conditions authored.
- More help text at four tiers.

**Open.**
- The final table.
- Whether some conditions belong only to later chapters.

**Effort:** L.

---

## E5 · An honest preview: "suitable here" or "nothing to do here"

**What and why.** Robin [R2 §9]: "I suppose things could whiff, but not feel like you wasted your turn outright…
It teaches me that Light did nothing… denoted on the actual choice before I make it." **Today the cards do not say
it.** This is a small, high-value fix that does not need the rest of the expansion.

**Scope: combat** (Robin, C-64). Robin later asked puzzle, social and objective encounters to leave the judgement
to the player (C-60). So the "effect here" line belongs to fights with creatures, whose state is visible and whose
rules are fixed. In the other encounter types, cards describe what a response does *in general*; the result says
plainly when it did nothing. As Robin put it, these situations evolve turn by turn, so trying something else is
the answer; a response that did nothing is marked *tried* on its card until the situation changes, so the player
doesn't repeat it by accident (C-64).

**Approach (combat).**
- Each response card shows a one-line **effect here**, computed from the same rules that will run:
  - "Clears the mist on the Moth."
  - "No Heat to cool: no effect here."
  - "Flares the fire: makes it stronger."
- **The preview is the rule.** It is computed by the rules code, so it cannot disagree with the result.
- **Keep unsuitable cards choosable** (players may still want to see what happens), but mark them.

**Pros.** Directly answers Robin's expectation; teaches; costs little.

**Cons.**
- Card text gets longer, so phone layout needs care.
- "Show what does nothing" makes the battle slightly easier. That is acceptable: the challenge moves to choosing
  among suitable responses.

**Effort:** S–M. **Recommended as an early, standalone improvement** (12_ROADMAP.md, Phase 1).

---

## E6 · Encounters with different objectives

**What and why.** A21: some encounters ask you to protect a lantern, keep a document dry, escort someone, or
prevent arrivals rather than untie every knot.

**Approach.**
- **The objective is shown at the start**, with an icon and one sentence.
- **Objective actors are `object` or `neutral` actors** (E1) with their own small health and conditions. A paper
  document is *paper*, so a burning creature beside it is a real problem (E4).
- **Losing the objective** ends the encounter in an authored way (a recoverable setback in side content), not
  necessarily a defeat.
- **The Unravel-only rule.** Objective encounters are a new encounter type and do not have to be winnable with
  Unravel alone (Robin, C-09). Each must have at least two distinct winning approaches. **Unravel stays available
  even where it does nothing** (Robin, C-60): it helps only where something is really tangled (a knot, a line,
  crumpled paper), and working that out is part of the encounter.

**Effort:** M (on E1).

---

## E7 · Machines and procedures: puzzle battles

**What and why.** Robin [R1]:
- The battle presentation can host "objects in the room that require a step-by-step procedure."
- A grand boss can be "a deep understanding challenge… where the result of failure or mistake is to restart the
  encounter from step 1."
- You can "step away and examine the room… get clues… or revisit it later."
- [R2 §9]: a "Resolve this step" option for steps already completed.

**Approach.**
- **A procedure** is an ordered set of steps over a machine's state (gates, gears, weights). Each step has:
  - instructions to read (the language task: a notice, a prompt-book, a tablet);
  - one or more correct actions (responses or procedure actions such as "pull", "turn", "wait");
  - the machine's visible reaction.
- **Two kinds of mistake, treated differently:**
  - **Language mistake** (misreading inside a task): the normal retry, never a restart (spec line 128).
  - **Procedural mistake** (a committed action that is wrong for the machine's state): an authored consequence. For
    a *short* procedure it can restart from step 1, as Robin wants. For long procedures, the restart goes back to
    the last stable step (Astra: judge the cost by the procedure's length).
- **Commit with your interpretation shown.** Before a procedural action that can cause a restart, the game shows
  the intention it understood: "You will open the upper sluice first." This separates "I chose a wrong plan" from
  "the pad misread me" (01_PRINCIPLES.md §3).
- **Step away.** Leaving the encounter costs nothing. The machine's state is kept outside the battle, like field
  puzzles (`s.discovery.puzzles`); clues found elsewhere are noted in Known details.
- **Resolve this step** (E11) for steps solved before.
- **Spec boundary.** These are a new encounter type: winnable by procedure, not by Unravel (Robin, C-09). Unravel
  stays on the cards: where a procedure involves something tangled it is one of the steps; elsewhere it does
  nothing, and saying so plainly is part of the lesson (C-60).

**Examples in the plan:**
- the Nameless Bridge (Manybridge A);
- the Understage (Manybridge B);
- the Root Hollows (Kotonoha);
- several Hundred Tales trials.

**Effort:** L.

---

## E8 · Social encounters: mediation, negotiation, argument chains

**What and why.** Robin [R2 §1]:
- Mediating a group argument as a battle scene;
- "conversational choices only, some regular ones like Light or Water, and special options that appear as the
  situation advances";
- "regardless of what you do, it will come to an end, and what end it reaches will depend on your action or
  inaction";
- the companion offers "their own unique response options."

Astra's A24 (argument chains) and A28 (negotiation) belong here.

**Approach.**
- **Not every situation is cut and dried** (Robin, C-60). All the usual responses stay on the cards, Unravel
  included, even where they do nothing. Reading the situation is the player's job.
- **Each one is a unique scenario that makes the player think** (Robin, C-45). Every group situation that isn't an
  ordinary battle is a one-off, written for its place and people (the postgame may reuse a format with new
  characters). It must not fall to three turns of common sense: each has at least two of hidden information to
  uncover, competing goals to balance, a situation that changes in response, or a constraint that rules out the
  obvious move. A test plays the naive approach and checks that it doesn't simply win.
- **The first one teaches it.** The Tally Exchange dispute in Manybridge (Chapter 3) is the first conflict with no
  creature in it. It is built so the habit of reaching for Unravel meets a situation where nothing is tangled:
  Unravel answers "Nothing here is tangled: the problem is what each of them believes." The companion then says, in
  their own words, that this one needs reading, not untying; a one-line tip names the clues to look at (the claims
  record, who is heated, what each side wants). Later encounters assume the lesson.
- **The state is human, not knots.** Each party has a *stance*: listening, heated, closed, leaving. They also have a
  set of *claims* in a visible record (Astra: "a visible record preserves earlier claims, so success depends on
  reasoning rather than memorizing").
- **Actions:**
  - **Conversational choices** (bounded, authored, tiered): ask, clarify, restate, present evidence, propose.
  - **Ordinary responses where they mean something:** Light reveals the hidden note; Water cools a heated party
    (Heat is already a creature status, and here it is temper); the bell calls for quiet.
  - **Special options** that appear as the situation develops.
  - **Wait** (E9): let someone else speak.
  - **The companion's own options**, written per companion:
    - Nao spots an inconsistency;
    - Mio calms someone or calls out condescension;
    - Ren sheds light on a document;
    - Suzu breaks the tension with a joke.
- **Harmony as agreement.** In social encounters the Harmony meter tracks *mutual understanding*. Filling it unlocks
  a joint gesture with the companion that brings the parties together. The word "harmony" (合わせ) fits that
  better than in battle.
- **Several authored conclusions**, each reachable by a different route. None of them is "defeat". Some preserve
  disagreement (Astra: "Some valid resolutions can preserve disagreement").
- **Permanent outcomes** (side quests) follow the consequence rules in E17.

**Examples in the plan:**
- the Tally Exchange dispute;
- the Steamhollow inns (that chapter's climax);
- the Mist Barrier interview;
- the Gardener of Unsent Words.

**Effort:** L (system), plus content per encounter.

---

## E9 · Wait: an action, not idleness

**What and why.** Robin: waiting or skipping a turn can decide how an event ends [R2 §1]. Astra: Wait is an
intentional action; leaving the game open is not.

**Approach.**
- A **Wait and watch** card in encounters that allow it. It costs the exchange.
- What it does is authored: it reveals the next two moves, lets a neutral act, or lets a quarrel run.
- In ordinary combat it can carry a small authored benefit (Nao's "reads the next two moves" is the model) so it is
  never a pure skip.

**Effort:** S (on E1).

---

## E10 · The companion in new encounter types, and tactical plans

**What and why.**
- Robin wants companions to contribute their own options in event battles, "not all the default support brand" [R2 §1].
- A26 (companion tactical plans): a standing intention you can override.

**Approach.**
- **Encounter-specific companion actions** are authored per encounter type: stage cues in the Understage,
  inconsistency-spotting in arguments, steam-handling in the vents.
- **Tactical plan** (optional, set in Settings or before an encounter):
  - "Choose for me: protect / reveal / press the opening."
  - The companion's turn then plays automatically with that intention unless you open the menu.
  - It speeds up ordinary battles for players who want it, and keeps identity: Nao still reads, Ren still wards.

**Effort:** M.

---

## E11 · "Resolve this step"

**What and why.** Robin [R2 §9]: for a longer sequence restarted from step one, an option, unlocked because you
completed the step before, that performs the step without further input.

**Approach** (from Robin's wording and Astra's safeguards).
- **Eligible** only for the *same step under the same conditions* (same instructions, same machine state). Opening a
  valve does not solve a different valve.
- **Does everything the normal action does:** the machine moves, the turn and cost apply, the animation plays per
  settings.
- **Never:**
  - records fresh mastery evidence;
  - repeats a one-time reward;
  - solves the next step.
- **Labelled:** "Resolve this step (completed before)."
- **Precedent:** Field Inkweaving's "routine" repeats already skip the language step without recall credit
  (`ui/57_weave.js:293-306`).

**Effort:** S (on E7).

---

## E12 · More than three creatures

**What and why.** Robin raised enemy slots past 3 [R1]. Astra: more slots alone don't add depth. The audit:
- the formation code breaks at a fourth creature;
- the phone layout already overlaps at three;
- the Harmony portrait is already left out with three creatures on windows of 1440 px or narrower.

**Approach.**
- **Ordinary encounters stay at three or fewer.**
- **Authored set pieces may hold up to five actors**: a boss with summons, or a group plus a guest. They use a new
  **two-row formation**: back row smaller, front row larger, depth scaling as the battle stage already does.
  - **Compact slips** below 1280 px.
  - **On phones** the back row draws smaller and its name plates collapse to letters (A–E).
- **Validator:** at most 5 actors; at most 3 hostile at once outside boss summons.
- **Harmony:** the portrait's placement rules already fall back gracefully. Five actors will usually mean no
  portrait on smaller windows, which is acceptable, and recorded.

**Pros.** Spectacle where it matters, and only there.

**Cons.**
- Layout work.
- The geometry audit must cover 4–5 actors.
- Memory budget: the battle sprite budget is 38.6 of 48 MiB.

**Effort:** L.

---

## E13 · Equivalent expressions, different practice

**What and why.** A22: let a player choose *which* Japanese to practise without paying a tactical price.

**Approach.**
- Some responses gain **alternative phrasings of the same intention** (for example まもる, or a newer construction
  such as 〜ないように "so that it doesn't…").
- **Same effect, different language task.**
- New phrasings unlock as they are taught. A Grow-route player (L18) can deliberately pick the stretch version.

**Effort:** M.

---

## E14 · Preparation before an encounter

**What and why.** A25: inspect the surroundings, choose what to protect or use.

**Approach.**
- Where a visible creature waits on the map, an optional **"Look around first"** offers one or two preparations
  from the place: douse the brazier (no *burning* field), shut the shutters (no *wind*), move the lantern out of
  reach.
- Each is a small language task. Skipping is fine and never penalised.

**Effort:** M.

---

## E15 · Fixed-tool tactical studies

**What and why.** A27: optional compact puzzles with a known toolset and an objective within a number of
*committed turns*; instant retry with an explanation of what changed.

**Approach.**
- A **Tactics Board** in Manybridge's Exchange hall and on the boat.
- About 30 authored studies, from teaching conditions (E4) to arrivals (E2).
- Optional; personal best per study (moves, not time).

**Effort:** M.

---

## E16 · Optional superbosses

**What and why.** A30: each tests a different combination of understanding and tactics, not enormous health. They
can defeat you, retries preserve learning, and victory earns an honest personal record, not essential loot.

**Approach.**
- One **"old guardian" per region**, awakened in the postgame:
  - the Bridge Founder (Manybridge);
  - the Cloud Ox Elder (Cloudroad);
  - the Kettle's Mother (Steamhollow);
  - the First Keeper (Kotonoha);
  - plus one for each existing region (sealed note S7).
- **Each is built around one mechanic family**: conditions, arrivals, procedure or argument.
- **Rewards:** a stamp (K1), an illustration (K2) and a cosmetic. The illustration can be revealed without
  winning (H1).

**Effort:** L (content).

---

## E17 · Lasting outcomes and the consequence rules

**What and why.** Robin [R1]: an encounter with a larger group where each member is doing something; choosing
incorrectly or waiting idly can eliminate a group member, with a permanent effect on the side quest's story; enough
outcomes chain into hidden content. [R2 §1]: the troupe never dies; other NPCs may, rarely and contextually.

**Approach.**
- **Define "elimination" per encounter.** Fleeing, being captured, falling unconscious, leaving the group, giving up,
  or (very rarely, authored, offscreen) dying are different events. The author picks; the default is *never* the
  most severe.
- **Commit with interpretation shown.** Before an action that can cause a permanent outcome, the game shows what it
  understood the player to intend. A recognition failure never commits. A language mistake gets the normal retry.
  Only a *confirmed* choice can have a lasting consequence (spec line 208).
- **Wait counts only when chosen.** Waiting idly means the Wait action (E9), never time passing.
- **Record outcomes in quest state** (`quests` plus flags), never as a "failure"; the Journey describes what
  happened neutrally.
- **Hidden content from combinations.** Authored "outcome sets": for example, three side quests resolved by
  mediation rather than force unlock a later scene. They are documented in the quest data so the validator can prove
  each is reachable.
- **Nothing essential.** No main-story content or companion ending depends on a side-quest outcome. Illustrations of
  every outcome become *viewable* at chapter completion (H1); only the witnessed seal differs.
- **Unchosen companion candidates and the troupe are never subjects of severe outcomes** (spec line 94; Robin's
  boundary).
- **Robin's rules for deaths (C-11, 2026-10-07):**
  - a death is an *avoidable* consequence: the player could have prevented it, and the story goes on either way;
  - never to NPCs who matter;
  - it may be a little gruesome, shown with restraint, with a "shown / summarised" setting (C-65);
  - failing never turns on the player: they witness it, then reflect on it with the companion in a written scene.

**Effort:** M (system), plus content.

---

## E18 · Harmony: the open question, and its new roles

- **The open decision** (COMBAT_NOTES): one technique per filled bar (today), or capped charges per encounter. The
  expansion does not need charges. Bosses with summons (E2) give long fights more Harmony naturally.
  **Recommendation: keep one technique at a time.**
- **New role:** the meter as *mutual understanding* in social encounters (E8).
- **No Harmony in a companion's temporary absence** (10_STORY.md): techniques need two.

---

## E19 · Help in required story battles after repeated defeat

**What and why.** Robin [R2 §3]: a required dungeon must never stop the player reaching its finale; the companion
can offer better assistance, "even… highlighting good/correct responses." Astra: offer it, and let the player
decline it.

**Current state.** The language step always ends in success (wrong answers retry; "I don't know" reveals), so
"repeated failure" can only mean **repeated defeat in the same encounter**. Nothing counts defeats today (by
design: "no counts").

**Approach.**
- **Count defeats per story encounter**, in the save, used only for this.
- **Offers escalate.** After the first defeat the companion offers:
  1. **Explain**: what the creature's pattern is doing.
  2. **Suggest**: "When it gathers, rope stops it."
  3. **Point**: highlight suitable responses on the cards for the next attempt.
- **Always optional**, both ways: the player can accept or decline each offer. The player can also ask at any time
  from the battle's help, without waiting for a defeat.
- **Recording:** a highlighted answer counts as *answer-supplied* help in the evidence log (L2), and nothing else
  changes. The encounter, the profile and the rewards stay the same.

**Effort:** S–M.

---

## E20 · Ambushes and visible creatures

**Contradiction.** The content rules require visible, avoidable foes on maps (AGENT_COMMON). Robin wants ambush-style
encounters [R1].

**Resolution proposed** ([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) C-07):
- Ambushes exist only in dungeons whose preview says so (D4).
- They are telegraphed on the map (rustling, a shadow, a sound with a visual cue).
- They start with fewer creatures than the full group, the rest arriving on stated exchanges (E2).

---

## New creature roster (all regions)

From [07_REGIONS.md](07_REGIONS.md): about 35 new creatures and 8 bosses or spirit climaxes. Each needs:
- art, at code-drawn interim quality;
- a choreography family (coverage tests fail on unmapped families);
- help text at four tiers, a gist and an icon;
- conditions (E4);
- a Creatures Met entry.

The art pass at the end replaces interim art.

---

# Battles: Robin's notes of 2026-10-08

Robin wrote these from the playthrough (nearly the end of Chapter 2, travelling with Suzu). Each gets the facts as
the game stands and a proposal. Planning only.

## E21 · Harmony needs a sound

**Robin:** the cut-in "feels a bit empty" without sound. A base Harmony sound as it slides into frame, for every
combination; each combination with its own effects that feel important (a sparkle when Suzu's animation reaches its
peak, for example); none when battle animations are set to Instant.

**Approach.**
- **A shared arrival sound** for every cut-in, timed to the slide-in: a short rising swell with a soft strike, the
  same for all four pairs so the player learns "this is Harmony".
- **One accent per companion**, timed to that companion's peak frame and drawn from their technique:
  - **Nao:** a quick throw and a paper snap, like a letter landing on a counter.
  - **Mio:** a rising shimmer of water, then a glass chime.
  - **Ren:** a deep lantern-bell tone that blooms and hangs.
  - **Suzu:** a sparkle and a little drum flourish, a stage's "ta-da".
- **Made in the game's own audio engine** (src/audio, synthesised like every other sound), level-matched to battle
  music, following the sound settings.
- **Timing follows the cut-in setting:** Normal plays both sounds at their frames; Fast compresses them with the
  shorter cut-in; **Instant plays none** (Robin).
- **Tests:** a unit test that each pair has its cues and that Instant schedules none; a browser check that the cues
  fire at the arrival and peak frames.

**Effort:** S. **Recommended for Phase 1**: it improves something Robin plays now.

## E22 · How groups scale today, and what changes

**Robin's question:** as groups grow, all three creatures might attack at once; if Protect blocks only the first,
it could become unmanageable. How do player and companion health scale against enemy damage and numbers?

**How it works today** (docs/COMBAT_NOTES.md; checked by `tests/unit/combat_curve.test.mjs`):
- **The setting decides the numbers:** Relaxed always one creature (14 resolve), Standard up to two (12), Demanding
  up to three (10). Resolve is restored after each encounter.
- **Groups are shared out:** in a pair each creature has half its knots, in a trio 40 %, so a group lasts about as
  many exchanges as one creature.
- **They take turns:** each creature after the first starts further into its pattern, so their blows don't all
  open together. Every move is telegraphed on its slip before you choose.
- **Protect (まもる)** raises a ward before one of you: it blocks a Strike aimed at that person, or soaks 2 later.
  Other responses answer a move from *every* creature: stone, warmth, fire, bell, voice and healing guard the whole
  party, and water and wind act on every creature.
- **Mistakes cost at most 1 resolve per exchange**, whatever the group; recognition uncertainty never costs any.
- **Measured:** with a companion, a Demanding trio lasts about 4.1 exchanges and leaves you at 70 % at the lowest;
  alone, the hardest case (an Atlas trio) leaves 20 %. Every encounter is won at every setting.

**So Robin's worry is mostly answered by staggering and the party-wide responses**, but it grows with the new
chapters' larger groups and two-move turns (E26).

**Robin's decision (C-70):** "Numbering each enemy by their action order is good. Groups should still respect
targeting where applicable." Robin would rather give the player options for the harder fights with two to five
creatures "without restricting what the enemies can do". So:
1. **Show the order** (decided). Each creature's slip carries its number in this round's order and whom its move is
   aimed at (decided when it is telegraphed, as today), so the player sees whose blow lands first and on whom.
2. **No per-round ceiling** (dropped; C-73 to confirm). Draft 6 proposed capping what a group could take in one
   round. That restricts the enemies, so the player's answers grow instead: modifier words (E27), companions'
   growth (E25) and the party-wide responses.
3. **Protect grows, as a moment of growth** (decided): 「すべてをまもる」, a ward before each of you, learned in a
   scene in Chapter 7 (E27). Companions' guarding actions (E25) cover more too.
4. **Teach the party-wide answers** when trios first appear: a short note the first time three moves are
   telegraphed together, pointing at responses that answer every creature.
5. **The curve test extends to twelve chapters**, with the same promises: Relaxed single and gentle, groups a step
   and not a spike, companions and modifiers never shortcutting the language work, and every encounter winnable
   with Unravel alone.

**Effort:** M.

## E23 · More kinds of creature

**Today:** 29 ordinary kinds across the six regions plus 6 bosses (Reedwake 3, Saltglass 7, Cinder Orchard 4,
Snowbell 5, Lanternfall 5, the Still Archive 5), and 12 more in the Atlas with 3 guardians.

**Robin:** more types, both for general battles and for the new puzzle and group situations; judge what each
region's theme can hold; more than one new kind per region is fine.

**Approach.**
- **Every region at least 6–8 ordinary kinds**, each with a move or combination of moves no other has (never a
  recolour). New regions already list 6–10 each ([07_REGIONS.md](07_REGIONS.md)).
- **Existing regions get 2–3 new kinds each**, themed from what the spec says of the place:

  | Region | Proposed new kinds (working names) |
  |---|---|
  | Reedwake | **Silt Toad** (a Mire that slows your ward), **Reed Whisperer** (Shroud with a False promise), **Storm Kite** (Gust that strips a ward) |
  | Saltglass | **Gull Thief** (snatches a ward away), **Tidepool Imp** (Flood with a slow build), **Net Tangle** (binds a response; Unravel's natural home) |
  | Cinder Orchard | **Glass-Shard Wisp** (Mirror), **Ash Mole** (Gathering from below), **Persimmon Imp** (False promise that ripens) |
  | Snowbell | **Icicle Bat** (Chill from above), **Snow Hare** (Chill and Sweep), **Starling Wisp** (Shroud that light alone clears) |
  | Lanternfall | **Notice-Board Mimic** (Plea and False promise), **Queue Spirit** (Waiting that turns into a Strike), **Ledger Weevil** (Re-tying from the records) |
  | The Still Archive | **Index Card Swarm** (many small blows), **Silent Bell** (Hush that spreads), **Page Wraith** (Mirror and Hush) |

- **Each new kind:** its battle art at today's standard, its moves and help text at four tiers, a Creatures Met
  page, and a place in the curve test.
- **Situation encounters** (puzzle, social, objective) get their own casts per scenario (E7, E8), never reused
  creatures.

**Effort:** L (spread across the chapters' phases).

## E24 · Why fight a roaming creature? (options, as Robin asked)

**Today:** roaming creatures give practice and clear the way; only two story creatures give anything at all (both
bosses), and the Saltglass nets and sea glass come from scenes, not creatures.

**Robin:** some incentive beyond space and practice; avoid currency (unless for a quest), "slay 5 crabs", and
cosmetic drops from ordinary creatures; cosmetics only from harder encounters, perhaps as an exploration bonus.

**Options, each within the plan's guardrails (no random drops, no currency, no counters to grind):**

| # | Option | What the player gets | Verdict |
|---|---|---|---|
| 1 | **Every roaming creature carries a lost word** | Settling it releases a word the Hush took from that place; a sign, a label or a person's memory comes back nearby (a visible change, W1). The word joins the notebook | **Recommended**: it fits the world exactly, rewards every fight, and turns practice into restoration |
| 2 | **Clearing a route changes it** | When a path's creatures are settled, people start using it: a trader, children, a road event, a shortcut | **Recommended** |
| 3 | **Quest carriers, authored** | A few creatures hold a quest object (a lost float, a bundle of letters), always one named creature, never "collect five" | **Recommended**, sparingly |
| 4 | **Notable creatures** | Fixed, named, harder variants in out-of-the-way places. Settling one can teach the companion a new action (E25) or give a cosmetic as an exploration bonus | **Recommended** (Robin's "cosmetics on harder encounters") |
| 5 | **Inscription fragments** | Settling certain creatures in a particular way leaves part of a stronger form of a word (a gust that also lifts mist) | Possible; overlaps with 4, so only a few |
| 6 | **Field-guide stamps** | A stamp for settling every kind in a region: a natural milestone, no counter shown (K1) | Recommended as a small extra |
| — | Currency, random drops, "slay N", crafting materials | — | **Excluded** (Robin, R1) |

**Effort:** M (options 1–3 are content plus small engine hooks; 4 builds on E25).

## E25 · Companions grow in battle too

**Today:** each companion has five actions across the whole game: one on joining, a second when Chapter 2 ends, one
from their personal quest, and two from the optional long quest lines. The player has twelve inscriptions to learn.
So Robin's Suzu has only Heckle until the end of Chapter 2 ("Draw its eye" arrives then).

**Robin:** more should open up, steadily, for both the player and the companion; unique creatures and secret
encounters could teach companions abilities, not just people or quests.

**Approach.**
- **About one new companion action per chapter**, so twelve chapters give each companion ten or more, from:
  - the main story's chapter ends;
  - their personal quest and their second arc's beats ([14_COMPANIONS.md](14_COMPANIONS.md));
  - **notable creatures** (E24): a companion learns from a creature they faced, in their own way (Suzu copies a
    tumbler's pratfall into a routine; Ren learns a lantern-moth's glow; Mio a spring-imp's steam; Nao a gull's
    swoop);
  - secret encounters off the beaten path.
- **Upgrades as well as additions**, so the menu doesn't sprawl: some actions grow a wider reach later (Heckle
  learns to reach every creature).
- **A manageable menu:** at most six actions offered in a battle, ordered by usefulness against what is telegraphed;
  the rest are a page away.
- **The player grows too:** new inscriptions in the new chapters (はし, すみ, みち, ゆ already planned, W6) and
  stronger forms of familiar ones.
- **The curve test still guards the language work:** companions may never shorten it (rounds with a companion stay
  at least 70 % of rounds alone).

**Robin's decision (C-71):** "Sounds good. Not every action needs to be laid out in the clearest path, as we're
letting unique enemies possibly reward the companion with a new tool or upgrade, too. This wouldn't be FOMO as the
player can generally revisit any area at any time (within reason)." So:
- **Discovery is part of it.** No checklist of actions still to find; a notable creature appears on the Creatures
  Met page once met, and the companion may mention a rumour once.
- **Never missable.** Notable creatures and secret encounters are never placed where an area closes for good; each
  waits until it is settled.

**Effort:** M (system) plus content per chapter.

## E26 · Varied tactics: two moves at once, plans, and silencing

**Robin:** as battles get harder, creatures should vary their tactics as well as their numbers (outside the easiest
setting): strike *and* shroud at once, so the player chooses what to answer, or covers both with a companion's
ability; the Hush should be able to silence some responses for a time, forcing a different approach while leaving a
solid way to progress.

**Approach.**
- **Two moves in one round** (from the middle chapters, Standard and Demanding only): a creature telegraphs, for
  example, a Strike and a Shroud together. The player answers one; a few responses and companion actions answer
  both. Never on Relaxed.
- **Plans over two rounds:** a creature telegraphs a sequence (Gathering, then Flood), so answering the first step
  heads off the second.
- **Group coordination:** two creatures act together on a telegraphed signal; answering the one giving the signal
  breaks it.
- **Silencing, extended.** Today one move, Hush, stops Unravel until a bell rings or a voice is raised, and only
  creatures of Lanternfall and the Still Archive, where the Hush is closest, use it. Later Hush creatures can
  silence **one family of responses, or the modifiers (E27), for a few rounds**, shown on the cards with the rounds
  left. It never silences everything; there is always a way through; and the promise that every combat encounter
  can be won with Unravel alone still holds (Unravel is only silenced when its counter is already known, as today).
- **All of it is telegraphed** before the player chooses, explained in help at four tiers, and tuned with the
  curve test.

**Robin's decision (C-70):** "Two-move turns and Silencing (Hush or Hush-adjacent enemies can Silence, not us)
sound fine, as long as it can be inferred clearly." So:
- **Only the Hush silences.** Silencing belongs to Hush and Hush-adjacent creatures; the player never silences
  anything, and no response or modifier does.
- **Inferable at a glance:**
  - every creature that can silence carries the same visible Hush mark in its art, and its Creatures Met page says
    so;
  - its slip shows the silence before it lands: which family, for how many rounds, and what ends it;
  - a two-move turn shows both moves on one slip, joined by "and", in the numbered order;
  - a silenced card says why, how many rounds are left, and what would end it early.

**Effort:** M–L.

## E27 · Modifier words: extending a response's reach

**Robin (C-70):** instead of only choosing one response, the player learns **modifiers**, in battle and in the
overworld. Choosing a modifier, then the response it extends: 「すべてを守る」 (*subete o mamoru*, "Protect everything") shields both
of you; 「風がすべてを動かす」 (*kaze ga subete o ugokasu*, "The wind moves all") clears or blocks several shrouds; light with a word to
reveal or illuminate. They are "target modifiers more than direct word/response transformations at heart.
Extensions, really." Words that read alike at first can do different things (Robin's families below). They let
targeting and order matter and give the player options in the harder fights with two to five creatures, "without
restricting what the enemies can do".

**How reach works today** (src/engine/95_combat.js): Unravel, answers, light and rope act on the target; water and
wind act on every creature; stone, warmth, fire, bell, voice and healing protect you both and answer that move from
every creature; a ward goes before one of you. Ren's Harmony technique (Lantern Ward) already shields both, once.

**The idea in one line.** A modifier never acts alone. It changes *who*, *how many*, *what kinds*, *how much* or
*how long* a response reaches; the response still does what it always did.

### Choosing one in battle
1. The response panel gains a row of the modifiers the player knows. Choosing one shows on every response card what
   it would do with that modifier (targets highlighted, the reach in words). A response it can't extend is dimmed,
   with the reason.
2. Choosing the response then asks for the modifier's option, where it has one (いくつか: which two creatures;
   大半: which one to leave out).
3. The player writes the phrase: 「すべてをまもる」, 「ひかりがすべてをてらす」.
4. Without a modifier, everything works exactly as today. Every combat encounter can still be won with Unravel
   alone.

### What is written, and how it is recorded
- **A real sentence.** Noun inscriptions gain one partner verb each, with the particle that is natural for it:
  が for light and wind, which act by themselves (ひかりがてらす, かぜがうごかす); で for rope and water, which the
  player uses (なわでしばる, みずでながす). The list is settled in the language self-review (Phase 12).
- **Only natural Japanese.** A modifier pairs only with the responses it reads naturally with. An unnatural
  pairing (たくさん with まもる, say) is simply not offered.
- **How much is written follows the input setting:** typed, the whole phrase; handwritten, the modifier and its
  particle, with the rest shown (a whole sentence by hand every round would be slow); profiles that don't write yet
  assemble the phrase from pieces.
- **Honest records.** The modifier, its grammar point, the response word and the partner verb are separate learning
  items. Only what the player actually wrote counts as written; shown parts count as nothing.

### The families, and what each does in play
Words that look alike behave differently, and the difference follows each word's real meaning. Where two words
overlap in everyday Japanese (すべて and 全部 often mean the same thing), the help says so plainly and presents
the battle role as the Inkweavers' own convention, never as a rule of Japanese.

**All (who or what is covered)**

- **すべて (全て, *subete*)**, "all, every one". **Breadth:** every one on that side, each separately, each a little lighter. *Example:* 「すべてをまもる」: a ward before each of you; each blocks a Strike aimed at that person and soaks 1 later, not 2.
- **全部 (ぜんぶ, *zenbu*)**, "all of it". **Completeness on one:** all of it, for one target only. *Example:* 「きずをぜんぶいやす」: restores all of one person's resolve, instead of some to both.
- **あらゆる (*arayuru*)**, "every kind of". **Kinds:** answers a move of any kind, once. *Example:* 「あらゆるわざからまもる」: a ward before one of you that stops the next blow of any kind (Sweep, Gust, Flood, Chill…), not only a Strike.
- **全体 (ぜんたい, *zentai*)**, "the whole, as one". **The group as one body**. *Example:* 「ぜんたいをまもる」: one ward around the party that takes the first blow to land on either of you. Aimed at creatures, it answers what a group does together (a coordinated move, E26) and nothing else.

**Each (how it is shared out)**

- **それぞれ (*sorezore*)**, "each, respectively". **Each its own:** fitted to each target, this round only. *Example:* 「それぞれをまもる」: a ward before each of you that fits the blow aimed at that person (a Strike at one, a Chill at the other); it soaks nothing later.
- **ごとに (*goto ni*)**, "with each, per". **In turn:** repeats as each creature acts, in the numbered order. *Example:* 「いっかいごとにまもる」 (一回ごとに守る): a small ward renewed before every blow this round, whoever it is aimed at (each soaks 1).

**Amount (how many, how much)**

- **いくつか (*ikutsuka*)**, "some, a few". **Two of your choice**. *Example:* 「むすびめをいくつかほどく」: Unravel on two creatures, a knot each (Unravel's growth, below).
- **大半 (たいはん, *taiban*)**, "most, the greater part". **All but one,** the one the player leaves out, each at full strength. *Example:* 「なわでたいはんをしばる」: stops every creature's Gathering but the one left out (a creature you mean to answer another way).
- **たくさん (*takusan*)**, "a lot". **More, on one**. *Example:* 「みずをたくさんかける」: puts out one creature's Heat and soaks it, so it can't raise Heat next round.

**Lasting (how long, how many times)**

- **永遠に (えいえんに, *eien ni*)**, "forever". **Time:** one effect that lasts the rest of the encounter, until a named move breaks it. *Example:* 「かぜがえいえんにふく」: while the wind blows, no creature can raise a Shroud (a Gust breaks it).
- **無限に (むげんに, *mugen ni*)**, "without limit". **Count:** no limit on how many, this round only. *Example:* 「むげんにまもる」: the ward blocks every Strike this round, at either of you, then is gone.

**The grammar they bring** (each taught in a short lesson when first learned, with furigana and examples): すべて
and 全部 as nouns and as adverbs, with 全部 often placed straight before the verb with no particle (ぜんぶたべた);
あらゆる only before a noun; 全体 as "the whole" of something (クラス全体); それぞれ and それぞれの; ごとに after a noun
(一回ごとに "every time", 駅ごとに "at every station"); 大半 (a little formal); たくさん for amount; いくつか after the object (むすびめを
いくつか); 永遠に and 無限に, grand words, used here with an Inkweaver's flourish (the help says so).

### Every modifier is a trade, never an upgrade
Reaching more makes each part lighter (すべて); fitting each target lasts only this round (それぞれ); doing more
means one target only (全部, たくさん); lasting means it can be broken (永遠に); no limit means this round only
(無限に). The phrase is also longer to write, so a modifier is used when it is worth it. If the curve test finds one
modifier dominating anyway, the fallback is a breath: an extended response can't be extended again the very next
round. The curve test, not the modifiers, keeps battles their length: groups in the new chapters are tuned with
modifiers in hand, so a fight lasts about as many exchanges as before and the language work is never shortened.

### Learned as growth, in the story and off the path
Robin: "You're a traveling Inkweaver, and still learning the ropes. It makes sense that your abilities improve."
- **Two growth moments, each a scene with weight, never a sudden reward:**
  - **Unravel reaches two (いくつか), Chapter 4.** After the city's crowded fights, where the player meets the limit
    of untying one creature while the others press in, someone whose craft is untangling shows the wider grip.
  - **Protect covers both (すべて), Chapter 7.** On the Keepers' Road, after a moment where a ward before one of
    you was not enough, the keepers' old practice teaches the ward that stands before everyone.
- **Taught by the story** in the other new chapters: それぞれ (Chapter 3, a city of people each wanting their own
  thing), あらゆる (Chapter 9, where every kind of word washes up), ごとに (Chapter 10, station by station), 全体
  (Chapter 11, a valley that has to agree as a whole).
- **Found off the beaten path** (C-71): 全部, たくさん, 大半, 永遠に and 無限に come from people, notable creatures
  and secret encounters across the world, and the last two from the Trials. Nothing is missable: every source waits
  until found.
- **The overworld:** field puzzles can call for a modifier (light every lantern on a ridge at once with すべて; give
  each bridge its own name with それぞれ; leave an ice path standing with 永遠に). The wrong modifier on the right
  object gets the same plain physical feedback as today's field weaves. No required puzzle needs a modifier the
  player can't have yet.

**The Hush narrows reach.** A Hush or Hush-adjacent creature can silence the modifiers for a few rounds, shown like
any silencing (E26): the player's words reach only one at a time until it ends.

**Tests.** Unit: each modifier's reach and effect on every response it pairs with; the validator checks every
offered pairing has an authored, natural phrase with furigana. The curve test: battles with modifiers keep their
length at every setting and chapter, no modifier dominates, and Unravel alone still wins. Browser: choose a
modifier, a response and its option, write the phrase, and see the effect land on the right targets.

**Effort:** L (engine, battle panel, field rules, lessons and content, spread across Phases 3, 7 and 7b).
