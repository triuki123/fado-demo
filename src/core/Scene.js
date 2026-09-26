import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
export function createScene(quality) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#d8e4e6", 0.0024);
  const camera = new THREE.PerspectiveCamera(
    36,
    innerWidth / innerHeight,
    0.5,
    500,
  );
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#webgl"),
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, quality.dpr));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.info.autoReset = false;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  scene.environment = pmrem.fromScene(environment, 0.05).texture;
  scene.environmentIntensity = 0.58;
  environment.dispose();
  pmrem.dispose();
  scene.add(
    new THREE.HemisphereLight(0xffedd6, 0x5a3a2c, 0.85),
    new THREE.AmbientLight(0xffe4ca, 0.1),
  );
  const sun = new THREE.DirectionalLight(0xffb96e, 4.6);
  sun.position.set(-46, 68, 42);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(quality.shadow);
  Object.assign(sun.shadow.camera, {
    left: -72,
    right: 72,
    top: 72,
    bottom: -72,
    near: 1,
    far: 200,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.045;
  sun.shadow.radius = 4.5;
  scene.add(sun);
  let composer;
  if (quality.post) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(innerWidth, innerHeight),
        0.18,
        0.45,
        1.3,
      ),
    );
    composer.addPass(new OutputPass());
  }
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer?.setSize(innerWidth, innerHeight);
  });
  return {
    scene,
    camera,
    renderer,
    render: () => {
      renderer.info.reset();
      if (composer) composer.render();
      else renderer.render(scene, camera);
    },
  };
}
