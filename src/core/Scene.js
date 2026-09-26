import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
export function createScene(quality) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#dce8e8");
  scene.fog = new THREE.FogExp2("#dce8e8", 0.00165);
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
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.info.autoReset = false;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const fallbackEnvironment = pmrem.fromScene(environment, 0.05).texture;
  scene.environment = fallbackEnvironment;
  scene.environmentIntensity = 0.42;
  environment.dispose();
  const environmentReady = new RGBELoader()
    .loadAsync("./assets/kloppenheim_03_puresky_1k.hdr")
    .then((hdr) => {
      const processed = pmrem.fromEquirectangular(hdr).texture;
      scene.environment = processed;
      hdr.dispose();
      fallbackEnvironment.dispose();
      pmrem.dispose();
    })
    .catch(() => {
      pmrem.dispose();
    });
  scene.add(
    new THREE.HemisphereLight(0xeaf5ff, 0x738078, 0.58),
    new THREE.AmbientLight(0xffffff, 0.035),
  );
  const sun = new THREE.DirectionalLight(0xfff0dc, 3.25);
  sun.position.set(-52, 74, 36);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(quality.shadow);
  Object.assign(sun.shadow.camera, {
    left: -66,
    right: 66,
    top: 66,
    bottom: -66,
    near: 1,
    far: 200,
  });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.045;
  sun.shadow.radius = 2.5;
  scene.add(sun);
  let composer;
  if (quality.post) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (quality.ao) {
      const ao = new SSAOPass(scene, camera, innerWidth, innerHeight);
      ao.kernelRadius = quality.name === "high" ? 7 : 4;
      ao.minDistance = 0.0015;
      ao.maxDistance = 0.065;
      composer.addPass(ao);
    }
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(innerWidth, innerHeight),
        0.055,
        0.3,
        1.65,
      ),
    );
    if (quality.aa) {
      const smaa = new SMAAPass(
        innerWidth * renderer.getPixelRatio(),
        innerHeight * renderer.getPixelRatio(),
      );
      composer.addPass(smaa);
    }
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
    environmentReady,
    render: () => {
      renderer.info.reset();
      if (composer) composer.render();
      else renderer.render(scene, camera);
    },
  };
}
