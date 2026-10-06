<!--
Stored in the repository at Robin's request (2026-10-06) so it is not lost between sessions.
DISCUSSION ONLY: not a specification and not authorised work. Nothing here is to be built until Robin selects
and specifies a scope. Robin's later answers to the open points (illustration book, suspend, player appearance in
illustrations, mastery stars, testing cadence, final art pass) are recorded in HANDOFF.md, "State" ->
"Future expansion (discussion only, NOT authorised work)", and take precedence over this note where they differ.
The text below is Robin's note, unchanged.
-->

# The Road of Borrowed Names — Future Expansion Context

**DISCUSSION AND CONTEXT ONLY — NOT AN IMPLEMENTATION AUTHORIZATION**  
**Prepared for Robin to share with Claude · 5 October 2026**  
**Scope:** Earlier expansion proposals, Robin’s written review, and Robin’s subsequent clarifications. This is a consolidated discussion record, not a new game specification, delivery checklist, or assertion of current implementation status.

> I am sharing this so you understand where I may want to take the game later. Keep working on the assignment I have actually authorized. Do not begin these expansions, convert the catalogue into active tasks, commission their artwork, or change the current work order because this note was supplied. When I am ready, we will select and specify the next scope explicitly. In the meantime, this explains my preferences, the ideas I liked, the things I ruled out, and the important refinements made during discussion.

## How to read this note

The original proposal catalogue was broad on purpose. Robin asked for 30–100 substantial ideas, received 60 numbered proposals with **Umazing / Good / Meh / Bad** design judgments, and then reviewed and refined them. Positive reactions mean that a direction is worth retaining and exploring; they do not mean that all sixty ideas should be implemented.

The distinctions used below are:

| Label | Meaning |
|---|---|
| **Robin’s direction** | A preference or boundary Robin explicitly stated during the discussion. It is important future-planning context, not permission to build now. |
| **Supported exploration** | Robin liked the proposal or its group; its detailed scope, balance, content, and implementation remain to be selected. |
| **Assistant proposal** | An interpretation, example, name, or implementation approach suggested by the assistant, not independently adopted as a complete specification. |
| **Open** | A genuine unresolved design or production decision. Do not silently choose an answer and claim Robin approved it. |
| **Excluded** | A direction Robin explicitly rejected for the scope under discussion. |
| **Earlier assignment** | A feature discussed or specified before this expansion consultation. Its newest implementation and acceptance state is not established by this note. |

### Source and precedence

The discussion sources are identified at the end. In this record, Robin’s later clarifications take precedence over the initial review where they differ, and Robin’s preferences take precedence over the assistant’s original ratings or suggestions. **That is a rule for interpreting this discussion—not authority to override the currently assigned project specification.** Any future change to an existing contract needs an explicit implementation decision.

Descriptions of existing code or gameplay in older messages were observations of older builds, sometimes expressly tentative. No new repository audit or full playthrough was performed to write this note. It does not certify which proposed systems are absent, in progress, complete, or approved today.

---

## 1. The intended expansion: more agency through Japanese

**Robin’s direction.** Preserve a learner-centered, tile-based Japanese-learning fantasy adventure. Expand what the player can understand and accomplish through Japanese: investigate, construct, coordinate, clarify, negotiate, navigate, explain, experiment, and recall. Repetition still matters, but it should increasingly involve using knowledge in a different meaningful situation rather than receiving an identical question behind another door. [R0–R2]

The goal is not an activity quota. Every region does not need twenty distractions, and every new map does not need a new subsystem. New regions should nevertheless feel fresh in their experience, environment, social situations, or opportunities—not merely add another set of errands.

Main-story runtime is not a hard cap. Robin is willing to let the game grow, but has not completed the existing experience and is not fixing the final chapter count or expansion scale now. The earlier suggestion of ten or twelve chapters was an ambition to evaluate, not a required total. The earlier expectation of ten to twenty hours for six chapters was not measured playtime.

Learning support and challenge can coexist. The player may lose a chosen expedition, make a poor tactical decision, or reach a less favorable side-story outcome. That is different from punishing time spent reading, needing an explanation, or correcting an input-recognition problem.

The core party remains the player and their chosen companion, with an optional cosmetic pet. Temporarily participating encounter actors do not imply permanent party expansion.

### What stays central

- Multiple-choice, typing/IME, handwriting, contextual help, and supported continuation remain legitimate ways to engage. Overworld Inkweaving complements existing choice-driven interaction rather than replacing it wholesale.
- Growth opportunities are offered. No hidden, permanent promotion to a harder language profile because an accuracy score increased.
- Ordinary reading, composing, puzzle analysis, dialogue, and encounter decisions are untimed. The separately specified, explicitly selected fishing-timing exception is not permission to put clocks everywhere.
- Rewards should support enjoyment and pride without making players feel obliged to cheat, avoid help, change their input preference, or grind.
- The satchel is not becoming a storehouse of potions, salves, or collectible healing supplies.
- The local/offline project identity and the no-login decision remain important context. This discussion does not introduce an online AI grading service or account system.

---

## 2. The strongest directions Robin singled out

These are emphases, not a ranked implementation order. [R1–R2]

**Evolving communities.** Earlier towns change after important events. Residents acquire new dialogue and different activities, the consequences of regional stories become visible, and revisits offer more than repeating their first conversation.

**More consequential response interactions.** Learned responses can change how an encounter develops. The purpose is contextual understanding and satisfying discoveries—not importing a conventional elemental weakness chart by habit.

**Substantial optional dungeons and the 100 Trials concept.** Expeditions can test varied knowledge, introduce supported new concepts, demand planning, and reward understanding. They can use substantial traversable floors and persistent expedition resources.

**Sailing and discoverable regions.** A long Harbourmaster quest could earn early access to interactive sea travel and a hinted-at side region that later becomes reachable through normal story progression too.

**An illustrated travel volume.** High-fidelity, potentially animated illustrations preserve memorable moments. Viewing access and the record of personally experiencing a moment are deliberately separated.

**Culture, folklore, and participation.** Dialects, context-sensitive politeness, public spaces, performances, festivals, hospitality, and local stories can deepen the fantasy world without turning it into modern Japan with a fantasy filter.

**Natural English-to-Japanese construction.** More opportunities belong organically in expanded and new content. There is no request to shoehorn them into every existing encounter or restart the current content pipeline.

---

## 3. Encounter design: purposes, arrivals, puzzles, and consequences

### 3.1 Not every participant is simply on one of two teams

**Robin’s direction.** An eligible dungeon encounter may occasionally acquire another enemy or a passing ally. A wanderer may enter to fend off a particular creature, with their intention and target made clear through a sentence and intent bubble. Their reason for participating need not be general loyalty to the player. [R2 §1]

Interference can change what happens. A wanderer may make a remark in an in-battle dialogue box, remain, and become engaged with the player. Directly interfering with their purpose matters; dispatching their target may or may not count, depending on that person’s authored behavior. Do not turn this into a universal rule that helping always provokes hostility.

