export function getQuality() {
  const params = new URLSearchParams(location.search);
  const forced = params.get("quality");
  const name = ["ultra", "high", "medium", "low"].includes(forced)
    ? forced
    : innerWidth < 600
      ? "low"
      : innerWidth < 1100 || navigator.hardwareConcurrency < 6
        ? "medium"
        : "high";
  const preset = {
      ultra: {
        dpr: 2,
        shadow: 2048,
        particles: 100,
        post: false,
        ao: false,
        aa: false,
        textureSize: 1024,
        anisotropy: 16,
        motionScale: 1,
      },
      high: {
        dpr: 1.5,
        shadow: 2048,
        particles: 75,
        post: false,
        ao: false,
        aa: false,
        textureSize: 512,
        anisotropy: 8,
        motionScale: 1,
      },
      medium: {
        dpr: 1.25,
        shadow: 1024,
        particles: 45,
        post: false,
        ao: false,
        aa: false,
        textureSize: 256,
        anisotropy: 4,
        motionScale: 1,
      },
      low: {
        dpr: 1,
        shadow: 512,
        particles: 24,
        post: false,
        ao: false,
        aa: false,
        textureSize: 128,
        anisotropy: 2,
        motionScale: 1,
      },
    }[name];
  const requestedScale = Number(params.get("renderScale"));
  if (Number.isFinite(requestedScale) && requestedScale > 0)
    preset.dpr = Math.min(2, Math.max(0.75, requestedScale));
  return {
    name,
    explicitScale: Number.isFinite(requestedScale) && requestedScale > 0,
    ...preset,
  };
}
