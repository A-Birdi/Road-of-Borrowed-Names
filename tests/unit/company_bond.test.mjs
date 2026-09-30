// Companionship (src/engine/58_companion.js, src/content/company/; addendum §6–9, §19, §23.3):
// the exact bond table, thresholds and cap, the +3 personal quest, the puzzle region and total
// caps, no loss and no farming (replays, reloads, repeated conversations award nothing), legacy
// reconstruction from verified flags only, independent campaigns, the reaction policy, invitations
// (pending, deferred, expired, replaced after solving), thoughts, forward recording of replies,
// and the content: every companion's six topics, ritual, places, memories and furigana.
import fs from 'node:fs';
import path from 'node:path';
import { load, root } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const S = RB.state, K = RB.company, CC = RB.content.company;
  const COMPS = ['nao', 'mio', 'ren', 'suzu'];
  const PQ = { suzu: 'co_suzu', nao: 'lf_nao', mio: 'lf_mio', ren: 'ren_ushio' };
  const fresh = (o) => { const s = S.newCampaign({}); s.map = 'rw.village'; Object.assign(s, o || {}); return s; };
  const committed = (comp, flags) => { const s = fresh({ comp }); Object.assign(s.flags, { departed: true, ch1_done: true }, flags || {}); return s; };
  const clone = (x) => JSON.parse(JSON.stringify(x));
  // run a scene hook as the runner would, against a given state
  const hook = async (s, name, ...args) => { const prev = RB.game.s; RB.game.s = s; try { await RB.hooks[name](args, {}); } finally { RB.game.s = prev; } };

  // ---- the exact table (§8.2) ---------------------------------------------------------------------------
  {
    const s = committed('mio');
    t.eq(K.sync(s, 'live'), [], 'recruitment and Chapter 1 give nothing (setting out is the start, zero points)');
    t.eq(K.score(s), 0, 'score 0 after recruitment');
    t.ok(s.company.memories.some((m) => m.id === 'story:recruit'), 'setting out together is remembered (no points)');
    s.flags.ch2_done = true;
    t.eq(K.sync(s, 'live'), ['ch2'], 'Chapter 2 completed together: one event');
    t.eq(s.company.bond, { ch2: 1 }, 'Chapter 2 is +1');
    s.flags.ch3_done = s.flags.ch4_done = s.flags.ch5_done = true;
    K.sync(s, 'live');
    t.eq([s.company.bond.ch3, s.company.bond.ch4, s.company.bond.ch5, K.score(s)], [1, 1, 1, 4], 'Chapters 3, 4 and 5: +1 each');
    s.quests.lf_mio = { stage: 2, done: true, t: 1 };
    K.sync(s, 'live');
    t.eq([s.company.bond.pq, K.score(s)], [3, 7], 'the committed companion\'s own quest: +3');
    s.quests.co_suzu = { stage: 3, done: true, t: 1 };
    K.sync(s, 'live');
    t.eq(K.score(s), 7, 'another companion\'s quest never counts');
  }
  // stage thresholds (the descriptor, never the number)
  {
    const s = committed('nao');
    const at = (n) => { s.company.bond = {}; for (let i = 0; i < n; i++) s.company.bond['x' + i] = 1; return K.stage(s).id; };
    t.eq([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20].map(at),
      ['walking', 'walking', 'walking', 'rhythm', 'rhythm', 'rhythm', 'trusted', 'trusted', 'trusted', 'trusted', 'lasting', 'lasting', 'lasting', 'lasting', 'lasting'], 'thresholds 0–2 / 3–5 / 6–9 / 10–12, capped');
    s.company.bond = { a: 30 };
    t.eq(K.score(s), 12, 'the derived score is capped at 12');
  }
  // the whole table sums to more than the cap, and every event counts once
  {
    const s = committed('ren', { ch2_done: true, ch3_done: true, ch4_done: true, ch5_done: true });
    s.quests.ren_ushio = { stage: 1, done: true, t: 1 };
    K.sync(s, 'live');
    for (const r of ['saltglass', 'cinder', 'snowbell', 'lanternfall']) K.onResolved(s, { kind: 'puzzle', id: 'p_' + r, region: r, method: 'secured' });
    await hook(s, 'co_bond', 'reflect:travel'); await hook(s, 'co_bond', 'reflect:keep');
    K.award(s, 'ending', 2); for (const n of [1, 2, 3]) K.award(s, 'project:' + n, 1);
    const b = s.company.bond;
    t.eq(Object.keys(b).filter((k) => k.startsWith('puzzle:')).length, 3, 'puzzles and cases together: at most three');
    const sum = Object.values(b).reduce((a, x) => a + x, 0);
    t.eq(sum, 4 + 3 + 3 + 2 + 2 + 3, 'every row of the table recorded once (sum ' + sum + ')');
    t.eq(K.score(s), 12, 'the displayed bond stays at the cap');
    const before = clone(s);
    // farming attempts: replays, repeated conversations, re-resolving, reloads
    K.sync(s, 'live'); K.sync(s, 'load');
    await hook(s, 'co_bond', 'reflect:travel'); await hook(s, 'co_bond', 'reflect:keep'); await hook(s, 'co_bond', 'reflect:other');
    for (let i = 0; i < 3; i++) await hook(s, 'co_heard', 't.ren.polish');
    K.onResolved(s, { kind: 'puzzle', id: 'p_saltglass', region: 'saltglass', method: 'sheltered' });
    K.onResolved(s, { kind: 'case', id: 'c_other', region: 'reedwake', method: 'deduced' });
    RB.save.migrate(s); RB.save.migrate(s);
    t.eq(s.company.bond, before.company.bond, 'no farming: replays, repeated topics, re-solving, the other route and reloads award nothing');
    t.eq(s.awarded, before.awarded, 'no new award ids either');
  }
  // puzzles: one per region, only together, minor things never count
  {
    const s = committed('suzu');
    K.onResolved(s, { kind: 'puzzle', id: 'a', region: 'saltglass', method: 'secured' });
    K.onResolved(s, { kind: 'puzzle', id: 'b', region: 'saltglass', method: 'secured' });
    K.onResolved(s, { kind: 'puzzle', id: 'c', region: 'cinder', method: 'secured', minor: true });
    t.eq(s.company.bond, { 'puzzle:saltglass': 1 }, 'one award per region; an incidental (minor) solution none');
    t.eq(s.company.memories.filter((m) => m.kind === 'discoveries').length, 3, 'each resolution is still remembered (Discoveries)');
    const p = fresh({ provisional: 'nao' });
    K.onResolved(p, { kind: 'puzzle', id: 'a', region: 'saltglass' });
    t.eq(p.company.bond, {}, 'no bond before the companion is committed');
  }
  // no loss: nothing ever removes an event (failure, early return, defeat, help, a changed pet)
  {
    const s = committed('nao', { ch2_done: true });
    K.sync(s, 'live');
    const b = clone(s.company.bond);
    s.company.pet = 'cat'; s.company.pets.cat = { name: 'Koma' };
    s.company.pet = null;
    s.flags.ch2_done = false; // even a flag cleared by a replayed test fixture does not take the event back
    K.sync(s, 'live'); RB.save.migrate(s);
    t.eq(s.company.bond, b, 'no deductions, no decay');
  }

  // ---- older saves: reconstruct verified milestones only ----------------------------------------------------
  {
    const old = committed('suzu', { ch2_done: true, ch3_done: true, lq_ally2: true });
    old.quests.co_suzu = { stage: 3, done: true, t: 12345 };
    old.quests.lf_nao = { stage: 2, done: true, t: 1 }; // someone else's story, done in this save
    delete old.company; delete old.awarded;
    const a = RB.save.migrate(clone(old));
    t.eq(a.company.bond, { ch2: 1, ch3: 1, pq: 3 }, 'legacy: chapters and the companion\'s own quest, silently');
    t.ok(a.company.memories.every((m) => m.retro && m.id.startsWith('story:')), 'reconstructed memories are marked as from the journey\'s record');
    t.eq(a.company.memories.map((m) => m.id).sort(), ['story:ch2', 'story:ch3', 'story:lq2', 'story:pq_suzu', 'story:recruit'], 'only verifiable story moments; no pets, puzzles or conversations invented');
    t.eq(a.company.memories.find((m) => m.id === 'story:pq_suzu').t, 12345, 'the quest memory keeps the quest\'s own time');
    t.eq(Object.keys(a.company.react).length + (a.company.talk._pending ? 1 : 0), 0, 'no reactions or topics invented on load');
    const b = RB.save.migrate(clone(a));
    t.eq([b.company.bond, b.company.memories.length], [a.company.bond, a.company.memories.length], 'idempotent');
    const none = fresh({ flags: { ch2_done: true } });
    delete none.company;
    t.eq(RB.save.migrate(none).company.bond, {}, 'no committed companion: nothing to reconstruct');
    // two campaigns stay independent
    const s1 = committed('mio', { ch2_done: true }), s2 = committed('mio');
    K.sync(s1, 'live');
    t.eq([K.score(s1), K.score(s2)], [1, 0], 'two campaigns, two relationships');
  }

  // ---- reactions: the policy on top of the core (§7.5) ------------------------------------------------------------
  {
    K.addReactions([
      { id: 'q_once', comp: 'nao', event: 'field:x', once: true, lines: [{ jp: 'あ', en: 'a' }] },
      { id: 'q_two', comp: 'nao', event: 'field:x', lines: [{ jp: 'い', en: 'b' }] },
      { id: 'q_known', comp: 'nao', event: 'field:y', known: 'lf_bell_rung', priority: 5, lines: [{ jp: 'う', en: 'c' }] },
      { id: 'q_plain', comp: 'nao', event: 'field:y', lines: [{ jp: 'え', en: 'd' }] },
      { id: 'q_warm', comp: 'nao', event: 'field:z', tone: 'warm', lines: [{ jp: 'お', en: 'e' }] },
      { id: 'q_dry', comp: 'nao', event: 'field:z', tone: 'dry', lines: [{ jp: 'か', en: 'f' }] },
    ]);
    const s = committed('nao');
    const picks = [1, 2, 3, 4].map((i) => K.react(s, { id: 'x' + i, event: 'field:x' }).id);
    t.eq(picks.filter((p) => p === 'q_once').length <= 1, true, 'once: an entry marked once is used at most once in a campaign');
    t.eq(K.react(s, { id: 'x1', event: 'field:x' }).id, picks[0], 'the same resolution keeps its line');
    t.eq(K.react(s, { id: 'y1', event: 'field:y' }).id, 'q_plain', 'required facts: an entry needing unknown facts is not used');
    s.flags.lf_bell_rung = true;
    t.eq(K.react(s, { id: 'y2', event: 'field:y' }).id, 'q_known', 'and is preferred once the companion knows them');
    t.eq(K.react(s, { id: 'z1', event: 'field:z', tone: 'dry' }).id, 'q_dry', 'tone preference');
    t.ok((s.company.talk._recent_r || []).length <= 8, 'recent choices are bounded');
  }

  // ---- invitations: one pending, deferred, expired, replaced after solving (§7.4) -------------------------------------
  {
    const s = committed('nao', { ch1_done: true });
    s.quests.sg_main = { stage: 3, done: false, t: 1 };
    K.refresh(s);
    t.eq(K.pending(s) && K.pending(s).id, 'inv.sg_hands', 'the Saltglass question becomes pending in its moment');
    t.ok(K.indicator(s), 'the discreet indicator is on');
    await hook(s, 'co_defer', 'inv.sg_hands');
    K.refresh(s);
    t.ok(K.pending(s) && K.pending(s).quiet && !K.indicator(s), 'Not now: free, the topic stays quietly (no indicator)');
    s.quests.co_main = { stage: 7, done: false, t: 1 };
    K.refresh(s);
    t.eq(K.pending(s).id, 'inv.sg_hands', 'at most one pending topic');
    s.flags.sg_wataru_self = true;
    K.refresh(s);
    t.eq([K.pending(s).id, K.pending(s).st, K.pending(s).scene], ['inv.sg_hands', 'after', 'co.inv_sg_hands_after'], 'solved first: replaced by the result-aware follow-up');
    await hook(s, 'co_done', 'inv.sg_hands');
    t.eq(K.pending(s) && K.pending(s).id, 'inv.co_fire', 'done: the slot is free for the next moment');
    // expiry without solving
    const e = committed('mio');
    e.quests.lf_main = { stage: 2, done: false, t: 1 };
    K.refresh(e);
    t.eq(K.pending(e).id, 'inv.lf_word', 'Lanternfall question pending');
    e.flags.ch5_done = true;
    K.refresh(e);
    t.ok(!K.pending(e) || K.pending(e).id !== 'inv.lf_word', 'expired when its moment passes unsolved');
    t.eq(e.company.talk['inv.lf_word'].st, 'expired', 'recorded as expired, not as a failure');
    // answered: the reply is remembered as a narrative fact only
    const a = committed('ren');
    a.quests.lf_main = { stage: 3, done: false, t: 1 };
    K.refresh(a);
    await hook(a, 'co_answer', 'inv.lf_word', 'wait');
    t.ok(!K.pending(a) || K.pending(a).id !== 'inv.lf_word', 'answered: no longer pending');
    t.ok(S.test(a, 'talk.inv.lf_word=wait') && !S.test(a, 'talk.inv.lf_word=no'), 'the reply is readable by later lines');
    t.eq(a.company.bond, {}, 'answering (or not) gives nothing and takes nothing');
    // the journey reflections wait their turn and give their one event each
    const r = committed('suzu', { ch2_done: true });
    K.refresh(r);
    t.eq(K.pending(r) && K.pending(r).id, 'reflect:travel', 'How We Travel is offered after Chapter 2');
    await hook(r, 'co_answer', 'reflect:travel', 'plan'); await hook(r, 'co_bond', 'reflect:travel'); await hook(r, 'co_done', 'reflect:travel');
    t.eq(r.company.bond['reflect:travel'], 1, 'the reflection: +1 once');
    t.ok(!K.pending(r), 'and is not offered again');
    r.flags.ch4_done = true;
    K.refresh(r);
    t.eq(K.pending(r) && K.pending(r).id, 'reflect:keep', 'What We Keep after Chapter 4');
  }

  // ---- What We Keep uses a recorded moment, or says honestly that there is none -----------------------------------------
  {
    const s = committed('nao', { ch2_done: true, ch4_done: true, lq_ally1: true });
    K.sync(s, 'live');
    const m = K.keepMoment(s);
    t.eq(m && m.id, 'story:lq1', 'the most specific recorded moment (the long road over a chapter)');
    t.ok(K.keepLines(s, m)[0].en.includes('Chigusa'), 'and the companion speaks of that moment');
    const bare = committed('mio'); bare.company.memories = [];
    t.eq(K.keepLines(bare, K.keepMoment(bare))[0].en, CC.keep.none.mio.en, 'no recorded moment: an honest answer, nothing invented');
    K.onResolved(s, { kind: 'puzzle', id: 'mill', region: 'reedwake', method: 'repaired', title: { jp: '{水車|すいしゃ}', en: 'The mill wheel' } });
    t.ok(K.keepLines(s, K.keepMoment(s))[0].en.includes('"The mill wheel"'), 'a discovery is named by its recorded title');
  }

  // ---- thoughts: recent result > quest > rest > place; never a hint ------------------------------------------------------
  {
    const s = committed('mio', { ch2_done: true });
    s.map = 'sg.harbor';
    t.eq(K.thought(s).kind, 'place', 'in Saltglass with nothing pressing: a thought about the place');
    s.map = 'sg.inn';
    t.eq(K.thought(s).kind, 'rest', 'at an inn: a resting thought');
    s.quests.lf_mio = { stage: 1, done: false, t: 1 };
    t.eq(K.thought(s).kind, 'quest', 'her own quest in progress comes first');
    s.flags.sg_wataru_confessed = true;
    K.settle && (RB.game.s = s, K.settle(), RB.game.s = null);
    t.eq(K.thought(s).kind, 'recent', 'a decision just made comes first of all');
    t.ok(K.thought(s).text.en.includes('told'), 'and it is about what actually happened');
    s.playtime += 60 * 60;
    t.ok(K.thought(s).kind !== 'recent', 'a recent result stops being recent');
    for (const c of COMPS) {
      const x = committed(c);
      x.map = 'rw.village';
      t.ok(K.thought(x) && K.placeTalk(x), c + ': something to say in Reedwake');
    }
  }

  // ---- forward recording: every placement at the start of its own branch -----------------------------------------------
  {
    t.ok(CC.recorded.length >= 20 && CC.recorded.every((r) => r.ok), 'every reply the story keeps no flag for is recorded forward (' + CC.recorded.length + ')');
    for (const sid of [...new Set(CC.recorded.map((r) => r.scene))]) {
      const sc = RB.content.scenes[sid];
      const src = RB.content.sceneSrc.find((x) => x.src.includes('@scene ' + sid + '\n'));
      const orig = RB.script.parse(src.src, src.file).scenes[sid];
      const strip = sc.cmds.filter((c) => !(c.op === 'hook' && c.args[0] === 'co_note'));
      let same = strip.length === orig.cmds.length && strip.every((c, i) => c.op === orig.cmds[i].op && c.line === orig.cmds[i].line);
      for (const [lab, i] of Object.entries(orig.labels)) {
        const j = sc.labels[lab];
        const at = sc.cmds[j].op === 'hook' && sc.cmds[j].args[0] === 'co_note' ? sc.cmds[j + 1] : sc.cmds[j];
        if (!orig.cmds[i] ? at : at.line !== orig.cmds[i].line || at.op !== orig.cmds[i].op) same = false;
      }
      const recs = CC.recorded.filter((r) => r.scene === sid);
      const placed = recs.every((r) => { const c = sc.cmds[sc.labels[r.label]]; return c.op === 'hook' && c.args[1] === r.id && c.args[2] === r.value; });
      t.ok(same && placed, sid + ': the story is unchanged and each reply records itself');
    }
    const s = committed('suzu');
    await hook(s, 'co_note', 'suzu_night', 'push');
    await hook(s, 'co_note', 'suzu_night', 'reach');
    t.ok(S.test(s, 'talk.d.suzu_night=push'), 'a recorded reply is kept as first given');
  }

  // ---- memories: event-time snapshots; recollection changes nothing -------------------------------------------------------
  {
    const s = committed('ren', { ch2_done: true });
    K.sync(s, 'live');
    const m = s.company.memories.find((x) => x.id === 'story:ch2');
    t.ok(m.reply && m.reply.jp && m.place && m.place.en === 'Saltglass' && m.comp === 'ren', 'a chapter memory: place, what happened and the companion\'s own words then');
    s.company.pets.cat = { name: 'Koma', nameAtMeet: 'Koma' };
    RB.game.s = s; RB.bus.emit('pet:met', { species: 'cat' }); RB.game.s = null;
    const pm = s.company.memories.find((x) => x.id === 'pet:cat');
    s.company.pets.cat.name = 'Tama';
    t.ok(pm && pm.kind === 'pets' && pm.petName === 'Koma' && pm.reply && /Cats/.test(pm.reply.en), 'meeting an animal: a Pets memory with the name it had then');
    const snap = clone(s);
    if (RB.ui.companyPages && RB.ui.companyPages.recollection) RB.ui.companyPages.recollection(s, m);
    t.eq(clone(s), snap, 'the recollection view is a transcript: it changes nothing');
  }

  // ---- no combat effects ---------------------------------------------------------------------------------------------------
  {
    const src = ['src/engine/95_combat.js', 'src/engine/96_combat_sim.js', 'src/content/02_companions.js', 'src/ui/80_combat.js', 'src/learn/10_mastery.js', 'src/learn/20_tasks.js', 'src/lang/50_answers.js']
      .map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
    t.ok(!/company|bond|RB\.company/.test(src), 'battle, support actions, rewards, answers and learning never read the bond');
    const acts = RB.content.companionActions;
    t.ok(COMPS.every((c) => acts[c].every((a) => !a.unlock || !/bond|memory|talk/.test(a.unlock))), 'support actions unlock only from the story, never from bond');
  }

  // ---- content coverage and language ----------------------------------------------------------------------------------------
  {
    for (const c of COMPS) {
      const tops = CC.topics.filter((x) => x.comp === c).sort((a, b) => a.slot - b.slot);
      t.eq(tops.map((x) => x.slot), [1, 2, 3, 4, 5, 6], c + ': six rest topics, one per slot');
      t.eq(tops.map((x) => x.stage), ['early', 'early', 'middle', 'middle', 'late', 'late'], c + ': two early, two middle, two late');
      t.ok(tops.every((x) => RB.content.scenes[x.scene]), c + ': every topic has its scene');
      t.eq(tops.filter((x) => x.reflect).map((x) => x.slot), [1, 5], c + ': the two reflections take the travel-habit and remembered-discovery slots');
      const heardHooks = tops.filter((x) => !x.reflect).every((x) => RB.content.scenes[x.scene].cmds.some((k) => k.op === 'hook' && k.args[0] === 'co_heard' && k.args[1] === x.id));
      t.ok(heardHooks, c + ': each topic records only that it was heard');
      const bondHooks = tops.filter((x) => !x.reflect).some((x) => RB.content.scenes[x.scene].cmds.some((k) => k.op === 'hook' && k.args[0] === 'co_bond'));
      t.ok(!bondHooks, c + ': ordinary topics give no bond');
      for (const sc of ['co.reflect_travel_' + c, 'co.reflect_keep_' + c]) {
        const cmds = RB.content.scenes[sc].cmds;
        const ch = cmds.filter((k) => k.op === 'choice');
        t.ok(ch[0].opts.length === 2 && /Not now/.test(ch[0].opts[1].en) && ch[1].opts.length >= 3, sc + ': Not now first, then at least two replies');
        t.ok(cmds.some((k) => k.op === 'hook' && k.args[0] === 'co_bond'), sc + ': gives its one event');
      }
      t.ok(CC.rituals[c] && RB.content.scenes[CC.rituals[c].scene], c + ': a rest ritual');
      t.ok(CC.bios[c] && CC.bios[c].summary.length >= 4 && CC.bios[c].first, c + ': what the player knows');
      for (const sp of ['cat', 'dog', 'bird', 'tanuki', '*']) t.ok(CC.pets[c][sp], c + ' on meeting a ' + sp);
      for (const key of ['recruit', 'ch2', 'ch3', 'ch4', 'lq1', 'lq2', 'pq_' + c]) {
        const d = CC.mem[key];
        t.ok(d && d.title && (d.text || (d.texts && d.texts[c])) && d.reply[c] && d.keep[c], c + ': memory ' + key + ' has its words and its callback');
      }
      for (const inv of CC.invites) for (const sc of [inv.scene, inv.after]) {
        t.ok(RB.content.scenes[sc].cmds.some((k) => k.op === 'say' && k.if && k.if.includes('comp=' + c)), sc + ' speaks for ' + c);
      }
      const keys = new Set(CC.places.filter((x) => x.comp === c).flatMap((x) => [].concat(x.where)));
      t.eq(['reedwake', 'saltglass', 'archive', 'cinder', 'snowbell', 'lanternfall', 'sa_mount', 'sa_still', 'koharuno', 'atlas'].filter((k) => !keys.has(k)), [], c + ': something to say about every region');
      for (const p of ['!post', 'post']) t.ok(CC.places.some((x) => x.comp === c && x.where === 'reedwake' && x.when === p), c + ': Reedwake before and after the ending');
      t.ok(CC.keep.frame[c].jp.includes('%T') && CC.keep.none[c], c + ': What We Keep framing and honest fallback');
    }
    // every Japanese string in the data: furigana on every kanji, every token in the lexicon
    const probs = [], unknown = new Map();
    const check = (line, where) => {
      const clean = line.replace(/%T/g, 'あの');
      for (const p of RB.jp.validate(clean)) probs.push(where + ': ' + (p.msg || JSON.stringify(p)));
      for (const tk of RB.jp.parse(clean)) {
        if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
        if (RB.jp.lookup(tk).unknown) unknown.set(tk.surface, where);
      }
    };
    const walk = (o, where) => {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, where + '[' + i + ']')); return; }
      for (const k in o) { if (k === 'jp' && typeof o[k] === 'string') check(o[k], where); else walk(o[k], where + '.' + k); }
    };
    walk(CC, 'company');
    t.eq(probs, [], 'every kanji in the companionship data has furigana');
    t.eq([...unknown].map(([k, w]) => k + ' ← ' + w), [], 'every Japanese token in the companionship data is in the lexicon');
    // and nothing romantic, jealous or punishing slipped in
    const text = JSON.stringify(CC) + RB.content.sceneSrc.filter((x) => /^company\//.test(x.file)).map((x) => x.src).join('\n');
    t.ok(!/\b(love you|in love|dating|go on a date|kiss|jealous|disappointed in you|resent|abandon)\b/i.test(text) && !/恋人|好き です 。 あなた|嫉妬/.test(text), 'no romance, jealousy or resentment in the words');
  }

  // ---- conditions used by the content ------------------------------------------------------------------------------------------
  {
    const s = committed('nao'); s.map = 'sb.inn_room';
    t.ok(S.test(s, 'rest') && S.test(s, 'rest=room') && S.test(s, 'rest!=camp'), 'rest conditions at the Snowbell inn room');
    s.map = 'sa.camp';
    t.ok(S.test(s, 'rest=camp') && !S.test(s, 'rest!=camp'), 'the Last Lamp camp is a camp');
    s.map = 'sb.obs_hall';
    t.ok(!S.test(s, 'rest'), 'a dungeon corridor is never a rest setting');
  }
};