These occurrences should feel organic and somewhat unpredictable, but uncommon. Not every battle permits additions, and the same traveler should not appear to be secretly following the party through every encounter.

### 3.2 Arrival rules are contextual and turn-based

Dungeon difficulty, depth, local enemy population, and the authored situation may govern arrivals. Relevant boundaries can be displayed within the event rather than imposed as one universal rule for every battle.

**No arrivals are triggered by time spent reading, looking at help, drawing, or thinking.** Explicit actions and committed turns advance the encounter. Choosing Wait or Skip is an action; simply taking time is not.

Ordinary reinforcements are finite. An exceptional major boss may summon repeatedly or indefinitely if the encounter warrants it. Those additions should be reasonably dispatchable and should not make summoning itself an automatic, unavoidable-loss mechanism. This does not require rescuing every position made hopeless by prior decisions or preparation.

**Assistant proposal, not a fixed contract:** distinguish repeatable summoning from unlimited simultaneous accumulation; use actor-specific agendas, contextual population/cadence limits, and recent-appearance tracking for wanderers. Exact limits and probabilities remain open.

### 3.3 Encounter presentation can support social and mechanical puzzles

A group dispute can use conversational responses, some ordinary responses such as Light or Water where meaningful, and new choices that appear as the situation develops. A complex machine can use steps, constraints, and changing environmental state. Neither needs to pretend that every participant is an enemy with knots or HP.

These events read as puzzles. Action or explicit inaction leads toward an authored conclusion, and different conclusions can depend on the player’s interpretation and decisions. The companion contributes characteristic options, not only their generic battle-support menu.

The player may step away from a procedure to examine the surroundings, obtain clues, review knowledge, or return later. The encounter presentation is a way of making a complex situation legible, not a reason to trap every activity in conventional combat.

### 3.4 Responses should have intelligible relationships

Robin’s example was fire interacting differently with wind, water, or earth according to what the creature and condition actually are. That is a contextual design example, not approval of a universal element chart.

A response can be unsuitable or have no relevant effect. Robin cited Light being previewed as ineffective when there is no Shroud to clear. That was an observation about the build being played, not a newly verified statement about today’s code. The point is that an intelligible preview and consistent result are different from an unexplained wasted turn.

Major responses should have enough recurring uses to support experimentation and flexible approaches. More enemy slots alone would not establish that depth. Expanding beyond three was considered, but no new maximum has been selected.

### 3.5 Lasting outcomes and limits on harm

Side quests can have permanent differences and more than one ending. Combinations of outcomes may expose additional content and support replayability. That does not authorize a catastrophe in the main story for an incidental input mistake.

Robin’s explicit boundaries:

- The troupe does not die through story events. A companion or pet is not permanently taken away.
- A companion can temporarily remain behind, be captured, or be briefly incapacitated, followed by reunion. A solo section must be genuinely playable.
- A deliberately pursued unfavorable ending can exist, but not one that violates the troupe’s protection above.
- Other NPC deaths are possible, including old age, bereavement, or an implied/offscreen crime investigated through damaged or illegible evidence. Such events should be rare and contextually authored. No murder directly on screen.
- Capture and other consequences depend on the actual situation. The authoring of the event determines the available outcomes and how choices lead to them.

**Assistant recommendations:** distinguish committed intention from recognition failure; make significant interpreted actions understandable before commitment; provide assistance in solo sections without requiring the absent companion. The exact confirmation and warning presentation remains to be designed.

---

## 4. Dungeons: scale, fixed challenges, resources, and recovery

### 4.1 Floors can be substantial places

**Robin’s direction.** Do not restrict dungeon design to small room-by-room segments merely because that is easier. Larger floors can contain alternative paths, exploratory spaces, stationed resources, and meaningful navigation between staircases and entrances. [R2 §2]

Mapping is not universal overhead. Dedicated optional mapping dungeons or commissions can make deduction and Japanese route interpretation their main activity. Their rewards and achievements should be worthwhile without becoming essential advantages that undermine their optional nature.

### 4.2 Resources belong to places

Harder dungeons may preserve health and status between encounters. Recovery and other assistance can come from the environment and the player’s understanding of it. Resources are stationed, have limited usage, and may require backtracking. They are not collected for an inventory of later consumable use.

A familiar NPC encountered while delving can help. Their presence is not guaranteed, and finding them should provide aid regardless of whether the player succeeds at an additional personalized interaction. Remembering a shared event, answering a question, or responding in a way that suits their personality can yield better help.

**Assistant recommendations:** design base dungeon viability independently of a lucky NPC encounter; reset temporary expedition state coherently; consider earned shortcuts when repeated empty-corridor walking ceases to be interesting. These are design checks, not new required resource types.

### 4.3 Suspension, failure, and retreat are not interchangeable

| Situation | Robin’s clarified direction |
|---|---|
| Suspend the game or close the browser | Preserve and resume safely; this is not an intentional retreat or defeat. |
| Fail an ordinary dungeon | Restart from the beginning under its communicated rules. |
| Earn a special reprieve in a persistent challenge | Surface and return with the promised exact progress/state preserved. |
| Leave a special dungeon through another method | Apply that dungeon’s declared reset/retreat rule; restarting the current floor was discussed for the Trials. |

The previous assistant preference to preserve all completed floors broadly is not the ordinary-dungeon rule Robin chose. Special dungeons, particularly the 100 Trials, have explicit exceptions.

Health, statuses, used stations, enemies, and mechanism state need internally consistent reset behavior. The exact reset contract is still future specification work; a restart should not accidentally reset only the favorable or unfavorable half of the state. Learning records and previously obtained explanations are conceptually distinct from temporary expedition state.

### 4.4 Adapt before entry, not by moving the exit after mistakes

Optional dungeons can be selected or generated around weaker skills. However, **a generated dungeon is fixed once generated**, and authored dungeons remain curated experiences. Topic and approximate scope should be available before entry—for example, conjugation and past-tense verbs. [R2 §3]

Repeated failure does not lengthen, replace, or silently simplify the dungeon. The player should learn the same challenge and feel accomplished when they understand it. Starting a genuinely different expedition is a separate choice.

For required main-story dungeons, repeated difficulty must not prevent reaching the finale indefinitely. Companion assistance may become more helpful, including highlighting suitable or correct responses. This changes the available support, not the challenge into an undisclosed easier version or the global language profile into another tier.

**Assistant proposal:** offer this help explicitly and allow the player to request or decline it, rather than make an invisible failure counter decide everything.

---

## 5. The 100 Trials superdungeon

### Robin’s supported concept

A substantial, optional challenge encompassing many kinds of knowledge and problem-solving from across the journey. It may introduce unfamiliar vocabulary or grammar with appropriate support and offer growth beyond the starting comfort level. It is not a compulsory proficiency promotion or a substitute for the main story. [R0; R1; R2 §§2–3,6]

Its reputation could be woven into folklore and conversations before entry. Tsuru and other appropriate characters were suggested as possible sources of knowledge, but that must be reconciled with the actual story rather than treated as new canon by this note.

