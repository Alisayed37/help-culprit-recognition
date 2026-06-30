# -*- coding: utf-8 -*-
import re
SLIDE = "F:/GP/code/docs-build/poster_unpack/ppt/slides/slide1.xml"
xml = open(SLIDE, encoding="utf-8").read()

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

# ---- 1. shorten the title so it fits one line (no header overlap) ----
xml = xml.replace(
    "<a:t>Help Culprit Recognition: AI-Powered Forensic Suspect Retrieval</a:t>",
    "<a:t>Help Culprit Recognition</a:t>")

# ---- 2. fill the Results table (3 rows x 4 cells) ----
TABLE = [
    ["Checkpoint", "Recall@1", "Recall@5", "Recall@10"],
    ["Epoch 0  (baseline)", "3.73 %", "13.25 %", "21.08 %"],
    ["Epoch 6  (best)", "7.46 %", "21.08 %", "30.60 %"],
]
gf = re.search(r'<p:graphicFrame>.*?</p:graphicFrame>', xml, re.S).group(0)
new_gf = gf
rows = re.findall(r'<a:tr.*?</a:tr>', gf, re.S)
for ri, row in enumerate(rows):
    cells = re.findall(r'<a:tc>.*?</a:tc>', row, re.S)
    new_row = row
    for ci, cell in enumerate(cells):
        text = TABLE[ri][ci]
        bold = ' b="1"' if ri == 0 else ''
        color = '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>' if ri == 0 else ''
        run = ('<a:r><a:rPr lang="en-US" sz="1500"%s dirty="0">%s</a:rPr>'
               '<a:t>%s</a:t></a:r>') % (bold, color, esc(text))
        # insert the run into the cell's first paragraph (before endParaRPr or </a:p>)
        def inject(p):
            if '<a:endParaRPr' in p:
                return re.sub(r'(<a:endParaRPr)', run + r'\1', p, count=1)
            return p.replace('</a:p>', run + '</a:p>', 1)
        first_p = re.search(r'<a:p>.*?</a:p>', cell, re.S).group(0)
        new_cell = cell.replace(first_p, inject(first_p), 1)
        new_row = new_row.replace(cell, new_cell, 1)
    new_gf = new_gf.replace(row, new_row, 1)
xml = xml.replace(gf, new_gf)

open(SLIDE, "w", encoding="utf-8").write(xml)
print("title shortened + table filled")
