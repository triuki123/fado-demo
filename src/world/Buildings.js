import * as THREE from "three";
import { box, cylinder, sign, instances } from "./primitives.js";
import {
  facade,
  roofDetails,
  contactShadow,
  bollards,
  rail,
} from "./Details.js";
export function district(world, x, z, name, progress) {
  const g = new THREE.Group();
  g.position.set(x, 0.25, z);
  g.userData = { name, progress, interactive: true };
  world.add(g);
  return g;
}
export function createHeadquarters(world) {
  const g = district(world, -30, 14, "FADO Headquarters", 0.2);
  box(g, 0, 0, 0, 15, 0.35, 12, "concrete", 0.6);
  box(g, 0, 0.35, 0, 10, 13, 7, "glass", 0.5);
  box(g, -4, 0.35, -1, 2, 14, 7, "white", 0.4);
  box(g, 4, 0.35, -1, 2, 14, 7, "white", 0.4);
  for (let y = 1; y <= 13; y += 2) box(g, 0, y, 0, 10.5, 0.27, 7.5, "white");
  box(g, 0, 13.5, 0, 11, 0.5, 8, "white", 0.3);
  box(g, 0, 13.9, 0, 7, 0.7, 4, "grass", 0.2);
  const windows = [];
  for (let x = -3; x <= 3; x += 1.5)
    windows.push({ p: [x, 7, 3.55], s: [0.1, 12, 0.1] });
  instances(g, new THREE.BoxGeometry(1, 1, 1), "metal", windows);
  box(g, 0, 0.5, 4, 5, 3, 1.5, "glass");
  box(g, 0, 0.48, 4.82, 2.2, 2.45, 0.16, "dark", 0.04);
  box(g, 0, 0.56, 4.92, 1.82, 2.2, 0.08, "glass", 0.025);
  box(g, 0, 3.5, 4.5, 7, 0.25, 3, "orange");
  for (const x of [-3, 3]) cylinder(g, x, 0.35, 5.3, 0.09, 3.2);
  sign(g, "FADO", 0, 11.5, 3.82, 5);
  for (const x of [-5, 5]) {
    box(g, x, 0.5, 5, 1.8, 0.6, 1.5, "white");
    cylinder(g, x, 1.1, 5, 0.7, 0.8, "green", 0.6);
  }
  roofDetails(g, 0, 14.35, 0, 8.2, 5.2);
  rail(g, [-4.6, -3.2], [4.6, -3.2]);
  contactShadow(g, 0, 0, 17.5, 14.5, 0.23);
  return g;
}
export function createCommerce(world) {
  const g = district(world, 8, -18, "FADO Operations", 0.32);
  box(g, 0, 0, 0, 17, 0.3, 12, "concrete", 0.8);
  box(g, 0, 0.3, 0, 13, 5, 8, "white", 0.7);
  box(g, 0, 0.7, 4.02, 11, 3.6, 0.12, "glass");
  facade(g, {
    width: 10.8,
    height: 3.35,
    depth: 8.05,
    base: 0.9,
    floors: 2,
    columns: 7,
  });
  box(g, 0, 4.4, 4.6, 14, 0.35, 2, "orange", 0.15);
  box(g, -3, 5.2, -0.5, 6, 2, 5, "glass", 0.35);
  box(g, -3, 7.1, -0.5, 6.5, 0.3, 5.5, "white");
  sign(g, "FADO", 1, 5.6, 4.25, 4.5);
  for (let x = -5; x <= 5; x += 2.5) cylinder(g, x, 0.3, 5, 0.09, 4.1);
  box(g, 5, 5.4, -1, 2, 0.7, 2, "metal");
  roofDetails(g, 2.2, 5.42, -1.4, 6.6, 4.2);
  bollards(g, -4.6, 5.5, 5, 2.3);
  contactShadow(g, 0, 0, 19, 14, 0.22);
  return g;
}
export function createWarehouse(world) {
  const g = district(world, -26, -18, "FADO Distribution", 0.48);
  box(g, 0, 0, 0, 22, 0.3, 18, "concrete", 0.5);
  box(g, 0, 0.3, -1, 19, 5.2, 12, "white", 0.25);
  const roof = box(g, 0, 5.5, -1, 20, 0.4, 13, "metal", 0.15);
  roof.rotation.z = 0.035;
  box(g, 0, 4.2, 5.08, 19, 0.5, 0.2, "orange");
  sign(g, "FADO", 0, 4.9, 5.25, 4.5);
  for (let x = -7.5; x <= 7.5; x += 3.75) {
    box(g, x, 0.5, 5.05, 2.8, 3, 0.2, "dark");
    box(g, x, 0.4, 6, 3.1, 0.4, 2, "metal");
    box(g, x, 3.65, 5.8, 3.3, 0.15, 2, "white");
    for (let y = 1; y < 3.4; y += 0.45)
      box(g, x, y, 5.2, 2.5, 0.07, 0.05, "metal", 0);
    box(g, x - 1.28, 0.45, 5.35, 0.18, 0.75, 0.22, "orange", 0.04);
    box(g, x + 1.28, 0.45, 5.35, 0.18, 0.75, 0.22, "orange", 0.04);
  }
  const panels = [];
  for (let x = -7; x <= 7; x += 2.3)
    for (let z = -5; z < 3; z += 2.6)
      panels.push({ p: [x, 5.9, z], s: [1.9, 0.08, 1.8] });
  instances(g, new THREE.BoxGeometry(1, 1, 1), "blue", panels);
  for (let i = 0; i < 6; i++)
    box(
      g,
      8,
      0.4 + (i % 2) * 0.7,
      6 + Math.floor(i / 2) * 0.8,
      0.65,
      0.65,
      0.65,
      "wood",
    );
  roofDetails(g, -2.8, 6, -1.5, 9.5, 7.5);
  for (const x of [-9, 9]) {
    cylinder(g, x, 1, -4.5, 0.08, 4.1, "metal", 0.08, 8);
    box(g, x, 4.85, -4.5, 0.55, 0.32, 0.55, "metal", 0.05);
  }
  bollards(g, -8.6, 6.9, 8, 2.45);
  contactShadow(g, 0, -1, 24.5, 20, 0.26);
  return g;
}
export function createHub(world) {
  const g = district(world, 8, 14, "FADO Hub", 0.57);
  box(g, 0, 0, 0, 15, 0.3, 9, "concrete", 0.5);
  box(g, 0, 0.3, -1, 12, 4, 6, "white", 0.45);
  box(g, 0, 1, 2.05, 9, 2, 0.12, "glass");
  facade(g, {
    width: 8.8,
    height: 2.1,
    depth: 6.05,
    base: 0.95,
    floors: 1,
    columns: 6,
  });
  box(g, 0, 3.5, 2.8, 13, 0.25, 2.5, "orange");
  sign(g, "FADO", 0, 4.7, 2.3, 4.5);
  for (const x of [-5, 5]) cylinder(g, x, 0.3, 3.6, 0.1, 3.2);
  roofDetails(g, 0, 4.42, -1, 7.5, 4.4);
  bollards(g, -4, 3.5, 5, 2);
  contactShadow(g, 0, -0.5, 16.5, 11, 0.22);
  return g;
}
