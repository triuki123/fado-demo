import * as THREE from "three";
import {
  box,
  instances,
  seeded,
  materials,
  cylinder,
  beam,
  mergeStatic,
  setGeometryQuality,
} from "./primitives.js";
import {
  createHeadquarters,
  createCommerce,
  createWarehouse,
  createHub,
} from "./Buildings.js";
import { createRoads, roadCurve } from "./Road.js";
import { createPort } from "./Port.js";
import { createAirport } from "./Airport.js";
import { createTraffic, forklift } from "../objects/Vehicles.js";
export function createWorld(scene, quality) {
  setGeometryQuality(quality.name);
  const world = new THREE.Group();
  scene.add(world);
  const seaGeo = new THREE.PlaneGeometry(260, 220, 48, 40);
  const water = new THREE.Mesh(
    seaGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0x74aeb6,
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -1.55;
  water.receiveShadow = true;
  scene.add(water);
  const seaPos = seaGeo.attributes.position,
    seaBase = Float32Array.from(seaPos.array);
  const clouds = [];
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  for (let i = 0; i < 7; i++) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const puff = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1, 1),
        cloudMat,
      );
      puff.position.set(j * 4.2 - 6.3, (j % 2) * 0.9, (j % 2) * 2);
      puff.scale.set(6.5 - j * 0.8, 1.4, 3.8);
      cloud.add(puff);
    }
    cloud.position.set(-70 + i * 24, 34 + (i % 3) * 6, -50 + (i % 4) * 30);
    scene.add(cloud);
    clouds.push(cloud);
  }
  const platforms = [
    [-30, 14, 26, 24, 1.8, "grass"],
    [8, 14, 24, 24, 1.45, "grass"],
    [-26, -18, 32, 22, 1.7, "concrete"],
    [8, -18, 24, 22, 1.45, "grass"],
    [42, 34, 36, 26, 1.5, "concrete"],
    [20, -46, 56, 26, 1.65, "concrete"],
  ];
  for (const [x, z, width, depth, height, material] of platforms) {
    box(world, x, -height, z, width + 2.5, height, depth + 2.5, "dark", 1.1);
    box(world, x, -0.22, z, width, 0.28, depth, material, 1.1);
  }
  createRoads(world);
  for (const [x, z, width, depth] of [
    [-10, 14, 14, 5],
    [-7, -18, 7, 5],
    [-30, -2.5, 5, 10],
    [8, -2.5, 5, 10],
    [22, 23, 6, 6],
    [8, -31, 6, 5],
  ]) {
    box(world, x, -0.35, z, width, 0.35, depth, "metal", 0.28);
    box(world, x, 0, z, width - 0.4, 0.08, depth - 0.4, "concrete", 0.18);
  }
  const hq = createHeadquarters(world),
    commerce = createCommerce(world),
    warehouse = createWarehouse(world),
    hub = createHub(world),
    port = createPort(world),
    airport = createAirport(world);
  const interactive = [hq, commerce, warehouse, hub, port.group, airport.group];
  const traffic = createTraffic(world, roadCurve),
    lift = forklift(world);
  const forkCurve = new THREE.CatmullRomCurve3(
    [
      [-34, 0.3, -15],
      [-31, 0.3, -13],
      [-26, 0.3, -13],
      [-21, 0.3, -15],
      [-26, 0.3, -16],
    ].map((p) => new THREE.Vector3(...p)),
    true,
  );
  // Repeated landscape and architecture are drawn in batches.
  const random = seeded(),
    trunks = [],
    crowns = [],
    shrubs = [];
  const landscape = [
    [-41, 4, 3.2],
    [-41, 24, 2.8],
    [-19, 24, 2.5],
    [-41, 14, 2.4],
    [-19, 6, 2.6],
    [18, 4, 2.8],
    [-2, 24, 2.4],
    [0, 4, 2.2],
    [18, 22, 2.5],
    [-40, -9, 2.6],
    [-12, -9, 2.3],
    [-40, -27, 3.1],
    [-12, -27, 2.5],
    [0, -9, 2.4],
    [18, -9, 2.6],
    [18, -27, 2.6],
    [26, 23, 2.7],
    [58, 23, 3.3],
    [58, 45, 3.5],
    [26, 45, 2.6],
    [42, 45, 2.8],
    [-6, -57, 2.7],
    [10, -57, 2.5],
    [22, -57, 2.8],
    [46, -57, 3.1],
    [42, -36, 2.4],
  ];
  for (const [x, z, h] of landscape) {
    const r = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
    const spread = (h > 3 ? 1.42 : 1.16) * (0.85 + r * 0.35);
    trunks.push({ p: [x, h / 2, z], s: [0.16, h, 0.16] });
    crowns.push({
      p: [x + (r - 0.5) * 0.4, h + 0.85, z],
      s: [spread, h * (0.5 + r * 0.14), spread * (0.85 + (1 - r) * 0.3)],
    });
    shrubs.push({ p: [x + 0.68, 0.38, z + 0.68], s: [0.72, 0.38, 0.72] });
  }
  // Jittered canopy geometry reads organic instead of perfect spheres.
  const crownGeo = new THREE.IcosahedronGeometry(1, 1);
  {
    const pos = crownGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const jitter = 0.78 + Math.abs((Math.sin(i * 91.17) * 15731.7) % 1) * 0.5;
      pos.setXYZ(
        i,
        pos.getX(i) * jitter,
        pos.getY(i) *
          (0.72 + Math.abs((Math.sin(i * 47.3) * 7919.3) % 1) * 0.4),
        pos.getZ(i) * jitter,
      );
    }
    crownGeo.computeVertexNormals();
  }
  instances(world, new THREE.CylinderGeometry(0.7, 1, 1, 6), "wood", trunks);
  const trees = instances(world, crownGeo, "green", crowns);
  crowns.forEach((_, i) =>
    trees.setColorAt(
      i,
      new THREE.Color().setHSL(
        0.33 + (i % 5) * 0.015,
        0.32,
        0.3 + (i % 4) * 0.03,
      ),
    ),
  );
  instances(world, crownGeo, "leaf", shrubs);
  // Low meadow tufts and flower dots along island edges, clear of roads and docks.
  const tufts = [],
    flowers = [];
  // ponytail: tufts sit on platform perimeters; bridges cross a few edges but
  // 0.26-high tufts under a deck read as grass, not collision. Upgrade: skip zones.
  for (const [px, pz, pw, pd] of platforms.map((p) => p.slice(0, 4))) {
    for (let i = 0; i < 17; i++) {
      const side = Math.floor(random() * 4);
      const along = random() - 0.5;
      const x =
        px +
        (side < 2 ? along * (pw - 4) : (side === 2 ? -1 : 1) * (pw / 2 - 1.6));
      const z =
        pz +
        (side < 2 ? (side === 0 ? -1 : 1) * (pd / 2 - 1.6) : along * (pd - 4));
      tufts.push({ p: [x, 0.22, z], s: [0.55, 0.26, 0.55] });
      if (i % 4 === 0)
        flowers.push({ p: [x - 0.35, 0.3, z + 0.3], s: [0.14, 0.14, 0.14] });
    }
  }
  instances(world, crownGeo, "leaf", tufts);
  instances(world, new THREE.IcosahedronGeometry(1, 0), "orange", flowers);
  // Crosswalk, parking spaces, benches, fence and small human silhouettes.
  const stripes = [];
  for (let i = 0; i < 7; i++)
    stripes.push({ p: [2 + i * 0.6, 0.29, -26], s: [0.3, 0.03, 4] });
  instances(world, new THREE.BoxGeometry(1, 1, 1), "white", stripes);
  for (let x = 0; x < 18; x += 2) {
    box(world, x, 0.2, -24, 1.8, 0.04, 3, "concrete");
    box(world, x, 0.25, -24, 0.06, 0.025, 3, "white", 0);
  }
  for (const [x, z] of [
    [-38, 6],
    [-22, 6],
    [-34, 22],
  ]) {
    box(world, x, 0.6, z, 2, 0.16, 0.65, "wood");
    box(world, x, 0.65, z - 0.25, 2, 0.6, 0.12, "wood");
    for (const dx of [-0.7, 0.7])
      box(world, x + dx, 0.2, z, 0.12, 0.5, 0.5, "dark");
  }
  const fence = [];
  for (let x = 14; x < 45; x += 1.5)
    fence.push({ p: [x, 1.1, -34], s: [0.06, 1.8, 0.06] });
  instances(world, new THREE.BoxGeometry(1, 1, 1), "metal", fence);
  beam(world, [14, 1.7, -34], [44, 1.7, -34], 0.07, "metal");
  for (let i = 0; i < 7; i++) {
    const x = 0 + i * 2;
    cylinder(world, x, 0.3, -24, 0.15, 0.7, "orange");
    cylinder(world, x, 1, -24, 0.16, 0.28, "wood");
    for (const dx of [-0.09, 0.09])
      box(world, x + dx, 0.2, -24, 0.08, 0.3, 0.12, "dark");
  }
  const routeMat = new THREE.MeshStandardMaterial({
    color: 0xf36c21,
    emissive: 0xf36c21,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.18,
  });
  const routes = [],
    dots = [];
  const centers = [
    [-30, 2, 14],
    [8, 2, -18],
    [-26, 2, -18],
    [8, 2, 14],
    [42, 2, 34],
    [20, 2, -46],
    [-30, 2, 14],
  ];
  for (let i = 0; i < centers.length - 1; i++) {
    const a = new THREE.Vector3(...centers[i]),
      b = new THREE.Vector3(...centers[i + 1]),
      mid = a.clone().lerp(b, 0.5);
    mid.y = 12;
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    world.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, 40, 0.045, 5, false),
        routeMat,
      ),
    );
    routes.push(curve);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 8, 6),
      materials.light,
    );
    world.add(dot);
    dots.push(dot);
  }
  const particlesGeo = new THREE.BufferGeometry(),
    particlePositions = [];
  for (let i = 0; i < quality.particles; i++)
    particlePositions.push(
      random() * 130 - 65,
      random() * 25 + 2,
      random() * 110 - 55,
    );
  particlesGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(particlePositions, 3),
  );
  const particles = new THREE.Points(
    particlesGeo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.13,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    }),
  );
  world.add(particles);
  // Open-air sorting conveyor with moving cartons beside the loading docks.
  box(world, -8, 0.45, -13, 1.2, 0.65, 6, "metal");
  box(world, -8, 1.1, -13, 1, 0.08, 6, "dark");
  const cartons = [];
  for (let i = 0; i < 4; i++)
    cartons.push(box(world, -8, 1.2, -15 + i, 0.65, 0.55, 0.6, "wood"));
  for (const x of [-8.65, -7.35])
    beam(world, [x, 1.35, -16], [x, 1.35, -10], 0.06, "metal");
  interactive.forEach((group) => mergeStatic(group));
  mergeStatic(world, [...dots, ...cartons]);
  return {
    world,
    interactive,
    update(time, progress) {
      cartons.forEach(
        (carton, i) =>
          (carton.position.z = -15.6 + ((time * 0.45 + i * 1.35) % 5.2)),
      );
      for (let i = 0; i < seaPos.count; i++)
        seaPos.setZ(
          i,
          Math.sin(seaBase[i * 3] * 0.09 + time * 0.5) * 0.14 +
            Math.cos(seaBase[i * 3 + 1] * 0.11 + time * 0.35) * 0.1,
        );
      seaPos.needsUpdate = true;
      clouds.forEach((cloud, i) => {
        cloud.position.x += 0.008 + i * 0.001;
        if (cloud.position.x > 90) cloud.position.x = -90;
      });
      traffic(time);
      port.update(time);
      airport.update(time, progress);
      const t = (time * 0.035) % 1;
      lift.position.copy(forkCurve.getPointAt(t));
      const v = forkCurve.getTangentAt(t);
      lift.rotation.y = Math.atan2(v.x, v.z);
      routes.forEach((c, i) =>
        dots[i].position.copy(c.getPointAt((time * 0.06 + i * 0.2) % 1)),
      );
      routeMat.opacity =
        0.12 + THREE.MathUtils.smoothstep(progress, 0.85, 1) * 0.7;
      particles.rotation.y = time * 0.002;
      trees.rotation.z = Math.sin(time * 0.6) * 0.0006;
    },
  };
}
