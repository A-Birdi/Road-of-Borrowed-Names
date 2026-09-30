/* The ending extensions and The Pages We Keep (addendum §10, §11): the
 * authoritative state, its once-only commits and the hooks the scenes call.
 * The words people say live in 20_ending.js, 30_project.js and 40_topics.js.
 *
 *   RB.pages.state(s)          the committed companion's project (or null)
 *   RB.pages.pending(s, where) the conversation waiting to be had here, or null
 *                              { id, scene, en } — for Company and the Chat key
 *   RB.pages.capture(s, ev)    Page II evidence from an Atlas event (atlas:event)
 *   RB.pages.runEnded(s, ev)   the outing's return type (atlas:end)
 *   RB.pages.accept / page2 / page3 / endingDone / unfinishedDone   commits
 *   RB.pages.topic(s, where)   the next "Talk about this road" topic
 *
 * Saved state (campaign-local, docs/ADDENDUM_CONTRACTS.md §1):
 *   s.company.project = { v, comp, stage 1..3, theme, t1..t3, ev, aspect, where,
 *     caption, lastEmpty, road: { camp, home, lastEnd, recent, quiet } }
 *     ev = { run, id, kind, desc, title, room, branch, mods, pet, t, ret }
 *     (copied out of the run when it happens, so the Atlas cleanup cannot lose it;
 *     the run itself keeps only run.pages = { ev: id } as a reference)
 *   s.company.talk['road:<topic>'] = { t, variant }   topics heard
 *   memories: ending:<c> | ending_retro:<c> | unfinished:<c> | pages:1..3
 * Bond: RB.company.award(s, 'ending', 2) and 'project:1..3' (+1 each). Topics,
 * replies and deferrals award nothing. Nothing here changes battle, rewards or
 * answers; nothing reads the game's random streams. */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};

