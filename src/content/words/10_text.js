/* Words pages (addendum §20): the labels the Kept sentences and Creatures met
 * pages show, the names of the things you can read in the world, and the
 * load-time normalisers for their records. Japanese labels appear when the
 * interface is in Japanese; every kanji has its reading
 * (tests/unit/bookmarks.test.mjs checks them against the lexicon). */
var RB = (globalThis.RB = globalThis.RB || {});

(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.wordsText = {
    pages: {
      bookmarks: T('Kept sentences', '{栞|しおり}'),
      creatures: T('Creatures met', '{観察|かんさつ} {記録|きろく}'),
    },
    heads: {
      sentence: T('The sentence', '{文|ぶん}'),
      yours: T('Your own words', '{自分|じぶん} の {言葉|ことば}'),
      words: T('Your noted words in these sentences', '{控|ひか}えた {言葉|ことば}'),
      places: T('Where you have met it', '{出会|であ}った {場所|ばしょ}'),
      moves: T('What you have seen it do', '{見|み}た {動|うご}き'),
      changes: T('How it changed', '{変|か}わった ところ'),
      settled: T('When it settled', '{静|しず}まった とき'),
    },
    setting: {
      indoor: T('Indoors', '{屋内|おくない}'),
      outdoor: T('Out of doors', '{屋外|おくがい}'),
    },
    // What a line read from a thing in the world was written on (by prop type).
    objects: {
      sign: T('Sign', '{看板|かんばん}'),
      signblank: T('Blank sign', '{白|しろ}い {看板|かんばん}'),
      noticeboard: T('Notice board', '{掲示板|けいじばん}'),
      stone_marker: T('Stone marker', '{石碑|せきひ}'),
      co_tablet: T('Tablet', '{石板|せきばん}'),
      lq_namestone: T('Name stone', '{名前|なまえ} の {石|いし}'),
      mailbox: T('Post box', '{郵便受|ゆうびんう}け'),
      door: T('Door', '{戸|と}'),
      sa_door: T('Door', '{扉|とびら}'),
      shelf: T('Shelf', '{棚|たな}'),
      sb_mailshelf: T('Mail shelf', '{郵便|ゆうびん} の {棚|たな}'),
      bookpile: T('Books', '{本|ほん}'),
      desk: T('Desk', '{机|つくえ}'),
      smalltable: T('Table', 'テーブル'),
      table: T('Table', 'テーブル'),
      sb_starchart: T('Star chart', '{星図|せいず}'),
      sg_tideboard: T('Tide board', '{潮|しお} の {表|ひょう}'),
      shrine: T('Shrine', '{祠|ほこら}'),
      statue: T('Statue', '{像|ぞう}'),
      sa_statue: T('Statue', '{像|ぞう}'),
      sa_grave: T('Grave', '{墓|はか}'),
      lantern: T('Lantern', '{提灯|ちょうちん}'),
      deadlantern: T('Unlit lantern', '{消|き}えた {提灯|ちょうちん}'),
      sa_cabinet: T('Cabinet', '{戸棚|とだな}'),
      sg_drawers: T('Drawers', '{引|ひ}き{出|だ}し'),
      telescope: T('Telescope', '{望遠鏡|ぼうえんきょう}'),
    },
    thing: T('Something you looked at', '{見|み}た もの'),
    narration: T('Narration', 'ナレーション'),
  };

  // load-time normalisers for the two records (keep every record; repair shape only)
  if (RB.save && RB.save.addMigration) {
    RB.save.addMigration((st) => { if (RB.bookmarks) RB.bookmarks.migrate(st); });
    RB.save.addMigration((st) => { if (RB.creatures) RB.creatures.migrate(st); });
  }
})(RB.content);
