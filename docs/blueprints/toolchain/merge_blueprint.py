"""Merge cover + body into the final blueprint PDF with A4 normalization."""
import os
from pypdf import PdfReader, PdfWriter
BP = os.path.dirname(os.path.abspath(__file__)) + os.sep

A4_W, A4_H = 595.28, 841.89


def normalize(page):
    w, h = float(page.mediabox.width), float(page.mediabox.height)
    if abs(w - A4_W) > 0.05 or abs(h - A4_H) > 0.05:
        page.scale_to(A4_W, A4_H)
    return page


writer = PdfWriter()
writer.add_page(normalize(PdfReader(BP + "blueprint-cover.pdf").pages[0]))
for p in PdfReader(BP + "blueprint-body.pdf").pages:
    writer.add_page(normalize(p))
writer.add_metadata({
    "/Title": "Music App Creation Blueprint",
    "/Author": "Z.ai",
    "/Creator": "Z.ai",
    "/Subject": "Creation blueprint for a free, no-login, ad-free native music app",
})
out = BP + "blueprint-final.pdf"
with open(out, "wb") as f:
    writer.write(f)

r = PdfReader(out)
sizes = {(round(float(p.mediabox.width), 1), round(float(p.mediabox.height), 1)) for p in r.pages}
print("final pages:", len(r.pages), "| page sizes:", sizes)
