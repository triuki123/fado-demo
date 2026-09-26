import * as THREE from "three";
import { materials } from "../world/primitives.js";

function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function surfaceTexture(size, base, variation, seed, repeat) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d", { alpha: false });
  const image = context.createImageData(size, size);
  const random = seeded(seed);
  const color = new THREE.Color(base);
  const baseRgb = [color.r * 255, color.g * 255, color.b * 255];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      const broad =
        Math.sin(x * 0.075 + seed) * 0.35 +
        Math.cos(y * 0.061 - seed) * 0.3 +
        Math.sin((x + y) * 0.021) * 0.2;
      const grain = (random() - 0.5) * 2;
      const value = (broad + grain) * variation;
      image.data[index] = THREE.MathUtils.clamp(baseRgb[0] + value, 0, 255);
      image.data[index + 1] = THREE.MathUtils.clamp(baseRgb[1] + value, 0, 255);
      image.data[index + 2] = THREE.MathUtils.clamp(baseRgb[2] + value, 0, 255);
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function bumpTexture(size, strength, seed, repeat) {
  const data = new Uint8Array(size * size);
  const random = seeded(seed);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const wave = Math.sin(x * 0.11) * 0.2 + Math.cos(y * 0.09) * 0.2;
      data[y * size + x] = THREE.MathUtils.clamp(
        128 + wave * strength + (random() - 0.5) * strength,
        0,
        255,
      );
    }
  }
  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RedFormat,
    THREE.UnsignedByteType,
  );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.needsUpdate = true;
  return texture;
}

function applySurface(material, colorMap, bumpMap, bumpScale, anisotropy) {
  material.map = colorMap;
  material.bumpMap = bumpMap;
  material.bumpScale = bumpScale;
  material.map.anisotropy = anisotropy;
  material.needsUpdate = true;
}

export function configureSurfaceTextures(renderer, quality) {
  const size = quality.textureSize;
  const anisotropy = Math.min(
    quality.name === "high" ? 8 : 4,
    renderer.capabilities.getMaxAnisotropy(),
  );
  const specs = {
    white: ["#f4f0e8", 3.5, 13, 3, 7, 0.012],
    concrete: ["#cbc8bf", 8, 23, 5, 12, 0.026],
    asphalt: ["#454b4d", 12, 31, 8, 18, 0.038],
    grass: ["#91aa83", 14, 43, 5, 14, 0.035],
    wood: ["#9b7254", 8, 53, 4, 8, 0.022],
    roof: ["#737d80", 5, 61, 5, 8, 0.016],
    water: ["#72aeb7", 7, 71, 3, 22, 0.045],
  };
  for (const [
    name,
    [base, variation, seed, repeat, bump, scale],
  ] of Object.entries(specs)) {
    applySurface(
      materials[name],
      surfaceTexture(size, base, variation, seed, repeat),
      bumpTexture(size, bump, seed + 101, repeat),
      scale,
      anisotropy,
    );
  }
  materials.glass.setValues({
    color: 0x274a57,
    roughness: 0.16,
    metalness: 0.08,
    clearcoat: 0.38,
    clearcoatRoughness: 0.2,
    transmission: 0.08,
    thickness: 0.35,
    ior: 1.45,
    envMapIntensity: 1.15,
    opacity: 0.94,
  });
  materials.orange.setValues({
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.72,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.85,
  });
  materials.blue.setValues({
    roughness: 0.34,
    metalness: 0.08,
    clearcoat: 0.5,
    clearcoatRoughness: 0.24,
  });
  materials.metal.setValues({
    roughness: 0.38,
    metalness: 0.78,
    envMapIntensity: 0.9,
  });
  materials.tire.setValues({ roughness: 0.96, metalness: 0 });
  materials.water.setValues({
    color: 0x79aeb5,
    roughness: 0.18,
    metalness: 0.06,
    clearcoat: 0.72,
    clearcoatRoughness: 0.2,
    transmission: 0.04,
    thickness: 0.5,
    envMapIntensity: 0.85,
  });
}
