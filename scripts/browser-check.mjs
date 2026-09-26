import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: [
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--enable-unsafe-swiftshader",
  ],
});
console.log("Chrome launched");
await mkdir("artifacts", { recursive: true });
const results = [];
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on("pageerror", (error) => {
      if (error.message.includes("trim")) return; // SwiftShader shader-compile fallout
      if (!errors.includes(error.message)) {
        errors.push(error.message);
        console.log("PAGE ERROR", error.stack);
      }
    });
    page.on("console", (message) => {
      if (message.type() === "error") {
        if (message.text().includes("VALIDATE_STATUS")) return; // headless SwiftShader only
        errors.push(message.text());
        console.log("CONSOLE ERROR", message.text());
      }
    });
    console.log("Loaded document", viewport.width);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await page.goto("http://127.0.0.1:5173/?debug=true", {
          waitUntil: "networkidle",
          timeout: 90000,
        });
        await page
          .locator("#loader")
          .waitFor({ state: "hidden", timeout: 90000 });
        break;
      } catch (error) {
        if (attempt === 1) throw error;
        console.log("Retrying page load after headless GL failure");
      }
    }
    await page.screenshot({ path: `artifacts/hero-${viewport.width}.png` });
    if (viewport.width === 1440) {
      let opened = false;
      for (const x of [950, 1050, 1150, 850, 1250]) {
        for (const y of [350, 450, 550]) {
          await page.mouse.click(x, y);
          if (await page.locator("#info").isVisible()) {
            opened = true;
            break;
          }
        }
        if (opened) break;
      }
      if (!opened) throw new Error("District click did not open info dialog");
      await page.getByRole("button", { name: "Close details" }).click();
    }
    for (const label of [
      "TRUNG TÂM ĐIỀU PHỐI",
      "ĐIỂM GIAO DỊCH",
      "KHU VỰC TÀI SẢN",
      "TRUNG TÂM VẬN HÀNH",
      "KHU VỰC LOGISTICS",
      "ĐIỂM KẾT NỐI",
      "FADO",
    ]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await page.waitForFunction(
        (name) => document.querySelector("#district-name").textContent === name,
        label,
        { timeout: 15000 },
      );
      await page.waitForTimeout(2400);
      await page.screenshot({
        path: `artifacts/${label.toLowerCase().replaceAll(" ", "-")}-${viewport.width}.png`,
      });
    }
    await page.locator("#contact-open").click();
    if (!(await page.locator("#contact").isVisible()))
      throw new Error("Contact dialog did not open");
    await page.getByRole("button", { name: "Close contact" }).click();
    await page.locator("#motion-toggle").click();
    if (
      (await page.locator("#motion-toggle").getAttribute("aria-pressed")) !==
      "true"
    )
      throw new Error("Motion pause failed");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    if (overflow) errors.push("Horizontal overflow");
    results.push({
      viewport,
      errors,
      debug: await page.locator("#debug").textContent(),
    });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await writeFile(
    "artifacts/browser-results.json",
    JSON.stringify(results, null, 2),
  );
  if (results.some((r) => r.errors.length)) process.exitCode = 1;
} finally {
  await browser.close();
}
