import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
});
await mkdir("artifacts/journey", { recursive: true });
const report = [];
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("http://127.0.0.1:5173/?quality=low", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.locator("#loader").waitFor({ state: "hidden", timeout: 50000 });
    const buttons = page.locator("#destinations button");
    for (let index = 0; index < (await buttons.count()); index++) {
      await buttons.nth(index).click();
      await page.waitForTimeout(700);
      const name = await page.locator("#district-name").textContent();
      await page.screenshot({
        path: `artifacts/journey/${viewport.width}-${String(index).padStart(2, "0")}.png`,
      });
      report.push({ viewport, index, name });
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth))
      errors.push("Horizontal overflow");
    if (errors.length) throw new Error(errors.join("\n"));
    await page.close();
  }
  await writeFile("artifacts/journey/results.json", JSON.stringify(report, null, 2));
  console.log(`PASS: ${report.length} journey screenshots`);
} finally {
  await browser.close();
}
