import * as THREE from "three";
import { box, cylinder, sign, instances, materials } from "./primitives.js";
import { facade, roofDetails, contactShadow, rail } from "./Details.js";
import { district } from "./Buildings.js";
import { createPlane, truck } from "../objects/Vehicles.js";

const RUNWAY_Z = -4;

function runwayMarkings(group) {
  const marks = [],
    lights = [];
  for (let x = -21; x <= 21; x += 4.5)
    marks.push({ p: [x, 0.315, RUNWAY_Z], s: [2.25, 0.025, 0.16] });
  for (let x = -22; x <= 22; x += 2.2)
    for (const z of [RUNWAY_Z - 2.7, RUNWAY_Z + 2.7])
      lights.push({ p: [x, 0.38, z], s: [0.11, 0.11, 0.11] });
  for (const z of [-5.9, -5.15, -4.4, -3.65, -2.9, -2.15]) {
    marks.push({ p: [-20.6, 0.325, z], s: [3.1, 0.025, 0.24] });
    marks.push({ p: [20.6, 0.325, z], s: [3.1, 0.025, 0.24] });
  }
  for (const z of [RUNWAY_Z - 2.35, RUNWAY_Z + 2.35])
    marks.push({ p: [0, 0.315, z], s: [45, 0.018, 0.07] });
  instances(group, new THREE.BoxGeometry(1, 1, 1), "white", marks);
  instances(group, new THREE.BoxGeometry(1, 1, 1), "light", lights);
}

function controlTower(group) {
  const tower = new THREE.Group();
  tower.position.set(18, 0, 8.3);
  group.add(tower);
  cylinder(tower, 0, 0.2, 0, 0.78, 6.1, "concrete", 0.58, 12);
  cylinder(tower, 0, 6.3, 0, 1.7, 1.35, "glass", 1.42, 10);
  cylinder(tower, 0, 7.65, 0, 1.82, 0.28, "dark", 1.82, 12);
  cylinder(tower, 0, 7.9, 0, 0.055, 2.2, "dark", 0.055, 8);
  for (let i = 0; i < 3; i++)
    cylinder(tower, -0.52 + i * 0.52, 8.1, 0.12, 0.15, 0.24, "white", 0.15, 10);
  contactShadow(group, 18, 8.3, 5, 4, 0.25);
}

export function createAirport(world) {
  const g = district(world, 20, -46, "FADO Air", 0.8);
  // Runway, taxiway and apron occupy separate, readable zones.
  box(g, 0, 0, 0, 52, 0.28, 22, "concrete", 0.7);
  box(g, 0, 0.28, RUNWAY_Z, 47, 0.055, 5.4, "asphalt", 0.06);
  box(g, 0, 0.285, 0, 33, 0.05, 1.9, "asphalt", 0.1);
  box(g, -15, 0.285, -2, 3.6, 0.05, 4.2, "asphalt", 0.1);
  box(g, 13, 0.285, 3.0, 16, 0.05, 3.8, "concrete", 0.18);
  runwayMarkings(g);

  // Terminal stays behind the runway. Jet bridges connect facade to apron.
  box(g, 8, 0.34, 8, 25, 0.35, 8.5, "dark", 0.7);
  box(g, 8, 0.69, 8, 23.5, 3.8, 7.2, "white", 0.48);
  facade(g, {
    width: 21.8,
    height: 3.1,
    depth: 7.25,
    base: 1.05,
    floors: 2,
    columns: 12,
    x: 8,
    z: 8,
  });
  box(g, 8, 4.45, 8, 25, 0.34, 8.4, "orange", 0.12);
  box(g, 8, 4.8, 8, 24.5, 0.28, 8, "roof", 0.12);
  roofDetails(g, 8, 5.08, 8, 19, 5.8);
  sign(g, "FADO AIR", 8, 3.75, 4.34, 7);
  contactShadow(g, 8, 8, 29, 11, 0.24);
  for (const x of [0, 6, 12]) {
    // Rear edge meets the facade at z=4.4; the bridge extends only onto apron.
    box(g, x, 1.35, 3.12, 1.55, 1.35, 2.55, "white", 0.18);
    box(g, x, 1.58, 1.65, 1.28, 0.78, 1.05, "glass", 0.1);
    cylinder(g, x - 0.52, 0.32, 1.55, 0.07, 1.05, "metal", 0.07, 8);
    cylinder(g, x + 0.52, 0.32, 1.55, 0.07, 1.05, "metal", 0.07, 8);
  }
  rail(g, [-4, 12], [20, 12]);
  controlTower(g);

  // Ground equipment remains on the apron and never intersects the runway.
  const cargo = truck(g, "van", "orange");
  cargo.position.set(-10, 0.25, 7.4);
  cargo.rotation.y = -Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const cart = new THREE.Group();
    g.add(cart);
    box(cart, 0, 0.24, 0, 1.35, 0.18, 2.1, "dark", 0.06);
    box(cart, 0, 0.48, 0, 1.15, 0.62, 1.65, i % 2 ? "white" : "orange", 0.08);
    for (const x of [-0.52, 0.52])
      for (const z of [-0.65, 0.65]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10),
          materials.tire,
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.25, z);
        cart.add(wheel);
      }
    cart.position.set(-11 + i * 1.6, 0, 5.4);
  }
  for (let i = 0; i < 5; i++)
    box(g, -18 + i * 1.1, 0.34, 7.5, 0.75, 0.72, 0.75, "wood", 0.05);
  for (let x = -29; x < -23; x += 1.2) {
    cylinder(g, x, 0.1, RUNWAY_Z, 0.035, 0.2, "metal", 0.035, 6);
    box(g, x, 0.31, RUNWAY_Z, 0.13, 0.09, 0.13, "light", 0.025);
  }

  const plane = createPlane(world);
  plane.scale.setScalar(1.12);
  plane.userData.dynamic = true;
  // Stabilized approach -> flare -> touchdown -> rollout -> climb.
  const flightPath = new THREE.CatmullRomCurve3(
    [
      [-92, 19, -50],
      [-70, 13, -50],
      [-50, 7.2, -50],
      [-32, 3.2, -50],
      [-12, 1.9, -50],
      [1, 1.64, -50],
      [17, 1.64, -50],
      [38, 1.64, -50],
      [56, 2.2, -50],
      [72, 8, -52],
      [92, 22, -61],
    ].map((p) => new THREE.Vector3(...p)),
    false,
    "centripetal",
  );
  const forward = new THREE.Vector3(0, 0, 1),
    tangent = new THREE.Vector3();
  let landingStart = 0,
    wasAirportActive = false;
  return {
    group: g,
    update(time, progress) {
      const airportActive = progress >= 0.72 && progress < 0.87;
      if (airportActive && !wasAirportActive) landingStart = time;
      wasAirportActive = airportActive;
      // Entering the airport chapter always begins with an approach. Once the
      // aircraft has climbed away, it loops slowly as ambient world motion.
      const t = airportActive
        ? Math.min(0.98, 0.16 + (time - landingStart) / 11.5)
        : (time * 0.018 + 0.04) % 1;
      plane.position.copy(flightPath.getPointAt(t));
      flightPath.getTangentAt(t, tangent).normalize();
      plane.quaternion.setFromUnitVectors(forward, tangent);
      // Rotate around the wing axis for a nose-up flare. Rotating around Z here
      // would roll the aircraft and was the source of the unnatural touchdown.
      const flare = Math.sin(THREE.MathUtils.smoothstep(t, 0.2, 0.4) * Math.PI);
      plane.rotateX(-flare * 0.045);
    },
  };
}
