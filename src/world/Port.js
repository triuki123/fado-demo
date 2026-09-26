import * as THREE from "three";
import {
  box,
  beam,
  cylinder,
  instances,
  materials,
  sign,
} from "./primitives.js";
import { district } from "./Buildings.js";
import { rail, contactShadow } from "./Details.js";
export function createPort(world) {
  const g = district(
    world,
    42,
    34,
    "ProShip Logistics",
    0.66,
    "https://proship.vn",
  );
  box(g, -2, 0, -2, 29, 0.6, 13, "concrete", 0.4);
  const cargo = [];
  for (let x = -13; x < 6; x += 4)
    for (let z = -5; z < 2; z += 3)
      for (let y = 0; y < 2; y++)
        cargo.push({ p: [x, 0.9 + y * 1.4, z], s: [3.5, 1.3, 2] });
  const containers = instances(
    g,
    new THREE.BoxGeometry(1, 1, 1),
    materials.white,
    cargo,
  );
  cargo.forEach((_, i) =>
    containers.setColorAt(
      i,
      new THREE.Color([0xf36c21, 0x688b99, 0xd8d9cc, 0x42595d][i % 4]),
    ),
  );
  const ribs = [];
  const containerFrames = [];
  cargo.forEach((t) => {
    for (let dx = -1.5; dx < 1.6; dx += 0.5)
      ribs.push({
        p: [t.p[0] + dx, t.p[1], t.p[2] + 1.065],
        s: [0.05, 1.15, 0.045],
      });
    for (const side of [-1, 1]) {
      containerFrames.push({
        p: [t.p[0], t.p[1] + side * 0.58, t.p[2] + 1.08],
        s: [3.56, 0.075, 0.07],
      });
      for (const x of [-1.72, 1.72])
        containerFrames.push({
          p: [t.p[0] + x, t.p[1], t.p[2] + 1.09],
          s: [0.09, 1.25, 0.08],
        });
    }
  });
  instances(g, new THREE.BoxGeometry(1, 1, 1), "metal", ribs);
  instances(g, new THREE.BoxGeometry(1, 1, 1), "dark", containerFrames);
  const cranes = [];
  for (const x of [-8, 5]) {
    const crane = new THREE.Group();
    crane.position.set(x, 0, 4);
    g.add(crane);
    for (const a of [-2, 2]) {
      beam(crane, [a, 0.5, -1], [a, 13, 0], 0.5);
      beam(crane, [a, 13, 0], [a, 13, 12], 0.45);
      beam(crane, [a, 13, 0], [a, 17, -1], 0.28);
      beam(crane, [a, 17, -1], [a, 13, 11], 0.16);
      box(crane, a, 0.4, -1, 0.8, 0.5, 3, "dark");
    }
    beam(crane, [-2, 1, -1], [2, 12, 0], 0.11, "metal");
    beam(crane, [2, 1, -1], [-2, 12, 0], 0.11, "metal");
    beam(crane, [-2, 12.5, 0], [2, 12.5, 0], 0.6);
    const trolley = new THREE.Group();
    crane.add(trolley);
    box(trolley, 0, 12, 6, 4, 0.4, 1.1, "dark");
    for (const a of [-1, 1])
      beam(trolley, [a, 12, 6], [a, 6, 6], 0.055, "dark");
    box(trolley, 0, 5.8, 6, 3, 0.3, 1.5, "orange");
    box(crane, 1.35, 10.3, 1.2, 1.15, 1.65, 1.2, "glass", 0.12);
    box(crane, 1.35, 11.92, 1.2, 1.35, 0.16, 1.4, "orange", 0.05);
    for (const side of [-2, 2])
      for (const z of [-0.55, 0.55]) {
        const wheel = new THREE.Mesh(
          new THREE.TorusGeometry(0.28, 0.1, 8, 16),
          materials.tire,
        );
        wheel.rotation.y = Math.PI / 2;
        wheel.position.set(side, 0.52, z - 1);
        crane.add(wheel);
      }
    cranes.push(trolley);
  }
  const ship = new THREE.Group();
  ship.position.set(-2, 0.2, 20);
  g.add(ship);
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-14, -3);
  hullShape.lineTo(10, -3);
  hullShape.quadraticCurveTo(16, -2, 17, 0);
  hullShape.quadraticCurveTo(16, 2, 10, 3);
  hullShape.lineTo(-14, 3);
  hullShape.quadraticCurveTo(-16, 0, -14, -3);
  const hull = new THREE.Mesh(
    new THREE.ExtrudeGeometry(hullShape, {
      depth: 2,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.4,
      bevelThickness: 0.3,
    }),
    materials.dark,
  );
  hull.rotation.x = -Math.PI / 2;
  hull.castShadow = true;
  hull.receiveShadow = true;
  ship.add(hull);
  box(ship, -1, 1.82, 0, 24, 0.18, 5.25, "white", 0.08);
  box(ship, -1, 1.55, 2.68, 23, 0.18, 0.12, "orange", 0.025);
  box(ship, -10, 2, 0, 4, 4.5, 4.7, "white", 0.3);
  box(ship, -10, 5, 0, 4.4, 0.85, 5, "glass", 0.2);
  box(ship, -10, 6.5, 0, 1.4, 1.5, 1.4, "orange");
  for (const z of [-1.65, 1.65])
    for (let x = -11.3; x <= -8.7; x += 0.65)
      box(ship, x, 4.2, z, 0.34, 0.26, 0.05, "glass", 0.015);
  for (const x of [-10.5, -9.5])
    cylinder(ship, x, 7.8, 0, 0.22, 1.2, "dark", 0.18, 14);
  rail(ship, [-7, 2.65], [10, 2.65], 2.75, 1.9);
  rail(ship, [-7, -2.65], [10, -2.65], 2.75, 1.9);
  for (let x = -5; x < 10; x += 4)
    for (const z of [-1.4, 1.4])
      box(ship, x, 2, z, 3.7, 1.5, 2.2, x + z > 3 ? "blue" : "orange");
  sign(ship, "ProShip Logistics", 1, 0.9, 3.42, 8);
  for (let x = -14; x <= 10; x += 4) {
    cylinder(g, x, 0.62, 4.1, 0.22, 0.42, "dark", 0.26, 12);
    cylinder(g, x, 1.04, 4.1, 0.3, 0.12, "dark", 0.3, 12);
  }
  contactShadow(g, -2, -2, 31, 15, 0.18);
  const waterGeo = new THREE.PlaneGeometry(120, 50, 60, 26);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = materials.water.clone();
  waterMat.color.setHex(0x6fa7b0);
  waterMat.roughness = 0.22;
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.userData.dynamic = true;
  water.position.set(42, -0.2, 58);
  world.add(water);
  const pos = waterGeo.attributes.position,
    original = Float32Array.from(pos.array);
  const normals = () => waterGeo.computeVertexNormals();
  let last = 0;
  return {
    group: g,
    update(time) {
      ship.rotation.x = Math.sin(time * 0.45) * 0.012;
      ship.position.y = 0.2 + Math.sin(time * 0.6) * 0.08;
      cranes.forEach((c, i) => (c.position.z = Math.sin(time * 0.15 + i) * 2));
      for (let i = 0; i < pos.count; i++)
        pos.setY(
          i,
          Math.sin(original[i * 3] * 0.22 + time * 0.6) * 0.09 +
            Math.cos(original[i * 3 + 2] * 0.3 + time * 0.4) * 0.06,
        );
      pos.needsUpdate = true;
      if (time - last > 0.12) {
        normals();
        last = time;
      }
    },
  };
}
