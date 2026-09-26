import * as THREE from "three";
import { journeyStops } from "./JourneyData.js";
// Positions and independently sampled look targets. Timing is shared by UI and scroll.
// Each chapter dwells on its focal building, then travels to the next.
export const cameraPoints = journeyStops.flatMap((stop, index) => {
  if (index === journeyStops.length - 1) return [stop];
  const interval = journeyStops[index + 1].at - stop.at;
  return [stop, { ...stop, at: stop.at + interval * 0.52 }];
});
export function createCameraPath(camera, scene, debug) {
  const curve = new THREE.CatmullRomCurve3(
    cameraPoints.map((p) => new THREE.Vector3(...p.position)),
    false,
    "centripetal",
  );
  const targets = new THREE.CatmullRomCurve3(
    cameraPoints.map((p) => new THREE.Vector3(...p.target)),
    false,
    "centripetal",
  );
  let progress = 0;
  const aim = new THREE.Vector3(),
    desiredPosition = new THREE.Vector3(...cameraPoints[0].position),
    look = new THREE.Vector3(...cameraPoints[0].target);
  if (debug) {
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(500)),
      new THREE.LineBasicMaterial({ color: 0xf36c21 }),
    );
    scene.add(line);
  }
  return {
    curve,
    look,
    update(target, dt, opening, reduce) {
      progress = THREE.MathUtils.damp(progress, target, reduce ? 18 : 4.8, dt);
      let index = cameraPoints.findIndex(
        (p, i) =>
          i < cameraPoints.length - 1 &&
          progress >= p.at &&
          progress < cameraPoints[i + 1].at,
      );
      if (index < 0) index = cameraPoints.length - 2;
      const a = cameraPoints[index],
        b = cameraPoints[index + 1],
        u = THREE.MathUtils.smoothstep(
          THREE.MathUtils.clamp((progress - a.at) / (b.at - a.at), 0, 1),
          0,
          1,
        ),
        s = (index + u) / (cameraPoints.length - 1);
      desiredPosition.copy(curve.getPoint(s));
      aim.copy(targets.getPoint(s));
      camera.fov = THREE.MathUtils.damp(
        camera.fov,
        THREE.MathUtils.lerp(a.fov, b.fov, u),
        reduce ? 18 : 6,
        dt,
      );
      camera.updateProjectionMatrix();
      const mobile = innerWidth < 600;
      if (mobile) {
        desiredPosition.sub(aim).multiplyScalar(1.3).add(aim);
        desiredPosition.y += 9;
      }
      desiredPosition.y += opening * 24;
      desiredPosition.z += opening * 28;
      camera.position.lerp(
        desiredPosition,
        1 - Math.exp(-dt * (reduce ? 22 : 7.5)),
      );
      look.lerp(aim, 1 - Math.exp(-dt * (reduce ? 22 : 8)));
      camera.lookAt(look);
      camera.setViewOffset(
        innerWidth,
        innerHeight,
        mobile ? 0 : -innerWidth * 0.13,
        mobile ? innerHeight * 0.16 : 0,
        innerWidth,
        innerHeight,
      );
      return progress;
    },
  };
}
