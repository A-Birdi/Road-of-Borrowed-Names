"""RS-1 voices for the MT-1 Ensemble recordings (development tool; nothing here ships in the game).

Forked from SC-1's ensemble_rs1.py (the instrument treatment Robin auditioned) with three changes only:
 - the sample rate comes from RBN_SR (48000 for the production masters; SC-1 rendered at 44100);
 - FluidSynth's active-voice count is bound, so a note can be rendered on its own until it has died away;
 - SC-1's three supplied percussion strokes (native_percussion, from its render_conversion.py) live here too.
Sampled voices: TimGM6mb through the system libfluidsynth. Modal voices: SC-1's own. Not authentic instrument models;
the biwa is a modelled lute, not a recording.
"""
from __future__ import annotations
import ctypes as C, ctypes.util, hashlib, math, json, os
from pathlib import Path
import numpy as np
from scipy import signal
import soundfile as sf

SR=int(os.environ.get('RBN_SR','48000'))
SF2=os.environ.get('RBN_SOUNDFONT','/usr/share/sounds/sf2/TimGM6mb.sf2')
F=C.CDLL(os.environ.get('RBN_FLUIDSYNTH_LIBRARY') or ctypes.util.find_library('fluidsynth'))
def bind(n,restype,args):
 f=getattr(F,n);f.restype=restype;f.argtypes=args;return f
ptr=C.c_void_p;I=C.c_int;D=C.c_double;S=C.c_char_p
new_settings=bind('new_fluid_settings',ptr,[])
setnum=bind('fluid_settings_setnum',I,[ptr,S,D]);setint=bind('fluid_settings_setint',I,[ptr,S,I])
new_synth=bind('new_fluid_synth',ptr,[ptr]);delsynth=bind('delete_fluid_synth',None,[ptr]);delsettings=bind('delete_fluid_settings',None,[ptr])
sfload=bind('fluid_synth_sfload',I,[ptr,S,I]);program=bind('fluid_synth_program_select',I,[ptr,I,I,I,I])
noteon=bind('fluid_synth_noteon',I,[ptr,I,I,I]);noteoff=bind('fluid_synth_noteoff',I,[ptr,I,I])
cc=bind('fluid_synth_cc',I,[ptr,I,I,I]);bend=bind('fluid_synth_pitch_bend',I,[ptr,I,I])
writefloat=bind('fluid_synth_write_float',I,[ptr,I,ptr,I,I,ptr,I,I])
alloff=bind('fluid_synth_all_sounds_off',I,[ptr,I])
versionstr=bind('fluid_version_str',S,[])
active_voices=bind('fluid_synth_get_active_voice_count',I,[ptr])

# GM programs are zero-based. "shinobue_color" is a shaped piccolo sample,
# explicitly not a recording of a shinobue. "biwa" is an original modal lute.
VOICES={
 'flute':dict(gm=73,trim=.70,pan=-.08),
 'shakuhachi':dict(gm=77,trim=.74,pan=-.08),
 'shinobue_color':dict(gm=72,trim=.55,pan=-.07),
 'koto':dict(gm=107,trim=.82,pan=.16),
 'shamisen':dict(gm=106,trim=.80,pan=-.17),
 'harp':dict(gm=46,trim=.68,pan=.22),
 'celesta':dict(gm=8,trim=.41,pan=.26),
 'pizz':dict(gm=45,trim=.72,pan=.04),
 'cello':dict(gm=42,trim=.61,pan=-.18),
 'violin':dict(gm=40,trim=.60,pan=-.12),
 'strings':dict(gm=48,trim=.82,pan=.12),
 'slow_strings':dict(gm=49,trim=.62,pan=.12),
 'acoustic_bass':dict(gm=32,trim=.88,pan=0),
 'double_bass':dict(gm=43,trim=.67,pan=0),
 'horn':dict(gm=60,trim=.32,pan=.12),
 'biwa':dict(model='lute',trim=.40,pan=-.13),
 'koto_harmonic':dict(model='harmonic',trim=.32,pan=.20),
 'sho':dict(model='sho',trim=.15,pan=.20),
 'rin':dict(model='rin',trim=.28,pan=.20),
 'glass':dict(model='glass',trim=.18,pan=.25),
 'odaiko':dict(model='odaiko',trim=.47,pan=0),
 'shime':dict(model='shime',trim=.25,pan=.16),
 'clap':dict(model='clap',trim=.22,pan=-.24),
 'geta':dict(model='geta',trim=.19,pan=.20),
 'brush':dict(model='brush',trim=.12,pan=.25),
 'cymbal':dict(model='cymbal',trim=.18,pan=.15),
}

