"""MT-1 production step 2: the Ensemble working masters (development tool; nothing here ships in the game).

    RBN_SR=48000 python3 tools/music/ensemble/render.py [songId ...]

Reads <work>/<id>/score.json and performance.json (export_events.mjs) and writes, at RBN_SR (48 kHz):
  head.wav   the first pass from silence: LEAD seconds of lead-in, score [0, J) and GUARD seconds past the join J.
  loop.wav   one steady cycle of the repeat [L, D), circular (the tails of the cycle before are in it), with GUARD
             seconds of its own end before it and of its own start after it, so a codec's edges never touch the seam.
  render.json  what was made, from what, and the checks below.
Both are 32-bit float, unfaded, at one shared scale (peak -1 dBFS); the game's trim is calibrated later in the game's
own graph (verify.mjs).

The treatment is SC-1's, as Robin auditioned it: the same score, the same first-pass realisation (timing jitter,
velocities, percussion seeds), the same voices (TimGM6mb sampled koto, shakuhachi, shamisen, strings, bass; SC-1's
modal lute, rin and drums), the same per-salt modal noise, the same per-part gains (SC-1's measured balance and its
listed dB refinements, copied from its conversion logs), pans, reverb sends, room, high-pass and low-pass. What differs:
  - every note is rendered on its own, from silence, and placed at its exact sample (SC-1 shared one synth per part,
    so its onsets fell on that synth's 64-frame grid, up to 1.3 ms late): a note sounds the same at every repeat;
  - the steady cycle is rendered circularly (every note of the repeat added modulo the period, the room by circular
    convolution, the filters in their steady state), which is exactly an endless repeat of one realisation;
  - 48 kHz instead of 44.1 kHz; FluidSynth from the system (its version is recorded).
Checks, recorded in render.json: every first-pass event placed exactly once in the head (those before J + GUARD) and in
the cycle (every event of the repeat); the head and the cycle agree past the join (they are the same music there);
the cycle's period against the score's (parts per million); per-part RMS against SC-1's.
"""
from pathlib import Path
import json, math, os, sys, time, hashlib
import numpy as np, soundfile as sf
from scipy import signal
sys.path.insert(0, str(Path(__file__).resolve().parent))
import rs1 as E

ROOT = Path(__file__).resolve().parents[3]
WORK = (ROOT / os.environ.get('RBN_MUSIC_WORK', 'tmp/music-ensemble')).resolve()
SR = E.SR
LEAD = 0.1  # head lead-in before score zero (covers the early jitter of a downbeat and a codec's first frames)
GUARD = 0.5  # seconds beyond each playable edge
OFFSET = 0.05  # the performance's score zero (export_events.mjs)
# SC-1's instrument assignment and per-part balance (qa/<id>_conversion.json: parts[].gain = measured balance x listed dB)
MAP = {'koto': 'koto', 'shakuhachi': 'shakuhachi', 'shamisen': 'shamisen', 'biwa_tale': 'biwa', 'biwa': 'biwa', 'bowed': 'cello', 'pad': 'slow_strings', 'bass': 'acoustic_bass'}
PERC = {'z': ('odaiko', 47), 'e': ('shime', 62), 'm': ('kotsuzumi', 69), 'q': ('otsuzumi', 69), 'j': ('jingles', 90), 'i': ('rin', 86)}
NATIVE = ('kotsuzumi', 'otsuzumi', 'jingles')
SC1 = {
    'snowbell': {
        'room': (1.85, .19),
        'gain': {'lead': 7.633773, 'fl': 9.745581, 'arp': 3.953140, 'pad': 3.042990, 'bass': 7.993157, 'bells': 0.415009},
        'rms': {'lead': 0.004878, 'fl': 0.006256, 'arp': 0.009205, 'pad': 0.008321, 'bass': 0.008651, 'bells': 0.00512},
    },
    'battle_keepers': {
        'room': (1.35, .14),
        'gain': {'lead': 6.338870, 'shaku': 7.330870, 'low': 3.853810, 'ost': 2.681540, 'arp': 4.290440, 'pad': 2.270920, 'bass': 7.356920, 'taiko': 4.649780, 'shime': 6.720640, 'noh': 0.367310, 'bell': 1.010930},
        'rms': {'lead': 0.009162, 'shaku': 0.007399, 'low': 0.010285, 'ost': 0.006953, 'arp': 0.012306, 'pad': 0.009264, 'bass': 0.012695, 'taiko': 0.023745, 'shime': 0.002722, 'noh': 0.038308, 'bell': 0.001188},
    },
}


def pan_stereo(x, p):
    """SC-1's part panning: equal-power pan of the mono core plus a restrained part of the native width."""
    mid = x.mean(axis=1); side = (x[:, 0] - x[:, 1]) * .16; l, r = E.pan_gain(p)
    return np.column_stack((mid * l + side, mid * r - side)).astype(np.float32)


