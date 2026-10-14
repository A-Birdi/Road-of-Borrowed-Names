"""VA-2: the audio side of the casting samples (shared by va2_render.py and va2_gallery.py). Nothing here speaks: it
measures, trims, moves pitch, adds the supernatural treatments and sets the loudness of takes an engine made.

- clean_measure / trim: Robin, 2026-10-14: "lines need to not have trailing consonants or overly-breathy sounds that
  delay words in odd ways". A take's sound before its first voiced frame and its unvoiced tail after the last are
  measured (Praat pitch and intensity via parselmouth); va2_render.py makes a take again when either is too long, and
  every kept take is trimmed to its speech.
- pitch_shift: the player's High and Low are one take moved up or down with its formants kept (Praat's PSOLA "Change
  gender" with formant ratio 1), so the voice stays the same person.
- fx: the treatments for supernatural speakers, by preset id (the plan's `fx` table says what each is for).
- loudness: −20 LUFS integrated (pyloudnorm), peaks under −1 dBFS.
Requirements: numpy, scipy, soundfile, praat-parselmouth, pyloudnorm (pip, free).
"""
import math

import numpy as np
import scipy.signal as sig

SR = 48000
LUFS = -20.0
PEAK_DB = -1.0
MAX_PRE = 0.20   # s of sound before the first voiced frame
MAX_TAIL = 0.18  # s of unvoiced sound after the last voiced frame
KEEP_TAIL = 0.10  # unvoiced sound kept after the last voiced frame (a devoiced です)
PAD = 0.06


def to48k(x, sr):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr == SR:
        return x
    g = math.gcd(int(sr), SR)
    return sig.resample_poly(x, SR // g, int(sr) // g)


def _sound(x, sr=SR):
    import parselmouth
    return parselmouth.Sound(np.asarray(x, dtype=np.float64), sampling_frequency=sr)


def clean_measure(x, sr=SR):
    """Where the speech is: the first and last frames above the level floor, the first and last voiced frames, and
    from them the sound before the voice (`pre`) and the unvoiced tail (`tail`), in seconds."""
    snd = _sound(x, sr)
    dur = snd.get_total_duration()
    pitch = snd.to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=800)
    f0 = pitch.selected_array['frequency']
    pt = pitch.xs()
    voiced = pt[f0 > 0]
    inten = snd.to_intensity(minimum_pitch=60, time_step=0.01)
    iv = inten.values[0]
    it = inten.xs()
    if not len(iv) or not len(voiced):
        return {'duration': dur, 'voiced': False, 'pre': None, 'tail': None, 'start': 0.0, 'end': dur, 'firstVoiced': None, 'lastVoiced': None}
    floor = float(np.max(iv)) - 30.0
    act = it[iv > floor]
    start, end = float(act[0]), float(act[-1])
    fv, lv = float(voiced[0]), float(voiced[-1])
    return {'duration': dur, 'voiced': True, 'start': start, 'end': end, 'firstVoiced': fv, 'lastVoiced': lv,
            'pre': max(0.0, fv - start), 'tail': max(0.0, end - lv)}


def is_clean(m):
    return bool(m['voiced']) and m['pre'] <= MAX_PRE and m['tail'] <= MAX_TAIL


def trim(x, m, sr=SR):
    """Cut to the speech: PAD before the first sound (or the first voiced frame when the lead-in is too long), and after
    the last voiced frame at most KEEP_TAIL of unvoiced sound plus PAD; short fades at both ends."""
    if not m['voiced']:
        return np.asarray(x)
    s = m['start'] if m['pre'] <= MAX_PRE else m['firstVoiced']
    e = min(m['end'], m['lastVoiced'] + KEEP_TAIL)
    a, b = max(0, int((s - PAD) * sr)), min(len(x), int((e + PAD) * sr))
    y = np.array(x[a:b], dtype=np.float64)
    fi, fo = int(0.012 * sr), int(0.035 * sr)
    if len(y) > fi + fo:
        y[:fi] *= np.linspace(0, 1, fi)
        y[-fo:] *= np.linspace(1, 0, fo) ** 2
    return y


def pitch_shift(x, semitones, sr=SR, formant_ratio=1.0):
    """PSOLA pitch move with the formants kept (ratio 1) or moved by `formant_ratio`."""
    if not semitones and formant_ratio == 1.0:
        return np.asarray(x)
    from parselmouth.praat import call
    snd = _sound(x, sr)
    pitch = snd.to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=800)
    med = call(pitch, 'Get quantile', 0, 0, 0.5, 'Hertz')
    if not med or math.isnan(med):
        return np.asarray(x)
    out = call(snd, 'Change gender', 60, 800, formant_ratio, med * 2 ** (semitones / 12.0), 1.0, 1.0)
    y = out.values[0]
    if out.sampling_frequency != sr:
        y = to48k(y, out.sampling_frequency)
    return y


# ---- the supernatural treatments ------------------------------------------------------------------------------------
def _ir(rt, sr=SR, lp=None, hp=None, seed=7, predelay=0.015):
    """A synthetic reverb tail: decaying noise with RT60 `rt` seconds, optionally filtered."""
    rng = np.random.default_rng(seed)
    n = int(rt * 1.2 * sr)
    t = np.arange(n) / sr
    h = rng.standard_normal(n) * np.exp(-6.91 * t / rt)
    if lp:
        h = sig.sosfilt(sig.butter(2, lp, 'low', fs=sr, output='sos'), h)
    if hp:
        h = sig.sosfilt(sig.butter(2, hp, 'high', fs=sr, output='sos'), h)
    h /= np.sqrt(np.sum(h ** 2)) + 1e-12
    return np.concatenate([np.zeros(int(predelay * sr)), h])


