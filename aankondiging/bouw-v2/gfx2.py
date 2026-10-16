import sys, json, random, os, math
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S=sys.argv[1]; U=sys.argv[2]; G=S+"/b2/png"; os.makedirs(G,exist_ok=True)
HEAD=S+"/fonts/ArchivoBlack-Regular.ttf"; TYPE=S+"/fonts/SpecialElite-Regular.ttf"
CREAM=(243,234,215); INK=(27,24,22); RED=(196,52,31)
M=40
def smooth_noise(h,w,sigma,seed):
    r=np.random.default_rng(seed).standard_normal((h,w)).astype(np.float32)
    n=cv2.GaussianBlur(r,(0,0),sigma); return n/(n.std()+1e-6)
def crease_field(h,w,seed):
    # ridged noise -> height field with sharp folds
    hf=sum(np.abs(smooth_noise(h,w,s,seed+i))*wt for i,(s,wt) in enumerate([(5,1.0),(11,0.8),(23,0.6)]))
    return -hf
def shade_from(H,k):
    gx=cv2.Sobel(H,cv2.CV_32F,1,0,ksize=3); gy=cv2.Sobel(H,cv2.CV_32F,0,1,ksize=3)
    return np.clip(1+k*(-0.7*gx-0.7*gy),0.55,1.35)
def strip(lines, paper=CREAM, ink=INK, pad=(30,18), seed=1, crease=0.0):
    rnd=random.Random(seed)
    fonts=[ImageFont.truetype(f,s) for _,f,s,_ in lines]
    d0=ImageDraw.Draw(Image.new("RGB",(10,10)))
    boxes=[d0.textbbox((0,0),t,font=fo) for (t,_,_,_),fo in zip(lines,fonts)]
    gap=10
    w=max(b[2]-b[0] for b in boxes)+2*pad[0]
    h=sum(b[3]-b[1] for b in boxes)+gap*(len(lines)-1)+2*pad[1]
    im=Image.new("RGBA",(w+2*M,h+2*M),(0,0,0,0))
    pts=[]; x=0
    while x<w: pts.append((M+x,M+rnd.uniform(-3,3))); x+=rnd.uniform(14,30)
    pts.append((M+w,M)); y=0
    while y<h: pts.append((M+w+rnd.uniform(-7,3),M+y)); y+=rnd.uniform(8,16)
    pts.append((M+w,M+h)); x=w
    while x>0: pts.append((M+x,M+h+rnd.uniform(-3,3))); x-=rnd.uniform(14,30)
    pts.append((M,M+h)); y=h
    while y>0: pts.append((M+rnd.uniform(-3,7),M+y)); y-=rnd.uniform(8,16)
    ImageDraw.Draw(im).polygon(pts,fill=paper+(255,))
    a=np.array(im).astype(np.float32)
    g=np.random.default_rng(seed).normal(0,4,a.shape[:2]).astype(np.float32)
    for c in range(3): a[...,c]=np.clip(a[...,c]+g,0,255)
    im=Image.fromarray(a.astype(np.uint8))
    d=ImageDraw.Draw(im); yy=M+pad[1]
    for (t,_,_,col),fo,b in zip(lines,fonts,boxes):
        d.text((M+pad[0]-b[0],yy-b[1]),t,font=fo,fill=col or ink); yy+=b[3]-b[1]+gap
    if crease:
        a=np.array(im).astype(np.float32); H=crease_field(a.shape[0],a.shape[1],seed+50)
        sh=shade_from(H,crease); a[...,:3]=np.clip(a[...,:3]*sh[...,None],0,255); im=Image.fromarray(a.astype(np.uint8))
    return im
def finish(im,rot):
    if rot: im=im.rotate(rot,resample=Image.BICUBIC,expand=True)
    al=im.split()[3]; sh=Image.new("RGBA",im.size,(0,0,0,0))
    sh.putalpha(al.point(lambda v:int(v*0.55)))
    sh=Image.composite(Image.new("RGBA",im.size,(0,0,0,255)),Image.new("RGBA",im.size,(0,0,0,0)),sh.split()[3].point(lambda v:v))
    sh=sh.filter(ImageFilter.GaussianBlur(7))
    out=Image.new("RGBA",im.size,(0,0,0,0)); out.alpha_composite(sh,(6,9)) if False else out.paste(sh,(6,9),sh)
    out.alpha_composite(im); return out