def sc1_gains(id):
    """Prefer SC-1's logged gains at full precision when its package is at hand (RBN_SC1_DIR)."""
    g = dict(SC1[id]['gain'])
    d = os.environ.get('RBN_SC1_DIR')
    if d and (Path(d) / 'qa' / f'{id}_conversion.json').exists():
        for p in json.loads((Path(d) / 'qa' / f'{id}_conversion.json').read_text())['parts']:
            g[p['track']] = p['gain']
    return g


def render_notes(id, score, events, synth):
    """Each first-pass event's sound (stereo, after part gain and pan) and its reverb send, with its place in frames."""
    gains = sc1_gains(id)
    salt_j = {}
    out = []
    for e in events:
        tk = score['tracks'][e['tr']]
        if e.get('p'):
            voice, pitch = PERC[e['p']]
            if voice in NATIVE:
                x = E.native_percussion(voice, e['v'], f"{id}.{e['ix']}")
            else:
                x = E.modal_note(E.VOICES[voice]['model'], pitch, e['d'], e['v'], f"{id}.{e['ix']}") * E.VOICES[voice]['trim'] * .20
            x = np.repeat(x[:, None], 2, axis=1)
        else:
            voice = MAP[e['i']]
            key = (e['tr'], e['i']); j = salt_j.get(key, 0); salt_j[key] = j + 1
            if 'gm' in E.VOICES[voice]:
                at = round(e['t'] * SR); end = max(at + 4, round((e['t'] + e['d']) * SR))
                x = synth.note(voice, e['m'], end - at, e['v'])
            else:
                x = E.modal_note(E.VOICES[voice]['model'], e['m'], e['d'], e['v'], f"{id}.{e['tr']}.{j}") * E.VOICES[voice]['trim'] * .20
                x = np.repeat(x[:, None], 2, axis=1)
        x = x.astype(np.float32) * gains[tk['name']]
        y = pan_stereo(x, tk.get('pan', 0))
        send = min(1, tk.get('rv', .15) / .45)
        # the event's frame from the performance's score zero (SC-1 placed round(t * SR) with t including OFFSET)
        f = round(e['t'] * SR) - round(OFFSET * SR)
        out.append({'ix': e['ix'], 'track': tk['name'], 'voice': voice, 'frame': f, 'y': y, 'mid': x.mean(axis=1), 'send': send})
    return out


def room(audio, sends, ir, wet, circular):
    out = audio.copy()
    n = len(audio)
    for c in range(2):
        s = sends[:, c] * .84 + sends[:, 1 - c] * .16
        y = signal.fftconvolve(s, ir[:, c])
        if circular:
            r = y[:n].copy(); tail = y[n:]
            k = 0
            while k < len(tail):
                m = min(n, len(tail) - k); r[:m] += tail[k:k + m]; k += m
            y = r
        out[:, c] += wet * y[:n]
    return out


def filters(x, periodic):
    hp = signal.butter(2, 32, fs=SR, btype='highpass', output='sos')
    lp = signal.butter(2, 11000, fs=SR, btype='lowpass', output='sos')
    if not periodic:
        return signal.sosfilt(lp, signal.sosfilt(hp, x, axis=0), axis=0).astype(np.float32)
    # the steady state of a periodic input: three periods in, the middle one out (the start-up has long decayed)
    n = len(x)
    y = signal.sosfilt(lp, signal.sosfilt(hp, np.concatenate([x, x, x]).astype(np.float64), axis=0), axis=0)
    return y[n:2 * n].astype(np.float32)


