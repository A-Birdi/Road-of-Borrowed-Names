/* Records of a journey (expansion P06; docs/future/plan/09_RECORDS.md K1–K5, K8; Robin's H1, H3, R1, R2 §6; C-13,
 * C-52, C-55, C-66): the Road Stamp Book, the travel volume and the traveller's own seal. They read what the journey
 * did and keep their marks in the save's records (RB.records, src/engine/05b_foundations.js), which New Game+ carries.
 *
 *   RB.stampBook  stamps[id] = { family, title, criteria { en, jp }, hidden, known: cond | fn(s), veil { en, jp },
 *                 chapter, when: cond | fn(s), stand, design: { shape, motif, ink } }; stands[id] = { map, x, y, title }.
 *                 A stamp is *earned* when its criteria hold, and *pressed* (recorded, once) at its stand in the
 *                 world, or at once when it has none. No stamp asks for an input mode, going without help, a
 *                 streak, a time, a mastery star (C-13) or a festival score (C-55). Hidden stamps show neutral,
 *                 spoiler-safe criteria ("A side story in Chapter 7"). A stamp whose place the journey may not
 *                 have reached yet (`known`) shows veiled, in its `veil` words, until it is. The chapter-keyed
 *                 families (chapters, people helped, the field guide) list their stamps in story order.
 *   RB.volume     the travel volume's pages: every illustrated sequence (src/ui/43_sequence.js), and pages content
 *                 adds. *Witnessed* = the moment happened in this campaign (skipped or helped counts; no time spent
 *                 watching is asked). Viewable in a campaign (R2 §6): what was witnessed, every page of a finished
 *                 chapter (side stories included), the chosen companion's whole set once the story is finished,
 *                 and special pages revealed with a confirmation. On the Main Menu everything is viewable behind a
 *                 veil until revealed (K5; a device preference, never a witnessed mark).
 *   RB.seal       the traveller's name seal (判子): a frame, a kana from their name, a style; drawn in red on every
 *                 page they witnessed. Designed at creation, or later from the Ledger for older journeys.
 * All of it appears in a journey of the twelve-chapter edition (and on the Main Menu once the edition ships or the
 * development switch is on): a six-chapter journey's Ledger is unchanged until the release (lead's decision F-21). */
var RB = (globalThis.RB = globalThis.RB || {});

// ---- the gate: where the records appear before the release --------------------------------------------------------
RB.recordsUI = {
  inCampaign: (s) => !!(s && RB.edition && RB.edition.of(s) >= 2),
  onMenu: () => !!(RB.edition && (RB.edition.devOn() || (RB.edition.shipped && RB.edition.shipped()))),
};