RB.pages = (function () {
  'use strict';
  const C = RB.content;
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const PQ = { nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio', suzu: 'co_suzu' };
  const J = (jp, en) => ({ jp, en });

  // ---- authored data the hooks present and the folio shows ------------------------------------
  // Each companion's project (§11.3), the two themes offered at Page I, the
  // aspects asked about at Page II, and the captions chosen at Page III.
  const PROJECT = {
    nao: {
      title: J('{明日|あした} の {宛先|あてさき}', 'An Address for Tomorrow'),
      themes: {
        next: J('{次|つぎ} に {歩|ある}く {人|ひと} へ の {道案内|みちあんない}', 'A useful instruction for the next traveller'),
        back: J('{帰|かえ}り{道|みち} を {見|み}つける ため の {一言|ひとこと}', 'A message about finding the way back'),
      },
      aspects: {
        read: J('{動|うご}く {前|まえ} に {確|たし}かめた こと', 'What we checked before we moved'),
        decide: J('{決|き}めた の は 、 {歩|ある}いた {二人|ふたり} だ と いう こと', 'That the two who walked it decided'),
        home: J('そこ から {帰|かえ}り{道|みち} が {見|み}えた こと', 'That you could see the way home from there'),
      },
      captions: {
        next: [J('{読|よ}んで から 、 {進|すす}め 。', 'Read it first. Then go on.'), J('{決|き}める の は 、 {歩|ある}く {人|ひと} 。', 'The one who walks it decides.')],
        back: [J('{来|き}た {道|みち} も 、 {道|みち} の うち 。', 'The way you came counts as a road too.'), J('{迷|まよ}ったら 、 {声|こえ} を かけろ 。', 'If you get lost, call out.')],
      },
      memento: 'pages_nao',
      place: J('{灯|あか}り{堂|どう} の {壁|かべ}', 'the Lantern Hall wall'),
    },
    mio: {
      title: J('{荷|に} を {下|お}ろす {場所|ばしょ}', 'A Place to Set Things Down'),
      themes: {
        pause: J('{休|やす}む こと が {怖|こわ}くなかった {理由|りゆう}', 'What made a pause feel safe'),
        share: J('{仕事|しごと} を {分|わ}け{合|あ}えた {理由|りゆう}', 'What made sharing the work easier'),
      },
      aspects: {
        stop: J('{止|と}まって 、 {座|すわ}った こと', 'That we stopped and sat down'),
        turns: J('{交代|こうたい} で やった こと', 'That we took turns'),
        enough: J('「 {今日|きょう} は ここ まで 」 と {言|い}えた こと', 'That we could say "that\'s enough for today"'),
      },
      captions: {
        pause: [J('{座|すわ}って いい {場所|ばしょ} 。', 'A place where it\'s all right to sit down.'), J('{急|いそ}がない {日|ひ} も 、 {旅|たび} の うち 。', 'Unhurried days are part of the journey too.')],
        share: [J('{荷物|にもつ} は 、 {半分|はんぶん} ずつ 。', 'Half the load each.'), J('{頼|たの}む の も 、 {頼|たの}まれる の も 、 {少|すこ}し ずつ 。', 'Asking and being asked — a little at a time.')],
      },
      memento: 'pages_mio',
      place: J('ハナ の {茶屋|ちゃや} の {壁|かべ}', 'the wall of Hana\'s teahouse'),
    },
    ren: {
      title: J('{次|つぎ} の {灯守|ひもり} へ の {余白|よはく}', 'A Margin for the Next Keeper'),
      themes: {
        sure: J('{役|やく} に {立|た}つ 、 {確|たし}か な こと', 'A useful certainty'),
        unsure: J('{正直|しょうじき} に 「 {分|わ}からない 」 と {書|か}く こと', 'An uncertainty, honestly labelled'),
      },
      aspects: {
        known: J('{今|いま} は {確|たし}か に {分|わ}かって いる こと', 'What we know for certain now'),
        unknown: J('まだ {分|わ}からない まま の こと', 'What we still don\'t know'),
        way: J('どっち へ {行|い}った か （ {選|えら}んだ の は わたし で は ない ）', 'Which way we went (not my choice, for once)'),
      },
      captions: {
        sure: [J('{確|たし}か な こと ： {読|よ}めば 、 {道|みち} は {続|つづ}く 。', 'Certain: read it, and the road goes on.'), J('{確|たし}か な こと ： {一人|ひとり} で {守|まも}る {名|な} は ない 。', 'Certain: no one keeps a name alone.')],
        unsure: [J('{分|わ}からない こと は 、 {分|わ}からない と {書|か}く 。', 'What we don\'t know, we write down as not known.'), J('{方角|ほうがく} ： {未確認|みかくにん} 。 {連|つ}れ に {聞|き}く こと 。', 'Direction: unconfirmed. Ask your companion.')],
      },
      memento: 'pages_ren',
      place: J('{灯|あか}り{堂|どう} の {壁|かべ}', 'the Lantern Hall wall'),
    },
    suzu: {
      title: J('{旅|たび} と {旅|たび} の {幕間|まくあい}', 'The Scene Between Adventures'),
      themes: {
        funny: J('{小|ちい}さな 、 {笑|わら}える {場面|ばめん}', 'A small funny moment'),
        quiet: J('{舞台|ぶたい} で は {省|はぶ}かれる 、 {静|しず}か な {場面|ばめん}', 'A quiet moment a performance usually leaves out'),
      },
      aspects: {
        asis: J('{起|お}きた まま に {書|か}く', 'Write it just as it happened'),
        pause: J('{間|ま} を 、 そのまま {残|のこ}す', 'Leave the pause in'),
        watch: J('わたし が {見|み}て いた だけ の ところ', 'The part where I only watched'),
      },
      captions: {
        funny: [J('{本日|ほんじつ} の {出費|しゅっぴ} ： {笑|わら}い {一回|いっかい} 。', 'Today\'s expenses: one laugh.'), J('{主役|しゅやく} {不在|ふざい} でも 、 {幕|まく} は {上|あ}がる 。', 'No lead needed — the curtain goes up anyway.')],
        quiet: [J('{台詞|せりふ} の ない {場面|ばめん} 。', 'A scene with no lines.'), J('{拍手|はくしゅ} は 、 いらない 。', 'No applause needed.')],
      },
      memento: 'pages_suzu',
      place: J('ハナ の {茶屋|ちゃや} の {壁|かべ}', 'the wall of Hana\'s teahouse'),
    },
  };
  const LATER = {
    theme: J('{今|いま} は まだ {決|き}めない', 'Not now — maybe later'),
    aspect: J('{家|いえ} に {帰|かえ}って から {話|はな}そう', 'Let\'s talk about it at home'),
    caption: J('{今日|きょう} は ここ まで に しよう', 'Let\'s finish it another day'),
  };
  // The ending's optional reply (§10.2.3): two sincere answers and a quiet one,
  // none of them "right". resp: what the Company memory keeps of the answer.
  const REPLY = {
    nao: [
      { id: 'walk', jp: '{次|つぎ} の {道|みち} も 、 {一緒|いっしょ} に {歩|ある}こう 。', en: 'Let\'s walk the next road together too.', resp: J('ナオ は 「 {道|みち} は {二人|ふたり} で {選|えら}ぶ 」 と {答|こた}えた 。', 'Nao said the two of you would choose the roads together.') },
      { id: 'home', jp: '{帰|かえ}る {場所|ばしょ} が ある から 、 {遠|とお}く へ {行|い}ける 。', en: 'Having somewhere to come back to is what lets me go far.', resp: J('ナオ は 、 {帰|かえ}り{道|みち} は いつ でも {覚|おぼ}えて おく と {言|い}った 。', 'Nao said they would always remember the way back.') },
      { id: 'quiet', jp: '（ {黙|だま}って うなずく ）', en: '(Just nod.)', resp: J('ナオ も 、 {黙|だま}って うなずいた 。', 'Nao nodded back, without a word.') },
    ],
    mio: [
      { id: 'carry', jp: '{今度|こんど} は 、 {荷物|にもつ} を {少|すこ}し {持|も}たせて 。', en: 'Next time, let me carry some of the load.', resp: J('ミオ は 、 {重|おも}い {方|ほう} を {渡|わた}す と {笑|わら}った 。', 'Mio laughed and said you would get the heavy bag.') },
      { id: 'rest', jp: '{水曜|すいよう} は 、 {一緒|いっしょ} に {何|なに} も しない {日|ひ} に しよう 。', en: 'Let\'s make Wednesdays a day we do nothing together.', resp: J('ミオ は 、 お{茶|ちゃ} {係|がかり} は {交代|こうたい} だ と {言|い}った 。', 'Mio said you would take turns making the tea.') },
      { id: 'quiet', jp: '（ {黙|だま}って {瓶|びん} を {受|う}け{取|と}る ）', en: '(Just take the bottle.)', resp: J('ミオ は 、 {何|なに} も {言|い}わず に {頷|うなず}いた 。', 'Mio nodded, and said nothing more.') },
    ],
    ren: [
      { id: 'map', jp: '{地図|ちず} は わたし が {読|よ}む 。 {名前|なまえ} は レン が {読|よ}んで 。', en: 'I\'ll read the maps. You read the names.', resp: J('レン は 、 {公平|こうへい} な {分担|ぶんたん} だ と {答|こた}えた 。', 'Ren called it a fair division of labour.') },
      { id: 'lost', jp: '{迷|まよ}う の も 、 {一緒|いっしょ} なら {悪|わる}くない 。', en: 'Getting lost isn\'t bad, if we do it together.', resp: J('レン は 、 それ を {師匠|ししょう} の {教|おし}え の {横|よこ} に {書|か}き{足|た}した 。', 'Ren wrote it down beside their teacher\'s lessons.') },
      { id: 'quiet', jp: '（ {黙|だま}って {灯|ひ} を {受|う}け{取|と}る ）', en: '(Just take the lamp to hold.)', resp: J('レン は 、 {灯|ひ} を {少|すこ}し {高|たか}く {掲|かか}げた 。', 'Ren raised the lamp a little higher.') },
    ],
    suzu: [
      { id: 'seat', jp: '{主役|しゅやく} じゃ なくて いい 。 {客席|きゃくせき} を {一|ひと}つ {取|と}って おいて 。', en: 'I don\'t need to be the lead. Just keep me a seat.', resp: J('スズ は 、 {一番|いちばん} {前|まえ} の {席|せき} を {約束|やくそく} した 。', 'Suzu promised you a seat in the front row.') },
      { id: 'onstage', jp: 'スズ も 、 {語|かた}り{手|て} じゃ なくて {登場人物|とうじょうじんぶつ} に なって 。', en: 'Put yourself in the play too — not just as the narrator.', resp: J('スズ は 、 {自分|じぶん} の {台詞|せりふ} を {一|ひと}つ {書|か}く と {言|い}った 。', 'Suzu said she would write herself one line.') },
      { id: 'quiet', jp: '（ {黙|だま}って {笑|わら}う ）', en: '(Just smile.)', resp: J('スズ も 、 {台詞|せりふ} なし で {笑|わら}った 。', 'Suzu smiled back, no lines needed.') },
    ],
  };
  const MEMO_TITLE = {
    ending: { nao: J('{橋|はし} の {上|うえ} で', 'On the bridge at sundown'), mio: J('{水曜|すいよう} の {札|ふだ}', 'The Wednesday sign'), ren: J('{二|ふた}つ の {灯|ひ}', 'Two lamps'), suzu: J('{最後|さいご} の {台詞|せりふ}', 'The last line') },
    retro: J('{言|い}いそびれて いた {話|はなし}', 'A Conversation We Still Owe Ourselves'),
    unfinished: J('{途中|とちゅう} だった {話|はなし}', 'An Unfinished Conversation'),
    p1: J('{何|なに} を {残|のこ}そう か', 'What Shall We Keep?'),
    p2: J('{残|のこ}したい {一瞬|いっしゅん}', 'A Moment Worth Keeping'),
    p3: J('{本当|ほんとう} の {場所|ばしょ} に {置|お}く', 'Put It Somewhere Real'),
  };
  const RET = {
    complete: J('{道|みち} の {終|お}わり まで {歩|ある}いて 、 {帰|かえ}った', 'Walked to the road\'s end and came home'),
    early: J('{野営地|やえいち} から {引|ひ}き{返|かえ}した', 'Turned back from the camp'),
    defeat: J('{道|みち} が {折|お}り{畳|たた}まれ 、 {灯|あか}り{堂|どう} に {戻|もど}された', 'The road folded up and set us down in the Lantern Hall'),
    folded: J('{道|みち} が {見|み}つからなく なり 、 {灯|あか}り{堂|どう} に {戻|もど}った', 'The road could not be found again; we were back in the Lantern Hall'),
  };

  // ---- small helpers ------------------------------------------------------------------------------
  const G = () => RB.game && RB.game.s;
  const comp = (s) => (s && s.comp && COMPS.indexOf(s.comp) >= 0 ? s.comp : null);
  const co = (s) => s.company || (s.company = RB.state.newCampaign().company);
  const mem = (s, id) => !!(s.company && s.company.memories.some((m) => m.id === id));
  const memOf = (s, id) => (s.company && s.company.memories.find((m) => m.id === id)) || null;
  const pqDone = (s, c) => { const q = s.quests && s.quests[PQ[c]]; return !!(q && q.done); };
  const onAtlas = (s) => typeof s.map === 'string' && s.map.indexOf('atlas.') === 0;
  const liveRun = (s) => (s.atlas && s.atlas.run) || null;
  function petNow(s) {
    const c = s.company || {};
    const sp = c.pet, p = sp && c.pets && c.pets[sp];
    return p ? { species: sp, name: p.name || null } : null;
  }
  // A pet that is truly active and shown in the world (pets worker: RB.pets.visible).
  function petVisible(s) {
    try { return !!(RB.pets && RB.pets.visible && s.company && s.company.pet && RB.pets.visible(s, 'world')); } catch (e) { return false; }
  }

  // The project belongs to the companion who accepted it (the committed one).
  function state(s) {
    const p = s && s.company && s.company.project;
    return p && p.comp && p.comp === comp(s) ? p : null;
  }
  function endingRec(s) {
    const c = comp(s);
    return c ? memOf(s, 'ending:' + c) || memOf(s, 'ending_retro:' + c) : null;
  }
  const endingHad = (s) => !!endingRec(s);
  // A save that finished the story before this passage existed (§10.4).
  const needRetro = (s) => !!(s && s.flags && s.flags.postgame && comp(s) && !endingHad(s));
  // The personal quest was open at the ending and has since been resolved.
  function needUnfinished(s) {
    const c = comp(s), r = endingRec(s);
    return !!(c && r && r.pq === false && pqDone(s, c) && !mem(s, 'unfinished:' + c));
  }
  const offerOpen = (s) => !!(s && s.flags && s.flags.postgame && comp(s) && endingHad(s) && !state(s));
  // Page II evidence has come home: the outing it came from is over.
  function returned(s) {
    const p = state(s), ev = p && p.ev;
    if (!ev) return false;
    if (ev.ret) return true;
    const run = liveRun(s);
    return !(run && run.id === ev.run);
  }
  const retOf = (s) => { const p = state(s); return p && p.ev ? p.ev.ret || (returned(s) ? 'folded' : null) : null; };
  function campOpen(s) {
    const p = state(s), run = liveRun(s);
    return !!(p && p.stage === 1 && p.ev && run && p.ev.run === run.id && p.ev.campAsk !== run.id && onAtlas(s));
  }
  const home2Open = (s) => { const p = state(s); return !!(p && p.stage === 1 && p.ev && returned(s)); };
  const home3Open = (s) => { const p = state(s); return !!(p && p.stage === 2 && returned(s)); };
  const done = (s) => { const p = state(s); return !!(p && p.stage >= 3); };
  function roadCampOpen(s) {
    const p = state(s), run = liveRun(s);
    return !!(p && p.stage >= 3 && run && onAtlas(s) && (p.road || {}).camp !== run.id);
  }
  function roadHomeOpen(s) {
    const p = state(s);
    const r = p && p.road;
    return !!(p && p.stage >= 3 && r && r.lastEnd && r.home !== r.lastEnd && !liveRun(s));
  }

  // ---- commits (authoritative first; the scene speaks afterwards) ------------------------------
  function award(s, id, pts) { try { return RB.company.award(s, id, pts); } catch (e) { return false; } }
  function memory(s, m) { try { return RB.company.memory(s, m); } catch (e) { return false; } }

  // Page I: accept the project with a theme. Creates the record once.
  function accept(s, theme) {
    const c = comp(s);
    if (!c || state(s) || !PROJECT[c].themes[theme] || !offerOpen(s)) return false;
    co(s).project = { v: 1, comp: c, stage: 1, theme, t1: Date.now(), ev: null, road: {} };
    award(s, 'project:1', 1);
    const P = PROJECT[c];
    memory(s, { id: 'pages:1', kind: 'reflections', title: MEMO_TITLE.p1,
      text: J(P.title.jp + ' ── ' + P.themes[theme].jp + ' 。', P.title.en + ': you agreed to keep a page together — ' + P.themes[theme].en.toLowerCase() + '.'), ref: 'pages' });
    return true;
  }

  // Page II evidence: the first qualifying event of an outing after Page I.
  // A correctly assisted objective counts; nothing is required to be perfect.
  function describe(ev) {
    const A = (C.atlas || {});
    const k = ev.kind, pat = ev.pattern;
    if (k === 'inscription') {
      if (pat === 'threshold') return [J('{書|か}きかけ の {門|もん} に 、 {欠|か}けた {言葉|ことば} を {戻|もど}した', 'put the missing word back into the half-written gate'), J('{書|か}きかけ の {門|もん} の {言葉|ことば}', 'The word in the half-written gate')];
      if (pat === 'stacks') return [J('{題|だい} の ない {棚|たな} に 、 {言葉|ことば} を {一|ひと}つ {戻|もど}した', 'gave a word back to the shelves without titles'), J('{題|だい} の ない {棚|たな}', 'The shelves without titles')];
      if (pat === 'margin') return [J('{紙|かみ} の {余白|よはく} に 、 {言葉|ことば} を {一|ひと}つ {戻|もど}した', 'put a word back into the margins'), J('{余白|よはく} の {言葉|ことば}', 'A word in the margins')];
      return [J('{刻|きざ}まれた {言葉|ことば} を {一|ひと}つ {戻|もど}した', 'restored a carved word'), J('{刻|きざ}まれた {言葉|ことば}', 'A carved word')];
    }
    if (k === 'lanterns') return [J('{白|しろ}い {灯籠|とうろう} に {言葉|ことば} を {戻|もど}して 、 {灯|ひ} を ともした', 'gave the blank lanterns back their words and lit them'), J('{白|しろ}い {灯籠|とうろう} の {列|れつ}', 'The row of blank lanterns')];
    if (k === 'sign') {
      if (pat === 'crossing') return [J('{橋|はし} の {立|た}て{札|ふだ} を {並|なら}べ{直|なお}して 、 {板|いた} を {呼|よ}び{戻|もど}した', 'put the bridge sign back in order, and the planks came back'), J('{途中|とちゅう} で {終|お}わる {橋|はし}', 'The unfinished bridge')];
      if (pat === 'tide') return [J('{潮|しお} の {階段|かいだん} の {立|た}て{札|ふだ} を {並|なら}べ{直|なお}した', 'put the sign on the tidal stair back in order'), J('{潮|しお} の {階段|かいだん}', 'The tidal stair')];
      return [J('ばらばら の {立|た}て{札|ふだ} を {並|なら}べ{直|なお}した', 'put a scattered road sign back in order'), J('{立|た}て{札|ふだ}', 'A road sign')];
    }
    if (k === 'promise') return [J('{持|も}ち{主|ぬし} から {離|はな}れた {約束|やくそく} を 、 {正|ただ}しく {読|よ}んだ', 'read what a loose promise really committed someone to'), J('{持|も}ち{主|ぬし} の いない {約束|やくそく}', 'A promise with no one to keep it')];
    if (k === 'name') {
      const nd = A.names && A.names[ev.name];
      const t = nd ? nd.title : J('{迷子|まいご} の {名前|なまえ}', 'A lost name');
      return [J('「 ' + t.jp + ' 」 と いう {名前|なまえ} に 、 {帰|かえ}る {場所|ばしょ} を {思|おも}い{出|だ}して もらった', 'helped "' + t.en + '" remember where it belonged'), t];
    }
    if (k === 'doors') {
      return [ev.read ? J('{石板|せきばん} を {読|よ}んで 、 {三|みっ}つ の {扉|とびら} から {正|ただ}しい {一|ひと}つ を {選|えら}んだ', 'read the tablet and chose the right one of three doors')
        : J('{三|みっ}つ の {扉|とびら} から 、 {先|さき} へ {続|つづ}く {一|ひと}つ を {見|み}つけた', 'found the one of three doors that went on'), J('{三|みっ}つ の {扉|とびら}', 'The hall of three doors')];
    }
    if (k === 'guardian') return [J('{白紙|はくし} の {道|みち} を ふさいで いた もの を 、 {落|お}ち{着|つ}かせた', 'settled what was blocking the unwritten road'), J('{道|みち} を ふさいで いた もの', 'What blocked the road')];
    if (k === 'climax') {
      const cd = A.climaxes && A.climaxes[ev.boss];
      const t = cd ? cd.name : J('{道|みち} の {終|お}わり を {守|まも}る {者|もの}', 'The keeper of the road\'s end');
      return [J('{道|みち} の {終|お}わり で 、 「 ' + t.jp + ' 」 と {向|む}き{合|あ}った', 'faced "' + t.en + '" at the road\'s end'), t];
    }
    return [J('{道|みち} の {上|うえ} で 、 {一|ひと}つ {書|か}き{直|なお}した', 'mended one thing on the road'), J('{道|みち} の {上|うえ} の こと', 'Something on the road')];
  }
  const QUALIFY = ['inscription', 'lanterns', 'sign', 'promise', 'name', 'doors', 'guardian', 'climax'];
  function capture(s, e) {
    const p = state(s);
    if (!p || p.stage !== 1 || p.ev || !e || QUALIFY.indexOf(e.kind) < 0) return false;
    const run = liveRun(s);
    if (!run || run.id !== e.run) return false;
    const [desc, title] = describe(e);
    const A = C.atlas || {};
    p.ev = {
      run: run.id, id: String(e.id || e.kind), kind: e.kind, desc, title, room: e.room || null,
      branch: e.branch && A.branchTypes && A.branchTypes[e.branch] ? e.branch : null,
      mods: (run.mods || []).slice(), pet: petNow(s), t: Date.now(), ret: null,
    };
    run.pages = { ev: p.ev.id }; // a temporary reference only; the summary lives above
    return true;
  }
  // An outing ended (atlas:end). Record how it came home, or that it had nothing to keep.
  function runEnded(s, e) {
    const p = state(s);
    if (!p || !e || !e.run) return;
    const kind = { complete: 'complete', early: 'early', defeat: 'defeat' }[e.kind] || 'folded';
    if (p.ev && p.ev.run === e.run && !p.ev.ret) p.ev.ret = kind;
    else if (p.stage === 1 && !p.ev) p.lastEmpty = e.run;
    p.road = p.road || {};
    p.road.lastEnd = e.run;
    p.road.lastKind = kind;
  }
  function page2(s, aspect, where) {
    const p = state(s), c = comp(s);
    if (!p || p.stage !== 1 || !p.ev || !PROJECT[c].aspects[aspect]) return false;
    if (where === 'home' ? !returned(s) : !campOpen(s)) return false;
    if (where === 'home' && !p.ev.ret) p.ev.ret = 'folded';
    p.stage = 2; p.aspect = aspect; p.where = where === 'home' ? 'home' : 'camp'; p.t2 = Date.now();
    award(s, 'project:2', 1);
    memory(s, { id: 'pages:2', kind: 'reflections', title: MEMO_TITLE.p2,
      text: J(p.ev.title.jp + ' ── ' + PROJECT[c].aspects[aspect].jp + ' 。', 'On the unwritten road you ' + p.ev.desc.en + '. To keep: ' + PROJECT[c].aspects[aspect].en.toLowerCase() + '.'), ref: 'pages' });
    return true;
  }
  function page3(s, ci) {
    const p = state(s), c = comp(s);
    const caps = p && PROJECT[c].captions[p.theme];
    if (!p || p.stage !== 2 || !returned(s) || !caps || !caps[ci]) return false;
    if (!p.ev.ret) p.ev.ret = 'folded';
    p.stage = 3; p.caption = ci; p.t3 = Date.now();
    p.road = p.road || {};
    if (p.road.lastEnd) p.road.home = p.road.lastEnd; // this homecoming's conversation was the page itself
    RB.discovery.keepsake(s, PROJECT[c].memento, 'pages');
    award(s, 'project:3', 1);
    memory(s, { id: 'pages:3', kind: 'reflections', title: MEMO_TITLE.p3,
      text: J('「 ' + caps[ci].jp + ' 」 ── ' + PROJECT[c].place.jp + ' に {貼|は}った 。', '"' + caps[ci].en + '" — pinned up on ' + PROJECT[c].place.en + '.'), ref: 'pages', keepsake: PROJECT[c].memento });
    return true;
  }
  // The ending passage (fresh) or its retrospective (older postgame saves).
  const pick = { last: null, reply: null };
  function endingDone(s, retro) {
    const c = comp(s);
    if (!c) return false;
    if (retro && !needRetro(s)) return false;
    const rep = REPLY[c].find((r) => r.id === pick.reply) || null;
    const id = (retro ? 'ending_retro:' : 'ending:') + c;
    if (!retro && mem(s, 'ending_retro:' + c)) return false;
    const pet = petVisible(s) ? petNow(s) : null;
    const ok = memory(s, { id, kind: 'reflections', title: retro ? MEMO_TITLE.retro : MEMO_TITLE.ending[c],
      text: rep ? J('「 ' + rep.jp + ' 」', 'You said: "' + rep.en + '"') : J('{言葉|ことば} は なかった 。 それ で よかった 。', 'Few words were needed.'),
      reply: rep ? rep.resp : null, replyId: rep ? rep.id : null, pq: pqDone(s, c), retro: !!retro, petSeen: pet ? pet.species : null });
    award(s, 'ending', 2);
    pick.reply = null;
    if (retro) freshTalk = true;
    return ok;
  }
  function unfinishedDone(s) {
    const c = comp(s);
    if (!needUnfinished(s)) return false;
    freshTalk = true;
    return memory(s, { id: 'unfinished:' + c, kind: 'reflections', title: MEMO_TITLE.unfinished,
      text: c === 'nao' ? J('ウミ へ の {手紙|てがみ} は 、 {届|とど}いた 。', 'The letter for Umi was delivered, after all.') : J('ミオ は 、 {自分|じぶん} の {声|こえ} で {断|ことわ}った 。', 'Mio said no, in her own voice.') });
  }

  // ---- what is waiting to be talked about, here -----------------------------------------------
  // where: 'hall' (the Atlas hub), 'safe' (any other ordinary map), 'atlas'.
  function whereOf(s) { return onAtlas(s) ? 'atlas' : s.map === 'rw.hall' ? 'hall' : 'safe'; }
  function pending(s, where) {
    if (!s || !comp(s)) return null;
    where = where || whereOf(s);
    if (where === 'atlas') return null;
    if (needRetro(s)) return { id: 'retro', scene: 'pages.retro', en: 'A conversation you still owe each other' };
    if (needUnfinished(s)) return { id: 'unfinished', scene: 'pages.unfinished', en: 'An unfinished conversation' };
    if (where !== 'hall') return null;
    if (offerOpen(s)) return { id: 'offer', scene: 'pages.offer', en: 'The Pages We Keep: what shall we keep?' };
    if (home2Open(s)) return { id: 'home2', scene: 'pages.home2', en: 'The Pages We Keep: the moment worth keeping' };
    if (home3Open(s)) return { id: 'home3', scene: 'pages.home3', en: 'The Pages We Keep: put it somewhere real' };
    if (roadHomeOpen(s)) return { id: 'road', scene: 'pages.road.home', en: 'Talk about this road' };
    return null;
  }

  // ---- condition heads for the scenes -----------------------------------------------------------
  //   pages.retro / .unfinished / .offer / .camp / .home2 / .home3 / .empty / .roadcamp / .roadhome / .done
  //   pages.stage>=2   pages.theme=next   pages.aspect=read   pages.caption=0   pages.ret=early
  //   pages.pick=walk  (the last choice presented by a hook)   pages.recall (a shared memory to recall)
  //   pages.at=camp|home   pages.evpet (a pet was with you at the event)   pages.retrotalk (this passage is the retrospective)
  //   pages.fresh (one of these talks just happened here)   pages.reply=walk (the ending reply recorded)
  //   pages.completed>=1 (expeditions walked to the end)   pages.keeps>=1 (roadside keepsakes, not these pages)
  //   petvis / petvis=cat  (an active pet is shown in the world)
  let justEmpty = null; // the outing that just came home with nothing to keep (this homecoming only)
  let retroTalk = false; // the passage being played is the retrospective one
  let freshTalk = false; // one of these conversations just happened here (no second offer straight after)
  // This map was entered after Tsuru's Atlas introduction. False on the visit the story ends on,
  // so Page I is not stacked straight onto the ending and the introduction; it waits for the next
  // time you come into the Lantern Hall (or for you to talk to your companion).
  let settled = true;
  RB.state.addTerm('pages', (s, rest, op, val, num, cmp) => {
    const p = state(s);
    switch (rest) {
      case 'retro': return needRetro(s);
      case 'unfinished': return needUnfinished(s);
      case 'offer': return offerOpen(s);
      case 'camp': return campOpen(s);
      case 'home2': return home2Open(s);
      case 'home3': return home3Open(s);
      case 'empty': return !!(p && p.stage === 1 && !p.ev && justEmpty && p.lastEmpty === justEmpty);
      case 'roadcamp': return roadCampOpen(s);
      case 'roadhome': return roadHomeOpen(s);
      case 'done': return done(s);
      case 'recall': return !!recallable(s);
      case 'retrotalk': return retroTalk;
      case 'fresh': return freshTalk;
      case 'settled': return settled;
      case 'reply': { const r = endingRec(s); return cmp((r && r.replyId) || 'none', op || '=', val); }
      case 'completed': return cmp((s.atlas && s.atlas.completed) || 0, op || '>=', num(val));
      case 'keeps': return cmp(Object.keys((s.discovery && s.discovery.keepsakes) || {}).filter((k) => k.indexOf('pages_') !== 0).length, op || '>=', num(val));
      case 'evpet': return !!(p && p.ev && p.ev.pet);
      case 'stage': return cmp(p ? p.stage : 0, op || '>=', num(val));
      case 'theme': return !!p && cmp(p.theme, op || '=', val);
      case 'aspect': return !!p && cmp(p.aspect, op || '=', val);
      case 'caption': return !!p && cmp(p.caption, op || '=', num(val));
      case 'ret': return cmp(retOf(s) || 'none', op || '=', val);
      case 'where': return !!p && cmp(p.where || 'none', op || '=', val);
      case 'pick': return cmp(pick.last || 'none', op || '=', val);
      case 'at': return cmp(onAtlas(s) ? 'camp' : 'home', op || '=', val);
      default: return false;
    }
  });
  RB.state.addTerm('petvis', (s, rest, op, val) => petVisible(s) && (!op || (op === '=' ? s.company.pet === val : s.company.pet !== val)));

  // ---- recalling one actual shared event (§10.2.1) -----------------------------------------------
  // Only memories this companion shared, with a Japanese title to say; never
  // this passage's own records. Discoveries first, then time together,
  // reflections and pets; the most recent of the best kind.
  const RANK = { discoveries: 4, together: 3, reflections: 2, pets: 1 };
  function recallable(s) {
    const c = comp(s);
    if (!c || !s.company) return null;
    let best = null;
    for (const m of s.company.memories) {
      if (m.comp && m.comp !== c) continue;
      if (!m.title || !m.title.jp || !RANK[m.kind]) continue;
      if (/^(ending|ending_retro|unfinished|pages):/.test(m.id)) continue;
      if (!best || RANK[m.kind] > RANK[best.kind] || (RANK[m.kind] === RANK[best.kind] && (m.t || 0) >= (best.t || 0))) best = m;
    }
    return best;
  }

  // ---- "Talk about this road" (§11.6): the next topic --------------------------------------------
  // Topics are registered by 40_topics.js: { id, comp, slot, where: 'any'|'camp'|'home', scene }.
  const TOPICS = [];
  function addTopics(list) { for (const t of list) TOPICS.push(t); }
  const ORDER = ['h1', 'r1', 'o1', 'h2', 'r2', 'o2', 'h3', 'r3', 'o3', 'h4', 'r4', 'o4'];
  // A topic is heard once per true state ("variant": e.g. with or without a
  // pet, before or after a road was walked to its end); a changed fact may
  // bring its slot back, but never one of the last four topics heard.
  const variantOf = (s, t) => (t.variant ? String(t.variant(s)) : 'base');
  function topic(s, where) {
    const c = comp(s), p = state(s);
    if (!c || !p || p.stage < 3) return null;
    const talk = co(s).talk;
    const recent = ((p.road || {}).recent || []);
    const mine = TOPICS.filter((t) => t.comp === c && (t.where === 'any' || t.where === where))
      .sort((a, b) => ORDER.indexOf(a.slot) - ORDER.indexOf(b.slot));
    const heard = (t) => { const h = talk['road:' + t.id]; return !!h && (h.variants ? h.variants.indexOf(variantOf(s, t)) >= 0 : h.variant === variantOf(s, t)); };
    const fresh = mine.find((t) => !talk['road:' + t.id] && recent.indexOf(t.id) < 0 && (!t.when || RB.state.test(s, t.when))) ||
      mine.find((t) => !heard(t) && recent.indexOf(t.id) < 0 && (!t.when || RB.state.test(s, t.when)));
    return fresh || null; // none left: a brief ordinary line (road.<c>.quiet)
  }
  function topicHeard(s, t, where) {
    const p = state(s);
    if (!p || !t) return;
    const talk = co(s).talk;
    const v = variantOf(s, t), prev = talk['road:' + t.id];
    const vs = prev && prev.variants ? prev.variants.slice() : prev ? [prev.variant] : [];
    if (vs.indexOf(v) < 0) vs.push(v);
    talk['road:' + t.id] = { t: Date.now(), variant: v, variants: vs };
    p.road = p.road || {};
    p.road.recent = [t.id].concat((p.road.recent || []).filter((x) => x !== t.id)).slice(0, 4);
    markRoad(s, where);
  }
  function markRoad(s, where) {
    const p = state(s);
    if (!p) return;
    p.road = p.road || {};
    const run = liveRun(s);
    if (where === 'camp' && run) p.road.camp = run.id;
    if (where === 'home') p.road.home = p.road.lastEnd || null;
  }

  // ---- hooks ---------------------------------------------------------------------------------------
  const H = RB.hooks;
  async function say(who, line, expr) {
    const s = G();
    if (who === 'comp') who = comp(s) || 'narr';
    await RB.ui.dialogue.say({ who, expr: expr || null, jp: line.jp, en: line.en });
  }
  async function choose(opts) {
    const s = G();
    const i = await RB.ui.dialogue.choose(opts.map((o) => ({ jp: o.jp, en: o.en })));
    const o = opts[Math.max(0, Math.min(opts.length - 1, i | 0))];
    if (s) s.backlog.push({ who: 'pc', jp: o.jp, en: o.en, choice: true });
    return o;
  }
  // !hook pages_choose theme|aspect|caption|reply — present authored options,
  // commit the choice, and leave it in `pages.pick` for the lines that follow.
  H.pages_choose = async (args) => {
    const s = G(), c = comp(s);
    pick.last = null;
    if (!s || !c) return;
    const P = PROJECT[c], what = args[0], where = args[1] || 'camp';
    const p = state(s);
    let opts = [];
    if (what === 'theme') opts = Object.keys(P.themes).map((k) => Object.assign({ id: k }, P.themes[k])).concat([Object.assign({ id: 'later' }, LATER.theme)]);
    else if (what === 'aspect') opts = Object.keys(P.aspects).map((k) => Object.assign({ id: k }, P.aspects[k])).concat([Object.assign({ id: 'later' }, where === 'home' ? LATER.caption : LATER.aspect)]);
    else if (what === 'caption' && p) opts = P.captions[p.theme].map((x, i) => Object.assign({ id: String(i) }, x)).concat([Object.assign({ id: 'later' }, LATER.caption)]);
    else if (what === 'reply') opts = REPLY[c].slice();
    if (!opts.length) return;
    const o = await choose(opts);
    pick.last = o.id;
    if (what === 'theme' && o.id !== 'later') accept(s, o.id);
    else if (what === 'aspect' && o.id !== 'later') page2(s, o.id, where);
    else if (what === 'aspect' && o.id === 'later' && where !== 'home' && p && p.ev) p.ev.campAsk = (liveRun(s) || {}).id || null;
    else if (what === 'caption' && o.id !== 'later') page3(s, +o.id);
    else if (what === 'reply') pick.reply = o.id;
  };
  // !hook pages_event camp|home — the narrator names the recorded moment.
  H.pages_event = async (args) => {
    const s = G(), p = state(s);
    if (!p || !p.ev) return;
    const here = args[0] === 'home';
    const fromThis = !here && liveRun(s) && liveRun(s).id === p.ev.run;
    const lead = fromThis ? J('{今日|きょう} 、 {二人|ふたり} は ', 'Today, the two of you ') : J('あの {道|みち} で 、 {二人|ふたり} は ', 'On that road, the two of you ');
    await say('narr', J(lead.jp + p.ev.desc.jp + ' 。', lead.en + p.ev.desc.en + '.'));
  };
  // !hook pages_recall — the companion recalls one recorded shared moment by its title.
  const RECALL = {
    nao: { lead: (t) => J('「 ' + t.jp + ' 」 。 …… {覚|おぼ}えてる か ？', '"' + t.en + '." …Remember?'),
      discoveries: J('あれ は 、 {二人|ふたり} で {出|だ}した {答|こた}え だ 。 {宛名|あてな} の {控|ひか}え より 、 よっぽど {残|のこ}る 。', 'We worked that one out together. It sticks better than any copied address.'),
      together: J('ああ いう {日|ひ} の ため に 、 {鞄|かばん} を {重|おも}く して {歩|ある}いてる んだ と {思|おも}う 。', 'I think days like that are why I carry such a heavy bag.'),
      reflections: J('あの {時|とき} {話|はな}した こと 、 {今|いま} でも {時々|ときどき} {考|かんが}える 。', 'I still think about what we said then, now and again.'),
      pets: J('あいつ に {会|あ}った {日|ひ} だ 。 {道|みち} の {連|つ}れ が 、 {一匹|いっぴき} {増|ふ}えた 。', 'The day we met that one. One more on the road with us.') },
    mio: { lead: (t) => J('「 ' + t.jp + ' 」 …… {覚|おぼ}えてる ？', '"' + t.en + '"… Do you remember?'),
      discoveries: J('あの {時|とき} 、 {一人|ひとり} だったら {諦|あきら}めて いた と {思|おも}う 。 {二人|ふたり} だった から 、 {落|お}ち{着|つ}いて {考|かんが}えられた 。', 'On my own, I think I\'d have given up. With two of us, I could think calmly.'),
      together: J('ああ いう {時間|じかん} が ある と 、 {長|なが}い {道|みち} も {平気|へいき} に なる の 。', 'With times like that, even a long road is all right.'),
      reflections: J('あの {時|とき} の {話|はなし} 、 {帳面|ちょうめん} の {一番|いちばん} {後|うし}ろ に {書|か}いて ある の 。', 'I wrote down what we talked about then, at the very back of my notebook.'),
      pets: J('あの {子|こ} に {会|あ}った {日|ひ} 。 {包帯|ほうたい} より 、 {撫|な}でる {手|て} が {役|やく} に {立|た}った 。', 'The day we met that little one. A hand to pet it did more good than any bandage.') },
    ren: { lead: (t) => J('「 ' + t.jp + ' 」 。 {記録|きろく} に 、 そう {書|か}いて あります 。', '"' + t.en + '." That\'s how I recorded it.'),
      discoveries: J('あの {答|こた}え は 、 {二人|ふたり} で {読|よ}んで {出|で}た もの です 。 {方角|ほうがく} だけ は 、 あなた の {手柄|てがら} です が 。', 'We read that answer out together. The directions were entirely your doing, though.'),
      together: J('{灯守|ひもり} の {記録|きろく} に 、 {書|か}く {必要|ひつよう} の ない こと です 。 でも 、 {書|か}きました 。', 'Nothing a lantern keeper\'s record needs. I wrote it down anyway.'),
      reflections: J('あの {時|とき} の {言葉|ことば} は 、 {一字|いちじ} も {書|か}き{直|なお}して いません 。', 'I haven\'t rewritten a single word of what we said then.'),
      pets: J('{小|ちい}さな {連|つ}れ に {会|あ}った {日|ひ} です 。 あの {子|こ} の {方|ほう} が 、 わたし より {道|みち} を {知|し}って います 。', 'The day we met our small companion. It knows the roads better than I do.') },
    suzu: { lead: (t) => J('「 ' + t.jp + ' 」 。 …… {題|だい} を つける なら 、 そう なる かな 。', '"' + t.en + '." …If I had to give it a title, that\'s the one.'),
      discoveries: J('あれ は 、 {台本|だいほん} なし で うまく いった {場面|ばめん} 。 {二人|ふたり} で ね 。', 'That scene worked with no script at all. Both of us.'),
      together: J('{客席|きゃくせき} の ない {場面|ばめん} だった けど 、 わたし の {帳簿|ちょうぼ} で は {大入|おおい}り 。', 'No audience for that one, but in my ledger it was a full house.'),
      reflections: J('あの {時|とき} は 、 {冗談|じょうだん} で {逃|に}げなかった 。 {珍|めずら}しい でしょ 。', 'I didn\'t hide behind a joke that time. Rare, right?'),
      pets: J('あの {子|こ} が {仲間|なかま} に なった {日|ひ} ！ {配役|はいやく} が {一人|ひとり} {増|ふ}えた 。', 'The day that little one joined the company! One more in the cast.') },
  };
  H.pages_recall = async () => {
    const s = G(), c = comp(s), m = recallable(s);
    if (!c || !m) return;
    const R = RECALL[c];
    await say(c, R.lead(m.title), 'think');
    await say(c, R[m.kind] || R.together, 'smile');
  };
  // !hook pages_end_done [retro] — the passage is complete: +2 bond and a Reflections memory, once.
  H.pages_end_done = async (args) => { const s = G(); if (s) endingDone(s, args[0] === 'retro'); retroTalk = false; };
  H.pages_retro_begin = async () => { retroTalk = true; };
  H.pages_unfinished_done = async () => { const s = G(); if (s) unfinishedDone(s); };
  // !hook pages_topic camp|home — play the next topic (or a brief ordinary line).
  H.pages_topic = async (args) => {
    const s = G(), c = comp(s), where = args[0] === 'home' ? 'home' : 'camp';
    if (!s || !c || !state(s)) return;
    const t = topic(s, where);
    if (t) { topicHeard(s, t, where); await RB.script.run(t.scene); return; }
    const p = state(s);
    p.road = p.road || {};
    const q = ((p.road.quiet || 0) % 3) + 1;
    p.road.quiet = q;
    markRoad(s, where);
    await RB.script.run('road.' + c + '.quiet' + q);
  };

  // ---- the Atlas tells us what happened (src/atlas/50_run.js emits these) ---------------------
  RB.bus.on('atlas:event', (e) => { try { const s = G(); if (s) capture(s, e); } catch (err) { if (typeof console !== 'undefined') console.warn('pages: capture', err); } });
  RB.bus.on('atlas:end', (e) => {
    try {
      const s = G();
      if (!s) return;
      const p = state(s);
      const empty = p && p.stage === 1 && !p.ev;
      runEnded(s, e);
      justEmpty = empty ? e.run : null;
    } catch (err) { if (typeof console !== 'undefined') console.warn('pages: end', err); }
  });
  RB.bus.on('map:enter', (e) => {
    freshTalk = false; retroTalk = false;
    if (e && e.id !== 'rw.hall') justEmpty = null;
    const s = G();
    settled = !!(s && s.seen && s.seen['rw.atlas_intro']);
  });

  // ---- talking to your companion: a waiting conversation comes first -------------------------
  // (the ordinary banter is RB.game.companionTalk; anything else passes through)
  if (RB.game && RB.game.companionTalk) {
    const base = RB.game.companionTalk;
    RB.game.companionTalk = function () {
      const s = G();
      const pd = s && pending(s);
      if (pd && RB.content.scenes[pd.scene]) return RB.script.run(pd.scene);
      return base.apply(this, arguments);
    };
  }

  return {
    COMPS, PQ, PROJECT, REPLY, RET, MEMO_TITLE, TOPICS,
    state, pending, capture, runEnded, accept, page2, page3, endingDone, unfinishedDone,
    needRetro, needUnfinished, offerOpen, returned, retOf, campOpen, home2Open, home3Open, roadCampOpen, roadHomeOpen,
    recallable, describe, addTopics, topic, topicHeard, petVisible, pqDone,
    _pick: pick,
  };
})();
