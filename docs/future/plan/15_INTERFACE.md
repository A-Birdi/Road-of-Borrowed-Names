# 15 · The interface: an authored travel book

*Expansion plan, draft 9 (2026-10-09, after Robin's seventh round of answers). Planning only. The full direction,
with page-by-page requirements and twenty acceptance checks, is the playbook's §15A
([../playbook/UI_BOOK_DIRECTION_ADDENDUM.md](../playbook/UI_BOOK_DIRECTION_ADDENDUM.md)). This page is the short
version and what it means for this game.*

## 1. What Robin asked for

Robin, 2026-10-09, looking at the current Journey and Company pages:

> Another key distinction to make on the final pass is removing "obvious AI art and menus" - a unique font, menus
> that look and feel like a book rather than rectangles inside of rectangles, etc. […] Just looking at these two
> images you can still feel the AI-default structure a little bit. It lacks, soul, I guess. Or real creativity.
> […] some clearer direction across how text boxes look, menus and such, would be nice.
>
> Given the 2.5D goal we could use a pop-up / skewed book angle. […] a solid mix of "you're physically opening a
> book" and the 2.5D style could fit really well.
>
> Font, I don't know. I'm told AI loves a specific subset of fonts by default, so we could explore other options,
> noting that the Japanese font is unique to itself, I think?

And later: "The new font can work as long as it's readable and stylized for the tone of the game."

## 2. The direction in one sentence

*Open a well-used, personally kept Wayfarer's Ledger: repaired indigo cloth, a believable spine and page stack,
quiet ink typography, an amber place ribbon, and a few meaningful inserts. The object has depth; the words remain
easy to read.* (playbook §15A)

The thing to avoid is not rectangles as such: it is every subject drawn as the same bordered card inside the same
window. Replacing each card with a torn-paper card would repeat the mistake in another material.

## 3. What changes, page by page

- **The book is an object; the text is not tilted.** The opening can start at a shallow angle (the 2.5D, "physically
  opening a book" feel). As it settles, the reading surface faces the player. Perspective lives in the cover, the
  page edges, the gutter and illustrations, never in body text, furigana, the writing pad or controls. A flat
  reading mode stays available, with the same typography and page identity.
- **One navigation model.** Journey, Words, Satchel, Map, Company and Distractions (the Wayfarer's Ledger, C-58,
  K10) as bookmarks on the fore-edge, with the amber ribbon marking the open section. The Inn Ledger stays a
  separate book of six saves. On a phone, one leaf at a time with a labelled Back, never a shrunken two-page spread.
- **One frame, not frames within frames.** Ordinary text sits on the page. Topics are separated by space, an ink
  rule or a margin note. A *slip* means a detachable note or hint, a *seal* an existing record, a *folded map* the
  chart; nothing decorative implies a reward the player doesn't have.
- **Journey becomes an itinerary.** Left: the chapter heading and a ruled list of the main road and optional
  requests, the followed one marked by the ribbon. Right: the selected request, one clear "What to do now", the
  route, follow/unfollow, and "Need a nudge?" as a labelled fold-out insert that keeps earlier hints.
- **Company becomes a shared journal.** Left: a larger portrait, name, role, the Bond stage in words, their current
  thought in their own voice, what you know of them. Right: a short conversation index and rest-stop topics as ink
  entries, not a stack of raised buttons. Suzu's speech choice is a language note with two clear options.
- **The other pages** keep their own identity: Words a study notebook; Satchel an equipment folio; Map a fold-out
  chart; Distractions an illustrated page per pastime; the travel volume an album; the Inn Ledger a registration
  book; dialogue a broad paper strip; battle slips in the same ink and paper.
- **Motion that says "book" without slowing anything.** Opening about 240–360 ms, section change 140–220 ms, closing
  160–240 ms (starting values to tune). No drifting, fluttering or glow while reading. Reduced motion shows the
  destination directly.

## 4. Observations from Robin's two screenshots

Seen in the supplied Journey and Company pages, to look at during the work (not yet investigated in code):
- **Journey:** the "Next" box shows two near-identical lines, one naming a person at a place and one naming only
  the place, both saying there is no way there from here. They may be two real route candidates or a duplicate;
  the guidance data decides. The current request, the "Following" button and the hint button each sit in their own
  framed box: the nesting Robin describes.
- **Company:** two routes to one setting sit side by side: a talk option that asks Suzu to switch (with a short
  scene, the in-world way) and the plain "How Suzu speaks" switch (src/ui/56_suzu_speech.js). Both are deliberate; in
  the book, the talk stays a conversation and the switch becomes the language note. Also five raised buttons in a
  column, and the thought, the Bond stage and the known details each framed differently.

## 5. Type

- **Today the game embeds no font.** Japanese uses whatever Gothic the device has (Yu Gothic or Meiryo on Windows,
  Noto Sans CJK on Android), English a Palatino or Georgia serif, and controls the system UI font
  (src/styles/10_legacy.css, 00_tokens.css). So Robin's "the Japanese font is unique to itself" is the device's
  font, which differs between Robin's PC and phone.
- **Robin's permission:** a new font, readable and stylised for the game's tone. Still required: embedded in the
  single file (no web fonts), its licence recorded (an open licence such as the SIL Open Font License, which
  allows embedding), every kanji's reading kept, and fallbacks that work.
- **Five roles, not five fonts:** English display, English reading, controls, Japanese headings, and Japanese
  learning text with furigana. A small, coherent pairing.
- **A thought worth testing for a learning game:** Japanese textbook-style type (教科書体) shows kana and kanji in
  the stroke forms a learner writes (き, さ, り, ふ), where Gothic type joins or simplifies strokes. For words being
  taught it could be clearer than the Gothic used today. To be judged in the specimen, not assumed.
- **How it is chosen:** a specimen page of real game strings (long and short English and Japanese, small kana,
  dense kanji, furigana, "I/l/1" and "O/0") at normal and enlarged sizes, on Robin's PC and phone, comparing a few
  open-licence candidates that avoid the faces every generated interface reaches for. Robin judges the specimen;
  no font is chosen by name alone. Japanese fonts are large, so the embedded copy keeps only the characters the
  game uses.

## 6. How it would be built

The playbook's packets U00–U07 refine its milestones (P00, P01, P06, P16, P17), one at a time:

| Packet | What | Evidence |
|---|---|---|
| U00 | List every screen, control and action, with today's look as the baseline | An old-to-new control map with nothing lost |
| U01 | The book itself: shell, reading leaf, bookmarks, focus and scroll, flat mode, on Journey and Company | Desktop and phone captures; opening, change and close recorded; navigation never changes game state |
| U02 | The type specimen and the five roles | Real strings at normal and large sizes; the chosen family's licence; offline and fallback checks |
| U03 | Journey and Company finished end to end | Every action usable: follow, hints, talk, memories, pet, Suzu's speech choice |
| U04 | The shell carried to Words, Satchel, Map, Distractions, records and the Inn Ledger | Every page and state, with real data |
| U05 | Dialogue, title, help, writing prompts, battle slips and confirmations in the same family | Long dialogue, manual Next, IME and handwriting untouched by book geometry |
| U06 | The finished materials and transitions everywhere; old styles removed once nothing uses them | No page left in an old skin |
| U07 | Language, accessibility, input, offline and speed checks | The full UI evidence list |

**One review gate for Robin:** after U01 and U02, one proof set (Journey, Company, a dialogue strip, a phone layout
and the type specimen) with one question: does it feel like a book that belongs to this journey, and is it easy to
use? After that the method is applied, not re-voted page by page.

**Not included:** any new rule, economy or reward; remote fonts; a new engine or library; removing accessibility
settings. The twenty acceptance checks (UI-A01 to UI-A20) are in the playbook's §15A, UI-11.
