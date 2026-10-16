import sys, json, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S=sys.argv[1]; G=S+"/build/png"; import os; os.makedirs(G,exist_ok=True)
HEAD=S+"/fonts/ArchivoBlack-Regular.ttf"; TYPE=S+"/fonts/SpecialElite-Regular.ttf"
CREAM=(243,234,215); INK=(27,24,22); RED=(196,52,31)
def strip(name, lines, paper=CREAM, ink=INK, rot=0.0, pad=(30,18), seed=1, maxw=None):
    """lines: list of (text, font, size, color or None)"""
    rnd=random.Random(seed)
    fonts=[ImageFont.truetype(f,s) for _,f,s,_ in lines]
    d0=ImageDraw.Draw(Image.new("RGB",(10,10)))
    boxes=[d0.textbbox((0,0),t,font=fo) for (t,_,_,_),fo in zip(lines,fonts)]
    gap=10
    w=max(b[2]-b[0] for b in boxes)+2*pad[0]
    h=sum(b[3]-b[1] for b in boxes)+gap*(len(lines)-1)+2*pad[1]
    M=40
    im=Image.new("RGBA",(w+2*M,h+2*M),(0,0,0,0))
    # torn paper polygon
    pts=[]
    x=0
    while x<w: pts.append((M+x,M+rnd.uniform(-3,3))); x+=rnd.uniform(14,30)
    pts.append((M+w,M))
    y=0
    while y<h: pts.append((M+w+rnd.uniform(-7,3),M+y)); y+=rnd.uniform(8,16)
    pts.append((M+w,M+h))
    x=w
    while x>0: pts.append((M+x,M+h+rnd.uniform(-3,3))); x-=rnd.uniform(14,30)
    pts.append((M,M+h))
    y=h
    while y>0: pts.append((M+rnd.uniform(-3,7),M+y)); y-=rnd.uniform(8,16)
    sh=Image.new("RGBA",im.size,(0,0,0,0)); ImageDraw.Draw(sh).polygon([(px+6,py+9) for px,py in pts],fill=(0,0,0,140))
    sh=sh.filter(ImageFilter.GaussianBlur(7)); im.alpha_composite(sh)
    pap=Image.new("RGBA",im.size,(0,0,0,0)); dp=ImageDraw.Draw(pap); dp.polygon(pts,fill=paper+(255,))
    # paper grain
    px=pap.load()
    for _ in range(w*h//18):
        gx,gy=rnd.randrange(M,M+w),rnd.randrange(M,M+h)
        if px[gx,gy][3]: c=px[gx,gy]; k=rnd.randint(-14,6); px[gx,gy]=(max(0,c[0]+k),max(0,c[1]+k),max(0,c[2]+k),255)
    im.alpha_composite(pap)
    d=ImageDraw.Draw(im); yy=M+pad[1]
    for (t,_,_,col),fo,b in zip(lines,fonts,boxes):
        d.text((M+pad[0]-b[0],yy-b[1]),t,font=fo,fill=col or ink); yy+=b[3]-b[1]+gap
    if rot: im=im.rotate(rot,resample=Image.BICUBIC,expand=True)
    im.save(f"{G}/{name}.png"); return im.size
specs={}
def add(name,*a,**k): specs[name]=strip(name,*a,**k)
# hook (frame 0 = cover)
add("hook1",[("KOMT HET NOG GOED",HEAD,70,None),("MET HET LEZEN?",HEAD,70,RED)],rot=-1.5,seed=3)
add("hook2",[("leesclub van leesbevorderaars",TYPE,40,None)],paper=INK,ink=CREAM,rot=1.2,seed=4)
# captions (problem part)
add("c1",[("Opnieuw blijken Nederlandse",TYPE,46,None),("scholieren namelijk onderaan",TYPE,46,None)],rot=0.8,seed=5)
add("c2",[("de Europese ranglijst",TYPE,46,None),("te bungelen",TYPE,46,None)],rot=-0.8,seed=6)
add("c3",[("als het gaat om hun",TYPE,46,None),("LEESVAARDIGHEID",HEAD,56,RED)],rot=0.6,seed=7)
add("c4",[("Komt het nog goed met het",TYPE,46,None),("lezen van onze jongeren?",TYPE,46,None)],rot=-0.7,seed=8)
# names
add("n1",[("MARWA OMARI",HEAD,58,None),("BookTokker",TYPE,40,RED)],rot=-1.2,seed=9)
add("n2",[("JEROEN DERA",HEAD,58,None),("universitair hoofddocent",TYPE,38,RED),("Nederlandse Letterkunde",TYPE,38,RED)],rot=1.0,seed=10)
# logistics stack
add("date",[("24 NOVEMBER",HEAD,62,CREAM)],paper=RED,rot=-2.0,seed=11)
add("time",[("19.00 UUR",HEAD,62,None)],rot=1.5,seed=12)
add("place",[("Bibliotheek Neude · Collegezaal",TYPE,42,None)],rot=-0.6,seed=13)
add("title",[("LEESCLUB VAN",HEAD,60,None),("LEESBEVORDERAARS",HEAD,60,None)],rot=0.8,seed=14)
add("thema",[("thema: ONTLEZING",TYPE,50,CREAM)],paper=INK,rot=-1.4,seed=15)
add("cta",[("Gratis,",TYPE,44,None),("wel reserveren",TYPE,44,RED)],rot=-2.5,seed=16)
json.dump(specs,open(G+"/sizes.json","w"),indent=0); print(specs)
