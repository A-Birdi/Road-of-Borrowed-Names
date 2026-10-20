// Every line in-game is a spoken line (Robin, 2026-10-19: "every line in-game should have spoken lines with properly
// highlightable text as well"; 2026-10-20: "If something isn't set up to be spoken yet, explain why and find a proper way
// to resolve it completely"). A line's recording is found by the scene id it is shown under and its Japanese
// (src/audio/52_voicebank.js wanted), so:
//  1. static: every call that shows a line in the dialogue strip from the game's own code (RB.ui.dialogue.say,
//     RB.script.runInline; outside the runner and the strip themselves) passes a sceneId, or passes lines built where
//     each is given one (the few exceptions below, each with the construction that proves it);
//  2. every line each part of the game lists for recording (RB.content.spokenSources / spokenLines, read by
//     tools/voice/lines.mjs) has a scene id that can name a file on the voice site, Japanese with no run-time name
//     ($name: never recordable), and a speaker the game knows (a character, the narrator, the player, the companion);
//  3. the code paths themselves, run here with the dialogue captured, show only listed lines (stamp stands, sealed
//     spots, a layered site's marks, the companion's thoughts, place talk and What We Keep, the New Game+ farewell, the
//     view from each of the case's viewpoints), and a kept memory's replay keeps its scene id;
//  4. the families wired on 2026-10-20 are listed (scene by scene), an action's rules are listed from a state space
//     that was not cut short, and the Atlas's narration stays in its table (no narrator line written at a call);
//  5. the second pass (VL-2): every telegraph a battle can show (each creature, each encounter's variation, each move,
//     each learner level, with and without a companion, aimed at you or at them) is listed when it can be recorded
//     (a companion's name put in) and only a line naming the player is not; the encounter screen's log, run through
//     the encounter rules over every conversation and machine, shows only listed lines; the reply each memory source
//     keeps is listed; asking back's three questions and hanafuda's calls are listed for their callers; and the
//     dialogue history keeps the scene id (the Log's Voice).
import fs from 'node:fs';
import path from 'node:path';
import { root } from '../lib/load.mjs';

const SRC = path.join(root, 'src');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.js') ? [path.join(d, e.name)] : []));
// the argument text of a call starting at i (just after its '('), balanced over brackets and quotes
function argAt(s, i) {
  let depth = 0, q = null;
  for (let k = i; k < s.length; k++) {
    const c = s[k];
    if (q) { if (c === '\\') { k++; continue; } if (c === q) q = null; continue; }
    if (c === '\'' || c === '"' || c === '`') { q = c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') { if (depth === 0) return s.slice(i, k); depth--; }
  }
  return null;
}

// Calls that pass lines built elsewhere, each with what proves every such line carries its scene id.
const BUILT = [
  { file: 'engine/58_companion.js', arg: 'l', n: 3, why: 'a reaction\'s lines (say), What We Keep (keepLines) and "Talk about this place" (placeTalk): each made with sceneId: SCENE',
    proof: [/const lines = \(r\.lines \|\| \[\]\)\.map\(\(l\) => \(\{[^}]*sceneId: SCENE \}\)\)/, /const say = \(o, expr\) => o \? \[\{[^}]*sceneId: SCENE \}\] : \[\]/, /e\.lines\.map\(\(l\) => \(\{[^}]*sceneId: SCENE \}\)\)/] },
  { file: 'engine/58_companion.js', arg: 'lines', n: 1, why: 'the same reaction lines, outside a scene', proof: [/const lines = \(r\.lines \|\| \[\]\)\.map\(\(l\) => \(\{[^}]*sceneId: SCENE \}\)\)/] },
  { file: 'ui/57_weave.js', arg: 'l', n: 1, why: 'a field action\'s presentation: every line pushed in present() has sceneId', proof: ['every lines.push'] },
  { file: 'ui/57_weave.js', arg: 'lines', n: 1, why: 'the same, outside a scene', proof: ['every lines.push'] },
];

