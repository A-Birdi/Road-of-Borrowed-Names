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

MT-2 (every other song; the pilots render exactly as before, bit for bit):
  - instruments and strokes the pilots never used get the voices in MAP and PERC below (rs1.py lists them);
  - the per-part balance is measured, not SC-1's: each part is set to the Original part's K-weighted level over the
    first pass (stems.mjs measures the Original in Chromium; the same measure of the Ensemble part here), so the
    Original's balance carries over part by part; checked against SC-1's balance on the two pilots (render.json);
  - the room is chosen by kind of cue (ROOMS); a song with an echo (the score's `echo`, the tracks' `dl` sends) gets
    the Original's echo: the same delay, feedback, 2.6 kHz low-pass in the loop and mix, into the dry sound and the room;
  - a cue that does not loop (the prologue, the victory sting) is one file: the whole score and its decay, faded to
    silence in its guard;
  - repeated sampled notes are rendered once (rs1.NoteSynth cache), and the master is scaled to peak -1 dBFS.
"""
from pathlib import Path
import json, math, os, sys, time, hashlib
import numpy as np, soundfile as sf
from scipy import signal
import scipy.fft as sfft
sys.path.insert(0, str(Path(__file__).resolve().parent))
import rs1 as E

ROOT = Path(__file__).resolve().parents[3]
WORK = (ROOT / os.environ.get('RBN_MUSIC_WORK', 'tmp/music-ensemble')).resolve()
SR = E.SR
LEAD = 0.1  # head lead-in before score zero (covers the early jitter of a downbeat and a codec's first frames)
GUARD = 0.5  # seconds beyond each playable edge
OFFSET = 0.05  # the performance's score zero (export_events.mjs)
# SC-1's instrument assignment and per-part balance (qa/<id>_conversion.json: parts[].gain = measured balance x listed dB)
MAP = {'koto': 'koto', 'shakuhachi': 'shakuhachi', 'shamisen': 'shamisen', 'biwa_tale': 'biwa', 'biwa': 'biwa', 'bowed': 'cello', 'pad': 'slow_strings', 'bass': 'acoustic_bass',
       # MT-2, the lead's choice for the instruments the pilots never used (SC-1's voices where it had one)
       'sho': 'sho', 'shinobue': 'shinobue_color', 'glass': 'glass', 'flute': 'flute', 'celesta': 'celesta', 'harp': 'harp', 'rin': 'rin',
       'koto_oshi': 'koto', 'pluck': 'guitar', 'toll': 'tubular_bells', 'bell': 'tubular_bells', 'mallet': 'marimba', 'keys': 'epiano', 'choir': 'choir'}
PRESS = {'koto_oshi': 2}  # ato-oshi: semitones below the written note at the pluck (the game's koto_oshi)
PERC = {'z': ('odaiko', 47), 'e': ('shime', 62), 'm': ('kotsuzumi', 69), 'q': ('otsuzumi', 69), 'j': ('jingles', 90), 'i': ('rin', 86),
        # MT-2: SC-1's modal drums where they fit, TimGM6mb's kit for hand drums, wood and shakers, ports of the game's
        # own strokes where neither has the sound (a clock's tick, the Hush's glass tick, a water drop, a creak, a gong)
        'k': ('kit_kick', 0), 't': ('kit_conga_low', 0), 'l': ('odaiko', 44), 'o': ('odaiko', 47), 'n': ('kit_bongo_high', 0),
        's': ('kit_maracas', 0), 'b': ('brush', 60), 'w': ('kit_wood_low', 0), 'h': ('kit_wood_high', 0), 'r': ('kit_side_stick', 0),
        'p': ('kit_conga_mute', 0), 'x': ('clock', 0), 'g': ('glasstick', 0), 'd': ('drop', 0), 'c': ('creak', 0),
        'f': ('clap', 60), 'y': ('kit_claves', 0), 'a': ('atarigane', 0), 'v': ('kit_splash', 0)}
NATIVE = ('kotsuzumi', 'otsuzumi', 'jingles')
PORTED = ('clock', 'glasstick', 'drop', 'creak', 'atarigane')


def room_of(id):
    """SC-1's room for a pilot; otherwise by kind of cue: battles and bosses SC-1's battle room, the Snowbell songs
    its Snowbell room, everything else rs1's default (1.7 s, 0.17 wet)."""
    if id in SC1:
        return SC1[id]['room']
    if id.startswith(('battle', 'boss')):
        return SC1['battle_keepers']['room']
    if id == 'snowbell' or id.startswith('sb_'):
        return SC1['snowbell']['room']
    return (1.7, .17)
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


