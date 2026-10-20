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
//     that was not cut short, and the Atlas's narration stays in its table (no narrator line written at a call).
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
};
