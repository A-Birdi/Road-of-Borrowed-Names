#!/usr/bin/env python3
"""Subset the book interface's fonts (expansion packet U02) into data/fonts/.

A development tool, not part of the game or its build: the game embeds the subsets this writes, and needs nothing
at runtime. Requires fontTools and brotli (pip install fonttools brotli) and the original font files, named as in
data/fonts/sources.json, in one folder (download them from the URLs listed there).

    python3 tools/fonts/subset.py --src <folder with the original .ttf files>

For each face: checks the source's SHA-256, subsets it to its character set (see "sets" in sources.json) keeping
every OpenType feature, writes WOFF2, and records the result in data/fonts/fonts.json: the file's SHA-256, its size
and the exact code points it covers (read back from the subset's own cmap), so the game's tests can check coverage
against the very file that is embedded."""
import argparse, hashlib, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONTS = os.path.join(ROOT, 'data', 'fonts')


def game_chars():
    """Every character in the game's source (the built file is made from these)."""
    out = set()
    for d, _, files in os.walk(os.path.join(ROOT, 'src')):
        for f in files:
            if f.endswith(('.js', '.html', '.css')):
                with open(os.path.join(d, f), encoding='utf-8') as fh:
                    out.update(ord(c) for c in fh.read())
    return {c for c in out if c >= 0x20 and c != 0x7f}


def is_cjk(c):
    return c >= 0x2e80 or 0x3000 <= c <= 0x30ff


def is_han(c):
    return 0x3400 <= c <= 0x4dbf or 0x4e00 <= c <= 0x9fff or 0xf900 <= c <= 0xfaff or 0x20000 <= c <= 0x3134f


def sets():
    g = game_chars()
    latin = {c for c in g if not is_cjk(c)}
    latin |= set(range(0x20, 0x7f)) | set(range(0xa0, 0x180)) | set(range(0x2010, 0x2028)) | set(range(0x2030, 0x203b))
    cjk = {c for c in g if is_cjk(c)}
    cjk |= set(range(0x3000, 0x3040)) | set(range(0x3041, 0x3097)) | set(range(0x3099, 0x3100)) | set(range(0x31f0, 0x3200))
    cjk |= set(range(0xff01, 0xff5f))
    kana = {c for c in cjk if not is_han(c)}
    return {'latin': latin, 'cjk': cjk, 'cjk+latin': cjk | latin, 'kana+latin': kana | latin}


def ranges(cps):
    cps = sorted(cps)
    out, start, prev = [], None, None
    for c in cps:
        if start is None:
            start = prev = c
        elif c == prev + 1:
            prev = c
        else:
            out.append((start, prev)); start = prev = c
    if start is not None:
        out.append((start, prev))
    return ','.join('%x' % a if a == b else '%x-%x' % (a, b) for a, b in out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True, help='folder holding the original font files')
    a = ap.parse_args()
    from fontTools import subset
    from fontTools.ttLib import TTFont
    spec = json.load(open(os.path.join(FONTS, 'sources.json'), encoding='utf-8'))
    S = sets()
    faces = []
    for face in spec['faces']:
        src = os.path.join(a.src, face['source']['file'])
        raw = open(src, 'rb').read()
        h = hashlib.sha256(raw).hexdigest()
        if h != face['source']['sha256']:
            sys.exit('%s: SHA-256 %s, expected %s' % (face['source']['file'], h, face['source']['sha256']))
        opts = subset.Options()
        opts.layout_features = ['*']
        opts.flavor = 'woff2'
        opts.name_IDs = ['*']          # keep the copyright, licence and version records
        opts.name_languages = ['*']
        opts.notdef_outline = True
        font = TTFont(src)
        sub = subset.Subsetter(options=opts)
        sub.populate(unicodes=S[face['set']])
        sub.subset(font)
        out = os.path.join(FONTS, face['out'])
        subset.save_font(font, out, opts)
        data = open(out, 'rb').read()
        cmap = TTFont(out).getBestCmap()
        rec = dict(face)
        rec['sha256'] = hashlib.sha256(data).hexdigest()
        rec['bytes'] = len(data)
        rec['glyphsMapped'] = len(cmap)
        rec['codepoints'] = ranges(cmap.keys())
        faces.append(rec)
        print('%-34s %8d bytes  %5d characters' % (face['out'], len(data), len(cmap)))
    json.dump({'generatedBy': 'tools/fonts/subset.py', 'faces': faces}, open(os.path.join(FONTS, 'fonts.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote data/fonts/fonts.json')


if __name__ == '__main__':
    main()
