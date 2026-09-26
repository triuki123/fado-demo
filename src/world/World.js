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
import { createRoads, roadCurve, ribbon } from "./Road.js";
import { createPort } from "./Port.js";
import { createAirport } from "./Airport.js";
import { naturalTree } from "./Details.js";
import { addEcosystemModel } from "../core/ModelAssets.js";
import { createTraffic, forklift } from "../objects/Vehicles.js";
export function createWorld(scene, quality) {
  setGeometryQuality(quality.name);
  const world = new THREE.Group();
  scene.add(world);
  addEcosystemModel(world);
  const seg = quality.name === "high" ? [36, 28] : [24, 18];
  const seaGeo = new THREE.PlaneGeometry(260, 220, seg[0], seg[1]);
  const water = new THREE.Mesh(seaGeo, materials.water);
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
    box(world, x, -height, z, width + 1.2, height, depth + 1.2, material, 1.35);
    box(world, x, -0.38, z, width + 1.65, 0.22, depth + 1.65, "concrete", 0.65);
    box(world, x, -0.22, z, width, 0.28, depth, material, 1.1);
  }
  createRoads(world);
  for (const bridgePoints of [
    [[-3, 0.4, 31], [-3, 0.75, 28], [-3, 0.4, 25]],
    [[23, 0.4, 10], [21.5, 0.72, 11], [20, 0.4, 12]],
    [[-31, 0.4, -33], [-30, 0.75, -31], [-28, 0.4, -29]],
    [[-12, 0.4, 0], [-14.5, 0.68, 1], [-17, 0.4, 3]],
  ]) {
    const curve = new THREE.CatmullRomCurve3(
      bridgePoints.map((point) => new THREE.Vector3(...point)),
      false,
      "centripetal",
    );
    ribbon(world, curve, 1.65, "concrete", 0.05);
    for (const side of [-1, 1]) {
      const railCurve = new THREE.CatmullRomCurve3(
        bridgePoints.map(
          ([x, y, z], i) =>
            new THREE.Vector3(x + side * 0.77, y + 0.72, z),
        ),
        false,
        "centripetal",
      );
      const rail = new THREE.Mesh(
        new THREE.TubeGeometry(railCurve, 18, 0.035, 6, false),
        materials.metal,
      );
      rail.castShadow = true;
      world.add(rail);
    }
  }
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
    [-13, 35, 2.2],
    [-2, 42, 2.1],
    [10, 35, 2.2],
    [25, 2, 2.3],
    [27, 14, 2.1],
    [43, 2, 2.2],
    [44, 15, 2.4],
    [-42, -36, 2.25],
    [-34, -44, 2.1],
    [-20, -36, 2.2],
    [-8, -4, 1.9],
    [-3, 3, 1.8],
  ];
  landscape.forEach(([x, z, h], index) => {
    const r = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
    naturalTree(world, x, z, h * (0.9 + r * 0.18), index);
    shrubs.push({ p: [x + 0.68, 0.38, z + 0.68], s: [0.72, 0.38, 0.72] });
  });
  const shrubGeo = organicShrubGeometry();
  instances(world, shrubGeo, "leaf", shrubs);
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
  instances(world, shrubGeo, "leaf", tufts);
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
  let waveFrame = 0;
  return {
    world,
    interactive,
    update(time, progress) {
      cartons.forEach(
        (carton, i) =>
          (carton.position.z = -15.6 + ((time * 0.45 + i * 1.35) % 5.2)),
      );
      waveFrame++;
      if (waveFrame % 2 === 0) {
        for (let i = 0; i < seaPos.count; i++)
          seaPos.setZ(
            i,
            Math.sin(seaBase[i * 3] * 0.09 + time * 0.5) * 0.14 +
              Math.cos(seaBase[i * 3 + 1] * 0.11 + time * 0.35) * 0.1,
          );
        seaPos.needsUpdate = true;
      }
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
    },
  };
}

function organicShrubGeometry() {
  const geometry = new THREE.SphereGeometry(1, 12, 8);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const scale = 0.82 + Math.abs(Math.sin(i * 12.37)) * 0.28;
    position.setXYZ(
      i,
      position.getX(i) * scale,
      position.getY(i) * (0.65 + scale * 0.25),
      position.getZ(i) * scale,
    );
  }
  geometry.computeVertexNormals();
  return geometry;
}
