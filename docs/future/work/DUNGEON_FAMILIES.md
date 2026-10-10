# The ten dungeon families: authoring templates

*Plan [04_DUNGEONS.md](../plan/04_DUNGEONS.md) D6 (Astra's group D, "all solid"); playbook D6: "ten family templates
and populated examples … at least one complete example of each; all profiles and input alternatives; no ten-engine
duplication". Written in P07 with the first worked example; the others are built with the content that the plan
places them in (P08–P15).*

A family is a design pattern, not an engine. Every one is built from what already exists: an expedition
(`RB.expedition`, src/engine/98_expedition.js) or an Atlas run, challenges (`C.challenges`), drills, encounters (P04:
procedures, disagreements, protected objects), field puzzles, scenes and Known details. Each template below lists
what to author, the language it carries at the four profiles, and the test pattern that proves it.

Common to all of them:
- every language step has F, E, I and A versions (the validator makes a missing tier an error for new content);
- across a dungeon, the construction meets choosing, ordering and writing (typed or handwritten), so every input
  route is exercised; no step is audio-only;
- every kanji shown has its reading, in English lines too ({漢字|かな} groups; F-28);
- an optional dungeon declares its rules on its preview card (D4) and is unit-tested for reachability (the loop,
  the optional parts, the gates) like the Flood Cellars.

| # | Family | Template: what to author | Language at the four profiles | Test pattern | Worked example |
|---|---|---|---|---|---|
| A31 | Apprenticeship | One construction is new; everything else known. (1) A local task teaches it, with its grammar card. (2) Two or three rooms use it in different jobs (a lamp, a grate, a machine). (3) The last room combines it with constructions known before. | F reads it in English-supported choices and writes its ending; E chooses the right action from Japanese; I contrasts it with its nearest neighbour; A reads implication | Each step at four profiles; choosing, ordering, typing and handwriting each meet the construction (browser); the construction is the evidence item | **The Flood Cellars** (P07): 〜て ある; taught on the notice, used by the lamp and the sluice, combined with 〜て いる and 〜て ください at the outflow door. `tests/unit/expedition_cellars.test.mjs`, `tests/e2e/expedition.mjs` |
| A32 | Transfer-remix | A relationship already learned in one setting appears in another (workshop sequencing becomes a procession's order). Author the original reference (a scene or a Known detail) and the new setting's task that needs it | The same relationship at each profile, the new setting's words supported at F | The task is solvable from the earlier reference alone; the reference is reachable before | Kotonoha (P11): words in new places; the Hall's wing 3 (P15) |
| A33 | Curriculum forks | A junction offers two routes of different language (directions vs a construction; listening vs reading); both reach the same place and the same reward | Each route complete at four profiles | Both routes reachable; the same reward either way; the choice never locks content | Every Atlas commission's forks (P07, the routes exist; the language choice is P15's Hall); the Hall's wings |
| A34 | Counterexample hall | Similar instructions that differ in one feature; test them and see why one fails | F: two at a time with English support; A: three, with the feature unsaid | Every wrong instruction has a reason shown; the right one is unique | The Hall's wing 6 (exceptions, P15); the Mist Barrier (P12) |
| A35 | Multi-format treasure | A notice, a conversation, a diagram and a label each hold part of an answer | Each part readable at four profiles; the combination asked at the end | Each part reachable; the answer needs every part; a part missed is shown where it was | Manybridge's Lost Contract (P08) |
| A36 | Case file | One investigation across the whole dungeon; evidence changes the theory | Claims and evidence at four profiles (the Cases' own pattern) | Every conclusion reachable; the naive theory fails with a reason | The Cloudroad's last courier (P12); a postgame Atlas case commission (P15) |
| A37 | Restored return | Come back to a place once it is fixed and use it differently | The new use's language at four profiles | The return is only after the fix; the old route still works | Kotonoha's deeper wing (P11); Manybridge's Undercroft as a working dock postgame (P15) |
| A38 | Playable short story | Step into an illustrated tale and carry it out; questions after are optional | The tale's text at four profiles (graded, never abridged meaning) | Reading never gates progress; the optional questions are optional | The Hall of a Hundred Tales (each wing opens with one, P15); Steamhollow's footbath poet (P13) |
| A39 | Explain it to a partner | The companion proposes two plausible plans; you say which condition supports yours | The two plans and the condition at four profiles; each companion's own voice | Both plans plausible; the right one tied to a stated condition; each companion has lines | A recurring companion beat in dungeons from P08 on |
| A12 | Information gap | You and your companion see different halves of a mechanism and exchange descriptions | Descriptions at four profiles; the exchange as choosing or building sentences | Each half alone is not enough; together they are | Root Hollows (P13); the Understage (P10); the Hall's wing 2 (P15) |

## Checks that apply to every family

- `node tools/validate.mjs` (furigana, step shapes, tiers, lexicon) and `node tools/review_ledger.mjs` (every new
  Japanese line self-reviewed, never claimed as native-reviewed).
- A unit test that walks the dungeon's maps (reachability with and without its gates) and checks each step's four
  tiers and input routes, after `tests/unit/expedition_cellars.test.mjs`.
- A browser test that plays its loop, after `tests/e2e/expedition.mjs`.
- If it carries condition, a row in a whole-expedition curve, after `tests/unit/expedition_curve.test.mjs`.
