// Festival games (expansion P06 for P09; src/engine/72f_festival.js, src/content/pastimes/50_festival.js): the shell's
// rules (C-17, C-55): practice keeps nothing; a timed round keeps only the player's own best and longest run, made
// at the first timed round; reading never makes a record; New Game+ carries the bests; no stamp or reward comes from
// any score or mode; the festival's games are met through the festival (flag pt_festival) in twelve-chapter journeys;
// the water-balloon words and every line with readings, every word in the dictionary.
import fs from 'node:fs';
import { load } from '../lib/load.mjs';

export default async (t) => {
  globalThis.__RB_TEST__ = true;
  const RB = load(['core', 'lang', 'recog', 'engine', 'learn', 'ui', 'content'], { __RB_TEST__: true });
  const F = RB.festival, C = RB.content;
  const camp = (ed) => { const s = RB.state.newCampaign({ edition: ed || 2 }); s.id = 'fv-test'; s.comp = 'suzu'; RB.game.s = s; return s; };

  t.ok(!!F.get('yoyo') && F.get('yoyo').seconds > 0, 'water-balloon fishing is a festival game');
  const s = camp();
  t.eq(F.peek(s, 'yoyo'), { timed: 0, best: null, bestStreak: 0, last: null }, 'nothing before a timed round');
  t.ok(!s.practice.festival, 'and reading makes no record');
  let ch = F.timedResult(s, 'yoyo', { score: 5, streak: 3 });
  t.ok(ch.newBest && ch.newStreak && F.peek(s, 'yoyo').best === 5, 'a first timed round: a best of 5, a run of 3');
  ch = F.timedResult(s, 'yoyo', { score: 4, streak: 4 });
  t.ok(!ch.newBest && ch.newStreak && F.peek(s, 'yoyo').best === 5 && F.peek(s, 'yoyo').bestStreak === 4, 'a lower score keeps the best; a longer run is kept');
  t.eq(F.peek(s, 'yoyo').timed, 2, 'two timed rounds');
  s.flags.postgame = true;
  const n = RB.ui.create.carry(s);
  t.eq(n.practice.festival && n.practice.festival.games.yoyo.best, 5, 'New Game+ carries the bests');
  // no reward from any score or mode (C-55)
  const stampWhen = Object.values(C.stamps).filter((d) => typeof d.when === 'function' && /festival/.test(String(d.when)));
  t.eq(stampWhen.map((d) => d.id), [], 'no stamp reads the festival games\' records');
  // the pastime page
  const s2 = camp();
  t.ok(!RB.pastimes.met(s2).some((d) => d.id === 'festival'), 'not met before the festival');
  s2.flags.pt_festival = true;
  t.ok(RB.pastimes.met(s2).some((d) => d.id === 'festival'), 'met after it');
  t.ok(!RB.pastimes.met(Object.assign(camp(1), { flags: { pt_festival: true } })).some((d) => d.id === 'festival'), 'never in a six-chapter journey');
  // the balloons' words: distinct, each read the way it is written
  const ws = C.festival.yoyo.words;
  t.eq(new Set(ws.map((w) => w.en)).size, ws.length, 'every balloon word different (' + ws.length + ')');
  {
    const errs = [], unknown = new Map();
    const jcheck = (line, where) => {
      if (!line) return;
      for (const p of RB.jp.validate(line)) errs.push(where + ': ' + (p.msg || JSON.stringify(p)));
      for (const tk of RB.jp.parse(line)) {
        if (tk.punct || tk.ph || !/[぀-ヿ一-鿿]/.test(tk.surface)) continue;
        let info; try { info = RB.jp.lookup(tk); } catch (e) { info = { unknown: true }; }
        if (info.unknown && !unknown.has(tk.surface)) unknown.set(tk.surface, where);
      }
    };
    const walk = (o, where, seen = new Set()) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) { o.forEach((x, i) => walk(x, where + '[' + i + ']', seen)); return; }
      if (typeof o.jp === 'string') { jcheck(o.jp, where); if (typeof o.en !== 'string' || !o.en) errs.push(where + ': no English'); else if (/[一-鿿]/.test(o.en)) errs.push(where + ': kanji in English'); }
      for (const k in o) if (k !== 'jp' && o[k] && typeof o[k] === 'object') walk(o[k], where + '.' + k, seen);
    };
    walk(C.festival, 'festival'); walk(F.get('yoyo'), 'yoyo'); walk(RB.pastimes.get('festival'), 'pastime');
    for (const f of ['88e_festival.js', '88f_festival_yoyo.js']) {
      const ui = fs.readFileSync(new URL('../../src/ui/' + f, import.meta.url), 'utf8');
      for (const m of ui.matchAll(/(?:jhtml\(|label\(|jp: )'((?:[^'\\]|\\.)*[一-鿿](?:[^'\\]|\\.)*)'/g)) jcheck(m[1], f);
    }
    t.eq(errs, [], 'every line has furigana on its kanji and English beside it');
    t.eq([...unknown.entries()].map(([w, at]) => w + ' (' + at + ')'), [], 'every word is in the dictionary');
  }
};
