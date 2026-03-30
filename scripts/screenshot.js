import { chromium } from "playwright";

const url = process.argv[2] ?? "https://books.nick.town/screenshot";
const outPath = "screenshot.png";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1600, height: 900 });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.querySelector("astro-dev-toolbar")?.remove());
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved to ${outPath}`);