The dungeon should contain meaningful variety: conventional encounters, contextual mechanisms, reasoning, recall, communication, deduction, and application. It is not simply one hundred battles or one hundred increasingly obscure vocabulary quizzes.

Consistent checkpoints, earned reprieves, exact floor-state preservation where promised, persistent expedition health/status where appropriate, and finite environmental resources support the longer journey. Its special rules differ from ordinary dungeon failure restarting from the beginning.

Each major Trial chapter could reward a high-fidelity illustration in the travel volume. Players unable or unwilling to undertake the entire dungeon can deliberately reveal such postgame artwork through confirmation; that does not falsely record dungeon completion or the corresponding witnessed moment.

### Assistant’s retained concept sketch — not a selected blueprint

The assistant proposed the working title **The Hundred Unwritten Rooms**, ten chapters of ten trials, and the following thematic progression:

| Draft chapter | Theme |
|---|---|
| Finding the Way | Directions, locations, notices, clarification |
| Who Does What | Actors, objects, recipients, relationships |
| Before the Bell | Sequence, preparation, duration, linguistic timing |
| What Was Intended | Requests, permission, intention, misunderstanding |
| Reasons and Contrasts | Explanations and alternatives |
| The Exception | Conditions, exceptions, changing a plan |
| What Was Left Unsaid | Omitted information, reference, shared context |
| Whose Account? | Reports, evidence, uncertainty, perspective |
| To Whom Are You Speaking? | Audience, relationship, register |
| The Unwritten Journey | A mixed capstone applying the expedition’s learning |

These titles, their ordering, and the ten-by-ten structure are assistant suggestions, not approved lore, a formal proficiency syllabus, or a guarantee of learning outcomes.

Also proposed: separate language starting profile, a Consolidate/Grow route choice, and tactical challenge settings; teach a concept, support its first application, revisit it after intervening tasks, and combine it with familiar knowledge. A ten-trial pilot before large-scale production was a suggested development approach, not an owner-mandated phase.

**Still open:** exact floor lengths, difficulty options, resource limits, checkpoint spacing, retreat conditions, and how much of the dungeon is authored versus varied within controlled patterns.

---

## 6. Language practice, learning evidence, and optional mastery

### 6.1 More sentence construction in meaningful contexts

Robin supports more English intentions that the player expresses through Japanese ordering/construction, especially as regions are added or expanded. This is not a demand to refactor all existing activities. [R1]

The proposal catalogue also includes visual scene descriptions, clarification, reference tracking, paraphrasing, reported information, and contextual documents. These broaden the kinds of language use instead of making English translation the only route into Japanese.

The assistant suggested a scaffold from complete-sentence selection through chunk ordering and supported particle/inflection selection to bounded typed or handwritten production. That is a flexible design idea, not a requirement that every learner graduate through identical input modes.

Supported valid alternatives matter. A task explicitly practising a particular construction can say so; a task asking for a communicative result should not quietly require one arbitrary stored string when appropriate alternatives have been authored.

### 6.2 Usage and accuracy should describe actual abilities

**Robin’s direction.** Track word, kanji, and kana practice appropriately, including assistance and stroke retries. Offer optional handwriting/comprehension mastery assessments for meaningful groups of items. Small gold stars record understanding, rather than rewarding writing the same character hundreds of times. Hints remain available, but excessive answer assistance should not establish independent mastery. [R1; R2 §4]

There is no approval of one global Japanese-accuracy score controlling story access, damage, or permanent difficulty changes.

The assistant recommended distinguishing recognition, contextual understanding, ordering, typed production, handwriting, listening, assisted practice, and application in another context. A character’s appearance in one answered word should not certify every reading; handwriting trouble should not erase demonstrated comprehension. Those are proposed evidence distinctions, not a finalized database schema.

### 6.3 Assistance weighting remains to be specified carefully

Robin wants an evaluation of the support systems actually provided by the game, with more weight when much of an assessment relies on answer-supplying assistance. Robin entrusted the design evaluation, but no precise formula, threshold, or complete aid classification has been approved.

The assistant’s proposed approach distinguishes:

| Type of support | Proposed interpretation |
|---|---|
| Access/input support | Enlarged text, control guidance, or recognition correction that does not supply the answer does not invalidate language evidence. |
| General conceptual support | A relevant explanation can be recorded without equating it to a supplied solution. |
| Answer-constraining support | A hint that supplies the critical distinction or materially narrows answers is stronger assistance for that objective. |
| Supplied/performed answer | Reveal, correct-choice highlighting, exact tracing, or automatic resolution is supported completion, not unaided evidence for the supplied part. |

The suggested accounting is based on what help reveals and how much of the assessment depends on it, rather than diagnosing a player’s motive from repeated clicks. Reopening the same explanation should not accumulate an arbitrary penalty; several hints that jointly disclose the answer still matter.

Furigana can supply a reading-test answer while being appropriate support in a different comprehension objective. Tactical help need not supply Japanese. Recognition uncertainty, unsupported valid answers, and device trouble are not automatically language mistakes.

The star’s exact evidence threshold, retry model, and UI remain open. Assisted completion should still be useful practice; a future independent opportunity can supply missing evidence. Nothing here establishes empirical recognition rates, retention gains, or official proficiency certification.

---

## 7. Evolving communities, finding people, and road events

### 7.1 Meaningful revisits

Robin especially liked towns changing after wider story beats: altered spaces, new conversations, different routines, and more to do with previously learned or newly acquired responses. Optional hidden areas and unresolved side stories can become meaningful on return. [R1]

Travel several maps away and back, a local event, or broader regional progression were suggested as routine-change triggers. A day/night system was floated, not committed. There is no requirement to introduce calendar management just to move residents around.

### 7.2 Help finding an NPC should be organic and plural

Ask someone nearby whether they have seen the person; not everyone knows, cooperates, or is friendly. Exploration remains viable, and the existing gold-diamond quest helper can provide an explicit navigational alternative. A plausible schedule can help, but a global live timetable for every resident is not the intended experience. [R2 §5]

**Assistant proposal:** distinguish a recent sighting, usual routine, and uncertain recollection; provide information through colleagues, notices, or familiar work sites. Avoid repeatedly moving the target away as the player approaches. These are candidate implementations, not approved exact menu behavior.

### 7.3 Road events

A first eligible arrival can guarantee a distinctive, self-contained event that seems urgent but is not driven by a hidden clock. The player has the information, responses, or support needed to resolve it without leaving the map. Leaving can let it disappear for a time; after resolution, varied repeat encounters can preserve the lesson. [R1; R2 §5]

The assistant recommended retaining a recoverable opportunity for the unique introduction until resolved, rather than replacing unseen story content permanently with a generic repeat. Robin broadly accepted the road-event interpretation, but exact eligibility and recurrence remain to be authored.

Do not infer a replenishable healing-supply economy from early wording about renewable rewards. Robin later explicitly rejected that implication. The value of a revisit can be learning, a scene, exploration, or a bounded reward rather than stockpiling supplies.

---

## 8. Sailing, optional regions, culture, and a potentially longer story

### 8.1 The Harbourmaster and sailing

