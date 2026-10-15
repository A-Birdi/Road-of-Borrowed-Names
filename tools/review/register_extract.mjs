// RV-1 (Robin, 2026-10-15): the material for the register and naturalness review, before any rewrite.
// Reads the compiled scenes (as tools/voice/lines.mjs does) and writes, into --out:
//   transcripts/pNN_<regions>.txt  every conversation of a part of the road as a whole exchange: narration, every spoken line
//                            with its speaker, the player's choices, and heuristic register tags per line;
//   lines.json               every spoken line with its tags (key as in tools/voice/lines.mjs);
//   speakers.json            per speaker: sentences ending polite / plain, pronouns, sentence endings, dialect and
//                            literary markers, with the lines that depart from the speaker's usual register;
//   wordhelp.json            tokens of spoken lines that word help cannot explain (unknown), and contraction or
//                            marked-expression tokens whose help does not explain the form;
//   frozen.json              the line keys in the frozen VA-1 audition corpus and in the VA-2 casting plan.
// The tags are pointers for a reader, not judgements: a reviewer decides in context.
// Usage: node tools/review/register_extract.mjs --out <dir>
import fs from 'node:fs';
import path from 'node:path';
import { RB, spoken, keyOf, regionOf } from '../voice/lines.mjs';

const args = process.argv.slice(2);
const OUT = args[args.indexOf('--out') + 1];
if (!OUT || args.indexOf('--out') < 0) { console.error('usage: --out <dir>'); process.exit(2); }
fs.mkdirSync(path.join(OUT, 'transcripts'), { recursive: true });

const COMPS = ['nao', 'mio', 'ren', 'suzu'];
// which companion speaks a 'comp' line: its own condition, else the branch it sits in (a scene that jumps with
// `!if comp=ren -> ren` to a label), else the scene's name, else any of the four
function compOf(scene, cond, branch) {
  const m = /comp=(nao|mio|ren|suzu)/.exec(cond || '');
  if (m) return m[1];
  if (branch) return branch;
  const n = /(?:^|[._])(nao|mio|ren|suzu)(?:$|[._\d])/.exec(scene);
  if (n) return n[1];
  return 'any';
}
// per command, the companion whose branch it is in (forward jumps; a label reached from one companion only)
function branches(sc) {
  const cmds = sc.cmds || [];
  const at = {};
  for (const l in sc.labels || {}) (at[sc.labels[l]] = at[sc.labels[l]] || []).push(l);
  const into = {};
  const add = (label, who) => (into[label] = into[label] || new Set()).add(who || 'ANY');
  const out = [];
  let cur = null;
  cmds.forEach((c, idx) => {
    if (at[idx]) {
      const prev = cmds[idx - 1];
      const ins = new Set();
      for (const l of at[idx]) for (const w of into[l] || []) ins.add(w);
      if (prev && !/^(end|goto|depart|warp)$/.test(prev.op) && !(prev.op === 'call' && !prev.if)) ins.add(cur || 'ANY');
      cur = ins.size === 1 && !ins.has('ANY') ? [...ins][0] : null;
    }
    out[idx] = cur;
    if (c.op === 'if' && c.args && c.args[1] === '->') {
      const m = /(?:^|&)comp=(nao|mio|ren|suzu)/.exec(c.args[0]);
      add(c.args[2], m ? m[1] : cur);
      // `!if comp!=suzu -> end`: only Suzu carries on past it
      const n = /^comp!=(nao|mio|ren|suzu)$/.exec(c.args[0]);
      if (n) cur = n[1];
    } else if (c.op === 'end' && /^comp!=(nao|mio|ren|suzu)$/.test(c.if || '')) {
      cur = /^comp!=(nao|mio|ren|suzu)$/.exec(c.if)[1]; // `?(comp!=suzu) !end`: only Suzu carries on
    } else if (c.op === 'choice' && c.opts) {
      for (const o of c.opts) if (o.to) add(o.to, cur);
    } else if (c.op === 'goto' && c.args) add(c.args[0], /comp=(nao|mio|ren|suzu)/.test(c.if || '') ? /comp=(nao|mio|ren|suzu)/.exec(c.if)[1] : cur);
  });
  return out;
}

