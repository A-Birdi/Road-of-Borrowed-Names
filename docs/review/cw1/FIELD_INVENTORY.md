# CW-1 field inventory: where every setup choice lives, before and after

Candidate only (not approved, not pushed). Baseline: the four-step creation book and its departure review at
`934ea53` (build SHA-256 `c50280bb…ed94`). Candidate: the five-step setup book on the local branch `cw1-candidate`.
Checked by the browser suite `tests/e2e/cw1_setup_book.mjs` (F04), which walks the book page by page and collects every
control's backing key, then compares the Summary's editor with the ordinary Settings book tab by tab.

## The traveller and the journey's learning choices

| Choice | Backing key | Baseline place | Candidate place | Summary row (Edit goes to) |
|---|---|---|---|---|
| Name | `player.name` (`#nm`) | 1 Identity | 1 Identity | name under the portrait; Identity's Edit (four leaves back) |
| Name in Japanese text | `player.nameJp` (`#nj`), edit provenance kept | 1 Identity | 1 Identity | under the name |
| Pronouns | `player.pron` (`data-set=pron`): a set's id | 1 Identity | 1 Identity | Identity |
| Custom pronouns: they / them / their, uses “are” | `player.pron` becomes the custom set (`data-cp`) | 1 Identity (shown for Custom) | 1 Identity (shown for Custom) | Identity |
| Skin tone, hairstyle, hair colour, clothing colour, clothing cut | `player.look.skin`, `.hair`, `.hairColor`, `.outfit`, `.shape` | 2 Appearance | 2 Appearance | Appearance |
| Accessories (at most two; a third removes the oldest) | `player.look.acc` (`data-acc`) | 2 Appearance | 2 Appearance | Appearance |
| Background | `player.bg` (`data-set=bg`) | 3 Background | 3 Background | Background |
| Your Japanese (profile F / E / I / A) | `learn.profile` (`data-k=profile`) | 4 Learning | 4 Learning, left page | Japanese → Learning, the group focused |
| Short placement | (sets `learn.profile`, `learn.kana`) | 4 Learning | 4 Learning, left page | — |
| Kana so far (Foundations only) | `learn.kana` | 4 Learning | 4 Learning, left page (F only) | Japanese row says it for F |
| Answering | `learn.input` / shared `settings.input` | 4 Learning | 4 Learning, right page | Answering |
| Learning mistakes | `learn.assist` | 4 Learning, inside “More choices” | 4 Learning, right page (always shown) | Learning mistakes |
| Tactical challenge | `learn.difficulty` | 4 Learning, inside “More choices” | 4 Learning, right page (always shown) | Tactical challenge |
| Dialogue leads with / the second language / menus | shared `settings.lead`, `settings.secondary`, `settings.uiLang` | 4 Learning, inside “More choices” | 4 Learning, right page, “Reading preferences” fold | Reading (opens the fold) |

Keys and IDs are unchanged; only where the controls sit and how they are labelled changed (Elementary is named
“Elementary” on Learning and on the Summary alike, F05).

## The departure review's settings

| | Baseline | Candidate |
|---|---|---|
| Where | after Begin, the whole Settings book in “review” mode (“Before you set out”) over the journey just built | before Begin: the Summary's “Sound and voices” and “More journey settings” open the same Settings book as a draft editor of the setup |
| What it offers | every ordinary Settings key | every ordinary Settings key: the suite counts 63 keys across the six tabs and finds each in the draft editor (F04) |
| When it applies | at once (the journey already existed) | at Begin, once, with the rest of the setup (`applyDraft`); previews (volume, voice, text size, contrast, motion, ledger style, keys) are shown while editing and rolled back if the book is closed without beginning (F13, F14) |
| On the normal path | always shown after creation | not shown: the Summary is the review (F01, F15). New Game+ keeps its own review (settings_review §4b) |

## Not moved

The partial callers keep their contracts: `creation()` (three steps, Continue) resolves the traveller alone, and
`setup()` (Learning alone) resolves the learning choices alone; neither begins a journey (F18). Ordinary and in-battle
Settings are unchanged apart from the draft mode the Summary uses (F20, `settings.mjs`, `battle_settings.mjs`).
