# 09 · Records: stamps, the travel volume, replay and pastimes

*Expansion plan, draft 3 (2026-10-07, after Robin's second round of answers). Planning only.*

Robin's settled decisions govern this file:

- **[H1]** The illustration book is **always fully viewable from the Main Menu**. Each save earns a border, sheen,
  holographic finish or badge on the illustrations it witnessed. Opening any illustration shows its unlock and
  viewing criteria. No passwords.
- **[H3]** Illustrations with the player in them are high fidelity and idly animated. On the Main Menu they show the
  Continue file's character, or the creation default with no save. In game they show the player's own appearance.
- **[R1]** Achievements are for meaningful moments, with detailed badges, stamps or seals. There are no trackers,
  except naturally earned milestones.
- **[R2 §6]** Within a campaign, finishing a chapter makes all its illustrations viewable, side quests included;
  finishing the main story makes all of the chosen companion's. Special illustrations (the Trials) can be revealed
  with a confirmation. Festival games remain playable.

## What exists today (audit summary)

- **Fourteen illustrated sequences** exist; seven are "kept memories".
  - Each save counts every viewing in `s.seq`, **even skipped ones**.
  - Kept memories store lines and the cast's looks, and replay read-only from Company › Shared memories.
  - A developer viewer already plays any sequence with a fixture look and story branch (`?dev=sequences`): most of
    a Main Menu gallery's machinery.
- **The prologue's viewed state is a device setting**, and it cannot be replayed.
- **There are no achievements, stamps or global unlocks.** Slot `meta` has no appearance.
- **The Wayfarer's Ledger (the pause menu, called the folio in the code) has five tabs** that already scroll on phones. The Words index has up to 13 entries; Journey has up to
  7 sub-pages.

---

## K1 · The Road Stamp Book (achievements)

**What and why.** Robin wants meaningful records with visual badges, stamps or seals, never chore counters.

**The idea.** Japan has a real, much-loved custom of **commemorative stamps** at stations and landmarks (駅スタンプ
and their cousins): travellers press an ink stamp into a book at each place. The plan makes achievements into a
**stamp book**:
- every achievement is a stamp with its own design;
- many are pressed *in the world*, at a real stamp stand at the place where the moment happened.

It is a cultural custom (labelled, secular), a tactile little ritual, and a record that looks like a journey.

**Which moments earn a stamp** (all naturally reached or deliberately chosen, never grind):

| Family | Examples |
|---|---|
| **Chapters and regions** | Each chapter completed; each region's people helped |
| **All side quests of a region** | Counted by the route taken: mutually exclusive outcomes count as done (Astra) |
| **Dungeon families** | Each optional dungeon; every Atlas survey; each superboss |
| **The Hall of a Hundred Tales** | Each wing; all ten |
| **Roads and sea** | All of a road's events; the maiden voyage; every port |
| **Pastimes** | Played each festival game once (not scores); first shogi win; first finished karuta game |
| **Natural milestones** (Robin's allowed kind) | "Used 15 different responses"; "Asked someone to explain"; "Found a second way through a puzzle" |
| **Language** | First mastery star in each input type; first "Things I can do" entry in each family |

**Rules.**
- **No streaks, no "flawless", no timed records** (excluded).
- **No stamp requires a particular input mode or going without help**, except mastery stars, which are records of
  their own (L3).
- **Hidden stamps show their criteria** in neutral, spoiler-safe words ("A side story in Chapter 7").

**Home:** Journey › Stamp book.

**Effort:** M.

---

## K2 · The travel volume

**What and why.** Robin [R1]: full-page, full-screen illustrations of memorable moments, at "the same fidelity as
the painterly mockup style… used in our Harmony mockup":
- chapters and key events;
- weighty side quests;
- companion events and bonding;
- each Trials wing;
- several per companion, varying with how they bonded.

[R2 §7]: animated, "a still-frame, idling animation like the Main Menu background". The player is in them: "You
were there."

**Contents (proposed; about 60–70 pages, sized against the budget in S6):**

| Section | Pages |
|---|---|
| **Chapters (10)** | 2–3 per chapter: the arrival, the turning point, the resolution |
| **Side stories** | About 12, chosen for weight, including outcome variants |
| **Companions** | Per companion: 4 bond moments + 1 per ending variant (variants come from the ending's choices, never from a "bad bond": Astra) |
| **The Hall** | 10 wings + the Hundredth Tale |
| **Superbosses** | 1 each |
| **Sea log** | Voyage entries (text with small vignettes, not full pages) |
| **Cartographer's Atlas** | Survey maps (D7) |

**Living illustrations.** Robin's fireworks example sets the target. The animation is subtle and looping, never a
cutscene:
- fireworks bloom;
- light moves across faces;
- clothing settles;
- someone gestures.

**Reduced motion** shows the held frame.

**Production (flagged now, made in the art pass).**
- Each illustration with the player needs **player layers in the scene's pose**: body, garment cut, hair, face,
  accessories, recoloured like the Harmony kit.
- Today's Harmony kit is 183 files for *one* pose family, so each full scene is a substantial layered-art job, as
  Robin noted in H3.
- **Scene-specific clothing is allowed** (festival yukata): the scene chooses the garment; the player's skin, hair
  and accessories carry over (Astra).
- **Other people in an illustration stay fixed.** A Suzu scene shows Suzu even when the Continue save travels with
  Ren (Astra).
- **Interim:** until the art pass, each page shows a code-drawn composition at today's standard, so the system can be
  built and tested.

**Effort:** L (system); the art is XL, in the art pass.

---

## K3 · The witnessed mark: the player's own seal

**What and why.** H1: each save marks the illustrations it actually witnessed: a border, sheen, holographic finish
or badge.

**Proposal: a personal seal.**
- The player has a **name seal** (判子 / 印鑑, real), stamped in red in the corner of every illustration they
  witnessed. In this world, a seal *is* a name: the existing story already says that lending a seal is lending your
  name.
- **The seal is designed at creation**, or later, for older saves, from a few frames and the player's name in kana.
- **The seal is also used in the game:** to sign a contract (C8), stamp a travel paper (the Cloudroad), and claim
  the boat (W7).
- **An optional sheen** (Robin's holographic idea) is a setting. Reduced motion turns it into a static glint.
- **Witnessing rules** (Astra):
  - *witnessed* means the moment happened in this campaign;
  - **skipping the scene still counts** (the moment happened);
  - **using help still counts**;
  - no "watch for N seconds" requirement.

**Effort:** S–M.

---

## K4 · Viewing: in the Wayfarer's Ledger and on the Main Menu

| Where | What is viewable | Marks shown | Player appearance |
|---|---|---|---|
| **Wayfarer's Ledger, Journey › Travel volume** (not in battle) | In-campaign availability (R2 §6): completed chapters' pages, side stories included; the chosen companion's full set after the story; revealed Trials pages | This save's seals | This campaign's player |
| **Main Menu › Travel volume** | **Everything** (H1), behind a spoiler veil (K5) | Seals from **all existing saves**, read only ("witnessed in Journeys 2 and 5") | **The Continue save's** appearance (slot `meta.look`; the creation default if there is no save), fixed while the volume is open |

- **"Opening any illustration shows its unlock and viewing criteria"** (H1): every page's caption says how it is
  witnessed ("Chapter 4: the main story") and, for veiled pages, how to reveal it.
- **Device data:** only *which pages the player has unveiled* on the Main Menu (a viewing preference, beside
  `prologueSeen`). It never creates a witnessed mark (S3).

---

## K5 · Spoilers: veiled until you choose

**The contradiction.** "Always fully viewable" [H1] meets Robin's own wish to avoid spoilers (Robin is mid-Chapter 2
now), the existing "no future reveals" rule (HX52), and Astra's note that available need not mean "an unprotected
thumbnail".

**Proposal.**
- On the Main Menu, pages not yet witnessed in any existing save are **veiled**: blurred, with only the neutral
  criteria visible.
- **One press reveals a page**, or a whole chapter's pages, after a one-line confirmation: "This shows a moment
  from Chapter 7."
- Revealing stays revealed (device preference) and can be re-veiled.
- **A setting, "Show all illustrations unveiled", lets players who don't care about spoilers skip the veil.**

This is a design choice for Robin to confirm ([11_CONTRADICTIONS.md](11_CONTRADICTIONS.md) C-20).

---

## K6 · Replaying moments

**What and why.** Robin [R2 §6]: chapter replay "may not necessarily be a bad idea… players would need forethought
to save before a moment they didn't know about."

**Approach, in three tiers.**
1. **Watch it again** (exists for kept memories): extend to **every illustrated sequence and every travel-volume
   page that has a scene behind it**.
   - Read-only, from the Wayfarer's Ledger and the Main Menu.
   - The Main Menu uses fixtures: the illustration's companion and a neutral branch, as the developer viewer
     already does.
   - **Never changes any state** (HX49).
2. **Scene replay** for selected non-illustrated scenes, needing a side-effect-free mode for the script runner. It
   doesn't exist yet; M effort.
3. **Chapter Journey** (proposal, for saves of the twelve-chapter edition; old saves don't continue, C-02):
   - **What it is.** Start a *new campaign in a free slot* at the start of any chapter this save has completed,
     carrying the save's learning, appearance, keepsakes and records (like New Game+).
   - **Earlier choices** take documented defaults, labelled "a retelling", so no false history is claimed.
   - **Why it's useful.** It lets a player revisit a chapter or see another outcome without having saved in
     advance.

   A plan proposal, not a contradiction: build it if Robin wants it.

**Effort:** M (1), M (2), L (3).

---

## K7 · Distractions

**What and why.** Robin [R2 §6]: festival games and pastimes stay available, "in a building somewhere… or via
your companion… or from the Ledger in a 'distractions' tab."

**Current rule.** The practice index "never launches a physical activity remotely": "Begin here" appears only on
site.

**Approach (keeps that rule).**
- **A Distractions list** (Company › Pastimes) shows every pastime the player has met, with records and **where to
  play it**.
- **Companion games start anywhere safe**, as shiritori does today: karuta, a festival booth game "in tandem", or
  shogi on the companion's travel board.
- **Place games start at their place:** the festival hall, the boat's corner, the Exchange hall, Fuku's bench.
- **Personal bests and streaks** are shown here and in each game, never ranked (G11).

**Effort:** S–M.

---

## K8 · The companion's illustration set

- **During the story:** each companion has their bond moments (4) and ending variants.
- **On finishing the main story:** *all* of the chosen companion's pages become viewable in that campaign (R2 §6),
  witnessed ones sealed.
- **Other companions' sets:** on the Main Menu (all viewable, H1). Their seals come from saves that travelled with
  them, through New Game+ or other slots.
- **Ending variants come from the ending's own choices** (what the party decided at the end), never from a
  "you cared less" ladder (Astra; the existing ending has no good or bad branches).

---

## K9 · New Game+ and records

**Robin's definition (C-54, 2026-10-07).** New Game+ keeps personal learning records, mastery stars, illustrations
and other personal metadata; never character or story progression; no satchel equipment or items. It is offered at
the end of the game by default, and it opens with a farewell from the companion ([10_STORY.md](10_STORY.md) §9a).

| Carries over | Never carries over |
|---|---|
| The learning record and evidence log; "Things I can do"; mastery stars | Story flags, quests, chapter progress, map knowledge |
| Illustrations and their witnessed seals; the travel volume | The companion and Bond; the pet |
| The stamp book | Satchel equipment and items, keepsakes included (C-66) |
| Pastime records: shiritori, shogi, hanafuda, karuta, festival personal bests | Inkweaving words learned in the story; field-puzzle and Atlas progress |
| Settings; the noted-words notebook; the keepsake catalogue's "found" record | Known details and lore notes, which belong to the story's discoveries |
| The traveller's name, pronouns and appearance, changeable at the start (C-66) | |

- **One journey's book across runs.** A player who travels with every companion fills one book: Robin's "complete
  the story with all of them".
- **Changes from today's New Game+:** keepsakes (cosmetics) and the Atlas's cosmetic rewards stop carrying (C-66),
  and the stamp book, seals, stars and pastime records start carrying.
- **The spec** requires the carryover to be defined (line 252); this table is the definition.

---

## K10 · Fitting it all into the Wayfarer's Ledger

New pages (Travel volume, Stamp book, Mastery, What I can do, Ways of speaking, Pastimes, the sea chart) would
overflow the Wayfarer's Ledger if each became a tab.

**Proposal: no new tab; group the sub-pages.**

| Tab | Sections |
|---|---|
| **Journey** | Quests & notes · Dialogue history · **Travel volume** · **Stamp book** · Cases · *Mementos* (Keepsakes, Practice mementos, Fishing notes merged into one page with sections) · The Pages We Keep |
| **Words** | *My learning:* Progress · **Mastery** · **What I can do** · Noted words · Kept sentences · *Reference:* Kana · Kanji · Grammar · Lore · **Ways of speaking** · Creatures met · *Practice:* Ways to practise · Letters · One word, two moments |
| **Satchel** | Unchanged |
| **Map** | Route chart · **Sea chart** · Known details |
| **Company** | Companion · Pet · Shared memories · **Pastimes** |

Words becomes a three-section index rather than a flat list. The layout audit (448/448 English, 168/168 Japanese
labels) re-runs on it.

**Effort:** M.
