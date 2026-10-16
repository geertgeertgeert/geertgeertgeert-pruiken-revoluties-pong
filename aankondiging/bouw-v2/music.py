# Self-composed, royalty-free underscore: warm felt-piano + pad, 72 bpm, D major (Bm-G-D-A)
import numpy as np, soundfile as sf, sys
from scipy.signal import fftconvolve, butter, sosfilt
sr=48000; T=37.0; N=int(T*sr); L=np.zeros(N); R=np.zeros(N)
bpm=72; beat=60/bpm; bar=4*beat
def hz(m): return 440*2**((m-69)/12)
rng=np.random.default_rng(3)
def piano(m,t0,dur,vel,pan=0.0):
    n=int(min(dur+2.5,T-t0)*sr); 
    if n<=0: return
    t=np.arange(n)/sr; f=hz(m); y=np.zeros(n)
    for k in range(1,8):
        fk=f*k*np.sqrt(1+0.0004*k*k)
        y+=np.sin(2*np.pi*fk*t+rng.uniform(0,6))*(1/k**1.6)*np.exp(-t*(1.2+0.9*k)*(f/260)**0.3)
    y*=np.minimum(t/0.006,1)*vel
    rel=np.ones(n); i=int(dur*sr)
    if i<n: rel[i:]=np.exp(-(t[i:]-dur)*4)
    y*=rel; s=int(t0*sr)
    L[s:s+n]+=y*(1-pan)/2*2; R[s:s+n]+=y*(1+pan)/2*2
def pad(ms,t0,dur,vel):
    n=int(min(dur+1.5,T-t0)*sr); t=np.arange(n)/sr; y=np.zeros(n)
    for m in ms:
        for det in (-0.06,0.06):
            f=hz(m)*2**(det/12)
            for k in range(1,5): y+=np.sin(2*np.pi*f*k*t+rng.uniform(0,6))/k**2
    env=np.minimum(t/1.2,1)*np.where(t<dur,1,np.exp(-(t-dur)*2.5))
    y*=env*vel/len(ms); s=int(t0*sr); L[s:s+n]+=y; R[s:s+n]+=y*0.9
chords=[("Bm",[47,54,59,62,66]),("G",[43,50,55,59,62]),("D",[38,50,54,57,62]),("A",[45,52,57,61,64])]
prog=[0,1,2,3,0,1,2,3,1,3,2]   # 11 bars ≈ 36.7 s; ends on D
for b,ci in enumerate(prog):
    t0=b*bar; name,ns=chords[ci]
    last=(b==len(prog)-1)
    # bass from bar 2 on
    if b>=2: piano(ns[0]-12 if ns[0]>40 else ns[0],t0,bar*(1.6 if last else 0.95),0.32)
    # pad from bar 1
    if b>=1: pad(ns[1:4],t0,bar*(1.5 if last else 1.0),0.10 if b<4 else 0.13)
    # arpeggio (quarter notes), sparser at start
    pat=[1,3,4,3] if b>=1 else [1,3]
    for j,ix in enumerate(pat):
        tt=t0+j*beat*(4/len(pat))
        piano(ns[ix]+12,tt,beat*1.6,0.22 if b>0 else 0.16,pan=(-0.3 if j%2 else 0.3))
    if last: piano(ns[4]+12,t0+2*beat,bar,0.18,0.2)
# soft reverb
ir_t=np.arange(int(2.2*sr))/sr
for ch,seed in ((L,1),(R,2)):
    ir=np.random.default_rng(seed).standard_normal(len(ir_t))*np.exp(-ir_t*2.6); ir[0]=0
    wet=fftconvolve(ch,ir)[:N]*0.035; ch+=wet
sos=butter(2,6500,'low',fs=sr,output='sos'); L=sosfilt(sos,L); R=sosfilt(sos,R)
fade=np.ones(N); fn=int(2.5*sr); fade[-fn:]=np.linspace(1,0,fn)**1.5
out=np.stack([L*fade,R*fade],1); out/=np.abs(out).max()*1.2
sf.write(sys.argv[1],out,sr)