sizes={}
def add(name,lines,rot=0,**k):
    im=finish(strip(lines,**k),rot); im.save(f"{G}/{name}.png"); sizes[name]=im.size
# ---------- static strips ----------
add("hook2",[("leesclub van leesbevorderaars",TYPE,40,None)],paper=INK,ink=CREAM,rot=1.2,seed=4)
add("date",[("DINSDAG 24 NOVEMBER · 19:00",HEAD,52,CREAM)],paper=RED,rot=-0.8,seed=11)
C=[("c1",["Bijna 40 procent van de","Nederlandse 15-jarigen"],{}),
   ("c2",["dreigt laaggeletterd","van school te gaan."],{"hl":0}),
   ("c3",["Opnieuw scoren we ver onder","het Europese gemiddelde."],{}),
   ("c5",["En hoe krijg je ze","aan het lezen?"],{}),
   ("c6",["BookTokker die duizenden jongeren","terug naar het boek lokt,"],{}),
   ("c7",["gaat in gesprek met","de letterkundige"],{}),
   ("c8",["auteur van het boek","De spagaat,"],{}),
   ("c9",["die juist kritisch kijkt naar de","invloed van onder andere BookTok."],{}),
   ("c10",["Zodat jij morgen","vol inspiratie"],{}),
   ("c11",["en nieuwe moed","aan de slag kan."],{})]
rots=[0.8,-0.8,0.6,-0.7,0.7,-0.6,0.8,-0.5,0.6,-0.8]
for (n,ls,o),r,sd in zip(C,rots,range(20,40)):
    lines=[(t,TYPE,46,None) for t in ls]
    if n=="c2": lines=[("dreigt",TYPE,46,None),("LAAGGELETTERD",HEAD,56,RED),("van school te gaan.",TYPE,46,None)]
    add(n,lines,rot=r,seed=sd)
# callback of the title question: creased paper (the unfolded ball)
add("c4",[("KOMT HET NOG GOED MET ONZE",HEAD,46,None),("JONGEREN EN HET LEZEN?",HEAD,46,RED)],rot=-0.9,seed=3,crease=0.16)
add("end1",[("LEESCLUB VAN",HEAD,58,None),("LEESBEVORDERAARS",HEAD,58,None)],rot=0.8,seed=14)
add("end2",[("thema: ONTLEZING",TYPE,50,CREAM)],paper=INK,rot=-1.4,seed=15)
add("end3",[("Bibliotheek Utrecht Neude",TYPE,44,None)],rot=0.6,seed=13)
add("end4",[("Gratis,",TYPE,42,None),("wel reserveren",TYPE,42,RED)],rot=-2.5,seed=16)
add("nm",[("MARWA OMARI",HEAD,40,None)],rot=-2.0,seed=41)
add("nj",[("JEROEN DERA",HEAD,40,None)],rot=1.8,seed=42)
# ---------- face cut-outs ----------
def face(src,cx,cy,r,name,rot,seed,D=290):
    im=Image.open(src).convert("RGB").crop((cx-r,cy-r,cx+r,cy+r)).resize((D,D),Image.LANCZOS)
    B=12; tot=D+2*B; rnd=random.Random(seed)
    can=Image.new("RGBA",(tot+2*M,tot+2*M),(0,0,0,0))
    # torn paper ring
    pts=[]; n=90
    for i in range(n):
        ang=2*math.pi*i/n; rr=tot/2+rnd.uniform(-2.5,2.5)
        pts.append((M+tot/2+rr*math.cos(ang),M+tot/2+rr*math.sin(ang)))
    ImageDraw.Draw(can).polygon(pts,fill=CREAM+(255,))
    m=Image.new("L",(D,D),0); ImageDraw.Draw(m).ellipse((0,0,D-1,D-1),fill=255)
    can.paste(im,(M+B,M+B),m)
    out=finish(can,rot); out.save(f"{G}/{name}.png"); sizes[name]=out.size