export default async (t) => {
  // ---- 1. static: the call sites --------------------------------------------------------------------------------------
  const CALL = /RB\.ui\.dialogue\.say\(|RB\.script\.runInline\(/g;
  const seen = {};
  let calls = 0, direct = 0;
  const bad = [];
  for (const f of walk(SRC)) {
    const rel = path.relative(SRC, f).split(path.sep).join('/');
    if (rel === 'engine/70_script.js' || rel === 'ui/20_dialogue.js') continue; // (the runner's own say, with sc.id; the strip)
    const s = fs.readFileSync(f, 'utf8');
    let m;
    CALL.lastIndex = 0;
    while ((m = CALL.exec(s))) {
      const arg = argAt(s, m.index + m[0].length);
      calls++;
      if (arg == null) { bad.push(rel + ': unreadable call at ' + m.index); continue; }
      if (/\bsceneId\b/.test(arg)) { direct++; continue; }
      const key = rel + '|' + arg.trim();
      seen[key] = (seen[key] || 0) + 1;
      if (!BUILT.some((b) => b.file === rel && b.arg === arg.trim())) bad.push(rel + ': ' + m[0] + arg.slice(0, 80) + ') passes no sceneId');
    }
  }
  t.ok(calls > 30 && !bad.length, 'every line the game\'s own code shows in the dialogue strip names its scene (' + calls + ' calls, ' + direct + ' with a sceneId written at the call): ' + bad.join(' | '));
  for (const b of BUILT) {
    const src = fs.readFileSync(path.join(SRC, b.file), 'utf8');
    t.ok((seen[b.file + '|' + b.arg] || 0) === b.n, b.file + ': ' + b.n + ' call(s) passing `' + b.arg + '` (' + b.why + '), found ' + (seen[b.file + '|' + b.arg] || 0) + ' (a new one is reviewed here)');
    for (const p of b.proof) {
      if (p === 'every lines.push') {
        const pushes = [...src.matchAll(/lines\.push\(/g)].map((x) => argAt(src, x.index + x[0].length));
        t.ok(pushes.length >= 3 && pushes.every((a) => /\bsceneId\b/.test(a)), b.file + ': every line pushed for the presentation names its scene (' + pushes.length + ')');
      } else t.ok(p.test(src), b.file + ': ' + b.why + ' — ' + p);
    }
  }

  // ---- 2. what is listed ------------------------------------------------------------------------------------------------
  const { RB, allLines, keyOf } = await import('../../tools/voice/lines.mjs');
  const chars = RB.content.chars;
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const listed = [].concat(RB.content.spokenLines || [], ...(RB.content.spokenSources || []).map((f) => f()));
  const problems = [];
  for (const l of listed) {
    if (!l.scene || typeof l.scene !== 'string' || /[\s:/\\?*"<>|]/.test(l.scene)) problems.push('scene id ' + JSON.stringify(l.scene) + ' (a file name on the voice site)');
    if (!l.jp || typeof l.jp !== 'string') problems.push(l.scene + ': no Japanese');
    else if (/\$\w/.test(l.jp)) problems.push(l.scene + ': a run-time name in ' + l.jp);
    const who = l.who || 'narr';
    if (!(who === 'narr' || who === 'pc' || who === 'comp' || chars[who])) problems.push(l.scene + ': unknown speaker ' + who);
    if (l.comps && !(Array.isArray(l.comps) && l.comps.every((c) => COMPS.includes(c)))) problems.push(l.scene + ': companions ' + l.comps);
  }
  t.ok(listed.length > 2000 && !problems.length, 'every listed line has a scene id, recordable Japanese and a known speaker (' + listed.length + '): ' + [...new Set(problems)].slice(0, 6).join(' | '));
  const by = {};
  for (const l of listed) (by[l.scene] = by[l.scene] || []).push(l);
  const FAMILIES = ['code.comp', 'code.ngplus', 'code.weave', 'code.town', 'code.verbs', 'code.stamp', 'code.pages', 'code.atlas', 'code.fish', 'code.play', 'code.letters', 'mp.press_react', 'cs.view_seat', 'cs.view_west', 'cs.view_east'];
  t.ok(FAMILIES.every((f) => (by[f] || []).length > 0), 'each family wired on 2026-10-20 lists its lines: ' + FAMILIES.map((f) => f + ' ' + (by[f] || []).length).join(', '));
  // the recording list (tools/voice/lines.mjs) carries them, once per speaker
  const L = allLines();
  const have = new Set(L.map((l) => l.key + '|' + l.who)), keys = new Set(L.map((l) => l.key));
  const isListed = (sceneId, who, jp) => have.has(keyOf(sceneId, jp) + '|' + (who || 'narr'));
  t.ok(listed.every((l) => isListed(l.scene, l.who, l.jp)), 'the recording list carries every listed line');

  // ---- 3. the code paths, run with the dialogue captured --------------------------------------------------------------
  const shown = [];
  const keep = { say: RB.ui.dialogue.say, inline: RB.script.runInline, hide: RB.ui.dialogue.hide, s: RB.game.s, toast: RB.ui.toast, award: RB.ui.award };
  RB.ui.dialogue.say = async (l) => { shown.push(l); };
  RB.script.runInline = async (ls) => { for (const l of ls) shown.push(l); };
  RB.ui.dialogue.hide = () => {};
  RB.ui.toast = async () => {};
  RB.ui.award = null;
  const check = (what, before) => {
    const lines = shown.slice(before);
    const off = lines.filter((l) => !l.sceneId || !isListed(l.sceneId, l.who === 'comp' ? 'comp' : l.who, l.jp));
    t.ok(lines.length > 0 && !off.length, what + ': ' + lines.length + ' line(s) shown, each under its scene id and listed for recording' + (off.length ? ' — not: ' + off.slice(0, 3).map((l) => (l.sceneId || 'no scene') + ' ' + l.who + ' ' + l.jp).join(' | ') : ''));
  };
  try {
    // stamp stands: nothing waiting, then every stamp of a stand waiting at once
    {
      const n0 = shown.length;
      const st = RB.content.stampStands || {}, S = RB.content.stamps || {};
      for (const stand in st) {
        const s = RB.state.newCampaign({});
        RB.game.s = s;
        await RB.hooks.rb_stand([stand], {});
        const ids = Object.keys(S).filter((id) => S[id].stand === stand);
        const was = ids.map((id) => S[id].when);
        ids.forEach((id) => { S[id].when = () => true; });
        try { await RB.hooks.rb_stand([stand], {}); } finally { ids.forEach((id, i) => { S[id].when = was[i]; }); }
      }
      check('stamp stands (' + Object.keys(st).length + ')', n0);
    }
    // sealed spots, examined
    {
      const n0 = shown.length;
      for (const id in RB.content.sealed || {}) { const s = RB.state.newCampaign({}); RB.game.s = s; await RB.hooks.sealed([id]); }
      check('sealed spots', n0);
    }
    // a layered site's marks, reached
    {
      const n0 = shown.length;
      for (const spec of RB.verbs.list('layers')) {
        if (spec.fixture) continue;
        for (const mk of spec.plan.marks) { const s = RB.state.newCampaign({}); s.map = spec.map; RB.game.s = s; try { await RB.hooks.vb_mark([], { trigger: { vb: spec.id, mark: mk.id } }); } catch (e) { /* (a mark compared elsewhere) */ } }
      }
      check('a layered site\'s marks', n0);
    }
    // the companion: thoughts, "Talk about this place", What We Keep (every kept moment's family, and none)
    {
      const n0 = shown.length;
      const maps = Object.keys(RB.content.maps).filter((id) => !/^atlas\./.test(id)).filter((id, i) => i % 7 === 0);
      for (const comp of COMPS) {
        for (const map of maps) {
          const s = RB.state.newCampaign({}); s.comp = comp; s.map = map; RB.game.s = s;
          await RB.hooks.co_thought([]);
          await RB.hooks.co_place([]);
        }
        const s = RB.state.newCampaign({}); s.comp = comp; RB.game.s = s;
        await RB.hooks.co_keep_recall([]);
        for (const tt of RB.company.memoryTitles()) {
          const s2 = RB.state.newCampaign({}); s2.comp = comp; RB.game.s = s2;
          s2.company.memories.push({ id: tt.id === 'pet:' ? 'pet:cat' : tt.id, kind: tt.kind, title: tt.title, comp: tt.comp || comp, petName: tt.kind === 'pets' ? 'Mochi' : null, t: 1 });
          await RB.hooks.co_keep_recall([]);
        }
      }
      check('the companion\'s thoughts, place talk and What We Keep', n0);
    }
    // the view from each viewpoint of the case
    {
      const n0 = shown.length;
      for (const pid in (RB.content.caseView || {}).points || {}) { const s = RB.state.newCampaign({}); RB.game.s = s; await RB.hooks.cs_look([pid]); }
      check('the case\'s viewpoints', n0);
    }
    // the New Game+ farewell, from a journey with each companion and with none
    {
      const n0 = shown.length;
      for (const comp of COMPS.concat([null])) { const from = RB.state.newCampaign({}); from.comp = comp; await RB.ui.ngplus.farewell(from); }
      check('the New Game+ farewell', n0);
    }
  } finally {
    RB.ui.dialogue.say = keep.say; RB.script.runInline = keep.inline; RB.ui.dialogue.hide = keep.hide; RB.game.s = keep.s; RB.ui.toast = keep.toast; RB.ui.award = keep.award;
  }
  // a kept memory (Company › Shared memories) replays its lines under their scenes, as a Records replay does
  {
    const ids = RB.sequence.ids().filter((id) => RB.sequence.get(id).memory && RB.sequence.get(id).scene);
    let ok = 0, all = 0;
    for (const id of ids) {
      const def = RB.sequence.get(id), sc = RB.content.scenes[def.scene];
      if (!sc) continue;
      const shot = Object.keys(def.shots)[0];
      const says = sc.cmds.filter((c) => c.op === 'say').slice(0, 3);
      if (!says.length) continue;
      const beats = RB.sequence.beatsOf({ seq: id, beats: says.map((c) => [shot, 0, def.scene, c.line, RB.sequence.lineHash(c)]), cast: { comp: { id: 'mio' } } });
      all++;
      if (beats.length === says.length && beats.every((b) => b.line.sceneId === def.scene && keys.has(keyOf(def.scene, b.line.jp)))) ok++;
    }
    t.ok(all > 3 && ok === all, 'a kept memory\'s replay keeps each line\'s scene id (' + ok + '/' + all + ' sequences)');
  }

  // ---- 4. completeness of the computed lists --------------------------------------------------------------------------
  {
    const capped = RB.verbs.list().filter((sp) => !sp.fixture && RB.verbs.ruleLines(sp).capped).map((sp) => sp.id);
    t.ok(!capped.length, 'an action\'s rules are listed over every state they can reach (none cut short): ' + capped.join(', '));
    const S = RB.content.stamps || {};
    const sizes = Object.keys(RB.content.stampStands || {}).map((st) => Object.keys(S).filter((id) => S[id].stand === st).length);
    t.ok(sizes.every((n) => n <= 10), 'every stamp stand\'s sets of waiting stamps are listed (at most ' + Math.max(...sizes) + ' stamps at a stand)');
    const atlas = fs.readFileSync(path.join(SRC, 'atlas/50_run.js'), 'utf8');
    t.ok(!/say\('narr', \{ jp: '/.test(atlas) && /const NARR = \{/.test(atlas), 'the Atlas\'s narrator lines are in its table (NARR), so the recording list is the table');
  }

  // ---- 5. the second pass (VL-2) ----------------------------------------------------------------------------------------
  {
    const VL2 = ['code.enc', 'code.ask', 'code.hanafuda'];
    t.ok(VL2.every((f) => (by[f] || []).length > 0), 'each family wired in the second pass lists its lines: ' + VL2.map((f) => f + ' ' + (by[f] || []).length).join(', '));
    // a shown line is listed: for a companion's own id, listed for that companion or as the companion ('comp') naming them
    const listedFor = (scene, who, jp) => isListed(scene, who, jp) || (COMPS.includes(who) && listed.some((l) => l.scene === scene && l.who === 'comp' && l.jp === jp && (!l.comps || l.comps.includes(who))));
    const keepS = RB.game.s;
    try {
      // the telegraphs: every creature (and each variation an encounter makes of one), every move it can make, every
      // learner level, with each companion and alone, aimed each way the rules can aim it (intentLine's own choices)
      const C = RB.combat, T = RB.content.intentText, LV = ['F', 'E', 'I', 'A'];
      const defs = [];
      for (const id in RB.content.enemies) defs.push(Object.assign({ id }, RB.content.enemies[id]));
      for (const id in RB.content.encounters) {
        const d = RB.content.encounters[id], g = d.group;
        for (const sp of [d.lead].concat(Array.isArray(g) ? g : g ? [].concat(g.normal || [], g.hard || []) : [], (d.arrivals || []).map((a) => a.enemy), (d.extras || []).map((a) => a.enemy))) {
          if (!sp || typeof sp !== 'object') continue;
          const base = RB.content.enemies[sp.enemy] || {};
          defs.push(Object.assign({ id: sp.enemy }, base, sp, sp.intents ? { intents: Object.assign({}, base.intents || {}, sp.intents) } : {}));
        }
      }
      let shownN = 0, named = 0, voicedNames = 0;
      const off = [];
      for (const def of defs) {
        const keys = new Set([].concat(def.pattern || [], ...(def.phases || []).map((ph) => ph.pattern || []), Object.keys(def.intents || {})));
        for (const k of keys) {
          const it = RB.combatLogic.intentDef(def, k);
          for (const prof of LV) for (const comp of [null].concat(COMPS)) {
            const s = RB.state.newCampaign({}); s.learn.profile = prof; s.comp = comp; RB.game.s = s;
            const pool = it.text ? [].concat(RB.activities.tier(it.text) || []) : T[it.kind] ? [].concat(T[it.kind][prof] || T[it.kind].F || []) : [];
            if (!pool.length) continue;
            const aims = it.target === 'rand' ? (comp ? ['pc', 'comp'] : ['pc']) : it.target === 'comp' && comp ? ['comp'] : [it.target === 'both' ? 'both' : 'pc'];
            for (const aim of aims) {
              let cands = !comp || aim === 'both' ? pool.filter((x) => !x.neg) : pool;
              if (!cands.length) cands = pool;
              const tgt = aim === 'comp' ? 'comp' : 'pc', other = tgt === 'pc' ? 'comp' : 'pc';
              for (const x of cands) {
                shownN++;
                const said = C.saidAs(x.jp, tgt, other, comp);
                const hasName = /\$\w/.test(x.jp);
                if (hasName) named++;
                if (!said) { if (!(/\$tgt\b/.test(x.jp) && tgt === 'pc') && !(/\$other\b/.test(x.jp) && other === 'pc')) off.push('unvoiced without naming you: ' + def.id + ' ' + k + ' ' + x.jp); continue; }
                if (hasName) voicedNames++;
                if (!isListed(C.SCENE, 'narr', said)) off.push(def.id + ' ' + k + ' ' + prof + ' ' + (comp || 'alone') + ' ' + aim + ': ' + said);
              }
            }
          }
        }
      }
      t.ok(shownN > 1000 && voicedNames > 0 && !off.length, 'every telegraph a battle can show (' + shownN + ' cases, ' + named + ' with a name in them, ' + voicedNames + ' of those with a companion\'s name, voiced) is listed under code.battle; only a line naming you is not: ' + [...new Set(off)].slice(0, 4).join(' | '));
      t.ok(listed.filter((l) => l.scene === C.SCENE && /ナオ|ミオ|レン|スズ/.test(l.jp)).length >= 4 * 12, 'a telegraph naming the companion is listed once for each companion\'s name');

      // the encounter screen: each conversation and machine (no creature leads it), run through the encounter rules with
      // every card the rules offer in turn (several walks each), its log as src/ui/80s_encounter.js builds it
      const E = RB.encounter, words = Object.keys(RB.content.words).slice(0, 12).map((id) => RB.content.words[id]);
      const speakerOf = (w) => (w === 'pc' || w === 'comp' ? w : w && RB.content.chars[w] ? w : 'narr');
      let encN = 0, logN = 0, jpN = 0;
      const encOff = [];
      for (const id in RB.content.encounters) {
        const def = RB.content.encounters[id];
        if (def.lead) continue;
        encN++;
        for (let walk = 0; walk < 6; walk++) {
          const comp = COMPS[walk % 4];
          const s = RB.state.newCampaign({}); s.comp = comp; s.words = words.map((w) => w.id); RB.game.s = s;
          let st;
          try { st = E.begin(def, s); } catch (e) { encOff.push(id + ': ' + e.message); break; }
          const log = [];
          const say = (f, who) => { if (f && (f.en || f.jp)) log.push({ who: who || '', jp: f.jp || '', en: f.en || '' }); };
          for (let n = 0; n < 14 && !st.over; n++) {
            const cards = E.cards(st, s, words).filter((c) => !c.disabled);
            if (!cards.length) break;
            const card = cards[(n * 7 + walk * 3) % cards.length];
            const opts = E.companionOptions(st, s);
            const cact = opts.length && (n + walk) % 2 ? { act: opts[(n + walk) % opts.length].def.id } : null;
            const ev = E.exchange(st, { card, res: { ok: true, firstTry: true, mistakes: 0 }, comp: cact }, {});
            say({ en: 'You: ' + card.en, jp: card.kind === 'social' ? card.jp : '' }, 'pc');
            for (const f of ev.fx) say(f, f.who || '');
            for (const f of ev.cfx || []) say(f, 'comp');
            for (const f of ev.gfx || []) say(f, f.who || '');
          }
          const end = E.conclusionText(st.enc.conclusion, RB.game.settings);
          if (end && end.jp) log.push({ who: 'narr', jp: end.jp, en: end.en });
          for (const l of log) {
            logN++;
            if (!l.jp) continue;
            jpN++;
            const w = speakerOf(l.who);
            if (!listedFor('code.enc', w === 'comp' ? comp : w, l.jp) && !isListed('code.enc', w, l.jp)) encOff.push(id + ' ' + w + ': ' + l.jp);
          }
        }
      }
      t.ok(encN > 20 && jpN > 50 && !encOff.length, 'the encounter screen\'s log, run through the rules over ' + encN + ' conversations and machines (' + logN + ' entries, ' + jpN + ' with Japanese), shows only lines listed under code.enc: ' + [...new Set(encOff)].slice(0, 4).join(' | '));

      // the reply each memory source keeps, listed for the companion who says it (code.comp)
      const K = RB.company, CC = RB.content.company, repOff = [];
      let repN = 0;
      const rep = (comp, r, what) => { if (!r || !r.jp || /\$\w/.test(r.jp)) return; repN++; if (!isListed(K.SCENE, comp, r.jp)) repOff.push(what + ' ' + comp + ': ' + r.jp); };
      for (const comp of COMPS) {
        for (const k in CC.mem) { const r = CC.mem[k].reply; if (r) for (const v of [].concat(r[comp] || r['*'] || [])) rep(comp, v, 'story:' + k); }
        for (const sp in (RB.pets && RB.pets.meeting) || {}) rep(comp, (RB.pets.meeting[sp].reply || {})[comp], 'pet:met:' + sp);
        for (const sp in (CC.pets || {})[comp] || {}) rep(comp, CC.pets[comp][sp], 'pet:' + sp);
        const fm = (RB.fishing.content().remarks || {}).__memories || {};
        for (const kind in fm) rep(comp, (fm[kind].reply || {})[comp], 'fish:' + kind);
      }
      // a discovery's remark: the companion's reaction, its lines joined, as onResolved keeps it
      for (const r of K.reactions) {
        if (!(r.lines && r.lines[0])) continue;
        const s = RB.state.newCampaign({}); s.comp = r.comp; RB.game.s = s;
        const [kind, ...rest] = String(r.event).split(':');
        K.onResolved(s, { kind, id: rest.join(':') || 'x', id2: 'test:' + r.id });
        const m = s.company.memories.find((x) => x.id.startsWith('disc:'));
        if (m && m.reply && m.react === r.id) rep(r.comp, m.reply, 'reaction ' + r.id);
      }
      t.ok(repN > 60 && !repOff.length, 'the reply each memory keeps (' + repN + ': story memories, animals met, fishing, discoveries\' remarks) is listed in the companion\'s voice under code.comp: ' + repOff.slice(0, 4).join(' | '));
    } finally { RB.game.s = keepS; }

    // asking back's questions and hanafuda's calls, for their callers
    const asks = listed.filter((l) => l.scene === 'code.ask');
    t.ok(asks.length === 3 && asks.every((l) => l.who === 'pc'), 'asking back: the three questions are listed in the player\'s voice (' + asks.length + ')');
    const calls = listed.filter((l) => l.scene === 'code.hanafuda');
    t.ok(calls.some((l) => l.who === 'pc' && /こいこい/.test(l.jp)) && calls.some((l) => l.who === 'comp' && l.comps && l.comps.length === 4 && /勝負/.test(l.jp)), 'hanafuda: koi-koi and shōbu are listed for you and for each companion (' + calls.length + ')');
    // the dialogue history keeps the scene id (and who the companion was), so the Log can say a line again
    const dsrc = fs.readFileSync(path.join(SRC, 'ui/20_dialogue.js'), 'utf8');
    t.ok(/s\.backlog\.push\(entryOf\(line, s\)\)/.test(dsrc) && /if \(line\.sceneId\) e\.sceneId = line\.sceneId;/.test(dsrc), 'every line the dialogue strip shows is kept in the history with its scene id');
    const pushes = [];
    for (const f of walk(SRC)) { const src = fs.readFileSync(f, 'utf8'); for (const m of src.matchAll(/backlog\.push\(/g)) pushes.push(path.relative(SRC, f) + ': ' + argAt(src, m.index + m[0].length)); }
    const bare = pushes.filter((x) => !/sceneId|entryOf|choice: true/.test(x));
    t.ok(pushes.length >= 6 && !bare.length, 'every history entry is either a line with its scene id or a reply you chose (' + pushes.length + '): ' + bare.join(' | '));
  }
};
