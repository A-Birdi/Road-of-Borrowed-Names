// A Quiet Cast (Practice addendum §5, §6, §8, §21; docs/practice/fishing.md):
// the roster, sites and patches; all 72 task variants (accepted forms, readings,
// meanings, explanations, Foundations preparation); discovery queues, manual
// patches, bags and Look for this fish; species frozen at the cast; idempotent
// commits and the watermark across a save round-trip; milestones once; no bond;
// one mastery event per objective, none for paced/exposed attempts; remarks;
// every companion × pet pair's behaviour data; silhouettes distinct; the
// station placements leave every map's reachable tiles unchanged; Yasu's
// conversation order.
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const F = RB.fishing;
  const plain = (x) => RB.tasks.plain(x).replace(/\s/g, '');
  const camp = (o) => { const s = RB.state.newCampaign({}); s.map = 'rw.village'; s.x = 33; s.y = 20; s.flags.postgame = true; Object.assign(s, o || {}); RB.game.s = s; return s; };

  // ---- the roster (§5.3) and the sites (§5.2) --------------------------------------------------------------------------
  const ROSTER = { 'fish.reedwake.current': ['オイカワ', 'カワムツ', 'ウグイ'], 'fish.reedwake.quiet': ['ギンブナ', 'コイ', 'モツゴ'], 'fish.saltglass.harbor': ['マハゼ', 'ボラ', 'マアジ'] };
  t.eq(F.SITE_ORDER.slice(), Object.keys(ROSTER), 'three sites with the stable semantic ids');
  t.eq(F.FISH_ORDER.length, 9, 'exactly nine fish');
  for (const sid in ROSTER) {
    const S = F.site(sid);
    t.eq(S.species.map((id) => F.fish(id).jp).sort(), ROSTER[sid].slice().sort(), sid + ': its three catalogue entries are the roster\'s (' + ROSTER[sid].join('・') + ')');
    t.eq(S.patches.length, 3, sid + ': three readable casting patches');
    const union = new Set();
    for (const p of S.patches) { t.ok(p.fish.length && p.fish.every((f) => S.species.indexOf(f) >= 0), sid + '/' + p.id + ': its fish are the site\'s'); p.fish.forEach((f) => union.add(f)); t.ok(p.name.jp && p.name.en && p.desc.en, sid + '/' + p.id + ': named and described'); }
    t.eq([...union].sort(), S.species.slice().sort(), sid + ': the three patches together expose all three fish');
  }
  for (const id of F.FISH_ORDER) {
    const d = F.fish(id);
    t.ok(d.jp && d.reading && d.en && d.common && d.survey && d.survey.jp && d.hint && d.art && d.art.profile, id + ': name, reading, survey line, hint and drawing description');
    t.ok(RB.lex.bySurface(d.jp).length > 0, id + ': in the lexicon');
  }

  // ---- the eighteen situations × four profiles (§6.2, §6.3) -----------------------------------------------------------
  const IDS = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'H01', 'H02', 'H03', 'H04', 'H05', 'H06'];
  t.eq(Object.keys(F.SITU).sort(), IDS.slice().sort(), 'exactly the eighteen authored situations');
  const SITE_OF = { C: 'fish.reedwake.current', Q: 'fish.reedwake.quiet', H: 'fish.saltglass.harbor' };
  let variants = 0, writes = 0, chooses = 0, orders = 0, forms = 0;
  for (const id of IDS) {
    const sit = F.situation(id);
    t.eq(sit.site, SITE_OF[id[0]], id + ': at its site');
    t.ok(sit.scene.en && sit.rule.jp && sit.rule.en && sit.misread.en && sit.intent && sit.title.jp, id + ': scene text equivalent, the rule on screen (jp/en), the misreading it explains, an intent');
    for (const prof of ['F', 'E', 'I', 'A']) {
      const k = sit.tasks[prof];
      const w = id + '[' + prof + ']';
      if (!k) { t.ok(false, w + ' missing'); continue; }
      variants++;
      t.ok(['write', 'choose', 'order'].indexOf(k.kind) >= 0, w + ': an existing task kind (' + k.kind + ')');
      t.ok(k.reading && k.meaning && k.meaning.en && k.explain && k.explain.en && k.item, w + ': reading, meaning, explanation and learning item');
      if (prof === 'I' || prof === 'A') t.ok(k.kind === 'order' && prof === 'A' || (k.note && k.note.jp && k.note.en), w + ': the Japanese note it reads (with a translation behind help)');
      if (k.kind === 'write') {
        writes++;
        const acc = k.accept || [k.answer];
        t.ok(acc.map(plain).indexOf(plain(k.answer)) >= 0, w + ': the answer is among the accepted forms');
        for (const a of acc) {
          forms++;
          const r = RB.challenge.check(plain(a), k), rh = RB.challenge.check(plain(a), k, { handwritten: true });
          if (!r.ok || !rh.ok) t.ok(false, w + ': accepted form rejected: ' + a);
        }
        // a real word for another action is explained as unsupported, not as a grammar mistake
        for (const o of k.others || []) t.ok(o.en && o.forms.length && !o.forms.some((f) => acc.map(plain).indexOf(plain(f)) >= 0), w + ': another action\'s words are not accepted here and come with a plain explanation');
        t.ok(!RB.challenge.check('ねこ', k).ok, w + ': an unrelated word is not accepted');
      } else if (k.kind === 'choose') {
        chooses++;
        t.ok(k.options.some((o) => o.ok), w + ': at least one correct option');
        for (const o of k.options.filter((x) => !x.ok)) t.ok(o.why && o.why.en, w + ': every wrong option says why (' + plain(o.jp) + ')');
      } else {
        orders++;
        t.eq(k.tiles.slice().sort(), k.answer.slice().sort(), w + ': the pieces make the answer');
      }
      // Foundations: the expression is taught first and only taught kana are blanked
      if (prof === 'F') {
        t.ok(!!k.teach && k.teach.en, w + ': the expression is taught first');
        if (k.kind === 'write') t.ok(Array.from(plain(k.answer)).length <= 3, w + ': 1–3 kana (' + k.answer + ')');
        else t.ok(k.options.length <= 3, w + ': one accessible choice among few');
      }
      if (prof === 'E' && k.kind === 'write') t.ok(Array.from(plain(k.answer)).length <= 6, w + ': a short expression, 1–6 kana');
    }
  }
  t.eq(variants, 72, '72 task variants (18 × F/E/I/A) — ' + writes + ' write, ' + chooses + ' choose, ' + orders + ' order; ' + forms + ' accepted forms checked');
  // two answers that genuinely fit are both accepted (Q04, Advanced)
  t.ok(F.situation('Q04').tasks.A.options.filter((o) => o.ok).length === 2, 'Q04 (Advanced): both sensible readings of “anywhere but the reed side” are accepted');
  // Foundations with a few taught kana: RB.tasks.prepare blanks one taught kana, and that kana is accepted
  {
    const s = camp(); s.learn.profile = 'F'; s.learn.kanaKnown = 'none'; s.learn.taught = { み: true, ま: true, あ: true, よ: true, ひ: true, お: true };
    let ok = 0, n = 0;
    for (const id of IDS) {
      const k = F.situation(id).tasks.F;
      if (k.kind !== 'write') continue;
      n++;
      const st = RB.tasks.prepare(RB.util.deepClone(k));
      if (st.copy) { ok++; continue; } // nothing taught yet in it: shown as a model to copy (exposed: no mastery)
      if (st.single && RB.challenge.check(st.answer, st).ok && s.learn.taught[st.answer]) ok++;
    }
    t.eq(ok, n, 'Foundations write variants: one taught kana blanked (or a model to copy when none is taught)');
  }

  // ---- discovery (§5.4) ----------------------------------------------------------------------------------------------------
  const ATT = { comp: 'nao', pet: { species: 'cat', name: 'Koma' } };
  const ok1 = () => ({ ok: true, firstTry: true, mistakes: 0, assisted: false, mode: 'choice' });
  for (const sid of F.SITE_ORDER) {
    const s = camp({ comp: 'nao' });
    const seen = [];
    // abandoning never consumes the discovery: the same fish comes back
    const a0 = F.beginCast(s, { site: sid, how: 'discover', attend: ATT });
    const firstFish = a0.fish;
    F.abandon(s, a0.seq);
    t.ok(!F.st(s).observed[firstFish] && F.preview(s, sid, 'discover').fish === firstFish, sid + ': an abandoned cast observes nothing and keeps its place in the queue');
    for (let i = 0; i < 3; i++) {
      const a = F.beginCast(s, { site: sid, how: 'discover', attend: ATT });
      t.ok(F.patchOf(sid, a.patch).fish.indexOf(a.fish) >= 0, sid + ': Discover the waters picks a patch that has the fish');
      const r = F.commitCatch(s, a.seq, { result: ok1() });
      t.ok(r.ok && r.isNew, sid + ': discovery catch ' + (i + 1) + ' is a new species (' + a.fish + ')');
      seen.push(a.fish);
    }
    t.eq(seen.slice().sort(), F.site(sid).species.slice().sort(), sid + ': the first three discovery catches reveal its three entries, no duplicates');
    t.eq(seen[0], firstFish, sid + ': the queue is the seeded order (the abandoned one came first)');
    // afterwards a shuffled bag: every fish of the patch before any repeats
    const P = F.site(sid).patches.find((p) => p.fish.length === 2);
    const got = [];
    for (let i = 0; i < 4; i++) { const a = F.beginCast(s, { site: sid, how: 'patch', patch: P.id, attend: ATT }); got.push(a.fish); F.commitCatch(s, a.seq, { result: ok1() }); }
    t.ok(new Set(got.slice(0, 2)).size === 2 && new Set(got.slice(2, 4)).size === 2, sid + '/' + P.id + ': a shuffled bag — both fish before either repeats (' + got.join(',') + ')');
    // Look for this fish: guided to its patch, guaranteed there
    const want = F.site(sid).species[2];
    const pv = F.preview(s, sid, 'look', null, want);
    t.ok(pv.fish === want && F.patchOf(sid, pv.patch).fish.indexOf(want) >= 0, sid + ': Look for this fish guides to its patch (' + pv.patch + ')');
    const a = F.beginCast(s, { site: sid, how: 'look', look: want, attend: ATT });
    t.eq(a.fish, want, sid + ': and that fish comes on the next catch there');
    F.commitCatch(s, a.seq, { result: ok1() });
    t.ok(!F.queue(s, sid).look, sid + ': the look is used once resolved');
  }
  // manual patch choice prefers unseen eligible fish
  {
    const s = camp();
    const sid = 'fish.reedwake.current', P = F.patchOf(sid, 'open');
    const a = F.beginCast(s, { site: sid, how: 'patch', patch: 'open', attend: ATT });
    F.commitCatch(s, a.seq, { result: ok1() });
    const b = F.beginCast(s, { site: sid, how: 'patch', patch: 'open', attend: ATT });
    t.ok(P.fish.indexOf(b.fish) >= 0 && b.fish !== a.fish, 'a manual patch prefers the fish there not yet seen (' + a.fish + ' then ' + b.fish + ')');
  }
  // the species is frozen at the cast: nothing afterwards changes it
  {
    const s = camp({ comp: 'nao' });
    const a = F.beginCast(s, { site: 'fish.reedwake.current', how: 'discover', attend: ATT });
    const frozen = a.fish, sit = a.situation;
    s.learn.profile = 'A'; s.comp = 'mio'; s.company.pet = 'dog';
    F.preview(s, 'fish.reedwake.current', 'patch', 'shade');
    const r = F.commitCatch(s, a.seq, { result: { ok: true, firstTry: false, mistakes: 3, assisted: true, mode: 'hand' }, paced: { kind: 'gentle', expired: true } });
    t.ok(r.fish === frozen && r.situation === sit, 'species and situation frozen at the cast: profile, companion, pet, mistakes, help and pace change nothing');
  }

  // ---- one commit per catch; the watermark across a save (§21.2) ------------------------------------------------------------
  {
    const s = camp({ comp: 'nao' });
    const calls = [];
    const a = F.beginCast(s, { site: 'fish.saltglass.harbor', how: 'discover', attend: ATT });
    const r1 = F.commitCatch(s, a.seq, { result: ok1(), assess: () => { calls.push(1); return true; } });
    const r2 = F.commitCatch(s, a.seq, { result: ok1(), assess: () => { calls.push(2); return true; } });
    t.ok(r1.ok && !r2.ok && r2.dup && calls.length === 1, 'a second commit of the same cast is refused; the learning outcome is assessed once');
    t.eq(F.st(s).observed[a.fish].count, 1, 'counted once');
    // a save round-trip, then the same callback again
    const saved = JSON.parse(JSON.stringify(s));
    const s2 = RB.save.migrate(saved);
    RB.game.s = s2;
    t.ok(!F.commitCatch(s2, a.seq, { result: ok1() }).ok && F.st(s2).observed[a.fish].count === 1, 'after a reload the old cast cannot be committed again');
    // an uncommitted cast in a save survives and keeps its fish; one at/below the watermark is dropped
    const b = F.beginCast(s2, { site: 'fish.saltglass.harbor', how: 'patch', patch: 'inner', attend: ATT });
    const s3 = RB.save.migrate(JSON.parse(JSON.stringify(s2)));
    t.ok(F.st(s3).active && F.st(s3).active.fish === b.fish && F.st(s3).active.seq === b.seq, 'a cast left in the water is kept with its frozen fish');
    const s4 = JSON.parse(JSON.stringify(s2)); s4.practice.fishing.active.seq = s4.practice.fishing.lastCommittedCatchSeq; RB.save.migrate(s4);
    t.ok(F.st(s4).active === null, 'a stale active cast at or below the watermark is dropped');
    t.ok(F.st(s3).castSeq >= b.seq, 'the cast sequence never goes backward');
  }

  // ---- milestones once; mementos; no bond (§8.1, §14.1) -----------------------------------------------------------------------
  {
    const s = camp({ comp: 'ren' });
    const bond0 = JSON.stringify(s.company.bond);
    const got = [];
    const events = [];
    RB.bus.on('fishing:catch', (e) => events.push(e.seq));
    for (const sid of F.SITE_ORDER) for (let i = 0; i < 3; i++) {
      const a = F.beginCast(s, { site: sid, how: 'discover', attend: { comp: 'ren', pet: null } });
      const r = F.commitCatch(s, a.seq, { result: ok1() });
      got.push([F.distinct(s), r.milestones.join('+')]);
    }
    const ms = got.filter((g) => g[1]).map((g) => g[0] + ':' + g[1]);
    t.eq(ms, ['1:first', '3:survey', '6:frame', '9:spread'], 'milestones exactly at 1, 3, 6 and 9 different fish, each once');
    t.ok(['fish:first', 'fish:survey', 'fish:frame', 'fish:spread'].every((k) => s.awarded[k]), 'finite milestones go through RB.state.once');
    const more = F.beginCast(s, { site: 'fish.reedwake.current', how: 'patch', patch: 'open', attend: { comp: 'ren', pet: null } });
    t.eq(F.commitCatch(s, more.seq, { result: ok1() }).milestones, [], 'later catches give no milestone again');
    t.eq(JSON.stringify(s.company.bond), bond0, 'no bond from fishing, ever');
    t.eq(s.company.memories.filter((m) => m.id === 'fish:outing').length, 1, 'one Shared Memory for the first outing together');
    t.ok(F.reflect(s, { comp: 'ren', choice: 1, site: 'fish.reedwake.current' }).ok && !F.reflect(s, { comp: 'ren', choice: 0 }).ok, 'the shared reflection after all nine, once');
    t.eq(s.company.memories.filter((m) => m.id === 'fish:reflection').length, 1, 'one Shared Memory for the reflection');
    t.eq(JSON.stringify(s.company.bond), bond0, 'still no bond after the reflection');
    const mem = RB.practice.mementos(s).filter((m) => m.source === 'fishing').map((m) => m.id);
    t.eq(mem, ['fish:ribbon', 'fish:frame'], 'the Practice mementos source lists the rod ribbon and the framed illustration');
    t.ok(F.ribbon(s) === true && F.ribbon(s, false) === false && F.ribbon(s) === false, 'the ribbon can be taken off (cosmetic only)');
    t.ok(events.length === 10, 'one fishing:catch event per committed catch (no discovery:resolved)');
    t.ok(F.st(s).recentAttempts.length <= F.LIMITS.recent, 'recent attempt details are bounded (' + F.LIMITS.recent + ')');
    // no companion present: no memory, the reflection is the solo version
    const s2 = camp({ comp: 'mio' });
    const a = F.beginCast(s2, { site: 'fish.reedwake.quiet', how: 'discover', attend: { comp: null, pet: null } });
    F.commitCatch(s2, a.seq, { result: ok1() });
    t.ok(!s2.company.memories.some((m) => m.id === 'fish:outing') && F.st(s2).observed[a.fish].first.comp === null, 'without the companion actually there, no shared memory; who attended is recorded truthfully');
  }
  // bounded records
  {
    const s = camp();
    for (let i = 0; i < 70; i++) { const a = F.beginCast(s, { site: 'fish.reedwake.current', how: 'patch', patch: 'edge', attend: ATT }); F.commitCatch(s, a.seq, { result: ok1() }); }
    t.ok(F.st(s).recentAttempts.length === 50 && F.st(s).recentSituations.length <= F.LIMITS.situations && F.st(s).catches === 70, 'after 70 catches: 50 attempt details kept, the aggregate count continues');
  }

  // ---- learning evidence (§4.3): one event per objective; never for paced or exposed attempts ------------------------------------
  {
    const s = camp();
    const recs = [];
    const real = RB.learn.record;
    RB.learn.record = (id, r) => { recs.push([id, r.ok]); return real(id, r); };
    const obj = RB.practice.objectives({ kind: 'fishing' });
    const run = (res, o) => { const a = F.beginCast(s, { site: 'fish.reedwake.current', how: 'discover', attend: ATT }); const k = F.situation(a.situation).tasks[a.profile]; F.commitCatch(s, a.seq, { result: res, assess: () => obj.assess('fish:' + a.seq, k.item, res, Object.assign({ kind: 'fishing' }, o)) }); return k.item; };
    const i1 = run({ ok: true, firstTry: false, mistakes: 1, mode: 'hand' }, {});
    run({ ok: true, firstTry: true, mode: 'hand' }, { paced: true });
    run({ ok: true, firstTry: true, mode: 'choice', revealed: true, assisted: true }, { exposed: true });
    RB.learn.record = real;
    t.eq(recs, [[i1, false]], 'one mastery event (a genuine confirmed mistake counts as it); none from a paced or an exposed attempt');
  }

  // ---- the situation cooldown (§4.4) ----------------------------------------------------------------------------------------------
  {
    const s = camp();
    let last = null, repeats = 0, missedBack = 0;
    const hist = [];
    for (let i = 0; i < 40; i++) {
      const a = F.beginCast(s, { site: 'fish.saltglass.harbor', how: 'patch', patch: 'inner', attend: ATT });
      if (a.situation === last) repeats++;
      const miss = i % 3 === 0;
      const recentMiss = hist.slice(-4).some((h) => h.id === a.situation && h.missed);
      if (recentMiss) missedBack++;
      hist.push({ id: a.situation, missed: miss });
      F.commitCatch(s, a.seq, { result: { ok: true, firstTry: !miss } });
      last = a.situation;
    }
    t.ok(repeats === 0 && missedBack === 0, 'never the same situation twice running; one answered after a mistake waits four casts');
  }

  // ---- remarks (§8.3) --------------------------------------------------------------------------------------------------------------
  for (const c of ['nao', 'mio', 'ren', 'suzu']) {
    const R = F.content().remarks[c];
    const kinds = ['first', 'wait', 'catch', 'discover', 'stop', 'survey'];
    t.ok(kinds.every((k) => R[k] && R[k].length && R[k].every((l) => l.jp && l.en)), c + ': remarks for first outing, patient wait, ordinary catch, new discovery, voluntary stop, completed survey');
    const n = kinds.reduce((a, k) => a + R[k].length, 0);
    t.ok(n >= 6 && R.wait.length >= 2 && R.catch.length >= 2, c + ': ' + n + ' remarks (repeatable ones with variants)');
    t.ok(R.reflectAsk && R.reflect && R.reflect.length === 3, c + ': a reflection answer to each of the three replies');
  }
  {
    const all = ['nao', 'mio', 'ren', 'suzu'].map((c) => F.content().remarks[c].catch[0].jp);
    t.eq(new Set(all).size, 4, 'each companion speaks in their own words');
  }

  // ---- the companions' behaviours and the pets' reactions: all sixteen pairs (§8.2, §8.3) ---------------------------------------------
  {
    const ST = RB.fishStage;
    const B = ST.BEHAVIOURS;
    t.eq(B, ['settle', 'notes', 'watch', 'splash', 'lean', 'respond', 'rest'], 'seven companion behaviours');
    const sig = {};
    for (const c of ['nao', 'mio', 'ren', 'suzu']) {
      const D = ST.COMP[c];
      t.ok(B.every((b) => D[b] && Object.keys(D[b]).length) && D.ms > 0, c + ': every behaviour has a pose, with its own timing (' + D.ms + ' ms)');
      sig[c] = JSON.stringify(B.map((b) => D[b])) + D.ms;
    }
    t.eq(new Set(Object.values(sig)).size, 4, 'four distinct sets of gestures and timing');
    const P = ST.PETK;
    for (const sp of ['cat', 'dog', 'bird', 'tanuki']) t.ok(P[sp] && P[sp].calm && typeof P[sp].follow === 'function' && P[sp].splash && P[sp].attend, sp + ': calm, follow, splash and attend reactions');
    t.ok(typeof P.bird.ripple === 'function' && P.tanuki.attend.paws > 0 && P.dog.splash.lean > 0 && P.cat.follow(0.5).hy !== P.cat.follow(-0.5).hy, 'the species\' own reactions: the bird turns to ripples, the tanuki copies the attentive posture, the dog leans to a splash, the cat follows the float');
    // every companion × pet pair through a catch's commit: who attended is recorded per pair
    let pairs = 0;
    for (const c of ['nao', 'mio', 'ren', 'suzu']) for (const sp of ['cat', 'dog', 'bird', 'tanuki', null]) {
      const s = camp({ comp: c });
      const a = F.beginCast(s, { site: 'fish.reedwake.current', how: 'discover', attend: { comp: c, pet: sp ? { species: sp, name: 'X' } : null } });
      const r = F.commitCatch(s, a.seq, { result: ok1() });
      const o = F.st(s).observed[r.fish].first;
      if (o.comp === c && (sp ? o.pet && o.pet.species === sp : o.pet === null) && r.memory === 'fish:outing') pairs++;
    }
    t.eq(pairs, 20, 'all 16 companion × pet pairs (and each companion with no pet): attendance recorded, the outing memory kept, no bond');
    t.ok(Object.keys(ST.PC).length >= 12 && ['prepare', 'cast', 'watch', 'attend', 'guideL', 'guideR', 'slack', 'lift', 'close', 'observe', 'release', 'rest'].every((k) => ST.PC[k]), 'the player\'s twelve poses');
  }

  // ---- the drawings: distinct silhouettes, not palette swaps (§5.3, §8.2) -----------------------------------------------------------
  {
    const A = RB.fishArt;
    const renders = F.FISH_ORDER.map((id) => [id, A.render(F.fish(id), { len: 64, view: 'silhouette' })]);
    let worst = 0, pair = '';
    for (let i = 0; i < renders.length; i++) for (let j = i + 1; j < renders.length; j++) {
      const v = A.iou(renders[i][1], renders[j][1]);
      if (v > worst) { worst = v; pair = renders[i][0] + '/' + renders[j][0]; }
    }
    t.ok(worst < 0.9, 'all 36 pairs of silhouettes differ (largest overlap ' + worst.toFixed(2) + ', ' + pair + ')');
    const plates = F.FISH_ORDER.map((id) => A.render(F.fish(id), { view: 'plate' }));
    t.ok(plates.every((r) => r.w > 40 && r.h > 10 && r.mask.some((m) => m)), 'every fish has a catalogue plate');
    const bl = A.blank({ len: 64 });
    t.ok(bl.mask.some((m) => m) && renders.every((r) => A.iou(r[1], bl) < 0.999), 'unseen entries share one plain outline (it spoils no particular fish)');
  }

  // ---- placement in existing maps: no path or story prop is touched (§5.2) ------------------------------------------------------------
  {
    const reach = (mapId, flags) => {
      const s = camp(); Object.assign(s.flags, flags); s.map = mapId;
      const m = RB.maps.compile(mapId);
      const sp = RB.content.maps[mapId].spawn.default;
      const seen = new Set([sp[0] + ',' + sp[1]]), q = [[sp[0], sp[1]]];
      while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (seen.has(k) || RB.maps.blockedStatic(m, nx, ny)) continue; seen.add(k); q.push([nx, ny]); } }
      return seen;
    };
    for (const sid of F.SITE_ORDER) {
      const S = F.site(sid);
      const before = reach(S.map, {}), after = reach(S.map, { postgame: true });
      const diff = [...after].filter((k) => !before.has(k)).concat([...before].filter((k) => !after.has(k)));
      t.eq(diff, [], sid + ': the walkable, reachable tiles of ' + S.map + ' are the same before and after the station appears');
      t.ok(after.has(S.stand.x + ',' + S.stand.y), sid + ': the stand tile (' + S.stand.x + ',' + S.stand.y + ') is reachable');
      const m = RB.maps.compile(S.map);
      t.ok(!RB.maps.exitAt(m, S.stand.x, S.stand.y) && !(m.triggers || []).some((tr) => S.stand.x >= tr.x && S.stand.x < tr.x + tr.w && S.stand.y >= tr.y && S.stand.y < tr.y + tr.h), sid + ': no exit or trigger on the stand tile');
      const def = RB.content.maps[S.map];
      const others = (def.props || []).filter((p) => p.p !== 'fish_station' && p.p !== 'reeds' && p.x === S.station.x && p.y === S.station.y);
      t.eq(others.map((p) => p.p), [], sid + ': no story prop shares the station tile');
      t.ok(!(def.npcs || []).some((n) => (n.x === S.stand.x && n.y === S.stand.y) || (n.x === S.station.x && n.y === S.station.y)), sid + ': no one stands on the stand or station tile');
      const st = (def.props || []).find((p) => p.p === 'fish_station');
      t.ok(st && st.if === 'post' && st.x === S.station.x && st.y === S.station.y && RB.content.scenes[st.scene], sid + ': the station prop appears with the postgame and opens its scene');
      const s = camp(); s.map = S.map; s.x = S.stand.x; s.y = S.stand.y;
      t.eq(F.siteHere(s), sid, sid + ': standing there is being at the station');
    }
  }

  // ---- access and Yasu (§5.1, §3.2) ----------------------------------------------------------------------------------------------
  {
    const s = camp(); s.flags.postgame = false;
    t.ok(!F.eligible(s, { site: 'fish.reedwake.current', skipWorld: true }).ok, 'before the postgame: not offered');
    s.flags.postgame = true;
    t.ok(F.eligible(s, { site: 'fish.reedwake.current', skipWorld: true }).ok, 'after the postgame, at the station: offered');
    s.map = 'sg.harbor';
    t.ok(!F.eligible(s, { site: 'fish.reedwake.current', skipWorld: true }).ok, 'elsewhere: not offered (no remote launch)');
    const y = RB.content.maps['rw.village'].npcs.find((n) => n.id === 'yasu');
    const order = y.talk.map((o) => o.scene);
    const iIntro = order.indexOf('fish.yasu_intro'), iPost = order.indexOf('rw.yasu_post'), iLq = order.findIndex((x) => /^lq\./.test(x));
    t.ok(iLq >= 0 && iLq < iIntro && iIntro < iPost, 'Yasu: his long-quest conversations still come first, his own postgame line follows the favour (' + order.join(' → ') + ')');
    t.ok(RB.content.scenes['fish.yasu_intro'].cmds.some((c) => c.op === 'call' && c.args[0] === 'rw.yasu_post'), 'the favour plays his usual postgame line first');
    t.ok(RB.practice.activities().some((d) => d.id === 'fishing'), 'Words › Ways to practise lists A Quiet Cast');
    t.ok(RB.activity.kinds().indexOf('fishing') >= 0, 'fishing runs through the shared activity controller');
    t.ok(typeof RB.hooks.fish_go === 'function' && typeof RB.hooks.fish_intro === 'function', 'the station scenes\' hooks exist');
  }
  // old saves: nothing inferred; unknown future ids kept
  {
    const s = camp();
    const old = JSON.parse(JSON.stringify(s)); delete old.practice;
    const m = RB.save.migrate(old);
    t.ok(Object.keys(F.st(m).observed).length === 0 && F.st(m).castSeq === 0 && RB.practice.settings(m).fishingPace === 'off', 'an older save starts with no catches and pace Off');
    const f = JSON.parse(JSON.stringify(s)); f.practice.fishing.observed.kingfish = { first: { cast: 1, site: 'x' }, count: 2 };
    const m2 = RB.save.migrate(f);
    t.ok(F.entries(m2).some((e) => e.id === 'kingfish' && e.unavailable) && m2.practice.fishing.observed.kingfish, 'an entry from a later version is kept and shown as unavailable');
    const ng = RB.state.newCampaign({});
    t.ok(Object.keys(ng.practice.fishing.observed).length === 0, 'a new campaign (New Game+ included) carries no catches');
  }
};
