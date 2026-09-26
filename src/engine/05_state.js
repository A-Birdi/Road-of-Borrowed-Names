/* Campaign state model, conditions, and content registries.
 * The campaign state is plain JSON (saved as-is). Nothing in it may hold
 * functions or DOM references. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.content = RB.content || {
  chars: {},     // speaker/character definitions
  maps: {},      // map definitions
  scenes: {},    // parsed scenes
  sceneSrc: [],  // raw scene sources (for validation)
  quests: {},    // quest definitions
  items: {},     // item definitions
  words: {},     // inscription words (combat repertoire)
  enemies: {},   // enemy definitions
  challenges: {},// learning challenges
  notes: {},     // notebook lore entries
  chapters: {},  // chapter metadata
  places: {},    // fast-travel places
  techniques: {},// companion coordinated techniques
  atlas: {},     // endgame room patterns etc.
};

RB.state = (function () {
  'use strict';

  function newCampaign(opts) {
    opts = opts || {};
    return {
      v: RB.SAVE_SCHEMA,
      id: RB.util.uid(),
      created: Date.now(),
      playtime: 0,
      chapter: 0,
      player: opts.player || {
        name: 'Wayfarer', nameJp: 'ウェイファラー', pron: 'they', bg: 'courier',
        look: { skin: 2, hair: 'short', hairColor: 3, outfit: 0, acc: [] },
      },
      comp: null,          // committed companion id
      provisional: null,   // chosen in the departure room, not yet committed
      map: null, x: 0, y: 0, dir: 'down',
      flags: {}, vars: {},
      quests: {},          // id -> {stage, done, t}
      inv: {},             // itemId -> count
      equip: { charm: null, tool: null, cosmetic: null },
      words: [],           // inscription word ids known
      techniques: [],
      resolve: { pc: 12, comp: 12, max: 12 },
      checkpoint: null,    // {map,x,y,dir} safe respawn point
      visited: {},         // mapId -> true
      travel: {},          // fast-travel places unlocked
      seen: {},            // sceneId -> true
      backlog: [],         // last dialogue lines [{who, jp, en}]
      notebook: [],        // [{kind, id, t}]
      learn: {
        profile: opts.profile || 'F',
        assist: opts.assist || 'normal', // 'assist' (no mistake cost) | 'normal'
        difficulty: opts.difficulty || 'normal', // combat tactics difficulty
        kanaGroup: 0,      // Foundations: next kana group to teach
        items: {},         // mastery records keyed by item id (k:あ, v:みず, g:prt_wa, c:passage)
        stats: { recog: 0, recall: 0, hand: 0, assisted: 0, typed: 0, mistakes: 0 },
      },
      atlas: { unlocked: false, runs: 0, best: 0, relics: [], cosmetics: [], run: null },
      ngplus: 0,
    };
  }

  // ---- Conditions ---------------------------------------------------------
  // Syntax: terms joined by '&' (and) or '|' (or; lower precedence).
  // Terms: flag, !flag, comp=nao, comp, prov=mio, quest.id>=2, quest.id=done,
  //        item.id, item.id>=2, var.x>=3, prof=F, prof>=E, ch>=2, word.id, seen.scene
  const PROF_ORDER = { F: 0, E: 1, I: 2, A: 3 };
  function cmp(a, op, b) {
    switch (op) {
      case '=': case '==': return a == b; // eslint-disable-line eqeqeq
      case '!=': return a != b; // eslint-disable-line eqeqeq
      case '>=': return a >= b;
      case '<=': return a <= b;
      case '>': return a > b;
      case '<': return a < b;
    }
    return false;
  }
  function term(s, t) {
    t = t.trim();
    if (!t) return true;
    if (t === 'true') return true;
    if (t === 'false') return false;
    if (t[0] === '!') return !term(s, t.slice(1));
    const m = t.match(/^([a-zA-Z_][\w.]*?)(>=|<=|!=|==|=|>|<)(.+)$/);
    const key = m ? m[1] : t;
    const op = m ? m[2] : null;
    const val = m ? m[3] : null;
    const parts = key.split('.');
    const head = parts[0];
    const rest = parts.slice(1).join('.');
    const num = (v) => (v != null && v !== '' && !isNaN(+v) ? +v : v);
    switch (head) {
      case 'comp':
        if (!op) return !!s.comp;
        return cmp(s.comp || 'none', op, val);
      case 'prov':
        if (!op) return !!s.provisional;
        return cmp(s.provisional || 'none', op, val);
      case 'party':
        // effective companion: committed or provisional (used in scenes before departure)
        return cmp(s.comp || s.provisional || 'none', op || '=', val);
      case 'quest': {
        const q = s.quests[rest];
        if (!op) return !!q;
        if (val === 'done') return cmp(!!(q && q.done), op, true);
        if (val === 'active') return cmp(!!(q && !q.done), op, true);
        return cmp(q ? (q.done ? 999 : q.stage) : -1, op, num(val));
      }
      case 'item': {
        const n = s.inv[rest] || 0;
        return op ? cmp(n, op, num(val)) : n > 0;
      }
      case 'var': {
        const v = s.vars[rest] || 0;
        return op ? cmp(v, op, num(val)) : !!v;
      }
      case 'prof':
        return cmp(PROF_ORDER[s.learn.profile], op || '=', PROF_ORDER[val]);
      case 'ch':
        return cmp(s.chapter, op || '>=', num(val));
      case 'word':
        return s.words.indexOf(rest) >= 0;
      case 'seen':
        return !!s.seen[rest];
      case 'post':
        return !!s.flags.postgame;
      default:
        if (op) return cmp(s.vars[key] || 0, op, num(val));
        return !!s.flags[key];
    }
  }
  function test(s, cond) {
    if (cond == null || cond === '') return true;
    return String(cond)
      .split('|')
      .some((conj) => conj.split('&').every((t) => term(s, t)));
  }

  // ---- Mutators ------------------------------------------------------------
  function give(s, id, n) {
    s.inv[id] = (s.inv[id] || 0) + (n == null ? 1 : n);
    if (s.inv[id] <= 0) delete s.inv[id];
  }
  function take(s, id, n) {
    const item = RB.content.items[id];
    n = n == null ? 1 : n;
    if (!s.inv[id] || s.inv[id] < n) return false;
    s.inv[id] -= n;
    if (s.inv[id] <= 0) delete s.inv[id];
    return true;
  }
  function setQuest(s, id, stage) {
    const q = s.quests[id] || (s.quests[id] = { stage: 0, done: false, t: Date.now() });
    if (stage === 'done') q.done = true;
    else if (stage === 'start') q.stage = Math.max(q.stage, 0);
    else q.stage = Math.max(q.stage, +stage);
    q.t = Date.now();
    return q;
  }
  function pronouns(p) {
    const P = {
      they: { they: 'they', them: 'them', their: 'their', theirs: 'theirs', self: 'themself', plural: true },
      she: { they: 'she', them: 'her', their: 'her', theirs: 'hers', self: 'herself', plural: false },
      he: { they: 'he', them: 'him', their: 'his', theirs: 'his', self: 'himself', plural: false },
    };
    if (typeof p === 'object' && p) return p;
    return P[p] || P.they;
  }
  return { newCampaign, test, give, take, setQuest, pronouns, PROF_ORDER };
})();
