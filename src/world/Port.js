import * as THREE from "three";
import { box, beam, instances, materials, sign } from "./primitives.js";
import { district } from "./Buildings.js";
export function createPort(world) {
  const g = district(world, 42, 34, "FADO Harbor", 0.66);
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
  cargo.forEach((t) => {
    for (let dx = -1.5; dx < 1.6; dx += 0.5)
      ribs.push({
        p: [t.p[0] + dx, t.p[1], t.p[2] + 1.065],
        s: [0.05, 1.15, 0.045],
      });
  });
  instances(g, new THREE.BoxGeometry(1, 1, 1), "metal", ribs);
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
    beam(crane, [-2, 12.5, 0], [2, 12.5, 0], 0.6);
    const trolley = new THREE.Group();
    crane.add(trolley);
    box(trolley, 0, 12, 6, 4, 0.4, 1.1, "dark");
    for (const a of [-1, 1])
      beam(trolley, [a, 12, 6], [a, 6, 6], 0.055, "dark");
    box(trolley, 0, 5.8, 6, 3, 0.3, 1.5, "orange");
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
  ship.add(hull);
  box(ship, -10, 2, 0, 4, 4.5, 4.7, "white", 0.3);
  box(ship, -10, 5, 0, 4.4, 0.85, 5, "glass", 0.2);
  box(ship, -10, 6.5, 0, 1.4, 1.5, 1.4, "orange");
  for (let x = -5; x < 10; x += 4)
    for (const z of [-1.4, 1.4])
      box(ship, x, 2, z, 3.7, 1.5, 2.2, x + z > 3 ? "blue" : "orange");
  sign(ship, "FADO", 1, 0.9, 3.42, 4.5);
  const waterGeo = new THREE.PlaneGeometry(120, 50, 60, 26);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x7fb3ba,
    roughness: 0.24,
    metalness: 0.14,
    clearcoat: 0.9,
    clearcoatRoughness: 0.2,
  });
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
