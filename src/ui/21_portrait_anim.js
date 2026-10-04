/* Animated dialogue portraits (owner's World Idle Life / Animated Portraits addendum §7; plan in
 * docs/expressive/PORTRAITS.md). While a line is shown, the speaker's portrait keeps a quiet idle
 * loop — a blink on an irregular seeded cadence, a one-pixel breath (shoulders first, the head a beat
 * later), hair and hanging accessories a beat behind the head, glasses catching the light, and the
 * person's own small habit (Ren's glasses, Suzu's poise, Mio's careful look, Nao's eye on the
 * exits; the NPCs' habits from their mannerism profiles, docs/expressive/GESTURES.md §5–§7). A line
 * tagged with an expression (`speaker[surprise]: …`) opens with a one-off lead-in cue (a shock's
 * widen-and-hold, a laugh's two shoulder bobs, a sad slow blink …) and then settles into that
 * expression's stable loop.
 *
 * The loop is a pure function of time (frameAt), so the canvas is repainted only when the frame
 * changes (a few times a second at most, never per browser frame), and each frame comes from the
 * portrait renderer's cache (src/engine/35_portraits.js: layers + frames, one byte-capped LRU).
 * Nothing runs when the dialogue is hidden, the tab is hidden or the portrait is off-screen; with
 * Reduce motion, fast-forward or the test harness's auto-advance the portrait is the still image.
 *
 * Other screens that show portraits (the history, kept sentences, Company pages, letters, the word
 * games) keep the still image: they are reference views where a moving face would compete with the
 * text being studied. */
var RB = (globalThis.RB = globalThis.RB || {});

