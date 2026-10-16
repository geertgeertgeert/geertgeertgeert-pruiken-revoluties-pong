import json, subprocess, sys
S=sys.argv[1]; out=sys.argv[2]; G=S+"/b2/png"; T=37.0
sz=json.load(open(G+"/sizes.json"))
def cx(n): return (1080-sz[n][0])//2
CY=1230
# name, in, out, x, y, step-in
E=[("date",4.6,T,cx("date"),165,True),
   ("c1",1.45,4.67,cx("c1"),CY,True),("c2",4.67,8.6,cx("c2"),CY-20,True),("c3",8.69,11.6,cx("c3"),CY,True),
   ("c4",11.67,13.95,cx("c4"),CY,True),("c5",14.01,16.1,cx("c5"),CY,True),
   ("fm",16.12,T,-20,250,True),("nm",16.30,T,0,500,True),
   ("c6",17.29,19.73,cx("c6"),CY,True),("c7",19.73,21.75,cx("c7"),CY,True),
   ("fj",21.78,T,684,250,True),("nj",21.96,T,600,500,True),
   ("c8",23.25,24.87,cx("c8"),CY,True),("c9",24.87,28.0,cx("c9"),CY,True),
   ("c10",28.57,31.17,cx("c10"),CY,True),("c11",31.17,33.55,cx("c11"),CY,True),
   ("end1",33.65,T,cx("end1"),1000,True),("end2",34.25,T,470,1170,True),
   ("end3",34.85,T,cx("end3"),1310,True),("end4",35.45,T,20,1170,True)]
args=["ffmpeg","-v","error","-y","-ss","0.167","-i",S+"/base.mp4","-i",S+"/b2/mix.wav",
      "-framerate","15","-i",G+"/hook_%02d.png"]
for e in E: args+=["-loop","1","-t",str(T),"-i",f"{G}/{e[0]}.png"]
st=1/12
fc=["[0:v]tpad=stop_mode=clone:stop_duration=2.5,setpts=PTS-STARTPTS[b]",
    # hook: unfolds from paper ball (0-1.0 s), holds, lifts off at 4.4 s
    f"[2:v]setpts=PTS-STARTPTS[hk]",
    f"[b][hk]overlay=x=0:y='if(gt(t\\,4.32)\\,90\\,120)':enable='lt(t,4.4)':eof_action=repeat[h]"]
prev="h"
for i,(n,a,b,x,y,anim) in enumerate(E):
    k=i+3
    ye=f"if(lt(t\\,{a+st:.3f})\\,{y-34}\\,if(lt(t\\,{a+2*st:.3f})\\,{y-10}\\,{y}))" if anim else str(y)
    xe=f"if(lt(t\\,{a+st:.3f})\\,{x+8}\\,{x})" if anim else str(x)
    if b<T: ye=f"if(gt(t\\,{b-st:.3f})\\,{y-30}\\,{ye})"
    o=f"v{i}"
    fc.append(f"[{prev}][{k}:v]overlay=x='{xe}':y='{ye}':enable='between(t,{a},{b-0.001})':eval=frame[{o}]"); prev=o
args+=["-filter_complex",";".join(fc),"-map",f"[{prev}]","-map","1:a","-c:v","libx264","-crf","17","-preset","medium",
       "-pix_fmt","yuv420p","-r","30","-c:a","aac","-b:a","192k","-movflags","+faststart","-t",str(T),out]
subprocess.run(args,check=True)
