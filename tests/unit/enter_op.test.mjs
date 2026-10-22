// `!enter <who> <x> <y> <dir>` (RBN-QA-088; Agnes 6333527722 point 5): the validator takes a well-formed entrance and
// rejects a malformed one: an unknown character, pc / comp / npc (not someone a scene brings in by name), coordinates
// that are not whole tiles, a missing coordinate, an unknown facing, extra arguments. The validator is run as it is
// run by hand (node tools/validate.mjs) on a scratch copy of the sources with these scenes added, so the real
// sources are never touched; its other findings are the copy's own and are not judged here.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root } from '../lib/load.mjs';

const CASES = [
  // [scene, line, rejected]
  ['zz.enter_ok', '!enter ko_nana 13 10 up', false],
  ['zz.enter_noface', '!enter ko_nana 13 10', false],
  ['zz.enter_unknown', '!enter zz_nobody 13 10 up', true],
  ['zz.enter_comp', '!enter comp 13 10 up', true],
  ['zz.enter_pc', '!enter pc 13 10 up', true],
  ['zz.enter_frac', '!enter ko_nana 13.5 10 up', true],
  ['zz.enter_neg', '!enter ko_nana -1 10 up', true],
  ['zz.enter_missing', '!enter ko_nana 13', true],
  ['zz.enter_face', '!enter ko_nana 13 10 sideways', true],
  ['zz.enter_extra', '!enter ko_nana 13 10 up now', true],
];

export default async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rb-enter-'));
  try {
    for (const d of ['src', 'tools', path.join('tests', 'lib')]) fs.cpSync(path.join(root, d), path.join(dir, d), { recursive: true });
    const scenes = CASES.map(([id, line]) => '@scene ' + id + '\n' + line + '\nnarr: {岩|いわ} || A rock.').join('\n');
    fs.writeFileSync(path.join(dir, 'src', 'content', 'zzzz_enter_check.js'), 'RB.script.add(`\n' + scenes + '\n`, \'enter_check\');\n');
    let out = '';
    try { out = execFileSync(process.execPath, [path.join('tools', 'validate.mjs')], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 << 20 }); }
    catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
    const lines = out.split('\n').filter((l) => /\[zz\.enter_/.test(l));
    t.ok(/no errors|error/i.test(out), 'the validator ran on the scratch copy (' + out.split('\n').filter(Boolean).slice(-1)[0] + ')');
    for (const [id, line, bad] of CASES) {
      const mine = lines.filter((l) => l.includes('[' + id + ']'));
      const flagged = mine.some((l) => /!enter: needs a character, whole tile coordinates and an optional facing/.test(l));
      // (taken: no finding at all for that scene; rejected: this finding)
      t.ok(bad ? flagged : !mine.length, '`' + line + '` is ' + (bad ? 'rejected' : 'taken') + (mine.length ? ' (' + mine.join(' | ') + ')' : ''));
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};
