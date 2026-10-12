// VA-1 (VS01): the frozen audition corpus still matches the game. tools/voice/corpus.mjs --check rebuilds every case
// from tools/voice/corpus_selection.mjs against the current scenes (and the Kansai table), runs its checks (speakers,
// five distinct lines per companion, A/B on one text, J04/J05 on one text, distinct Kansai counterparts, one speaker per
// NPC profile, nothing but Japanese spoken, no dynamic names) and compares each case's spoken text hash and line id
// with docs/future/voice/corpus/audition_corpus.json. A changed or removed line fails here, so the corpus is rebuilt
// (and its choice reviewed) rather than drifting from the game.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { root } from '../lib/load.mjs';

export default async (t) => {
  const r = spawnSync(process.execPath, ['tools/voice/corpus.mjs', '--check'], { cwd: root, encoding: 'utf8' });
  t.ok(r.status === 0, 'the audition corpus matches the game: ' + (r.stdout || '').trim() + (r.stderr ? ' ' + r.stderr.trim().slice(0, 300) : ''));
  const c = JSON.parse(fs.readFileSync(root + '/docs/future/voice/corpus/audition_corpus.json', 'utf8'));
  t.eq([c.cases.length, c.cases.filter((x) => x.neutralControl).length], [83, 14], '83 directed cases, 14 neutral controls');
  t.ok(c.cases.every((x) => x.speechLine.production.publicationApproved === false && x.speechLine.production.allowParaphrase === false), 'nothing approved for publication; no paraphrase');
  t.ok(c.cases.filter((x) => x.sourceKind === 'noncanonical_audition_fixture').every((x) => x.sourceStatus === 'noncanonical_audition_fixture' && /fixture/.test(x.lineId)), 'every fixture labelled as one');
  t.ok(c.cases.every((x) => !/[{}|]/.test(x.spokenText) && x.spokenText === x.spokenText.normalize('NFC')), 'spoken texts are plain NFC Japanese');
};
