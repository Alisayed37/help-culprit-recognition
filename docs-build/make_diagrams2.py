from PIL import Image, ImageDraw, ImageFont
import math

FONTDIR = "C:/Windows/Fonts/"
def font(name, size):
    try: return ImageFont.truetype(FONTDIR + name, size)
    except Exception: return ImageFont.load_default()
F_T=font("arialbd.ttf",26); F_H=font("arialbd.ttf",19); F_B=font("arial.ttf",16); F_S=font("arial.ttf",14)

NAVY=(26,26,46); BLUE=(15,52,96); STEEL=(46,139,192); LIGHT=(213,232,240)
GREY=(90,100,120); DARK=(30,40,60); WHITE=(255,255,255)

def ctext(d, box, lines, fonts, fill):
    x0,y0,x1,y1=box
    tot=sum(f.getbbox(t)[3]-f.getbbox(t)[1]+5 for t,f in zip(lines,fonts))
    cy=(y0+y1)/2-tot/2
    for t,f in zip(lines,fonts):
        bb=f.getbbox(t); w=bb[2]-bb[0]; h=bb[3]-bb[1]
        d.text(((x0+x1)/2-w/2, cy-bb[1]), t, font=f, fill=fill); cy+=h+5

def text_c(d, cx, y, s, f, fill):
    bb=f.getbbox(s); d.text((cx-(bb[2]-bb[0])/2, y), s, font=f, fill=fill)

def arrow(d,p1,p2,color=GREY,width=3,dash=False):
    if dash:
        # dashed line
        x1,y1=p1; x2,y2=p2; dist=math.hypot(x2-x1,y2-y1); n=int(dist/10)
        for i in range(n):
            a=i/n; b=(i+0.5)/n
            d.line([(x1+(x2-x1)*a,y1+(y2-y1)*a),(x1+(x2-x1)*b,y1+(y2-y1)*b)],fill=color,width=width)
    else:
        d.line([p1,p2],fill=color,width=width)
    ang=math.atan2(p2[1]-p1[1],p2[0]-p1[0]); L=11
    d.polygon([p2,(p2[0]-L*math.cos(ang-0.4),p2[1]-L*math.sin(ang-0.4)),
               (p2[0]-L*math.cos(ang+0.4),p2[1]-L*math.sin(ang+0.4))],fill=color)

def actor(d, cx, cy, label):
    r=14
    d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=DARK,width=3)
    d.line([(cx,cy+r),(cx,cy+r+34)],fill=DARK,width=3)
    d.line([(cx-22,cy+r+12),(cx+22,cy+r+12)],fill=DARK,width=3)
    d.line([(cx,cy+r+34),(cx-18,cy+r+64)],fill=DARK,width=3)
    d.line([(cx,cy+r+34),(cx+18,cy+r+64)],fill=DARK,width=3)
    text_c(d,cx,cy+r+70,label,F_H,DARK)

# ================= Use-Case Diagram =================
W,H=1400,820
img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
text_c(d,W/2,24,"Use-Case Diagram",F_T,NAVY); d.line([(40,72),(W-40,72)],fill=STEEL,width=3)

actor(d,120,360,"Investigator")
actor(d,1290,360,"AI Service")

# system boundary
d.rounded_rectangle([330,110,1070,780],radius=16,outline=STEEL,width=3)
text_c(d,700,128,"Help Culprit Recognition System",F_H,BLUE)

usecases=[("Register / Login",230),("Manage Investigations",320),
          ("Manage Images",410),("Search by Text",500),
          ("Search by Image",590),("View Ranked Results",680)]
centers={}
for name,y in usecases:
    x0,x1=470,930
    d.ellipse([x0,y-30,x1,y+30],fill=LIGHT,outline=STEEL,width=2)
    text_c(d,700,y-10,name,F_B,DARK); centers[name]=(x0,700,x1,y)

# investigator associations
for name,y in usecases:
    d.line([(150,365),(470,y)],fill=GREY,width=2)
# AI service associations (to search + image mgmt indexing)
for name in ["Search by Text","Search by Image","Manage Images"]:
    y=dict(usecases)[name]
    d.line([(930,y),(1260,365)],fill=GREY,width=2)

# include note
text_c(d,700,742,"Search & Manage use cases require authentication (Login)",F_S,GREY)
img.save("usecase.png"); print("saved usecase.png")

# ================= Sequence Diagram (text search) =================
W,H=1480,820
img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img)
text_c(d,W/2,24,"Sequence Diagram - Text-to-Image Search",F_T,NAVY); d.line([(40,72),(W-40,72)],fill=STEEL,width=3)

lifelines=[("Investigator",150),("React UI",430),(".NET API",720),("Python AI",1010),("Vector Store",1320)]
top=120; bottom=780
for name,x in lifelines:
    d.rounded_rectangle([x-95,top,x+95,top+46],radius=8,fill=BLUE)
    text_c(d,x,top+13,name,F_H,WHITE)
    # dashed lifeline
    yy=top+46
    while yy<bottom:
        d.line([(x,yy),(x,min(yy+8,bottom))],fill=GREY,width=2); yy+=14

X={n:x for n,x in lifelines}
def msg(y,a,b,label,ret=False):
    arrow(d,(X[a],y),(X[b],y),DARK,2,dash=ret)
    mid=(X[a]+X[b])/2; bb=F_S.getbbox(label); w=bb[2]-bb[0]
    d.rectangle([mid-w/2-4,y-20,mid+w/2+4,y-4],fill=WHITE)
    text_c(d,mid,y-19,label,F_S,DARK)

def selfnote(y,x,label):
    bb=F_S.getbbox(label); w=bb[2]-bb[0]
    d.rectangle([x+8,y-12,x+8+w+12,y+14],fill=(245,248,252),outline=STEEL,width=1)
    d.text((x+14,y-8),label,font=F_S,fill=DARK)

y=210
msg(y,"Investigator","React UI","1: enter description + options"); y+=70
msg(y,"React UI",".NET API","2: POST /api/search/text  (JWT)"); y+=60
selfnote(y,720,"3: validate token, build request"); y+=60
msg(y,".NET API","Python AI","4: POST /api/search"); y+=60
msg(y,"Python AI","Vector Store","5: load {id}_{model}.pt"); y+=50
msg(y,"Vector Store","Python AI","6: image vectors + filenames",ret=True); y+=55
selfnote(y,1010,"7: encode text, normalize, similarity, top-5"); y+=60
msg(y,"Python AI",".NET API","8: top-5 matches (JSON)",ret=True); y+=55
msg(y,".NET API","React UI","9: SearchResult + percentages",ret=True); y+=55
msg(y,"React UI","Investigator","10: render ranked result grid",ret=True)
img.save("sequence.png"); print("saved sequence.png")