Robin suggested a long-form quest beginning after the coastal region and extending later into the campaign, earning use of a boat or ferry. Interactive sailing could include sea-related learning, a travel log, route events, direct interaction with the vessel, islands, and distant destinations. [R1]

Travel itself should not be fail-able. The interim activity can be skipped when the player simply wants to move between ports. It should not become a lengthy compulsory minigame on every trip. Specific navigation controls, sea-event rules, and reward details are not yet settled.

A mysterious side region can be hinted at through folklore before access. The boat quest provides early access; ordinary story progression eventually provides another access route. The early visit must let the player make real progress, not merely show locked doors.

Chapter numbers such as 2, 5, and 8 were illustrative planning anchors—not approved chapter placements.

### 8.2 A side region that matures with the journey

**Robin’s direction.** An early visitor receives content appropriate to what can be known then; later visits can deepen conversations and situations as more of the campaign has happened. At its ordinary story-access point, the region is fully relevant to that phase. All selected language profiles still need a complete experience. [R2 §10]

**Assistant proposal:** keep story phase, chosen Japanese profile, and introduced concepts separate. An Advanced early visitor need not hear later spoilers, and a Foundations late visitor should not be blocked. Hold a current activity stable until a sensible transition rather than revising its problem during play.

Existing profile support was cited as a useful foundation. This note does not claim every adaptive story branch is already implemented or inexpensive.

### 8.3 Cultural depth without stereotypes or an exam of manners

Robin supports dialects, including optional Kansai-ben for Suzu, public etiquette, politeness, social relationships, hospitality, folklore, and other culturally grounded situations. These fit alongside changing communities and contextual problems. [R0–R2]

Listening can be offered but must not become required progression. Spoken-pronunciation scoring is excluded. A dialect is not a difficulty punishment, and culture is not a universal correctness score. The original ideas favor context, audience, relationships, signs, observation, and clarification.

The Hot-Spring Commons concept need not avoid all on-screen bathing. Robin explicitly allows appropriately framed, nonsexual towel-covered scenes; the earlier offscreen-only suggestion is not a restriction to retain.

A festival can lead from planning into a distinctive event with clothing, food, fireworks, companion bonding, and for-fun minigames. Its story occasion may be unique, but the minigames should remain accessible later.

### 8.4 Printers’ Quarter: interactive creativity, not a publishing economy

Robin likes constructing stories from language building blocks and discovering readers’ reactions around the world, rather than receiving only an upfront correctness grade. Robin allowed design initiative here but asked for something interactive and lively, not unnecessarily complicated. [R1; R2 §8]

**Assistant candidate design:** choose compatible characters, setting, goal, complication, response, and ending; use supported wording; preview, print, and circulate the result. Readers react to actual themes or choices in the constructed story. Optional proofreading is separate from literary taste. There is no need for sales targets, paper stockpiles, daily distribution chores, or an affection/popularity grind.

The broad creative goal remains; the bounded block model is a proposal for making it implementable without claiming unrestricted text understanding or adding unreviewed AI grading.

### 8.5 Hush and later chapters

More chapters are desired for later, not critical or numerically fixed. Robin’s view that the Hush may be ended while its past effects linger elsewhere is a story-planning assumption to reconcile against the actual ending. Do not declare this canon, resurrect a resolved threat casually, or rewrite the finale merely to justify more encounters.

New postgame problems can involve residual damage, discoveries, disputes, or other mysteries. A longer narrative should deepen the journey rather than merely delay the same resolution.

---

## 9. Achievements, illustrations, gallery access, and replay

### 9.1 Meaningful records rather than chores

Robin favors visually attractive badges, stamps, seals, and illustrations for chapters, regions, substantial quests, dungeon families, and the Trials. Avoid trivial checklist spam. A naturally attained milestone such as using a variety of responses can still be appropriate. [R1]

No login streaks, perfect-answer chains, rare RNG drops, or cosmetic pressure that requires a preferred input method. For-fun festival/minigame scores or chains are a narrow exception when that is the game’s chosen recreational challenge.

### 9.2 The key separation: access versus having been there

**Robin’s clarified direction:** clearing a chapter makes the chapter’s illustrations available, including side-quest illustrations. Ones personally witnessed in regular play gain a distinguishing mark, such as a seal, border, check, or optional sheen. Completing the main story makes all the chosen companion’s illustrations available, with the same distinction for moments actually experienced. [R2 §6]

A special or unseen illustration can initially have a placeholder identifying its broad unlock condition. A player should not be wholly unable to enjoy a difficult optional/postgame illustration, such as one attached to the Hundred Trials: explicit confirmation can make it viewable without performing the challenge.

The assistant recommended treating **viewable**, **witnessed**, and **associated accomplishment completed** as separate records. Revealing an image should not pretend the quest or dungeon was completed. Using ordinary help to reach a real scene should not remove its witnessed status.

The images are viewable through the Ledger and main menu, not during battle. The specific seal/sheen treatment remains open, and animated sheen can be optional.

### 9.3 Main-menu openness and recovery: alternatives still on the table

Robin does not want a login system solely for cross-browser illustration persistence. Two alternatives were discussed:

1. Simple, memorable chapter-clear passwords, retrievable from the main menu and writable down for later access restoration. These are not cryptographic entitlements or anti-sharing protection.
2. An open main-menu gallery where all illustrations can be deliberately viewed, while in-campaign access and witnessed marks still reflect the player’s journey. Robin described this as the most open and accessible alternative; the assistant recommended it.

**The exact selection between these is not formally finalized by this note.** They need not both be implemented. The assistant recommended spoiler protection and making passwords/reveal actions grant access rather than fabricate witnessed marks.

Local gallery records may be separate from a campaign slot, but this discussion does not promise persistence after all browser/site data is erased. It explicitly does not introduce cloud accounts to solve that limitation.

### 9.4 Animated travel-volume illustrations include the player

Robin wants high-fidelity, fullscreen-viewable artwork, with the possibility of subtle animation like a living main-menu scene. The example is a group enjoying food and company beneath an animated fireworks display. It is not just a still wallpaper behind text, nor necessarily a full repeatedly reenacted cutscene. [R1; R2 §7]

The player should be present because they were part of the moment. At the main menu, use the character associated with Continue/autosave/last saved progress; without a usable save, use the creation default. This replaces the assistant’s earlier recommendation to always preserve the appearance originally worn at the event.

The exact precedence between those save sources, scene-appropriate clothing rules, and layered illustration production remain technical art decisions. The assistant suggested freezing the selected appearance while the viewer is open and preserving each illustration’s actual companion rather than replacing them with a different slot’s companion.

### 9.5 Replay without requiring foreknowledge

Multiple save files help, but players cannot know to save before an event they have never encountered. Chapter or scene replay is worth considering; its state and reward rules are not yet chosen.

Festival minigames should survive the festival. Depending on the activity, they can be found in a later physical location or accessed through the companion for tandem/versus play or a Ledger “Distractions” area. A new menu must not take over ordinary companion conversation or interrupt story beats.

---

## 10. “Resolve this step” for procedures already understood

