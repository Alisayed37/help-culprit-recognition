# -*- coding: utf-8 -*-
import re

SLIDE = "F:/GP/code/docs-build/poster_unpack/ppt/slides/slide1.xml"
xml = open(SLIDE, encoding="utf-8").read()
EMU = 914400 / 2.54  # per cm

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

# ---------- content ----------
INTRO = [
    "Eyewitness accounts are expressed in words, but the evidence is an unlabelled collection of photographs, and bridging the two by hand is slow, subjective, and impractical as the gallery grows.",
    "Help Culprit Recognition closes this “semantic gap” with a fine-tuned vision-language model (CLIP), letting an investigator retrieve suspects from a gallery either by typing a natural-language description or by submitting a reference photograph.",
    "Every photograph is ranked by how well it matches the query, and the strongest candidates are presented with interpretable percentage scores as leads for human review — a decision-support tool, not an automated identification.",
    "Objectives: (1) text- and image-driven retrieval; (2) a CLIP model specialized for facial attributes; (3) interpretable results; (4) a secure, multi-user application; (5) a rigorous evaluation of the fine-tuning.",
]
METHODS = [
    "Architecture: a React single-page interface, an ASP.NET Core 8 Web API, a MySQL database, and a dedicated Python FastAPI service running CLIP (ViT-B/32) on an NVIDIA GPU.",
    "Model: CLIP is fine-tuned on the CelebA dataset. Its 40 binary face attributes are converted into natural-language captions; transfer learning with partial layer freezing, the AdamW optimizer, and a symmetric contrastive loss then specializes the model.",
    "Retrieval: images and text are encoded into a shared 512-dimensional space; the gallery is ranked by cosine similarity (or Euclidean distance), and the top matches are returned with percentage scores.",
    "Evaluation: Recall@K — the fraction of queries whose correct image appears within the top K — measured identically on all nine training checkpoints over a 536-image set.",
]
RESULTS = [
    "Fine-tuning roughly doubles top-1 accuracy: Recall@1 rises from 3.73% (baseline) to 7.46%.",
    "Recall@1 peaks at epoch 6, then declines through epochs 7–8 — the clear onset of overfitting.",
    "Recall@5 reaches about 21% and Recall@10 about 31%, versus a random-chance Recall@1 of only 0.19%.",
    "Every fine-tuned checkpoint beats the pre-trained baseline on every metric.",
    "GPU inference (RTX 3060) encodes about 400 images per second, making large-gallery indexing practical.",
]
CONCL = [
    "The project delivers a complete, secure, multi-user forensic retrieval system driven by both text and image queries, with a fine-tuned CLIP model at its core.",
    "A rigorous evaluation on the project’s own checkpoints shows that fine-tuning doubles top-1 retrieval accuracy and identifies epoch 6 as the optimal stopping point before overfitting.",
    "The outcome is both a working system and defensible evidence of when and how much fine-tuning helps — a practical investigative aid that meaningfully reduces manual effort.",
]
BIB = [
    "[1] Radford et al. Learning Transferable Visual Models From Natural Language Supervision (CLIP). ICML, 2021.",
    "[2] Dosovitskiy et al. An Image is Worth 16x16 Words (ViT). ICLR, 2021.",
    "[3] Liu et al. Deep Learning Face Attributes in the Wild (CelebA). ICCV, 2015.",
    "[4] Vaswani et al. Attention Is All You Need. NeurIPS, 2017.",
]
FIG_CAP = "Figure 1. Recall@K versus fine-tuning epoch — the learning curve peaks at epoch 6."
TAB_CAP = "Table 1. Recall@K of the best checkpoints versus the pre-trained baseline."
FOOTER = "Help Culprit Recognition   ·   Graduation Project   ·   Department of Information Systems   ·   Ain Shams University   ·   2025 / 2026"

