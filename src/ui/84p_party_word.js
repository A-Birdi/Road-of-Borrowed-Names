/* The written response's own motion (battle addendum §8.4): the word on its strip is tied to what the
 * response does — a ward's seal closes round the one it protects, a thread is drawn out of an
 * inscription, light rises from the raised hand, a restorative word gathers over the two of you and
 * dissolves into what it gives, water arcs, wind drifts, a binding wraps, stone settles to the ground,
 * warmth rises, a bell's word pulses with each ring, an answer folds into a note, a falsehood's word
 * splits. One dominant word; never the same travelling rectangle with only its text changed.
 *
 * RB.partyWord.place(o) is asked each frame by the battle stage's strip placement
 * (src/ui/83_battle_stage.js placeStrip) when the strip carries a motif (tm.motif, set by
 * src/ui/84p_party_choreo.js). o: { k (ms since the strip began), tm (its timing), a (the actor's
 * release point), b (the default destination), tr (eased travel), unf, ink, fade, reduce, u (art px per
 * unit), to, from, onFoe, anchor(id, part) } — all in art px. Returns { x, y (art px: the strip's
 * bottom centre), op (opacity), xf (extra CSS transform), vars (CSS custom properties) }. The styles are
 * src/styles/61_battle_party.css. With reduced motion the word stands still where it is read, keeps its
 * motif's look, and fades — no travel, folding or pulsing. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.partyWord = (function () {
  'use strict';
  const cl = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ease = (k) => 1 - Math.pow(1 - cl(k), 3);
  const easeIn = (k) => cl(k) * cl(k);
  const seg = (k, a, b) => cl((k - a) / Math.max(1, b - a));
  const bump = (x) => Math.sin(Math.PI * cl(x));
  const q = (a, c, b, s) => ({ x: (1 - s) * (1 - s) * a.x + 2 * s * (1 - s) * c.x + s * s * b.x, y: (1 - s) * (1 - s) * a.y + 2 * s * (1 - s) * c.y + s * s * b.y });
  const fmt = (v) => (+v).toFixed(3);
  function place(o) {
    const { k, tm, a, u, reduce } = o;
    let b = o.b;
    const m = tm.motif, tr = o.tr, fade = o.fade, unf = o.unf;
    const inkEnd = tm.inkEnd || 0, fadeAt = tm.fadeAt;
    // the default opacity: visible as it unrolls, gone by the end
    let op = reduce ? (k < fadeAt ? 1 : 1 - fade) : Math.min(1, unf * 3) * (1 - fade);
    let p = { x: a.x + (b.x - a.x) * tr, y: a.y + (b.y - a.y) * tr }, xf = '';
    const vars = {};
    // the place it settles on, for the motifs that do not go to the default destination
    if (m === 'settle') { const f = o.anchor('party', 'feet'); b = { x: f.x + 6 * u, y: f.y - 2 * u }; }
    if (m === 'join' && o.anchor) { const h = o.anchor('comp', 'hand'); if (h) p = { x: (a.x + h.x) / 2 + (b.x - (a.x + h.x) / 2) * tr, y: (a.y + h.y) / 2 + (b.y - (a.y + h.y) / 2) * tr }; }
    if (reduce) {
      // still: read where it ends, in its motif's look
      p = { x: b.x, y: b.y };
      vars['--glow'] = m === 'radiance' || m === 'ember' ? '0.8' : '0';
      return { x: p.x, y: p.y, op, xf: '', vars };
    }
    switch (m) {
      case 'seal': {
        // it unfolds over the one it protects, is read, then folds shut into a seal tag and drops a
        // little toward them as the ward closes (the canvas draws the ward itself)
        // (it stays open and fully readable until fadeAt — §18.3: about 700 ms — then folds and goes)
        const fold = ease(seg(k, fadeAt, fadeAt + 140));
        p = { x: b.x, y: b.y + fold * 10 * u };
        xf = 'scale(' + fmt(1 - 0.74 * fold) + ',' + fmt(1 + 0.12 * fold) + ')';
        vars['--fold'] = fmt(fold);
        op = Math.min(1, unf * 3) * (1 - seg(k, fadeAt + 70, tm.end));
        break;
      }
      case 'thread': {
        // carried to the creature, then drawn out: the strip pays out from its left end as the thread pulls
        const pull = ease(seg(k, inkEnd + 180, fadeAt + 80));
        p.x -= pull * 6 * u;
        vars['--pull'] = fmt(pull);
        break;
      }
      case 'radiance': {
        // the source raised: it rises straight up from the hand, then leans toward what it reveals, glowing
        const c = { x: a.x, y: a.y - 46 * u };
        p = q(a, c, { x: (a.x + b.x) / 2, y: Math.min(b.y, a.y - 30 * u) }, tr);
        vars['--glow'] = fmt(0.25 + 0.75 * seg(k, tm.inkAt, inkEnd + 120) * (1 - fade));
        break;
      }
      case 'gather': {
        // over the two of you; at the end it dissolves upward into what it gives
        const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 16 * u };
        p = q(a, c, b, tr);
        p.y -= fade * 14 * u;
        xf = 'scale(' + fmt(1 + 0.14 * fade) + ')';
        vars['--dissolve'] = fmt(fade);
        break;
      }
      case 'flow': {
        // an arc like water thrown, the strip turning a little along it
        const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 44 * u };
        p = q(a, c, b, tr);
        const s2 = Math.min(1, tr + 0.02), p2 = q(a, c, b, s2);
        const ang = tr < 1 ? Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI : 0;
        xf = 'rotate(' + fmt(Math.max(-9, Math.min(9, ang * 0.25))) + 'deg)';
        break;
      }
      case 'crystal':
        // straight and fast, set crisp at an angle
        xf = 'skewX(-7deg)';
        vars['--crisp'] = fmt(seg(k, tm.inkAt, inkEnd));
        break;
      case 'drift': {
        // carried on the wind: a curved, swaying path, and it keeps drifting on after it arrives
        const sw = Math.sin(tr * Math.PI * 2);
        p.x += sw * 10 * u + Math.max(0, k - tm.travel) * 0.012 * u;
        p.y -= bump(tr) * 18 * u;
        xf = 'rotate(' + fmt(sw * 5 + Math.sin(k / 260) * 1.5) + 'deg)';
        break;
      }
      case 'wrap': {
        // carried to it, then closed round it: the strip skews and narrows as the binding cinches
        const w = ease(seg(k, inkEnd + 160, inkEnd + 520));
        xf = 'skewX(' + fmt(-16 * w) + 'deg) scale(' + fmt(1 - 0.3 * w) + ',1)';
        vars['--wrap'] = fmt(w);
        break;
      }
      case 'settle': {
        // it drops (heavy, accelerating) to the ground before you and sets; it sinks as it goes
        const s = easeIn(seg(k, 0, Math.max(1, tm.travel)));
        p = { x: a.x + (b.x - a.x) * s, y: a.y + (b.y - a.y) * s + fade * 6 * u };
        if (s >= 1 && k < tm.travel + 120) p.y += bump(seg(k, tm.travel, tm.travel + 120)) * 2 * u; // a small landing
        vars['--ground'] = fmt(seg(k, tm.travel, tm.travel + 160));
        break;
      }
      case 'ember': {
        // it rises over you both with warm edges
        p.y -= ease(seg(k, tm.travel, fadeAt)) * 8 * u;
        vars['--glow'] = fmt(0.5 + 0.5 * seg(k, tm.inkAt, inkEnd) * (1 - fade));
        break;
      }
      case 'pulse': case 'voice': {
        // held over you; each ring (from the gesture's release) swells it a little
        let ring = 0;
        for (let i = 0; i < 3; i++) ring = Math.max(ring, bump(seg(k, inkEnd - 120 + i * 230, inkEnd + 60 + i * 230)));
        xf = m === 'voice' ? 'scale(' + fmt(1 + 0.08 * ring) + ',' + fmt(1 - 0.03 * ring) + ')' : 'scale(' + fmt(1 + 0.06 * ring) + ')';
        vars['--ring'] = fmt(ring);
        break;
      }
      case 'note': {
        // folded small, it drifts across in an arc to the creature and opens there
        const c = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - 30 * u };
        p = q(a, c, b, tr);
        const open = ease(seg(k, tm.travel - 60, tm.travel + 160));
        xf = 'scale(' + fmt(0.7 + 0.3 * open) + ') rotate(' + fmt(-6 * (1 - open)) + 'deg)';
        vars['--open'] = fmt(open);
        break;
      }
      case 'split': {
        // read before it; when the falsehood gives way the strip cracks and its halves part
        const cr = ease(seg(k, tm.splitAt != null ? tm.splitAt : inkEnd + 300, (tm.splitAt != null ? tm.splitAt : inkEnd + 300) + 260));
        xf = 'skewY(' + fmt(2.5 * cr) + 'deg)';
        vars['--crack'] = fmt(cr);
        break;
      }
      case 'join':
        // from between the two of you to its target
        vars['--glow'] = fmt(0.4 + 0.6 * seg(k, tm.inkAt, inkEnd) * (1 - fade));
        break;
      default: break;
    }
    return { x: p.x, y: p.y, op, xf, vars };
  }
  const MOTIFS = ['seal', 'thread', 'radiance', 'gather', 'flow', 'crystal', 'drift', 'wrap', 'settle', 'ember', 'pulse', 'voice', 'note', 'split', 'join'];
  return { place, MOTIFS };
})();
