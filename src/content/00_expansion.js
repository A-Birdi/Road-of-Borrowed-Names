/* The expansion's content registry (docs/future/plan/02_FOUNDATIONS.md S1, S5): which chapter each new id prefix
 * belongs to, and the story terms each chapter introduces (so tools/validate.mjs can check that no scene names them
 * earlier). Chapter keys follow RB.edition.ORDER. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  // id prefixes of the new chapters' content (scenes, maps, quests, challenges, enemies, notes)
  C.chapterOfPrefix = {
    mb: 'mb1',   // Manybridge, Chapter 3: the Exchange district
    mp: 'mb2',   // Manybridge, Chapter 4: Blockprint, Playhouse Rows, the festival
    kr: 'kr',    // the Keepers' Road, Chapter 7
    ko: 'ko',    // Kotonoha, Chapter 9 (and its early visit)
    sz: 'ko',    // Sazanami (a port, reached by sea with Chapter 9's crossing)
    el: 'ko',    // East Landing
    sea: 'ko',   // the sea chart and sailing
    cr: 'cr',    // the Cloudroad, Chapter 10
    yn: 'yn',    // Steamhollow, Chapter 11
  };
  // other new content whose Japanese goes through the review ledger (docs/review/language/), not tied to a chapter
  C.reviewPrefixes = ['ws'];
  // terms a chapter introduces: no earlier chapter's scene may name them (post-story scenes excepted)
  C.reveals = C.reveals || {};
})(RB.content);
