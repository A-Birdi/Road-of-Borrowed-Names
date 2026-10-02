// Creatures A (battle addendum §9, §10, §18, §23.5): the Chapter 1–3 creature families'
// deliveries, poses and audit. For every enemy of these families and every move kind it uses:
// the family's delivery returns valid visual cues (foe / fx / pose / sfx; every frame set it
// names exists), its contact lies inside its performance, the sequencer still places every rules
// result exactly once, in order, at the contact (none invented); a warded Strike-family move
// meets the seal at the contact; reduced motion keeps every cue and result but no travel; Rest
// keeps its rest pose. Every enemy id has an audit disposition, and the frame budget is bounded.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const A = RB.creaturesA, Q = RB.battleSeq, EA = RB.enemyArt, FX = RB.battleFx.fx;
  t.ok(A && Q && EA, 'the Creatures A rig, the sequencer and the enemy art are loaded');
  const FAM = A.FAMILIES;
  const E = RB.content.enemies;
  const kindsOf = (e) => {
    const ks = new Set();
    const add = (k) => ks.add(String(k).split(':')[0]);
    (e.pattern || []).forEach(add);
    (e.phases || []).forEach((ph) => (ph.pattern || []).forEach(add));
    Object.keys(e.intents || {}).forEach(add);
    return [...ks];
  };
  const mine = Object.keys(E).filter((id) => FAM.indexOf(E[id].art) >= 0).sort();
  const only = (globalThis.process && process.env.CA_FAM) || null; // (while authoring: one family)
  t.eq(mine.length, 36, 'the inventory\'s 36 enemies use these ten families');

  // the rules' results a move of each kind produces (a fixture per kind, as RB.combatLogic.foeAct would)
  const RESULT = {
    strike: [{ t: 'hit', who: 'pc', n: 2 }], lie: [{ t: 'hit', who: 'pc', n: 2 }], mirror: [{ t: 'hit', who: 'pc', n: 2 }], chill: [{ t: 'hit', who: 'pc', n: 2 }],
    sweep: [{ t: 'hit', who: 'pc', n: 2 }, { t: 'hit', who: 'comp', n: 2 }], flood: [{ t: 'block', who: 'pc', n: 1 }, { t: 'hit', who: 'pc', n: 1 }, { t: 'hit', who: 'comp', n: 2 }],
    gust: [{ t: 'stripWard' }, { t: 'hit', who: 'pc', n: 2 }],
    heat: [{ t: 'heat', n: 1 }], shroud: [{ t: 'shroud' }], charge: [{ t: 'charge' }], mend: [{ t: 'mend' }], silence: [{ t: 'silence' }], plea: [{ t: 'plea' }],
  };
  const SINGLE = { strike: 1, lie: 1, mirror: 1, chill: 1 };
  const view = { pc: 10, comp: 10, max: 10, ward: { pc: 0, comp: 0 }, foes: [{ knots: 2, maxKnots: 3 }], cur: 0, knots: 2, maxKnots: 3 };
  const ctx = (art, o) => Object.assign({ comp: 'mio', reduce: false, view: JSON.parse(JSON.stringify(view)), group: false, foe: 0, art, foeCol: '#888888' }, o || {});
  const VISUAL = { foe: 1, fx: 1, pose: 1, sfx: 1, beat: 1 };
  let checked = 0, problems = [];
  const fail = (m) => { if (problems.length < 30) problems.push(m); };
  for (const id of mine) {
    const e = E[id], art = e.art, spec = EA.P[art];
    if (only && art !== only) continue;
    for (const kind of kindsOf(e)) {
      if (kind === 'rest') continue;
      const fam = SINGLE[kind] ? 'strike' : kind === 'sweep' || kind === 'flood' || kind === 'gust' ? 'sweep' : 'cast';
      const D = Q.deliveryOf(art, kind, fam);
      if (!D) { fail(id + ' ' + kind + ': no delivery'); continue; }
      for (const variant of ['normal', 'reduce', 'ward', 'soft']) {
        if ((variant === 'ward' || variant === 'soft') && !SINGLE[kind]) continue;
        const fx = variant === 'ward' ? [{ t: 'countered', kind, foe: 0 }] : variant === 'soft' ? [{ t: 'block', who: 'pc', n: 1 }, { t: 'hit', who: 'pc', n: 1 }] : RESULT[kind].map((f) => Object.assign({}, f));
        const it = { kind, target: 'pc', label: kind };
        // what the delivery itself returns
        let raw = null;
        const a = { kind, fam, me: 0, aimed: SINGLE[kind] ? 'pc' : 'pc', dir: SINGLE[kind] ? 'pc' : fam === 'sweep' ? 'party' : null, fv: { knots: 2, maxKnots: 3 }, comp: 'mio', countered: variant === 'ward', wardBlock: variant === 'ward', ctx: ctx(art, { reduce: variant === 'reduce', blocked: variant === 'soft' ? { pc: true } : {} }), T: Q.T, foeCue: (o) => Object.assign({ type: 'foe', foe: 0 }, o), fx };
        try { raw = D(a); } catch (err) { fail(id + ' ' + kind + ' ' + variant + ': throws ' + err.message); continue; }
        if (!raw || !Array.isArray(raw.cues) || !(raw.contact >= 0) || !(raw.end > raw.contact)) { fail(id + ' ' + kind + ' ' + variant + ': bad return'); continue; }
        if (raw.contact > raw.end - 150) fail(id + ' ' + kind + ' ' + variant + ': contact ' + raw.contact + ' too close to the end ' + raw.end);
        for (const c of raw.cues) {
          if (!VISUAL[c.type] || c.type === 'beat') fail(id + ' ' + kind + ': a ' + c.type + ' cue from a delivery');
          if (!(c.at >= 0) || c.at > raw.end) fail(id + ' ' + kind + ' ' + variant + ': cue at ' + c.at + ' outside 0…' + raw.end);
          if (c.type === 'fx' && !FX[c.name]) fail(id + ' ' + kind + ': unknown effect ' + c.name);
          if (c.type === 'fx' && c.p && c.p.foe !== 0) fail(id + ' ' + kind + ': effect ' + c.name + ' not on its creature');
          if (c.type === 'foe') {
            if (!(c.d > 0)) fail(id + ' ' + kind + ': a foe cue without a duration');
            if (['prep', 'exec', 'cast', 'recover', 'rest'].indexOf(c.act) < 0) fail(id + ' ' + kind + ': act ' + c.act);
            if (c.at + c.d > raw.end + 1) fail(id + ' ' + kind + ' ' + variant + ': ' + c.act + ' runs past the end (' + (c.at + c.d) + ' > ' + raw.end + ')');
            if (c.family) {
              const famName = String(c.family).split('@')[0];
              if (!(spec.poses[c.act + '.' + famName] || (spec.alias && spec.alias[c.act + '.' + famName]))) fail(id + ' ' + kind + ': no frame set ' + c.act + '.' + famName);
              const at = String(c.family).split('@')[1];
              if (at != null && +at >= (spec.poses[c.act + '.' + famName] || 0)) fail(id + ' ' + kind + ': held frame ' + c.family + ' out of range');
            }
            if (variant === 'reduce' && c.travel) fail(id + ' ' + kind + ': travel with reduced motion');
            if (c.travel && ['pc', 'comp', 'party', 'foes'].indexOf(c.travel.to) < 0) fail(id + ' ' + kind + ': travel to ' + c.travel.to);
          }
        }
        if (variant === 'normal' && !raw.cues.some((c) => c.type === 'foe' && (c.act === 'prep' || c.act === 'cast'))) fail(id + ' ' + kind + ': no visible preparation or initiating gesture');
        if (variant === 'normal' && !raw.cues.some((c) => c.type === 'foe' && c.at + c.d >= raw.contact)) fail(id + ' ' + kind + ': nothing performs through the contact');
        if (variant === 'normal' && SINGLE[kind] && !raw.cues.some((c) => c.type === 'foe' && c.at >= raw.contact - 40 && (c.act === 'recover' || c.act === 'exec'))) fail(id + ' ' + kind + ': no recovery after contact');
        // and through the sequencer: every rules result once, in order, at the contact
        const ch = Q.choreo.enemy(it, fx, Object.assign(ctx(art, { reduce: variant === 'reduce', wardBlock: variant === 'ward' })));
        const beats = ch.cues.filter((c) => c.type === 'beat');
        const want = fx.map((f) => f.t);
        if (JSON.stringify(beats.map((c) => c.f.t)) !== JSON.stringify(want)) fail(id + ' ' + kind + ' ' + variant + ': beats ' + beats.map((c) => c.f.t) + ' ≠ ' + want);
        else if (beats[0].at !== raw.contact) fail(id + ' ' + kind + ' ' + variant + ': first result at ' + beats[0].at + ', contact ' + raw.contact);
        if (variant === 'ward') { const sb = ch.cues.find((c) => c.type === 'fx' && c.name === 'sealBlock'); if (!sb || sb.at !== raw.contact) fail(id + ' ' + kind + ': the seal does not block at contact'); }
        if (ch.end < raw.end) fail(id + ' ' + kind + ': the action ends before its performance');
        checked++;
      }
    }
  }
  t.ok(!problems.length, 'every delivery is valid (' + checked + ' move variants checked)' + (problems.length ? ':\n    ' + problems.join('\n    ') : ''));
  t.ok(checked >= 150, 'a full matrix was checked: ' + checked);

  // a delivery never invents a result: the beat it tries to add is dropped, its numbers are the rules'
  const strikeD = Q.deliveryOf('moth', 'strike', 'strike');
  t.ok(!!strikeD, 'the Flour Moth has its own Strike');
  const sw = strikeD({ kind: 'strike', fam: 'strike', me: 0, aimed: 'pc', dir: 'pc', fv: {}, comp: null, countered: false, wardBlock: false, ctx: ctx('moth', { comp: null }), T: Q.T, foeCue: (o) => Object.assign({ type: 'foe', foe: 0 }, o), fx: [{ t: 'hit', who: 'pc', n: 2 }] });
  // §18.2 timing: aim 0–260, approach 260–640 (travel), contact 640, recovery from 760, settled by 1250
  const fc = sw.cues.filter((c) => c.type === 'foe');
  t.eq([sw.contact, sw.end], [640, 1250], 'the swoop: contact at 640, its end at 1250');
  t.ok(fc[0].act === 'prep' && fc[0].at === 0 && fc[0].d === 260, 'aims 0–260');
  const appr = fc.find((c) => c.act === 'exec' && c.travel && c.travel.shape === 'out');
  t.ok(appr && appr.at === 260 && appr.at + appr.d === 640 && appr.travel.to === 'pc' && appr.travel.arc > 0, 'an arcing approach 260–640 toward the actual target');
  const back = fc.find((c) => c.act === 'recover' && c.travel && c.travel.shape === 'back');
  t.ok(back && back.at === 760 && back.at + back.d === 1150, 'wings arrest and it returns 760–1150');
  t.ok(fc.some((c) => c.act === 'recover' && c.at === 1150 && c.at + c.d === 1250), 'settles into the hover 1150–1250');
  const comp = strikeD({ kind: 'strike', fam: 'strike', me: 0, aimed: 'comp', dir: 'comp', fv: {}, comp: 'mio', countered: false, wardBlock: false, ctx: ctx('moth'), T: Q.T, foeCue: (o) => Object.assign({ type: 'foe', foe: 0 }, o), fx: [{ t: 'hit', who: 'comp', n: 2 }] });
  t.ok(comp.cues.filter((c) => c.travel).every((c) => c.travel.to === 'comp'), 'aimed at the companion, it travels to the companion');
  const sh = Q.deliveryOf('moth', 'shroud', 'cast')({ kind: 'shroud', fam: 'cast', me: 0, aimed: 'pc', dir: null, fv: {}, comp: null, countered: false, wardBlock: false, ctx: ctx('moth'), T: Q.T, foeCue: (o) => Object.assign({ type: 'foe', foe: 0 }, o), fx: [{ t: 'shroud' }] });
  t.eq(sh.end, 1450, 'Shroud lasts 1,450 ms (§18.4)');
  t.ok(sh.cues.some((c) => c.type === 'fx' && c.name === 'veilRelease') && sh.cues.some((c) => c.type === 'fx' && c.name === 'mistRoll'), 'Shroud releases its powder and it settles over the knots');

  // posed-frame variants: family sets, held frames, reduced-motion key frames
  const moth = EA.P.moth;
  const r1 = A.resolve(moth, { act: 'exec', family: 'strike', k: 0.6 }, false);
  t.ok(r1 && r1.act === 'exec.strike' && r1.k === 0.6, 'act + family picks the frame set');
  const r2 = A.resolve(moth, { act: 'exec', family: 'strike@3', k: 0.1 }, false);
  t.ok(r2 && r2.act === 'exec.strike' && Math.floor(r2.k * moth.poses['exec.strike']) === 3, 'a held key pose (@3)');
  const r3 = A.resolve(moth, { act: 'recoil', k: 0.7 }, true);
  t.ok(r3 && Math.floor(r3.k * moth.poses.recoil) === 0, 'reduced motion holds one key frame');
  t.eq(A.resolve(moth, { act: 'recoil', k: 0.7 }, false), null, 'a plain act in motion is the seam\'s own');

  // every family: authored reactions and rest; every enemy: a disposition
  for (const f of FAM) {
    const s = EA.P[f];
    const miss = ['rest', 'recoil', 'release', 'balk', 'settle'].filter((k) => !(s.poses && s.poses[k]));
    t.ok(!miss.length, f + ': authored rest and reactions' + (miss.length ? ' (missing ' + miss + ')' : ''));
    t.ok(s.frames >= 6 && s.frames <= 12, f + ': 6–12 idle drawings (' + s.frames + ')');
    t.ok(!!A.audit.families[f], f + ': a family audit record');
  }
  const noDisp = mine.filter((id) => !A.audit.enemies[id] || ['upgraded', 'meets', 'incomplete'].indexOf(A.audit.enemies[id].disposition) < 0);
  t.ok(!noDisp.length, 'every enemy has an audit disposition' + (noDisp.length ? ' (missing: ' + noDisp.join(', ') + ')' : ''));

  // resources: the frames a family can cache, as raw RGBA (w × h × 4 × frames); the enemy-art cache is LRU-bounded
  let worst = 0;
  for (const f of FAM) { const s = EA.P[f]; const n = s.frames + Object.values(s.poses).reduce((m, v) => m + v, 0); worst = Math.max(worst, s.w * s.h * 4); t.ok(n <= 140, f + ': ' + n + ' frames in all'); }
  t.ok(worst * 140 <= 48 * 1048576, 'even a full enemy-art cache of the largest frame stays under the 48 MiB budget (' + (worst * 140 / 1048576).toFixed(1) + ' MiB)');
};
