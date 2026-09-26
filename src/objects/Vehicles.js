import * as THREE from "three";
import { box, cylinder, materials, mergeStatic } from "../world/primitives.js";
import { replaceWithTruckModel } from "../core/ModelAssets.js";

function truckCab(color) {
  const shape = new THREE.Shape();
  shape.moveTo(-0.68, 0);
  shape.lineTo(0.64, 0);
  shape.lineTo(0.64, 0.36);
  shape.quadraticCurveTo(0.62, 0.72, 0.42, 1.18);
  shape.quadraticCurveTo(0.24, 1.52, -0.12, 1.58);
  shape.lineTo(-0.62, 1.58);
  shape.quadraticCurveTo(-0.75, 1.5, -0.78, 1.28);
  shape.lineTo(-0.78, 0.25);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 1.5,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.06,
    bevelThickness: 0.055,
  });
  geometry.translate(0, 0, -0.75);
  geometry.rotateY(Math.PI / 2);
  const cab = new THREE.Mesh(geometry, materials[color]);
  cab.castShadow = cab.receiveShadow = true;
  return cab;
}

function vehicleWheel(parent, x, z) {
  const tire = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.105, 10, 22),
    materials.tire,
  );
  tire.rotation.y = Math.PI / 2;
  tire.position.set(x, 0.43, z);
  tire.castShadow = true;
  parent.add(tire);
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.24, 18),
    materials.metal,
  );
  rim.rotation.z = Math.PI / 2;
  rim.position.copy(tire.position);
  parent.add(rim);
}

