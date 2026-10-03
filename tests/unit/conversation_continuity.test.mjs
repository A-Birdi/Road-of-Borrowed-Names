// Conversation continuity (the paired addendum §12.2; docs/expressive/CONTRACT.md WI25): a person moves like
// the same person idle in town, in conversation and in a staged scene. Data-driven over every scene that
// carries staging cues (`!gesture`, `!pose`, `!look`), so scenes staged later are checked as they arrive.
//
// For each `!gesture` cue (and each gesture of its `then=` chain) the person is resolved — `comp` to each of
// the four companions who can reach that cue, `pc` to the player — and the gesture is classed against that
// person's mannerism profile (RB.mannerisms.of; GESTURES.md §3, §5):
//   own        in their own conversation list (`talk`, by primitive number), their idle or route habits
//              (including a workplace's `maps` override and story `states`), or `serious` (Suzu's grave register);
//   occupation their working habit held, stopped or intensified (the same tool: Hiro's gather held still to cool
//              while his habit turns the pipe) — GESTURES.md §3 "the habit is disrupted or intensified";
//   tell       one of their emotional tells (the escalation of GESTURES.md §3: tells at full size);
//   strong     one of their written stronger reactions (`strong`);
//   class      their class overlay's conversation gestures, tells or habits (the baseline every profile falls back to);
//   common     attention everyone gives (turn and listen, nod, look between, lean in: primitives 1–4);
//   action     an everyday action with no register of its own, which anyone may do when a scene calls for it
//              (a wave, a hand to the ear, shading the eyes, writing with the brush, a stretch, wiping the brow);
//   object     an object primitive (present, hand over or receive, kneel or bend, read: 13–16) with a prop or a target;
//   outside    none of these.
// Which companions reach a cue: every place that starts the scene (a map's talk entries, props, triggers and
// arrivals, and other scenes' `!call`) — if all of them require `comp=x`, only those companions; a guard
// `!if comp!=x -> end` before the first line; and the cue's own `?(comp=x)`.
// Checks (each a failure when it happens in a scene not listed in KNOWN below):
//   1. every gesture a cue names exists; every staged person is the player or one of the cast (someone without
//      an authored profile is checked against the profile derived from their look, RB.mannerisms.of);
//   2. nothing is `outside` a person's vocabulary;
//   3. a profile's stronger reaction written for a staged scene is shown in that scene (or a variant of it);
//   4. the machine-checkable `avoid` rules: Ren adjusts his glasses at most `glassesPerScene` times a scene;
//      Suzu's hand-on-hip stance (`restScene: false`) never shows in a scene;
//   5. escalation: a person's first cue in a scene is not a tense one (recoil, arms folded, hand to forehead,
//      the emphatic downward hand) unless it is their tell or stronger reaction; no celebration or laugh cued
//      before that person's line tagged sad, cry, angry or worry; no lowered head, bow or recoil before a line
//      tagged happy or laugh;
//   6. recurring people (two or more staged scenes) keep to 2 in each scene.
// KNOWN lists the cases found when this check was written: `escalation` ones are accepted with the reason (the
// line or the narration says what the body does, or the working habit is interrupted); `finding` ones are
// open questions for whoever owns the profiles and the scenes (docs/expressive/reports/props_review.md). An
// entry that no longer occurs fails too, so the list shrinks as they are resolved.
import { load } from '../lib/load.mjs';

const COMPS = ['nao', 'mio', 'ren', 'suzu'];
const COMMON = new Set([1, 2, 3, 4]);
const OBJECT = new Set([13, 14, 15, 16]);
const ACTIONS = new Set(['wave', 'cupear', 'shadeeyes', 'write', 'stretch', 'brow']);
const TENSE = new Set(['recoil', 'folded', 'forehead', 'emphatic']);
const RELEASE = new Set(['celebrate', 'laugh']);
const LOW = new Set(['lowered', 'bow', 'duck', 'recoil']);
const SAD_TAGS = new Set(['sad', 'cry', 'angry', 'worry']);
const HAPPY_TAGS = new Set(['happy', 'laugh']);

