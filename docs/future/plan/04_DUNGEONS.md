# 04 · Dungeons, expeditions and the Hall of a Hundred Tales

*Expansion plan, draft 3 (2026-10-07, after Robin's second round of answers). Planning only.*

Robin's direction, consolidated:

- **Scale.** Dungeons can be large, floor by floor, with exploration between staircases [R2 §2].
- **Resources.** They belong to places, have limited uses, may need backtracking, and are never collected into an
  inventory [R2 §2, R2 §5].
- **Persistence.** Harder dungeons may keep health and status between encounters [R1].
- **Failure.** Failing an ordinary dungeon restarts it from the beginning; special dungeons (the Trials) have their
  own checkpoint and retreat rules [R2 §2].
- **Fixed challenges.** A dungeon is fixed at generation, or authored. The player can preview its topic and scope
  before entering. Failure does not change it [R2 §3].
- **Required dungeons.** They can always be finished, with escalating companion help [R2 §3].
- **Suspend** exists only in the 100 Trials, and never from a battle [H2].

## What exists today (audit summary)

- **Story dungeons** are authored map sets with checkpoints. Defeat returns you to `s.checkpoint` with learning
  kept (`engine/90_game.js:372-379`).
- **Resolve is restored after every encounter** (`ui/80_combat.js:1429-1431`, "no attrition grinding"). Inns and the
  script `!heal` restore too.
- **The Unwritten Atlas** (postgame) is the existing generated expedition:
  - 8–9 rooms of 21×15 tiles, built from 14 hand-drawn patterns, with a camp and a road home.
  - Seeded per run and resumable after closing the browser, through autosaves on room transitions.
  - Its escorted lantern is the only health-like value that persists across rooms. It needed a MutationObserver
    hack to show its bar.
  - **It adapts during a run:** objective steps are chosen on first contact, and every encounter's pool adds the
    player's weakest items. **Robin (C-18): the Atlas stays the premier randomly generated dungeon.** Its shape is
    fixed per run; its practice words keep adapting (Robin confirmed, C-57).
  - **Robin's addition (C-57): more variety inside the fixed shape.** When a run is generated, each room also gets
    its own variation within its hand-drawn pattern: mirrored or rotated where the pattern allows, different
    obstacles and props, different decor, creatures standing in different places. All of it is chosen at the
    run's start, stored with the run, and never changes during it, so a run "feels a little different each time"
    without moving its goalposts (G7). A layout check proves every variant is walkable and its exits reachable.

---

## D1 · The expedition framework

**What and why.** One engine for every dungeon with expedition rules (persistent condition, stations, restart
rules): authored side dungeons, Atlas commissions and the Hundred Tales. Story dungeons keep today's checkpoint
model unless a chapter opts in.

**Approach.**
- **Expedition state** `s.expedition = {id, kind, seed, floor, entryState, condition, stations, mechanisms, foes,
  rules}`. It is saved with the campaign by the ordinary autosave on floor and room transitions, never during a
  battle. The Atlas run state is the precedent.
- **Floors are real maps**, authored or assembled from authored parts (Atlas-style). They may be large: 40×30 tiles
  or more, with loops, landmarks and optional chambers, as Robin wants.
- **Fixed at creation.** A generated expedition stores its seed *and* its chosen learning content at entry. It never
  changes what it asks after a mistake. A *new* expedition is a separate, deliberate choice.
- **Battle hook.** A proper engine hook for expedition values in battle replaces the Atlas's MutationObserver hack:
  the party's starting resolve, extra bars, and field conditions.

**Effort:** L.

---

## D2 · Persistent condition and stationed resources

**What and why.** Robin [R1]: "Where it would mean most is if your health and status persisted throughout harder
dungeons." Two spec rules shape the design:
- mistake costs are "small, capped per exchange, and never compounded" (line 128);
- "Prevent resource softlocks" (line 216).

**Where (Robin, C-04, 2026-10-07): only in dungeons that specify it.** Persistent condition is a property a
dungeon declares on its preview card, never a world-wide rule, and recovery never depends on walking back to inns
(which would be tedious). Everywhere else, resolve resets after each encounter as today.

**Approach: carry over what tactics did, not what language mistakes cost.**
- **What carries over.** In an expedition with *persistent condition*, at the end of each encounter:
  - resolve is restored *only by the amount that language mistakes cost in that encounter*;
  - blows taken from telegraphed moves carry over, together with statuses (chill, wet, Heat on you).
  So learning mistakes never compound across a dungeon; tactical choices do. In Assisted mode mistakes already
  cost nothing.
- **Stationed resources (no inventory):**

  | Station | Effect | Uses | How it's earned |
  |---|---|---|---|
  | Rest bench / shrine step | +4 resolve each | 2 per expedition | present |
  | Spring | full resolve, clears statuses | 1 | present, or restored by fixing its pipe (a repair job, A15) |
  | Shelter | clears statuses; the companion talk point | unlimited, no healing | present |
  | Restored lamp | a new rest point where none was | 1 | repair a broken lamp: understanding the environment, as Robin asked |
  | A delver's aid | varies (D8) | once per meeting | chance |

- **Backtracking is a choice.** Going back to a spring is a route decision. Shortcuts opened from the far side (a
  ladder, a gate) cut the walk, as Astra suggests (D10).
- **No softlock.** Every floor's exit is always reachable, and the expedition can always be left. If condition runs
  out, defeat applies the expedition's rule (D3), which always gives a way forward.

**Pros.**
- Real attrition and planning.
- Learning mistakes stay cheap.
- The satchel stays free of potions.

**Cons.**
- Balancing needs a new curve test that plays whole expeditions.
- The "restore mistake costs" rule must be explained clearly in one sentence on the preview card.

**Effort:** M.

---

## D3 · Failure, retreat and suspend

| Situation | Ordinary side dungeon | Story dungeon | Atlas commission | Hall of a Hundred Tales |
|---|---|---|---|---|
| **Close the browser / leave the game** | Resume from the last autosave: floor or room entry, never mid-battle (Robin's H2: "the regular autosave is enough") | Same | Same | **Suspend**: resume exactly where you stood outside battle (H2) |
| **Defeat in an encounter** | **The expedition restarts from its entrance** (Robin [R2 §2]); the temporary state resets coherently (D3a) | Back to the chapter's checkpoint, as today; companion help (E19) | The run ends with its consolation reward, as today | **The current floor restarts**; earlier floors stay done |
| **Choose to leave** | Leave; the next visit starts fresh | Leave freely, as today | "Head home" at camp, as today | **Earned reprieve:** return to the surface with exact state kept. **Emergency retreat:** the floor resets on return |

**D3a · What a restart resets** (Astra: never only the favourable or unfavourable half):
- **Resets:** creatures, stations' uses, mechanisms, the party's condition (to full), and temporary relics.
- **Kept:**
  - the learning record;
  - explanations discovered (Known details);
  - map knowledge (the auto-map stays revealed, an earned convenience);
  - Resolve-this-step eligibility for solved mechanisms (E11).

**Decided (Robin, C-03).** The full restart applies to *optional* dungeons, and their preview card says so. Story
dungeons keep checkpoints, as spec line 128 asks, plus the declineable companion help (E19).

---

## D4 · The entrance preview

**What and why.** Robin [R2 §3]: "Players should be able to preview the content/scope of the dungeon before entering.
If it's a dungeon focusing on conjugation and past-tense verbs, let them know."

**Approach: a preview card at every expedition's entrance.**

> **The Undercroft Locks** — side dungeon
> **Language:** directions and "who sends what to whom" (に・へ・を・から・まで). New: none.
> **Size:** 3 floors, about 25–40 minutes.
> **Rules:** condition carries between encounters (mistakes don't count against it) · 2 rest benches, 1 spring ·
> defeat restarts the dungeon · ambushes: yes, announced.
> **Suggested for:** any profile; tasks follow yours.

- It names *what is practised*, never the solutions.
- Generated expeditions show their chosen content before entry, and that content stays fixed.

**Effort:** S.

---

## D5 · Story dungeons

- **Keep chapter checkpoints** (spec line 128).
- **Escalating, declineable companion help** after repeated defeat (E19).
- **New chapters' dungeons** (Undercroft, Understage, High Pass, Steam Vents, Root Hollows) use the expedition
  framework's *mechanisms and stations*, so they feel like the side dungeons. Each may opt in to persistent condition
  on Demanding only.

---

## D6 · Dungeon families: ten kinds of learning space

Astra's group D, which Robin rated "all solid". Each family is a *design pattern* that regions and the Hall reuse.
None is a separate engine.

| # | Family | The idea | Where the plan uses it |
|---|---|---|---|
| A31 | **Apprenticeship dungeon** | Enter knowing everything but one central construction. A local task teaches it, the next rooms support it, the last combines it with old knowledge | The Understage (reference and omission); the Cloudroad's High Pass (hearsay) |
| A32 | **Transfer-remix chambers** | A known relationship in a different setting: workshop sequencing becomes a procession's order | Kotonoha (words in new places); Hall wing 3 |
| A33 | **Curriculum forks** | At a junction, choose directions, construction, optional listening, or a stretch topic. Both routes reach the same place and reward | Every Atlas commission; Hall wings |
| A34 | **Counterexample halls** | Similar instructions that differ in one feature; test them and see why one fails | Hall wing 6 (exceptions); the Mist Barrier |
| A35 | **Multi-format treasure** | A notice, a conversation, a diagram and a label each hold part of the answer | Manybridge's Lost Contract; Hall wing 8 |
| A36 | **Case-file dungeon** | One investigation across the whole dungeon; evidence changes the theory | The Cloudroad (the last courier); a postgame Atlas case commission |
| A37 | **Restored-return** | Come back after an area is fixed and use it differently | Kotonoha's deeper wing; Manybridge's Undercroft as a working dock postgame |
| A38 | **Playable short-story rooms** | Step into an illustrated tale and carry out or reconstruct it; reading for its own sake, optional questions after | Hall of a Hundred Tales (each wing opens with one); Steamhollow's footbath poet |
| A39 | **Explain it to a partner** | The companion proposes two plausible plans; you explain which condition supports yours | Throughout: a recurring companion beat in dungeons |
| A12 | **Information-gap rooms** | You and your companion see different halves of a mechanism; exchange descriptions | Root Hollows; Understage; Hall wing 2 |

Each family gets an authoring template (S5), a worked example at all four profiles, and one test pattern.

---

## D7 · Atlas commissions: themed, reactive and mapping expeditions

**What and why.**
- Robin [R1]: "Totally optional, reactive dungeons that scale in size and content with your weaker skills… a
  truly great idea." Clarified [R2 §3]: chosen and fixed before entry; size chosen, not grown after mistakes.
- Mapping dungeons as optional, self-contained activities with an achievement and their own worthwhile rewards
  [R1].
- Astra A40: themed commissions on the existing generator.

**Approach.** Extend the Unwritten Atlas, rather than build a second generator.

- **The commission board** in the Lantern Hall (where the Atlas begins) offers three kinds:

  | Kind | What it is | Chosen before entry |
  |---|---|---|
  | **Practice commissions** (reactive) | Built around the player's *weaker* items and skills, from the evidence log (L1): "past-tense verbs", "the kanji you've met in Manybridge", "requests and refusals" | The topic, the length (short / standard / long, Robin's "scale in size", *chosen* by the player) and the content, fixed at that moment |
  | **Themed commissions** | Authored objectives (Astra A40): recover a route, resolve conflicting instructions, introduce a named grammar family | Topic and length |
  | **Survey commissions** (mapping) | The Cartographer's work: an incomplete route description and an auto-drawn map; annotate verified landmarks, safe passages and conditions, never redraw corridors (A13) | A survey area |

- **Built as Atlas runs** (Robin, C-18: the Atlas stays the premier generated dungeon). Each commission is an
  Atlas run type: the commission sets the topic, length and shape when the player accepts it, and the run keeps
  that shape. Within it, the Atlas keeps choosing practice words from the player's weakest items as it does today
  (C-57, confirmed).
- **Survey rewards** (Robin: worthwhile without defeating the purpose):
  - each survey adds a page to the **Cartographer's Atlas**, a map collection in the travel volume;
  - surveyed routes become Atlas shortcuts;
  - completing every survey is an achievement with its own stamp and a cosmetic (the cartographer's compass).

**Effort:** L.

---

## D8 · Delvers: familiar faces in the depths

**What and why.** Robin [R1]:
- Recurring NPCs can delve alongside the player, met "via exploration or pure chance — not a guaranteed encounter".
- If you can recall key moments with them, answer their questions, or impress them with a joke they'd appreciate,
  you're rewarded better.
- "Finding them at all should be a clear aide."

**Approach.**
- **A delver** is a known NPC with a short expedition presence: they appear in a side chamber, on a seeded chance per
  floor (S2), at most once per expedition.
- **Meeting them always helps.** They give one benefit: a rest, a shortcut opened, a field condition removed, or
  their help as a guest in the next encounter (E1).
- **The bonus.** A short memory conversation:
  - "Do you remember what I said at the ferry?";
  - Suzu wants a punchline;
  - Nao wants to know which road you took.
  Answering from what you experienced (Known details and the dialogue history are allowed: it is *your* memory, not
  a test) improves the benefit.
- **Fairness.** A wrong answer never removes the base benefit. Astra: the dungeon's viability never depends on
  meeting them.
- **Cast:** about twelve NPCs across the existing and new regions, with sealed note S7 for later-chapter people.

**Effort:** M.

---

## D9 · The Hall of a Hundred Tales (百物語の館)

**Robin's concept** [R0, R1, R2]:
- An optional superdungeon testing everything learned.
- It can push to the next tier by the end, offered and never forced.
- Steeped in folklore, "a place where only the most dedicated and studied inkweavers may prevail", with Tsuru and
  others knowing of it.
- Consistent checkpoints; returning to the surface with exact floor state after an earned reprieve; restarting the
  floor if you leave another way.
- Persistent condition and limited stationed resources; delvers.
- Each chapter's reward is a full-page painterly illustration, revealable by confirmation for those who won't
  finish.
- Suspend only here [H2].

### Lore

- **The custom.** 百物語怪談会 is a real Edo-period gathering: a hundred lights, a hundred strange tales, one light put
  out after each. Legend held that something appeared after the hundredth.
- **The keepers' version, fiction built on it.** The old lantern-keepers' order kept a hall where apprentices
  *relit* a hundred lanterns, one per tale understood. The hall was abandoned generations ago.
- **Seeding the rumour.**
  - Tsuru mentions it in passing: "My teacher's teacher sat the Hundred. Nobody finishes it any more." This must fit
    her canon voice.
  - Manybridge's oldest play is about it; a Cloudroad pilgrim is looking for it; Kotonoha's keepers hold its missing
    tale.
  - Each new region adds one telling (folklore with multiple tellers, A49).
- **Access.** Postgame: Tsuru gives the player the hall's key ledger after the story.

### Structure

**Ten wings of ten tales.** Each wing is one story-world inside a lantern's light, with its own map identity, music
and language theme. Astra's ten themes are kept and given tales:

| Wing | Tale | Language theme | Folklore source (label in-game) |
|---|---|---|---|
| 1 | **The Lamp at the Crossroads** | Finding the way: directions, signs, asking for clarification | Invented |
| 2 | **The Fox's Wedding** | Who does what: a procession carrying gifts from whom to whom (particles) | Real image: 狐の嫁入り, a "fox's wedding" in sun-showers |
| 3 | **The Bell Before Dawn** | Sequence and timing | Invented |
| 4 | **The Borrowed Umbrella** | Requests, permission, intention, misunderstanding | Invented, in the style of real folktales |
| 5 | **The Two Wells** | Reasons and contrasts | Invented |
| 6 | **The Toll That Changed** | Conditions and exceptions | Invented |
| 7 | **The House That Remembers** | What was left unsaid: omission, reference | Real legend: マヨイガ, the "wandering house" of Tōno folklore |
| 8 | **Three Witnesses at the Inn** | Whose account? Reports, evidence, uncertainty | Invented |
| 9 | **The Crane's Return** | To whom are you speaking? Register and relationship | Real folktale: 鶴の恩返し (and, quietly, Tsuru's own name) |
| 10 | **The Hundredth Tale** | The unwritten journey: a capstone mixing everything | The player's own journey, told back |

- **A wing's ten trials** mix types. A typical wing:
  - an opening short-story room (A38);
  - three exploration and mechanism trials;
  - two encounters (one with conditions, one social);
  - a counterexample hall (A34);
  - an information-gap room with the companion (A12);
  - a delver chance;
  - a capstone procedure or boss.
- **Floors** are large authored maps with variable sections. A wing is 3–4 floors. The ten tales are authored; the
  variations inside them (which room order, which version of a puzzle, which items practised) come from controlled
  patterns fixed when the wing is entered.
- **Hearths** at each wing's start are its checkpoints. Reaching a hearth relights its lantern permanently.

### Rules (from Robin)

| Rule | Detail |
|---|---|
| Persistent condition | Across a wing (D2). Mistake costs never carry |
| Stationed resources | Per floor: one bench (2 uses), a spring every other floor, shelters; restored lamps |
| Earned reprieve | Some trials (a riddle, a puzzle, a unique encounter) grant a **reprieve**: return to the surface with the exact floor state kept, as Robin specified |
| Emergency retreat | Leave at any time outside battle. The current floor resets on return; earlier floors and wings stay done |
| Defeat | The current floor restarts; nothing earlier is lost |
| Suspend | Close the game anywhere outside battle and resume exactly there. Stored as a per-slot recovery-style record, removed with the slot, never a seventh save (spec lines 224, 228) |
| Delvers | D8, rarer and stronger here |

### Three choices per wing (Astra's separation, kept)

1. **Language profile**: the campaign's, as always.
2. **Route: Consolidate or Grow** (L18).
   - *Consolidate* applies what you have.
   - *Grow* introduces two or three stated next-tier constructions, teaches them in the wing's first trials, and
     revisits them throughout. It never changes the global profile. For Advanced players, Grow means nuance, genres
     and conflicting perspectives, never an invented "native" tier.
3. **Tactical challenge**: Relaxed, Standard or Demanding for the wing's encounters.

All three are shown on the wing's preview card (D4) and can change at a hearth.

### Rewards

- **Each wing:** a lantern relit; a stamp (K1); a painted, animated **travel-volume illustration** of its tale with
  the party in it (K2); a companion reflection.
- **All ten:** the Hundredth Tale's illustration, the player's journey, animated (the strongest "I can do more than
  when I started" moment); a commemorative cosmetic; a final conversation with Tsuru.
- **Revealing without finishing** [R2 §6, H1]: any wing's illustration can be revealed by confirmation from the
  gallery. That marks it *viewable*, never *witnessed* or *completed*.
- **Records.** An optional, truthful note per wing: route, tactical setting, and how much answer-supplying help was
  used, using L2's categories. It is never a gate.

### What it must not be (Astra's "Bad" list, kept)

- Not one hundred mandatory battles.
- Not restarting from room one.
- Not withholding help.
- Not escalating after mistakes.
- Not a final collectible behind a perfect run.

### Building it

Start with **one wing** (wing 1, or wing 2 for its particle routing), complete and polished, before committing to
all ten. Astra proposed this, and it fits Robin's "time is no issue", because it is about discovering whether the
format is fun, not saving effort.

**Effort:** XL (ten wings, about 100 trials).

---

## D10 · Shortcuts and walking

- Spec line 56 forbids "excessive walking" and "repeated corridors". Robin wants backtracking for resources to be
  meaningful. The compromise:
  - every large floor has at least one **shortcut opened from the far side**;
  - stations sit near junctions;
  - the auto-map marks stations with their remaining uses.
- **Fast travel between hearths** in the Hall, after each is reached.
