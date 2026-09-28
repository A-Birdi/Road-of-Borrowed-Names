/* Scene script DSL (see docs/CONTENT.md) — parser and async runner.
 *
 *   @scene rw.mio.intro
 *   mio[worry]: {薬|くすり} の ラベル が … || The labels came off…
 *   ?(party=nao) nao: … || …          (line shown only if condition holds)
 *   !set flag_a flag_b
 *   !choice
 *   * {手伝|てつだ}う || Help her -> help
 *   * [quest.x>=1] あとで || Later -> later
 *   :help
 *   !end
 */
var RB = (globalThis.RB = globalThis.RB || {});

RB.script = (function () {
  'use strict';
  const LINE_RE = /^([a-z_][\w]*)(?:\[([a-z]+)\])?:\s?(.*)$/;

  function splitBilingual(text) {
    const i = text.indexOf('||');
    if (i < 0) return { jp: text.trim(), en: '' };
    return { jp: text.slice(0, i).trim(), en: text.slice(i + 2).trim() };
  }

  function parse(src, file) {
    const scenes = {};
    const errors = [];
    let cur = null;
    const lines = src.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const lineNo = i + 1;
      let raw = lines[i];
      let line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const where = (file || 'script') + ':' + lineNo;
      if (line.startsWith('@scene ')) {
        const id = line.slice(7).trim();
        if (scenes[id]) errors.push(where + ' duplicate scene ' + id);
        cur = scenes[id] = { id, cmds: [], labels: {}, file, line: lineNo };
        continue;
      }
      if (!cur) { errors.push(where + ' content outside a scene'); continue; }
      let cond = null;
      const cm = line.match(/^\?\(([^)]*)\)\s*(.*)$/);
      if (cm) { cond = cm[1].trim(); line = cm[2]; }
      if (line.startsWith(':')) { cur.labels[line.slice(1).trim()] = cur.cmds.length; continue; }
      if (line.startsWith('* ')) {
        const last = cur.cmds[cur.cmds.length - 1];
        if (!last || last.op !== 'choice') { errors.push(where + ' option without !choice'); continue; }
        let body = line.slice(2).trim();
        let ocond = null;
        const oc = body.match(/^\[([^\]]*)\]\s*(.*)$/);
        if (oc) { ocond = oc[1]; body = oc[2]; }
        let target = null;
        const arrow = body.lastIndexOf('->');
        if (arrow >= 0) { target = body.slice(arrow + 2).trim(); body = body.slice(0, arrow).trim(); }
        const bl = splitBilingual(body);
        last.opts.push({ jp: bl.jp, en: bl.en, to: target, if: ocond, line: lineNo });
        continue;
      }
      if (line.startsWith('!')) {
        const parts = line.slice(1).match(/"[^"]*"|\S+/g) || [];
        const op = parts.shift();
        const args = parts.map((p) => (p[0] === '"' ? p.slice(1, -1) : p));
        const cmd = { op, args, if: cond, line: lineNo, file };
        if (op === 'choice') cmd.opts = [];
        if (op === 'card' || op === 'journal' || op === 'say' || op === 'toast') {
          Object.assign(cmd, splitBilingual(line.slice(1 + op.length).trim()));
        }
        cur.cmds.push(cmd);
        continue;
      }
      const m = line.match(LINE_RE);
      if (!m) { errors.push(where + ' cannot parse: ' + line.slice(0, 60)); continue; }
      const bl = splitBilingual(m[3]);
      cur.cmds.push({ op: 'say', who: m[1], expr: m[2] || null, jp: bl.jp, en: bl.en, if: cond, line: lineNo, file });
    }
    for (const id in scenes) {
      const sc = scenes[id];
      for (const c of sc.cmds) {
        const targets = [];
        if (c.op === 'goto') targets.push(c.args[0]);
        if (c.op === 'if') { const a = c.args.indexOf('->'); if (a >= 0) targets.push(c.args[a + 1]); }
        if (c.op === 'choice') c.opts.forEach((o) => o.to && targets.push(o.to));
        for (const t of targets) if (t && t !== 'end' && sc.labels[t] == null) errors.push(`${file}:${c.line} unknown label ${t} in ${id}`);
      }
    }
    return { scenes, errors };
  }

  function add(src, file) {
    RB.content.sceneSrc.push({ src, file });
    const r = parse(src, file);
    for (const id in r.scenes) {
      if (RB.content.scenes[id]) r.errors.push('duplicate scene id across files: ' + id);
      RB.content.scenes[id] = r.scenes[id];
    }
    if (r.errors.length) {
      RB.content.scriptErrors = (RB.content.scriptErrors || []).concat(r.errors);
      if (typeof console !== 'undefined' && !globalThis.__RB_TEST__) console.warn('script errors', r.errors);
    }
  }

  // ---- text substitution -------------------------------------------------
  function enVars(text) {
    const s = RB.game.s;
    if (!s || !text) return text || '';
    const pr = RB.state.pronouns(s.player.pron);
    const comp = s.comp || s.provisional;
    const compName = comp && RB.content.chars[comp] ? RB.content.chars[comp].name.en : 'your companion';
    const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
    const map = {
      name: s.player.name, comp: compName,
      they: pr.they, them: pr.them, their: pr.their, theirs: pr.theirs, self: pr.self,
      They: cap(pr.they), Them: cap(pr.them), Their: cap(pr.their),
      are: pr.plural ? 'are' : 'is', were: pr.plural ? 'were' : 'was', have: pr.plural ? 'have' : 'has',
      s: pr.plural ? '' : 's', es: pr.plural ? '' : 'es',
      theyre: pr.plural ? pr.they + "'re" : pr.they + "'s", Theyre: cap(pr.plural ? pr.they + "'re" : pr.they + "'s"),
    };
    return text.replace(/\$([A-Za-z]+)/g, (m0, k) => (k in map ? map[k] : m0));
  }
  function jpVars() {
    const s = RB.game.s;
    const comp = s && (s.comp || s.provisional);
    return {
      name: s ? s.player.nameJp || s.player.name : '',
      comp: comp && RB.content.chars[comp] ? RB.jp.plain(RB.content.chars[comp].name.jp) : '',
    };
  }

  // ---- runner --------------------------------------------------------------
  let running = 0;
  function isRunning() {
    return running > 0;
  }

  async function run(sceneId, ctx) {
    const sc = RB.content.scenes[sceneId];
    if (!sc) {
      console.warn('missing scene', sceneId);
      return;
    }
    running++;
    RB.game.pushMode('dialogue');
    try {
      await exec(sc, ctx || {});
      RB.game.s.seen[sceneId] = true;
    } catch (err) {
      console.error('scene error', sceneId, err);
    } finally {
      running--;
      // every run pushed one dialogue mode; pop it even when nested (a hook
      // running a scene inside a scene) so no stray dialogue mode is left
      RB.game.popMode('dialogue');
      if (running === 0) {
        RB.ui.dialogue.hide();
        RB.world.refreshActors();
        RB.game.afterScene();
      }
    }
  }
  async function runInline(lines) {
    running++;
    RB.game.pushMode('dialogue');
    try {
      for (const l of lines) await RB.ui.dialogue.say(l);
    } finally {
      running--;
      RB.game.popMode('dialogue');
      if (running === 0) {
        RB.ui.dialogue.hide();
        RB.game.afterScene();
      }
    }
  }

  async function exec(sc, ctx) {
    const s = RB.game.s;
    let pc = 0;
    const jump = (label) => {
      if (label === 'end') { pc = sc.cmds.length; return; }
      pc = sc.labels[label];
      if (pc == null) throw new Error('label ' + label + ' in ' + sc.id);
    };
    let guard = 0;
    while (pc < sc.cmds.length) {
      if (++guard > 20000) throw new Error('script loop in ' + sc.id);
      const c = sc.cmds[pc++];
      if (c.if && !RB.state.test(s, c.if)) continue;
      const a = c.args || [];
      switch (c.op) {
        case 'say':
          await RB.ui.dialogue.say({ who: resolveWho(c.who), expr: c.expr, jp: c.jp, en: c.en, sceneId: sc.id, line: c.line });
          break;
        case 'set': a.forEach((f) => (s.flags[f] = true)); break;
        case 'unset': a.forEach((f) => delete s.flags[f]); break;
        case 'var': {
          const [name, op, val] = a;
          const v = +val;
          if (op === '=') s.vars[name] = isNaN(v) ? val : v;
          else if (op === '+') s.vars[name] = (s.vars[name] || 0) + v;
          else if (op === '-') s.vars[name] = (s.vars[name] || 0) - v;
          break;
        }
        case 'give': {
          RB.state.give(s, a[0], a[1] ? +a[1] : 1);
          const it = RB.content.items[a[0]];
          if (it && !c.args.includes('quiet')) await RB.ui.toast({ kind: 'item', jp: it.name.jp, en: it.name.en, n: a[1] ? +a[1] : 1, note: RB.equip.note(it) });
          RB.audio && RB.audio.sfx('item_get');
          break;
        }
        case 'take': RB.state.take(s, a[0], a[1] ? +a[1] : 1); break;
        case 'word': {
          for (const w of a) {
            if (s.words.indexOf(w) < 0) {
              s.words.push(w);
              const wd = RB.content.words[w];
              if (wd) await RB.ui.toast({ kind: 'word', jp: wd.jp, en: wd.en });
            }
          }
          break;
        }
        case 'technique': if (s.techniques.indexOf(a[0]) < 0) s.techniques.push(a[0]); break;
        case 'note':
          for (const n of a) if (!s.notebook.find((e) => e.id === n)) {
            s.notebook.push({ kind: 'lore', id: n, t: Date.now() });
            const nd = RB.content.notes[n];
            if (nd) await RB.ui.toast({ kind: 'note', jp: nd.title.jp, en: nd.title.en });
          }
          break;
        case 'quest': {
          const prev = s.quests[a[0]];
          const q = RB.state.setQuest(s, a[0], a[1] || 'start');
          const qd = RB.content.quests[a[0]];
          if (qd && !c.args.includes('quiet')) {
            const kind = q.done ? 'quest_done' : prev ? 'quest_update' : 'quest_new';
            await RB.ui.toast({ kind, jp: qd.title.jp, en: qd.title.en });
          }
          if (q.done && qd && qd.reward) applyReward(qd.reward);
          break;
        }
        case 'if': {
          // !if cond -> label
          const arrow = a.indexOf('->');
          const cond = a.slice(0, arrow).join(' ');
          if (RB.state.test(s, cond)) jump(a[arrow + 1]);
          break;
        }
        case 'goto': jump(a[0]); break;
        case 'choice': {
          const opts = c.opts.filter((o) => !o.if || RB.state.test(s, o.if));
          const idx = await RB.ui.dialogue.choose(opts, { prompt: a.join(' ') });
          const o = opts[idx];
          s.backlog.push({ who: 'pc', jp: o.jp, en: o.en, choice: true });
          if (o.to) jump(o.to);
          break;
        }
        case 'call': {
          const sub = RB.content.scenes[a[0]];
          if (sub) { await exec(sub, ctx); s.seen[a[0]] = true; }
          else console.warn('missing scene', a[0]);
          break;
        }
        case 'end': pc = sc.cmds.length; break;
        case 'challenge': {
          RB.ui.dialogue.hide();
          const res = await RB.challenge.run(a[0], { scene: sc.id });
          s.vars._res = res && res.ok ? 1 : 0;
          break;
        }
        case 'activity': {
          RB.ui.dialogue.hide();
          const res = await RB.activities.run(a[0], ctx);
          s.vars._res = res && res.ok ? 1 : 0;
          break;
        }
        case 'battle': {
          RB.ui.dialogue.hide();
          const res = await RB.game.startBattle(a[0], { inScript: true, noFlee: a.includes('noflee') });
          s.vars._res = res === 'win' ? 1 : 0;
          if (res !== 'win') { pc = sc.cmds.length; }
          break;
        }
        case 'lesson': RB.ui.dialogue.hide(); await RB.lessons.run(a[0]); break;
        case 'teach': RB.ui.dialogue.hide(); await RB.lessons.grammarCard(a[0]); break;
        case 'warp': {
          await RB.game.transition(a[0], +a[1], +a[2], a[3] || null, { inScript: true });
          break;
        }
        case 'music': RB.audio && (a[0] === '-' ? RB.audio.stopSong({ fade: 800 }) : RB.audio.playSong(a[0])); break;
        case 'sfx': RB.audio && RB.audio.sfx(a[0]); break;
        case 'emote': RB.world.emote(a[0] === 'npc' ? ctx.npc : resolveId(a[0]), a[1] || '!', a[2] ? +a[2] : 1400); RB.audio && RB.audio.sfx('cursor'); await wait(500); break;
        case 'move': await RB.world.scriptMove(resolveId(a[0]), a[1], +(a[2] || 1), a[3] ? +a[3] : 220); break;
        case 'face': { const act = RB.world.actorById(resolveId(a[0])); if (act) act.dir = a[1]; break; }
        case 'faceplayer': { const act = RB.world.actorById(resolveId(a[0] || ctx.npc)); if (act) RB.world.faceTo(act, RB.world.W.player.x, RB.world.W.player.y); break; }
        case 'wait': await wait(+a[0] || 400); break;
        case 'fade': await RB.ui.fade(a[0] === 'out', a[1] ? +a[1] : 400); break;
        case 'shake': RB.ui.shake(); break;
        case 'autosave': s.checkpoint = { map: s.map, x: s.x, y: s.y, dir: s.dir }; await RB.save.autosave(a[0] || 'progress'); break;
        case 'checkpoint': s.checkpoint = { map: a[0] || s.map, x: a[1] ? +a[1] : s.x, y: a[2] ? +a[2] : s.y, dir: a[3] || s.dir }; break;
        case 'chapter': s.chapter = +a[0]; break;
        case 'card': RB.ui.dialogue.hide(); await RB.ui.card(c.jp, c.en); break;
        case 'journal': s.journal = s.journal || []; s.journal.push({ jp: c.jp, en: c.en, t: Date.now() }); break;
        case 'toast': await RB.ui.toast({ kind: 'info', jp: c.jp, en: c.en }); break;
        case 'travel': a.forEach((p) => (s.travel[p] = true)); break;
        case 'refresh': RB.world.refreshActors(); break;
        case 'recruit': await RB.game.recruit(a[0], a[1]); break;
        case 'depart': await RB.game.depart(); break;
        case 'heal': s.resolve.pc = s.resolve.max; s.resolve.comp = s.resolve.max; break;
        case 'inn': RB.ui.dialogue.hide(); await RB.game.rest(); break;
        case 'shop': RB.ui.dialogue.hide(); await RB.ui.shop(a[0]); break;
        case 'menu': RB.ui.dialogue.hide(); await RB.ui.menu.open(a[0]); break;
        case 'postgame': s.flags.postgame = true; s.atlas.unlocked = true; break;
        case 'credits': RB.ui.dialogue.hide(); await RB.ui.credits(); break;
        case 'speakerless': break;
        case 'hook': if (RB.hooks && RB.hooks[a[0]]) await RB.hooks[a[0]](a.slice(1), ctx); else console.warn('missing hook', a[0]); break;
        default:
          console.warn('unknown op', c.op, 'in', sc.id);
      }
    }
  }
  function applyReward(r) {
    const s = RB.game.s;
    if (r.items) for (const k in r.items) RB.state.give(s, k, r.items[k]);
    if (r.words) r.words.forEach((w) => s.words.indexOf(w) < 0 && s.words.push(w));
    if (r.flags) r.flags.forEach((f) => (s.flags[f] = true));
  }
  function resolveWho(who) {
    const s = RB.game.s;
    if (who === 'comp') return s.comp || s.provisional || 'narr';
    return who;
  }
  function resolveId(id) {
    if (id === 'comp') return 'comp';
    return id;
  }
  function wait(ms) {
    return new Promise((r) => setTimeout(r, RB.game.fastForward() ? Math.min(ms, 60) : ms));
  }

  return { parse, add, run, runInline, isRunning, enVars, jpVars, splitBilingual };
})();