RB.stampBook = (function () {
  'use strict';
  const C = () => RB.content;
  const S = () => C().stamps || {};
  const ST = () => C().stampStands || {};
  function earned(s, id) {
    const d = S()[id];
    if (!d || !s) return false;
    try { return typeof d.when === 'function' ? !!d.when(s) : RB.state.test(s, d.when); } catch (e) { return false; }
  }
  const pressed = (s, id) => !!(s && RB.records && RB.records.has(s, 'stamps', id));
  function press1(s, id, where) {
    if (pressed(s, id) || !earned(s, id)) return false;
    return RB.records.award(s, 'stamps', id, { at: where || null });
  }
  // at a stand: every stamp of that stand that has been earned and not yet pressed
  function pressAt(s, standId) {
    const out = [];
    for (const id in S()) if (S()[id].stand === standId && press1(s, id, standId)) out.push(id);
    return out;
  }
  // stamps without a stand are pressed as soon as they are earned (the story settles, a page is opened)
  function settle(s) {
    if (!RB.recordsUI.inCampaign(s)) return [];
    const out = [];
    for (const id in S()) if (!S()[id].stand && press1(s, id, null)) out.push(id);
    return out;
  }
  // the earned stamps waiting at a stand
  const ready = (s, standId) => Object.keys(S()).filter((id) => S()[id].stand === standId && earned(s, id) && !pressed(s, id));
  // its place is known to this journey (a stamp without `known` always is)
  function known(s, d) {
    if (!d.known) return true;
    try { return typeof d.known === 'function' ? !!d.known(s) : RB.state.test(s, d.known); } catch (e) { return false; }
  }
  // the families whose stamps belong to a chapter: listed in story order (the twelve-chapter numbers, F-21), any
  // without a chapter after the story's
  const STORY = { chapter: 1, region: 1, guide: 1 };
  const storyNo = (d) => (d.chapter && RB.volume ? RB.volume.numberOf({ chapter: d.chapter }) || 13 : 13);
  // the book: every stamp in order, with its state ('pressed' | 'ready' (earned, its stand waiting) | 'open')
  function book(s) {
    const out = [];
    for (const id of Object.keys(S())) {
      const d = S()[id];
      const st = pressed(s, id) ? 'pressed' : earned(s, id) && d.stand ? 'ready' : 'open';
      const rec = st === 'pressed' ? (s.records.stamps[id] || {}) : null;
      const veiled = st === 'open' && (!!d.hidden || !known(s, d));
      out.push({ id, d, state: st, at: rec ? rec.at : null, t: rec ? rec.t : null, rec, veiled, criteria: veiled && d.veil ? d.veil : d.criteria });
    }
    const fam = [...new Set(out.map((x) => x.d.family))];
    const key = (x, i) => [fam.indexOf(x.d.family), STORY[x.d.family] ? storyNo(x.d) : 0, i];
    return out.map((x, i) => key(x, i).concat([x])).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]).map((k) => k[3]);
  }
  // a stand in the world: content places a prop with scene 'rb.stand' and o.stand = <id>
  RB.hooks = RB.hooks || {};
  RB.hooks.rb_stand = async (a, ctx) => {
    const s = RB.game && RB.game.s;
    const stand = (ctx && ctx.prop && ctx.prop.o && ctx.prop.o.stand) || a[0];
    if (!s || !ST()[stand]) return;
    const got = pressAt(s, stand);
    const T = ST()[stand].title;
    if (got.length) {
      const names = got.map((id) => S()[id].title);
      // the slip, with the line (src/ui/15_award.js stamps)
      if (RB.ui && RB.ui.award && RB.ui.award.stamps) RB.ui.award.stamps(got, stand);
      await RB.script.runInline([{ who: 'narr', jp: '{判|はん} を {押|お}した 。 ' + names.map((n) => '「' + n.jp + '」').join(' '), en: 'You press the stamp' + (got.length > 1 ? 's' : '') + ' into your book: ' + names.map((n) => n.en).join(', ') + '.' }]);
      if (RB.save && RB.save.autosave) RB.save.autosave('progress');
    } else {
      await RB.script.runInline([{ who: 'narr', jp: (T ? T.jp + ' の ' : '') + '{判|はん} が {置|お}いて ある 。 {今|いま} は {押|お}す もの が ない 。', en: (T ? T.en + ': ' : '') + 'a stamp stand. Nothing to press here yet.' }]);
    }
  };
  // the stamps the story's settling presses have their slips too (src/ui/15_award.js stamps)
  if (RB.bus) RB.bus.on('story:settled', () => {
    const s = RB.game && RB.game.s;
    const got = s ? settle(s) : [];
    if (got.length && RB.ui && RB.ui.award && RB.ui.award.stamps) setTimeout(() => RB.ui.award.stamps(got), 400);
  });
  return { earned, pressed, pressAt, settle, ready, book, press1, known };
})();

