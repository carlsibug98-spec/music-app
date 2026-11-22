"""Render print-optimized diagrams for PDF embedding (device_scale_factor=2)."""
import asyncio
import os
from playwright.async_api import async_playwright

JOBS = [
    ("/home/z/my-project/scripts/print-architecture.html",
     "/home/z/my-project/scripts/print-architecture.png", 760),
    ("/home/z/my-project/scripts/print-data-model.html",
     "/home/z/my-project/scripts/print-data-model.png", 860),
]


async def html_to_image(html_path, output_path, width, selector="#root", scale=2):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            viewport={"width": width, "height": 900}, device_scale_factor=scale)
        await page.goto(f"file://{html_path}", wait_until="networkidle")
        await page.wait_for_timeout(400)
        el = page.locator(selector)
        bbox = await el.bounding_box()
        if bbox:
            await page.set_viewport_size({
                "width": max(width, int(bbox["width"] + 40)),
                "height": int(bbox["height"] + 40)})
            await page.wait_for_timeout(200)
        await el.screenshot(path=output_path)
        await browser.close()
        print(f"OK {output_path} ({os.path.getsize(output_path)/1024:.0f} KB)")


async def main():
    for html_path, out_path, width in JOBS:
        await html_to_image(html_path, out_path, width)


if __name__ == "__main__":
    asyncio.run(main())
