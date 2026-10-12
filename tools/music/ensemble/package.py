"""MT-1 production step 3: encode the working masters into the game's media files (development tool).

    python3 tools/music/ensemble/package.py [songId ...]

For each song's head.wav and loop.wav (render.py) and each delivery format (Ogg Opus first, MP3 second), encodes with
FFmpeg, names the file by its content (assets/music/ensemble/<id>/<id>.<first|loop>.<sha256:16>.<ext>), and checks the
file locally: decoded with FFmpeg, its frame count, its alignment against the master (cross-correlation over every
playable stretch measured) and its coding error. Writes <work>/<id>/package.json. The browser's own decoding is measured
by verify.mjs; only that measurement goes into the game's manifest.
"""
from pathlib import Path
import hashlib, json, os, shutil, subprocess, sys, tempfile
import numpy as np, soundfile as sf

ROOT = Path(__file__).resolve().parents[3]
WORK = (ROOT / os.environ.get('RBN_MUSIC_WORK', 'tmp/music-ensemble')).resolve()
OUT = ROOT / 'assets' / 'music' / 'ensemble'
FORMATS = [
    # Opus: 48 kHz native, VBR around 160 kbit/s (transparent for this material in our listening budget is NOT claimed)
    {'codec': 'opus', 'ext': 'opus', 'mime': 'audio/ogg', 'args': ['-c:a', 'libopus', '-b:a', '160k', '-vbr', 'on', '-compression_level', '10', '-application', 'audio']},
    # MP3: the fallback for browsers without Ogg Opus decoding; LAME's gapless header carries its delay and padding
    {'codec': 'mp3', 'ext': 'mp3', 'mime': 'audio/mpeg', 'args': ['-c:a', 'libmp3lame', '-b:a', '192k', '-write_xing', '1']},
]


def ffmpeg(*a):
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', *a], check=True)


def decode(path, rate):
    with tempfile.TemporaryDirectory() as d:
        out = Path(d) / 'x.f32'
        ffmpeg('-i', str(path), '-f', 'f32le', '-ac', '2', '-ar', str(rate), str(out))
        return np.fromfile(out, dtype='<f4').reshape(-1, 2)


def align(master, dec, starts, win=8192, search=32):
    """At each start: the coding SNR with no shift, and the shift (within +-search frames) that minimises the coding
    error. (Raw cross-correlation is fooled by sustained notes, whose peaks repeat a pitch period away.)"""
    res = []
    for s in starts:
        a = master[s:s + win]
        if len(a) < win or np.sqrt(np.mean(a ** 2)) < 1e-4:
            continue
        best = None
        for lag in range(-search, search + 1):
            if s + lag < 0 or s + lag + win > len(dec):
                continue
            e = float(np.sum((a - dec[s + lag:s + lag + win]) ** 2))
            if best is None or e < best[1]:
                best = (lag, e)
        sig = float(np.sum(a ** 2))
        e0 = float(np.sum((a - dec[s:s + win]) ** 2))
        res.append({'at': int(s), 'lag': best[0], 'snrDb': round(10 * np.log10(sig / max(1e-20, e0)), 2), 'bestSnrDb': round(10 * np.log10(sig / max(1e-20, best[1])), 2)})
    return res


def package(id):
    d = WORK / id
    rep = json.loads((d / 'render.json').read_text())
    sr = rep['sampleRate']
    dest = OUT / id
    dest.mkdir(parents=True, exist_ok=True)
    out = {'songId': id, 'fingerprint': rep['fingerprint'], 'sampleRate': sr, 'assets': {}}
    for role, key in (('first', 'head'), ('loop', 'loop')):
        master, rate = sf.read(d / rep[key]['file'], dtype='float32')
        assert rate == sr
        ps, pe = rep[key]['playableStartFrame'], rep[key]['playableEndFrame']
        out['assets'][role] = []
        for f in FORMATS:
            with tempfile.TemporaryDirectory() as tdir:
                tmp = Path(tdir) / ('x.' + f['ext'])
                ffmpeg('-i', str(d / rep[key]['file']), '-fflags', '+bitexact', '-flags:a', '+bitexact', *f['args'], str(tmp))  # (reproducible bytes: no random stream serial)
                b = tmp.read_bytes()
                sha = hashlib.sha256(b).hexdigest()
                name = f'{id}.{role}.{sha[:16]}.{f["ext"]}'
                shutil.copyfile(tmp, dest / name)
            dec = decode(dest / name, sr)
            starts = sorted(set([ps, max(ps, pe - 8192), (ps + pe) // 2] + list(range(ps, pe - 8192, max(8192, (pe - ps) // 12)))))
            al = align(master, dec, starts)
            lags = sorted(set(x['lag'] for x in al))
            item = {
                'codec': f['codec'], 'mimeType': f['mime'], 'file': f'{id}/{name}', 'sha256': sha, 'encodedBytes': len(b),
                'sampleRate': sr, 'channels': 2, 'masterFrames': len(master), 'playableStartFrame': ps, 'playableEndFrame': pe,
                'ffmpegDecodedFrames': len(dec), 'ffmpegLags': lags, 'ffmpegMinSnrDb': min(x['snrDb'] for x in al), 'ffmpegChecks': al,
            }
            out['assets'][role].append(item)
            print(id, role, f['codec'], len(b), 'bytes', 'frames', len(dec), 'of', len(master), 'lags', lags, 'min SNR', item['ffmpegMinSnrDb'], flush=True)
    (d / 'package.json').write_text(json.dumps(out, indent=2))
    # files of this song that neither this package nor the committed manifest names were never published: removed
    keep = {Path(a['file']).name for r in out['assets'].values() for a in r}
    man = OUT / 'manifest.json'
    if man.exists():
        for t in json.loads(man.read_text()).get('tracks', []):
            for group in (t.get('assets') or {}).values():
                if isinstance(group, list):
                    keep |= {Path(a['relativeUrl']).name for a in group}
    for f in dest.iterdir():
        if f.is_file() and f.name not in keep:
            f.unlink()
            print('  removed unpublished', f.name)
    return out


if __name__ == '__main__':
    for id in sys.argv[1:] or ['snowbell', 'battle_keepers']:
        package(id)
