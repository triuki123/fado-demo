import * as THREE from "three";
// Positions and independently sampled look targets. Timing is shared by UI and scroll.
// Each chapter dwells on its focal building, then travels to the next.
export const cameraPoints = [
  { at: 0, position: [112, 100, 142], target: [8, 0, -2] },
  { at: 0.13, position: [112, 100, 142], target: [8, 0, -2] },
  { at: 0.15, position: [-2, 30, 50], target: [-30, 6, 14] },
  { at: 0.255, position: [-2, 30, 50], target: [-30, 6, 14] },
  { at: 0.28, position: [30, 18, 8], target: [8, 3, -18] },
  { at: 0.395, position: [30, 18, 8], target: [8, 3, -18] },
  { at: 0.42, position: [-4, 18, 8], target: [-26, 3, -15] },
  { at: 0.525, position: [-4, 18, 8], target: [-26, 3, -15] },
  { at: 0.55, position: [26, 14, 34], target: [8, 3, 14] },
  { at: 0.585, position: [26, 14, 34], target: [8, 3, 14] },
  { at: 0.61, position: [66, 20, 54], target: [38, 5, 32] },
  { at: 0.715, position: [66, 20, 54], target: [38, 5, 32] },
  { at: 0.74, position: [58, 24, -72], target: [17, 2.2, -47] },
  { at: 0.855, position: [58, 24, -72], target: [17, 2.2, -47] },
  { at: 0.88, position: [86, 60, 60], target: [8, 0, -8] },
  { at: 0.97, position: [86, 60, 60], target: [8, 0, -8] },
  { at: 1, position: [112, 100, 142], target: [8, 0, -2] },
];
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
      progress = THREE.MathUtils.damp(progress, target, reduce ? 18 : 3.2, dt);
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
      const mobile = innerWidth < 600;
      if (mobile) {
        desiredPosition.sub(aim).multiplyScalar(1.3).add(aim);
        desiredPosition.y += 9;
      }
      desiredPosition.y += opening * 24;
      desiredPosition.z += opening * 28;
      camera.position.lerp(
        desiredPosition,
        1 - Math.exp(-dt * (reduce ? 22 : 5.5)),
      );
      look.lerp(aim, 1 - Math.exp(-dt * (reduce ? 22 : 6)));
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