export function truck(parent, kind = "truck", color = "orange") {
  const g = new THREE.Group();
  parent.add(g);
  const length = kind === "van" ? 2.1 : 3.5;
  box(g, 0, 0.45, 0, 1.6, 0.24, length + 1.22, "dark");
  box(g, 0, 0.74, -0.42, 1.65, 1.72, length, color, 0.16);
  const cab = truckCab("white");
  cab.position.set(0, 0.67, length / 2 + 0.54);
  g.add(cab);
  const windshield = box(
    g,
    0,
    1.5,
    length / 2 + 1.26,
    1.16,
    0.48,
    0.045,
    "glass",
    0.08,
  );
  windshield.rotation.x = -0.14;
  box(g, -0.81, 1.27, length / 2 + 0.56, 0.035, 0.45, 0.72, "glass", 0.01);
  box(g, 0.81, 1.27, length / 2 + 0.56, 0.035, 0.45, 0.72, "glass", 0.01);
  box(g, -0.93, 1.05, length / 2 + 0.78, 0.16, 0.12, 0.2, "dark", 0.03);
  box(g, 0.93, 1.05, length / 2 + 0.78, 0.16, 0.12, 0.2, "dark", 0.03);
  box(g, 0, 0.67, length / 2 + 1.18, 1.5, 0.18, 0.12, "dark", 0.03);
  for (const x of [-0.82, 0.82])
    for (const z of [-length / 2 + 0.35, length / 2 + 0.5])
      vehicleWheel(g, x, z);
  for (const x of [-0.84, 0.84])
    box(g, x, 0.75, length / 2 + 0.55, 0.05, 0.5, 0.72, "dark", 0.14);
  for (const x of [-0.5, 0.5])
    box(g, x, 0.85, length / 2 + 1.13, 0.23, 0.16, 0.05, "light", 0.025);
  mergeStatic(g);
  replaceWithTruckModel(g);
  return g;
}
export function forklift(parent) {
  const g = new THREE.Group();
  parent.add(g);
  box(g, 0, 0.3, 0, 1.2, 0.7, 1.8, "orange");
  box(g, 0, 1, -0.25, 0.8, 0.25, 0.6, "dark");
  for (const x of [-0.5, 0.5]) {
    box(g, x, 0.9, 0.1, 0.08, 1.6, 0.08, "dark");
    box(g, x, 0.3, 1, 0.08, 2, 0.08, "dark");
    box(g, x, 0.3, 1.5, 0.12, 0.1, 1.1, "metal");
    for (const z of [-0.6, 0.6]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.18, 10),
        materials.dark,
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.3, z);
      g.add(wheel);
    }
  }
  box(g, 0, 2.35, 0, 1.3, 0.13, 1.3, "dark");
  box(g, 0, 0.4, 1.5, 0.8, 0.7, 0.7, "wood");
  mergeStatic(g);
  return g;
}
export function createPlane(parent) {
  const g = new THREE.Group();
  parent.add(g);
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.57, 5.8, 5, 12),
    materials.white,
  );
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  const wingShape = new THREE.Shape();
  wingShape.moveTo(-0.3, 1);
  wingShape.lineTo(-5, -1.2);
  wingShape.lineTo(-4.8, -1.8);
  wingShape.lineTo(0, -0.8);
  wingShape.lineTo(4.8, -1.8);
  wingShape.lineTo(5, -1.2);
  wingShape.lineTo(0.3, 1);
  wingShape.closePath();
  const wings = new THREE.Mesh(
    new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 1,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.04,
    }),
    materials.white,
  );
  wings.rotation.x = Math.PI / 2;
  wings.castShadow = true;
  g.add(wings);
  box(g, 0, 0.3, -2.8, 0.15, 1.8, 1.1, "orange", 0.1);
  box(g, 0, 0.1, -2.7, 3.2, 0.1, 0.8, "white");
  box(g, 0, 0.32, 2.5, 0.8, 0.15, 0.6, "glass");
  // Recessed cockpit/cargo glazing and a restrained FADO fuselage stripe.
  for (let z = -1.75; z <= 1.65; z += 0.55) {
    box(g, -0.545, 0.12, z, 0.025, 0.14, 0.24, "glass", 0.01);
    box(g, 0.545, 0.12, z, 0.025, 0.14, 0.24, "glass", 0.01);
  }
  box(g, -0.555, -0.02, 0, 0.018, 0.07, 4.75, "orange", 0.005);
  box(g, 0.555, -0.02, 0, 0.018, 0.07, 4.75, "orange", 0.005);
  box(g, -0.56, -0.15, -1.55, 0.025, 0.72, 1.05, "dark", 0.015);
  for (const x of [-1.8, 1.8]) {
    const engine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.36, 1.4, 12),
      materials.white,
    );
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, -0.4, -0.1);
    engine.castShadow = true;
    g.add(engine);
  }
  // Landing gear remains visible during the airport sequence. The wheels sit
  // just below the fuselage and make touchdown read clearly at miniature scale.
  for (const [x, z] of [
    [-1.15, -0.35],
    [1.15, -0.35],
    [0, 2.05],
  ]) {
    box(g, x, -0.72, z, 0.07, 0.48, 0.07, "dark", 0.02);
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.1, 12),
      materials.tire,
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, -0.78, z);
    g.add(wheel);
  }
  // Orange tail and engine bands strengthen the silhouette from a distance.
  box(g, 0, 0.15, -2.55, 0.12, 1.4, 0.85, "orange", 0.04);
  for (const x of [-1.8, 1.8])
    box(g, x, -0.4, -0.1, 0.74, 0.08, 0.34, "orange", 0.03);
  mergeStatic(g);
  return g;
}
export function createTraffic(world, curve) {
  const vehicles = [];
  const minimumGap = 0.052;
  let lastTime = 0;
  for (let i = 0; i < 6; i++) {
    const model = truck(
      world,
      i % 3 === 0 ? "van" : "truck",
      i % 3 === 1 ? "blue" : i % 3 === 2 ? "white" : "orange",
    );
    vehicles.push({
      model,
      progress: i / 6,
      speed: 0.011,
      lane: i % 2 ? -1.25 : 1.25,
    });
  }
  return (time) => {
    const dt = Math.min(Math.max(time - lastTime, 0), 0.05);
    lastTime = time;
    for (const lane of [-1.25, 1.25]) {
      const queue = vehicles
        .filter((vehicle) => vehicle.lane === lane)
        .sort((a, b) => a.progress - b.progress);
      for (let i = queue.length - 1; i >= 0; i--) {
        const vehicle = queue[i];
        const ahead = queue[(i + 1) % queue.length];
        const gap = (ahead.progress - vehicle.progress + 1) % 1;
        vehicle.progress =
          (vehicle.progress +
            Math.min(vehicle.speed * dt, Math.max(0, gap - minimumGap))) %
          1;
      }
    }
    for (const vehicle of vehicles) {
      const p = curve.getPointAt(vehicle.progress);
      const tangent = curve.getTangentAt(vehicle.progress);
      vehicle.model.position.copy(p);
      vehicle.model.position.x -= tangent.z * vehicle.lane;
      vehicle.model.position.z += tangent.x * vehicle.lane;
      vehicle.model.rotation.y = Math.atan2(tangent.x, tangent.z);
    }
  };
}