Robin proposed an explicit option for a previously completed step in a longer sequence that has restarted. The option is identified as available because the player completed that step before. It removes the need to input its answer again, but performs the ordinary successful action and its resolution. [R2 §9]

**Assistant recommendations:** verify that it is the same substantive step under compatible conditions; retain normal consequences, costs, and animation behavior; do not record it as fresh independent mastery or duplicate one-time rewards; do not silently finish later unsolved steps. These are proposed safeguards, not a finalized eligibility algorithm.

This is narrower than making every repeated Japanese word an automatic solution. It preserves the meaningful procedure while avoiding needless re-entry of an already-understood portion.

---

## 11. Earlier work this expansion context should build on, not duplicate

This is historical continuity, not a renewed assignment or completion report. The earlier documents retain their own applicable contracts and any subsequent owner amendments. [P1–P2; C1]

| Earlier area | Context worth preserving |
|---|---|
| **Company and companions** | A Ledger view of the chosen companion’s identity, thoughts, bond, memories, personal quest, and situational participation. Distinct personalities respond to valid solutions differently without resentment or permanent abandonment. Personal quests and ending extensions matter. |
| **Cosmetic pets** | Cat, dog, bird, and tanuki were specified as optional decorative companions with naming, field presence, portraits, and coordinated reactions. No combat advantage, scouting, puzzle answers, inventory benefit, hunger, or maintenance obligation. |
| **Field discovery** | Multi-map deduction, useful evidence records, regional puzzle repair, Roadside Keepsakes, annotations, shortcuts, sentence bookmarks, creature observations, and weaving alongside choice prompts. The initial Mill Road’s bypassable “puzzle” was a concrete motivation, not a request to add arbitrary locks everywhere. |
| **The Pages We Keep** | Earlier Atlas-related companion continuity exists in the prior design context. Future dungeons should not erase or duplicate it. |
| **Fishing / A Quiet Cast** | An optional presented practice pastime, untimed by default; a narrowly specified opt-in timing mode pauses for help. Finite rewards should remain available without pressure. Recognition errors are distinct from language errors. This is not an unbounded fishing economy. |
| **Companion Shiritori** | A genuine word game with vocabulary bands, difficulty/stage records per companion, contextual entry through Company and conversation, and personality. The prior specification uses bounded, once-only Bond events—not repeatable Bond per word, win, stage, or visit. Story dialogue retains priority. |
| **Other practice** | Lantern tending, a copying desk, correspondence, proofreading, and contextual comparison activities already have earlier specifications. New activities should supply a meaningful difference rather than duplicate practice menus. |
| **Presentation and storytelling** | Responsive battle art, distinct companion Harmony performances, animated portraits, personality/occupation idles, environmental staging, and manually viewed illustrated scenes belong to earlier work. The present context does not reissue that work or label it complete. |

The older fishing/Shiritori addendum is more specific than the early casual brainstorming. Its existing limits should not be replaced with invented defaults in a future expansion memo. For example, “Shiritori affects Bond” is not permission for unlimited relationship farming.

The same distinction applies to art: a final future art pass does not suspend a current authorized fix or replace current visual acceptance with a promise to improve it later.

---

## 12. The original 60-item idea register

The following preserves the original numbering, six groups, rating vocabulary, and main ideas. **Ratings and effort labels are the assistant’s historical design estimates**, not research findings, timing commitments, owner approval of every detail, or a mandate to implement everything.

Robin liked all ten entries in **A, B, D, and E**. Robin liked **C except #29** and **F except #60**. Later clarifications elsewhere in this note qualify those broad positive reactions. Region names and several system labels below remain working concepts.

### A. Make Japanese itself a more versatile player tool

| # | Original proposal | Original rating / relative effort | Retained meaning and qualifications |
|---:|---|---|---|
| 1 | **Meaning-first sentence forging** | Umazing · Large | Express an intention through meaningful chunks, particles, and suitable endings; authored alternatives can achieve the same communicative result. Let a successful request change the scene rather than only raise a quiz score. |
| 2 | **Scene-to-sentence challenges** | Umazing · Medium | Observe a situation and describe the relevant change, object, or actor. Pictures and optional English support allow practice that does not always begin from an English sentence. |
| 3 | **Particle-powered routing puzzles** | Umazing · Large | Move messages, goods, or gifts between participants by expressing who sends what to whom. Visual consequences make grammatical roles understandable. |
| 4 | **Verb-transformation mechanisms** | Umazing · Large | Authored magical devices require an action, prohibition, preparation, or completed state. Transform familiar verbs to fit the instruction; this is a game device, not a claim about language literally executing commands. |
| 5 | **Reference detective** | Umazing · Medium | Resolve omitted subjects, “that one,” or earlier references across several lines. Match the utterance to the relevant person or object rather than relying only on isolated vocabulary recognition. |
| 6 | **Asking back as a real world action** | Umazing · Medium | Request repetition, clarification, simpler wording, or confirmation and receive useful information that changes the plan. Asking well is communication, not a failure flag. |
| 7 | **Paraphrase bridges** | Umazing · Large | Explain a more complex notice in simpler Japanese while preserving its important condition. The task tests what must remain true, not reproduction of every original word. |
| 8 | **Evidence-reporting relays** | Umazing · Medium | Report what was witnessed, heard, or suspected with appropriate certainty. The situation responds to the distinction without treating honest uncertainty as failure. |
| 9 | **Sound-and-meaning workshops** | Good · Large | Compare reviewed short recordings and use the meaningful distinction in context, with replay and text support. Robin later clarified that listening must remain optional, not a progression gate. |
| 10 | **Comic and dialogue reconstruction** | Good · Medium | Arrange speech, speakers, and connections to reconstruct illustrated events. Several grammatical arrangements can make different stories; select the one consistent with the intended scene. |

### B. Give exploration more decisions between conversations and battles

| # | Original proposal | Original rating / relative effort | Retained meaning and qualifications |
|---:|---|---|---|
| 11 | **Connected Inkweaving systems** | Umazing · Large | Manipulate connected water, shutters, ropes, weights, or airflow across rooms. Observe state, apply a response, and trace consequences; support multiple coherent approaches rather than blind response-spamming. |
| 12 | **Companion information-gap rooms** | Umazing · Large | Player and companion see different information about a mechanism. Exchange descriptions and clarification to coordinate a solution; relevant information remains repeatable. |
| 13 | **Cartographer commissions** | Umazing · Medium | Annotate route knowledge, conditions, and verified landmarks rather than redraw obvious geometry. Robin narrowed this to optional mapping-centered activities/dungeons, not compulsory mapping overhead throughout the world. |
| 14 | **Courier route planning** | Good · Medium | Arrange deliveries around recipients, package requirements, and route conditions. Different plans can work; availability advances through understandable decisions or phases, not reading-time deadlines. |
| 15 | **Purposeful repair jobs** | Umazing · Large | Inspect damage, understand instructions, choose tools, and test a repair. Keep the job’s practical identity without creating gathering, crafting, and material-stockpile grinds. |
| 16 | **Observation-first mechanisms** | Good · Medium | Watch a pattern, pause or inspect it, and select an adjustment. Later situations change a condition; understanding matters more than quick recall of a vanishing animation. |
| 17 | **Public notices that change world behavior** | Umazing · Large | Compose or restore supported notices that NPCs visibly follow. Different valid messages can achieve a goal differently within the authored response space. |
| 18 | **Environmental creature routing** | Good · Large | Observe a creature’s habits and redirect it using appropriate light, shelter, shade, sound, or language. Some encounters become spatial problems; cosmetic pets do not supply hidden solutions. |
| 19 | **Layered-site investigations** | Umazing · Medium–large | Compare an old plan, the present location, and physical traces to recover a route or object. Preserve evidence in the casebook while the player performs the deduction. |
| 20 | **Stage-blocking puzzles** | Good · Medium | Place actors and props according to spatial and sequence instructions, test a scene, and revise misunderstandings. This can be humorous and visual without humiliating the learner. |

