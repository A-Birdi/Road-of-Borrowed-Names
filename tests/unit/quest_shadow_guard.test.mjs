// A side quest shadowed in a talk list (Cloud CC-151 §2, CC-367 §3-4, CC-386; Local CL-514, CL-515; Agnes 6541203705):
// a person's list takes the first option whose condition holds, so an option for a later state of the story (post,
// postgame, a chapter's *_done) placed before the one that moves an open side quest on keeps that quest from moving
// on. This is the ratchet Agnes agreed: a screen of every talk list, each finding either fixed or listed below by its
// quest, its list, the shadowing option, the option it hides and the stages it holds, with the reason; a new finding
// fails, and so does a listed one that is no longer found. It is a heuristic for shadowed progress only: it does not
// prove that a quest's prerequisites can be reached (kr_fox's register was unreachable, not shadowed) or that every
// quest is covered.
//
// The screen, for every talk list (a list shared by a person's routine places counted once) and every side quest X
// that an option's scene moves on (`!quest X <stage|done>`, directly or through `!call`), for each stage k that X can
// be at while open (0 … its last), and each way that option's condition can hold at k (each of its a&b&… branches):
//  - an earlier option counts only by the branches that can hold alongside it: not one with a term the other denies
//    (f against !f), nor one naming the companion otherwise (comp=nao against comp=rin);
//  - such an earlier branch takes X at k when it names X in a way that holds at k (quest.X=1 takes stage 1 only;
//    quest.X=done or !quest.X never takes an open quest; quest.X and quest.X=active take every stage);
//  - it shadows X at k when it can hold at k, it names a later state of the story as holding (post, kr_done; not
//    !post), and it is not a one-shot (!seen.…, !keepsake.…);
//  - X is shadowed at k when a shadowing option comes before any that takes it.
// Conditions are read as the state test reads them (src/engine/05_state.js: a|b of a&b&…, with ! on a term); only X's
// own terms are evaluated, and of the rest only the two clashes above are read: anything else is taken as able to
// hold, so a finding can still be one that the story never reaches (the triage says which).
//  1. the screen itself, on small made-up lists: a done-only entry, a one-shot, a move made directly and through
//     !call, a list shared by routine places, an entry for one stage and not another, an open quest's own entry first,
//     a shadow that cannot hold while the quest is open, an earlier entry that cannot hold alongside (by a denied term,
//     by another companion) and one that can, a one-shot in one branch only, and an earlier state of the story;
//  2. the game's own lists: every finding is listed below, and every listed one is still found.
import { load } from '../lib/load.mjs';

// a later state of the story, named as holding (`post`, `kr_done`; `!post` is an earlier one); a one-shot (`!seen.…`)
const LATE = /^(post|postgame|ch[1-6]_done|kr_done|mb1_done|mb2_done|yn_done|el_done|ko_done|cr_done|sa_done)$/;
const ONE_SHOT = /^!(seen|keepsake)\./;

