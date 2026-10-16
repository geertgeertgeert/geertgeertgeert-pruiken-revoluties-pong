import soundfile as sf, numpy as np, sys
S=sys.argv[1]
a,sr=sf.read(S+"/wav/C48.wav")
# (src_start, src_end, out_start)
cuts=[(11.20,17.44,1.60),(17.44,19.98,8.24),(20.80,24.36,12.00),(0.30,10.95,17.00),(24.36,25.90,29.00)]
out=np.zeros(int(35.0*sr))
f=int(0.015*sr)
for s,e,o in cuts:
    seg=a[int(s*sr):int(e*sr)].copy()
    r=np.linspace(0,1,f); seg[:f]*=r; seg[-f:]*=r[::-1]
    i=int(o*sr); out[i:i+len(seg)]+=seg
sf.write(S+"/build/vo_raw.wav",out,sr)