// ---- register markers on the spoken text -------------------------------------------------------------------------
const sentences = (t) => t.split(/(?<=[。！？!?])|(?<=……)(?=[^」』）)])/).map((s) => s.trim()).filter((s) => s && !/^[…、。！？!?「」『』\s]+$/.test(s));
const POLITE_END = /(です|でした|でしょう|でしょうか|ます|ました|ません|ませんでした|ましょう|ましょうか|ませんか|ください|くださいませ|ございます|ございません|ございました|下さい)(か|ね|よ|よね|けど|けれど|けれども|から|ので|が|わ|の|って)?[。！？!?…ー〜～」』）\s]*$/;
const POLITE_ANY = /(です|でした|でしょう|ます|ました|ません|ましょう|ください|ございます)/;
const KEIGO = /(ございま|いたしま|致しま|申し|参りま|伺|おっしゃ|いらっしゃ|召し上が|存じ|承知|恐れ入|かしこまり|お(?:待|越|入|掛|休|使|聞|帰|呼)[^\s]{0,2}(?:ください|になり|になる))/;
const CONTRACTIONS = [
  ['teru', /[てで]る(?![べ])|[てで]た(?=[。、！？\s]|$)(?<!って)|[てで]ない(?!で)|[てで]ます(?<!って)/, 'te-iru shortened (てる / てた / てない)'],
  ['chau', /[ちじ]ゃ[うわっいお]|[ちじ]まう|[ちじ]まっ/, 'てしまう shortened (ちゃう / じゃう / ちまう)'],
  ['nakya', /なきゃ|なくちゃ|ないと(?=[。！？…\s]|$)|なけりゃ|ねば(?!な)/, 'must (なきゃ / なくちゃ / ないと)'],
  ['toku', /[てで]?[とど]い[てた]|[^ほ]とく(?=[。！？よねか\s]|$)|とこう|とこ(?=[。！？\s]|$)|どく(?=[。！？よ\s]|$)/, 'ておく shortened (とく / といて)'],
  ['nda', /[^みな]んだ|んです|んじゃ|んでしょ|んだろ|んだっけ|のだ/, 'explanatory ん / の'],
  ['ja', /じゃ(?![ん])/, 'じゃ (では)'],
  ['jan', /じゃん/, 'じゃん'],
  ['ssu', /っす/, 'っす (casual です)'],
  ['nee', /[らたかわさばま]ねえ|[らかさ]ねー|[しすかあ]げえ|[ゃい]ねぇ|ねえ(?=[。！？\s]|$)(?<![よだ]ねえ)|えよ|ぇよ|すげ|うめえ|やべ|でけえ|ちげえ|うるせ/, 'rough vowel merge (ねえ / すげえ)'],
  ['nnai', /んない|んねえ|らんない|かんない|んなきゃ/, 'ら-row ん (分かんない)'],
  ['tte', /って(?=[。！？\s]|$)|ってば|ったら|っつ/, 'quoting って / ってば'],
  ['teku', /[てで]く(?=[。！？よね\s]|$)|[てで]け(?=[。！？よ\s]|$)|[てで]った/, 'ていく shortened (てく)'],
  ['rero', /れる(?=[。！？\s]|$)(?<=[見来寝出着]れる)|見れ|来れ|寝れ|出れ/, 'ら-less potential (見れる)'],
  ['kka', /っけ/, 'っけ (recall)'],
  ['naa', /なあ|なぁ/, 'なあ'],
];
const ENDINGS = [
  ['wa_yo', /わよ|わね|わ(?=[。！？\s]|$)|かしら|のよ(?=[。！？\s]|$)|だわ|ですわ|ますわ|てよ(?=[。！？\s]|$)/, 'classic feminine endings (わよ, かしら, のよ)'],
  ['ze_zo', /ぜ(?=[。！？\s、]|$)|ぞ(?=[。！？\s、]|$)|だぜ|ってんだ|んだよな|じゃねえ/, 'rough masculine endings (ぜ, ぞ)'],
  ['ja_old', /じゃ(?=[。！？\s、]|$)|じゃろ|じゃな(?![いく])|おる(?=[。！？\s]|$)|おらん|わし|のう(?=[。！？\s]|$)|ぞい|じゃて/, 'stage elder speech (じゃ, わし, のう)'],
  ['kansai', /へん(?=[。！？\s、かでなよ]|$)|ねん|やん(?=[。！？\s、かな]|$)|ほんま|おおきに|あかん|せや|やろ|はる(?=[。！？\s]|$)|ちゃう(?=[。！？\s]|$)|かまへん|おまへん|でんがな|まんがな/, 'Kansai forms'],
  ['other_dialect', /だべ|っぺ|ずら|だら(?=[。！？\s]|$)|けん(?=[。！？\s、]|$)|じゃけ|ばい(?=[。！？\s]|$)|たい(?=[。！？]|$)(?<=[だん]たい)|やき(?=[。！？\s]|$)|だっちゃ|なんくるない|しとる|しょる|ちょる/, 'other regional forms'],
  ['literary', /である|であろう|であった|でありま|のである|ねばならぬ|せぬ|ませぬ|ならぬ|(?<![死いきけ])ぬ(?=[。！？、]|$)|(?<![まはさ])ず(?=[。]|$)|べし|なり(?=[。！？]|$)|ござる|候|たまえ|如く|ごとく|ゆえ(?!に)|ゆえに|いざ|しかと|然り|然様|左様|否(?=[。、])|なかれ|ずや|せよ(?=[。！？、]|$)|われら|我ら|汝|そなた|お主|おぬし|貴殿|そち|わらわ|それがし|拙者/, 'literary / archaic forms'],
  ['stage', /さあさあ|お立ち会い|御用とお急ぎ|とくとご覧|ご覧あれ|いよっ|よっ(?=[、！\s])|まいどあり|毎度あり|へい(?=[、！。\s])|へえ(?=[、！。\s])|あいよ|がってん|合点/, 'stage or trade calls'],
];
const PRONOUN = [['私', /私(?!たち|達|ども)/], ['わたくし', /わたくし/], ['あたし', /あたし/], ['僕', /僕|ぼく/], ['俺', /俺|おれ(?![いる])/], ['わし', /わし(?![づ])/], ['うち', /うち(?=[はもがのを、\s])(?<![おこ]うち)/], ['自分', /自分(?=[はがも])/],
  ['あなた', /あなた|貴方/], ['君', /君(?=[はがもをにのと、\s])|きみ(?=[はがもをにのと])/], ['お前', /お前|おまえ/], ['あんた', /あんた/], ['てめえ', /てめえ|てめー/], ['貴様', /貴様/], ['そなた', /そなた/], ['お主', /お主|おぬし/]];

