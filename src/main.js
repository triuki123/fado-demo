import { getQuality } from "./utils/quality.js";
import { createScene } from "./core/Scene.js";
import { createWorld } from "./world/World.js";
import { createCameraPath } from "./animation/CameraPath.js";
import { createScrollController } from "./animation/ScrollController.js";
import { createStory } from "./ui/Story.js";
import { createInteraction } from "./ui/Interaction.js";
const progress = (p) => {
  document.querySelector("#load-progress").textContent = p + "%";
  document.querySelector("#load-bar").style.width = p + "%";
};
async function boot() {
  progress(15);
  await new Promise(requestAnimationFrame);
  const quality = getQuality(),
    reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
    debug = new URLSearchParams(location.search).get("debug") === "true";
  const { scene, camera, renderer, render } = createScene(quality);
  progress(35);
  await new Promise(requestAnimationFrame);
  const world = createWorld(scene, quality);
  progress(70);
  const path = createCameraPath(camera, scene, debug),
    scroll = createScrollController(reduced),
    story = createStory(scroll),
    interaction = createInteraction(camera, world.interactive, scroll);
  path.update(0, 0.016, 1, reduced);
  await renderer.compileAsync(scene, camera);
  render();
  progress(100);
  let paused = reduced,
    worldTime = 0,
    opening = reduced ? 0 : 1,
    last = performance.now(),
    start = last,
    frames = 0,
    fps = 60,
    fpsStart = last;
  const toggle = document.querySelector("#motion-toggle");
  const label = () => {
    toggle.innerHTML = paused
      ? "Resume motion <span>▷</span>"
      : "Pause motion <span>Ⅱ</span>";
    toggle.setAttribute("aria-pressed", String(paused));
  };
  label();
  toggle.onclick = () => {
    paused = !paused;
    label();
  };
  const debugPanel = document.querySelector("#debug");
  debugPanel.hidden = !debug;
  document.querySelector("#loader").classList.add("done");
  setTimeout(
    () => {
      document.querySelector("#loader").hidden = true;
      document.body.classList.remove("loading");
      scroll.start();
    },
    reduced ? 50 : 2000,
  );
  document.addEventListener(
    "visibilitychange",
    () => (last = performance.now()),
  );
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    document.querySelector("#loader").hidden = false;
    document.querySelector("#loader").classList.remove("done");
    document.querySelector("#load-error").hidden = false;
  });
  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    // A newly resumed RAF can carry a timestamp older than the initialization
    // work. Never allow a negative simulation time into arc-length sampling.
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.05));
    last = now;
    scroll.update(now);
    if (!paused) worldTime += dt;
    opening = reduced ? 0 : Math.max(0, 1 - (now - start) / 2200) ** 3;
    const p = path.update(scroll.state.progress, dt, opening, reduced);
    world.update(worldTime, p);
    story(p);
    if (frames % 3 === 0) interaction();
    render();
    frames++;
    if (now - fpsStart > 700) {
      fps = (frames * 1000) / (now - fpsStart);
      frames = 0;
      fpsStart = now;
      if (debug)
        debugPanel.textContent = `QUALITY ${quality.name.toUpperCase()}  FPS ${fps.toFixed(0)}\nSCROLL ${(p * 100).toFixed(1)}%  ${document.querySelector("#district-name").textContent}\nCAMERA ${camera.position
          .toArray()
          .map((v) => v.toFixed(1))
          .join(", ")}\nTARGET ${path.look
          .toArray()
          .map((v) => v.toFixed(1))
          .join(
            ", ",
          )}\nDRAW CALLS ${renderer.info.render.calls}  TRIANGLES ${renderer.info.render.triangles}`;
    }
  }
  requestAnimationFrame(tick);
}
boot().catch((error) => {
  console.error("FADO experience could not start:", error);
  document.querySelector("#load-error").hidden = false;
});