RB.portraitAnim = (function () {
  'use strict';
  const between = (r, ab) => ab[0] + r() * (ab[1] - ab[0]);
  const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];

  // ---- profiles: class overlays, then each person's own habits ------------------------------------
  // blink [min, max] ms between blinks; shut: ms the lids stay closed; dbl: chance of a double blink;
  // breath: ms per breath (0: none); glance: { every, hold, dirs }; tilt: { every, hold, dx } (the head
  // a pixel to one side, held); sway: { every } (hair and hanging things, by themselves);
  // glint: { every } (glasses); habit: { kind, every, hold }; big: cues a frame larger (children).
  const CLASS = {
    base: { blink: [3600, 6000], shut: 100, dbl: 0.12, breath: 3600, glance: { every: [9000, 16000], hold: [700, 1200], dirs: [[-1, 0], [1, 0]] } },
    official: { blink: [4800, 7600], dbl: 0.05, breath: 4400, glance: { every: [14000, 24000], hold: [900, 1400], dirs: [[-1, 0], [1, 0]] } },
    scholar: { blink: [4000, 6600], breath: 4000, glance: { every: [11000, 18000], hold: [900, 1500], dirs: [[1, -1], [-1, -1]] } },
    clerk: { blink: [3400, 5400], breath: 3600, glance: { every: [8000, 14000], hold: [800, 1300], dirs: [[0, 1], [-1, 1]] } },
    host: { blink: [3400, 5400], breath: 3600, tilt: { every: [10000, 16000], hold: [2000, 3400], dx: [1, -1] }, glance: { every: [10000, 16000], hold: [700, 1100], dirs: [[-1, 0], [1, 0]] } },
    craft: { blink: [3600, 6000], breath: 3400, glance: { every: [9000, 15000], hold: [800, 1300], dirs: [[-1, 1], [1, 1]] } },
    elder: { blink: [5200, 8200], shut: 150, dbl: 0.04, breath: 4600, glance: { every: [16000, 26000], hold: [1000, 1600], dirs: [[-1, 0], [1, 0]] } },
    child: { blink: [2600, 4200], dbl: 0.2, breath: 2600, glance: { every: [6000, 10000], hold: [400, 700], dirs: [[-1, 0], [1, 0], [0, -1]] }, big: true },
    keeper: { blink: [4600, 7200], shut: 120, breath: 4200, glance: { every: [15000, 24000], hold: [1100, 1700], dirs: [[0, -1], [1, 0]] } },
    traveller: { blink: [3600, 5600], breath: 3600, glance: { every: [8000, 12000], hold: [900, 1300], dirs: [[-1, 0], [1, 0]] } },
    performer: { blink: [3200, 5200], breath: 3400, tilt: { every: [9000, 14000], hold: [2000, 3200], dx: [1, -1] }, sway: { every: [4000, 7000] }, glance: { every: [9000, 14000], hold: [600, 1000], dirs: [[1, 0], [-1, 0]] } },
    nonhuman: { blink: [4200, 7000], shut: 120, breath: 4200, glance: null },
  };
  // Every character with a portrait. Class from GESTURES.md §7 (the recurring NPCs), §6 (the
  // companions and the player); bespoke habits for the people PORTRAITS.md §4 and GESTURES.md §5 name.
  const glassesPush = (every) => ({ kind: 'glassesPush', every, hold: [0, 0] });
  const PEOPLE = {
    pc: ['base', { glance: { every: [12000, 20000], hold: [700, 1100], dirs: [[1, 0], [0, 1]] } }],
    // the companions
    nao: ['traveller', { blink: [4400, 7400], dbl: 0.05, glance: { every: [6000, 10000], hold: [900, 1400], dirs: [[-1, 0], [1, 0]] }, hold: { smirk: { head: [-1, 0] } } }],
    mio: ['host', { blink: [3400, 5000], dbl: 0.04, tilt: { every: [9000, 15000], hold: [2200, 3600], dx: [1] }, glance: { every: [10000, 16000], hold: [600, 900], dirs: [[0, 1], [-1, 1]] }, nod: true, laugh: 'hidden' }],
    ren: ['scholar', { blink: [3800, 6000], glint: { every: [8000, 14000] }, sway: { every: [6000, 10000] }, adjust: true, slowClose: 1.4, glance: { every: [12000, 18000], hold: [900, 1300], dirs: [[1, 0], [-1, 0]] } }],
    suzu: ['performer', { sway: { every: [4000, 7000] }, tilt: null, habit: { kind: 'weight', every: [10000, 16000], hold: [3000, 5000] }, wink: true, serious: { sad: 1, worry: 1, closed: 1, sad2: 1 } }],
    // bespoke recurring characters
    omi: ['official', { blink: [5200, 8000], dbl: 0, glance: { every: [16000, 26000], hold: [1000, 1500], dirs: [[1, 0]] } }],
    wataru: ['clerk', { habit: { kind: 'glassesSlip', every: [9000, 15000], hold: [2600, 4000] }, sadLook: [-1, 1] }],
    tsuru: ['elder', { blink: [6000, 9000], habit: { kind: 'chinUp', every: [12000, 20000], hold: [2000, 3000] }, thinkLids: true }],
    kasane: ['keeper', { blink: [5000, 8000], glance: { every: [18000, 28000], hold: [1200, 1800], dirs: [[1, 0], [0, 1]] }, sway: { every: [7000, 12000] }, slowClose: 1.6 }],
    hoshino: ['scholar', { glint: { every: [7000, 12000] }, habit: { kind: 'lookUp', every: [14000, 22000], hold: [1200, 1800] } }],
    hana: ['host', { tilt: { every: [8000, 14000], hold: [2400, 3600], dx: [1] }, sadLook: [1, 1] }],
    co_tokiwa: ['scholar', { habit: glassesPush([14000, 22000]), adjust: true, glance: { every: [10000, 16000], hold: [700, 1100], dirs: [[-1, 0], [-1, 1]] } }],
    hiro: ['craft', { glance: { every: [9000, 14000], hold: [900, 1300], dirs: [[0, 1], [1, 1]] } }],
    genzo: ['elder', { habit: { kind: 'squint', every: [10000, 16000], hold: [900, 1300] } }],
    akari: ['clerk', { glance: { every: [9000, 15000], hold: [900, 1400], dirs: [[-1, -1], [0, 1]] } }],
    lf_yae: ['official', { habit: { kind: 'nod', every: [9000, 15000], hold: [180, 220] } }],
    lq_chigusa: ['host', { glance: { every: [8000, 13000], hold: [900, 1300], dirs: [[-1, 0]] } }],
    umi: ['clerk', {}],
    tamae: ['host', { big: true }],
    yae: ['host', {}],
    lf_tadashi: ['official', { glint: { every: [9000, 15000] }, habit: glassesPush([16000, 26000]) }],
    shiori: ['scholar', { glance: { every: [9000, 14000], hold: [1000, 1500], dirs: [[1, 0], [1, -1]] } }],
    lf_tokuji: ['elder', {}],
    yasu: ['elder', { habit: { kind: 'nod', every: [12000, 20000], hold: [180, 220] } }],
    koji: ['craft', {}],
    lq_kayo: ['traveller', {}],
    // class overlays (GESTURES.md §7)
    co_ume: 'elder', co_goro: 'elder', sa_oyone: 'keeper', asahi: 'craft', tetsu: 'elder', co_sayo: 'host', lf_hayato: 'official',
    fuki: 'elder', co_tamotsu: 'craft', kanta: 'child', co_fusa: 'host', sousuke: 'traveller', co_nobu: 'craft', co_isao: 'craft',
    lf_kinu: 'host', sa_clerk: 'nonhuman', fuku: 'elder', lf_kohei: 'craft', sa_isamu: 'traveller', tetsuji: 'craft', denji: 'elder',
    co_kotaro: 'child', co_asa: 'craft', sota: 'craft', lf_tsuya: 'elder', co_shino: 'traveller', tomo: 'host', lf_masaru: 'host',
    co_heita: 'craft', lf_ritsu: 'host', daigo: 'craft', kiyo: 'host', cs_hama: 'craft', lf_nagi: 'keeper', sa_tsuzuri: 'nonhuman',
    lf_setsu: 'host', mame: 'child', oto: 'craft', hayate: 'craft', natsume: 'craft', tobi: 'child', lf_kei: 'child', bunta: 'craft',
    kiku: 'elder', sachi: 'host', lf_shu: 'craft', nagisa: 'traveller', chiyo: 'child', rokuta: 'child', sae: 'craft',
    // people with fewer than three scenes, voices and creatures (no GESTURES.md profile: the nearest class)
    cs_seto: 'elder', co_tomoe: 'craft', lf_toya: 'child', sa_ushio: 'elder', sa_tae: 'elder', fw_fumi: 'elder',
    echo: ['nonhuman', { sway: { every: [5000, 9000] } }], sg_clerk: 'nonhuman', sb_lampvoice: ['nonhuman', { sway: { every: [5000, 9000] } }],
    co_goat: 'nonhuman', co_warden: 'nonhuman', mochi: ['nonhuman', { blink: [3000, 6500], dbl: 0.25 }],
    sa_reader: 'scholar', // the Archive's reader (by role)
  };
  const SWAY_STYLES = { long: 1, wavy: 1, ponytail: 1, twintails: 1 };
  function profileOf(who, p) {
    // an unlisted speaker gets the plain loop: no personality is inferred from glasses, age or dress (world review WR-01)
    const row = PEOPLE[who] || 'base';
    const [cls, own] = typeof row === 'string' ? [row, {}] : row;
    const pr = Object.assign({ id: who, cls }, CLASS.base, CLASS[cls] || {}, own);
    // the mannerism profiles of the actor system, when present (src/content/mannerisms), may add a portrait block
    const ext = RB.mannerisms && RB.mannerisms.of && RB.mannerisms.of(who);
    if (ext && ext.portrait && typeof ext.portrait === 'object') Object.assign(pr, ext.portrait);
    const acc = (p && p.acc) || [];
    pr.glasses = acc.includes('glasses');
    if (pr.glasses && !pr.glint) pr.glint = { every: [10000, 16000] };
    if (!pr.glasses) { pr.glint = null; pr.adjust = false; if (pr.habit && /^glasses/.test(pr.habit.kind)) pr.habit = null; }
    // only hair or things that hang can sway (a short crop has nothing to lag behind)
    const swings = !!p && (SWAY_STYLES[p.style] || acc.includes('ribbon') || acc.includes('earrings') || acc.includes('hood'));
    if (!swings) pr.sway = null; else if (!pr.sway) pr.sway = { every: [7000, 12000] };
    pr.swings = swings;
    if (p && p.kind === 'cat') { pr.glance = null; pr.tilt = null; pr.sway = null; }
    return pr;
  }

  // ---- each expression's stable loop --------------------------------------------------------------------
  // blink: false (the eyes are already closed); glance: false or the gaze a glance returns to;
  // tilt: false (no head tilts or weight shifts); breath: false (held still: anger is firm) or a factor.
  const LOOP = {
    surprise: { blinkMul: 1.6, glance: false },
    laugh: { blink: false, glance: false, breath: 1.35 },
    smile2: { blink: false, glance: false },
    sad2: { blink: false, glance: false, tilt: false },
    closed: { blink: false, glance: false, tilt: false },
    angry: { breath: false, blinkMul: 1.3, tilt: false },
    tired: { shut: 170, blinkMul: 1.25, breath: 1.2 },
    think: { glance: [[0, 0]] },
    shy: { glance: [[1, 1], [0, 1]], tilt: false },
    sad: { tilt: false },
  };

  // ---- lead-in cues per tag: [duration ms, frame] played once, then the loop -----------------------------
  // Frames describe the portrait over the line's own expression (RB.portraits frame descriptors):
  // expr (another expression for a beat), lids, look, brow, mouth, blush, wink, head/body offsets,
  // glint, glassDy. The last beat leads straight into the loop's resting frame.
  const sweep = () => [[70, { glint: 0 }], [70, { glint: 1 }], [70, { glint: 2 }], [70, { glint: 3 }]];
  const CUES = {
    // shock: eyes widen over two beats, brows up, a pixel's pull back, held; then a steadier surprised loop
    surprise: (pr) => [[70, { expr: 'neutral' }], [70, { eyes: { wide: false } }], [110, { head: [0, -1], body: [0, -1] }], ...(pr.big ? [[120, { head: [0, -2], body: [0, -1] }]] : []), [330, { head: [0, -1] }]],
    // a laugh: a smile, then the shoulders bob twice (Suzu: with a wink; Mio laughs quietly, once)
    laugh: (pr) => {
      const bob = [[130, { body: [0, -1], head: [0, -1] }], [110, {}]];
      if (pr.laugh === 'hidden') return [[120, { expr: 'smile2' }], [150, { body: [0, -1] }], [120, {}]];
      return [[pr.wink ? 170 : 90, pr.wink ? { expr: 'smile', wink: true } : { expr: 'smile' }], ...bob, ...bob, ...(pr.big ? bob : [])];
    },
    // a smile: the cheeks lift a beat after the mouth
    smile: () => [[110, { eyes: { cheek: false } }], [130, { head: [0, -1] }]],
    // teasing: one lid lowers and the corner of the mouth lifts (Nao turns his head a little away; Suzu
    // winks on her first smirk of a scene)
    smirk: (pr, c) => {
      const turn = (pr.hold && pr.hold.smirk) || {};
      const k = [[90, { expr: 'neutral' }], [110, Object.assign({ eyesR: { heavy: false } }, turn)]];
      if (pr.wink && c.first('wink')) k.push([260, Object.assign({ wink: true }, turn)]);
      k.push([200, Object.assign({}, turn)]);
      return k;
    },
    // realization: a glance aside, then up, one brow lifting; glasses catch the light (Ren and Tokiwa
    // adjust theirs, at most once a scene); Tsuru's eyes narrow further
    think: (pr, c) => {
      const k = [[100, { expr: 'neutral' }], [130, { look: [1, 0] }]];
      if (pr.glasses && pr.adjust && c.first('adjust')) k.push([170, { glassDy: -1 }], ...sweep());
      else if (pr.glasses) k.push([90, {}], ...sweep());
      else k.push([240, {}]);
      if (pr.thinkLids) k.push([400, { lids: 'half' }]);
      return k;
    },
    // worry: the brows draw up a beat late, the gaze drops a pixel (Mio: a small nod)
    worry: (pr) => [[100, { brow: 'flat' }], [150, { look: [0, 1] }], ...(pr.nod ? [[160, { look: [0, 1], head: [0, 1] }]] : []), [220, { look: [0, 1] }]],
    // sadness: a slow blink, the gaze goes down (or aside), the shoulders settle
    sad: (pr) => [[120, { lids: 'half' }], [190, { lids: 'closed' }], [120, { lids: 'half' }], [340, { look: pr.sadLook || [0, 1], body: [0, 1], head: [0, 1] }]],
    // eyes closing slowly over two beats (Kasane, Ren: slower, before a hard truth)
    closed: (pr) => { const m = pr.slowClose || 1; return [[Math.round(150 * m), { eyes: { closed: null } }], [Math.round(180 * m), { eyes: { closed: null, heavy: true } }]]; },
    // irritation: a short exhale (the shoulders drop, the lids half close), then the narrowed look
    angry: () => [[170, { lids: 'half', body: [0, 1], head: [0, 1] }], [150, { body: [0, 1] }]],
    // embarrassment: the gaze averts with a small recoil, the blush comes up
    shy: () => [[130, { blush: 0, head: [-1, 0] }], [130, { blush: 0.5, head: [-1, 0] }], [240, { head: [-1, 0] }]],
    // tiredness: a heavy blink
    tired: () => [[80, {}], [250, { lids: 'closed' }], [130, { lids: 'half' }]],
  };

  // ---- the timeline: idle events (seeded) + breath + the cue, as a function of time -------------------------
  // One small motion at a time: an event is placed so that its moments of change (a blink's start and end,
  // a glance's turn and return …) keep GAP ms from every other event's, postponing it a little if needed;
  // only the breath runs underneath. Long holds (a tilt, a weight shift) may contain a blink.
  const GAP = 700;
  function Timeline(pr0, seed) {
    const r = RB.util.rng(seed);
    const ref = { pr: pr0 };
    const P_ = () => ref.pr; // the rates follow the current expression's loop; which motions exist is fixed
    const pr = pr0;
    const ev = [], marks = [];
    let horizon = 0;
    const gens = [];
    const add = (a, b, fr, k, pri) => { ev.push({ a, b, fr, k, pri }); };
    const free = (ts) => ts.every((x) => marks.every((m) => Math.abs(m - x) >= GAP));
    // the first start at or after t whose moments are free (postponed in 350 ms steps)
    const place = (t, moments) => { for (let i = 0; i < 16 && !free(moments(t)); i++) t += 350; marks.push(...moments(t)); return t; };
    if (pr.blink) gens.push({ next: 700 + r() * pr.blink[0] * 0.6, gen(t) {
      // half-closed, closed, half-open; a double blink closes again from half-open (no full open between)
      const shut = P_().shut || 100, dbl = r() < (P_().dbl || 0), len = 100 + shut, all = dbl ? len + 70 + shut : len;
      t = place(t, (t) => [t, t + all]);
      add(t, t + 50, { lids: 'half' }, 'blink', 4); add(t + 50, t + 50 + shut, { lids: 'closed' }, 'blink', 4);
      if (dbl) { add(t + 50 + shut, t + 120 + shut, { lids: 'half' }, 'blink', 4); add(t + 120 + shut, t + 120 + 2 * shut - 20, { lids: 'closed' }, 'blink', 4); add(t + 100 + 2 * shut, t + all, { lids: 'half' }, 'blink', 4); }
      else add(t + 50 + shut, t + len, { lids: 'half' }, 'blink', 4);
      return t + all + between(r, P_().blink || pr.blink);
    } });
    if (pr.glance) gens.push({ next: 2500 + r() * pr.glance.every[0], gen(t) {
      const hold = between(r, pr.glance.hold), dir = pick(r, pr.glance.dirs);
      t = place(t, (t) => [t, t + hold]);
      add(t, t + hold, { look: dir }, 'glance', 3);
      return t + hold + between(r, pr.glance.every);
    } });
    if (pr.tilt) gens.push({ next: 4000 + r() * pr.tilt.every[0], gen(t) {
      const hold = between(r, pr.tilt.hold), dx = pick(r, pr.tilt.dx);
      t = place(t, (t) => [t, t + 330, t + hold, t + hold + 330]);
      add(t, t + hold, { head: [dx, 0] }, 'tilt', 2);
      if (pr.swings) { add(t + 110, t + 330, { sway: -dx }, 'lag', 1); add(t + hold + 110, t + hold + 330, { sway: dx }, 'lag', 1); }
      return t + hold + between(r, pr.tilt.every);
    } });
    if (pr.sway) gens.push({ next: 1500 + r() * pr.sway.every[0], gen(t) {
      const d = r() < 0.5 ? -1 : 1;
      t = place(t, (t) => [t, t + 240]);
      add(t, t + 240, { sway: d }, 'sway', 1);
      return t + 240 + between(r, pr.sway.every);
    } });
    if (pr.glint) gens.push({ next: 3000 + r() * pr.glint.every[0], gen(t) {
      t = place(t, (t) => [t, t + 280]);
      for (let i = 0; i < 4; i++) add(t + i * 70, t + (i + 1) * 70, { glint: i }, 'glint', 1);
      return t + 280 + between(r, pr.glint.every);
    } });
    if (pr.habit) gens.push({ next: 5000 + r() * pr.habit.every[0], gen(t) {
      const h = pr.habit, hold = between(r, h.hold || [0, 0]), dx = r() < 0.5 ? -1 : 1;
      let end = t;
      switch (h.kind) {
        case 'glassesPush':
          t = place(t, (t) => [t, t + 460]);
          add(t, t + 180, { glassDy: -1 }, 'habit', 1); for (let i = 0; i < 4; i++) add(t + 180 + i * 70, t + 250 + i * 70, { glint: i }, 'habit', 1);
          end = t + 460; break;
        case 'glassesSlip': // the glasses slip a pixel, and after a while are pushed back up (a glint)
          t = place(t, (t) => [t, t + hold, t + hold + 440]);
          add(t, t + hold, { glassDy: 1 }, 'habit', 1); add(t + hold, t + hold + 160, { glassDy: -1 }, 'habit', 1);
          for (let i = 0; i < 4; i++) add(t + hold + 160 + i * 70, t + hold + 230 + i * 70, { glint: i }, 'habit', 1);
          end = t + hold + 440; break;
        case 'nod': t = place(t, (t) => [t, t + hold]); add(t, t + hold, { head: [0, 1] }, 'habit', 2); end = t + hold; break;
        case 'squint': t = place(t, (t) => [t, t + hold]); add(t, t + hold, { lids: 'half' }, 'squint', 3); end = t + hold; break;
        case 'chinUp': t = place(t, (t) => [t, t + hold]); add(t, t + hold, { head: [0, -1] }, 'habit', 2); end = t + hold; break;
        case 'lookUp': t = place(t, (t) => [t, t + hold]); add(t, t + hold, { look: [0, -1] }, 'glance', 3); end = t + hold; break;
        case 'weight': // a weight shift: the shoulders first, the head after, the hair a beat behind
          t = place(t, (t) => [t, t + 460, t + hold, t + hold + 460]);
          add(t, t + hold, { body: [dx, 0] }, 'tilt', 2); add(t + 120, t + hold + 120, { head: [dx, 0] }, 'tilt', 2);
          if (pr.swings) { add(t + 240, t + 460, { sway: -dx }, 'lag', 1); add(t + hold + 240, t + hold + 460, { sway: dx }, 'lag', 1); }
          end = t + hold + 460; break;
      }
      return end + between(r, h.every);
    } });
    function extend(to) {
      while (horizon < to) {
        horizon += 5000;
        for (const g of gens) while (g.next < horizon) g.next = g.gen(g.next);
      }
      // drop what is long past (a very long line must not grow the lists without bound)
      if (ev.length > 400) { const cut = to - 60000; for (let i = ev.length - 1; i >= 0; i--) if (ev[i].b < cut) ev.splice(i, 1); }
      if (marks.length > 400) { const cut = to - 60000; for (let i = marks.length - 1; i >= 0; i--) if (marks[i] < cut) marks.splice(i, 1); }
    }
    return { ev, extend, seed, ref };
  }

  // breath: the shoulders up a pixel for 1.2 s of each breath, the head a beat later
  const LAG = 120;
  function breathWindow(pr, loop) {
    if (!pr.breath || loop.breath === false) return null;
    const P = Math.round(pr.breath * (typeof loop.breath === 'number' ? loop.breath : 1));
    const up = Math.max(1000, Math.min(1200, Math.round(P * 0.34))); // ≥ 1 s: at most two breath changes in any second
    return { P, u0: Math.round(P * 0.3), u1: Math.round(P * 0.3) + up };
  }
  function addOff(fr, k, v) { const o = fr[k] || [0, 0]; fr[k] = [Math.max(-2, Math.min(2, o[0] + v[0])), Math.max(-2, Math.min(2, o[1] + v[1]))]; }
  function merge(fr, add) {
    for (const k in add) {
      if (k === 'head' || k === 'body') addOff(fr, k, add[k]);
      else if (k === 'sway') fr.sway = Math.max(-1, Math.min(1, (fr.sway || 0) + add.sway));
      else fr[k] = add[k];
    }
    return fr;
  }

  // The frame at time t (ms on this speaker's idle clock) for state st:
  // { pr, tl, expr, info (RB.portraits.exprInfo), loop, cue: { t0, beats: [[a, b, fr]], end } | null, quiet }
  function frameAt(st, t) {
    const pr = st.pr, loop = st.loop;
    if (st.cue && t >= st.cue.t0 && t < st.cue.end) {
      for (const [a, b, fr] of st.cue.beats) if (t >= a && t < b) return Object.assign({}, fr);
    }
    const fr = {};
    const hold = pr.hold && pr.hold[st.info.name];
    if (hold) merge(fr, hold);
    const bw = breathWindow(pr, loop);
    if (bw) {
      const ph = (t + st.phase) % bw.P;
      // after a cue the face holds still while it settles, then the breath resumes with the next whole
      // breath (never a jump from the cue's last pose)
      if (t - ph + bw.u0 >= st.quiet) {
        if (ph >= bw.u0 && ph < bw.u1) addOff(fr, 'body', [0, -1]);
        if (ph >= bw.u0 + LAG && ph < bw.u1 + LAG) addOff(fr, 'head', [0, -1]);
      }
    }
    st.tl.extend(t + 6000);
    const act = [];
    for (const iv of st.tl.ev) {
      if (iv.a > t || iv.b <= t || iv.a < st.quiet) continue;
      if (iv.k === 'blink' && (loop.blink === false || st.info.closed)) continue;
      if ((iv.k === 'glance' || iv.k === 'squint') && (loop.glance === false || st.info.closed)) continue;
      if (iv.k === 'tilt' && (loop.tilt === false || (pr.serious && pr.serious[st.info.name]))) continue;
      act.push(iv);
    }
    act.sort((x, y) => x.pri - y.pri);
    for (const iv of act) {
      if (iv.k === 'glance' && Array.isArray(loop.glance)) { merge(fr, { look: pick(() => (iv.a % 997) / 997, loop.glance) }); continue; }
      merge(fr, iv.fr);
    }
    return fr;
  }
  // the next time after t at which the frame can change
  function nextAt(st, t) {
    let n = t + 60000;
    if (st.cue && t < st.cue.end) for (const [a, b] of st.cue.beats) { if (a > t) n = Math.min(n, a); if (b > t) n = Math.min(n, b); }
    const bw = breathWindow(st.pr, st.loop);
    if (bw) {
      const ph = (t + st.phase) % bw.P;
      for (const x of [bw.u0, bw.u1, bw.u0 + LAG, bw.u1 + LAG]) { let d = (x - ph + bw.P) % bw.P; if (d <= 0) d += bw.P; n = Math.min(n, t + d); }
    }
    st.tl.extend(t + 6000);
    for (const iv of st.tl.ev) { if (iv.a > t) n = Math.min(n, iv.a); else if (iv.b > t) n = Math.min(n, iv.b); }
    if (st.quiet > t) n = Math.min(n, st.quiet);
    return n;
  }
  // Scene memory: some cues happen at most once a scene (Ren's glasses adjustment, Suzu's wink).
  function cueFor(st, tag, prevTag, memo, who) {
    const mk = CUES[tag];
    if (!mk) return null;
    const ctx = { prev: prevTag, first: (k) => { const key = who + ':' + k; if (memo.has(key)) return false; memo.add(key); return true; } };
    const beats = mk(st.pr, ctx);
    return beats.length ? beats : null;
  }

  // ---- the player: one dialogue canvas at a time -----------------------------------------------------------
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  let cur = null;         // { cv, sj, who, expr, st, t0 (idle clock origin), timer, key }
  let last = null;        // { subj, tag } of the previous line with a portrait (consecutive lines)
  let memo = { scene: null, used: new Set() };
  const stats = { plays: 0, cues: 0, paints: 0, ticks: 0, paintMs: 0, maxPaintMs: 0, log: [] };
  const observed = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  let io = null;
  const vis = typeof WeakMap !== 'undefined' ? new WeakMap() : null; // canvas → on screen (IntersectionObserver)
  const onScreenOf = (cv) => !vis || vis.get(cv) !== false;

  function still(o) {
    return !!((RB.game && RB.game.reducedMotion && RB.game.reducedMotion()) || (RB.game && RB.game.fastForward && RB.game.fastForward()) || o.still);
  }
  function paint(fr) {
    const c = cur;
    const key = RB.portraits.frameKey(fr);
    if (key === c.key) return;
    const t0 = now();
    RB.portraits.paintFrame(c.cv, c.sj, c.expr, fr);
    const ms = now() - t0;
    c.key = key; c.fr = fr;
    stats.paints++; stats.paintMs += ms; stats.maxPaintMs = Math.max(stats.maxPaintMs, ms);
    stats.log.push({ t: Math.round(t0), k: key, who: c.who, expr: c.expr });
    if (stats.log.length > 400) stats.log.splice(0, stats.log.length - 300);
  }
  function running() {
    if (!cur || !cur.st) return false;
    if (typeof document !== 'undefined' && document.hidden) return false;
    if (!onScreenOf(cur.cv)) return false;
    return !!(cur.cv && cur.cv.isConnected);
  }
  function schedule() {
    if (!cur) return;
    clearTimeout(cur.timer); cur.timer = null;
    if (!running()) return;
    const t = now() - cur.t0;
    const n = nextAt(cur.st, t);
    cur.timer = setTimeout(tick, Math.max(16, Math.ceil(n - t)));
  }
  function tick() {
    if (!cur) return;
    cur.timer = null;
    stats.ticks++;
    if (!running()) return;
    if (still({})) { paint(null); cur.st = null; return; } // Reduce motion turned on while a line is shown
    paint(frameAt(cur.st, now() - cur.t0));
    schedule();
  }

  // Show `who`'s portrait for a line: o = { who ('pc' for the player), look (the player's), expr (the line's
  // tag), scene (scene id), still (no animation) }.
  function play(cv, o) {
    o = o || {};
    watch(cv);
    const sj = RB.portraits.subject(o.who, o.who === 'pc' ? o.look || null : null);
    if (!sj) { stop(); return; }
    const tag = o.expr ? RB.portraits.exprName(o.expr) : null;
    const expr = tag || 'neutral';
    const scene = o.scene || null;
    if (scene !== memo.scene) memo = { scene, used: new Set() };
    const same = !!(last && last.subj === sj.key && cur && cur.cv === cv && cur.st);
    const prevTag = same ? last.tag : null;
    last = { subj: sj.key, tag };
    stats.plays++;
    if (cur && cur.cv !== cv) stop(true);
    if (still(o)) {
      if (cur) clearTimeout(cur.timer);
      cur = { cv, sj, who: sj.who, expr, st: null, t0: now(), timer: null, key: null };
      paint(null);
      return;
    }
    const pr = profileOf(sj.who, sj.p);
    const info = RB.portraits.exprInfo(expr);
    const loop = Object.assign({}, LOOP[info.name] || {});
    if (loop.blinkMul || loop.shut) pr.blink = pr.blink && pr.blink.map((v) => v * (loop.blinkMul || 1));
    if (loop.shut) pr.shut = loop.shut;
    // the same speaker goes on: keep the idle clock (the breath and blinks do not restart every line)
    let t0 = now(), tl = null, phase = 0;
    if (same && cur.st && cur.st.pr.id === pr.id) { t0 = cur.t0; tl = cur.st.tl; phase = cur.st.phase; tl.ref.pr = pr; }
    if (!tl) {
      const seed = RB.util.hashStr(sj.key + '|' + (scene || ''));
      tl = Timeline(pr, seed);
      phase = seed % 4000;
    }
    const t = now() - t0;
    const st = { pr, tl, expr, info, loop, cue: null, quiet: 0, phase };
    // the lead-in cue: once when the line appears; a repeated tag from the same speaker keeps the loop going
    if (tag && !(same && prevTag === tag)) {
      const beats = cueFor(st, info.name, prevTag, memo.used, sj.who);
      if (beats) {
        let a = t;
        const out = [];
        for (const [d, fr] of beats) { out.push([a, a + d, fr]); a += d; }
        st.cue = { t0: t, beats: out, end: a, tag: info.name };
        st.quiet = a + 400; // idle events wait until the face has settled
        stats.cues++;
      }
    } else if (same && cur.st && cur.st.cue && t < cur.st.cue.end && cur.st.cue.tag === info.name) {
      st.cue = cur.st.cue; st.quiet = cur.st.quiet; // the same cue goes on (it is never restarted)
    }
    if (same && cur.st) st.quiet = Math.max(st.quiet, cur.st.quiet);
    const keep = cur && cur.cv === cv && cur.sj.key === sj.key && cur.expr === expr ? cur.key : null; // nothing to repaint
    if (cur) clearTimeout(cur.timer);
    cur = { cv, sj, who: sj.who, expr, st, t0, timer: null, key: keep, fr: cur && keep != null ? cur.fr : null };
    paint(frameAt(st, t));
    schedule();
    prewarm();
  }
  // Prepare the people most likely to speak next (the companion, the player) in idle time, so their first
  // line does not pay for drawing their hair and bust (≈10–30 ms, once per person while cached).
  const warmed = new Set();
  function prewarm() {
    const s = RB.game && RB.game.s;
    if (!s) return;
    const ric = typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : (fn) => setTimeout(fn, 250);
    const todo = [];
    if (s.comp) todo.push([s.comp, null]);
    if (RB.equip && s.player) todo.push(['pc', RB.equip.look(s)]);
    if (warmed.size > 40) warmed.clear();
    for (const [who, look] of todo) {
      const sj = RB.portraits.subject(who, look);
      if (!sj || warmed.has(sj.key)) continue;
      warmed.add(sj.key);
      ric(() => { try { RB.portraits.frame(sj, 'neutral', null); } catch (e) { /* drawn when needed */ } }, { timeout: 2000 });
    }
  }
  // Nothing more to show: the dialogue closed, or a line without a portrait.
  function stop(keepLast) {
    if (cur) clearTimeout(cur.timer);
    cur = null;
    if (!keepLast) last = null;
  }
  // The player's look changed while their portrait is up (equipment): repaint with the new look.
  function refresh() {
    if (!cur || cur.who !== 'pc') return;
    const sj = RB.portraits.subject('pc', RB.equip ? RB.equip.look() : null);
    if (!sj || sj.key === cur.sj.key) return;
    cur.sj = sj; cur.key = null;
    last = last && Object.assign({}, last, { subj: sj.key });
    paint(cur.st ? frameAt(cur.st, now() - cur.t0) : null);
  }
  function watch(cv) {
    if (!cv || !observed || observed.has(cv)) return;
    observed.add(cv);
    if (typeof IntersectionObserver !== 'undefined') {
      if (!io) io = new IntersectionObserver((es) => {
        for (const e of es) {
          vis.set(e.target, e.isIntersecting);
          if (!cur || e.target !== cur.cv) continue;
          if (e.isIntersecting) schedule(); else { clearTimeout(cur.timer); cur.timer = null; }
        }
      });
      io.observe(cv);
    }
    fit(cv);
  }

  // ---- integer display scale (PORTRAITS.md §3 item 8) ------------------------------------------------------
  // The 96-px art at a size that maps to a whole number of device pixels per art pixel where one lies close to
  // the layout's size (--por-target in 50_play.css: within 15% either side of it); otherwise the layout's
  // size is kept. Desktop keeps 116 CSS px at device-pixel-ratio 1, 1.25 and 2 (the owner's choice: 96 read as
  // too small, so the 1.21× scale stays) and gets 128 at ratio 1.5 and 3; short landscape (84) gets 96; phones
  // get 64 at ratio 3 (2×) and 1.5 (1×). In the phone layout the portrait has a row of its own above the sheet,
  // so it never grows there (--por-grow: 0): a larger portrait would make the sheet taller and cover more of
  // the scene (a 390×844 window at ratio 1 keeps 64, uneven, as before).
  function fitSize(target, dpr, grow) {
    const k = Math.max(1, Math.round((target * dpr) / 96));
    let css = (k * 96) / dpr;
    if (css < target * 0.85 || css > target * 1.15) css = target;
    if (grow === false && css > target) css = target;
    return Math.round(css * 100) / 100;
  }
  function fit(cv) {
    if (!cv || typeof getComputedStyle === 'undefined') return;
    const cs = getComputedStyle(cv);
    const v = parseFloat(cs.getPropertyValue('--por-target'));
    if (!v) return;
    const grow = String(cs.getPropertyValue('--por-grow')).trim() !== '0';
    const s = fitSize(v, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1, grow);
    cv.style.setProperty('--por-size', s + 'px');
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    let pend = false;
    const refit = () => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; document.querySelectorAll('canvas.portrait').forEach(fit); }); };
    window.addEventListener('resize', refit);
    document.addEventListener('visibilitychange', () => { if (cur) { if (document.hidden) { clearTimeout(cur.timer); cur.timer = null; } else schedule(); } });
    // a change of device-pixel-ratio (a window moved between screens, zoom) fires resize in most browsers
  }
  if (RB.bus) {
    RB.bus.on('equip:change', () => refresh());
    RB.bus.on('campaign:changing', () => { stop(); warmed.clear(); RB.portraits.clearCache('pc|'); });
  }

  // Tests and the evidence pages: the frames of a line over time without painting.
  function timeline(who, expr, o) {
    o = o || {};
    const sj = RB.portraits.subject(who, o.look || null);
    const pr = profileOf(sj.who, sj.p);
    const info = RB.portraits.exprInfo(expr || 'neutral');
    const loop = Object.assign({}, LOOP[info.name] || {});
    if (loop.blinkMul) pr.blink = pr.blink && pr.blink.map((v) => v * loop.blinkMul);
    if (loop.shut) pr.shut = loop.shut;
    const seed = o.seed != null ? o.seed : RB.util.hashStr(sj.key + '|' + (o.scene || ''));
    const st = { pr, tl: Timeline(pr, seed), expr: info.name, info, loop, cue: null, quiet: 0, phase: seed % 4000 };
    if (expr && o.cue !== false) {
      const beats = cueFor(st, info.name, o.prevTag || null, new Set(o.used || []), sj.who);
      if (beats) { let a = 0; const out = []; for (const [d, fr] of beats) { out.push([a, a + d, fr]); a += d; } st.cue = { t0: 0, beats: out, end: a, tag: info.name }; st.quiet = a + 400; }
    }
    const out = [];
    let t = 0, prev = null;
    const end = o.ms || 10000;
    while (t < end) {
      const fr = frameAt(st, t), k = RB.portraits.frameKey(fr);
      if (k !== prev) { out.push({ t: Math.round(t), k, fr }); prev = k; }
      t = nextAt(st, t);
    }
    return { frames: out, cueEnd: st.cue ? st.cue.end : 0, profile: pr };
  }

  return {
    play, stop, refresh, timeline, profileOf, fitSize, CUES, LOOP, PEOPLE, CLASS,
    state: () => (cur ? { who: cur.who, subj: cur.sj.key, expr: cur.expr, key: cur.key, fr: cur.fr || null, animating: !!cur.st, scheduled: !!cur.timer, cue: cur.st && cur.st.cue ? { tag: cur.st.cue.tag, end: cur.st.cue.end, t: now() - cur.t0 } : null, onScreen: onScreenOf(cur.cv) } : null),
    stats: () => Object.assign({}, stats, { log: stats.log.slice(), cache: RB.portraits.cacheStats() }),
    resetStats: () => { stats.plays = stats.cues = stats.paints = stats.ticks = 0; stats.paintMs = stats.maxPaintMs = 0; stats.log.length = 0; },
  };
})();
