import * as THREE from "three";
import { chapters } from "./Story.js";
export function createInteraction(camera, objects, scroll) {
  const canvas = document.querySelector("#webgl"),
    ray = new THREE.Raycaster(),
    pointer = new THREE.Vector2(5, 5),
    tooltip = document.querySelector("#tooltip");
  let hovered = null,
    down = null,
    clicked = null,
    pointerMoved = true;
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(6, 6.13, 64),
    new THREE.MeshBasicMaterial({
      color: 0xf36c21,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  halo.rotation.x = -Math.PI / 2;
  halo.visible = false;
  objects[0].parent.add(halo);
  function pick() {
    ray.setFromCamera(pointer, camera);
    let object = ray.intersectObjects(objects, true)[0]?.object;
    while (object && !object.userData.interactive) object = object.parent;
    return object;
  }
  canvas.addEventListener("pointermove", (e) => {
    pointer.set(
      (e.clientX / innerWidth) * 2 - 1,
      (-e.clientY / innerHeight) * 2 + 1,
    );
    tooltip.style.left = `${Math.min(e.clientX + 16, innerWidth - 180)}px`;
    tooltip.style.top = `${e.clientY + 16}px`;
    pointerMoved = true;
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.set(5, 5);
    pointerMoved = true;
  });
  canvas.addEventListener(
    "pointerdown",
    (e) => (down = [e.clientX, e.clientY]),
  );
  canvas.addEventListener("pointerup", (e) => {
    pointer.set(
      (e.clientX / innerWidth) * 2 - 1,
      (-e.clientY / innerHeight) * 2 + 1,
    );
    hovered = pick();
    if (
      !hovered ||
      !down ||
      Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 8
    )
      return;
    clicked = hovered;
    scroll.go(clicked.userData.progress);
    document.querySelector("#info-title").textContent = clicked.userData.name;
    const chapter = chapters.findLast((c) => c.at <= clicked.userData.progress);
    document.querySelector("#info-description").textContent =
      chapter.description;
    document.querySelector("#info-explore").innerHTML = clicked.userData.url
      ? "VISIT WEBSITE <span>↗</span>"
      : "EXPLORE THIS DESTINATION <span>↗</span>";
    document.querySelector("#info").showModal();
  });
  document.querySelector("#info-explore").onclick = () => {
    document.querySelector("#info").close();
    if (clicked.userData.url) {
      window.open(clicked.userData.url, "_blank", "noopener,noreferrer");
      return;
    }
    scroll.go(clicked.userData.progress);
  };
  return (cameraMoved = false) => {
    if (!pointerMoved && !cameraMoved) return;
    pointerMoved = false;
    const obj = pick();
    hovered = obj;
    canvas.style.cursor = obj ? "pointer" : "";
    tooltip.hidden = !obj;
    halo.visible = !!obj;
    if (obj) {
      tooltip.textContent = obj.userData.name + " ↗";
      halo.position.set(obj.position.x, 0.45, obj.position.z);
    }
  };
}