### C. Deepen encounters without making Japanese mistakes more expensive

| # | Original proposal | Original rating / relative effort | Retained meaning and qualifications |
|---:|---|---|---|
| 21 | **Encounters with different objectives** | Umazing · Large | Protect a document or lantern, separate tangled effects, preserve something fragile, or create passage. Make the objective legible and allow more than one sensible tactical approach. |
| 22 | **Equivalent expressions, different practice** | Umazing · Large | Choose different supported ways to express an equivalent tactical intention. Practising newer language should not automatically produce weaker battle effects. |
| 23 | **Environmental response combinations** | Umazing · Large | Combine revealing, stabilizing, dispersing, guiding, and similar effects in understandable relationships. Robin favors contextual interactions, not an arbitrary conventional element chart. |
| 24 | **Argument-chain encounters** | Umazing · Large | Follow claims and conditions over several exchanges to identify inconsistency, changed promises, or unsupported conclusions. A visible record supports reasoning instead of incidental memory overload. |
| 25 | **Preparation that changes the opening** | Good · Medium | Inspect the immediate surroundings and choose what to protect or use before an encounter. Preparation opens options without becoming a mandatory pre-fight chore list. |
| 26 | **Companion tactical plans** | Good · Medium–large | Set an understandable support intention and override it when needed. Preserve personality, explanations, and the chosen two-person party; social puzzle events can have more distinctive companion actions. |
| 27 | **Fixed-tool tactical studies** | Good · Medium | Optional compact encounters offer a known toolset and a decision-based objective. Limits concern committed turns, not handwriting speed; retries explain what changed. |
| 28 | **Negotiation as a complete encounter format** | Umazing · Large | Listen, clarify, present evidence, and reach a workable offer. Success is the communicative objective, not maximum flattery or submission; disagreement can remain valid. |
| 29 | **Spatial battle lanes — EXCLUDED AT CURRENT SCOPE** | Meh · Large | Deliberate battle repositioning was considered but rejected for the current scope. Preserve the exclusion rather than quietly introducing it through another encounter feature. |
| 30 | **Mechanic-focused optional superbosses** | Good · Large | Each tests different combinations of understanding and tactics rather than enormous health or perfect-answer endurance. Losing is possible; essential access and cosmetic enjoyment do not depend on an unassisted perfect clear. |

### D. Make dungeons places where learning develops

| # | Original proposal | Original rating / relative effort | Retained meaning and qualifications |
|---:|---|---|---|
| 31 | **Apprenticeship dungeons** | Umazing · Large | Introduce a central construction through a local task, support initial use, and culminate in applying it with familiar knowledge. The dungeon has a learning progression, not just escalating quizzes. |
| 32 | **Transfer-remix chambers** | Umazing · Medium–large | Use familiar relationships in materially different contexts: workshop sequencing might become travel or procession instructions. A changed background alone is not the intended difference. |
| 33 | **Curriculum forks** | Umazing · Medium | Choose a practice direction such as routes, construction, optional listening, or stretch material. Recommendations are transparent and routes remain legitimate alternatives. |
| 34 | **Counterexample halls** | Umazing · Medium | Test similar-looking instructions that differ meaningfully and explain why one does not fit. The result should clarify the distinction instead of only marking a word incorrect. |
| 35 | **Multi-format treasure investigations** | Good · Large | Integrate different evidence from a notice, conversation, diagram, or label to solve one problem, rather than complete several disconnected quizzes before a reward. |
| 36 | **Case-file dungeons** | Umazing · Large | Carry one investigation through the dungeon. New evidence changes theories and questions; the climax uses retained evidence rather than remembering click order. |
| 37 | **Restored-return dungeons** | Good · Medium–large | Revisit a resolved space serving a new purpose, with changed participants or routes. Familiar knowledge remains useful; automatic enemy scaling should not erase the sense of growth. |
| 38 | **Playable short-story rooms** | Good · Large | Read and participate in an illustrated tale or reconstruct its events. Enjoyable sustained reading can exist without an assessment interrupting every sentence. |
| 39 | **Explain-it-to-a-partner challenges** | Umazing · Medium–large | Choose between plausible plans and explain the supporting condition with evidence or bounded Japanese. The partner is participating in reasoning, not suddenly becoming incompetent. |
| 40 | **Curated Atlas commissions** | Umazing · Large | Give an expedition a coherent objective and topic using suitable existing infrastructure. Select content before entry; later user clarification rejects silently reshaping an active dungeon after mistakes. |

### E. Expand cultural and social understanding through participation

| # | Original proposal | Original rating / relative effort | Retained meaning and qualifications |
|---:|---|---|---|
| 41 | **Register and role-switch scenarios** | Umazing · Large | Communicate similar information as a guest, colleague, friend, or representative. Relationship and purpose change the fit; the most formal response is not automatically the best. |
| 42 | **Public-space observation challenges** | Umazing · Medium–large | Use signs, observation, and questions to understand what a particular place requests. Avoid treating every venue or person as governed by one identical cultural rulebook. |
| 43 | **Polite boundaries and refusal** | Umazing · Medium | Decline, correct an assumption, or offer an alternative while preserving intention. Several responses can be appropriate; boundaries are not automatically relationship failures. |
| 44 | **Invitation and commitment negotiation** | Good · Medium | Discover what people can agree to, confirm details, and propose workable alternatives. The activity is reaching understanding, not flattering the highest-status person. |
| 45 | **A dialect field guide beyond the toggle** | Umazing · Large | Build optional regional/standard comparisons and contextual explanations around interests such as Suzu’s Kansai-ben. Audio requires care; comprehension and imitation are different goals, and hearing is not mandatory. |
| 46 | **Market quantities and practical numeracy** | Good · Medium | Interpret amounts, packaging, prices, dates, and collection instructions while arranging an order. Keep arithmetic simple or supported so the activity remains about language. |
| 47 | **Gifts with communicative intent** | Good · Medium | Choose how to present, explain, receive, or decline a gift for the occasion and relationship. Do not create mandatory gifting, affection farming, or expensive-gift superiority. |
| 48 | **Everyday document missions** | Umazing · Large | Accomplish practical tasks using authored notices, forms, schedules, labels, menus, and receipts adapted to the setting. Relevant interpretation matters more than translating every printed word. |
| 49 | **Folklore with multiple tellers** | Good · Large | Compare stories and perspectives, possibly creating an exhibition or performance. Robin especially liked word-of-mouth mystery and its link to hinted regions. Distinguish invented setting lore from claims about real culture. |
| 50 | **Festival planning as cooperative problem-solving** | Umazing · Large | Coordinate invitations, placement, instructions, and practical needs to create a visible festival. Robin adds clothing, food, fireworks, companion bonding, and minigames that remain replayable afterward. |