def _verb(x, rt, wet, sr=SR, **kw):
    w = sig.fftconvolve(x, _ir(rt, sr, **kw))
    y = np.concatenate([x, np.zeros(len(w) - len(x))])
    return y * (1 - wet * 0.5) + w * wet


def _delay(x, ms, gain, sr=SR):
    d = int(ms / 1000 * sr)
    y = np.concatenate([x, np.zeros(d)])
    y[d:] += x * gain
    return y


def _mix(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[:len(p)] += p
    return out


def _vibrato(x, rate_hz, cents, sr=SR):
    depth = (2 ** (cents / 1200.0) - 1) / (2 * math.pi * rate_hz)  # seconds of delay swing for that pitch swing
    n = np.arange(len(x))
    d = (depth * sr) * (1 + np.sin(2 * math.pi * rate_hz * n / sr)) + 2
    idx = n - d
    i0 = np.clip(np.floor(idx).astype(int), 0, len(x) - 1)
    i1 = np.clip(i0 + 1, 0, len(x) - 1)
    f = idx - np.floor(idx)
    return x[i0] * (1 - f) + x[i1] * f


def _detune(x, cents, sr=SR):
    r = 2 ** (cents / 1200.0)
    n = int(len(x) / r)
    return np.interp(np.arange(n) * r, np.arange(len(x)), x)


def tail_trim(x, floor_db=-55.0, sr=SR):
    """Drop a reverb's tail once it is `floor_db` below the take's peak (a 50 ms fade at the cut)."""
    x = np.asarray(x, dtype=np.float64)
    if not len(x):
        return x
    env = np.abs(x)
    lim = np.max(env) * 10 ** (floor_db / 20)
    above = np.nonzero(env > lim)[0]
    end = min(len(x), int(above[-1]) + int(0.05 * sr)) if len(above) else len(x)
    y = x[:end].copy()
    fo = min(len(y), int(0.05 * sr))
    y[-fo:] *= np.linspace(1, 0, fo)
    return y


def fx(x, preset, sr=SR):
    x = np.asarray(x, dtype=np.float64)
    if not preset:
        return x
    return tail_trim(_fx(x, preset, sr), sr=sr)


def _fx(x, preset, sr=SR):
    if preset == 'echo_light':
        return _verb(_mix(x, _delay(x, 90, 0.32, sr), _delay(x, 180, 0.18, sr)), 0.45, 0.14, sr, lp=6000)
    if preset == 'hush':
        y = pitch_shift(x, -2, sr)
        sub = pitch_shift(x, -12, sr) * 0.13
        y = _mix(y, sub)
        y = sig.sosfilt(sig.butter(4, 4500, 'low', fs=sr, output='sos'), y)
        return _verb(y, 2.4, 0.34, sr, lp=2800, predelay=0.03)
    if preset == 'spirit':
        y = _mix(x, _delay(_detune(x, 9, sr), 13, 0.28, sr), _delay(_detune(x, -9, sr), 19, 0.28, sr))
        return _verb(y, 0.9, 0.26, sr, hp=500)
    if preset == 'ancient':
        y = pitch_shift(x, -1, sr, formant_ratio=0.93)
        return _verb(y, 3.0, 0.3, sr, lp=4000, predelay=0.04)
    if preset == 'hollow':
        y = sig.sosfilt(sig.butter(4, [300, 3400], 'band', fs=sr, output='sos'), x)
        return _verb(_mix(y, _delay(y, 70, 0.3, sr)), 0.35, 0.18, sr)
    if preset == 'ghost':
        return _verb(_vibrato(x, 0.5, 12, sr), 1.6, 0.32, sr, lp=5000)
    if preset == 'ember':
        k = 1.8
        sat = np.tanh(k * x / (np.max(np.abs(x)) + 1e-9)) / math.tanh(k) * np.max(np.abs(x))
        return _verb(0.5 * x + 0.5 * sat, 0.5, 0.15, sr, lp=7000)
    raise ValueError('unknown fx preset ' + preset)


# ---- loudness ---------------------------------------------------------------------------------------------------------
def level(x, sr=SR):
    """Set −20 LUFS integrated, then bring peaks under −1 dBFS (by gain only). Returns (y, measured dict)."""
    import pyloudnorm as pyln
    x = np.asarray(x, dtype=np.float64)
    meter = pyln.Meter(sr)
    pad = np.concatenate([x, np.zeros(max(0, int(0.5 * sr) - len(x)))])  # the meter needs ≥ 400 ms
    l0 = meter.integrated_loudness(pad)
    g = 10 ** ((LUFS - l0) / 20) if np.isfinite(l0) else 1.0
    y = x * g
    pk = np.max(np.abs(y)) if len(y) else 0
    lim = 10 ** (PEAK_DB / 20)
    if pk > lim:
        y *= lim / pk
    l1 = meter.integrated_loudness(np.concatenate([y, np.zeros(max(0, int(0.5 * sr) - len(y)))]))
    return y, {'lufs': round(float(l1), 2), 'peakDb': round(20 * math.log10(max(np.max(np.abs(y)), 1e-9)), 2), 'gainDb': round(20 * math.log10(max(g, 1e-9)), 2)}