face(U+"/ae809fe8-image.jpg",940,900,560,"fm",-3,51)
face(U+"/609fc0f2-image.webp",252,170,135,"fj",3,52)
# ---------- crumpled-ball hook (15 fps frame sequence) ----------
hook=strip([("KOMT HET NOG GOED",HEAD,70,None),("MET HET LEZEN?",HEAD,70,RED)],seed=3)
full=np.array(hook).astype(np.float32); FH,FW=full.shape[:2]
pw,ph=FW-2*M,FH-2*M
paper=full[M:M+ph, M:M+pw].copy()
Hs=crease_field(FH,FW,99); Sfull=shade_from(Hs,1.0)
CW,CH=1080,560; cx,cy=540,250
rng=np.random.default_rng(11)
NS=45
seeds_u=rng.uniform(0,pw,NS); seeds_v=rng.uniform(0,ph,NS)
off=rng.standard_normal((NS,2)); bri=rng.normal(1,0.28,NS); 
B=200
def frame(p,rot_deg):
    e=p; a=1-e
    if e>=1.0:
        im=Image.fromarray(np.clip(full*np.concatenate([np.repeat((1+(Sfull-1)*0.18)[...,None],3,2),np.ones((FH,FW,1),np.float32)],2),0,255).astype(np.uint8),"RGBA")
        im=im.rotate(rot_deg,resample=Image.BICUBIC,expand=True)
        can=Image.new("RGBA",(CW,CH),(0,0,0,0)); can.alpha_composite(im,(cx-im.size[0]//2,cy-im.size[1]//2)); return finish(can,0)
    sx=(B/pw)*(1-e)+e; sy=(B/ph)*(1-e)+e
    th=math.radians(rot_deg)
    X,Y=np.meshgrid(np.arange(CW,dtype=np.float32)-cx,np.arange(CH,dtype=np.float32)-cy)
    xr= math.cos(th)*X+math.sin(th)*Y; yr=-math.sin(th)*X+math.cos(th)*Y
    u=xr/sx+pw/2; v=yr/sy+ph/2
    # voronoi facets in paper space
    d=(u[...,None]-seeds_u)**2*(1.0)+((v[...,None]-seeds_v)*1.0)**2
    part=np.argpartition(d,1,axis=2)[...,:2]
    i1=part[...,0]; d1=np.take_along_axis(d,part[...,:1],2)[...,0]; d2=np.take_along_axis(d,part[...,1:2],2)[...,0]
    swap=d2<d1; i1=np.where(swap,part[...,1],i1); dd=np.abs(np.sqrt(d2)-np.sqrt(d1))
    uu=u+a*off[i1,0]*pw*0.13; vv=v+a*off[i1,1]*ph*0.35
    rgb=cv2.remap(paper,uu.astype(np.float32),vv.astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
    sres=cv2.remap(Sfull,(uu+M).astype(np.float32),(vv+M).astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT_101)
    shade=(1+(sres-1)*(0.18+0.6*a))*(1+(bri[i1]-1)*a)
    crease=np.clip(dd*sx/1.5,0,1); shade=shade*(1-0.45*a*(1-crease))
    rgb[...,:3]*=shade[...,None]
    # outline: noisy superellipse from ball to rectangle
    hx=pw*sx/2; hy=ph*sy/2; n=2+10*e**1.5
    ang=np.arctan2(yr,xr); wob=1+0.13*a*np.sin(5*ang+1.3)+0.07*a*np.sin(11*ang+0.4)
    r=(np.abs(xr/hx)**n+np.abs(yr/hy)**n)**(1/n)
    alpha=np.clip((wob-r)*min(hx,hy)/2,0,1)*255
    rgba=np.dstack([np.clip(rgb[...,:3],0,255),alpha])
    return finish(Image.fromarray(rgba.astype(np.uint8),"RGBA"),0)
steps=[0]*4+[0.06,0.14,0.25,0.38,0.52,0.65,0.77,0.87,0.94,0.98,1.0]
rots=[22]*4+[22-(22+1.5)*s for s in steps[4:]]
for i,(p,r) in enumerate(zip(steps,rots)):
    frame(p,r).save(f"{G}/hook_{i:02d}.png")
sizes["hook"]=(CW+0,CH)
json.dump({k:list(v) for k,v in sizes.items()},open(G+"/sizes.json","w"))
print(sizes)
