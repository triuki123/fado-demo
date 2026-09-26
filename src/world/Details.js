import * as THREE from "three";
import {
  box,
  cylinder,
  instances,
  materials,
  seeded,
  beam,
} from "./primitives.js";

// Repeated facade elements share geometry and are instanced in local coordinates.
export function facade(
  parent,
  { width, height, depth, base = 0.4, floors = 4, columns = 8, x = 0, z = 0 },
) {
  const panes = [],
    frames = [],
    random = seeded(Math.round(width * height));
  const floorHeight = height / floors,
    bay = width / columns;
  for (let floor = 0; floor < floors; floor++)
    for (let col = 0; col < columns; col++) {
      const px = x - width / 2 + (col + 0.5) * bay,
        y = base + (floor + 0.5) * floorHeight;
      for (const side of [-1, 1])
        panes.push({
          p: [px, y, z + side * (depth / 2 + 0.025)],
          s: [bay - 0.15, floorHeight - 0.38, 0.045],
        });
    }
  const mesh = instances(
    parent,
    new THREE.BoxGeometry(1, 1, 1),
    materials.window,
    panes,
    { castShadow: false },
  );
  panes.forEach((_, i) =>
    mesh.setColorAt(
      i,
      new THREE.Color(
        random() > 0.55 ? 0xffdfa5 : random() > 0.5 ? 0x729599 : 0x334c58,
      ),
    ),
  );
  for (let c = 0; c <= columns; c++)
    for (const side of [-1, 1])
      frames.push({
        p: [
          x - width / 2 + c * bay,
          base + height / 2,
          z + side * (depth / 2 + 0.075),
        ],
        s: [0.085, height, 0.1],
      });
  for (let f = 0; f <= floors; f++)
    for (const side of [-1, 1])
      frames.push({
        p: [x, base + f * floorHeight, z + side * (depth / 2 + 0.08)],
        s: [width + 0.15, 0.18, 0.17],
      });
  instances(parent, new THREE.BoxGeometry(1, 1, 1), "dark", frames);
  const sidePanes = [],
    sideCols = Math.max(3, Math.floor(depth / 1.2));
  for (let f = 0; f < floors; f++)
    for (let c = 0; c < sideCols; c++)
      for (const side of [-1, 1])
        sidePanes.push({
          p: [
            x + side * (width / 2 + 0.03),
            base + (f + 0.5) * floorHeight,
            z - depth / 2 + ((c + 0.5) * depth) / sideCols,
          ],
          s: [0.045, floorHeight - 0.38, depth / sideCols - 0.15],
        });
  const sides = instances(
    parent,
    new THREE.BoxGeometry(1, 1, 1),
    materials.window,
    sidePanes,
    { castShadow: false },
  );
  sidePanes.forEach((_, i) =>
    sides.setColorAt(i, new THREE.Color(i % 4 === 0 ? 0xffdfa5 : 0x66878b)),
  );
}

export function roofDetails(parent, x, y, z, width, depth) {
  for (const side of [-1, 1]) {
    box(parent, x, y, z + (side * depth) / 2, width, 0.4, 0.18, "white", 0.045);
    box(parent, x + (side * width) / 2, y, z, 0.18, 0.4, depth, "white", 0.045);
  }
  for (let i = 0; i < 3; i++) {
    const px = x - width * 0.26 + i * 1.5;
    box(parent, px, y + 0.1, z, 1.05, 0.58, 1.25, "metal", 0.06);
    const fan = cylinder(parent, px, y + 0.7, z, 0.33, 0.08, "dark", 0.33, 20);
    for (let s = -0.24; s <= 0.24; s += 0.12)
      box(parent, px + s, y + 0.8, z, 0.025, 0.025, 0.6, "metal", 0);
  }
  for (let i = 0; i < 4; i++)
    box(
      parent,
      x + width * 0.2 + i * 0.5,
      y + 0.15,
      z - depth * 0.23,
      0.055,
      0.38,
      depth * 0.4,
      "metal",
      0.02,
    );
}

let shadowTexture;
export function contactShadow(parent, x, z, w, d, opacity = 0.3) {
  if (!shadowTexture) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    gradient.addColorStop(0, "rgba(29,35,38,.8)");
    gradient.addColorStop(0.55, "rgba(29,35,38,.35)");
    gradient.addColorStop(1, "rgba(29,35,38,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    shadowTexture = new THREE.CanvasTexture(canvas);
  }
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.225, z);
  mesh.userData.dynamic = true;
  parent.add(mesh);
  return mesh;
}

export function bollards(parent, x, z, count = 5, spacing = 2) {
  for (let i = 0; i < count; i++) {
    cylinder(parent, x + i * spacing, 0.3, z, 0.1, 0.7, "orange", 0.1, 8);
    cylinder(parent, x + i * spacing, 0.72, z, 0.105, 0.12, "dark", 0.105, 8);
  }
}

export function rail(parent, a, b, height = 1, base = 0.3) {
  beam(parent, [a[0], height, a[1]], [b[0], height, b[1]], 0.045, "metal");
  const distance = Math.hypot(b[0] - a[0], b[1] - a[1]);
  for (let i = 0; i <= Math.ceil(distance); i++) {
    const t = i / Math.ceil(distance);
    cylinder(
      parent,
      THREE.MathUtils.lerp(a[0], b[0], t),
      base,
      THREE.MathUtils.lerp(a[1], b[1], t),
      0.035,
      height - base,
      "metal",
    );
  }
}
