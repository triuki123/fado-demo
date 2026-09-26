import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
export const materials = {};
for (const [key, color] of Object.entries({
  white: 0xf4f0e8,
  concrete: 0xd3cfc4,
  orange: 0xf36c21,
  dark: 0x26313a,
  asphalt: 0x3d4345,
  glass: 0x31525a,
  blue: 0x4f7180,
  green: 0x39765f,
  leaf: 0x79a77b,
  grass: 0x91aa83,
  metal: 0xa4b0b4,
  wood: 0x9b6c47,
  water: 0x8fbfc4,
})) {
  materials[key] = new THREE.MeshPhysicalMaterial({
    color,
    roughness:
      key === "glass"
        ? 0.08
        : key === "metal"
          ? 0.28
          : key === "asphalt"
            ? 0.92
            : key === "concrete"
              ? 0.84
              : key === "orange" || key === "blue"
                ? 0.24
                : 0.68,
    metalness: key === "glass" ? 0.15 : key === "metal" ? 0.78 : 0.04,
    clearcoat: key === "orange" || key === "blue" ? 0.55 : 0,
    clearcoatRoughness: 0.22,
    transparent: key === "glass",
    opacity: key === "glass" ? 0.92 : 1,
  });
}
materials.window = new THREE.MeshStandardMaterial({
  color: 0x9eb8bd,
  roughness: 0.3,
  metalness: 0.16,
  emissive: 0xffd69a,
  emissiveIntensity: 0.035,
});
materials.roof = new THREE.MeshStandardMaterial({
  color: 0x707b80,
  roughness: 0.88,
});
materials.tire = new THREE.MeshStandardMaterial({
  color: 0x182127,
  roughness: 0.94,
});
materials.light = new THREE.MeshStandardMaterial({
  color: 0xffe5ac,
  emissive: 0xffda99,
  emissiveIntensity: 1.65,
});
const geometries = new Map();
let bevelSegments = 2;
export function setGeometryQuality(name) {
  bevelSegments = name === "low" ? 1 : 2;
}
// Batch static surfaces while keeping each interactive district and animated
// vehicle as its own parent. Moving subgroups and instanced meshes stay intact.
export function mergeStatic(parent, excluded = []) {
  const batches = new Map();
  for (const child of parent.children) {
    if (
      !child.isMesh ||
      child.isInstancedMesh ||
      child.userData.dynamic ||
      excluded.includes(child) ||
      Array.isArray(child.material)
    )
      continue;
    const key = child.material.uuid;
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key).push(child);
  }
  for (const meshes of batches.values()) {
    if (meshes.length < 2) continue;
    const parts = meshes.map((mesh) => {
      mesh.updateMatrix();
      const geometry = mesh.geometry.index
        ? mesh.geometry.toNonIndexed()
        : mesh.geometry.clone();
      // Procedural road ribbons have no UVs. Standardize attribute streams
      // before combining them with rounded boxes and extrusions.
      for (const attribute of Object.keys(geometry.attributes)) {
        if (!["position", "normal", "uv"].includes(attribute))
          geometry.deleteAttribute(attribute);
      }
      if (!geometry.attributes.normal) geometry.computeVertexNormals();
      if (!geometry.attributes.uv)
        geometry.setAttribute(
          "uv",
          new THREE.Float32BufferAttribute(
            new Float32Array(geometry.attributes.position.count * 2),
            2,
          ),
        );
      return geometry.applyMatrix4(mesh.matrix);
    });
    const geometry = mergeGeometries(parts, false);
    parts.forEach((part) => part.dispose());
    if (!geometry) continue;
    const mesh = new THREE.Mesh(geometry, meshes[0].material);
    mesh.castShadow = meshes.some((m) => m.castShadow);
    mesh.receiveShadow = meshes.some((m) => m.receiveShadow);
    meshes.forEach((m) => parent.remove(m));
    parent.add(mesh);
  }
}
export function box(
  parent,
  x,
  y,
  z,
  w,
  h,
  d,
  material = "white",
  radius = 0.1,
) {
  const key = [w, h, d, radius, bevelSegments].join(",");
  if (!geometries.has(key))
    geometries.set(
      key,
      radius
        ? new RoundedBoxGeometry(
            w,
            h,
            d,
            bevelSegments,
            Math.min(radius, w / 3, h / 3, d / 3),
          )
        : new THREE.BoxGeometry(w, h, d),
    );
  const m = new THREE.Mesh(
    geometries.get(key),
    typeof material === "string" ? materials[material] : material,
  );
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
export function cylinder(
  parent,
  x,
  y,
  z,
  r,
  h,
  material = "metal",
  rTop = r,
  segments = 10,
) {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, r, h, segments),
    materials[material],
  );
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}
export function beam(parent, a, b, width, material = "orange") {
  const av = new THREE.Vector3(...a),
    bv = new THREE.Vector3(...b),
    m = box(parent, 0, 0, 0, width, av.distanceTo(bv), width, material, 0.035);
  m.position.copy(av.clone().add(bv).multiplyScalar(0.5));
  m.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    bv.sub(av).normalize(),
  );
  return m;
}
export function sign(parent, text, x, y, z, width = 8, color = "#f36c21") {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f5f2e9";
  ctx.fillRect(0, 0, 768, 128);
  ctx.fillStyle = color;
  ctx.font = "700 66px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 384, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(width, width / 6),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}
export function imageSign(parent, url, x, y, z, width, height) {
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    alphaTest: 0.02,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  mesh.position.set(x, y, z);
  mesh.renderOrder = 2;
  parent.add(mesh);
  new THREE.TextureLoader().load(url, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    material.map = texture;
    material.needsUpdate = true;
  });
  return mesh;
}

export function instances(
  parent,
  geometry,
  material,
  transforms,
  { castShadow = true, receiveShadow = true } = {},
) {
  const mesh = new THREE.InstancedMesh(
    geometry,
    typeof material === "string" ? materials[material] : material,
    transforms.length,
  );
  const o = new THREE.Object3D();
  transforms.forEach((t, i) => {
    o.position.set(...t.p);
    o.scale.set(...(t.s || [1, 1, 1]));
    o.rotation.set(0, t.r || 0, 0);
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);
  return mesh;
}
export function seeded(seed = 42) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