function tagLine(t) {
  const ss = sentences(t);
  let pol = 0, pla = 0;
  for (const s of ss) {
    if (/^[…ー、。！？「」\s]*$/.test(s)) continue;
    if (POLITE_END.test(s)) pol++;
    else if (s.replace(/[…。！？!?\s「」]/g, '').length > 1) pla++;
  }
  const tags = [];
  if (pol && pla) tags.push('mixed');
  else if (pol) tags.push('polite');
  else if (pla) tags.push('plain');
  if (KEIGO.test(t)) tags.push('keigo');
  for (const [id, re] of CONTRACTIONS) if (re.test(t)) tags.push('c:' + id);
  for (const [id, re] of ENDINGS) if (re.test(t)) tags.push('m:' + id);
  const pr = PRONOUN.filter(([, re]) => re.test(t)).map(([p]) => p);
  if (pr.length) tags.push('pr:' + pr.join('/'));
  if (t.length > 70) tags.push('long:' + t.length);
  return { tags, polite: pol, plain: pla, pronouns: pr };
}

// ---- the speakers ---------------------------------------------------------------------------------------------------
const casting = JSON.parse(fs.readFileSync('docs/future/voice/va2/npc_casting.json', 'utf8'));
const profile = {};
for (const n of casting.npcs) profile[n.id] = { name: n.name && n.name.en, jp: n.name && n.name.jp, ...n.profile };
const COMPANION_BASE = {
  nao: 'Nao (they/them), courier: wry, perceptive, impatient with ceremony. Casual speech (だ/よ/じゃん), short sentences (docs/STORY.md).',
  mio: 'Mio (she/her), apothecary: gentle, stubborn about honesty, fierce when someone is condescending. Polite-ish speech: です/ます to strangers, softer plain with friends (docs/STORY.md).',
  ren: 'Ren (they/them), travelling lantern keeper: earnest, precise, deadpan puns. Careful speech, occasionally formal (docs/STORY.md).',
  suzu: 'Suzu (she/her), travelling performer: playful speech, stage phrases; meticulous about debts. Optional Kansai-ben (docs/dialect/suzu_kansai.md), a dialect choice independent of politeness.',
  pc: 'The player character (pronouns chosen at creation): an outsider from Reedwake; lines are chosen by the player.',
  narr: 'Narration (not spoken by a character).',
};