// what a scene does to each quest, directly or through !call: quest id -> the set of stages it sets ('1', 'done', …)
function movesOf(scenes, id, memo = {}, seen = new Set()) {
  if (memo[id]) return memo[id];
  const out = {};
  if (seen.has(id)) return out;
  seen.add(id);
  const sc = scenes[id];
  if (!sc) return out;
  for (const c of sc.cmds || []) {
    if (c.op === 'quest' && c.args[1] !== undefined && c.args[1] !== 'start' && c.args[1] !== '0') (out[c.args[0]] = out[c.args[0]] || new Set()).add(c.args[1]);
    if (c.op === 'call') { const sub = movesOf(scenes, c.args[0], memo, seen); for (const q in sub) for (const v of sub[q]) (out[q] = out[q] || new Set()).add(v); }
  }
  return (memo[id] = out);
}
// a condition as the state test reads it (src/engine/05_state.js): its conjunctions, each a list of terms
const conjs = (cond) => (cond ? String(cond).split('|') : ['']).map((c) => c.split('&').map((x) => x.trim()).filter(Boolean));
// a term's base and sense: '!x' is not x, '!!x' is x
const sense = (x) => { const m = x.match(/^(!*)(.*)$/); return { base: m[2].trim(), neg: m[1].length % 2 === 1 }; };
const ONE_VALUE = /^(comp|prov|party)=(\w+)$/;
// two conjunctions that cannot hold together: a term and its negation, or one companion named two ways
function clash(a, b) {
  const A = a.map(sense), B = b.map(sense);
  return A.some((x) => B.some((y) => (x.base === y.base && x.neg !== y.neg) ||
    (!x.neg && !y.neg && ONE_VALUE.test(x.base) && ONE_VALUE.test(y.base) && x.base.split('=')[0] === y.base.split('=')[0] && x.base !== y.base)));
}
const late = (c) => c.some((x) => { const v = sense(x); return !v.neg && LATE.test(v.base); });
const oneShot = (c) => c.some((x) => ONE_SHOT.test(x));
// one conjunction with X open at k: can it hold (X's own terms read, the rest taken as able to), and does it name X
function readConj(test, c, q, k) {
  const own = c.filter((x) => new RegExp('^!*quest\\.' + q + '(?![\\w])').test(x));
  const s = { quests: { [q]: { stage: k, done: false } }, flags: {}, inv: {}, vars: {}, seen: {} };
  return { holds: own.every((x) => test(s, x)), takes: own.length > 0 };
}
// every finding: { key, quest, where, by, at, stages, moves }
function screen(test, content) {
  const { maps, scenes, quests } = content;
  const lists = new Map();
  for (const m of Object.keys(maps).sort()) for (const n of maps[m].npcs || []) {
    if (!Array.isArray(n.talk)) continue;
    if (!lists.has(n.talk)) lists.set(n.talk, []);
    lists.get(n.talk).push(m + ':' + n.id);
  }
  const memo = {}, out = [];
  for (const [list, where] of lists) {
    list.forEach((o, i) => {
      const moves = movesOf(scenes, o.scene || '', memo);
      for (const q of Object.keys(moves).sort()) {
        const Q = quests[q];
        if (!Q || /_main$/.test(q) || Q.main) continue;
        const n = Math.max(1, (Q.stages || []).length);
        const held = new Map(); // shadowing option index -> the set of stages
        for (let k = 0; k < n; k++) {
          // each way the option can hold at k, against the earlier options that can hold alongside it
          for (const c of conjs(o.if)) {
            if (!readConj(test, c, q, k).holds) continue;
            for (let j = 0; j < i; j++) {
              const live = conjs(list[j].if).filter((d) => readConj(test, d, q, k).holds && !clash(c, d));
              if (live.some((d) => readConj(test, d, q, k).takes)) break;
              if (live.some((d) => late(d) && !oneShot(d))) { if (!held.has(j)) held.set(j, new Set()); held.get(j).add(k); break; }
            }
          }
        }
        for (const [j, set] of held) {
          const w = where.slice().sort().join(' '), stages = [...set].sort((a, b) => a - b);
          out.push({ key: q + ' | ' + w + ' | ' + list[j].scene + ' before ' + o.scene + ' | stage ' + stages.join(','), quest: q, where: w, by: list[j].scene, at: o.scene, stages, moves: [...moves[q]].sort() });
        }
      }
    });
  }
  return out.sort((a, b) => (a.key < b.key ? -1 : 1));
}

