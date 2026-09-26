import { readdir, readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { execFileSync } from "node:child_process";
async function files(dir) {
  const list = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = resolve(dir, e.name);
    if (e.isDirectory()) list.push(...(await files(p)));
    else if (/\.m?js$/.test(e.name)) list.push(p);
  }
  return list;
}
const list = await files(".");
for (const file of list) {
  execFileSync(process.execPath, ["--check", file]);
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g))
    await access(resolve(dirname(file), match[1]));
}
console.log(
  `PASS: ${list.length} JavaScript modules; syntax and relative imports valid.`,
);