def seed(s):return int(hashlib.sha256(str(s).encode()).hexdigest()[:8],16)
def pan_gain(p):
 a=(np.clip(p,-1,1)+1)*math.pi/4
 return math.cos(a),math.sin(a)

def modal_note(kind,pitch,duration,velocity,salt):
 """Damped resonators / modal strings with smooth starts and releases."""
 rng=np.random.default_rng(seed(salt)); f=440*2**((pitch-69)/12)
 dur=min(duration+2.2,12); dur=max(.18,dur)
 if kind in ['odaiko','shime','clap','geta','brush','cymbal']:dur={'odaiko':1.6,'shime':.36,'clap':.16,'geta':.12,'brush':.24,'cymbal':2.2}[kind]
 n=int(dur*SR);t=np.arange(n,dtype=np.float64)/SR; x=np.zeros(n)
 if kind=='lute':
  # Modal plucked string, frequency-dependent losses; short bachi/body accent.
  tau=.82 if velocity<.72 else .91
  for k in range(1, min(42,int(15000/f))+1):
   amp=abs(math.sin(math.pi*k*.22))/(k**1.45)
   phase=2*math.pi*(f*k*(1+0.000035*k*k)*t+f*k*.0018*.03*(1-np.exp(-t/.03)))
   x+=amp*np.sin(phase)*np.exp(-t*(1+.060*k**1.35)/tau)
  x*=.57
  for ff,aa,tt in [(142,.17,.11),(285,.10,.08),(820,.07,.034)]:x+=aa*np.sin(2*math.pi*ff*t)*np.exp(-t/tt)
  click=signal.sosfilt(signal.butter(2,[550,2400],btype='bandpass',fs=SR,output='sos'),rng.normal(0,1,n))
  x+=click*(.09+.07*velocity)*np.exp(-t/.011)
  # A tiny, quickly damped upper buzz, not the old persistent 1.8 kHz band.
  buzz=sum(np.sin(2*math.pi*f*k*t)/k for k in range(8,17))
  x+=.038*buzz*np.exp(-t/.095)
  x*=1-np.exp(-t/.0014)
  if duration<1.8:x*=np.where(t<duration,1,np.exp(-(t-duration)/.16))
 elif kind=='harmonic':
  for k,a,dec in [(1,.72,1.8),(2,.29,1.0),(3,.08,.55),(4,.10,.8),(6,.035,.35)]:
   x+=a*np.sin(2*math.pi*f*k*t)*np.exp(-t/dec)
  x*=.42*(1-np.exp(-t/.003))
  x*=np.where(t<duration,1,np.exp(-(t-duration)/.5))
 elif kind in ['rin','glass']:
  modes=[(1,1,2),(2.76,.33,1.3),(5.2,.12,.68),(7.1,.028,.32)] if kind=='rin' else [(1,1,1.2),(2.005,.27,1.4),(3.98,.095,.72)]
  for r,a,dec in modes:
   if f*r<17000:
    x+=a*(np.sin(2*math.pi*f*r*t)+.32*np.sin(2*math.pi*(f*r+.72)*t))*np.exp(-t/dec)
  x*=.33*(1-np.exp(-t/.004))
 elif kind=='sho':
  env=(1-np.exp(-t/.28))*np.where(t<duration,1,np.exp(-(t-duration)/.36))
  for k in range(1,10):
   a=(.68 if k%2 else .20)/(k**1.4)
   x+=a*(np.sin(2*math.pi*f*k*t)+.3*np.sin(2*math.pi*(f*1.0019)*k*t+.25))
  x*=env*.24
 elif kind=='odaiko':
  base=f*.49
  for r,a,dec in [(1,1,.40),(1.59,.35,.20),(2.13,.19,.14),(2.62,.13,.10),(3.65,.065,.06)]:
   phase=2*math.pi*(base*r*t+base*r*.15*.026*(1-np.exp(-t/.026)))
   x+=a*np.sin(phase)*np.exp(-t/dec)
  slap=signal.sosfilt(signal.butter(2,1800,fs=SR,output='sos'),rng.normal(0,1,n))
  x=x*.48+slap*.25*np.exp(-t/.010)
  x*=1-np.exp(-t/.001)
 elif kind=='shime':
  for ff,a,dec in [(300,1,.054),(496,.36,.038),(701,.18,.024)]:x+=a*np.sin(2*math.pi*ff*t)*np.exp(-t/dec)
  xx=signal.sosfilt(signal.butter(2,[1400,6200],btype='bandpass',fs=SR,output='sos'),rng.normal(0,1,n))
  x=.31*x+.18*xx*np.exp(-t/.022);x*=1-np.exp(-t/.001)
 elif kind in ['clap','geta']:
  base=1450 if kind=='clap' else 640
  for r,a in [(1,.65),(1.62,.22),(2.39,.10)]:x+=a*np.sin(2*math.pi*base*r*t)*np.exp(-t/(.013 if kind=='clap' else .020))
  x*=.44*(1-np.exp(-t/.0007))
 elif kind=='brush':
  x=signal.sosfilt(signal.butter(2,[2500,6900],btype='bandpass',fs=SR,output='sos'),rng.normal(0,1,n))
  x*=.30*np.exp(-t/.055)*(1-np.exp(-t/.005))
 elif kind=='cymbal':
  x=signal.sosfilt(signal.butter(3,[2300,8500],btype='bandpass',fs=SR,output='sos'),rng.normal(0,1,n))
  x*=.23*np.exp(-t/.48)*(1-np.exp(-t/.012))
 # end fade to prevent truncated modal tails from clicking
 end=min(n//3,int(.05*SR));x[-end:]*=np.linspace(1,0,end)
 return (x*velocity).astype(np.float32)

class Fluid:
 def __init__(self):
  self.settings=new_settings();setnum(self.settings,b'synth.sample-rate',SR);setnum(self.settings,b'synth.gain',.46)
  setint(self.settings,b'synth.reverb.active',0);setint(self.settings,b'synth.chorus.active',0)
  setint(self.settings,b'synth.polyphony',256);setint(self.settings,b'synth.cpu-cores',1)
  self.s=new_synth(self.settings);self.id=sfload(self.s,SF2.encode(),0)
  if self.id<0:raise RuntimeError('sound bank unavailable')
 def setup(self,ch,voice):
  v=VOICES[voice];program(self.s,ch,self.id,0,v['gm']);cc(self.s,ch,7,100);cc(self.s,ch,11,110)
  cc(self.s,ch,10,int((v.get('pan',0)+1)*63.5));cc(self.s,ch,91,0);cc(self.s,ch,93,0)
 def render(self,events,total,roles):
  N=int((total)*SR);out=np.zeros((N,2),np.float32);es=[]
  for e in events:
   if 'gm' not in VOICES[e['voice']]:continue
   ch=roles[e['voice']];on=max(0,round(e['t']*SR));off=max(on+4,round((e['t']+e['d'])*SR))
   vel=int(np.clip(e['v']*VOICES[e['voice']]['trim']*112,1,118))
   es.extend([(on,1,ch,e['p'],vel),(off,0,ch,e['p'],0)])
  es.sort();pos=0
  for at,typ,ch,p,v in es+[(N,2,0,0,0)]:
   at=min(N,at)
   if at>pos:
    view=out[pos:at];base=view.ctypes.data_as(ptr);writefloat(self.s,len(view),base,0,2,base,1,2);pos=at
   if typ==1:noteon(self.s,ch,p,v)
   elif typ==0:noteoff(self.s,ch,p)
   if pos>=N:break
  return out
 def close(self):delsynth(self.s);delsettings(self.settings)

def room_ir(seconds,seedval):
 rng=np.random.default_rng(seedval);n=int(seconds*SR);t=np.arange(n)/SR;ir=np.zeros((n,2))
 for c in range(2):
  # Decorrelated, filtered diffusion. Normalize late impulse by energy.
  late=rng.normal(0,1,n)*np.exp(-t*6.9/seconds)
  late=signal.sosfilt(signal.butter(2,4800,fs=SR,output='sos'),late)
  late[:int(.038*SR)]=0
  late/=max(1e-8,np.sqrt(np.sum(late*late)))
  ir[:,c]=late*.55
  for delay,gain in [(0.027+c*.008,.31),(.057-c*.006,.22),(.093+c*.010,.14),(.141-c*.004,.09)]:
   ir[int(delay*SR),c]+=gain
 return ir.astype(np.float32)

def render_score(score,path):
 ev=score['events'];duration=score['duration'];total=duration+3.2
 voices=list(dict.fromkeys(e['voice'] for e in ev if 'gm'in VOICES[e['voice']]))
 if len(voices)>15:raise ValueError('too many simultaneous sampler voices')
 channels=[c for c in range(16) if c!=9];roles=dict(zip(voices,channels))
 f=Fluid()
 for v,ch in roles.items():f.setup(ch,v)
 audio=f.render(ev,total,roles);f.close()
 for ix,e in enumerate(ev):
  V=VOICES[e['voice']]
  if 'model'not in V:continue
  x=modal_note(V['model'],e['p'],e['d'],e['v'],score['id']+str(ix))*V['trim']*.20
  at=max(0,round(e['t']*SR));n=min(len(x),len(audio)-at)
  if n<=0:continue
  l,r=pan_gain(e.get('pan',V.get('pan',0)));audio[at:at+n,0]+=x[:n]*l;audio[at:at+n,1]+=x[:n]*r
 # remove infrasonic content; mellow the very top rather than flatten the dynamics
 audio=signal.sosfilt(signal.butter(2,32,fs=SR,btype='highpass',output='sos'),audio,axis=0).astype(np.float32)
 audio=signal.sosfilt(signal.butter(2,11000,fs=SR,btype='lowpass',output='sos'),audio,axis=0).astype(np.float32)
 # one coherent acoustic space, tuned in wetness/size for each region
 ir=room_ir(score.get('room',1.7),seed(score['region']))
 wet=np.zeros_like(audio)
 for c in range(2):wet[:,c]=signal.fftconvolve(audio[:,c]*.84+audio[:,1-c]*.16,ir[:,c])[:len(audio)]
 audio+=wet*score.get('wet',.17)
 # Tiny edge ramps; performed coda ends first, then its room is allowed to decay.
 n0=int(.012*SR);audio[:n0]*=np.linspace(0,1,n0)[:,None]
 nf=int(1.3*SR);audio[-nf:]*=np.linspace(1,0,nf)[:,None]
 peak=float(np.max(np.abs(audio)));rms=float(np.sqrt(np.mean(audio**2)))
 # Temporary headroom; delivery gain is measured separately with BS.1770.
 scale=min(1.,.82/max(peak,1e-10));audio*=scale
 sf.write(path,audio,SR,subtype='FLOAT')
 return {'rawPeak':peak,'rms':rms,'preMasterScale':scale,'sampleRate':SR,'frames':len(audio),'notes':len(ev),'sampledVoices':voices,'modeledVoices':sorted(set(e['voice']for e in ev if 'model'in VOICES[e['voice']]))}

def native_percussion(kind,vel,salt):
 """SC-1's kotsuzumi, otsuzumi and jingle strokes (render_conversion.py), unchanged but for the sample rate."""
 rng=np.random.default_rng(seed(salt));n=int(.95*SR);t=np.arange(n)/SR
 if kind=='kotsuzumi':
  phase=2*np.pi*(396*t+74*.05*(1-np.exp(-t/.05)))
  x=.31*np.sin(phase)*np.exp(-t/.14)+.045*np.sin(2*np.pi*1090*t)*np.exp(-t/.045)
  noise=signal.sosfilt(signal.butter(2,[900,3000],btype='bandpass',fs=SR,output='sos'),rng.normal(0,1,n))
  x+=.065*noise*np.exp(-t/.012)
 elif kind=='otsuzumi':
  noise=signal.sosfilt(signal.butter(2,[1800,5800],btype='bandpass',fs=SR,output='sos'),rng.normal(0,1,n))
  x=.19*noise*np.exp(-t/.026)+.075*np.sin(2*np.pi*1250*t)*np.exp(-t/.024)+.03*np.sin(2*np.pi*2900*t)*np.exp(-t/.012)
 else:
  x=np.zeros(n)
  for j,f in enumerate([2637,3322,3951,4699]):
   dt=t-j*.003;z=np.maximum(0,dt)
   x+=(dt>=0)*.055*np.sin(2*np.pi*f*(1+rng.uniform(-.003,.003))*z)*np.exp(-z/(.065+j*.017))
  x+=np.roll(x,int(.035*SR))*.62
 x*=1-np.exp(-t/.0015);m=int(.05*SR);x[-m:]*=np.linspace(1,0,m)
 return (x*vel).astype(np.float32)

class NoteSynth:
 """One sampled note at a time, from silence, on a 64-frame block boundary: the same event always renders to the same
 samples wherever it is placed (SC-1 shared one synth per part, so its onsets fell on that synth's block grid)."""
 BLOCK=64
 def __init__(self):
  self.f=Fluid();self.ch={}
 def run(self,n):
  a=np.zeros((n,2),np.float32);p=a.ctypes.data_as(ptr);writefloat(self.f.s,n,p,0,2,p,1,2);return a
 def channel(self,voice):
  # one channel per voice, set up once; its first note after the set-up renders slightly differently (measured),
  # so a throwaway note settles it before any note is kept
  if voice not in self.ch:
   ch=[c for c in range(16) if c!=9][len(self.ch)]
   self.f.setup(ch,voice);cc(self.f.s,ch,10,64);self.ch[voice]=ch
   self._play(ch,60,self.BLOCK*4,64,12.)
  return self.ch[voice]
 def note(self,voice,pitch,frames,velocity,max_tail=12.):
  ch=self.channel(voice)
  vel=int(np.clip(velocity*VOICES[voice]['trim']*112,1,127))
  return self._play(ch,pitch,frames,vel,max_tail)
 def _play(self,ch,pitch,frames,vel,max_tail):
  B=self.BLOCK;held=-(-max(4,frames)//B)*B;chunks=[];run=self.run
  noteon(self.f.s,ch,pitch,vel);chunks.append(run(held));noteoff(self.f.s,ch,pitch)
  tail=0;step=B*64
  while tail<max_tail*SR:
   a=run(step);chunks.append(a);tail+=step
   if active_voices(self.f.s)==0:break
  if active_voices(self.f.s):
   alloff(self.f.s,ch);run(B*16)  # (a cut tail: faded below, and flushed)
   x=np.concatenate(chunks);m=int(.05*SR);x[-m:]*=np.linspace(1,0,m)[:,None];return x
  x=np.concatenate(chunks)
  nz=np.nonzero(np.abs(x).max(axis=1)>1e-9)[0];end=(nz[-1]+1) if len(nz) else 1
  return x[:end]
 def close(self):self.f.close()