// ---- the frozen texts ----------------------------------------------------------------------------------------------
const va1 = JSON.parse(fs.readFileSync('docs/future/voice/corpus/audition_corpus.json', 'utf8'));
const va2 = JSON.parse(fs.readFileSync('docs/future/voice/va2/va2_plan.json', 'utf8'));
const frozen = { va1: {}, va2: {} };
for (const c of va1.cases) if (c.lineId) frozen.va1[c.lineId] = c.caseId;
for (const k in va2.lines) frozen.va2[k] = va2.lines[k].who;

// ---- walk the scenes ---------------------------------------------------------------------------------------------
const lines = [];
const byRegion = {};
const sceneIds = Object.keys(RB.content.scenes).sort();
for (const id of sceneIds) {
  const sc = RB.content.scenes[id];
  const cmds = sc.cmds || [];
  const out = [];
  const labelAt = {};
  for (const l in sc.labels || {}) labelAt[sc.labels[l]] = (labelAt[sc.labels[l]] || []).concat(l);
  let spokenCount = 0;
  const br = branches(sc);
  cmds.forEach((c, idx) => {
    if (labelAt[idx]) out.push('  :' + labelAt[idx].join(' :'));
    if (c.op === 'say' && c.jp) {
      const who = c.who || 'narr';
      const plain = spoken(c.jp);
      const key = keyOf(id, c.jp);
      const comp = who === 'comp' ? compOf(id, c.if, br[idx]) : null;
      const speaker = comp || who;
      if (who === 'narr') { out.push('  ~ ' + plain); return; }
      spokenCount++;
      const tg = tagLine(plain);
      let kansai = null;
      if (speaker === 'suzu' || (who === 'comp' && comp === 'suzu')) {
        const f = RB.dialect.find(c.jp, c.en);
        if (f && !f.same && f.jp) kansai = { plain: spoken(f.jp), en: f.en, tags: tagLine(spoken(f.jp)).tags };
      }
      const fr = [frozen.va1[key] ? 'VA1:' + frozen.va1[key] : null, frozen.va2[key] ? 'VA2' : null].filter(Boolean);
      // who may say a companion line: the one named, or every companion the condition leaves in
      const not = who === 'comp' ? [...String(c.if || '').matchAll(/comp!=(nao|mio|ren|suzu)/g)].map((x) => x[1]) : [];
      const sayers = who !== 'comp' ? null : comp !== 'any' ? [comp] : COMPS.filter((x) => !not.includes(x));
      const rec = { key, scene: id, idx, file: c.file || sc.file, line: c.line, who, speaker: sayers && sayers.length < 4 && sayers.length > 1 ? 'any' : speaker, sayers, expr: c.expr || null, if: c.if || null, jp: c.jp, plain, en: c.en || '', tags: tg.tags, kansai, frozen: fr };
      lines.push(rec);
      out.push('  [' + key.split('#')[1] + '] ' + speaker.toUpperCase() + (who === 'comp' ? '(comp)' : '') + (c.expr ? '[' + c.expr + ']' : '') + (c.if ? ' {if ' + c.if + '}' : '') + ': ' + plain + '  | ' + (c.en || '') + '   <' + tg.tags.join(' ') + (fr.length ? ' FROZEN:' + fr.join(',') : '') + '>');
      if (kansai) out.push('      KANSAI: ' + kansai.plain + '  | ' + kansai.en + '   <' + kansai.tags.join(' ') + '>');
      return;
    }
    if (c.op === 'choice' && c.opts) {
      for (const o of c.opts) {
        const plain = spoken(o.jp || '');
        const tg = tagLine(plain);
        const key = keyOf(id + ':choice', o.jp || '');
        lines.push({ key, scene: id, idx, file: c.file || sc.file, line: o.line, who: 'pc', speaker: 'pc', choice: true, if: o.if || null, jp: o.jp, plain, en: o.en || '', tags: tg.tags, kansai: null, frozen: [] });
        out.push('  PC> ' + plain + '  | ' + (o.en || '') + (o.if ? ' {if ' + o.if + '}' : '') + '  -> ' + (o.to || '') + '   <' + tg.tags.join(' ') + '>');
      }
      return;
    }
    if (c.op === 'if') out.push('  ? if ' + (c.args || []).join(' '));
    else if (c.op === 'goto' || c.op === 'call') out.push('  ' + c.op + ' ' + (c.args || []).join(' ') + (c.if ? ' {if ' + c.if + '}' : ''));
    else if (c.op === 'lesson' || c.op === 'challenge' || c.op === 'teach') out.push('  [' + c.op + ' ' + (c.args || []).slice(0, 2).join(' ') + ']');
  });
  if (!out.length) continue;
  const reg = regionOf(id);
  const hasChoice = out.some((o) => o.startsWith('  PC> '));
  if (!spokenCount && !hasChoice) continue; // narration-only scenes (examining things) hold no conversation
  (byRegion[reg] = byRegion[reg] || []).push('=== ' + id + '  (' + (sc.file || '') + ')' + '\n' + out.join('\n'));
}

