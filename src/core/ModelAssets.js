import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
const pending = [];
const truckReady = loader
  .loadAsync("./assets/models/fado_truck.glb")
  .then((gltf) => {
    gltf.scene.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = ["Body White", "FADO Orange", "Chassis"].includes(
        object.material?.name,
      );
      object.receiveShadow = true;
    });
    return gltf.scene;
  });
const ecosystemReady = loader
  .loadAsync("./assets/models/fado_ecosystem.glb")
  .then((gltf) => {
    gltf.scene.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = ![
        "Curtain wall glass",
        "Reflecting water",
        "Landscape",
      ].includes(object.material?.name);
      object.receiveShadow = true;
    });
    return gltf.scene;
  });

export function replaceWithTruckModel(anchor) {
  const task = truckReady.then((source) => {
    const model = source.clone(true);
    anchor.clear();
    anchor.add(model);
  });
  pending.push(task);
  return task;
}

export function waitForModels() {
  return Promise.all(pending);
}

export function addEcosystemModel(parent) {
  const task = ecosystemReady.then((model) => parent.add(model));
  pending.push(task);
  return task;
}