RB.volume = (function () {
  'use strict';
  const EXTRA = {}; // pages content adds (later chapters, side stories, the Hall …)
  function add(p) { EXTRA[p.id] = p; return p; }
  // A page's chapter is an old chapter's number (1–6, the six-chapter sequences), a chapter key of the twelve ('mb1',
  // 'kr' …) or 'post' (after the story: the guardians, the Hall's tales, the settlement). The volume belongs to the
  // twelve-chapter edition (F-21), so its headings number the chapters in that story order: Cinder Orchard's pages are
  // Chapter 5's there, not Chapter 3's.
  const OLDKEY = { 1: 'rw', 2: 'sg', 3: 'co', 4: 'sb', 5: 'lf', 6: 'sa' };
  function keyOf(p) {
    const c = p && p.chapter;
    if (!c) return null;
    return typeof c === 'string' ? c : OLDKEY[c] || null;
  }
  // the number shown: 0 the prologue, 1–12 the chapters in story order, 13 after the story
  function numberOf(p) {
    const k = keyOf(p);
    if (!k) return 0;
    if (k === 'post') return 13;
    const i = RB.edition ? RB.edition.ORDER.indexOf(k) : -1;
    return i >= 0 ? i + 1 : typeof p.chapter === 'number' ? p.chapter : 0;
  }
  // every page: the illustrated sequences, then pages content added; in story order
  function pages() {
    const out = [];
    if (RB.sequence && RB.sequence.ids) for (const id of RB.sequence.ids()) {
      const d = RB.sequence.get(id);
      if (!d || d.devOnly || d.page === false) continue;
      out.push(Object.assign({ id, seq: id, scene: d.scene || null, chapter: d.chapter || 0, title: d.title, kind: d.kind || (d.chapter ? 'chapter' : 'prologue'), comp: d.comp || null, special: !!d.special, memory: !!d.memory }, d.flag ? { flag: d.flag } : {}, d.criteria ? { criteria: d.criteria } : {}));
    }
    for (const id in EXTRA) out.push(Object.assign({ kind: 'side' }, EXTRA[id]));
    for (const p of out) { p.key = keyOf(p); p.no = numberOf(p); }
    return out.map((p, i) => [p, i]).sort((a, b) => a[0].no - b[0].no || a[1] - b[1]).map((x) => x[0]);
  }
  const page = (id) => pages().find((p) => p.id === id) || null;
  // the moment happened in this campaign (a skipped sequence still counts: s.seq records every viewing; an older
  // save that saw the scene before its sequence existed counts too)
  function witnessed(s, p) {
    if (!s || !p) return false;
    if (p.seq && s.seq && s.seq[p.seq]) return true;
    if (p.scene && s.seen && s.seen[p.scene]) return true;
    if (p.flag && s.flags && s.flags[p.flag]) return true;
    if (p.kind === 'prologue') return true; // every journey began with it
    return false;
  }
  // a chapter's story is finished (by its old number, or a new chapter's key)
  function chapterDone(s, ch) {
    if (!s || !ch) return false;
    const key = typeof ch === 'number' ? OLDKEY[ch] : ch;
    const flag = { rw: 'ch1_done', sg: 'ch2_done', mb1: 'mb1_done', mb2: 'mb2_done', co: 'ch3_done', sb: 'ch4_done', kr: 'kr_done', lf: 'ch5_done', ko: 'ko_done', cr: 'cr_done', yn: 'yn_done', sa: 'postgame', post: 'postgame' }[key];
    return !!(flag && s.flags && s.flags[flag]);
  }
  // viewable inside this campaign (R2 §6)
  function viewable(s, p) {
    if (witnessed(s, p)) return true;
    if (p.special) return !!(s.records && s.records.seals && s.records.seals['reveal:' + p.id]);
    if (p.comp) return !!(s.flags && s.flags.postgame && s.comp === p.comp);
    return chapterDone(s, p.chapter);
  }
  // a special page revealed in a campaign after its confirmation (kept with the journey's records)
  function revealSpecial(s, id) { return RB.records.award(s, 'seals', 'reveal:' + id); }
  // what the page says about how it is witnessed (H1: every page shows its criteria, spoiler-safe)
  function criteria(p) {
    if (p.criteria) return p.criteria;
    if (p.kind === 'prologue') return { en: 'The prologue: every journey.', jp: '{序章|じょしょう}' };
    const n = numberOf(p);
    if (n > 12) return { en: 'After the story.', jp: '{物語|ものがたり} の {後|あと}' };
    if (p.comp) return { en: 'A moment with one companion, in Chapter ' + n + '.', jp: '{第|だい}' + n + '{章|しょう}' };
    return { en: 'Chapter ' + n + ': the main story.', jp: '{第|だい}' + n + '{章|しょう}' };
  }
  // a chapter group's heading (0 the prologue, 13 after the story)
  function heading(n) {
    n = +n || 0;
    if (!n) return { en: 'Prologue', jp: '{序章|じょしょう}' };
    if (n > 12) return { en: 'After the story', jp: '{物語|ものがたり} の {後|あと}' };
    return { en: 'Chapter ' + n, jp: '{第|だい}' + n + '{章|しょう}' };
  }
  // ---- the Main Menu (K4, K5): everything, veiled until revealed; the Continue save's marks ----------------------
  // prefs: the device's viewing preference { unveiled: { id: true }, showAll: bool }; saves: [state…] read-only
  function menuState(p, prefs, saves) {
    const seenIn = (saves || []).filter((s) => witnessed(s, p)).length;
    const open = !!(prefs && (prefs.showAll || (prefs.unveiled && prefs.unveiled[p.id]))) || seenIn > 0;
    return { veiled: !open, seenIn };
  }
  // The beats of a page's sequence, read from its scene with a branch decided by `test` (the campaign's own
  // conditions, read only; or a neutral fixture on the Main Menu). Nothing runs: no state command, no award (K6).
  function beats(seqId, test, comp) {
    const def = RB.sequence && RB.sequence.get(seqId);
    const sc = def && def.scene && RB.content.scenes[def.scene];
    if (!sc) return [];
    const out = [];
    let on = false, shot = null, phase = null;
    for (const c of sc.cmds) {
      if (c.if && !test(c.if)) continue;
      const a = c.args || [];
      if (c.op === 'sequence' && a[0] === seqId) { on = (a[1] || 'begin') === 'begin'; if (!on) break; continue; }
      if (!on) continue;
      if (c.op === 'shot') { if (a[0] !== shot) { shot = a[0]; phase = a[1] || null; } else if (a[1]) phase = a[1]; continue; }
      // (sceneId: the scene the line is in, which is how a replay finds its recording, as the scene itself does)
      if (c.op === 'say' && shot) out.push({ shot, phase, line: { who: c.who === 'comp' ? (comp || 'narr') : c.who, expr: c.expr || null, jp: c.jp, en: c.en, sceneId: def.scene } });
    }
    return out;
  }
  // a neutral fixture branch for the Main Menu: the page's own companion (or the first of the four), no flags
  function fixtureTest(comp) {
    return (cond) => String(cond).split('|').some((alt) => alt.split('&').every((t) => {
      t = t.trim();
      const neg = t[0] === '!'; if (neg) t = t.slice(1);
      const v = t.startsWith('comp=') ? t.slice(5) === comp : false;
      return neg ? !v : v;
    }));
  }
  return { add, pages, page, witnessed, viewable, chapterDone, revealSpecial, criteria, heading, keyOf, numberOf, menuState, beats, fixtureTest };
})();

