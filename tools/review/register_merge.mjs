// RV-1: merge the readers' findings with the automated checks into docs/review/register/.
//   --findings <dir>   the readers' JSON files (one per part of the road)
//   --lines <file>     lines.json from tools/review/register_extract.mjs (the same build)
//   --wordhelp <file>  the output of tools/review/wordhelp_check.mjs
//   --out <dir>        writes findings.json (everything, with ids) and FINDINGS.md (every finding, by part of the road)
// Each reader's finding is checked against the line it names: the key must exist and its text must be the line's
// (a finding that cannot be matched is kept, marked unmatched, and listed apart). Nothing in the game is changed.
import fs from 'node:fs';
import path from 'node:path';

const a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const lines = JSON.parse(fs.readFileSync(opt('--lines'), 'utf8'));
const wordhelp = JSON.parse(fs.readFileSync(opt('--wordhelp'), 'utf8'));
const OUT = opt('--out');
fs.mkdirSync(OUT, { recursive: true });

const byKey = new Map(lines.map((l) => [l.key, l]));
const norm = (t) => String(t || '').replace(/[\s「」『』]/g, '').normalize('NFC');
const SEV = ['fix_before_recording', 'consider', 'support_only'];
const CATS = ['register_mismatch', 'register_inconsistent', 'unnatural_banter', 'over_literary', 'over_explanatory', 'stiff_translationese',
  'contraction_support', 'marked_expression_support', 'dialect_register_conflation', 'stereotyped_speech', 'generic_companion_line', 'other'];

// ---- the readers' findings ---------------------------------------------------------------------------------------
const files = fs.readdirSync(opt('--findings')).filter((f) => f.endsWith('.json')).sort();
const parts = [];
const findings = [];
const preserve = [];
const notes = [];
for (const f of files) {
  const part = f.replace(/\.json$/, '');
  const d = JSON.parse(fs.readFileSync(path.join(opt('--findings'), f), 'utf8'));
  parts.push({ part, scenesRead: d.scenesRead || null, findings: (d.findings || []).length });
  for (const x of d.findings || []) {
    let l = byKey.get(String(x.key || '').trim());
    // a choice, or a key given without its hash: match the scene and the text
    if (!l) l = lines.find((y) => y.scene === x.scene && norm(y.plain) === norm(x.text)) || lines.find((y) => y.scene === x.scene && norm(x.text) && norm(y.plain).includes(norm(x.text)));
    const k = l && l.kansai && x.kansai ? norm(l.kansai.plain) === norm(x.kansai) || norm(l.kansai.plain).includes(norm(x.kansai)) : null;
    const matched = !!l && (norm(l.plain) === norm(x.text) || norm(l.plain).includes(norm(x.text)) || norm(x.text).includes(norm(l.plain)) || k === true);
    findings.push({
      part, key: l ? l.key : x.key, scene: l ? l.scene : x.scene, file: l ? l.file + ':' + l.line : null,
      speaker: x.speaker || (l && l.speaker), addressee: x.addressee || null, text: l ? l.plain : x.text, en: l ? l.en : x.en || '',
      kansai: x.kansai || null, category: CATS.includes(x.category) ? x.category : 'other', categoryGiven: x.category,
      severity: SEV.includes(x.severity) ? x.severity : 'consider', why: x.why || '', direction: x.direction || '',
      frozen: l && l.frozen && l.frozen.length ? l.frozen.join(',') : 'none', sayers: l && l.sayers || null,
      matched, source: 'reader',
    });
  }
  for (const p of d.preserve || []) preserve.push({ part, ...p });
  for (const n of d.speakerNotes || []) notes.push({ part, ...n });
}

