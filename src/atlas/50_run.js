/* Unwritten Atlas — runtime: hooks called by scenes, the run lifecycle
 * (start, rooms, camps, extraction, defeat), rewards, the small run HUD and
 * debug helpers for tests. Hooks:
 *   atlas_start    (coordinator's Reedwake scene; post-game only)
 *   atlas_extract  (the road home, or early from a camp: `!hook atlas_extract early`)
 *   atlas_enter / atlas_obj / atlas_name / atlas_relic / atlas_fork_sign /
 *   atlas_fork / atlas_doors_clue / atlas_door / atlas_camp / atlas_climax / atlas_foe
 *   (used by the atlas scenes in 60_scenes.js) */
var RB = (globalThis.RB = globalThis.RB || {});
RB.hooks = RB.hooks || {};

(function () {
  'use strict';
  const AT = RB.atlas, C = RB.content, A = C.atlas, U = RB.util;
  const FLAG = AT.FLAG;
  const S = () => RB.game.s;
  const runOf = () => { const s = S(); return s && s.atlas && s.atlas.run; };
  const active = () => AT.combat.runActive();
  const dbg = { autoSteps: false, log: [], chooseMod: null, choose: null };

  // ---- small helpers ------------------------------------------------------------------------
  const lineFor = (o) => (o && (o.jp != null || o.en != null) ? o : RB.activities.tier(o));
  async function say(who, line, expr) {
    const l = lineFor(line);
    if (!l) return;
    const s = S();
    if (who === 'comp') who = s.comp || 'narr';
    await RB.ui.dialogue.say({ who, jp: l.jp, en: l.en, expr: expr || null });
  }
  async function compSay(lines, expr) {
    const s = S();
    const l = lines && (lines[s.comp] || lines.any);
    if (l) await say('comp', l, expr || l.expr);
  }
  async function choose(opts) {
    if (dbg.choose) { const i = dbg.choose(opts); if (i != null) return i; }
    return RB.ui.dialogue.choose(opts);
  }
  // Keep the world still while a hook shows dialogue outside a running scene.
  async function inDialogue(fn) {
    const outer = RB.game.mode() !== 'world';
    if (!outer) RB.game.pushMode('dialogue');
    try { return await fn(); } finally {
      if (!outer) {
        RB.ui.dialogue.hide();
        RB.game.popMode('dialogue');
        RB.world.refreshActors();
        RB.game.afterScene();
      }
    }
  }
  // Run an authored scene from inside a hook (nested runs pop their own mode).
  async function scene(id) {
    await RB.script.run(id);
  }
  async function toast(kind, jp, en) { try { await RB.ui.toast({ kind, jp, en }); } catch (e) { /* headless */ } }
  function addNote(id) {
    const s = S();
    if (!C.notes[id] || s.notebook.find((n) => n.id === id)) return false;
    s.notebook.push({ kind: 'lore', id, t: Date.now() });
    return true;
  }
  async function note(id) {
    if (addNote(id)) { const n = C.notes[id]; await toast('note', n.title.jp, n.title.en); return true; }
    return false;
  }
  function roomNow() {
    const run = runOf();
    const s = S();
    if (!run || !s.map.startsWith('atlas.')) return null;
    const plan = AT.planOf(run);
    return { run, plan, key: s.map.split('.')[2], room: plan.rooms[s.map.split('.')[2]], def: C.maps[s.map] };
  }
  function exitInFront() {
    const W = RB.world.W;
    const [fx, fy] = RB.world.frontTile();
    const m = W.map;
    let best = null;
    for (const e of m.exits) if (fx >= e.x && fx < e.x + e.w && fy >= e.y && fy < e.y + e.h) best = e;
    if (!best) {
      // fall back to the nearest exit (e.g. if the player turned after bouncing)
      const p = W.player;
      let d0 = 1e9;
      for (const e of m.exits) { const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y); if (d < d0) { d0 = d; best = e; } }
    }
    return best;
  }
  async function goTo(e) {
    const run = runOf();
    const key = e.to.split('.')[2];
    await RB.game.transition(e.to, e.tx, e.ty, e.dir || 'up', { inScript: true });
    if (run) run.room = key;
    RB.save.autosave('auto');
  }
  function learnRecord(item, ok, assisted) {
    try { if (item) RB.learn.record(item, { ok, mode: 'choice', assisted: !!assisted, ctx: 'atlas' }); } catch (e) { /* no-op */ }
  }
  function sideOf(e, m) {
    const mid = (m.w - 1) / 2;
    return e.x < mid - 1 ? 'left' : e.x > mid + 1 ? 'right' : 'middle';
  }
  const SIDE = { left: { jp: '{左|ひだり}', en: 'left' }, right: { jp: '{右|みぎ}', en: 'right' }, middle: { jp: '{真|ま}ん{中|なか}', en: 'middle' } };

  // ---- running a language step ------------------------------------------------------------------
  async function runStep(step, title) {
    if (!step) return { ok: true, assisted: true, skipped: true };
    const st = RB.tasks.prepare(step);
    if (title) st.title = title;
    if (dbg.autoSteps) {
      dbg.log.push({ id: step.id || step.item, kind: step.kind });
      if (st.item) RB.learn.record(st.item, { ok: true, mode: 'choice', assisted: true, ctx: 'atlas' });
      return { ok: true, firstTry: true, mistakes: 0, assisted: true, auto: true };
    }
    RB.ui.dialogue.hide();
    const res = await RB.challenge.runStep(st, { ctxTag: 'atlas', cancelLabel: 'Step back for now' });
    const run = runOf();
    if (run && !res.cancelled) {
      run.stats.steps++;
      if (res.mistakes) run.stats.mistakes += res.mistakes;
      const item = Array.isArray(st.item) ? st.item[0] : st.item;
      run.lastWrong = res.firstTry === false ? item : null;
    }
    return res;
  }

  // =====================================================================================
  // Starting an expedition
  // =====================================================================================
  function offeredMods(s) {
    const r = U.rng(U.hashStr(String(s.id) + ':mods:' + (s.atlas.started || 0)));
    return r.shuffle(A.modifierOrder).slice(0, 3);
  }
  RB.hooks.atlas_start = async function (args, ctx) {
    const s = S();
    if (!s) return;
    void ctx;
    return inDialogue(async () => {
      if (!(s.flags.postgame || s.flags.post || s.atlas.unlocked)) {
        await say('narr', { jp: 'まだ 、 {地図|ちず} の {外|そと} へ {出|で}る {時|とき} で は ない 。', en: 'Not yet. There is still a story to finish on the roads that are written.' });
        return;
      }
      s.atlas.unlocked = true;
      if (s.atlas.run) endRun(s, 'abandon');
      const first = !s.atlas.started;
      await scene(first ? 'atlas.intro.first' : 'atlas.intro.again');
      const offered = offeredMods(s);
      const opts = offered.map((m) => ({ jp: A.modifiers[m].name.jp, en: A.modifiers[m].name.en + ' — ' + A.modifiers[m].desc }));
      opts.push({ jp: '{静|しず}か な {道|みち}', en: 'A quiet road — no modifier' });
      opts.push({ jp: '{今日|きょう} は やめて おく', en: 'Not today' });
      let idx = dbg.chooseMod != null ? dbg.chooseMod : await choose(opts);
      if (idx === opts.length - 1) { await scene('atlas.intro.later'); return; }
      const mods = idx < offered.length ? [offered[idx]] : [];
      if (mods.length && (s.atlas.completed || 0) >= 3) {
        const rest = offered.filter((m) => m !== mods[0]);
        await say('narr', { jp: 'もう {一|ひと}つ 、 {重|かさ}ねる こと も できる 。', en: 'You have walked enough of these roads to pair two conditions, if you like.' });
        const o2 = rest.map((m) => ({ jp: A.modifiers[m].name.jp, en: 'Also: ' + A.modifiers[m].name.en + ' — ' + A.modifiers[m].desc })).concat([{ jp: 'これ だけ で いい', en: 'Just the one' }]);
        const j = dbg.chooseMod2 != null ? dbg.chooseMod2 : await choose(o2);
        if (j < rest.length) mods.push(rest[j]);
      }
      s.atlas.started = (s.atlas.started || 0) + 1;
      const run = AT.newRun(s, mods, dbg.seed != null ? { seed: dbg.seed } : {});
      AT.cleanFlags(s, run.id);
      s.atlas.run = run;
      AT.register(run);
      s.checkpoint = AT.hallSpot();
      s.vars.atlas_mods = mods.length;
      await scene('atlas.intro.go');
      const id = AT.mapId(run, 't');
      const sp = C.maps[id].spawn.default;
      await RB.game.transition(id, sp[0], sp[1], 'up', { inScript: true });
      RB.save.autosave('auto');
      AT.hud.update();
    });
  };

  // =====================================================================================
  // Rooms
  // =====================================================================================
  RB.hooks.atlas_enter = async function () {
    const r = roomNow();
    if (!r) return;
    const s = S();
    s.vars.atlas_dress = ['meadow', 'shore', 'snow', 'ash', 'paper', 'stone'].indexOf(r.room.dress);
    s.vars.atlas_mirror = r.room.mirror ? 1 : 0;
    s.vars.atlas_seen = (s.atlas.patternsSeen && s.atlas.patternsSeen[r.room.pattern]) || 0;
    s.vars.atlas_branch = { lantern: 1, wild: 2, names: 3, long: 4 }[r.room.branch] || 0;
    s.vars.atlas_fog = r.run.mods.indexOf('fog') >= 0 ? 1 : 0;
    s.vars.atlas_esc = r.run.lantern ? 1 : 0;
    s.atlas.patternsSeen = s.atlas.patternsSeen || {};
    s.atlas.patternsSeen[r.room.pattern] = (s.atlas.patternsSeen[r.room.pattern] || 0) + 1;
  };

  const OBJ_INTRO = {
    inscription: { jp: '{刻|きざ}まれた {言葉|ことば} が 、 {一|ひと}つ {欠|か}けて いる 。', en: 'One word is missing from the carving. Without it, the road ahead stays blank.' },
    promise: { jp: '{誰|だれ}か の {約束|やくそく} が 、 {持|も}ち{主|ぬし} から {離|はな}れて {刻|きざ}まれて いる 。', en: 'Someone\'s promise is carved here, loose from whoever made it. Read what it actually commits them to.' },
    sign: { jp: '{立|た}て{札|ふだ} の {言葉|ことば} が 、 ばらばら に なって いる 。', en: 'The words of the sign have come apart. Put them back in order.' },
    lanterns: { jp: '{灯籠|とうろう} の {紙|かみ} が {白|しろ}い 。 {言葉|ことば} を {戻|もど}せば 、 {灯|ひ} が つく だろう 。', en: 'The lantern\'s shade is blank. Give it back its word and it should light.' },
  };
  const OBJ_DONE = {
    inscription: { jp: '{言葉|ことば} が {戻|もど}る と 、 {白紙|はくし} の {幕|まく} が {音|おと} も なく {巻|ま}き{上|あ}がった 。', en: 'As the word comes back, the blank curtain rolls itself up without a sound.' },
    promise: { jp: '{約束|やくそく} が {読|よ}める よう に なる と 、 {道|みち} が {続|つづ}き を {思|おも}い{出|だ}した 。', en: 'Once the promise can be read again, the road remembers how it goes on.' },
    sign: { jp: '{言葉|ことば} が {正|ただ}しい {順番|じゅんばん} に {並|なら}ぶ と 、 {足元|あしもと} の {板|いた} が {一枚|いちまい} ずつ {現|あらわ}れた 。', en: 'With its words in the right order again, the sign settles — and the way ahead fills in, plank by plank.' },
    lanterns: { jp: 'ぽっ 、 と {灯|ひ} が ついた 。', en: 'With a soft pop, the lantern lights.' },
  };
  const COMP_OK = {
    nao: [{ jp: 'よし 。 {読|よ}めた な 。', en: 'Good. You read it.' }, { jp: 'ほら 、 {道|みち} が {開|あ}いた 。', en: 'See? Road\'s open.' }, { jp: '{悪|わる}くない 。 {次|つぎ} 、 {行|い}こう 。', en: 'Not bad. Next.' }],
    mio: [{ jp: 'ちゃんと {戻|もど}った ね 。', en: 'It went back where it belongs.' }, { jp: 'ふう 。 よかった 。', en: 'Phew. Good.' }, { jp: '{少|すこ}し {休|やす}む ？ …… {冗談|じょうだん} 、 {行|い}こう か 。', en: 'Need a rest? …Joking. Let\'s go.' }],
    ren: [{ jp: '{名前|なまえ} が {落|お}ち{着|つ}きました 。', en: 'The name has settled.' }, { jp: '{見事|みごと} です 。 …… {方角|ほうがく} は {私|わたし} に {聞|き}かないで ください 。', en: 'Well done. …Please don\'t ask me which way now.' }, { jp: 'この {灯|ひ} は 、 {長持|ながも}ち します よ 。', en: 'This light will last.' }],
    suzu: [{ jp: 'はい 、 {拍手|はくしゅ} ！', en: 'And — applause!' }, { jp: '{今|いま} の 、 {客席|きゃくせき} まで {届|とど}いた よ 。', en: 'That one carried to the back row.' }, { jp: '{次|つぎ} の {幕|まく} へ 、 どうぞ 。', en: 'On to the next act.' }],
  };
  const COMP_LATER = {
    nao: { jp: 'あとで いい 。 {逃|に}げない から 。', en: 'Later\'s fine. It\'s not going anywhere.' },
    mio: { jp: '{無理|むり} しない で 。 また {来|こ}よう 。', en: 'Don\'t push it. We\'ll come back.' },
    ren: { jp: '{急|いそ}ぐ {道|みち} で は ありません 。', en: 'This road is not in a hurry.' },
    suzu: { jp: '{幕間|まくあい} だ ね 。 {少|すこ}し {休憩|きゅうけい} 。', en: 'Intermission. A little break.' },
  };
  function compOk() {
    const s = S();
    const l = COMP_OK[s.comp];
    if (!l) return null;
    s.vars.atlas_okn = ((s.vars.atlas_okn || 0) + 1) % l.length;
    return l[s.vars.atlas_okn];
  }

  RB.hooks.atlas_obj = async function (args, ctx) {
    const r = roomNow();
    const pr = ctx && ctx.prop;
    if (!r || !pr) return;
    const o = r.room.obj;
    if (!o || o.id !== pr.obj) return;
    const s = S();
    const run = r.run;
    run.objs[o.id] = run.objs[o.id] || {};
    const os = run.objs[o.id];
    const P = s.learn.profile;
    let step;
    if (o.type === 'lanterns') {
      const i = pr.lamp || 0;
      if (s.flags[FLAG(o.id + '_' + i)]) return;
      os.steps = os.steps || {};
      const key = P + i;
      if (!os.steps[key]) os.steps[key] = AT.lampStep(o, run, P, i, (o.seed ^ U.hashStr(P)) >>> 0);
      step = os.steps[key];
    } else {
      if (s.flags[FLAG(o.id)]) return;
      os.drill = os.drill || {};
      if (!os.drill[P]) os.drill[P] = AT.objectiveSteps(o, run, P)[0];
      step = os.drill[P];
    }
    await say('narr', OBJ_INTRO[o.type] || OBJ_INTRO.inscription);
    const res = await runStep(step, { inscription: 'Restore the inscription', promise: 'Read the loose promise', sign: 'Mend the road sign', lanterns: 'Light the lantern' }[o.type]);
    if (res.cancelled) { await compSay(COMP_LATER); return; }
    RB.audio && RB.audio.sfx(o.type === 'lanterns' ? 'lantern' : 'reveal');
    if (o.type === 'lanterns') {
      s.flags[FLAG(o.id + '_' + (pr.lamp || 0))] = true;
      const lit = Array.from({ length: o.lamps }, (_, i) => !!s.flags[FLAG(o.id + '_' + i)]).filter(Boolean).length;
      await say('narr', OBJ_DONE.lanterns);
      if (lit < o.lamps) { await say('narr', { jp: 'あと ' + (o.lamps - lit) + ' つ 。', en: (o.lamps - lit) + ' more to light.' }); return; }
      s.flags[FLAG(o.id)] = true;
      await say('narr', { jp: 'すべて の {灯|ひ} が ともる と 、 {白紙|はくし} の {幕|まく} が {上|あ}がった 。', en: 'With every lantern lit, the blank curtain lifts.' });
    } else {
      s.flags[FLAG(o.id)] = true;
      await say('narr', OBJ_DONE[o.type] || OBJ_DONE.inscription);
      if (o.type === 'promise' && o.promise) {
        run.promises = (run.promises || 0) + 1;
        s.flags[FLAG('pr' + run.promises)] = true;
        await say('narr', run.promises === 1
          ? { jp: 'どこか 、 {先|さき} の {方|ほう} で 、 {閉|し}まって いた {何|なに}か が {開|ひら}く {音|おと} が した 。', en: 'Somewhere further along, something that was shut opens with a click. (A side room at the camp.)' }
          : { jp: '{道|みち} の {終|お}わり で {待|ま}つ {者|もの} の {結|むす}び{目|め} が 、 {一|ひと}つ ほどけた 。', en: 'At the end of the road, one of the guardian\'s knots has already come loose. (A side room there opens, too.)' });
      }
    }
    run.done[o.id] = true;
    run.stats.objectives++;
    RB.bus.emit('atlas:event', { run: run.id, id: o.id, kind: o.type, room: r.key, pattern: r.room.pattern, branch: r.room.branch || null, assisted: !!res.assisted }); // (The Pages We Keep)
    const c = compOk();
    if (c) await say('comp', c, 'smile');
    RB.world.refreshActors();
  };

  RB.hooks.atlas_name = async function (args, ctx) {
    const r = roomNow();
    if (!r || !ctx || !ctx.npc) return;
    const s = S();
    const npc = (r.def.npcs || []).find((n) => n.id === ctx.npc);
    if (!npc) return;
    const i = +npc.id.replace('atlas_n', '');
    const fk = FLAG('name_' + r.key + '_' + i);
    if (s.flags[fk]) return;
    const nd = A.names[npc.name];
    const run = r.run;
    const okey = 'name_' + r.key + '_' + i;
    run.objs[okey] = run.objs[okey] || {};
    const P = s.learn.profile;
    if (!run.objs[okey][P]) run.objs[okey][P] = AT.objectiveSteps({ type: 'name', seed: (run.seed ^ U.hashStr(okey)) >>> 0 }, run, P, { name: npc.name })[0];
    await say('narr', { jp: '{名前|なまえ} の {薄|うす}れた {紙|かみ} {切|き}れ が 、 {帰|かえ}る {場所|ばしょ} を {探|さが}して いる 。', en: 'A slip of paper whose writing has faded is looking for the way home. It wants to be understood before it can remember where it belongs.' });
    const res = await runStep(run.objs[okey][P], 'Answer the unmoored name');
    if (res.cancelled) { await compSay(COMP_LATER); return; }
    s.flags[fk] = true;
    if (run.names.indexOf(npc.name) < 0) run.names.push(npc.name);
    RB.bus.emit('atlas:event', { run: run.id, id: okey, kind: 'name', name: npc.name, room: r.key, pattern: r.room.pattern, branch: r.room.branch || null }); // (The Pages We Keep)
    RB.audio && RB.audio.sfx('discover');
    await say('narr', nd.moored);
    await note('atlas_name_' + npc.name);
    if (npc.required && r.room.obj && r.room.obj.type === 'name') {
      s.flags[FLAG(r.room.obj.id)] = true;
      run.done[r.room.obj.id] = true;
      run.stats.objectives++;
    }
    await compSay(NAME_REACT[npc.name] || {});
    RB.world.refreshActors();
  };
  // Companions react to the stories of particular names.
  const NAME_REACT = {
    ferry: { nao: { jp: 'コウジ の {声|こえ} だ 。 {朝|あさ} から うるさい ん だ よ 、 あれ 。', en: 'That\'s Kōji\'s call. Loud first thing in the morning, that.' }, mio: { jp: '{霧|きり} の {朝|あさ} は 、 {橋|はし} より あの {声|こえ} を {頼|たよ}り に した もの ね 。', en: 'On foggy mornings we did follow that voice more than the bridge.' }, ren: { jp: '{渡|わた}し{場|ば} の {灯籠|とうろう} も 、 {明日|あした} {見|み}て おきます 。', en: 'I\'ll check the ferry-landing lantern tomorrow as well.' }, suzu: { jp: 'いい {声|こえ} ！ うち の {一座|いちざ} に {欲|ほ}しい くらい 。', en: 'What a voice! I\'d hire it for the troupe.' } },
    mochi: { nao: { jp: '{港|みなと} の {犬|いぬ} か 。 {荷物|にもつ} を よく {盗|ぬす}まれた 。', en: 'The harbour dog. Stole from my satchel more than once.' }, mio: { jp: '{魚|さかな} じゃ なかった の かも 、 ね 。', en: 'Maybe it was never about the fish.' }, ren: { jp: '{待|ま}つ こと も 、 {灯|ひ} を {守|まも}る こと に {似|に}て います 。', en: 'Waiting is not so different from tending a light.' }, suzu: { jp: '{今度|こんど} 、 {干物|ひもの} を {持|も}って {行|い}こう 。', en: 'Next time I\'m bringing it some dried fish.' } },
    verse: { suzu: { jp: '…… {二番|にばん} 、 {私|わたし} も {歌|うた}える よ 。 {今|いま} なら ね 。', en: '…I can sing the second verse too. Now I can.', expr: 'sad' }, nao: { jp: '{歌|うた} の {半分|はんぶん} を {捨|す}てる の は 、 {手紙|てがみ} の {半分|はんぶん} を {捨|す}てる の と {同|おな}じ だ 。', en: 'Dropping half a song is like dropping half a letter.' }, mio: { jp: '{痛|いた}い {所|ところ} も 、 {薬|くすり} の {一部|いちぶ} な の 。', en: 'The part that hurts is part of the medicine, too.' }, ren: { jp: '{覚|おぼ}えて いる {人|ひと} が いれば 、 {歌|うた} は {残|のこ}ります 。', en: 'As long as someone remembers it, a song survives.' } },
    shortcut: { ren: { jp: '…… {左|ひだり} 。 {柳|やなぎ} で {左|ひだり} 。 {書|か}いて おきます 。', en: '…Left. Left at the willow. I\'m writing that down.' }, nao: { jp: '{知|し}ってた 。 {配達|はいたつ} で {毎日|まいにち} {使|つか}ってた 。', en: 'Knew it. Used it every day on the rounds.' }, mio: { jp: '{子|こ}ども の {頃|ころ} 、 {私|わたし} も {走|はし}った な 。', en: 'I ran that way too, as a kid.' }, suzu: { jp: '{大人|おとな} に は {内緒|ないしょ} 。 {今|いま} も ね 。', en: 'Secret from the grown-ups. Still.' } },
    umeboshi: { mio: { jp: '{塩分|えんぶん} が …… いえ 、 {何|なに} も {言|い}いません 。', en: 'The salt content… no. I\'m not saying anything.', expr: 'smile' }, nao: { jp: 'しょっぱい の は 、 {冬|ふゆ} を {越|こ}す ため だろ 。', en: 'Salty, so it lasts the winter.' }, ren: { jp: '{手|て} が {覚|おぼ}えて いる こと を 、 {誰|だれ}か が {書|か}き{留|と}める べき です ね 。', en: 'Someone should write down what those hands knew.' }, suzu: { jp: '{酸|す}っぱい {顔|かお} なら 、 {得意|とくい} だ よ 。', en: 'I do a very good sour face, you know.' } },
    tuesday: { nao: { jp: '{火曜|かよう} の {配達|はいたつ} 、 あの {店|みせ} だけ {朝|あさ} {早|はや}かった 。', en: 'Tuesday rounds — that shop always wanted me there early.' }, mio: { jp: '{待|ま}つ {楽|たの}しみ 、 か 。 {分|わ}かる {気|き} が する 。', en: 'The pleasure of waiting for something. I think I understand.' }, ren: { jp: '{火曜|かよう} は {私|わたし} の {休|やす}み です 。 {行|い}って みます 。', en: 'Tuesday is my day off. I\'ll go.' }, suzu: { jp: '{毎日|まいにち} {初日|しょにち} じゃ 、 {初日|しょにち} じゃ なく なる もん ね 。', en: 'If every night were opening night, it wouldn\'t be opening night.' } },
    umbrella: { nao: { jp: '{借|か}りた {物|もの} は 、 {返|かえ}す まで が {配達|はいたつ} だ 。', en: 'A borrowed thing isn\'t delivered till it\'s returned.' }, mio: { jp: '{濡|ぬ}れずに {帰|かえ}れた か 、 {知|し}りたい だけ …… やさしい {人|ひと} ね 。', en: 'Just wanting to know they got home dry… a kind person.' }, ren: { jp: '{名前|なまえ} を {忘|わす}れられる の は 、 {少|すこ}し {寂|さび}しい です ね 。', en: 'Being the one whose name is forgotten is a little lonely.' }, suzu: { jp: '{貸|か}し{借|か}り は 、 {帳簿|ちょうぼ} に つけて おく もの 。', en: 'Loans go in the ledger. Always.' } },
    starcat: { ren: { jp: '{天文台|てんもんだい} の {猫|ねこ} …… {師匠|ししょう} も 、 {猫|ねこ} に {文句|もんく} を {言|い}って いた {気|き} が します 。', en: 'The observatory cat… I think my master complained about a cat too.' }, nao: { jp: '{文句|もんく} ばっかり の {奴|やつ} ほど 、 {寂|さび}しがり だ 。', en: 'The ones who complain most miss things most.' }, mio: { jp: '{猫|ねこ} は 、 {暖|あたた}かい {所|ところ} を {知|し}って いる の よ 。', en: 'Cats always know where the warm spot is.' }, suzu: { jp: '{主役|しゅやく} は {猫|ねこ} だった わけ だ 。', en: 'So the cat was the lead all along.' } },
    tomorrow: { nao: { jp: '{手紙|てがみ} の {最後|さいご} に 、 {同|おな}じ こと を {書|か}く {人|ひと} は {多|おお}い 。', en: 'Lots of people end letters that way.' }, mio: { jp: '{約束|やくそく} じゃ なくて {祈|いの}り 。 …… それ で いい の かも 。', en: 'Not a promise, a prayer. …Maybe that\'s all right.' }, ren: { jp: '{毎日|まいにち} {言|い}う から 、 {言葉|ことば} が {擦|す}り{減|へ}らない の です 。', en: 'Said every day, so the words never wore thin.' }, suzu: { jp: '「さようなら 」 は 、 {言|い}わない {方|ほう} が いい {時|とき} も ある 。', en: 'Sometimes "goodbye" is better left unsaid.' } },
    postscript: { mio: { jp: 'やかん の {取|と}っ{手|て} …… うち の も ゆるい の 。 {直|なお}さなきゃ 。', en: 'Kettle handles… mine\'s loose too. I should fix it.' }, nao: { jp: '{追伸|ついしん} だけ で {届|とど}ける {手紙|てがみ} も ある 。', en: 'Some letters you could deliver with just the P.S.' }, ren: { jp: '{肝心|かんじん} な こと は 、 {最後|さいご} に {書|か}く もの です 。', en: 'The important thing always goes at the end.' }, suzu: { jp: '{台所|だいどころ} の {話|はなし} は 、 {嘘|うそ} が つけない から ね 。', en: 'You can\'t lie about a kitchen.' } },
  };

  RB.hooks.atlas_relic = async function (args, ctx) {
    const r = roomNow();
    const pr = ctx && ctx.prop;
    if (!r || !pr) return;
    const s = S();
    const c = r.room.caches.find((x) => x.id === pr.cache);
    if (!c) return;
    const fk = FLAG(r.key + '_' + c.id);
    if (s.flags[fk]) return;
    s.flags[fk] = true;
    const run = r.run;
    RB.audio && RB.audio.sfx('chest');
    if (c.kind === 'keepsake') {
      const pool = A.rewardOrder.filter((id) => C.items[id].slot === 'cosmetic' && id !== 'atlas_cos_lamplet' && !(s.inv[id] > 0));
      await say('narr', { jp: '{紙|かみ} に {包|つつ}まれた {物|もの} が ある 。 {誰|だれ}か の {忘|わす}れ{物|もの} で は なく 、 {道|みち} そのもの から の {贈|おく}り{物|もの} の よう だ 。', en: 'Something wrapped in paper. Not a thing someone lost — more like a gift from the road itself.' });
      if (pool.length) {
        const id = pool[U.rng(run.seed ^ U.hashStr(c.id)).int(pool.length)];
        RB.state.give(s, id, 1);
        run.keepsakes.push(id);
        await toast('item', C.items[id].name.jp, C.items[id].name.en);
        await say('narr', { jp: 'これ は {持|も}ち{帰|かえ}れる 。', en: 'This one you can keep: ' + C.items[id].name.en + '. (Equip it as a keepsake in the Satchel.)' });
      } else {
        await say('narr', { jp: '{中|なか} は {空|から} だった 。 {紙|かみ} に は 「ありがとう 」 と だけ {書|か}いて ある 。', en: 'It is empty. The paper just says "thank you".' });
      }
      return;
    }
    const id = c.relic;
    const rd = A.relics[id];
    if (!rd) return;
    if (run.relics.indexOf(id) < 0) run.relics.push(id);
    await toast('item', rd.name.jp, rd.name.en);
    await say('narr', { jp: rd.name.jp + ' を {見|み}つけた 。', en: 'You find: ' + rd.name.en + '. ' + rd.desc + ' (Temporary: it goes home to its owner when you do.)' });
    await compSay(RELIC_REACT[id] || RELIC_ANY, 'think');
    // Combinations
    const combos = AT.combat.combosOf(run.relics, s.comp).filter((k) => run.combos.indexOf(k) < 0);
    for (const k of combos) {
      run.combos.push(k);
      RB.audio && RB.audio.sfx('harmony_ready');
      await say('narr', { jp: A.combos[k].name.jp, en: 'Combination: ' + A.combos[k].name.en + ' — ' + A.combos[k].desc });
      await note('atlas_combo_' + k);
    }
    await note('atlas_relics');
    AT.hud.update();
  };
  const RELIC_ANY = {
    nao: { jp: '{落|お}とし{物|もの} は 、 {持|も}ち{主|ぬし} に {届|とど}ける まで {預|あず}かる 。', en: 'Lost property. We hold it till it\'s delivered.' },
    mio: { jp: '{大事|だいじ}に {使|つか}おう 。 {借|か}り{物|もの} だ から 。', en: 'Let\'s use it carefully. It\'s borrowed.' },
    ren: { jp: 'この {道|みち} の {誰|だれ}か が 、 {置|お}いて いった の でしょう 。', en: 'Someone on this road must have left it.' },
    suzu: { jp: '{小道具|こどうぐ} ゲット 。 {使|つか}い{方|かた} は {任|まか}せて 。', en: 'New prop! Leave the staging to me.' },
  };
  const RELIC_REACT = {
    tag_nao: { nao: { jp: '…… これ 、 {私|わたし} が {書|か}いた {荷札|にふだ} だ 。 {配|くば}り{損|そこ}ねた {分|ぶん} か 。', en: '…This is a tag I wrote. One of the ones I never delivered.', expr: 'surprise' } },
    vial_mio: { mio: { jp: 'この ラベル 、 {私|わたし} の {字|じ} …… {昔|むかし} 、 {誰|だれ}か に あげた {瓶|びん} だ わ 。', en: 'This label is my handwriting… a bottle I gave someone years ago.', expr: 'surprise' } },
    trim_ren: { ren: { jp: '{芯切|しんき}り …… {師匠|ししょう} と {同|おな}じ {型|かた} です 。 {手|て} が {覚|おぼ}えて います 。', en: 'Wick trimmers… the same kind my master used. My hands remember them.', expr: 'think' } },
    mask_suzu: { suzu: { jp: '{代役|だいやく} の {面|めん} ！ {主役|しゅやく} が {倒|たお}れた {時|とき} の ため の やつ だ よ 。', en: 'An understudy\'s mask! For when the lead goes down.', expr: 'laugh' } },
    bell: { suzu: { jp: 'わたし と {同|おな}じ {名前|なまえ} だ 。 {仲良|なかよ}く しよう ね 。', en: 'It has my name! We\'ll get on.', expr: 'laugh' }, any: RELIC_ANY },
    compass: { ren: { jp: '…… {方位|ほうい}{磁石|じしゃく} です か 。 {私|わたし} が {持|も}つ と 、 {磁石|じしゃく} の {方|ほう} が {迷|まよ}う ので 、 あなた が どうぞ 。', en: '…A compass. If I hold it, the compass gets lost. You take it.', expr: 'smirk' }, nao: { jp: '{北|きた} なら {分|わ}かる 。 でも 、 まあ 、 {持|も}って おけ 。', en: 'I know where north is. But fine, keep it.' } },
    letters: { nao: { jp: '{宛名|あてな} が {全部|ぜんぶ} {読|よ}める 。 …… {帰|かえ}ったら 、 {届|とど}けて いい か ？', en: 'Every address is readable. …When we\'re back, can I deliver these?' } },
    teapot: { mio: { jp: '{急須|きゅうす} が ある なら 、 お{茶|ちゃ} は {任|まか}せて 。', en: 'If there\'s a teapot, leave the tea to me.' } },
    weight: { mio: { jp: '{梅干|うめぼ}し の {重|おも}し{石|いし} …… {重|おも}い わ ね 、 {本当|ほんとう} に 。', en: 'A pickling weight… it really is heavy.' } },
    map: { ren: { jp: '{地図|ちず} の {切|き}れ{端|はし} …… {逆|さか}さま に {持|も}って いない か 、 {確|たし}かめて ください 。', en: 'A scrap of map… please check I\'m not holding it upside down.' } },
  };
  for (const k in RELIC_REACT) if (!RELIC_REACT[k].any) Object.keys(RELIC_ANY).forEach((c) => { if (!RELIC_REACT[k][c]) RELIC_REACT[k][c] = RELIC_ANY[c]; });

  // ---- forks ----------------------------------------------------------------------------------------
  function branchDetail(r, key) {
    const d = r.plan.rooms[key];
    const bits = [];
    if (d.guard) bits.push('a guardian (' + C.enemies[d.guard.enemy].name.en + ')');
    if (d.obj) bits.push({ inscription: 'an inscription to restore', promise: 'a loose promise', sign: 'a broken sign', lanterns: 'blank lanterns', doors: 'three doors and a riddle', name: 'an unmoored name' }[d.obj.type]);
    if (d.caches.length) bits.push(d.caches.length === 1 ? 'something to find' : d.caches.length + ' things to find');
    if (d.names.length) bits.push(d.names.length === 1 ? 'a voice' : d.names.length + ' voices');
    if (d.next[0] && r.plan.rooms[d.next[0]].branch === d.branch) bits.push('and a second room beyond');
    return bits.join(', ');
  }
  RB.hooks.atlas_fork_sign = async function () {
    const r = roomNow();
    if (!r) return;
    const s = S();
    const m = RB.world.W.map;
    const exits = m.exits.filter((e) => e.branch).slice().sort((a, b) => a.x - b.x);
    await say('narr', { jp: '{道標|みちしるべ} の {腕|うで} が 、 {二|ふた}つ の {方向|ほうこう} を {指|さ}して いる 。', en: 'The signpost\'s two arms point two ways.' });
    const detail = run => run.relics.indexOf('compass') >= 0 || run.relics.indexOf('map') >= 0;
    for (const e of exits) {
      const bt = A.branchTypes[e.branch];
      const side = SIDE[sideOf(e, m)];
      const key = e.to.split('.')[2];
      await say('narr', { jp: side.jp + ' : ' + bt.name.jp + ' 。 ' + bt.hint.jp, en: 'To the ' + side.en + ': ' + bt.name.en + '. ' + bt.hint.en + (detail(r.run) ? ' (Your compass and map say: ' + branchDetail(r, key) + '.)' : '') });
    }
    await compSay(FORK_REACT);
    void s;
  };
  const FORK_REACT = {
    nao: { jp: 'どっち でも いい 。 {決|き}めた {方|ほう} が {正解|せいかい} だ 。', en: 'Either\'s fine. Whichever we pick is the right one.' },
    mio: { jp: 'あなた が {選|えら}んで 。 {私|わたし} は ついて {行|い}く 。', en: 'You choose. I\'ll follow.' },
    ren: { jp: '{私|わたし} に {選|えら}ばせる と 、 {三|みっ}つ {目|め} の {道|みち} を {見|み}つけて しまいます よ 。', en: 'If you let me choose, I\'ll find a third road somehow.' },
    suzu: { jp: '{分|わ}かれ{道|みち} は 、 {物語|ものがたり} の いちばん {楽|たの}しい {所|ところ} ！', en: 'A fork in the road — the best part of any story!' },
  };
  RB.hooks.atlas_fork = async function () {
    const r = roomNow();
    if (!r) return;
    const s = S();
    const e = exitInFront();
    if (!e || !e.branch) return;
    const bt = A.branchTypes[e.branch];
    await say('narr', { jp: bt.name.jp + ' 。 ' + bt.hint.jp, en: bt.name.en.charAt(0).toUpperCase() + bt.name.en.slice(1) + '. ' + bt.hint.en });
    const i = await choose([{ jp: 'この {道|みち} を {行|い}く', en: 'Take this road' }, { jp: 'もう {少|すこ}し {考|かんが}える', en: 'Think a little longer' }]);
    if (i !== 0) return;
    s.flags[e.unlock] = true;
    r.run.stats.rooms++;
    await goTo(e);
  };

  // ---- the hall of three doors ------------------------------------------------------------------------
  RB.hooks.atlas_doors_clue = async function (args, ctx) {
    const r = roomNow();
    if (!r || !r.room.obj || r.room.obj.type !== 'doors') return;
    const s = S();
    const o = r.room.obj;
    const clue = AT.doorClue(o, s.learn.profile);
    r.run.objs[o.id] = r.run.objs[o.id] || {};
    const os = r.run.objs[o.id];
    await say('narr', { jp: '{石板|せきばん} に 、 {扉|とびら} の {選|えら}び{方|かた} が {刻|きざ}まれて いる 。', en: 'A tablet explains which door to take. The lamps by each door may matter.' });
    RB.ui.dialogue.hide();
    const res = dbg.autoSteps ? { assisted: false } : await RB.atlas.reading(clue.jp, clue.en, { title: 'The tablet by the doors' });
    os.read = true;
    if (res.assisted) os.assisted = true;
    void ctx;
  };
  RB.hooks.atlas_door = async function () {
    const r = roomNow();
    if (!r || !r.room.obj) return;
    const s = S();
    const o = r.room.obj;
    const e = exitInFront();
    if (!e) return;
    const os = (r.run.objs[o.id] = r.run.objs[o.id] || {});
    if (e.correct) {
      const clean = !os.wrong && os.read;
      learnRecord('c:atlas_doors_' + s.learn.profile, clean, os.assisted || !os.read);
      s.flags[FLAG(o.id)] = true;
      r.run.done[o.id] = true;
      r.run.stats.objectives++;
      RB.bus.emit('atlas:event', { run: r.run.id, id: o.id, kind: 'doors', read: !!os.read, room: r.key, pattern: r.room.pattern, branch: r.room.branch || null }); // (The Pages We Keep)
      RB.audio && RB.audio.sfx('reveal');
      await say('narr', { jp: '{扉|とびら} の {向|む}こう に 、 {道|みち} が {続|つづ}いて いる 。', en: os.read ? 'Beyond the door, the road goes on — just as the tablet said.' : 'Beyond the door, the road goes on. (A lucky guess — the tablet by the entrance would have told you.)' });
      if (clean) { const c = compOk(); if (c) await say('comp', c, 'smile'); }
      r.run.stats.rooms++;
      await goTo(e);
      return;
    }
    if (!os.wrong) learnRecord('c:atlas_doors_' + s.learn.profile, false, false);
    os.wrong = (os.wrong || 0) + 1;
    RB.audio && RB.audio.sfx('answer_wrong');
    await say('narr', { jp: '{扉|とびら} の {向|む}こう は {白紙|はくし} だった 。 {足|あし} を {踏|ふ}み{出|だ}す {前|まえ} に 、 {道|みち} が {折|お}り{返|かえ}された 。', en: 'Beyond the door is blank paper. Before you can step through, the road folds you back.' });
    if (r.run.lantern && r.run.lantern.hp > 0) {
      r.run.lantern.hp--;
      await say('narr', { jp: '{小|ちい}さな {灯|あか}り が 、 {少|すこ}し {揺|ゆ}れた 。', en: 'The little lantern flickers (' + r.run.lantern.hp + '/' + r.run.lantern.max + ').' });
      AT.hud.update();
    }
    if (r.run.relics.indexOf('compass') >= 0) {
      const ce = RB.world.W.map.exits.find((x) => x.correct);
      if (ce) await say('narr', { jp: '{方位|ほうい}{磁石|じしゃく} の {針|はり} が 、 ' + SIDE[sideOf(ce, RB.world.W.map)].jp + ' の {扉|とびら} を {指|さ}した 。', en: 'The compass needle swings towards the ' + SIDE[sideOf(ce, RB.world.W.map)].en + ' door.' });
    } else if (!os.read) {
      await say('narr', { jp: '{入|い}り{口|ぐち} の {石板|せきばん} を {読|よ}んで みよう 。', en: 'Perhaps read the tablet near the entrance.' });
    }
  };

  // ---- camp -------------------------------------------------------------------------------------------------
  RB.hooks.atlas_camp = async function (args) {
    const r = roomNow();
    if (!r) return;
    const s = S();
    const what = args && args[0];
    if (what === 'rest') {
      RB.bus.emit('atlas:camp', { run: r.run.id, room: r.key }); // (The Pages We Keep)
      s.atlas.camps = (s.atlas.camps || 0) + 1;
      s.vars.atlas_camp_i = (s.atlas.camps - 1) % 3;
      if (r.run.lantern && !r.run.campRested) {
        r.run.campRested = true;
        const before = r.run.lantern.hp;
        r.run.lantern.hp = Math.min(r.run.lantern.max, r.run.lantern.hp + 2);
        s.vars.atlas_relit = before === 0 && r.run.lantern.hp > 0 ? 1 : 0;
        AT.hud.update();
      }
    }
  };

  // ---- the guardian --------------------------------------------------------------------------------------------
  RB.hooks.atlas_climax = async function () {
    const r = roomNow();
    if (!r) return;
    const s = S();
    s.vars.atlas_won = 0;
    if (s.flags[FLAG('climax')]) { s.vars.atlas_won = 1; return; }
    const run = r.run;
    const boss = r.room.boss;
    const cd = A.climaxes[boss];
    s.vars.atlas_boss = { cartographer: 1, bell: 2, gate: 3 }[boss];
    await scene('atlas.climax.' + boss);
    // Interpretation before action: understanding what it wants loosens a knot.
    run.bonusKnots = 0;
    run.objs.legend = run.objs.legend || {};
    const P = s.learn.profile;
    if (!run.objs.legend[P]) run.objs.legend[P] = AT.objectiveSteps({ type: 'legend', seed: (run.seed ^ 0xabc) >>> 0 }, run, P, { boss })[0];
    await say('narr', { jp: '{戦|たたか}う {前|まえ} に 、 {相手|あいて} の {言葉|ことば} を {読|よ}み{解|と}いて みよう 。', en: 'Before anything else: read what it is really saying.' });
    const res = await runStep(run.objs.legend[P], 'Read the guardian\'s legend');
    if (!res.cancelled && res.firstTry !== false) {
      run.bonusKnots += 1;
      await say('narr', { jp: '{分|わ}かって もらえた こと で 、 {結|むす}び{目|め} が {一|ひと}つ {緩|ゆる}んだ 。', en: 'Understood, it loosens: one of its knots was never really tied. (The guardian starts with one knot fewer.)' });
    } else {
      await say('narr', { jp: '{言葉|ことば} は 、 まだ {届|とど}いて いない 。', en: 'Your words have not quite reached it yet — but it is listening.' });
    }
    if ((run.promises || 0) >= 2) { run.bonusKnots += 1; await say('narr', { jp: '{守|まも}られた {約束|やくそく} の {分|ぶん} 、 {結|むす}び{目|め} が {軽|かる}い 。', en: 'The promises you restored weigh on it too: another knot is already loose.' }); }
    if (run.relics.indexOf('map') >= 0) { run.bonusKnots += 1; await say('narr', { jp: '{地図|ちず} の {切|き}れ{端|はし} が 、 {相手|あいて} の {弱|よわ}い {所|ところ} を {示|しめ}して いる 。', en: 'The scrap of map shows exactly where it is weakest: one more knot is loose.' }); }
    RB.ui.dialogue.hide();
    // its attendants come with it on Standard (one) and Demanding (two); Relaxed: the guardian alone
    const out = await RB.game.startBattle(cd.enemy, { inScript: true, noFlee: true, place: r.room.attendants ? { group: r.room.attendants } : null });
    if (out === 'win' && runOf() === run) {
      s.flags[FLAG('climax')] = true;
      run.done.climax = true;
      s.vars.atlas_won = 1;
      RB.bus.emit('atlas:event', { run: run.id, id: 'climax', kind: 'climax', boss, room: r.key, pattern: r.room.pattern }); // (The Pages We Keep)
      RB.world.refreshActors();
    }
  };

  RB.hooks.atlas_foe = async function () {
    const r = roomNow();
    if (!r) return;
    const s = S();
    // A guardian settled opens the room; an optional foe just lets you pass in peace.
    const guardDown = s.flags['foe:' + s.map + ':guard'];
    s.vars.atlas_guard = guardDown && r.room.guard && !r.run.done['guard_' + r.key] ? 1 : 0;
    if (s.vars.atlas_guard) { r.run.done['guard_' + r.key] = true; RB.bus.emit('atlas:event', { run: r.run.id, id: 'guard_' + r.key, kind: 'guardian', room: r.key, pattern: r.room.pattern, branch: r.room.branch || null }); } // (The Pages We Keep)
  };

  // =====================================================================================
  // Ending an expedition
  // =====================================================================================
  function owned(s, id) { return (s.inv[id] || 0) > 0 || (s.equip && Object.values(s.equip).indexOf(id) >= 0); }
  function rewardOffer(s, run) {
    const pool = A.rewardOrder.filter((id) => id !== 'atlas_cos_lamplet' && !owned(s, id));
    const out = [];
    for (const m of run.mods) { const sig = A.modifiers[m].reward; if (sig && sig !== 'atlas_cos_lamplet' && !owned(s, sig) && out.indexOf(sig) < 0) out.push(sig); }
    for (const id of pool) { if (out.length >= 2) break; if (out.indexOf(id) < 0) out.push(id); }
    return out.slice(0, 2);
  }
  function endRun(s, why) {
    const run = s.atlas.run;
    if (!run) return;
    RB.bus.emit('atlas:end', { run: run.id, kind: why }); // (The Pages We Keep: copies its summary out before cleanup)
    s.atlas.run = null;
    AT.cleanFlags(s, run.id);
    delete s.vars.atlas_ok; delete s.vars.atlas_won;
    s.atlas.last = { why, rooms: run.path.length, names: run.names.length, relics: run.relics.length, mods: run.mods.slice(), at: Date.now() };
    s.checkpoint = AT.hallSpot();
    // Drop its generated maps now if we are already standing elsewhere (defeat
    // lands in the hall first); otherwise on the next map entry (map:enter listener).
    if (!(s.map && s.map.indexOf('atlas.' + run.id + '.') === 0)) AT.unregister(run.id);
    AT.hud.update();
  }
  async function finalize(kind) {
    const s = S();
    const run = s.atlas.run;
    if (!run) return;
    const summary = { kind, rewards: [], notes: [], restore: null, unlock: null };
    if (kind === 'complete') {
      s.atlas.completed = (s.atlas.completed || 0) + 1;
      const n = s.atlas.completed;
      await say('narr', { jp: '{灯|ひ} の {中|なか} に 、 {葦|あし}ノ{瀬|せ} の {名前|なまえ} が {見|み}える 。 {帰|かえ}り{道|みち} は 、 もう {書|か}かれて いる 。', en: 'Inside the lantern you can read Reedwake\'s name. The way home has already been written.' });
      // choose one permanent reward
      const offer = rewardOffer(s, run);
      if (offer.length) {
        await say('narr', { jp: '{道|みち} が 、 {一|ひと}つ {持|も}って {帰|かえ}る よう に {言|い}って いる 。', en: 'The road offers you something to take home. Choose one.' });
        const i = await choose(offer.map((id) => ({ jp: C.items[id].name.jp, en: C.items[id].name.en + ' — ' + C.items[id].desc })));
        const id = offer[Math.max(0, Math.min(offer.length - 1, i))];
        RB.state.give(s, id, 1);
        summary.rewards.push(id);
        await toast('item', C.items[id].name.jp, C.items[id].name.en);
      }
      if (run.lantern) {
        if (run.lantern.hp > 0) {
          await scene('atlas.escort.home');
          if (!owned(s, 'atlas_cos_lamplet')) { RB.state.give(s, 'atlas_cos_lamplet', 1); summary.rewards.push('atlas_cos_lamplet'); await toast('item', C.items.atlas_cos_lamplet.name.jp, C.items.atlas_cos_lamplet.name.en); }
        } else await say('narr', { jp: '{消|き}えた {灯|あか}り も 、 {一緒|いっしょ}に {帰|かえ}って きた 。', en: 'The lantern that went out comes home with you anyway. Someone will relight it.' });
      }
      const k = Math.min(6, n);
      for (let i = 1; i <= k; i++) {
        if (!s.flags['atlas_restore_' + i]) { s.flags['atlas_restore_' + i] = true; summary.restore = i; addNote('atlas_news_' + i); break; }
      }
      summary.unlock = n === 1 ? 'bell' : n === 2 ? 'combos' : n === 3 ? 'pairs' : null;
    } else if (kind === 'early') {
      await say('narr', { jp: '{焚|た}き{火|び} の {灯|あか}り を {頼|たよ}り に 、 {来|き}た {道|みち} を {引|ひ}き{返|かえ}す 。', en: 'By the light of the campfire you turn back along the way you came. What you found, you keep.' });
    } else if (kind === 'defeat') {
      // Consolation: a name caught on the way down (or a keepsake), and the note about falling.
      const notes = new Set(s.notebook.map((x) => x.id));
      const left = A.nameOrder.filter((id) => !notes.has('atlas_name_' + id));
      if (left.length) { const id = left[U.rng(run.seed).int(left.length)]; addNote('atlas_name_' + id); summary.notes.push('atlas_name_' + id); }
      else {
        const pool = A.rewardOrder.filter((id) => C.items[id].slot === 'cosmetic' && id !== 'atlas_cos_lamplet' && !owned(s, id));
        if (pool.length) { RB.state.give(s, pool[0], 1); summary.rewards.push(pool[0]); }
      }
      addNote('atlas_defeat');
    }
    s.atlas.runs = (s.atlas.runs || 0) + 1;
    s.atlas.relicsSeen = Array.from(new Set((s.atlas.relicsSeen || []).concat(run.relics)));
    s.vars.atlas_restore = summary.restore || 0;
    s.vars.atlas_kind = { complete: 1, early: 2, defeat: 3 }[kind] || 0;
    s.vars.atlas_unlock = { bell: 1, combos: 2, pairs: 3 }[summary.unlock] || 0;
    s.vars.atlas_relics = run.relics.length;
    s.vars.atlas_names = run.names.length;
    s.atlas.lastSummary = summary;
    const onAtlas = s.map.startsWith('atlas.');
    endRun(s, kind);
    if (onAtlas) {
      const h = AT.hallSpot();
      await RB.game.transition(h.map, h.x, h.y, h.dir, { inScript: true });
    }
    await scene('atlas.home');
    if (summary.restore) await note('atlas_news_' + summary.restore);
    for (const n of summary.notes) { const nd = C.notes[n]; if (nd) await toast('note', nd.title.jp, nd.title.en); }
    for (const id of kind === 'defeat' ? summary.rewards : []) await toast('item', C.items[id].name.jp, C.items[id].name.en);
    RB.save.autosave('auto');
    return summary;
  }
  RB.hooks.atlas_extract = async function (args) {
    const r = roomNow();
    if (!r) return;
    const early = args && args[0] === 'early';
    return inDialogue(() => finalize(early ? 'early' : 'complete'));
  };

  // Defeat inside an expedition ends it gently; wins may pour tea.
  if (RB.game && RB.game.startBattle) {
    const origSB = RB.game.startBattle;
    RB.game.startBattle = async function (enemyId, opts) {
      const s = S();
      const run = active() ? s.atlas.run : null;
      if (run) run.stats.battles++;
      const res = await origSB.call(RB.game, enemyId, opts);
      if (run && s.atlas.run === run) {
        if (res === 'win') {
          run.stats.won++;
          if (run.relics.indexOf('teapot') >= 0) {
            await inDialogue(async () => {
              if (run.lantern && run.lantern.hp < run.lantern.max) { run.lantern.hp++; AT.hud.update(); }
              await say('narr', { jp: '{急須|きゅうす} から 、 {二人|ふたり} {分|ぶん} の お{茶|ちゃ} を {注|つ}いだ 。', en: 'You pour two cups from the teapot.' + (run.lantern ? ' The little lantern brightens.' : '') });
              await compSay(TEA);
            });
          }
        }
        if (res === 'lose') await inDialogue(() => finalize('defeat'));
      }
      return res;
    };
  }
  const TEA = {
    nao: { jp: '…… {冷|さ}めてる 。 でも 、 まあ 、 いい か 。', en: '…It\'s gone cold. Eh. It\'ll do.' },
    mio: { jp: '{少|すこ}し {濃|こ}い けど 、 {今|いま} は これ くらい が いい 。', en: 'A bit strong, but right now that\'s what we need.' },
    ren: { jp: 'お{茶|ちゃ} を {淹|い}れる {手|て} つき は 、 {師匠|ししょう} に {似|に}て いる と {言|い}われます 。', en: 'People say I pour tea the way my master did.' },
    suzu: { jp: '{乾杯|かんぱい} ！ …… お{茶|ちゃ} で も 、 {乾杯|かんぱい} は {乾杯|かんぱい} 。', en: 'Cheers! …Tea still counts.' },
  };

  // ---- map entry bookkeeping -----------------------------------------------------------------------------------
  RB.bus.on('map:enter', (ev) => {
    const s = S();
    if (!s) return;
    const run = s.atlas && s.atlas.run;
    if (run && ev.id.startsWith('atlas.')) {
      const key = ev.id.split('.')[2];
      run.room = key;
      if (run.path.indexOf(key) < 0) run.path.push(key);
    }
    if (ev.id === 'rw.hall' && s.flags.atlas_restored_to_hall) {
      delete s.flags.atlas_restored_to_hall;
      setTimeout(() => RB.ui.notice && RB.ui.notice('The unwritten road you were on could not be restored, so you are back at the Lantern Hall. Your learning and notebook are untouched.', 'info'), 400);
    }
    // Generated maps of runs that are over are dropped once we stand elsewhere.
    for (const rid of Array.from(AT._registered.keys())) {
      if ((!run || run.id !== rid) && !ev.id.startsWith('atlas.' + rid + '.')) AT.unregister(rid);
    }
    AT.hud.update();
  });

  // the companions' lines above, read-only, for the dialect inventory (tools/suzu_inventory.mjs)
  AT.compLines = { COMP_OK, COMP_LATER, NAME_REACT, RELIC_ANY, RELIC_REACT, FORK_REACT, TEA };

  // ---- a reading panel (Japanese first; translation on request counts as assisted) --------------------
  AT.reading = function (jp, en, opts) {
    opts = opts || {};
    return new Promise((resolve) => {
      if (typeof document === 'undefined') { resolve({ assisted: false }); return; }
      // test auto mode (RB.test) reads the panel and moves on, like dialogue
      if (RB.test && RB.test.auto) { resolve({ assisted: false }); return; }
      const s = S();
      let showEn = s && s.learn.profile === 'F';
      let assisted = false;
      // a sheet of the folio: the text in ink, translation on request, Done at the foot
      const done = () => { RB.ui.popLayer(lay); resolve({ assisted }); };
      const fr = RB.ui.folio.frame({ cls: 'folio-reading' }); // one Done, at the foot
      fr.setTitle(RB.util.esc(opts.title || 'Read'), '');
      const lay = { el: fr.scrim, name: 'atlas-reading' };
      const render = () => {
        fr.box.innerHTML = '<div class="spread"><div class="leaf" tabindex="0"><div class="reading-jp">' + RB.ui.jhtml(jp) + '</div>' +
          (showEn ? '<p class="en reading-en">' + RB.util.esc(RB.script.enVars(en)) + '</p>' : '<div class="row-acts"><button class="pbtn" data-tr>' + RB.ui.folio.icon('words') + 'Show translation <span class="small">(counts as assisted)</span></button></div>') +
          '</div></div>';
        fr.foot.innerHTML = '<span class="spacer"></span><button class="cbtn" data-ok>Done' + RB.ui.folio.icon('next') + '</button>';
      };
      fr.el.onclick = (e) => {
        if (e.target.closest('.jt') && RB.ui.help.enabled()) { assisted = true; return; }
        if (e.target.closest('[data-tr]')) { showEn = true; assisted = true; render(); return; }
        if (e.target.closest('[data-ok]')) done();
      };
      lay.onCancel = done;
      render();
      RB.ui.pushLayer(lay);
    });
  };

  // ---- HUD: a small chip while on an expedition (tap for details) -----------------------------------------
  AT.hud = (function () {
    let chip = null, timer = null;
    function ensure() {
      if (typeof document === 'undefined' || !RB.ui.root) return null;
      if (chip) return chip;
      chip = RB.ui.el('button', 'hbtn atlas-chip');
      chip.setAttribute('aria-label', 'Expedition details');
      chip.onclick = () => { if (RB.game.mode() === 'world') panel(); };
      RB.ui.root.appendChild(chip);
      timer = setInterval(sync, 400);
      return chip;
    }
    function sync() {
      const s = S();
      const on = !!(RB.game.G.playing && s && active());
      if (!chip) return;
      const combat = RB.game.mode() === 'combat';
      chip.classList.toggle('hidden', !on || combat || RB.game.mode() === 'title');
    }
    // the escorted lantern on the battle screen's bars, drawn with them every time (the combat UI's bar hook, D1)
    RB.ui.combatBars = RB.ui.combatBars || [];
    RB.ui.combatBars.push(() => {
      const run = runOf();
      if (!run || !run.lantern || !active()) return '';
      return '<div class="atlas-lantern">Lantern <span class="dim small">' + run.lantern.hp + '/' + run.lantern.max + '</span><div class="bar"><i style="width:' + Math.round(100 * run.lantern.hp / run.lantern.max) + '%;background:linear-gradient(90deg,#e0a040,#ffd27a)"></i></div></div>';
    });
    function update() {
      const c = ensure();
      if (!c) return;
      const run = runOf();
      const s = S();
      if (!run || !s) { c.classList.add('hidden'); return; }
      const mods = run.mods.map((m) => A.modifiers[m].name.en).join(' + ') || 'quiet road';
      const I = RB.ui.folio.icon;
      c.innerHTML = I('map') + '<span class="l">' + RB.util.esc(mods) + '</span>' + (run.lantern ? '<span class="st">' + I('lantern') + run.lantern.hp + '/' + run.lantern.max + '</span>' : '') +
        '<span class="st">' + run.relics.length + ' relic' + (run.relics.length === 1 ? '' : 's') + '</span>';
      sync();
    }
    function panel() {
      const run = runOf();
      if (!run) return;
      RB.game.pushMode('menu');
      const esc = RB.util.esc;
      const fr = RB.ui.folio.frame({ onClose: () => close(), closeLabel: 'Close', cls: 'folio-reading' });
      fr.setTitle(RB.ui.label('{書|か}かれて いない {地図|ちず}', 'The Unwritten Atlas'), 'Expedition');
      const lay = { el: fr.scrim, name: 'atlas-panel' };
      const close = () => { RB.ui.popLayer(lay); RB.game.popMode('menu'); };
      lay.onCancel = close;
      const entry = (jp, en, desc, extra) => '<li class="entry"><span class="mark">' + RB.ui.folio.icon('note') + '</span><div><div class="t">' + (jp ? RB.ui.jhtml(jp) + ' ' : '') + '<span class="en">' + esc(en) + '</span>' + (extra || '') + '</div><div class="small muted">' + esc(desc) + '</div></div></li>';
      const combos = run.combos.map((k) => entry(null, A.combos[k].name.en, A.combos[k].desc)).join('');
      fr.box.innerHTML = '<div class="spread"><div class="leaf" tabindex="0">' +
        '<h3>' + RB.ui.folio.icon('map') + ' Route</h3>' + (run.mods.length ? '<ul class="entries">' + run.mods.map((m) => entry(A.modifiers[m].name.jp, A.modifiers[m].name.en, A.modifiers[m].desc)).join('') + '</ul>' : '<p class="muted">A quiet road: no modifier.</p>') +
        (run.lantern ? '<p class="note-slip">' + RB.ui.folio.icon('lantern') + ' Escorted lantern: ' + run.lantern.hp + '/' + run.lantern.max + (run.lantern.hp ? '' : ' (out — the expedition carries on)') + '</p>' : '') +
        '<h3>' + RB.ui.folio.icon('pouch') + ' Relics (temporary)</h3>' + (run.relics.length ? '<ul class="entries">' + run.relics.map((k) => { const d = A.relics[k]; return entry(d.name.jp, d.name.en, d.desc, d.comp && d.comp !== S().comp ? ' <span class="small muted">(waiting for someone else)</span>' : ''); }).join('') + '</ul>' : '<p class="muted">Nothing found yet.</p>') +
        (combos ? '<h3>Combinations</h3><ul class="entries">' + combos + '</ul>' : '') +
        '<h3>So far</h3><p class="small">Rooms walked: ' + run.path.length + ' · names sent home: ' + run.names.length + ' · things restored: ' + run.stats.objectives + '</p>' +
        '<p class="small muted">Camps let you head home early and keep what you found. If a fight goes badly, the road folds up and sets you down at the Lantern Hall — nothing you learned is lost.</p></div></div>';
      RB.ui.pushLayer(lay);
    }
    return { update, sync, panel };
  })();

  // ---- debug / test helpers ------------------------------------------------------------------------------------
  AT._debug = {
    flags: dbg,
    run: () => runOf(),
    // A compact description of the current run for scripted walkthroughs.
    plan() {
      const run = runOf();
      if (!run) return null;
      const p = AT.planOf(run);
      const out = {};
      for (const key in p.rooms) {
        const d = p.rooms[key];
        const id = AT.mapId(run, key);
        const m = C.maps[id];
        out[key] = {
          id, kind: d.kind, pattern: d.pattern, branch: d.branch, next: d.next, obj: d.obj, boss: d.boss || null,
          spawn: m.spawn.default, exits: m.exits.map((e) => ({ x: e.x, y: e.y, to: e.to, branch: e.branch || null, door: e.door || null, correct: !!e.correct })),
          props: m.props.filter((pp) => pp.scene).map((pp) => ({ p: pp.p, x: pp.x, y: pp.y, scene: pp.scene, obj: pp.obj || null, lamp: pp.lamp, cache: pp.cache || null, if: pp.if || null })),
          npcs: m.npcs.map((n) => ({ id: n.id, x: n.x, y: n.y, name: n.name || null, required: !!n.required })),
          foes: m.foes.map((f) => ({ id: f.id, enemy: f.enemy, x: f.x, y: f.y })),
          triggers: m.triggers.map((t) => ({ x: t.x, y: t.y, w: t.w })),
        };
      }
      return out;
    },
    // Tap-to-move (uses the game's own pathfinding and interaction).
    tap(x, y) { RB.world.tapTile(x, y); },
    finalize,
  };
})();
