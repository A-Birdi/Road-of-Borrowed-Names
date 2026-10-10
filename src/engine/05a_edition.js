/* The twelve-chapter edition (expansion S4; docs/future/plan/02_FOUNDATIONS.md; decisions C-01, C-02, C-54, C-81).
 *
 * Every campaign carries an edition: 1 is the six-chapter game (every save made so far; absent means 1), 2 the
 * twelve-chapter one, which inserts six chapters between the existing ones. Existing chapter flags (ch1_done…) and
 * `s.chapter` keep their meaning, so no existing scene changes: the new chapters are told apart by a chapter key
 * (`s.chapterKey`), and the number a player sees comes from the story order below.
 *
 * Until the release (A04; P18), the build Robin plays stays six-chapter: new journeys are edition 1 unless the
 * development switch is on (Settings, "Edition for new journeys", or `?edition=12`), and saves are never converted
 * (lead's decisions F-01, F-02). The edition-1 notice of C-54 (an old save begins New Game+) applies only once the
 * edition ships (`SHIPPED`).
 *
 * Conditions: `ed>=2` (the campaign's edition), `chap>=mb1` / `chap=kr` (the story's position in the twelve-chapter
 * order; an edition-1 campaign is placed by its old chapter number). */
var RB = (globalThis.RB = globalThis.RB || {});

RB.edition = (function () {
  'use strict';
  const SIX = 1, TWELVE = 2;
  // The twelve-chapter edition becomes the default for new journeys only at the release (playbook A04).
  let SHIPPED = false;
  // story order of the twelve chapters, by key (playbook §02)
  const ORDER = ['rw', 'sg', 'mb1', 'mb2', 'co', 'sb', 'kr', 'lf', 'ko', 'cr', 'yn', 'sa'];
  // the six-chapter edition's numbers, and the key each one keeps in the twelve
  const OLD = { 1: 'rw', 2: 'sg', 3: 'co', 4: 'sb', 5: 'lf', 6: 'sa' };
  const OLD_NO = { rw: 1, sg: 2, co: 3, sb: 4, lf: 5, sa: 6 };
  // the flag each chapter sets when its story is finished (existing flags keep their meaning: S4)
  const DONE = { rw: 'ch1_done', sg: 'ch2_done', mb1: 'mb1_done', mb2: 'mb2_done', co: 'ch3_done', sb: 'ch4_done', kr: 'kr_done', lf: 'ch5_done', ko: 'ko_done', cr: 'cr_done', yn: 'yn_done', sa: 'postgame' };
  const TITLES = {
    rw: { en: 'Reedwake', jp: '{葦|あし}ノ{瀬|せ}' },
    sg: { en: 'Saltglass', jp: '{潮|しお}{硝子|がらす}' },
    mb1: { en: 'Manybridge: Eight Hundred Bridges', jp: '{八百橋|やおばし} ― {八百|はっぴゃく}の{橋|はし}' },
    mb2: { en: 'Manybridge: Blockprint and Footlights', jp: '{八百橋|やおばし} ― {版木|はんぎ}と{灯|あか}り' },
    co: { en: 'Cinder Orchard', jp: '{灰実|はいみ}の{里|さと}' },
    sb: { en: 'Snowbell', jp: '{雪鈴|ゆきすず}' },
    kr: { en: 'The Keepers\' Road', jp: '{灯守|ひもり}の{道|みち}' },
    lf: { en: 'Lanternfall', jp: '{灯落|ひおち}' },
    ko: { en: 'Kotonoha', jp: '{言|こと}の{葉|は}{島|じま}' },
    cr: { en: 'The Cloudroad', jp: '{雲路|くもじ}' },
    yn: { en: 'Steamhollow', jp: '{湯|ゆ}ノ{谷|たに}' },
    sa: { en: 'The Still Archive', jp: '{静寂|しじま}の{書庫|しょこ}' },
  };

  const of = (s) => (s && s.edition) || SIX;
  // the development switch: the device's settings record, or ?edition=12 on the page's address
  function devOn() {
    const st = RB.game && RB.game.settings;
    if (st && +st.edition === 12) return true;
    try { return typeof location !== 'undefined' && /[?&]edition=12\b/.test(location.search || ''); } catch (e) { return false; }
  }
  const forNew = () => (SHIPPED || devOn() ? TWELVE : SIX);
  const key = (s) => (s && (s.chapterKey || OLD[s.chapter])) || null;
  // the chapter number a player sees: the old numbering for edition 1, story order for edition 2
  function number(s) {
    if (!s) return 0;
    if (of(s) < TWELVE) return s.chapter || 0;
    const i = ORDER.indexOf(key(s));
    return i >= 0 ? i + 1 : s.chapter || 0;
  }
  // `!chapter 3` (an existing chapter by its old number) or `!chapter mb1` (a new one by key). A new chapter
  // leaves `s.chapter` as it was, so `ch>=n` conditions in existing content keep their meaning.
  function setChapter(s, arg) {
    const a = String(arg).trim();
    if (/^\d+$/.test(a)) { s.chapter = +a; s.chapterKey = OLD[+a] || null; return; }
    if (ORDER.indexOf(a) < 0) throw new Error('unknown chapter ' + a);
    s.chapterKey = a;
    if (OLD_NO[a]) s.chapter = OLD_NO[a];
  }
  // position in story order: an edition-1 campaign is placed by its old chapter's key
  const pos = (s) => ORDER.indexOf(key(s));
  // an edition-1 save once the twelve-chapter edition has shipped: shown as such, begins New Game+ (C-54)
  const isOld = (s) => SHIPPED && of(s) < TWELVE;
  const isOldMeta = (m) => SHIPPED && !!m && (m.edition || SIX) < TWELVE;

  if (RB.state && RB.state.addTerm) {
    RB.state.addTerm('ed', (s, rest, op, val, num, cmp) => cmp(of(s), op || '>=', num(val == null ? 2 : val)));
    RB.state.addTerm('chap', (s, rest, op, val, num, cmp) => {
      const want = ORDER.indexOf(val);
      if (want < 0) throw new Error('unknown chapter key ' + val);
      return cmp(pos(s), op || '>=', want);
    });
  }

  return {
    SIX, TWELVE, ORDER, OLD, DONE, TITLES, of, forNew, devOn, key, number, setChapter, pos, isOld, isOldMeta,
    shipped: () => SHIPPED,
    // tests only: what the release will switch on
    _ship(v) { SHIPPED = !!v; },
  };
})();