def raw_notes(id, score, events, synth):
    """Each first-pass event's sound before its part's gain (sampled: stereo; modal: mono, made stereo where used), its
    part, its reverb send and echo send, and its place in frames from the score's zero."""
    salt_j = {}
    out = []
    for e in events:
        tk = score['tracks'][e['tr']]
        mono = True
        if e.get('p'):
            voice, pitch = PERC[e['p']]
            if voice in NATIVE:
                x = E.native_percussion(voice, e['v'], f"{id}.{e['ix']}")
            elif voice in PORTED:
                x = E.ported_percussion(voice, e['v'], e.get('noiseSeed'), f"{id}.{e['ix']}")
            elif 'drum' in E.VOICES[voice]:
                at = round(e['t'] * SR); end = max(at + 4, round((e['t'] + e['d']) * SR))
                x = synth.note(voice, 0, end - at, e['v']); mono = False
            else:
                x = E.modal_note(E.VOICES[voice]['model'], pitch, e['d'], e['v'], f"{id}.{e['ix']}") * E.VOICES[voice]['trim'] * .20
        else:
            voice = MAP[e['i']]
            key = (e['tr'], e['i']); j = salt_j.get(key, 0); salt_j[key] = j + 1
            if 'gm' in E.VOICES[voice]:
                at = round(e['t'] * SR); end = max(at + 4, round((e['t'] + e['d']) * SR))
                x = synth.note(voice, e['m'], end - at, e['v'], press=PRESS.get(e['i'], 0)); mono = False
            else:
                x = E.modal_note(E.VOICES[voice]['model'], e['m'], e['d'], e['v'], f"{id}.{e['tr']}.{j}") * E.VOICES[voice]['trim'] * .20
        # the event's frame from the performance's score zero (SC-1 placed round(t * SR) with t including OFFSET)
        f = round(e['t'] * SR) - round(OFFSET * SR)
        out.append({'ix': e['ix'], 'track': tk['name'], 'voice': voice, 'frame': f, 'raw': x, 'mono': mono, 'n': len(x),
                    'pan': tk.get('pan', 0), 'send': min(1, tk.get('rv', .15) / .45), 'dl': tk.get('dl') or 0})
    return out


def sounding(n, gains):
    """A note as it sounds in the mix: its part's gain, then the pan (SC-1's arithmetic, so the pilots are unchanged)."""
    x = np.repeat(n['raw'][:, None], 2, axis=1) if n['mono'] else n['raw']
    x = x.astype(np.float32) * gains[n['track']]
    return x, pan_stereo(x, n['pan'])


def kweight(x):
    """BS.1770's K-weighting at SR (the same design as loudness.mjs)."""
    K = math.tan(math.pi * 1681.974450955533 / SR)
    Vh = 10 ** (3.999843853973347 / 20); Vb = Vh ** 0.4996667741545416; Q1 = 0.7071752369554196
    a0 = 1 + K / Q1 + K * K
    b1 = [(Vh + Vb * K / Q1 + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q1 + K * K) / a0]; a1 = [1, 2 * (K * K - 1) / a0, (1 - K / Q1 + K * K) / a0]
    K = math.tan(math.pi * 38.13547087602444 / SR); Q2 = 0.5003270373238773; a0 = 1 + K / Q2 + K * K
    b2 = [1, -2, 1]; a2 = [1, 2 * (K * K - 1) / a0, (1 - K / Q2 + K * K) / a0]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x))


def ensemble_levels(raw, nD):
    """Each part's K-weighted mean square over the first pass [0, D) at unit gain, mono ((L + R) / 2 before the pan, as
    stems.mjs taps the Original)."""
    out = {}
    for name in dict.fromkeys(n['track'] for n in raw):
        buf = np.zeros(nD)
        for n in raw:
            if n['track'] != name or n['frame'] >= nD:
                continue
            x = n['raw'] if n['mono'] else n['raw'].mean(axis=1)
            a = n['frame']; k0 = max(0, -a); m = min(len(x), nD - a)
            if m > k0:
                buf[a + k0:a + m] += x[k0:m]
        out[name] = float(np.mean(kweight(buf) ** 2))
    return out


