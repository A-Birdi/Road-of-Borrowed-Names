// Creatures C (expansion P16b; AC-1, C-82; battle addendum §5, §9, §10, §18): the creatures drawn in the interim on a
// borrowed family (F-36, F-93, F-104, F-135) each have a drawing of their own on the creature kit
// (src/ui/78u_creature_kit.js, 78v…78z_kit_*.js). For every one of them and every move kind it uses, the same checks
// as Creatures A: the delivery returns valid visual cues whose frame sets exist, its contact lies inside its
// performance, the sequencer places every rules result exactly once, in order, at the contact (none invented), a
// warded strike meets the seal at the contact, reduced motion keeps every cue and result but no travel. And for each
// kit family: authored rest and reactions, 6–12 idle drawings, every frame it can draw actually draws something, an
// audit record in its own words, and a frame budget the enemy-art cache can hold.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'audio', 'engine', 'learn', 'ui', 'content', 'atlas'], { __RB_TEST__: true });
  const A = RB.creaturesA, Q = RB.battleSeq, EA = RB.enemyArt, FX = RB.battleFx.fx, KIT = RB.creatureKit;
  t.ok(A && Q && EA && KIT, 'the creature kit, the Creatures A rig, the sequencer and the enemy art are loaded');
  const E = RB.content.enemies, OWN = RB.content.creaturesC || {};
  const ids = Object.keys(OWN).sort();
  t.eq(ids.length, 46, 'all 46 interim creatures have a drawing of their own (' + ids.length + ')');
  const notMoved = ids.filter((id) => !E[id] || E[id].art !== OWN[id] || !EA.P[OWN[id]]);
  t.ok(!notMoved.length, 'each one draws with its own family' + (notMoved.length ? ' (still borrowed: ' + notMoved.join(', ') + ')' : ''));
  const shared = {};
  for (const id of ids) (shared[OWN[id]] = shared[OWN[id]] || []).push(id);
  const twice = Object.entries(shared).filter(([, v]) => v.length > 1);
  t.ok(!twice.length, 'no two creatures share a drawing' + (twice.length ? ' (' + JSON.stringify(twice) + ')' : ''));

  const kindsOf = (e) => {
    const ks = new Set();
    const add = (k) => ks.add(String(k).split(':')[0]);
    (e.pattern || []).forEach(add);
    (e.phases || []).forEach((ph) => (ph.pattern || []).forEach(add));
    Object.keys(e.intents || {}).forEach(add);
    return [...ks];
  };
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
  let checked = 0;
  const problems = [];
  const fail = (m) => { if (problems.length < 30) problems.push(m); };
  for (const id of ids) {
    const e = E[id], art = e.art, spec = EA.P[art];
    if (!spec) continue;
    for (const kind of kindsOf(e)) {
      if (kind === 'rest') continue;
      if (!RESULT[kind]) { fail(id + ': an unknown kind ' + kind); continue; }
      const fam = SINGLE[kind] ? 'strike' : kind === 'sweep' || kind === 'flood' || kind === 'gust' ? 'sweep' : 'cast';
      const D = Q.deliveryOf(art, kind, fam);
      if (!D) { fail(id + ' ' + kind + ': no delivery'); continue; }
      for (const variant of ['normal', 'reduce', 'ward', 'soft']) {
        if ((variant === 'ward' || variant === 'soft') && !SINGLE[kind]) continue;
        const fx = variant === 'ward' ? [{ t: 'countered', kind, foe: 0 }] : variant === 'soft' ? [{ t: 'block', who: 'pc', n: 1 }, { t: 'hit', who: 'pc', n: 1 }] : RESULT[kind].map((f) => Object.assign({}, f));
        const it = { kind, target: 'pc', label: kind };
        const a = { kind, fam, me: 0, aimed: 'pc', dir: SINGLE[kind] ? 'pc' : fam === 'sweep' ? 'party' : null, fv: { knots: 2, maxKnots: 3 }, comp: 'mio', countered: variant === 'ward', wardBlock: variant === 'ward', ctx: ctx(art, { reduce: variant === 'reduce', blocked: variant === 'soft' ? { pc: true } : {} }), T: Q.T, foeCue: (o) => Object.assign({ type: 'foe', foe: 0 }, o), fx };
        let raw = null;
        try { raw = D(a); } catch (err) { fail(id + ' ' + kind + ' ' + variant + ': throws ' + err.message); continue; }
        if (!raw || !Array.isArray(raw.cues) || !(raw.contact >= 0) || !(raw.end > raw.contact)) { fail(id + ' ' + kind + ' ' + variant + ': bad return'); continue; }
        if (raw.contact > raw.end - 150) fail(id + ' ' + kind + ' ' + variant + ': contact ' + raw.contact + ' too close to the end ' + raw.end);
        for (const c of raw.cues) {
          if (!VISUAL[c.type] || c.type === 'beat') fail(id + ' ' + kind + ': a ' + c.type + ' cue from a delivery');
          if (!(c.at >= 0) || c.at > raw.end) fail(id + ' ' + kind + ' ' + variant + ': cue at ' + c.at + ' outside 0…' + raw.end);
          if (c.type === 'fx' && !FX[c.name]) fail(id + ' ' + kind + ': unknown effect ' + c.name);
          if (c.type === 'foe') {
            if (!(c.d > 0)) fail(id + ' ' + kind + ': a foe cue without a duration');
            if (['prep', 'exec', 'cast', 'recover', 'rest'].indexOf(c.act) < 0) fail(id + ' ' + kind + ': act ' + c.act);
            if (c.at + c.d > raw.end + 1) fail(id + ' ' + kind + ' ' + variant + ': ' + c.act + ' runs past the end');
            if (c.family) {
              const famName = String(c.family).split('@')[0];
              if (!(spec.poses[c.act + '.' + famName] || (spec.alias && spec.alias[c.act + '.' + famName]))) fail(id + ' ' + kind + ': no frame set ' + c.act + '.' + famName);
              const at = String(c.family).split('@')[1];
              if (at != null && +at >= (spec.poses[c.act + '.' + famName] || 0)) fail(id + ' ' + kind + ': held frame ' + c.family + ' out of range');
            }
            if (variant === 'reduce' && c.travel) fail(id + ' ' + kind + ': travel with reduced motion');
          }
        }
        if (variant === 'normal' && !raw.cues.some((c) => c.type === 'foe' && (c.act === 'prep' || c.act === 'cast'))) fail(id + ' ' + kind + ': no visible preparation or initiating gesture');
        if (variant === 'normal' && !raw.cues.some((c) => c.type === 'foe' && c.at + c.d >= raw.contact)) fail(id + ' ' + kind + ': nothing performs through the contact');
        const ch = Q.choreo.enemy(it, fx, ctx(art, { reduce: variant === 'reduce', wardBlock: variant === 'ward' }));
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
  t.ok(checked >= 120, 'a full matrix was checked: ' + checked);

  // every kit family: rest and reactions authored, 6–12 idle drawings, an audit in its own words, the frame budget
  const H = EA.H || EA._H || {};
  let worst = 0;
  const empty = [];
  for (const f of KIT.FAMS) {
    const s = EA.P[f];
    const miss = ['rest', 'recoil', 'release', 'balk', 'settle'].filter((k) => !(s.poses && s.poses[k]));
    t.ok(!miss.length, f + ': authored rest and reactions' + (miss.length ? ' (missing ' + miss + ')' : ''));
    t.ok(s.frames >= 6 && s.frames <= 12, f + ': 6–12 idle drawings (' + s.frames + ')');
    const au = A.audit.families[f];
    t.ok(!!au && (au.anatomy || '').length >= 40 && !!au.kit && au.moves && Object.keys(au.moves).length >= 1, f + ': a family audit record in its own words');
    const n = s.frames + Object.values(s.poses).reduce((m, v) => m + v, 0);
    t.ok(n <= 140, f + ': ' + n + ' frames in all');
    worst = Math.max(worst, s.w * s.h * 4);
    // every pose it can be asked for draws pixels (a frame left blank by a mistake shows nothing in battle)
    if (RB.pxkit && RB.pxkit.layer) {
      for (const act of Object.keys(s.poses)) {
        const L = RB.pxkit.layer(s.w, s.h, s.ox, s.oy);
        let out = null;
        try { out = s.pose(L, act, s.poses[act] - 1, s.poses[act], {}, H, -1) || L; } catch (err) { empty.push(f + ' ' + act + ' throws ' + err.message); continue; }
        let lit = 0;
        for (let i = 0; i < out.px.length; i += 7) if (out.px[i] >>> 24) lit++;
        if (lit < 40) empty.push(f + ' ' + act + ' (' + lit + ')');
      }
    }
  }
  t.ok(!empty.length, 'every pose of every kit family draws something' + (empty.length ? ': ' + empty.slice(0, 8).join(', ') : ''));
  t.ok(worst * 140 <= 48 * 1048576, 'a full enemy-art cache of the largest kit frame stays under the 48 MiB budget (' + (worst * 140 / 1048576).toFixed(1) + ' MiB)');
  // its figure on the map is the same drawing at rest, at the map's scale (no longer a borrowed shape)
  const figs = [];
  for (const id of ids) {
    const e = E[id], key = e.look && e.look.custom, fn = key && RB.sprites.customArt[key];
    if (key !== 'kit:' + e.art || !fn) { figs.push(id + ' (look ' + key + ')'); continue; }
    let n = 0;
    const buf = { rect: () => { n++; } };
    fn(buf, e.look, 'down', 0, false);
    if (n < 60) figs.push(id + ' (' + n + ' px)');
  }
  t.ok(!figs.length, 'each one\'s map figure is its own drawing at the map\'s scale' + (figs.length ? ': ' + figs.join(', ') : ''));
  const disp = ids.filter((id) => !A.audit.enemies[id] || A.audit.enemies[id].disposition !== 'upgraded');
  t.ok(!disp.length, 'every one is recorded in the audit as upgraded' + (disp.length ? ' (' + disp.join(', ') + ')' : ''));
};