// scene · person · gesture (or rule) → kind and reason
const KNOWN = {
  'lf.mio_refuse|mio|halfraise': ['escalation', 'narrated: "Mio\'s mouth starts to shape a yes, and stops." (her fidget held at the point of answering)'],
  'lf.mio_refuse|pc|touchback': ['escalation', 'narrated: "You lay a hand gently on her back."'],
  'rw.bunta_tally|bunta|open:forehead': ['escalation', 'narrated: "Bunta scratches his head in silence." (caught out over the plane)'],
  'rw.mr_sae|sae|open:recoil': ['escalation', 'her line: "Don\'t come… oh, sorry. You\'re a person. Not a voice." (startled in the dark mill)'],
  'lf.mio_refuse|lf_tadashi|flinch': ['finding', 'his profile\'s surprise tell is halfraise (8) and halfraise is the stronger reaction it writes for this scene, but the scene gives him a startled look up (flinch, 21) and the halfraise to Mio'],
  'lf.mio_refuse|lf_tadashi|strong:halfraise': ['finding', 'the same disagreement seen from the profile: the stronger reaction written for him here is not in the scene'],
  'rw.hana_first|hana|point': ['finding', 'pointing the way the cup came from ("from the bridge, I think"); point (10) is in neither her talk (13, 9) nor the host overlay'],
  'sb.yae|yae|aside': ['finding', 'on "Ah… that." [worry]: her own worry tell is countidle; aside (6) is not in her vocabulary'],
  'sb.yae|yae|halfraise': ['finding', 'on "Anyway, she never missed a single night…"; halfraise (8) is not in her vocabulary'],
  'sg.omi_wataru|wataru|size': ['finding', 'his then=size,palm chain: the two-handed size gesture (11) is Omi\'s (her stronger reaction in this scene), not his'],
};

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const G = RB.gestures, M = RB.mannerisms, C = RB.content;
  const P = M.profiles();
  const STAGE = new Set(['gesture', 'pose', 'look']);
  const staged = Object.keys(C.scenes).filter((id) => (C.scenes[id].cmds || []).some((c) => STAGE.has(c.op))).sort();
  t.ok(staged.length >= 7, 'staged scenes found by their cues (' + staged.length + ')');

  const num = (id) => { const g = G.get(id); return g && g.n ? g.n : null; };
  const habitsOf = (pr) => {
    const out = new Set();
    for (const h of (pr.idle || []).concat(pr.route || [])) out.add(h[0]);
    for (const k in pr.maps || {}) for (const h of pr.maps[k].idle || []) out.add(h[0]);
    for (const v of pr.states || []) for (const h of v.idle || []) out.add(h[0]);
    return out;
  };
  // two habits of one occupation: their tools share a name (pipeA, pipeB, pipecool: the blowpipe)
  const tool = (gid) => { const g = G.get(gid); return g && g.prop ? String(g.prop).replace(/(A|B|cool|hold)$/, '') : null; };
  function classify(who, gid, cue) {
    const pr = M.of(who);
    const base = M.CLASSES[pr.class] || M.CLASSES.town;
    const n = num(gid);
    const same = (list) => list.some((x) => x === gid || (n && num(x) === n));
    const own = habitsOf(pr);
    if ((n && (pr.talk || []).includes(n)) || own.has(gid) || (n && (pr.serious || []).includes(n))) return 'own';
    if (tool(gid) && [...own].some((h) => tool(h) === tool(gid))) return 'occupation';
    if (same(Object.values(pr.tells || {}))) return 'tell';
    if (same((pr.strong || []).map((s) => s.gesture))) return 'strong';
    if ((n && (base.talk || []).includes(n)) || same(Object.values(base.tells || {})) || habitsOf(base).has(gid)) return 'class';
    if (n && COMMON.has(n)) return 'common';
    if (ACTIONS.has(gid)) return 'action';
    if (n && OBJECT.has(n) && (cue.prop || cue.target)) return 'object';
    return 'outside';
  }

  // ---- which companions can reach a scene ----------------------------------------------------------------
  const compTerms = (cond) => (cond || '').split('&').map((p) => /^comp=(\w+)$/.exec(p.trim())).filter(Boolean).map((m) => m[1]);
  const compOk = (cond, comp) => !cond || cond.split('&').every((p) => {
    const m = /^comp(!?=)(\w+)$/.exec(p.trim());
    return !m || (m[1] === '=' ? m[2] === comp : m[2] !== comp);
  });
  const refs = {};
  const ref = (scene, cond) => { if (scene) (refs[scene] = refs[scene] || []).push(cond || ''); };
  for (const id in C.maps) {
    const d = C.maps[id];
    for (const n of d.npcs || []) for (const tk of n.talk || []) ref(tk.scene, [n.if, tk.if].filter(Boolean).join('&'));
    for (const p of d.props || []) ref(p.scene, p.if);
    for (const q of d.triggers || []) ref(q.scene, q.if);
    for (const e of d.onEnter || []) ref(e.scene, e.if);
  }
  for (const id in C.scenes) for (const c of C.scenes[id].cmds || []) if (c.op === 'call') ref(c.args[0], c.if);
  function comps(sceneId) {
    const sc = C.scenes[sceneId];
    let out = COMPS.slice();
    const r = refs[sceneId] || [];
    if (r.length && r.every((cond) => compTerms(cond).length)) out = out.filter((k) => r.some((cond) => compTerms(cond).includes(k)));
    for (const c of sc.cmds) {
      if (c.op === 'say' || c.op === 'choice') break;
      if (c.op === 'if' && c.args[2] === 'end' && /comp/.test(c.args[0])) out = out.filter((k) => !compOk(c.args[0], k));
    }
    return out;
  }

  // ---- every cue -----------------------------------------------------------------------------------------
  const rows = [], issues = [], unknown = [], noProfile = [], derived = new Set();
  const perPerson = {};
  const issue = (scene, who, what, msg) => issues.push({ key: scene + '|' + who + '|' + what, msg: scene + ': ' + who + ' ' + msg });
  for (const id of staged) {
    const sc = C.scenes[id], cmds = sc.cmds, reach = comps(id);
    const seen = {}, glasses = {};
    for (let i = 0; i < cmds.length; i++) {
      const c = cmds[i];
      if (c.op !== 'gesture' && c.op !== 'pose') continue;
      const who = c.args[0];
      const people = who === 'comp' ? reach.filter((k) => compOk(c.if, k)) : [who];
      if (c.op === 'pose') {
        for (const p of people) if (P[p] && P[p].restScene === false && /^hip/.test(c.args[1] || '')) issue(id, p, 'pose:' + c.args[1], 'takes the ' + c.args[1] + ' stance in a scene');
        continue;
      }
      if (c.args[1] === '-') continue; // a release, not a gesture
      const cue = RB.script.stageArgs(c.args.slice(2));
      const chain = [c.args[1]].concat(cue.then || []);
      // the next line this person's cue leads into: a companion's cue reaches only the companion lines of its own
      // branch (?(comp=x)), not another companion's
      const nextFor = (p) => {
        for (let j = i + 1; j < cmds.length; j++) {
          const d = cmds[j];
          if (d.op === 'say') { if (who === 'comp' && d.who === 'comp' && !compOk(d.if, p)) continue; return d; }
          if (['choice', 'goto', 'end'].includes(d.op)) return null;
        }
        return null;
      };
      for (const p of people) {
        const next = nextFor(p);
        // one of their emotional tells (GESTURES.md §3), whichever list it is also in
        const isTell = (gid) => { const n = num(gid); return Object.values(M.of(p).tells || {}).some((x) => x === gid || (n && num(x) === n)); };
        if (p !== 'pc' && !P[p] && !C.chars[p]) { noProfile.push(id + ':' + p); continue; }
        if (p !== 'pc' && !P[p]) derived.add(p);
        for (const gid of chain) {
          if (!G.get(gid)) { unknown.push(id + ': ' + gid); continue; }
          const cls = classify(p, gid, cue);
          rows.push([id, p, gid, cls]);
          (perPerson[p] = perPerson[p] || {})[id] = (perPerson[p][id] || []).concat(gid + ':' + cls);
          if (cls === 'outside') issue(id, p, gid, gid + ' is outside their vocabulary');
          if (!seen[p] && TENSE.has(gid) && !['tell', 'strong'].includes(cls) && !isTell(gid)) issue(id, p, 'open:' + gid, 'opens the scene on ' + gid + ' with no lead-in');
          seen[p] = true;
          if (gid === 'glasses') glasses[p] = (glasses[p] || 0) + 1;
          const nextWho = next && (next.who === 'comp' ? (who === 'comp' ? p : null) : next.who);
          if (next && nextWho === p && next.expr) {
            if (RELEASE.has(gid) && SAD_TAGS.has(next.expr)) issue(id, p, 'expr:' + gid, gid + ' before a line tagged ' + next.expr);
            if (LOW.has(gid) && HAPPY_TAGS.has(next.expr)) issue(id, p, 'expr:' + gid, gid + ' before a line tagged ' + next.expr);
          }
        }
      }
    }
    for (const p in glasses) { const lim = P[p] && P[p].glassesPerScene; if (lim && glasses[p] > lim) issue(id, p, 'glasses', 'adjusts the glasses ' + glasses[p] + ' times (at most ' + lim + ')'); }
  }
  t.eq(unknown, [], 'every gesture a staged cue names exists');
  t.eq(noProfile, [], 'every staged person is the player or a character of the cast (a profile of their own, or one derived from their look)');
  t.ok(rows.length > 50, 'staged gesture cues classed (' + rows.length + ')');
  // 3. a stronger reaction written for a staged scene is shown there
  for (const [p, pr] of Object.entries(P)) for (const s of pr.strong || []) {
    if (!staged.includes(s.beat)) continue;
    const shown = rows.filter((r) => r[0] === s.beat && r[1] === p).map((r) => r[2]);
    if (!shown.some((g) => g === s.gesture || (num(g) && num(g) === num(s.gesture)))) issue(s.beat, p, 'strong:' + s.gesture, 'does not show the stronger reaction written for this scene (' + s.gesture + ')');
  }

  // ---- against the documented cases ------------------------------------------------------------------------
  const fresh = issues.filter((x) => !KNOWN[x.key]).map((x) => x.msg);
  t.eq(fresh, [], 'staged gestures keep to each person\'s vocabulary or a documented escalation, escalate from a lead-in and agree with the line');
  const stale = Object.keys(KNOWN).filter((k) => !issues.some((x) => x.key === k));
  t.eq(stale, [], 'every documented case still occurs (remove it once resolved)');
  // 6. recurring people keep to their vocabulary in every scene (documented cases aside)
  const recurring = Object.keys(perPerson).filter((p) => Object.keys(perPerson[p]).length >= 2).sort();
  for (const p of recurring) for (const s in perPerson[p]) {
    const out = perPerson[p][s].filter((x) => x.endsWith(':outside') && !KNOWN[s + '|' + p + '|' + x.split(':')[0]]);
    t.eq(out, [], p + ' keeps to their vocabulary in ' + s);
  }

  // ---- the report ----------------------------------------------------------------------------------------
  const byCls = {};
  for (const r of rows) byCls[r[3]] = (byCls[r[3]] || 0) + 1;
  t.log('staged scenes: ' + staged.length + ' (' + staged.join(', ') + ')');
  t.log('gesture cues by class (' + rows.length + '): ' + JSON.stringify(byCls));
  t.log('people staged in two or more scenes: ' + recurring.join(', '));
  if (derived.size) t.log('staged on a derived profile (no authored one): ' + [...derived].join(', '));
  for (const p of Object.keys(perPerson).sort()) t.log('  ' + p + ': ' + Object.entries(perPerson[p]).map(([s, l]) => s + ' [' + l.join(' ') + ']').join('; '));
  for (const [k, [kind, why]] of Object.entries(KNOWN)) t.log('  ' + kind + ' ' + k + ' — ' + why);
};