RB.seal = (function () {
  'use strict';
  const FRAMES = ['round', 'square', 'oval', 'gourd'];
  const STYLES = ['bold', 'fine'];
  // the first kana of the traveller's name (their own reading); a sensible default for an older journey
  function defaultKana(s) {
    const src = (s && s.player && (s.player.nameJp || s.player.name)) || 'ア';
    const ch = String(src).trim()[0] || 'ア';
    return RB.kana && RB.kana.isKana && RB.kana.isKana(ch) ? ch : 'ア';
  }
  function of(s) {
    const d = s && s.player && s.player.seal;
    if (d && FRAMES.indexOf(d.frame) >= 0) return d;
    return { frame: 'round', kana: defaultKana(s), style: 'bold', chosen: false };
  }
  // the traveller sets their seal (kept with the traveller: New Game+ carries it, C-66)
  function set(s, d) {
    if (!s || !s.player || !d) return null;
    const k = String(d.kana || '').trim();
    if (FRAMES.indexOf(d.frame) < 0 || STYLES.indexOf(d.style || 'bold') < 0 || !k || [...k].length > 2) return null;
    if (![...k].every((c) => RB.kana && RB.kana.isKana(c))) return null;
    s.player.seal = { frame: d.frame, kana: k, style: d.style || 'bold', chosen: true };
    return s.player.seal;
  }
  // an SVG of the seal (crisp at any size); red ink, the kana in the middle
  function svg(d, size, label) {
    const z = size || 40;
    const ink = '#b8322a', sw = d.style === 'fine' ? 2.2 : 3.4;
    let frame;
    if (d.frame === 'square') frame = '<rect x="4" y="4" width="32" height="32" rx="3" fill="none" stroke="' + ink + '" stroke-width="' + sw + '"/>';
    else if (d.frame === 'oval') frame = '<ellipse cx="20" cy="20" rx="13" ry="17" fill="none" stroke="' + ink + '" stroke-width="' + sw + '"/>';
    else if (d.frame === 'gourd') frame = '<path d="M20 3 C27 3 28 11 24 15 C32 17 34 27 30 32 C26 38 14 38 10 32 C6 27 8 17 16 15 C12 11 13 3 20 3 Z" fill="none" stroke="' + ink + '" stroke-width="' + sw + '"/>';
    else frame = '<circle cx="20" cy="20" r="16" fill="none" stroke="' + ink + '" stroke-width="' + sw + '"/>';
    const k = [...String(d.kana)];
    const text = k.length > 1
      ? '<text x="20" y="18" text-anchor="middle" font-size="12" fill="' + ink + '" font-weight="700">' + k[0] + '</text><text x="20" y="31" text-anchor="middle" font-size="12" fill="' + ink + '" font-weight="700">' + k[1] + '</text>'
      : '<text x="20" y="26" text-anchor="middle" font-size="' + (d.frame === 'oval' ? 15 : 17) + '" fill="' + ink + '" font-weight="' + (d.style === 'fine' ? 500 : 700) + '">' + k[0] + '</text>';
    return '<svg class="rb-seal" viewBox="0 0 40 40" width="' + z + '" height="' + z + '" role="img" aria-label="' + (label || 'Your seal') + '" lang="ja"><g opacity="0.92">' + frame + text + '</g></svg>';
  }
  return { FRAMES, STYLES, of, set, svg, defaultKana };
})();