// ---- automated: Suzu's Kansai lines that change the politeness of her standard line ----------------------------------
// polite forms toward the listener (でしょ(う) as a tag is casual speech, and Kansai やろ matches it; Kansai はる about a
// third person is the dialect's own light respect, not a change in how she speaks to you)
const POL = /(です(?!って)|でした|ます|ました|ません|ましょう|ください|ございます|くれはって|くれはる(?=[。？！]|$))/;
const auto = [];
for (const l of lines) {
  if (!l.kansai) continue;
  const s = POL.test(l.plain), k = POL.test(l.kansai.plain);
  if (s === k) continue;
  auto.push({
    part: 'auto', key: l.key, scene: l.scene, file: l.file + ':' + l.line, speaker: 'suzu', addressee: null, text: l.plain, en: l.en,
    kansai: l.kansai.plain, category: 'dialect_register_conflation', severity: 'consider',
    why: s ? 'The standard line has polite forms (' + (l.plain.match(POL) || [''])[0] + '); the Kansai version drops them, so choosing Kansai also makes her less polite here.'
      : 'The Kansai version adds polite or honorific forms the standard line does not have, so choosing Kansai changes how polite she is here.',
    direction: 'Keep the politeness of the standard line in the Kansai version (Kansai has polite forms too: 〜ます, 〜まひょ / 〜ましょか, 〜はる), or make both versions plain if the standard one should be.',
    frozen: l.frozen.length ? l.frozen.join(',') : 'none', matched: true, source: 'auto:kansai_register',
  });
}
// ---- automated: lines several companions say, by register ------------------------------------------------------------
const shared = new Map();
for (const l of lines) {
  if (!l.sayers || l.sayers.length < 2) continue;
  const s = shared.get(l.plain) || { text: l.plain, en: l.en, sayers: l.sayers, keys: [], scenes: new Set(), tags: l.tags };
  s.keys.push(l.key); s.scenes.add(l.scene.split('.').slice(0, 2).join('.'));
  shared.set(l.plain, s);
}
const sharedList = [...shared.values()].map((s) => ({ ...s, scenes: [...s.scenes] }));
for (const s of sharedList) {
  const polite = s.tags.includes('polite') || s.tags.includes('mixed');
  const rough = /だな|だろ|じゃん|俺|ぜ|ぞ(?=[。！？]|$)/.test(s.text);
  const fem = /わ(?=[。！？]|$)|わよ|わね|のよ|かしら/.test(s.text);
  const misfit = [];
  if (polite) for (const c of s.sayers) if (c === 'nao' || c === 'suzu') misfit.push(c);
  if (!polite && !rough && !fem && s.sayers.includes('ren') && !/^[…。、！？]*$/.test(s.text) && s.text.replace(/[…。、！？]/g, '').length > 6) misfit.push('ren');
  if (rough) for (const c of s.sayers) if (c === 'mio' || c === 'ren') misfit.push(c);
  if (fem) for (const c of s.sayers) if (c !== 'suzu' && c !== 'mio') misfit.push(c);
  s.misfit = [...new Set(misfit)];
}

// ---- ids, in the order of the road ----------------------------------------------------------------------------------
const all = findings.concat(auto);
const seen = new Set();
const merged = [];
for (const x of all) {
  const id = x.key + '|' + x.category + '|' + (x.kansai ? 'k' : 's');
  if (seen.has(id)) continue;
  seen.add(id);
  merged.push(x);
}
merged.forEach((x, i) => { x.id = 'RV-' + String(i + 1).padStart(4, '0'); });

const count = (arr, f) => arr.reduce((m, x) => ((m[f(x)] = (m[f(x)] || 0) + 1), m), {});
const summary = {
  lines: lines.length, parts, readerFindings: findings.length, unmatched: findings.filter((x) => !x.matched).length,
  autoKansai: auto.length, sharedTexts: sharedList.length, sharedMisfit: sharedList.filter((s) => s.misfit.length).length,
  bySeverity: count(merged, (x) => x.severity), byCategory: count(merged, (x) => x.category),
  frozenTouched: merged.filter((x) => x.frozen !== 'none').length, wordhelpCases: wordhelp.cases.length,
  wordhelpTokens: wordhelp.cases.reduce((n, c) => n + c.tokens, 0),
};
fs.writeFileSync(path.join(OUT, 'findings.json'), JSON.stringify({ schema: 'rbn-register-review-1', summary, findings: merged, shared: sharedList, wordhelp: wordhelp.cases, preserve, speakerNotes: notes }, null, 1) + '\n');

