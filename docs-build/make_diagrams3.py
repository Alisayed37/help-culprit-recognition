from PIL import Image, ImageDraw, ImageFont
import math

FONTDIR = "C:/Windows/Fonts/"
def font(n,s):
    try: return ImageFont.truetype(FONTDIR+n,s)
    except Exception: return ImageFont.load_default()
F_T=font("arialbd.ttf",26); F_H=font("arialbd.ttf",18); F_B=font("arial.ttf",15); F_S=font("arial.ttf",13)

NAVY=(26,26,46); BLUE=(15,52,96); STEEL=(46,139,192); LIGHT=(213,232,240)
GREY=(90,100,120); DARK=(30,40,60); WHITE=(255,255,255); GREEN=(34,139,90); AMBER=(200,140,30)

def title(d,W,s):
    bb=F_T.getbbox(s); d.text((W/2-(bb[2]-bb[0])/2,24),s,font=F_T,fill=NAVY); d.line([(40,72),(W-40,72)],fill=STEEL,width=3)
def tc(d,cx,y,s,f,fill):
    bb=f.getbbox(s); d.text((cx-(bb[2]-bb[0])/2,y),s,font=f,fill=fill)
def ctext(d,box,lines,fonts,fill):
    x0,y0,x1,y1=box; tot=sum(f.getbbox(t)[3]-f.getbbox(t)[1]+5 for t,f in zip(lines,fonts)); cy=(y0+y1)/2-tot/2
    for t,f in zip(lines,fonts):
        bb=f.getbbox(t); tc(d,(x0+x1)/2,cy-bb[1],t,f,fill); cy+=bb[3]-bb[1]+5
def box(d,xy,fill,outline=STEEL,w=2,r=12): d.rounded_rectangle(xy,radius=r,fill=fill,outline=outline,width=w)
def arrow(d,p1,p2,color=GREY,width=3,dash=False,double=False):
    if dash:
        x1,y1=p1;x2,y2=p2;dist=math.hypot(x2-x1,y2-y1);n=max(int(dist/10),1)
        for i in range(n):
            a=i/n;b=(i+0.5)/n; d.line([(x1+(x2-x1)*a,y1+(y2-y1)*a),(x1+(x2-x1)*b,y1+(y2-y1)*b)],fill=color,width=width)
    else: d.line([p1,p2],fill=color,width=width)
    ang=math.atan2(p2[1]-p1[1],p2[0]-p1[0]);L=11
    d.polygon([p2,(p2[0]-L*math.cos(ang-0.4),p2[1]-L*math.sin(ang-0.4)),(p2[0]-L*math.cos(ang+0.4),p2[1]-L*math.sin(ang+0.4))],fill=color)
    if double:
        d.polygon([p1,(p1[0]+L*math.cos(ang-0.4),p1[1]+L*math.sin(ang-0.4)),(p1[0]+L*math.cos(ang+0.4),p1[1]+L*math.sin(ang+0.4))],fill=color)
def lbl(d,p1,p2,s):
    mx,my=(p1[0]+p2[0])/2,(p1[1]+p2[1])/2; bb=F_S.getbbox(s);w=bb[2]-bb[0]
    d.rectangle([mx-w/2-3,my-18,mx+w/2+3,my-2],fill=WHITE); tc(d,mx,my-17,s,F_S,DARK)

# ---------- Component Diagram ----------
W,H=1440,760; img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img); title(d,W,"Component Diagram")
comps=[(110,120,"React SPA",["LoginPage, DashboardPage","ImagesPage, SearchPage","apiClient (Axios)"]),
       (560,120,".NET 8 Web API",["Auth/Investigation/Image/","Search Controllers","User/Image/Search/Inv Services","EF Core DbContext"]),
       (1030,120,"Python AI Service",["FastAPI app","ModelManager (singleton)","Indexer / Search"]),
       (560,470,"MySQL Database",["Users, Investigations,","UploadedImages, ImageEmbeddings"]),
       (110,470,"File Storage",["InvestigationData/","/images static host"]),
       (1030,470,"Model & Vector Store",["CLIP checkpoints","{id}_{model}.pt vectors"])]