def convert(id):
    t0 = time.time()
    d = WORK / id
    score = json.loads((d / 'score.json').read_text())
    events = json.loads((d / 'performance.json').read_text())
    src = json.loads((d / 'source.json').read_text())
    assert len(events) == len(score['events'])
    D, L, loop, loop_idx = score['length'], score['loopStart'], score['loop'], score['loopIdx']
    assert loop, 'the pilots loop'
    P = D - L
    Nper = round(P * SR)
    ppm = (Nper / SR - P) / P * 1e6
    fL = round(L * SR)
    Z = round(LEAD * SR); G = round(GUARD * SR)
    synth = E.NoteSynth()
    notes = render_notes(id, score, events, synth)
    synth.close()
    # the join: past the longest tail of the cycle before (and, for an introduction, of the introduction) and the room
    room_s, wet = SC1[id]['room']
    over = 0
    for n in notes:
        if n['ix'] >= loop_idx:
            over = max(over, (n['frame'] - fL) + len(n['y']) - Nper)  # a note of the cycle ringing into the next
        else:
            over = max(over, n['frame'] + len(n['y']) - fL)  # an introduction's note ringing into the repeat
    H = max(4.0, math.ceil((over / SR + room_s + 1.0) * 2) / 2)
    h = round(H * SR)
    fJ = fL + h
    assert fJ + G < round(D * SR), 'the join must fall inside the first pass'
    ir = E.room_ir(room_s, E.seed(id))
    # ---- the head: the first pass from silence, [ -LEAD, J + GUARD )
    NH = Z + fJ + G
    head = np.zeros((NH, 2), np.float32); hsend = np.zeros_like(head)
    in_head = 0
    for n in notes:
        a = Z + n['frame']
        if a >= NH:
            continue
        assert a >= 0, 'an event before the lead-in'
        m = min(len(n['y']), NH - a)
        head[a:a + m] += n['y'][:m]; hsend[a:a + m] += n['y'][:m] * n['send']; in_head += 1
    head = filters(room(head, hsend, ir, wet, False), False)
    # ---- the steady cycle: every event of the repeat, modulo the period
    cyc = np.zeros((Nper, 2), np.float64); csend = np.zeros_like(cyc)
    in_cycle = 0
    part_cycle = {}
    for n in notes:
        if n['ix'] < loop_idx:
            continue
        r = (n['frame'] - fL) % Nper
        y = n['y'].astype(np.float64); k = 0
        pc = part_cycle.setdefault(n['track'], np.zeros(Nper))
        while k < len(y):
            m = min(len(y) - k, Nper - r)
            cyc[r:r + m] += y[k:k + m]; csend[r:r + m] += y[k:k + m] * n['send']
            pc[r:r + m] += n['mid'][k:k + m]  # (the part before its pan, as SC-1 measured it)
            k += m; r = 0
        in_cycle += 1
    cyc = filters(room(cyc, csend, ir, wet, True), True)
    # ---- the join check: past J the head and the cycle are the same music (phase h of the cycle)
    W = G
    a = head[Z + fJ - W: Z + fJ + G]; b = np.concatenate([cyc, cyc[:G]])[h - W: h + G]
    resid = float(np.sqrt(np.mean((a - b) ** 2))); level = float(np.sqrt(np.mean(b ** 2)))
    join_db = 20 * math.log10(max(resid, 1e-12) / max(level, 1e-12))
    # ---- one scale for both, peak -1 dBFS
    peak = float(max(np.abs(head).max(), np.abs(cyc).max()))
    scale = min(1.0, 10 ** (-1 / 20) / peak)
    head *= scale; cyc *= scale
    loop_asset = np.concatenate([cyc[Nper - G:], cyc, cyc[:G]]).astype(np.float32)
    assert np.isfinite(head).all() and np.isfinite(loop_asset).all()
    sf.write(d / 'head.wav', head, SR, subtype='FLOAT')
    sf.write(d / 'loop.wav', loop_asset, SR, subtype='FLOAT')
    # per-part RMS of the cycle (before the room) against SC-1's whole-render figures (a sanity check, not a target)
    parts = {k: {'rms': float(np.sqrt(np.mean(v ** 2))), 'sc1Rms': SC1[id]['rms'].get(k), 'gain': sc1_gains(id)[k]} for k, v in part_cycle.items()}
    for k, v in parts.items():
        v['sc1RmsAfterGain'] = v['sc1Rms'] * v['gain'] if v['sc1Rms'] else None
        v['dbVsSc1'] = 20 * math.log10(v['rms'] / v['sc1RmsAfterGain']) if v['sc1RmsAfterGain'] else None
    sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
    rep = {
        'songId': id, 'fingerprint': src['fingerprint'], 'sourceHead': src.get('head'), 'sampleRate': SR,
        'score': {'durationSec': D, 'loopStartSec': L, 'loopIdx': loop_idx, 'events': len(events), 'periodSec': P},
        'head': {'file': 'head.wav', 'frames': NH, 'playableStartFrame': Z, 'playableEndFrame': Z + fJ, 'joinSec': fJ / SR, 'leadSec': LEAD, 'guardSec': GUARD, 'eventsPlaced': in_head},
        'loop': {'file': 'loop.wav', 'frames': len(loop_asset), 'playableStartFrame': G, 'playableEndFrame': G + Nper, 'periodFrames': Nper, 'periodErrorPpm': ppm, 'eventsPlaced': in_cycle, 'eventsInRepeat': len(events) - loop_idx},
        'join': {'cycleFrame': h, 'settleSec': H, 'longestOverhangSec': over / SR, 'residualDb': join_db},
        'master': {'peakBeforeScale': peak, 'scale': scale, 'format': 'WAV float32, unfaded'},
        'parts': parts,
        'treatment': {'voices': 'SC-1 (rs1.py fork)', 'gains': 'SC-1 conversion logs', 'room': {'seconds': room_s, 'wet': wet}, 'filters': 'HP 32 Hz, LP 11 kHz (2nd-order Butterworth)'},
        'tools': {'fluidsynth': E.versionstr().decode(), 'soundFont': os.path.basename(E.SF2), 'soundFontSha256': sha(E.SF2), 'numpy': np.__version__, 'soundfile': sf.__version__},
        'elapsedSec': time.time() - t0,
    }
    assert in_cycle == len(events) - loop_idx, 'every event of the repeat placed once'
    (d / 'render.json').write_text(json.dumps(rep, indent=2))
    print(id, 'head', NH, 'loop', len(loop_asset), 'J', round(fJ / SR, 3), 'H', H, 'join', round(join_db, 1), 'dB', 'ppm', round(ppm, 3), 'peak', round(peak, 3), round(time.time() - t0, 1), 's', flush=True)
    return rep


if __name__ == '__main__':
    for id in sys.argv[1:] or ['snowbell', 'battle_keepers']:
        convert(id)
