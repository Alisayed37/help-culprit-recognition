from PIL import Image, ImageDraw, ImageFont

FONTDIR = "C:/Windows/Fonts/"
def font(name, size):
    try:
        return ImageFont.truetype(FONTDIR + name, size)
    except Exception:
        return ImageFont.load_default()

F_T  = font("arialbd.ttf", 26)   # title
F_H  = font("arialbd.ttf", 20)   # box header
F_B  = font("arial.ttf", 16)     # body
F_S  = font("arial.ttf", 14)     # small
F_L  = font("arial.ttf", 14)     # labels

NAVY   = (26, 26, 46)
BLUE   = (15, 52, 96)
STEEL  = (46, 139, 192)
CYAN   = (33, 212, 253)
LIGHT  = (213, 232, 240)
GREY   = (90, 100, 120)
DARK   = (30, 40, 60)
WHITE  = (255, 255, 255)

def center_text(d, box, lines, fonts, fill):
    x0, y0, x1, y1 = box
    total = sum(f.getbbox(t)[3]-f.getbbox(t)[1] + 6 for t, f in zip(lines, fonts))
    cy = (y0 + y1)/2 - total/2
    for t, f in zip(lines, fonts):
        bb = f.getbbox(t)
        w = bb[2]-bb[0]; h = bb[3]-bb[1]
        d.text(((x0+x1)/2 - w/2, cy - bb[1]), t, font=f, fill=fill)
        cy += h + 6

def box(d, xy, fill, outline=None, width=2, radius=14):
    d.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline or fill, width=width)

def arrow(d, p1, p2, color=GREY, width=3, label=None, lf=F_L):
    d.line([p1, p2], fill=color, width=width)
    import math
    ang = math.atan2(p2[1]-p1[1], p2[0]-p1[0])
    L=12
    d.polygon([p2,
               (p2[0]-L*math.cos(ang-0.4), p2[1]-L*math.sin(ang-0.4)),
               (p2[0]-L*math.cos(ang+0.4), p2[1]-L*math.sin(ang+0.4))], fill=color)
    if label:
        mx,my=(p1[0]+p2[0])/2,(p1[1]+p2[1])/2
        bb=lf.getbbox(label); w=bb[2]-bb[0]
        d.rectangle([mx-w/2-4,my-12,mx+w/2+4,my+10], fill=WHITE)
        d.text((mx-w/2,my-9),label,font=lf,fill=DARK)

# =========================================================
# Diagram 1: System Architecture
# =========================================================
W,H = 1500, 1000
img = Image.new("RGB",(W,H),WHITE)
d = ImageDraw.Draw(img)
d.text((W/2-300,24),"System Architecture Overview",font=F_T,fill=NAVY)
d.line([(40,72),(W-40,72)],fill=STEEL,width=3)

# Client tier
box(d,(120,120,420,300),LIGHT,STEEL,2)
center_text(d,(120,120,420,165),["PRESENTATION TIER"],[F_S],BLUE)
box(d,(150,175,390,285),WHITE,STEEL,2)
center_text(d,(150,175,390,285),
    ["React + Vite SPA","(Browser, port 5173)","Login / Dashboard","Images / Search UI"],
    [F_H,F_S,F_B,F_B],DARK)

# Application tier
box(d,(600,120,900,300),LIGHT,STEEL,2)
center_text(d,(600,120,900,165),["APPLICATION TIER"],[F_S],BLUE)
box(d,(630,175,870,285),WHITE,STEEL,2)
center_text(d,(630,175,870,285),
    [".NET 8 Web API","(port 5011)","JWT Auth, Controllers,","Services, EF Core"],
    [F_H,F_S,F_B,F_B],DARK)

# Data tier
box(d,(600,620,900,820),LIGHT,STEEL,2)
center_text(d,(600,620,900,665),["DATA TIER"],[F_S],BLUE)
box(d,(630,675,870,805),WHITE,STEEL,2)
center_text(d,(630,675,870,805),
    ["MySQL 8.x","Database: ForensicDb","Users, Investigations,","Images, Embeddings"],
    [F_H,F_S,F_B,F_B],DARK)

# AI microservice
box(d,(1080,120,1400,420),(235,245,250),STEEL,2)
center_text(d,(1080,120,1400,165),["AI MICROSERVICE"],[F_S],BLUE)
box(d,(1110,175,1370,285),WHITE,STEEL,2)
center_text(d,(1110,175,1370,285),
    ["Python FastAPI","(port 8000)","CLIP inference,","indexing & search"],
    [F_H,F_S,F_B,F_B],DARK)
