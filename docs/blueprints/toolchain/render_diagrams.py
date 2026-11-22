"""Render diagram HTML files to PNG via Playwright (charts skill 3.1 pattern)."""
import asyncio
import os
from playwright.async_api import async_playwright

JOBS = [
    ("/home/z/my-project/scripts/diagram-architecture.html",
     "/home/z/my-project/music-app/docs/diagrams/architecture.png", 1200),
    ("/home/z/my-project/scripts/diagram-data-model.html",
     "/home/z/my-project/music-app/docs/diagrams/data-model.png", 1300),
]


async def html_to_image(html_path, output_path, width, selector="#root", scale=2):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": width, "height": 900},
            device_scale_factor=scale,
        )
        await page.goto(f"file://{html_path}", wait_until="networkidle")
        await page.wait_for_timeout(500)
        el = page.locator(selector)
        bbox = await el.bounding_box()
        if bbox:
            fit_w = max(width, int(bbox["width"] + 100))
            fit_h = int(bbox["height"] + 100)
            await page.set_viewport_size({"width": fit_w, "height": fit_h})
            await page.wait_for_timeout(200)
        await el.screenshot(path=output_path)
        await browser.close()
        print(f"OK {output_path} ({os.path.getsize(output_path)/1024:.0f} KB)")


async def main():
    for html_path, out_path, width in JOBS:
        await html_to_image(html_path, out_path, width)


if __name__ == "__main__":
    asyncio.run(main())