for x,y,name,items in comps:
    bw,bh=320,200; box(d,(x,y,x+bw,y+bh),LIGHT)
    # UML component icon
    d.rectangle([x+bw-44,y+14,x+bw-14,y+38],fill=WHITE,outline=STEEL,width=2)
    d.rectangle([x+bw-50,y+18,x+bw-38,y+24],fill=WHITE,outline=STEEL,width=2)
    d.rectangle([x+bw-50,y+28,x+bw-38,y+34],fill=WHITE,outline=STEEL,width=2)
    tc(d,x+bw/2,y+16,name,F_H,BLUE)
    yy=y+52
    for it in items:
        d.text((x+18,yy),it,font=F_S,fill=DARK); yy+=22
arrow(d,(430,200),(560,200),STEEL,2); lbl(d,(430,200),(560,200),"HTTPS/REST")
arrow(d,(880,210),(1030,210),STEEL,2); lbl(d,(880,210),(1030,210),"REST")
arrow(d,(720,320),(720,470),STEEL,2); lbl(d,(720,320),(720,470),"ADO/EF")
arrow(d,(1190,320),(1190,470),STEEL,2); lbl(d,(1190,320),(1190,470),"torch I/O")
arrow(d,(560,540),(430,540),STEEL,2); lbl(d,(560,540),(430,540),"serves")
img.save("component.png")

# ---------- Deployment Diagram ----------
W,H=1320,720; img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img); title(d,W,"Deployment Diagram")
def node(x,y,w,h,name,items,fill=(238,244,249)):
    d.rectangle([x,y,x+w,y+h],fill=fill,outline=DARK,width=2)
    d.rectangle([x,y,x+w,y+30],fill=BLUE); tc(d,x+w/2,y+7,name,F_H,WHITE)
    yy=y+44
    for it in items: d.text((x+16,yy),it,font=F_S,fill=DARK); yy+=24
node(80,120,360,200,"<<device>> Client Machine",["Web Browser","React SPA (localhost:5173)"])
node(520,110,360,250,"<<server>> Application Host",["ASP.NET Core 8 (Kestrel, :5011)","Python FastAPI (Uvicorn, :8000)","CLIP model checkpoints"])
node(960,150,300,170,"<<db>> Database Server",["MySQL 8.x (:3306)","ForensicDb schema"])
arrow(d,(440,210),(520,210),STEEL,3); lbl(d,(440,210),(520,210),"HTTP/JWT")
arrow(d,(880,220),(960,220),STEEL,3); lbl(d,(880,220),(960,220),"TCP 3306")
d.text((520,380),"Internal REST: .NET (:5011) <-> Python (:8000) on the same host",font=F_S,fill=GREY)
img.save("deployment.png")

# ---------- DFD Context + Level 1 ----------
W,H=1400,760; img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img); title(d,W,"Data Flow Diagram (Context & Level 1)")
# context
d.text((90,100),"Context (Level 0)",font=F_H,fill=BLUE)
d.rectangle([90,150,260,230],outline=DARK,width=2); ctext(d,(90,150,260,230),["Investigator"],[F_B],DARK)
d.ellipse([430,140,650,240],fill=LIGHT,outline=STEEL,width=2); ctext(d,(430,140,650,240),["Help Culprit","Recognition","System"],[F_B,F_B,F_B],DARK)
arrow(d,(260,178),(430,178),GREY,2); lbl(d,(260,178),(430,178),"query / images")
arrow(d,(430,205),(260,205),GREY,2,dash=True); lbl(d,(430,205),(260,205),"ranked results")
# level 1
d.text((90,300),"Level 1",font=F_H,fill=BLUE)
def proc(x,y,n,label):
    d.ellipse([x,y,x+170,y+90],fill=LIGHT,outline=STEEL,width=2); ctext(d,(x,y,x+170,y+90),[f"{n}",label],[F_S,F_B],DARK)
