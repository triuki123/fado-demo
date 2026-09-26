import * as THREE from "three";
import {
  box,
  cylinder,
  instances,
  materials,
  seeded,
  beam,
  mergeStatic,
} from "./primitives.js";

export function architecturalVolume(
  parent,
  x,
  y,
  z,
  width,
  height,
  depth,
  material = "white",
  chamfer = 0.35,
) {
  const c = Math.min(chamfer, width * 0.12, depth * 0.12);
  const shape = new THREE.Shape()
    .moveTo(-width / 2 + c, -depth / 2)
    .lineTo(width / 2 - c, -depth / 2)
    .lineTo(width / 2, -depth / 2 + c)
    .lineTo(width / 2, depth / 2 - c)
    .lineTo(width / 2 - c, depth / 2)
    .lineTo(-width / 2 + c, depth / 2)
    .lineTo(-width / 2, depth / 2 - c)
    .lineTo(-width / 2, -depth / 2 + c)
    .closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    steps: 1,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: Math.min(0.08, c * 0.3),
    bevelThickness: Math.min(0.08, height * 0.03),
  });
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, materials[material]);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function gabledRoof(parent, x, y, z, width, depth, rise = 1.2) {
  const hw = width / 2,
    hd = depth / 2;
  const positions = new Float32Array([
    -hw, 0, -hd, hw, 0, -hd, 0, rise, -hd,
    -hw, 0, hd, 0, rise, hd, hw, 0, hd,
    -hw, 0, -hd, 0, rise, -hd, -hw, 0, hd,
    -hw, 0, hd, 0, rise, -hd, 0, rise, hd,
    0, rise, -hd, hw, 0, -hd, 0, rise, hd,
    0, rise, hd, hw, 0, -hd, hw, 0, hd,
  ]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, materials.roof);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

const treeGeometries = new Map();
function organicCrown(seed) {
  if (treeGeometries.has(seed)) return treeGeometries.get(seed);
  const geometry = new THREE.SphereGeometry(1, 16, 12);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i),
      y = position.getY(i),
      z = position.getZ(i);
    const noise =
      1 +
      Math.sin(x * 5.7 + seed) * 0.075 +
      Math.sin(y * 7.9 - seed * 0.7) * 0.06 +
      Math.cos(z * 6.1 + seed * 1.3) * 0.055;
    position.setXYZ(i, x * noise, y * noise, z * noise);
  }
  geometry.computeVertexNormals();
  treeGeometries.set(seed, geometry);
  return geometry;
}

function branch(parent, from, to, radius) {
  const start = new THREE.Vector3(...from),
    end = new THREE.Vector3(...to),
    direction = end.clone().sub(start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.58, radius, direction.length(), 8),
    materials.wood,
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  mesh.castShadow = true;
  parent.add(mesh);
}

export function naturalTree(parent, x, z, height, variant = 0) {
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.rotation.y = (variant * 1.91) % Math.PI;
  parent.add(tree);
  const trunkHeight = height * 0.72;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(height * 0.055, height * 0.09, trunkHeight, 10),
    materials.wood,
  );
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  tree.add(trunk);
  const directions = [
    [-0.46, 0.22],
    [0.42, 0.28],
    [-0.15, -0.5],
    [0.32, -0.31],
  ];
  directions.forEach(([dx, dz], i) => {
    const startY = trunkHeight * (0.5 + i * 0.075);
    branch(
      tree,
      [0, startY, 0],
      [dx * height, trunkHeight + (i % 2) * height * 0.08, dz * height],
      height * 0.035,
    );
  });
  const clusters = [
    [0, trunkHeight + height * 0.29, 0, 0.31, 0.28, 0.29],
    [-0.34, trunkHeight + height * 0.1, 0.18, 0.29, 0.25, 0.27],
    [0.34, trunkHeight + height * 0.13, 0.2, 0.3, 0.26, 0.28],
    [-0.08, trunkHeight + height * 0.15, -0.35, 0.3, 0.27, 0.28],
    [0.22, trunkHeight + height * 0.27, -0.16, 0.25, 0.23, 0.24],
    [-0.3, trunkHeight + height * 0.3, -0.12, 0.23, 0.22, 0.24],
    [0.06, trunkHeight + height * 0.03, 0.36, 0.27, 0.23, 0.25],
    [0.39, trunkHeight + height * 0.02, -0.14, 0.24, 0.22, 0.23],
    [-0.42, trunkHeight - height * 0.02, -0.18, 0.23, 0.2, 0.22],
  ];
  clusters.forEach(([cx, cy, cz, sx, sy, sz], i) => {
    const crown = new THREE.Mesh(
      organicCrown((variant + i) % 7),
      i % 2 ? materials.leaf : materials.green,
    );
    crown.position.set(cx * height, cy, cz * height);
    crown.scale.set(sx * height, sy * height, sz * height);
    crown.rotation.set(i * 0.18, i * 0.83, i * 0.11);
    crown.castShadow = i < 3;
    crown.receiveShadow = true;
    tree.add(crown);
  });
  mergeStatic(tree);
  return tree;
}

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