// ---- parts for the readers: regions in story order, packed by size, split only between scenes ------------------------
const ORDER = ['rw', 'cs', 'sg', 'lq', 'co', 'co2', 'sb', 'sb2', 'sa', 'sa2', 'lf', 'lf2', 'mb', 'mp', 'kr', 'ko', 'sea', 'sz', 'el', 'cr', 'yn',
  'as', 'hall', 'end', 'pages', 'pets', 'road', 'atlas', 'rt', 'gd', 'xp', 'wp', 'dv', 'pt', 'at', 'fw', 'fish', 'coast', 'ws', 'pa', 'pb', 'pf'];
const MAX = Number(process.env.RV_PART_BYTES || 185000);
const regs = ORDER.filter((r) => byRegion[r]).concat(Object.keys(byRegion).filter((r) => !ORDER.includes(r)).sort());
const parts = [];
let cur = null;
for (const r of regs) for (const block of byRegion[r]) {
  const n = Buffer.byteLength(block) + 2;
  if (!cur || cur.bytes + n > MAX) parts.push((cur = { regions: [], blocks: [], bytes: 0 }));
  if (!cur.regions.includes(r)) cur.regions.push(r);
  cur.blocks.push(block);
  cur.bytes += n;
}
const index = parts.map((p, i) => {
  const name = 'p' + String(i + 1).padStart(2, '0') + '_' + p.regions.join('-');
  fs.writeFileSync(path.join(OUT, 'transcripts', name + '.txt'), p.blocks.join('\n\n') + '\n');
  return { name, regions: p.regions, scenes: p.blocks.length, bytes: p.bytes };
});
fs.writeFileSync(path.join(OUT, 'parts.json'), JSON.stringify(index, null, 1));