box(d,(1110,300,1370,405),WHITE,GREY,2)
center_text(d,(1110,300,1370,405),
    ["Fine-tuned CLIP","ViT-B/32 checkpoints","epoch_0/3/8"],
    [F_B,F_S,F_S],DARK)

# Vector store
box(d,(1080,620,1400,820),(235,245,250),STEEL,2)
center_text(d,(1080,620,1400,665),["VECTOR STORE"],[F_S],BLUE)
box(d,(1110,675,1370,805),WHITE,GREY,2)
center_text(d,(1110,675,1370,805),
    ["Per-investigation","tensor files (.pt)","{id}_{model}.pt","512-dim embeddings"],
    [F_B,F_S,F_S,F_S],DARK)

# Image storage
box(d,(120,620,420,820),(235,245,250),STEEL,2)
center_text(d,(120,620,420,665),["FILE STORAGE"],[F_S],BLUE)
box(d,(150,675,390,805),WHITE,GREY,2)
center_text(d,(150,675,390,805),
    ["InvestigationData/","{id}/images/*.jpg","served as /images"],
    [F_B,F_S,F_S],DARK)

# Arrows
arrow(d,(420,230),(600,230),STEEL,3,"HTTPS / REST + JWT")
arrow(d,(750,300),(750,620),STEEL,3,"EF Core")
arrow(d,(900,210),(1080,210),STEEL,3,"REST (index/search)")
arrow(d,(1240,420),(1240,620),GREY,3,"torch.load / save")
arrow(d,(630,760),(420,760),GREY,3,"serves /images")

img.save("arch.png")
print("saved arch.png")

# =========================================================
# Diagram 2: Entity-Relationship Diagram
# =========================================================
W,H = 1400, 760
img = Image.new("RGB",(W,H),WHITE)
d = ImageDraw.Draw(img)
d.text((W/2-150,24),"Entity-Relationship Diagram",font=F_T,fill=NAVY)
d.line([(40,72),(W-40,72)],fill=STEEL,width=3)

def entity(d, x, y, title, rows, w=300):
    hh=44; rh=30; h=hh+rh*len(rows)
    box(d,(x,y,x+w,y+h),WHITE,STEEL,2,radius=10)
    d.rounded_rectangle((x,y,x+w,y+hh),radius=10,fill=BLUE)
    d.rectangle((x,y+hh-12,x+w,y+hh),fill=BLUE)
    bb=F_H.getbbox(title); tw=bb[2]-bb[0]
    d.text((x+w/2-tw/2,y+10),title,font=F_H,fill=WHITE)
    for i,(col,key) in enumerate(rows):
        ry=y+hh+i*rh
        if i>0: d.line([(x,ry),(x+w,ry)],fill=(225,230,238),width=1)
        f=F_B
        label=col
        d.text((x+14,ry+6),label,font=f,fill=DARK)
        if key:
            bb=F_S.getbbox(key); kw=bb[2]-bb[0]
            d.text((x+w-kw-12,ry+8),key,font=F_S,fill=STEEL)
    return (x,y,x+w,y+h)

u = entity(d,80,130,"User",
    [("Id","PK"),("Username (unique)",""),("PasswordHash (BCrypt)",""),("CreatedAt","")])
i = entity(d,540,120,"Investigation",
    [("Id","PK"),("Title",""),("Description",""),("CreatedAt",""),("UserId","FK")])
im = entity(d,1000,110,"UploadedImage",
    [("Id","PK"),("FileName",""),("FilePath",""),("UploadedAt",""),("InvestigationId","FK")])
em = entity(d,540,470,"ImageEmbedding",
    [("Id","PK"),("ModelVersion",""),("VectorData",""),("UploadedImageId","FK")])

def crow(d,p1,p2,label):
    arrow(d,p1,p2,GREY,3,label,F_S)

crow(d,(380,200),(540,200),"1 .. *")
crow(d,(840,190),(1000,190),"1 .. *")
crow(d,(1110,290),(720,470),"1 .. *")

d.text((90,640),"Cascade delete: User -> Investigation -> UploadedImage -> ImageEmbedding",font=F_B,fill=GREY)
img.save("er.png")
print("saved er.png")
