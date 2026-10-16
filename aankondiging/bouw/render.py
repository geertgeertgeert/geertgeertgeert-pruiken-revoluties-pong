import json, subprocess, sys
S=sys.argv[1]; out=sys.argv[2]; G=S+"/build/png"
sz=json.load(open(G+"/sizes.json"))
def cx(n): return (1080-sz[n][0])//2
# name, t_in, t_out, x, y, animate_in
E=[("hook2",0,3.0,cx("hook2"),175,False),("hook1",0,3.0,cx("hook1"),270,False),
   ("c1",1.68,4.25,cx("c1"),1230,True),("c2",4.25,6.0,cx("c2"),1230,True),("c3",6.0,8.1,cx("c3"),1230,True),("c4",8.28,11.4,cx("c4"),1230,True),
   ("n1",12.05,16.8,60,1120,True),("n2",13.15,16.8,370,1270,True),
   ("title",21.30,35,cx("title"),880,True),("thema",25.72,35,440,1035,True),
   ("date",17.42,35,-10,1150,True),("time",18.60,35,1080-sz["time"][0]+15,1160,True),("place",19.66,35,cx("place"),1300,True),
   ("cta",29.0,35,10,190,True)]
args=["ffmpeg","-v","error","-y","-ss","0.167","-i",S+"/base.mp4","-i",S+"/build/vo_raw.wav"]
for e in E: args+=["-loop","1","-t","35","-i",f"{G}/{e[0]}.png"]
fc=[]; prev="0:v"
st=1/12
for i,(n,a,b,x,y,anim) in enumerate(E):
    k=i+2
    if anim:
        ye=f"if(lt(t\\,{a+st:.3f})\\,{y-34}\\,if(lt(t\\,{a+2*st:.3f})\\,{y-10}\\,{y}))"
        xe=f"if(lt(t\\,{a+st:.3f})\\,{x+8}\\,{x})"
    else: ye,xe=str(y),str(x)
    if b<35:  # stop-motion exit: lift 2 steps then gone
        ye=f"if(gt(t\\,{b-st:.3f})\\,{y-30}\\,{ye})"
    o=f"v{i}"
    fc.append(f"[{prev}][{k}:v]overlay=x='{xe}':y='{ye}':enable='between(t,{a},{b-0.001})':eval=frame[{o}]"); prev=o
fc.append("[1:a]highpass=f=80,acompressor=threshold=-26dB:ratio=3:attack=5:release=120:makeup=2,volume=VOLdB,alimiter=limit=0.82:level=false,aformat=channel_layouts=stereo[a]")
f=";".join(fc)
import re
def run(vol,o):
    a=args+["-filter_complex",f.replace("VOL",str(vol)),"-map",f"[{prev}]","-map","[a]","-c:v","libx264","-crf","17","-preset","medium","-pix_fmt","yuv420p","-r","30","-c:a","aac","-b:a","192k","-ar","48000","-movflags","+faststart","-t","34.8",o]
    subprocess.run(a,check=True)
vol=float(sys.argv[3]) if len(sys.argv)>3 else 0
run(vol,out)