// ---- speakers: their usual register and the lines that depart from it -------------------------------------------
const sp = {};
for (const l of lines) {
  const s = (sp[l.speaker] = sp[l.speaker] || { lines: 0, polite: 0, plain: 0, mixed: 0, tags: {}, pronouns: {}, regions: {} });
  s.lines++;
  if (l.tags.includes('polite')) s.polite++;
  if (l.tags.includes('plain')) s.plain++;
  if (l.tags.includes('mixed')) s.mixed++;
  for (const t of l.tags) if (/^[cm]:/.test(t)) s.tags[t] = (s.tags[t] || 0) + 1;
  for (const t of l.tags) if (t.startsWith('pr:')) for (const p of t.slice(3).split('/')) s.pronouns[p] = (s.pronouns[p] || 0) + 1;
  s.regions[regionOf(l.scene)] = (s.regions[regionOf(l.scene)] || 0) + 1;
}
for (const k in sp) {
  const s = sp[k];
  const tot = s.polite + s.plain + s.mixed;
  s.usual = !tot ? null : s.polite / tot >= 0.75 ? 'polite' : s.plain / tot >= 0.75 ? 'plain' : 'varies';
  s.profile = COMPANION_BASE[k] || profile[k] || null;
  // the departures: a mostly polite speaker's plain line, or a mostly plain speaker's polite line
  s.departures = s.usual === 'polite' || s.usual === 'plain'
    ? lines.filter((l) => l.speaker === k && l.tags.includes(s.usual === 'polite' ? 'plain' : 'polite')).map((l) => ({ key: l.key, scene: l.scene, plain: l.plain, en: l.en }))
    : [];
}
fs.writeFileSync(path.join(OUT, 'speakers.json'), JSON.stringify(sp, null, 1));
fs.writeFileSync(path.join(OUT, 'lines.json'), JSON.stringify(lines));
fs.writeFileSync(path.join(OUT, 'frozen.json'), JSON.stringify(frozen, null, 1));

// ---- word help: what a learner gets for each token -----------------------------------------------------------------
const MARKED = /(てる|でる|ちゃ|じゃ|なきゃ|なくちゃ|とく|とい|どく|んだ|んです|っす|ねえ|げえ|んない|らんない|ってば|ったら|てく|てけ|っけ|かしら|わよ|のよ|ぜ$|ぞ$|じゃん|へん$|ねん|やん|やろ|ほんま|あかん|はる$|ちゃう|である|ぬ$|べし|ござる|ござい|たまえ|ごとく|ゆえ|そなた|おぬし|わし|おくれ|かい$|だい$|さ$)/;
const wh = { unknown: {}, unexplained: {} };
const note = (bag, surf, l) => {
  const b = (bag[surf] = bag[surf] || { n: 0, speakers: {}, examples: [] });
  b.n++;
  b.speakers[l.speaker] = (b.speakers[l.speaker] || 0) + 1;
  if (b.examples.length < 3) b.examples.push({ key: l.key, plain: l.plain, en: l.en });
};
function helpFor(tokens, i, kansaiLine) {
  if (kansaiLine && RB.dialect.lookupIn) { const k = RB.dialect.lookupIn(tokens, i); if (k) return { kansai: k }; }
  return RB.jp.lookup(tokens[i], tokens, i);
}
const NAMES = new Set();
for (const l of lines) {
  for (const [jp, isK] of [[l.jp, false]].concat(l.kansai ? [[RB.dialect.find(l.jp, l.en).jp, true]] : [])) {
    let toks;
    try { toks = RB.jp.parse(jp); } catch (e) { continue; }
    toks.forEach((t, i) => {
      if (t.punct || !t.surface || /^[…ー〜～・!?！？、。「」『』（）()\s0-9０-９]+$/.test(t.surface) || t.ph) return;
      const r = helpFor(toks, i, isK);
      if (r && r.kansai) return;
      if (!r || r.unknown) { note(wh.unknown, t.surface + (isK ? ' (Kansai line)' : ''), l); return; }
      if (MARKED.test(t.surface) && (!r.forms || !r.forms.length) && r.entry && r.entry.w !== t.surface && !(r.entry.pos || '').match(/exp|prt|aux|int/)) note(wh.unexplained, t.surface + ' → ' + r.entry.w + ':' + r.entry.pos, l);
    });
  }
}
const sortBag = (b) => Object.fromEntries(Object.entries(b).sort((x, y) => y[1].n - x[1].n));
wh.unknown = sortBag(wh.unknown);
wh.unexplained = sortBag(wh.unexplained);
fs.writeFileSync(path.join(OUT, 'wordhelp.json'), JSON.stringify(wh, null, 1));

console.log('lines', lines.length, 'speakers', Object.keys(sp).length, 'unknown tokens', Object.keys(wh.unknown).length, 'unexplained', Object.keys(wh.unexplained).length);
for (const f of fs.readdirSync(path.join(OUT, 'transcripts'))) console.log(f, fs.statSync(path.join(OUT, 'transcripts', f)).size);