def store(x,y,label):
    d.rectangle([x,y,x+220,y+44],fill=(245,248,252),outline=DARK,width=2)
    d.line([(x+26,y),(x+26,y+44)],fill=DARK,width=2); d.text((x+34,y+12),label,font=F_S,fill=DARK)
d.rectangle([90,360,250,430],outline=DARK,width=2); ctext(d,(90,360,250,430),["Investigator"],[F_B],DARK)
proc(330,350,"1.0","Authenticate")
proc(330,470,"2.0","Manage Case & Images")
proc(640,350,"3.0","Index Images")
proc(640,470,"4.0","Search / Retrieve")
store(920,355,"D1 ForensicDb")
store(920,430,"D2 Image Files")
store(920,505,"D3 Vector Store")
arrow(d,(250,395),(330,390),GREY,2)
arrow(d,(250,405),(330,505),GREY,2)
arrow(d,(500,395),(920,377),GREY,2)
arrow(d,(500,505),(640,500),GREY,2)
arrow(d,(415,470),(415,440),GREY,2)
arrow(d,(810,395),(920,430),GREY,2)
arrow(d,(810,505),(920,520),GREY,2)
arrow(d,(810,505),(920,377),GREY,2,dash=True)
img.save("dfd.png")

# ---------- Class Diagram (domain + services) ----------
W,H=1460,820; img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img); title(d,W,"Class Diagram (Domain Model & Services)")
def cls(x,y,name,attrs,meths,w=260):
    hh=34; ah=20*len(attrs); mh=20*len(meths); h=hh+ah+mh+8
    d.rectangle([x,y,x+w,y+h],fill=WHITE,outline=STEEL,width=2)
    d.rectangle([x,y,x+w,y+hh],fill=BLUE); tc(d,x+w/2,y+8,name,F_H,WHITE)
    d.line([(x,y+hh),(x+w,y+hh)],fill=STEEL,width=1); yy=y+hh+4
    for a in attrs: d.text((x+10,yy),a,font=F_S,fill=DARK); yy+=20
    d.line([(x,yy+2),(x+w,yy+2)],fill=STEEL,width=1); yy+=8
    for m in meths: d.text((x+10,yy),m,font=F_S,fill=(40,90,60)); yy+=20
    return (x,y,x+w,y+h)
u=cls(80,120,"User",["+Id:int","+Username:string","+PasswordHash:string","+CreatedAt:DateTime"],["+Investigations"])
i=cls(80,400,"Investigation",["+Id:int","+Title:string","+Description:string","+UserId:int (FK)"],["+UploadedImages"])
im=cls(560,120,"UploadedImage",["+Id:int","+FileName:string","+FilePath:string","+InvestigationId:int (FK)"],["+Embeddings"])
em=cls(560,400,"ImageEmbedding",["+Id:int","+ModelVersion:string","+VectorData:string","+UploadedImageId:int (FK)"],[])
sv=cls(1040,120,"<<service>> Services",["IUserService","IInvestigationService","IImageService","ISearchService"],["business logic"],300)
ai=cls(1040,360,"<<py>> ModelManager",["+device","+models{}","+processor"],["+load_models()","+get_model()"],300)
# User 1..* Investigation (vertical, left column)
arrow(d,(180,262),(180,400),GREY,2); d.text((188,300),"1",font=F_S,fill=DARK); d.text((188,360),"*",font=F_S,fill=DARK)
# Investigation 1..* UploadedImage (diagonal)
arrow(d,(340,430),(560,250),GREY,2); d.text((420,360),"1 .. *",font=F_S,fill=DARK)
# UploadedImage 1..* ImageEmbedding (vertical, middle column)
arrow(d,(690,262),(690,400),GREY,2); d.text((700,320),"1 .. *",font=F_S,fill=DARK)
# Services use the domain model (dependency)
arrow(d,(820,180),(1040,180),GREY,2,dash=True); d.text((876,160),"<<uses>>",font=F_S,fill=DARK)
img.save("classdiagram.png")