def measured_gains(id, raw, nD):
    """Every part at the Original part's K-weighted level over the first pass (stems.json, from stems.mjs)."""
    f = WORK / id / 'stems.json'
    if not f.exists():
        return None, None
    st = json.loads(f.read_text())
    orig = {q['track']: q['kms'] for q in st['parts']}
    ens = ensemble_levels(raw, nD)
    gains, rep = {}, {}
    for name, ke in ens.items():
        ko = orig.get(name, 0)
        g = math.sqrt(ko / ke) if ke > 0 and ko > 0 else 0.0
        gains[name] = g
        rep[name] = {'originalKmsDb': 10 * math.log10(ko) if ko > 0 else None, 'ensembleUnitKmsDb': 10 * math.log10(ke) if ke > 0 else None, 'gain': g, 'gainDb': 20 * math.log10(g) if g > 0 else None}
    return gains, rep


def echo(x, delay, fb, mix, circular):
    """The Original's echo (20_sequencer.js): input -> delay -> 2.6 kHz low-pass (Web Audio's default Q, 1 dB) -> out
    (mix) and -> feedback (fb) -> delay. Applied exactly in the frequency domain: circularly (the steady cycle: the echo
    of an endless repeat) or linearly (zero-padded past its decay)."""
    M = round(delay * SR)
    n = len(x)
    N = n if circular else sfft.next_fast_len(n + 16 * M + 8192)
    w = 2 * math.pi * np.fft.rfftfreq(N)
    b, a = E._biquad('lowpass', 2600, 1)
    z = np.exp(-1j * w)
    H = (b[0] + b[1] * z + b[2] * z * z) / (a[0] + a[1] * z + a[2] * z * z) * np.exp(-1j * w * M)
    R = mix * H / (1 - fb * H)
    y = sfft.irfft(sfft.rfft(x, n=N, axis=0) * R[:, None], n=N, axis=0)[:n]
    return y


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
    pilot = id in SC1
    fD = round(D * SR)
    Z = round(LEAD * SR); G = round(GUARD * SR)
    synth = E.NoteSynth(cache=not pilot)
    raw = raw_notes(id, score, events, synth)
    synth.close()
    # the part balance: SC-1's for a pilot; measured against the Original's parts for every other song (and, for a pilot,
    # measured too, to compare the method with SC-1's balance)
    mgains, mrep = measured_gains(id, raw, fD)
    if pilot:
        gains = sc1_gains(id)
    else:
        assert mgains is not None, 'no stems.json: run stems.mjs first'
        gains = mgains
    room_s, wet = room_of(id)
    ir = E.room_ir(room_s, E.seed(id))
    ech = score.get('echo')
    ed = ech and any(n['dl'] for n in raw)
    edelay = min(1.9, max(0.05, (ech.get('beats') or 0.75) * 60 / score['bpm'])) if ed else None
    efb = min(0.7, max(0, ech.get('fb') or 0.3)) if ed else None
    emix = (ech.get('mix') or 0.3) if ed else None
    echo_tail = (edelay * math.log(1e-4) / math.log(efb) if efb > 0 else edelay) if ed else 0.0

    def place(NH, at0, sel):
        """The head: every selected note from silence, placed at its frame + at0, in [0, NH); echo, room, filters."""
        head = np.zeros((NH, 2), np.float32); hsend = np.zeros_like(head)
        hecho = np.zeros_like(head) if ed else None
        k = 0
        for n in raw:
            a = at0 + n['frame']
            if a >= NH or not sel(n):
                continue
            assert a >= 0, 'an event before the lead-in'
            _, y = sounding(n, gains)
            m = min(len(y), NH - a)
            head[a:a + m] += y[:m]; hsend[a:a + m] += y[:m] * n['send']
            if ed and n['dl']:
                hecho[a:a + m] += y[:m] * n['dl']
            k += 1
        if ed:
            e = echo(hecho.astype(np.float64), edelay, efb, emix, False).astype(np.float32)
            head += e; hsend += e
        return filters(room(head, hsend, ir, wet, False), False), k

    if not loop:
        # ---- a one-shot cue: one file, the whole score and its decay [ -LEAD, D + T ), then GUARD faded to silence
        over = max(0, max(n['frame'] + n['n'] for n in raw) - fD)
        T = math.ceil((over / SR + room_s + echo_tail + 1.0) * 2) / 2
        fE = fD + round(T * SR)
        NH = Z + fE + G
        head, in_head = place(NH, Z, lambda n: True)
        head[Z + fE:] *= np.linspace(1, 0, G, dtype=np.float32)[:, None]
        peak = float(np.abs(head).max())
        scale = 10 ** (-1 / 20) / peak
        head *= scale
        assert np.isfinite(head).all()
        sf.write(d / 'head.wav', head, SR, subtype='FLOAT')
        if (d / 'loop.wav').exists():
            (d / 'loop.wav').unlink()
        rep_head = {'file': 'head.wav', 'frames': NH, 'playableStartFrame': Z, 'playableEndFrame': Z + fE, 'endSec': fE / SR, 'tailSec': T, 'leadSec': LEAD, 'guardSec': GUARD, 'eventsPlaced': in_head}
        rep_loop, rep_join, in_cycle, part_cycle, ppm = None, None, None, {}, None
        assert in_head == len(events), 'every event placed once'
    else:
        P = D - L
        Nper = round(P * SR)
        ppm = (Nper / SR - P) / P * 1e6
        fL = round(L * SR)
        # the join: past the longest tail of the cycle before (and, for an introduction, of the introduction), the room
        # and (MT-2) the echo
        over = 0
        for n in raw:
            if n['ix'] >= loop_idx:
                over = max(over, (n['frame'] - fL) + n['n'] - Nper)  # a note of the cycle ringing into the next
            else:
                over = max(over, n['frame'] + n['n'] - fL)  # an introduction's note ringing into the repeat
        H = max(4.0, math.ceil((over / SR + room_s + echo_tail + 1.0) * 2) / 2)
        h = round(H * SR)
        fJ = fL + h
        assert fJ + G < fD, 'the join must fall inside the first pass'
        # ---- the head: the first pass from silence, [ -LEAD, J + GUARD )
        NH = Z + fJ + G
        head, in_head = place(NH, Z, lambda n: True)
        # ---- the steady cycle: every event of the repeat, modulo the period
        cyc = np.zeros((Nper, 2), np.float64); csend = np.zeros_like(cyc)
        cecho = np.zeros_like(cyc) if ed else None
        in_cycle = 0
        part_cycle = {}
        for n in raw:
            if n['ix'] < loop_idx:
                continue
            x, y = sounding(n, gains)
            mid = x.mean(axis=1)
            r = (n['frame'] - fL) % Nper
            y = y.astype(np.float64); k = 0
            pc = part_cycle.setdefault(n['track'], np.zeros(Nper))
            while k < len(y):
                m = min(len(y) - k, Nper - r)
                cyc[r:r + m] += y[k:k + m]; csend[r:r + m] += y[k:k + m] * n['send']
                if ed and n['dl']:
                    cecho[r:r + m] += y[k:k + m] * n['dl']
                pc[r:r + m] += mid[k:k + m]  # (the part before its pan, as SC-1 measured it)
                k += m; r = 0
            in_cycle += 1
        if ed:
            e = echo(cecho, edelay, efb, emix, True)
            cyc += e; csend += e
        cyc = filters(room(cyc, csend, ir, wet, True), True)
        # ---- the join check: past J the head and the cycle are the same music (phase h of the cycle)
        W = G
        a = head[Z + fJ - W: Z + fJ + G]; b = np.concatenate([cyc, cyc[:G]])[h - W: h + G]
        resid = float(np.sqrt(np.mean((a - b) ** 2))); level = float(np.sqrt(np.mean(b ** 2)))
        join_db = 20 * math.log10(max(resid, 1e-12) / max(level, 1e-12))
        # ---- one scale for both, peak -1 dBFS (a pilot as MT-1 did it: never louder than rendered)
        peak = float(max(np.abs(head).max(), np.abs(cyc).max()))
        scale = min(1.0, 10 ** (-1 / 20) / peak) if pilot else 10 ** (-1 / 20) / peak
        head *= scale; cyc *= scale
        loop_asset = np.concatenate([cyc[Nper - G:], cyc, cyc[:G]]).astype(np.float32)
        assert np.isfinite(head).all() and np.isfinite(loop_asset).all()
        sf.write(d / 'head.wav', head, SR, subtype='FLOAT')
        sf.write(d / 'loop.wav', loop_asset, SR, subtype='FLOAT')
        rep_head = {'file': 'head.wav', 'frames': NH, 'playableStartFrame': Z, 'playableEndFrame': Z + fJ, 'joinSec': fJ / SR, 'leadSec': LEAD, 'guardSec': GUARD, 'eventsPlaced': in_head}
        rep_loop = {'file': 'loop.wav', 'frames': len(loop_asset), 'playableStartFrame': G, 'playableEndFrame': G + Nper, 'periodFrames': Nper, 'periodErrorPpm': ppm, 'eventsPlaced': in_cycle, 'eventsInRepeat': len(events) - loop_idx}
        rep_join = {'cycleFrame': h, 'settleSec': H, 'longestOverhangSec': over / SR, 'residualDb': join_db}
        assert in_cycle == len(events) - loop_idx, 'every event of the repeat placed once'
    # per-part levels: a pilot's cycle (before the room) against SC-1's whole-render figures (a sanity check, not a
    # target) and the measured balance against SC-1's; every other song, the measured balance it was rendered with
    parts = {}
    for k in dict.fromkeys(n['track'] for n in raw):
        v = {'gain': gains.get(k)}
        if k in part_cycle:
            v['rms'] = float(np.sqrt(np.mean(part_cycle[k] ** 2)))
        if pilot:
            v['sc1Rms'] = SC1[id]['rms'].get(k)
            v['sc1RmsAfterGain'] = v['sc1Rms'] * v['gain'] if v['sc1Rms'] else None
            v['dbVsSc1'] = 20 * math.log10(v['rms'] / v['sc1RmsAfterGain']) if v['sc1RmsAfterGain'] and v.get('rms') else None
        if mrep and k in mrep:
            v['measured'] = mrep[k]
        parts[k] = v
    if pilot and mrep:
        # the method's check: measured gains against SC-1's, in dB, with their common offset removed (the overall level
        # is the trim's job)
        dd = {k: 20 * math.log10(mrep[k]['gain'] / gains[k]) for k in parts if mrep.get(k) and mrep[k]['gain'] > 0 and gains.get(k)}
        off = float(np.median(list(dd.values()))) if dd else 0.0
        balance_check = {'medianOffsetDb': off, 'perPartDb': {k: v - off for k, v in dd.items()}}
    else:
        balance_check = None
    sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
    rep = {
        'songId': id, 'fingerprint': src['fingerprint'], 'sourceHead': src.get('head'), 'sampleRate': SR,
        'score': {'durationSec': D, 'loop': loop, 'loopStartSec': L, 'loopIdx': loop_idx, 'events': len(events), 'periodSec': (D - L) if loop else None},
        'head': rep_head, 'loop': rep_loop, 'join': rep_join,
        'master': {'peakBeforeScale': peak, 'scale': scale, 'format': 'WAV float32, unfaded' if loop else 'WAV float32, its guard faded to silence'},
        'parts': parts, 'balanceCheckAgainstSc1': balance_check,
        'treatment': {'voices': 'SC-1 (rs1.py fork)' + ('' if pilot else ' and MT-2\'s additions'), 'instruments': {k: MAP[k] for k in dict.fromkeys(e['i'] for e in events if not e.get('p'))},
                      'percussion': {k: PERC[k][0] for k in dict.fromkeys(e['p'] for e in events if e.get('p'))},
                      'gains': 'SC-1 conversion logs' if pilot else 'measured: each part at the Original part\'s K-weighted level over the first pass (stems.mjs)',
                      'room': {'seconds': room_s, 'wet': wet}, 'echo': {'delaySec': edelay, 'feedback': efb, 'mix': emix} if ed else None,
                      'filters': 'HP 32 Hz, LP 11 kHz (2nd-order Butterworth)'},
        'tools': {'fluidsynth': E.versionstr().decode(), 'soundFont': os.path.basename(E.SF2), 'soundFontSha256': sha(E.SF2), 'numpy': np.__version__, 'soundfile': sf.__version__},
        'elapsedSec': time.time() - t0,
    }
    (d / 'render.json').write_text(json.dumps(rep, indent=2))
    print(id, 'head', rep_head['frames'], 'loop', rep_loop and rep_loop['frames'], 'J/E', round((rep_head['playableEndFrame'] - Z) / SR, 3), 'join', rep_join and round(rep_join['residualDb'], 1), 'ppm', ppm and round(ppm, 3), 'peak', round(peak, 3), round(time.time() - t0, 1), 's', flush=True)
    return rep


if __name__ == '__main__':
    for id in sys.argv[1:] or ['snowbell', 'battle_keepers']:
        convert(id)
