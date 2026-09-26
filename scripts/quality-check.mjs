import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
});

try {
  const page = await browser.newPage({
    viewport: { width: 960, height: 540 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(
    "http://127.0.0.1:5173/?quality=ultra&debug=true&debugLayout=true",
    { waitUntil: "domcontentloaded", timeout: 30000 },
  );
  await page.locator("#loader").waitFor({ state: "hidden", timeout: 60000 });
  await page.waitForTimeout(900);
  const result = await page.evaluate(() => {
    const canvas = document.querySelector("#webgl");
    const debug = document.querySelector("#debug").textContent;
    return {
      viewport: [innerWidth, innerHeight],
      buffer: [canvas.width, canvas.height],
      debug,
    };
  });
  if (result.buffer[0] !== 1920 || result.buffer[1] !== 1080)
    errors.push(`Expected 2x drawing buffer, received ${result.buffer.join("x")}`);
  if (!result.debug.includes("LAYOUT COLLISIONS 0  CLEARANCE 0"))
    errors.push(`Layout audit failed: ${result.debug}`);
  if (errors.length) throw new Error(errors.join("\n"));
  console.log(`PASS: Ultra 2x drawing buffer ${result.buffer.join("x")}`);
  console.log("PASS: Layout collisions 0; clearance warnings 0");
} finally {
  await browser.close();
}
