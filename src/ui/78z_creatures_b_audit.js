/* Creatures B — the audit record (battle addendum §9.1, §4 Phase D): one row per enemy that uses
 * a Chapter 4–6 / Atlas family, built from the game's own registries (the enemy's art, options,
 * pattern, phases and intents) and the families' rigs, plus the reviewed disposition below.
 * RB.creaturesB.auditRows() is read by tests/unit/creatures_b.test.mjs (every enemy must have a
 * disposition) and by tools/creatures_b_audit.mjs (the table in docs/battle/creatures_b.md).
 * Dispositions: 'upgraded' | 'meets standard (reverified)' | 'incomplete'. */
var RB = (globalThis.RB = globalThis.RB || {});

(function () {
  'use strict';
  const CB = RB.creaturesB;
  if (!CB) return;
  // what was reviewed for each enemy (variant specifics; anything not upgraded says why)
  const NOTES = {
    'sb.fox': { disposition: 'upgraded', note: 'white snow fox on the fox skeleton; breath smokes in the idle; Strike = crouch, spring (travel arc), bite, land on the forepaws; Chill = rear, draw breath, frost breath at the target' },
    'sb.ghost': { disposition: 'upgraded', note: 'blue-flame lantern; Strike = drawn back, swing through, lick of flame; false promise = a kind painted face and a warm light that turns cold at its target; Re-tying = bows, tail reaches a loose knot (no knot shown when none is loose)' },
    'sb.boss': { disposition: 'upgraded', note: 'guardian: standing lamp rocking on its stone foot; Chill (signature) = door opens, flame shrinks white, frost breath, door clacks shut; Strike = rock back, tip onto the toe, roof snow flung; plea = ember and a letter at the door; release and settle warm the flame' },
    'lf.conduit': { disposition: 'upgraded', note: 'pipe: Sweep = pressure climbs joint by joint from the base, the spout swings across, a jet arcs over each recipient, drips and a puddle remain; Hush = valve lid shuts, rising light sinks; Re-tying = bends low and pours a thread of light' },
    'lf.wraith': { disposition: 'upgraded', note: 'blue bell: Strike = a ram, lip leading, toll at contact, damped swing home; Sweep = full swing, the toll front passes each recipient; Gathering = held at the top of its arc, bands lit; Hush = strands bind its own mouth' },
    'lf.keeper': { disposition: 'upgraded', note: 'guardian: bronze on four pipe tendrils; Strike = one tendril lashes out; Flood (signature) = wheel spins, plate drops, water rolls across both; Hush = wheel winds the plate shut; false yes = bows while a tendril winds the rope away; plea = sinks on curled tendrils; Gathering = wheel wound, seams glow; phase lines unchanged' },
    'sa.wraith': { disposition: 'upgraded', note: 'veil: Strike = gathers tall, lunges, the sleeve wraps the target; Hush = spreads wide, the ring opens to a void, a soundless wave; Re-tying = one hem strip reaches a loose knot' },
    'sa.ghost': { disposition: 'upgraded', note: 'lavender lantern; Shroud = flame gutters, smoke pours over its knots; Heat = rises, paper bellies out, white-hot flame and shimmer; Strike as the lantern family' },
    'sa.hush': { disposition: 'upgraded', note: 'guardian: thirteen borrowed moves, each a formation of its own pages (lance, fan, pane, vortex, knot-stitch, scatter, tight ring) or a change of the hollow (eye shut, ink welling, embers, rime); dither edge replaced by stepped opacity rings; phase lines unchanged' },
    'atlas.bell': { disposition: 'upgraded', note: 'Atlas guardian on the bell rig in verdigris (heavier patina by hue); false promise = sly eyes and a ringing name tag that is not its own; Gathering (its phase-3 tell) held at the top of the arc; phase line unchanged' },
    'atlas.cartographer': { disposition: 'upgraded', note: 'Atlas guardian: Strike = chart drawn back and snapped out like a lash; Sweep = one long erasing brush stroke across the party; Shroud = blank sheets fold over it and drift onto its knots; plea = the chart held out flat with one thin road; settle lays the brush down' },
    'atlas.fox': { disposition: 'upgraded', note: 'warm fox wearing the borrowed name as a paper scarf (ends trail behind); Sweep = tail whirl trailing foxfire across the party; false promise = sits up with a leaf on its head and sends a pale double of itself' },
    'atlas.lamp': { disposition: 'upgraded', note: 'guttering orange lantern; Heat and Strike as the lantern family (the idle flame dips through a guttering shape)' },
    'atlas.mothlamp': { disposition: 'upgraded', note: 'pale lantern with its white moths circling (part of the creature: drawn by flame colour #d8c0a0); Shroud = smoke with the moths whirling out' },
  };
  const ALLOWED = ['upgraded', 'meets standard (reverified)', 'incomplete'];
  function movesOf(d) {
    const set = new Set();
    const add = (k) => { if (k) set.add(String(k).split(':')[0]); };
    (d.pattern || []).forEach(add);
    for (const ph of d.phases || []) (ph.pattern || []).forEach(add);
    for (const k of Object.keys(d.intents || {})) add(k);
    return [...set];
  }
  const OVERLAY = { heat: 'Heat pips + rising embers', shroud: 'Shroud mist over its knots', charge: 'Gathering orbit + core glow', silence: 'Hush mark over the party', mend: 'knot re-tied (knot icon)' };
  function actsFor(R, kind) {
    if (!R) return [];
    if (kind === 'rest') return ['rest', '(answered: prep → balk)'];
    return Object.keys(R.poses).filter((a) => a.endsWith(':' + kind) && !a.startsWith('key:')).map((a) => a + '×' + R.poses[a]);
  }
  function auditRows() {
    const EA = RB.enemyArt, out = [];
    const ens = (RB.content && RB.content.enemies) || {};
    for (const id of Object.keys(ens).sort()) {
      const d = ens[id];
      if (CB.FAMILIES.indexOf(d.art) < 0) continue;
      const spec = EA.P[d.art], R = CB.RIGS[d.art], F = CB.FAMILY[d.art] || {};
      const kinds = movesOf(d);
      const nIdle = spec ? (spec.seq ? spec.seq.length : spec.frames) : 0;
      const n = NOTES[id] || { disposition: null, note: 'no review recorded' };
      out.push({
        id, name: d.name && d.name.en, art: d.art, opts: d.artOpts || {}, boss: !!d.boss,
        frame: spec ? spec.w + '×' + spec.h : '?', anchor: spec ? 'origin ' + spec.ox + ',' + spec.oy + (spec.dy ? ' dy ' + spec.dy : '') + '; ground +84' : '?',
        idle: spec ? nIdle + ' poses × ' + spec.ms + ' ms (' + Math.round(nIdle * spec.ms) + ' ms loop)' : '?',
        palette: F.palette || '', anatomy: F.anatomy || '',
        // delivery: the family's own function for this move (not its '*' catch-all); a rest is
        // performed by the sequencer with the family's authored rest / prep / balk poses
        moves: kinds.map((k) => { const S = RB.battleSeq, own = S ? S.deliveryOf(d.art, k, null) : null; return { kind: k, acts: actsFor(R, k), delivery: k === 'rest' ? 'sequencer (authored poses)' : own && own !== S.deliveryOf(d.art, '-', null) ? 'own' : 'none' }; }),
        overlays: kinds.filter((k) => OVERLAY[k]).map((k) => OVERLAY[k]).concat(['support tags (softened / eye drawn / headed off)']),
        reactions: R ? ['recoil', 'release', 'balk', 'settle', 'rest', 'prep'].filter((a) => R.poses[a]).map((a) => a + '×' + R.poses[a]) : [],
        settle: R && R.poses.settle ? 'authored settle (' + R.poses.settle + ' poses), held; the stage fades it to its settled look' : 'generic',
        disposition: n.disposition, note: n.note,
      });
    }
    return out;
  }
  CB.auditRows = auditRows;
  CB.movesOf = movesOf;
  CB.ALLOWED = ALLOWED;
  CB.NOTES = NOTES;
})();