// ---- the game's findings not yet fixed, each with why it stands (CC-367 §3, CC-386; triage open unless said)
const PENDING = 'pending triage (CC-386)';
const LISTED = {
  'co_bell | co.village:co_tamotsu | co.tamotsu_post before co.tamotsu | stage 0,1': PENDING + '; not among CC-367 §3\'s rows, but CC-367 §1 kept his list as it is: after the restoration Gorō\'s talk does not need his rope (unconfirmed)',
  'kr_hisae | kr.lodge:kr_hisae | rt.ren_walk before kr.hisae_truth | stage 1': PENDING + '; CC-367 set it aside as Hisae\'s walk with Ren, once (unconfirmed)',
  'lf_akari | lf.clerks:akari | lf.akari_post before lf.akari_after | stage 0': PENDING + '; CC-367 set it aside: the bell moves it to stage 1 first, and her first entry takes 1 and up (unconfirmed)',
  'lf_form | lf.records:lf_hayato | lf.hayato_post before lf.hayato | stage 0,1': PENDING + '; done only if its challenge can be left mid-scene (CC-367, not checked yet)',
  'lf_nao | lf.ferry:umi | lf.umi_post before lf.nao_umi_first | stage 0': PENDING + '; CC-367 set it aside: Umi\'s first entry takes it once the bell has rung; this is the case before the bell, which an earlier screen missed (unconfirmed)',
  'rw_boots | rw.house1:oto rw.tea:oto_r3 rw.village:oto_r2 | rw.oto_post before rw.oto_sign | stage 0,1': PENDING,
  'rw_founding | rw.village:yasu | xp.cellars_yasu before rw.yasu_first | stage 0': PENDING + '; CC-367 set it aside: Yasu\'s cellars line holds only until heard (unconfirmed)',
  'rw_teahouse | rw.tea:hana | rw.hana_post before rw.hana_rush | stage 0': PENDING,
  'rw_tools | rw.hall:kiku_r3 rw.house2:kiku rw.village:kiku_r2 | rw.kiku_post before rw.kiku_side | stage 0,1,2': PENDING,
  'rw_tools | rw.hall:kiku_r3 rw.house2:kiku rw.village:kiku_r2 | rw.kiku_post before rw.kiku_tally | stage 0,1,2': PENDING,
  'sb_goats | sb.hamlet:tetsuji | sb.tetsuji_post before sb.tetsuji | stage 0,1,2': PENDING,
  'sea_licence | sg.harbor:fuku sg.harbor:fuku_r2 sg.harbor:fuku_r3 | sg.fuku_post before sea.fuku_hull | stage 0': PENDING,
  'sg_cove | sg.harbor:daigo sg.harbor:daigo_r3 sg.inn:daigo_r2 | mb.daigo_east before sg.dir_daigo | stage 0': PENDING + '; CC-367 set it aside: Daigo\'s eastward line holds only until Manybridge (unconfirmed)',
  'sg_cove | sg.harbor:kiyo | sg.kiyo_post before sg.dir_kiyo | stage 0': PENDING,
  'sg_cove | sg.harbor:tobi sg.harbor:tobi_r2 sg.harbor:tobi_r3 | sg.tobi_post before sg.dir_tobi | stage 0': PENDING,
  'sg_lighthouse | sg.lighthouse:genzo | sg.genzo_post before sg.genzo_truth | stage 1': PENDING,
  'sg_seaglass | sg.glass:asahi | sg.asahi_post before sg.asahi_glass | stage 0': PENDING,
  'sg_seaglass | sg.glass:asahi | sg.asahi_post before sg.asahi_name | stage 2': PENDING,
  'sg_seaglass | sg.harbor:fuku sg.harbor:fuku_r2 sg.harbor:fuku_r3 | sg.fuku_post before sg.fuku_plate | stage 0,1,2,3': PENDING,
};

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const test = RB.state.test;

  // ---- 1. the screen itself
  const sc = (cmds) => ({ cmds });
  const fx = (lists, scenes, quests) => {
    const maps = { m: { npcs: [] } };
    lists.forEach((l, i) => { for (const who of [].concat(l.who || 'p' + i)) maps.m.npcs.push({ id: who, talk: l.talk }); });
    return { maps, scenes, quests };
  };
  const Q2 = { q: { stages: [{}, {}] } };
  const S = {
    give: sc([{ op: 'quest', args: ['q', 'done'] }]), step: sc([{ op: 'quest', args: ['q', '1'] }]),
    via: sc([{ op: 'call', args: ['give'] }]), post: sc([]), seen1: sc([]), after: sc([]), idle: sc([]), s1: sc([]),
  };
  const keys = (c) => screen(test, c).map((f) => f.where + ' | ' + f.by + ' before ' + f.at + ' | ' + f.stages.join(','));
  const cases = [
    ['a done-only entry takes nothing open: the shadow after it still counts',
      fx([{ talk: [{ if: 'quest.q=done', scene: 'after' }, { if: 'post', scene: 'post' }, { scene: 'give' }] }], S, Q2), ['m:p0 | post before give | 0,1']],
    ['a one-shot is not a shadow', fx([{ talk: [{ if: 'post&!seen.seen1', scene: 'seen1' }, { scene: 'give' }] }], S, Q2), []],
    ['a move made directly and one made through !call both count',
      fx([{ talk: [{ if: 'post', scene: 'post' }, { scene: 'give' }] }, { talk: [{ if: 'kr_done', scene: 'post' }, { scene: 'via' }] }], S, Q2),
      ['m:p0 | post before give | 0,1', 'm:p1 | post before via | 0,1']],
    ['a list shared by routine places is one finding, naming each', (() => {
      const talk = [{ if: 'post', scene: 'post' }, { scene: 'give' }];
      return fx([{ talk, who: ['a', 'a_r2', 'a_r3'] }], S, Q2);
    })(), ['m:a m:a_r2 m:a_r3 | post before give | 0,1']],
    ['an entry for one stage takes that stage only: the others stay shadowed',
      fx([{ talk: [{ if: 'quest.q=1', scene: 's1' }, { if: 'post', scene: 'post' }, { scene: 'step' }] }], S, Q2), ['m:p0 | post before step | 0']],
    ['an open quest\'s own entry first takes every stage',
      fx([{ talk: [{ if: 'quest.q=active', scene: 'idle' }, { if: 'post', scene: 'post' }, { scene: 'give' }] }], S, Q2), []],
    ['a shadow that cannot hold while the quest is open is none',
      fx([{ talk: [{ if: 'quest.q=done&post', scene: 'post' }, { scene: 'give' }] }], S, Q2), []],
    ['an earlier entry that cannot hold alongside (it needs f, this one !f) takes nothing: the shadow after it counts',
      fx([{ talk: [{ if: 'quest.q&f', scene: 's1' }, { if: 'post', scene: 'post' }, { if: '!f', scene: 'give' }] }], S, Q2), ['m:p0 | post before give | 0,1']],
    ['an earlier entry that can hold alongside takes it',
      fx([{ talk: [{ if: 'quest.q&g', scene: 's1' }, { if: 'post', scene: 'post' }, { if: '!f', scene: 'give' }] }], S, Q2), []],
    ['an earlier entry for another companion takes nothing',
      fx([{ talk: [{ if: 'comp=nao&quest.q', scene: 's1' }, { if: 'post', scene: 'post' }, { if: 'comp=rin', scene: 'give' }] }], S, Q2), ['m:p0 | post before give | 0,1']],
    ['a one-shot in one branch does not excuse the other',
      fx([{ talk: [{ if: 'post&!seen.seen1|kr_done', scene: 'post' }, { scene: 'give' }] }], S, Q2), ['m:p0 | post before give | 0,1']],
    ['an earlier state of the story (!post) is not a later one',
      fx([{ talk: [{ if: '!post', scene: 'idle' }, { scene: 'give' }] }], S, Q2), []],
  ];
  for (const [label, c, want] of cases) t.eq(keys(c), want, '1 ' + label);

  // ---- 2. the game's own lists
  const found = screen(test, RB.content);
  const unlisted = found.filter((f) => !LISTED[f.key]);
  const stale = Object.keys(LISTED).filter((k) => !found.some((f) => f.key === k));
  t.ok(!unlisted.length, '2 every shadowed side quest found is listed with its reason (' + unlisted.length + ' not listed: ' + JSON.stringify(unlisted.map((f) => f.key)) + ')');
  t.ok(!stale.length, '2 every listed finding is still found: a fixed one comes off the list (' + JSON.stringify(stale) + ')');
};