# ---------- Activity Diagram: Search ----------
W,H=900,1020; img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img); title(d,W,"Activity Diagram - Search")
cx=450
d.ellipse([cx-16,100,cx+16,132],fill=DARK)
def act(y,s,fill=LIGHT):
    box(d,(cx-200,y,cx+200,y+54),fill); ctext(d,(cx-200,y,cx+200,y+54),[s],[F_B],DARK); return y+54
def dec(y,s):
    d.polygon([(cx,y),(cx+150,y+45),(cx,y+90),(cx-150,y+45)],fill=(255,244,224),outline=AMBER,width=2)
    ctext(d,(cx-150,y,cx+150,y+90),[s],[F_S],DARK); return y+90
def conn(y1,y2): arrow(d,(cx,y1),(cx,y2),GREY,3)
y=132; conn(y,160)
y=act(160,"Enter description / pick query image"); conn(y,y+26)
y2=act(y+26,"Adjust model, metric, attribute sliders"); conn(y2,y2+26)
yd=dec(y2+26,"Text or Image?")
# branch labels
d.text((cx+155,yd-70),"text",font=F_S,fill=DARK); d.text((cx-200,yd-70),"image",font=F_S,fill=DARK)
y3=act(yd+30,"Build expanded query / upload image"); conn(yd+90,yd+30) if False else conn(yd+90, yd+120)
ytmp=yd+120
y4=act(ytmp,"API forwards to Python AI service"); conn(y4,y4+26)
y5=act(y4+26,"Encode query, load vectors, similarity"); conn(y5,y5+26)
y6=act(y5+26,"Return top-5 with percentages"); conn(y6,y6+26)
y7=act(y6+26,"Render ranked result grid"); conn(y7,y7+26)
d.ellipse([cx-18,y7+26,cx+18,y7+62],outline=DARK,width=3); d.ellipse([cx-10,y7+34,cx+10,y7+54],fill=DARK)
img.save("activity_search.png")

# ---------- Sequence: Upload & Index ----------
W,H=1480,760; img=Image.new("RGB",(W,H),WHITE); d=ImageDraw.Draw(img); title(d,W,"Sequence Diagram - Image Upload & Indexing")
ll=[("Investigator",150),("React UI",420),(".NET API",720),("Python AI",1030),("Storage",1330)]
top=120;bot=700
for n,x in ll:
    box(d,(x-95,top,x+95,top+44),BLUE,BLUE); tc(d,x,top+13,n,F_H,WHITE)
    yy=top+44
    while yy<bot: d.line([(x,yy),(x,min(yy+8,bot))],fill=GREY,width=2); yy+=14
X={n:x for n,x in ll}
def m(y,a,b,s,ret=False):
    arrow(d,(X[a],y),(X[b],y),DARK,2,dash=ret); mid=(X[a]+X[b])/2;bb=F_S.getbbox(s);w=bb[2]-bb[0]
    d.rectangle([mid-w/2-3,y-19,mid+w/2+3,y-3],fill=WHITE); tc(d,mid,y-18,s,F_S,DARK)
def note(y,x,s):
    bb=F_S.getbbox(s);w=bb[2]-bb[0]; d.rectangle([x+8,y-12,x+8+w+12,y+14],fill=(245,248,252),outline=STEEL,width=1); d.text((x+14,y-8),s,font=F_S,fill=DARK)
y=200
m(y,"Investigator","React UI","1: select images, Upload");y+=58
m(y,"React UI",".NET API","2: POST /api/image/upload (JWT, multipart)");y+=52
note(y,720,"3: save files, insert UploadedImage rows");y+=52
m(y,".NET API","Storage","4: write image files");y+=46
m(y,".NET API","Python AI","5: POST /api/index");y+=50
note(y,1030,"6: per model: batch-encode, L2-normalize");y+=52
m(y,"Python AI","Storage","7: save {id}_{model}.pt");y+=50
m(y,"Python AI",".NET API","8: images_processed",True);y+=48
m(y,".NET API","React UI","9: success message",True);y+=46
m(y,"React UI","Investigator","10: 'Upload complete'",True)
img.save("seq_upload.png")
print("done diagrams3")
