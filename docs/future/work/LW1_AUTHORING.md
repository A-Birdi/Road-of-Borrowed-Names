# Authoring the Living World, region by region (C-87)

The brief each region's Living World content is written to. The register and status are in
[`LW1_ROLLOUT.md`](LW1_ROLLOUT.md); the plan is [`../plan/06_WORLD.md`](../plan/06_WORLD.md) W1–W6. The helpers are
`src/content/zzz_living/05_author.js` (read its header first); `10_rw.js` is the worked example.

## What each region gets

1. **Routines (W2).** Two to four ordinary residents (never a companion, never someone the main story stages in
   that town, never someone with a placement-heavy quest unless `pin` covers it), each with **two or three slots**:
   their usual placement plus one or two new places on the town's own maps, each with something to do there (a
   `perform` from the library where it fits: `src/engine/67a_perform.js` — sweep, sort, carry, tie, tend, read, grind,
   plane, hammer, stir, serve, polish, knead, mend, tally, hawk, prune — with what it works at in front of them; or
   simply standing somewhere that says what they are doing) and **a first line for that place** (said once; then what
   they always say). Routines start at the town's `after` flag, the region's own story done. Pick coordinates with the
   tools below: a free, reachable tile, not on a way out, not in a doorway, not on another placement's tile.
   Optionally one `away` clue: a note at someone's usual place while they are elsewhere.
2. **"Have you seen…?" (W3).** Two or three **askers** per town (an innkeeper, a stallholder, a gossip, a clerk:
   people who would know), each with a small, believable **knows** table (`routine` for family, colleagues and close
   neighbours; `loose` for acquaintances; not everyone knows everyone; include a traveller or two who know people in
   the next town only if the story has them travel). One **cold** asker in some towns (busy, suspicious, proud: in
   character). `usual` lines for the people others will ask about who have no routine (where they always are).
3. **Change beats (W1).** **Two to four per town across the whole journey.** First register what the region already
   does (the register in `LW1_ROLLOUT.md` §1): a story change that is visible on a return (a road reopened, people
   moved, a building's new use) becomes a beat with its real condition as `when` and its own `id`, adding nothing
   else. Then author the missing ones so every town has at least two **visible** changes on a return during the
   journey, each triggered by progress *elsewhere* (another region's flag): map edits (props with `if`), a moved or
   new person, new talk at the head of someone's list (`L.talk`) conditioned so it is said once
   (`'<when>&!seen.<scene>'`), and where it fits a small activity. Nothing is missable: a beat's content stays; later
   beats add, never replace; old topics stay reachable.
4. **Road events (W5).** For each road map of the region (the maps between towns: `*.road`, `millroad`, the Cloudroad
   legs, `yn.descent`, the Keepers' Road steps…): one **unique** first-arrival event (a stated problem, solved there,
   by a language challenge with all four tiers — see `src/content/kr/30_learning.js` for the format), and **three
   variants** (each its own small challenge) that turn up about one visit in five once the unique is solved. Where the
   region already has a bespoke first-time event on that road (the Keepers' Road, the Cloudroad, the sea), do not
   duplicate it: register only variants, each with `when: '<the bespoke event's done flag>'`, and say so in the
   report. Each event's scene ends with `!hook road_done <road> <eventId>` once solved; leaving before it is solved
   defers it (the engine offers it again next visit). Rewards: a scene, a lore note (`!note`, with a `C.notes` entry
   that says `fiction: true|false`), sometimes a keepsake — **never consumables, money or items that are used up**.
   Give each road a stamp: `stamp: { title: [jp, en], motif: 'path', ink: '#…' }`.
5. **Return keys (W6).** About **three sealed spots per region**, visible from the first visit with an in-world hint
   (`hint`), opened by something learned **later in the journey** (`needs`: a concept id from `RB.phase.concepts()`
   — `c_wait`, `mod_sorezore`, `mod_ikutsuka`, `mod_subete`, `mod_arayuru`, `mod_goto`, `mod_zentai` — or a
   condition on later progress that stands for an ability the player now has: the sea licence for a cove only a boat
   reaches, Cloudroad travel papers, a later chapter's word). The `scene` that runs on opening says *why* the new
   ability works here and gives the reward: a hidden corner, a lore note, an old side story's ending, a shortcut, a
   keepsake. Never consumables.

## Rules (all are checked or will be)

- **Japanese:** every kanji has furigana `{漢字|かな}`; words spaced as the rest of the game; natural, short,
  learner-friendly; every line bilingual `jp || en`. Every token needs a lexicon entry: put new words in your region
  file with `RB.lex.add(RB.lex.parseTable(\`w|r|pos|lv|meaning\`))` (format: `docs/CONTENT.md`).
- **Voices and facts:** read each person's existing scenes before writing them (grep their id in `src/content`).
  Keep their speech register. Do not invent relationships the story contradicts. Pronouns: Nao and Ren are
  they/them; Mio, Suzu, Tsuru, Kikue, Koume, Fuku are she/her; Shinza, Isamu, Sanpei he; Sakichi no pronoun. For
  anyone else whose pronoun the content does not make clear, use their name or they/them in English.
- **Phases:** scene ids start with the region prefix of the latest chapter they may refer to (`rw.lw_…`,
  `mb.lw_…`): the validator then checks they name nothing from a later chapter. A Reedwake beat triggered by the
  festival in Blockprint Row may mention it: give its scene the `mp.` prefix. Content that shows before a chapter
  must not reveal it.
- **Conditions** have no brackets (`|` binds looser than `&`); use `L.and`.
- **No new engine code** in region files; if a helper is missing, say so in the report.
- **Never** edit files outside your own region files; never run browser tests, build `index.html`, commit or push.

## Tools

- `node <scratch>/around.mjs <map> <x> <y>` — the 9×9 tiles around a point (`#` blocked, `P` prop, `N` placement).
- `node <scratch>/free.mjs <map> <x> <y>` — nearest free, reachable tiles with their neighbours.
- `node <scratch>/residents.mjs <prefix…>` — every placement on a region's maps with conditions.
- `node <scratch>/livecheck.mjs` — checks every routine slot, away note, relation and asker.
- `node tools/validate.mjs` — the content validator (furigana, lexicon, phases, scene references); it reports for
  the whole game: look at the lines naming your files and scenes.