### F. Regions and longer-term systems that would genuinely change the experience

| # | Original proposal | Original rating / relative effort | Retained meaning and qualifications |
|---:|---|---|---|
| 51 | **The Canal Exchange** | Umazing · Very large | Working region concept: plan canal routes, dispatch goods, interpret conditions, and negotiate access in a changing transport network—not simply another harbor with a different palette. |
| 52 | **The Mountain Relay** | Umazing · Very large | Working region concept: linked inns and message stations emphasize reports, routes, commitments, and planning with discoverable incomplete information. Weather or availability changes through clear phases. |
| 53 | **The Echo Isles** | Good · Very large | Working region concept: distributed messages, speakers, and route information emphasize optional listening. Reviewed audio is a substantial dependency; provide a complete text-accessible path. |
| 54 | **The Printers’ Quarter** | Umazing · Very large | Working region concept: compose, proof, print, and circulate stories/notices with visible world reactions. Robin’s creative story-building direction and the assistant’s restrained candidate loop are recorded in section 8. |
| 55 | **The Hot-Spring Commons** | Good · Very large | Working region concept: hospitality, reservations, shared spaces, requests, and boundaries. Robin allows nonsexual towel-covered bathing scenes; an offscreen-only restriction was not retained. |
| 56 | **The Travelling Stage District** | Umazing · Very large | Working region concept: rehearsal, audiences, intentions, and stage arrangement. Suzu is a natural thematic connection, but all companions should participate meaningfully; this is not a rhythm-score barrier. |
| 57 | **A travelling reading room** | Good · Large | A small room or caravan could display chosen books, memories, repaired objects, and practice records. Its purpose is preparation and reflection, not a housing economy or recurring upkeep. |
| 58 | **A “Things I Can Do” portfolio** | Umazing · Medium–large | Present concrete abilities with actual contextual evidence and useful next activities. It is not a global fluency percentage or official proficiency certificate. |
| 59 | **Achievement stories, not chore counters** | Good · Medium | Record meaningful discoveries, valid alternate solutions, communication, chapters, and challenges. Robin’s later gallery/access rules distinguish enjoying artwork from earning its witnessed mark. |
| 60 | **A player-authored practice-route builder — EXCLUDED AT CURRENT SCOPE** | Meh · Very large | A creation interface for arranging validated rooms/topics was considered, but Robin left it out of the current scope. Do not introduce a dungeon editor as an assumed requirement. |

---

## 13. Explicit exclusions and narrow exceptions

These are not “low-priority ideas to sneak in later.” They are directions Robin explicitly excluded in the discussion unless subsequently reopened. [R1–R2]

