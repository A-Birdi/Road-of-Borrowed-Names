/* Atlas commissions (expansion P07; plan 04_DUNGEONS.md D7; Robin's R1, R2 §3, C-18, C-57; F-30). The commission
 * board in the Lantern Hall offers three kinds of Unwritten Atlas run, in twelve-chapter journeys once the Atlas is
 * open:
 *   practice  built round one of the player's weaker groups (RB.exams.groups: kana rows, kanji themes, a region's
 *             words, a grammar family), ranked from the evidence; the topic and its items are fixed when accepted
 *   themed    authored: a client, an aim and a fixed topic (a route's directions, requests that disagree, a family
 *             of endings), and the objective the run leans on
 *   survey    the Cartographer's work: the route keeps to one area's kinds of room, and each room has a landmark to
 *             verify against the old route description (a reading task); the corridors are never redrawn (A13)
 * Each takes a length chosen by the player: short (one fork, no camp), standard (as an ordinary run), long (longer
 * branches). The run keeps its shape whatever happens (D1: geometry fixed at creation); inside it the practice still
 * follows the player's weakest items, but only within the topic (C-57).
 *
 *   run.commission = { v, kind, id, title, length, topic: { id, title, items } | null, area | null, prefer }
 *   s.atlas.commissions = { v, done: { <id>: n }, practice: n, surveys: { <area>: { at, route } } }  (made the first
 *   time a commission is finished, never by reading; New Game+ does not carry it: it is the journey's own Atlas)
 *
 * What a finished survey gives: its page in the Cartographer's Atlas (the Map tab), and safe passage: in later runs a
 * room of a surveyed area opens its way on without its task (the task stays there to do). All three areas: a stamp
 * and the cartographer's compass. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.atlasCommissions = (function () {
  'use strict';
  const C = RB.content;
  const T = (en, jp) => ({ en, jp });
  const LENGTHS = {
    short: { en: 'Short', jp: '{短|みじか}い', about: 'One fork and no camp.' },
    standard: { en: 'Standard', jp: 'ふつう', about: 'Two forks and a camp, like an ordinary road.' },
    long: { en: 'Long', jp: '{長|なが}い', about: 'Two forks and a camp, with every branch two rooms deep.' },
  };
  // the survey areas: three of the Atlas's nine kinds of path room each
  const AREAS = {
    lantern: { title: T('The lantern roads', '{灯|あか}り の {道|みち}'), patterns: ['lanterns', 'court', 'doors'] },
    water: { title: T('The wet roads', '{水|みず} の {道|みち}'), patterns: ['crossing', 'tide', 'pool'] },
    wild: { title: T('The overgrown roads', '{草|くさ} の {道|みち}'), patterns: ['grove', 'stacks', 'margin'] },
  };
  const areaOf = (pat) => Object.keys(AREAS).find((k) => AREAS[k].patterns.indexOf(pat) >= 0) || null;
  // themed commissions (Astra A40): authored, each with a client, an aim, a fixed topic and the objective it leans on
  const THEMED = [
    { id: 'route', client: T('The Cartographer', '{地図師|ちずし}'), title: T('The lost route', '{消|き}えた {道順|みちじゅん}'),
      aim: T('A route description has lost its little words. Read where each way leads, and which way you are sent.'),
      topic: { id: 'theme:route', title: T('Directions: に, へ, を, から, まで'), items: ['g:prt_ni', 'g:prt_he', 'g:prt_wo', 'g:prt_kara_made'] }, prefer: 'doors' },
    { id: 'orders', client: T('Tsuru', 'ツル'), title: T('Two sets of instructions', '{二|ふた}つ の {指示|しじ}'),
      aim: T('Two keepers left two sets of instructions. Read what each one asks, allows or forbids.'),
      topic: { id: 'theme:orders', title: T('Requests and permission'), items: ['g:v_te_kudasai', 'g:v_naide_kudasai', 'g:v_temo_ii', 'g:v_nakereba'] }, prefer: 'sign' },
    { id: 'endings', client: T('Tsuru', 'ツル'), title: T('A family of endings', '〜て の {仲間|なかま}'),
      aim: T('The lantern shades on this road carry one family of endings: doing it all, doing it ahead, leaving it so, trying it. Each new one is shown before it is asked.'),
      topic: { id: 'theme:endings', title: T('Doing, leaving, finishing: 〜て しまう, 〜て おく, 〜て ある, 〜て みる'), items: ['g:te_shimau', 'g:te_oku', 'g:te_aru', 'g:te_miru'] }, prefer: 'lanterns' },
  ];
  const themed = (id) => THEMED.find((t) => t.id === id) || null;

  // ---- the board's offers -----------------------------------------------------------------------------------------
  const learnRec = (s, id) => (s && s.learn && s.learn.items && s.learn.items[id]) || null;
  // how weak a group is from the evidence: the mean box of the items met, and the wrong answers recorded; lower is
  // weaker. Only what was answered counts: a group nobody has evidence for is not called weak.
  function weakness(s, g) {
    let sum = 0, bad = 0, met = 0;
    for (const id of g.items) { const r = learnRec(s, id); if (r && r.seen > 0) { met++; sum += r.box || 0; bad += r.bad || 0; } }
    return { mean: met ? sum / met : Infinity, bad, met };
  }
  // the three weakest groups with evidence (at least three items answered; RB.exams' own offer rule), as practice
  // topics; with none yet, one topic: your weakest items anywhere
  function practiceTopics(s) {
    if (!RB.exams) return [];
    const gs = RB.exams.groups(s).filter((g) => RB.exams.offered(s, g));
    const ranked = gs.map((g) => ({ g, w: weakness(s, g) })).filter((x) => x.w.met >= 3)
      .sort((a, b) => a.w.mean - b.w.mean || b.w.bad - a.w.bad || (a.g.id < b.g.id ? -1 : 1));
    const out = ranked.slice(0, 3).map(({ g }) => ({ id: 'practice:' + g.id, title: T(g.en, g.jp || ''), items: g.items.slice(), group: g.id }));
    if (!out.length) {
      const weak = RB.learn && RB.learn.weakest ? RB.learn.weakest(12) : [];
      if (weak.length >= 3) out.push({ id: 'practice:weakest', title: T('Your weakest items, anywhere', ''), items: weak, group: null });
    }
    return out;
  }
  function rec(s) { return (s && s.atlas && s.atlas.commissions) || null; }
  const peek = (s) => { const r = rec(s); return r ? JSON.parse(JSON.stringify(r)) : { v: 1, done: {}, practice: 0, surveys: {} }; };
  function make(s) {
    if (!s.atlas.commissions || typeof s.atlas.commissions !== 'object') s.atlas.commissions = { v: 1, done: {}, practice: 0, surveys: {} };
    const r = s.atlas.commissions;
    for (const k of ['done', 'surveys']) if (!r[k] || typeof r[k] !== 'object') r[k] = {};
    return r;
  }
  const surveyed = (s) => Object.keys((rec(s) || {}).surveys || {}).filter((a) => AREAS[a]);
  function offers(s) {
    const out = [];
    for (const t of practiceTopics(s)) out.push({ kind: 'practice', id: t.id, title: t.title, aim: T('Built round what the evidence shows you find hardest: ' + t.title.en + '. The words inside still follow your weakest items, within this topic only.'), topic: t, prefer: null, area: null });
    for (const t of THEMED) out.push({ kind: 'themed', id: 'themed:' + t.id, title: t.title, client: t.client, aim: t.aim, topic: t.topic, prefer: t.prefer, area: null, done: ((rec(s) || {}).done || {})['themed:' + t.id] || 0 });
    for (const a in AREAS) out.push({ kind: 'survey', id: 'survey:' + a, title: T('Survey: ' + AREAS[a].title.en, AREAS[a].title.jp), client: T('The Cartographer', '{地図師|ちずし}'), aim: T('Walk ' + AREAS[a].title.en.toLowerCase() + ' and check each room against the old route description. The corridors are never redrawn: you mark what you verified.'), topic: null, prefer: null, area: a, done: surveyed(s).indexOf(a) >= 0 ? 1 : 0 });
    return out;
  }
  // a commission as the run will keep it (fixed now: D1, R2 §3)
  function commission(offer, length) {
    return { v: 1, kind: offer.kind, id: offer.id, title: offer.title, length: LENGTHS[length] ? length : 'standard', topic: offer.topic ? JSON.parse(JSON.stringify(offer.topic)) : null, area: offer.area || null, prefer: offer.prefer || null };
  }
  // what the run's practice may draw on: the topic's items, weakest first (C-57); null = anything (an ordinary run)
  function topicItems(run) { return run && run.commission && run.commission.topic ? run.commission.topic.items.slice() : null; }
  // a language step for one item: the Exams' question for it (kana, kanji, words, grammar drills), else the tasks'
  function stepFor(s, id, n) {
    let st = null;
    try { st = RB.exams ? RB.exams.question(s, id, 'choice', n || 0) : null; } catch (e) { st = null; }
    if (!st) { try { st = RB.tasks.stepFor(id); } catch (e) { st = null; } }
    return st;
  }
  // the next step of a topic: its due and weakest items first (RB.learn.pick), never the item just missed, not the
  // same item twice running; an item never met is marked to be taught first (step.topicItem, step.teachFirst)
  function topicStep(s, run, items, seed, valid) {
    const used = run._topicUsed || [];
    const pool = items.filter((id) => id !== run.lastWrong && used.indexOf(id) < 0);
    let ids = [];
    try { ids = RB.learn.pick(pool.length ? pool : items, 6, { ignoreCooldown: true }); } catch (e) { ids = items.slice(); }
    const r = RB.util.rng(seed >>> 0);
    for (const id of ids.concat(r.shuffle(items.slice()))) {
      const st = stepFor(s, id, r.int(4));
      if (!st || (valid && valid(st).length)) continue;
      st.topicItem = id;
      st.teachFirst = !(RB.learn.introduced && RB.learn.introduced(id)) && !((s.learn.items[id] || {}).seen > 0);
      run._topicUsed = used.concat([id]).slice(-Math.max(1, Math.min(3, items.length - 1)));
      return st;
    }
    return null;
  }

  // ---- surveys: the landmark lines of the old route description ------------------------------------------------------
  const L = (simple, rich) => ({ simple, rich });
  const LANDMARKS = {
    lanterns: L(T('Lanterns stand in a row.', '{灯籠|とうろう} が {並|なら}んで いる 。'), T('Lanterns of white paper line both sides of the road.', '{白|しろ}い {紙|かみ} の {灯籠|とうろう} が 、 {道|みち} の {両側|りょうがわ} に {並|なら}んで いる 。')),
    crossing: L(T('There is a bridge over the water.', '{水|みず} の {上|うえ} に {橋|はし} が ある 。'), T('The bridge reaches only part of the way across.', '{橋|はし} は まだ {途中|とちゅう} まで しか {架|か}かって いない 。')),
    doors: L(T('There are three doors.', '{扉|とびら} が {三|みっ}つ ある 。'), T('Three doors of the same shape stand side by side.', '{同|おな}じ {形|かたち} の {扉|とびら} が {三|みっ}つ 、 {横|よこ} に {並|なら}んで いる 。')),
    grove: L(T('There are many trees.', '{木|き} が たくさん ある 。'), T('Among trees that have forgotten their names, voices wander.', '{名前|なまえ} を {忘|わす}れた {木|き} の {間|あいだ} を 、 {声|こえ} が {迷|まよ}って いる 。')),
    stacks: L(T('There are shelves of books.', '{本|ほん} の {棚|たな} が ある 。'), T('The shelves are packed with books that have no titles.', '{題|だい} の ない {本|ほん} が 、 {棚|たな} に {詰|つ}まって いる 。')),
    court: L(T('There is a stone courtyard.', '{石|いし} の {庭|にわ} が ある 。'), T('Promises that were not kept are carved in the courtyard\'s stones.', '{守|まも}られなかった {約束|やくそく} が 、 {庭|にわ} の {石|いし} に {刻|きざ}まれて いる 。')),
    tide: L(T('Stairs go down into the water.', '{階段|かいだん} が {水|みず} に {沈|しず}んで いる 。'), T('When the tide goes out, stairs appear from under the water.', '{潮|しお} が {引|ひ}く と 、 {水|みず} の {下|した} から {階段|かいだん} が {現|あらわ}れる 。')),
    margin: L(T('A white field spreads out.', '{白|しろ}い {野原|のはら} が {広|ひろ}がって いる 。'), T('In a field like the margin of a page, only a few letters remain.', '{紙|かみ} の {余白|よはく} の よう な {野原|のはら} に 、 {字|じ} が {少|すこ}し だけ {残|のこ}って いる 。')),
    pool: L(T('There is a quiet pond.', '{静|しず}か な {池|いけ} が ある 。'), T('Someone\'s name is reflected in a pond with no wind.', '{風|かぜ} の ない {池|いけ} に 、 {誰|だれ}か の {名前|なまえ} が {映|うつ}って いる 。')),
  };
  // the landmark task for a room: which line of the description is this room? (seeded; F/E the simple lines, I/A the
  // rich ones; every wrong line says what it describes)
  function landmarkStep(run, roomKey, pattern, P) {
    const r = RB.util.rng((run.seed ^ RB.util.hashStr('survey:' + roomKey)) >>> 0);
    const rich = P === 'I' || P === 'A';
    const others = r.shuffle(Object.keys(LANDMARKS).filter((k) => k !== pattern)).slice(0, 2);
    const line = (k) => (rich ? LANDMARKS[k].rich : LANDMARKS[k].simple);
    const opts = r.shuffle([pattern].concat(others)).map((k) => ({ jp: line(k).jp, ok: k === pattern, why: k === pattern ? undefined : { en: 'That line describes another kind of room: ' + line(k).en.toLowerCase() } }));
    return {
      kind: 'choose', item: 'c:atlas_survey_' + pattern,
      prompt: { en: 'The old route description has a line for each room. Which line is this room? Look around you before you answer.' },
      options: opts, explain: { jp: line(pattern).jp, en: line(pattern).en },
      title: 'Verify a landmark',
    };
  }

  // ---- finishing: what is kept --------------------------------------------------------------------------------------
  // a run ended; returns what changed ({ survey: area, page: true, all: true, compass: true } …) for the screens
  function finished(s, run, kind) {
    const c = run && run.commission;
    if (!c || kind !== 'complete') return null;
    const r = make(s);
    const out = { kind: c.kind, id: c.id };
    if (c.kind === 'practice') r.practice = (r.practice || 0) + 1;
    r.done[c.id] = (r.done[c.id] || 0) + 1;
    if (c.kind === 'survey' && c.area) {
      const marks = (run.survey && run.survey.marks) || {};
      const pl = RB.atlas.planOf(run);
      const hasMark = (key) => { const m = C.maps[RB.atlas.mapId(run, key)]; return !!(m && m.atlas && m.atlas.survey); };
      const route = run.path.map((key) => { const d = pl.rooms[key] || {}; return { key, pattern: d.pattern || null, kind: d.kind || null, mark: hasMark(key), verified: !!marks[key] }; });
      // the landmarks of the road you walked: every room of the area you passed through had one
      const need = route.filter((x) => x.mark);
      const ok = need.length > 0 && need.every((x) => x.verified);
      out.surveyComplete = ok;
      if (ok && !r.surveys[c.area]) {
        r.surveys[c.area] = { at: Date.now(), route, seed: run.seed };
        out.survey = c.area;
        if (Object.keys(AREAS).every((a) => r.surveys[a])) {
          out.all = true;
          if (!(s.inv.atlas_cos_compass > 0) && !(s.equip && Object.values(s.equip).indexOf('atlas_cos_compass') >= 0)) { RB.state.give(s, 'atlas_cos_compass', 1); out.compass = true; }
        }
      }
    }
    return out;
  }

  return { LENGTHS, AREAS, THEMED, LANDMARKS, areaOf, themed, practiceTopics, weakness, offers, commission, topicItems, stepFor, topicStep, landmarkStep, finished, peek, rec, surveyed };
})();

// ---- the board in the Lantern Hall, its scenes, the compass and the stamp ------------------------------------------
(function (C) {
  'use strict';
  const T = (en, jp) => ({ en, jp });
  C.items.atlas_cos_compass = { atlas: true, slot: 'cosmetic', acc: 'atlas_compass', name: T('The Cartographer\'s Compass', '{方位磁石|ほういじしゃく}'), desc: 'Given for surveying every road of the Unwritten Atlas. It hangs at your hip and points, as it should, north.' };
  C.stamps = C.stamps || {};
  C.stamps['atlas.surveys'] = { id: 'atlas.surveys', family: 'dungeon', hidden: true, title: T('Every road surveyed', '{全|すべ}て の {道|みち} の {調査|ちょうさ}'), criteria: T('Survey all three areas of the Unwritten Atlas.', '{三|みっ}つ の {調査|ちょうさ}'),
    when: (s) => !!(RB.edition && RB.edition.of(s) >= 2 && RB.atlasCommissions && RB.atlasCommissions.surveyed(s).length === Object.keys(RB.atlasCommissions.AREAS).length), stand: null, design: { shape: 'round', motif: 'path', ink: '#2a4f8a' } };
  const hall = C.maps['rw.hall'];
  if (hall) hall.props = (hall.props || []).concat([{ p: 'noticeboard', x: 7, y: 2, scene: 'atlas.board', if: 'ed>=2&postgame' }]);
})(RB.content);

RB.script.add(`
@scene atlas.board
narr: {壁|かべ} の {掲示板|けいじばん} に 、 {依頼|いらい} の {紙|かみ} が {貼|は}って ある 。 {練習|れんしゅう} 、 {仕事|しごと} 、 {測量|そくりょう} 。 || Commissions have been pinned to the board on the wall: practice, errands, surveys.
!hook atlas_board

@scene atlas.board.go
narr: {依頼|いらい} の {紙|かみ} を {一枚|いちまい} {取|と}る と 、 {灯籠|とうろう} の {紙|かみ} に {道|みち} の {名前|なまえ} が {浮|う}かんだ 。 || You take one commission from the board, and the name of a road surfaces on a lantern shade.
?(comp=nao) comp: {依頼|いらい} {付|つ}き の {道|みち} か 。 {届|とど}け{先|さき} が ある と 、 {歩|ある}きやすい 。 || A road with a job attached. Easier to walk when there's somewhere to deliver.
?(comp=mio) comp: {目的|もくてき} が ある と 、 {迷|まよ}わない わ ね 。 {行|い}きましょう 。 || With a purpose, we won't lose our way. Let's go.
?(comp=ren) comp: {依頼|いらい} は {大切|たいせつ} に {扱|あつか}います 。 {参|まい}りましょう 。 || A commission deserves care. Let us go.
?(comp=suzu) comp: {台本|だいほん} {付|つ}き の {舞台|ぶたい} だ ね 。 さあ 、 {開演|かいえん} ！ || A stage with a script this time. Curtain up!

@scene atlas.board.later
narr: {依頼|いらい} は 、 {掲示板|けいじばん} に {貼|は}られた まま だ 。 || The commissions stay pinned to the board.

@scene atlas.survey.mark
!hook atlas_survey
`, 'atlas/80_commissions.js');

RB.lex.add(RB.lex.parseTable(`
見比べる|みくらべる|v1|I|to compare (by looking at both)
地図帳|ちずちょう|n|I|atlas (a book of maps)
測量|そくりょう|n|A|surveying, a survey
方位磁石|ほういじしゃく|n|A|compass (for direction)
`), 'atlas');
