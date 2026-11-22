#!/usr/bin/env python3
"""Render the blueprint cover HTML to PDF via Playwright (print media, exact page size)."""
from playwright.sync_api import sync_playwright

SRC = "file:///home/z/my-project/scripts/bp11/blueprint-cover.html"
OUT = "/home/z/my-project/scripts/bp11/blueprint-cover.pdf"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 794, "height": 1123})
    page.goto(SRC, wait_until="networkidle")
    page.emulate_media(media="print")
    page.pdf(path=OUT, width="794px", height="1123px", print_background=True,
             margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
    browser.close()
import os
print(f"OK {OUT} ({os.path.getsize(OUT)/1024:.0f} KB)")