| Excluded direction | Preserve the distinction |
|---|---|
| Crafting economy | Purposeful authored repairs or craft interactions can still exist. |
| Collectible card game | Shogi remains a separate optional idea to evaluate; Shiritori may deepen. |
| Daily farming/maintenance chores | A garden or cultural event is not automatically a daily-care system. |
| Global difficulty scalar | Explicit language profiles, chosen challenge, and optional support are different systems. |
| Correctness-based damage multiplier | Equivalent intended language need not be tactically inferior because it was assisted or a different input mode. |
| Politeness/cultural correctness score | Context-sensitive outcomes and explanations are not a morality meter. |
| Login streaks, general perfect-answer chains | Personal skill scores/chains in a deliberately recreational minigame are the stated exception. |
| Unreviewed AI dialogue grading | Bounded creative expression and reviewed supported alternatives remain possible. |
| Rare rewards with an RNG drop rate | Unpredictable events can exist without rare-loot farming. |
| Required spoken-pronunciation scoring | Optional listening is welcome, but hearing is not required progression. |
| Spatial battle positioning (#29) | More complex actor intentions do not authorize a battle-lane subsystem. |
| Player-authored practice-route editor (#60) | Curated learning expeditions do not require a creation platform. |
| Consumable-hoarding satchel | Stationed environmental resources and their local limits are the intended dungeon model. |
| Permanent loss/death of the troupe | Temporary companion absence can be an authored, solvable story section. |
| An account/login system solely to preserve gallery access | The open gallery/password alternatives were proposed instead. |

The assistant also cautioned against universal automatic success, gigantic HP-only challenges, timer-driven reinforcements, and one hundred identical tests. These cautions support the discussion but do not replace Robin’s more nuanced permission for tactical losses, ordinary dungeon restarts, and contextual side-story consequences.

---

## 14. Important refinements: do not revert to the earlier version

| Earlier or easy-to-misread idea | Current discussion position |
|---|---|
| Weakness-sensitive dungeons continuously change size after errors | Their focus/scope may be selected or generated before entry; an active dungeon remains fixed so the player can learn it. |
| Every dungeon preserves completed floors | Ordinary failure restarts the dungeon. Special challenges have expressly different checkpoint rules. |
| “Taking too long” means real elapsed time | It means the relevant committed turns/actions; reading and help do not advance danger. |
| Reinforcements must be absent from bosses or always finite across the whole fight | Exceptional bosses may summon repeatedly under fair contextual design; ordinary additions are finite and arrivals are uncommon overall. |
| Help must make all failure impossible | Chosen challenges may be lost. The main story must offer enough assistance for continued progress. |
| Every response must always be tactically beneficial | A meaningful no-effect/unsuitable preview is acceptable; avoid unexplained whiffs and narrowly useless tools. |
| Repeat rewards imply healing supplies to stockpile | No consumable inventory or potion/salve economy is being introduced. |
| Cosmetic illustrations must all be individually earned to be viewed | Chapter/companion access and explicit reveal options separate viewing from witnessed/accomplishment records. |
| Every remembered image permanently uses historical event-time appearance | Robin requested the active/Continue-associated player appearance, with the creation default as fallback. |
| Preserving gallery access requires cloud accounts | No login for this purpose; simple passwords or open main-menu access are alternatives. |
| Festival games disappear with the one-time festival | The story occasion can be unique, but its games remain available through a suitable later venue or activity entry. |
| Onsen must be offscreen | Appropriately framed, nonsexual towel-covered bathing scenes are acceptable. |
| Support for all ideas in a group means a sixty-feature work order | It means supported exploration; scope still awaits explicit selection. |
| Ten or twelve chapters and the Hundred Rooms’ exact titles are approved | Chapter count is aspirational; the assistant’s names/structure are working concepts. |
| The final art pass should start now | It is a later, major finishing phase after Robin is satisfied with content, scale, and the overall experience. |

---

## 15. Development cadence and the eventual final art pass

### 15.1 Robin’s testing preference, retained as context

Robin stated that continued development can use **Foundations + Ren (F/Ren)** for the routine comprehensive route/encounter/area sweep, instead of repeatedly running the full four-profile × four-companion campaign matrix while substantive additions remain planned. The full matrix is reserved for an explicit instruction along the lines of “this should be the final addition; do the full matrix.” [R2 §10]

This does not mean no tests, and an F/Ren result is not evidence that every other companion and profile works. The assistant proposed inexpensive build/content checks plus bounded tests of a changed companion, profile-specific task, or alternate outcome, without replaying sixteen entire campaigns.

**Sharing this context note does not itself stop a currently authorized test run or modify the current assignment.** Existing direct instructions remain the execution authority. The preference is recorded so future planning does not repeatedly consume the same large validation budget by default.

### 15.2 Final art: after satisfaction with the product’s substance

Robin wants another substantial art pass near the end, once the game feels complete and satisfying in presentation, scale, and gameplay—not as an immediate replacement for active work. Robin understands that expanding before redrawing can mean revisiting more material and accepts that trade-off. [R2 §10]

The assistant suggested preserving stable character identity, layer/attachment conventions, scene composition planning, and rebuildable sources during development, then approving and applying a coherent final visual standard across the finished content. Final integrated validation should follow the art integration, since changed bounds, layering, readability, and performance still matter.

That proposed sequencing is not permission to leave current authorized visual defects unfixed, nor proof that the existing modular renderer already supports every future painterly full-scene requirement.

---

## 16. Open decisions to retain, not answer by assumption

No immediate response is required to every item here. These are the matters to revisit when a specific expansion is selected.

| Area | Still needs a scoped decision |
|---|---|
| Actual expansion selection | Which subset becomes the next assignment, and what existing content it depends on. |
| New regions and chapters | Themes, canonical names, entry order, narrative purpose, and actual chapter count after the current story is reviewed. |
| Hush aftermath | What the existing ending establishes, and which effects can remain without undoing that conclusion. |
| Encounter participants | Specific agendas, arrival eligibility, rates/limits, target communication, and consequences per event. |
| Ordinary dungeon resets | Exact entry-state restoration, resource reset, suspend rules, and retained knowledge records. |
| 100 Trials | Authored/generative mix, floor scale, chapter structure, checkpoints, resource limits, and optional growth content. |
| Assistance/mastery | An audit of actual support functions, objective-specific weighting, sufficient independent evidence, retests, and player-facing terminology. |
| NPC routines | Trigger model, organic information sources, quest-guide interaction, and behavior during active pursuit of a moving target. |
| Gallery | Open main-menu access versus passwords; spoiler treatment; exact witnessed mark; appearance-source precedence; scene/replay access. |
| Replay | Which moments can be revisited, how alternate branches are presented, and how replay avoids falsely changing campaign outcomes or awards. |
| Sailing | Direct interaction design, skippable travel boundaries, event frequency, port eligibility, and early-region content. |
| Printers’ Quarter | How expressive the building blocks are, which reactions are authored, and where optional language feedback belongs. |
| Cultural/audio material | Appropriate linguistic/cultural review and complete non-audio accessibility. No unreviewed output becomes authoritative teaching by default. |
| Final art production | Asset method, consistent fidelity, modular player poses, animation scope, and acceptance at actual gameplay size. |

There are no approved reinforcement probabilities, mastery weight formulas, exact new map totals, daily obligations, or fixed hundred-trial session lengths hidden in this note. Earlier numerical examples were proposals, not measurements or final tuning.

---

## 17. Historical observations are not a fresh defect list

The discussion grew out of several observations: the early Mill Road interaction was bypassable; some battle flow felt predictable; static people sometimes failed to perform narrated actions; and later art quality needed consistency with high-fidelity references. Earlier audit work supplied examples across the world rather than only Chapter 1.

Those observations may already be addressed or under active work. Do not reopen or duplicate a repair simply because it is mentioned as motivation here. Before a future authorized expansion, compare the current implementation and its evidence against the selected scope.

The earlier presentation audit was diagnostic rendering and selected scene playback, not a claim of an ordinary complete campaign playthrough. This document also makes no such claim.

---

## 18. Source record and handoff summary

| Ref | Source and how it is used |
|---|---|
| **R0** | Robin’s initial moment-to-moment expansion request in this conversation: new regions, active use and repetition, contextual/recall dungeons, optional higher-tier growth, achievements, culture, and a 30–100 idea catalogue. |
| **A0** | The assistant’s 60-item, six-group expansion response in this conversation, including historical ratings and the proposed Hundred Rooms sketch. This is the source of the catalogue’s original numbering, not a new approval record. |
| **R1** | Robin’s `Expansion Consultation Review.txt`, 52 source lines. It contains group-level reactions, the sailing/region idea, gallery ambitions, and explicit exclusions. The complete review was available and read when compiling this context. |
| **R2** | Robin’s subsequent ten-point clarification in this conversation, beginning “The bounded rule can be displayed per the event it pertains to.” It clarifies arrivals, troupe safety, dungeon scale/resets, fixed generation, assistance, NPC search, accessible illustration viewing, player appearance, procedure shortcuts, region evolution, F/Ren testing, and the late art pass. |
| **A1** | Assistant responses discussing the review and the ten-point clarification. Implementation suggestions are labelled as such rather than promoted to Robin’s decisions. |
| **P1** | `Road_of_Borrowed_Names_Living_Company_and_Discovery_Addendum.md`. Its overview and preservation boundaries were revisited for continuity: Company, cosmetic pets, field puzzles, evidence, memories, and Atlas follow-on. The full earlier assignment is not replaced or reauthorized here. |
| **P2** | `Road_of_Borrowed_Names_Practice_Fishing_and_Shiritori_Addendum.md`. Its overview, timing/Bond exceptions, and activity/entry boundaries were revisited. Exact older implementation budgets remain in that specification, not invented anew here. |
| **C1** | Earlier visible discussion of battle/portrait/cutscene/idle presentation and current art feedback. Included only to separate ongoing presentation work from the future expansion catalogue. |

This is a synthesis, not a verbatim transcript of every prior message or a fresh web-research report. It preserves the complete 1–60 idea register and the substantive owner refinements available in this conversation. It does not preserve every discarded wording, generated art prompt, or external link from the original brainstorming.

### The context Claude should carry forward

Robin wants a richer adventure in which Japanese increasingly gives the player agency. The most attractive growth areas are changing communities, flexible contextual responses, substantial optional learning dungeons, meaningful sailing and region discovery, culturally grounded participation, and beautiful memories of the journey.

The game can have challenge and consequences without charging the player for reading time or treating support as a moral failure. The dungeon can remain fixed while the learner improves. Artwork can remain accessible while earned records stay truthful. The troupe remains safe from permanent loss. New content should add meaningful experiences, not chores or a collection economy.

**Keep this as future context. Continue the currently authorized work. Wait for Robin to select and authorize expansion scope before turning any of this into implementation.**
