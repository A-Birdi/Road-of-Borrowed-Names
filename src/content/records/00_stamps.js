/* The Road Stamp Book's stamps and stands (expansion P06, K1; src/engine/58b_records.js). Stamps for meaningful
 * moments only: each chapter's story, a region's people helped (every side story this journey could have; one that
 * belongs to another companion's journey counts as done), the Atlas, pastimes, natural milestones, the field guide
 * (every kind of creature that roams a region) and the first "What I can do" of each kind. None asks for an input
 * mode, going without help, a streak, a time, a mastery star (C-13) or a festival score (C-55). The stands stand in
 * each region's town, only in journeys of the twelve-chapter edition until the release (F-21); the new chapters add
 * their own stamps and stands. */
var RB = (globalThis.RB = globalThis.RB || {});
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.stamps = C.stamps || {};
  C.stampStands = C.stampStands || {};
  const ED = 'ed>=2';

  // ---- the stands -------------------------------------------------------------------------------------------------
  const stands = {
    // a few steps from where you arrive in each town (checked: free, beside no way out, cutting off nothing)
    reedwake: { map: 'rw.village', x: 25, y: 27, title: T('Reedwake', '{葦|あし}ノ{瀬|せ}') },
    saltglass: { map: 'sg.harbor', x: 30, y: 3, title: T('Saltglass', '{潮|しお}{硝子|がらす}') },
    cinder: { map: 'co.village', x: 6, y: 17, title: T('Cinder Orchard', '{灰実|はいみ}の{里|さと}') },
    snowbell: { map: 'sb.hamlet', x: 24, y: 30, title: T('Snowbell', '{雪鈴|ゆきすず}') },
    lanternfall: { map: 'lf.town', x: 5, y: 15, title: T('Lanternfall', '{灯落|ひおち}') },
  };
  Object.assign(C.stampStands, stands);

  // side stories that only some journeys can have (a condition on the journey): on any other road they count as
  // done. (Suzu's own story in Cinder Orchard happens only when she is not the one travelling with you.)
  C.questOnly = Object.assign(C.questOnly || {}, { lf_nao: 'comp=nao', lf_mio: 'comp=mio', ren_ushio: 'comp=ren', co_suzu: 'comp!=suzu' });
  // every side story of a chapter this journey could have, finished
  const sidesDone = (ch) => (s) => {
    const qs = Object.keys(C.quests).filter((id) => C.quests[id].chapter === ch && !C.quests[id].main);
    return qs.length > 0 && qs.every((id) => (C.questOnly[id] && !RB.state.test(s, C.questOnly[id])) || (s.quests[id] && s.quests[id].done));
  };
  const add = (id, d) => { C.stamps[id] = Object.assign({ id }, d); };

  // ---- chapters and regions ---------------------------------------------------------------------------------------
  // (n: the chapter's old number, which its quests and flags keep; no: the number the player sees, its place in the
  // twelve-chapter story order, since the book belongs to that edition: Cinder Orchard is Chapter 5 there, not 3)
  const storyNo = (key) => RB.edition.ORDER.indexOf(key) + 1;
  const CH = [
    ['rw', 1, 'ch1_done', 'reedwake', 'bridge', '#b8322a', T('Reedwake', '{葦|あし}ノ{瀬|せ}')],
    ['sg', 2, 'ch2_done', 'saltglass', 'wave', '#2a4f8a', T('Saltglass', '{潮|しお}{硝子|がらす}')],
    ['co', 3, 'ch3_done', 'cinder', 'leaf', '#4a6a2a', T('Cinder Orchard', '{灰実|はいみ}の{里|さと}')],
    ['sb', 4, 'ch4_done', 'snowbell', 'bell', '#5a4a8a', T('Snowbell', '{雪鈴|ゆきすず}')],
    ['lf', 5, 'ch5_done', 'lanternfall', 'lantern', '#8a5a1e', T('Lanternfall', '{灯落|ひおち}')],
  ];
  for (const [key, n, flag, stand, motif, ink, title] of CH) {
    const no = storyNo(key);
    add('ch.' + key, { family: 'chapter', chapter: n, title, criteria: T('Chapter ' + no + ': the main story.', '{第|だい}' + no + '{章|しょう}'), hidden: n > 2, when: ED + '&' + flag, stand, design: { shape: 'round', motif, ink } });
    add('side.' + key, { family: 'region', chapter: n, title: T(title.en + ': everyone helped', title.jp + ' の {頼|たの}み'), criteria: T('Every side story in Chapter ' + no + ' that your journey could have.', '{第|だい}' + no + '{章|しょう} の {寄|よ}り{道|みち}'), hidden: n > 2, when: (s) => RB.edition.of(s) >= 2 && sidesDone(n)(s), stand, design: { shape: 'square', motif, ink } });
  }
  const last = storyNo('sa');
  add('ch.sa', { family: 'chapter', chapter: 6, title: T('The end of the road', '{旅|たび} の {終|お}わり'), criteria: T('Chapter ' + last + ': the main story.', '{第|だい}' + last + '{章|しょう}'), hidden: true, when: ED + '&postgame', stand: null, design: { shape: 'round', motif: 'book', ink: '#3a3a3a' } });
  add('side.sa', { family: 'region', chapter: 6, title: T('The last requests', '{最後|さいご} の {頼|たの}み'), criteria: T('Every side story in Chapter ' + last + ' that your journey could have.', '{第|だい}' + last + '{章|しょう} の {寄|よ}り{道|みち}'), hidden: true, when: (s) => RB.edition.of(s) >= 2 && sidesDone(6)(s), stand: null, design: { shape: 'square', motif: 'book', ink: '#3a3a3a' } });

  // ---- the field guide (E24 option 6): every kind of creature that roams a region, settled ------------------------
  // One stamp a region, pressed as soon as it is earned (src/engine/97_encounter.js roamingWon presses and announces
  // it after a roaming creature is settled). A region's bosses (its story's creature, its old guardian) have stamps of
  // their own and are not counted. Until a creature of the region has been met it shows veiled, in neutral words.
  // (The vents under Steamhollow are one region with the valley here: a guide of one kind would be no guide.)
  const GUIDE = [
    // [region (the stamp's id), regions it also covers, chapter key, place, motif, ink]
    ['reedwake', [], 'rw', stands.reedwake.title, 'bridge', '#b8322a'],
    ['saltglass', [], 'sg', stands.saltglass.title, 'wave', '#2a4f8a'],
    ['manybridge', [], 'mb1', T('Manybridge', '{八百橋|やおばし}'), 'plaque', '#2c3e6a'],
    ['cinder', [], 'co', stands.cinder.title, 'leaf', '#4a6a2a'],
    ['snowbell', [], 'sb', stands.snowbell.title, 'bell', '#5a4a8a'],
    ['keepers', [], 'kr', T('the Keepers\' Road', '{灯守|ひもり} の {道|みち}'), 'lantern', '#7a3a1e'],
    ['lanternfall', [], 'lf', stands.lanternfall.title, 'lantern', '#8a5a1e'],
    ['kotonoha', [], 'ko', T('Kotonoha', '{言|こと}の{葉|は}{島|じま}'), 'scroll', '#3a6a4a'],
    ['cloudroad', [], 'cr', T('the Cloudroad', '{雲路|くもじ}'), 'mountain', '#4a5a7a'],
    ['steamhollow', ['yn_vents'], 'yn', T('Steamhollow', '{湯|ゆ}ノ{谷|たに}'), 'steam', '#8a3a2e'],
    ['still', [], 'sa', T('the Still Archive', '{静寂|しじま} の {書庫|しょこ}'), 'book', '#3a3a3a'],
  ];
  C.guideRegion = C.guideRegion || {}; // a creature's region -> its field-guide stamp
  const Cap = (x) => x[0].toUpperCase() + x.slice(1);
  for (const [region, more, key, place, motif, ink] of GUIDE) {
    const regions = [region].concat(more), id = 'guide:' + region, no = storyNo(key);
    const inRegion = (eid) => !!C.enemies[eid] && regions.indexOf(C.enemies[eid].region) >= 0;
    for (const r of regions) C.guideRegion[r] = id;
    add(id, { family: 'guide', chapter: key, title: T(Cap(place.en) + ': every kind settled', place.jp + ' の {生|い}き{物|もの}'),
      criteria: T('Settle every kind of creature that roams ' + place.en + ' (not its bosses: they have stamps of their own).', place.jp + ' の {生|い}き{物|もの} が みな {静|しず}まる'),
      veil: T('Every kind of creature that roams a place in Chapter ' + no + '.', '{第|だい}' + no + '{章|しょう} の {生|い}き{物|もの}'),
      note: T('Every kind of creature that roams ' + place.en + ', settled. Its bosses are not counted.', place.jp + ' の {生|い}き{物|もの} が みな {静|しず}まる'),
      known: (s) => Object.keys(s.creatures || {}).some(inRegion),
      when: (s) => {
        if (RB.edition.of(s) < 2) return false;
        const kinds = Object.keys(C.enemies).filter((e) => inRegion(e) && !C.enemies[e].boss);
        return kinds.length > 0 && kinds.every((e) => s.creatures && s.creatures[e] && s.creatures[e].settled);
      },
      stand: null, design: { shape: 'oval', motif, ink } });
  }

  // ---- the Atlas, pastimes --------------------------------------------------------------------------------------------
  add('atlas.first', { family: 'dungeon', title: T('The Unwritten Atlas', '{白紙|はくし} の {地図帳|ちずちょう}'), criteria: T('Return from an expedition after the story.', '{探索|たんさく} から {帰|かえ}る'), hidden: true, when: (s) => RB.edition.of(s) >= 2 && !!(s.atlas && s.atlas.runs > 0), stand: null, design: { shape: 'hexagon', motif: 'book', ink: '#2a4f8a' } });
  add('pt.shiritori', { family: 'pastime', title: T('A word for a word', 'しりとり'), criteria: T('Finish a game of shiritori with your companion.', 'しりとり を {最後|さいご} まで'), when: (s) => RB.edition.of(s) >= 2 && Object.values((s.practice && s.practice.shiritori && s.practice.shiritori.byCompanion) || {}).some((c) => (c.recent && c.recent.length) || (c.totals && Object.values(c.totals).some((v) => +v > 0))), stand: null, design: { shape: 'oval', motif: 'chain', ink: '#8a2a5a' } });
  // a first win at shogi on any of its boards (hasami shogi is a game of its own, and the lessons and puzzles are practice)
  add('pt.shogi', { family: 'pastime', title: T('A first win at the board', '{将棋|しょうぎ} で {初|はじ}めて {勝|か}つ'), criteria: T('Win a game of shogi: on the small board, at mini-shogi, or at shogi itself.', '{将棋|しょうぎ} で {一回|いっかい} {勝|か}つ'), when: (s) => RB.edition.of(s) >= 2 && ['small', 'mini', 'full'].some((k) => !!(s.practice && s.practice.shogi && s.practice.shogi.wins && s.practice.shogi.wins[k] > 0)), stand: null, design: { shape: 'square', motif: 'koma', ink: '#7a4a1a' } });
  // a first game of karuta played to the end (09_RECORDS: "first finished karuta game")
  add('pt.karuta', { family: 'pastime', title: T('Every card taken', '{札|ふだ} が なくなる まで'), criteria: T('Play a game of karuta to its last card.', 'かるた を {最後|さいご} まで'), when: (s) => RB.edition.of(s) >= 2 && !!(s.practice && s.practice.karuta && s.practice.karuta.games > 0), stand: null, design: { shape: 'square', motif: 'card', ink: '#a8281e' } });
  add('pt.fishing', { family: 'pastime', title: T('A quiet cast', '{静|しず}か な {釣|つ}り'), criteria: T('Catch a fish anywhere you may fish.', '{魚|さかな} を {釣|つ}る'), when: (s) => RB.edition.of(s) >= 2 && !!(s.practice && s.practice.fishing && Object.keys(s.practice.fishing.observed || {}).length), stand: null, design: { shape: 'oval', motif: 'fish', ink: '#2a6a7a' } });

  // ---- natural milestones (Robin's allowed kind: reached by playing, never a tracker) ------------------------------
  const tips = (s) => Object.keys(s.tips || {});
  add('ms.responses', { family: 'milestone', title: T('Many ways to answer', '{色々|いろいろ} な {答|こた}え{方|かた}'), criteria: T('Answer creatures with eight different responses.', '{八|はち} つ の {答|こた}え{方|かた}'), when: (s) => RB.edition.of(s) >= 2 && tips(s).filter((k) => /^word:/.test(k)).length + (tips(s).some((k) => /unravel/.test(k)) ? 1 : 0) >= 8, stand: null, design: { shape: 'round', motif: 'brush', ink: '#3a3a6a' } });
  add('ms.askback', { family: 'milestone', title: T('Asking is speaking too', '{聞|き}き{返|かえ}す'), criteria: T('Ask someone to say it again, or more simply.', 'もう {一度|いちど} {聞|き}く'), when: (s) => RB.edition.of(s) >= 2 && !!(s.learn && s.learn.items && s.learn.items['c:ask_back']), stand: null, design: { shape: 'round', motif: 'ear', ink: '#6a3a2a' } });
  add('ms.ways', { family: 'milestone', title: T('Another way through', '{別|べつ} の {道|みち}'), criteria: T('Solve field puzzles in two different ways.', '{二|ふた} つ の やり{方|かた}'), when: (s) => {
    if (RB.edition.of(s) < 2) return false;
    const p = (s.discovery && s.discovery.puzzles) || {};
    return new Set(Object.keys(p).filter((id) => p[id] && p[id].done && p[id].method).map((id) => p[id].method)).size >= 2;
  }, stand: null, design: { shape: 'square', motif: 'path', ink: '#4a6a2a' } });

  // ---- the stands in the towns (twelve-chapter journeys only, until the release) ------------------------------------
  for (const id in stands) {
    const st = stands[id], m = C.maps[st.map];
    if (!m) continue;
    m.props = (m.props || []).concat([{ p: 'rb_stampstand', x: st.x, y: st.y, scene: 'rb.stand', o: { stand: id }, if: ED }]);
  }
  RB.script.add(`
@scene rb.stand
!hook rb_stand
`, 'records/00_stamps.js');
})(RB.content);
