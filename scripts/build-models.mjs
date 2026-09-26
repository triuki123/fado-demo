import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

const candidates = [
  process.env.BLENDER_BIN,
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe",
  "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe",
  "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
].filter(Boolean);
const blender = candidates.find(existsSync);
if (!blender)
  throw new Error("Blender was not found. Set BLENDER_BIN to blender.exe.");
for (const filename of ["create_fado_truck.py", "create_fado_ecosystem.py"]) {
  const script = path.resolve("scripts/blender", filename);
  const result = spawnSync(blender, ["--background", "--python", script], {
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status) process.exit(result.status);
}
