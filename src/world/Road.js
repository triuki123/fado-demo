import * as THREE from "three";
import { materials, instances } from "./primitives.js";

const points = (items) => items.map((p) => new THREE.Vector3(...p));

// Traffic stays on one wide perimeter causeway; district access is visual-only.
export const roadCurve = new THREE.CatmullRomCurve3(
  points([
    [-52, 0.23, 24],
    [-43, 0.23, 43],
    [-2, 0.23, 49],
    [37, 0.23, 48],
    [57, 0.23, 28],
    [60, 0.23, -18],
    [48, 0.23, -56],
    [4, 0.23, -61],
    [-35, 0.23, -53],
    [-55, 0.23, -25],
    [-58, 0.23, 2],
  ]),
  true,
  "catmullrom",
  0.25,
);

export function ribbon(parent, curve, width, material, yOffset = 0) {
  const vertices = [],
    indices = [];
  const segments = 180;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    const v = curve.getTangentAt(t);
    const n = new THREE.Vector3(-v.z, 0, v.x).normalize();
    for (const side of [-1, 1])
      vertices.push(
        p.x + n.x * width * 0.5 * side,
        p.y + yOffset,
        p.z + n.z * width * 0.5 * side,
      );
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, materials[material]);
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function access(parent, items) {
  const curve = new THREE.CatmullRomCurve3(points(items), false, "centripetal");
  ribbon(parent, curve, 4.2, "concrete", -0.08);
  ribbon(parent, curve, 3.35, "asphalt");
}

export function createRoads(world) {
  ribbon(world, roadCurve, 6.1, "concrete", -0.1);
  ribbon(world, roadCurve, 5.05, "dark", -0.055);
  ribbon(world, roadCurve, 4.55, "asphalt");

  const dashes = [],
    curbs = [],
    poles = [],
    arms = [],
    lights = [];
  for (let i = 0; i < 76; i++) {
    const t = i / 76;
    const p = roadCurve.getPointAt(t);
    const v = roadCurve.getTangentAt(t);
    const r = Math.atan2(v.x, v.z);
    if (i % 2 === 0)
      dashes.push({ p: [p.x, p.y + 0.025, p.z], s: [0.14, 0.025, 1.05], r });
    for (const side of [-1, 1])
      curbs.push({
        p: [p.x - v.z * 2.37 * side, p.y + 0.07, p.z + v.x * 2.37 * side],
        s: [0.13, 0.16, 1.45],
        r,
      });
    if (i % 6 === 0) {
      const n = new THREE.Vector3(-v.z, 0, v.x);
      for (const side of [-1, 1]) {
        const x = p.x + n.x * 3.05 * side;
        const z = p.z + n.z * 3.05 * side;
        poles.push({ p: [x, 1.9, z], s: [1, 1, 1] });
        arms.push({
          p: [x - n.x * side * 0.28, 3.62, z - n.z * side * 0.28],
          s: [0.055, 0.055, 0.75],
          r,
        });
        lights.push({
          p: [x - n.x * side * 0.62, 3.58, z - n.z * side * 0.62],
          s: [0.42, 0.13, 0.24],
          r,
        });
      }
    }
  }
  const cube = new THREE.BoxGeometry(1, 1, 1);
  instances(world, cube, "white", dashes, { castShadow: false });
  instances(world, cube, "concrete", curbs);
  instances(
    world,
    new THREE.CylinderGeometry(0.055, 0.12, 3.4, 10),
    "dark",
    poles,
  );
  instances(world, cube, "dark", arms);
  instances(
    world,
    new THREE.CapsuleGeometry(0.17, 0.34, 4, 10),
    "light",
    lights,
    { castShadow: false },
  );

  access(world, [
    [-50, 0.24, 14],
    [-46, 0.24, 14],
    [-44, 0.24, 14],
  ]);
  access(world, [
    [-50, 0.24, -18],
    [-46, 0.24, -18],
    [-43, 0.24, -18],
  ]);
  access(world, [
    [10, 0.24, -55],
    [10, 0.24, -57],
    [10, 0.24, -58.5],
  ]);
  access(world, [
    [54, 0.24, 34],
    [56, 0.24, 34],
    [58, 0.24, 34],
  ]);
  return roadCurve;
}
