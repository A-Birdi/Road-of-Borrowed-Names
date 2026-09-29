# Content authoring reference

All content is plain JS in `src/content/**` (loaded in path order after the
engine). Files only *define* data. Check with `node tools/validate.mjs`
(`--unknown` lists Japanese tokens lacking dictionary entries; `--filter sg`
narrows to ids starting with a prefix). Build with `node tools/build.mjs`.

```js
var RB = (globalThis.RB = globalThis.RB || {});
(function (C, K) { 'use strict';
  // C = RB.content, K = RB.mapkit
})(RB.content, RB.mapkit);
```

## 1. Japanese markup (every Japanese string in the game)
- Tokens separated by single ASCII spaces: `{薬|くすり} の {瓶|びん} を {並|なら}べる 。`
- `{漢字|よみ}` ruby; every kanji must be inside one (validator error otherwise).
  Word-level ruby is fine: `{今日|きょう}`. Mix with kana: `{食|た}べた`, `お{茶|ちゃ}`.
- Split particles, copula and punctuation into their own tokens where natural:
  `わたし は ミオ です 。`. Conjugated forms stay one token: `{忘|わす}れちゃった`.
- Optional `@lemma` forces a dictionary form: `{行|い}った@行く`.
- Optional `=(gloss)` gives the meaning in this context: `{上|あ}がって=(come in)`.
- Placeholders: `$name` (player's Japanese name), `$comp` (companion).
- Lexicon: every content token should have an entry (validator `--unknown`).
  Add words in your chapter's `lex` file:
  ```js
  RB.lex.add(RB.lex.parseTable(`
  水車小屋|すいしゃごや|n|I|water mill (building)
  呼び返す|よびかえす|v5s|A|to call back|Literary.
  `), 'ch1');
  ```
  Fields: `w|r|pos|lv|meaning|note|alt ; alt`. Leave `r` empty for kana words.
  pos: n pn v1 v5u v5k v5g v5s v5t v5n v5b v5m v5r v5k-s vs vs-i vk adj-i adj-ii adj-na adv prt conj int exp ctr suf pref aux name.
  lv: F E I A. Fictional terms: add `fic` in a JS entry and say "(fictional)" in the meaning.
  Proper names use pos `name` (e.g. `ハナ||name|F|Hana (a name)`).

## 2. Scenes (dialogue DSL)
```js
RB.script.add(`
@scene rw.hana.first
hana[worry]: お{茶|ちゃ} を ふたつ いれた の 。 || I poured two cups of tea.
pc: {誰|だれ} の ため です か 。 || Who for?
?(party=nao) nao[smirk]: … || …        # line only if condition holds
!set met_hana
!choice
* {手伝|てつだ}います || I'll help. -> help
* [quest.rw_labels>=1] また {来|き}ます || I'll come back. -> end
:help
hana[smile]: ありがとう 。 || Thank you.
!quest rw_labels 1
!end
`, 'ch1/scenes-hana');
```
- Line: `speaker[expr]: JP || English`. Speakers: character ids, `pc` (player),
  `comp` (current/provisional companion), `narr`. Expressions: neutral smile
  laugh worry sad angry surprise think tired shy smirk closed.
- English placeholders: `$name $comp $they $them $their $theirs $self $They
  $Their $are $were $have $s $es $theyre` (e.g. `$They walk$s home.`).
- Conditions: `flag`, `!flag`, `a&b`, `a|b`, `comp=nao`, `comp` (any committed),
  `party=mio` (committed or provisional), `quest.id>=2`, `quest.id=done`,
  `item.id`, `item.id>=2`, `var.x>=3`, `prof=F`, `prof>=I`, `ch>=2`, `word.id`,
  `seen.scene.id`, `post` (post-game).

Commands (`!op args`):
| op | meaning |
|---|---|
| set/unset a b | flags |
| var x = 3 / var x + 1 | numeric vars |
| give id [n] / take id [n] | items |
| word id… | teach inscription words (combat repertoire) |
| note id… | add notebook lore |
| quest id stage\|start\|done | set quest progress (stage index into `stages`) |
| if COND -> label / goto label / :label / end | flow (`end` is a valid target) |
| choice + `* [cond] JP \|\| EN -> label` lines | choices |
| call scene.id | run another scene inline |
| challenge id / activity id / battle enemyId [noflee] | learning moments; `var._res` = 1/0 |
| lesson kana | teach the next kana group (Foundations only; no-op otherwise) |
| teach grammar_id | show a grammar card once (ids from RB.grammar) |
| warp map x y [dir] | move player |
| music id / music - / sfx id | audio |
| emote who !\|?\|...\|note\|heart\|sweat\|anger | who = npc (current), pc, comp, or NPC id |
| move who dir n [ms] / face who dir / faceplayer [who] / wait ms | staging |
| fade out\|in / shake | effects |
| autosave / checkpoint [map x y dir] | safe points (autosave after meaningful progress) |
| chapter n / card JP \|\| EN / journal JP \|\| EN / toast JP \|\| EN | presentation |
| travel placeId | unlock fast travel |
| recruit id\|none / depart | companion room only (Ch1) |
| inn / heal | rest |
| postgame / credits / hook name | special |

## 3. Maps
```js
C.maps['sg.harbor'] = {
  name: { en: 'Saltglass', jp: '{潮|しお}{硝子|がらす}' }, region: 'saltglass', place: 'saltglass', travel: 'saltglass',
  music: 'saltglass',                // or [{if:'flag', id:'x'}, {id:'y'}]
  ambient: { weather: 'rain'|'snow'|'embers'|'motes'|'fireflies'|'leaves'|'pages', dark: 0..0.8, tint: 'rgba()', playerLight: 44 },
  terrain: K.build(40, 30, '.', (k) => { k.rect(...); k.path([[x,y],...], ':', 2); ... }),   // or an array of strings
  legend: { Z: { tile: 'sand', prop: 'rock' } },  // optional extra chars
  structs: [{ type: 'house', x, y, w, h, roof: 'tile'|'thatch'|'slate'|'snow'|'indigo'|'ash'|'glass', wall: 'wood'|'stone'|undefined, door: dx, windows: [dx], chimney, lit, sign, to: 'map', spawn: [x, y] }],
  props: [{ p: 'barrel', x, y, scene?: 'id', text?: {jp, en}, if?: 'cond', o?: {…} }],
  npcs: [{ id: 'hana', x, y, dir, wander: 2, if: 'cond', talk: 'scene' | [{ if: 'cond', scene: 'id' }, …] }],
  foes: [{ id: 'w1', enemy: 'sg.crab', x, y, patrol: 2, aggro: true, if: 'cond' }],
  exits: [{ x, y, w: 1, h: 2, to: 'map', tx, ty, dir, if: 'cond', locked: 'scene' }],
  triggers: [{ x, y, w, h, scene, if, once: true, id }],
  onEnter: [{ scene, if, once }],
  spawn: { default: [x, y, 'down'] },
  noTravel: true,   // dungeons/interiors: no fast travel out
  noCompanion: 'cond', // rare: hide companion
};
```
Terrain chars: `.` grass `,` flowers `;` tall grass `:` dirt path `=` cobbles
`s` sand `*` snow `~` deep water `w` shallow `b`/`B` bridge h/v `_` wood floor
`+` stone floor `#` wall `^` cliff `k` carpet `m` tatami `F` field `i` ice
`g` glass `a` ash `p` paper floor `x`/space void `d` dark water; with props:
`T` tree `P` pine(snow) `Q` pine(grass) `o` bush `f` fence `"` reeds `r` rock
`R` snow rock `l` shelf(wood) `L` shelf(stone) `O` orchard tree `t` lamppost
`c` crystal `h` beach rock `n` dead tree.
Map kit: `fill` via build, `rect frame border hline vline path scatter ragged swap stamp`, `K.room(w,h,floor,doorX)`.
Props: tree orchard pine deadtree bush reeds rock fence shelf lamppost crystal barrel crate sign signblank noticeboard(w2) well(w2) table(w2) smalltable teaset chair bed(h2) counter(w3) stove pot bottles chest millwheel(2×2) boat(w2) cart(w2) lantern deadlantern shrine(w2) bell(2×2) telescope kiln(3×2) bookpile desk(w2) pillar stairs mat bench(w2) flowerpot laundry(w3) anvil hay stump campfire tent(w2) statue glassware loom(w2) mailbox stone_marker pier net(w2) snowman sparkle ink door exitmat hole water.
Interiors: door exits need a target `spawn` in the interior and the interior's
exit returns to the tile *below* the door. Never land a player on an exit tile.
Readable inscriptions: any decorative writing must have an interactable
transcription (a prop with `text` or `scene`).

## 4. Characters, quests, items, notes
```js
C.chars.wataru = { name: { en: 'Wataru', jp: 'ワタル' }, look: { skin, hair, hairColor, cloth:[main,shade,accent] | outfit, shape: 'tunic'|'robe'|'dress'|'coat'|'apron', acc: [...], size: 'child', age: 'old' }, portrait: { eyes: 'round'|'soft'|'narrow'|'sharp', style, acc, beard, mole, collar: 'high'|'apron', bg } };
C.quests.sg_labels = { main: true, title: { jp, en }, chapter: 2, stages: [{ jp, en }, …], reward: { items: {id: n}, words: [], flags: [] } };
C.items.salt_token = { name: { jp, en }, desc: 'English', key: true /* important */, slot: 'charm'|'tool'|'cosmetic', acc: 'flower' /* cosmetic sprite accessory */, effect: {…} };
C.notes.hush_intro = { title: { jp, en }, jp: 'markup', en: 'English', fiction: true /* labels fictional lore */ };
C.banter.push({ comp: 'nao', map: 'sg.*', if: 'cond', scene: 'id' });
```
Quest stage text is the journal's "practical next step" — say where to go /
whom to ask, without spelling out puzzle solutions.

## 5. Learning steps (challenges, drills, battle answers)
Step kinds:
```js
{ kind: 'write', item: 'v:水'|'k:あ'|'g:prt_wa', ctx: { jp, en }, prompt: { en, jp? },
  template: { before: 'markup', after: 'markup' },   // shown around the blank
  answer: 'みず', accept: ['みず', '水'], mode: 'kana'|'reading'|'exact'|'meaning',
  choices: ['みず', 'みす', 'むず'],                   // optional; else generated from genuine confusions
  explain: { jp?, en } }
{ kind: 'choose', item, ctx, prompt, options: [{ jp?, en?, ok: true|false, why: { en } }], explain }
{ kind: 'order', item, prompt, tiles: ['わたし','は','ナオ','です'], answer: [...same order...], alts: [[...]], orderHint: { en } }
```
- `accept` must list EVERY correct form (kana and kanji where a reading is
  asked). `mode:'kana'` = exact kana contrasts matter; `'reading'` = kanji
  surface or hiragana reading accepted.
- For Foundations, `write` steps are auto-adapted: only taught kana are
  blanked; everything else is shown. Keep F answers short (1–4 kana).
- Don't display the answer in furigana and then count it as recall.
- Item ids: `k:<kana>`, `v:<dictionary surface>`, `g:<grammar id>`, `c:<id>`.

Challenge (story moment), tiered by learning profile:
```js
C.challenges['rw.lantern_s'] = { title: { jp, en }, intro?: { jp, en },
  tiers: { F: [step…], E: [step…], I: [step…], A: [step…] } };
```
All four tiers for required story challenges. Advanced tiers use genuine
nuance, register, implication, paraphrase and longer passages.

Drills (region-flavoured practice used by battles and practice):
```js
C.addDrills([{ id: 'sg.d1', lv: 'E', tags: ['saltglass'], kind: 'write', item: 'g:prt_ni', … }]);
```

## 6. Enemies (Inkweaving)
```js
C.enemies['sg.crab'] = {
  name: { en: 'Label Crab', jp: 'ラベル{蟹|がに}' }, art: 'crab', artOpts: { col: '#c86a4a' }, look: { custom: 'blot', col: '#…' },
  region: 'saltglass', bg: 'saltglass', knots: 2, boss: false, music: 'battle',
  pool: { tags: ['saltglass'], F: ['v:…'], E: ['v:…', 'g:…'], I: [...], A: [...] }, // unravel curriculum
  pattern: ['strike', 'rest', 'shroud'],
  intents: { 'plea:1': { text: { F: {jp,en}, E:…, I:…, A:… }, answer: { F: step, E: step, … } },
             'lie:1': { text: {…}, truth: {…choose step…}, power: 1 } },
  phases: [{ at: 1, pattern: ['charge', 'strike'], line: { jp, en }, teach: { en } }],
  intro: { jp, en }, settle: { jp, en }, reward: { items: {}, words: [] },
};
```
Intent kinds: strike sweep heat shroud charge gust mend lie plea rest flood
chill silence mirror (see RB.combatLogic.INTENTS for counters). Word tags:
ward water light heal wind bind anchor stone fire warm bell voice.
Only use intents whose counters the player can know by then, or that can be
survived without (every battle must be winnable with Unravel alone).
Available words: Ch1 mamoru mizu hikari iyasu · Ch2 kaze nawa · Ch3 ishi koori
tsuchi · Ch4 honoo · Ch5 suzu koe.

## 7. Activities
Types `orders`, `letters`, `signpost`, `history` — see src/ui/75_activities.js;
lines may be tiered `{ F:{jp,en}, E:…, I:…, A:… }`.

## 8. Rules
- Natural Japanese for the speaker; plain English that is faithful, not literal.
- No invented grammar, fake etymologies, or kana "meanings".
- Label fictional terms. No placeholder text, no "coming soon".
- Required progress never depends on handwriting, hearing, colour or speed.
- Every chapter: a hub town with routines, a dungeon, ~3 side quests, banter.

## 9. Linking chapters
Each chapter N has a road/crossroads map `<p>.road` (prefixes: rw sg co sb lf sa)
that defines `spawn.from_prev` (arriving from chapter N−1) and
`spawn.from_next` (arriving back from chapter N+1). Exits use named spawns so
no one needs the other chapter's coordinates:
- back link on `<p>.road`: `{ x, y, w, h, to: '<prev>.road', sp: 'from_next', dir }`
- forward link on `<p>.road`: `{ …, to: '<next>.road', sp: 'from_prev', dir, if: 'chN_done' }`
  plus a trigger/lock scene explaining why the road isn't open yet.
Set flag `chN_done` when the chapter's story is finished and `!chapter N+1`
when the next begins. Define your hub's fast-travel place in your own files:
`C.places.<id> = { name, map, x, y, dir, pos:[..], region, hub:true, desc }`
(overrides the placeholder in 00_world.js; keep `pos`).
Extra art: `RB.props.P.myprop = { id, w, h, block, draw(c,x,y,pal,t,o) }`,
`RB.enemyArt.A.myart = (c, t, o) => {…}` (≈64px, centred), overworld
creatures `RB.sprites.custom.x = (c, look, dir, frame) => {…}` (16×24).
Story hooks needing code: `RB.hooks.name = async (args, ctx) => {…}` then `!hook name`.

Story-state ambience: `alt: [{ if: 'flag', ambient: { dark: 0.5, weather: 'fireflies' }, night: true }]`
on a map overrides `ambient` (and lights windows when `night`) while the condition holds.

## 10. Quest lines across chapters
Content that returns to earlier chapters lives in its own directory loaded
after ch1–ch6 (e.g. `src/content/lq/`) and only *adds* to maps defined
earlier; it never rewrites an existing scene.
- **Talk options first:** to give an existing person a new line, prepend
  guarded options to their `talk` list (the first matching option runs):
  `n.talk = [{ if: 'quest.lq_fare=1&quest.sg_main>=2', scene: 'lq.fare_tamae' }].concat(n.talk)`.
  Guard them so they never stand in front of a main-story conversation
  (e.g. `quest.co_main<8|co_restored`), and make one-off after-lines
  `…&!seen.<scene>`. When a post-game option would hide someone's `post`
  line, the new scene can `!call` it first.
- **One person, one place:** a person with several placements (a stall, a
  teahouse, an inn) gets mutually exclusive `if` conditions; write them out
  (conditions have no parentheses: `!a|!b|c`). Moving an existing person for
  a moment (Yasu waits by the lantern) = an `if` on their usual placement
  plus a second placement with `char:` and the complementary condition — the
  world walks the same figure from one to the other.
- **Late starts:** every line must be reachable from a save already past its
  first step: re-offer it where the player will pass anyway (a hub
  `onEnter`, a person in the next town), and let later steps start the quest
  (`?(!quest.x) !quest x 0`).
- **Stage fields:** besides `jp`/`en`, a stage may carry `hint: { jp, en }`
  (one more nudge) and `at: { map, npc }` / `{ map, prop, x, y }` / `{ map, x, y }`
  (where the next step happens) for the quest guidance.
- **Companion support flags:** `lq_ally1` and `lq_ally2` are set by the two
  long lines (docs/STORY.md, "Long roads"); the companion-turn system reads
  them to unlock support options. Each is set in a scene where the companion
  says, in their own voice, what they will now do in battle.
