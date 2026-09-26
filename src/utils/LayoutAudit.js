import * as THREE from "three";

export const spacingRules = Object.freeze({
  buildingBuilding: 6,
  buildingTree: 1.25,
  buildingRoad: 2,
  treeTree: 1.2,
  vehicleCurb: 0.2,
  lampRoad: 0.7,
});

export const layoutZones = [
  { name: "FADO Group HQ", center: [-30, 7.5, 14], size: [15, 15, 12] },
  { name: "FADO Commerce", center: [8, 4, -18], size: [17, 8, 12] },
  { name: "FADO Fulfillment", center: [-26, 3.5, -18], size: [22, 7, 18] },
  { name: "FADO Logistics", center: [8, 3, 14], size: [15, 6, 9] },
  { name: "FADO Technology", center: [-11, 2.4, 4], size: [9, 5, 5.5] },
  { name: "FADO Digital", center: [4, 1.8, 0], size: [8.6, 3.6, 6] },
  { name: "Experience Center", center: [28, 1.2, 0], size: [11.6, 2.4, 6.5] },
  { name: "Partner Center", center: [46, 1.8, 9], size: [7.9, 3.6, 8] },
  { name: "Trade Office", center: [-40, 3, -40], size: [6.2, 6, 5.5] },
  { name: "Support Office", center: [-20, 1.8, -40], size: [9, 3.6, 6.5] },
  { name: "ProShip Port", center: [40, 5, 32], size: [31, 10, 15] },
  { name: "FADO Solutions", center: [28, 3, -38], size: [27, 6, 10] },
];

function bounds(zone, extra = 0) {
  const center = new THREE.Vector3(...zone.center);
  const half = new THREE.Vector3(...zone.size)
    .multiplyScalar(0.5)
    .addScalar(extra);
  return new THREE.Box3(center.clone().sub(half), center.clone().add(half));
}

function labelSprite(zone, warning) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  context.fillStyle = warning ? "#8b1f16dd" : "#153b32dd";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "white";
  context.font = "600 25px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    `${zone.name}  (${zone.center[0]}, ${zone.center[2]})`,
    canvas.width / 2,
    canvas.height / 2,
  );
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: false }),
  );
  sprite.position.set(zone.center[0], zone.center[1] + zone.size[1] / 2 + 1.5, zone.center[2]);
  sprite.scale.set(8, 1.5, 1);
  sprite.renderOrder = 100;
  return sprite;
}

export function auditLayout(scene, enabled = false) {
  const actualCollisions = [],
    clearanceWarnings = [];
  for (let i = 0; i < layoutZones.length; i++) {
    for (let j = i + 1; j < layoutZones.length; j++) {
      const a = layoutZones[i],
        b = layoutZones[j];
      if (bounds(a).intersectsBox(bounds(b)))
        actualCollisions.push(`${a.name} ↔ ${b.name}`);
      else if (
        bounds(a, spacingRules.buildingBuilding / 2).intersectsBox(
          bounds(b, spacingRules.buildingBuilding / 2),
        )
      )
        clearanceWarnings.push(`${a.name} ↔ ${b.name}`);
    }
  }
  if (enabled) {
    const warned = new Set(
      [...actualCollisions, ...clearanceWarnings].flatMap((item) =>
        item.split(" ↔ "),
      ),
    );
    layoutZones.forEach((zone) => {
      const helper = new THREE.Box3Helper(
        bounds(zone),
        warned.has(zone.name) ? 0xff3c24 : 0x37d694,
      );
      helper.renderOrder = 99;
      scene.add(helper, labelSprite(zone, warned.has(zone.name)));
    });
    if (actualCollisions.length || clearanceWarnings.length)
      console.warn("FADO layout audit", {
        actualCollisions,
        clearanceWarnings,
      });
  }
  return { actualCollisions, clearanceWarnings };
}