# ---------- helpers ----------
def make_para(template_p, text):
    """Clone a paragraph's formatting, set a single run's text."""
    pPr = re.search(r'<a:pPr.*?</a:pPr>|<a:pPr[^>]*/>', template_p, re.S)
    pPr_xml = pPr.group(0) if pPr else ""
    run = re.search(r'<a:r>.*?</a:r>', template_p, re.S)
    run_xml = run.group(0) if run else "<a:r><a:t></a:t></a:r>"
    run_xml = re.sub(r'<a:t>.*?</a:t>', "<a:t>%s</a:t>" % esc(text), run_xml, count=1, flags=re.S)
    end = re.search(r'<a:endParaRPr[^>]*/>|<a:endParaRPr.*?</a:endParaRPr>', template_p, re.S)
    end_xml = end.group(0) if end else ""
    return "<a:p>%s%s%s</a:p>" % (pPr_xml, run_xml, end_xml)

def set_paras(block, lines):
    body = re.search(r'<p:txBody>(.*)</p:txBody>', block, re.S).group(1)
    m = re.match(r'(.*?)(<a:p>.*</a:p>)(.*)', body, re.S)
    paras_block = m.group(2)
    template_p = re.search(r'<a:p>.*?</a:p>', paras_block, re.S).group(0)
    new_paras = "".join(make_para(template_p, ln) for ln in lines)
    return block.replace(paras_block, new_paras)

def off_of(block):
    o = re.search(r'<a:off x="(-?\d+)" y="(-?\d+)"/>', block)
    return (int(o.group(1)) / EMU, int(o.group(2)) / EMU) if o else (None, None)

# ---------- iterate shapes ----------
shapes = list(re.finditer(r'<p:sp>.*?</p:sp>', xml, re.S))
for mt in shapes:
    block = mt.group(0)
    runs = re.findall(r'<a:t>(.*?)</a:t>', block, re.S)
    first = runs[0] if runs else ""
    x, y = off_of(block)
    new = None
    if "Title of the Research Study" in first:
        nb = block
        nb = nb.replace("<a:t>Title of the Research Study</a:t>",
                        "<a:t>Help Culprit Recognition: AI-Powered Forensic Suspect Retrieval</a:t>")
        nb = nb.replace("<a:t>By:Students</a:t>",
                        "<a:t>By: Ali Sayed, Wasim Abdelhalem, Adel Ahmed, Mohamed Mowaffak, Ahmed Zayed</a:t>")
        nb = nb.replace("<a:t> Name</a:t>", "<a:t></a:t>")
        nb = re.sub(r'<a:t>Supervised by:.*?</a:t>',
                    "<a:t>Supervised by: Dr. Fatma Mohamed        Teaching Assistant: Shamia Abdallah Ahmed</a:t>",
                    nb, flags=re.S)
        new = nb
    elif "We hope you find this template" in first:
        new = set_paras(block, INTRO)
    elif first.startswith("XXXXX") or (first.startswith("XXXX") and first.isupper() and x and x > 34 and y and 38 < y < 46):
        new = set_paras(block, RESULTS)
    elif first.startswith("Xxxx") and x is not None and x < 33:
        new = set_paras(block, METHODS)           # left column -> Methods body
    elif first.startswith("Xxxx") and x is not None and x > 34 and y is not None and y < 84:
        new = set_paras(block, CONCL)             # right, upper -> Conclusions
    elif first.startswith("Xxxx") and x is not None and x > 34 and y is not None and y >= 84:
        new = set_paras(block, BIB)               # right, lower -> Bibliography
    elif first.startswith("Figure 1"):
        new = re.sub(r'<a:t>Figure 1.*?</a:t>', "<a:t>%s</a:t>" % esc(FIG_CAP), block, flags=re.S)
    elif first.startswith("Table I"):
        new = re.sub(r'<a:t>Table I.*?</a:t>', "<a:t>%s</a:t>" % esc(TAB_CAP), block, flags=re.S)
    elif "Order online" in first:
        new = re.sub(r'<a:t>Order online.*?</a:t>', "<a:t>%s</a:t>" % esc(FOOTER), block, flags=re.S)
    if new and new != block:
        xml = xml.replace(block, new)

open(SLIDE, "w", encoding="utf-8").write(xml)
# report
left = re.findall(r'<a:t>(.*?)</a:t>', xml, re.S)
print("Remaining placeholder-ish runs:")
for r in left:
    if r.startswith("Xxxx") or r.startswith("XXXX") or "template" in r or "megaprint" in r or "Order online" in r:
        print("  STILL:", r[:60])
print("done")