// ---- FINDINGS.md: every finding, readable ---------------------------------------------------------------------------
const esc = (t) => String(t || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const SEVW = { fix_before_recording: 'fix', consider: 'consider', support_only: 'support' };
const md = ['# RV-1 findings, line by line', '',
  'Generated by `tools/review/register_merge.mjs` from the readers\' findings and the automated checks. Read',
  '[REGISTER_REVIEW.md](REGISTER_REVIEW.md) first: it explains the categories, what was and was not checked, and the patterns.',
  'Severity: **fix** = fix before recording; **consider** = a judgement for Robin; **support** = the line stays, learners need a note.',
  'Keys are `scene#hash` (tools/voice/lines.mjs); `frozen` marks a line in the VA-1 audition or the VA-2 samples (those texts',
  'do not change; a correction applies to the game\'s line and is reconciled before the full recording).', ''];
const order = (x) => SEV.indexOf(x.severity);
for (const p of parts.map((p) => p.part).concat(['auto'])) {
  const xs = merged.filter((x) => x.part === p && x.source === (p === 'auto' ? 'auto:kansai_register' : 'reader')).sort((u, v) => order(u) - order(v));
  if (!xs.length) continue;
  md.push('## ' + (p === 'auto' ? 'Automated: Suzu\'s Kansai lines that change her politeness' : 'Part ' + p.replace(/^p(\d+)_/, '$1 · ').replace(/-/g, ', ')), '');
  md.push('| id | sev | category | speaker → addressee | line | why | direction |', '|---|---|---|---|---|---|---|');
  for (const x of xs) md.push('| ' + x.id + (x.matched ? '' : ' (unmatched)') + (x.frozen !== 'none' ? ' · ' + x.frozen : '') + ' | ' + SEVW[x.severity] + ' | ' + x.category + ' | ' + esc(x.speaker) + (x.addressee ? ' → ' + esc(x.addressee) : '') +
    ' | `' + esc(x.key) + '`<br>' + esc(x.text) + (x.kansai ? '<br>Kansai: ' + esc(x.kansai) : '') + '<br>*' + esc(x.en) + '* | ' + esc(x.why) + ' | ' + esc(x.direction) + ' |');
  md.push('');
}
md.push('## Lines several companions say (automated)', '', 'Each text below is said by whichever of the listed companions travels with you. "Fits less well" names the',
  'companions whose usual register the line does not match (heuristic: polite forms for Nao and Suzu; plain, unmarked speech for Ren, who',
  'is careful and mostly polite; rough forms for Mio and Ren; わ/かしら endings for anyone but Suzu and Mio).', '',
  '| text | said by | scenes | fits less well |', '|---|---|---|---|');
for (const s of sharedList.sort((u, v) => v.keys.length - u.keys.length)) md.push('| ' + esc(s.text) + '<br>*' + esc(s.en) + '* | ' + s.sayers.join(', ') + ' | ' + s.keys.length + ' × ' + esc(s.scenes.slice(0, 4).join(', ')) + (s.scenes.length > 4 ? ' …' : '') + ' | ' + (s.misfit.join(', ') || '—') + ' |');
md.push('', '## Word help that explains a word wrongly (automated, verified against the game\'s own lookup)', '',
  '| tokens | lines | shown as | what it is here | example |', '|---:|---:|---|---|---|');
for (const c of wordhelp.cases) md.push('| ' + c.tokens + ' | ' + c.lines + ' | ' + c.shown + ' | ' + esc(c.is) + ' | `' + c.examples[0].key + '`' + (c.examples[0].kansai ? ' (Kansai)' : '') + '<br>' + esc(c.examples[0].text) + ' |');
md.push('', '## Kept on purpose (the readers\' "preserve" notes)', '', '| speaker | line | why it must stay |', '|---|---|---|');
for (const p of preserve) md.push('| ' + esc(p.speaker) + ' | `' + esc(p.key) + '`<br>' + esc(p.text) + ' | ' + esc(p.why) + ' |');
fs.writeFileSync(path.join(OUT, 'FINDINGS.md'), md.join('\n') + '\n');
console.log(JSON.stringify(summary, null, 1));
